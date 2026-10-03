// Generación del TEXTO del cuento (solo servidor).
// - Con ANTHROPIC_API_KEY: escribe Claude (por defecto Sonnet 5.5, mejor narrativa).
// - Si no hay clave de Anthropic, o Claude falla, escribe OpenAI.
// Las ilustraciones siguen siendo siempre de OpenAI (ver /api/image).

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { construirPrompt, SYSTEM_PROMPT } from "@/lib/prompts";
import type { FormData } from "@/types/cuento";

const MODELO_CLAUDE = process.env.ANTHROPIC_MODELO || "claude-sonnet-5-5";
const MODELO_OPENAI = process.env.OPENAI_MODELO_TEXTO || "gpt-4.1-mini";
const MODELO_OPENAI_RESPALDO = "gpt-4o-mini";

export function hayProveedorTexto(): boolean {
  return !!(process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY);
}

// true si el error es un límite de peticiones (429) de cualquiera de los dos proveedores.
export function esLimiteDePeticiones(err: unknown): boolean {
  return (
    (err instanceof Anthropic.APIError || err instanceof OpenAI.APIError) &&
    err.status === 429
  );
}

async function conClaude(prompt: string, maxTokens: number): Promise<string> {
  const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const mensaje = await claude.messages.create({
    model: MODELO_CLAUDE,
    max_tokens: maxTokens,
    // Sonnet 5.5 "piensa" por defecto antes de escribir, y ese pensamiento consume
    // tokens de salida. Aquí sobra (el prompt ya pide un [PLAN] explícito): lo
    // desactivamos con "between_tools" ("disabled" no se admite en este modelo).
    ...(MODELO_CLAUDE.startsWith("claude-sonnet-5-5")
      ? { thinking: { type: "between_tools" as const } }
      : {}),
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });
  if (mensaje.stop_reason === "refusal") {
    throw new Error("Claude no ha querido escribir este cuento.");
  }
  if (mensaje.stop_reason === "max_tokens") {
    // Un cuento cortado no sirve: se escribe con el proveedor de respaldo.
    throw new Error(`Cuento incompleto: Claude llegó al máximo de ${maxTokens} tokens.`);
  }
  console.info(
    `Tokens Claude · entrada: ${mensaje.usage.input_tokens} · salida: ${mensaje.usage.output_tokens}`,
  );
  return mensaje.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}

async function conOpenAI(prompt: string, maxTokens: number): Promise<string> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const pedir = (model: string) =>
    openai.chat.completions.create({
      model,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
    });

  let completion;
  try {
    completion = await pedir(MODELO_OPENAI);
  } catch (err) {
    const modeloNoDisponible =
      err instanceof OpenAI.APIError &&
      (err.status === 404 || (err.status === 400 && /model/i.test(err.message)));
    if (!modeloNoDisponible || MODELO_OPENAI === MODELO_OPENAI_RESPALDO) throw err;
    console.warn(`${MODELO_OPENAI} no disponible, usando ${MODELO_OPENAI_RESPALDO}`);
    completion = await pedir(MODELO_OPENAI_RESPALDO);
  }
  return completion.choices[0]?.message?.content?.trim() ?? "";
}

// --- Foto del protagonista (solo familia) ---

const PROMPT_FOTO =
  "Vamos a dibujar a este niño o niña como protagonista de un cuento infantil ilustrado. " +
  "Describe en español, en una sola línea de 40 palabras como máximo, solo sus rasgos visibles " +
  "útiles para dibujarlo: color, largo y forma del pelo (rizado, liso, flequillo, coletas...), " +
  "color de ojos, tono de piel, si lleva gafas y rasgos distintivos (pecas...). No describas la " +
  "ropa, el fondo ni la expresión, y no intentes identificar a la persona. Responde solo con la descripción.";

const FOTO_VALIDA = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/;

// Devuelve los rasgos del niño/a de la foto, o null si no hay foto válida o algo falla.
// La foto solo se usa en esta llamada: no se guarda ni se registra.
export async function describirFoto(foto: unknown): Promise<string | null> {
  if (typeof foto !== "string") return null;
  const m = FOTO_VALIDA.exec(foto);
  if (!m || m[2].length > 3_000_000) return null;
  const tipo = m[1] as "image/jpeg" | "image/png" | "image/webp";
  const datos = m[2];

  let texto = "";
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const mensaje = await claude.messages.create({
        model: MODELO_CLAUDE,
        max_tokens: 300,
        ...(MODELO_CLAUDE.startsWith("claude-sonnet-5-5")
          ? { thinking: { type: "between_tools" as const } }
          : {}),
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: tipo, data: datos } },
              { type: "text", text: PROMPT_FOTO },
            ],
          },
        ],
      });
      if (mensaje.stop_reason !== "refusal") {
        texto = mensaje.content
          .filter((b): b is Anthropic.TextBlock => b.type === "text")
          .map((b) => b.text)
          .join("");
      }
    } catch (err) {
      console.warn("Claude no pudo describir la foto:", (err as Error)?.message);
    }
  }

  if (!texto.trim() && process.env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const r = await openai.chat.completions.create({
        model: MODELO_OPENAI,
        max_tokens: 200,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: PROMPT_FOTO },
              { type: "image_url", image_url: { url: foto } },
            ],
          },
        ],
      });
      texto = r.choices[0]?.message?.content ?? "";
    } catch (err) {
      console.warn("OpenAI no pudo describir la foto:", (err as Error)?.message);
    }
  }

  texto = texto.replace(/\s+/g, " ").trim().slice(0, 400);
  if (texto) console.info("Foto descrita para el protagonista");
  return texto || null;
}

export async function generarTextoCuento(
  form: FormData,
  aspectoProtagonista?: string | null,
): Promise<string> {
  const prompt = construirPrompt(form, aspectoProtagonista);
  // Margen para el [PLAN] y [PERSONAJES] que preceden al cuento.
  // Es solo un tope (se paga lo que se escribe); amplio para que el cuento no se corte.
  const maxTokens = form.modoLectura === "aprender" ? 2500 : 6000;

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const texto = await conClaude(prompt, maxTokens);
      if (texto) {
        console.info(`Cuento escrito por Claude (${MODELO_CLAUDE})`);
        return texto;
      }
      throw new Error("Claude devolvió una respuesta vacía.");
    } catch (err) {
      if (!process.env.OPENAI_API_KEY) throw err;
      console.warn("Claude ha fallado; se escribe el cuento con OpenAI:", err);
    }
  }

  const texto = await conOpenAI(prompt, maxTokens);
  console.info("Cuento escrito por OpenAI");
  return texto;
}

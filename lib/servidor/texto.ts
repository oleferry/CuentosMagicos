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
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });
  if (mensaje.stop_reason === "refusal") {
    throw new Error("Claude no ha querido escribir este cuento.");
  }
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

export async function generarTextoCuento(form: FormData): Promise<string> {
  const prompt = construirPrompt(form);
  // Margen para el [PLAN] y [PERSONAJES] que preceden al cuento.
  const maxTokens = form.modoLectura === "aprender" ? 1800 : 4200;

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const texto = await conClaude(prompt, maxTokens);
      if (texto) return texto;
      throw new Error("Claude devolvió una respuesta vacía.");
    } catch (err) {
      if (!process.env.OPENAI_API_KEY) throw err;
      console.warn("Claude ha fallado; se escribe el cuento con OpenAI:", err);
    }
  }

  return conOpenAI(prompt, maxTokens);
}

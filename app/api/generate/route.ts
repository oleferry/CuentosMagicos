import { NextResponse } from "next/server";
import OpenAI from "openai";
import { construirPrompt, parsearCuento, SYSTEM_PROMPT } from "@/lib/prompts";
import { concederImagenes, reservarCuento } from "@/lib/servidor/acceso";
import type { FormData } from "@/types/cuento";

// Ejecuta siempre en el servidor; nunca expone la API key al cliente.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Modelo de texto (configurable en Vercel). Si la cuenta no lo tiene, se usa el de respaldo.
const MODELO = process.env.OPENAI_MODELO_TEXTO || "gpt-4.1-mini";
const MODELO_RESPALDO = "gpt-4o-mini";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Falta la configuración del servidor (OPENAI_API_KEY). Avisa al administrador.",
      },
      { status: 500 },
    );
  }

  let form: FormData;
  try {
    form = (await request.json()) as FormData;
  } catch {
    return NextResponse.json(
      { error: "La petición no es válida." },
      { status: 400 },
    );
  }

  if (!form?.nombre?.trim() || !form?.edad || !form?.tema?.trim()) {
    return NextResponse.json(
      { error: "Faltan datos del formulario (nombre, edad o tema)." },
      { status: 400 },
    );
  }

  // Comprueba los límites ANTES de gastar en la IA.
  const reserva = await reservarCuento();
  if (!reserva.ok) {
    const status = reserva.motivo === "cerrado" ? 503 : 402;
    return NextResponse.json(
      { error: reserva.mensaje, motivo: reserva.motivo },
      { status },
    );
  }

  const openai = new OpenAI({ apiKey });

  try {
    // Margen extra para el [PLAN] y [PERSONAJES] que preceden al cuento.
    const pedir = (model: string) =>
      openai.chat.completions.create({
        model,
        max_tokens: form.modoLectura === "aprender" ? 1800 : 4200,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: construirPrompt(form) },
        ],
      });

    let completion;
    try {
      completion = await pedir(MODELO);
    } catch (err) {
      const modeloNoDisponible =
        err instanceof OpenAI.APIError &&
        (err.status === 404 || (err.status === 400 && /model/i.test(err.message)));
      if (!modeloNoDisponible || MODELO === MODELO_RESPALDO) throw err;
      console.warn(`${MODELO} no disponible, usando ${MODELO_RESPALDO}`);
      completion = await pedir(MODELO_RESPALDO);
    }

    const cuento = completion.choices[0]?.message?.content?.trim() ?? "";

    if (!cuento) {
      await reserva.liberar();
      return NextResponse.json(
        { error: "No se pudo generar el cuento. Inténtalo de nuevo." },
        { status: 502 },
      );
    }

    // Autoriza las ilustraciones de este cuento (una por parte + margen de reintentos).
    const cuentoId = await concederImagenes(parsearCuento(cuento).partes.length);

    return NextResponse.json({ cuento, cuentoId });
  } catch (err) {
    console.error("Error al generar el cuento:", err);
    await reserva.liberar();

    if (err instanceof OpenAI.APIError && err.status === 429) {
      return NextResponse.json(
        { error: "Demasiadas peticiones. Espera un momento e inténtalo otra vez." },
        { status: 429 },
      );
    }

    return NextResponse.json(
      { error: "Hubo un problema generando el cuento. Inténtalo de nuevo." },
      { status: 500 },
    );
  }
}

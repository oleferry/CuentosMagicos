import { NextResponse } from "next/server";
import OpenAI from "openai";
import { construirPrompt, SYSTEM_PROMPT } from "@/lib/prompts";
import type { FormData } from "@/types/cuento";

// Ejecuta siempre en el servidor; nunca expone la API key al cliente.
export const runtime = "nodejs";

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

  const openai = new OpenAI({ apiKey });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1500,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: construirPrompt(form) },
      ],
    });

    const cuento = completion.choices[0]?.message?.content?.trim() ?? "";

    if (!cuento) {
      return NextResponse.json(
        { error: "No se pudo generar el cuento. Inténtalo de nuevo." },
        { status: 502 },
      );
    }

    return NextResponse.json({ cuento });
  } catch (err) {
    console.error("Error al generar el cuento:", err);

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

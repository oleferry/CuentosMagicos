import { NextResponse } from "next/server";
import OpenAI from "openai";
import { construirPromptImagen } from "@/lib/prompts";
import type { EstiloId } from "@/types/cuento";

// La generación de imágenes tarda más; damos margen al servidor (máx. en Vercel hobby).
export const runtime = "nodejs";
export const maxDuration = 60;

interface ImagenRequest {
  titulo: string;
  texto: string;
  nombre: string;
  estilo: EstiloId | null;
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Falta la configuración del servidor (OPENAI_API_KEY)." },
      { status: 500 },
    );
  }

  let body: ImagenRequest;
  try {
    body = (await request.json()) as ImagenRequest;
  } catch {
    return NextResponse.json({ error: "Petición no válida." }, { status: 400 });
  }

  if (!body?.texto?.trim()) {
    return NextResponse.json(
      { error: "Falta el texto de la escena." },
      { status: 400 },
    );
  }

  const openai = new OpenAI({ apiKey });
  const prompt = construirPromptImagen(
    body.titulo ?? "",
    body.texto,
    body.nombre ?? "",
    body.estilo ?? null,
  );

  try {
    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
      quality: "medium",
      n: 1,
    });

    const b64 = result.data?.[0]?.b64_json;
    if (!b64) {
      return NextResponse.json(
        { error: "No se pudo generar la imagen." },
        { status: 502 },
      );
    }

    return NextResponse.json({ image: `data:image/png;base64,${b64}` });
  } catch (err) {
    console.error("Error al generar la imagen:", err);

    if (err instanceof OpenAI.APIError) {
      // La cuenta necesita verificar la organización para usar gpt-image-1.
      if (
        err.status === 403 ||
        /verif/i.test(err.message) ||
        err.code === "organization_verification_required"
      ) {
        return NextResponse.json(
          {
            error:
              "Tu cuenta de OpenAI necesita verificar la organización para generar imágenes. Hazlo en platform.openai.com/settings/organization/general",
          },
          { status: 403 },
        );
      }
      if (err.status === 429) {
        return NextResponse.json(
          { error: "Demasiadas imágenes a la vez. Espera un momento y reintenta." },
          { status: 429 },
        );
      }
    }

    return NextResponse.json(
      { error: "Hubo un problema generando la imagen." },
      { status: 500 },
    );
  }
}

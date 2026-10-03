import { NextResponse } from "next/server";
import OpenAI from "openai";
import { construirPromptImagen } from "@/lib/prompts";
import { consumirImagen } from "@/lib/servidor/acceso";
import type { EstiloId } from "@/types/cuento";

// La generación de imágenes tarda más; damos margen al servidor (máx. en Vercel hobby).
export const runtime = "nodejs";
export const maxDuration = 60;

interface ImagenRequest {
  cuentoId?: string;
  personajes?: string;
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

  // Solo se ilustran cuentos generados de verdad (la familia no tiene límite).
  if (!(await consumirImagen(body.cuentoId))) {
    return NextResponse.json(
      {
        error:
          "Este cuento ya no puede generar más ilustraciones. Crea un cuento nuevo.",
      },
      { status: 403 },
    );
  }

  const openai = new OpenAI({ apiKey });
  const prompt = construirPromptImagen(
    body.titulo ?? "",
    body.texto,
    body.nombre ?? "",
    body.estilo ?? null,
    typeof body.personajes === "string" ? body.personajes : undefined,
  );

  // Modelo económico primero; si la cuenta no lo tiene, el de siempre en calidad baja.
  const generar = (model: string, quality: "low" | "medium") =>
    openai.images.generate({
      model,
      prompt,
      size: "1024x1024",
      quality,
      output_format: "jpeg",
      output_compression: 80,
      n: 1,
    });

  try {
    let result;
    try {
      result = await generar("gpt-image-1-mini", "medium");
    } catch (err) {
      const modeloNoDisponible =
        err instanceof OpenAI.APIError &&
        (err.status === 404 || (err.status === 400 && /model/i.test(err.message)));
      if (!modeloNoDisponible) throw err;
      console.warn("gpt-image-1-mini no disponible, usando gpt-image-1 (low)");
      result = await generar("gpt-image-1", "low");
    }

    const b64 = result.data?.[0]?.b64_json;
    if (!b64) {
      return NextResponse.json(
        { error: "No se pudo generar la imagen." },
        { status: 502 },
      );
    }

    return NextResponse.json({ image: `data:image/jpeg;base64,${b64}` });
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

import { NextResponse } from "next/server";
import { parsearCuento } from "@/lib/prompts";
import { concederImagenes, reservarCuento } from "@/lib/servidor/acceso";
import {
  esLimiteDePeticiones,
  generarTextoCuento,
  hayProveedorTexto,
} from "@/lib/servidor/texto";
import type { FormData } from "@/types/cuento";

// Ejecuta siempre en el servidor; nunca expone las claves al cliente.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  if (!hayProveedorTexto()) {
    return NextResponse.json(
      {
        error:
          "Falta la configuración del servidor (ANTHROPIC_API_KEY u OPENAI_API_KEY). Avisa al administrador.",
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

  try {
    const cuento = await generarTextoCuento(form);

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

    if (esLimiteDePeticiones(err)) {
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

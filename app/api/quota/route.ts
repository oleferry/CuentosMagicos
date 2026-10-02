import { NextResponse } from "next/server";
import { estadoCuota } from "@/lib/servidor/acceso";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Devuelve cuántos cuentos le quedan al visitante actual.
export async function GET() {
  try {
    return NextResponse.json(await estadoCuota());
  } catch (err) {
    console.error("Error consultando la cuota:", err);
    return NextResponse.json({ tipo: "cerrado", restantes: 0, limite: 0 });
  }
}

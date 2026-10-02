import { NextResponse } from "next/server";
import { esFamilia, listarEmails } from "@/lib/servidor/acceso";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COLUMNAS = ["email", "alta", "novedades", "novedadesAceptadas", "privacidadAceptada"];

function celda(valor: string | undefined): string {
  const v = String(valor ?? "");
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

// Descarga la lista de emails (CSV). Solo para la familia.
export async function GET() {
  if (!esFamilia()) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const filas = await listarEmails();
  filas.sort((a, b) => String(a.alta).localeCompare(String(b.alta)));
  const csv = [
    COLUMNAS.join(","),
    ...filas.map((f) => COLUMNAS.map((c) => celda(f[c])).join(",")),
  ].join("\n");

  return new NextResponse("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="emails-cuentomagico.csv"',
    },
  });
}

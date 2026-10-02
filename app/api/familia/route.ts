import { NextResponse } from "next/server";
import {
  COOKIE_FAMILIA,
  comprobarPasswordFamilia,
  puedeIntentarFamilia,
} from "@/lib/servidor/acceso";

export const runtime = "nodejs";

// Entrar como familia: con la contraseña (SITE_PASSWORD) se obtienen cuentos ilimitados.
export async function POST(request: Request) {
  let password = "";
  try {
    password = String(((await request.json()) as { password?: string }).password ?? "");
  } catch {
    return NextResponse.json({ error: "Petición no válida." }, { status: 400 });
  }

  if (!(await puedeIntentarFamilia())) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera un rato y vuelve a probar." },
      { status: 429 },
    );
  }

  const firma = comprobarPasswordFamilia(password);
  if (!firma) {
    return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_FAMILIA, firma, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}

// Salir del acceso de familia.
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_FAMILIA, "", { path: "/", maxAge: 0 });
  return res;
}

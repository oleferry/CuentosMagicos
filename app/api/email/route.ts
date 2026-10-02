import { NextResponse } from "next/server";
import { COOKIE_EMAIL, registrarEmail } from "@/lib/servidor/acceso";

export const runtime = "nodejs";

interface EmailRequest {
  email?: string;
  aceptaPrivacidad?: boolean;
  novedades?: boolean;
}

// Registra el email del visitante para darle más cuentos gratis al mes.
export async function POST(request: Request) {
  let body: EmailRequest;
  try {
    body = (await request.json()) as EmailRequest;
  } catch {
    return NextResponse.json({ error: "Petición no válida." }, { status: 400 });
  }

  if (body.aceptaPrivacidad !== true) {
    return NextResponse.json(
      { error: "Necesitamos que aceptes la política de privacidad." },
      { status: 400 },
    );
  }

  try {
    const resultado = await registrarEmail(body.email ?? "", body.novedades === true);
    if (!resultado.ok) {
      return NextResponse.json({ error: resultado.error }, { status: resultado.status });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_EMAIL, resultado.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    return res;
  } catch (err) {
    console.error("Error registrando el email:", err);
    return NextResponse.json(
      { error: "No hemos podido guardar tu email. Inténtalo de nuevo." },
      { status: 500 },
    );
  }
}

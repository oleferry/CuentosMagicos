import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protege TODA la app (páginas y rutas /api) salvo los assets estáticos.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

export function middleware(req: NextRequest) {
  const esperada = process.env.SITE_PASSWORD;

  // Si no hay contraseña configurada, la web queda abierta (no se bloquea nada).
  if (!esperada) {
    return NextResponse.next();
  }

  // Autenticación básica del navegador: solo comprobamos la contraseña.
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Basic ")) {
    try {
      const descifrado = atob(auth.slice(6)); // "usuario:contraseña"
      const pass = descifrado.slice(descifrado.indexOf(":") + 1);
      if (pass === esperada) {
        return NextResponse.next();
      }
    } catch {
      // credenciales mal formadas -> pedimos de nuevo
    }
  }

  return new NextResponse("Acceso restringido. Introduce la contraseña.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="CuentoMagico", charset="UTF-8"',
    },
  });
}

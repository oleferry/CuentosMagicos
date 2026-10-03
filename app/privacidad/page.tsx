import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacidad · CuentoMágico",
};

// ⚠️ Rellenar con los datos reales del responsable antes de abrir la web al público.
const RESPONSABLE = "[Nombre del responsable]";
const CONTACTO = "[email de contacto]";

const ACTUALIZADO = "2 de octubre de 2026";

function Bloque({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="text-base font-extrabold text-[#3a2c4d]">{titulo}</h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-[#5a4a6a]">{children}</div>
    </section>
  );
}

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-[#FFF9F0]">
      <header
        className="px-4 py-6 text-center text-white"
        style={{ background: "linear-gradient(135deg, #FFD93D, #FF6B35, #FF6B9D)" }}
      >
        <Link href="/" className="text-2xl font-extrabold drop-shadow-sm">
          ✨ CuentoMágico
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <article className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
          <h1 className="text-2xl font-extrabold text-[#3a2c4d]">Política de privacidad</h1>
          <p className="mt-1 text-xs text-[#7a6b8a]">Última actualización: {ACTUALIZADO}</p>

          <Bloque titulo="Quién es el responsable">
            <p>
              {RESPONSABLE}. Puedes escribirnos para cualquier cuestión sobre tus datos a{" "}
              <strong>{CONTACTO}</strong>.
            </p>
          </Bloque>

          <Bloque titulo="Qué datos tratamos y para qué">
            <p>
              <strong>Tu email</strong>, si decides dejarlo, para darte cuentos gratuitos
              cada mes y controlar cuántos has usado.
            </p>
            <p>
              <strong>Tu preferencia de novedades</strong>: solo si marcas la casilla
              opcional, usaremos tu email para enviarte novedades de CuentoMágico.
            </p>
            <p>
              <strong>Un identificador anónimo de conexión</strong>, calculado a partir de
              tu dirección IP (no guardamos la IP), para contar los cuentos gratuitos sin
              registro y evitar abusos. Se borra automáticamente a los 30 días.
            </p>
            <p>
              <strong>Los datos del cuento</strong> (nombre del protagonista, gustos, tema)
              se usan solo para generarlo en ese momento y no los guardamos en nuestros
              servidores. El cuento se conserva únicamente en tu navegador.
            </p>
            <p>
              <strong>La foto del protagonista</strong> (opcional y solo disponible con
              el acceso de familia) se envía una única vez al proveedor de IA para
              anotar sus rasgos visibles (pelo, ojos, piel, gafas) y que el dibujo se le
              parezca. No se guarda en nuestros servidores ni en tu navegador.
            </p>
          </Bloque>

          <Bloque titulo="Base legal">
            <p>
              El control de cuentos gratuitos se basa en la prestación del servicio que
              solicitas y en nuestro interés legítimo en evitar abusos. El envío de
              novedades se basa en tu consentimiento, que puedes retirar cuando quieras.
            </p>
          </Bloque>

          <Bloque titulo="Con quién se comparten">
            <p>
              Usamos proveedores que tratan datos por nuestra cuenta: <strong>OpenAI</strong>{" "}
              (generación del texto y las ilustraciones), <strong>Vercel</strong>{" "}
              (alojamiento de la web) y <strong>Upstash</strong> (base de datos de emails y
              contadores). Algunos están en Estados Unidos; las transferencias se amparan en
              las garantías previstas por el RGPD (cláusulas contractuales tipo o marco de
              privacidad UE-EE. UU.). No vendemos tus datos a nadie.
            </p>
          </Bloque>

          <Bloque titulo="Cuánto tiempo los guardamos">
            <p>
              Tu email, hasta que nos pidas que lo borremos. El identificador de conexión,
              30 días. Los contadores de uso, como máximo 40 días.
            </p>
          </Bloque>

          <Bloque titulo="Tus derechos">
            <p>
              Puedes pedir acceso, rectificación, supresión, oposición, limitación y
              portabilidad de tus datos, o darte de baja de las novedades, escribiendo a{" "}
              <strong>{CONTACTO}</strong>. Si crees que no hemos atendido bien tu
              solicitud, puedes reclamar ante la Agencia Española de Protección de Datos
              (aepd.es).
            </p>
          </Bloque>

          <Bloque titulo="Cookies">
            <p>
              Solo usamos cookies técnicas imprescindibles: una para recordar tu email y tus
              cuentos disponibles, y otra para el acceso de familia. No usamos cookies de
              publicidad ni de analítica.
            </p>
          </Bloque>

          <Bloque titulo="Menores">
            <p>
              CuentoMágico está pensado para que lo usen madres, padres y educadores. El
              email debe dejarlo una persona adulta.
            </p>
          </Bloque>
        </article>

        <p className="mt-6 text-center text-xs">
          <Link href="/" className="font-bold text-[#9B5DE5] underline">
            Volver al inicio
          </Link>
        </p>
      </main>
    </div>
  );
}

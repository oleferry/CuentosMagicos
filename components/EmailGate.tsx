"use client";

// Invitación a dejar el email para conseguir más cuentos.
// Adaptado de "Newsletter Signup" (21st.dev) sin librerías externas.

import { useState } from "react";
import Link from "next/link";

interface EmailGateProps {
  mensaje: string;
  onHecho: () => void;
  onCancelar?: () => void;
}

export default function EmailGate({ mensaje, onHecho, onCancelar }: EmailGateProps) {
  const [email, setEmail] = useState("");
  const [privacidad, setPrivacidad] = useState(false);
  const [novedades, setNovedades] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!privacidad) {
      setError("Marca la casilla de privacidad para continuar.");
      return;
    }
    setEnviando(true);
    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, aceptaPrivacidad: privacidad, novedades }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "No se pudo guardar el email.");
      onHecho();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el email.");
      setEnviando(false);
    }
  }

  return (
    <section className="rounded-3xl bg-white p-6 text-center shadow-sm">
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#F5EEFF] text-2xl">
        💌
      </div>
      <h2 className="text-2xl font-extrabold text-[#3a2c4d]">¿Quieres más cuentos?</h2>
      <p className="mt-2 text-sm text-[#7a6b8a]">{mensaje}</p>

      <form onSubmit={enviar} className="mt-6 flex flex-col gap-3 text-left">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            aria-label="Tu email"
            className="min-w-0 flex-1 rounded-2xl border-2 border-[#E8E0F0] bg-white px-4 py-3 text-base font-semibold text-[#3a2c4d] outline-none transition-colors focus:border-[#9B5DE5]"
          />
          <button
            type="submit"
            disabled={enviando}
            className="shrink-0 rounded-2xl px-5 py-3 text-sm font-extrabold text-white transition-opacity disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #9B5DE5, #00BBF9)" }}
          >
            {enviando ? "Guardando..." : "✨ Conseguir cuentos"}
          </button>
        </div>

        <label className="flex cursor-pointer items-start gap-2 text-xs text-[#5a4a6a]">
          <input
            type="checkbox"
            required
            checked={privacidad}
            onChange={(e) => setPrivacidad(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[#9B5DE5]"
          />
          <span>
            He leído y acepto la{" "}
            <Link href="/privacidad" target="_blank" className="font-bold text-[#9B5DE5] underline">
              política de privacidad
            </Link>
            .
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-2 text-xs text-[#5a4a6a]">
          <input
            type="checkbox"
            checked={novedades}
            onChange={(e) => setNovedades(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[#9B5DE5]"
          />
          <span>Quiero recibir novedades de CuentoMágico por email (opcional).</span>
        </label>

        {error && <p className="text-xs font-semibold text-[#FF6B35]">{error}</p>}
      </form>

      <p className="mt-4 text-xs text-[#7a6b8a]">
        🛡️ Sin spam. Puedes darte de baja cuando quieras.
      </p>

      {onCancelar && (
        <button
          type="button"
          onClick={onCancelar}
          className="mt-4 text-xs font-bold text-[#9B5DE5] underline"
        >
          Volver al cuento
        </button>
      )}
    </section>
  );
}

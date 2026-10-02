"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const DEGRADADO = "linear-gradient(135deg, #FFD93D, #FF6B35, #FF6B9D)";

export default function FamiliaPage() {
  const [esFamilia, setEsFamilia] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/quota", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setEsFamilia(d?.tipo === "familia"))
      .catch(() => setEsFamilia(false));
  }, []);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const res = await fetch("/api/familia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "No se pudo entrar.");
      setPassword("");
      setEsFamilia(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo entrar.");
    } finally {
      setEnviando(false);
    }
  }

  async function salir() {
    await fetch("/api/familia", { method: "DELETE" });
    setEsFamilia(false);
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FFF9F0]">
      <header className="px-4 py-6 text-center text-white" style={{ background: DEGRADADO }}>
        <Link href="/" className="text-2xl font-extrabold drop-shadow-sm">
          ✨ CuentoMágico
        </Link>
        <p className="mt-1 text-sm font-semibold opacity-95">Acceso de familia</p>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-4 py-8">
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          {esFamilia === null && (
            <p className="text-center text-sm text-[#7a6b8a]">Comprobando...</p>
          )}

          {esFamilia === true && (
            <div className="text-center">
              <div className="text-4xl">👨‍👩‍👧</div>
              <h1 className="mt-3 text-xl font-extrabold text-[#3a2c4d]">
                Acceso de familia activo
              </h1>
              <p className="mt-2 text-sm text-[#7a6b8a]">
                En este dispositivo tenéis cuentos ilimitados.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href="/crear"
                  className="rounded-2xl px-5 py-3 text-sm font-extrabold text-white"
                  style={{ background: DEGRADADO }}
                >
                  ✨ Crear un cuento
                </Link>
                <a
                  href="/api/familia/emails"
                  className="rounded-2xl border-2 border-[#E8E0F0] px-5 py-3 text-sm font-extrabold text-[#9B5DE5] hover:border-[#9B5DE5]"
                >
                  📥 Descargar emails registrados (CSV)
                </a>
                <button
                  type="button"
                  onClick={salir}
                  className="text-xs font-bold text-[#7a6b8a] underline"
                >
                  Salir del acceso de familia
                </button>
              </div>
            </div>
          )}

          {esFamilia === false && (
            <form onSubmit={entrar} className="flex flex-col gap-3">
              <h1 className="text-center text-xl font-extrabold text-[#3a2c4d]">
                Entrar como familia
              </h1>
              <p className="text-center text-sm text-[#7a6b8a]">
                Introduce la contraseña para crear cuentos sin límite.
              </p>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                aria-label="Contraseña"
                className="rounded-2xl border-2 border-[#E8E0F0] bg-white px-4 py-3 text-base font-semibold text-[#3a2c4d] outline-none focus:border-[#9B5DE5]"
              />
              {error && <p className="text-xs font-semibold text-[#FF6B35]">{error}</p>}
              <button
                type="submit"
                disabled={enviando}
                className="rounded-2xl px-5 py-3 text-sm font-extrabold text-white disabled:opacity-60"
                style={{ background: DEGRADADO }}
              >
                {enviando ? "Entrando..." : "Entrar"}
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}

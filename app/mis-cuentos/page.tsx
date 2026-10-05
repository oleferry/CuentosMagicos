"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { borrarCuento, listarCuentos, type CuentoGuardado } from "@/lib/biblioteca";
import { parsearCuento } from "@/lib/prompts";

function titulo(c: CuentoGuardado): string {
  return parsearCuento(c.cuento).titulo || `El cuento de ${c.form.nombre || "hoy"}`;
}

function fecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "long" });
}

// Agrupa por niño, respetando el orden (del más reciente al más antiguo).
function porNino(cuentos: CuentoGuardado[]): [string, CuentoGuardado[]][] {
  const grupos = new Map<string, CuentoGuardado[]>();
  for (const c of cuentos) {
    const nombre = c.form.nombre?.trim() || "Sin nombre";
    grupos.set(nombre, [...(grupos.get(nombre) ?? []), c]);
  }
  return Array.from(grupos.entries());
}

export default function MisCuentosPage() {
  const router = useRouter();
  const [cuentos, setCuentos] = useState<CuentoGuardado[] | null>(null);

  useEffect(() => {
    listarCuentos().then(setCuentos);
  }, []);

  function leer(c: CuentoGuardado) {
    sessionStorage.setItem(
      "cuentomagico:resultado",
      JSON.stringify({ cuento: c.cuento, cuentoId: c.id, form: c.form }),
    );
    router.push("/cuento");
  }

  async function borrar(c: CuentoGuardado) {
    if (!window.confirm(`¿Borrar «${titulo(c)}» de este dispositivo? No se puede deshacer.`)) return;
    await borrarCuento(c.id);
    setCuentos(await listarCuentos());
  }

  return (
    <div className="min-h-screen bg-[#FFF9F0]">
      <header
        className="px-4 py-6 text-center text-white"
        style={{ background: "linear-gradient(135deg, #FFD93D, #FF6B35, #FF6B9D)" }}
      >
        <Link href="/" className="text-2xl font-extrabold drop-shadow-sm">
          ✨ CuentoMágico
        </Link>
        <h1 className="mt-1 text-lg font-extrabold">📚 Mis cuentos</h1>
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 pb-16 pt-6">
        <p className="mb-6 text-center text-xs text-[#7a6b8a]">
          Se guardan solo en este dispositivo. Releer el mismo cuento otro día ayuda a leer con
          más soltura.
        </p>

        {cuentos === null && (
          <p className="text-center text-sm font-semibold text-[#7a6b8a]">Buscando tus cuentos...</p>
        )}

        {cuentos?.length === 0 && (
          <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
            <p className="text-sm font-semibold text-[#3a2c4d]">Todavía no hay cuentos guardados.</p>
            <Link
              href="/crear"
              className="mt-4 inline-block rounded-2xl px-6 py-3 text-sm font-extrabold text-white"
              style={{ background: "linear-gradient(135deg, #FFD93D, #FF6B35, #FF6B9D)" }}
            >
              ✨ Crear un cuento
            </Link>
          </div>
        )}

        {cuentos &&
          porNino(cuentos).map(([nombre, lista]) => (
            <section key={nombre} className="mb-8">
              <h2 className="mb-3 text-base font-extrabold text-[#3a2c4d]">
                Cuentos de {nombre} <span className="text-[#7a6b8a]">({lista.length})</span>
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {lista.map((c) => (
                  <article key={c.id} className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
                    <button type="button" onClick={() => leer(c)} className="text-left">
                      {c.imagenes[0] ? (
                        <img src={c.imagenes[0]} alt="" className="aspect-square w-full object-cover" />
                      ) : (
                        <div className="flex aspect-square w-full items-center justify-center bg-gradient-to-br from-[#F5EEFF] to-[#FFF9E6] text-4xl">
                          📖
                        </div>
                      )}
                      <div className="p-3">
                        <p className="font-ligada text-base leading-snug text-[#3a2c4d]">{titulo(c)}</p>
                        <p className="mt-1 text-[11px] font-semibold text-[#7a6b8a]">
                          {fecha(c.fecha)} ·{" "}
                          {c.form.modoLectura === "aprender"
                            ? `Nivel ${c.form.nivelLectura ?? 3}`
                            : "Para escuchar"}
                        </p>
                      </div>
                    </button>
                    <div className="mt-auto flex border-t border-[#F0E6DA]">
                      <button
                        type="button"
                        onClick={() => leer(c)}
                        className="flex-1 py-2 text-xs font-extrabold text-[#9B5DE5]"
                      >
                        📖 Leer
                      </button>
                      <button
                        type="button"
                        onClick={() => borrar(c)}
                        aria-label={`Borrar ${titulo(c)}`}
                        className="border-l border-[#F0E6DA] px-3 py-2 text-xs text-[#7a6b8a]"
                      >
                        🗑️
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}

        <p className="mt-4 text-center text-xs">
          <Link href="/crear" className="font-bold text-[#9B5DE5] underline">
            ✨ Crear otro cuento
          </Link>
        </p>
      </main>
    </div>
  );
}

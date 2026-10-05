"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState } from "react";
import type { CuentoParseado } from "@/types/cuento";
import { retoBusca } from "@/lib/letras";

// Lectura a pantalla completa, página a página (tablet o móvil): portada, una
// parte por página con su ilustración y una página final con lo aprendido y
// las preguntas. Se pasa con los botones, deslizando el dedo o con las flechas.

type Pagina =
  | { tipo: "portada" }
  | { tipo: "parte"; indice: number }
  | { tipo: "final" };

interface LectorPaginasProps {
  cuento: CuentoParseado;
  nombre: string;
  imagenes: (string | null)[];
  aprender: boolean;
  busca?: { muestra: string; total: number } | null;
  onCerrar: () => void;
}

const UMBRAL_DESLIZAR = 50; // px

function Imagen({ src, alto }: { src: string | null; alto: string }) {
  return src ? (
    <img
      src={src}
      alt=""
      className="w-full rounded-2xl object-cover"
      style={{ height: alto }}
    />
  ) : (
    <div
      className="w-full rounded-2xl bg-gradient-to-br from-[#F5EEFF] to-[#FFF9E6]"
      style={{ height: alto }}
    />
  );
}

export default function LectorPaginas({
  cuento,
  nombre,
  imagenes,
  aprender,
  busca,
  onCerrar,
}: LectorPaginasProps) {
  const paginas: Pagina[] = [
    { tipo: "portada" },
    ...cuento.partes.map((_, indice) => ({ tipo: "parte" as const, indice })),
    ...(cuento.aprendimos || cuento.preguntas?.length ? [{ tipo: "final" as const }] : []),
  ];
  const [actual, setActual] = useState(0);
  const contenido = useRef<HTMLDivElement>(null);
  const inicioToque = useRef<number | null>(null);

  const ir = useCallback(
    (delta: number) =>
      setActual((a) => Math.min(paginas.length - 1, Math.max(0, a + delta))),
    [paginas.length],
  );

  // Flechas del teclado y Escape para salir.
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") ir(1);
      if (e.key === "ArrowLeft") ir(-1);
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", tecla);
    // Sin scroll de la página de fondo mientras se lee.
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", tecla);
      document.body.style.overflow = overflow;
    };
  }, [ir, onCerrar]);

  // Cada página nueva empieza arriba.
  useEffect(() => {
    contenido.current?.scrollTo({ top: 0 });
  }, [actual]);

  const pagina = paginas[actual];
  const claseTexto = aprender
    ? "mb-4 font-ligada text-2xl leading-[2.1] md:text-4xl md:leading-[2.1]"
    : "mb-4 font-ligada text-xl leading-[2.1] md:text-3xl md:leading-[2.1]";

  return (
    <div
      className="no-print fixed inset-0 z-50 flex flex-col bg-[#FFF9F0] text-[#3a2c4d]"
      role="dialog"
      aria-modal="true"
      aria-label="Leer el cuento página a página"
      onTouchStart={(e) => {
        inicioToque.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (inicioToque.current === null) return;
        const dx = e.changedTouches[0].clientX - inicioToque.current;
        inicioToque.current = null;
        if (Math.abs(dx) > UMBRAL_DESLIZAR) ir(dx < 0 ? 1 : -1);
      }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-xs font-bold text-[#7a6b8a]">
          {actual + 1} / {paginas.length}
        </span>
        <button
          type="button"
          onClick={onCerrar}
          className="rounded-full bg-white px-3 py-1 text-sm font-bold text-[#9B5DE5] shadow-sm"
        >
          ✕ Cerrar
        </button>
      </div>

      <div ref={contenido} className="flex-1 overflow-y-auto px-5 pb-6">
        <div className="mx-auto max-w-3xl">
          {pagina.tipo === "portada" && (
            <div className="flex min-h-full flex-col items-center gap-5 pt-4 text-center">
              <p className="text-sm font-extrabold text-[#9B5DE5]">✨ CuentoMágico</p>
              <h1 className="font-ligada text-3xl leading-relaxed md:text-5xl md:leading-relaxed">
                {cuento.titulo || `El cuento de ${nombre || "hoy"}`}
              </h1>
              <Imagen src={imagenes[0] ?? null} alto="min(45vh, 420px)" />
              {aprender && cuento.palabrasNuevas && cuento.palabrasNuevas.length > 0 && (
                <p className="text-sm text-[#5a4a6a]">
                  📌 Palabras nuevas para leer juntos:{" "}
                  <span className="font-ligada text-lg text-[#9B5DE5]">
                    {cuento.palabrasNuevas.join(", ")}
                  </span>
                </p>
              )}
              <p className="font-ligada text-xl md:text-2xl">Un cuento para {nombre || "ti"}</p>
            </div>
          )}

          {pagina.tipo === "parte" && (
            <article>
              <h2 className="mb-3 font-ligada text-2xl leading-relaxed md:text-4xl md:leading-relaxed">
                {cuento.partes[pagina.indice].titulo}
              </h2>
              <Imagen src={imagenes[pagina.indice] ?? null} alto="min(38vh, 380px)" />
              <div className="mt-5">
                {cuento.partes[pagina.indice].texto.split(/\n+/).map((p, j) => (
                  <p key={j} className={claseTexto}>
                    {p}
                  </p>
                ))}
              </div>
              {pagina.indice === 1 && cuento.partes.length > 2 && (
                <p className="mt-2 rounded-xl bg-[#F5EEFF] px-3 py-2 text-sm font-semibold text-[#5a4a6a]">
                  💬 Pausa: ¿qué crees que pasará ahora?
                </p>
              )}
            </article>
          )}

          {pagina.tipo === "final" && (
            <div className="space-y-4 pt-2">
              {cuento.aprendimos && (
                <section className="rounded-2xl border-2 border-[#FFD93D] bg-[#FFF9E6] p-4">
                  <h2 className="mb-2 text-base font-extrabold">💡 Lo que aprendimos hoy</h2>
                  {cuento.aprendimos.split(/\n+/).map((p, j) => (
                    <p key={j} className="font-ligada text-xl leading-[2] md:text-2xl">
                      {p}
                    </p>
                  ))}
                </section>
              )}
              {cuento.preguntas && cuento.preguntas.length > 0 && (
                <section className="rounded-2xl border-2 border-[#9B5DE5] bg-[#F5EEFF] p-4">
                  <h2 className="mb-2 text-base font-extrabold">💬 Hablamos del cuento</h2>
                  <ol className="space-y-1">
                    {cuento.preguntas.map((p, i) => (
                      <li key={i} className="font-ligada text-xl leading-[2] md:text-2xl">
                        {i + 1}. {p}
                      </li>
                    ))}
                  </ol>
                </section>
              )}
              {busca && busca.total > 0 && (
                <p className="rounded-2xl border-2 border-dashed border-[#00BBF9] bg-white p-4 text-sm font-bold">
                  🔎 Vuelve atrás y busca las palabras con{" "}
                  <span className="font-ligada text-lg text-[#9B5DE5]">{busca.muestra}</span>.
                  {retoBusca(busca.total)} ¿Cómo suena?
                </p>
              )}
              <p className="pt-2 text-center font-ligada text-4xl text-[#9B5DE5]">Fin</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 border-t border-[#F0E6DA] bg-white px-4 py-3">
        <button
          type="button"
          onClick={() => ir(-1)}
          disabled={actual === 0}
          className="flex-1 rounded-2xl border-2 border-[#E8E0F0] bg-white py-3 text-sm font-extrabold text-[#9B5DE5] disabled:opacity-40"
        >
          ‹ Anterior
        </button>
        {actual < paginas.length - 1 ? (
          <button
            type="button"
            onClick={() => ir(1)}
            className="flex-1 rounded-2xl py-3 text-sm font-extrabold text-white"
            style={{ background: "linear-gradient(135deg, #9B5DE5, #00BBF9)" }}
          >
            Siguiente ›
          </button>
        ) : (
          <button
            type="button"
            onClick={onCerrar}
            className="flex-1 rounded-2xl py-3 text-sm font-extrabold text-white"
            style={{ background: "linear-gradient(135deg, #FFD93D, #FF6B35, #FF6B9D)" }}
          >
            Terminar
          </button>
        )}
      </div>
    </div>
  );
}

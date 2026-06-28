"use client";

import type { CuentoParseado } from "@/types/cuento";

// Colores que rotan en el borde izquierdo de cada parte.
const BORDES = ["#9B5DE5", "#FF6B9D", "#00BBF9", "#FF6B35"];

interface CuentoViewerProps {
  cuento: CuentoParseado;
  nombre?: string;
}

export default function CuentoViewer({ cuento, nombre }: CuentoViewerProps) {
  return (
    <div className="space-y-5">
      {cuento.partes.map((parte, i) => (
        <article
          key={i}
          className="rounded-2xl border-l-8 bg-white p-5 shadow-sm"
          style={{ borderLeftColor: BORDES[i % BORDES.length] }}
        >
          <h3 className="mb-3 text-lg font-extrabold text-[#3a2c4d]">
            {parte.titulo}
          </h3>

          {/* Placeholder de ilustración (se generará en la fase 2). */}
          <div className="mb-4 flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-[#9B5DE5] bg-[#F5EEFF] text-sm font-bold text-[#9B5DE5]">
            🎨 Ilustración próximamente
          </div>

          {parte.texto.split(/\n+/).map((parrafo, j) => (
            <p key={j} className="mb-3 leading-relaxed text-[#3a2c4d] last:mb-0">
              {parrafo}
            </p>
          ))}
        </article>
      ))}

      {cuento.aprendimos && (
        <article
          className="rounded-2xl border-2 p-5"
          style={{ backgroundColor: "#FFF9E6", borderColor: "#FFD93D" }}
        >
          <h3 className="mb-2 text-lg font-extrabold text-[#3a2c4d]">
            💡 Lo que aprendimos hoy
          </h3>
          {cuento.aprendimos.split(/\n+/).map((parrafo, j) => (
            <p key={j} className="mb-2 leading-relaxed text-[#3a2c4d] last:mb-0">
              {parrafo}
            </p>
          ))}
        </article>
      )}

      {nombre && (
        <p className="pt-2 text-center text-sm font-semibold text-[#7a6b8a]">
          Un cuento mágico para {nombre} 💛
        </p>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
/* eslint-disable @next/next/no-img-element */
import type { CuentoParseado, EstiloId, ParteCuento } from "@/types/cuento";

// Colores que rotan en el borde izquierdo de cada parte.
const BORDES = ["#9B5DE5", "#FF6B9D", "#00BBF9", "#FF6B35"];

interface CuentoViewerProps {
  cuento: CuentoParseado;
  nombre?: string;
  estilo?: EstiloId | null;
}

export default function CuentoViewer({
  cuento,
  nombre,
  estilo,
}: CuentoViewerProps) {
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

          <Ilustracion
            parte={parte}
            nombre={nombre ?? ""}
            estilo={estilo ?? null}
          />

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

type EstadoImagen = "cargando" | "ok" | "error";

interface IlustracionProps {
  parte: ParteCuento;
  nombre: string;
  estilo: EstiloId | null;
}

function Ilustracion({ parte, nombre, estilo }: IlustracionProps) {
  const [estado, setEstado] = useState<EstadoImagen>("cargando");
  const [src, setSrc] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string>("");
  const yaPedida = useRef(false);

  const generar = useCallback(async () => {
    setEstado("cargando");
    setMensaje("");
    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: parte.titulo,
          texto: parte.texto,
          nombre,
          estilo,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "No se pudo generar la imagen.");
      setSrc(data.image);
      setEstado("ok");
    } catch (err) {
      setMensaje(
        err instanceof Error ? err.message : "No se pudo generar la imagen.",
      );
      setEstado("error");
    }
  }, [parte.titulo, parte.texto, nombre, estilo]);

  // Solo una petición por montaje (evita duplicados en re-renders).
  useEffect(() => {
    if (yaPedida.current) return;
    yaPedida.current = true;
    generar();
  }, [generar]);

  if (estado === "ok" && src) {
    return (
      <img
        src={src}
        alt={`Ilustración: ${parte.titulo}`}
        className="mb-4 h-56 w-full rounded-xl object-cover"
      />
    );
  }

  if (estado === "error") {
    return (
      <div className="mb-4 flex h-40 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#FF6B35] bg-[#FFF1EB] px-4 text-center">
        <span className="text-xs font-semibold text-[#FF6B35]">{mensaje}</span>
        <button
          type="button"
          onClick={() => {
            yaPedida.current = true;
            generar();
          }}
          className="rounded-full bg-[#FF6B35] px-4 py-1.5 text-xs font-bold text-white"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Cargando
  return (
    <div className="mb-4 flex h-40 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[#9B5DE5] bg-[#F5EEFF] text-sm font-bold text-[#9B5DE5]">
      <div className="flex gap-1.5">
        <span className="cm-dot h-3 w-3 rounded-full bg-[#9B5DE5]" style={{ animationDelay: "0s" }} />
        <span className="cm-dot h-3 w-3 rounded-full bg-[#FF6B9D]" style={{ animationDelay: "0.2s" }} />
        <span className="cm-dot h-3 w-3 rounded-full bg-[#FF6B35]" style={{ animationDelay: "0.4s" }} />
      </div>
      🎨 Dibujando la ilustración...
    </div>
  );
}

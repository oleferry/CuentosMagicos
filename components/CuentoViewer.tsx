"use client";

import { useCallback, useEffect, useRef, useState } from "react";
/* eslint-disable @next/next/no-img-element */
import type {
  CuentoParseado,
  EstiloId,
  ModoLectura,
  ParteCuento,
} from "@/types/cuento";
import LibroImprimible from "@/components/LibroImprimible";
import LectorPaginas from "@/components/LectorPaginas";
import type { MaterialCaligrafia } from "@/lib/caligrafia";

// Colores que rotan en el borde izquierdo de cada parte.
const BORDES = ["#9B5DE5", "#FF6B9D", "#00BBF9", "#FF6B35"];

type EstadoImagen = "cargando" | "ok" | "error";

interface CuentoViewerProps {
  cuento: CuentoParseado;
  cuentoId?: string;
  nombre?: string;
  estilo?: EstiloId | null;
  modoLectura?: ModoLectura;
  ficha?: MaterialCaligrafia | null; // ficha de caligrafía al imprimir (modo aprender)
  // Juego de buscar las palabras con la letra protagonista (modo aprender).
  busca?: { muestra: string; total: number; palabras: string[] } | null;
  imprenta?: boolean; // ficha de caligrafía en letra de imprenta
  formato?: "papel" | "pantalla"; // PDF para imprimir o para leer en tablet/móvil
  lectorAbierto?: boolean; // lectura a pantalla completa, página a página
  onCerrarLector?: () => void;
  // Informa cuántas ilustraciones han terminado (ok o error) del total.
  onProgreso?: (listas: number, total: number) => void;
}

export default function CuentoViewer({
  cuento,
  cuentoId,
  nombre,
  estilo,
  modoLectura,
  ficha,
  busca,
  imprenta,
  formato = "papel",
  lectorAbierto,
  onCerrarLector,
  onProgreso,
}: CuentoViewerProps) {
  const [verPalabras, setVerPalabras] = useState(false);
  const total = cuento.partes.length;
  const aprender = modoLectura === "aprender";
  // En modo aprender, letra más grande para leerlo solo.
  const claseTexto = aprender
    ? "mb-4 font-ligada text-2xl leading-[2.2] text-[#3a2c4d] last:mb-0"
    : "mb-4 font-ligada text-xl leading-[2.2] text-[#3a2c4d] last:mb-0";
  const [estados, setEstados] = useState<EstadoImagen[]>(() =>
    Array(total).fill("cargando"),
  );
  // Se guardan las imágenes para reutilizarlas en la maqueta de impresión.
  const [imagenes, setImagenes] = useState<(string | null)[]>(() =>
    Array(total).fill(null),
  );

  const setEstadoEn = useCallback(
    (i: number, e: EstadoImagen, src?: string) => {
      setEstados((prev) => {
        if (prev[i] === e) return prev;
        const next = [...prev];
        next[i] = e;
        return next;
      });
      if (src) {
        setImagenes((prev) => {
          const next = [...prev];
          next[i] = src;
          return next;
        });
      }
    },
    [],
  );

  useEffect(() => {
    const listas = estados.filter((e) => e === "ok" || e === "error").length;
    onProgreso?.(listas, total);
  }, [estados, total, onProgreso]);

  return (
    <>
    {lectorAbierto && (
      <LectorPaginas
        cuento={cuento}
        nombre={nombre ?? ""}
        imagenes={imagenes}
        aprender={aprender}
        busca={busca}
        onCerrar={() => onCerrarLector?.()}
      />
    )}
    {/* En modo aprender, la impresión usa la maqueta de libro (papel o pantalla). */}
    {aprender && (
      <LibroImprimible
        titulo={cuento.titulo}
        nombre={nombre ?? ""}
        partes={cuento.partes}
        aprendimos={cuento.aprendimos}
        imagenes={imagenes}
        ficha={formato === "papel" ? ficha : null}
        imprenta={imprenta}
        formato={formato}
        preguntas={cuento.preguntas}
        busca={busca}
      />
    )}
    <div className={aprender ? "solo-pantalla space-y-5" : "space-y-5"}>
      {cuento.titulo && (
        <h2 className="px-2 text-center font-ligada text-3xl leading-relaxed text-[#3a2c4d]">
          {cuento.titulo}
        </h2>
      )}
      {cuento.partes.map((parte, i) => (
        <article
          key={i}
          className="cm-print-page rounded-2xl border-l-8 bg-white p-5 shadow-sm"
          style={{ borderLeftColor: BORDES[i % BORDES.length] }}
        >
          <h3 className="mb-4 font-ligada text-2xl leading-relaxed text-[#3a2c4d]">
            {parte.titulo}
          </h3>

          <Ilustracion
            parte={parte}
            cuentoId={cuentoId}
            claveCache={cuentoId ? `cuentomagico:img:${cuentoId}:${i}` : null}
            personajes={cuento.personajes}
            nombre={nombre ?? ""}
            estilo={estilo ?? null}
            onEstado={(e, src) => setEstadoEn(i, e, src)}
          />

          {parte.texto.split(/\n+/).map((parrafo, j) => (
            <p key={j} className={claseTexto}>
              {parrafo}
            </p>
          ))}

          {/* Una pausa a mitad del cuento: preguntar durante la lectura, no solo al final. */}
          {i === 1 && total > 2 && (
            <p className="mt-2 rounded-xl bg-[#F5EEFF] px-3 py-2 text-sm font-semibold text-[#5a4a6a]">
              💬 Pausa: ¿qué crees que pasará ahora?
            </p>
          )}
        </article>
      ))}

      {cuento.aprendimos && (
        <article
          className="cm-print-page rounded-2xl border-2 p-5"
          style={{ backgroundColor: "#FFF9E6", borderColor: "#FFD93D" }}
        >
          <h3 className="mb-2 text-lg font-extrabold text-[#3a2c4d]">
            💡 Lo que aprendimos hoy
          </h3>
          {cuento.aprendimos.split(/\n+/).map((parrafo, j) => (
            <p key={j} className={claseTexto}>
              {parrafo}
            </p>
          ))}
        </article>
      )}

      {cuento.preguntas && cuento.preguntas.length > 0 && (
        <article className="rounded-2xl border-2 border-[#9B5DE5] bg-[#F5EEFF] p-5">
          <h3 className="mb-1 text-lg font-extrabold text-[#3a2c4d]">💬 Hablamos del cuento</h3>
          <p className="mb-3 text-xs text-[#7a6b8a]">
            De más fácil a más difícil. Es una charla, no un examen.
          </p>
          <ol className="space-y-2">
            {cuento.preguntas.map((p, i) => (
              <li key={i} className="font-ligada text-xl leading-[2] text-[#3a2c4d]">
                {i + 1}. {p}
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs leading-relaxed text-[#5a4a6a]">
            <strong>Cómo hacerlo:</strong> espera su respuesta sin prisa, felicítale, añade algo a lo
            que dice y pídele que lo repita. Para terminar: «¿Me cuentas tú el cuento?». Y si
            mañana lo leéis otra vez, mejor: releer da soltura.
          </p>
        </article>
      )}

      {busca && busca.total > 0 && (
        <article className="rounded-2xl border-2 border-dashed border-[#00BBF9] bg-white p-5">
          <h3 className="text-lg font-extrabold text-[#3a2c4d]">
            🔎 Busca la <span className="font-ligada text-[#9B5DE5]">{busca.muestra}</span>
          </h3>
          <p className="mt-1 text-sm text-[#5a4a6a]">
            En el cuento hay <strong>{busca.total}</strong> palabras con{" "}
            <span className="font-ligada">{busca.muestra}</span>. ¿Las encuentras todas? ¿Cómo
            suena?
          </p>
          {verPalabras ? (
            <p className="mt-3 font-ligada text-xl leading-[2] text-[#3a2c4d]">
              {busca.palabras.join(", ")}
            </p>
          ) : (
            <button
              type="button"
              onClick={() => setVerPalabras(true)}
              className="mt-3 rounded-full bg-[#00BBF9] px-4 py-1.5 text-xs font-bold text-white"
            >
              Ver las palabras
            </button>
          )}
        </article>
      )}

      {nombre && (
        <p className="pt-2 text-center text-sm font-semibold text-[#7a6b8a]">
          Un cuento mágico para {nombre} 💛
        </p>
      )}
    </div>
    </>
  );
}

interface IlustracionProps {
  parte: ParteCuento;
  cuentoId?: string;
  claveCache: string | null; // dónde guardar la imagen para no regenerarla al recargar
  personajes?: string; // aspecto de los personajes, igual en todas las ilustraciones
  nombre: string;
  estilo: EstiloId | null;
  onEstado?: (estado: EstadoImagen, src?: string) => void;
}

function leerCache(clave: string | null): string | null {
  if (!clave) return null;
  try {
    return sessionStorage.getItem(clave);
  } catch {
    return null;
  }
}

function guardarCache(clave: string | null, imagen: string) {
  if (!clave) return;
  try {
    sessionStorage.setItem(clave, imagen);
  } catch {
    // almacenamiento lleno: simplemente no se guarda
  }
}

function Ilustracion({
  parte,
  cuentoId,
  claveCache,
  personajes,
  nombre,
  estilo,
  onEstado,
}: IlustracionProps) {
  const [estado, setEstado] = useState<EstadoImagen>("cargando");
  const [src, setSrc] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string>("");
  const yaPedida = useRef(false);

  // Reportamos el estado al padre sin meterlo en deps (evita bucles de render).
  const onEstadoRef = useRef(onEstado);
  onEstadoRef.current = onEstado;
  const reportar = (e: EstadoImagen, imagen?: string) => {
    setEstado(e);
    onEstadoRef.current?.(e, imagen);
  };

  const generar = useCallback(async () => {
    reportar("cargando");
    setMensaje("");
    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cuentoId,
          personajes,
          titulo: parte.titulo,
          texto: parte.texto,
          nombre,
          estilo,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "No se pudo generar la imagen.");
      setSrc(data.image);
      guardarCache(claveCache, data.image);
      reportar("ok", data.image);
    } catch (err) {
      setMensaje(
        err instanceof Error ? err.message : "No se pudo generar la imagen.",
      );
      reportar("error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cuentoId, claveCache, personajes, parte.titulo, parte.texto, nombre, estilo]);

  // Solo una petición por montaje; si ya estaba generada, se usa la guardada.
  useEffect(() => {
    if (yaPedida.current) return;
    yaPedida.current = true;
    const guardada = leerCache(claveCache);
    if (guardada) {
      setSrc(guardada);
      reportar("ok", guardada);
      return;
    }
    generar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generar, claveCache]);

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
          onClick={() => generar()}
          className="no-print rounded-full bg-[#FF6B35] px-4 py-1.5 text-xs font-bold text-white"
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

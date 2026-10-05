"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  CuentoParseado,
  EstiloId,
  FormData,
  ModoLectura,
  NivelLectura,
} from "@/types/cuento";
import { parsearCuento } from "@/lib/prompts";
import { materialCaligrafia } from "@/lib/caligrafia";
import { buscarLetra, letraInfo } from "@/lib/letras";
import CuentoViewer from "@/components/CuentoViewer";
import ValorarLectura from "@/components/ValorarLectura";

interface Resultado {
  cuento: CuentoParseado;
  cuentoId?: string;
  nombre: string;
  estilo: EstiloId | null;
  modoLectura: ModoLectura;
  nivelLectura: NivelLectura;
  letra: string;
}

const CLAVE_LETRA = "cuentomagico:letra";
const CLAVE_FORMATO = "cuentomagico:formato";

type Formato = "papel" | "pantalla";

export default function CuentoPage() {
  const router = useRouter();
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [vacio, setVacio] = useState(false);
  const [listas, setListas] = useState(0);
  const [totalImgs, setTotalImgs] = useState(0);
  const [conFicha, setConFicha] = useState(true);
  // Letra del cuento: ligada (la de muchos coles) o imprenta. Se recuerda en este dispositivo.
  const [imprenta, setImprenta] = useState(false);

  // Cómo lo van a leer: en papel (imprimir) o en pantalla (tablet o móvil).
  const [formato, setFormato] = useState<Formato>("papel");
  const [lectorAbierto, setLectorAbierto] = useState(false);

  useEffect(() => {
    try {
      setImprenta(localStorage.getItem(CLAVE_LETRA) === "imprenta");
      const guardado = localStorage.getItem(CLAVE_FORMATO);
      // Sin elección previa: en pantallas táctiles pequeñas, mejor leer en pantalla.
      setFormato(
        guardado === "papel" || guardado === "pantalla"
          ? guardado
          : window.matchMedia("(pointer: coarse) and (max-width: 1024px)").matches
            ? "pantalla"
            : "papel",
      );
    } catch {
      // sin almacenamiento: ligada y papel por defecto
    }
  }, []);

  const elegirFormato = (f: Formato) => {
    setFormato(f);
    try {
      localStorage.setItem(CLAVE_FORMATO, f);
    } catch {
      // no pasa nada si no se puede recordar
    }
  };

  const elegirLetra = (enImprenta: boolean) => {
    setImprenta(enImprenta);
    try {
      localStorage.setItem(CLAVE_LETRA, enImprenta ? "imprenta" : "ligada");
    } catch {
      // no pasa nada si no se puede recordar
    }
  };

  const onProgreso = useCallback((l: number, t: number) => {
    setListas(l);
    setTotalImgs(t);
  }, []);

  const todasListas = totalImgs > 0 && listas >= totalImgs;
  const aprender = resultado?.modoLectura === "aprender";

  const letra = aprender ? letraInfo(resultado?.letra) : null;

  // Palabras y frase para la ficha de caligrafía (solo modo aprender).
  const ficha = useMemo(
    () =>
      resultado && aprender
        ? materialCaligrafia(resultado.cuento, resultado.nivelLectura, letra)
        : null,
    [resultado, aprender, letra],
  );

  // Juego de buscar en el cuento las palabras con la letra protagonista.
  const busca = useMemo(() => {
    if (!resultado || !letra) return null;
    const texto = resultado.cuento.partes.map((p) => p.texto).join("\n");
    return { muestra: letra.muestra, ...buscarLetra(texto, letra) };
  }, [resultado, letra]);

  useEffect(() => {
    const raw = sessionStorage.getItem("cuentomagico:resultado");
    if (!raw) {
      setVacio(true);
      return;
    }
    try {
      const data = JSON.parse(raw) as {
        cuento: string;
        cuentoId?: string;
        form: FormData;
      };
      setResultado({
        cuento: parsearCuento(data.cuento),
        cuentoId: data.cuentoId,
        nombre: data.form?.nombre ?? "",
        estilo: data.form?.estilo ?? null,
        modoLectura: data.form?.modoLectura ?? "escuchar",
        nivelLectura: data.form?.nivelLectura ?? 3,
        letra: data.form?.letra ?? "",
      });
    } catch {
      setVacio(true);
    }
  }, []);

  if (vacio) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FFF9F0] px-6 text-center">
        <p className="mb-4 text-base font-semibold text-[#3a2c4d]">
          Todavía no hay ningún cuento. ¡Vamos a crear uno!
        </p>
        <button
          type="button"
          onClick={() => router.push("/crear")}
          className="rounded-2xl px-6 py-3 text-sm font-extrabold text-white"
          style={{ background: "linear-gradient(135deg, #FFD93D, #FF6B35, #FF6B9D)" }}
        >
          ✨ Crear un cuento
        </button>
      </div>
    );
  }

  if (!resultado) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFF9F0]">
        <p className="text-sm font-semibold text-[#7a6b8a]">Cargando tu cuento...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9F0]">
      <header
        className="no-print px-4 py-6 text-center text-white"
        style={{ background: "linear-gradient(135deg, #FFD93D, #FF6B35)" }}
      >
        <h1 className="text-2xl font-extrabold drop-shadow-sm">
          ✨ ¡Tu cuento está listo!
        </h1>
      </header>

      <main
        className={`mx-auto w-full max-w-xl px-4 pb-60 pt-6 ${imprenta ? "letra-imprenta" : ""}`}
      >
        <div className="no-print mb-5 flex items-center justify-center gap-2 text-xs font-bold text-[#5a4a6a]">
          Letra:
          {[
            { valor: false, texto: "Ligada", clase: "font-[Playwrite_ES]" },
            { valor: true, texto: "Imprenta", clase: "font-[Andika]" },
          ].map((o) => (
            <button
              key={o.texto}
              type="button"
              onClick={() => elegirLetra(o.valor)}
              aria-pressed={imprenta === o.valor}
              className={`rounded-full border-2 px-3 py-1 text-sm ${o.clase}`}
              style={{
                borderColor: imprenta === o.valor ? "#9B5DE5" : "#E8E0F0",
                backgroundColor: imprenta === o.valor ? "#9B5DE5" : "#ffffff",
                color: imprenta === o.valor ? "#ffffff" : "#3a2c4d",
              }}
            >
              {o.texto}
            </button>
          ))}
        </div>
        <CuentoViewer
          cuento={resultado.cuento}
          cuentoId={resultado.cuentoId}
          nombre={resultado.nombre}
          estilo={resultado.estilo}
          modoLectura={resultado.modoLectura}
          ficha={conFicha ? ficha : null}
          busca={busca}
          imprenta={imprenta}
          formato={formato}
          lectorAbierto={lectorAbierto}
          onCerrarLector={() => setLectorAbierto(false)}
          onProgreso={onProgreso}
        />
        {aprender && resultado.cuentoId && resultado.nombre && (
          <ValorarLectura nombre={resultado.nombre} cuentoId={resultado.cuentoId} />
        )}
      </main>

      <nav className="no-print fixed bottom-0 left-0 right-0 border-t border-[#F0E6DA] bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-2">
          <div className="grid grid-cols-2 gap-1 rounded-2xl bg-[#F5EEFF] p-1">
            {[
              { id: "papel" as const, texto: "🖨️ Para imprimir" },
              { id: "pantalla" as const, texto: "📱 Tablet o móvil" },
            ].map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => elegirFormato(o.id)}
                aria-pressed={formato === o.id}
                className="rounded-xl py-2 text-xs font-extrabold transition-colors"
                style={{
                  backgroundColor: formato === o.id ? "#ffffff" : "transparent",
                  color: formato === o.id ? "#9B5DE5" : "#7a6b8a",
                  boxShadow: formato === o.id ? "0 1px 4px rgba(155,93,229,0.25)" : "none",
                }}
              >
                {o.texto}
              </button>
            ))}
          </div>
          {formato === "pantalla" && (
            <button
              type="button"
              onClick={() => setLectorAbierto(true)}
              className="w-full rounded-2xl px-5 py-3 text-sm font-extrabold text-white"
              style={{ background: "linear-gradient(135deg, #9B5DE5, #00BBF9)" }}
            >
              📖 Leer página a página
            </button>
          )}
          {formato === "papel" && aprender && (
            <label className="flex cursor-pointer items-center gap-2 px-1 text-xs font-bold text-[#5a4a6a]">
              <input
                type="checkbox"
                checked={conFicha}
                onChange={(e) => setConFicha(e.target.checked)}
                className="h-4 w-4 accent-[#9B5DE5]"
              />
              ✏️ Añadir ficha de caligrafía al PDF (su nombre y palabras del cuento)
            </label>
          )}
          <button
            type="button"
            onClick={() => window.print()}
            disabled={!todasListas}
            className={
              formato === "papel"
                ? "w-full rounded-2xl px-5 py-3 text-sm font-extrabold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                : "w-full rounded-2xl border-2 border-[#E8E0F0] bg-white px-5 py-2.5 text-xs font-extrabold text-[#9B5DE5] disabled:cursor-not-allowed disabled:opacity-50"
            }
            style={
              formato === "papel"
                ? { background: "linear-gradient(135deg, #9B5DE5, #00BBF9)" }
                : undefined
            }
          >
            {!todasListas
              ? `Preparando ilustraciones... (${listas}/${totalImgs || "…"})`
              : formato === "papel"
                ? "📄 Imprimir o guardar PDF (A4, 2 páginas por hoja)"
                : "⬇️ Guardar PDF para la tablet o el móvil"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/crear")}
            className="w-full rounded-2xl border-2 border-[#E8E0F0] bg-white px-5 py-3 text-sm font-extrabold text-[#9B5DE5]"
          >
            ✨ Crear otro cuento
          </button>
        </div>
      </nav>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CuentoParseado, EstiloId, FormData } from "@/types/cuento";
import { parsearCuento } from "@/lib/prompts";
import CuentoViewer from "@/components/CuentoViewer";

interface Resultado {
  cuento: CuentoParseado;
  nombre: string;
  estilo: EstiloId | null;
}

export default function CuentoPage() {
  const router = useRouter();
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [vacio, setVacio] = useState(false);
  const [listas, setListas] = useState(0);
  const [totalImgs, setTotalImgs] = useState(0);

  const onProgreso = useCallback((l: number, t: number) => {
    setListas(l);
    setTotalImgs(t);
  }, []);

  const todasListas = totalImgs > 0 && listas >= totalImgs;

  useEffect(() => {
    const raw = sessionStorage.getItem("cuentomagico:resultado");
    if (!raw) {
      setVacio(true);
      return;
    }
    try {
      const data = JSON.parse(raw) as { cuento: string; form: FormData };
      setResultado({
        cuento: parsearCuento(data.cuento),
        nombre: data.form?.nombre ?? "",
        estilo: data.form?.estilo ?? null,
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

      <main className="mx-auto w-full max-w-xl px-4 pb-40 pt-6">
        <CuentoViewer
          cuento={resultado.cuento}
          nombre={resultado.nombre}
          estilo={resultado.estilo}
          onProgreso={onProgreso}
        />
      </main>

      <nav className="no-print fixed bottom-0 left-0 right-0 border-t border-[#F0E6DA] bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            disabled={!todasListas}
            className="w-full rounded-2xl px-5 py-3 text-sm font-extrabold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #9B5DE5, #00BBF9)" }}
          >
            {todasListas
              ? "📄 Descargar PDF / Imprimir"
              : `Preparando ilustraciones... (${listas}/${totalImgs || "…"})`}
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

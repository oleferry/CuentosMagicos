"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FormData } from "@/types/cuento";
import { formDataInicial } from "@/types/cuento";
import ProgressBar from "@/components/ui/ProgressBar";
import StepEdad from "@/components/steps/StepEdad";
import StepNombre from "@/components/steps/StepNombre";
import StepSecundarios from "@/components/steps/StepSecundarios";
import StepLugar from "@/components/steps/StepLugar";
import StepObjetos from "@/components/steps/StepObjetos";
import StepTema from "@/components/steps/StepTema";

const TOTAL_PASOS = 6;

export default function Wizard() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(formDataInicial);
  const [paso, setPaso] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fusiona cambios parciales sin perder el resto del estado.
  const update = (patch: Partial<FormData>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  // Validación mínima por paso (los pasos 2-4 son opcionales).
  function pasoValido(): boolean {
    if (paso === 0) return form.edad !== null;
    if (paso === 1) return form.nombre.trim().length > 0;
    if (paso === 5) return form.tema.trim().length > 0 && form.estilo !== null;
    return true;
  }

  const pasos = [
    <StepEdad key="edad" form={form} update={update} />,
    <StepNombre key="nombre" form={form} update={update} />,
    <StepSecundarios key="secundarios" form={form} update={update} />,
    <StepLugar key="lugar" form={form} update={update} />,
    <StepObjetos key="objetos" form={form} update={update} />,
    <StepTema key="tema" form={form} update={update} />,
  ];

  function atras() {
    setError(null);
    setPaso((p) => Math.max(0, p - 1));
  }

  function siguiente() {
    setError(null);
    if (!pasoValido()) return;
    setPaso((p) => Math.min(TOTAL_PASOS - 1, p + 1));
  }

  async function generar() {
    if (!pasoValido()) return;
    setError(null);
    setCargando(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? "No se pudo generar el cuento.");
      }

      // Guardamos el cuento y los datos para la pantalla de resultado.
      sessionStorage.setItem(
        "cuentomagico:resultado",
        JSON.stringify({ cuento: data.cuento, form }),
      );
      router.push("/cuento");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Hubo un problema. Inténtalo de nuevo.",
      );
      setCargando(false);
    }
  }

  if (cargando) {
    return <PantallaCargando />;
  }

  const esUltimo = paso === TOTAL_PASOS - 1;

  return (
    <div className="flex min-h-screen flex-col bg-[#FFF9F0]">
      <Header />

      <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-28 pt-5">
        <div className="mb-6">
          <ProgressBar total={TOTAL_PASOS} actual={paso} />
          <p className="mt-2 text-right text-xs font-bold text-[#9B5DE5]">
            Paso {paso + 1} de {TOTAL_PASOS}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm">{pasos[paso]}</div>

        {error && (
          <div className="mt-4 rounded-2xl border-2 border-[#FF6B35] bg-[#FFF1EB] px-4 py-3 text-sm font-semibold text-[#FF6B35]">
            {error}
          </div>
        )}
      </main>

      {/* Barra de navegación fija (cómoda en móvil). */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-[#F0E6DA] bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex w-full max-w-xl gap-3">
          {paso > 0 && (
            <button
              type="button"
              onClick={atras}
              className="rounded-2xl border-2 border-[#E8E0F0] bg-white px-5 py-3 text-sm font-extrabold text-[#9B5DE5] transition-colors hover:bg-[#F7F2FF]"
            >
              Atrás
            </button>
          )}
          <button
            type="button"
            onClick={esUltimo ? generar : siguiente}
            disabled={!pasoValido()}
            className="flex-1 rounded-2xl px-5 py-3 text-sm font-extrabold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              background:
                "linear-gradient(135deg, #FFD93D, #FF6B35, #FF6B9D)",
            }}
          >
            {esUltimo ? "✨ Crear el cuento" : "Siguiente"}
          </button>
        </div>
      </nav>
    </div>
  );
}

function Header() {
  return (
    <header
      className="px-4 py-6 text-center text-white"
      style={{
        background: "linear-gradient(135deg, #FFD93D, #FF6B35, #FF6B9D)",
      }}
    >
      <h1 className="text-2xl font-extrabold drop-shadow-sm">✨ CuentoMágico</h1>
      <p className="mt-1 text-sm font-semibold opacity-95">
        Aventuras que enseñan, con tu hijo de protagonista
      </p>
    </header>
  );
}

function PantallaCargando() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FFF9F0] px-6 text-center">
      <div className="mb-6 flex gap-2">
        <span
          className="cm-dot h-4 w-4 rounded-full"
          style={{ backgroundColor: "#FF6B35", animationDelay: "0s" }}
        />
        <span
          className="cm-dot h-4 w-4 rounded-full"
          style={{ backgroundColor: "#FF6B9D", animationDelay: "0.2s" }}
        />
        <span
          className="cm-dot h-4 w-4 rounded-full"
          style={{ backgroundColor: "#9B5DE5", animationDelay: "0.4s" }}
        />
      </div>
      <h2 className="text-xl font-extrabold text-[#3a2c4d]">
        Escribiendo el cuento...
      </h2>
      <p className="mt-2 text-sm text-[#7a6b8a]">
        Nuestra magia tarda unos segundos. ¡Merece la pena!
      </p>
    </div>
  );
}

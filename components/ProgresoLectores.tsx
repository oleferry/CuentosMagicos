"use client";

import { useEffect, useState } from "react";
import type { FormData } from "@/types/cuento";
import { letraInfo } from "@/lib/letras";
import {
  borrarPerfil,
  claveNino,
  listarPerfiles,
  proponer,
  type PerfilLector,
  type Propuesta,
} from "@/lib/progreso";

// Paso 1: si ya hay niños con progreso guardado en este navegador, se puede
// elegir uno y se aplican su nivel y la letra que le toca.
export default function ProgresoLectores({
  form,
  update,
}: {
  form: FormData;
  update: (patch: Partial<FormData>) => void;
}) {
  const [perfiles, setPerfiles] = useState<PerfilLector[]>([]);
  const [propuesta, setPropuesta] = useState<Propuesta | null>(null);

  useEffect(() => {
    setPerfiles(listarPerfiles());
  }, []);

  if (perfiles.length === 0) return null;

  const elegido = perfiles.find((p) => claveNino(p.nombre) === claveNino(form.nombre));

  function elegir(perfil: PerfilLector) {
    const p = proponer(perfil);
    setPropuesta(p);
    update({
      nombre: perfil.nombre,
      ...(perfil.edad ? { edad: perfil.edad } : {}),
      modoLectura: "aprender",
      nivelLectura: p.nivel,
      letra: p.letra,
    });
  }

  function olvidar(perfil: PerfilLector) {
    if (!window.confirm(`¿Borrar el progreso de lectura de ${perfil.nombre} en este dispositivo?`)) {
      return;
    }
    borrarPerfil(perfil.nombre);
    setPerfiles(listarPerfiles());
    setPropuesta(null);
  }

  const letra = propuesta ? letraInfo(propuesta.letra) : null;

  return (
    <div className="mb-7 rounded-2xl border-2 border-[#9B5DE5] bg-[#F5EEFF] p-4">
      <h3 className="text-base font-extrabold text-[#3a2c4d]">📈 ¿Para quién es?</h3>
      <p className="mb-3 text-xs text-[#7a6b8a]">
        Te proponemos su nivel y la letra que le toca según cómo leyó sus últimos cuentos.
      </p>
      <div className="flex flex-wrap gap-2">
        {perfiles.map((p) => {
          const selected = elegido === p;
          return (
            <button
              key={p.nombre}
              type="button"
              onClick={() => elegir(p)}
              aria-pressed={selected}
              className="rounded-2xl border-2 px-3 py-1.5 text-sm font-bold transition-all active:scale-95"
              style={{
                borderColor: "#9B5DE5",
                backgroundColor: selected ? "#9B5DE5" : "#ffffff",
                color: selected ? "#ffffff" : "#3a2c4d",
              }}
            >
              {p.nombre} · Nivel {p.nivel}
            </button>
          );
        })}
      </div>

      {propuesta && elegido && (
        <div className="mt-3 text-sm text-[#3a2c4d]">
          <p>
            Nivel <strong>{propuesta.nivel}</strong>
            {letra && (
              <>
                {" "}y letra <span className="font-ligada text-lg">{letra.muestra}</span>
              </>
            )}
            . {propuesta.motivo}
          </p>
          <p className="mt-1 text-xs text-[#7a6b8a]">
            Puedes cambiarlo abajo si quieres.{" "}
            <button
              type="button"
              onClick={() => olvidar(elegido)}
              className="font-bold text-[#9B5DE5] underline"
            >
              Borrar su progreso
            </button>
          </p>
        </div>
      )}
    </div>
  );
}

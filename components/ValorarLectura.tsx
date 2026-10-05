"use client";

import { useEffect, useState } from "react";
import { letraInfo } from "@/lib/letras";
import {
  deshacerCambio,
  leerPerfil,
  proponer,
  valoracionDe,
  valorarCuento,
  VALORACIONES,
  type CambioNivel,
  type Propuesta,
  type Valoracion,
} from "@/lib/progreso";

// Tras leer el cuento (modo aprender): la familia dice cómo le ha ido y con
// eso se ajusta su nivel y se propone el siguiente cuento.
export default function ValorarLectura({ nombre, cuentoId }: { nombre: string; cuentoId: string }) {
  const [valoracion, setValoracion] = useState<Valoracion | undefined>();
  const [cambio, setCambio] = useState<CambioNivel | null>(null);
  const [propuesta, setPropuesta] = useState<Propuesta | null>(null);
  const [registrado, setRegistrado] = useState(false);

  useEffect(() => {
    const perfil = leerPerfil(nombre);
    setRegistrado(!!perfil?.cuentos.some((c) => c.cuentoId === cuentoId));
    const previa = valoracionDe(nombre, cuentoId);
    setValoracion(previa);
    if (previa && perfil) setPropuesta(proponer(perfil));
  }, [nombre, cuentoId]);

  // Cuentos creados antes de esta función (o en otro dispositivo): no hay nada que valorar.
  if (!registrado) return null;

  function valorar(v: Valoracion) {
    setValoracion(v);
    setCambio(valorarCuento(nombre, cuentoId, v));
    const perfil = leerPerfil(nombre);
    setPropuesta(perfil ? proponer(perfil) : null);
  }

  function deshacer() {
    if (!cambio) return;
    deshacerCambio(nombre, cambio);
    setCambio(null);
    const perfil = leerPerfil(nombre);
    setPropuesta(perfil ? proponer(perfil) : null);
  }

  const letra = propuesta ? letraInfo(propuesta.letra) : null;

  return (
    <section className="no-print mt-5 rounded-2xl border-2 border-[#00BBF9] bg-white p-5">
      <h3 className="text-lg font-extrabold text-[#3a2c4d]">📈 ¿Qué tal lo ha leído {nombre}?</h3>
      <p className="mb-3 text-xs text-[#7a6b8a]">
        Con tu respuesta ajustamos el próximo cuento a su ritmo. Se guarda solo en este
        dispositivo.
      </p>
      <div className="grid grid-cols-3 gap-2">
        {VALORACIONES.map((v) => {
          const selected = valoracion === v.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => valorar(v.id)}
              aria-pressed={selected}
              className="flex flex-col items-center gap-1 rounded-2xl border-2 px-2 py-3 text-xs font-bold transition-all active:scale-95"
              style={{
                borderColor: selected ? "#00BBF9" : "#E8E0F0",
                backgroundColor: selected ? "#E6F8FE" : "#ffffff",
                color: "#3a2c4d",
              }}
            >
              <span className="text-2xl">{v.emoji}</span>
              {v.texto}
            </button>
          );
        })}
      </div>

      {cambio && (
        <div className="mt-4 rounded-xl bg-[#F5EEFF] px-4 py-3 text-sm text-[#3a2c4d]">
          {cambio.nuevo > cambio.anterior ? (
            <p>
              🎉 <strong>¡{nombre} sube al nivel {cambio.nuevo}!</strong> Sus dos últimos cuentos le
              han resultado fáciles, así que el siguiente tendrá más letras.
            </p>
          ) : (
            <p>
              💛 <strong>Volvemos al nivel {cambio.nuevo}</strong> un tiempo: sus dos últimos cuentos le
              han costado. Afianzar también es avanzar.
            </p>
          )}
          <button
            type="button"
            onClick={deshacer}
            className="mt-1 text-xs font-bold text-[#9B5DE5] underline"
          >
            Deshacer el cambio de nivel
          </button>
        </div>
      )}

      {valoracion && propuesta && (
        <p className="mt-3 text-sm text-[#5a4a6a]">
          <strong>Próximo cuento:</strong> nivel {propuesta.nivel}
          {letra && (
            <>
              {" "}con la <span className="font-ligada text-base">{letra.muestra}</span>
            </>
          )}
          . {propuesta.motivo} Lo verás propuesto al crear el siguiente.
        </p>
      )}
    </section>
  );
}

"use client";

import type { Edad, FormData, ModoLectura } from "@/types/cuento";
import { EDADES } from "@/lib/prompts";
import { NIVELES } from "@/lib/niveles";
import { letraInfo, letrasHastaNivel } from "@/lib/letras";

const MODOS: { id: ModoLectura; emoji: string; titulo: string; texto: string }[] = [
  {
    id: "aprender",
    emoji: "✏️",
    titulo: "Lo lee el peque",
    texto: "Aprender a leer: frases cortas en letra ligada",
  },
  {
    id: "escuchar",
    emoji: "👂",
    titulo: "Se lo leemos",
    texto: "Cuento más largo para escuchar",
  },
];

interface StepProps {
  form: FormData;
  update: (patch: Partial<FormData>) => void;
}

export default function StepEdad({ form, update }: StepProps) {
  return (
    <div>
      <h2 className="mb-1 text-xl font-extrabold text-[#3a2c4d]">
        ¿Cuántos años tiene?
      </h2>
      <p className="mb-5 text-sm text-[#7a6b8a]">
        La edad ajusta el lenguaje del cuento.
      </p>

      <div className="grid grid-cols-4 gap-3">
        {EDADES.map((edad) => {
          const selected = form.edad === edad;
          return (
            <button
              key={edad}
              type="button"
              onClick={() => update({ edad: edad as Edad })}
              aria-pressed={selected}
              className="flex aspect-square items-center justify-center rounded-2xl border-2 text-2xl font-extrabold transition-all active:scale-95"
              style={{
                borderColor: selected ? "#9B5DE5" : "#E8E0F0",
                backgroundColor: selected ? "#9B5DE5" : "#ffffff",
                color: selected ? "#ffffff" : "#9B5DE5",
              }}
            >
              {edad}
            </button>
          );
        })}
      </div>

      <h3 className="mb-3 mt-8 text-base font-extrabold text-[#3a2c4d]">
        ¿Quién va a leer el cuento?
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {MODOS.map((m) => {
          const selected = form.modoLectura === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => update({ modoLectura: m.id })}
              aria-pressed={selected}
              className="flex flex-col items-start gap-1 rounded-2xl border-2 bg-white p-4 text-left transition-all"
              style={{
                borderColor: selected ? "#9B5DE5" : "#E8E0F0",
                transform: selected ? "translateY(-2px)" : "none",
                boxShadow: selected ? "0 6px 16px rgba(155,93,229,0.25)" : "none",
              }}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-sm font-extrabold text-[#3a2c4d]">{m.titulo}</span>
              <span className="text-xs leading-snug text-[#7a6b8a]">{m.texto}</span>
            </button>
          );
        })}
      </div>

      {form.modoLectura === "aprender" && (
        <>
          <h3 className="mb-1 mt-8 text-base font-extrabold text-[#3a2c4d]">
            ¿Qué letras conoce ya?
          </h3>
          <p className="mb-3 text-xs text-[#7a6b8a]">
            El cuento solo usará palabras que pueda leer, como en el cole.{" "}
            <a
              href="/en-que-nos-basamos"
              target="_blank"
              className="font-bold text-[#9B5DE5] underline"
            >
              ¿Por qué así?
            </a>
          </p>
          <div className="flex flex-col gap-2">
            {NIVELES.map((n) => {
              const selected = form.nivelLectura === n.id;
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() =>
                    update({
                      nivelLectura: n.id,
                      // Si la letra elegida es de un nivel superior, se quita.
                      ...((letraInfo(form.letra)?.nivel ?? 1) > n.id ? { letra: "" } : {}),
                    })
                  }
                  aria-pressed={selected}
                  className="flex items-center gap-3 rounded-2xl border-2 bg-white px-4 py-3 text-left transition-all"
                  style={{
                    borderColor: selected ? "#9B5DE5" : "#E8E0F0",
                    backgroundColor: selected ? "#F5EEFF" : "#ffffff",
                  }}
                >
                  <span className="text-2xl">{n.emoji}</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-extrabold text-[#3a2c4d]">
                      Nivel {n.id} · {n.titulo}
                    </span>
                    <span className="block text-xs leading-snug text-[#7a6b8a]">{n.texto}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <h3 className="mb-1 mt-8 text-base font-extrabold text-[#3a2c4d]">
            ¿Quieres practicar una letra? <span className="font-semibold text-[#7a6b8a]">(opcional)</span>
          </h3>
          <p className="mb-3 text-xs text-[#7a6b8a]">
            Saldrá muchas veces en el cuento, en la ficha para escribir y en un juego para buscarla.
          </p>
          <div className="flex flex-wrap gap-2">
            {[{ id: "", muestra: "Ninguna" }, ...letrasHastaNivel(form.nivelLectura)].map((l) => {
              const selected = form.letra === l.id;
              return (
                <button
                  key={l.id || "ninguna"}
                  type="button"
                  onClick={() => update({ letra: l.id })}
                  aria-pressed={selected}
                  className={`min-w-[3rem] rounded-2xl border-2 px-3 py-1.5 text-[#3a2c4d] transition-all active:scale-95 ${
                    l.id ? "font-ligada text-xl" : "text-sm font-bold"
                  }`}
                  style={{
                    borderColor: selected ? "#9B5DE5" : "#E8E0F0",
                    backgroundColor: selected ? "#9B5DE5" : "#ffffff",
                    color: selected ? "#ffffff" : "#3a2c4d",
                  }}
                >
                  {l.muestra}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

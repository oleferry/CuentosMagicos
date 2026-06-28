"use client";

import type { Edad, FormData } from "@/types/cuento";
import { EDADES } from "@/lib/prompts";

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
    </div>
  );
}

"use client";

import type { FormData } from "@/types/cuento";
import { LUGARES_OPCIONES } from "@/lib/prompts";
import Chip from "@/components/ui/Chip";

interface StepProps {
  form: FormData;
  update: (patch: Partial<FormData>) => void;
}

export default function StepLugar({ form, update }: StepProps) {
  // Selección única: clicar el chip ya elegido lo deselecciona.
  const seleccionar = (opcion: string) => {
    update({ lugar: form.lugar === opcion ? "" : opcion });
  };

  return (
    <div>
      <h2 className="mb-1 text-xl font-extrabold text-[#3a2c4d]">
        ¿Dónde transcurre la aventura?
      </h2>
      <p className="mb-5 text-sm text-[#7a6b8a]">Opcional. Elige un lugar.</p>

      <div className="flex flex-wrap gap-2">
        {LUGARES_OPCIONES.map((opcion) => (
          <Chip
            key={opcion}
            label={opcion}
            color="azul"
            selected={form.lugar === opcion}
            onClick={() => seleccionar(opcion)}
          />
        ))}
      </div>

      <label className="mb-2 mt-6 block text-sm font-bold text-[#3a2c4d]">
        ¿Otro lugar?
      </label>
      <input
        type="text"
        value={form.lugarLibre}
        onChange={(e) => update({ lugarLibre: e.target.value })}
        placeholder="Salamanca, su colegio, la granja de los abuelos..."
        className="w-full rounded-2xl border-2 border-[#E8E0F0] bg-white px-4 py-3 text-base font-semibold text-[#3a2c4d] outline-none transition-colors focus:border-[#00BBF9]"
      />
    </div>
  );
}

"use client";

import type { FormData } from "@/types/cuento";
import { OBJETOS_OPCIONES } from "@/lib/prompts";
import Chip from "@/components/ui/Chip";

interface StepProps {
  form: FormData;
  update: (patch: Partial<FormData>) => void;
}

export default function StepObjetos({ form, update }: StepProps) {
  const toggle = (opcion: string) => {
    const ya = form.objetos.includes(opcion);
    update({
      objetos: ya
        ? form.objetos.filter((o) => o !== opcion)
        : [...form.objetos, opcion],
    });
  };

  return (
    <div>
      <h2 className="mb-1 text-xl font-extrabold text-[#3a2c4d]">
        ¿Qué objetos mágicos aparecen?
      </h2>
      <p className="mb-5 text-sm text-[#7a6b8a]">Opcional. Elige los que quieras.</p>

      <div className="flex flex-wrap gap-2">
        {OBJETOS_OPCIONES.map((opcion) => (
          <Chip
            key={opcion}
            label={opcion}
            color="naranja"
            selected={form.objetos.includes(opcion)}
            onClick={() => toggle(opcion)}
          />
        ))}
      </div>

      <label className="mb-2 mt-6 block text-sm font-bold text-[#3a2c4d]">
        ¿Algún objeto más?
      </label>
      <input
        type="text"
        value={form.objetosLibre}
        onChange={(e) => update({ objetosLibre: e.target.value })}
        placeholder="una mochila sin fondo, un reloj del tiempo..."
        className="w-full rounded-2xl border-2 border-[#E8E0F0] bg-white px-4 py-3 text-base font-semibold text-[#3a2c4d] outline-none transition-colors focus:border-[#FF6B35]"
      />
    </div>
  );
}

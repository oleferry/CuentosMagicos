"use client";

import type { FormData } from "@/types/cuento";
import { SECUNDARIOS_OPCIONES } from "@/lib/prompts";
import Chip from "@/components/ui/Chip";

interface StepProps {
  form: FormData;
  update: (patch: Partial<FormData>) => void;
}

export default function StepSecundarios({ form, update }: StepProps) {
  const toggle = (opcion: string) => {
    const ya = form.secundarios.includes(opcion);
    update({
      secundarios: ya
        ? form.secundarios.filter((s) => s !== opcion)
        : [...form.secundarios, opcion],
    });
  };

  return (
    <div>
      <h2 className="mb-1 text-xl font-extrabold text-[#3a2c4d]">
        ¿Quién le acompaña?
      </h2>
      <p className="mb-5 text-sm text-[#7a6b8a]">Opcional. Elige los que quieras.</p>

      <div className="flex flex-wrap gap-2">
        {SECUNDARIOS_OPCIONES.map((opcion) => (
          <Chip
            key={opcion}
            label={opcion}
            color="rosa"
            selected={form.secundarios.includes(opcion)}
            onClick={() => toggle(opcion)}
          />
        ))}
      </div>

      <label className="mb-1 mt-6 block text-sm font-bold text-[#3a2c4d]">
        Ponles nombre (opcional)
      </label>
      <p className="mb-2 text-xs text-[#7a6b8a]">
        Escribe cómo se llaman los acompañantes para que aparezcan por su nombre
        en el cuento.
      </p>
      <input
        type="text"
        value={form.secundariosLibre}
        onChange={(e) => update({ secundariosLibre: e.target.value })}
        placeholder="el hermano se llama Mateo, el perro Toby, un unicornio llamado Nube..."
        className="w-full rounded-2xl border-2 border-[#E8E0F0] bg-white px-4 py-3 text-base font-semibold text-[#3a2c4d] outline-none transition-colors focus:border-[#FF6B9D]"
      />
    </div>
  );
}

"use client";

import type { EstiloId, FormData } from "@/types/cuento";
import { ESTILOS, TEMAS_PRESET } from "@/lib/prompts";
import Chip from "@/components/ui/Chip";
import StyleCard from "@/components/ui/StyleCard";

interface StepProps {
  form: FormData;
  update: (patch: Partial<FormData>) => void;
}

export default function StepTema({ form, update }: StepProps) {
  return (
    <div>
      <h2 className="mb-1 text-xl font-extrabold text-[#3a2c4d]">
        ¿Qué quieres que aprenda?
      </h2>
      <p className="mb-5 text-sm text-[#7a6b8a]">
        Elige un tema y un estilo de ilustración.
      </p>

      <div className="flex flex-wrap gap-2">
        {TEMAS_PRESET.map((t) => (
          <Chip
            key={t.tema}
            label={`${t.emoji} ${t.etiqueta}`}
            color="verde"
            selected={form.tema === t.tema}
            onClick={() =>
              update({ tema: form.tema === t.tema ? "" : t.tema })
            }
          />
        ))}
      </div>

      <label className="mb-2 mt-6 block text-sm font-bold text-[#3a2c4d]">
        ¿Otro tema?
      </label>
      <input
        type="text"
        value={
          TEMAS_PRESET.some((t) => t.tema === form.tema) ? "" : form.tema
        }
        onChange={(e) => update({ tema: e.target.value })}
        placeholder="Los castillos medievales, el reciclaje..."
        className="w-full rounded-2xl border-2 border-[#E8E0F0] bg-white px-4 py-3 text-base font-semibold text-[#3a2c4d] outline-none transition-colors focus:border-[#00F5D4]"
      />

      <h3 className="mb-3 mt-8 text-base font-extrabold text-[#3a2c4d]">
        Estilo de ilustración
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {ESTILOS.map((e) => (
          <StyleCard
            key={e.id}
            emoji={e.emoji}
            nombre={e.nombre}
            descripcion={e.descripcion}
            selected={form.estilo === e.id}
            onClick={() => update({ estilo: e.id as EstiloId })}
          />
        ))}
      </div>
    </div>
  );
}

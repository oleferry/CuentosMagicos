"use client";

import type { EstiloId, FormData } from "@/types/cuento";
import { ESTILOS, TEMAS_PRESET, VALORES_PRESET } from "@/lib/prompts";
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
        Elige un tema, un mensaje y un estilo de ilustración.
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

      <h3 className="mb-1 mt-8 text-base font-extrabold text-[#3a2c4d]">
        ¿Qué mensaje quieres que le deje?
      </h3>
      <p className="mb-3 text-xs text-[#7a6b8a]">
        Opcional. Si eliges «Sorpresa», la historia escoge el que mejor encaje.
      </p>
      <div className="flex flex-wrap gap-2">
        <Chip
          label="✨ Sorpresa"
          color="morado"
          selected={!form.valor.trim()}
          onClick={() => update({ valor: "" })}
        />
        {VALORES_PRESET.map((v) => (
          <Chip
            key={v.valor}
            label={`${v.emoji} ${v.etiqueta}`}
            color="morado"
            selected={form.valor === v.valor}
            onClick={() =>
              update({ valor: form.valor === v.valor ? "" : v.valor })
            }
          />
        ))}
      </div>
      <input
        type="text"
        value={
          VALORES_PRESET.some((v) => v.valor === form.valor) ? "" : form.valor
        }
        onChange={(e) => update({ valor: e.target.value })}
        placeholder="¿Otro? Decir la verdad, aceptar que alguien es diferente..."
        aria-label="Otro mensaje o valor"
        maxLength={120}
        className="mt-3 w-full rounded-2xl border-2 border-[#E8E0F0] bg-white px-4 py-3 text-base font-semibold text-[#3a2c4d] outline-none transition-colors focus:border-[#9B5DE5]"
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

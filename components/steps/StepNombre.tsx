"use client";

import type { FormData } from "@/types/cuento";

interface StepProps {
  form: FormData;
  update: (patch: Partial<FormData>) => void;
}

export default function StepNombre({ form, update }: StepProps) {
  return (
    <div>
      <h2 className="mb-1 text-xl font-extrabold text-[#3a2c4d]">
        ¿Quién es el protagonista?
      </h2>
      <p className="mb-5 text-sm text-[#7a6b8a]">
        Su nombre aparecerá por todo el cuento.
      </p>

      <label className="mb-2 block text-sm font-bold text-[#3a2c4d]">
        Nombre del niño o niña
      </label>
      <input
        type="text"
        value={form.nombre}
        onChange={(e) => update({ nombre: e.target.value })}
        placeholder="Ej. Lucía"
        maxLength={40}
        className="w-full rounded-2xl border-2 border-[#E8E0F0] bg-white px-4 py-3 text-base font-semibold text-[#3a2c4d] outline-none transition-colors focus:border-[#9B5DE5]"
      />

      <label className="mb-2 mt-6 block text-sm font-bold text-[#3a2c4d]">
        Foto (opcional)
      </label>
      <label className="flex cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-[#9B5DE5] bg-[#F5EEFF] px-4 py-5 text-center text-sm font-bold text-[#9B5DE5] transition-colors hover:bg-[#efe5ff]">
        {form.fotoNombre ? `📷 ${form.fotoNombre}` : "📷 Subir una foto"}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            update({ fotoNombre: file ? file.name : null });
          }}
        />
      </label>
      <p className="mt-2 text-xs text-[#7a6b8a]">
        En esta versión solo guardamos el nombre del archivo. Las ilustraciones
        llegarán pronto.
      </p>
    </div>
  );
}

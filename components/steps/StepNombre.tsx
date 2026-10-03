"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import type { FormData } from "@/types/cuento";

interface StepProps {
  form: FormData;
  update: (patch: Partial<FormData>) => void;
  esFamilia?: boolean; // la foto solo está disponible con el acceso de familia
}

const LADO_MAXIMO = 768; // px: suficiente para describir rasgos y ligera de enviar

// Carga la imagen sin depender de que la página se esté pintando
// (img.decode() puede quedarse esperando si la pestaña está en segundo plano).
async function cargarImagen(archivo: File): Promise<CanvasImageSource & { width: number; height: number }> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(archivo);
    } catch {
      // formato no soportado por createImageBitmap: probamos con <img>
    }
  }
  const url = URL.createObjectURL(archivo);
  try {
    return await new Promise<HTMLImageElement>((resolver, rechazar) => {
      const img = new Image();
      img.onload = () => resolver(img);
      img.onerror = () => rechazar(new Error("imagen no válida"));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Reduce la foto en el propio dispositivo y la convierte a JPEG (data URL).
async function reducirFoto(archivo: File): Promise<string> {
  const img = await cargarImagen(archivo);
  const escala = Math.min(1, LADO_MAXIMO / Math.max(img.width, img.height));
  const lienzo = document.createElement("canvas");
  lienzo.width = Math.round(img.width * escala);
  lienzo.height = Math.round(img.height * escala);
  lienzo.getContext("2d")?.drawImage(img, 0, 0, lienzo.width, lienzo.height);
  return lienzo.toDataURL("image/jpeg", 0.85);
}

export default function StepNombre({ form, update, esFamilia }: StepProps) {
  const [errorFoto, setErrorFoto] = useState<string | null>(null);

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

      {esFamilia && (
        <>
          <label className="mb-2 mt-6 block text-sm font-bold text-[#3a2c4d]">
            Foto (opcional)
          </label>

          {form.foto ? (
            <div className="flex items-center gap-4 rounded-2xl border-2 border-[#9B5DE5] bg-[#F5EEFF] p-3">
              <img
                src={form.foto}
                alt="Foto del protagonista"
                className="h-20 w-20 shrink-0 rounded-xl object-cover"
              />
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#3a2c4d]">✅ Foto lista</p>
                <button
                  type="button"
                  onClick={() => update({ foto: null })}
                  className="mt-1 text-xs font-bold text-[#9B5DE5] underline"
                >
                  Quitar foto
                </button>
              </div>
            </div>
          ) : (
            <label className="flex cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-[#9B5DE5] bg-[#F5EEFF] px-4 py-5 text-center text-sm font-bold text-[#9B5DE5] transition-colors hover:bg-[#efe5ff]">
              📷 Subir una foto
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const archivo = e.target.files?.[0];
                  e.target.value = "";
                  if (!archivo) return;
                  setErrorFoto(null);
                  try {
                    update({ foto: await reducirFoto(archivo) });
                  } catch {
                    setErrorFoto("No hemos podido leer esa foto. Prueba con otra (JPG o PNG).");
                  }
                }}
              />
            </label>
          )}

          {errorFoto && (
            <p className="mt-2 text-xs font-semibold text-[#FF6B35]">{errorFoto}</p>
          )}
          <p className="mt-2 text-xs text-[#7a6b8a]">
            Para que el protagonista se le parezca. La foto no se guarda: la IA la
            mira una sola vez para anotar sus rasgos (pelo, ojos, piel, gafas…).
          </p>
        </>
      )}
    </div>
  );
}

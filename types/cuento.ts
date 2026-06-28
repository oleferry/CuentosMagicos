// Tipos del formulario y del cuento generado.

export type Edad = 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

// Clave de cada estilo de ilustración (afecta al prompt de imágenes en fase 2).
export type EstiloId = "disney" | "comic" | "manga" | "acuarela";

export interface FormData {
  // Paso 1
  edad: Edad | null;
  // Paso 2
  nombre: string;
  fotoNombre: string | null; // fase 1: solo el nombre del archivo
  // Paso 3 (opcional)
  secundarios: string[]; // chips seleccionados
  secundariosLibre: string;
  // Paso 4 (opcional)
  lugar: string; // un único chip seleccionado
  lugarLibre: string;
  // Paso 5 (opcional)
  objetos: string[]; // chips seleccionados
  objetosLibre: string;
  // Paso 6
  tema: string; // texto completo del tema (preset o libre)
  estilo: EstiloId | null;
}

export const formDataInicial: FormData = {
  edad: null,
  nombre: "",
  fotoNombre: null,
  secundarios: [],
  secundariosLibre: "",
  lugar: "",
  lugarLibre: "",
  objetos: [],
  objetosLibre: "",
  tema: "",
  estilo: null,
};

// Una parte del cuento ya parseada a partir del formato [PARTE X: título].
export interface ParteCuento {
  titulo: string;
  texto: string;
}

export interface CuentoParseado {
  partes: ParteCuento[];
  aprendimos: string; // contenido de [LO QUE APRENDIMOS HOY]
}

// Payload que se envía a /api/generate (subconjunto serializable del FormData).
export type GenerarCuentoRequest = FormData;

export interface GenerarCuentoResponse {
  cuento: string;
}

export interface ErrorResponse {
  error: string;
}

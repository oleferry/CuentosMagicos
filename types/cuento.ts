// Tipos del formulario y del cuento generado.

export type Edad = 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

// Clave de cada estilo de ilustración (afecta al prompt de imágenes en fase 2).
export type EstiloId = "disney" | "comic" | "manga" | "acuarela";

// "aprender": lo lee el niño (frases muy cortas). "escuchar": se lo lee un adulto.
export type ModoLectura = "aprender" | "escuchar";

// Solo en modo "aprender": 1 primeras sílabas, 2 más letras, 3 ya lee frases (ver lib/niveles.ts).
export type NivelLectura = 1 | 2 | 3;

export interface FormData {
  // Paso 1
  edad: Edad | null;
  modoLectura: ModoLectura;
  nivelLectura: NivelLectura;
  // Paso 2
  nombre: string;
  foto: string | null; // foto reducida (data URL JPEG); solo familia, nunca se guarda
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
  valor: string; // mensaje/valor del cuento (preset o libre); "" = lo elige la historia
  estilo: EstiloId | null;
}

export const formDataInicial: FormData = {
  edad: null,
  modoLectura: "aprender",
  nivelLectura: 2,
  nombre: "",
  foto: null,
  secundarios: [],
  secundariosLibre: "",
  lugar: "",
  lugarLibre: "",
  objetos: [],
  objetosLibre: "",
  tema: "",
  valor: "",
  estilo: null,
};

// Una parte del cuento ya parseada a partir del formato [PARTE X: título].
export interface ParteCuento {
  titulo: string;
  texto: string;
}

export interface CuentoParseado {
  titulo?: string; // contenido de [TÍTULO: ...] (si el modelo lo incluye)
  personajes?: string; // aspecto físico de los personajes, para ilustraciones coherentes
  partes: ParteCuento[];
  aprendimos: string; // contenido de [LO QUE APRENDIMOS HOY]
  palabras?: string[]; // palabras del cuento para la ficha de caligrafía (modo aprender)
  frase?: string; // frase corta del cuento para la ficha de caligrafía
}

// Payload que se envía a /api/generate (subconjunto serializable del FormData).
export type GenerarCuentoRequest = FormData;

export interface GenerarCuentoResponse {
  cuento: string;
  cuentoId: string; // autoriza las ilustraciones de este cuento
}

export interface ErrorResponse {
  error: string;
}

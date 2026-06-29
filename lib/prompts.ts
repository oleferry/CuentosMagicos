import type {
  CuentoParseado,
  Edad,
  EstiloId,
  FormData,
  ParteCuento,
} from "@/types/cuento";

// --- Opciones del formulario (compartidas entre los pasos y el prompt) ---

export const EDADES: Edad[] = [3, 4, 5, 6, 7, 8, 9, 10];

export const SECUNDARIOS_OPCIONES: string[] = [
  "Hermano/a",
  "Mejor amigo/a",
  "Perro",
  "Gato",
  "Dragón mágico",
  "Robot",
  "Hada",
  "Abuela/o",
];

export const LUGARES_OPCIONES: string[] = [
  "Bosque encantado",
  "Fondo del mar",
  "Espacio exterior",
  "Castillo medieval",
  "Selva tropical",
  "Ciudad futurista",
  "Montañas nevadas",
  "Volcán",
];

export const OBJETOS_OPCIONES: string[] = [
  "Varita mágica",
  "Capa invisible",
  "Mapa del tesoro",
  "Botas voladoras",
  "Cohete espacial",
  "Libro mágico",
  "Submarino",
  "Gafas especiales",
  "Sombrero parlante",
];

export interface TemaPreset {
  emoji: string;
  etiqueta: string; // lo que ve el usuario en el chip
  tema: string; // texto completo que se manda al prompt
}

export const TEMAS_PRESET: TemaPreset[] = [
  { emoji: "🦕", etiqueta: "Dinosaurios", tema: "Los dinosaurios y la prehistoria" },
  { emoji: "🪐", etiqueta: "Sistema solar", tema: "El sistema solar y los planetas" },
  { emoji: "🐠", etiqueta: "Fondo marino", tema: "Los animales del fondo marino" },
  { emoji: "🚀", etiqueta: "Cohetes", tema: "Cómo funcionan los cohetes espaciales" },
  { emoji: "❤️", etiqueta: "Cuerpo humano", tema: "El cuerpo humano y la salud" },
  { emoji: "🌋", etiqueta: "Volcanes", tema: "Los volcanes y la geología" },
  { emoji: "🌱", etiqueta: "Las plantas", tema: "Cómo crecen las plantas y las flores" },
  { emoji: "🐛", etiqueta: "Insectos", tema: "Los insectos y su mundo" },
];

export interface EstiloOpcion {
  id: EstiloId;
  emoji: string;
  nombre: string;
  descripcion: string; // se usa en el prompt (y en fase 2 para GPT Image)
}

export const ESTILOS: EstiloOpcion[] = [
  {
    id: "disney",
    emoji: "⭐",
    nombre: "Disney",
    descripcion: "colores vibrantes, personajes expresivos, fondos mágicos",
  },
  {
    id: "comic",
    emoji: "💥",
    nombre: "Cómic",
    descripcion: "líneas gruesas, colores planos, efectos de acción",
  },
  {
    id: "manga",
    emoji: "👁",
    nombre: "Manga",
    descripcion: "líneas finas, ojos grandes, aspecto anime",
  },
  {
    id: "acuarela",
    emoji: "🎨",
    nombre: "Acuarela",
    descripcion: "colores pastel difuminados, aspecto handmade",
  },
];

// --- Lógica de nivel de lenguaje por edad ---

export function nivelPorEdad(edad: Edad): string {
  if (edad <= 4) {
    return "muy sencillo: frases de 5-7 palabras, vocabulario básico, 300-400 palabras totales";
  }
  if (edad <= 6) {
    return "sencillo: frases cortas, vocabulario cotidiano, 500-640 palabras totales";
  }
  if (edad <= 8) {
    return "fluido: frases medias, algo de vocabulario nuevo, 760-900 palabras totales";
  }
  return "rico: frases variadas, metáforas simples, vocabulario amplio, 960-1120 palabras totales";
}

export function descripcionEstilo(id: EstiloId | null): string {
  const estilo = ESTILOS.find((e) => e.id === id);
  return estilo ? estilo.descripcion : ESTILOS[0].descripcion;
}

// Combina chips seleccionados + input libre en una lista legible, o "" si no hay nada.
function combinar(seleccionados: string[], libre: string): string {
  const partes = [...seleccionados];
  const libreLimpio = libre.trim();
  if (libreLimpio) partes.push(libreLimpio);
  return partes.join(", ");
}

// --- Construcción del prompt ---

export const SYSTEM_PROMPT =
  "Eres un escritor experto en cuentos infantiles educativos en español.";

export function construirPrompt(form: FormData): string {
  const edad = form.edad ?? 6;
  const nivel = nivelPorEdad(edad as Edad);
  const estilo = descripcionEstilo(form.estilo);

  const acompanantes = combinar(form.secundarios, form.secundariosLibre);
  const lugar = combinar(form.lugar ? [form.lugar] : [], form.lugarLibre);
  const objetos = combinar(form.objetos, form.objetosLibre);

  const lineas: string[] = [
    "Escribe un cuento EDUCATIVO personalizado:",
    "",
    `PROTAGONISTA: ${form.nombre || "el niño/a"}, ${edad} años`,
  ];

  if (acompanantes) lineas.push(`ACOMPAÑANTES: ${acompanantes}`);
  if (lugar) lineas.push(`LUGAR: ${lugar}`);
  if (objetos) lineas.push(`OBJETOS ESPECIALES: ${objetos}`);

  lineas.push(
    `TEMA EDUCATIVO: ${form.tema || "un tema educativo apropiado para su edad"}`,
    `NIVEL: ${nivel}`,
    `ESTILO VISUAL: ${estilo}`,
    "",
    "USA EXACTAMENTE esta estructura:",
    "[PARTE 1: título]",
    "texto...",
    "[PARTE 2: título]",
    "texto...",
    "[PARTE 3: título]",
    "texto...",
    "[PARTE 4: título]",
    "texto...",
    "[LO QUE APRENDIMOS HOY]",
    "resumen educativo",
    "",
    "IMPORTANTE:",
    "- Integra mínimo 3 datos reales y verificables sobre el tema",
    "- Usa el nombre del protagonista frecuentemente",
    "- Si se indican nombres de acompañantes, úsalos a menudo en la historia",
    "- Cada parte debe ser extensa y detallada; respeta el número total de palabras indicado en NIVEL",
    "- Final feliz con aprendizaje claro",
    "- Adapta el lenguaje exactamente al nivel indicado",
  );

  return lineas.join("\n");
}

// --- Prompt para generar la ilustración de una parte (fase 2) ---

export function construirPromptImagen(
  titulo: string,
  texto: string,
  nombre: string,
  estilo: EstiloId | null,
): string {
  const desc = descripcionEstilo(estilo);
  // Resumimos la escena para no mandar un prompt gigante al modelo de imagen.
  const escena = texto.replace(/\s+/g, " ").trim().slice(0, 320);
  return [
    `Ilustración de libro infantil profesional, de alta calidad y muy detallada, en estilo ${desc}.`,
    "Una sola escena clara y bien compuesta, con personajes expresivos y entrañables, colores armoniosos e iluminación suave y cálida.",
    `Protagonista: ${nombre || "un niño o niña"}.`,
    `Escena que ilustrar: ${titulo}. ${escena}`,
    "Imagen alegre y apropiada para niños pequeños. Sin texto, sin letras ni palabras dentro de la imagen.",
  ].join(" ");
}

// --- Parseo del cuento generado ---

// Convierte el texto con formato [PARTE X: título] ... [LO QUE APRENDIMOS HOY] ...
// en una estructura tipada. Es tolerante a pequeñas variaciones del modelo.
export function parsearCuento(texto: string): CuentoParseado {
  const partes: ParteCuento[] = [];
  let aprendimos = "";

  // Captura cada bloque [ENCABEZADO] seguido de su contenido hasta el siguiente [.
  const regex = /\[([^\]]+)\]([\s\S]*?)(?=\n?\[[^\]]+\]|$)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(texto)) !== null) {
    const encabezado = match[1].trim();
    const contenido = match[2].trim();

    if (/lo que aprendimos/i.test(encabezado)) {
      aprendimos = contenido;
      continue;
    }

    // Encabezado tipo "PARTE 1: El gran viaje" -> título = "El gran viaje".
    const dosPuntos = encabezado.indexOf(":");
    const titulo =
      dosPuntos >= 0 ? encabezado.slice(dosPuntos + 1).trim() : encabezado;

    if (contenido) {
      partes.push({ titulo: titulo || encabezado, texto: contenido });
    }
  }

  // Fallback: si no se detectó ningún bloque, mostramos el texto entero como una parte.
  if (partes.length === 0 && !aprendimos) {
    partes.push({ titulo: "El cuento", texto: texto.trim() });
  }

  return { partes, aprendimos };
}

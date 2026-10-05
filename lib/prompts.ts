import { nivelInfo } from "@/lib/niveles";
import { letraInfo } from "@/lib/letras";
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

export interface ValorPreset {
  emoji: string;
  etiqueta: string; // lo que ve el usuario en el chip
  valor: string; // texto que se manda al prompt
}

// Mensaje o valor que deja el cuento (opcional: si no se elige, lo decide la historia).
export const VALORES_PRESET: ValorPreset[] = [
  { emoji: "🤝", etiqueta: "Amistad", valor: "La amistad" },
  { emoji: "🦁", etiqueta: "Valentía", valor: "La valentía: dar un paso aunque tengas miedo" },
  { emoji: "💛", etiqueta: "Empatía", valor: "La empatía: ponerse en el lugar del otro" },
  { emoji: "💪", etiqueta: "Esfuerzo", valor: "El esfuerzo y no rendirse" },
  { emoji: "🌱", etiqueta: "Aprender de los errores", valor: "Equivocarse es parte de aprender" },
  { emoji: "🍪", etiqueta: "Compartir", valor: "Compartir con los demás" },
  { emoji: "🌍", etiqueta: "Cuidar la naturaleza", valor: "Cuidar la naturaleza y los animales" },
  { emoji: "⏳", etiqueta: "Paciencia", valor: "La paciencia" },
  { emoji: "🌟", etiqueta: "Confiar en ti", valor: "La confianza en uno mismo" },
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
  "Eres un escritor de literatura infantil en español. Escribes historias de verdad: " +
  "un solo hilo argumental, un protagonista que quiere algo y una trama en la que cada " +
  "escena es consecuencia de la anterior. Los datos educativos y el mensaje forman parte " +
  "de la aventura; nunca van sueltos.";

// Reglas para que el cuento sea UNA historia y no escenas sueltas (ambos modos).
const REGLAS_HILO = [
  "- Es UNA SOLA historia: el protagonista quiere o necesita algo desde la parte 1, y eso se resuelve en la parte 4",
  "- Cada parte empieza justo donde terminó la anterior y hace avanzar la acción (usa enlaces como «Entonces», «Al día siguiente», «De repente», «Por eso»). Nunca empieces una parte como si fuera otro cuento",
  "- Las partes 1, 2 y 3 terminan con algo que da ganas de seguir leyendo",
  "- Los acompañantes y los objetos especiales tienen un papel en la trama: ayudan, se equivocan o son la clave para avanzar (no se limitan a aparecer)",
  "- Los datos reales del tema son parte de la aventura: los personajes los descubren, los necesitan o los usan para avanzar. Nunca como lista ni como lección suelta",
  "- Mantén los mismos personajes, el mismo lugar principal y el mismo objetivo durante todo el cuento",
];

// Preguntas para hablar del cuento al terminar (lectura dialógica), de más
// fácil a más difícil: recordar, inferir causas y emociones, y conectar con su
// vida (van Kleeck 2008; Blewitt et al. 2009). Ver /en-que-nos-basamos.
const REGLA_PREGUNTAS =
  "- En [PREGUNTAS] escribe 4 preguntas cortas (de 12 palabras como mucho), una por línea, de más fácil a más difícil, para hablar del cuento al terminar: " +
  "1) RECORDAR: algo que pasa en el cuento (quién, qué o dónde); " +
  "2) POR QUÉ: la causa de algo importante de la historia, cuya respuesta no esté escrita tal cual; " +
  "3) SENTIR: cómo se siente un personaje en un momento clave y por qué; " +
  "4) CONECTAR: relaciona el cuento con la vida del niño (¿Te ha pasado a ti...?, ¿Y tú qué harías...?). Sin numerar y sin respuestas";

export function construirPrompt(
  form: FormData,
  aspectoProtagonista?: string | null, // rasgos sacados de su foto (solo familia)
): string {
  const aspecto = (aspectoProtagonista ?? "").trim();
  const edad = form.edad ?? 6;
  const aprender = form.modoLectura === "aprender";
  const nivelLectura = form.nivelLectura ?? 3;
  // Modo aprender: niño que está aprendiendo a leer (en letra ligada), según su nivel.
  const nivel = aprender
    ? `NIÑO QUE ESTÁ APRENDIENDO A LEER. ${nivelInfo(nivelLectura).prompt}. ` +
      "Agrupa las frases en párrafos breves de 2 o 3 frases (NO pongas cada frase en una línea distinta)"
    : nivelPorEdad(edad as Edad);
  const estilo = descripcionEstilo(form.estilo);

  const acompanantes = combinar(form.secundarios, form.secundariosLibre);
  const lugar = combinar(form.lugar ? [form.lugar] : [], form.lugarLibre);
  const objetos = combinar(form.objetos, form.objetosLibre);
  const valor = (form.valor ?? "").trim();
  const letra = aprender ? letraInfo(form.letra) : null;

  const lineas: string[] = [
    "Escribe un cuento EDUCATIVO personalizado:",
    "",
    `PROTAGONISTA: ${form.nombre || "el niño/a"}, ${edad} años`,
  ];

  if (aspecto) lineas.push(`ASPECTO DEL PROTAGONISTA (según su foto): ${aspecto}`);

  if (acompanantes) lineas.push(`ACOMPAÑANTES: ${acompanantes}`);
  if (lugar) lineas.push(`LUGAR: ${lugar}`);
  if (objetos) lineas.push(`OBJETOS ESPECIALES: ${objetos}`);

  lineas.push(
    `TEMA EDUCATIVO: ${form.tema || "un tema educativo apropiado para su edad"}`,
    ...(valor ? [`MENSAJE O VALOR: ${valor}`] : []),
    `NIVEL: ${nivel}`,
    ...(letra
      ? [
          `LETRA PROTAGONISTA: «${letra.muestra}» (${letra.descripcion}). El cuento sirve para practicarla: ` +
            "usa entre 10 y 15 palabras que la contengan, repartidas por las 4 partes y varias de ellas EMPEZANDO por esa letra; " +
            "haz que algún personaje, objeto o lugar importante la lleve en su nombre. Esas palabras también deben cumplir el NIVEL. " +
            "El resto del cuento sigue usando las demás letras del nivel, para repasarlas",
        ]
      : []),
    `ESTILO VISUAL: ${estilo}`,
    "",
    "PASO 1. En [PLAN] planifica la historia en 6 líneas cortas con esta espina dorsal (el lector no verá el plan):",
    "Érase una vez: quién es el protagonista y qué desea",
    "Un día: qué ocurre que pone en marcha la aventura",
    "Por eso: qué hacen y qué descubren sobre el tema",
    "Pero: qué dificultad o error aparece y cómo se siente el protagonista",
    "Hasta que: el momento decisivo, en el que el protagonista elige qué hacer (aquí se ve el mensaje)",
    "Y desde entonces: cómo termina y qué ha cambiado en él",
    "",
    "PASO 2. En [PERSONAJES] describe en una sola línea el aspecto físico del protagonista y de los acompañantes (pelo, ropa, colores), para que todas las ilustraciones sean coherentes." +
      (aspecto
        ? " Para el protagonista copia fielmente los rasgos de ASPECTO DEL PROTAGONISTA (pelo, ojos, piel, gafas...) y añade solo la ropa."
        : ""),
    "",
    "PASO 3. Escribe el cuento contando ESA historia, con EXACTAMENTE esta estructura:",
    "[PLAN]",
    "las 6 líneas del plan",
    "[PERSONAJES]",
    "descripción física en una línea",
    "[TÍTULO: título del cuento]",
    "[PARTE 1: título corto de capítulo]",
    "planteamiento: quién es, qué desea y el suceso que lo cambia todo",
    "[PARTE 2: título corto de capítulo]",
    "la aventura avanza: lo intentan, descubren cosas del tema y aparece la dificultad",
    "[PARTE 3: título corto de capítulo]",
    "el momento más difícil y la decisión del protagonista",
    "[PARTE 4: título corto de capítulo]",
    "desenlace: lo consiguen (o algo mejor) y qué ha cambiado",
    "[LO QUE APRENDIMOS HOY]",
    "resumen educativo",
    "[PREGUNTAS]",
    "las 4 preguntas, una por línea",
    ...(aprender
      ? [
          "[PALABRAS PARA ESCRIBIR]",
          "4 palabras del cuento separadas por comas",
          "[FRASE PARA ESCRIBIR]",
          "una frase corta del cuento",
        ]
      : []),
    "",
    "IMPORTANTE (hilo conductor):",
    ...REGLAS_HILO,
    "",
    "IMPORTANTE:",
    "- El número de palabras indicado en NIVEL se refiere solo al cuento (de [PARTE 1] a [PARTE 4]); [PLAN] y [PERSONAJES] no cuentan",
    ...(aprender
      ? [
          valor
            ? `- El mensaje de fondo es «${valor}». Se demuestra con lo que decide y hace el protagonista en la parte 3, sin sermones`
            : "- Elige un mensaje de fondo que encaje con el tema y que un niño de 6 años entienda (amistad, valentía, empatía, esfuerzo, aprender de los errores...). Se demuestra con lo que decide y hace el protagonista en la parte 3, sin sermones",
          "- Muestra lo que siente el protagonista (ilusión, miedo, duda, alegría) con palabras sencillas",
          "- Integra 2 o 3 datos reales y verificables sobre el tema, explicados con sencillez",
          "- Usa el nombre del protagonista a menudo y, si se indican, los nombres de los acompañantes",
          "- Respeta el número de palabras, las frases cortas y las letras permitidas en NIVEL: es para que el niño lo lea solo",
          ...(nivelLectura < 3
            ? [
                "- Las letras permitidas en NIVEL valen también para el título y los títulos de las partes",
                "- Comprueba palabra por palabra que cada frase cumple el NIVEL; si una palabra no cumple, cámbiala por otra que sí",
              ]
            : []),
          "- En [LO QUE APRENDIMOS HOY] escribe 3 frases cortas: los datos aprendidos y el mensaje del cuento",
          REGLA_PREGUNTAS + ". Usa palabras sencillas que el niño pueda leer",
          "- En [PALABRAS PARA ESCRIBIR] elige 4 palabras del cuento para practicar la escritura: sustantivos o verbos de 4 a 7 letras, que cumplan el NIVEL, sin nombres propios" +
            (letra ? `, y que contengan «${letra.muestra}»` : ""),
          "- En [FRASE PARA ESCRIBIR] copia una frase del cuento de 3 a 5 palabras (28 letras como mucho) que cumpla el NIVEL y termine en punto",
          "- Final feliz",
        ]
      : [
          "- Integra mínimo 3 datos reales y verificables sobre el tema",
          valor
            ? `- Transmite el valor «${valor}» a través de lo que decide y hace el protagonista, sin sermones`
            : "- La historia deja un mensaje positivo que se entiende por lo que pasa, sin sermones",
          "- Usa el nombre del protagonista frecuentemente y, si se indican, los nombres de los acompañantes",
          "- Cada parte debe ser extensa y detallada; respeta el número total de palabras indicado en NIVEL",
          "- Final feliz con aprendizaje claro",
          REGLA_PREGUNTAS,
          "- Adapta el lenguaje exactamente al nivel indicado",
        ]),
  );

  return lineas.join("\n");
}

// --- Prompt para generar la ilustración de una parte (fase 2) ---

export function construirPromptImagen(
  titulo: string,
  texto: string,
  nombre: string,
  estilo: EstiloId | null,
  personajes?: string,
): string {
  const desc = descripcionEstilo(estilo);
  // Mismo aspecto de los personajes en todas las ilustraciones del cuento.
  const aspecto = (personajes ?? "").replace(/\s+/g, " ").trim().slice(0, 300);
  // Resumimos la escena para no mandar un prompt gigante al modelo de imagen.
  const escena = texto.replace(/\s+/g, " ").trim().slice(0, 240);
  return [
    `Ilustración sencilla para un libro de primeros lectores, inspirada en el estilo ${desc}.`,
    "Formas simples y redondeadas, pocos elementos, colores planos y alegres, contornos limpios y fondo despejado.",
    `Protagonista: ${nombre || "un niño o niña"}.`,
    ...(aspecto ? [`Personajes (mantén siempre este mismo aspecto): ${aspecto}`] : []),
    `Escena: ${titulo}. ${escena}`,
    "Apropiada para niños pequeños. Sin texto, sin letras ni palabras dentro de la imagen.",
  ].join(" ");
}

// --- Parseo del cuento generado ---

// Convierte el texto con formato [PARTE X: título] ... [LO QUE APRENDIMOS HOY] ...
// en una estructura tipada. Es tolerante a pequeñas variaciones del modelo.
export function parsearCuento(texto: string): CuentoParseado {
  const partes: ParteCuento[] = [];
  let aprendimos = "";
  let tituloCuento: string | undefined;
  let personajes: string | undefined;
  let palabras: string[] | undefined;
  let frase: string | undefined;
  let preguntas: string[] | undefined;

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

    // [PLAN] es solo para que la IA organice la historia: no se muestra.
    if (/^plan\b/i.test(encabezado)) continue;

    // [PERSONAJES] describe su aspecto para que las ilustraciones sean coherentes.
    if (/^personajes\b/i.test(encabezado)) {
      personajes = contenido || undefined;
      continue;
    }

    // Material para la ficha de caligrafía (modo aprender).
    if (/^palabras\b/i.test(encabezado)) {
      palabras = contenido
        .split(/[,\n]+/)
        .map((p) => p.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, "").toLowerCase())
        .filter((p) => p.length >= 2 && p.length <= 10)
        .slice(0, 4);
      continue;
    }
    if (/^preguntas?\b/i.test(encabezado)) {
      preguntas = contenido
        .split("\n")
        .map((p) => p.replace(/^\s*(?:\d+[.)]|[-•*])\s*/, "").trim())
        .filter((p) => p.length > 3)
        .slice(0, 4);
      continue;
    }
    if (/^frase\b/i.test(encabezado)) {
      frase = contenido.split("\n")[0].replace(/^[-•*"«\s]+|["»\s]+$/g, "").slice(0, 40) || undefined;
      continue;
    }

    // Encabezado tipo "PARTE 1: El gran viaje" -> título = "El gran viaje".
    const dosPuntos = encabezado.indexOf(":");
    const titulo =
      dosPuntos >= 0 ? encabezado.slice(dosPuntos + 1).trim() : encabezado;

    // [TÍTULO: ...] es el título del cuento, no una parte.
    if (/^t[ií]tulo\b/i.test(encabezado)) {
      tituloCuento = (dosPuntos >= 0 ? titulo : contenido) || undefined;
      continue;
    }

    if (contenido) {
      partes.push({ titulo: titulo || encabezado, texto: contenido });
    }
  }

  // Fallback: si no se detectó ningún bloque, mostramos el texto entero como una parte.
  if (partes.length === 0 && !aprendimos) {
    partes.push({ titulo: "El cuento", texto: texto.trim() });
  }

  return { titulo: tituloCuento, personajes, partes, aprendimos, palabras, frase, preguntas };
}

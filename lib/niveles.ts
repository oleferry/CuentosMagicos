// Niveles de lectura del modo "Aprender a leer", siguiendo el orden del método
// silábico del cole: primero sílabas directas con pocas letras, luego más letras
// y por último sílabas trabadas (bra, cla...) y grupos como que/qui o gue/gui.
// Se usa en el prompt (qué palabras puede usar la IA) y para comprobar el resultado.

import type { NivelLectura } from "@/types/cuento";

export interface NivelInfo {
  id: NivelLectura;
  emoji: string;
  titulo: string;
  texto: string; // lo que ve el usuario
  prompt: string; // instrucciones de vocabulario y longitud para la IA
}

// Palabras muy frecuentes que se enseñan "de vista" y se permiten en los niveles 1 y 2.
export const PALABRAS_DE_VISTA = ["con", "que", "por", "para", "muy", "hay", "quiere", "quien", "aqui"];

export const NIVELES: NivelInfo[] = [
  {
    id: 1,
    emoji: "🌱",
    titulo: "Primeras sílabas",
    texto: "Solo m, p, l, s, t, d, n y vocales",
    prompt:
      "NIVEL 1 · PRIMERAS SÍLABAS (el niño solo conoce las vocales y las letras m, p, l, s, t, d, n). " +
      "Usa SOLO palabras formadas con las letras a, e, i, o, u, m, p, l, s, t, d, n (e «y» como conjunción): " +
      "sílabas directas (ma, pe, li, so, tu, na, de) y las inversas sencillas (el, en, un, al, es, las, los). " +
      "Ejemplos válidos: mamá, papá, pato, mono, sol, luna, mesa, dedo, nido, pelota, maleta, pino, isla, sopa, tomate, linda, salta, mete, tapa, nada. " +
      `Además puedes usar estas palabras de vista: ${PALABRAS_DE_VISTA.join(", ")}. ` +
      "Quedan PROHIBIDAS las palabras con r, c, g, b, v, f, j, h, ñ, ll, ch, z, q, k, x, w y las sílabas trabadas (pla, bra...). " +
      "Los nombres propios de los personajes sí se pueden usar. Si una palabra del tema es imprescindible y no cumple, " +
      "usa como mucho 1 por parte o cámbiala por otra sencilla (por ejemplo «animal» o «lomo»). " +
      "Frases de 3 a 6 palabras. Palabras de 1 a 3 sílabas. Entre 30 y 45 palabras por parte (120-180 en total)",
  },
  {
    id: 2,
    emoji: "🌿",
    titulo: "Más letras",
    texto: "Casi todas las letras, sin «bra», «cla», «que», «gue»",
    prompt:
      "NIVEL 2 · MÁS LETRAS (el niño conoce casi todas las letras, pero aún no las sílabas difíciles). " +
      "Puedes usar sílabas directas con cualquier letra (ma, ra, rra, ba, va, fa, ca, co, cu, ga, go, gu, ja, ña, ha, lla, cha, ya, za) " +
      "y sílabas inversas (al, es, in, or, an, ar). " +
      "Quedan PROHIBIDAS las sílabas trabadas (bra, bla, cra, cla, dra, fra, fla, gra, gla, pra, pla, tra, tla...), " +
      "y los grupos que, qui, gue, gui, güe, güi, ce, ci, ge, gi, y las letras k, x, w. " +
      `Excepción: estas palabras de vista sí se pueden usar: ${PALABRAS_DE_VISTA.join(", ")}. ` +
      "Por ejemplo: «dragón», «planeta» o «cielo» NO valen; «mono», «cohete», «luna», «tortuga», «dinosaurio», «volcán» SÍ valen. " +
      "Los nombres propios de los personajes sí se pueden usar. Si una palabra del tema es imprescindible y no cumple, " +
      "usa como mucho 1 por parte. Frases de 4 a 8 palabras. Entre 40 y 55 palabras por parte (160-220 en total)",
  },
  {
    id: 3,
    emoji: "🌳",
    titulo: "Ya leo frases",
    texto: "Todas las letras, frases cortas",
    prompt:
      "NIVEL 3 · YA LEE FRASES (conoce todas las letras y sílabas, incluidas las trabadas). " +
      "Frases claras y cortas (de 4 a 10 palabras), vocabulario sencillo y cotidiano, sin palabras rebuscadas ni muy largas. " +
      "Entre 55 y 75 palabras por parte (220-300 en total)",
  },
];

export function nivelInfo(nivel: NivelLectura | undefined | null): NivelInfo {
  return NIVELES.find((n) => n.id === nivel) ?? NIVELES[2];
}

// --- Comprobación del texto generado ---

function sinTildes(palabra: string): string {
  return palabra
    .replace(/[áà]/g, "a")
    .replace(/[éè]/g, "e")
    .replace(/[íì]/g, "i")
    .replace(/[óò]/g, "o")
    .replace(/[úùü]/g, "u");
}

const LETRAS_NIVEL_1 = /^[aeioumplstdny]+$/;
const TRABADA = /[bcdfgkpt][lr]/;
const GRUPOS_DIFICILES_2 = /(qu|gu[ei]|c[ei]|g[ei]|[kxw])/;

// ¿Puede leer esta palabra (en minúsculas y sin tildes) un niño del nivel indicado?
export function palabraEnNivel(palabra: string, nivel: NivelLectura): boolean {
  if (nivel >= 3) return true;
  const p = sinTildes(palabra.toLowerCase());
  if (PALABRAS_DE_VISTA.includes(p)) return true;
  if (nivel === 1) return LETRAS_NIVEL_1.test(p) && !TRABADA.test(p) && !p.includes("ll");
  return !TRABADA.test(p) && !GRUPOS_DIFICILES_2.test(p);
}

const LETRA = /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/;

// Palabras (sin repetir) del texto que no encajan en el nivel. Se ignoran los
// nombres propios: los indicados en `nombres` y cualquier palabra que aparezca
// con mayúscula en mitad de una frase.
export function palabrasFueraDeNivel(
  texto: string,
  nivel: NivelLectura,
  nombres: string[] = [],
): string[] {
  if (nivel >= 3) return [];
  const tokens = texto.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+|[.!?¡¿:\n«"—-]/g) ?? [];

  // Primera pasada: nombres propios (con mayúscula y sin empezar frase).
  const propios = new Set(
    nombres.flatMap((n) => n.toLowerCase().split(/[^a-záéíóúüñ]+/)).filter(Boolean),
  );
  let inicioFrase = true;
  for (const t of tokens) {
    if (!LETRA.test(t)) {
      inicioFrase = true;
      continue;
    }
    if (!inicioFrase && /^[A-ZÁÉÍÓÚÑ]/.test(t)) propios.add(t.toLowerCase());
    inicioFrase = false;
  }

  const fuera = new Set<string>();
  for (const t of tokens) {
    if (!LETRA.test(t)) continue;
    const p = t.toLowerCase();
    if (!propios.has(p) && !palabraEnNivel(p, nivel)) fuera.add(p);
  }
  return Array.from(fuera);
}

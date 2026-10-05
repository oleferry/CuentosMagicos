// "Letra protagonista" del modo Aprender a leer: cada cuento puede reforzar una
// letra o sílaba concreta, como hacen las cartillas del cole (una lección por letra).
// Se ofrecen solo las letras que el niño ya conoce según su nivel (ver lib/niveles.ts).

import type { NivelLectura } from "@/types/cuento";

export interface LetraInfo {
  id: string;
  muestra: string; // cómo se ve en el chip y en la ficha (p. ej. "m" o "ca co cu")
  nivel: NivelLectura; // nivel a partir del que se ofrece
  descripcion: string; // para el prompt
  // ¿Contiene esta palabra (minúsculas, sin tildes; la ñ se conserva) la letra o sílaba?
  contiene: (palabra: string) => boolean;
}

const tiene = (re: RegExp) => (p: string) => re.test(p);

export const LETRAS: LetraInfo[] = [
  { id: "m", muestra: "m", nivel: 1, descripcion: "la letra m (ma, me, mi, mo, mu)", contiene: tiene(/m/) },
  { id: "p", muestra: "p", nivel: 1, descripcion: "la letra p (pa, pe, pi, po, pu)", contiene: tiene(/p/) },
  { id: "l", muestra: "l", nivel: 1, descripcion: "la letra l (la, le, li, lo, lu), no la ll", contiene: (p) => /l/.test(p.replace(/ll/g, "")) },
  { id: "s", muestra: "s", nivel: 1, descripcion: "la letra s (sa, se, si, so, su)", contiene: tiene(/s/) },
  { id: "t", muestra: "t", nivel: 1, descripcion: "la letra t (ta, te, ti, to, tu)", contiene: tiene(/t/) },
  { id: "d", muestra: "d", nivel: 1, descripcion: "la letra d (da, de, di, do, du)", contiene: tiene(/d/) },
  { id: "n", muestra: "n", nivel: 1, descripcion: "la letra n (na, ne, ni, no, nu)", contiene: tiene(/n/) },
  { id: "r", muestra: "r", nivel: 2, descripcion: "la letra r, suave y fuerte (ra, re, ri, ro, ru, rr)", contiene: tiene(/r/) },
  { id: "b", muestra: "b", nivel: 2, descripcion: "la letra b (ba, be, bi, bo, bu)", contiene: tiene(/b/) },
  { id: "v", muestra: "v", nivel: 2, descripcion: "la letra v (va, ve, vi, vo, vu)", contiene: tiene(/v/) },
  { id: "f", muestra: "f", nivel: 2, descripcion: "la letra f (fa, fe, fi, fo, fu)", contiene: tiene(/f/) },
  { id: "c", muestra: "ca co cu", nivel: 2, descripcion: "las sílabas ca, co, cu", contiene: (p) => /c[aou]/.test(p.replace(/ch/g, "")) },
  { id: "g", muestra: "ga go gu", nivel: 2, descripcion: "las sílabas ga, go, gu (sonido suave)", contiene: tiene(/g[ao]|gu(?![ei])/) },
  { id: "j", muestra: "j", nivel: 2, descripcion: "la letra j (ja, je, ji, jo, ju)", contiene: tiene(/j/) },
  { id: "ñ", muestra: "ñ", nivel: 2, descripcion: "la letra ñ (ña, ñe, ñi, ño, ñu)", contiene: tiene(/ñ/) },
  { id: "h", muestra: "h", nivel: 2, descripcion: "la letra h, que no suena (ha, he, hi, ho, hu)", contiene: (p) => /h/.test(p.replace(/ch/g, "")) },
  { id: "ll", muestra: "ll", nivel: 2, descripcion: "la ll (lla, lle, lli, llo, llu)", contiene: tiene(/ll/) },
  { id: "ch", muestra: "ch", nivel: 2, descripcion: "la ch (cha, che, chi, cho, chu)", contiene: tiene(/ch/) },
  { id: "y", muestra: "y", nivel: 2, descripcion: "la letra y (ya, ye, yo, yu, y)", contiene: tiene(/y/) },
  { id: "z", muestra: "z", nivel: 2, descripcion: "la letra z (za, zo, zu)", contiene: tiene(/z/) },
  { id: "qu", muestra: "que qui", nivel: 3, descripcion: "las sílabas que, qui", contiene: tiene(/qu/) },
  { id: "gue", muestra: "gue gui", nivel: 3, descripcion: "las sílabas gue, gui", contiene: tiene(/gu[ei]/) },
  { id: "ce", muestra: "ce ci", nivel: 3, descripcion: "las sílabas ce, ci", contiene: tiene(/c[ei]/) },
  { id: "ge", muestra: "ge gi", nivel: 3, descripcion: "las sílabas ge, gi", contiene: tiene(/g[ei]/) },
  { id: "br", muestra: "br", nivel: 3, descripcion: "las sílabas trabadas con br (bra, bre, bri, bro, bru)", contiene: tiene(/br/) },
  { id: "pl", muestra: "pl", nivel: 3, descripcion: "las sílabas trabadas con pl (pla, ple, pli, plo, plu)", contiene: tiene(/pl/) },
  { id: "tr", muestra: "tr", nivel: 3, descripcion: "las sílabas trabadas con tr (tra, tre, tri, tro, tru)", contiene: tiene(/tr/) },
  { id: "cl", muestra: "cl", nivel: 3, descripcion: "las sílabas trabadas con cl (cla, cle, cli, clo, clu)", contiene: tiene(/cl/) },
];

export function letraInfo(id: string | undefined | null): LetraInfo | null {
  return LETRAS.find((l) => l.id === id) ?? null;
}

export function letrasHastaNivel(nivel: NivelLectura): LetraInfo[] {
  return LETRAS.filter((l) => l.nivel <= nivel);
}

// Texto para la ficha de caligrafía: "m M" para una letra, la muestra tal cual para sílabas.
export function muestraParaEscribir(letra: LetraInfo): string {
  return letra.muestra.length === 1 ? `${letra.muestra} ${letra.muestra.toUpperCase()}` : letra.muestra;
}

function normalizar(palabra: string): string {
  return palabra
    .toLowerCase()
    .replace(/[áà]/g, "a")
    .replace(/[éè]/g, "e")
    .replace(/[íì]/g, "i")
    .replace(/[óò]/g, "o")
    .replace(/[úùü]/g, "u");
}

export function palabraConLetra(palabra: string, letra: LetraInfo): boolean {
  return letra.contiene(normalizar(palabra));
}

// Juego "Busca la letra": cuántas veces aparecen en el texto palabras con la
// letra y cuáles son (sin repetir, en el orden en que salen).
export function buscarLetra(
  texto: string,
  letra: LetraInfo,
): { total: number; palabras: string[] } {
  const vistas = new Set<string>();
  let total = 0;
  for (const t of texto.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+/g) ?? []) {
    const p = t.toLowerCase();
    if (!palabraConLetra(p, letra)) continue;
    total++;
    vistas.add(p);
  }
  return { total, palabras: Array.from(vistas) };
}

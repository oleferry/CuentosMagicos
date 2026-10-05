// Material de la ficha de caligrafía: el nombre del niño, 4 palabras y una frase
// del cuento. Normalmente los elige la IA ([PALABRAS/FRASE PARA ESCRIBIR]); si
// faltan (o el cuento es de una versión anterior), se sacan del propio texto.

import { palabraEnNivel } from "@/lib/niveles";
import { muestraParaEscribir, palabraConLetra, type LetraInfo } from "@/lib/letras";
import type { CuentoParseado, NivelLectura } from "@/types/cuento";

export interface MaterialCaligrafia {
  palabras: string[];
  frase: string;
  letra?: string; // letra protagonista para escribir (p. ej. "m M")
}

const NUM_PALABRAS = 4;
const MAX_LETRAS_FRASE = 30;

// Palabras demasiado comunes para practicar (no aportan).
const COMUNES = new Set(
  (
    "para pero como este esta esto estos estas todo toda todos todas cuando donde " +
    "entonces desde hasta sobre entre ellos ellas tiene tienen tenia estaba estaban " +
    "habia hacia porque nunca siempre mucho mucha muchos muchas otro otra otros otras " +
    "algo nada aqui alli dijo dice ella ellos eran sido solo tambien ahora luego despues"
  ).split(" "),
);

function sinTildes(p: string): string {
  return p.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

const LETRAS_RE = /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+/g;

function textoDe(cuento: CuentoParseado): string {
  return cuento.partes.map((p) => p.texto).join(" ");
}

// Palabras que aparecen con mayúscula en mitad del texto: nombres propios.
function nombresPropios(texto: string): Set<string> {
  return new Set(
    (texto.match(/[^.!?¡¿\s]\s+([A-ZÁÉÍÓÚÑ][a-záéíóúüñ]+)/g) ?? []).map((m) =>
      m.trim().split(/\s+/).pop()!.toLowerCase(),
    ),
  );
}

function palabrasDelTexto(cuento: CuentoParseado, nivel: NivelLectura, propios: Set<string>): string[] {
  const cuenta = new Map<string, number>();
  for (const t of textoDe(cuento).match(LETRAS_RE) ?? []) {
    const p = t.toLowerCase();
    if (p.length < 4 || p.length > 7) continue;
    if (propios.has(p) || COMUNES.has(sinTildes(p))) continue;
    if (!palabraEnNivel(p, nivel)) continue;
    cuenta.set(p, (cuenta.get(p) ?? 0) + 1);
  }
  // Las más repetidas primero (en empate, la que sale antes).
  return Array.from(cuenta.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([p]) => p);
}

// ¿Puede escribirla un niño de este nivel? (los nombres propios siempre valen)
function fraseEnNivel(frase: string, nivel: NivelLectura, propios: Set<string>): boolean {
  return (frase.match(LETRAS_RE) ?? []).every(
    (t) => propios.has(t.toLowerCase()) || palabraEnNivel(t, nivel),
  );
}

function fraseDelTexto(cuento: CuentoParseado, nivel: NivelLectura, propios: Set<string>): string {
  const frases = cuento.partes
    .flatMap((p) => p.texto.match(/[^.!?]+[.!?]*/g) ?? [])
    .map((f) => f.replace(/[¡¿«»"—–-]/g, "").replace(/\s+/g, " ").trim());
  const buena = (f: string, exigirNivel: boolean) => {
    const n = f.split(" ").length;
    return (
      n >= 3 && n <= 6 && f.length <= MAX_LETRAS_FRASE && (!exigirNivel || fraseEnNivel(f, nivel, propios))
    );
  };
  const corta = frases.find((f) => buena(f, true)) ?? frases.find((f) => buena(f, false));
  if (corta) return corta;
  const primera = (frases[0] ?? "").split(" ").slice(0, 4).join(" ").replace(/[,.;:!?]+$/, "");
  return primera ? `${primera}.` : "";
}

export function materialCaligrafia(
  cuento: CuentoParseado,
  nivel: NivelLectura = 3,
  letra: LetraInfo | null = null,
): MaterialCaligrafia {
  const propios = nombresPropios(textoDe(cuento));
  // Las palabras que propone la IA, solo si son del nivel y no son nombres.
  const palabras = (cuento.palabras ?? [])
    .filter((p) => !propios.has(p) && palabraEnNivel(p, nivel))
    .slice(0, NUM_PALABRAS);
  // Si hay letra protagonista, primero las palabras que la contienen.
  const candidatas = palabrasDelTexto(cuento, nivel, propios);
  const ordenadas = letra
    ? [
        ...candidatas.filter((p) => palabraConLetra(p, letra)),
        ...candidatas.filter((p) => !palabraConLetra(p, letra)),
      ]
    : candidatas;
  for (const p of ordenadas) {
    if (palabras.length >= NUM_PALABRAS) break;
    if (!palabras.includes(p)) palabras.push(p);
  }
  const fraseIA = cuento.frase ?? "";
  const frase =
    fraseIA && fraseIA.length <= MAX_LETRAS_FRASE && fraseEnNivel(fraseIA, nivel, propios)
      ? fraseIA
      : fraseDelTexto(cuento, nivel, propios);
  return { palabras, frase, letra: letra ? muestraParaEscribir(letra) : undefined };
}

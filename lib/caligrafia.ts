// Material de la ficha de caligrafía: el nombre del niño, 4 palabras y una frase
// del cuento. Normalmente los elige la IA ([PALABRAS/FRASE PARA ESCRIBIR]); si
// faltan (o el cuento es de una versión anterior), se sacan del propio texto.

import { palabraEnNivel } from "@/lib/niveles";
import type { CuentoParseado, NivelLectura } from "@/types/cuento";

export interface MaterialCaligrafia {
  palabras: string[];
  frase: string;
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

function palabrasDelTexto(cuento: CuentoParseado, nivel: NivelLectura): string[] {
  const texto = cuento.partes.map((p) => p.texto).join(" ");
  const tokens = texto.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+/g) ?? [];
  // Palabras que aparecen con mayúscula en mitad del texto: nombres propios.
  const propios = new Set(
    (texto.match(/[^.!?¡¿\s]\s+([A-ZÁÉÍÓÚÑ][a-záéíóúüñ]+)/g) ?? []).map((m) =>
      m.trim().split(/\s+/).pop()!.toLowerCase(),
    ),
  );
  const cuenta = new Map<string, number>();
  for (const t of tokens) {
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

function fraseDelTexto(cuento: CuentoParseado): string {
  const frases = cuento.partes
    .flatMap((p) => p.texto.match(/[^.!?]+[.!?]*/g) ?? [])
    .map((f) => f.replace(/[¡¿«»"—–-]/g, "").replace(/\s+/g, " ").trim());
  const corta = frases.find((f) => {
    const n = f.split(" ").length;
    return n >= 3 && n <= 6 && f.length <= MAX_LETRAS_FRASE;
  });
  if (corta) return corta;
  const primera = (frases[0] ?? "").split(" ").slice(0, 4).join(" ").replace(/[,.;:!?]+$/, "");
  return primera ? `${primera}.` : "";
}

export function materialCaligrafia(
  cuento: CuentoParseado,
  nivel: NivelLectura = 3,
): MaterialCaligrafia {
  const palabras = (cuento.palabras ?? []).slice(0, NUM_PALABRAS);
  for (const p of palabrasDelTexto(cuento, nivel)) {
    if (palabras.length >= NUM_PALABRAS) break;
    if (!palabras.includes(p)) palabras.push(p);
  }
  const frase =
    cuento.frase && cuento.frase.length <= MAX_LETRAS_FRASE + 10 ? cuento.frase : fraseDelTexto(cuento);
  return { palabras, frase };
}

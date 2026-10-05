"use client";

import { useEffect, useState } from "react";
import type { MaterialCaligrafia } from "@/lib/caligrafia";

// Ficha de caligrafía en letra ligada (2 páginas del libro imprimible):
// cada palabra tiene un renglón de modelo (la primera en tinta y el resto
// en gris para repasar) y otro vacío para escribirla sola.

const TINTA = "#3a2c4d";
const REPASO = "#cdbfe0";
const MORADO = "#9B5DE5";

// Medidas de Playwrite ES respecto al tamaño de letra (medidas en el navegador).
const ALTURA_X = 0.45; // "a", "m"...
const ASCENDENTE = 0.7; // "l", "M"...
const DESCENDENTE = 0.21; // "g", "p"...
const ANCHO_LETRA = 0.5; // ancho medio por letra, con margen

const ANCHO = 130; // ancho útil de media hoja A4 apaisada (mm ≈ unidades del SVG)
const LETRA_MAX = 15;

// Ancho real del texto en la letra ligada (cuando la fuente ya ha cargado);
// mientras tanto, una estimación por número de letras.
function useAnchoTexto(texto: string, tamano: number): number {
  const [ancho, setAncho] = useState(texto.length * tamano * ANCHO_LETRA);
  useEffect(() => {
    let vivo = true;
    document.fonts.load(`${tamano}px "Playwrite ES"`, texto).then(() => {
      const ctx = document.createElement("canvas").getContext("2d");
      if (!ctx || !vivo) return;
      ctx.font = `${tamano}px "Playwrite ES"`;
      setAncho(ctx.measureText(texto).width);
    });
    return () => {
      vivo = false;
    };
  }, [texto, tamano]);
  return ancho;
}

interface RenglonProps {
  texto: string;
  tamano: number;
  ancho: number; // ancho del texto a ese tamaño
  vacio?: boolean;
}

function Renglon({ texto, tamano, ancho, vacio }: RenglonProps) {
  const f = tamano;
  const arriba = f * 0.06;
  const base = arriba + f * ASCENDENTE;
  const alto = base + f * DESCENDENTE + f * 0.04;
  const hueco = f * 0.8;
  const veces = vacio ? 0 : Math.max(1, Math.min(3, Math.floor((ANCHO + hueco) / (ancho + hueco))));

  const linea = (y: number, color: string, grosor: number, discontinua?: boolean) => (
    <line
      x1={0}
      x2={ANCHO}
      y1={y}
      y2={y}
      stroke={color}
      strokeWidth={grosor}
      strokeDasharray={discontinua ? "1.2 1" : undefined}
    />
  );

  return (
    <svg
      viewBox={`0 0 ${ANCHO} ${alto}`}
      style={{ width: "100%", display: "block", overflow: "visible" }}
      aria-hidden={vacio}
    >
      {linea(base - f * ASCENDENTE, "#ece5f5", 0.25)}
      {linea(base - f * ALTURA_X, "#d6c8ea", 0.3, true)}
      {linea(base, "#a99bbd", 0.4)}
      {linea(base + f * DESCENDENTE, "#ece5f5", 0.25)}
      {Array.from({ length: veces }, (_, i) => (
        <text
          key={i}
          x={1 + i * (ancho + hueco)}
          y={base}
          fontSize={f}
          fill={i === 0 ? TINTA : REPASO}
          style={{ fontFamily: '"Playwrite ES", cursive' }}
        >
          {texto}
        </text>
      ))}
    </svg>
  );
}

// Tamaño de referencia para medir; el ancho es proporcional al tamaño de letra.
const REFERENCIA = 10;

function Ejercicio({ texto }: { texto: string }) {
  const anchoRef = useAnchoTexto(texto, REFERENCIA);
  // Lo más grande posible (hasta LETRA_MAX) sin salirse del renglón.
  const tamano = Math.min(LETRA_MAX, (REFERENCIA * ANCHO * 0.95) / Math.max(anchoRef, 1));
  const ancho = (anchoRef * tamano) / REFERENCIA;
  return (
    <div style={{ marginBottom: "5mm" }}>
      <Renglon texto={texto} tamano={tamano} ancho={ancho} />
      <div style={{ height: "1.5mm" }} />
      <Renglon texto={texto} tamano={tamano} ancho={ancho} vacio />
    </div>
  );
}

function Cabecera({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: "13pt", fontWeight: 800, color: TINTA, margin: "0 0 5mm" }}>
      {children}
    </h2>
  );
}

// Ejercicios en orden: letra protagonista, nombre y palabras del cuento.
// Caben 4 en la primera página; el resto pasa a la segunda.
const POR_PAGINA = 4;

function ejercicios(nombre: string, ficha: MaterialCaligrafia): string[] {
  return [ficha.letra ?? "", nombre, ...ficha.palabras].filter(Boolean);
}

interface FichaProps {
  nombre: string;
  ficha: MaterialCaligrafia;
}

// Página 1: la letra de hoy, su nombre y palabras del cuento.
export function FichaRepasa({ nombre, ficha }: FichaProps) {
  return (
    <>
      <Cabecera>✏️ Repasa y escribe</Cabecera>
      {ejercicios(nombre, ficha)
        .slice(0, POR_PAGINA)
        .map((t) => (
          <Ejercicio key={t} texto={t} />
        ))}
    </>
  );
}

// Página 2: el resto de palabras, una frase del cuento y un recuadro para dibujar.
export function FichaEscribe({ nombre, ficha }: FichaProps) {
  return (
    <>
      <Cabecera>✏️ Ahora, una frase del cuento</Cabecera>
      {ejercicios(nombre, ficha)
        .slice(POR_PAGINA)
        .map((t) => (
          <Ejercicio key={t} texto={t} />
        ))}
      {ficha.frase && <Ejercicio texto={ficha.frase} />}
      <div
        style={{
          flex: 1,
          minHeight: "30mm",
          marginBottom: "4mm",
          border: `0.6mm dashed ${MORADO}`,
          borderRadius: "5mm",
          padding: "4mm",
          fontSize: "11pt",
          fontWeight: 700,
          color: MORADO,
        }}
      >
        🖍️ Dibuja lo que más te ha gustado del cuento
      </div>
    </>
  );
}

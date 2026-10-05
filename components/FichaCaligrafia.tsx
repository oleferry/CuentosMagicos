"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { MaterialCaligrafia } from "@/lib/caligrafia";

// Ficha de caligrafía (2 páginas del libro imprimible), en letra ligada o de
// imprenta. Cada palabra tiene un renglón de modelo (la primera en tinta para
// copiarla al lado y el resto en gris para repasar) y otro vacío para
// escribirla sin modelo: repasar, copiar y escribir solo.

const TINTA = "#3a2c4d";
const REPASO = "#cdbfe0";
const MORADO = "#9B5DE5";

// Medidas de cada letra respecto al tamaño de letra (medidas en el navegador).
interface Letra {
  familia: string;
  alturaX: number; // "a", "m"...
  ascendente: number; // "l", "M"...
  descendente: number; // "g", "p"...
  anchoLetra: number; // ancho medio por letra (estimación hasta poder medir)
}

const LIGADA: Letra = {
  familia: "Playwrite ES",
  alturaX: 0.45,
  ascendente: 0.7,
  descendente: 0.21,
  anchoLetra: 0.5,
};

const IMPRENTA: Letra = {
  familia: "Andika",
  alturaX: 0.5,
  ascendente: 0.78,
  descendente: 0.24,
  anchoLetra: 0.6,
};

const LetraFicha = createContext<Letra>(LIGADA);

const ANCHO = 130; // ancho útil de media hoja A4 apaisada (mm ≈ unidades del SVG)
const LETRA_MAX = 15;

// Ancho real del texto en la letra elegida (cuando la fuente ya ha cargado);
// mientras tanto, una estimación por número de letras.
function useAnchoTexto(texto: string, tamano: number): number {
  const letra = useContext(LetraFicha);
  const [ancho, setAncho] = useState(texto.length * tamano * letra.anchoLetra);
  useEffect(() => {
    let vivo = true;
    const fuente = `${tamano}px "${letra.familia}"`;
    document.fonts.load(fuente, texto).then(() => {
      const ctx = document.createElement("canvas").getContext("2d");
      if (!ctx || !vivo) return;
      ctx.font = fuente;
      setAncho(ctx.measureText(texto).width);
    });
    return () => {
      vivo = false;
    };
  }, [texto, tamano, letra]);
  return ancho;
}

interface RenglonProps {
  texto: string;
  tamano: number;
  ancho: number; // ancho del texto a ese tamaño
  vacio?: boolean;
}

function Renglon({ texto, tamano, ancho, vacio }: RenglonProps) {
  const letra = useContext(LetraFicha);
  const f = tamano;
  const arriba = f * 0.06;
  const base = arriba + f * letra.ascendente;
  const alto = base + f * letra.descendente + f * 0.04;
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
      {linea(base - f * letra.ascendente, "#ece5f5", 0.25)}
      {linea(base - f * letra.alturaX, "#d6c8ea", 0.3, true)}
      {linea(base, "#a99bbd", 0.4)}
      {linea(base + f * letra.descendente, "#ece5f5", 0.25)}
      {Array.from({ length: veces }, (_, i) => (
        <text
          key={i}
          x={1 + i * (ancho + hueco)}
          y={base}
          fontSize={f}
          fill={i === 0 ? TINTA : REPASO}
          style={{ fontFamily: `"${letra.familia}", sans-serif` }}
        >
          {texto}
        </text>
      ))}
    </svg>
  );
}

// Tamaño de referencia para medir; el ancho es proporcional al tamaño de letra.
const REFERENCIA = 10;

function Ejercicio({ texto, nota }: { texto: string; nota?: string }) {
  const anchoRef = useAnchoTexto(texto, REFERENCIA);
  // Lo más grande posible (hasta LETRA_MAX) sin salirse del renglón.
  const tamano = Math.min(LETRA_MAX, (REFERENCIA * ANCHO * 0.95) / Math.max(anchoRef, 1));
  const ancho = (anchoRef * tamano) / REFERENCIA;
  return (
    <div style={{ marginBottom: "5mm" }}>
      {nota && (
        <p style={{ fontSize: "9pt", color: "#7a6b8a", margin: "0 0 1mm" }}>{nota}</p>
      )}
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

interface FichaProps {
  nombre: string;
  ficha: MaterialCaligrafia;
  imprenta?: boolean; // letra de imprenta en vez de ligada
}

function ejercicios({ nombre, ficha, imprenta }: FichaProps) {
  const lista: { texto: string; nota?: string }[] = [];
  if (ficha.letra) {
    lista.push({
      texto: ficha.letra,
      // Lee en imprenta aunque escriba en ligada: se muestran las dos formas.
      nota: imprenta
        ? "La letra de hoy. ¿Cómo suena?"
        : `La letra de hoy. En los libros la verás así: ${ficha.letra}`,
    });
  }
  if (nombre) lista.push({ texto: nombre });
  for (const p of ficha.palabras) lista.push({ texto: p });
  return lista;
}

// Página 1: la letra de hoy, su nombre y palabras del cuento.
export function FichaRepasa(props: FichaProps) {
  return (
    <LetraFicha.Provider value={props.imprenta ? IMPRENTA : LIGADA}>
      <Cabecera>✏️ Repasa, copia y escribe</Cabecera>
      {ejercicios(props)
        .slice(0, POR_PAGINA)
        .map((e) => (
          <Ejercicio key={e.texto} texto={e.texto} nota={e.nota} />
        ))}
    </LetraFicha.Provider>
  );
}

// Página 2: el resto de palabras, una frase del cuento y un recuadro para dibujar.
export function FichaEscribe(props: FichaProps) {
  return (
    <LetraFicha.Provider value={props.imprenta ? IMPRENTA : LIGADA}>
      <Cabecera>✏️ Ahora, una frase del cuento</Cabecera>
      {ejercicios(props)
        .slice(POR_PAGINA)
        .map((e) => (
          <Ejercicio key={e.texto} texto={e.texto} nota={e.nota} />
        ))}
      {props.ficha.frase && <Ejercicio texto={props.ficha.frase} />}
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
    </LetraFicha.Provider>
  );
}

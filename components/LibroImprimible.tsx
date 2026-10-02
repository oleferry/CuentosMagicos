/* eslint-disable @next/next/no-img-element */
// Maqueta SOLO para imprimir / guardar en PDF (modo aprender a leer):
// A4 apaisado con dos páginas tipo libro por hoja.
// Portada + partes + "Lo que aprendimos" -> 6 páginas = 3 hojas (2 a doble cara).

import type { ParteCuento } from "@/types/cuento";

interface LibroImprimibleProps {
  titulo?: string;
  nombre: string;
  partes: ParteCuento[];
  aprendimos: string;
  imagenes: (string | null)[];
}

type Pagina =
  | { tipo: "portada" }
  | { tipo: "parte"; parte: ParteCuento; indice: number; numero: number }
  | { tipo: "aprendimos"; numero: number };

const TINTA = "#3a2c4d";
const MORADO = "#9B5DE5";

// Letra grande para primeros lectores; una parte de ~90 palabras cabe en media hoja A4.
const ESTILO_TEXTO: React.CSSProperties = {
  fontSize: "15pt",
  lineHeight: 1.75,
  color: TINTA,
  margin: "0 0 2.5mm",
};

function Imagen({ src, alto }: { src: string | null; alto: string }) {
  if (!src) {
    return (
      <div
        style={{
          height: alto,
          borderRadius: "4mm",
          background: "linear-gradient(135deg, #F5EEFF, #FFF9E6)",
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <img
      src={src}
      alt=""
      style={{
        height: alto,
        width: "100%",
        objectFit: "cover",
        borderRadius: "4mm",
        flexShrink: 0,
      }}
    />
  );
}

function NumeroPagina({ n }: { n: number }) {
  return (
    <div style={{ marginTop: "auto", textAlign: "center", fontSize: "9pt", color: "#7a6b8a" }}>
      {n}
    </div>
  );
}

// Si una parte viene más larga de lo pedido, se reduce la letra para que no se corte.
// (Medido: a 15pt caben ~88 palabras; la capacidad crece con el cuadrado del tamaño.)
function tamanoLetra(texto: string): string {
  const palabras = texto.split(/\s+/).filter(Boolean).length;
  if (palabras <= 85) return "15pt";
  if (palabras <= 105) return "13.5pt";
  if (palabras <= 130) return "12pt";
  return "11pt";
}

function Parrafos({ texto }: { texto: string }) {
  const fontSize = tamanoLetra(texto);
  return (
    <>
      {texto.split(/\n+/).map((p, i) => (
        <p key={i} className="font-ligada" style={{ ...ESTILO_TEXTO, fontSize }}>
          {p}
        </p>
      ))}
    </>
  );
}

function ContenidoPagina({
  pagina,
  props,
}: {
  pagina: Pagina;
  props: LibroImprimibleProps;
}) {
  if (pagina.tipo === "portada") {
    return (
      <div
        style={{
          height: "100%",
          border: `1.2mm solid ${MORADO}`,
          borderRadius: "6mm",
          padding: "8mm",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "5mm",
        }}
      >
        <div style={{ fontSize: "10pt", fontWeight: 800, color: MORADO }}>✨ CuentoMágico</div>
        <h1 className="font-ligada" style={{ fontSize: "24pt", lineHeight: 1.5, color: TINTA, margin: 0 }}>
          {props.titulo || `El cuento de ${props.nombre || "hoy"}`}
        </h1>
        <div style={{ width: "100%" }}>
          <Imagen src={props.imagenes[0] ?? null} alto="78mm" />
        </div>
        <p className="font-ligada" style={{ fontSize: "15pt", color: TINTA, margin: "auto 0 0" }}>
          Un cuento para {props.nombre || "ti"}
        </p>
      </div>
    );
  }

  if (pagina.tipo === "parte") {
    return (
      <>
        <h2
          className="font-ligada"
          style={{ fontSize: "17pt", lineHeight: 1.5, color: TINTA, margin: "0 0 3mm" }}
        >
          {pagina.parte.titulo}
        </h2>
        <Imagen src={props.imagenes[pagina.indice] ?? null} alto="62mm" />
        <div style={{ marginTop: "4mm" }}>
          <Parrafos texto={pagina.parte.texto} />
        </div>
        <NumeroPagina n={pagina.numero} />
      </>
    );
  }

  return (
    <>
      <div
        style={{
          background: "#FFF9E6",
          border: "0.6mm solid #FFD93D",
          borderRadius: "5mm",
          padding: "6mm",
        }}
      >
        <h2 style={{ fontSize: "13pt", fontWeight: 800, color: TINTA, margin: "0 0 3mm" }}>
          💡 Lo que aprendimos hoy
        </h2>
        <Parrafos texto={props.aprendimos} />
      </div>
      <p
        className="font-ligada"
        style={{ fontSize: "30pt", textAlign: "center", color: MORADO, margin: "14mm 0 0" }}
      >
        Fin
      </p>
      <p style={{ textAlign: "center", fontSize: "10pt", color: "#7a6b8a", margin: "4mm 0 0" }}>
        Un cuento mágico para {props.nombre || "ti"} 💛
      </p>
      <NumeroPagina n={pagina.numero} />
    </>
  );
}

export default function LibroImprimible(props: LibroImprimibleProps) {
  const paginas: Pagina[] = [{ tipo: "portada" }];
  props.partes.forEach((parte, indice) =>
    paginas.push({ tipo: "parte", parte, indice, numero: indice + 1 }),
  );
  if (props.aprendimos) {
    paginas.push({ tipo: "aprendimos", numero: props.partes.length + 1 });
  }

  // Agrupa de dos en dos: cada grupo es una hoja A4 apaisada.
  const hojas: Pagina[][] = [];
  for (let i = 0; i < paginas.length; i += 2) hojas.push(paginas.slice(i, i + 2));

  return (
    <div className="solo-impresion">
      <style>{"@page { size: A4 landscape; margin: 10mm; }"}</style>
      {hojas.map((hoja, h) => (
        <div key={h} className="cm-hoja">
          {hoja.map((pagina, p) => (
            <div key={p} className="cm-pagina">
              <ContenidoPagina pagina={pagina} props={props} />
            </div>
          ))}
          {hoja.length === 1 && <div className="cm-pagina" />}
        </div>
      ))}
    </div>
  );
}

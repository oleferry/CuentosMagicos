// Fondo de cuadrícula con cuadrados de colores que aparecen y desaparecen.
// Adaptado de "Hero Section with Animated Grid" (21st.dev) sin framer-motion.

const CELDA = 40;
const COLUMNAS = 26; // ancho fijo de 1040px, centrado en la sección

// Posiciones fijas (en celdas) para evitar diferencias entre servidor y cliente.
const CUADROS: [number, number, string][] = [
  [4, 2, "#FFD93D"],
  [8, 5, "#FF6B9D"],
  [13, 1, "#00BBF9"],
  [18, 4, "#9B5DE5"],
  [21, 8, "#00F5D4"],
  [3, 9, "#FF6B35"],
  [10, 11, "#FFD93D"],
  [16, 12, "#FF6B9D"],
  [6, 14, "#00BBF9"],
  [22, 13, "#9B5DE5"],
  [12, 7, "#FF6B35"],
  [19, 15, "#00F5D4"],
];

export default function FondoCuadricula() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 [mask-image:radial-gradient(480px_circle_at_center,white,transparent)]"
      style={{ width: COLUMNAS * CELDA }}
    >
      <svg className="h-full w-full">
        <defs>
          <pattern
            id="cm-cuadricula"
            width={CELDA}
            height={CELDA}
            patternUnits="userSpaceOnUse"
            x={-1}
            y={-1}
          >
            <path
              d={`M.5 ${CELDA}V.5H${CELDA}`}
              fill="none"
              stroke="#9B5DE5"
              strokeOpacity={0.14}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cm-cuadricula)" />
        {CUADROS.map(([x, y, color], i) => (
          <rect
            key={i}
            className="cm-cuadro"
            x={x * CELDA + 1}
            y={y * CELDA + 1}
            width={CELDA - 1}
            height={CELDA - 1}
            rx={6}
            fill={color}
            style={{ animationDelay: `${i * 0.55}s` }}
          />
        ))}
      </svg>
    </div>
  );
}

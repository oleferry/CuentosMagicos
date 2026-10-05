// Progresión automática del modo "Aprender a leer" (solo en el navegador).
// Por cada niño se guarda su nivel y los cuentos que ha leído con su letra y
// cómo le han ido ("¿Qué tal lo ha leído?"). Con eso se propone el siguiente
// cuento: el nivel (sube o baja según cómo le van) y la letra protagonista
// (la siguiente sin practicar, o repetir la que le costó).
// No se envía a ningún servidor: vive en localStorage de este dispositivo.

import { LETRAS, letraInfo } from "@/lib/letras";
import type { Edad, NivelLectura } from "@/types/cuento";

export type Valoracion = "facil" | "bien" | "costo";

export const VALORACIONES: { id: Valoracion; emoji: string; texto: string }[] = [
  { id: "facil", emoji: "😊", texto: "Fácil" },
  { id: "bien", emoji: "🙂", texto: "Bien" },
  { id: "costo", emoji: "😅", texto: "Le ha costado" },
];

export interface CuentoLeido {
  cuentoId: string;
  fecha: string; // ISO
  nivel: NivelLectura;
  letra: string; // id de la letra protagonista o ""
  valoracion?: Valoracion;
  noCuenta?: boolean; // la familia deshizo el cambio de nivel que provocó
}

export interface PerfilLector {
  nombre: string; // tal como lo escribió la familia
  edad: Edad | null;
  nivel: NivelLectura;
  cuentos: CuentoLeido[]; // del más antiguo al más reciente (máx. MAX_CUENTOS)
}

const CLAVE = "cuentomagico:progreso";
const MAX_CUENTOS = 40;
// Regla práctica: 2 cuentos seguidos fáciles -> sube; 2 seguidos que le costaron -> baja.
const SEGUIDOS_PARA_CAMBIAR = 2;

export function claveNino(nombre: string): string {
  return nombre
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function leerTodo(): Record<string, PerfilLector> {
  try {
    const raw = localStorage.getItem(CLAVE);
    const datos = raw ? JSON.parse(raw) : {};
    return datos && typeof datos === "object" ? datos : {};
  } catch {
    return {};
  }
}

function guardarTodo(perfiles: Record<string, PerfilLector>) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(perfiles));
  } catch {
    // sin almacenamiento: la web funciona igual, solo que no recuerda el progreso
  }
}

// Perfiles ordenados por el cuento más reciente.
export function listarPerfiles(): PerfilLector[] {
  const fecha = (p: PerfilLector) => p.cuentos[p.cuentos.length - 1]?.fecha ?? "";
  return Object.values(leerTodo()).sort((a, b) => fecha(b).localeCompare(fecha(a)));
}

export function leerPerfil(nombre: string): PerfilLector | null {
  return leerTodo()[claveNino(nombre)] ?? null;
}

export function borrarPerfil(nombre: string) {
  const todos = leerTodo();
  delete todos[claveNino(nombre)];
  guardarTodo(todos);
}

// Al crear un cuento en modo aprender: se apunta (sin valorar todavía).
export function registrarCuento(datos: {
  nombre: string;
  edad: Edad | null;
  nivel: NivelLectura;
  letra: string;
  cuentoId: string;
}) {
  const nombre = datos.nombre.trim();
  if (!nombre || !datos.cuentoId) return;
  const todos = leerTodo();
  const clave = claveNino(nombre);
  const perfil: PerfilLector = todos[clave] ?? {
    nombre,
    edad: datos.edad,
    nivel: datos.nivel,
    cuentos: [],
  };
  if (perfil.cuentos.some((c) => c.cuentoId === datos.cuentoId)) return;
  perfil.nombre = nombre;
  perfil.edad = datos.edad ?? perfil.edad;
  // La familia puede elegir otro nivel a mano: manda su elección.
  perfil.nivel = datos.nivel;
  perfil.cuentos = [
    ...perfil.cuentos,
    {
      cuentoId: datos.cuentoId,
      fecha: new Date().toISOString(),
      nivel: datos.nivel,
      letra: datos.letra,
    },
  ].slice(-MAX_CUENTOS);
  todos[clave] = perfil;
  guardarTodo(todos);
}

export interface CambioNivel {
  anterior: NivelLectura;
  nuevo: NivelLectura;
}

// Cuentos valorados del nivel actual, del más reciente al más antiguo.
function valoradosDelNivel(perfil: PerfilLector): CuentoLeido[] {
  return perfil.cuentos
    .filter((c) => c.valoracion && !c.noCuenta && c.nivel === perfil.nivel)
    .reverse();
}

function cambioQueToca(perfil: PerfilLector): NivelLectura | null {
  const ultimos = valoradosDelNivel(perfil).slice(0, SEGUIDOS_PARA_CAMBIAR);
  if (ultimos.length < SEGUIDOS_PARA_CAMBIAR) return null;
  if (perfil.nivel < 3 && ultimos.every((c) => c.valoracion === "facil")) {
    return (perfil.nivel + 1) as NivelLectura;
  }
  if (perfil.nivel > 1 && ultimos.every((c) => c.valoracion === "costo")) {
    return (perfil.nivel - 1) as NivelLectura;
  }
  return null;
}

// Guarda cómo le ha ido un cuento y, si toca, sube o baja su nivel.
export function valorarCuento(
  nombre: string,
  cuentoId: string,
  valoracion: Valoracion,
): CambioNivel | null {
  const todos = leerTodo();
  const perfil = todos[claveNino(nombre)];
  const cuento = perfil?.cuentos.find((c) => c.cuentoId === cuentoId);
  if (!perfil || !cuento) return null;
  cuento.valoracion = valoracion;

  // Solo cuenta para cambiar de nivel si el cuento era de su nivel actual.
  const nuevo = cuento.nivel === perfil.nivel ? cambioQueToca(perfil) : null;
  const cambio = nuevo ? { anterior: perfil.nivel, nuevo } : null;
  if (nuevo) perfil.nivel = nuevo;
  guardarTodo(todos);
  return cambio;
}

export function deshacerCambio(nombre: string, cambio: CambioNivel) {
  const todos = leerTodo();
  const perfil = todos[claveNino(nombre)];
  if (!perfil) return;
  perfil.nivel = cambio.anterior;
  // Para no volver a cambiarlo enseguida, la última valoración deja de contar.
  const ultimo = [...perfil.cuentos].reverse().find((c) => c.valoracion);
  if (ultimo) ultimo.noCuenta = true;
  guardarTodo(todos);
}

export function valoracionDe(nombre: string, cuentoId: string): Valoracion | undefined {
  return leerPerfil(nombre)?.cuentos.find((c) => c.cuentoId === cuentoId)?.valoracion;
}

// --- Propuesta para el siguiente cuento ---

export interface Propuesta {
  nivel: NivelLectura;
  letra: string; // id de la letra protagonista propuesta
  motivo: string; // explicación corta para la familia
}

export function proponer(perfil: PerfilLector): Propuesta {
  const nivel = perfil.nivel;
  const disponibles = LETRAS.filter((l) => l.nivel <= nivel);
  const valorados = perfil.cuentos.filter((c) => c.valoracion && c.letra);
  const ultimo = valorados[valorados.length - 1];

  // 1) Si la última letra le costó y sigue siendo de su nivel, se repasa.
  if (ultimo?.valoracion === "costo" && disponibles.some((l) => l.id === ultimo.letra)) {
    const l = letraInfo(ultimo.letra)!;
    return {
      nivel,
      letra: l.id,
      motivo: `Repasamos la «${l.muestra}», que le costó en el último cuento.`,
    };
  }

  // 2) La siguiente letra que todavía no ha practicado con éxito, en el orden del cole.
  const practicadas = new Set(
    valorados.filter((c) => c.valoracion !== "costo").map((c) => c.letra),
  );
  const nueva = disponibles.find((l) => !practicadas.has(l.id));
  if (nueva) {
    return {
      nivel,
      letra: nueva.id,
      motivo: practicadas.size
        ? `Toca una letra nueva: la «${nueva.muestra}».`
        : `Empezamos por la «${nueva.muestra}».`,
    };
  }

  // 3) Todas practicadas: repaso de la que hace más tiempo que no sale.
  const ultimaVez = new Map<string, string>();
  for (const c of valorados) ultimaVez.set(c.letra, c.fecha);
  const repaso = [...disponibles].sort((a, b) =>
    (ultimaVez.get(a.id) ?? "").localeCompare(ultimaVez.get(b.id) ?? ""),
  )[0];
  return {
    nivel,
    letra: repaso.id,
    motivo: `Repaso: la «${repaso.muestra}» hace tiempo que no sale.`,
  };
}

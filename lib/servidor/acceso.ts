// Control de acceso y cuotas (solo servidor).
// - Familia: cookie firmada con SITE_PASSWORD -> sin límites.
// - Visitante con email: LIMITE_CON_EMAIL cuentos al mes.
// - Visitante anónimo: LIMITE_SIN_EMAIL cuentos (ventana de 30 días, por IP).
// - Tope global diario para todos los visitantes: LIMITE_GLOBAL_DIA.
// Sin base de datos (Upstash Redis) configurada, la parte pública queda cerrada.

import { createHash, createHmac, randomUUID, timingSafeEqual } from "crypto";
import { cookies, headers } from "next/headers";
import { Redis } from "@upstash/redis";

export const COOKIE_FAMILIA = "cm_familia";
export const COOKIE_EMAIL = "cm_email";

const UN_DIA = 24 * 60 * 60;

function numeroEnv(nombre: string, defecto: number): number {
  const n = Number(process.env[nombre]);
  return Number.isFinite(n) && n >= 0 ? n : defecto;
}

export const LIMITES = {
  anonimo: numeroEnv("LIMITE_SIN_EMAIL", 2),
  email: numeroEnv("LIMITE_CON_EMAIL", 10),
  globalDia: numeroEnv("LIMITE_GLOBAL_DIA", 50),
  altasEmailPorIpDia: 3,
  intentosFamiliaPorHora: 10,
};

// --- Base de datos ---

let cliente: Redis | null | undefined;

export function getRedis(): Redis | null {
  if (cliente !== undefined) return cliente;
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  cliente = url && token ? new Redis({ url, token }) : null;
  return cliente;
}

function sal(): string {
  return (
    process.env.UPSTASH_REDIS_REST_TOKEN ??
    process.env.KV_REST_API_TOKEN ??
    "cuentomagico"
  );
}

const hoy = () => new Date().toISOString().slice(0, 10); // AAAA-MM-DD (UTC)
const mesActual = () => new Date().toISOString().slice(0, 7); // AAAA-MM

// --- Acceso de familia ---

function firmaFamilia(): string | null {
  const pass = process.env.SITE_PASSWORD;
  if (!pass) return null;
  return createHmac("sha256", pass).update("acceso-familia").digest("hex");
}

function igualesSeguro(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function esFamilia(): boolean {
  const esperada = firmaFamilia();
  const valor = cookies().get(COOKIE_FAMILIA)?.value;
  return !!esperada && !!valor && igualesSeguro(valor, esperada);
}

export function comprobarPasswordFamilia(password: string): string | null {
  const pass = process.env.SITE_PASSWORD;
  if (!pass || !igualesSeguro(password, pass)) return null;
  return firmaFamilia();
}

// Limita intentos de contraseña por IP (si hay base de datos).
export async function puedeIntentarFamilia(): Promise<boolean> {
  const r = getRedis();
  if (!r) return true;
  const clave = `intentos:familia:${ipHash()}`;
  const n = await r.incr(clave);
  if (n === 1) await r.expire(clave, 60 * 60);
  return n <= LIMITES.intentosFamiliaPorHora;
}

// --- Identidad del visitante ---

function ipCliente(): string {
  const h = headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "desconocida"
  );
}

function ipHash(): string {
  return createHash("sha256")
    .update(sal() + ipCliente())
    .digest("hex")
    .slice(0, 32);
}

export function normalizarEmail(email: string): string | null {
  const v = email.trim().toLowerCase();
  if (v.length > 254) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? v : null;
}

export type Identidad =
  | { tipo: "familia" }
  | { tipo: "email"; email: string }
  | { tipo: "anonimo" };

export function identidad(): Identidad {
  if (esFamilia()) return { tipo: "familia" };
  const email = normalizarEmail(cookies().get(COOKIE_EMAIL)?.value ?? "");
  if (email) return { tipo: "email", email };
  return { tipo: "anonimo" };
}

function claveUso(id: Exclude<Identidad, { tipo: "familia" }>) {
  return id.tipo === "email"
    ? { clave: `uso:email:${id.email}:${mesActual()}`, ttl: 40 * UN_DIA, limite: LIMITES.email }
    : { clave: `uso:anon:${ipHash()}`, ttl: 30 * UN_DIA, limite: LIMITES.anonimo };
}

// --- Cuotas ---

export interface EstadoCuota {
  tipo: "familia" | "email" | "anonimo" | "cerrado";
  restantes: number | null; // null = ilimitado
  limite: number | null;
  email?: string;
}

export async function estadoCuota(): Promise<EstadoCuota> {
  const id = identidad();
  if (id.tipo === "familia") return { tipo: "familia", restantes: null, limite: null };
  const r = getRedis();
  if (!r) return { tipo: "cerrado", restantes: 0, limite: 0 };
  const { clave, limite } = claveUso(id);
  const usados = Number((await r.get<number>(clave)) ?? 0);
  return {
    tipo: id.tipo,
    restantes: Math.max(0, limite - usados),
    limite,
    email: id.tipo === "email" ? id.email : undefined,
  };
}

export type Reserva =
  | { ok: true; liberar: () => Promise<void> }
  | {
      ok: false;
      motivo: "cerrado" | "necesita_email" | "limite_email" | "limite_global";
      mensaje: string;
    };

// Reserva un cuento antes de llamar a la IA; si la generación falla, se libera.
export async function reservarCuento(): Promise<Reserva> {
  const id = identidad();
  if (id.tipo === "familia") return { ok: true, liberar: async () => {} };

  const r = getRedis();
  if (!r) {
    return {
      ok: false,
      motivo: "cerrado",
      mensaje: "La versión gratuita todavía no está activada. ¡Vuelve muy pronto!",
    };
  }

  const { clave, ttl, limite } = claveUso(id);
  const usados = await r.incr(clave);
  if (usados === 1) await r.expire(clave, ttl);
  if (usados > limite) {
    await r.decr(clave);
    return id.tipo === "email"
      ? {
          ok: false,
          motivo: "limite_email",
          mensaje: `Has usado tus ${limite} cuentos de este mes. ¡El mes que viene tendrás ${limite} más!`,
        }
      : {
          ok: false,
          motivo: "necesita_email",
          mensaje: `Has usado tus ${limite} cuentos gratis. Deja tu email y consigue ${LIMITES.email} cuentos cada mes.`,
        };
  }

  const claveGlobal = `uso:global:${hoy()}`;
  const total = await r.incr(claveGlobal);
  if (total === 1) await r.expire(claveGlobal, 2 * UN_DIA);
  if (total > LIMITES.globalDia) {
    await r.decr(claveGlobal);
    await r.decr(clave);
    return {
      ok: false,
      motivo: "limite_global",
      mensaje: "Hoy ya se han creado muchísimos cuentos. ¡Vuelve mañana!",
    };
  }

  return {
    ok: true,
    liberar: async () => {
      await r.decr(clave);
      await r.decr(claveGlobal);
    },
  };
}

// --- Permiso de ilustraciones ligado a cada cuento ---

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function concederImagenes(numPartes: number): Promise<string> {
  const cuentoId = randomUUID();
  const r = getRedis();
  // Una imagen por parte + 3 reintentos de margen.
  if (r) await r.set(`img:${cuentoId}`, Math.min(numPartes, 8) + 3, { ex: 2 * UN_DIA });
  return cuentoId;
}

export async function consumirImagen(cuentoId: unknown): Promise<boolean> {
  if (esFamilia()) return true;
  const r = getRedis();
  if (!r || typeof cuentoId !== "string" || !UUID.test(cuentoId)) return false;
  const clave = `img:${cuentoId}`;
  const quedan = await r.decr(clave);
  if (quedan < 0) {
    await r.del(clave);
    return false;
  }
  return true;
}

// --- Registro de emails ---

export type ResultadoAlta =
  | { ok: true; email: string }
  | { ok: false; status: number; error: string };

export async function registrarEmail(
  emailBruto: string,
  novedades: boolean,
): Promise<ResultadoAlta> {
  const email = normalizarEmail(emailBruto);
  if (!email) return { ok: false, status: 400, error: "Ese email no parece válido." };

  const r = getRedis();
  if (!r) {
    return {
      ok: false,
      status: 503,
      error: "La versión gratuita todavía no está activada. ¡Vuelve muy pronto!",
    };
  }

  const ahora = new Date().toISOString();
  const clave = `email:${email}`;
  const existe = await r.exists(clave);

  if (!existe) {
    const claveAltas = `altas:ip:${ipHash()}:${hoy()}`;
    const altas = await r.incr(claveAltas);
    if (altas === 1) await r.expire(claveAltas, 2 * UN_DIA);
    if (altas > LIMITES.altasEmailPorIpDia) {
      return {
        ok: false,
        status: 429,
        error: "Se han registrado demasiados emails desde aquí hoy. Inténtalo mañana.",
      };
    }
    await r.hset(clave, { email, alta: ahora, privacidadAceptada: ahora, novedades: "no" });
    await r.sadd("emails:todos", email);
  }

  if (novedades) {
    await r.hset(clave, { novedades: "si", novedadesAceptadas: ahora });
    await r.sadd("emails:novedades", email);
  }

  return { ok: true, email };
}

export async function listarEmails(): Promise<Record<string, string>[]> {
  const r = getRedis();
  if (!r) return [];
  const emails = await r.smembers("emails:todos");
  const filas = await Promise.all(
    emails.map((e) => r.hgetall<Record<string, string>>(`email:${e}`)),
  );
  return filas.filter((f): f is Record<string, string> => !!f);
}

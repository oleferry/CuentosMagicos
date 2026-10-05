// "Mis cuentos": los cuentos creados, con sus ilustraciones, guardados en este
// navegador (IndexedDB: cabe mucho más que en localStorage, y cada cuento con
// 4 ilustraciones ocupa ~1 MB). Nada se envía a ningún servidor.
// Si el navegador no lo permite (modo privado...), todo sigue funcionando sin guardar.

import type { FormData } from "@/types/cuento";

export interface CuentoGuardado {
  id: string; // cuentoId
  fecha: string; // ISO
  cuento: string; // texto completo devuelto por la IA
  form: FormData; // sin foto
  imagenes: (string | null)[];
}

const BD = "cuentomagico";
const ALMACEN = "cuentos";
const MAX_CUENTOS = 60; // al pasarse, se borran los más antiguos

function abrir(): Promise<IDBDatabase | null> {
  return new Promise((resolver) => {
    try {
      const peticion = indexedDB.open(BD, 1);
      peticion.onupgradeneeded = () => {
        peticion.result.createObjectStore(ALMACEN, { keyPath: "id" });
      };
      peticion.onsuccess = () => resolver(peticion.result);
      peticion.onerror = () => resolver(null);
      peticion.onblocked = () => resolver(null);
    } catch {
      resolver(null);
    }
  });
}

// Ejecuta una operación en una transacción y devuelve su resultado (o null si falla).
async function conAlmacen<T>(
  modo: IDBTransactionMode,
  operacion: (almacen: IDBObjectStore, terminar: (valor: T) => void) => void,
): Promise<T | null> {
  const bd = await abrir();
  if (!bd) return null;
  return new Promise((resolver) => {
    let resultado: T | null = null;
    try {
      const tx = bd.transaction(ALMACEN, modo);
      tx.oncomplete = () => {
        bd.close();
        resolver(resultado);
      };
      tx.onerror = tx.onabort = () => {
        bd.close();
        resolver(null);
      };
      operacion(tx.objectStore(ALMACEN), (valor) => {
        resultado = valor;
      });
    } catch {
      bd.close();
      resolver(null);
    }
  });
}

export async function listarCuentos(): Promise<CuentoGuardado[]> {
  const todos = await conAlmacen<CuentoGuardado[]>("readonly", (almacen, terminar) => {
    const peticion = almacen.getAll();
    peticion.onsuccess = () => terminar(peticion.result as CuentoGuardado[]);
  });
  return (todos ?? []).sort((a, b) => b.fecha.localeCompare(a.fecha));
}

export async function leerCuento(id: string): Promise<CuentoGuardado | null> {
  return conAlmacen<CuentoGuardado>("readonly", (almacen, terminar) => {
    const peticion = almacen.get(id);
    peticion.onsuccess = () => terminar(peticion.result as CuentoGuardado);
  });
}

// Al crear un cuento (todavía sin ilustraciones).
export async function guardarCuento(datos: Omit<CuentoGuardado, "fecha" | "imagenes">) {
  await conAlmacen<true>("readwrite", (almacen, terminar) => {
    almacen.put({ ...datos, form: { ...datos.form, foto: null }, fecha: new Date().toISOString(), imagenes: [] });
    terminar(true);
  });
  // Límite de espacio: fuera los más antiguos.
  const todos = await listarCuentos();
  for (const viejo of todos.slice(MAX_CUENTOS)) await borrarCuento(viejo.id);
}

// Cada ilustración se añade cuando llega (en la misma transacción: sin pisarse).
export async function guardarImagen(id: string, indice: number, imagen: string) {
  await conAlmacen<true>("readwrite", (almacen, terminar) => {
    const peticion = almacen.get(id);
    peticion.onsuccess = () => {
      const cuento = peticion.result as CuentoGuardado | undefined;
      if (!cuento || cuento.imagenes[indice] === imagen) return;
      cuento.imagenes[indice] = imagen;
      almacen.put(cuento);
      terminar(true);
    };
  });
}

export async function borrarCuento(id: string) {
  await conAlmacen<true>("readwrite", (almacen, terminar) => {
    almacen.delete(id);
    terminar(true);
  });
}

"use server";

import { revalidatePath } from "next/cache";
import { slugsActuales } from "@/lib/noticias";

/**
 * Revalidación bajo demanda (on-demand ISR): invalida la caché de una página ISR
 * para que se regenere de inmediato, sin esperar a que venza el tiempo de `revalidate`.
 * En un portal real esto lo dispararía el CMS al publicar o editar una noticia.
 */
export async function revalidarRuta(ruta: string) {
  const permitidas = new Set(["/", ...slugsActuales().map((s) => `/noticia/${s}`)]);
  if (!permitidas.has(ruta)) {
    throw new Error("Ruta no permitida para revalidación");
  }
  revalidatePath(ruta);
}

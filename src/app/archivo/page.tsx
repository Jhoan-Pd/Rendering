// ============================================================================
// ARCHIVO — SSG (Static Site Generation)
// ----------------------------------------------------------------------------
// Se genera UNA sola vez durante `next build`. El HTML resultante se sirve tal
// cual desde la CDN a todos los usuarios hasta el siguiente despliegue.
// ============================================================================

import type { Metadata } from "next";
import { NoticiaCard } from "@/components/NoticiaCard";
import { RenderPanel } from "@/components/RenderPanel";
import { obtenerArchivo } from "@/lib/noticias";

export const dynamic = "force-static"; // prerenderizar siempre, nunca en tiempo de petición

export const metadata: Metadata = { title: "Archivo histórico" };

export default async function ArchivoPage() {
  const notas = await obtenerArchivo();
  const generadoEn = new Date().toISOString(); // = momento del build

  return (
    <>
      <RenderPanel patron="SSG" generadoEn={generadoEn} detalles={[{ etiqueta: "Notas en el archivo", valor: String(notas.length) }]} />

      <header className="encabezado-seccion">
        <h1>Archivo histórico</h1>
        <p>Notas de años anteriores. Su contenido ya no cambia, así que se generan una sola vez.</p>
      </header>

      <div className="rejilla" data-contenido="noticias">
        {notas.map((n) => (
          <NoticiaCard key={n.slug} noticia={n} href={`/archivo/${n.slug}`} />
        ))}
      </div>
    </>
  );
}

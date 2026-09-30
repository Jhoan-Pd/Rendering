// ============================================================================
// NOTA DE ARCHIVO — SSG con rutas dinámicas
// ----------------------------------------------------------------------------
// generateStaticParams() le dice a Next.js qué páginas crear en el build.
// dynamicParams = false: cualquier slug que no se generó devuelve 404
// (no se renderiza nada en tiempo de petición).
// ============================================================================

import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Miniatura } from "@/components/NoticiaCard";
import { RenderPanel } from "@/components/RenderPanel";
import { obtenerNotaArchivo, slugsArchivo } from "@/lib/noticias";
import { fecha } from "@/lib/tiempo";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return slugsArchivo().map((slug) => ({ slug }));
}

const cargar = cache(obtenerNotaArchivo);

export async function generateMetadata({ params }: PageProps<"/archivo/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const nota = await cargar(slug);
  return { title: nota?.titulo ?? "Nota no encontrada" };
}

export default async function NotaArchivoPage({ params }: PageProps<"/archivo/[slug]">) {
  const { slug } = await params;
  const nota = await cargar(slug);
  if (!nota) notFound();
  const generadoEn = new Date().toISOString();

  return (
    <>
      <RenderPanel
        patron="SSG"
        generadoEn={generadoEn}
        detalles={[{ etiqueta: "Páginas generadas en el build", valor: `${slugsArchivo().length} (una por nota)` }]}
      />

      <article className="articulo" data-contenido="noticias" data-noticia={nota.slug}>
        <p className="antetitulo">
          Archivo · {nota.categoria} · {nota.ciudad}
        </p>
        <h1 className="articulo__titulo">{nota.titulo}</h1>
        <p className="articulo__resumen">{nota.resumen}</p>
        <p className="articulo__meta">
          {nota.autor} · {fecha(nota.publicada)}
        </p>
        <Miniatura categoria={nota.categoria} grande />
        <div className="articulo__cuerpo">
          {nota.cuerpo.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <a href="/archivo" className="volver">
          ← Volver al archivo
        </a>
      </article>
    </>
  );
}

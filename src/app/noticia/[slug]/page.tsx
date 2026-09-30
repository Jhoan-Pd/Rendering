// ============================================================================
// NOTA COMPLETA — ISR con rutas dinámicas
// ----------------------------------------------------------------------------
// generateStaticParams() genera todas las notas conocidas en el build.
// Con `revalidate = 60` cada nota se regenera como máximo una vez por minuto.
// Si se publica una nota nueva (slug desconocido en el build), se genera la
// primera vez que alguien la visita (dynamicParams = true por defecto).
// ============================================================================

import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Metricas, Miniatura, NoticiaCard } from "@/components/NoticiaCard";
import { RenderPanel } from "@/components/RenderPanel";
import { obtenerNoticia, slugsActuales } from "@/lib/noticias";
import { horaCorta } from "@/lib/tiempo";

export const revalidate = 60;

export function generateStaticParams() {
  return slugsActuales().map((slug) => ({ slug }));
}

// cache() evita consultar dos veces la "base de datos" (metadata + página).
const cargar = cache(obtenerNoticia);

export async function generateMetadata({ params }: PageProps<"/noticia/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const datos = await cargar(slug);
  return { title: datos?.noticia.titulo ?? "Noticia no encontrada" };
}

export default async function NoticiaPage({ params }: PageProps<"/noticia/[slug]">) {
  const { slug } = await params;
  const datos = await cargar(slug);
  if (!datos) notFound();
  const { noticia, relacionadas, consultadoEn } = datos;

  return (
    <>
      <RenderPanel
        patron="ISR"
        generadoEn={consultadoEn}
        revalidar={revalidate}
        ruta={`/noticia/${slug}`}
        porQue="Una nota puede corregirse o actualizar sus cifras de lectura, pero no necesita generarse en cada visita. ISR la mantiene rápida y razonablemente al día."
      />

      <article className="articulo" data-contenido="noticias" data-noticia={noticia.slug}>
        <p className="antetitulo">
          {noticia.categoria} · {noticia.ciudad}
        </p>
        <h1 className="articulo__titulo">{noticia.titulo}</h1>
        <p className="articulo__resumen">{noticia.resumen}</p>
        <p className="articulo__meta">
          Por {noticia.autor} · Publicada {horaCorta(noticia.publicada)} · <Metricas noticia={noticia} />
        </p>
        <Miniatura categoria={noticia.categoria} grande />
        <div className="articulo__cuerpo">
          {noticia.cuerpo.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </article>

      {relacionadas.length > 0 && (
        <section className="relacionadas">
          <h2>Más de {noticia.categoria}</h2>
          <div className="rejilla">
            {relacionadas.map((n) => (
              <NoticiaCard key={n.slug} noticia={n} href={`/noticia/${n.slug}`} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

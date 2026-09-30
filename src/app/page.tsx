// ============================================================================
// PORTADA — ISR (Incremental Static Regeneration)
// ----------------------------------------------------------------------------
// La página se genera en el build y queda cacheada. Cuando pasan más de 30 s,
// la siguiente visita recibe la versión en caché (stale) y dispara una
// regeneración en segundo plano. Las visitas posteriores reciben la nueva.
// ============================================================================

import { Metricas, NoticiaCard } from "@/components/NoticiaCard";
import { RenderPanel } from "@/components/RenderPanel";
import { obtenerPortada } from "@/lib/noticias";
import { horaCorta } from "@/lib/tiempo";

export const revalidate = 30; // segundos

export default async function PortadaPage() {
  const { consultadoEn, ultimaHora, noticias, masLeidas } = await obtenerPortada();
  const [principal, ...resto] = noticias;

  return (
    <>
      <RenderPanel
        patron="ISR"
        generadoEn={consultadoEn}
        revalidar={revalidate}
        ruta="/"
        detalles={[
          { etiqueta: "Datos congelados", valor: "Última hora y lecturas, hasta regenerar" },
        ]}
      />

      <section className="ultima-hora" aria-label="Última hora">
        <span className="ultima-hora__etiqueta">Última hora · {horaCorta(ultimaHora.hora)}</span>
        <span>{ultimaHora.texto}</span>
      </section>

      <div className="portada" data-contenido="noticias">
        <div className="portada__principal">
          <NoticiaCard noticia={principal} href={`/noticia/${principal.slug}`} variante="destacada" />
          <div className="rejilla">
            {resto.map((n) => (
              <NoticiaCard key={n.slug} noticia={n} href={`/noticia/${n.slug}`} />
            ))}
          </div>
        </div>

        <aside className="lateral">
          <h2 className="lateral__titulo">Más leídas ahora</h2>
          <ol className="ranking">
            {masLeidas.map((n) => (
              <li key={n.slug}>
                <a href={`/noticia/${n.slug}`}>{n.titulo}</a>
                <Metricas noticia={n} />
              </li>
            ))}
          </ol>
          <p className="nota">
            Este ranking se calculó cuando se generó la página. Compáralo con el de la sección{" "}
            <a href="/en-vivo">En vivo</a>, que se actualiza en tu navegador.
          </p>
        </aside>
      </div>
    </>
  );
}

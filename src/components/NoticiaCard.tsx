import type { Categoria, NotaArchivo, Noticia } from "@/lib/noticias";
import { fecha, horaCorta } from "@/lib/tiempo";

const TONO: Record<Categoria, number> = {
  Tecnología: 210,
  Deportes: 140,
  Cultura: 320,
  Economía: 40,
  Ciencia: 180,
  Educación: 265,
};

/** Imagen de relleno generada con CSS (sin depender de imágenes externas). */
export function Miniatura({ categoria, grande = false }: { categoria: Categoria; grande?: boolean }) {
  return (
    <div
      className={`miniatura${grande ? " miniatura--grande" : ""}`}
      style={{ "--tono": TONO[categoria] } as React.CSSProperties}
      aria-hidden="true"
    >
      <span>{categoria}</span>
    </div>
  );
}

const esActual = (n: Noticia | NotaArchivo): n is Noticia => "lecturasHoy" in n;

// Separador de miles manual (igual en servidor y navegador).
const miles = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export function Metricas({ noticia }: { noticia: Noticia }) {
  return (
    <span className="metricas">
      <span title="Lecturas acumuladas hoy">{miles(noticia.lecturasHoy)} lecturas hoy</span>
      <span title="Personas leyendo en este momento">
        <span className="punto-vivo" aria-hidden="true" /> {noticia.lectoresAhora} leyendo ahora
      </span>
    </span>
  );
}

export function NoticiaCard({
  noticia,
  href,
  variante = "normal",
}: {
  noticia: Noticia | NotaArchivo;
  href: string;
  variante?: "destacada" | "normal";
}) {
  const actual = esActual(noticia);
  return (
    <article className={`tarjeta tarjeta--${variante}`} data-noticia={noticia.slug}>
      <a href={href} className="tarjeta__enlace">
        <Miniatura categoria={noticia.categoria} grande={variante === "destacada"} />
        <div className="tarjeta__cuerpo">
          <p className="antetitulo">
            {noticia.categoria} · {noticia.ciudad}
          </p>
          <h3 className="tarjeta__titulo">{noticia.titulo}</h3>
          <p className="tarjeta__resumen">{noticia.resumen}</p>
          <p className="tarjeta__meta">
            {actual ? `Publicada ${horaCorta(noticia.publicada)}` : fecha(noticia.publicada)}
            {actual && <Metricas noticia={noticia} />}
          </p>
        </div>
      </a>
    </article>
  );
}

"use client";

import { useSyncExternalStore, useTransition } from "react";
import { PATRONES, type Patron } from "@/lib/patrones";
import { fecha, hace, hora } from "@/lib/tiempo";
import { revalidarRuta } from "@/app/acciones";

// ---------------------------------------------------------------------------
// Pequeñas "tiendas" del navegador. useSyncExternalStore devuelve `null` en el
// servidor, así el HTML inicial nunca depende de la hora del cliente.
// ---------------------------------------------------------------------------

function suscribirReloj(cb: () => void) {
  const id = setInterval(cb, 1000);
  return () => clearInterval(id);
}
const leerSegundo = () => Math.floor(Date.now() / 1000) * 1000;
const sinSuscripcion = () => () => {};

function navegacion() {
  return performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
}
/** Time To First Byte de la carga del documento (ms), o -1 si no aplica. */
function leerTTFB() {
  const nav = navegacion();
  if (!nav) return -1;
  const url = new URL(nav.name);
  const esEstaPagina = url.pathname + url.search === location.pathname + location.search;
  return esEstaPagina ? Math.round(nav.responseStart) : -1;
}

const ETIQUETA_GENERADO: Record<Patron, string> = {
  SSG: "HTML generado (build)",
  ISR: "HTML generado a las",
  SSR: "HTML generado a las",
  CSR: "Datos recibidos a las",
};

interface Props {
  patron: Patron;
  /** Momento en que se generaron los datos de esta vista (ISO). En CSR, cuándo llegó el fetch. */
  generadoEn: string | null;
  /** Segundos de `revalidate` (solo ISR). */
  revalidar?: number;
  /** Ruta a revalidar bajo demanda (solo ISR). */
  ruta?: string;
  /** Filas extra específicas de cada página. */
  detalles?: { etiqueta: string; valor: string }[];
  porQue?: string;
}

export function RenderPanel({ patron, generadoEn, revalidar, ruta, detalles = [], porQue }: Props) {
  const info = PATRONES[patron];
  const ahora = useSyncExternalStore(suscribirReloj, leerSegundo, () => null);
  const ttfb = useSyncExternalStore(sinSuscripcion, leerTTFB, () => null);
  const [revalidando, iniciar] = useTransition();

  const generadoMs = generadoEn ? new Date(generadoEn).getTime() : null;
  const edad = ahora !== null && generadoMs !== null ? ahora - generadoMs : null;
  const restante =
    revalidar && generadoMs !== null && ahora !== null ? generadoMs + revalidar * 1000 - ahora : null;

  const clase = patron.toLowerCase();

  return (
    <details
      className={`panel panel--${clase}`}
      open
      data-render-patron={patron}
      data-render-generado={generadoEn ?? ""}
    >
      <summary className="panel__cabecera">
        <span className={`badge badge--${clase}`}>{patron}</span>
        <strong>{info.nombre}</strong>
        <span className="panel__resumen">
          {generadoEn ? `${ETIQUETA_GENERADO[patron]} ${hora(generadoEn)}` : "Esperando datos…"}
          {edad !== null && ` · ${hace(edad)}`}
        </span>
      </summary>

      {process.env.NODE_ENV === "development" && (
        <p className="panel__aviso">
          Estás en modo desarrollo: Next.js renderiza <em>todas</em> las páginas en cada petición.
          Para ver SSG e ISR de verdad ejecuta <code>npm run build</code> y <code>npm start</code>, o
          prueba la versión desplegada.
        </p>
      )}

      <dl className="panel__grid">
        <div className="stat">
          <dt>{ETIQUETA_GENERADO[patron]}</dt>
          <dd>
            {generadoEn ? hora(generadoEn) : "—"}
            {patron === "SSG" && generadoEn && <small> ({fecha(generadoEn)})</small>}
          </dd>
        </div>
        <div className="stat">
          <dt>Antigüedad del contenido</dt>
          <dd>{edad !== null ? hace(edad) : "—"}</dd>
        </div>
        {patron === "ISR" && (
          <div className="stat">
            <dt>Revalidación (cada {revalidar} s)</dt>
            <dd>
              {restante === null
                ? "—"
                : restante > 0
                  ? `Fresca: vence en ${Math.ceil(restante / 1000)} s`
                  : "Vencida: la próxima visita dispara la regeneración"}
            </dd>
          </div>
        )}
        <div className="stat">
          <dt>TTFB de esta carga</dt>
          <dd>{ttfb === null ? "—" : ttfb < 0 ? "Recarga para medir" : `${ttfb} ms`}</dd>
        </div>
        {detalles.map((d) => (
          <div className="stat" key={d.etiqueta}>
            <dt>{d.etiqueta}</dt>
            <dd>{d.valor}</dd>
          </div>
        ))}
      </dl>

      <p className="panel__ficha">
        <span>
          <strong>Se renderiza:</strong> {info.donde}
        </span>
        <span>
          <strong>SEO:</strong> {info.seo}
        </span>
        <span>
          <strong>Frescura:</strong> {info.frescura}
        </span>
      </p>

      <p className="panel__porque">
        <strong>¿Por qué {patron} aquí?</strong> {porQue ?? info.porQue}
      </p>

      <div className="panel__acciones">
        <button type="button" className="boton" onClick={() => window.location.reload()}>
          Recargar página
        </button>
        {patron === "ISR" && ruta && (
          <button
            type="button"
            className="boton boton--secundario"
            disabled={revalidando}
            onClick={() => iniciar(() => revalidarRuta(ruta))}
          >
            {revalidando ? "Revalidando…" : "Revalidar ahora (on-demand)"}
          </button>
        )}
        <span className="panel__pista">{PISTAS[patron]}</span>
      </div>
    </details>
  );
}

const PISTAS: Record<Patron, string> = {
  SSG: "Recarga cuantas veces quieras: la hora no cambia hasta el próximo build.",
  ISR: "Recarga varias veces: la hora solo cambia cuando la versión vence y alguien visita la página.",
  SSR: "Cada recarga genera un HTML nuevo: la hora cambia siempre.",
  CSR: "Los datos se piden desde tu navegador y se actualizan solos cada pocos segundos.",
};

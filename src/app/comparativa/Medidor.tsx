"use client";

import { useState } from "react";
import { ORDEN, type Patron } from "@/lib/patrones";
import { esperar, hora } from "@/lib/tiempo";

const RUTAS: Record<Patron, string> = {
  SSG: "/archivo",
  ISR: "/",
  SSR: "/buscar?q=cafe",
  CSR: "/en-vivo",
};

const RONDAS = 3;
const PAUSA_ENTRE_RONDAS_MS = 2000;

interface Medicion {
  ttfb: number; // ms hasta recibir las cabeceras (≈ TTFB)
  total: number; // ms hasta recibir todo el HTML
  kb: number;
  generado: string | null; // hora escrita en el HTML (data-render-generado)
  noticias: number; // tarjetas de noticia presentes en el HTML
  cache: string | null;
  estado: number;
}

type Resultados = Record<Patron, Medicion[]>;

const vacio = (): Resultados => ({ SSG: [], ISR: [], SSR: [], CSR: [] });

async function medir(ruta: string): Promise<Medicion> {
  const t0 = performance.now();
  const res = await fetch(ruta, { cache: "no-store" }); // evita la caché del navegador, no la del servidor/CDN
  const ttfb = performance.now() - t0;
  const html = await res.text();
  const total = performance.now() - t0;
  const generado = html.match(/data-render-generado="([^"]+)"/)?.[1] ?? null;
  const noticias = new Set(Array.from(html.matchAll(/data-noticia="([^"]+)"/g), (m) => m[1])).size;
  const cache =
    res.headers.get("x-vercel-cache") ??
    res.headers.get("x-nextjs-cache") ??
    (res.headers.get("x-nextjs-prerender") ? "PRERENDER" : null);
  return {
    ttfb: Math.round(ttfb),
    total: Math.round(total),
    kb: new Blob([html]).size / 1024,
    generado,
    noticias,
    cache,
    estado: res.status,
  };
}

function conclusion(p: Patron, m: Medicion[]) {
  if (m.length === 0) return "";
  const horas = m.map((x) => x.generado);
  if (horas.every((h) => h === null)) return "El HTML llega sin datos: el navegador los pide y los pinta.";
  const distintas = new Set(horas).size;
  if (distintas === 1) return "Misma hora en todas las rondas: se sirvió una versión ya generada.";
  if (distintas === m.length) return "Hora distinta en cada ronda: el servidor generó un HTML nuevo por petición.";
  return p === "ISR"
    ? "Cambió entre rondas: la versión venció y se regeneró en segundo plano."
    : "La hora cambió en algunas rondas.";
}

const promedio = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0);

export function Medidor() {
  const [resultados, setResultados] = useState<Resultados>(vacio);
  const [progreso, setProgreso] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function ejecutar() {
    setResultados(vacio());
    setError(null);
    try {
      for (let r = 1; r <= RONDAS; r++) {
        for (const p of ORDEN) {
          setProgreso(`Ronda ${r} de ${RONDAS}: pidiendo ${RUTAS[p]} (${p})…`);
          const m = await medir(RUTAS[p]);
          setResultados((prev) => ({ ...prev, [p]: [...prev[p], m] }));
        }
        if (r < RONDAS) {
          setProgreso(`Esperando ${PAUSA_ENTRE_RONDAS_MS / 1000} s antes de la ronda ${r + 1}…`);
          await esperar(PAUSA_ENTRE_RONDAS_MS);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de red");
    } finally {
      setProgreso(null);
    }
  }

  const hayDatos = ORDEN.some((p) => resultados[p].length > 0);
  const promedios = ORDEN.map((p) => ({ p, ms: promedio(resultados[p].map((m) => m.ttfb)) }));
  const maximo = Math.max(1, ...promedios.map((x) => x.ms));

  return (
    <section className="bloque medidor">
      <div className="medidor__cabecera">
        <div>
          <h2>Medición en vivo</h2>
          <p className="nota">
            {RONDAS} rondas, {PAUSA_ENTRE_RONDAS_MS / 1000} s entre cada una. Para ver cómo se regenera la ISR, espera
            más de 30 s y vuelve a medir.
          </p>
        </div>
        <button type="button" className="boton" onClick={ejecutar} disabled={progreso !== null}>
          {progreso ? "Midiendo…" : hayDatos ? "Medir de nuevo" : "Medir los 4 patrones"}
        </button>
      </div>

      {process.env.NODE_ENV === "development" && (
        <p className="panel__aviso">
          Modo desarrollo: aquí todo se renderiza por petición, así que SSG e ISR se verán como SSR. Mide sobre{" "}
          <code>npm run build &amp;&amp; npm start</code> o sobre la versión desplegada.
        </p>
      )}
      {progreso && (
        <p className="medidor__progreso" role="status">
          {progreso}
        </p>
      )}
      {error && <p className="panel__aviso">No se pudo completar la medición: {error}</p>}

      {hayDatos && (
        <>
          <figure className="grafica">
            <figcaption>
              <strong>Tiempo hasta el primer byte (≈TTFB), promedio en ms</strong>
              <span>Menos es mejor · incluye la latencia de red desde tu navegador</span>
            </figcaption>
            <ul className="barras">
              {promedios.map(({ p, ms }) => {
                const detalle = resultados[p].map((m, i) => `R${i + 1}: ${m.ttfb} ms`).join(" · ");
                return (
                  <li key={p} className="barras__fila" tabIndex={0} aria-label={`${p}: ${ms} ms en promedio. ${detalle}`}>
                    <span className="barras__etiqueta">
                      {p} <small>{RUTAS[p]}</small>
                    </span>
                    <span className="barras__pista">
                      <span
                        className={`barras__barra barras__barra--${p.toLowerCase()}`}
                        style={{ width: `${Math.max(1, (ms / maximo) * 100)}%` }}
                      />
                    </span>
                    <span className="barras__valor">{ms} ms</span>
                    <span className="barras__tooltip" role="tooltip">
                      {detalle}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="nota">
              Ojo con CSR: su HTML llega rápido porque viene vacío. Las noticias aparecen después, cuando el navegador
              descarga el JavaScript y llama al API (unos 250 ms más). SSR tarda más en responder, pero entrega la
              página completa.
            </p>
          </figure>

          <div className="tabla-scroll">
            <table className="tabla tabla--medicion">
              <thead>
                <tr>
                  <th scope="col">Patrón</th>
                  <th scope="col">≈TTFB por ronda</th>
                  <th scope="col">HTML</th>
                  <th scope="col">Noticias en el HTML</th>
                  <th scope="col">Hora escrita en el HTML</th>
                  <th scope="col">Caché</th>
                  <th scope="col">Conclusión</th>
                </tr>
              </thead>
              <tbody>
                {ORDEN.map((p) => {
                  const m = resultados[p];
                  const ultimo = m[m.length - 1];
                  return (
                    <tr key={p}>
                      <th scope="row">
                        <span className={`badge badge--${p.toLowerCase()}`}>{p}</span>
                        <small>{RUTAS[p]}</small>
                      </th>
                      <td>{m.map((x) => `${x.ttfb} ms`).join(" · ") || "—"}</td>
                      <td>{ultimo ? `${ultimo.kb.toFixed(1)} KB` : "—"}</td>
                      <td>
                        {ultimo
                          ? ultimo.noticias > 0
                            ? `Sí (${ultimo.noticias})`
                            : "No: solo el esqueleto"
                          : "—"}
                      </td>
                      <td>{m.map((x) => (x.generado ? hora(x.generado) : "—")).join(" · ") || "—"}</td>
                      <td>{m.map((x) => x.cache ?? "—").join(" · ") || "—"}</td>
                      <td>{conclusion(p, m)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="nota">
            «Noticias en el HTML» es lo que ve un buscador como Google sin ejecutar JavaScript. La columna «Caché» muestra
            la cabecera <code>x-vercel-cache</code> (en Vercel) o <code>x-nextjs-cache</code> (con <code>next start</code>):
            HIT = servida desde caché, STALE = vencida (se regenera en segundo plano), MISS = generada en ese momento.{" "}
            SSR no usa caché, por eso no muestra la cabecera.
          </p>
        </>
      )}
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import { RenderPanel } from "@/components/RenderPanel";
import type { EstadoPartido, TipoEvento } from "@/lib/en-vivo";
import type { Noticia } from "@/lib/noticias";
import { hace, horaCorta } from "@/lib/tiempo";

const INTERVALO_PARTIDO_MS = 5000;
const INTERVALO_TENDENCIAS_MS = 15000;
const CLAVE_COMENTARIOS = "diario-render:comentarios";

const ETIQUETA: Record<TipoEvento, string> = {
  inicio: "Inicio",
  gol: "Gol",
  amarilla: "Amarilla",
  ocasion: "Ocasión",
  atajada: "Atajada",
  cambio: "Cambio",
  descanso: "Descanso",
  final: "Final",
};

interface Comentario {
  id: number;
  texto: string;
  en: string;
}

function leerComentarios(): Comentario[] {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_COMENTARIOS) ?? "[]");
  } catch {
    return [];
  }
}

export default function EnVivo() {
  const [partido, setPartido] = useState<EstadoPartido | null>(null);
  const [tendencias, setTendencias] = useState<Noticia[] | null>(null);
  const [recibidoEn, setRecibidoEn] = useState<string | null>(null);
  const [duracion, setDuracion] = useState<number | null>(null);
  const [peticiones, setPeticiones] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pausado, setPausado] = useState(false);
  const [ahora, setAhora] = useState(() => Date.now());
  // Este componente solo corre en el navegador (ssr: false), así que se puede
  // leer localStorage directamente al inicializar el estado.
  const [comentarios, setComentarios] = useState<Comentario[]>(leerComentarios);
  const [borrador, setBorrador] = useState("");

  // --- Polling del marcador: fetch al API cada 5 s --------------------------
  useEffect(() => {
    if (pausado) return;
    let vivo = true;

    async function cargarPartido() {
      const t0 = performance.now();
      try {
        const res = await fetch("/api/en-vivo", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const datos: EstadoPartido = await res.json();
        if (!vivo) return;
        setPartido(datos);
        setRecibidoEn(new Date().toISOString());
        setDuracion(Math.round(performance.now() - t0));
        setPeticiones((n) => n + 1);
        setError(null);
      } catch (e) {
        if (vivo) setError(e instanceof Error ? e.message : "Error de red");
      }
    }

    cargarPartido();
    const id = setInterval(cargarPartido, INTERVALO_PARTIDO_MS);
    return () => {
      vivo = false;
      clearInterval(id);
    };
  }, [pausado]);

  // --- Tendencias: otro endpoint, cada 15 s ---------------------------------
  useEffect(() => {
    if (pausado) return;
    let vivo = true;
    async function cargarTendencias() {
      try {
        const res = await fetch("/api/noticias", { cache: "no-store" });
        const datos: { noticias: Noticia[] } = await res.json();
        if (vivo) setTendencias(datos.noticias);
      } catch {
        /* se reintenta en el siguiente ciclo */
      }
    }
    cargarTendencias();
    const id = setInterval(cargarTendencias, INTERVALO_TENDENCIAS_MS);
    return () => {
      vivo = false;
      clearInterval(id);
    };
  }, [pausado]);

  // --- Reloj para "hace X s" -------------------------------------------------
  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  function publicar(e: React.FormEvent) {
    e.preventDefault();
    const texto = borrador.trim();
    if (!texto) return;
    const nuevos = [{ id: Date.now(), texto, en: new Date().toISOString() }, ...comentarios].slice(0, 30);
    setComentarios(nuevos);
    setBorrador("");
    try {
      localStorage.setItem(CLAVE_COMENTARIOS, JSON.stringify(nuevos));
    } catch {
      /* almacenamiento no disponible: el comentario vive solo en memoria */
    }
  }

  const proxima = recibidoEn
    ? Math.max(0, Math.ceil((new Date(recibidoEn).getTime() + INTERVALO_PARTIDO_MS - ahora) / 1000))
    : null;

  return (
    <>
      <RenderPanel
        patron="CSR"
        generadoEn={recibidoEn}
        detalles={[
          { etiqueta: "HTML inicial del servidor", valor: "Solo el esqueleto: sin marcador ni eventos" },
          { etiqueta: "Peticiones al API (/api/en-vivo)", valor: String(peticiones) },
          { etiqueta: "Duración del último fetch", valor: duracion !== null ? `${duracion} ms` : "—" },
          {
            etiqueta: "Próxima actualización",
            valor: pausado ? "En pausa" : proxima !== null ? `en ${proxima} s` : "—",
          },
        ]}
      />

      <div className="en-vivo">
        <section className="marcador" aria-live="polite">
          {!partido ? (
            <p className="vacio">{error ? `No se pudo cargar el partido (${error}).` : "Cargando partido…"}</p>
          ) : (
            <>
              <div className="marcador__estado">
                {partido.estado === "Finalizado" ? (
                  <span className="etiqueta-estado">Finalizado</span>
                ) : (
                  <span className="etiqueta-estado etiqueta-estado--vivo">
                    <span className="punto-vivo" aria-hidden="true" /> En vivo · {partido.minuto}&apos;
                    {partido.estado === "Descanso" && " · Descanso"}
                  </span>
                )}
                <button type="button" className="boton boton--secundario boton--mini" onClick={() => setPausado((p) => !p)}>
                  {pausado ? "Reanudar actualización" : "Pausar actualización"}
                </button>
              </div>

              <div className="marcador__equipos">
                <span className="marcador__equipo">{partido.local}</span>
                <span className="marcador__goles">
                  {partido.marcador.local} – {partido.marcador.visitante}
                </span>
                <span className="marcador__equipo">{partido.visitante}</span>
              </div>

              <div className="posesion" aria-label={`Posesión: ${partido.posesionLocal} % contra ${100 - partido.posesionLocal} %`}>
                <span>{partido.posesionLocal} %</span>
                <div className="posesion__barra">
                  <div style={{ width: `${partido.posesionLocal}%` }} />
                </div>
                <span>{100 - partido.posesionLocal} %</span>
              </div>
              <p className="nota centro">
                Posesión del balón
                {partido.estado === "Finalizado" &&
                  ` · Próximo partido a las ${horaCorta(partido.siguientePartidoEn)}`}
              </p>
            </>
          )}
        </section>

        <div className="en-vivo__columnas">
          <section className="bloque">
            <h2>Relato</h2>
            {partido && (
              <ol className="relato">
                {partido.eventos.map((e) => (
                  <li key={`${e.minuto}-${e.tipo}-${e.texto}`} className={`relato__item relato__item--${e.tipo}`}>
                    <span className="relato__minuto">{e.minuto}&apos;</span>
                    <span className={`chip chip--${e.tipo}`}>{ETIQUETA[e.tipo]}</span>
                    <span>{e.texto}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <aside className="lateral">
            <h2 className="lateral__titulo">Tendencias en este momento</h2>
            {!tendencias ? (
              <p className="vacio">Cargando…</p>
            ) : (
              <ol className="ranking">
                {tendencias.map((n) => (
                  <li key={n.slug}>
                    <a href={`/noticia/${n.slug}`}>{n.titulo}</a>
                    <span className="metricas">
                      <span>
                        <span className="punto-vivo" aria-hidden="true" /> {n.lectoresAhora} leyendo ahora
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
            <p className="nota">Se actualiza cada 15 s desde /api/noticias.</p>

            <h2 className="lateral__titulo">Tus comentarios</h2>
            <form className="comentar" onSubmit={publicar}>
              <label className="sr-only" htmlFor="comentario">
                Escribe un comentario
              </label>
              <textarea
                id="comentario"
                value={borrador}
                onChange={(e) => setBorrador(e.target.value)}
                maxLength={280}
                rows={3}
                placeholder="¿Qué te está pareciendo el partido?"
              />
              <button type="submit" className="boton">
                Publicar
              </button>
            </form>
            <p className="nota">Se guardan solo en este navegador (localStorage).</p>
            <ul className="comentarios">
              {comentarios.map((c) => (
                <li key={c.id}>
                  <p>{c.texto}</p>
                  <small>{hace(ahora - new Date(c.en).getTime())}</small>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </>
  );
}

// ============================================================================
// COMPARATIVA — Panel que mide los cuatro patrones en vivo.
// La teoría es estática (se prerenderiza) y el medidor corre en el navegador.
// ============================================================================

import type { Metadata } from "next";
import { ORDEN, PATRONES } from "@/lib/patrones";
import { Medidor } from "./Medidor";

export const metadata: Metadata = { title: "Comparativa de patrones" };

const FILAS: { etiqueta: string; campo: "donde" | "cuando" | "seo" | "frescura" | "costo" | "seccion" }[] = [
  { etiqueta: "¿Dónde se genera el HTML?", campo: "donde" },
  { etiqueta: "¿Cuándo?", campo: "cuando" },
  { etiqueta: "SEO", campo: "seo" },
  { etiqueta: "Frescura de los datos", campo: "frescura" },
  { etiqueta: "Costo en el servidor", campo: "costo" },
  { etiqueta: "Sección de Diario Render", campo: "seccion" },
];

const OTROS_CASOS = [
  {
    caso: "Tienda online",
    SSG: "Páginas institucionales y categorías",
    ISR: "Ficha de producto (precio y stock)",
    SSR: "Resultados de búsqueda con filtros",
    CSR: "Carrito de compras",
  },
  {
    caso: "Portal universitario",
    SSG: "Plan de estudios de cada programa",
    ISR: "Eventos y noticias del campus",
    SSR: "Consulta de notas del estudiante",
    CSR: "Horario interactivo",
  },
  {
    caso: "Clima / criptomonedas",
    SSG: "Listado de ciudades o monedas",
    ISR: "Detalle con datos cacheados",
    SSR: "Valor actual según tu ubicación",
    CSR: "Gráfica en tiempo real",
  },
];

export default function ComparativaPage() {
  return (
    <>
      <header className="encabezado-seccion">
        <h1>Comparativa de patrones de rendering</h1>
        <p>
          Este medidor pide las cuatro secciones del portal desde tu navegador, igual que lo haría un visitante, y
          analiza lo que devuelve el servidor.
        </p>
      </header>

      <Medidor />

      <section className="bloque">
        <h2>Resumen teórico</h2>
        <div className="tabla-scroll">
          <table className="tabla">
            <thead>
              <tr>
                <th scope="col">Criterio</th>
                {ORDEN.map((p) => (
                  <th scope="col" key={p}>
                    <span className={`badge badge--${p.toLowerCase()}`}>{p}</span>
                    <small>{PATRONES[p].nombre}</small>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FILAS.map((f) => (
                <tr key={f.campo}>
                  <th scope="row">{f.etiqueta}</th>
                  {ORDEN.map((p) => (
                    <td key={p}>{PATRONES[p][f.campo]}</td>
                  ))}
                </tr>
              ))}
              <tr>
                <th scope="row">¿Por qué aquí?</th>
                {ORDEN.map((p) => (
                  <td key={p}>{PATRONES[p].porQue}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="bloque">
        <h2>El mismo razonamiento en otros casos de estudio</h2>
        <div className="tabla-scroll">
          <table className="tabla">
            <thead>
              <tr>
                <th scope="col">Caso</th>
                {ORDEN.map((p) => (
                  <th scope="col" key={p}>
                    <span className={`badge badge--${p.toLowerCase()}`}>{p}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {OTROS_CASOS.map((c) => (
                <tr key={c.caso}>
                  <th scope="row">{c.caso}</th>
                  {ORDEN.map((p) => (
                    <td key={p}>{c[p]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="nota">
          Regla práctica: si el contenido es igual para todos y casi no cambia → SSG. Si es igual para todos pero
          cambia cada cierto tiempo → ISR. Si depende de quién pide o de la petición → SSR. Si cambia cada segundo o es
          muy interactivo y no necesita SEO → CSR.
        </p>
      </section>
    </>
  );
}

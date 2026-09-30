// ============================================================================
// BÚSQUEDA — SSR (Server-Side Rendering)
// ----------------------------------------------------------------------------
// Se renderiza en el servidor en CADA petición. Depende de datos que solo
// existen en el momento de la visita: los parámetros ?q=&categoria= y las
// cabeceras HTTP (ciudad detectada por IP, navegador).
// ============================================================================

import type { Metadata } from "next";
import { headers } from "next/headers";
import { NoticiaCard } from "@/components/NoticiaCard";
import { RenderPanel } from "@/components/RenderPanel";
import { buscarNoticias, CATEGORIAS, CIUDADES, noticiasPorCiudad } from "@/lib/noticias";

export const dynamic = "force-dynamic"; // nunca cachear: renderizar por petición

export const metadata: Metadata = { title: "Buscar noticias" };

const texto = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() ?? "";

function navegador(ua: string) {
  if (/edg\//i.test(ua)) return "Edge";
  if (/chrome\//i.test(ua)) return "Chrome";
  if (/firefox\//i.test(ua)) return "Firefox";
  if (/safari\//i.test(ua)) return "Safari";
  return ua ? "Otro" : "Desconocido";
}

export default async function BuscarPage({ searchParams }: PageProps<"/buscar">) {
  const params = await searchParams;
  const q = texto(params.q);
  const categoria = texto(params.categoria);
  const ciudadElegida = texto(params.ciudad);

  const cabeceras = await headers();
  const ciudadIP = cabeceras.get("x-vercel-ip-city");
  const ciudad = ciudadElegida || (ciudadIP ? decodeURIComponent(ciudadIP) : "Bogotá");
  const origenCiudad = ciudadElegida
    ? "elegida en el formulario"
    : ciudadIP
      ? "detectada por IP (x-vercel-ip-city)"
      : "por defecto (sin cabecera de geolocalización)";

  const [resultados, cercanas] = await Promise.all([
    buscarNoticias(q, (CATEGORIAS as string[]).includes(categoria) ? categoria : undefined),
    noticiasPorCiudad(ciudad),
  ]);
  const generadoEn = new Date().toISOString();

  return (
    <>
      <RenderPanel
        patron="SSR"
        generadoEn={generadoEn}
        detalles={[
          { etiqueta: "Búsqueda recibida", valor: q ? `«${q}»` : "(vacía)" },
          { etiqueta: "Tu ciudad", valor: `${ciudad} — ${origenCiudad}` },
          { etiqueta: "Tu navegador (user-agent)", valor: navegador(cabeceras.get("user-agent") ?? "") },
        ]}
      />

      <header className="encabezado-seccion">
        <h1>Buscar noticias</h1>
        <p>El servidor arma esta página a la medida de cada petición.</p>
      </header>

      <form className="buscador" action="/buscar" method="get">
        <label>
          <span>Palabra clave</span>
          <input type="search" name="q" defaultValue={q} placeholder="Ej. programación, café, Cali…" />
        </label>
        <label>
          <span>Categoría</span>
          <select name="categoria" defaultValue={categoria}>
            <option value="">Todas</option>
            {CATEGORIAS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Ciudad</span>
          <select name="ciudad" defaultValue={ciudadElegida}>
            <option value="">Automática</option>
            {CIUDADES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <button type="submit" className="boton">
          Buscar
        </button>
      </form>

      <section className="bloque">
        <h2>Cerca de ti: {ciudad}</h2>
        {cercanas.hayLocales ? (
          <div className="rejilla" data-contenido="noticias">
            {cercanas.locales.map((n) => (
              <NoticiaCard key={n.slug} noticia={n} href={`/noticia/${n.slug}`} />
            ))}
          </div>
        ) : (
          <p className="vacio">
            No tenemos noticias de {ciudad} por ahora. Prueba eligiendo otra ciudad en el formulario.
          </p>
        )}
      </section>

      <section className="bloque">
        <h2>
          {resultados.length} {resultados.length === 1 ? "resultado" : "resultados"}
          {q && <> para «{q}»</>}
          {categoria && <> en {categoria}</>}
        </h2>
        {resultados.length > 0 ? (
          <div className="rejilla" data-contenido="noticias">
            {resultados.map((n) => (
              <NoticiaCard key={n.slug} noticia={n} href={`/noticia/${n.slug}`} />
            ))}
          </div>
        ) : (
          <p className="vacio">No encontramos noticias con esos filtros.</p>
        )}
      </section>
    </>
  );
}

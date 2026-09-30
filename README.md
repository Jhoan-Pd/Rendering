# Diario Render — los 4 patrones de rendering en Next.js

Portal de noticias (ficticias) donde cada sección usa un patrón de rendering distinto.
Cada página muestra un **panel** con dónde y cuándo se generó su HTML, y la sección
**/comparativa** mide las cuatro rutas en vivo.

| Patrón | Sección | Archivo | Cómo se declara |
|---|---|---|---|
| **SSG** | Archivo histórico `/archivo` | `src/app/archivo/` | `dynamic = "force-static"` + `generateStaticParams` |
| **ISR** | Portada `/` y notas `/noticia/[slug]` | `src/app/page.tsx`, `src/app/noticia/` | `revalidate = 30` / `60` + `revalidatePath` (on-demand) |
| **SSR** | Búsqueda `/buscar` | `src/app/buscar/page.tsx` | `dynamic = "force-dynamic"` + `searchParams` y `headers()` |
| **CSR** | En vivo `/en-vivo` | `src/app/en-vivo/` | `"use client"` + `next/dynamic` con `ssr: false` + `fetch` al API |

Los datos salen de una "base de datos" simulada (`src/lib/noticias.ts`) con 400 ms de
latencia y métricas que cambian con la hora, y de dos API internas (`/api/noticias`,
`/api/en-vivo`). No necesita llaves ni servicios externos.

## Correr en tu computador

Requiere Node.js 20.9 o superior.

```bash
npm install
npm run build
npm start          # http://localhost:3000
```

> Usa `build` + `start`. Con `npm run dev` Next.js renderiza todo en cada petición,
> así que SSG e ISR se comportan como SSR.

## Desplegar en Vercel (gratis)

1. Sube esta carpeta a un repositorio de GitHub.
2. Entra a <https://vercel.com/new>, inicia sesión con GitHub e importa el repositorio.
3. Deja la configuración por defecto (Vercel detecta Next.js) y pulsa **Deploy**.

En Vercel la sección de búsqueda detecta tu ciudad con la cabecera `x-vercel-ip-city`,
y la comparativa muestra la cabecera `x-vercel-cache` (HIT / STALE / MISS / PRERENDER).

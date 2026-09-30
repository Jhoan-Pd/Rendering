export type Patron = "SSG" | "ISR" | "SSR" | "CSR";

export interface InfoPatron {
  sigla: Patron;
  nombre: string;
  donde: string;
  cuando: string;
  seo: string;
  frescura: string;
  costo: string;
  seccion: string;
  ruta: string;
  porQue: string;
}

export const PATRONES: Record<Patron, InfoPatron> = {
  SSG: {
    sigla: "SSG",
    nombre: "Static Site Generation",
    donde: "En el build (una sola vez)",
    cuando: "Al ejecutar next build",
    seo: "Excelente: el HTML trae todo el contenido",
    frescura: "Congelada hasta el próximo despliegue",
    costo: "Casi cero: se sirve un archivo desde la CDN",
    seccion: "Archivo histórico",
    ruta: "/archivo",
    porQue:
      "Las notas de archivo no cambian nunca. Generarlas una vez en el build las hace instantáneas y baratas de servir.",
  },
  ISR: {
    sigla: "ISR",
    nombre: "Incremental Static Regeneration",
    donde: "En el servidor, y luego se cachea",
    cuando: "En el build y, después, como máximo cada N segundos",
    seo: "Excelente: el HTML trae todo el contenido",
    frescura: "Casi fresca: puede tener hasta N segundos de retraso",
    costo: "Bajo: una regeneración por ventana de tiempo",
    seccion: "Portada y notas",
    ruta: "/",
    porQue:
      "La portada recibe mucho tráfico y cambia cada pocos minutos. ISR la sirve como estática y la regenera en segundo plano, sin redeploy.",
  },
  SSR: {
    sigla: "SSR",
    nombre: "Server-Side Rendering",
    donde: "En el servidor, en cada petición",
    cuando: "Cada vez que alguien pide la página",
    seo: "Excelente: el HTML trae todo el contenido",
    frescura: "Totalmente fresca y personalizada",
    costo: "Alto: el servidor trabaja en cada visita",
    seccion: "Búsqueda y noticias cercanas",
    ruta: "/buscar",
    porQue:
      "Los resultados dependen de lo que escribe el usuario (?q=) y de su ciudad (cabecera de la petición). Es imposible precalcularlos.",
  },
  CSR: {
    sigla: "CSR",
    nombre: "Client-Side Rendering",
    donde: "En el navegador (JavaScript)",
    cuando: "Después de cargar la página, con fetch al API",
    seo: "Pobre: el HTML inicial llega sin las noticias",
    frescura: "En tiempo real (polling cada pocos segundos)",
    costo: "Bajo en servidor, más trabajo en el dispositivo",
    seccion: "Minuto a minuto en vivo",
    ruta: "/en-vivo",
    porQue:
      "El marcador cambia cada pocos segundos y la página es muy interactiva. No necesita SEO, así que el navegador pide los datos y se actualiza solo.",
  },
};

export const ORDEN: Patron[] = ["SSG", "ISR", "SSR", "CSR"];

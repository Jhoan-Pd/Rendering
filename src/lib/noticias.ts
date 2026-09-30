// "Base de datos" simulada del portal. Todas las noticias son FICTICIAS y existen
// solo con fines académicos. Algunas métricas (lecturas, lectores, última hora)
// se calculan a partir de la hora actual para que se note cuándo fue generada
// cada página: así se ve la diferencia entre SSG, ISR, SSR y CSR.

import { esperar, msDesdeMedianoche } from "./tiempo";

/** Latencia artificial de la "base de datos", para que el costo de cada patrón sea visible. */
export const LATENCIA_DB_MS = 400;

export type Categoria =
  | "Tecnología"
  | "Deportes"
  | "Cultura"
  | "Economía"
  | "Ciencia"
  | "Educación";

export const CATEGORIAS: Categoria[] = [
  "Tecnología",
  "Deportes",
  "Cultura",
  "Economía",
  "Ciencia",
  "Educación",
];

interface NoticiaBase {
  slug: string;
  titulo: string;
  resumen: string;
  cuerpo: string[];
  categoria: Categoria;
  ciudad: string;
  autor: string;
}

interface NoticiaActualBase extends NoticiaBase {
  /** Minutos antes de "ahora" en que se publicó (las noticias siempre parecen recientes). */
  minutosAtras: number;
}

interface NotaArchivoBase extends NoticiaBase {
  /** Fecha fija: el archivo nunca cambia. */
  publicada: string;
}

export interface Noticia extends NoticiaBase {
  publicada: string;
  lecturasHoy: number;
  lectoresAhora: number;
}

export interface NotaArchivo extends NoticiaBase {
  publicada: string;
}

// ---------------------------------------------------------------------------
// Datos
// ---------------------------------------------------------------------------

const ACTUALES: NoticiaActualBase[] = [
  {
    slug: "final-liga-universitaria-medellin",
    titulo: "La Liga Universitaria define a su campeón este fin de semana en Medellín",
    resumen:
      "Leones FC y Halcones del Norte llegan invictos a una final que ya agotó la boletería.",
    cuerpo: [
      "Después de catorce fechas, la Liga Universitaria de Fútbol tendrá una final inédita entre Leones FC y Halcones del Norte, los dos equipos que terminaron la temporada sin derrotas.",
      "La organización confirmó que las 8.000 entradas disponibles se agotaron en menos de dos horas y que el partido será transmitido en vivo por las emisoras universitarias.",
      "Los entrenadores coinciden en que la clave estará en el mediocampo. «Ellos presionan muy arriba; nosotros tenemos que ser pacientes», dijo el técnico de Leones FC.",
    ],
    categoria: "Deportes",
    ciudad: "Medellín",
    autor: "Laura Méndez",
    minutosAtras: 25,
  },
  {
    slug: "riego-inteligente-cali",
    titulo: "Estudiantes de Cali crean un sistema de riego inteligente que ahorra 40 % de agua",
    resumen:
      "Sensores de humedad de bajo costo y una app deciden cuándo regar los cultivos urbanos.",
    cuerpo: [
      "Un grupo de estudiantes de ingeniería desarrolló un prototipo que combina sensores de humedad del suelo, un microcontrolador y una aplicación web para automatizar el riego de huertas urbanas.",
      "En las pruebas realizadas durante seis meses en tres huertas comunitarias, el sistema redujo el consumo de agua en un 40 % sin afectar el rendimiento de las cosechas.",
      "El equipo planea liberar el diseño como hardware abierto para que otras comunidades puedan replicarlo con piezas que cuestan menos de 150.000 pesos.",
    ],
    categoria: "Tecnología",
    ciudad: "Cali",
    autor: "Andrés Quintero",
    minutosAtras: 70,
  },
  {
    slug: "festival-cine-barranquilla",
    titulo: "Festival de cine independiente abre convocatoria para cortometrajes universitarios",
    resumen:
      "Las obras seleccionadas se proyectarán en plazas públicas de Barranquilla durante una semana.",
    cuerpo: [
      "El Festival de Cine Independiente del Caribe abrió su convocatoria para cortometrajes de ficción, documental y animación realizados por estudiantes universitarios.",
      "Los trabajos deben tener una duración máxima de 15 minutos. Un jurado de realizadores regionales elegirá 20 obras que se proyectarán gratis en plazas y parques.",
      "La convocatoria estará abierta durante un mes y el formulario de inscripción está disponible en la página del festival.",
    ],
    categoria: "Cultura",
    ciudad: "Barranquilla",
    autor: "Camila Ortega",
    minutosAtras: 110,
  },
  {
    slug: "credito-educativo-tasas",
    titulo: "Nuevas líneas de crédito educativo llegan con tasas más bajas",
    resumen:
      "Las entidades financieras ampliaron los plazos de pago y reducen la cuota inicial para estudiantes.",
    cuerpo: [
      "Varias entidades financieras anunciaron líneas de crédito educativo con tasas menores a las del año pasado y plazos de pago de hasta diez años.",
      "Además, la cuota inicial dejará de ser obligatoria para programas de pregrado en universidades acreditadas.",
      "Los expertos recomiendan comparar el costo total del crédito, y no solo la tasa, antes de firmar.",
    ],
    categoria: "Economía",
    ciudad: "Bogotá",
    autor: "Sergio Patiño",
    minutosAtras: 150,
  },
  {
    slug: "nueva-especie-rana-santander",
    titulo: "Investigadores registran una nueva especie de rana en los bosques de Santander",
    resumen:
      "El anfibio, de apenas dos centímetros, fue identificado gracias a su canto.",
    cuerpo: [
      "Un equipo de biólogos identificó una nueva especie de rana en un bosque de niebla cercano a Bucaramanga. El hallazgo se logró comparando grabaciones de su canto con las de especies conocidas.",
      "La rana mide unos dos centímetros y vive entre la hojarasca. Los investigadores advierten que su hábitat es pequeño y está amenazado por la deforestación.",
      "El estudio propone incluir la zona en un plan de conservación regional.",
    ],
    categoria: "Ciencia",
    ciudad: "Bucaramanga",
    autor: "Natalia Rueda",
    minutosAtras: 200,
  },
  {
    slug: "maraton-programacion-pasto",
    titulo: "Maratón de programación reúne a 300 estudiantes del sur del país",
    resumen:
      "Durante 24 horas, equipos de tres personas resolvieron retos de algoritmos y desarrollo web.",
    cuerpo: [
      "La maratón de programación del sur del país reunió a 100 equipos de tres estudiantes que durante 24 horas resolvieron problemas de algoritmos, estructuras de datos y desarrollo web.",
      "Uno de los retos más comentados pedía construir la misma página con cuatro estrategias de renderizado y medir su tiempo de respuesta.",
      "Los tres primeros equipos representarán a la región en la competencia nacional.",
    ],
    categoria: "Educación",
    ciudad: "Pasto",
    autor: "Julián Erazo",
    minutosAtras: 260,
  },
  {
    slug: "app-ciclorrutas-bogota",
    titulo: "Una app colaborativa mapea en tiempo real el estado de las ciclorrutas",
    resumen:
      "Los ciclistas reportan huecos, obras y zonas oscuras; los datos quedan abiertos para todos.",
    cuerpo: [
      "Una aplicación creada por una comunidad de ciclistas permite reportar en segundos huecos, obras, falta de iluminación o bloqueos en las ciclorrutas.",
      "Los reportes aparecen en un mapa en tiempo real y se publican como datos abiertos, para que cualquiera pueda analizarlos.",
      "Sus creadores esperan que la información sirva para priorizar el mantenimiento de la red.",
    ],
    categoria: "Tecnología",
    ciudad: "Bogotá",
    autor: "Valentina Rojas",
    minutosAtras: 320,
  },
  {
    slug: "cafe-exportacion-cooperativas",
    titulo: "Pequeños productores de café logran una exportación récord gracias a su cooperativa",
    resumen:
      "Más de 200 familias se unieron para vender directamente a tostadores del exterior.",
    cuerpo: [
      "Una cooperativa de pequeños caficultores logró su mayor envío al exterior: 18 contenedores de café especial vendidos directamente a tostadores.",
      "Al eliminar intermediarios, las familias recibieron un precio hasta 30 % mayor que el del mercado local.",
      "La cooperativa planea invertir parte de las ganancias en un laboratorio de catación.",
    ],
    categoria: "Economía",
    ciudad: "Manizales",
    autor: "Diego Arango",
    minutosAtras: 390,
  },
  {
    slug: "noche-astronomica-villa-de-leyva",
    titulo: "Noche de observación astronómica abierta al público en Villa de Leyva",
    resumen:
      "Telescopios, charlas y un taller para aprender a fotografiar el cielo con el celular.",
    cuerpo: [
      "Aficionados y estudiantes de física organizan una noche de observación astronómica gratuita, con telescopios disponibles para el público.",
      "La jornada incluye una charla sobre cómo se forman las estrellas y un taller de astrofotografía con teléfonos móviles.",
      "Los organizadores recomiendan llevar ropa abrigada y linterna de luz roja.",
    ],
    categoria: "Ciencia",
    ciudad: "Tunja",
    autor: "Mariana Castro",
    minutosAtras: 450,
  },
  {
    slug: "sinfonica-juvenil-costa",
    titulo: "Orquesta sinfónica juvenil llevará conciertos gratuitos a cinco ciudades de la costa",
    resumen:
      "El repertorio mezcla música clásica con cumbia, porro y vallenato.",
    cuerpo: [
      "La orquesta sinfónica juvenil, integrada por 60 músicos de entre 14 y 24 años, inicia una gira gratuita por cinco ciudades del Caribe.",
      "El repertorio combina obras clásicas con arreglos sinfónicos de cumbia, porro y vallenato.",
      "El primer concierto será en Santa Marta, en un escenario al aire libre frente al mar.",
    ],
    categoria: "Cultura",
    ciudad: "Santa Marta",
    autor: "Jorge Palencia",
    minutosAtras: 520,
  },
];

const ARCHIVO: NotaArchivoBase[] = [
  {
    slug: "primer-hackaton-universitario-2015",
    titulo: "Así se vivió el primer hackatón universitario de la ciudad",
    resumen: "40 equipos, 36 horas y mucho café: crónica de una noche que se volvió tradición.",
    cuerpo: [
      "En 2015, 40 equipos de estudiantes se encerraron durante 36 horas para construir aplicaciones que resolvieran problemas de su barrio.",
      "El proyecto ganador fue un sistema de alertas por mensajes de texto para avisar sobre cortes de agua.",
      "Lo que empezó como un experimento se convirtió en un evento anual que hoy reúne a más de mil participantes.",
    ],
    categoria: "Tecnología",
    ciudad: "Bogotá",
    autor: "Redacción Diario Render",
    publicada: "2015-04-18T15:00:00.000Z",
  },
  {
    slug: "leones-fc-primer-titulo-2018",
    titulo: "Leones FC gana su primer título de la Liga Universitaria",
    resumen: "Un gol en el último minuto selló una temporada histórica.",
    cuerpo: [
      "Leones FC venció 2-1 a Cóndores FC con un gol en el minuto 90 y conquistó su primer título de la Liga Universitaria.",
      "El equipo había terminado último apenas dos temporadas antes.",
      "La celebración se extendió por todo el campus hasta la madrugada.",
    ],
    categoria: "Deportes",
    ciudad: "Medellín",
    autor: "Redacción Diario Render",
    publicada: "2018-11-24T23:30:00.000Z",
  },
  {
    slug: "biblioteca-digital-comunitaria-2019",
    titulo: "Abre la primera biblioteca digital comunitaria del barrio",
    resumen: "Veinte computadores, conexión gratuita y cursos para adultos mayores.",
    cuerpo: [
      "Una junta de acción comunal inauguró una biblioteca digital con veinte computadores donados y conexión a internet gratuita.",
      "Además de préstamo de libros electrónicos, ofrece cursos de alfabetización digital para adultos mayores.",
      "Estudiantes voluntarios dictan las clases los fines de semana.",
    ],
    categoria: "Educación",
    ciudad: "Cali",
    autor: "Redacción Diario Render",
    publicada: "2019-08-03T14:00:00.000Z",
  },
  {
    slug: "semestre-desde-casa-2020",
    titulo: "Un semestre entero desde casa: lecciones de las clases remotas",
    resumen: "Profesores y estudiantes cuentan qué funcionó y qué no.",
    cuerpo: [
      "Tras un semestre completo de clases remotas, profesores y estudiantes hicieron un balance de la experiencia.",
      "Las grabaciones de las clases y los foros en línea fueron lo mejor valorado; la conectividad y el cansancio frente a la pantalla, lo peor.",
      "Muchos docentes aseguran que mantendrán parte de las herramientas digitales cuando vuelvan a las aulas.",
    ],
    categoria: "Educación",
    ciudad: "Bucaramanga",
    autor: "Redacción Diario Render",
    publicada: "2020-07-10T16:00:00.000Z",
  },
  {
    slug: "mural-colectivo-2021",
    titulo: "Cien artistas pintan el mural colectivo más largo de la ciudad",
    resumen: "Casi un kilómetro de pared transformado en una galería al aire libre.",
    cuerpo: [
      "Cien artistas urbanos trabajaron durante tres semanas para cubrir casi un kilómetro de muro con escenas de la historia del barrio.",
      "Los vecinos participaron eligiendo los temas y aportando fotografías antiguas.",
      "El mural se convirtió en un recorrido turístico guiado por jóvenes de la zona.",
    ],
    categoria: "Cultura",
    ciudad: "Barranquilla",
    autor: "Redacción Diario Render",
    publicada: "2021-10-02T17:00:00.000Z",
  },
  {
    slug: "feria-emprendimiento-estudiantil-2022",
    titulo: "La feria de emprendimiento estudiantil cierra con 120 proyectos",
    resumen: "Alimentos, moda sostenible y software fueron los sectores con más propuestas.",
    cuerpo: [
      "La feria de emprendimiento estudiantil reunió 120 proyectos en tres días y recibió a más de 5.000 visitantes.",
      "Alimentos saludables, moda sostenible y desarrollo de software fueron los sectores con más propuestas.",
      "Diez emprendimientos recibieron capital semilla para comenzar a operar.",
    ],
    categoria: "Economía",
    ciudad: "Pasto",
    autor: "Redacción Diario Render",
    publicada: "2022-05-20T19:00:00.000Z",
  },
];

const ULTIMA_HORA = [
  "Se agotan los cupos para la maratón de programación",
  "Leones FC confirma su alineación titular para la final",
  "Nuevo récord de asistentes en el festival de cine independiente",
  "La lluvia obliga a reprogramar la noche astronómica",
  "Abren 500 cupos adicionales de crédito educativo",
  "La app de ciclorrutas supera los 10.000 reportes",
  "La cooperativa cafetera anuncia un segundo envío al exterior",
  "La orquesta juvenil agrega una fecha extra en Santa Marta",
];

// ---------------------------------------------------------------------------
// Métricas que cambian con el tiempo
// ---------------------------------------------------------------------------

function hash(texto: string) {
  let h = 0;
  for (let i = 0; i < texto.length; i++) h = (h * 31 + texto.charCodeAt(i)) >>> 0;
  return h;
}

/** Lecturas acumuladas hoy: crecen segundo a segundo y se reinician a medianoche. */
function lecturasHoy(slug: string, ahora: number) {
  const h = hash(slug);
  const base = 300 + (h % 900);
  const porMinuto = 4 + (h % 17);
  return base + Math.floor((msDesdeMedianoche(ahora) / 60_000) * porMinuto);
}

/** Lectores en este momento: suben y bajan en ciclos de pocos minutos. */
function lectoresAhora(slug: string, ahora: number) {
  const h = hash(slug);
  const fase = (h % 628) / 100;
  const periodo = 120 + (h % 180); // segundos
  const onda = Math.sin((ahora / 1000 / periodo) * 2 * Math.PI + fase);
  return Math.round(40 + (h % 60) + 90 * (0.5 + 0.5 * onda));
}

function conMetricas(n: NoticiaActualBase, ahora: number): Noticia {
  const { minutosAtras, ...resto } = n;
  // Se redondea a 5 minutos para que la hora de publicación sea "limpia".
  const publicada = Math.floor((ahora - minutosAtras * 60_000) / 300_000) * 300_000;
  return {
    ...resto,
    publicada: new Date(publicada).toISOString(),
    lecturasHoy: lecturasHoy(n.slug, ahora),
    lectoresAhora: lectoresAhora(n.slug, ahora),
  };
}

const normalizar = (t: string) =>
  t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

// ---------------------------------------------------------------------------
// "Consultas" (todas pagan la latencia simulada)
// ---------------------------------------------------------------------------

export interface Portada {
  consultadoEn: string;
  ultimaHora: { texto: string; hora: string };
  noticias: Noticia[];
  masLeidas: Noticia[];
}

export async function obtenerPortada(): Promise<Portada> {
  await esperar(LATENCIA_DB_MS);
  const ahora = Date.now();
  const noticias = ACTUALES.map((n) => conMetricas(n, ahora));
  const minuto = Math.floor(ahora / 60_000);
  return {
    consultadoEn: new Date(ahora).toISOString(),
    ultimaHora: {
      texto: ULTIMA_HORA[minuto % ULTIMA_HORA.length],
      hora: new Date(minuto * 60_000).toISOString(),
    },
    noticias,
    masLeidas: [...noticias].sort((a, b) => b.lectoresAhora - a.lectoresAhora).slice(0, 5),
  };
}

export async function obtenerNoticia(slug: string) {
  await esperar(LATENCIA_DB_MS);
  const ahora = Date.now();
  const base = ACTUALES.find((n) => n.slug === slug);
  if (!base) return null;
  const noticia = conMetricas(base, ahora);
  const relacionadas = ACTUALES.filter(
    (n) => n.slug !== slug && n.categoria === base.categoria,
  ).map((n) => conMetricas(n, ahora));
  return { noticia, relacionadas, consultadoEn: new Date(ahora).toISOString() };
}

export function slugsActuales() {
  return ACTUALES.map((n) => n.slug);
}

export async function tendenciasAhora(): Promise<Noticia[]> {
  await esperar(LATENCIA_DB_MS);
  const ahora = Date.now();
  return ACTUALES.map((n) => conMetricas(n, ahora))
    .sort((a, b) => b.lectoresAhora - a.lectoresAhora)
    .slice(0, 5);
}

export async function buscarNoticias(q: string, categoria?: string): Promise<Noticia[]> {
  await esperar(LATENCIA_DB_MS);
  const ahora = Date.now();
  const termino = normalizar(q);
  return ACTUALES.map((n) => conMetricas(n, ahora)).filter((n) => {
    const coincideCategoria = !categoria || n.categoria === categoria;
    const texto = normalizar(`${n.titulo} ${n.resumen} ${n.ciudad} ${n.categoria}`);
    return coincideCategoria && (!termino || texto.includes(termino));
  });
}

export async function noticiasPorCiudad(ciudad: string) {
  await esperar(LATENCIA_DB_MS / 2);
  const ahora = Date.now();
  const buscada = normalizar(ciudad);
  const todas = ACTUALES.map((n) => conMetricas(n, ahora));
  const locales = todas.filter((n) => normalizar(n.ciudad) === buscada);
  return { locales, hayLocales: locales.length > 0 };
}

export const CIUDADES = Array.from(new Set(ACTUALES.map((n) => n.ciudad))).sort();

export async function obtenerArchivo(): Promise<NotaArchivo[]> {
  await esperar(LATENCIA_DB_MS);
  return [...ARCHIVO].sort((a, b) => b.publicada.localeCompare(a.publicada));
}

export async function obtenerNotaArchivo(slug: string): Promise<NotaArchivo | null> {
  await esperar(LATENCIA_DB_MS);
  return ARCHIVO.find((n) => n.slug === slug) ?? null;
}

export function slugsArchivo() {
  return ARCHIVO.map((n) => n.slug);
}

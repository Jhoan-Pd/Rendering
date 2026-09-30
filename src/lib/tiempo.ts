// Utilidades de fecha/hora con zona horaria fija de Colombia (UTC-5, sin horario de verano).
// Se formatea "a mano" para que el servidor y el navegador produzcan exactamente
// el mismo texto y no haya errores de hidratación.

const OFFSET_BOGOTA_MS = -5 * 60 * 60 * 1000;

const MESES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

const dos = (n: number) => String(n).padStart(2, "0");

function enBogota(fecha: string | number | Date) {
  return new Date(new Date(fecha).getTime() + OFFSET_BOGOTA_MS);
}

/** "14:05:09" */
export function hora(fecha: string | number | Date) {
  const d = enBogota(fecha);
  return `${dos(d.getUTCHours())}:${dos(d.getUTCMinutes())}:${dos(d.getUTCSeconds())}`;
}

/** "14:05" */
export function horaCorta(fecha: string | number | Date) {
  const d = enBogota(fecha);
  return `${dos(d.getUTCHours())}:${dos(d.getUTCMinutes())}`;
}

/** "29 sep 2026" */
export function fecha(fecha: string | number | Date) {
  const d = enBogota(fecha);
  return `${d.getUTCDate()} ${MESES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "29 sep 2026, 14:05:09" */
export function fechaHora(valor: string | number | Date) {
  return `${fecha(valor)}, ${hora(valor)}`;
}

/** Milisegundos transcurridos desde la medianoche de hoy en Bogotá. */
export function msDesdeMedianoche(ahora: number) {
  const d = enBogota(ahora);
  return (
    d.getUTCHours() * 3_600_000 +
    d.getUTCMinutes() * 60_000 +
    d.getUTCSeconds() * 1000 +
    d.getUTCMilliseconds()
  );
}

/** "hace 12 s", "hace 3 min", "hace 2 h", "hace 4 días" */
export function hace(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return `hace ${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `hace ${m} min ${s % 60} s`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h ${m % 60} min`;
  const d = Math.floor(h / 24);
  return `hace ${d} ${d === 1 ? "día" : "días"}`;
}

export const esperar = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

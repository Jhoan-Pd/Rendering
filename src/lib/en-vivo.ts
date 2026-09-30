// Simulación de un partido "en vivo". Cada ciclo de 30 minutos reales se juega
// un partido completo: 1 minuto de juego = 15 segundos reales. Los eventos son
// deterministas (dependen del número de ciclo), así que todas las instancias del
// servidor —y todos los usuarios— ven el mismo partido.

const CICLO_S = 30 * 60;
const SEGUNDOS_POR_MINUTO = 15;

const EQUIPOS = [
  "Leones FC",
  "Halcones del Norte",
  "Tigres Andinos",
  "Cóndores FC",
  "Pumas del Valle",
  "Delfines del Caribe",
];

const JUGADORES = [
  "Ramírez", "Ospina", "Cárdenas", "Mosquera", "Valencia", "Herrera",
  "Muñoz", "Benítez", "Lozano", "Arboleda", "Pineda", "Zapata",
];

export type TipoEvento = "inicio" | "gol" | "amarilla" | "ocasion" | "atajada" | "cambio" | "descanso" | "final";

export interface Evento {
  minuto: number;
  tipo: TipoEvento;
  equipo?: "local" | "visitante";
  texto: string;
}

export interface EstadoPartido {
  local: string;
  visitante: string;
  minuto: number;
  estado: "En juego" | "Descanso" | "Finalizado";
  marcador: { local: number; visitante: number };
  posesionLocal: number;
  eventos: Evento[];
  servidorEn: string;
  siguientePartidoEn: string;
}

function mulberry32(semilla: number) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function guionDelPartido(ciclo: number) {
  const rnd = mulberry32(ciclo * 7919);
  const i = ciclo % EQUIPOS.length;
  const local = EQUIPOS[i];
  const visitante = EQUIPOS[(i + 1 + (ciclo % (EQUIPOS.length - 1))) % EQUIPOS.length];
  const nombre = (e: "local" | "visitante") => (e === "local" ? local : visitante);
  const jugador = () => JUGADORES[Math.floor(rnd() * JUGADORES.length)];
  const lado = (): "local" | "visitante" => (rnd() < 0.5 ? "local" : "visitante");

  const eventos: Evento[] = [{ minuto: 1, tipo: "inicio", texto: "¡Rueda el balón! Comienza el partido." }];

  for (let m = 2; m <= 89; m++) {
    if (m === 45) {
      eventos.push({ minuto: 45, tipo: "descanso", texto: "Final del primer tiempo. Los equipos se van al descanso." });
      continue;
    }
    if (m === 46) {
      eventos.push({ minuto: 46, tipo: "inicio", texto: "Arranca el segundo tiempo." });
      continue;
    }
    const r = rnd();
    const e = lado();
    if (r < 0.03) {
      eventos.push({ minuto: m, tipo: "gol", equipo: e, texto: `¡Gooool de ${nombre(e)}! ${jugador()} define con un remate cruzado.` });
    } else if (r < 0.07) {
      eventos.push({ minuto: m, tipo: "amarilla", equipo: e, texto: `Tarjeta amarilla para ${jugador()} (${nombre(e)}).` });
    } else if (r < 0.14) {
      eventos.push({ minuto: m, tipo: "ocasion", equipo: e, texto: `¡Casi! ${jugador()} (${nombre(e)}) remata y el balón pasa rozando el palo.` });
    } else if (r < 0.18) {
      eventos.push({ minuto: m, tipo: "atajada", equipo: e, texto: `Gran atajada del arquero de ${nombre(e)}.` });
    } else if (m > 55 && r < 0.23) {
      eventos.push({ minuto: m, tipo: "cambio", equipo: e, texto: `Cambio en ${nombre(e)}: entra ${jugador()}.` });
    }
  }
  eventos.push({ minuto: 90, tipo: "final", texto: "¡Pitazo final! Termina el partido." });
  return { local, visitante, eventos };
}

export function estadoPartido(ahora = Date.now()): EstadoPartido {
  const segundos = Math.floor(ahora / 1000);
  const ciclo = Math.floor(segundos / CICLO_S);
  const enCiclo = segundos % CICLO_S;
  const minuto = Math.min(90, Math.floor(enCiclo / SEGUNDOS_POR_MINUTO) + 1);
  const finalizado = enCiclo >= 90 * SEGUNDOS_POR_MINUTO;

  const { local, visitante, eventos } = guionDelPartido(ciclo);
  const visibles = eventos.filter((e) => e.minuto <= minuto && (e.tipo !== "final" || finalizado));

  const marcador = { local: 0, visitante: 0 };
  for (const e of visibles) if (e.tipo === "gol" && e.equipo) marcador[e.equipo]++;

  const posesionLocal = Math.round(50 + 12 * Math.sin(segundos / 40 + ciclo));

  return {
    local,
    visitante,
    minuto,
    estado: finalizado ? "Finalizado" : minuto === 45 ? "Descanso" : "En juego",
    marcador,
    posesionLocal,
    eventos: visibles.reverse(),
    servidorEn: new Date(ahora).toISOString(),
    siguientePartidoEn: new Date((ciclo + 1) * CICLO_S * 1000).toISOString(),
  };
}

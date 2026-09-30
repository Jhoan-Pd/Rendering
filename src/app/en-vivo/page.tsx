// ============================================================================
// EN VIVO — CSR (Client-Side Rendering)
// ----------------------------------------------------------------------------
// El servidor solo entrega un "cascarón" (layout + esqueleto de carga). El
// componente del partido se descarga como JavaScript, se ejecuta en el
// navegador y pide los datos al API (/api/en-vivo) cada 5 segundos.
// ============================================================================

import type { Metadata } from "next";
import { EnVivoCliente } from "./EnVivoCliente";

export const metadata: Metadata = { title: "Minuto a minuto en vivo" };

export default function EnVivoPage() {
  return (
    <>
      <header className="encabezado-seccion">
        <h1>Minuto a minuto</h1>
        <p>
          Final de la Liga Universitaria (simulada): cada minuto de juego dura 15 segundos reales. Todo lo que ves
          abajo lo dibuja tu navegador.
        </p>
      </header>
      <EnVivoCliente />
    </>
  );
}

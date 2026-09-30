"use client";

import dynamic from "next/dynamic";

// ssr: false -> este componente NO se renderiza en el servidor. El HTML inicial
// solo trae el esqueleto de carga; el resto ocurre 100 % en el navegador.
const EnVivo = dynamic(() => import("./EnVivo"), {
  ssr: false,
  loading: () => <Esqueleto />,
});

export function EnVivoCliente() {
  return <EnVivo />;
}

function Esqueleto() {
  return (
    <div className="esqueleto" aria-busy="true" aria-live="polite">
      <div className="esqueleto__barra esqueleto__barra--panel" />
      <p className="esqueleto__texto">Descargando JavaScript y pidiendo datos al API…</p>
      <div className="esqueleto__barra esqueleto__barra--marcador" />
      <div className="esqueleto__barra" />
      <div className="esqueleto__barra" />
      <div className="esqueleto__barra esqueleto__barra--corta" />
    </div>
  );
}

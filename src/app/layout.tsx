import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Diario Render — Portal de noticias",
    template: "%s · Diario Render",
  },
  description:
    "Portal de noticias académico que implementa los cuatro patrones de rendering de Next.js: SSG, ISR, SSR y CSR.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body>
        <header className="cabecera">
          <div className="contenedor cabecera__fila">
            <a href="/" className="marca">
              Diario <span>Render</span>
            </a>
            <p className="cabecera__lema">Un portal de noticias para comparar patrones de rendering</p>
          </div>
          <div className="contenedor">
            <Nav />
          </div>
        </header>

        <main className="contenedor principal">{children}</main>

        <footer className="pie">
          <div className="contenedor">
            <p>
              Diario Render · Proyecto académico de Programación Web. Todas las noticias son{" "}
              <strong>ficticias</strong>.
            </p>
            <p className="pie__leyenda">
              <span className="badge badge--mini badge--ssg">SSG</span> archivo ·{" "}
              <span className="badge badge--mini badge--isr">ISR</span> portada y notas ·{" "}
              <span className="badge badge--mini badge--ssr">SSR</span> búsqueda ·{" "}
              <span className="badge badge--mini badge--csr">CSR</span> en vivo
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

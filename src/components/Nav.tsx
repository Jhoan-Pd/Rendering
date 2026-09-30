"use client";

import { usePathname } from "next/navigation";
import type { Patron } from "@/lib/patrones";

const ENLACES: { href: string; texto: string; patron?: Patron }[] = [
  { href: "/", texto: "Portada", patron: "ISR" },
  { href: "/en-vivo", texto: "En vivo", patron: "CSR" },
  { href: "/buscar", texto: "Buscar", patron: "SSR" },
  { href: "/archivo", texto: "Archivo", patron: "SSG" },
  { href: "/comparativa", texto: "Comparativa" },
];

function activo(ruta: string, href: string) {
  if (href === "/") return ruta === "/" || ruta.startsWith("/noticia");
  return ruta.startsWith(href);
}

export function Nav() {
  const ruta = usePathname();
  return (
    <nav className="nav" aria-label="Secciones">
      {ENLACES.map((e) => (
        // Se usa <a> y no <Link> a propósito: cada clic hace una petición completa
        // al servidor/CDN, así el panel mide el patrón real y no la caché del router.
        <a
          key={e.href}
          href={e.href}
          className={`nav__enlace${activo(ruta, e.href) ? " nav__enlace--activo" : ""}`}
          aria-current={activo(ruta, e.href) ? "page" : undefined}
        >
          {e.texto}
          {e.patron && <span className={`badge badge--mini badge--${e.patron.toLowerCase()}`}>{e.patron}</span>}
        </a>
      ))}
    </nav>
  );
}

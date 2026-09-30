import { useEffect } from "react";

/**
 * Navegación de estilo aplicación en el móvil.
 *
 * En una app las pantallas forman una jerarquía: las pestañas de abajo son la
 * raíz y todo lo demás cuelga de alguna de ellas, con una flecha arriba para
 * volver. Aquí se declara esa jerarquía y se lleva la cuenta de las pantallas
 * visitadas dentro del sitio, que es lo que decide qué hace la flecha.
 */

export interface ParentRoute {
  href: string;
  label: string;
}

/**
 * Las pantallas raíz, las de la barra de pestañas. `/crear` no está: es una
 * tarea que se abre desde cualquier sitio y tiene su propia barra de acciones.
 */
const TAB_ROOTS = new Set(["/", "/plantillas", "/articulos"]);

/** A dónde lleva la flecha «atrás» de cada pantalla, o `null` si es raíz. */
export function parentRoute(pathname: string): ParentRoute | null {
  if (TAB_ROOTS.has(pathname)) return null;
  if (pathname.startsWith("/articulos/")) {
    return { href: "/articulos", label: "Guías" };
  }
  if (pathname === "/premium") return { href: "/plantillas", label: "Plantillas" };
  return { href: "/", label: "Inicio" };
}

/** Qué pestaña se ilumina en cada pantalla. */
export function activeTab(pathname: string): string | null {
  if (pathname === "/") return "/";
  if (pathname.startsWith("/plantillas") || pathname === "/premium") {
    return "/plantillas";
  }
  if (pathname.startsWith("/articulos")) return "/articulos";
  if (pathname.startsWith("/crear")) return "/crear";
  return null;
}

/**
 * Las rutas visitadas en esta sesión, sin salir del sitio.
 *
 * `history.length` no sirve para saber si hay «atrás» dentro del sitio: cuenta
 * también lo que se visitó antes de llegar, y volver con él desde una guía a
 * la que se entró desde Google devolvería a Google. Así que se apila cada ruta
 * nueva y, si la nueva coincide con la penúltima, se interpreta como un paso
 * atrás y se desapila.
 */
const visited: string[] = [];

function track(pathname: string) {
  const last = visited[visited.length - 1];
  if (last === pathname) return;
  if (visited[visited.length - 2] === pathname) visited.pop();
  else visited.push(pathname);
}

/** Registra la ruta actual. Se llama desde un componente que no se desmonta. */
export function useTrackNavigation(pathname: string) {
  useEffect(() => {
    track(pathname);
  }, [pathname]);
}

/** Si hay una pantalla anterior del propio sitio a la que volver. */
export function canGoBackInApp(): boolean {
  return visited.length > 1;
}

// Roles y permisos en la página (el servidor los vuelve a revisar en app.py).
// Visitante: solo ve. Cliente: reserva. Negocio: publica y entrega. Administrador: supervisa todo.
// Demo: sin SQL Server se muestra todo con datos de ejemplo.
import { app } from "./almacen.js";
import { usuario } from "./cuenta.js";
import type { Publicacion } from "./modelos/publicacion.js";
import { obtener } from "./utilidades.js";

export type Rol = "Demo" | "Visitante" | "Cliente" | "Negocio" | "Administrador";

export function rolActual(): Rol {
  if (!app.conectadoABD) return "Demo";
  return usuario()?.tipo ?? "Visitante";
}

export function esDueno(publicacion: Publicacion): boolean {
  const negocioId = usuario()?.negocioId;
  return negocioId != null && app.infoBD.get(publicacion.id)?.negocioId === negocioId;
}

export function esMiReserva(publicacion: Publicacion): boolean {
  const actual = usuario();
  return actual != null && app.infoBD.get(publicacion.id)?.reservaUsuarioId === actual.id;
}

export function puedePublicar(): boolean {
  return !app.conectadoABD || usuario()?.tipo === "Negocio";
}

export function puedeReservar(): boolean {
  return !app.conectadoABD || usuario()?.tipo === "Cliente";
}

export function puedeEntregar(publicacion: Publicacion): boolean {
  return !app.conectadoABD || esDueno(publicacion);
}

export function puedeCancelar(publicacion: Publicacion): boolean {
  return !app.conectadoABD || usuario()?.tipo === "Administrador" || esDueno(publicacion) || esMiReserva(publicacion);
}

// Muestra u oculta las opciones de la página según el rol (atributo data-ver del HTML)
export function aplicarRol(): void {
  const rol = rolActual();
  document.querySelectorAll<HTMLElement>("[data-ver]").forEach((elemento) => {
    elemento.hidden = !(elemento.dataset.ver ?? "").split(",").includes(rol);
  });
  const etiqueta = obtener("#rol-actual");
  etiqueta.textContent = rol === "Demo" ? "Modo de ejemplo" : rol;
  etiqueta.className = `rol-actual rol rol-${rol.toLowerCase()}`;
}

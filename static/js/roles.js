// Roles y permisos en la página (el servidor los vuelve a revisar en app.py).
// Visitante: solo ve. Cliente: reserva. Negocio: publica y entrega. Administrador: supervisa todo.
// Demo: sin SQL Server se muestra todo con datos de ejemplo.
import { app } from "./almacen.js";
import { usuario } from "./cuenta.js";
import { obtener } from "./utilidades.js";
export function rolActual() {
    if (!app.conectadoABD)
        return "Demo";
    return usuario()?.tipo ?? "Visitante";
}
export function esDueno(publicacion) {
    const negocioId = usuario()?.negocioId;
    return negocioId != null && app.infoBD.get(publicacion.id)?.negocioId === negocioId;
}
export function esMiReserva(publicacion) {
    const actual = usuario();
    return actual != null && app.infoBD.get(publicacion.id)?.reservaUsuarioId === actual.id;
}
export function puedePublicar() {
    return !app.conectadoABD || usuario()?.tipo === "Negocio";
}
export function puedeReservar() {
    return !app.conectadoABD || usuario()?.tipo === "Cliente";
}
export function puedeEntregar(publicacion) {
    return !app.conectadoABD || esDueno(publicacion);
}
export function puedeCancelar(publicacion) {
    return !app.conectadoABD || usuario()?.tipo === "Administrador" || esDueno(publicacion) || esMiReserva(publicacion);
}
// Muestra u oculta las opciones de la página según el rol (atributo data-ver del HTML)
export function aplicarRol() {
    const rol = rolActual();
    document.querySelectorAll("[data-ver]").forEach((elemento) => {
        elemento.hidden = !(elemento.dataset.ver ?? "").split(",").includes(rol);
    });
    const etiqueta = obtener("#rol-actual");
    etiqueta.textContent = rol === "Demo" ? "Modo de ejemplo" : rol;
    etiqueta.className = `rol-actual rol rol-${rol.toLowerCase()}`;
}
//# sourceMappingURL=roles.js.map
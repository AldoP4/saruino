// BLOQUE STATE: reservar, entregar y cancelar, y la sección "Reservas y entregas".
// Patrón definido en patrones/state.ts; aquí se usa.
import { actualizarKilos, app, cargarDatos, reemplazar } from "../almacen.js";
import { cambiarEstadoEnBD } from "../api.js";
import { esDueno, esMiReserva, puedeCancelar, puedeEntregar, rolActual } from "../roles.js";
import { escapar, mensajeDeError, mostrarAviso, obtener } from "../utilidades.js";
import { avisarDeNuevoDisponible } from "./notificaciones.js";
const MENSAJES = {
    reservar: (p) => `Reservaste: ${p.datos.producto}`,
    entregar: (p) => `Entregado. Se evitaron ${p.datos.kilos} kg de desperdicio.`,
    cancelar: (p) => `Reserva cancelada: ${p.datos.producto}`,
};
// Se llama al dar clic en Reservar, Marcar entregada o Cancelar
export async function ejecutarAccion(accion, id) {
    const publicacion = app.publicaciones.find((p) => p.id === id);
    if (!publicacion) {
        mostrarAviso("No se encontró la publicación.", "error");
        return;
    }
    try {
        // 1) STATE: el estado actual decide si la acción se puede (si no, lanza un error)
        publicacion[accion]();
        if (!app.conectadoABD && accion === "reservar") {
            app.infoBD.set(id, { negocioId: null, reservaUsuarioId: null, solicitante: "Cliente de ejemplo" });
        }
        // 2) Si hay BD, se guarda en SQL Server (el servidor revisa permisos y repite la regla)
        if (app.conectadoABD) {
            reemplazar(await cambiarEstadoEnBD(id, accion));
            if (accion === "entregar")
                await actualizarKilos();
        }
        mostrarAviso(MENSAJES[accion](publicacion));
        if (accion === "cancelar") {
            // OBSERVER: el alimento vuelve a estar disponible y se avisa
            avisarDeNuevoDisponible(publicacion.datos.producto, publicacion.datos.negocio, publicacion.datos.horarioRecoleccion);
        }
    }
    catch (error) {
        mostrarAviso(mensajeDeError(error, "Ocurrió un error."), "error");
        if (app.conectadoABD)
            await cargarDatos(); // vuelve a lo que dice la BD
    }
}
function filaReservaHtml(publicacion) {
    const quien = app.infoBD.get(publicacion.id)?.solicitante;
    const detalle = `${escapar(publicacion.datos.negocio)} · ${escapar(publicacion.datos.horarioRecoleccion)}`
        + (quien ? ` · Reservó: ${escapar(quien)}` : "");
    let acciones;
    if (publicacion.nombreEstado === "Entregada") {
        acciones = `<span class="estado estado-entregada">${publicacion.datos.kilos} kg rescatados</span>`;
    }
    else {
        const botones = [
            puedeEntregar(publicacion) ? `<button class="button button-primary" data-accion="entregar" data-id="${publicacion.id}">Marcar entregada</button>` : "",
            puedeCancelar(publicacion) ? `<button class="button button-secondary" data-accion="cancelar" data-id="${publicacion.id}">Cancelar</button>` : "",
        ].join("");
        acciones = botones ? `<div class="fila-acciones">${botones}</div>` : `<span class="estado estado-reservada">Esperando entrega</span>`;
    }
    return `<li class="fila-reserva">
    <div><strong>${escapar(publicacion.datos.producto)}</strong><span>${detalle}</span></div>
    ${acciones}
  </li>`;
}
// Cada rol ve distintas reservas: el cliente las suyas, el negocio las de sus alimentos y el admin todas
const TITULOS_RESERVAS = {
    Demo: "Reservas y entregas",
    Visitante: "Reservas y entregas",
    Cliente: "Mis reservas",
    Negocio: "Reservas de mis alimentos",
    Administrador: "Todas las reservas y entregas",
};
function reservasDelRol() {
    const rol = rolActual();
    if (rol === "Cliente")
        return app.publicaciones.filter(esMiReserva);
    if (rol === "Negocio")
        return app.publicaciones.filter(esDueno);
    if (rol === "Visitante")
        return [];
    return app.publicaciones;
}
export function renderReservas() {
    const rol = rolActual();
    obtener("#titulo-reservas").textContent = TITULOS_RESERVAS[rol];
    obtener("#enlace-reservas").textContent = rol === "Cliente" ? "Mis reservas" : "Reservas";
    const lista = reservasDelRol();
    const reservadas = lista.filter((p) => p.nombreEstado === "Reservada");
    const entregadas = lista.filter((p) => p.nombreEstado === "Entregada");
    obtener("#lista-reservadas").innerHTML = reservadas.map(filaReservaHtml).join("") || `<li class="vacio">Sin reservas pendientes.</li>`;
    obtener("#lista-entregadas").innerHTML = entregadas.map(filaReservaHtml).join("") || `<li class="vacio">Todavía no hay entregas.</li>`;
}
//# sourceMappingURL=reservas.js.map
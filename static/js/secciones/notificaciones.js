// BLOQUE OBSERVER + ADAPTER (mensajes): la campana y los avisos de alimentos nuevos.
// Patrón definido en patrones/observer.ts y patrones/adapter.ts; aquí se usa.
import { app, crearDesdeFila, actualizarKilos } from "../almacen.js";
import { obtenerPublicaciones } from "../api.js";
import { usuario } from "../cuenta.js";
import { ApiMensajeriaExterna, NotificadorMensajesAdapter } from "../patrones/adapter.js";
import { CentroNotificaciones } from "../patrones/observer.js";
import { escapar, mensajeDeError, mostrarAviso, obtener } from "../utilidades.js";
// Sujeto del Observer: todos los avisos pasan por aquí
export const centro = new CentroNotificaciones();
const notificaciones = [];
const apiMensajes = new ApiMensajeriaExterna();
let avisoSinConexionMostrado = false;
// Observador concreto 1: la campana de la página
class PanelNotificaciones {
    actualizar(evento) {
        notificaciones.unshift(evento);
        renderNotificaciones();
        mostrarAviso(evento.titulo);
    }
}
// Observador concreto 2: el servicio externo de mensajes, conectado con un Adapter
const notificadorMensajes = new NotificadorMensajesAdapter(apiMensajes, "Clientes de Saruino");
centro.suscribir(new PanelNotificaciones());
centro.suscribir(notificadorMensajes);
// Interruptor de la campana: suscribe o desuscribe al servicio de mensajes en vivo
export function cambiarAvisosPorMensaje(activos) {
    if (activos) {
        centro.suscribir(notificadorMensajes);
    }
    else {
        centro.desuscribir(notificadorMensajes);
    }
}
export function avisarNuevoAlimento(producto, negocio, modalidad, horario) {
    centro.notificar({ titulo: `Nuevo alimento: ${producto}`, detalle: `${negocio} · ${modalidad} · recoger ${horario}` });
}
export function avisarDeNuevoDisponible(producto, negocio, horario) {
    centro.notificar({ titulo: `De nuevo disponible: ${producto}`, detalle: `${negocio} · ${horario}` });
}
export function limpiarNotificaciones() {
    notificaciones.length = 0;
    renderNotificaciones();
}
export function renderNotificaciones() {
    const contador = obtener("#contador-notificaciones");
    contador.textContent = String(notificaciones.length);
    contador.hidden = notificaciones.length === 0;
    obtener("#lista-notificaciones").innerHTML = notificaciones.length
        ? notificaciones.map((n) => `<li><strong>${escapar(n.titulo)}</strong><span>${escapar(n.detalle)}</span></li>`).join("")
        : `<li class="vacio">Sin notificaciones nuevas.</li>`;
    obtener("#mensajes-externos").textContent = String(apiMensajes.totalEnviados);
}
// Cada 10 s: ¿otro negocio publicó algo? Si sí, se avisa con el Observer.
// Regresa true si hubo cambios para que la página se vuelva a pintar.
export async function revisarNovedades() {
    if (!app.conectadoABD)
        return false;
    try {
        const filas = await obtenerPublicaciones();
        const conocidas = new Set(app.publicaciones.map((p) => p.id));
        const miNegocio = usuario()?.negocioId ?? null;
        const nuevas = filas.filter((f) => !conocidas.has(f.id) && f.estado === "Disponible" && f.negocioId !== miNegocio);
        app.publicaciones = filas.map(crearDesdeFila);
        await actualizarKilos();
        avisoSinConexionMostrado = false;
        for (const fila of nuevas) {
            avisarNuevoAlimento(fila.producto, fila.negocio, fila.modalidad, fila.horarioRecoleccion);
        }
        return true;
    }
    catch (error) {
        // Se avisa una sola vez para no llenar la pantalla; se vuelve a intentar en la siguiente vuelta
        if (!avisoSinConexionMostrado) {
            mostrarAviso(mensajeDeError(error, "Se perdió la conexión con el servidor."), "error");
            avisoSinConexionMostrado = true;
        }
        return false;
    }
}
//# sourceMappingURL=notificaciones.js.map
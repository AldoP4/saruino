// Almacén: los datos que la página tiene en memoria y cómo se cargan de SQL Server.
// Si SQL Server no está prendido, se usan los datos de ejemplo de datos.ts (modo Demo).
import { obtenerEstadoBD, obtenerImpacto, obtenerPublicaciones } from "./api.js";
import { cargarSesion } from "./cuenta.js";
import { crearPublicacionesIniciales } from "./datos.js";
import { creadorPara } from "./patrones/factory.js";
import { estrategiaPorClave } from "./patrones/strategy.js";
import { mensajeDeError, mostrarAviso, obtener } from "./utilidades.js";
// Todo lo que la página necesita recordar mientras está abierta
export const app = {
    publicaciones: [],
    conectadoABD: false,
    kilosRegistrados: 0, // suma de la tabla RegistroDesperdicio
    filtro: "Todas",
    infoBD: new Map(),
};
// Sin SQL Server se publica a nombre de este negocio de ejemplo
export const NEGOCIO_DEMO = { negocio: "Negocio de ejemplo", tipoNegocio: "Cafetería", direccion: "Centro" };
// FACTORY METHOD + STRATEGY: cada fila de SQL Server se vuelve objeto con la fábrica de su modalidad
export function crearDesdeFila(fila) {
    const publicacion = creadorPara(fila.modalidad, estrategiaPorClave(fila.estrategia)).publicar({
        id: fila.id,
        negocio: fila.negocio,
        tipoNegocio: fila.tipoNegocio,
        producto: fila.producto,
        cantidad: fila.cantidad,
        kilos: fila.kilos,
        precioOriginal: fila.precioOriginal,
        horasParaCaducar: fila.horasParaCaducar,
        horarioRecoleccion: fila.horarioRecoleccion,
        direccion: fila.direccion,
    });
    // STATE: la publicación arranca en el estado que dice la base (Disponible, Reservada o Entregada)
    publicacion.restaurarEstado(fila.estado);
    app.infoBD.set(fila.id, { negocioId: fila.negocioId, reservaUsuarioId: fila.reservaUsuarioId, solicitante: fila.solicitante });
    return publicacion;
}
// Cambia una publicación por la versión que acaba de responder el servidor
export function reemplazar(fila) {
    const nueva = crearDesdeFila(fila);
    app.publicaciones = app.publicaciones.map((p) => (p.id === nueva.id ? nueva : p));
}
export async function actualizarKilos() {
    app.kilosRegistrados = (await obtenerImpacto()).kilosEvitados;
}
export function kilosEntregados(lista) {
    return lista.filter((p) => p.nombreEstado === "Entregada").reduce((total, p) => total + p.datos.kilos, 0);
}
export async function cargarDatos() {
    const estado = await obtenerEstadoBD();
    app.conectadoABD = estado.conectada;
    const banner = obtener("#estado-bd");
    if (app.conectadoABD) {
        try {
            app.publicaciones = (await obtenerPublicaciones()).map(crearDesdeFila);
            await actualizarKilos();
            await cargarSesion();
            banner.className = "estado-bd conectada";
            banner.textContent = `Conectado a SQL Server · base de datos ${estado.baseDatos ?? "Saruino"}`;
            return;
        }
        catch (error) {
            app.conectadoABD = false;
            mostrarAviso(mensajeDeError(error, "No se pudieron leer los datos."), "error");
        }
    }
    // Modo Demo: la página sigue funcionando con datos de ejemplo
    banner.className = "estado-bd desconectada";
    banner.textContent = "Sin conexión a SQL Server · mostrando datos de ejemplo (los cambios no se guardan)";
    app.infoBD.clear();
    app.publicaciones = crearPublicacionesIniciales();
}
//# sourceMappingURL=almacen.js.map
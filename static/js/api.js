async function pedir(url, opciones) {
    const respuesta = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        ...opciones,
    });
    const cuerpo = await respuesta.json().catch(() => null);
    if (!respuesta.ok) {
        const mensaje = cuerpo?.error;
        throw new Error(mensaje ?? `Error ${respuesta.status} del servidor`);
    }
    return cuerpo;
}
function enviar(url, datos = {}) {
    return pedir(url, { method: "POST", body: JSON.stringify(datos) });
}
export async function obtenerEstadoBD() {
    try {
        return await pedir("/api/estado-bd");
    }
    catch {
        return { conectada: false };
    }
}
// ---------- Cuentas ----------
export function obtenerSesion() {
    return pedir("/api/sesion");
}
export function iniciarSesion(correo, contrasena) {
    return enviar("/api/login", { correo, contrasena });
}
export function registrarUsuario(datos) {
    return enviar("/api/registro", datos);
}
export function cerrarSesion() {
    return enviar("/api/logout");
}
// ---------- Publicaciones ----------
export function obtenerPublicaciones() {
    return pedir("/api/publicaciones");
}
export function crearPublicacionEnBD(datos) {
    return enviar("/api/publicaciones", datos);
}
export function cambiarEstadoEnBD(id, accion) {
    return enviar(`/api/publicaciones/${id}/${accion}`);
}
export function obtenerImpacto() {
    return pedir("/api/impacto");
}
export function obtenerResumenAdmin() {
    return pedir("/api/admin/resumen");
}
export function obtenerUsuariosAdmin() {
    return pedir("/api/admin/usuarios");
}
export function eliminarPublicacionAdmin(id) {
    return pedir(`/api/admin/publicaciones/${id}`, { method: "DELETE" });
}
//# sourceMappingURL=api.js.map
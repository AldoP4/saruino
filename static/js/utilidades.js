// Funciones pequenas que usan varias partes de la pagina
export function obtener(selector) {
    const elemento = document.querySelector(selector);
    if (!elemento)
        throw new Error(`No existe el elemento ${selector}`);
    return elemento;
}
// Evita que un texto escrito por el usuario se interprete como HTML
export function escapar(texto) {
    return texto
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}
export const formatoMoneda = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
export function mensajeDeError(error, otro) {
    return error instanceof Error ? error.message : otro;
}
export function mostrarAviso(mensaje, tipo = "ok") {
    const aviso = document.createElement("div");
    aviso.className = `aviso aviso-${tipo}`;
    aviso.textContent = mensaje;
    obtener("#avisos").append(aviso);
    setTimeout(() => aviso.remove(), 3800);
}
//# sourceMappingURL=utilidades.js.map
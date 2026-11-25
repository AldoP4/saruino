// Sección "Mi cuenta": formularios de entrar/crear cuenta y el panel de cada rol.
import { app, kilosEntregados, NEGOCIO_DEMO } from "../almacen.js";
import { usuario } from "../cuenta.js";
import { esDueno, esMiReserva, puedePublicar } from "../roles.js";
import { escapar, obtener } from "../utilidades.js";
function filaPanelHtml(publicacion) {
    return `<li class="fila-reserva">
    <div><strong>${escapar(publicacion.datos.producto)}</strong>
    <span>${publicacion.modalidad} · ${publicacion.datos.kilos} kg · ${escapar(publicacion.datos.horarioRecoleccion)}</span></div>
    <span class="estado estado-${publicacion.nombreEstado.toLowerCase()}">${publicacion.nombreEstado}</span>
  </li>`;
}
// El negocio ve sus publicaciones, el cliente sus reservas y el admin un acceso a su panel
function renderPanel() {
    const actual = usuario();
    if (!actual)
        return;
    if (actual.tipo === "Administrador") {
        obtener("#resumen-panel").textContent = "Eres administrador: puedes ver a todos los usuarios, todas las reservas y eliminar publicaciones.";
        obtener("#lista-panel").innerHTML = `<li class="fila-reserva"><a class="button button-primary" href="#admin">Ir al panel de administración</a></li>`;
        return;
    }
    const mias = actual.tipo === "Negocio" ? app.publicaciones.filter(esDueno) : app.publicaciones.filter(esMiReserva);
    const kilos = kilosEntregados(mias).toFixed(1);
    obtener("#resumen-panel").textContent = actual.tipo === "Negocio"
        ? `${actual.negocio?.nombre ?? actual.nombre} · ${mias.length} publicaciones · ${kilos} kg rescatados por tu negocio`
        : `${mias.filter((p) => p.nombreEstado === "Reservada").length} reservas activas · ${kilos} kg recibidos`;
    obtener("#lista-panel").innerHTML = mias.map(filaPanelHtml).join("")
        || `<li class="vacio">${actual.tipo === "Negocio" ? "Todavía no publicas alimentos." : "Todavía no reservas alimentos."}</li>`;
}
export function renderCuenta() {
    const actual = usuario();
    obtener("#enlace-cuenta").textContent = actual ? actual.nombre : "Entrar";
    obtener("#titulo-cuenta").textContent = actual ? `Mi panel · ${actual.tipo}` : "Entra o crea tu cuenta";
    obtener("#aviso-sin-bd").hidden = app.conectadoABD;
    obtener("#formularios-cuenta").hidden = !app.conectadoABD || actual != null;
    obtener("#boton-salir").hidden = actual == null;
    obtener("#panel-usuario").hidden = actual == null;
    // Formulario de publicar: solo para negocios
    obtener("#form-publicar").hidden = !puedePublicar();
    obtener("#aviso-publicar").hidden = puedePublicar();
    obtener("#publica-como").textContent = actual?.tipo === "Negocio"
        ? `Publicas como: ${actual.negocio?.nombre ?? actual.nombre}`
        : app.conectadoABD ? "" : `Modo de ejemplo: publicas como ${NEGOCIO_DEMO.negocio}`;
    renderPanel();
}
//# sourceMappingURL=panel.js.map
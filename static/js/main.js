// Punto de arranque de la página: carga los datos, pinta cada sección y conecta los clics.
// La lógica de cada patrón vive en su bloque:
//   secciones/publicar.ts ........ Factory Method + Strategy (formulario de publicar)
//   secciones/notificaciones.ts .. Observer + Adapter de mensajes (la campana)
//   secciones/reservas.ts ........ State (reservar, entregar, cancelar)
//   secciones/tarjetas.ts ........ tarjetas de alimentos (precio con Strategy, mapa con Adapter)
// Lo visual que no es patrón está en decoracion/ (animaciones y fondo 3D).
import { app, cargarDatos, kilosEntregados } from "./almacen.js";
import { iniciarFormulariosCuenta } from "./cuenta.js";
import { iniciarAnimaciones } from "./decoracion/animaciones.js";
import { aplicarRol, rolActual } from "./roles.js";
import { eliminarPublicacion, renderAdmin } from "./secciones/admin.js";
import { cambiarAvisosPorMensaje, limpiarNotificaciones, renderNotificaciones, revisarNovedades, } from "./secciones/notificaciones.js";
import { renderCuenta } from "./secciones/panel.js";
import { actualizarVistaPrevia, publicar } from "./secciones/publicar.js";
import { ejecutarAccion, renderReservas } from "./secciones/reservas.js";
import { renderLista } from "./secciones/tarjetas.js";
import { obtener } from "./utilidades.js";
// Cada cuánto la página pregunta al servidor si hay alimentos nuevos (Observer)
const INTERVALO_REVISION_MS = 10_000;
// Contador de kilos y números del inicio
function renderImpacto() {
    // Con BD se usa la tabla RegistroDesperdicio; sin BD se suma lo entregado en pantalla
    const kilos = app.conectadoABD ? app.kilosRegistrados : kilosEntregados(app.publicaciones);
    obtener("#kilos-evitados").textContent = kilos.toFixed(1);
    obtener("#publicaciones-activas").textContent = String(app.publicaciones.filter((p) => p.nombreEstado === "Disponible").length);
    obtener("#donaciones").textContent = String(app.publicaciones.filter((p) => p.modalidad === "Donación").length);
    obtener("#negocios").textContent = String(new Set(app.publicaciones.map((p) => p.datos.negocio)).size);
}
function renderTodo() {
    aplicarRol();
    renderLista();
    renderReservas();
    renderImpacto();
    renderNotificaciones();
    renderCuenta();
    if (rolActual() === "Administrador")
        void renderAdmin(app.publicaciones);
}
async function eliminarDesdeAdmin(id) {
    const producto = app.publicaciones.find((p) => p.id === id)?.datos.producto ?? "publicación";
    if (await eliminarPublicacion(id, producto)) {
        await cargarDatos();
        renderTodo();
    }
}
// Un solo "escuchador" de clics para los botones que se dibujan con innerHTML
function alDarClic(evento) {
    const objetivo = evento.target;
    const botonAccion = objetivo.closest("[data-accion]");
    if (botonAccion) {
        void ejecutarAccion(botonAccion.dataset.accion, Number(botonAccion.dataset.id)).then(renderTodo);
        return;
    }
    const chip = objetivo.closest("[data-filtro]");
    if (chip) {
        app.filtro = (chip.dataset.filtro ?? "Todas");
        renderLista();
        return;
    }
    const botonEliminar = objetivo.closest("[data-admin-eliminar]");
    if (botonEliminar) {
        void eliminarDesdeAdmin(Number(botonEliminar.dataset.adminEliminar));
        return;
    }
    // Clic fuera de la campana: se cierra el panel de notificaciones
    if (!objetivo.closest("#zona-notificaciones")) {
        obtener("#panel-notificaciones").hidden = true;
        obtener("#boton-notificaciones").setAttribute("aria-expanded", "false");
    }
}
function conectarNotificaciones() {
    const campana = obtener("#boton-notificaciones");
    const panel = obtener("#panel-notificaciones");
    campana.addEventListener("click", () => {
        panel.hidden = !panel.hidden;
        campana.setAttribute("aria-expanded", String(!panel.hidden));
    });
    obtener("#limpiar-notificaciones").addEventListener("click", limpiarNotificaciones);
    obtener("#avisos-externos").addEventListener("change", (evento) => {
        cambiarAvisosPorMensaje(evento.target.checked);
    });
}
function conectarFormularioPublicar() {
    const formulario = obtener("#form-publicar");
    formulario.addEventListener("input", () => actualizarVistaPrevia(formulario));
    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        if (await publicar(formulario)) {
            renderTodo();
            obtener("#disponibles").scrollIntoView();
        }
    });
    actualizarVistaPrevia(formulario);
}
async function iniciar() {
    document.addEventListener("click", alDarClic);
    conectarNotificaciones();
    conectarFormularioPublicar();
    obtener("#actualizar-admin").addEventListener("click", () => void renderAdmin(app.publicaciones));
    iniciarFormulariosCuenta(renderTodo);
    await cargarDatos();
    renderTodo();
    iniciarAnimaciones();
    setInterval(async () => {
        if (await revisarNovedades())
            renderTodo();
    }, INTERVALO_REVISION_MS);
    // Decoración 3D (Three.js): se carga aparte para que, si falla, la página siga funcionando igual
    import("./decoracion/fondo3d.js")
        .then((modulo) => modulo.iniciarFondo3D(obtener("#fondo-3d")))
        .catch((error) => console.warn("Fondo 3D desactivado:", error));
}
void iniciar();
//# sourceMappingURL=main.js.map
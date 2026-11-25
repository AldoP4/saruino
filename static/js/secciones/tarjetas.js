// Sección "Alimentos disponibles": las tarjetas de cada publicación y los filtros.
// Aquí se VEN tres patrones: el precio con descuento (Strategy), el estado (State)
// y el enlace "Ver en mapa" (Adapter).
import { app } from "../almacen.js";
import { usuario } from "../cuenta.js";
import { PublicacionDescuento } from "../modelos/publicacion.js";
import { MapaAdapter } from "../patrones/adapter.js";
import { esDueno, puedeReservar } from "../roles.js";
import { escapar, formatoMoneda, obtener } from "../utilidades.js";
// ADAPTER: la página solo conoce ServicioMapa; no sabe que detrás está Google Maps
const mapa = new MapaAdapter();
// Íconos de Lucide (lucide.dev, licencia ISC). Son dibujos SVG copiados aquí para no depender de internet.
const TRAZOS = {
    paquete: `<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>`,
    peso: `<circle cx="12" cy="5" r="3"/><path d="M6.5 8a2 2 0 0 0-1.905 1.46L2.1 18.5A2 2 0 0 0 4 21h16a2 2 0 0 0 1.925-2.54L19.4 9.5A2 2 0 0 0 17.48 8Z"/>`,
    reloj: `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
    bolsa: `<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>`,
    ubicacion: `<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>`,
};
function icono(nombre) {
    return `<svg class="icono" viewBox="0 0 24 24" aria-hidden="true">${TRAZOS[nombre]}</svg>`;
}
function precioHtml(publicacion) {
    if (publicacion.modalidad === "Donación") {
        return `<span class="precio-final">Gratis</span>`;
    }
    // STRATEGY: el porcentaje y su nombre los da la estrategia de la publicación
    if (publicacion instanceof PublicacionDescuento) {
        return `<span class="precio-original">${formatoMoneda.format(publicacion.datos.precioOriginal)}</span>
      <span class="precio-final">${formatoMoneda.format(publicacion.calcularPrecioFinal())}</span>
      <span class="chip-descuento">-${publicacion.porcentaje}% ${publicacion.nombreEstrategia}</span>`;
    }
    return `<span class="precio-final">${formatoMoneda.format(publicacion.calcularPrecioFinal())}</span>`;
}
function botonTarjeta(publicacion) {
    if (publicacion.nombreEstado !== "Disponible") {
        return `<button class="button button-secondary" disabled>${publicacion.nombreEstado}</button>`;
    }
    if (puedeReservar()) {
        return `<button class="button button-primary" data-accion="reservar" data-id="${publicacion.id}">Reservar</button>`;
    }
    if (!usuario()) {
        return `<a class="button button-secondary" href="#cuenta">Entra para reservar</a>`;
    }
    return `<button class="button button-secondary" disabled>Disponible</button>`;
}
function tarjetaHtml(publicacion) {
    const d = publicacion.datos;
    const urgente = d.horasParaCaducar <= 3 ? " urgente" : "";
    const claseModalidad = publicacion.modalidad === "Donación" ? "donacion" : publicacion.modalidad.toLowerCase();
    const tuya = esDueno(publicacion) ? `<span class="estado estado-tuya">Tuya</span>` : "";
    return `<article class="tarjeta tarjeta-${claseModalidad}">
    <div class="tarjeta-top">
      <span class="badge badge-${claseModalidad}">${publicacion.modalidad}</span>
      <span class="tarjeta-estados">${tuya}<span class="estado estado-${publicacion.nombreEstado.toLowerCase()}">${publicacion.nombreEstado}</span></span>
    </div>
    <h3>${escapar(d.producto)}</h3>
    <p class="negocio">${escapar(d.negocio)} · ${escapar(d.tipoNegocio)}</p>
    <ul class="detalles">
      <li>${icono("paquete")}<span><strong>${d.cantidad}</strong> ${d.cantidad === 1 ? "pieza" : "piezas"}</span></li>
      <li>${icono("peso")}<span>${d.kilos} kg</span></li>
      <li class="ancho caducidad${urgente}">${icono("reloj")}<span>Caduca en ${d.horasParaCaducar} h</span></li>
      <li class="ancho">${icono("bolsa")}<span>Recoger: ${escapar(d.horarioRecoleccion)}</span></li>
    </ul>
    <div class="precio">${precioHtml(publicacion)}</div>
    <div class="tarjeta-acciones">
      ${botonTarjeta(publicacion)}
      <a class="enlace-mapa" href="${escapar(mapa.obtenerEnlace(d.direccion))}" target="_blank" rel="noopener">${icono("ubicacion")}Ver en mapa</a>
    </div>
  </article>`;
}
export function renderLista() {
    const visibles = app.publicaciones.filter((p) => app.filtro === "Todas" || p.modalidad === app.filtro);
    obtener("#lista-publicaciones").innerHTML = visibles.length
        ? visibles.map(tarjetaHtml).join("")
        : `<p class="vacio">No hay publicaciones con este filtro.</p>`;
    document.querySelectorAll("[data-filtro]").forEach((chip) => {
        chip.classList.toggle("active", chip.dataset.filtro === app.filtro);
    });
}
//# sourceMappingURL=tarjetas.js.map
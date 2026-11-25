// BLOQUE FACTORY METHOD + STRATEGY: formulario "Publica lo que no vendiste".
// Patrones definidos en patrones/factory.ts y patrones/strategy.ts; aquí se usan.
import { app, crearDesdeFila, NEGOCIO_DEMO } from "../almacen.js";
import { crearPublicacionEnBD } from "../api.js";
import { usuario } from "../cuenta.js";
import type { DatosPublicacion, Modalidad } from "../modelos/publicacion.js";
import { creadorPara } from "../patrones/factory.js";
import { estrategiaPorClave, type EstrategiaDescuento } from "../patrones/strategy.js";
import { puedePublicar } from "../roles.js";
import { formatoMoneda, mensajeDeError, mostrarAviso, obtener } from "../utilidades.js";
import { avisarNuevoAlimento } from "./notificaciones.js";

interface Formulario {
  datos: DatosPublicacion;
  modalidad: Modalidad;
  claveEstrategia: string;
  estrategia: EstrategiaDescuento;
}

function leerFormulario(formulario: HTMLFormElement): Formulario {
  const valores = new FormData(formulario);
  const texto = (campo: string): string => String(valores.get(campo) ?? "").trim();
  const numero = (campo: string): number => Number(valores.get(campo));
  const modalidad = texto("modalidad") as Modalidad;
  const claveEstrategia = texto("estrategia");
  const negocio = usuario()?.negocio;

  return {
    modalidad,
    claveEstrategia,
    estrategia: estrategiaPorClave(claveEstrategia),
    datos: {
      negocio: negocio?.nombre ?? NEGOCIO_DEMO.negocio,
      tipoNegocio: negocio?.tipoNegocio ?? NEGOCIO_DEMO.tipoNegocio,
      direccion: negocio?.direccion ?? NEGOCIO_DEMO.direccion,
      producto: texto("producto"),
      cantidad: numero("cantidad"),
      kilos: numero("kilos"),
      precioOriginal: modalidad === "Donación" ? 0 : numero("precioOriginal"),
      horasParaCaducar: numero("horasParaCaducar"),
      horarioRecoleccion: texto("horarioRecoleccion"),
    },
  };
}

// STRATEGY en vivo: al cambiar horas, cantidad o la regla, la estrategia recalcula el descuento
export function actualizarVistaPrevia(formulario: HTMLFormElement): void {
  const { datos, modalidad, estrategia } = leerFormulario(formulario);
  obtener<HTMLElement>("#campo-estrategia").hidden = modalidad !== "Descuento";
  obtener<HTMLElement>("#campo-precio").hidden = modalidad === "Donación";

  const vista = obtener("#vista-previa");
  if (modalidad === "Donación") {
    vista.textContent = "Se publicará como donación gratuita.";
  } else if (modalidad === "Venta") {
    vista.textContent = `Precio de venta: ${formatoMoneda.format(datos.precioOriginal || 0)}`;
  } else {
    const porcentaje = estrategia.calcularPorcentaje(datos.cantidad || 0, datos.horasParaCaducar || 0);
    const final = Math.round((datos.precioOriginal || 0) * (100 - porcentaje)) / 100;
    vista.textContent = `Descuento ${estrategia.nombre}: ${porcentaje}% → ${formatoMoneda.format(final)}`;
  }
}

// FACTORY METHOD: la página no sabe qué clase crear; se lo pide al creador de la modalidad.
// Regresa true si se publicó, para que la página se vuelva a pintar.
export async function publicar(formulario: HTMLFormElement): Promise<boolean> {
  if (!puedePublicar()) {
    mostrarAviso("Solo los negocios pueden publicar.", "error");
    return false;
  }
  const { datos, modalidad, claveEstrategia, estrategia } = leerFormulario(formulario);
  try {
    let publicacion = creadorPara(modalidad, estrategia).publicar(datos);

    if (app.conectadoABD) {
      const fila = await crearPublicacionEnBD({
        producto: datos.producto,
        cantidad: datos.cantidad,
        kilos: datos.kilos,
        precioOriginal: datos.precioOriginal,
        horasParaCaducar: datos.horasParaCaducar,
        horarioRecoleccion: datos.horarioRecoleccion,
        modalidad,
        estrategia: modalidad === "Descuento" ? claveEstrategia : null,
      });
      publicacion = crearDesdeFila(fila); // la versión guardada, con su id de SQL Server
    }

    app.publicaciones = [publicacion, ...app.publicaciones];
    avisarNuevoAlimento(datos.producto, datos.negocio, modalidad, datos.horarioRecoleccion); // OBSERVER
    formulario.reset();
    actualizarVistaPrevia(formulario);
    app.filtro = "Todas";
    return true;
  } catch (error) {
    mostrarAviso(mensajeDeError(error, "No se pudo publicar."), "error");
    return false;
  }
}

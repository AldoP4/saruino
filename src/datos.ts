// Datos de ejemplo: solo se usan si no hay conexion a SQL Server. Se crean con las fabricas.
import type { Publicacion } from "./modelos/publicacion.js";
import { CreadorDescuento, CreadorDonacion, CreadorVenta } from "./patrones/factory.js";
import { DescuentoPorCaducidad } from "./patrones/strategy.js";

export function crearPublicacionesIniciales(): Publicacion[] {
  const descuento = new CreadorDescuento(new DescuentoPorCaducidad());
  const donacion = new CreadorDonacion();
  const venta = new CreadorVenta();

  const publicaciones = [
    descuento.publicar({
      negocio: "Panadería El Trigal", tipoNegocio: "Panadería", producto: "Pan dulce surtido",
      cantidad: 24, kilos: 3, precioOriginal: 180, horasParaCaducar: 5,
      horarioRecoleccion: "19:00 – 20:30", direccion: "Av. Reforma 512, Centro",
    }),
    donacion.publicar({
      negocio: "Restaurante Sazón Poblano", tipoNegocio: "Restaurante", producto: "Menú del día (arroz y guisado)",
      cantidad: 10, kilos: 4, precioOriginal: 0, horasParaCaducar: 6,
      horarioRecoleccion: "21:00 – 21:45", direccion: "Av. Juárez 1820, La Paz",
    }),
    venta.publicar({
      negocio: "Panadería La Espiga", tipoNegocio: "Panadería", producto: "Pastel de chocolate",
      cantidad: 1, kilos: 1.8, precioOriginal: 350, horasParaCaducar: 20,
      horarioRecoleccion: "17:00 – 20:00", direccion: "Calle 14 Sur 905, El Carmen",
    }),
  ];

  // Una reserva de ejemplo para que se vea la seccion de reservas
  publicaciones[1]?.reservar();

  return publicaciones;
}

// =====================================================================
// PATRÓN FACTORY METHOD (creacional)
//
// Problema del negocio: un negocio puede ofrecer su comida de tres formas
//   (venta, descuento o donación) y cada una se comporta distinto. No queremos
//   un if/switch por modalidad regado en la página cada vez que se crea una.
//
// Papeles:
//   Creador ............. CreadorPublicacion (abstracta: define publicar())
//   Creadores concretos . CreadorVenta, CreadorDescuento, CreadorDonacion
//   Factory Method ...... crearPublicacion(datos)  ← cada subclase decide qué crear
//   Productos ........... Publicacion y sus 3 hijas (modelos/publicacion.ts)
//
// Dónde se usa en la página:
//   - Formulario "Publica lo que no vendiste" (secciones/publicar.ts)
//   - Al leer cada fila de SQL Server (crearDesdeFila en almacen.ts)
// =====================================================================
import {
  Publicacion,
  PublicacionDescuento,
  PublicacionDonacion,
  PublicacionVenta,
  type DatosPublicacion,
  type Modalidad,
} from "../modelos/publicacion.js";
import type { EstrategiaDescuento } from "./strategy.js";

export abstract class CreadorPublicacion {
  // El Factory Method: lo implementa cada creador concreto
  protected abstract crearPublicacion(datos: DatosPublicacion): Publicacion;

  // Proceso común para todas las modalidades: primero valida, luego crea
  publicar(datos: DatosPublicacion): Publicacion {
    this.validar(datos);
    return this.crearPublicacion(datos);
  }

  private validar(datos: DatosPublicacion): void {
    if (datos.negocio.trim() === "" || datos.producto.trim() === "") {
      throw new Error("Escribe el negocio y el producto.");
    }
    if (!(datos.cantidad > 0) || !(datos.kilos > 0) || !(datos.horasParaCaducar > 0)) {
      throw new Error("Cantidad, kilos y horas deben ser mayores a cero.");
    }
    if (datos.precioOriginal < 0) {
      throw new Error("El precio no puede ser negativo.");
    }
  }
}

export class CreadorVenta extends CreadorPublicacion {
  protected crearPublicacion(datos: DatosPublicacion): Publicacion {
    return new PublicacionVenta(datos);
  }
}

export class CreadorDescuento extends CreadorPublicacion {
  private estrategia: EstrategiaDescuento;

  // Recibe la estrategia (patrón Strategy) que usará la publicación con descuento
  constructor(estrategia: EstrategiaDescuento) {
    super();
    this.estrategia = estrategia;
  }

  protected crearPublicacion(datos: DatosPublicacion): Publicacion {
    return new PublicacionDescuento(datos, this.estrategia);
  }
}

export class CreadorDonacion extends CreadorPublicacion {
  protected crearPublicacion(datos: DatosPublicacion): Publicacion {
    return new PublicacionDonacion(datos);
  }
}

// Cada modalidad tiene su creador. La página solo dice "dame el creador de Venta"
// y no necesita saber qué clase hay detrás (así no hay un if por modalidad).
const CREADORES: Record<Modalidad, (estrategia: EstrategiaDescuento) => CreadorPublicacion> = {
  Venta: () => new CreadorVenta(),
  Descuento: (estrategia) => new CreadorDescuento(estrategia),
  "Donación": () => new CreadorDonacion(),
};

export function creadorPara(modalidad: Modalidad, estrategia: EstrategiaDescuento): CreadorPublicacion {
  return CREADORES[modalidad](estrategia);
}

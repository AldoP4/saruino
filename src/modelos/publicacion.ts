// La publicación de un alimento. Aquí se juntan tres patrones:
//   - FACTORY METHOD: Publicacion es el Producto y sus 3 hijas los Productos concretos
//   - STATE: Publicacion es el Contexto (guarda su estado y le delega reservar/entregar/cancelar)
//   - STRATEGY: PublicacionDescuento es el Contexto (le pide el porcentaje a su estrategia)
import type { EstrategiaDescuento } from "../patrones/strategy.js";
import { crearEstado, EstadoDisponible, type EstadoPublicacion, type NombreEstado } from "../patrones/state.js";

export type Modalidad = "Venta" | "Descuento" | "Donación";

export interface DatosPublicacion {
  id?: number; // viene de SQL Server; si no hay, se usa un numero local
  negocio: string;
  tipoNegocio: string;
  producto: string;
  cantidad: number;
  kilos: number;
  precioOriginal: number;
  horasParaCaducar: number;
  horarioRecoleccion: string;
  direccion: string;
}

let siguienteId = 1;

export abstract class Publicacion {
  readonly id: number;
  readonly datos: Readonly<DatosPublicacion>;
  private estado: EstadoPublicacion = new EstadoDisponible();

  constructor(datos: DatosPublicacion) {
    this.id = datos.id ?? siguienteId++;
    this.datos = { ...datos };
  }

  // Pone el estado guardado en SQL Server (lo usa crearDesdeFila en almacen.ts)
  restaurarEstado(nombre: NombreEstado): void {
    this.estado = crearEstado(nombre);
  }

  abstract get modalidad(): Modalidad;
  abstract calcularPrecioFinal(): number;

  get nombreEstado(): NombreEstado {
    return this.estado.nombre;
  }

  // Solo los estados llaman a este método para pasar al siguiente
  cambiarEstado(estado: EstadoPublicacion): void {
    this.estado = estado;
  }

  // La publicación no decide: le pasa la orden a su estado actual
  reservar(): void {
    this.estado.reservar(this);
  }

  entregar(): void {
    this.estado.entregar(this);
  }

  cancelar(): void {
    this.estado.cancelar(this);
  }
}

export class PublicacionVenta extends Publicacion {
  get modalidad(): Modalidad {
    return "Venta";
  }

  calcularPrecioFinal(): number {
    return this.datos.precioOriginal;
  }
}

export class PublicacionDescuento extends Publicacion {
  private estrategia: EstrategiaDescuento;

  constructor(datos: DatosPublicacion, estrategia: EstrategiaDescuento) {
    super(datos);
    this.estrategia = estrategia;
  }

  get modalidad(): Modalidad {
    return "Descuento";
  }

  get porcentaje(): number {
    return this.estrategia.calcularPorcentaje(this.datos.cantidad, this.datos.horasParaCaducar);
  }

  get nombreEstrategia(): string {
    return this.estrategia.nombre;
  }

  calcularPrecioFinal(): number {
    return Math.round(this.datos.precioOriginal * (100 - this.porcentaje)) / 100;
  }
}

export class PublicacionDonacion extends Publicacion {
  get modalidad(): Modalidad {
    return "Donación";
  }

  calcularPrecioFinal(): number {
    return 0;
  }
}

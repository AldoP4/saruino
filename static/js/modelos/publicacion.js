import { crearEstado, EstadoDisponible } from "../patrones/state.js";
let siguienteId = 1;
export class Publicacion {
    id;
    datos;
    estado = new EstadoDisponible();
    constructor(datos) {
        this.id = datos.id ?? siguienteId++;
        this.datos = { ...datos };
    }
    // Pone el estado guardado en SQL Server (lo usa crearDesdeFila en almacen.ts)
    restaurarEstado(nombre) {
        this.estado = crearEstado(nombre);
    }
    get nombreEstado() {
        return this.estado.nombre;
    }
    // Solo los estados llaman a este método para pasar al siguiente
    cambiarEstado(estado) {
        this.estado = estado;
    }
    // La publicación no decide: le pasa la orden a su estado actual
    reservar() {
        this.estado.reservar(this);
    }
    entregar() {
        this.estado.entregar(this);
    }
    cancelar() {
        this.estado.cancelar(this);
    }
}
export class PublicacionVenta extends Publicacion {
    get modalidad() {
        return "Venta";
    }
    calcularPrecioFinal() {
        return this.datos.precioOriginal;
    }
}
export class PublicacionDescuento extends Publicacion {
    estrategia;
    constructor(datos, estrategia) {
        super(datos);
        this.estrategia = estrategia;
    }
    get modalidad() {
        return "Descuento";
    }
    get porcentaje() {
        return this.estrategia.calcularPorcentaje(this.datos.cantidad, this.datos.horasParaCaducar);
    }
    get nombreEstrategia() {
        return this.estrategia.nombre;
    }
    calcularPrecioFinal() {
        return Math.round(this.datos.precioOriginal * (100 - this.porcentaje)) / 100;
    }
}
export class PublicacionDonacion extends Publicacion {
    get modalidad() {
        return "Donación";
    }
    calcularPrecioFinal() {
        return 0;
    }
}
//# sourceMappingURL=publicacion.js.map
export class EstadoDisponible {
    nombre = "Disponible";
    reservar(publicacion) {
        publicacion.cambiarEstado(new EstadoReservada());
    }
    entregar() {
        throw new Error("Primero hay que reservar la publicación.");
    }
    cancelar() {
        throw new Error("No hay una reserva que cancelar.");
    }
}
export class EstadoReservada {
    nombre = "Reservada";
    reservar() {
        throw new Error("Esta publicación ya está reservada.");
    }
    entregar(publicacion) {
        publicacion.cambiarEstado(new EstadoEntregada());
    }
    cancelar(publicacion) {
        publicacion.cambiarEstado(new EstadoDisponible());
    }
}
export class EstadoEntregada {
    nombre = "Entregada";
    reservar() {
        throw new Error("La publicación ya fue entregada.");
    }
    entregar() {
        throw new Error("La publicación ya fue entregada.");
    }
    cancelar() {
        throw new Error("No se puede cancelar una entrega terminada.");
    }
}
// Convierte el texto guardado en SQL Server ("Reservada") en su objeto State
const ESTADOS = {
    Disponible: () => new EstadoDisponible(),
    Reservada: () => new EstadoReservada(),
    Entregada: () => new EstadoEntregada(),
};
export function crearEstado(nombre) {
    return ESTADOS[nombre]();
}
//# sourceMappingURL=state.js.map
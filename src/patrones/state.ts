// =====================================================================
// PATRÓN STATE (de comportamiento)
//
// Problema del negocio: cada alimento pasa por un ciclo y no todo se puede
//   hacer en cualquier momento: no se entrega algo que nadie reservó, ni se
//   reserva dos veces lo mismo, ni se cancela algo ya entregado.
//
//   Disponible --reservar--> Reservada --entregar--> Entregada
//        ^                       |
//        +-------cancelar--------+
//
// Papeles:
//   Contexto ........... Publicacion (modelos/publicacion.ts): guarda su estado
//                        y le pasa cada orden (reservar, entregar, cancelar)
//   Estado ............. EstadoPublicacion (interfaz)
//   Estados concretos .. EstadoDisponible, EstadoReservada, EstadoEntregada
//
// Dónde se usa en la página:
//   - Botón "Reservar" de las tarjetas y botones "Marcar entregada" / "Cancelar"
//     de la sección de reservas (secciones/reservas.ts)
//   - El servidor repite la misma regla en TRANSICIONES de app.py
// =====================================================================
import type { Publicacion } from "../modelos/publicacion.js";

export type NombreEstado = "Disponible" | "Reservada" | "Entregada";

export interface EstadoPublicacion {
  readonly nombre: NombreEstado;
  reservar(publicacion: Publicacion): void;
  entregar(publicacion: Publicacion): void;
  cancelar(publicacion: Publicacion): void;
}

export class EstadoDisponible implements EstadoPublicacion {
  readonly nombre = "Disponible";

  reservar(publicacion: Publicacion): void {
    publicacion.cambiarEstado(new EstadoReservada());
  }

  entregar(): void {
    throw new Error("Primero hay que reservar la publicación.");
  }

  cancelar(): void {
    throw new Error("No hay una reserva que cancelar.");
  }
}

export class EstadoReservada implements EstadoPublicacion {
  readonly nombre = "Reservada";

  reservar(): void {
    throw new Error("Esta publicación ya está reservada.");
  }

  entregar(publicacion: Publicacion): void {
    publicacion.cambiarEstado(new EstadoEntregada());
  }

  cancelar(publicacion: Publicacion): void {
    publicacion.cambiarEstado(new EstadoDisponible());
  }
}

export class EstadoEntregada implements EstadoPublicacion {
  readonly nombre = "Entregada";

  reservar(): void {
    throw new Error("La publicación ya fue entregada.");
  }

  entregar(): void {
    throw new Error("La publicación ya fue entregada.");
  }

  cancelar(): void {
    throw new Error("No se puede cancelar una entrega terminada.");
  }
}

// Convierte el texto guardado en SQL Server ("Reservada") en su objeto State
const ESTADOS: Record<NombreEstado, () => EstadoPublicacion> = {
  Disponible: () => new EstadoDisponible(),
  Reservada: () => new EstadoReservada(),
  Entregada: () => new EstadoEntregada(),
};

export function crearEstado(nombre: NombreEstado): EstadoPublicacion {
  return ESTADOS[nombre]();
}

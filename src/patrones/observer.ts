// =====================================================================
// PATRÓN OBSERVER (de comportamiento)
//
// Problema del negocio: cuando un negocio publica comida (o una reserva se
//   cancela y vuelve a estar disponible) hay que avisar a varios lados a la vez:
//   la campana de la página y un servicio de mensajes. Quien publica no debería
//   conocer a cada uno de los que se enteran.
//
// Papeles:
//   Sujeto .................. CentroNotificaciones (suscribir, desuscribir, notificar)
//   Observador .............. Observador (interfaz: actualizar)
//   Observadores concretos .. PanelNotificaciones (la campana, secciones/notificaciones.ts)
//                             NotificadorMensajesAdapter (servicio externo, adapter.ts)
//
// Dónde se usa en la página:
//   - La campana de arriba a la derecha y el contador de mensajes enviados
//   - El interruptor "Enviar también por mensaje" suscribe o desuscribe al adaptador
//   - Cada 10 s la página revisa si otro negocio publicó (revisarNovedades)
// =====================================================================

export interface EventoAlimento {
  titulo: string;
  detalle: string;
}

export interface Observador {
  actualizar(evento: EventoAlimento): void;
}

export class CentroNotificaciones {
  private observadores: Observador[] = [];

  suscribir(observador: Observador): void {
    if (!this.observadores.includes(observador)) {
      this.observadores.push(observador);
    }
  }

  desuscribir(observador: Observador): void {
    this.observadores = this.observadores.filter((actual) => actual !== observador);
  }

  // El centro no sabe qué hace cada observador: solo llama a actualizar()
  notificar(evento: EventoAlimento): void {
    for (const observador of this.observadores) {
      observador.actualizar(evento);
    }
  }
}

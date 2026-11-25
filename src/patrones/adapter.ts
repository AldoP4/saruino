// =====================================================================
// PATRÓN ADAPTER (estructural)
//
// Problema del negocio: queremos usar servicios de otras empresas (Google Maps
//   para ubicar al negocio y un servicio de mensajes para avisar a clientes),
//   pero cada uno tiene sus propios métodos y no los podemos modificar.
//   El adaptador "traduce" lo que pide nuestro sistema a lo que entiende el servicio.
//
// Papeles:                     Mapas                Mensajes
//   Target (lo que esperamos) . ServicioMapa         Observador (observer.ts)
//   Adaptee (servicio externo)  GoogleMapsExterno    ApiMensajeriaExterna
//   Adapter ................... MapaAdapter          NotificadorMensajesAdapter
//
// Dónde se usa en la página:
//   - Enlace "Ver en mapa" de cada tarjeta (abre Google Maps de verdad)
//   - Contador "Mensajes enviados por el servicio externo" en la campana
//     (el servicio de mensajes está simulado: solo cuenta los mensajes)
// =====================================================================
import type { EventoAlimento, Observador } from "./observer.js";

// ---------- Mensajes ----------

// Servicio externo con su propio método (no se puede modificar)
export class ApiMensajeriaExterna {
  private enviados: string[] = [];

  enviarMensaje(destino: string, cuerpo: string): void {
    this.enviados.push(`Para ${destino}: ${cuerpo}`);
  }

  get totalEnviados(): number {
    return this.enviados.length;
  }
}

// El adaptador hace que la API de mensajes funcione como un observador más
export class NotificadorMensajesAdapter implements Observador {
  private api: ApiMensajeriaExterna;
  private destino: string;

  constructor(api: ApiMensajeriaExterna, destino: string) {
    this.api = api;
    this.destino = destino;
  }

  // actualizar() (lo que espera el Observer) se traduce a enviarMensaje() (lo que tiene la API)
  actualizar(evento: EventoAlimento): void {
    this.api.enviarMensaje(this.destino, `${evento.titulo}. ${evento.detalle}`);
  }
}

// ---------- Mapas ----------

export interface ServicioMapa {
  obtenerEnlace(direccion: string): string;
}

// Proveedor externo con su propio método
export class GoogleMapsExterno {
  construirUrlBusqueda(consulta: string): string {
    return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(consulta);
  }
}

// obtenerEnlace() (lo que pide la página) se traduce a construirUrlBusqueda() (lo que tiene Google)
export class MapaAdapter implements ServicioMapa {
  private proveedor = new GoogleMapsExterno();

  obtenerEnlace(direccion: string): string {
    return this.proveedor.construirUrlBusqueda(direccion + ", Puebla");
  }
}

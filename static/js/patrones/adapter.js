// ---------- Mensajes ----------
// Servicio externo con su propio método (no se puede modificar)
export class ApiMensajeriaExterna {
    enviados = [];
    enviarMensaje(destino, cuerpo) {
        this.enviados.push(`Para ${destino}: ${cuerpo}`);
    }
    get totalEnviados() {
        return this.enviados.length;
    }
}
// El adaptador hace que la API de mensajes funcione como un observador más
export class NotificadorMensajesAdapter {
    api;
    destino;
    constructor(api, destino) {
        this.api = api;
        this.destino = destino;
    }
    // actualizar() (lo que espera el Observer) se traduce a enviarMensaje() (lo que tiene la API)
    actualizar(evento) {
        this.api.enviarMensaje(this.destino, `${evento.titulo}. ${evento.detalle}`);
    }
}
// Proveedor externo con su propio método
export class GoogleMapsExterno {
    construirUrlBusqueda(consulta) {
        return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(consulta);
    }
}
// obtenerEnlace() (lo que pide la página) se traduce a construirUrlBusqueda() (lo que tiene Google)
export class MapaAdapter {
    proveedor = new GoogleMapsExterno();
    obtenerEnlace(direccion) {
        return this.proveedor.construirUrlBusqueda(direccion + ", Puebla");
    }
}
//# sourceMappingURL=adapter.js.map
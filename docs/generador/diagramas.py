# Genera los diagramas del documento de Saruino como imagenes PNG
import sys
from pathlib import Path

from lienzo import (AMARILLO, AZUL_CLARO, GRIS, NEGRO, VERDE, VERDE_CLARO, Lienzo, abajo, arriba, der,
                    izq)

SALIDA = Path(sys.argv[1])
SALIDA.mkdir(parents=True, exist_ok=True)
_medidor = Lienzo(4000, 4000)


def tam_clase(**kw):
    r = _medidor.clase(0, 0, **kw)
    return r[2] - r[0], r[3] - r[1]


def fila(L, y, specs, centro_x, separacion=50):
    """Dibuja varias clases en fila, centradas en centro_x. Regresa sus rectangulos."""
    anchos = [tam_clase(**s)[0] for s in specs]
    x = centro_x - (sum(anchos) + separacion * (len(specs) - 1)) / 2
    rects = []
    for s, w in zip(specs, anchos):
        rects.append(L.clase(x, y, **s))
        x += w + separacion
    return rects


def guardar(L, nombre):
    w, h = L.guardar(SALIDA / f"{nombre}.png")
    print(f"{nombre}.png {w}x{h}")


# =====================================================================
# 1. Arquitectura
# =====================================================================
def arquitectura():
    L = Lienzo(1800, 900)
    nav = L.panel(40, 60, 470, 360, "Navegador (front)", [
        "templates/index.html  →  la página",
        "static/css/  →  estilos",
        "static/js/  →  TypeScript compilado",
        "static/img/  →  imágenes",
        "",
        "Patrones: Factory Method, Strategy,",
        "Observer, State y Adapter",
    ])
    flask = L.panel(660, 60, 450, 360, "Servidor Flask (back)", [
        "app.py",
        "Ruta de la página (render_template)",
        "API: /api/publicaciones, /api/login…",
        "Sesiones y permisos",
        "Validación de datos",
        "conexion.py  →  pyodbc",
    ])
    bd = L.panel(1260, 60, 420, 360, "SQL Server Express", [
        "Base de datos: Saruino",
        "",
        "Negocios",
        "Usuarios",
        "Publicaciones",
        "Reservas",
        "RegistroDesperdicio",
    ], relleno=AZUL_CLARO)
    L.flecha([(nav[2], 190), (flask[0], 190)], "llena", etiqueta="petición HTTP (fetch)", pos_etiqueta=((nav[2] + flask[0]) / 2, 165))
    L.flecha([(flask[0], 290), (nav[2], 290)], "llena", punteada=True, etiqueta="respuesta JSON", pos_etiqueta=((nav[2] + flask[0]) / 2, 315))
    L.flecha([(flask[2], 190), (bd[0], 190)], "llena", etiqueta="consulta SQL", pos_etiqueta=((flask[2] + bd[0]) / 2, 165))
    L.flecha([(bd[0], 290), (flask[2], 290)], "llena", punteada=True, etiqueta="filas", pos_etiqueta=((flask[2] + bd[0]) / 2, 315))
    L.texto((flask[2] + bd[0]) / 2, 345, "ODBC Driver 18", 16, cursiva=True, color=GRIS, ancla="ma")
    mapas = L.panel(40, 540, 220, 110, "Google Maps", ["servicio externo"], relleno=AMARILLO, tam=17)
    msj = L.panel(290, 540, 260, 110, "Servicio de mensajes", ["externo (simulado)"], relleno=AMARILLO, tam=17)
    L.flecha([(arriba(mapas)[0], nav[3]), arriba(mapas)], "abierta", punteada=True, etiqueta="Adapter", pos_etiqueta=(arriba(mapas)[0], 480))
    L.flecha([(arriba(msj)[0], nav[3]), arriba(msj)], "abierta", punteada=True, etiqueta="Adapter", pos_etiqueta=(arriba(msj)[0], 480))
    guardar(L, "01_arquitectura")


# =====================================================================
# 2. Casos de uso
# =====================================================================
def casos_uso():
    L = Lienzo(1800, 1500)
    L.d.rectangle([460, 40, 1250, 1340], outline=NEGRO, width=2)
    L.texto(480, 52, "Sistema Saruino", 21, negrita=True)
    visitante = L.actor(150, 100, "Visitante")
    negocio = L.actor(150, 720, "Negocio")
    org = L.actor(1530, 600, "Cliente")
    admin = L.actor(1530, 1080, "Administrador")
    c = {
        "ver": L.caso(640, 130, "Ver alimentos disponibles"),
        "mapa": L.caso(640, 230, "Ver ubicación en el mapa"),
        "cuenta": L.caso(640, 330, "Crear cuenta"),
        "login": L.caso(640, 440, "Iniciar sesión"),
        "publicar": L.caso(640, 560, "Publicar alimento"),
        "descuento": L.caso(640, 680, "Calcular descuento"),
        "entregar": L.caso(640, 800, "Marcar entrega"),
        "cancelar": L.caso(840, 920, "Cancelar reserva"),
        "panel": L.caso(840, 1030, "Consultar mi panel"),
        "reservar": L.caso(1060, 620, "Reservar alimento"),
        "notif": L.caso(1060, 740, "Recibir notificaciones"),
        "admin": L.caso(1050, 1170, "Ver panel de administración", w=320),
        "eliminar": L.caso(1050, 1280, "Eliminar publicaciones", w=320),
    }
    conexiones = [
        (visitante, ["ver", "mapa", "cuenta"]),
        (negocio, ["login", "publicar", "entregar", "cancelar", "panel"]),
        (org, ["login", "reservar", "notif", "cancelar", "panel"]),
        (admin, ["admin", "eliminar", "cancelar"]),
    ]
    for actor, casos in conexiones:
        for clave in casos:
            L.linea([actor, L.borde_elipse(c[clave], actor)])
    # Se redibujan los casos encima de las lineas
    for clave, (cx, cy, a, b) in c.items():
        L.d.ellipse([cx - a, cy - b, cx + a, cy + b], fill=AZUL_CLARO, outline=NEGRO, width=2)
    textos = {"ver": "Ver alimentos disponibles", "mapa": "Ver ubicación en el mapa", "cuenta": "Crear cuenta",
              "login": "Iniciar sesión", "publicar": "Publicar alimento", "descuento": "Calcular descuento",
              "entregar": "Marcar entrega", "cancelar": "Cancelar reserva", "panel": "Consultar mi panel",
              "reservar": "Reservar alimento", "notif": "Recibir notificaciones",
              "admin": "Ver panel de administración", "eliminar": "Eliminar publicaciones"}
    for clave, (cx, cy, a, b) in c.items():
        L.texto(cx, cy, textos[clave], 18, ancla="mm")
    L.flecha([(640, 560 + 33), (640, 680 - 33)], "abierta", punteada=True, etiqueta="«include»", pos_etiqueta=(700, 620))
    L.texto(855, 1370, "Negocio, Cliente y Administrador también pueden hacer lo mismo que el Visitante.", 17, cursiva=True, color=GRIS, ancla="ma")
    L.texto(855, 1398, "Todos los usuarios con cuenta inician sesión (incluido el Administrador).", 17, cursiva=True, color=GRIS, ancla="ma")
    guardar(L, "02_casos_de_uso")


# =====================================================================
# 3. Clases: vista general de cómo se conectan los patrones
# =====================================================================
def clases_general():
    L = Lienzo(1600, 1300)
    creador = L.clase(40, 70, "CreadorPublicacion", estereotipo="abstracta", abstracta=True)
    publicacion = L.clase(560, 70, "Publicacion", estereotipo="abstracta", abstracta=True)
    estado = L.clase(1040, 70, "EstadoPublicacion", estereotipo="interfaz")
    L.flecha([der(creador), izq(publicacion)], "abierta", punteada=True, etiqueta="«crea»")
    L.flecha([der(publicacion), izq(estado)], "abierta", etiqueta="estado")
    L.texto((creador[2] + publicacion[0]) / 2, 40, "Factory Method", 18, negrita=True, color=VERDE, ancla="ma")
    L.texto((publicacion[2] + estado[0]) / 2, 40, "State", 18, negrita=True, color=VERDE, ancla="ma")

    descuento = L.clase(560, 300, "PublicacionDescuento")
    estrategia = L.clase(1040, 285, "EstrategiaDescuento", estereotipo="interfaz")
    L.herencia(publicacion, [descuento])
    L.flecha([der(descuento), (estrategia[0], der(descuento)[1])], "abierta", etiqueta="usa")
    L.texto((descuento[2] + estrategia[0]) / 2, 270, "Strategy", 18, negrita=True, color=VERDE, ancla="ma")
    L.texto(560, descuento[3] + 10, "(también PublicacionVenta y PublicacionDonacion)", 16, cursiva=True, color=GRIS)

    centro = L.clase(40, 445, "CentroNotificaciones")
    observador = L.clase(560, 430, "Observador", estereotipo="interfaz")
    L.flecha([der(centro), (observador[0], der(centro)[1])], "abierta", etiqueta="avisa a 0..*")
    L.texto((centro[2] + observador[0]) / 2, 410, "Observer", 18, negrita=True, color=VERDE, ancla="ma")
    panel, notificador = fila(L, 620, [dict(nombre="PanelNotificaciones"), dict(nombre="NotificadorMensajesAdapter")], abajo(observador)[0], 60)
    L.herencia(observador, [panel, notificador], punteada=True)
    api = L.clase(notificador[2] + 90, 620, "ApiMensajeriaExterna", relleno=AMARILLO)
    L.flecha([der(notificador), izq(api)], "abierta", etiqueta="usa")
    L.texto((notificador[2] + api[0]) / 2, 590, "Adapter", 18, negrita=True, color=VERDE, ancla="ma")

    mapa_if = L.clase(40, 760, "ServicioMapa", estereotipo="interfaz")
    mapa = L.clase(40, 920, "MapaAdapter")
    L.herencia(mapa_if, [mapa], punteada=True)
    google = L.clase(560, 920, "GoogleMapsExterno", relleno=AMARILLO)
    L.flecha([der(mapa), izq(google)], "abierta", etiqueta="usa")
    L.texto((mapa[2] + google[0]) / 2, 890, "Adapter", 18, negrita=True, color=VERDE, ancla="ma")
    guardar(L, "03_clases_general")


# =====================================================================
# 4. Factory Method
# =====================================================================
def factory():
    L = Lienzo(1700, 1300)
    creadores = [
        dict(nombre="CreadorVenta", metodos=["# crearPublicacion(datos)"]),
        dict(nombre="CreadorDescuento", atributos=["- estrategia: EstrategiaDescuento"], metodos=["# crearPublicacion(datos)"]),
        dict(nombre="CreadorDonacion", metodos=["# crearPublicacion(datos)"]),
    ]
    productos = [
        dict(nombre="PublicacionVenta", metodos=["+ calcularPrecioFinal()"]),
        dict(nombre="PublicacionDescuento", atributos=["- estrategia: EstrategiaDescuento"], metodos=["+ calcularPrecioFinal()"]),
        dict(nombre="PublicacionDonacion", metodos=["+ calcularPrecioFinal()"]),
    ]
    columnas = [max(tam_clase(**a)[0], tam_clase(**b)[0]) for a, b in zip(creadores, productos)]
    x0, sep = 300, 50
    centros, x = [], x0
    for w in columnas:
        centros.append(x + w / 2)
        x += w + sep
    centro_total = (x0 + x - sep) / 2

    w_padre, _ = tam_clase(nombre="CreadorPublicacion", estereotipo="abstracta", abstracta=True,
                           metodos=["+ publicar(datos): Publicacion", "- validar(datos): void", "# crearPublicacion(datos): Publicacion"])
    padre = L.clase(centro_total - w_padre / 2, 60, "CreadorPublicacion", estereotipo="abstracta", abstracta=True,
                    metodos=["+ publicar(datos): Publicacion", "- validar(datos): void", "# crearPublicacion(datos): Publicacion"])
    r_creadores = [L.clase(c - tam_clase(**s)[0] / 2, 330, **s) for c, s in zip(centros, creadores)]
    y_prod = max(r[3] for r in r_creadores) + 120
    r_productos = [L.clase(c - tam_clase(**s)[0] / 2, y_prod, **s) for c, s in zip(centros, productos)]
    L.herencia(padre, r_creadores)
    for rc, rp in zip(r_creadores, r_productos):
        L.flecha([abajo(rc), (abajo(rc)[0], rp[1])], "abierta", punteada=True, etiqueta="«crea»")
    spec_prod = dict(nombre="Publicacion", estereotipo="abstracta", abstracta=True,
                     atributos=["+ id: number", "+ datos: DatosPublicacion", "- estado: EstadoPublicacion"],
                     metodos=["+ calcularPrecioFinal(): number", "+ reservar() / entregar() / cancelar()"])
    w_prod, _ = tam_clase(**spec_prod)
    y_abs = max(r[3] for r in r_productos) + 110
    producto = L.clase(centro_total - w_prod / 2, y_abs, **spec_prod)
    L.herencia(producto, r_productos)
    for texto, r in [("Creador", padre), ("Creadores concretos", r_creadores[0]), ("Productos concretos", r_productos[0]), ("Producto", producto)]:
        L.texto(40, (r[1] + r[3]) / 2, texto, 19, negrita=True, color=VERDE, ancla="lm")
    guardar(L, "04_factory_method")


# =====================================================================
# 5. Strategy
# =====================================================================
def strategy():
    L = Lienzo(1700, 1100)
    contexto = L.clase(40, 90, "PublicacionDescuento", rol="Contexto",
                       atributos=["- estrategia: EstrategiaDescuento"],
                       metodos=["+ porcentaje: number", "+ calcularPrecioFinal(): number"])
    estrategia = L.clase(700, 100, "EstrategiaDescuento", estereotipo="interfaz", rol="Estrategia",
                         atributos=["+ nombre: string"], metodos=["+ calcularPorcentaje(cantidad, horas): number"])
    L.flecha([(contexto[2], 160), (estrategia[0], 160)], "abierta", etiqueta="usa")
    hijos = fila(L, 420, [
        dict(nombre="DescuentoPorCaducidad", metodos=["+ calcularPorcentaje(cantidad, horas)"], rol="Estrategia concreta"),
        dict(nombre="DescuentoPorDisponibilidad", metodos=["+ calcularPorcentaje(cantidad, horas)"], rol="Estrategia concreta"),
    ], abajo(estrategia)[0], 60)
    L.herencia(estrategia, hijos, punteada=True)
    reglas = [["Faltan 3 h o menos  →  50 %", "Faltan hasta 8 h  →  30 %", "Falta más  →  15 %"],
              ["20 piezas o más  →  40 %", "10 piezas o más  →  25 %", "Menos  →  10 %"]]
    for r, lineas in zip(hijos, reglas):
        n = L.nota(r[0], r[3] + 60, lineas)
        L.linea([(arriba(n)[0], n[1]), (arriba(n)[0], r[3])], punteada=True, color=GRIS)
    n = L.nota(40, contexto[3] + 60, ["precioFinal = precioOriginal × (100 − porcentaje) / 100"])
    L.linea([(n[0] + 60, n[1]), (n[0] + 60, contexto[3])], punteada=True, color=GRIS)
    guardar(L, "05_strategy")


# =====================================================================
# 6. Observer
# =====================================================================
def observer():
    L = Lienzo(1700, 1100)
    centro = L.clase(40, 90, "CentroNotificaciones", rol="Sujeto",
                     atributos=["- observadores: Observador[]"],
                     metodos=["+ suscribir(o: Observador)", "+ desuscribir(o: Observador)", "+ notificar(evento: EventoAlimento)"])
    observador = L.clase(760, 120, "Observador", estereotipo="interfaz", rol="Observador",
                         metodos=["+ actualizar(evento: EventoAlimento)"])
    L.flecha([(centro[2], 200), (observador[0], 200)], "abierta", etiqueta="avisa a 0..*")
    hijos = fila(L, 420, [
        dict(nombre="PanelNotificaciones", metodos=["+ actualizar(evento)"], rol="Observador concreto"),
        dict(nombre="NotificadorMensajesAdapter", atributos=["- api: ApiMensajeriaExterna"], metodos=["+ actualizar(evento)"], rol="Observador concreto"),
    ], abajo(observador)[0], 60)
    L.herencia(observador, hijos, punteada=True)
    L.texto(arriba(hijos[0])[0], hijos[0][3] + 12, "(la campana)", 16, cursiva=True, color=GRIS, ancla="ma")
    L.texto(arriba(hijos[1])[0], hijos[1][3] + 12, "(servicio externo de mensajes)", 16, cursiva=True, color=GRIS, ancla="ma")
    evento = L.clase(40, 480, "EventoAlimento", estereotipo="interfaz", atributos=["+ titulo: string", "+ detalle: string"])
    L.flecha([(abajo(centro)[0] - 60, centro[3]), (abajo(centro)[0] - 60, evento[1])], "abierta", punteada=True, etiqueta="«usa»")
    L.nota(40, evento[3] + 50, ["revisarNovedades() revisa cada 10 s si otro", "negocio publicó algo; si sí, llama a notificar().",
                                "También se notifica al publicar y al cancelar."])
    guardar(L, "06_observer")


# =====================================================================
# 7. State (clases)
# =====================================================================
def state_clases():
    L = Lienzo(1900, 1100)
    contexto = L.clase(40, 90, "Publicacion", rol="Contexto", atributos=["- estado: EstadoPublicacion"],
                       metodos=["+ reservar()", "+ entregar()", "+ cancelar()", "+ cambiarEstado(e: EstadoPublicacion)", "+ restaurarEstado(nombre)"])
    estado = L.clase(720, 110, "EstadoPublicacion", estereotipo="interfaz", rol="Estado",
                     atributos=["+ nombre: NombreEstado"],
                     metodos=["+ reservar(p: Publicacion)", "+ entregar(p: Publicacion)", "+ cancelar(p: Publicacion)"])
    L.flecha([(contexto[2], 190), (estado[0], 190)], "abierta", etiqueta="estado actual")
    hijos = fila(L, 500, [dict(nombre=n, metodos=["+ reservar(p)", "+ entregar(p)", "+ cancelar(p)"], rol="Estado concreto")
                          for n in ["EstadoDisponible", "EstadoReservada", "EstadoEntregada"]], abajo(estado)[0], 50)
    L.herencia(estado, hijos, punteada=True)
    L.nota(40, contexto[3] + 60, ["La publicación le pasa cada orden a su estado actual.",
                                  "El estado decide si se puede y cambia al siguiente."])
    guardar(L, "07_state_clases")


# =====================================================================
# 8. Adapter
# =====================================================================
def adapter():
    L = Lienzo(1800, 1100)
    for x0, titulo, target, adaptador, adaptee, enlace in [
        (40, "Mapas",
         dict(nombre="ServicioMapa", estereotipo="interfaz", metodos=["+ obtenerEnlace(direccion): string"]),
         dict(nombre="MapaAdapter", atributos=["- proveedor: GoogleMapsExterno"], metodos=["+ obtenerEnlace(direccion): string"]),
         dict(nombre="GoogleMapsExterno", metodos=["+ construirUrlBusqueda(consulta): string"], relleno=AMARILLO),
         "construirUrlBusqueda()"),
        (820, "Mensajes",
         dict(nombre="Observador", estereotipo="interfaz", metodos=["+ actualizar(evento)"]),
         dict(nombre="NotificadorMensajesAdapter", atributos=["- api: ApiMensajeriaExterna", "- destino: string"], metodos=["+ actualizar(evento)"]),
         dict(nombre="ApiMensajeriaExterna", metodos=["+ enviarMensaje(destino, cuerpo)"], relleno=AMARILLO),
         "enviarMensaje()"),
    ]:
        L.texto(x0, 30, titulo, 22, negrita=True)
        t = L.clase(x0, 110, rol="Target (lo que espera el sistema)", **target)
        a = L.clase(x0, 380, rol="Adapter", **adaptador)
        e = L.clase(x0, 680, rol="Adaptee (servicio externo)", **adaptee)
        L.herencia(t, [a], punteada=True)
        L.flecha([(x0 + 80, a[3]), (x0 + 80, e[1] - 30)], "abierta", etiqueta=f"llama a {enlace}", pos_etiqueta=(x0 + 80 + 130, (a[3] + e[1] - 30) / 2))
    guardar(L, "08_adapter")


# =====================================================================
# 9 y 10. Secuencia
# =====================================================================
def secuencia(nombre, participantes, mensajes, separacion=270):
    alto = 200 + sum(80 if m[0] == "sep" or m[3] == "propio" else 58 for m in mensajes)
    L = Lienzo(420 + separacion * len(participantes), alto + 80)
    xs = [130 + i * separacion for i in range(len(participantes))]
    y_cab = 30
    for x, (nombre_p, es_actor) in zip(xs, participantes):
        if es_actor:
            L.actor(x, y_cab - 10, nombre_p)
        else:
            lineas = nombre_p.split("\n")
            L.d.rectangle([x - 115, y_cab, x + 115, y_cab + 70], fill=VERDE_CLARO, outline=NEGRO, width=2)
            for i, l in enumerate(lineas):
                L.texto(x, y_cab + 35 + (i - (len(lineas) - 1) / 2) * 24, l, 18, negrita=(i == 0), ancla="mm")
    # Primero las lineas de vida, para que los textos queden encima
    y_fin = 190 + sum(80 if m[0] == "sep" or m[3] == "propio" else 58 for m in mensajes)
    for x in xs:
        L.linea([(x, 160), (x, y_fin + 10)], punteada=True, color=GRIS)
    y = 190
    for m in mensajes:
        if m[0] == "sep":
            L.linea([(40, y + 30), (xs[-1] + 140, y + 30)], punteada=True, color=VERDE)
            L.etiqueta(xs[0] + 150, y + 30, m[1], 18, color=VERDE)
            y += 80
            continue
        de, a, texto, tipo = m
        if tipo == "propio":
            x = xs[de]
            L.linea([(x, y), (x + 50, y), (x + 50, y + 34)])
            L.flecha([(x + 50, y + 34), (x, y + 34)], "abierta")
            L.texto_fondo(x + 60, y + 24, texto, 17)
            y += 80
        else:
            x1, x2 = xs[de], xs[a]
            L.flecha([(x1, y + 22), (x2, y + 22)], "llena" if tipo == "llamada" else "abierta", punteada=(tipo == "retorno"))
            L.texto_fondo((x1 + x2) / 2, y + 12, texto, 17, ancla="ms")
            y += 58
    guardar(L, nombre)


def secuencias():
    secuencia("09_secuencia_publicar", [
        ("Negocio", True), ("Página\n(publicar.ts)", False), ("CreadorPublicacion\n(Factory Method)", False),
        ("Flask\n(app.py)", False), ("SQL Server", False), ("CentroNotificaciones\n(Observer)", False)], [
        (0, 1, "1: llena el formulario y publica", "llamada"),
        (1, 2, "2: publicar(datos)", "llamada"),
        (2, 2, "3: validar() y crearPublicacion()", "propio"),
        (2, 1, "4: Publicacion", "retorno"),
        (1, 3, "5: POST /api/publicaciones", "llamada"),
        (3, 3, "6: revisa sesión (negocio) y valida", "propio"),
        (3, 4, "7: INSERT INTO Publicaciones", "llamada"),
        (4, 3, "8: PublicacionID", "retorno"),
        (3, 1, "9: 201 + publicación (JSON)", "retorno"),
        (1, 5, "10: notificar(evento)", "llamada"),
        (5, 5, "11: actualizar() a cada observador", "propio"),
        (1, 0, "12: aviso «Nuevo alimento»", "retorno"),
    ])
    secuencia("10_secuencia_reservar_entregar", [
        ("Cliente", True), ("Página\n(reservas.ts)", False), ("Publicacion\n(State)", False),
        ("Flask\n(app.py)", False), ("SQL Server", False), ("Negocio", True)], [
        ("sep", "Reserva (cliente)"),
        (0, 1, "1: clic en Reservar", "llamada"),
        (1, 2, "2: reservar()", "llamada"),
        (2, 2, "3: Disponible → Reservada", "propio"),
        (1, 3, "4: POST /api/…/reservar", "llamada"),
        (3, 3, "5: revisar_permiso()", "propio"),
        (3, 4, "6: UPDATE … WHERE Estado='Disponible'", "llamada"),
        (3, 4, "7: INSERT INTO Reservas", "llamada"),
        (3, 1, "8: 200 + publicación (JSON)", "retorno"),
        ("sep", "Entrega (negocio que publicó)"),
        (5, 1, "9: clic en Marcar entregada", "llamada"),
        (1, 2, "10: entregar()", "llamada"),
        (2, 2, "11: Reservada → Entregada", "propio"),
        (1, 3, "12: POST /api/…/entregar", "llamada"),
        (3, 4, "13: UPDATE … Estado='Entregada'", "llamada"),
        (3, 4, "14: INSERT INTO RegistroDesperdicio", "llamada"),
        (3, 1, "15: 200 + publicación (JSON)", "retorno"),
        (1, 5, "16: kilos evitados actualizados", "retorno"),
    ])


# =====================================================================
# 11. Diagrama de estados
# =====================================================================
def estados():
    L = Lienzo(1500, 600)
    y = 160
    L.d.ellipse([60, y - 14, 88, y + 14], fill=NEGRO)
    disponible = L.estado(330, y, "Disponible")
    reservada = L.estado(720, y, "Reservada")
    entregada = L.estado(1110, y, "Entregada")
    L.d.ellipse([1330, y - 18, 1366, y + 18], outline=NEGRO, width=3)
    L.d.ellipse([1338, y - 10, 1358, y + 10], fill=NEGRO)
    L.flecha([(88, y), (disponible[0], y)], "abierta", etiqueta="publicar", pos_etiqueta=((88 + disponible[0]) / 2, y - 26))
    L.flecha([(disponible[2], y), (reservada[0], y)], "abierta", etiqueta="reservar()", pos_etiqueta=((disponible[2] + reservada[0]) / 2, y - 26))
    L.flecha([(reservada[2], y), (entregada[0], y)], "abierta", etiqueta="entregar()", pos_etiqueta=((reservada[2] + entregada[0]) / 2, y - 26))
    L.flecha([(entregada[2], y), (1330, y)], "abierta")
    L.flecha([(720, reservada[3]), (720, y + 120), (330, y + 120), (330, disponible[3])], "abierta",
             etiqueta="cancelar()", pos_etiqueta=(525, y + 120))
    L.nota(40, y + 170, ["Cada estado decide qué acción se permite. Una acción inválida lanza un error,",
                         "por ejemplo: entregar algo que nadie reservó o reservar algo ya reservado."])
    guardar(L, "11_estados")


# =====================================================================
# 12. Entidad-relación
# =====================================================================
def entidad_relacion():
    L = Lienzo(1700, 1000)
    negocios = L.tabla(40, 60, "Negocios", [("NegocioID", "INT", "PK"), ("Nombre", "NVARCHAR(100)", ""),
                                             ("TipoNegocio", "NVARCHAR(30)", ""), ("Direccion", "NVARCHAR(200)", "")])
    usuarios = L.tabla(40, negocios[3] + 130, "Usuarios", [
        ("UsuarioID", "INT", "PK"), ("Nombre", "NVARCHAR(100)", ""), ("Correo", "NVARCHAR(120)", "UQ"),
        ("ContrasenaHash", "NVARCHAR(300)", ""), ("Tipo", "NVARCHAR(20)", ""), ("NegocioID", "INT", "FK"),
        ("FechaRegistro", "DATETIME2", "")])
    publicaciones = L.tabla(negocios[2] + 150, 60, "Publicaciones", [
        ("PublicacionID", "INT", "PK"), ("NegocioID", "INT", "FK"), ("Producto", "NVARCHAR(120)", ""),
        ("Cantidad", "INT", ""), ("Kilos", "DECIMAL(6,2)", ""), ("PrecioOriginal", "DECIMAL(10,2)", ""),
        ("HorasParaCaducar", "INT", ""), ("HorarioRecoleccion", "NVARCHAR(50)", ""), ("Modalidad", "NVARCHAR(20)", ""),
        ("Estrategia", "NVARCHAR(20)", ""), ("Estado", "NVARCHAR(20)", ""), ("FechaPublicacion", "DATETIME2", "")])
    registro = L.tabla(publicaciones[2] + 150, 60, "RegistroDesperdicio", [
        ("RegistroID", "INT", "PK"), ("PublicacionID", "INT", "FK"), ("KilosEvitados", "DECIMAL(6,2)", ""),
        ("FechaEntrega", "DATETIME2", "")])
    reservas = L.tabla(publicaciones[2] + 150, registro[3] + 90, "Reservas", [
        ("ReservaID", "INT", "PK"), ("PublicacionID", "INT", "FK"), ("UsuarioID", "INT", "FK"),
        ("Solicitante", "NVARCHAR(100)", ""), ("Estado", "NVARCHAR(20)", ""), ("FechaReserva", "DATETIME2", "")])

    def relacion(puntos, uno, muchos):
        L.linea(puntos)
        (x1, y1), (x2, y2) = puntos[0], puntos[1]
        (x3, y3), (x4, y4) = puntos[-2], puntos[-1]
        off1 = (14 if x2 > x1 else -14 if x2 < x1 else 18, -14 if y2 == y1 else (14 if y2 > y1 else -14))
        off2 = (-22 if x4 > x3 else 22 if x4 < x3 else 22, -14 if y4 == y3 else (-16 if y4 > y3 else 16))
        L.texto(x1 + off1[0], y1 + off1[1], uno, 18, negrita=True, color=VERDE, ancla="mm")
        L.texto(x4 + off2[0], y4 + off2[1], muchos, 18, negrita=True, color=VERDE, ancla="mm")

    y_np = negocios[1] + 70
    relacion([(negocios[2], y_np), (publicaciones[0], y_np)], "1", "N")
    relacion([(abajo(negocios)[0], negocios[3]), (abajo(negocios)[0], usuarios[1])], "1", "0..N")
    y_pr = registro[1] + 70
    relacion([(publicaciones[2], y_pr), (registro[0], y_pr)], "1", "N")
    y_pv = reservas[1] + 70
    relacion([(publicaciones[2], y_pv), (reservas[0], y_pv)], "1", "N")
    y_ur = max(usuarios[3], reservas[3], publicaciones[3]) + 50
    x_res = abajo(reservas)[0]
    relacion([(abajo(usuarios)[0], usuarios[3]), (abajo(usuarios)[0], y_ur), (x_res, y_ur), (x_res, reservas[3])], "1", "N")
    L.texto(40, y_ur + 40, "PK = llave primaria · FK = llave foránea · UQ = valor único", 16, cursiva=True, color=GRIS)
    guardar(L, "12_entidad_relacion")


for funcion in [arquitectura, casos_uso, clases_general, factory, strategy, observer, state_clases, adapter,
                secuencias, estados, entidad_relacion]:
    funcion()

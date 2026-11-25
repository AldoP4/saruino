# Pequena libreria para dibujar diagramas UML con Pillow (sin descargar herramientas)
import math

from PIL import Image, ImageChops, ImageDraw, ImageFont

FUENTES = {
    (False, False): r"C:\Windows\Fonts\arial.ttf",
    (True, False): r"C:\Windows\Fonts\arialbd.ttf",
    (False, True): r"C:\Windows\Fonts\ariali.ttf",
    (True, True): r"C:\Windows\Fonts\arialbi.ttf",
}
NEGRO = "#222222"
GRIS = "#555555"
VERDE = "#8a5d17"
VERDE_CLARO = "#f7ecd6"
AZUL_CLARO = "#f6e0db"
AMARILLO = "#fff6d6"
BLANCO = "white"
_cache = {}


def fuente(tam, negrita=False, cursiva=False):
    clave = (tam, negrita, cursiva)
    if clave not in _cache:
        _cache[clave] = ImageFont.truetype(FUENTES[(negrita, cursiva)], tam)
    return _cache[clave]


def arriba(r):
    return ((r[0] + r[2]) / 2, r[1])


def abajo(r):
    return ((r[0] + r[2]) / 2, r[3])


def izq(r):
    return (r[0], (r[1] + r[3]) / 2)


def der(r):
    return (r[2], (r[1] + r[3]) / 2)


class Lienzo:
    def __init__(self, ancho, alto):
        self.img = Image.new("RGB", (ancho, alto), BLANCO)
        self.d = ImageDraw.Draw(self.img)
        self._roles = []  # se dibujan al final, encima de las lineas

    def texto_fondo(self, x, y, texto, tam=17, cursiva=False, color=NEGRO, ancla="ls"):
        """Texto con fondo blanco (para que se lea aunque pase una linea por debajo)."""
        caja = self.d.textbbox((x, y), texto, font=fuente(tam, False, cursiva), anchor=ancla)
        self.d.rectangle([caja[0] - 4, caja[1] - 3, caja[2] + 4, caja[3] + 3], fill=BLANCO)
        self.texto(x, y, texto, tam, cursiva=cursiva, color=color, ancla=ancla)

    # ---------- texto ----------
    def medir(self, texto, tam=20, negrita=False, cursiva=False):
        b = self.d.textbbox((0, 0), texto, font=fuente(tam, negrita, cursiva))
        return b[2] - b[0]

    def texto(self, x, y, texto, tam=20, negrita=False, cursiva=False, color=NEGRO, ancla="la"):
        self.d.text((x, y), texto, font=fuente(tam, negrita, cursiva), fill=color, anchor=ancla)

    def etiqueta(self, x, y, texto, tam=18, cursiva=False, color=GRIS):
        """Texto centrado con fondo blanco para que se lea encima de las lineas."""
        w = self.medir(texto, tam, cursiva=cursiva)
        self.d.rectangle([x - w / 2 - 4, y - tam / 2 - 3, x + w / 2 + 4, y + tam / 2 + 3], fill=BLANCO)
        self.texto(x, y, texto, tam, cursiva=cursiva, color=color, ancla="mm")

    # ---------- lineas y flechas ----------
    def linea(self, puntos, punteada=False, color=NEGRO, grosor=2):
        for (x1, y1), (x2, y2) in zip(puntos, puntos[1:]):
            if not punteada:
                self.d.line([(x1, y1), (x2, y2)], fill=color, width=grosor)
                continue
            largo = math.hypot(x2 - x1, y2 - y1)
            if largo == 0:
                continue
            dx, dy = (x2 - x1) / largo, (y2 - y1) / largo
            pos = 0
            while pos < largo:
                fin = min(pos + 10, largo)
                self.d.line([(x1 + dx * pos, y1 + dy * pos), (x1 + dx * fin, y1 + dy * fin)], fill=color, width=grosor)
                pos += 17

    def flecha(self, puntos, punta="abierta", punteada=False, color=NEGRO, etiqueta=None, pos_etiqueta=None):
        self.linea(puntos, punteada, color)
        (x1, y1), (x2, y2) = puntos[-2], puntos[-1]
        ang = math.atan2(y2 - y1, x2 - x1)
        largo, abertura = 16, math.radians(26)
        p1 = (x2 - largo * math.cos(ang - abertura), y2 - largo * math.sin(ang - abertura))
        p2 = (x2 - largo * math.cos(ang + abertura), y2 - largo * math.sin(ang + abertura))
        if punta == "abierta":
            self.d.line([p1, (x2, y2), p2], fill=color, width=2)
        elif punta == "triangulo":
            l2 = 20
            q1 = (x2 - l2 * math.cos(ang - abertura), y2 - l2 * math.sin(ang - abertura))
            q2 = (x2 - l2 * math.cos(ang + abertura), y2 - l2 * math.sin(ang + abertura))
            self.d.polygon([(x2, y2), q1, q2], fill=BLANCO, outline=color, width=2)
        elif punta == "llena":
            self.d.polygon([(x2, y2), p1, p2], fill=color)
        if etiqueta:
            if pos_etiqueta is None:
                (a, b), (c, e) = puntos[len(puntos) // 2 - 1], puntos[len(puntos) // 2]
                pos_etiqueta = ((a + c) / 2, (b + e) / 2)
            self.etiqueta(*pos_etiqueta, etiqueta)

    # ---------- figuras UML ----------
    def clase(self, x, y, nombre, atributos=(), metodos=(), estereotipo=None, abstracta=False,
              relleno=VERDE_CLARO, ancho=None, rol=None):
        tam, alto_linea, margen = 19, 26, 14
        textos = [nombre] + list(atributos) + list(metodos) + ([f"«{estereotipo}»"] if estereotipo else [])
        w = ancho or max(self.medir(t, tam, negrita=(t == nombre)) for t in textos) + 2 * margen
        alto_cab = (alto_linea if estereotipo else 0) + alto_linea + 12
        alto_atr = max(1, len(atributos)) * alto_linea + 10 if (atributos or metodos) else 0
        alto_met = len(metodos) * alto_linea + 10 if metodos else 0
        h = alto_cab + alto_atr + alto_met
        self.d.rectangle([x, y, x + w, y + alto_cab], fill=relleno, outline=NEGRO, width=2)
        cy = y + 8
        if estereotipo:
            self.texto(x + w / 2, cy, f"«{estereotipo}»", 17, cursiva=True, color=GRIS, ancla="ma")
            cy += alto_linea
        self.texto(x + w / 2, cy, nombre, tam, negrita=True, cursiva=abstracta, ancla="ma")
        if atributos or metodos:
            self.d.rectangle([x, y + alto_cab, x + w, y + alto_cab + alto_atr], fill=BLANCO, outline=NEGRO, width=2)
            for i, a in enumerate(atributos):
                self.texto(x + margen, y + alto_cab + 6 + i * alto_linea, a, tam)
        if metodos:
            y0 = y + alto_cab + alto_atr
            self.d.rectangle([x, y0, x + w, y0 + alto_met], fill=BLANCO, outline=NEGRO, width=2)
            for i, m in enumerate(metodos):
                self.texto(x + margen, y0 + 6 + i * alto_linea, m, tam)
        if rol:
            self._roles.append((x + w / 2, y - 8, rol))
        return (x, y, x + w, y + h)

    def herencia(self, padre, hijos, punteada=False):
        """Lineas de hijos a padre con triangulo hueco (punteada = implementa una interfaz)."""
        hacia_abajo = hijos[0][1] > padre[3]
        if hacia_abajo:
            y_bus = padre[3] + (min(h[1] for h in hijos) - padre[3]) / 2
            for h in hijos:
                self.linea([arriba(h), (arriba(h)[0], y_bus)], punteada)
            xs = [arriba(h)[0] for h in hijos] + [abajo(padre)[0]]
            self.linea([(min(xs), y_bus), (max(xs), y_bus)], punteada)
            self.flecha([(abajo(padre)[0], y_bus), abajo(padre)], "triangulo", punteada)
        else:
            y_bus = padre[1] - (padre[1] - max(h[3] for h in hijos)) / 2
            for h in hijos:
                self.linea([abajo(h), (abajo(h)[0], y_bus)], punteada)
            xs = [abajo(h)[0] for h in hijos] + [arriba(padre)[0]]
            self.linea([(min(xs), y_bus), (max(xs), y_bus)], punteada)
            self.flecha([(arriba(padre)[0], y_bus), arriba(padre)], "triangulo", punteada)

    def nota(self, x, y, lineas, tam=17, ancho=None):
        w = ancho or max(self.medir(l, tam) for l in lineas) + 28
        h = len(lineas) * (tam + 7) + 18
        doblez = 14
        self.d.polygon([(x, y), (x + w - doblez, y), (x + w, y + doblez), (x + w, y + h), (x, y + h)],
                       fill=AMARILLO, outline=GRIS, width=2)
        self.d.line([(x + w - doblez, y), (x + w - doblez, y + doblez), (x + w, y + doblez)], fill=GRIS, width=2)
        for i, l in enumerate(lineas):
            self.texto(x + 12, y + 10 + i * (tam + 7), l, tam)
        return (x, y, x + w, y + h)

    def panel(self, x, y, w, h, titulo, lineas, relleno=VERDE_CLARO, tam=19):
        self.d.rectangle([x, y, x + w, y + h], fill=BLANCO, outline=NEGRO, width=2)
        self.d.rectangle([x, y, x + w, y + 46], fill=relleno, outline=NEGRO, width=2)
        self.texto(x + w / 2, y + 23, titulo, 20, negrita=True, ancla="mm")
        for i, l in enumerate(lineas):
            self.texto(x + 16, y + 62 + i * 30, l, tam)
        return (x, y, x + w, y + h)

    def actor(self, x, y, nombre):
        self.d.ellipse([x - 16, y, x + 16, y + 32], outline=NEGRO, width=2, fill=BLANCO)
        self.d.line([(x, y + 32), (x, y + 82)], fill=NEGRO, width=2)
        self.d.line([(x - 30, y + 50), (x + 30, y + 50)], fill=NEGRO, width=2)
        self.d.line([(x, y + 82), (x - 24, y + 118)], fill=NEGRO, width=2)
        self.d.line([(x, y + 82), (x + 24, y + 118)], fill=NEGRO, width=2)
        self.texto(x, y + 126, nombre, 19, negrita=True, ancla="ma")
        return (x, y + 55)

    def caso(self, cx, cy, texto, w=290, h=66):
        self.d.ellipse([cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2], fill=AZUL_CLARO, outline=NEGRO, width=2)
        self.texto(cx, cy, texto, 18, ancla="mm")
        return (cx, cy, w / 2, h / 2)

    @staticmethod
    def borde_elipse(caso, hacia):
        cx, cy, a, b = caso
        ang = math.atan2(hacia[1] - cy, hacia[0] - cx)
        return (cx + a * math.cos(ang), cy + b * math.sin(ang))

    def estado(self, cx, cy, nombre, w=230, h=70):
        r = (cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2)
        self.d.rounded_rectangle(r, radius=22, fill=VERDE_CLARO, outline=NEGRO, width=2)
        self.texto(cx, cy, nombre, 21, negrita=True, ancla="mm")
        return r

    def tabla(self, x, y, nombre, columnas, ancho=None):
        tam, alto_linea = 18, 27
        textos = [f"{c}  {t}" for c, t, _ in columnas]
        w = ancho or max(max(self.medir(t, tam) for t in textos) + 70, self.medir(nombre, 20, True) + 30)
        h = 40 + len(columnas) * alto_linea + 10
        self.d.rectangle([x, y, x + w, y + h], fill=BLANCO, outline=NEGRO, width=2)
        self.d.rectangle([x, y, x + w, y + 40], fill=VERDE, outline=NEGRO, width=2)
        self.texto(x + w / 2, y + 20, nombre, 20, negrita=True, color=BLANCO, ancla="mm")
        for i, (col, tipo, clave) in enumerate(columnas):
            yy = y + 48 + i * alto_linea
            if clave:
                self.texto(x + 10, yy, clave, 15, negrita=True, color=VERDE)
            self.texto(x + 48, yy, col, tam, negrita=(clave == "PK"))
            self.texto(x + w - 10, yy, tipo, 15, color=GRIS, ancla="ra")
        return (x, y, x + w, y + h)

    # ---------- guardar ----------
    def guardar(self, ruta, margen=24):
        for x, y, rol in self._roles:
            self.texto_fondo(x, y, rol, 17, cursiva=True, color=VERDE, ancla="md")
        fondo = Image.new("RGB", self.img.size, BLANCO)
        caja = ImageChops.difference(self.img, fondo).getbbox()
        img = self.img
        if caja:
            img = self.img.crop((max(0, caja[0] - margen), max(0, caja[1] - margen),
                                 min(self.img.width, caja[2] + margen), min(self.img.height, caja[3] + margen)))
        img.save(ruta, dpi=(150, 150))
        return img.size

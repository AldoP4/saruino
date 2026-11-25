# Compone la imagen de la portada: fondo de Saruino, logo de la UMAD, logo de Saruino y titulos
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ORIGEN = Path(r"C:\Users\apm04\Downloads\saruinopagina")
SALIDA = Path(__file__).parent / "portada.jpg"
ANCHO, ALTO = 1632, 1560  # se muestra a 816 x 780 px (ancho completo de la hoja)
DORADO = (232, 195, 122)
CREMA = (241, 230, 208)


def cubrir(img, ancho, alto):
    """Recorta y escala la imagen para llenar el tamano pedido sin deformarla."""
    escala = max(ancho / img.width, alto / img.height)
    img = img.resize((round(img.width * escala), round(img.height * escala)), Image.LANCZOS)
    x, y = (img.width - ancho) // 2, (img.height - alto) // 2
    return img.crop((x, y, x + ancho, y + alto))


lienzo = cubrir(Image.open(ORIGEN / "image-1795033819338.webp").convert("RGB"), ANCHO, ALTO).convert("RGBA")
sombra = Image.new("RGBA", lienzo.size, (0, 0, 0, 70))
lienzo.alpha_composite(sombra)

umad = Image.open(ORIGEN / "LOGOS_UMAD-MEXICO-2-blanco-300x148.webp").convert("RGBA")
umad = umad.resize((380, round(380 * umad.height / umad.width)), Image.LANCZOS)
lienzo.alpha_composite(umad, ((ANCHO - umad.width) // 2, 90))

logo = Image.open(ORIGEN / "image-1795033796678.webp").convert("RGBA")
logo = logo.resize((900, round(900 * logo.height / logo.width)), Image.LANCZOS)
y_logo = 420
marco = Image.new("RGBA", (logo.width + 8, logo.height + 8), (207, 152, 57, 255))
lienzo.alpha_composite(marco, ((ANCHO - marco.width) // 2, y_logo - 4))
lienzo.alpha_composite(logo, ((ANCHO - logo.width) // 2, y_logo))

d = ImageDraw.Draw(lienzo)
serif = ImageFont.truetype(r"C:\Windows\Fonts\georgiab.ttf", 58)
normal = ImageFont.truetype(r"C:\Windows\Fonts\georgia.ttf", 44)
d.text((ANCHO / 2, 330), "Ingeniería en Software", font=normal, fill=CREMA, anchor="mm")
y_txt = y_logo + logo.height + 110
d.text((ANCHO / 2, y_txt), "Plataforma para reducir el desperdicio de alimentos", font=serif, fill=DORADO, anchor="mm")
d.text((ANCHO / 2, y_txt + 90), "Proyecto final · Patrones Orientados a Objetos", font=normal, fill=CREMA, anchor="mm")

lienzo.convert("RGB").save(SALIDA, quality=90)
print("portada:", SALIDA.name, lienzo.size)

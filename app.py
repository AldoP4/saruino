# app.py
# Servidor de Saruino: sirve la pagina y la API que guarda todo en SQL Server Express

import os
import re
import secrets
from decimal import Decimal, InvalidOperation
from functools import wraps

import pyodbc
from flask import Flask, jsonify, render_template, request, session
from werkzeug.security import check_password_hash, generate_password_hash

from conexion import conectar

# Estructura de Flask: templates/ tiene el front (HTML) y static/ los estilos, scripts e imagenes
app = Flask(__name__, template_folder="templates", static_folder="static")

# Llave para firmar la sesion. Si no hay variable de entorno se genera una nueva
# cada vez que arranca el servidor (las sesiones abiertas se cierran al reiniciarlo).
app.secret_key = os.environ.get("SARUINO_SECRET_KEY") or secrets.token_hex(32)
app.config.update(SESSION_COOKIE_HTTPONLY=True, SESSION_COOKIE_SAMESITE="Lax")
# El navegador siempre pregunta si cambió algo en static/ (css, js), para no ver una versión vieja
app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0

MODALIDADES = ("Venta", "Descuento", "Donación")
ESTRATEGIAS = ("caducidad", "disponibilidad")
TIPOS_NEGOCIO = ("Restaurante", "Cafetería", "Panadería", "Supermercado")
# Roles: Administrador (supervisa todo), Negocio (publica) y Cliente (reserva).
# Desde la pagina solo se pueden crear cuentas de Negocio o Cliente; el administrador lo crea crearBD.py.
ROLES_REGISTRO = ("Negocio", "Cliente")
FORMATO_CORREO = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
MINIMO_CONTRASENA = 8

# Que estado se necesita para cada accion y a cual se pasa (debe coincidir con State en TypeScript)
TRANSICIONES = {
    "reservar": ("Disponible", "Reservada"),
    "entregar": ("Reservada", "Entregada"),
    "cancelar": ("Reservada", "Disponible"),
}

CONSULTA_PUBLICACIONES = """
    SELECT p.PublicacionID, p.NegocioID, n.Nombre, n.TipoNegocio, n.Direccion, p.Producto,
           p.Cantidad, p.Kilos, p.PrecioOriginal, p.HorasParaCaducar,
           p.HorarioRecoleccion, p.Modalidad, p.Estrategia, p.Estado,
           r.Solicitante, r.UsuarioID AS ReservaUsuarioID
    FROM Publicaciones p
    JOIN Negocios n ON n.NegocioID = p.NegocioID
    OUTER APPLY (
        SELECT TOP 1 Solicitante, UsuarioID FROM Reservas
        WHERE PublicacionID = p.PublicacionID AND Estado IN ('Activa', 'Entregada')
        ORDER BY ReservaID DESC
    ) r
"""

CONSULTA_USUARIO = """
    SELECT u.UsuarioID, u.Nombre, u.Correo, u.ContrasenaHash, u.Tipo, u.NegocioID,
           n.Nombre AS NombreNegocio, n.TipoNegocio, n.Direccion
    FROM Usuarios u
    LEFT JOIN Negocios n ON n.NegocioID = u.NegocioID
"""


# =====================================
# AYUDAS
# =====================================

def error(mensaje, codigo):
    return jsonify({"error": mensaje}), codigo


def con_bd(funcion):
    """Abre la conexion, se la pasa a la ruta y siempre la cierra.
    Si la base falla, deshace los cambios y responde con un error claro."""
    @wraps(funcion)
    def envoltura(*args, **kwargs):
        conexion = None
        try:
            conexion = conectar()
            return funcion(conexion, *args, **kwargs)
        except pyodbc.Error as e:
            if conexion:
                conexion.rollback()
            print("ERROR DE BASE DE DATOS:", repr(e))
            return error("No se pudo consultar la base de datos", 503)
        finally:
            if conexion:
                conexion.close()
    return envoltura


def publicacion_a_diccionario(fila):
    return {
        "id": fila.PublicacionID,
        "negocioId": fila.NegocioID,
        "negocio": fila.Nombre,
        "tipoNegocio": fila.TipoNegocio,
        "direccion": fila.Direccion,
        "producto": fila.Producto,
        "cantidad": fila.Cantidad,
        "kilos": float(fila.Kilos),
        "precioOriginal": float(fila.PrecioOriginal),
        "horasParaCaducar": fila.HorasParaCaducar,
        "horarioRecoleccion": fila.HorarioRecoleccion,
        "modalidad": fila.Modalidad,
        "estrategia": fila.Estrategia,
        "estado": fila.Estado,
        "solicitante": fila.Solicitante,
        "reservaUsuarioId": fila.ReservaUsuarioID,
    }


def usuario_a_diccionario(fila):
    negocio = None
    if fila.NegocioID:
        negocio = {"nombre": fila.NombreNegocio, "tipoNegocio": fila.TipoNegocio, "direccion": fila.Direccion}
    return {"id": fila.UsuarioID, "nombre": fila.Nombre, "tipo": fila.Tipo, "negocioId": fila.NegocioID, "negocio": negocio}


def usuario_en_sesion(cursor):
    """Regresa el usuario que inicio sesion, o None."""
    usuario_id = session.get("usuario_id")
    if not usuario_id:
        return None
    cursor.execute(CONSULTA_USUARIO + " WHERE u.UsuarioID = ?", usuario_id)
    fila = cursor.fetchone()
    return usuario_a_diccionario(fila) if fila else None


def texto(datos, campo):
    return str(datos.get(campo, "")).strip()


# =====================================
# PAGINA Y ARCHIVOS
# =====================================

@app.route("/")
def inicio():
    # Flask sirve los archivos de static/ (css, js, img) en /static/...
    return render_template("index.html")


# =====================================
# ESTADO DE LA BASE DE DATOS
# =====================================

@app.route("/api/estado-bd")
def estado_bd():
    conexion = None
    try:
        conexion = conectar()
        cursor = conexion.cursor()
        cursor.execute("SELECT DB_NAME()")
        return jsonify({"conectada": True, "baseDatos": cursor.fetchone()[0]})
    except Exception as e:
        # No es un error de la pagina: solo avisa que no hay base y la pagina pasa a modo Demo
        print("ERROR DE CONEXIÓN:", repr(e))
        return jsonify({"conectada": False})
    finally:
        if conexion:
            conexion.close()


# =====================================
# USUARIOS: REGISTRO, INICIO Y CIERRE DE SESION
# =====================================

@app.route("/api/sesion")
@con_bd
def sesion_actual(conexion):
    return jsonify({"usuario": usuario_en_sesion(conexion.cursor())})


@app.route("/api/registro", methods=["POST"])
@con_bd
def registrar_usuario(conexion):
    datos = request.get_json(silent=True)
    if not isinstance(datos, dict):
        return error("No se recibieron datos JSON válidos", 400)

    nombre, correo = texto(datos, "nombre"), texto(datos, "correo").lower()
    contrasena, tipo = str(datos.get("contrasena", "")), texto(datos, "tipo")
    tipo_negocio, direccion = texto(datos, "tipoNegocio"), texto(datos, "direccion")

    if not 2 <= len(nombre) <= 100:
        return error("Escribe un nombre de 2 a 100 letras", 400)
    if len(correo) > 120 or not FORMATO_CORREO.match(correo):
        return error("El correo no es válido", 400)
    if not MINIMO_CONTRASENA <= len(contrasena) <= 200:
        return error(f"La contraseña debe tener al menos {MINIMO_CONTRASENA} caracteres", 400)
    if tipo not in ROLES_REGISTRO:
        return error("Elige si eres negocio o cliente", 400)
    if tipo == "Negocio" and (tipo_negocio not in TIPOS_NEGOCIO or not direccion or len(direccion) > 200):
        return error("Elige el tipo de negocio y escribe su dirección", 400)

    cursor = conexion.cursor()
    cursor.execute("SELECT 1 FROM Usuarios WHERE Correo = ?", correo)
    if cursor.fetchone():
        return error("Ya existe una cuenta con ese correo", 409)

    negocio_id = None
    if tipo == "Negocio":
        cursor.execute("SELECT 1 FROM Negocios WHERE Nombre = ?", nombre)
        if cursor.fetchone():
            return error("Ya existe un negocio con ese nombre", 409)
        cursor.execute("""
            INSERT INTO Negocios (Nombre, TipoNegocio, Direccion)
            OUTPUT INSERTED.NegocioID
            VALUES (?, ?, ?)
        """, nombre, tipo_negocio, direccion)
        negocio_id = cursor.fetchone()[0]

    cursor.execute("""
        INSERT INTO Usuarios (Nombre, Correo, ContrasenaHash, Tipo, NegocioID)
        OUTPUT INSERTED.UsuarioID
        VALUES (?, ?, ?, ?, ?)
    """, nombre, correo, generate_password_hash(contrasena), tipo, negocio_id)
    usuario_id = cursor.fetchone()[0]
    conexion.commit()

    session.clear()
    session["usuario_id"] = usuario_id
    print("USUARIO REGISTRADO. ID:", usuario_id)
    return jsonify({"usuario": usuario_en_sesion(cursor)}), 201


@app.route("/api/login", methods=["POST"])
@con_bd
def iniciar_sesion(conexion):
    datos = request.get_json(silent=True)
    if not isinstance(datos, dict):
        return error("No se recibieron datos JSON válidos", 400)

    cursor = conexion.cursor()
    cursor.execute(CONSULTA_USUARIO + " WHERE u.Correo = ?", texto(datos, "correo").lower())
    fila = cursor.fetchone()

    # Mismo mensaje si falla el correo o la contrasena, para no dar pistas
    if not fila or not check_password_hash(fila.ContrasenaHash, str(datos.get("contrasena", ""))):
        return error("Correo o contraseña incorrectos", 401)

    session.clear()
    session["usuario_id"] = fila.UsuarioID
    return jsonify({"usuario": usuario_a_diccionario(fila)})


@app.route("/api/logout", methods=["POST"])
def cerrar_sesion():
    session.clear()
    return jsonify({"usuario": None})


# =====================================
# CONSULTAR PUBLICACIONES
# =====================================

@app.route("/api/publicaciones", methods=["GET"])
@con_bd
def obtener_publicaciones(conexion):
    cursor = conexion.cursor()
    cursor.execute(CONSULTA_PUBLICACIONES + " ORDER BY p.PublicacionID DESC")
    return jsonify([publicacion_a_diccionario(f) for f in cursor.fetchall()])


# =====================================
# REGISTRAR PUBLICACION (solo negocios)
# =====================================

def validar_publicacion(datos):
    """Regresa (datos limpios, None) o (None, mensaje de error)."""
    if not isinstance(datos, dict):
        return None, "No se recibieron datos JSON válidos"

    limpio = {
        "producto": texto(datos, "producto"),
        "horarioRecoleccion": texto(datos, "horarioRecoleccion"),
        "modalidad": texto(datos, "modalidad"),
        "estrategia": texto(datos, "estrategia") or None,
    }

    if not limpio["producto"] or not limpio["horarioRecoleccion"]:
        return None, "Escribe el producto y el horario de recolección"
    if len(limpio["producto"]) > 120 or len(limpio["horarioRecoleccion"]) > 50:
        return None, "El producto o el horario son demasiado largos"
    if limpio["modalidad"] not in MODALIDADES:
        return None, "Modalidad no válida"
    if limpio["modalidad"] == "Descuento" and limpio["estrategia"] not in ESTRATEGIAS:
        return None, "Elige cómo calcular el descuento"
    if limpio["modalidad"] != "Descuento":
        limpio["estrategia"] = None

    try:
        limpio["cantidad"] = int(datos.get("cantidad"))
        limpio["horasParaCaducar"] = int(datos.get("horasParaCaducar"))
        limpio["kilos"] = Decimal(str(datos.get("kilos")))
        precio = Decimal(str(datos.get("precioOriginal", 0)))
    except (InvalidOperation, TypeError, ValueError):
        return None, "Cantidad, kilos, horas o precio no tienen un formato válido"

    limpio["precioOriginal"] = Decimal(0) if limpio["modalidad"] == "Donación" else precio
    if not (limpio["kilos"].is_finite() and limpio["precioOriginal"].is_finite()):
        return None, "Kilos o precio no tienen un formato válido"
    if limpio["cantidad"] <= 0 or limpio["horasParaCaducar"] <= 0 or limpio["kilos"] <= 0:
        return None, "Cantidad, kilos y horas deben ser mayores a cero"
    if limpio["precioOriginal"] < 0:
        return None, "El precio no puede ser negativo"

    return limpio, None


@app.route("/api/publicaciones", methods=["POST"])
@con_bd
def registrar_publicacion(conexion):
    cursor = conexion.cursor()
    usuario = usuario_en_sesion(cursor)
    if not usuario:
        return error("Inicia sesión para publicar", 401)
    if usuario["tipo"] != "Negocio":
        return error("Solo los negocios pueden publicar alimentos", 403)

    datos, mensaje = validar_publicacion(request.get_json(silent=True))
    if mensaje:
        return error(mensaje, 400)

    # El negocio sale de la sesion, no del formulario: nadie publica a nombre de otro
    cursor.execute("""
        INSERT INTO Publicaciones
            (NegocioID, Producto, Cantidad, Kilos, PrecioOriginal, HorasParaCaducar,
             HorarioRecoleccion, Modalidad, Estrategia)
        OUTPUT INSERTED.PublicacionID
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, usuario["negocioId"], datos["producto"], datos["cantidad"], datos["kilos"],
        datos["precioOriginal"], datos["horasParaCaducar"], datos["horarioRecoleccion"],
        datos["modalidad"], datos["estrategia"])
    nuevo_id = cursor.fetchone()[0]
    conexion.commit()

    cursor.execute(CONSULTA_PUBLICACIONES + " WHERE p.PublicacionID = ?", nuevo_id)
    print("PUBLICACIÓN GUARDADA. ID:", nuevo_id)
    return jsonify(publicacion_a_diccionario(cursor.fetchone())), 201


# =====================================
# RESERVAR, ENTREGAR Y CANCELAR
# =====================================

def revisar_permiso(cursor, usuario, accion, publicacion_id, negocio_id):
    """Regresa None si el usuario puede hacer la accion, o el mensaje de por que no."""
    es_dueno = usuario["negocioId"] is not None and usuario["negocioId"] == negocio_id

    if accion == "reservar":
        return None if usuario["tipo"] == "Cliente" else "Solo los clientes pueden reservar"
    if accion == "entregar":
        return None if es_dueno else "Solo el negocio que publicó puede marcar la entrega"

    # Cancelar: el administrador, el negocio dueno o quien hizo la reserva
    if usuario["tipo"] == "Administrador":
        return None
    cursor.execute(
        "SELECT UsuarioID FROM Reservas WHERE PublicacionID = ? AND Estado = 'Activa'", publicacion_id
    )
    reserva = cursor.fetchone()
    es_quien_reservo = reserva is not None and reserva[0] == usuario["id"]
    return None if es_dueno or es_quien_reservo else "Solo quien reservó, el negocio o el administrador pueden cancelar"


@app.route("/api/publicaciones/<int:publicacion_id>/<accion>", methods=["POST"])
@con_bd
def cambiar_estado(conexion, publicacion_id, accion):
    if accion not in TRANSICIONES:
        return error("Acción no válida", 404)

    cursor = conexion.cursor()
    usuario = usuario_en_sesion(cursor)
    if not usuario:
        return error("Inicia sesión para continuar", 401)

    cursor.execute("SELECT NegocioID FROM Publicaciones WHERE PublicacionID = ?", publicacion_id)
    fila = cursor.fetchone()
    if not fila:
        return error("La publicación no existe", 404)

    sin_permiso = revisar_permiso(cursor, usuario, accion, publicacion_id, fila[0])
    if sin_permiso:
        return error(sin_permiso, 403)

    # Solo cambia si sigue en el estado esperado (evita reservar dos veces)
    estado_actual, estado_nuevo = TRANSICIONES[accion]
    cursor.execute(
        "UPDATE Publicaciones SET Estado = ? WHERE PublicacionID = ? AND Estado = ?",
        estado_nuevo, publicacion_id, estado_actual,
    )
    if cursor.rowcount == 0:
        conexion.rollback()
        return error(f"La publicación no está {estado_actual.lower()}", 409)

    if accion == "reservar":
        cursor.execute(
            "INSERT INTO Reservas (PublicacionID, UsuarioID, Solicitante) VALUES (?, ?, ?)",
            publicacion_id, usuario["id"], usuario["nombre"],
        )
    elif accion == "entregar":
        cursor.execute(
            "UPDATE Reservas SET Estado = 'Entregada' WHERE PublicacionID = ? AND Estado = 'Activa'",
            publicacion_id,
        )
        cursor.execute("""
            INSERT INTO RegistroDesperdicio (PublicacionID, KilosEvitados)
            SELECT PublicacionID, Kilos FROM Publicaciones WHERE PublicacionID = ?
        """, publicacion_id)
    else:
        cursor.execute(
            "UPDATE Reservas SET Estado = 'Cancelada' WHERE PublicacionID = ? AND Estado = 'Activa'",
            publicacion_id,
        )

    conexion.commit()
    cursor.execute(CONSULTA_PUBLICACIONES + " WHERE p.PublicacionID = ?", publicacion_id)
    return jsonify(publicacion_a_diccionario(cursor.fetchone()))


# =====================================
# REGISTRO DE DESPERDICIO EVITADO
# =====================================

@app.route("/api/impacto")
@con_bd
def impacto(conexion):
    cursor = conexion.cursor()
    cursor.execute("SELECT COALESCE(SUM(KilosEvitados), 0), COUNT(*) FROM RegistroDesperdicio")
    kilos, entregas = cursor.fetchone()
    return jsonify({"kilosEvitados": float(kilos), "entregas": entregas})


# =====================================
# ADMINISTRADOR
# =====================================

def solo_admin(cursor):
    """Regresa None si quien inicio sesion es administrador, o la respuesta de error."""
    usuario = usuario_en_sesion(cursor)
    if not usuario:
        return error("Inicia sesión para continuar", 401)
    if usuario["tipo"] != "Administrador":
        return error("Solo el administrador puede ver esto", 403)
    return None


@app.route("/api/admin/resumen")
@con_bd
def admin_resumen(conexion):
    cursor = conexion.cursor()
    negado = solo_admin(cursor)
    if negado:
        return negado

    cursor.execute("SELECT Tipo, COUNT(*) FROM Usuarios GROUP BY Tipo")
    usuarios = {tipo: total for tipo, total in cursor.fetchall()}
    cursor.execute("SELECT Estado, COUNT(*) FROM Publicaciones GROUP BY Estado")
    publicaciones = {estado: total for estado, total in cursor.fetchall()}
    cursor.execute("""
        SELECT n.Nombre, COUNT(DISTINCT p.PublicacionID), COALESCE(SUM(d.KilosEvitados), 0)
        FROM Negocios n
        LEFT JOIN Publicaciones p ON p.NegocioID = n.NegocioID
        LEFT JOIN RegistroDesperdicio d ON d.PublicacionID = p.PublicacionID
        GROUP BY n.Nombre
        ORDER BY 3 DESC, n.Nombre
    """)
    negocios = [{"nombre": n, "publicaciones": p, "kilos": float(k)} for n, p, k in cursor.fetchall()]
    return jsonify({"usuarios": usuarios, "publicaciones": publicaciones, "negocios": negocios})


@app.route("/api/admin/usuarios")
@con_bd
def admin_usuarios(conexion):
    cursor = conexion.cursor()
    negado = solo_admin(cursor)
    if negado:
        return negado

    # Nunca se manda la contrasena, ni cifrada
    cursor.execute("""
        SELECT u.UsuarioID, u.Nombre, u.Correo, u.Tipo, n.Nombre, u.FechaRegistro
        FROM Usuarios u
        LEFT JOIN Negocios n ON n.NegocioID = u.NegocioID
        ORDER BY u.Tipo, u.Nombre
    """)
    return jsonify([
        {"id": f[0], "nombre": f[1], "correo": f[2], "tipo": f[3], "negocio": f[4],
         "fechaRegistro": f[5].strftime("%Y-%m-%d %H:%M")}
        for f in cursor.fetchall()
    ])


@app.route("/api/admin/publicaciones/<int:publicacion_id>", methods=["DELETE"])
@con_bd
def admin_eliminar_publicacion(conexion, publicacion_id):
    cursor = conexion.cursor()
    negado = solo_admin(cursor)
    if negado:
        return negado

    cursor.execute("SELECT Estado FROM Publicaciones WHERE PublicacionID = ?", publicacion_id)
    fila = cursor.fetchone()
    if not fila:
        return error("La publicación no existe", 404)
    # Las entregadas forman parte del registro de desperdicio evitado: no se borran
    if fila[0] == "Entregada":
        return error("No se puede eliminar una publicación entregada: es parte del registro", 409)

    cursor.execute("DELETE FROM Reservas WHERE PublicacionID = ?", publicacion_id)
    cursor.execute("DELETE FROM Publicaciones WHERE PublicacionID = ?", publicacion_id)
    conexion.commit()
    print("PUBLICACIÓN ELIMINADA POR EL ADMINISTRADOR. ID:", publicacion_id)
    return jsonify({"eliminada": publicacion_id})


# =====================================
# INICIAR SERVIDOR
# =====================================

if __name__ == "__main__":
    print("Iniciando Saruino...")
    try:
        prueba = conectar()
        print("CONEXIÓN CON SQL SERVER CORRECTA")
        prueba.close()
    except Exception as e:
        print("SIN CONEXIÓN A SQL SERVER (la página usará datos de ejemplo):", repr(e))

    app.run(host="127.0.0.1", port=5000, debug=True)

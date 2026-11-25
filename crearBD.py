# crearBD.py
# Ejecuta bd/saruino_sqlserver.sql en SQL Server Express sin abrir SSMS.
# Crea la base Saruino con sus tablas, datos y usuarios de ejemplo (borra y vuelve a crear las tablas).
import re
from pathlib import Path

import pyodbc
from werkzeug.security import generate_password_hash

from conexion import DRIVER, SERVIDOR

RUTA_SCRIPT = Path(__file__).parent / "bd" / "saruino_sqlserver.sql"

# Usuarios de ejemplo, solo para pruebas en esta compu (todos usan la misma contrasena)
CONTRASENA_EJEMPLO = "saruino123"
USUARIOS_EJEMPLO = [
    # (nombre, correo, rol, NegocioID)
    ("Administrador Saruino", "admin@saruino.test", "Administrador", None),
    ("Restaurante Sazón Poblano", "restaurante@saruino.test", "Negocio", 2),
    ("Panadería El Trigal", "trigal@saruino.test", "Negocio", 1),
    ("Panadería La Espiga", "espiga@saruino.test", "Negocio", 3),
    ("María López", "cliente@saruino.test", "Cliente", None),
]

try:
    # Se conecta a master porque la base Saruino puede no existir todavia
    conexion = pyodbc.connect(
        f"DRIVER={{{DRIVER}}};SERVER={SERVIDOR};DATABASE=master;"
        "Trusted_Connection=yes;TrustServerCertificate=yes;",
        autocommit=True,
    )
    cursor = conexion.cursor()

    # El script esta separado en bloques con la palabra GO, igual que en SSMS
    script = RUTA_SCRIPT.read_text(encoding="utf-8-sig")
    bloques = re.split(r"^\s*GO\s*$", script, flags=re.MULTILINE | re.IGNORECASE)

    for bloque in bloques:
        if bloque.strip():
            cursor.execute(bloque)
            while cursor.nextset():
                pass

    # Las contrasenas se guardan cifradas, por eso los usuarios se crean aqui y no en el .sql
    for nombre, correo, tipo, negocio_id in USUARIOS_EJEMPLO:
        cursor.execute(
            "INSERT INTO Saruino.dbo.Usuarios (Nombre, Correo, ContrasenaHash, Tipo, NegocioID) VALUES (?, ?, ?, ?, ?)",
            nombre, correo, generate_password_hash(CONTRASENA_EJEMPLO), tipo, negocio_id,
        )

    # La reserva de ejemplo queda a nombre de la clienta
    cursor.execute("""
        UPDATE Saruino.dbo.Reservas
        SET UsuarioID = (SELECT UsuarioID FROM Saruino.dbo.Usuarios WHERE Correo = 'cliente@saruino.test')
    """)

    cursor.execute("SELECT COUNT(*) FROM Saruino.dbo.Publicaciones")
    print("Publicaciones de ejemplo:", cursor.fetchone()[0])
    print("Usuarios de ejemplo (contrasena:", CONTRASENA_EJEMPLO + "):")
    for nombre, correo, tipo, _ in USUARIOS_EJEMPLO:
        print(f"  {tipo}: {correo}")
    conexion.close()

    print("BASE DE DATOS CREADA")

except Exception as e:
    print("ERROR AL CREAR LA BASE:")
    print(e)

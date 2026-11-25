# conexion.py
# Conexion a SQL Server Express (mismo esquema que el ejemplo de la profe)
import os

import pyodbc

# Se pueden cambiar con variables de entorno si la compu usa otro servidor o driver
SERVIDOR = os.environ.get("BD_SERVIDOR", "localhost\\SQLEXPRESS")
DRIVER = os.environ.get("BD_DRIVER", "ODBC Driver 18 for SQL Server")
BASE_DATOS = "Saruino"


def conectar():
    conexion = pyodbc.connect(
        f"DRIVER={{{DRIVER}}};"
        f"SERVER={SERVIDOR};"
        f"DATABASE={BASE_DATOS};"
        "Trusted_Connection=yes;"
        "TrustServerCertificate=yes;"
    )
    return conexion

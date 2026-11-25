# conexion.py
# Conexion a la base de datos del proyecto (SQLite, viene incluido en Python)
import sqlite3
from pathlib import Path

# El archivo aprovecha.db se crea junto a este archivo la primera vez
RUTA_BD = Path(__file__).with_name("aprovecha.db")


def conectar():
    conexion = sqlite3.connect(RUTA_BD)
    return conexion

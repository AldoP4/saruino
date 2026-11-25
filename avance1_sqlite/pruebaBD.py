from conexion import conectar
from pathlib import Path

# Codigo de prueba de la profe, adaptado de SQL Server a SQLite
try:
    conexion = conectar()
    cursor = conexion.cursor()

    # En SQL Server era: SELECT DB_NAME()
    cursor.execute("SELECT file FROM pragma_database_list WHERE name = 'main'")
    print("Base de datos:", Path(cursor.fetchone()[0]).name)

    # En SQL Server era la tabla Productos
    cursor.execute("SELECT COUNT(*) FROM Publicaciones")
    print("Publicaciones registradas:", cursor.fetchone()[0])

    conexion.close()

    print("CONEXIÓN CORRECTA")

except Exception as e:
    print("ERROR DE CONEXIÓN:")
    print(e)

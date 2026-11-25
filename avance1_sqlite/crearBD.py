# crearBD.py
# Crea la tabla y guarda 3 publicaciones de ejemplo (solo hace falta correrlo una vez)
from conexion import conectar, RUTA_BD

conexion = None

try:
    conexion = conectar()
    cursor = conexion.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Publicaciones (
            PublicacionID INTEGER PRIMARY KEY AUTOINCREMENT,
            Negocio TEXT NOT NULL,
            Producto TEXT NOT NULL,
            Modalidad TEXT NOT NULL,
            Kilos REAL NOT NULL,
            Estado TEXT NOT NULL DEFAULT 'Disponible'
        )
    """)

    # Solo inserta los datos de ejemplo la primera vez
    cursor.execute("SELECT COUNT(*) FROM Publicaciones")
    if cursor.fetchone()[0] == 0:
        cursor.executemany("""
            INSERT INTO Publicaciones (Negocio, Producto, Modalidad, Kilos, Estado)
            VALUES (?, ?, ?, ?, ?)
        """, [
            ("Panaderia El Trigal", "Pan dulce surtido", "Descuento", 3, "Disponible"),
            ("Restaurante Sazon Poblano", "Menu del dia", "Donacion", 4, "Reservada"),
            ("Panaderia La Espiga", "Pastel de chocolate", "Venta", 1.8, "Disponible"),
        ])
        conexion.commit()

    print("Base de datos:", RUTA_BD.name)

    cursor.execute("SELECT COUNT(*) FROM Publicaciones")
    print("Publicaciones registradas:", cursor.fetchone()[0])

    cursor.execute("SELECT PublicacionID, Producto, Negocio, Modalidad, Estado FROM Publicaciones")
    for fila in cursor.fetchall():
        print(f"  {fila[0]}. {fila[1]} | {fila[2]} | {fila[3]} | {fila[4]}")

    print("CONEXION CORRECTA")

except Exception as e:
    print("ERROR DE CONEXION:")
    print(e)

finally:
    if conexion:
        conexion.close()

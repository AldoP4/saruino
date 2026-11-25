from conexion import conectar

# Prueba de conexion de la profe (SQL Server Express)
try:
    conexion = conectar()
    cursor = conexion.cursor()

    cursor.execute("SELECT DB_NAME()")
    print("Base de datos:", cursor.fetchone()[0])

    cursor.execute("SELECT COUNT(*) FROM Publicaciones")
    print("Publicaciones registradas:", cursor.fetchone()[0])

    conexion.close()

    print("CONEXIÓN CORRECTA")

except Exception as e:
    print("ERROR DE CONEXIÓN:")
    print(e)

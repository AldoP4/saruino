-- =====================================================
-- Consultas para enseñar la base de datos Saruino en VS Code
-- Cómo correrlas: conéctate a localhost\SQLEXPRESS (extensión SQL Server),
-- selecciona una consulta y presiona Ctrl+Shift+E (o el botón "Run").
-- =====================================================

USE Saruino;

-- 1. Tablas que tiene la base
SELECT TABLE_NAME AS Tabla
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;

-- 2. Negocios registrados
SELECT NegocioID, Nombre, TipoNegocio, Direccion
FROM Negocios;

-- 3. Usuarios (la contraseña se guarda cifrada: solo se muestra el inicio del hash)
SELECT UsuarioID, Nombre, Correo, Tipo, NegocioID,
       LEFT(ContrasenaHash, 25) + '...' AS ContrasenaCifrada
FROM Usuarios;

-- 4. Publicaciones con el nombre de su negocio
SELECT p.PublicacionID, p.Producto, n.Nombre AS Negocio, p.Modalidad, p.Estrategia,
       p.Cantidad, p.Kilos, p.PrecioOriginal, p.HorarioRecoleccion, p.Estado
FROM Publicaciones p
JOIN Negocios n ON n.NegocioID = p.NegocioID
ORDER BY p.PublicacionID;

-- 5. Reservas: qué alimento y quién lo reservó
SELECT r.ReservaID, p.Producto, r.Solicitante, r.Estado, r.FechaReserva
FROM Reservas r
JOIN Publicaciones p ON p.PublicacionID = r.PublicacionID
ORDER BY r.ReservaID;

-- 6. Registro del desperdicio evitado (una fila por entrega)
SELECT d.RegistroID, p.Producto, d.KilosEvitados, d.FechaEntrega
FROM RegistroDesperdicio d
JOIN Publicaciones p ON p.PublicacionID = d.PublicacionID;

-- 7. Total de kilos evitados por negocio
SELECT n.Nombre AS Negocio, COALESCE(SUM(d.KilosEvitados), 0) AS KilosEvitados
FROM Negocios n
LEFT JOIN Publicaciones p ON p.NegocioID = n.NegocioID
LEFT JOIN RegistroDesperdicio d ON d.PublicacionID = p.PublicacionID
GROUP BY n.Nombre
ORDER BY KilosEvitados DESC;

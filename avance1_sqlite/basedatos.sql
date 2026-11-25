-- Base de datos de Aprovecha (para correrla en sqliteonline.com)
-- Copia todo, pegalo en el editor y presiona Run

DROP TABLE IF EXISTS Publicaciones;

CREATE TABLE Publicaciones (
    PublicacionID INTEGER PRIMARY KEY,
    Negocio TEXT NOT NULL,
    Producto TEXT NOT NULL,
    Modalidad TEXT NOT NULL,
    Kilos REAL NOT NULL,
    Estado TEXT NOT NULL DEFAULT 'Disponible'
);

INSERT INTO Publicaciones (Negocio, Producto, Modalidad, Kilos, Estado) VALUES
    ('Panaderia El Trigal', 'Pan dulce surtido', 'Descuento', 3, 'Disponible'),
    ('Restaurante Sazon Poblano', 'Menu del dia', 'Donacion', 4, 'Reservada'),
    ('Panaderia La Espiga', 'Pastel de chocolate', 'Venta', 1.8, 'Disponible');

SELECT * FROM Publicaciones;

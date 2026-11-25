-- =====================================================
-- Base de datos de Saruino para SQL Server Express
-- Abrir en SQL Server Management Studio (SSMS) y ejecutar todo (F5).
-- Se puede ejecutar varias veces: borra y vuelve a crear las tablas.
-- =====================================================

IF DB_ID('Saruino') IS NULL
    CREATE DATABASE Saruino;
GO

USE Saruino;
GO

-- Se borran en orden inverso por las llaves foraneas
IF OBJECT_ID('dbo.RegistroDesperdicio', 'U') IS NOT NULL DROP TABLE dbo.RegistroDesperdicio;
IF OBJECT_ID('dbo.Reservas', 'U') IS NOT NULL DROP TABLE dbo.Reservas;
IF OBJECT_ID('dbo.Publicaciones', 'U') IS NOT NULL DROP TABLE dbo.Publicaciones;
IF OBJECT_ID('dbo.Usuarios', 'U') IS NOT NULL DROP TABLE dbo.Usuarios;
IF OBJECT_ID('dbo.Negocios', 'U') IS NOT NULL DROP TABLE dbo.Negocios;
GO

-- Restaurantes, cafeterias, panaderias y supermercados
CREATE TABLE dbo.Negocios (
    NegocioID   INT IDENTITY(1,1) PRIMARY KEY,
    Nombre      NVARCHAR(100) NOT NULL UNIQUE,
    TipoNegocio NVARCHAR(30)  NOT NULL
        CHECK (TipoNegocio IN (N'Restaurante', N'Cafetería', N'Panadería', N'Supermercado')),
    Direccion   NVARCHAR(200) NOT NULL
);

-- Cuentas para entrar a la plataforma. La contrasena se guarda cifrada (hash), nunca en texto.
-- Hay 3 roles: Administrador (supervisa todo), Negocio (publica) y Cliente (reserva).
-- Un usuario de tipo Negocio esta ligado a su fila en Negocios.
CREATE TABLE dbo.Usuarios (
    UsuarioID      INT IDENTITY(1,1) PRIMARY KEY,
    Nombre         NVARCHAR(100) NOT NULL,
    Correo         NVARCHAR(120) NOT NULL UNIQUE,
    ContrasenaHash NVARCHAR(300) NOT NULL,
    Tipo           NVARCHAR(20)  NOT NULL
        CHECK (Tipo IN (N'Administrador', N'Negocio', N'Cliente')),
    NegocioID      INT NULL REFERENCES dbo.Negocios(NegocioID),
    FechaRegistro  DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

-- Alimentos publicados (venta, descuento o donacion)
CREATE TABLE dbo.Publicaciones (
    PublicacionID      INT IDENTITY(1,1) PRIMARY KEY,
    NegocioID          INT NOT NULL REFERENCES dbo.Negocios(NegocioID),
    Producto           NVARCHAR(120) NOT NULL,
    Cantidad           INT NOT NULL CHECK (Cantidad > 0),
    Kilos              DECIMAL(6,2) NOT NULL CHECK (Kilos > 0),
    PrecioOriginal     DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (PrecioOriginal >= 0),
    HorasParaCaducar   INT NOT NULL CHECK (HorasParaCaducar > 0),
    HorarioRecoleccion NVARCHAR(50) NOT NULL,
    Modalidad          NVARCHAR(20) NOT NULL
        CHECK (Modalidad IN (N'Venta', N'Descuento', N'Donación')),
    Estrategia         NVARCHAR(20) NULL
        CHECK (Estrategia IN (N'caducidad', N'disponibilidad')),
    Estado             NVARCHAR(20) NOT NULL DEFAULT N'Disponible'
        CHECK (Estado IN (N'Disponible', N'Reservada', N'Entregada')),
    FechaPublicacion   DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

-- Quien aparto cada alimento
CREATE TABLE dbo.Reservas (
    ReservaID     INT IDENTITY(1,1) PRIMARY KEY,
    PublicacionID INT NOT NULL REFERENCES dbo.Publicaciones(PublicacionID),
    UsuarioID     INT NULL REFERENCES dbo.Usuarios(UsuarioID),
    Solicitante   NVARCHAR(100) NOT NULL,
    Estado        NVARCHAR(20) NOT NULL DEFAULT N'Activa'
        CHECK (Estado IN (N'Activa', N'Entregada', N'Cancelada')),
    FechaReserva  DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

-- Registro del desperdicio evitado: una fila por cada entrega
CREATE TABLE dbo.RegistroDesperdicio (
    RegistroID    INT IDENTITY(1,1) PRIMARY KEY,
    PublicacionID INT NOT NULL REFERENCES dbo.Publicaciones(PublicacionID),
    KilosEvitados DECIMAL(6,2) NOT NULL,
    FechaEntrega  DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

-- ---------- Datos de ejemplo ----------
INSERT INTO dbo.Negocios (Nombre, TipoNegocio, Direccion) VALUES
    (N'Panadería El Trigal', N'Panadería', N'Av. Reforma 512, Centro'),
    (N'Restaurante Sazón Poblano', N'Restaurante', N'Av. Juárez 1820, La Paz'),
    (N'Panadería La Espiga', N'Panadería', N'Calle 14 Sur 905, El Carmen');

INSERT INTO dbo.Publicaciones
    (NegocioID, Producto, Cantidad, Kilos, PrecioOriginal, HorasParaCaducar, HorarioRecoleccion, Modalidad, Estrategia, Estado)
VALUES
    (1, N'Pan dulce surtido', 24, 3, 180, 5, N'19:00 – 20:30', N'Descuento', N'caducidad', N'Disponible'),
    (2, N'Menú del día (arroz y guisado)', 10, 4, 0, 6, N'21:00 – 21:45', N'Donación', NULL, N'Reservada'),
    (3, N'Pastel de chocolate', 1, 1.8, 350, 20, N'17:00 – 20:00', N'Venta', NULL, N'Disponible');

INSERT INTO dbo.Reservas (PublicacionID, Solicitante) VALUES
    (2, N'María López');
GO

-- Comprobacion
SELECT p.PublicacionID, p.Producto, n.Nombre AS Negocio, p.Modalidad, p.Estado
FROM dbo.Publicaciones p
JOIN dbo.Negocios n ON n.NegocioID = p.NegocioID;

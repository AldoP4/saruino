# Saruino: plataforma contra el desperdicio de alimentos

Proyecto final de Patrones Orientados a Objetos (Ingeniería en Software, Universidad Madero). Conecta restaurantes, cafeterías, panaderías y supermercados con clientes que quieren recibir alimentos que no se vendieron. Tiene tres roles con cuenta: administrador, negocio y cliente.

**Integrantes:** Aldo Pazzi y Pablo Farid Montoro Araujo.

| Documento | Para qué sirve |
|---|---|
| [GUIA_ESTUDIO.md](GUIA_ESTUDIO.md) | Reparto de la exposición, guía de Pablo, resumen de lo estudiado y cómo correrlo en clase |
| [EXPLICACION.md](EXPLICACION.md) | Guía completa para entender y exponer, patrón por patrón |
| [AVANCES.md](AVANCES.md) | Historial del proyecto |
| `docs/Documento_Saruino.docx` | Documento final en Word con 12 diagramas |

## Tecnologías

- **Front:** HTML, CSS y TypeScript (aquí están los 5 patrones)
- **Back:** Python con Flask (`app.py`)
- **Base de datos:** SQL Server Express (la pidió la profe)
- **Diseño (recursos externos):** letras Cinzel y DM Sans (Google Fonts), íconos de Lucide y Three.js para el fondo 3D. Three.js está guardado en `static/vendor/`, así que funciona sin internet

## Cómo correrlo

**Atajo para la exposición:** doble clic en `iniciar.bat`. Deja la base con los datos de ejemplo, prende el servidor y abre la página.

Paso a paso:

1. **Instalar dependencias** (solo la primera vez):
   ```bash
   npm install
   py -m pip install -r requirements.txt
   ```
2. **Crear la base de datos** con tablas, datos y usuarios de ejemplo (la primera vez, o para regresar a los datos de ejemplo):
   ```bash
   py crearBD.py
   ```
3. **Compilar el TypeScript** (cada vez que cambies algo en `src/`). El JavaScript queda en `static/js/`:
   ```bash
   npm run build
   ```
4. **Levantar el servidor:**
   ```bash
   py app.py
   ```
5. Abre http://127.0.0.1:5000

Para probar solo la conexión: `py pruebaBD.py`.

### Usuarios de prueba

Los crea `crearBD.py`. Todos usan la contraseña `saruino123`:

| Correo | Rol | Qué puede hacer |
|---|---|---|
| `admin@saruino.test` | Administrador | Ver el panel de administración, eliminar publicaciones y cancelar cualquier reserva |
| `restaurante@saruino.test` | Negocio (Restaurante Sazón Poblano) | Publicar y entregar lo suyo |
| `trigal@saruino.test` | Negocio (Panadería El Trigal) | Publicar y entregar lo suyo |
| `espiga@saruino.test` | Negocio (Panadería La Espiga) | Publicar y entregar lo suyo |
| `cliente@saruino.test` | Cliente (María López) | Reservar y cancelar sus reservas |

Desde la sección "Mi cuenta" se pueden crear cuentas nuevas de cliente o de negocio. La de administrador solo la crea `crearBD.py`.

Si SQL Server no está disponible, la página igual abre en **modo de ejemplo** (datos de `src/datos.ts`) y lo avisa arriba con una etiqueta dorada; los cambios no se guardan.

Si la compu usa otro servidor o driver, se cambian con las variables de entorno `BD_SERVIDOR` (por defecto `localhost\SQLEXPRESS`) y `BD_DRIVER` (por defecto `ODBC Driver 18 for SQL Server`).

## Patrones y dónde están

Cada patrón se **define** en `src/patrones/` (con un comentario arriba que explica el problema, los papeles de cada clase y dónde se usa) y se **usa** en `src/secciones/`. La guía para exponerlos bloque por bloque está en [EXPLICACION.md](EXPLICACION.md), sección 4.

| Patrón | Dónde se define | Dónde se usa | Qué hace |
|---|---|---|---|
| Factory Method | `src/patrones/factory.ts` | `secciones/publicar.ts`, `almacen.ts` | Crea publicaciones de venta, descuento o donación (también al leerlas de la BD) |
| Strategy | `src/patrones/strategy.ts` | `secciones/publicar.ts`, `secciones/tarjetas.ts` | Calcula el descuento por caducidad o por disponibilidad |
| Observer | `src/patrones/observer.ts` | `secciones/notificaciones.ts` | Avisa cuando hay alimentos nuevos o que vuelven a estar disponibles; el interruptor de la campana suscribe o desuscribe al servicio de mensajes |
| State | `src/patrones/state.ts` | `secciones/reservas.ts` | Controla el flujo Disponible → Reservada → Entregada |
| Adapter | `src/patrones/adapter.ts` | `secciones/tarjetas.ts`, `secciones/notificaciones.ts` | Integra un servicio externo de mensajes (simulado) y Google Maps |

## Estructura

Sigue la estructura de Flask que pidió la profe:

```
app.py                     servidor Flask: rutas de la página y de la API
templates/index.html       front (la página)
static/css/estilos.css     estilos
static/js/                 JavaScript que usa la página (lo genera npm run build)
static/img/                logo de Saruino y logo de la UMAD
static/vendor/             Three.js (librería externa para el fondo 3D)
src/                       código TypeScript original
  main.ts                  arranque: carga datos, pinta las secciones y conecta los clics
  almacen.ts               datos en memoria y carga desde SQL Server (o datos de ejemplo)
  roles.ts                 qué puede hacer y ver cada rol
  cuenta.ts, api.ts        sesión y llamadas al servidor
  patrones/                un archivo por patrón (donde se definen)
  secciones/               cada parte de la página (donde se usan los patrones)
  modelos/publicacion.ts   la clase Publicacion y sus tres modalidades
  decoracion/              animaciones y fondo 3D (no son parte de los patrones)
conexion.py                conexión a SQL Server Express
crearBD.py                 crea la base con datos y usuarios de ejemplo
pruebaBD.py                prueba de conexión (código de la profe)
bd/saruino_sqlserver.sql   tablas y datos de ejemplo
avance1_sqlite/            versión anterior con SQLite (solo como historial)
iniciar.bat                arranque con doble clic para la exposición
CLAUDE.md                  instrucciones para estudiar el proyecto con Claude
```

## API

| Método | Ruta | Quién puede | Qué hace |
|---|---|---|---|
| GET | `/api/estado-bd` | Todos | Revisa la conexión a SQL Server |
| POST | `/api/registro` | Todos | Crea una cuenta y entra |
| POST | `/api/login` | Todos | Inicia sesión |
| POST | `/api/logout` | Todos | Cierra sesión |
| GET | `/api/sesion` | Todos | Dice quién inició sesión |
| GET | `/api/publicaciones` | Todos | Lista las publicaciones |
| POST | `/api/publicaciones` | Negocios | Guarda una publicación nueva a nombre del negocio |
| POST | `/api/publicaciones/<id>/reservar` | Clientes | Reserva a nombre de quien inició sesión |
| POST | `/api/publicaciones/<id>/entregar` | Negocio dueño | Marca como entregada y la suma al registro |
| POST | `/api/publicaciones/<id>/cancelar` | Negocio dueño, quien reservó o administrador | Cancela la reserva |
| GET | `/api/impacto` | Todos | Total de kilos de desperdicio evitado |
| GET | `/api/admin/resumen` | Administrador | Usuarios por rol, publicaciones por estado y kilos por negocio |
| GET | `/api/admin/usuarios` | Administrador | Lista de usuarios (sin contraseñas) |
| DELETE | `/api/admin/publicaciones/<id>` | Administrador | Elimina una publicación que no se ha entregado |

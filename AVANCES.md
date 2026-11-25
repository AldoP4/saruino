# Avances del proyecto

## Avance 1 (~30 %): front y patrones

- Página con inicio, alimentos disponibles, formulario para publicar y sección de reservas.
- Los 5 patrones en TypeScript: Factory Method, Strategy, Observer, State y Adapter.
- Datos de ejemplo en el navegador (3 alimentos), sin guardar nada.
- Prueba de conexión temporal con **SQLite** (`avance1_sqlite/`), porque esta compu no tenía SQL Server.

## Decisión: SQL Server Express

La profe indicó que la base de datos será **SQL Server Express**. La versión con SQLite queda solo como historial en `avance1_sqlite/`.

## Avance 2 (~63 %): base de datos y back

- **Base de datos** (`bd/saruino_sqlserver.sql`): tablas `Negocios`, `Publicaciones`, `Reservas` y `RegistroDesperdicio`, con datos de ejemplo.
- **Conexión** (`conexion.py`) y **prueba de la profe** (`pruebaBD.py`) apuntando a SQL Server Express.
- **API en Flask** (`app.py`): consultar y guardar publicaciones, reservar, entregar, cancelar y consultar el desperdicio evitado.
- **La página ya usa la API:** lo que se publica, reserva o entrega se guarda en SQL Server.
- **Registro de desperdicio evitado:** cada entrega se guarda en `RegistroDesperdicio` y suma al contador de kilos.
- **Reservas con nombre** de quién reserva (persona u organización).
- Aviso arriba de la página que dice si hay conexión con SQL Server.
- Si no hay SQL Server, la página sigue funcionando con datos de ejemplo.
- **Probado el 14 de noviembre de 2026** con SQL Server 2022 Express (instancia `SQLEXPRESS`) y ODBC Driver 18: `pruebaBD.py` da CONEXIÓN CORRECTA, y publicar, reservar, entregar y cancelar se guardan en la base.
- `crearBD.py` crea la base desde la terminal, sin abrir Management Studio.

### Nota de instalación

En un Windows en español (es-MX), el instalador de SQL Server Express en español rechazó el idioma del sistema. Se instaló la versión en inglés, que funciona en cualquier idioma.

## Avance 3 (~80 %): cuentas de usuario y permisos

- **Tabla `Usuarios`** con dos tipos: Negocio (publica) y Organización (reserva). La contraseña se guarda cifrada (hash), nunca en texto.
- **Crear cuenta, entrar y salir** desde la sección "Mi cuenta" de la página.
- **Permisos** (los revisa el servidor, no solo la página):
  - Solo los negocios publican, y siempre a su propio nombre.
  - Solo las organizaciones reservan.
  - Solo el negocio que publicó marca la entrega.
  - Cancelan el negocio dueño o quien hizo la reserva.
- **Panel por tipo de usuario:** el negocio ve sus publicaciones y los kilos que ha rescatado; la organización ve sus reservas y los kilos recibidos.
- **Usuarios de prueba** que crea `crearBD.py` (contraseña `saruino123`): `trigal@`, `sazon@` y `espiga@saruino.test` (negocios) y `banco@saruino.test` (organización).
- **Probado el 18 de noviembre de 2026:** cada permiso con usuarios de los dos tipos, y en la página el flujo completo (entrar, publicar, reservar, entregar y salir).

### Estructura de Flask (18 de noviembre de 2026)

La profe pidió esta organización: `app.py`, `templates/` (front), `static/` (estilos e imágenes) y SQL Server. Se movió la página a `templates/index.html`, los estilos a `static/css/`, el JavaScript compilado a `static/js/` y se agregó el logo en `static/img/`. Flask ahora usa `render_template` y `url_for('static', ...)`.

### Observer completo (18 de noviembre de 2026)

Antes el aviso de "alimento nuevo" solo le salía a quien publicaba. Ahora la página revisa cada 10 segundos si hay publicaciones nuevas de otros negocios y las avisa con el Observer (campana y servicio externo simulado). Probado con dos sesiones a la vez: la panadería publica y al banco de alimentos le llega el aviso.

### Nombre Saruino y diseño final (18 de noviembre de 2026)

- El proyecto se llama **Saruino**. Se cambió el nombre en la página, el código, los documentos y la base de datos (ahora la base es `Saruino`; la de pruebas `Aprovecha` se borró).
- Usuarios de prueba: `@saruino.test` con contraseña `saruino123`.
- **Diseño** con los colores del logo (negro, dorado y rojo), el fondo de nubes, el logo de Saruino y el logo de la UMAD en el pie de página. Imágenes en `static/img/`.
- **Documento en Word** (`docs/Documento_Saruino.docx`) con portada del mismo diseño, 17 secciones y 12 diagramas (`docs/diagramas/`).
- **Base de datos en VS Code:** extensión SQL Server (mssql) instalada y consultas listas en `bd/consultas.sql`.

### Tres roles: administrador, negocio y cliente (18 de noviembre de 2026)

- Los roles ahora son **Administrador**, **Negocio** y **Cliente** (antes eran Negocio y Organización).
- **Cada rol ve opciones distintas** en la página: el visitante solo ve los alimentos; el cliente reserva y ve "Mis reservas"; el negocio publica y ve las reservas de sus alimentos; el administrador tiene un **Panel de administración** con usuarios, publicaciones, kilos por negocio y el botón para eliminar publicaciones.
- Nuevas rutas de administrador en `app.py` (`/api/admin/...`), protegidas en el servidor.
- Usuarios de prueba: `admin@`, `restaurante@`, `trigal@`, `espiga@` y `cliente@saruino.test` (contraseña `saruino123`).
- Probado con los tres roles: cada uno solo puede hacer lo suyo, y nadie puede registrarse como administrador desde la página.

## Pulido final (24 de noviembre de 2026)

- **Limpieza de código:**
  - `main.ts` tenía casi 600 líneas mezclando todo. Se dividió por bloques: `main.ts` solo arranca y conecta; cada patrón se usa en su archivo de `src/secciones/` (`publicar.ts`, `notificaciones.ts`, `reservas.ts`, `tarjetas.ts`, `panel.ts`, `admin.ts`), con `almacen.ts` (datos) y `roles.ts` (permisos).
  - Los diccionarios de creadores y estrategias pasaron a sus patrones (`creadorPara` en `factory.ts`, `estrategiaPorClave` en `strategy.ts`).
  - `desuscribir` no se usaba: ahora lo usa el interruptor "Enviar también por mensaje" de la campana, para enseñar el Observer en vivo. `restaurarEstado` sí se usa (al leer de SQL Server).
  - En `app.py`, `solo_admin` regresaba un usuario que nadie usaba; ahora solo regresa el error o nada. `/api/estado-bd` ya no responde con error 503 cuando no hay base (la consola queda limpia en modo de ejemplo).
  - Se quitó `static/img/fondo.webp` (el fondo de nubes ya no se usa).
- **Código explicable:** cada archivo de `src/patrones/` empieza con un comentario con el problema del negocio, el patrón, el papel de cada clase y dónde se usa en la página.
- **Guion por bloques** en `EXPLICACION.md` (sección 4): para cada patrón, el problema contado a la dueña del negocio, el código a enseñar, qué mostrar en la página y la explicación técnica con preguntas probables.
- **Rediseño (primera versión, clara):** fondo crema, tarjetas blancas con esquinas suaves, dorado y rojo como acentos. Después se cambió a la versión oscura (ver abajo).
- **Probado el 24 de noviembre de 2026** en el navegador con los 4 roles (visitante, cliente que reserva y cancela, negocio que publica y entrega, administrador que elimina) y en modo de ejemplo sin SQL Server, sin errores en consola.

## Diseño final, equipo y GitHub (24 de noviembre de 2026)

- **Diseño oscuro con el logo** (la profesora autorizó usar recursos externos para el diseño):
  - Fondo negro cálido con brillos dorado y rojo como las nubes del logo, tarjetas oscuras y botón principal dorado.
  - Letra **Cinzel** en títulos (romana, como la del "SARUINO" del logo) y DM Sans en el texto.
  - Íconos de **Lucide** en las tarjetas.
  - **Three.js** para brasas doradas en 3D detrás de la página. Si la compu no lo mueve con fluidez, el fondo se apaga solo.
  - **Animaciones:** las secciones aparecen al bajar y hay un brillo que sigue al ratón en las tarjetas.
  - Todo lo visual que no es patrón está en `src/decoracion/`.
- `app.py` le pide al navegador revisar siempre si cambió el CSS o el JS, para no mostrar versiones viejas.
- **Equipo:** Aldo Pazzi y Pablo Farid Montoro Araujo. Reparto de la exposición y guía de estudio de Pablo en `GUIA_ESTUDIO.md`.
- `iniciar.bat`: arranque con doble clic para la exposición.
- `CLAUDE.md`: instrucciones para estudiar el proyecto con Claude.
- Presentación de apoyo de 6 diapositivas, que dicen quién presenta cada parte.

## Pendiente para el 100 %

- ~~Documento final con diagramas~~: hecho en `docs/Documento_Saruino.docx`, con los nombres de los integrantes. Falta escribir en la portada el nombre de la profesora.
- Opcionales si da tiempo:
  - Conectar el Adapter de notificaciones a un servicio real (correo o WhatsApp).
  - Mapa dentro de la página con los puntos de recolección.
  - Reporte del desperdicio evitado por negocio y por fecha.

# Guía de estudio de Saruino

Para **Aldo Pazzi** y **Pablo Farid Montoro Araujo**.

Esta guía tiene cuatro partes:

1. Cómo nos repartimos la exposición.
2. Lo que Pablo tiene que saber, con las preguntas que le puede hacer la profe.
3. Lo que ya vimos en las clases con Claude (resumen).
4. Cómo correr el proyecto en clase sin ayuda.

La guía completa de la exposición, patrón por patrón, está en [EXPLICACION.md](EXPLICACION.md) (sección 4).

---

## 1. Reparto de la exposición

La profe va a hacer dos papeles: **dueña del negocio** (quiere saber qué problema le resolvemos) y **evaluadora** (quiere ver que cada uno entiende lo que explica). Por eso los dos enseñamos página **y** código.

| Parte | Presenta | Qué enseña |
|---|---|---|
| Portada y el problema | **Pablo** | Quiénes somos, el problema y la solución, los 4 roles |
| Cómo funciona por dentro | **Pablo** | Página, Flask y SQL Server; la estructura de carpetas |
| Mapa de los 5 patrones | **Aldo** | Dónde se definen (`src/patrones/`) y dónde se usan (`src/secciones/`) |
| Factory Method | **Aldo** | Publicar como restaurante, `factory.ts` |
| Strategy | **Pablo** | Cambiar la regla de descuento, `strategy.ts` |
| Observer | **Aldo** | La campana y el interruptor de mensajes, `observer.ts` |
| State | **Aldo** | Reservar y entregar, `state.ts` |
| Adapter | **Pablo** | "Ver en mapa", `adapter.ts` |
| Base de datos | **Pablo** | Las tablas en VS Code y una consulta después de reservar |
| Cierre y preguntas | **Pablo** abre | Cada quien contesta las preguntas de sus partes |

**Por qué así:** Aldo explica los patrones más complejos (Factory Method, Observer y State). Pablo explica dos patrones completos (Strategy y Adapter), la arquitectura y la base de datos. Así la profe ve que los dos entienden el código, no solo uno.

La presentación de apoyo (6 diapositivas) ya trae en cada una quién presenta y, en las notas, qué decir.

---

## 2. Guía para Pablo

### 2.0 Primero: bajar el proyecto a tu compu

1. Instala **Git** (https://git-scm.com) y **VS Code** si no los tienes.
2. Acepta la invitación al repositorio que te llega por correo de GitHub (el repositorio es privado).
3. En una terminal (PowerShell), en la carpeta donde lo quieras guardar:
   ```powershell
   git clone https://github.com/AldoP4/saruino.git
   ```
4. Abre la carpeta `saruino` en VS Code (`Archivo > Abrir carpeta`).
5. Lee en este orden:
   1. Esta guía (tus partes están en la sección 2.2).
   2. `EXPLICACION.md`, sección 4: el guion de cada patrón.
   3. Los archivos `src/patrones/strategy.ts` y `src/patrones/adapter.ts`: cada uno empieza con un comentario que explica el problema y el papel de cada clase.
6. Para correr la página en tu compu, sigue la sección 4 de esta guía ("En otra compu").
7. Si Aldo sube cambios, actualízate con:
   ```powershell
   git pull
   ```

### 2.1 Lo mínimo para entender el proyecto

**Qué hace:** los negocios (restaurantes, panaderías) publican la comida que no vendieron y los clientes la reservan y la recogen. Cada entrega se guarda como kilos de desperdicio evitado.

**Los 4 roles:**

| Rol | Qué puede hacer |
|---|---|
| Visitante | Solo ve los alimentos |
| Cliente | Reserva y cancela sus reservas |
| Negocio | Publica y marca la entrega |
| Administrador | Ve todo y puede eliminar publicaciones |

**Las 3 partes, como un restaurante:**

| Parte | En el restaurante | En Saruino |
|---|---|---|
| Navegador (la página) | El cliente en la mesa | `templates/index.html`, `static/`, `src/` |
| Servidor Flask | El mesero: recibe pedidos y los lleva | `app.py` |
| SQL Server | El refrigerador: ahí se guarda todo | La base `Saruino`, 5 tablas |

- **Servidor** = un programa que se queda esperando pedidos. Al correr `py app.py`, la compu se vuelve el servidor. `127.0.0.1:5000` significa "esta misma compu, puerta 5000". No es la nube.
- **La página habla con Flask en JSON** (texto con datos) y **Flask habla con SQL Server con `pyodbc`**.
- **TypeScript y JavaScript:** el código se escribe en `src/` (TypeScript) y `npm run build` lo traduce a JavaScript en `static/js/`, que es lo que entiende el navegador.

### 2.2 Tus partes y qué decir

#### Problema y solución
> "Los negocios tiran comida buena que no vendieron, y del otro lado hay gente que la aprovecharía. Saruino los conecta: el negocio publica, el cliente reserva y recoge, y cada entrega se registra como kilos de desperdicio evitado."

#### Cómo funciona por dentro
Abre la carpeta en VS Code y señala:
- `app.py`: el servidor Flask (rutas `/api/...`, sesiones y permisos).
- `templates/index.html`: la página.
- `static/`: estilos, JavaScript compilado e imágenes.
- `src/`: el código TypeScript, con `patrones/` (donde se definen los patrones) y `secciones/` (donde se usan).
- `bd/`: el script de la base y las consultas.

> "Seguimos la estructura de Flask que pidió la profesora. La página no guarda nada sola: le manda los datos a Flask, Flask revisa permisos y los guarda en SQL Server."

#### Strategy (calcular el descuento)
- **Problema (a la dueña):** "A veces conviene bajar el precio porque el pan está por caducar, y otras porque sobró mucho. Usted elige la regla, y mañana podemos agregar otra sin rehacer la publicación."
- **Código:** `src/patrones/strategy.ts`

| Papel | Clase | Qué hace |
|---|---|---|
| Estrategia (el contrato) | `EstrategiaDescuento` | Toda regla debe tener `calcularPorcentaje(cantidad, horas)` |
| Estrategias concretas | `DescuentoPorCaducidad`, `DescuentoPorDisponibilidad` | Cada una calcula a su manera |
| Contexto | `PublicacionDescuento` (en `modelos/publicacion.ts`) | Guarda una estrategia y solo le pide el porcentaje |

- **Las reglas:** por caducidad, 50 % con 3 horas o menos, 30 % hasta 8 horas, 15 % si falta más. Por disponibilidad, 40 % con 20 piezas o más, 25 % con 10 o más, 10 % con menos.
- **Ejemplo:** producto de $200, 12 piezas, caduca en 2 horas. Por caducidad son 50 % → $100. Por disponibilidad son 25 % → $150.
- **En la página:** entra como `restaurante@saruino.test`, ve a Publicar, modalidad Descuento, pon 2 horas y cambia "Calcular descuento". La caja roja cambia el porcentaje al momento.
- **Para explicarlo:** "La publicación no sabe cómo se calcula el descuento: se lo pregunta a su estrategia. Las reglas son intercambiables porque cumplen el mismo contrato."

#### Adapter (servicios externos)
- **Problema (a la dueña):** "Queremos usar Google Maps y un servicio de mensajes, pero son de otras empresas y tienen sus propios métodos. Si un día cambiamos de proveedor, no queremos rehacer la página."
- **Código:** `src/patrones/adapter.ts`

| Papel | Mapas | Mensajes |
|---|---|---|
| Target (lo que espera nuestro sistema) | `ServicioMapa` (`obtenerEnlace`) | `Observador` (`actualizar`) |
| Adaptee (el servicio externo) | `GoogleMapsExterno` (`construirUrlBusqueda`) | `ApiMensajeriaExterna` (`enviarMensaje`) |
| Adapter | `MapaAdapter` | `NotificadorMensajesAdapter` |

- **En la página:** clic en "Ver en mapa" en una tarjeta: abre Google Maps con la dirección del negocio. En la campana, el contador de mensajes enviados muestra que el servicio externo recibe los avisos.
- **Para explicarlo:** "Es como un adaptador de enchufe: la página pide `obtenerEnlace(direccion)` y el adaptador lo traduce a `construirUrlBusqueda(...)`, que es lo que entiende Google."
- **Ojo:** el servicio de mensajes está **simulado** (solo cuenta los mensajes). El de mapas sí abre Google Maps.

#### Base de datos
- **Las 5 tablas:**

| Tabla | Qué guarda |
|---|---|
| `Negocios` | Nombre, tipo y dirección |
| `Usuarios` | Nombre, correo, contraseña cifrada y rol |
| `Publicaciones` | Producto, cantidad, kilos, precio, modalidad, estrategia, horario y estado |
| `Reservas` | Quién reservó, cuándo, y si está activa, entregada o cancelada |
| `RegistroDesperdicio` | Una fila por cada entrega, con los kilos evitados |

- **Relaciones:** un negocio tiene muchas publicaciones; una publicación puede tener varias reservas a lo largo del tiempo; cada entrega crea una fila en el registro.
- **En VS Code:** extensión SQL Server, conexión `localhost\SQLEXPRESS`, base `Saruino` (pasos completos en `EXPLICACION.md`, sección 11.1). Abre `bd/consultas.sql`, selecciona una consulta y córrela.
- **Para lucirte:** reserva algo en la página y vuelve a correr la consulta de reservas: aparece la fila nueva.
- **Para explicarlo:** "La página no guarda nada sola: Flask guarda en SQL Server con `pyodbc`, y aquí vemos que de verdad quedó en la tabla."

### 2.3 Preguntas que te puede hacer la profe

**Generales**
- *¿Qué hiciste tú en el proyecto?* La explicación del problema, la arquitectura, la base de datos y los patrones Strategy y Adapter. (Dilo con tus palabras).
- *¿Por qué hay `src/` y `static/js/`?* El navegador solo entiende JavaScript. Escribimos en TypeScript (`src/`) y lo compilamos a JavaScript (`static/js/`).
- *¿Qué es Flask?* Una librería de Python para hacer servidores web. En `app.py` están las rutas que usa la página.

**Base de datos**
- *¿Por qué SQL Server?* Lo pidió la profesora, y es un gestor robusto que se usa mucho en empresas.
- *¿Cómo se guardan las contraseñas?* Cifradas con un hash (Werkzeug). Ni quien vea la base puede leerlas.
- *¿Cómo evitan que dos clientes reserven lo mismo?* El `UPDATE` solo cambia la publicación si todavía está "Disponible". Si otro ya la reservó, no cambia nada y el servidor responde que ya no está disponible.
- *¿Qué pasa si SQL Server no está prendido?* La página abre en modo de ejemplo con datos de prueba; los cambios no se guardan.

**Strategy**
- *¿Cuál es el contexto?* `PublicacionDescuento`, que recibe la estrategia y le pide el porcentaje.
- *¿Quién elige la estrategia?* El negocio, en el formulario. Se guarda en la columna `Estrategia` y `estrategiaPorClave` la convierte en objeto.
- *¿Diferencia entre Strategy y State?* En Strategy alguien de afuera elige la regla y no cambia sola. En State el objeto cambia de estado por sí mismo según lo que pasa.
- *¿Cómo agrego otra regla, por ejemplo "por temporada"?* Una clase nueva que implemente `EstrategiaDescuento`. La publicación no se toca. También se agrega la opción al formulario, a `app.py` y a la base, porque ahí está la lista de reglas permitidas.

**Adapter**
- *¿Diferencia entre Adapter y Facade?* Adapter hace compatible **una** interfaz con otra que el sistema ya espera. Facade da una interfaz simple a **un grupo** de clases complejas.
- *¿Por qué el adaptador de mensajes implementa `Observador`?* Para que el centro de notificaciones lo trate como a cualquier otro observador. Ahí se combinan Adapter y Observer.

**Si te preguntan por los patrones de Aldo (respuesta corta)**
- **Factory Method:** cada modalidad (venta, descuento, donación) tiene su creador; la página pide "dame el creador de esta modalidad" y no usa un `if` por cada una.
- **Observer:** el centro de notificaciones avisa a todos sus suscritos (la campana y el servicio de mensajes) sin conocer cómo es cada uno.
- **State:** cada alimento está en un estado (Disponible, Reservada, Entregada) y el estado decide qué se puede hacer.

### 2.4 Cómo estudiar con Claude

1. Clona el repositorio de GitHub y abre la carpeta en Claude Code.
2. El archivo `CLAUDE.md` le dice a Claude que es un tutor de este proyecto y que explique en español sencillo.
3. Pídele cosas como:
   - "Explícame `strategy.ts` como si nunca hubiera programado."
   - "Hazme un examen de 5 preguntas de mi parte de la exposición."
   - "Haz de la profesora y pregúntame sobre Adapter; corrígeme."
   - "¿Qué pasa por dentro cuando un cliente reserva?"

---

## 3. Lo que ya vimos en las clases con Claude (resumen)

**Clase 1. `main.ts`, el director de orquesta.** No tiene lógica de patrones: arranca la página, la pinta y conecta los clics. Hay dos tipos de funciones:
- Las que **conectan** (`iniciar`, `alDarClic`, `conectar...`): "cuando pase X, haz Y".
- Las que **pintan** (`render...`): convierten los datos en HTML.

El ciclo siempre es **clic → cambia el dato → `renderTodo()` → se ve el cambio**.

**Clase 2. Flask y la página son cosas distintas.** En la forma clásica, Flask arma cada página completa. En Saruino, Flask entrega la página una sola vez y después solo manda datos (JSON); el navegador acomoda lo que cambió sin recargar. Un evento tiene tres partes: tener la función, conectarla al evento y que el evento ocurra.

**Clase 3. `almacen.ts`, la bodega de la página.**
- `app` es la libreta donde se anota todo: publicaciones, filtro, kilos, si hay base.
- `crearDesdeFila` convierte cada fila de SQL Server en un objeto con **tres patrones**: Strategy (elige la regla), Factory Method (crea la publicación) y State (la pone en su estado).
- `cargarDatos` trae todo de SQL Server; si no hay base, usa el modo de ejemplo.

**Clase 4. Strategy a fondo y cómo llega el Observer.**
- Strategy: contrato, reglas y contexto; mismo producto, distinta regla, distinto precio.
- El Observer llega de tres formas: la campana, el aviso flotante y el contador de mensajes externos. Se dispara al publicar, al cancelar y cada 10 segundos (polling).
- Los patrones son solo 5. Lo demás es código normal: `app` y `con_bd` se parecen a patrones, pero no se presentan como tales.

**Clase 5. Memoria y servidor.**
- Memoria de la página (se borra al recargar), sesión del servidor (se borra al reiniciar `py app.py`) y base de datos (permanente, en el disco duro).
- El servidor es local, no es la nube: vive en la RAM mientras la terminal está abierta. Los datos no: SQL Server los guarda en disco.

**Lo que sigue:** `src/modelos/publicacion.ts`, la clase `Publicacion` y sus tres hijas, donde se ve State y Strategy por dentro.

---

## 4. Cómo correr el proyecto en clase sin ayuda

### En la compu de Aldo (todo ya instalado)

**Opción fácil:** doble clic en **`iniciar.bat`** (en la carpeta del proyecto). Deja la base con los datos de ejemplo, prende el servidor y abre la página en el navegador.

**Opción a mano**, en la terminal de VS Code (`` Ctrl+` ``), dentro de la carpeta del proyecto:

```powershell
py crearBD.py
```
```powershell
py app.py
```

Luego abre http://127.0.0.1:5000 y presiona `Ctrl+F5`.

**Revisa que funcione:**
1. Arriba debe decir "Conectado a SQL Server" con un punto verde.
2. Entra con `restaurante@saruino.test` y contraseña `saruino123`.

**Para la demo del Observer:** abre una ventana de incógnito (`Ctrl+Shift+N`) y entra como `cliente@saruino.test`. Cuando el restaurante publique, al cliente le llega el aviso en menos de 10 segundos.

**Para apagar:** en la terminal donde corre el servidor, presiona `Ctrl+C`.

**Si algo falla:**

| Problema | Qué hacer |
|---|---|
| Arriba dice "Sin conexión a SQL Server" | Corre `py pruebaBD.py` para ver el error. Si el servicio está apagado, búscalo en Windows como "Servicios" y arranca "SQL Server (SQLEXPRESS)". La página igual funciona en modo de ejemplo |
| Dice que el puerto está ocupado | Ya hay otro servidor prendido: cierra la otra terminal |
| No puedo entrar con un usuario | Corre `py crearBD.py` |
| La página se ve rara o vieja | `Ctrl+F5` |
| `py` no se reconoce | Python no está instalado o no está en el PATH |

### En otra compu (por ejemplo la de Pablo, desde GitHub)

1. Instala **Python 3** y, en la carpeta del proyecto:
   ```powershell
   py -m pip install -r requirements.txt
   ```
2. **Con SQL Server Express y el ODBC Driver 18 instalados:** `py crearBD.py` y luego `py app.py`.
3. **Sin SQL Server:** solo `py app.py`. La página abre en modo de ejemplo y se pueden ver los 5 patrones (las cuentas no funcionan sin base).
4. **Node.js solo hace falta si cambias algo en `src/`:** `npm install` una vez y `npm run build` cada vez.

# Saruino: tu parte de la exposición, Chano

Este archivo trae todo lo que necesitas para la exposición:

- Dónde está el proyecto.
- En qué orden vamos.
- Qué te toca decir y enseñar.
- De qué hablo yo (Aldo), para que sepas cuándo entras.
- Qué te puede preguntar la profe.

**Repositorio:** https://github.com/AldoP4/saruino

---

## 1. Baja el proyecto

1. Instala **Git** (https://git-scm.com) y **VS Code** si no los tienes.
2. Abre PowerShell en la carpeta donde lo quieras guardar y corre:
   ```powershell
   git clone https://github.com/AldoP4/saruino.git
   ```
3. Abre la carpeta `saruino` en VS Code (`Archivo > Abrir carpeta`).
4. Si después subo cambios, actualízate con:
   ```powershell
   git pull
   ```

**Para verlo funcionando en tu compu:** instala Python 3 y corre `py -m pip install -r requirements.txt`, luego `py app.py`, y abre http://127.0.0.1:5000. Sin SQL Server la página abre en **modo de ejemplo**, que alcanza para ver todo. El día de la exposición lo corremos en mi compu, que ya tiene la base de datos.

---

## 2. El proyecto en 1 minuto

**Qué es:** una página donde los negocios (restaurantes, panaderías) publican la comida que no vendieron y los clientes la reservan y la recogen. Cada entrega se guarda como kilos de desperdicio evitado.

**Los 4 roles:**
- **Visitante:** solo ve.
- **Cliente:** reserva.
- **Negocio:** publica y entrega.
- **Administrador:** ve todo y puede borrar publicaciones.

**Las 3 partes, como un restaurante:**

| Parte | En el restaurante | En Saruino |
|---|---|---|
| La página (navegador) | El cliente en la mesa | `templates/`, `static/`, `src/` |
| El servidor Flask | El mesero: recibe pedidos y los lleva | `app.py` |
| SQL Server | El refrigerador: ahí se guarda todo | La base `Saruino` (5 tablas) |

- **Servidor** = un programa que se queda esperando pedidos. Al correr `py app.py`, la compu se vuelve el servidor. `127.0.0.1:5000` es "esta misma compu, puerta 5000"; no es la nube.
- La página habla con Flask en **JSON** (texto con datos). Flask habla con SQL Server con **pyodbc**.
- El código se escribe en **TypeScript** (`src/`) y se traduce a **JavaScript** (`static/js/`), porque el navegador solo entiende JavaScript.

---

## 3. El orden de la exposición

| # | Parte | Quién |
|---|---|---|
| 1 | Portada y el problema | **Tú** |
| 2 | Cómo funciona por dentro | **Tú** |
| 3 | Mapa de los 5 patrones | Aldo |
| 4 | Factory Method | Aldo |
| 5 | Strategy | **Tú** |
| 6 | Observer | Aldo |
| 7 | State | Aldo |
| 8 | Adapter | **Tú** |
| 9 | Base de datos en VS Code | **Tú** |
| 10 | Cierre y preguntas | **Tú** abres; cada quien contesta lo suyo |

En cada patrón vamos en el mismo orden: **el problema** (se lo contamos a la profe como si fuera la dueña del negocio) → **lo enseñamos en la página** → **abrimos el código** → **explicamos por qué ese patrón**.

---

## 4. Lo que hablo yo (para que sepas cuándo entras)

- **Mapa de patrones:** enseño que cada patrón se **define** en `src/patrones/` y se **usa** en `src/secciones/`.
- **Factory Method:** entro como restaurante y publico. Explico que cada modalidad (venta, descuento o donación) tiene su "creador", y que la página no usa un `if` por cada una. **En cuanto termino, entras tú con Strategy en el mismo formulario.**
- **Observer:** suena la campana con "Nuevo alimento". Apago el interruptor "Enviar también por mensaje" para enseñar que un observador se puede quitar en vivo.
- **State:** reservo como cliente y entrego como restaurante. Explico que cada estado (Disponible, Reservada, Entregada) decide qué se puede hacer. **Cuando termino, entras tú con Adapter.**

Si la profe te pregunta de mis patrones, con esto alcanza:
- **Factory Method:** cada modalidad tiene su creador, y la página le pide "dame el creador de esta modalidad".
- **Observer:** el centro de notificaciones avisa a todos sus suscritos sin saber cómo es cada uno.
- **State:** el estado del alimento decide qué acciones se permiten.

---

## 5. Tus partes

### 5.1 Portada y el problema
**Qué decir:**
> "Somos Aldo Pazzi y Pablo Montoro, y les presentamos Saruino. Los restaurantes, cafeterías y panaderías tiran comida buena solo porque no se vendió en el día, y del otro lado hay gente que la aprovecharía. Saruino los conecta: el negocio publica lo que le sobró, el cliente lo reserva y lo recoge, y cada entrega se registra como kilos de desperdicio evitado. Hay cuatro roles y cada uno ve opciones distintas."

### 5.2 Cómo funciona por dentro
**Qué enseñar:** la carpeta en VS Code.
- `app.py`: el servidor Flask (rutas, sesiones y permisos).
- `templates/index.html`: la página.
- `static/`: estilos, JavaScript e imágenes.
- `src/`: el código TypeScript (`patrones/` y `secciones/`).
- `bd/`: el script de la base de datos.

**Qué decir:**
> "El sistema tiene tres partes: la página, el servidor Flask y SQL Server. Seguimos la estructura de Flask que pidió la profesora. La página no guarda nada sola: le manda los datos a Flask, Flask revisa quién eres y qué puedes hacer, y los guarda en SQL Server."

### 5.3 Strategy (calcular el descuento)
**El problema (a la dueña):**
> "A veces conviene bajar el precio porque el pan está por caducar, y otras porque sobró mucho. Usted elige la regla, y mañana podemos agregar otra sin rehacer la publicación."

**En la página:** en el formulario de Publicar (ya con sesión de restaurante), deja la modalidad en **Descuento**, pon "Caduca en" **2** horas y cambia "Calcular descuento" entre "Por caducidad" y "Por disponibilidad". La caja roja cambia el porcentaje al momento.

**El código:** abre `src/patrones/strategy.ts`. Arriba trae un comentario que lo explica.

| Papel | Clase | Qué hace |
|---|---|---|
| Estrategia (el contrato) | `EstrategiaDescuento` | Dice que toda regla debe tener `calcularPorcentaje(cantidad, horas)` |
| Estrategias concretas | `DescuentoPorCaducidad`, `DescuentoPorDisponibilidad` | Cada una calcula a su manera |
| Contexto | `PublicacionDescuento` (en `src/modelos/publicacion.ts`) | Guarda una estrategia y solo le pregunta el porcentaje |

**Las reglas:**
- **Por caducidad:** 50 % si faltan 3 horas o menos, 30 % hasta 8 horas, 15 % si falta más.
- **Por disponibilidad:** 40 % con 20 piezas o más, 25 % con 10 o más, 10 % con menos.

**Ejemplo para decirlo con números:** un producto de $200, con 12 piezas y que caduca en 2 horas. Por caducidad son 50 %, o sea $100. Por disponibilidad son 25 %, o sea $150. Mismo producto, distinta regla, distinto precio.

**Por qué ese patrón:**
> "La publicación no sabe cómo se calcula el descuento: se lo pregunta a su estrategia. Las reglas se pueden cambiar porque las dos cumplen el mismo contrato. Para agregar una regla nueva, como 'por temporada', se hace otra clase y la publicación no se toca."

### 5.4 Adapter (servicios externos)
**El problema (a la dueña):**
> "Queremos usar Google Maps y un servicio de mensajes, pero son de otras empresas y tienen sus propios métodos. Si un día cambiamos de proveedor, no queremos rehacer la página."

**En la página:** clic en **"Ver en mapa"** en cualquier tarjeta: abre Google Maps con la dirección del negocio. En la campana se ve el contador de mensajes enviados por el servicio externo.

**El código:** abre `src/patrones/adapter.ts`.

| Papel | Mapas | Mensajes |
|---|---|---|
| Lo que espera nuestro sistema (Target) | `ServicioMapa` (`obtenerEnlace`) | `Observador` (`actualizar`) |
| El servicio externo (Adaptee) | `GoogleMapsExterno` (`construirUrlBusqueda`) | `ApiMensajeriaExterna` (`enviarMensaje`) |
| El adaptador (Adapter) | `MapaAdapter` | `NotificadorMensajesAdapter` |

**Por qué ese patrón:**
> "Es como un adaptador de enchufe. La página pide `obtenerEnlace(direccion)` y el adaptador lo traduce a `construirUrlBusqueda(...)`, que es lo que entiende Google. Si cambiamos de proveedor, solo cambia el adaptador."

**Ojo:** el servicio de mensajes está **simulado** (solo cuenta los mensajes). El de mapas sí abre Google Maps de verdad.

### 5.5 Base de datos en VS Code
**Las 5 tablas:**

| Tabla | Qué guarda |
|---|---|
| `Negocios` | Nombre, tipo y dirección |
| `Usuarios` | Nombre, correo, contraseña cifrada y rol |
| `Publicaciones` | Producto, cantidad, kilos, precio, modalidad, estrategia, horario y estado |
| `Reservas` | Quién reservó, cuándo, y si está activa, entregada o cancelada |
| `RegistroDesperdicio` | Una fila por cada entrega, con los kilos evitados |

**Qué enseñar:** en VS Code, la extensión SQL Server (el ícono de cilindro) con la base `Saruino` y sus tablas. Abre `bd/consultas.sql`, selecciona la consulta de reservas y córrela: aparece la reserva que hice yo en la demo de State.

**Qué decir:**
> "La página no guarda nada sola: Flask guarda en SQL Server con pyodbc, y aquí vemos que la reserva de hace un momento de verdad quedó en la tabla."

### 5.6 Cierre
> "Para cerrar: Factory Method nos dejó crear publicaciones sin un if por modalidad, Strategy cambiar la regla del descuento, Observer avisar sin que quien publica conozca a quién, State controlar el ciclo de cada alimento y Adapter conectar servicios externos sin modificarlos. Todo se guarda en SQL Server y cada entrega suma al registro de kilos evitados. ¿Tienen preguntas?"

---

## 6. Lo que te puede preguntar la profe

**Generales**
- *¿Qué hiciste tú?* El problema, la arquitectura, la base de datos y los patrones Strategy y Adapter. Dilo con tus palabras.
- *¿Por qué hay `src/` y `static/js/`?* El navegador solo entiende JavaScript: escribimos en TypeScript (`src/`) y lo compilamos a JavaScript (`static/js/`).
- *¿Qué es Flask?* Una librería de Python para hacer servidores web. En `app.py` están las rutas que usa la página.

**Base de datos**
- *¿Por qué SQL Server?* Lo pidió la profesora, y es un gestor robusto que se usa mucho en empresas.
- *¿Cómo se guardan las contraseñas?* Cifradas con un hash. Ni quien vea la base puede leerlas.
- *¿Cómo evitan que dos clientes reserven lo mismo?* El servidor solo cambia la publicación si todavía está "Disponible". Si otro ya la reservó, responde que ya no está disponible.
- *¿Qué pasa si SQL Server está apagado?* La página abre en modo de ejemplo; los cambios no se guardan.

**Strategy**
- *¿Cuál es el contexto?* `PublicacionDescuento`: recibe la estrategia y le pide el porcentaje.
- *¿Quién elige la estrategia?* El negocio, en el formulario. Se guarda en la columna `Estrategia` de la base.
- *¿Diferencia entre Strategy y State?* En Strategy alguien de afuera elige la regla y no cambia sola. En State el objeto cambia de estado por sí mismo según lo que pasa (reservar, entregar).

**Adapter**
- *¿Diferencia entre Adapter y Facade?* Adapter hace compatible **una** interfaz con otra que el sistema ya espera. Facade da una interfaz simple a **un grupo** de clases complicadas.
- *¿Por qué el adaptador de mensajes implementa `Observador`?* Para que el centro de notificaciones lo trate como a cualquier otro observador. Ahí se combinan Adapter y Observer.

---

## 7. Cómo estudiar

1. Lee este archivo completo.
2. Abre `src/patrones/strategy.ts` y `src/patrones/adapter.ts`. Cada uno empieza con un comentario que explica el problema y el papel de cada clase.
3. **Estudia con Claude:** abre la carpeta del proyecto con Claude Code. El archivo `CLAUDE.md` ya le dice que es tu tutor y cuál es tu parte. Pídele cosas como:
   - "Explícame `strategy.ts` como si nunca hubiera programado."
   - "Hazme un examen de 5 preguntas de mi parte, de una en una."
   - "Haz de la profesora y pregúntame sobre Adapter; corrígeme."
4. Practica en voz alta lo que dice cada parte de la sección 5, con tus palabras, no de memoria.

Más detalle (por si quieres profundizar): `GUIA_ESTUDIO.md` y `EXPLICACION.md`, sección 4.

---

## 8. Antes de la exposición

- [ ] Sé explicar el problema y las 3 partes sin leer.
- [ ] Sé enseñar Strategy en la página y en el código, con el ejemplo de los $200.
- [ ] Sé enseñar Adapter en la página y en el código, con la tabla de los 3 papeles.
- [ ] Sé enseñar las tablas en VS Code y correr la consulta de reservas.
- [ ] Me sé las respuestas de la sección 6.
- [ ] Ensayamos juntos al menos una vez, de principio a fin.

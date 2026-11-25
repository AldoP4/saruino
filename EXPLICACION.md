# Saruino: guía para entender y exponer el proyecto

Equipo: **Aldo Pazzi** y **Pablo Farid Montoro Araujo**.

Este documento explica qué hace el sistema, cómo está hecho por dentro y qué decir al exponerlo. Si solo tienes 10 minutos antes de presentar, lee las secciones **1**, **3**, **4** y **11**. La sección **4** es el guion patrón por patrón.

**Quién presenta qué:** Aldo presenta Factory Method, Observer y State; Pablo presenta el problema, la arquitectura, la base de datos, Strategy y Adapter. El reparto completo, la guía de Pablo y cómo correrlo en clase están en [GUIA_ESTUDIO.md](GUIA_ESTUDIO.md).

**Contenido**
1. Qué hace el sistema
2. Preparación antes de exponer
3. Guion de la exposición
4. Guion por bloques: un patrón a la vez
5. Recorrido de la demostración
6. Arquitectura: las tres partes
7. Los 5 patrones
8. Recorrido por el código
9. Qué pasa por dentro en cada acción
10. La base de datos
11. Preguntas que puede hacer la profe
12. Si algo falla durante la exposición
13. Glosario

---

## 1. Qué hace el sistema

**En una frase:** los negocios publican la comida que no vendieron y los clientes la reservan y la recogen; un administrador supervisa todo y cada entrega se registra como desperdicio evitado.

**El problema que resuelve:** restaurantes, cafeterías, panaderías y supermercados tiran comida que todavía sirve porque no se vendió en el día. Del otro lado hay personas y organizaciones que la necesitan. Falta algo que los conecte.

**Lo que hace la plataforma:**
- Publicar alimentos en tres modalidades: **venta**, **descuento** o **donación**.
- Calcular el descuento según la **caducidad** o la **cantidad disponible**.
- **Avisar** cuando hay alimentos nuevos.
- Controlar el ciclo **Disponible → Reservada → Entregada**.
- Indicar el **horario de recolección** y la ubicación en el mapa.
- Llevar el **registro de kilos de desperdicio evitado**.

**Los roles (cada uno ve opciones distintas en la página):**

| Rol | Qué ve y qué puede hacer |
|---|---|
| **Visitante** (sin cuenta) | Solo ve los alimentos disponibles y el mapa. Para reservar o publicar tiene que entrar |
| **Cliente** | Reservar alimentos, ver **Mis reservas** y cancelarlas |
| **Negocio** (restaurante, panadería…) | **Publicar** alimentos, ver las reservas de sus alimentos y **marcar la entrega** |
| **Administrador** | Ve el **Panel de administración**: todos los usuarios, todas las reservas, kilos por negocio, y puede **eliminar publicaciones** o cancelar cualquier reserva. No publica ni reserva |

En la barra de arriba aparece una etiqueta con el rol de quien inició sesión. Las cuentas de cliente y negocio se crean desde la página; la del administrador solo la crea `crearBD.py`, para que nadie se registre como administrador.

---

## 2. Preparación antes de exponer

Revisa esto 10 minutos antes:

1. **SQL Server encendido.** Arranca solo con la compu. Para comprobarlo:
   ```bash
   py pruebaBD.py
   ```
   Debe decir `CONEXIÓN CORRECTA`.
2. **Base con datos limpios** (regresa a los 3 alimentos y usuarios de ejemplo):
   ```bash
   py crearBD.py
   ```
3. **Levantar el servidor:**
   ```bash
   py app.py
   ```
4. Abrir **http://127.0.0.1:5000** y comprobar que arriba diga "Conectado a SQL Server" con un punto verde.
5. Tener a la mano los usuarios de prueba (contraseña de todos: `saruino123`):

| Correo | Rol |
|---|---|
| `admin@saruino.test` | Administrador |
| `restaurante@saruino.test` | Negocio (Restaurante Sazón Poblano) |
| `trigal@saruino.test` | Negocio (Panadería El Trigal) |
| `espiga@saruino.test` | Negocio (Panadería La Espiga) |
| `cliente@saruino.test` | Cliente (María López) |

6. Tener abiertos en VS Code los 5 archivos de `src/patrones/`: cada uno empieza con un comentario que dice el problema, los papeles de cada clase y dónde se usa.

---

## 3. Guion de la exposición (8 a 10 minutos)

| Tiempo | Qué decir | Qué mostrar |
|---|---|---|
| 1 min | **El problema:** comida buena que se tira, y gente que la necesita | La página de inicio |
| 1 min | **La solución:** plataforma que conecta negocios con clientes, con un administrador que supervisa | La sección de alimentos disponibles |
| 1 min | **Arquitectura:** página, servidor Flask y SQL Server; estructura `app.py`, `templates/`, `static/` | La carpeta en VS Code |
| 6 min | **Los 5 patrones, bloque por bloque** (sección 4): problema, código, página y explicación | `src/patrones/` y la página |
| 1 min | **Cierre:** qué se logró y qué se podría agregar | El contador de kilos |

**Frase de cierre sugerida:** "Cada patrón resolvió un problema concreto: crear publicaciones sin un `if` por modalidad, cambiar la regla de descuento, avisar sin acoplar, controlar el ciclo de cada alimento y conectar servicios externos sin modificarlos."

## 4. Guion por bloques: un patrón a la vez

La exposición va por bloques. En cada uno haces lo mismo, en este orden:

1. **El problema** (le hablas a la profe como si fuera la dueña del negocio).
2. **El código** (abres el archivo del patrón: arriba tiene un comentario con el problema, los papeles de cada clase y dónde se usa).
3. **La página** (enseñas que funciona de verdad).
4. **La explicación técnica** (para la profe como evaluadora) y te preparas para sus preguntas.

### Cómo está acomodado el código (dilo una vez, al principio)

"Cada patrón tiene **dos lugares**: donde se **define** y donde se **usa**."

| Bloque | Dónde se define (las clases del patrón) | Dónde se usa (la página) |
|---|---|---|
| Factory Method | `src/patrones/factory.ts` | `src/secciones/publicar.ts` y `crearDesdeFila` en `src/almacen.ts` |
| Strategy | `src/patrones/strategy.ts` | `actualizarVistaPrevia` en `src/secciones/publicar.ts` y el precio en `src/secciones/tarjetas.ts` |
| Observer | `src/patrones/observer.ts` | `src/secciones/notificaciones.ts` |
| State | `src/patrones/state.ts` | `src/secciones/reservas.ts` |
| Adapter | `src/patrones/adapter.ts` | `src/secciones/tarjetas.ts` (mapa) y `src/secciones/notificaciones.ts` (mensajes) |

`src/main.ts` ya no tiene lógica de patrones: solo arranca la página, pinta cada sección y conecta los clics. `src/modelos/publicacion.ts` es la clase `Publicacion`, donde se juntan Factory Method, State y Strategy.

**Antes de empezar:** `py crearBD.py`, `py app.py`, abre http://127.0.0.1:5000 y deja abiertos en VS Code los 5 archivos de `src/patrones/`.

---

### Bloque 1. Factory Method: crear publicaciones

**El problema (a la dueña):** "Usted puede ofrecer lo que le sobró de tres formas: venderlo normal, venderlo con descuento o donarlo. Cada una se comporta distinto: la donación es gratis, el descuento calcula un precio nuevo. Si mañana quiere una cuarta forma, por ejemplo trueque, no queremos tocar todo el sistema."

**El código:** `src/patrones/factory.ts`
- `CreadorPublicacion` (abstracta) tiene `publicar(datos)`: primero valida y luego llama a `crearPublicacion(datos)`.
- `crearPublicacion` es **el Factory Method**: es abstracto y cada hija lo implementa.
- `CreadorVenta`, `CreadorDescuento`, `CreadorDonacion` crean `PublicacionVenta`, `PublicacionDescuento` y `PublicacionDonacion` (en `modelos/publicacion.ts`).
- `creadorPara(modalidad, estrategia)` regresa el creador de esa modalidad sin usar `if`.
- Dónde se usa: `publicar()` en `src/secciones/publicar.ts` (`creadorPara(modalidad, estrategia).publicar(datos)`) y `crearDesdeFila()` en `src/almacen.ts`.

**En la página:** entra como `restaurante@saruino.test`, ve a **Publicar**, cambia la modalidad (Descuento, Venta, Donación) y publica. La tarjeta nueva sale con su color: rojo descuento, dorado venta, verde donación.

**Explicación técnica:** "El formulario no sabe qué clase crear: le pide al creador de la modalidad que la cree. El proceso común (validar) está en la clase padre y cada hija decide **qué** objeto crear. Se cumple abierto/cerrado: para agregar trueque creo `CreadorTrueque` y `PublicacionTrueque` sin modificar lo que ya existe."

**Preguntas probables:**
- *¿Dónde está exactamente el Factory Method?* En el método abstracto `crearPublicacion(datos)` de `CreadorPublicacion`; cada creador concreto lo sobrescribe.
- *¿Por qué no un `switch` por modalidad?* Porque cada modalidad nueva obligaría a modificar esa función. Aquí se agrega una clase y no se toca nada existente.
- *¿Y `creadorPara` no es un `switch` escondido?* Es un diccionario que solo dice qué creador corresponde a cada nombre; la creación sigue estando en los creadores. Agregar trueque es una línea en el diccionario más las dos clases nuevas.
- *¿Las publicaciones que vienen de SQL Server también pasan por la fábrica?* Sí, `crearDesdeFila` en `almacen.ts` usa `creadorPara` con la modalidad guardada en la fila.
- *¿Es Factory Method o Abstract Factory?* Factory Method: un solo producto (la publicación) y la decisión se delega a subclases. Abstract Factory crea **familias** de productos relacionados.

---

### Bloque 2. Strategy: calcular el descuento

**El problema (a la dueña):** "A veces le conviene bajar el precio porque el pan está por caducar, y otras porque le sobraron muchas piezas. Queremos que usted elija la regla y que mañana podamos agregar otra, por ejemplo 'por temporada', sin rehacer la publicación."

**El código:** `src/patrones/strategy.ts`
- `EstrategiaDescuento` (interfaz) con `calcularPorcentaje(cantidad, horas)`.
- `DescuentoPorCaducidad`: 50 % con 3 h o menos, 30 % hasta 8 h, 15 % si falta más.
- `DescuentoPorDisponibilidad`: 40 % con 20 piezas o más, 25 % con 10 o más, 10 % con menos.
- **Contexto:** `PublicacionDescuento` en `modelos/publicacion.ts`: guarda una estrategia y solo le pide el porcentaje (`get porcentaje()`).
- Dónde se usa: `actualizarVistaPrevia()` en `src/secciones/publicar.ts` (la vista previa) y `precioHtml()` en `src/secciones/tarjetas.ts` (la etiqueta roja "-30 % por caducidad").

**En la página:** en Publicar, deja la modalidad en **Descuento**, pon "Caduca en" 2 horas: la caja roja dice 50 %. Cambia "Calcular descuento" a **Por disponibilidad**: el porcentaje cambia al momento, con los mismos datos.

**Explicación técnica:** "La publicación con descuento no sabe cómo se calcula el porcentaje: lo delega a su estrategia. La regla es intercambiable porque las dos cumplen la misma interfaz. Para agregar 'por temporada' creo otra clase que implemente `EstrategiaDescuento`."

**Preguntas probables:**
- *¿Cuál es el contexto?* `PublicacionDescuento`, que recibe la estrategia en su constructor.
- *¿Quién elige la estrategia?* El negocio, en el formulario. La clave (`caducidad` o `disponibilidad`) se guarda en la columna `Estrategia` de SQL Server y `estrategiaPorClave` la convierte en el objeto.
- *¿Diferencia entre Strategy y State?* En Strategy **alguien de afuera elige** la estrategia y no cambia sola. En State **el objeto cambia de estado por sí mismo** según lo que pasa (reservar, entregar).
- *¿Por qué una interfaz y no una clase abstracta?* No hay código en común entre las reglas, solo el contrato `calcularPorcentaje`.

---

### Bloque 3. Observer: avisar de alimentos nuevos

**El problema (a la dueña):** "Cuando usted publica comida, los clientes tienen que enterarse rápido, porque caduca. Hoy avisamos con una campana en la página y con un servicio de mensajes; mañana quizá también por correo. Quien publica no debería tener que saber a quién avisar."

**El código:** `src/patrones/observer.ts`
- **Sujeto:** `CentroNotificaciones` con `suscribir`, `desuscribir` y `notificar`.
- **Observador:** interfaz `Observador` con un solo método, `actualizar(evento)`.
- **Observadores concretos** (en `src/secciones/notificaciones.ts`): `PanelNotificaciones` (la campana) y `NotificadorMensajesAdapter` (el servicio de mensajes, conectado con Adapter).
- Dónde se usa: `avisarNuevoAlimento()` cuando alguien publica, `avisarDeNuevoDisponible()` cuando se cancela una reserva, y `revisarNovedades()`, que cada 10 segundos pregunta al servidor si otro negocio publicó algo.
- `cambiarAvisosPorMensaje()` suscribe o desuscribe al servicio de mensajes con el interruptor de la campana.

**En la página:**
1. Publica algo: la campana marca **1** y abajo dice "Mensajes enviados por el servicio externo: 1".
2. Abre la campana y **desactiva** "Enviar también por mensaje". Publica otra cosa: la campana sube a 2, pero los mensajes se quedan en 1. *"Desuscribí a un observador en vivo y el centro ya no le avisa; no cambié nada del código que publica."*
3. Vuelve a activarlo.
4. Para lucirte: abre otra ventana como `cliente@saruino.test`; cuando el restaurante publica, al cliente le llega el aviso en menos de 10 segundos.

**Explicación técnica:** "El centro solo conoce la interfaz `Observador`. `notificar()` recorre la lista y llama a `actualizar()` en cada uno; no sabe si es una campana o un servicio de mensajes. Se pueden suscribir y desuscribir en tiempo de ejecución."

**Preguntas probables:**
- *¿Quién es el sujeto y quiénes los observadores?* Sujeto: `CentroNotificaciones`. Observadores: `PanelNotificaciones` y `NotificadorMensajesAdapter`.
- *¿Cómo agrego avisos por correo?* Creo un observador nuevo (o un adaptador para el servicio de correo) y lo suscribo al centro. No toco el centro ni el código que publica.
- *¿Dónde se usa `desuscribir`?* En el interruptor "Enviar también por mensaje" de la campana (`cambiarAvisosPorMensaje`).
- *¿Por qué cada 10 segundos y no al instante?* La página le pregunta al servidor (polling). Al instante se haría con WebSockets; quedó como mejora.
- *¿Por qué `suscribir` revisa si ya existe?* Para que un observador no reciba el mismo aviso dos veces.

---

### Bloque 4. State: el ciclo de cada alimento

**El problema (a la dueña):** "Cada comida que publica pasa por un ciclo: está disponible, alguien la reserva y usted la entrega. No debe poder entregarse algo que nadie reservó, ni reservarse dos veces lo mismo, ni cancelarse algo ya entregado."

**El código:** `src/patrones/state.ts`
- **Estado:** interfaz `EstadoPublicacion` con `reservar`, `entregar` y `cancelar`.
- **Estados concretos:** `EstadoDisponible`, `EstadoReservada`, `EstadoEntregada`. Cada uno decide qué se permite: si se puede, cambia la publicación al siguiente estado; si no, lanza un error (por ejemplo, `EstadoDisponible.entregar()` dice "Primero hay que reservar la publicación").
- **Contexto:** `Publicacion` (`modelos/publicacion.ts`): guarda su estado y le pasa cada orden (`reservar()` llama a `this.estado.reservar(this)`).
- Dónde se usa: `ejecutarAccion()` en `src/secciones/reservas.ts`. También `crearEstado()` convierte el texto de SQL Server ("Reservada") en su objeto.

```
Disponible --reservar--> Reservada --entregar--> Entregada
     ^                       |
     +-------cancelar--------+
```

**En la página:**
1. Entra como `cliente@saruino.test` y reserva un alimento: la etiqueta cambia a **Reservada** y el botón ya no deja reservar.
2. Entra como `restaurante@saruino.test` (si el alimento es suyo) y en "Reservas de mis alimentos" da **Marcar entregada**: pasa a **Entregada** y sube el contador de kilos.
3. Cancelar una reserva lo regresa a **Disponible** (y el Observer avisa "De nuevo disponible").

**Explicación técnica:** "La publicación no tiene `if (estado == ...)`: le delega la acción a su estado actual. Cada estado sabe qué se puede hacer desde ahí. Agregar un estado nuevo, por ejemplo 'Vencida', es otra clase, no más `if` regados."

**Preguntas probables:**
- *¿Cuál es el contexto?* `Publicacion`. El método `cambiarEstado` solo lo llaman los estados.
- *¿Quién cambia el estado: la publicación o el estado?* El estado: `EstadoDisponible.reservar()` hace `publicacion.cambiarEstado(new EstadoReservada())`.
- *¿Por qué el servidor también revisa?* La página usa State para responder rápido; el servidor repite la regla en `TRANSICIONES` de `app.py` para que nadie se la salte modificando la página.
- *¿Cómo evitan que dos clientes reserven lo mismo?* El `UPDATE` solo cambia la fila si sigue en "Disponible"; si otro ya la reservó, no cambia nada y responde que ya no está disponible.
- *¿Para qué sirve `restaurarEstado`?* Cuando la publicación viene de SQL Server ya trae su estado; `restaurarEstado` le pone el objeto State que corresponde.

---

### Bloque 5. Adapter: servicios externos

**El problema (a la dueña):** "Queremos usar servicios de otras empresas: Google Maps para que el cliente llegue a su local y un servicio de mensajes para avisarle. Cada uno tiene sus propias instrucciones y no las podemos cambiar. Si un día cambiamos de proveedor, no queremos rehacer la página."

**El código:** `src/patrones/adapter.ts`

| Papel | Mapas | Mensajes |
|---|---|---|
| Target (lo que espera nuestro sistema) | `ServicioMapa` (`obtenerEnlace`) | `Observador` (`actualizar`) |
| Adaptee (servicio externo) | `GoogleMapsExterno` (`construirUrlBusqueda`) | `ApiMensajeriaExterna` (`enviarMensaje`) |
| Adapter | `MapaAdapter` | `NotificadorMensajesAdapter` |

- Dónde se usa: el enlace "Ver en mapa" en `src/secciones/tarjetas.ts` (la página solo conoce `ServicioMapa`) y el servicio de mensajes suscrito al centro en `src/secciones/notificaciones.ts`.

**En la página:** da clic en **Ver en mapa** en cualquier tarjeta: abre Google Maps con la dirección del negocio. En la campana, el contador de mensajes enviados muestra que el servicio externo recibe los avisos.

**Explicación técnica:** "El adaptador traduce: nuestra página llama `obtenerEnlace(direccion)` y el adaptador lo convierte en `construirUrlBusqueda(...)`, que es lo que entiende Google. En mensajes, el Observer llama `actualizar(evento)` y el adaptador lo convierte en `enviarMensaje(destino, cuerpo)`. Si cambiamos de proveedor, solo cambia el adaptador."

**Preguntas probables:**
- *¿Cuál es el Target, el Adaptee y el Adapter?* La tabla de arriba.
- *¿El servicio de mensajes es real?* Está **simulado**: guarda y cuenta los mensajes. El de mapas sí abre Google Maps. Conectarlo a WhatsApp o correo sería cambiar solo `ApiMensajeriaExterna` por el cliente real.
- *¿Diferencia entre Adapter y Facade?* Adapter hace compatible **una** interfaz con otra que el sistema ya espera. Facade da una interfaz simple a **un grupo** de clases complejas.
- *¿Por qué el adaptador de mensajes implementa `Observador`?* Porque así el centro de notificaciones lo trata como a cualquier otro observador: aquí se combinan Adapter y Observer.

---

### Cierre (30 segundos)

"Cada patrón resolvió un problema concreto del negocio: Factory Method crea publicaciones sin un `if` por modalidad, Strategy cambia la regla del descuento, Observer avisa sin que quien publica conozca a quién, State controla el ciclo de cada alimento y Adapter conecta servicios externos sin modificarlos. Todo se guarda en SQL Server y cada entrega suma al registro de kilos de desperdicio evitado."

---

## 5. Recorrido de la demostración

Versión corrida de la demostración (sin abrir código). Cada paso muestra un patrón.

0. **Visitante.** Sin entrar, enseña que solo se ven los alimentos y que el botón dice "Entra para reservar".
1. **Entrar como negocio.** En "Mi cuenta", hasta abajo, entra como `restaurante@saruino.test`. Arriba aparece la etiqueta **Negocio** y la opción **Publicar**.
2. **Strategy.** En "Publicar", elige modalidad **Descuento** y cambia "Caduca en (horas)" a 2. La vista previa muestra el descuento: *"La regla del descuento es una estrategia; si cambio a 'Por disponibilidad', cambia el cálculo sin tocar la publicación."*
3. **Factory Method.** Publica. *"El formulario no sabe qué clase crear; se lo pide a la fábrica de la modalidad elegida."*
4. **Observer.** Suena la campana con "Nuevo alimento". *"El centro de notificaciones avisó a todos sus observadores: la campana y el servicio externo de mensajes."* Si apagas "Enviar también por mensaje" en la campana, ese observador se desuscribe y el contador de mensajes ya no sube.
5. **Cambiar a cliente.** Cierra sesión y entra como `cliente@saruino.test`. Arriba sale **Cliente** y desaparece "Publicar"; aparece **Mis reservas**.
6. **State.** Reserva el alimento: pasa de Disponible a **Reservada**. *"Cada estado decide qué se puede hacer; una publicación reservada ya no se puede volver a reservar."*
7. **Entregar.** Cierra sesión, entra otra vez como el restaurante y marca **Entregada** en "Reservas de mis alimentos". El contador de kilos evitados sube.
8. **Adapter.** Da clic en "Ver en mapa" en cualquier tarjeta. *"El adaptador traduce nuestra dirección al formato que pide Google Maps."*
9. **Administrador.** Entra como `admin@saruino.test`: aparece el **Panel de administración** con usuarios, publicaciones, kilos por negocio y el botón para eliminar publicaciones.

**Para lucirte con el Observer:** abre la página en dos navegadores; en uno entra como el cliente y en el otro como el restaurante. Cuando el restaurante publica, al cliente le llega el aviso en menos de 10 segundos.

---

## 6. Arquitectura: las tres partes

| Parte | Tecnología | Qué hace | Dónde está |
|---|---|---|---|
| **Front** | HTML, CSS y TypeScript | Lo que ve el usuario, y los 5 patrones | `templates/`, `static/` y `src/` |
| **Back** | Python con Flask | Recibe las peticiones, revisa permisos y habla con la base | `app.py` |
| **Base de datos** | SQL Server Express | Guarda negocios, usuarios, publicaciones, reservas y entregas | `bd/saruino_sqlserver.sql` |

**Cómo viajan los datos:**

```
Página (navegador) --petición--> Flask (app.py) --consulta SQL--> SQL Server
                   <--JSON-----                 <--filas--------
```

### Estructura de carpetas (la que pidió la profe)

```
ProyectoFinal/
├── app.py                 Flask: rutas de la página y de la API
├── templates/index.html   el front
├── static/css/            estilos
├── static/js/             JavaScript que usa la página (sale de compilar src/)
├── static/img/            imágenes (logo)
├── src/                   código TypeScript original
│   ├── patrones/          un archivo por patrón (donde se DEFINEN)
│   ├── secciones/         cada parte de la página (donde se USAN los patrones)
│   ├── modelos/           la clase Publicacion
│   └── main.ts            arranque: pinta la página y conecta los clics
├── bd/                    script de SQL Server
├── conexion.py            conexión a SQL Server
├── crearBD.py             crea la base con datos de ejemplo
└── pruebaBD.py            prueba de conexión (código de la profe)
```

**¿Por qué hay `src/` y `static/js/`?** El navegador no entiende TypeScript, solo JavaScript. El código se escribe en `src/` (TypeScript) y `npm run build` lo traduce a JavaScript en `static/js/`, que es lo que carga la página.

---

## 7. Los 5 patrones

Para cada patrón: en qué archivo está, qué papel juega cada clase (los nombres que vienen en los libros), qué hace y por qué se usó.

### 7.1 Factory Method: crear publicaciones

- **Archivo:** `src/patrones/factory.ts` (los productos están en `src/modelos/publicacion.ts`)
- **Papeles:**

| Papel en el patrón | Clase en el proyecto |
|---|---|
| Creador | `CreadorPublicacion` (abstracta) |
| Creadores concretos | `CreadorVenta`, `CreadorDescuento`, `CreadorDonacion` |
| Producto | `Publicacion` (abstracta) |
| Productos concretos | `PublicacionVenta`, `PublicacionDescuento`, `PublicacionDonacion` |
| Factory Method | `crearPublicacion(datos)` |

- **Cómo funciona:** `publicar(datos)` es el proceso común: valida los datos y luego llama a `crearPublicacion(datos)`. Cada creador concreto decide qué producto crear.
- **Dónde se usa:** al publicar desde el formulario (`publicar` en `secciones/publicar.ts`) y también al leer cada publicación de la base de datos (`crearDesdeFila` en `almacen.ts`). `creadorPara(modalidad, estrategia)` da el creador de cada modalidad.
- **Por qué:** no hay un `if` por modalidad. Para agregar una modalidad nueva (por ejemplo "trueque") se crea otra clase creadora y otro producto, sin modificar los existentes.
- **Para explicarlo:** "El formulario no sabe qué clase crear; le pide a la fábrica de la modalidad elegida que la cree."

### 7.2 Strategy: calcular descuentos

- **Archivo:** `src/patrones/strategy.ts`
- **Papeles:**

| Papel en el patrón | Clase en el proyecto |
|---|---|
| Estrategia | `EstrategiaDescuento` (interfaz con `calcularPorcentaje`) |
| Estrategias concretas | `DescuentoPorCaducidad`, `DescuentoPorDisponibilidad` |
| Contexto | `PublicacionDescuento` |

- **Reglas:**
  - **Por caducidad:** 50 % si faltan 3 horas o menos, 30 % hasta 8 horas, 15 % si falta más.
  - **Por disponibilidad:** 40 % con 20 piezas o más, 25 % con 10 o más, 10 % con menos.
- **Cómo funciona:** `PublicacionDescuento` recibe una estrategia y solo le pide el porcentaje; no sabe cómo se calcula. `estrategiaPorClave` convierte la clave guardada en SQL Server (`caducidad` o `disponibilidad`) en el objeto.
- **Dónde se usa:** la vista previa del formulario (`secciones/publicar.ts`) y la etiqueta de descuento de las tarjetas (`secciones/tarjetas.ts`).
- **Por qué:** la regla se puede cambiar o agregar una nueva (por ejemplo "por temporada") sin modificar la publicación.
- **Para explicarlo:** "La regla del descuento es intercambiable, como cambiar una pieza."

### 7.3 Observer: avisar de alimentos nuevos

- **Archivo:** `src/patrones/observer.ts` (los observadores se suscriben en `secciones/notificaciones.ts`)
- **Papeles:**

| Papel en el patrón | Clase en el proyecto |
|---|---|
| Sujeto | `CentroNotificaciones` (`suscribir`, `desuscribir`, `notificar`) |
| Observador | `Observador` (interfaz con `actualizar`) |
| Observadores concretos | `PanelNotificaciones` (la campana) y `NotificadorMensajesAdapter` (servicio externo) |

- **Cómo funciona:** cuando hay un alimento nuevo, `notificar()` recorre la lista de observadores y llama a `actualizar()` en cada uno. La página revisa cada 10 segundos si otro negocio publicó algo (`revisarNovedades` en `secciones/notificaciones.ts`); si encuentra algo nuevo, avisa con el centro.
- **Suscribir y desuscribir en vivo:** el interruptor "Enviar también por mensaje" de la campana llama a `desuscribir` o `suscribir` con el servicio de mensajes.
- **Cuándo avisa:** cuando se publica un alimento y cuando una reserva se cancela (el alimento vuelve a estar disponible).
- **Por qué:** el centro no conoce los detalles de cada observador. Para avisar también por correo se agrega otro observador sin tocar el centro.
- **Para explicarlo:** "Es como seguir a alguien en redes: cuando publica, a todos sus seguidores les llega el aviso."

### 7.4 State: publicaciones, reservas y entregas

- **Archivo:** `src/patrones/state.ts`
- **Papeles:**

| Papel en el patrón | Clase en el proyecto |
|---|---|
| Contexto | `Publicacion` (guarda su estado actual) |
| Estado | `EstadoPublicacion` (interfaz con `reservar`, `entregar`, `cancelar`) |
| Estados concretos | `EstadoDisponible`, `EstadoReservada`, `EstadoEntregada` |

- **Diagrama de estados:**

```
Disponible --reservar--> Reservada --entregar--> Entregada
     ^                       |
     +-------cancelar--------+
```

- **Dónde se usa:** `ejecutarAccion` en `secciones/reservas.ts` (botones Reservar, Marcar entregada y Cancelar).
- **Cómo funciona:** cuando pides `publicacion.reservar()`, la publicación le pasa la orden a su estado actual. Si la acción es válida, el estado cambia la publicación al siguiente estado; si no, lanza un error. Por ejemplo, `EstadoDisponible.entregar()` dice "Primero hay que reservar la publicación".
- **Por qué:** no hay `if (estado == ...)` regados por el código; cada estado sabe qué se permite.
- **Para explicarlo:** "El objeto cambia su comportamiento según su estado, como un semáforo."

### 7.5 Adapter: servicios externos

- **Archivo:** `src/patrones/adapter.ts`
- **Papeles:**

| Papel en el patrón | Mapas | Mensajes |
|---|---|---|
| Interfaz que espera el sistema (Target) | `ServicioMapa` | `Observador` |
| Servicio externo (Adaptee) | `GoogleMapsExterno` | `ApiMensajeriaExterna` |
| Adaptador | `MapaAdapter` | `NotificadorMensajesAdapter` |

- **Cómo funciona:**
  - **Mapas:** nuestro sistema pide `obtenerEnlace(direccion)`; el adaptador lo traduce a `construirUrlBusqueda(...)`, que es el método del servicio externo.
  - **Mensajes:** el servicio externo tiene `enviarMensaje(destino, cuerpo)`; el adaptador lo convierte en un observador que el centro de notificaciones puede avisar.
- **Por qué:** los servicios externos tienen sus propios métodos y no se pueden modificar. Si mañana se cambia Google Maps por otro proveedor, solo se cambia el adaptador.
- **Para explicarlo:** "Es como un adaptador de enchufe: conecta algo que tiene otra forma."
- **Ojo:** el servicio de mensajes está **simulado** (cuenta los mensajes enviados); el de mapas sí abre Google Maps de verdad.

### 7.6 Los patrones y SOLID

| Principio | Dónde se ve |
|---|---|
| **S**: una sola responsabilidad | Cada estrategia solo calcula; `conexion.py` solo conecta |
| **O**: abierto para agregar, cerrado para modificar | Nueva modalidad = nuevo creador; nueva regla = nueva estrategia |
| **L**: las subclases se usan igual que la padre | Cualquier `Publicacion` se reserva y entrega igual |
| **I**: interfaces pequeñas | `Observador` solo tiene `actualizar()` |
| **D**: depender de interfaces | El centro de notificaciones solo conoce `Observador` |

---

## 8. Recorrido por el código

### Front (`src/`)

| Archivo | Qué hace | Partes importantes |
|---|---|---|
| `main.ts` | Arranca la página: carga datos, pinta todas las secciones y conecta los clics. No tiene lógica de patrones | `renderTodo`, `alDarClic`, `iniciar` |
| `almacen.ts` | Los datos que la página tiene en memoria y cómo se cargan de SQL Server (o de `datos.ts` en modo Demo) | `app`, `crearDesdeFila`, `cargarDatos` |
| `roles.ts` | Qué puede hacer cada rol en la página y qué opciones ve | `rolActual`, `puedeReservar`, `aplicarRol` |
| `cuenta.ts` | Entrar, crear cuenta y salir; guarda quién inició sesión | `usuario()`, `iniciarFormulariosCuenta` |
| `api.ts` | Todas las llamadas al servidor | `obtenerPublicaciones`, `crearPublicacionEnBD`, `cambiarEstadoEnBD` |
| `modelos/publicacion.ts` | La clase `Publicacion` y sus tres modalidades | `calcularPrecioFinal`, `reservar`, `entregar`, `cancelar` |
| `patrones/*.ts` | Un archivo por patrón, con un comentario arriba que lo explica | Ver la sección 7 |
| `secciones/publicar.ts` | Formulario de publicar: **Factory Method + Strategy** | `publicar`, `actualizarVistaPrevia` |
| `secciones/notificaciones.ts` | La campana: **Observer + Adapter** de mensajes | `centro`, `revisarNovedades`, `cambiarAvisosPorMensaje` |
| `secciones/reservas.ts` | Reservar, entregar y cancelar: **State** | `ejecutarAccion`, `renderReservas` |
| `secciones/tarjetas.ts` | Tarjetas de alimentos (precio con Strategy, mapa con Adapter) | `renderLista` |
| `secciones/panel.ts` | Sección "Mi cuenta" y el panel de cada rol | `renderCuenta` |
| `secciones/admin.ts` | Panel de administración | `renderAdmin`, `eliminarPublicacion` |
| `datos.ts` | Datos de ejemplo si no hay SQL Server (modo Demo) | `crearPublicacionesIniciales` |
| `utilidades.ts` | Funciones pequeñas que se repiten | `escapar` (evita que un texto se vuelva código), `mostrarAviso` |
| `decoracion/animaciones.ts` | Las secciones aparecen al bajar y el brillo que sigue al ratón. **No es un patrón** | `iniciarAnimaciones` |
| `decoracion/fondo3d.ts` | Brasas doradas en 3D con Three.js. Si la compu va lenta, se apaga solo. **No es un patrón** | `iniciarFondo3D` |

### Back (`app.py`)

| Parte | Qué hace |
|---|---|
| `con_bd` | Abre la conexión, la pasa a la ruta y siempre la cierra; si falla, deshace los cambios |
| `usuario_en_sesion` | Dice quién inició sesión |
| `registrar_usuario`, `iniciar_sesion`, `cerrar_sesion` | Cuentas |
| `validar_publicacion` | Revisa que los datos de una publicación estén completos y bien |
| `registrar_publicacion` | Guarda una publicación a nombre del negocio que inició sesión |
| `revisar_permiso` | Decide si el usuario puede reservar, entregar o cancelar |
| `cambiar_estado` | Reserva, entrega o cancela, y guarda la reserva o la entrega |
| `TRANSICIONES` | De qué estado a qué estado lleva cada acción |
| `impacto` | Suma los kilos de desperdicio evitado |

### Base de datos y prueba

| Archivo | Qué hace |
|---|---|
| `conexion.py` | `conectar()`: conexión a SQL Server Express |
| `crearBD.py` | Ejecuta el script `.sql` y crea los usuarios de ejemplo |
| `pruebaBD.py` | El código de prueba de la profe: confirma la conexión |

---

## 9. Qué pasa por dentro en cada acción

### Al publicar un alimento
1. `publicar()` en `secciones/publicar.ts` lee el formulario.
2. **Factory Method:** `creadorPara(modalidad, estrategia).publicar(datos)` valida y crea el objeto de la modalidad correcta.
3. `crearPublicacionEnBD()` lo manda a Flask (`POST /api/publicaciones`).
4. `registrar_publicacion` en `app.py` revisa que sea un negocio, valida los datos y hace el `INSERT` en SQL Server.
5. La página recibe la publicación guardada y la convierte otra vez en objeto con `crearDesdeFila` (Factory Method).
6. **Observer:** `avisarNuevoAlimento(...)` llama a `centro.notificar(...)`, que avisa a la campana y al servicio de mensajes.

### Al reservar
1. `ejecutarAccion("reservar", id)` en `secciones/reservas.ts`.
2. **State:** `publicacion.reservar()`; si no está disponible, el estado lanza un error y se detiene.
3. `cambiarEstadoEnBD()` → Flask (`POST /api/publicaciones/<id>/reservar`).
4. `cambiar_estado` en `app.py`: revisa que sea un cliente, cambia el estado en la base solo si sigue disponible y guarda la reserva en `Reservas`.
5. La página se actualiza con lo que respondió la base.

### Al entregar
Igual que reservar, pero solo lo puede hacer **el negocio que publicó**. Además, el servidor guarda una fila en `RegistroDesperdicio` con los kilos, y el contador de la página sube.

### Al cancelar
Lo pueden hacer el negocio dueño o quien reservó. El alimento vuelve a **Disponible** y el **Observer** avisa que está disponible otra vez.

---

## 10. La base de datos

| Tabla | Qué guarda | Se relaciona con |
|---|---|---|
| `Negocios` | Nombre, tipo y dirección | — |
| `Usuarios` | Nombre, correo, contraseña cifrada, tipo | `Negocios` (si es negocio) |
| `Publicaciones` | Producto, cantidad, kilos, precio, modalidad, estrategia, horario, estado | `Negocios` |
| `Reservas` | Quién reservó, cuándo, y si está activa, entregada o cancelada | `Publicaciones`, `Usuarios` |
| `RegistroDesperdicio` | Una fila por entrega, con los kilos evitados | `Publicaciones` |

**Relaciones:**
- Un negocio tiene muchas publicaciones.
- Una publicación puede tener varias reservas a lo largo del tiempo (por ejemplo, una cancelada y luego otra activa).
- Cada entrega genera una fila en el registro de desperdicio.

---

## 11. Preguntas que puede hacer la profe

### Sobre los patrones
- **¿Por qué Factory Method y no un `if` o `switch`?** Con un `if` hay que modificar la misma función cada vez que se agrega una modalidad. Con Factory Method se agrega una clase nueva y lo existente no se toca (principio abierto/cerrado).
- **¿Cuál es la diferencia entre Strategy y State?** En los dos un objeto delega en otro, pero en Strategy **quien usa el objeto elige** la estrategia y no cambia sola. En State **el objeto cambia de estado por sí mismo** según lo que pasa (reservar, entregar).
- **¿Por qué Observer y no llamar directamente a la campana?** Porque el que publica no tendría que conocer a todos los que deben enterarse. Con Observer se agregan o quitan avisos sin tocar el código que publica.
- **¿Qué pasa si quiero agregar notificaciones por correo?** Se crea un observador nuevo (o un adaptador para el servicio de correo) y se suscribe al centro. No se modifica nada más.
- **¿Qué diferencia hay entre Adapter y Facade?** Adapter hace compatible **una** interfaz con otra que el sistema espera. Facade da una interfaz simple para **un grupo** de clases complejas.
- **¿Dónde está el contexto en Strategy?** En `PublicacionDescuento`, que guarda la estrategia y le pide el porcentaje.
- **¿Las publicaciones que vienen de la base también usan Factory Method?** Sí: `crearDesdeFila` (en `almacen.ts`) usa la fábrica de la modalidad de cada fila.
- **¿Dónde se usa `desuscribir`?** En el interruptor "Enviar también por mensaje" de la campana.

### Sobre el diseño y el código
- **¿Por qué el estado se revisa en la página y también en el servidor?** La página usa State para no permitir acciones inválidas y responder rápido. El servidor lo vuelve a revisar (`TRANSICIONES`) para que nadie se lo salte modificando la página y para que dos personas no reserven lo mismo al mismo tiempo.
- **¿Cómo evitan que dos clientes reserven lo mismo?** El `UPDATE` solo cambia la publicación si todavía está "Disponible". Si otro cliente ya la reservó, no se cambia nada y el servidor responde que ya no está disponible.
- **¿Por qué TypeScript y no JavaScript directo?** TypeScript revisa los tipos antes de correr el programa y marca errores, por ejemplo si una clase no implementa todos los métodos de su interfaz. Luego se compila a JavaScript.
- **¿Qué hace `con_bd` en `app.py`?** Abre la conexión, se la pasa a la ruta y siempre la cierra aunque haya error; si algo falla, deshace los cambios. Así no se repite ese código en cada ruta.

### Sobre la base de datos
- **¿Por qué SQL Server?** Lo pidió la profe, y es un gestor robusto que se usa mucho en empresas.
- **¿Cómo se lleva el registro del desperdicio evitado?** Cada vez que un negocio marca una entrega, se guarda una fila en `RegistroDesperdicio` con los kilos. El contador suma esa tabla.
- **¿Qué pasa si SQL Server no está prendido?** La página abre con datos de ejemplo y avisa arriba con una etiqueta dorada ("Modo de ejemplo"); los cambios no se guardan.

### Sobre seguridad
- **¿Cómo guardan las contraseñas?** Cifradas con un hash (función de Werkzeug). Ni quien vea la base puede leerlas.
- **¿Dónde se revisan los permisos?** En el servidor (`revisar_permiso` y las rutas de `app.py`), no solo en la página.
- **¿Un negocio puede publicar a nombre de otro?** No: el negocio sale de la sesión, no del formulario.
- **¿Qué pasa si alguien escribe código HTML en el nombre de un producto?** La función `escapar` lo convierte en texto normal, así no se ejecuta en la página.

### Sobre mejoras
- **¿Qué le falta para usarse de verdad?** Subirlo a internet, conectar el servicio de mensajes a uno real (WhatsApp o correo), un mapa dentro de la página y reportes por negocio.
- **¿Qué cambiarías si lo hicieras otra vez?** Por ejemplo, avisar de alimentos nuevos al momento en lugar de revisar cada 10 segundos (con una tecnología llamada WebSockets).

---

## 11.1 Enseñar la base de datos en VS Code

La profe quiere ver SQL Server. Se enseña con la extensión **SQL Server (mssql)** de VS Code, que ya está instalada.

**Conectarse (solo la primera vez):**
1. En la barra izquierda de VS Code da clic en el ícono de **SQL Server** (un cilindro).
2. Clic en **Add Connection** (o el **+**).
3. Llena así:
   - **Server name:** `localhost\SQLEXPRESS`
   - **Authentication type:** Windows Authentication
   - **Database:** `Saruino`
   - **Trust server certificate:** sí (actívalo)
4. Clic en **Connect**. Aparece la conexión en el panel; ábrela y verás **Databases → Saruino → Tables** con las 5 tablas.

**Mostrar los datos:**
- Clic derecho sobre una tabla → **Select Top 1000** para ver sus filas.
- O abre `bd/consultas.sql`, selecciona una consulta y presiona **Ctrl+Shift+E** (o el botón **Run**). Trae 7 consultas listas: tablas, negocios, usuarios (con la contraseña cifrada), publicaciones con su negocio, reservas, entregas y kilos evitados por negocio.

**Para que la profe vea que la página y la base están conectadas:**
1. Con `py app.py` corriendo, publica o reserva algo en la página.
2. En VS Code vuelve a correr la consulta de publicaciones o reservas: ahí aparece el cambio.

**Qué decir:** "La página no guarda nada por sí sola: le manda los datos a Flask, Flask los guarda en SQL Server con `pyodbc`, y aquí en VS Code vemos que de verdad quedaron en la tabla."

---

## 12. Si algo falla durante la exposición

| Problema | Qué hacer |
|---|---|
| Arriba sale la etiqueta dorada "Sin conexión a SQL Server" | Corre `py pruebaBD.py` para ver el error. Si el servicio está apagado, búscalo en Windows como "Servicios" y arranca "SQL Server (SQLEXPRESS)" |
| `py app.py` dice que el puerto está ocupado | Ya hay otro servidor corriendo. Cierra la otra terminal o reinicia VS Code |
| No puedo entrar con un usuario | Corre `py crearBD.py` para regresar los usuarios de ejemplo |
| Cambié algo en `src/` y no se ve | Corre `npm run build` y recarga la página |
| `npm` no se puede cargar en la terminal | Usa `npm.cmd run build` |
| La página se ve sin estilos | Revisa que `py app.py` esté corriendo y abre `http://127.0.0.1:5000`, no el archivo directo |

---

## 13. Glosario

| Término | Qué significa |
|---|---|
| **API** | Las "puertas" del servidor por donde la página pide o manda datos |
| **Ruta (endpoint)** | Una de esas puertas, por ejemplo `/api/publicaciones` |
| **JSON** | El formato de texto en que viajan los datos entre la página y el servidor |
| **Petición GET / POST** | GET pide datos; POST manda datos para guardar o cambiar algo |
| **Sesión** | La forma en que el servidor recuerda quién inició sesión |
| **Hash** | Transformar la contraseña en un texto que no se puede regresar al original |
| **`render_template`** | Función de Flask que entrega la página desde `templates/` |
| **`url_for('static', ...)`** | Función de Flask que arma la ruta de un archivo de `static/` |
| **`fetch`** | Función del navegador para hacer peticiones al servidor |
| **Compilar** | Traducir TypeScript (`src/`) a JavaScript (`static/js/`) |
| **Interfaz** | Un "contrato": la lista de métodos que una clase promete tener |
| **Clase abstracta** | Una clase que no se usa directo, solo sirve de base para otras |

// Arma el documento Word del proyecto Saruino
const fs = require("fs");
const path = require("path");
const {
  AlignmentType, BorderStyle, Document, Footer, Header, HeadingLevel, HorizontalPositionRelativeFrom, ImageRun,
  LevelFormat, Packer, PageBreak, PageNumber, PageOrientation, Paragraph, ShadingType, Table, TableCell,
  TableOfContents, TableRow, TextRun, TextWrappingType, VerticalPositionRelativeFrom, WidthType,
} = require("docx");
const DIR_RECURSOS = __dirname;

const [, , DIR_DIAGRAMAS, SALIDA] = process.argv;
const VERDE = "8A5D17";
const ROJO = "A32A1F";
const NEGRO = "1A1612";
const DORADO_CLARO = "E8C37A";
const ANCHO_VERTICAL = 9360; // 6.5 pulgadas en DXA
const ANCHO_HORIZONTAL = 12960; // 9 pulgadas en DXA

// ---------- ayudas de texto ----------
function runs(texto, base = {}) {
  // **negrita** dentro del texto
  return texto.split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((parte) =>
    parte.startsWith("**") ? new TextRun({ ...base, text: parte.slice(2, -2), bold: true }) : new TextRun({ ...base, text: parte }));
}
const P = (texto, opciones = {}) => new Paragraph({ children: runs(texto), spacing: { after: 120 }, ...opciones });
const H1 = (texto) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(texto)] });
const H2 = (texto) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(texto)] });
const H3 = (texto) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(texto)] });
const viñeta = (texto, nivel = 0) => new Paragraph({ numbering: { reference: "vinetas", level: nivel }, children: runs(texto), spacing: { after: 60 } });
const numerado = (texto, ref = "numeros") => new Paragraph({ numbering: { reference: ref, level: 0 }, children: runs(texto), spacing: { after: 60 } });
const salto = () => new Paragraph({ children: [new PageBreak()] });
const codigo = (lineas) => lineas.map((l) => new Paragraph({
  children: [new TextRun({ text: l || " ", font: "Consolas", size: 18 })],
  spacing: { after: 0 }, shading: { type: ShadingType.CLEAR, fill: "F2F2F2", color: "auto" },
}));
const pendiente = (texto) => new TextRun({ text: texto, highlight: "yellow" });

// ---------- tablas ----------
const bordes = { style: BorderStyle.SINGLE, size: 4, color: "BBBBBB" };
function tabla(encabezados, filas, anchos, total = ANCHO_VERTICAL) {
  const escala = total / anchos.reduce((a, b) => a + b, 0);
  const w = anchos.map((a) => Math.floor(a * escala));
  w[w.length - 1] += total - w.reduce((a, b) => a + b, 0);
  const celda = (texto, i, cab) => new TableCell({
    width: { size: w[i], type: WidthType.DXA },
    borders: { top: bordes, bottom: bordes, left: bordes, right: bordes },
    shading: cab ? { type: ShadingType.CLEAR, fill: NEGRO, color: "auto" } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ children: runs(String(texto), cab ? { bold: true, color: DORADO_CLARO, size: 20 } : { size: 20 }) })],
  });
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: w,
    rows: [
      new TableRow({ tableHeader: true, children: encabezados.map((t, i) => celda(t, i, true)) }),
      ...filas.map((f) => new TableRow({ children: f.map((t, i) => celda(t, i, false)) })),
    ],
  });
}
const espacio = () => new Paragraph({ children: [], spacing: { after: 120 } });

// ---------- figuras ----------
let numFigura = 0;
function figura(archivo, pie, maxAnchoPx, maxAltoPx) {
  const ruta = path.join(DIR_DIAGRAMAS, archivo);
  const datos = fs.readFileSync(ruta);
  const ancho = datos.readUInt32BE(16);
  const alto = datos.readUInt32BE(20);
  const escala = Math.min(maxAnchoPx / ancho, maxAltoPx / alto, 1);
  numFigura += 1;
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { before: 120, after: 60 }, keepNext: true,
      children: [new ImageRun({ type: "png", data: datos, transformation: { width: Math.round(ancho * escala), height: Math.round(alto * escala) },
        altText: { title: pie, description: pie, name: archivo } })],
    }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 },
      children: [new TextRun({ text: `Figura ${numFigura}. ${pie}`, italics: true, size: 19, color: "555555" })] }),
  ];
}
const figVertical = (a, p) => figura(a, p, 624, 760);
const figHorizontal = (a, p) => figura(a, p, 864, 560);

// ---------- secciones (vertical / horizontal) ----------
const bloques = [];
let actual = [];
const agregar = (...hijos) => actual.push(...hijos.flat());
function horizontal(...hijos) {
  bloques.push({ orientacion: "v", hijos: actual });
  bloques.push({ orientacion: "h", hijos: hijos.flat() });
  actual = [];
}

// =====================================================================
// CONTENIDO
// =====================================================================

// ---------- 1. Introducción ----------
agregar(
  H1("1. Introducción"),
  P("Todos los días, restaurantes, cafeterías, panaderías y supermercados tiran alimentos que todavía están en buen estado solo porque no se vendieron. Al mismo tiempo, hay personas y organizaciones que podrían aprovecharlos."),
  P("**Saruino** es una aplicación web que conecta a esos dos grupos. Los negocios publican los alimentos que les sobraron, ya sea en venta, con descuento o como donación, e indican un horario de recolección. Los clientes los reservan y los recogen, y un administrador supervisa la plataforma. Cada entrega queda registrada como desperdicio de alimentos evitado."),
  P("El objetivo académico del proyecto es aplicar **cinco patrones de diseño** (Factory Method, Strategy, Observer, State y Adapter) en un sistema completo, con un front en TypeScript, un servidor en Python con Flask y una base de datos en SQL Server Express. Este documento describe el problema, el diseño de la solución, los diagramas, la justificación de cada patrón y las pruebas realizadas."),
);

// ---------- 2. Planteamiento del problema ----------
agregar(
  H1("2. Planteamiento del problema"),
  P("Los negocios de alimentos no tienen una forma sencilla de ofrecer lo que no vendieron antes de que se eche a perder. Los clientes que podrían recibirlo no se enteran a tiempo, y nadie lleva la cuenta de cuánta comida se rescata."),
  P("Por eso se necesita una plataforma que:"),
  viñeta("Permita publicar alimentos en distintas modalidades: venta, descuento o donación."),
  viñeta("Calcule el descuento según la disponibilidad y la caducidad del producto."),
  viñeta("Avise a los interesados cuando haya alimentos nuevos."),
  viñeta("Controle el ciclo de cada publicación: disponible, reservada y entregada."),
  viñeta("Se integre con servicios externos de notificaciones y mapas."),
  viñeta("Lleve el registro del desperdicio evitado."),
);

// ---------- 3. Objetivos ----------
agregar(
  H1("3. Objetivos"),
  H2("3.1 Objetivo general"),
  P("Desarrollar una aplicación web que conecte a negocios de alimentos con clientes para reducir el desperdicio de comida, aplicando patrones de diseño orientados a objetos."),
  H2("3.2 Objetivos específicos"),
  numerado("Implementar Factory Method para crear publicaciones de venta, descuento o donación."),
  numerado("Implementar Strategy para calcular descuentos por disponibilidad y por caducidad."),
  numerado("Implementar Observer para notificar cuando existan nuevos alimentos disponibles."),
  numerado("Implementar State para controlar publicaciones, reservas y entregas."),
  numerado("Implementar Adapter para integrar servicios externos de notificaciones y mapas."),
  numerado("Guardar la información en SQL Server Express mediante una API en Flask."),
  numerado("Manejar cuentas de usuario con tres roles (administrador, negocio y cliente), cada uno con sus propias opciones."),
);

// ---------- 4. Requerimientos ----------
agregar(
  H1("4. Requerimientos"),
  H2("4.1 Requerimientos funcionales"),
  tabla(["Clave", "Requerimiento", "Usuario"], [
    ["RF-01", "Crear una cuenta como negocio o cliente", "Visitante"],
    ["RF-02", "Iniciar y cerrar sesión", "Todos"],
    ["RF-03", "Ver los alimentos disponibles y filtrarlos por modalidad", "Todos"],
    ["RF-04", "Publicar un alimento en venta, con descuento o como donación", "Negocio"],
    ["RF-05", "Calcular el descuento por caducidad o por disponibilidad", "Sistema"],
    ["RF-06", "Indicar el horario de recolección de cada alimento", "Negocio"],
    ["RF-07", "Reservar un alimento disponible", "Cliente"],
    ["RF-08", "Cancelar una reserva", "Cliente, negocio dueño o administrador"],
    ["RF-09", "Marcar un alimento como entregado", "Negocio dueño"],
    ["RF-10", "Notificar cuando hay alimentos nuevos o que vuelven a estar disponibles", "Sistema"],
    ["RF-11", "Mostrar la ubicación del negocio en un mapa", "Todos"],
    ["RF-12", "Registrar y mostrar los kilos de desperdicio evitado", "Sistema"],
    ["RF-13", "Mostrar un panel con las publicaciones o reservas propias", "Negocio y cliente"],
    ["RF-14", "Ver todos los usuarios, publicaciones, reservas y kilos evitados por negocio", "Administrador"],
    ["RF-15", "Eliminar publicaciones que no se han entregado", "Administrador"],
  ], [12, 64, 24]),
  espacio(),
  H2("4.2 Requerimientos no funcionales"),
  tabla(["Clave", "Requerimiento"], [
    ["RNF-01", "La información se guarda en SQL Server Express."],
    ["RNF-02", "El proyecto sigue la estructura de Flask: app.py, templates (front) y static (estilos, scripts e imágenes)."],
    ["RNF-03", "Las contraseñas se guardan cifradas (hash), nunca en texto."],
    ["RNF-04", "Los permisos se revisan en el servidor, no solo en la página."],
    ["RNF-05", "Si la base de datos no está disponible, la página sigue abriendo con datos de ejemplo y lo avisa."],
    ["RNF-06", "El código está organizado por responsabilidades y comentado en español."],
  ], [14, 86]),
);

// ---------- 5. Arquitectura ----------
agregar(
  H1("5. Tecnologías y arquitectura"),
  H2("5.1 Tecnologías"),
  tabla(["Parte", "Tecnología", "Uso"], [
    ["Front", "HTML, CSS y TypeScript", "La página que ve el usuario y los cinco patrones de diseño"],
    ["Diseño", "Three.js, íconos Lucide, letras Cinzel y DM Sans", "Recursos externos solo para el diseño: fondo 3D, íconos y tipografía. No forman parte de los patrones"],
    ["Back", "Python 3 con Flask", "Rutas de la página, API, sesiones y permisos"],
    ["Base de datos", "SQL Server 2022 Express", "Guarda negocios, usuarios, publicaciones, reservas y entregas"],
    ["Conexión", "pyodbc y ODBC Driver 18", "Comunicación entre Flask y SQL Server"],
    ["Seguridad", "Werkzeug", "Cifrado (hash) de contraseñas"],
  ], [18, 30, 52]),
  espacio(),
  H2("5.2 Arquitectura"),
  P("El sistema tiene tres capas. El navegador muestra la página y aplica los patrones; cuando necesita guardar o leer datos, hace una petición HTTP a Flask. Flask revisa quién hace la petición y si tiene permiso, consulta SQL Server y responde en formato JSON. La figura 1 muestra esta arquitectura."),
);
horizontal(...figHorizontal("01_arquitectura.png", "Arquitectura del sistema: navegador, servidor Flask y SQL Server."));
agregar(
  H2("5.3 Estructura del proyecto"),
  P("El proyecto sigue la organización de Flask indicada en clase:"),
  ...codigo([
    "ProyectoFinal/",
    "├── app.py                  servidor Flask: rutas de la página y de la API",
    "├── templates/index.html    front (la página)",
    "├── static/css/             estilos",
    "├── static/js/              JavaScript que usa la página (sale de compilar src/)",
    "├── static/img/             imágenes",
    "├── src/                    código TypeScript",
    "│   ├── patrones/           un archivo por patrón (donde se definen)",
    "│   ├── secciones/          cada parte de la página (donde se usan)",
    "│   ├── modelos/            la clase Publicacion",
    "│   └── main.ts             arranque de la página",
    "├── bd/                     script de la base de datos en SQL Server",
    "├── conexion.py             conexión a SQL Server Express",
    "├── crearBD.py              crea la base con datos de ejemplo",
    "└── pruebaBD.py             prueba de conexión",
  ]),
  espacio(),
  P("El navegador solo entiende JavaScript, así que el código se escribe en TypeScript dentro de **src/** y se compila con **npm run build** a **static/js/**, que es lo que carga la página."),
  P("Dentro de **src/**, cada patrón se **define** en **src/patrones/** (cada archivo empieza con un comentario que explica el problema, el papel de cada clase y dónde se usa) y se **usa** en **src/secciones/**: publicar.ts (Factory Method y Strategy), notificaciones.ts (Observer y Adapter de mensajes), reservas.ts (State) y tarjetas.ts (precio con Strategy y mapa con Adapter). El archivo main.ts solo arranca la página y conecta los clics."),
);

// ---------- 6. Casos de uso ----------
agregar(
  H1("6. Diagrama de casos de uso"),
  P("Hay cuatro actores: el **visitante**, que todavía no inicia sesión; el **negocio**, que publica alimentos; el **cliente**, que los reserva; y el **administrador**, que supervisa la plataforma. Cada rol ve opciones distintas en la página. La figura 2 muestra qué puede hacer cada uno."),
);
horizontal(...figHorizontal("02_casos_de_uso.png", "Diagrama de casos de uso."));
agregar(
  tabla(["Actor", "Casos de uso"], [
    ["Visitante", "Ver alimentos disponibles, ver la ubicación en el mapa y crear una cuenta."],
    ["Negocio", "Iniciar sesión, publicar alimentos (incluye calcular el descuento), marcar entregas, cancelar reservas de sus alimentos y consultar su panel."],
    ["Cliente", "Iniciar sesión, reservar alimentos, recibir notificaciones, cancelar sus reservas y consultar su panel."],
    ["Administrador", "Iniciar sesión, ver el panel de administración (usuarios, publicaciones, reservas y kilos por negocio), eliminar publicaciones y cancelar cualquier reserva."],
  ], [20, 80]),
);

// ---------- 7. Diagrama de clases ----------
agregar(
  salto(),
  H1("7. Diagrama de clases"),
  P("La figura 3 es una vista general de las clases principales y de cómo se conectan los cinco patrones. En la sección 8 se muestra el diagrama detallado de cada patrón, con sus atributos y métodos."),
  ...figVertical("03_clases_general.png", "Vista general de las clases y los patrones."),
  P("Notación: el triángulo hueco con línea continua indica herencia; con línea punteada indica que una clase implementa una interfaz. La flecha abierta indica que una clase usa a otra, y «crea» indica que una clase crea objetos de otra."),
);

// ---------- 8. Patrones ----------
function patron({ titulo, problema, solucion, papeles, archivo, pie, justificacion, codigoEjemplo }) {
  agregar(
    salto(),
    H2(titulo),
    H3("Problema"), P(problema),
    H3("Solución"), P(solucion),
    ...figVertical(archivo, pie),
    H3("Participantes"),
    tabla(["Papel en el patrón", "Clase en el proyecto"], papeles, [40, 60]),
    espacio(),
    H3("Justificación"), P(justificacion),
  );
  if (codigoEjemplo) agregar(H3("Fragmento de código"), ...codigo(codigoEjemplo), espacio());
}

agregar(
  salto(),
  H1("8. Patrones de diseño aplicados"),
  P("Cada patrón está en su propio archivo dentro de **src/patrones/**. Para cada uno se explica el problema que resuelve, cómo se aplicó, qué papel juega cada clase y por qué se eligió."),
  tabla(["Patrón", "Tipo", "Archivo", "Para qué se usa"], [
    ["Factory Method", "Creacional", "factory.ts", "Crear publicaciones de venta, descuento o donación"],
    ["Strategy", "De comportamiento", "strategy.ts", "Calcular descuentos por caducidad o disponibilidad"],
    ["Observer", "De comportamiento", "observer.ts", "Notificar cuando hay alimentos nuevos"],
    ["State", "De comportamiento", "state.ts", "Controlar publicaciones, reservas y entregas"],
    ["Adapter", "Estructural", "adapter.ts", "Integrar servicios externos de mensajes y mapas"],
  ], [20, 20, 18, 42]),
);
patron({
  titulo: "8.1 Factory Method",
  problema: "Una publicación puede ser de venta, con descuento o una donación, y cada modalidad calcula su precio de forma distinta. Si el formulario creara las publicaciones con un if por modalidad, habría que modificar ese código cada vez que se agregue una modalidad nueva.",
  solucion: "La clase abstracta CreadorPublicacion define el proceso común en publicar(datos): primero valida los datos y luego llama al método fábrica crearPublicacion(datos). Cada subclase (CreadorVenta, CreadorDescuento y CreadorDonacion) decide qué tipo de publicación crea. El mismo mecanismo se usa al leer las publicaciones de la base de datos.",
  archivo: "04_factory_method.png",
  pie: "Patrón Factory Method: creadores y publicaciones.",
  papeles: [
    ["Creador", "CreadorPublicacion (abstracta)"],
    ["Creadores concretos", "CreadorVenta, CreadorDescuento, CreadorDonacion"],
    ["Producto", "Publicacion (abstracta)"],
    ["Productos concretos", "PublicacionVenta, PublicacionDescuento, PublicacionDonacion"],
    ["Método fábrica", "crearPublicacion(datos)"],
  ],
  justificacion: "El formulario no necesita conocer las clases concretas: le pide a la fábrica de la modalidad elegida que cree la publicación. Para agregar una modalidad nueva basta con crear otro creador y otro producto, sin modificar los existentes (principio abierto/cerrado). Además, la validación queda en un solo lugar.",
  codigoEjemplo: [
    "export abstract class CreadorPublicacion {",
    "  protected abstract crearPublicacion(datos: DatosPublicacion): Publicacion;",
    "",
    "  publicar(datos: DatosPublicacion): Publicacion {",
    "    this.validar(datos);",
    "    return this.crearPublicacion(datos);",
    "  }",
    "}",
  ],
});
patron({
  titulo: "8.2 Strategy",
  problema: "El descuento de un alimento puede calcularse con reglas distintas: según las horas que faltan para que caduque o según cuántas piezas quedan. Meter todas las reglas en la clase de la publicación la volvería difícil de mantener.",
  solucion: "La interfaz EstrategiaDescuento define calcularPorcentaje(cantidad, horas). Hay dos estrategias concretas: DescuentoPorCaducidad (50 % si faltan 3 horas o menos, 30 % hasta 8 horas y 15 % si falta más) y DescuentoPorDisponibilidad (40 % con 20 piezas o más, 25 % con 10 o más y 10 % con menos). PublicacionDescuento recibe una estrategia y solo le pide el porcentaje.",
  archivo: "05_strategy.png",
  pie: "Patrón Strategy: estrategias de descuento.",
  papeles: [
    ["Contexto", "PublicacionDescuento"],
    ["Estrategia", "EstrategiaDescuento (interfaz)"],
    ["Estrategias concretas", "DescuentoPorCaducidad, DescuentoPorDisponibilidad"],
  ],
  justificacion: "La regla de descuento es intercambiable: el negocio elige la estrategia al publicar, y la publicación no sabe cómo se calcula el porcentaje. Agregar una regla nueva (por ejemplo, por temporada) solo requiere otra clase que implemente la interfaz.",
  codigoEjemplo: [
    "export class DescuentoPorCaducidad implements EstrategiaDescuento {",
    "  readonly nombre = \"por caducidad\";",
    "  calcularPorcentaje(_cantidad: number, horasParaCaducar: number): number {",
    "    if (horasParaCaducar <= 3) return 50;",
    "    if (horasParaCaducar <= 8) return 30;",
    "    return 15;",
    "  }",
    "}",
  ],
});
patron({
  titulo: "8.3 Observer",
  problema: "Cuando un negocio publica un alimento, varias partes deben enterarse: el panel de notificaciones de la página y un servicio externo de mensajes. Si el código que publica llamara a cada una directamente, quedaría amarrado a todas.",
  solucion: "CentroNotificaciones guarda una lista de observadores y, al llamar a notificar(evento), ejecuta actualizar(evento) en cada uno. Los observadores son PanelNotificaciones (la campana de la página) y NotificadorMensajesAdapter (el servicio externo). La página revisa cada 10 segundos si otro negocio publicó algo y, si encuentra alimentos nuevos, los notifica con el centro. También se notifica al publicar y cuando una reserva se cancela. En la campana hay un interruptor que suscribe o desuscribe en vivo al servicio de mensajes, para mostrar que los observadores se agregan o se quitan sin tocar el código que publica.",
  archivo: "06_observer.png",
  pie: "Patrón Observer: centro de notificaciones y observadores.",
  papeles: [
    ["Sujeto", "CentroNotificaciones"],
    ["Observador", "Observador (interfaz)"],
    ["Observadores concretos", "PanelNotificaciones, NotificadorMensajesAdapter"],
    ["Evento", "EventoAlimento (título y detalle)"],
  ],
  justificacion: "El centro solo conoce la interfaz Observador, no los detalles de cada uno. Se pueden agregar o quitar avisos (por ejemplo, correo electrónico) sin modificar el código que publica ni el centro.",
  codigoEjemplo: [
    "notificar(evento: EventoAlimento): void {",
    "  for (const observador of this.observadores) {",
    "    observador.actualizar(evento);",
    "  }",
    "}",
  ],
});
patron({
  titulo: "8.4 State",
  problema: "Una publicación pasa por varios estados: disponible, reservada y entregada. Lo que se puede hacer depende del estado; por ejemplo, no se puede entregar algo que nadie reservó. Controlarlo con if regados por el código provoca errores.",
  solucion: "La interfaz EstadoPublicacion define reservar, entregar y cancelar. Cada estado concreto implementa esas acciones: si la acción es válida, cambia la publicación al siguiente estado; si no, lanza un error con el motivo. La publicación solo le pasa cada orden a su estado actual. La figura 11, en la sección 10, muestra el diagrama de estados.",
  archivo: "07_state_clases.png",
  pie: "Patrón State: la publicación y sus estados.",
  papeles: [
    ["Contexto", "Publicacion"],
    ["Estado", "EstadoPublicacion (interfaz)"],
    ["Estados concretos", "EstadoDisponible, EstadoReservada, EstadoEntregada"],
  ],
  justificacion: "Cada estado sabe qué acciones permite, así que no hay condicionales sobre el estado en el resto del código. El servidor vuelve a validar cada cambio para que nadie se salte las reglas modificando la página y para que dos clientes no reserven el mismo alimento al mismo tiempo.",
  codigoEjemplo: [
    "export class EstadoDisponible implements EstadoPublicacion {",
    "  readonly nombre = \"Disponible\";",
    "  reservar(publicacion: Publicacion): void {",
    "    publicacion.cambiarEstado(new EstadoReservada());",
    "  }",
    "  entregar(): void {",
    "    throw new Error(\"Primero hay que reservar la publicación.\");",
    "  }",
    "}",
  ],
});
patron({
  titulo: "8.5 Adapter",
  problema: "La plataforma usa servicios externos que tienen sus propios métodos y no se pueden modificar: Google Maps para la ubicación y un servicio de mensajes para los avisos. El sistema espera otra forma de llamarlos.",
  solucion: "MapaAdapter implementa la interfaz ServicioMapa (obtenerEnlace) y por dentro llama a construirUrlBusqueda de GoogleMapsExterno. NotificadorMensajesAdapter implementa la interfaz Observador (actualizar) y por dentro llama a enviarMensaje de ApiMensajeriaExterna; así el servicio externo funciona como un observador más. El servicio de mensajes está simulado en esta versión; el de mapas abre Google Maps.",
  archivo: "08_adapter.png",
  pie: "Patrón Adapter: mapas y mensajes.",
  papeles: [
    ["Target (interfaz que espera el sistema)", "ServicioMapa, Observador"],
    ["Adapter", "MapaAdapter, NotificadorMensajesAdapter"],
    ["Adaptee (servicio externo)", "GoogleMapsExterno, ApiMensajeriaExterna"],
  ],
  justificacion: "El resto del sistema no depende de los servicios externos. Si mañana se cambia de proveedor de mapas o se conecta un servicio real de WhatsApp o correo, solo se modifica el adaptador.",
});
agregar(
  H2("8.6 Relación con los principios SOLID"),
  tabla(["Principio", "Dónde se aplica"], [
    ["Responsabilidad única", "Cada estrategia solo calcula su descuento; conexion.py solo conecta a la base."],
    ["Abierto/cerrado", "Una modalidad nueva es un creador nuevo; una regla nueva es una estrategia nueva."],
    ["Sustitución de Liskov", "Cualquier Publicacion (venta, descuento o donación) se reserva y entrega igual."],
    ["Segregación de interfaces", "Observador solo exige actualizar(); ServicioMapa solo obtenerEnlace()."],
    ["Inversión de dependencias", "El centro de notificaciones depende de la interfaz Observador, no de clases concretas."],
  ], [30, 70]),
);

// ---------- 9. Secuencia ----------
agregar(
  salto(),
  H1("9. Diagramas de secuencia"),
  P("Los diagramas de secuencia muestran el orden de los mensajes entre las partes del sistema en las acciones principales."),
  H2("9.1 Publicar un alimento"),
  P("El negocio llena el formulario. La página le pide a la fábrica de la modalidad que valide y cree la publicación (Factory Method), la envía a Flask, que revisa que el usuario sea un negocio y la guarda en SQL Server. Al final, el centro de notificaciones avisa a los observadores (Observer)."),
);
horizontal(...figHorizontal("09_secuencia_publicar.png", "Secuencia para publicar un alimento."));
agregar(
  H2("9.2 Reservar y entregar"),
  P("El cliente reserva: la publicación cambia de estado con el patrón State, Flask revisa el permiso, actualiza el estado solo si sigue disponible y guarda la reserva. Después, el negocio que publicó marca la entrega: el estado cambia a Entregada y los kilos se guardan en el registro de desperdicio evitado."),
);
horizontal(...figHorizontal("10_secuencia_reservar_entregar.png", "Secuencia para reservar y entregar un alimento."));

// ---------- 10. Estados ----------
agregar(
  H1("10. Diagrama de estados"),
  P("Toda publicación nace en estado Disponible. Un cliente la puede reservar; después, el negocio la marca como entregada. Si la reserva se cancela, regresa a Disponible."),
  ...figVertical("11_estados.png", "Diagrama de estados de una publicación."),
  tabla(["Estado", "reservar()", "entregar()", "cancelar()"], [
    ["Disponible", "Pasa a Reservada", "Error: primero hay que reservar", "Error: no hay reserva"],
    ["Reservada", "Error: ya está reservada", "Pasa a Entregada", "Regresa a Disponible"],
    ["Entregada", "Error: ya se entregó", "Error: ya se entregó", "Error: entrega terminada"],
  ], [19, 27, 27, 27]),
);

// ---------- 11. Base de datos ----------
agregar(
  salto(),
  H1("11. Base de datos"),
  P("La base de datos se llama **Saruino** y está en SQL Server Express. Tiene cinco tablas. La figura 12 muestra el modelo entidad-relación."),
  ...figVertical("12_entidad_relacion.png", "Diagrama entidad-relación."),
  H2("11.1 Relaciones"),
  viñeta("Un negocio tiene muchas publicaciones."),
  viñeta("Un negocio puede tener cuentas de usuario ligadas a él; los clientes y el administrador no tienen negocio."),
  viñeta("Una publicación puede tener varias reservas a lo largo del tiempo (por ejemplo, una cancelada y otra activa)."),
  viñeta("Un cliente puede hacer muchas reservas."),
  viñeta("Cada entrega genera una fila en el registro de desperdicio evitado."),
  H2("11.2 Diccionario de datos"),
);
const diccionario = [
  ["Negocios", [
    ["NegocioID", "INT", "PK, autoincremental"], ["Nombre", "NVARCHAR(100)", "Único"],
    ["TipoNegocio", "NVARCHAR(30)", "Restaurante, Cafetería, Panadería o Supermercado"], ["Direccion", "NVARCHAR(200)", ""]]],
  ["Usuarios", [
    ["UsuarioID", "INT", "PK, autoincremental"], ["Nombre", "NVARCHAR(100)", ""], ["Correo", "NVARCHAR(120)", "Único"],
    ["ContrasenaHash", "NVARCHAR(300)", "Contraseña cifrada"], ["Tipo", "NVARCHAR(20)", "Administrador, Negocio o Cliente"],
    ["NegocioID", "INT", "FK a Negocios (solo negocios)"], ["FechaRegistro", "DATETIME2", "Fecha automática"]]],
  ["Publicaciones", [
    ["PublicacionID", "INT", "PK, autoincremental"], ["NegocioID", "INT", "FK a Negocios"], ["Producto", "NVARCHAR(120)", ""],
    ["Cantidad", "INT", "Mayor a 0"], ["Kilos", "DECIMAL(6,2)", "Mayor a 0"], ["PrecioOriginal", "DECIMAL(10,2)", "0 o más"],
    ["HorasParaCaducar", "INT", "Mayor a 0"], ["HorarioRecoleccion", "NVARCHAR(50)", ""],
    ["Modalidad", "NVARCHAR(20)", "Venta, Descuento o Donación"], ["Estrategia", "NVARCHAR(20)", "caducidad o disponibilidad (solo descuento)"],
    ["Estado", "NVARCHAR(20)", "Disponible, Reservada o Entregada"], ["FechaPublicacion", "DATETIME2", "Fecha automática"]]],
  ["Reservas", [
    ["ReservaID", "INT", "PK, autoincremental"], ["PublicacionID", "INT", "FK a Publicaciones"], ["UsuarioID", "INT", "FK a Usuarios"],
    ["Solicitante", "NVARCHAR(100)", "Nombre de quien reservó"], ["Estado", "NVARCHAR(20)", "Activa, Entregada o Cancelada"],
    ["FechaReserva", "DATETIME2", "Fecha automática"]]],
  ["RegistroDesperdicio", [
    ["RegistroID", "INT", "PK, autoincremental"], ["PublicacionID", "INT", "FK a Publicaciones"],
    ["KilosEvitados", "DECIMAL(6,2)", "Kilos de la publicación entregada"], ["FechaEntrega", "DATETIME2", "Fecha automática"]]],
];
for (const [nombre, columnas] of diccionario) {
  agregar(new Paragraph({ children: [new TextRun({ text: nombre, bold: true })], spacing: { before: 160, after: 80 }, keepNext: true }),
    tabla(["Campo", "Tipo", "Descripción"], columnas, [30, 22, 48]));
}

// ---------- 12. API ----------
agregar(
  salto(),
  H1("12. API del servidor"),
  P("La página se comunica con Flask mediante estas rutas. Todas responden en formato JSON."),
  tabla(["Método", "Ruta", "Quién puede", "Qué hace"], [
    ["GET", "/api/estado-bd", "Todos", "Revisa la conexión con SQL Server"],
    ["POST", "/api/registro", "Todos", "Crea una cuenta e inicia sesión"],
    ["POST", "/api/login", "Todos", "Inicia sesión"],
    ["POST", "/api/logout", "Todos", "Cierra sesión"],
    ["GET", "/api/sesion", "Todos", "Indica quién inició sesión"],
    ["GET", "/api/publicaciones", "Todos", "Lista las publicaciones"],
    ["POST", "/api/publicaciones", "Negocios", "Guarda una publicación a nombre del negocio"],
    ["POST", "/api/publicaciones/<id>/reservar", "Clientes", "Reserva un alimento"],
    ["POST", "/api/publicaciones/<id>/entregar", "Negocio dueño", "Marca la entrega y suma los kilos al registro"],
    ["POST", "/api/publicaciones/<id>/cancelar", "Negocio dueño, quien reservó o administrador", "Cancela la reserva"],
    ["GET", "/api/impacto", "Todos", "Total de kilos de desperdicio evitado"],
    ["GET", "/api/admin/resumen", "Administrador", "Usuarios por rol, publicaciones por estado y kilos por negocio"],
    ["GET", "/api/admin/usuarios", "Administrador", "Lista de usuarios, sin contraseñas"],
    ["DELETE", "/api/admin/publicaciones/<id>", "Administrador", "Elimina una publicación que no se ha entregado"],
  ], [11, 35, 22, 32]),
);

// ---------- 13. Seguridad ----------
agregar(
  H1("13. Seguridad y permisos"),
  viñeta("**Contraseñas cifradas:** se guardan con un hash de Werkzeug; ni quien tenga acceso a la base puede leerlas."),
  viñeta("**Permisos en el servidor:** solo los negocios publican, solo los clientes reservan, solo el negocio dueño marca la entrega, cancelan el negocio dueño, quien reservó o el administrador, y solo el administrador ve el panel de administración y elimina publicaciones. Nadie puede registrarse como administrador desde la página. Aunque alguien modifique la página, el servidor no lo permite."),
  viñeta("**El negocio sale de la sesión:** una publicación siempre se guarda a nombre del negocio que inició sesión, no del que se escriba en el formulario."),
  viñeta("**Consultas parametrizadas:** los datos del usuario se envían a SQL Server como parámetros, lo que evita la inyección de SQL."),
  viñeta("**Textos escapados:** lo que escribe el usuario se muestra como texto, así no se puede inyectar código HTML en la página."),
  viñeta("**Validación de datos:** el servidor revisa que cantidades, kilos, horas y precios tengan valores válidos antes de guardar."),
);

// ---------- 14. Pruebas ----------
agregar(
  salto(),
  H1("14. Pruebas realizadas"),
  P("Las pruebas se hicieron con SQL Server 2022 Express, primero llamando directamente a la API y después usando la página en el navegador."),
  tabla(["#", "Prueba", "Resultado esperado", "Resultado"], [
    ["1", "Ejecutar pruebaBD.py", "Mensaje CONEXIÓN CORRECTA", "Correcto"],
    ["2", "Ejecutar crearBD.py", "Base con 3 publicaciones y 4 usuarios de ejemplo", "Correcto"],
    ["3", "Iniciar sesión con contraseña incorrecta", "Rechazado: correo o contraseña incorrectos", "Correcto"],
    ["4", "Un cliente intenta publicar", "Rechazado: solo los negocios publican", "Correcto"],
    ["5", "Un negocio publica un alimento", "Se guarda a nombre de ese negocio", "Correcto"],
    ["6", "Un negocio o el administrador intentan reservar", "Rechazado: solo los clientes reservan", "Correcto"],
    ["7", "Un cliente reserva", "El estado cambia a Reservada", "Correcto"],
    ["8", "Reservar dos veces el mismo alimento", "Rechazado: ya no está disponible", "Correcto"],
    ["9", "Otro negocio intenta marcar la entrega", "Rechazado: solo el negocio que publicó", "Correcto"],
    ["10", "El cliente o el administrador cancelan la reserva", "El estado regresa a Disponible", "Correcto"],
    ["11", "El negocio dueño marca la entrega", "Estado Entregada y kilos sumados al registro", "Correcto"],
    ["12", "Crear cuenta con un correo repetido", "Rechazado: ya existe una cuenta", "Correcto"],
    ["13", "Crear cuenta con contraseña de menos de 8 caracteres", "Rechazado", "Correcto"],
    ["14", "Un negocio publica mientras un cliente tiene la página abierta", "Al cliente le llega el aviso en menos de 10 segundos", "Correcto"],
    ["15", "Abrir la página sin SQL Server", "Abre con datos de ejemplo, un aviso arriba y sin errores en consola", "Correcto"],
    ["16", "Cargar estilos, scripts e imágenes desde static/", "Los archivos se cargan sin errores", "Correcto"],
    ["17", "Entrar con cada rol (visitante, cliente, negocio y administrador)", "Cada rol ve solo sus opciones en la página", "Correcto"],
    ["18", "Un cliente intenta ver el panel de administración", "Rechazado: solo el administrador", "Correcto"],
    ["19", "El administrador elimina una publicación entregada", "Rechazado: es parte del registro de desperdicio", "Correcto"],
    ["20", "Crear una cuenta de administrador desde la página", "Rechazado: solo negocio o cliente", "Correcto"],
    ["21", "Apagar \"Enviar también por mensaje\" en la campana y publicar", "La campana avisa, pero el servicio de mensajes ya no (observador desuscrito)", "Correcto"],
    ["22", "Abrir la página en un celular", "Todo se acomoda en una columna, sin desplazamiento lateral", "Correcto"],
  ], [6, 36, 40, 18]),
);

// ---------- 15. Instalación ----------
agregar(
  H1("15. Instalación y uso"),
  H2("15.1 Requisitos"),
  viñeta("Windows con SQL Server Express (instancia SQLEXPRESS) y ODBC Driver 18 for SQL Server."),
  viñeta("Python 3 con Flask y pyodbc."),
  viñeta("Node.js (solo para compilar el TypeScript)."),
  H2("15.2 Pasos"),
  numerado("Instalar dependencias: npm install y py -m pip install -r requirements.txt", "pasos"),
  numerado("Crear la base de datos con datos de ejemplo: py crearBD.py", "pasos"),
  numerado("Compilar el TypeScript: npm run build", "pasos"),
  numerado("Iniciar el servidor: py app.py", "pasos"),
  numerado("Abrir http://127.0.0.1:5000 en el navegador.", "pasos"),
  H2("15.3 Usuarios de prueba"),
  P("Todos usan la contraseña **saruino123**."),
  tabla(["Correo", "Tipo", "Nombre"], [
    ["admin@saruino.test", "Administrador", "Administrador Saruino"],
    ["restaurante@saruino.test", "Negocio", "Restaurante Sazón Poblano"],
    ["trigal@saruino.test", "Negocio", "Panadería El Trigal"],
    ["espiga@saruino.test", "Negocio", "Panadería La Espiga"],
    ["cliente@saruino.test", "Cliente", "María López"],
  ], [40, 22, 38]),
);

// ---------- 16. Conclusiones ----------
agregar(
  salto(),
  H1("16. Conclusiones"),
  P("Se desarrolló una aplicación web funcional que conecta a negocios de alimentos con clientes, con un administrador que supervisa todo; guarda la información en SQL Server Express y lleva el registro del desperdicio evitado."),
  P("Los cinco patrones de diseño resolvieron problemas concretos del sistema: Factory Method evitó un condicional por modalidad al crear publicaciones; Strategy permitió cambiar la regla de descuento sin tocar las publicaciones; Observer desacopló a quien publica de quienes deben enterarse; State concentró en cada estado las reglas de reservas y entregas; y Adapter integró servicios externos sin depender de su forma."),
  P("El resultado es un sistema más fácil de mantener y de ampliar. Como trabajo futuro se propone conectar el servicio de mensajes a uno real (WhatsApp o correo), mostrar un mapa dentro de la página con los puntos de recolección, generar reportes de desperdicio evitado por negocio y por fecha, y publicar la aplicación en internet."),
  H1("17. Referencias"),
  P("Gamma, E., Helm, R., Johnson, R. y Vlissides, J. (1994). Design Patterns: Elements of Reusable Object-Oriented Software. Addison-Wesley."),
  P("Freeman, E. y Robson, E. (2020). Head First Design Patterns (2.ª ed.). O'Reilly Media."),
  P("Pallets Projects. (s. f.). Flask Documentation. https://flask.palletsprojects.com/"),
  P("Microsoft. (s. f.). Documentación de SQL Server. https://learn.microsoft.com/es-es/sql/sql-server/"),
  P("Microsoft. (s. f.). TypeScript Documentation. https://www.typescriptlang.org/docs/"),
);
bloques.push({ orientacion: "v", hijos: actual });

// =====================================================================
// PORTADA E ÍNDICE
// =====================================================================
const centrado = (texto, opciones = {}, espacioDespues = 120) => new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { after: espacioDespues }, children: [new TextRun({ text: texto, ...opciones })] });
// Portada con el diseño de Saruino: fondo negro con nubes, logo y textos en dorado
const CREMA = "F1E6D0";
const imagen = (archivo, tipo, ancho, alto, extra = {}) => new ImageRun({
  type: tipo, data: fs.readFileSync(path.join(DIR_RECURSOS, archivo)), transformation: { width: ancho, height: alto },
  altText: { title: archivo, description: archivo, name: archivo }, ...extra });
// La portada es una imagen a lo ancho de la hoja (portada.py) y abajo una franja negra
// con los datos que se pueden editar en Word (integrantes y profesora).
const sinBorde = { style: BorderStyle.NONE, size: 0, color: "auto" };
const lineaPortada = (hijos, despues = 100) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: despues }, children: hijos });
const portada = [
  new Paragraph({ spacing: { after: 0 }, children: [imagen("portada.jpg", "jpg", 816, 780)] }),
  new Table({
    width: { size: 12240, type: WidthType.DXA },
    columnWidths: [12240],
    borders: { top: sinBorde, bottom: sinBorde, left: sinBorde, right: sinBorde, insideHorizontal: sinBorde, insideVertical: sinBorde },
    rows: [new TableRow({
      height: { value: 3500, rule: "exact" },
      children: [new TableCell({
        width: { size: 12240, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, fill: "0B0907", color: "auto" },
        borders: { top: sinBorde, bottom: sinBorde, left: sinBorde, right: sinBorde },
        margins: { top: 300, bottom: 200, left: 400, right: 400 },
        children: [
          lineaPortada([new TextRun({ text: "Integrantes: ", bold: true, color: DORADO_CLARO, size: 24 }), new TextRun({ text: "Aldo Pazzi y Pablo Farid Montoro Araujo", color: CREMA, size: 24 })]),
          lineaPortada([new TextRun({ text: "Profesora: ", bold: true, color: DORADO_CLARO, size: 24 }), pendiente("[nombre de la profesora]")]),
          lineaPortada([new TextRun({ text: "Puebla, Puebla · Noviembre de 2026", color: CREMA, size: 22 })], 0),
        ],
      })],
    })],
  }),
];
const indice = [
  new Paragraph({ children: [new TextRun({ text: "Índice", bold: true, size: 32, color: VERDE })], spacing: { after: 200 } }),
  new TableOfContents("Índice", { hyperlink: true, headingStyleRange: "1-2" }),
  new Paragraph({ children: [new TextRun({ text: "Si el índice aparece vacío, da clic derecho sobre él y elige «Actualizar campos».", italics: true, size: 18, color: "777777" })], spacing: { before: 200 } }),
];

// =====================================================================
// DOCUMENTO
// =====================================================================
const encabezado = new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT,
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "CF9839", space: 4 } },
  children: [new TextRun({ text: "SARUINO", bold: true, size: 16, color: VERDE }),
    new TextRun({ text: "  ·  Proyecto final de Patrones Orientados a Objetos", size: 16, color: "777777" })] })] });
const pie = new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
  children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "777777" })] })] });
const margen = { top: 1440, right: 1440, bottom: 1440, left: 1440 };
const pagina = (horizontalP) => ({
  page: { size: { width: 12240, height: 15840, ...(horizontalP ? { orientation: PageOrientation.LANDSCAPE } : {}) }, margin: margen },
});

const titulo = (tam) => ({ run: { font: "Arial", size: tam, bold: true, color: VERDE } });
const doc = new Document({
  creator: "Equipo Saruino",
  title: "Saruino: plataforma para reducir el desperdicio de alimentos",
  features: { updateFields: true },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 }, paragraph: { spacing: { line: 276 } } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        ...titulo(32), paragraph: { spacing: { before: 240, after: 160 }, keepNext: true, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: "Arial", size: 26, bold: true, color: ROJO }, paragraph: { spacing: { before: 200, after: 120 }, keepNext: true, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: "Arial", size: 22, bold: true, color: "333333" }, paragraph: { spacing: { before: 160, after: 80 }, keepNext: true, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [
      { reference: "vinetas", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      ...["numeros", "pasos"].map((reference) => ({ reference, levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.",
        alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] })),
    ],
  },
  sections: [
    { properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 0, right: 0, bottom: 0, left: 0, header: 0, footer: 0 } } }, children: portada },
    { properties: pagina(false), headers: { default: encabezado }, footers: { default: pie }, children: indice },
    ...bloques.filter((b) => b.hijos.length).map((b) => ({
      properties: pagina(b.orientacion === "h"),
      headers: { default: encabezado }, footers: { default: pie },
      children: b.hijos,
    })),
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(SALIDA, buffer);
  console.log(`Documento creado: ${SALIDA} (${Math.round(buffer.length / 1024)} KB, ${numFigura} figuras)`);
}).catch((error) => {
  console.error("ERROR al crear el documento:", error);
  process.exit(1);
});

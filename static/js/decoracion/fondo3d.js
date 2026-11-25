// =====================================================================
// DECORACIÓN: brasas doradas flotando en 3D detrás de la página (Three.js)
//
// No es parte de los patrones: solo da ambiente con los colores del logo
// (dorado y un poco de rojo, como sus nubes). Three.js es una librería
// externa (licencia MIT) que dibuja en 3D usando la tarjeta de video (WebGL).
// Se guarda en static/vendor/ para que funcione sin internet.
//
// Si el navegador no puede usar 3D, o la persona pidió "reducir movimiento"
// en su sistema, la página sigue igual, solo sin este fondo.
// =====================================================================
import * as THREE from "three";
// Dorados del logo y un poco de rojo
const COLORES = ["#e8c37a", "#cf9839", "#f0d08c", "#e8c37a", "#b3271d"];
// Caja donde viven las brasas (en unidades de la escena 3D)
const ANCHO = 70;
const ALTO = 44;
const FONDO = 30;
// Si en los primeros 4 segundos va a menos de 20 cuadros por segundo, el fondo se apaga
const SEGUNDOS_DE_PRUEBA = 4;
const MINIMO_CUADROS_POR_SEGUNDO = 20;
// Dibuja un círculo difuminado que se usa como la forma de cada brasa
function crearTexturaBrillo() {
    const lienzo = document.createElement("canvas");
    lienzo.width = 64;
    lienzo.height = 64;
    const pincel = lienzo.getContext("2d");
    if (!pincel)
        throw new Error("El navegador no permite dibujar la textura del fondo 3D");
    const degradado = pincel.createRadialGradient(32, 32, 0, 32, 32, 32);
    degradado.addColorStop(0, "rgba(255,255,255,1)");
    degradado.addColorStop(0.25, "rgba(255,255,255,0.8)");
    degradado.addColorStop(1, "rgba(255,255,255,0)");
    pincel.fillStyle = degradado;
    pincel.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(lienzo);
}
function crearBrasas(total) {
    const posiciones = new Float32Array(total * 3);
    const colores = new Float32Array(total * 3);
    const velocidades = new Float32Array(total);
    const fases = new Float32Array(total);
    const color = new THREE.Color();
    for (let i = 0; i < total; i++) {
        posiciones[i * 3] = (Math.random() - 0.5) * ANCHO;
        posiciones[i * 3 + 1] = (Math.random() - 0.5) * ALTO;
        posiciones[i * 3 + 2] = (Math.random() - 0.7) * FONDO;
        color.set(COLORES[i % COLORES.length] ?? "#cf9839");
        colores.set([color.r, color.g, color.b], i * 3);
        velocidades[i] = 0.6 + Math.random() * 1.6; // unas suben más rápido que otras
        fases[i] = Math.random() * Math.PI * 2; // para que no se mezan todas igual
    }
    const geometria = new THREE.BufferGeometry();
    geometria.setAttribute("position", new THREE.BufferAttribute(posiciones, 3));
    geometria.setAttribute("color", new THREE.BufferAttribute(colores, 3));
    const material = new THREE.PointsMaterial({
        size: 0.55,
        map: crearTexturaBrillo(),
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
        blending: THREE.AdditiveBlending, // al encimarse brillan más, como fuego
        sizeAttenuation: true, // las lejanas se ven más chicas: da profundidad
    });
    return { puntos: new THREE.Points(geometria, material), velocidades, fases };
}
// Mueve cada brasa hacia arriba con un pequeño vaivén; al salir por arriba vuelve a entrar por abajo
function moverBrasas(brasas, segundos, tiempo) {
    const atributo = brasas.puntos.geometry.getAttribute("position");
    const posiciones = atributo.array;
    for (let i = 0; i < brasas.velocidades.length; i++) {
        const y = i * 3 + 1;
        posiciones[y] = (posiciones[y] ?? 0) + (brasas.velocidades[i] ?? 1) * segundos;
        posiciones[i * 3] = (posiciones[i * 3] ?? 0) + Math.sin(tiempo * 0.6 + (brasas.fases[i] ?? 0)) * 0.01;
        if ((posiciones[y] ?? 0) > ALTO / 2) {
            posiciones[y] = -ALTO / 2;
            posiciones[i * 3] = (Math.random() - 0.5) * ANCHO;
        }
    }
    atributo.needsUpdate = true;
}
export function iniciarFondo3D(contenedor) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        return;
    // Si no hay WebGL, esta línea lanza un error y main.ts deja la página sin fondo 3D
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    contenedor.append(renderer.domElement);
    const escena = new THREE.Scene();
    const camara = new THREE.PerspectiveCamera(60, 1, 1, 100);
    camara.position.z = 30;
    const brasas = crearBrasas(window.innerWidth < 720 ? 140 : 320);
    escena.add(brasas.puntos);
    const material = brasas.puntos.material;
    const ajustarTamano = () => {
        renderer.setSize(window.innerWidth, window.innerHeight, false);
        camara.aspect = window.innerWidth / window.innerHeight;
        camara.updateProjectionMatrix();
    };
    ajustarTamano();
    window.addEventListener("resize", ajustarTamano);
    // El ratón mueve un poco la cámara (efecto de profundidad)
    const raton = { x: 0, y: 0 };
    window.addEventListener("pointermove", (evento) => {
        raton.x = evento.clientX / window.innerWidth - 0.5;
        raton.y = evento.clientY / window.innerHeight - 0.5;
    });
    const reloj = new THREE.Clock();
    let animando = false;
    // Seguro: en los primeros segundos se mide la fluidez; si la compu no puede, se apaga el fondo
    const medicion = { cuadros: 0, segundos: 0, terminada: false };
    const apagar = (cuadrosPorSegundo) => {
        animando = false;
        contenedor.classList.remove("lista");
        console.warn(`Fondo 3D apagado: la compu va a ${cuadrosPorSegundo} cuadros por segundo`);
        setTimeout(() => {
            renderer.dispose();
            renderer.domElement.remove();
        }, 1300);
    };
    const revisarFluidez = (segundosReales) => {
        if (medicion.terminada)
            return;
        medicion.cuadros++;
        medicion.segundos += segundosReales;
        if (medicion.segundos < SEGUNDOS_DE_PRUEBA)
            return;
        medicion.terminada = true;
        const cuadrosPorSegundo = Math.round(medicion.cuadros / medicion.segundos);
        if (cuadrosPorSegundo < MINIMO_CUADROS_POR_SEGUNDO)
            apagar(cuadrosPorSegundo);
    };
    const cuadro = () => {
        if (!animando)
            return;
        const segundosReales = reloj.getDelta();
        revisarFluidez(segundosReales);
        if (!animando)
            return;
        const segundos = Math.min(segundosReales, 0.05); // evita saltos si la pestaña se pausó
        const tiempo = reloj.elapsedTime;
        moverBrasas(brasas, segundos, tiempo);
        material.opacity = 0.7 + Math.sin(tiempo * 1.3) * 0.1; // parpadeo suave
        camara.position.x += (raton.x * 3 - camara.position.x) * 0.03;
        camara.position.y += (-raton.y * 2 - window.scrollY * 0.004 - camara.position.y) * 0.05;
        camara.lookAt(0, -window.scrollY * 0.004, 0);
        renderer.render(escena, camara);
        requestAnimationFrame(cuadro);
    };
    // Solo se anima cuando la pestaña está a la vista (ahorra batería y procesador)
    const encender = () => {
        if (animando || document.hidden)
            return;
        animando = true;
        reloj.getDelta();
        requestAnimationFrame(cuadro);
    };
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            animando = false;
        }
        else {
            encender();
        }
    });
    encender();
    contenedor.classList.add("lista"); // el CSS lo hace aparecer suavemente
}
//# sourceMappingURL=fondo3d.js.map
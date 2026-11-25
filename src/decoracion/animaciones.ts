// =====================================================================
// DECORACIÓN: animaciones de la página. No es parte de los patrones.
//
// 1. Las secciones aparecen suavemente cuando bajas con el scroll.
//    Usa IntersectionObserver, una herramienta del navegador que AVISA cuando
//    un elemento entra a la pantalla (es la misma idea del patrón Observer:
//    el navegador nos notifica y nosotros reaccionamos).
// 2. Un brillo dorado sigue al ratón dentro de las tarjetas.
//
// Si la persona pidió "reducir movimiento" en su sistema, no se anima nada.
// =====================================================================

// Tarjetas y paneles que llevan el brillo que sigue al ratón
const CON_BRILLO = ".tarjeta, .tarjeta-admin, .seccion-publicar";

function revelarAlBajar(): void {
  const bloques = document.querySelectorAll<HTMLElement>("[data-revelar]");

  const observador = new IntersectionObserver((entradas) => {
    for (const entrada of entradas) {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("visible");
        observador.unobserve(entrada.target); // solo se anima la primera vez
      }
    }
  }, { threshold: 0.08 });

  bloques.forEach((bloque) => observador.observe(bloque));
  // Hasta aquí se ocultan: si algo falla antes, todo se queda visible
  document.documentElement.classList.add("animar");
}

function brilloQueSigueAlRaton(): void {
  // Un solo escuchador para toda la página, porque las tarjetas se vuelven a dibujar seguido
  document.addEventListener("pointermove", (evento) => {
    const tarjeta = (evento.target as HTMLElement).closest<HTMLElement>(CON_BRILLO);
    if (!tarjeta) return;
    const caja = tarjeta.getBoundingClientRect();
    tarjeta.style.setProperty("--brillo-x", `${evento.clientX - caja.left}px`);
    tarjeta.style.setProperty("--brillo-y", `${evento.clientY - caja.top}px`);
  });
}

export function iniciarAnimaciones(): void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if ("IntersectionObserver" in window) revelarAlBajar();
  brilloQueSigueAlRaton();
}

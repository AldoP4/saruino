// Funciones pequenas que usan varias partes de la pagina

export function obtener<T extends Element>(selector: string): T {
  const elemento = document.querySelector<T>(selector);
  if (!elemento) throw new Error(`No existe el elemento ${selector}`);
  return elemento;
}

// Evita que un texto escrito por el usuario se interprete como HTML
export function escapar(texto: string): string {
  return texto
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export const formatoMoneda = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

export function mensajeDeError(error: unknown, otro: string): string {
  return error instanceof Error ? error.message : otro;
}

export function mostrarAviso(mensaje: string, tipo: "ok" | "error" = "ok"): void {
  const aviso = document.createElement("div");
  aviso.className = `aviso aviso-${tipo}`;
  aviso.textContent = mensaje;
  obtener("#avisos").append(aviso);
  setTimeout(() => aviso.remove(), 3800);
}

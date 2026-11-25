// Sección "Panel de administración" (solo administrador): resumen, usuarios, kilos por negocio y todas las publicaciones
import { eliminarPublicacionAdmin, obtenerResumenAdmin, obtenerUsuariosAdmin } from "../api.js";
import type { Publicacion } from "../modelos/publicacion.js";
import { escapar, mensajeDeError, mostrarAviso, obtener } from "../utilidades.js";

const sumar = (valores: Record<string, number>): number => Object.values(valores).reduce((a, b) => a + b, 0);

function tarjeta(titulo: string, numero: string, detalle: string): string {
  return `<div class="tarjeta-admin">
    <span class="impacto-etiqueta">${titulo}</span>
    <strong>${numero}</strong>
    <span>${detalle}</span>
  </div>`;
}

function filaPublicacion(p: Publicacion): string {
  // Las entregadas no se borran porque forman parte del registro de desperdicio
  const boton = p.nombreEstado === "Entregada"
    ? `<span class="vacio">—</span>`
    : `<button class="button button-secondary boton-chico" data-admin-eliminar="${p.id}">Eliminar</button>`;
  return `<tr>
    <td>${escapar(p.datos.producto)}</td>
    <td>${escapar(p.datos.negocio)}</td>
    <td>${p.modalidad}</td>
    <td><span class="estado estado-${p.nombreEstado.toLowerCase()}">${p.nombreEstado}</span></td>
    <td>${boton}</td>
  </tr>`;
}

export async function renderAdmin(publicaciones: Publicacion[]): Promise<void> {
  try {
    const [resumen, usuarios] = await Promise.all([obtenerResumenAdmin(), obtenerUsuariosAdmin()]);
    const u = resumen.usuarios;
    const p = resumen.publicaciones;
    const kilos = resumen.negocios.reduce((total, n) => total + n.kilos, 0);

    obtener("#tarjetas-admin").innerHTML = [
      tarjeta("Usuarios", String(sumar(u)), `${u["Administrador"] ?? 0} admin · ${u["Negocio"] ?? 0} negocios · ${u["Cliente"] ?? 0} clientes`),
      tarjeta("Publicaciones", String(sumar(p)), `${p["Disponible"] ?? 0} disponibles · ${p["Reservada"] ?? 0} reservadas · ${p["Entregada"] ?? 0} entregadas`),
      tarjeta("Desperdicio evitado", `${kilos.toFixed(1)} kg`, "suma de todas las entregas"),
    ].join("");

    obtener("#tabla-negocios").innerHTML = resumen.negocios.map((n) =>
      `<tr><td>${escapar(n.nombre)}</td><td>${n.publicaciones}</td><td>${n.kilos.toFixed(1)} kg</td></tr>`).join("");

    obtener("#tabla-usuarios").innerHTML = usuarios.map((us) =>
      `<tr><td>${escapar(us.nombre)}</td><td>${escapar(us.correo)}</td><td><span class="rol rol-${us.tipo.toLowerCase()}">${us.tipo}</span></td></tr>`).join("");

    obtener("#tabla-publicaciones-admin").innerHTML = publicaciones.map(filaPublicacion).join("")
      || `<tr><td colspan="5" class="vacio">No hay publicaciones.</td></tr>`;
  } catch (error) {
    mostrarAviso(mensajeDeError(error, "No se pudo cargar el panel de administración."), "error");
  }
}

// Regresa true si se elimino, para que la pagina vuelva a cargar los datos
export async function eliminarPublicacion(id: number, producto: string): Promise<boolean> {
  if (!window.confirm(`¿Eliminar la publicación "${producto}"? Esta acción no se puede deshacer.`)) {
    return false;
  }
  try {
    await eliminarPublicacionAdmin(id);
    mostrarAviso(`Publicación eliminada: ${producto}`);
    return true;
  } catch (error) {
    mostrarAviso(mensajeDeError(error, "No se pudo eliminar."), "error");
    return false;
  }
}

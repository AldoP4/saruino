// Llamadas a la API de Flask (app.py), que guarda todo en SQL Server Express
import type { Modalidad } from "./modelos/publicacion.js";
import type { NombreEstado } from "./patrones/state.js";

export interface FilaPublicacion {
  id: number;
  negocioId: number;
  negocio: string;
  tipoNegocio: string;
  direccion: string;
  producto: string;
  cantidad: number;
  kilos: number;
  precioOriginal: number;
  horasParaCaducar: number;
  horarioRecoleccion: string;
  modalidad: Modalidad;
  estrategia: string | null;
  estado: NombreEstado;
  solicitante: string | null;
  reservaUsuarioId: number | null;
}

// Los 3 roles: Administrador (supervisa), Negocio (publica) y Cliente (reserva)
export type TipoUsuario = "Administrador" | "Negocio" | "Cliente";

export interface Usuario {
  id: number;
  nombre: string;
  tipo: TipoUsuario;
  negocioId: number | null;
  negocio: { nombre: string; tipoNegocio: string; direccion: string } | null;
}

export interface DatosRegistro {
  tipo: TipoUsuario;
  nombre: string;
  correo: string;
  contrasena: string;
  tipoNegocio?: string;
  direccion?: string;
}

// El negocio sale de la sesion, por eso no se manda en la publicacion
export interface NuevaPublicacion {
  producto: string;
  cantidad: number;
  kilos: number;
  precioOriginal: number;
  horasParaCaducar: number;
  horarioRecoleccion: string;
  modalidad: Modalidad;
  estrategia: string | null;
}

export type AccionEstado = "reservar" | "entregar" | "cancelar";

async function pedir<T>(url: string, opciones?: RequestInit): Promise<T> {
  const respuesta = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    ...opciones,
  });
  const cuerpo: unknown = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    const mensaje = (cuerpo as { error?: string } | null)?.error;
    throw new Error(mensaje ?? `Error ${respuesta.status} del servidor`);
  }
  return cuerpo as T;
}

function enviar<T>(url: string, datos: unknown = {}): Promise<T> {
  return pedir(url, { method: "POST", body: JSON.stringify(datos) });
}

export async function obtenerEstadoBD(): Promise<{ conectada: boolean; baseDatos?: string }> {
  try {
    return await pedir("/api/estado-bd");
  } catch {
    return { conectada: false };
  }
}

// ---------- Cuentas ----------

export function obtenerSesion(): Promise<{ usuario: Usuario | null }> {
  return pedir("/api/sesion");
}

export function iniciarSesion(correo: string, contrasena: string): Promise<{ usuario: Usuario }> {
  return enviar("/api/login", { correo, contrasena });
}

export function registrarUsuario(datos: DatosRegistro): Promise<{ usuario: Usuario }> {
  return enviar("/api/registro", datos);
}

export function cerrarSesion(): Promise<{ usuario: null }> {
  return enviar("/api/logout");
}

// ---------- Publicaciones ----------

export function obtenerPublicaciones(): Promise<FilaPublicacion[]> {
  return pedir("/api/publicaciones");
}

export function crearPublicacionEnBD(datos: NuevaPublicacion): Promise<FilaPublicacion> {
  return enviar("/api/publicaciones", datos);
}

export function cambiarEstadoEnBD(id: number, accion: AccionEstado): Promise<FilaPublicacion> {
  return enviar(`/api/publicaciones/${id}/${accion}`);
}

export function obtenerImpacto(): Promise<{ kilosEvitados: number; entregas: number }> {
  return pedir("/api/impacto");
}

// ---------- Administrador ----------

export interface ResumenAdmin {
  usuarios: Record<string, number>;
  publicaciones: Record<string, number>;
  negocios: { nombre: string; publicaciones: number; kilos: number }[];
}

export interface UsuarioAdmin {
  id: number;
  nombre: string;
  correo: string;
  tipo: TipoUsuario;
  negocio: string | null;
  fechaRegistro: string;
}

export function obtenerResumenAdmin(): Promise<ResumenAdmin> {
  return pedir("/api/admin/resumen");
}

export function obtenerUsuariosAdmin(): Promise<UsuarioAdmin[]> {
  return pedir("/api/admin/usuarios");
}

export function eliminarPublicacionAdmin(id: number): Promise<{ eliminada: number }> {
  return pedir(`/api/admin/publicaciones/${id}`, { method: "DELETE" });
}

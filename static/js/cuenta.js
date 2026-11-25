// Cuentas: guarda quien inicio sesion y maneja los formularios de entrar, crear cuenta y salir
import { cerrarSesion, iniciarSesion, obtenerSesion, registrarUsuario, } from "./api.js";
import { mensajeDeError, mostrarAviso, obtener } from "./utilidades.js";
let usuarioActual = null;
export function usuario() {
    return usuarioActual;
}
export async function cargarSesion() {
    try {
        usuarioActual = (await obtenerSesion()).usuario;
    }
    catch {
        usuarioActual = null;
    }
}
function valor(formulario, campo) {
    return String(new FormData(formulario).get(campo) ?? "").trim();
}
function mostrarCamposNegocio(formulario) {
    const esNegocio = valor(formulario, "tipo") === "Negocio";
    obtener("#campo-tipo-negocio").hidden = !esNegocio;
    obtener("#campo-direccion").hidden = !esNegocio;
}
// alCambiar se llama cada vez que alguien entra o sale, para volver a pintar la pagina
export function iniciarFormulariosCuenta(alCambiar) {
    const login = obtener("#form-login");
    const registro = obtener("#form-registro");
    login.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        try {
            usuarioActual = (await iniciarSesion(valor(login, "correo"), String(new FormData(login).get("contrasena") ?? ""))).usuario;
            login.reset();
            mostrarAviso(`Bienvenido, ${usuarioActual.nombre}`);
            alCambiar();
        }
        catch (error) {
            mostrarAviso(mensajeDeError(error, "No se pudo iniciar sesión."), "error");
        }
    });
    registro.addEventListener("change", () => mostrarCamposNegocio(registro));
    registro.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        const tipo = valor(registro, "tipo");
        const datos = {
            tipo,
            nombre: valor(registro, "nombre"),
            correo: valor(registro, "correo"),
            contrasena: String(new FormData(registro).get("contrasena") ?? ""),
            ...(tipo === "Negocio" ? { tipoNegocio: valor(registro, "tipoNegocio"), direccion: valor(registro, "direccion") } : {}),
        };
        try {
            usuarioActual = (await registrarUsuario(datos)).usuario;
            registro.reset();
            mostrarCamposNegocio(registro);
            mostrarAviso(`Cuenta creada. Bienvenido, ${usuarioActual.nombre}`);
            alCambiar();
        }
        catch (error) {
            mostrarAviso(mensajeDeError(error, "No se pudo crear la cuenta."), "error");
        }
    });
    obtener("#boton-salir").addEventListener("click", async () => {
        try {
            await cerrarSesion();
        }
        catch (error) {
            mostrarAviso(mensajeDeError(error, "No se pudo cerrar la sesión."), "error");
            return;
        }
        usuarioActual = null;
        mostrarAviso("Cerraste sesión");
        alCambiar();
    });
    mostrarCamposNegocio(registro);
}
//# sourceMappingURL=cuenta.js.map
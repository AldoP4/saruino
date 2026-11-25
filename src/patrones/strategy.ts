// =====================================================================
// PATRÓN STRATEGY (de comportamiento)
//
// Problema del negocio: el descuento no siempre se calcula igual. A veces
//   conviene bajar el precio porque la comida está por caducar y otras porque
//   sobró mucha. Queremos cambiar o agregar reglas sin tocar la publicación.
//
// Papeles:
//   Estrategia ............. EstrategiaDescuento (interfaz: calcularPorcentaje)
//   Estrategias concretas .. DescuentoPorCaducidad, DescuentoPorDisponibilidad
//   Contexto ............... PublicacionDescuento (modelos/publicacion.ts):
//                            guarda la estrategia y solo le pide el porcentaje
//
// Dónde se usa en la página:
//   - Formulario de publicar → "Calcular descuento" y la vista previa del precio
//   - Tarjetas de alimentos → la etiqueta "-30 % por caducidad"
// =====================================================================

export interface EstrategiaDescuento {
  readonly nombre: string;
  calcularPorcentaje(cantidad: number, horasParaCaducar: number): number;
}

// Mientras menos horas falten para caducar, mayor descuento
export class DescuentoPorCaducidad implements EstrategiaDescuento {
  readonly nombre = "por caducidad";

  calcularPorcentaje(_cantidad: number, horasParaCaducar: number): number {
    if (horasParaCaducar <= 3) return 50;
    if (horasParaCaducar <= 8) return 30;
    return 15;
  }
}

// Mientras más producto quede disponible, mayor descuento
export class DescuentoPorDisponibilidad implements EstrategiaDescuento {
  readonly nombre = "por disponibilidad";

  calcularPorcentaje(cantidad: number, _horasParaCaducar: number): number {
    if (cantidad >= 20) return 40;
    if (cantidad >= 10) return 25;
    return 10;
  }
}

// La clave es la que se guarda en SQL Server (columna Estrategia) y la del <select>
const ESTRATEGIAS: Record<string, EstrategiaDescuento> = {
  caducidad: new DescuentoPorCaducidad(),
  disponibilidad: new DescuentoPorDisponibilidad(),
};

export function estrategiaPorClave(clave: string | null): EstrategiaDescuento {
  return ESTRATEGIAS[clave ?? ""] ?? ESTRATEGIAS.caducidad;
}

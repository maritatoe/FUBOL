import { Database } from '../types/database.types'

type Jugador = Database['public']['Tables']['jugadores']['Row']

export interface JugadorAsignado extends Jugador {
  posicion_asignada: string
}

export interface EquipoArmado {
  nombre: 'A' | 'B'
  jugadores: JugadorAsignado[]
  totalRating: number
}

const ORDEN_PRIORIDAD = ['ARQ', 'DEF', 'MED', 'DEL']

export function armarEquiposInteligente(
  jugadoresSeleccionados: Jugador[],
  formacionStr: string,
  variacion: boolean = false
): { equipoA: EquipoArmado, equipoB: EquipoArmado, diferencia: number } {

  if (jugadoresSeleccionados.length < 2) {
    throw new Error('Se necesitan al menos 2 jugadores para armar equipos.')
  }

  if (jugadoresSeleccionados.length % 2 !== 0) {
    throw new Error('La cantidad de jugadores seleccionados debe ser par para que los equipos tengan la misma cantidad de personas.')
  }

  const jugadoresPorEquipo = jugadoresSeleccionados.length / 2;

  // PASO 1 - Preparar y ordenar
  let jugadoresDisponibles = [...jugadoresSeleccionados].sort((a, b) => b.rating - a.rating)

  if (variacion) {
    // Pequeño shuffle controlado en el rating para variar equipos si se pide
    jugadoresDisponibles = jugadoresDisponibles.map(j => ({
      ...j, random: j.rating + (Math.random() * 1.5 - 0.75)
    })).sort((a, b) => b.random - a.random).map(j => {
      const { random, ...rest } = j;
      return rest as Jugador;
    })
  }

  const equipoA: JugadorAsignado[] = []
  const equipoB: JugadorAsignado[] = []

  // Calcular ratings acumulados actuales
  const sumA = () => equipoA.reduce((s, j) => s + j.rating, 0)
  const sumB = () => equipoB.reduce((s, j) => s + j.rating, 0)

  // Asigna al equipo con menor rating total que aún tenga cupo
  const asignar = (jugador: JugadorAsignado) => {
    if (equipoA.length < jugadoresPorEquipo && equipoB.length < jugadoresPorEquipo) {
      if (sumA() <= sumB()) {
        equipoA.push(jugador)
      } else {
        equipoB.push(jugador)
      }
    } else if (equipoA.length < jugadoresPorEquipo) {
      equipoA.push(jugador)
    } else {
      equipoB.push(jugador)
    }
  }

  // PASO 2 - Distribuir por posición prioritaria para asegurar que queden repartidos (Ej: arqueros)
  for (const pos of ORDEN_PRIORIDAD) {
    while (true) {
      const candidatoIdx = jugadoresDisponibles.findIndex(j => j.posiciones.includes(pos))
      if (candidatoIdx !== -1) {
        const selected = jugadoresDisponibles.splice(candidatoIdx, 1)[0]
        asignar({ ...selected, posicion_asignada: pos })
      } else {
        break // Ya no hay más jugadores que jueguen en esta posición
      }
    }
  }

  // PASO 3 - Cualquier jugador sobrante (no debería ocurrir porque todos tienen al menos 1 posición)
  while (jugadoresDisponibles.length > 0) {
    const selected = jugadoresDisponibles.shift()!
    const posOriginal = selected.posiciones[0] || 'MED'
    asignar({ ...selected, posicion_asignada: posOriginal })
  }

  // PASO 4 - Swap para equilibrar ratings lo máximo posible
  // Si se pide variación, somos menos estrictos para no deshacer la mezcla aleatoria.
  let finalDiferencia = Math.abs(sumA() - sumB())
  let swappeado = true

  const umbralTolerancia = variacion ? 2.5 : 0.3;

  while (swappeado && finalDiferencia > umbralTolerancia) {
    swappeado = false
    for (let i = 0; i < equipoA.length; i++) {
      for (let j = 0; j < equipoB.length; j++) {

        // REGLA CLAVE: Nunca intercambiar un Arquero (ARQ) por un jugador de campo.
        // Si uno es ARQ, el otro debe ser ARQ también para poder swappear.
        const esArqA = equipoA[i].posicion_asignada === 'ARQ';
        const esArqB = equipoB[j].posicion_asignada === 'ARQ';
        if ((esArqA || esArqB) && equipoA[i].posicion_asignada !== equipoB[j].posicion_asignada) {
          continue; // Salteamos este swap porque desbalancearía los arqueros
        }

        const nuevoTotalA = sumA() - equipoA[i].rating + equipoB[j].rating
        const nuevoTotalB = sumB() - equipoB[j].rating + equipoA[i].rating
        const nuevaDiff = Math.abs(nuevoTotalA - nuevoTotalB)

        // Solo swappeamos si mejora, y si estamos buscando variación, solo si mejora MUCHO (para no deshacer el random)
        if (nuevaDiff < finalDiferencia && (!variacion || (finalDiferencia - nuevaDiff) > 1.0)) {
          // Swap para tener menor diferencia de nivel
          const temp = equipoA[i]
          equipoA[i] = equipoB[j]
          equipoB[j] = temp
          finalDiferencia = nuevaDiff
          swappeado = true
          break // Rompemos para re-calcular todo
        }
      }
      if (swappeado) break
    }
  }

  return {
    equipoA: { nombre: 'A', jugadores: equipoA, totalRating: Number(sumA().toFixed(2)) },
    equipoB: { nombre: 'B', jugadores: equipoB, totalRating: Number(sumB().toFixed(2)) },
    diferencia: Number(finalDiferencia.toFixed(2))
  }
}

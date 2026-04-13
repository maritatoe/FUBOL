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
    throw new Error('La cantidad de jugadores debe ser par.')
  }

  const jugadoresPorEquipo = jugadoresSeleccionados.length / 2

  // PASO 1 - Ordenar
  let jugadoresDisponibles = [...jugadoresSeleccionados]
    .sort((a, b) => b.rating - a.rating)

  if (variacion) {
    jugadoresDisponibles = jugadoresDisponibles
      .map(j => ({
        ...j,
        random: j.rating + (Math.random() * 1.5 - 0.75)
      }))
      .sort((a, b) => b.random - a.random)
      .map(j => {
        const { random, ...rest } = j
        return rest as Jugador
      })
  }

  const equipoA: JugadorAsignado[] = []
  const equipoB: JugadorAsignado[] = []

  const sumA = () => equipoA.reduce((s, j) => s + j.rating, 0)
  const sumB = () => equipoB.reduce((s, j) => s + j.rating, 0)

  // ✅ FIX: sin duplicaciones
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

  // PASO 2 - Prioridad por posición
  for (const pos of ORDEN_PRIORIDAD) {
    while (true) {
      const idx = jugadoresDisponibles.findIndex(j =>
        j.posiciones?.includes(pos)
      )

      if (idx === -1) break

      const selected = jugadoresDisponibles.splice(idx, 1)[0]

      asignar({
        ...selected,
        posicion_asignada: pos
      })
    }
  }

  // PASO 3 - Fallback
  while (jugadoresDisponibles.length > 0) {
    const selected = jugadoresDisponibles.shift()!

    asignar({
      ...selected,
      posicion_asignada: selected.posiciones?.[0] || 'MED'
    })
  }

  // PASO 4 - Balanceo fino
  let diferencia = Math.abs(sumA() - sumB())
  let cambio = true

  const tolerancia = variacion ? 2.5 : 0.3

  while (cambio && diferencia > tolerancia) {
    cambio = false

    for (let i = 0; i < equipoA.length; i++) {
      for (let j = 0; j < equipoB.length; j++) {

        const esArqA = equipoA[i].posicion_asignada === 'ARQ'
        const esArqB = equipoB[j].posicion_asignada === 'ARQ'

        if ((esArqA || esArqB) && equipoA[i].posicion_asignada !== equipoB[j].posicion_asignada) {
          continue
        }

        const nuevoA = sumA() - equipoA[i].rating + equipoB[j].rating
        const nuevoB = sumB() - equipoB[j].rating + equipoA[i].rating
        const nuevaDiff = Math.abs(nuevoA - nuevoB)

        if (nuevaDiff < diferencia && (!variacion || (diferencia - nuevaDiff) > 1)) {
          const temp = equipoA[i]
          equipoA[i] = equipoB[j]
          equipoB[j] = temp

          diferencia = nuevaDiff
          cambio = true
          break
        }
      }
      if (cambio) break
    }
  }

  return {
    equipoA: {
      nombre: 'A',
      jugadores: equipoA,
      totalRating: Number(sumA().toFixed(2))
    },
    equipoB: {
      nombre: 'B',
      jugadores: equipoB,
      totalRating: Number(sumB().toFixed(2))
    },
    diferencia: Number(diferencia.toFixed(2))
  }
}

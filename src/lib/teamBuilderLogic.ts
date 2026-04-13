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

interface RequisitosFormacion {
  ARQ: number
  DEF: number
  MED: number
  DEL: number
}

const FORMACIONES: Record<string, RequisitosFormacion> = {
  '5v5': { ARQ: 1, DEF: 1, MED: 2, DEL: 1 },
  '7v7': { ARQ: 1, DEF: 2, MED: 2, DEL: 2 },
  '11v11': { ARQ: 1, DEF: 4, MED: 3, DEL: 3 }
}

const ORDEN_PRIORIDAD = ['ARQ', 'DEF', 'MED', 'DEL']

export function armarEquiposInteligente(
  jugadoresSeleccionados: Jugador[],
  formacionStr: string,
  variacion: boolean = false
): { equipoA: EquipoArmado, equipoB: EquipoArmado, diferencia: number } {
  
  const formacion = FORMACIONES[formacionStr]
  if (!formacion) throw new Error('Formación no válida')
  
  const totalNecesarios = (formacion.ARQ + formacion.DEF + formacion.MED + formacion.DEL) * 2
  if (jugadoresSeleccionados.length < totalNecesarios) {
    throw new Error(`Se necesitan ${totalNecesarios} jugadores para una formación ${formacionStr}`)
  }

  // PASO 1 - Preparar y ordenar
  let jugadoresDisponibles = [...jugadoresSeleccionados].sort((a, b) => b.rating - a.rating)
  
  if (variacion) {
    // Pequeño shuffle controlado en el rating para variar equipos si se pide
    jugadoresDisponibles = jugadoresDisponibles.map(j => ({
      jugador: j, random: j.rating + (Math.random() * 1.5 - 0.75)
    })).sort((a, b) => b.random - a.random).map(j => j.jugador)
  }

  const equipoA: JugadorAsignado[] = []
  const equipoB: JugadorAsignado[] = []

  // Calcular ratings acumulados actuales
  const sumA = () => equipoA.reduce((s, j) => s + j.rating, 0)
  const sumB = () => equipoB.reduce((s, j) => s + j.rating, 0)

  // Asigna al equipo con menor rating total
  const asignar = (jugador: JugadorAsignado) => {
    if (sumA() <= sumB() && equipoA.length < totalNecesarios / 2) {
      equipoA.push(jugador)
    } else if (equipoB.length < totalNecesarios / 2) {
      equipoB.push(jugador)
    } else {
      equipoA.push(jugador) // fallback
    }
  }

  // PASO 2 y 3 - Asignar por posición (ARQ -> DEF -> MED -> DEL)
  for (const pos of ORDEN_PRIORIDAD) {
    let requeridosPorEquipo = formacion[pos as keyof RequisitosFormacion]
    let totalPosRequeridos = requeridosPorEquipo * 2

    while (totalPosRequeridos > 0) {
      // Buscar el mejor disponible para esta posición
      let candidatoIdx = jugadoresDisponibles.findIndex(j => j.posiciones.includes(pos))
      
      // Si no hay jugadores para la posición, se toma el de mayor rating libre (Fallback)
      if (candidatoIdx === -1) {
        candidatoIdx = 0
      }

      if (candidatoIdx !== -1) {
        const selected = jugadoresDisponibles.splice(candidatoIdx, 1)[0]
        asignar({ ...selected, posicion_asignada: pos })
        totalPosRequeridos--
      } else {
        break // Literalmente no hay más jugadores
      }
    }
  }

  // PASO 4 - Completar sobras si las hay (los que no cumplieron las cuotas)
  while (jugadoresDisponibles.length > 0) {
    if (equipoA.length >= totalNecesarios / 2 && equipoB.length >= totalNecesarios / 2) break; // Equipos ya llenos

    const selected = jugadoresDisponibles.shift()!
    const posOriginal = selected.posiciones[0] || 'MED'
    asignar({ ...selected, posicion_asignada: posOriginal })
  }

  // PASO 5 - Swap básico para equilibrar aún más
  let finalDiferencia = Math.abs(sumA() - sumB())
  if (finalDiferencia > 2) {
    // Intentar intercambiar jugadores de la misma posición asignada
    for (let i = 0; i < equipoA.length; i++) {
      for (let j = 0; j < equipoB.length; j++) {
        if (equipoA[i].posicion_asignada === equipoB[j].posicion_asignada) {
          const nuevoTotalA = sumA() - equipoA[i].rating + equipoB[j].rating
          const nuevoTotalB = sumB() - equipoB[j].rating + equipoA[i].rating
          const nuevaDiff = Math.abs(nuevoTotalA - nuevoTotalB)
          
          if (nuevaDiff < finalDiferencia) {
            // Swap!
            const temp = equipoA[i]
            equipoA[i] = equipoB[j]
            equipoB[j] = temp
            finalDiferencia = nuevaDiff
          }
        }
      }
    }
  }

  return {
    equipoA: { nombre: 'A', jugadores: equipoA, totalRating: Number(sumA().toFixed(2)) },
    equipoB: { nombre: 'B', jugadores: equipoB, totalRating: Number(sumB().toFixed(2)) },
    diferencia: Number(finalDiferencia.toFixed(2))
  }
}

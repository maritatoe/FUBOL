import { supabase } from './supabase'

export async function calcularRating(jugadorId: string): Promise<number> {
  // 1. Obtener el jugador para conocer su puntaje_base
  const { data: jugador, error: errJugador } = await supabase
    .from('jugadores')
    .select('puntaje_base')
    .eq('id', jugadorId)
    .single()

  if (errJugador || !jugador) throw new Error('Jugador no encontrado')

  const puntajeBase = Number(jugador.puntaje_base)

  // 2. Obtener todos los rendimientos de este jugador, ordenados por fecha descendente
  const { data: rendimientos, error: errRendimientos } = await supabase
    .from('rendimiento')
    .select('puntaje, partidos(fecha)')
    .eq('jugador_id', jugadorId)
    .order('partidos(fecha)', { ascending: false })

  if (errRendimientos) throw errRendimientos

  // Si no tiene partidos jugados, rating = puntaje_base
  if (!rendimientos || rendimientos.length === 0) {
    return puntajeBase
  }

  // 3. Calcular promedio total
  const sumaTotal = rendimientos.reduce((acc, r) => acc + Number(r.puntaje), 0)
  const promedioTotal = sumaTotal / rendimientos.length

  // 4. Calcular promedio últimos 5
  const ultimos5 = rendimientos.slice(0, 5)
  const sumaUltimos5 = ultimos5.reduce((acc, r) => acc + Number(r.puntaje), 0)
  const promedioUltimos5 = sumaUltimos5 / ultimos5.length

  // 5. Aplicar fórmula
  const rating = (puntajeBase * 0.3) + (promedioTotal * 0.4) + (promedioUltimos5 * 0.3)

  return Number(rating.toFixed(2))
}

// Función auxiliar para recalcular y actualizar en la BD
export async function recalcularYActualizarRating(jugadorId: string) {
  const nuevoRating = await calcularRating(jugadorId)
  
  await supabase
    .from('jugadores')
    .update({ rating: nuevoRating })
    .eq('id', jugadorId)
}

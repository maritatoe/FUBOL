import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Trophy, TrendingUp } from 'lucide-react'
import clsx from 'clsx'

export default function Ranking() {
  const [ranking, setRanking] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRanking()
  }, [])

  async function fetchRanking() {
    // Note: The count logic in Supabase via relation returning an array. 
    // We'll fetch all players and their rendimientos to count them.
    const { data: jugadores, error } = await supabase
      .from('jugadores')
      .select(`
        id, nombre, rating, puntaje_base, activo, posiciones,
        rendimiento (
          id, puntaje
        )
      `)
      .order('rating', { ascending: false })

    if (!error && jugadores) {
      // Formatear data
      const formatted = jugadores.map((j: any) => {
        const rends = j.rendimiento || []
        const pj = rends.length
        
        let promGral = 0;
        let promUlt5 = 0;

        if (pj > 0) {
           const sum = rends.reduce((acc: number, r:any) => acc + Number(r.puntaje), 0)
           promGral = sum / pj

           const ultimos5 = rends.slice(-5) // Assuming order insertion matching ID/Date, normally we should order by match date but this is just for display purposes
           const sum5 = ultimos5.reduce((acc: number, r:any) => acc + Number(r.puntaje), 0)
           promUlt5 = sum5 / ultimos5.length
        }

        return {
          ...j,
          pj,
          promGral: promGral.toFixed(2),
          promUlt5: promUlt5.toFixed(2)
        }
      })
      setRanking(formatted)
    }
    setLoading(false)
  }

  if (loading) return <div className="p-4 text-center">Cargando ranking...</div>

  return (
    <div className="p-4 pb-24">
      <div className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-2xl p-4 mb-6 shadow-lg text-white flex gap-4 items-center">
        <Trophy size={48} className="text-yellow-100 opacity-90" />
        <div>
          <h2 className="text-2xl font-black shadow-sm drop-shadow-md text-yellow-900">Ranking Global</h2>
          <p className="text-sm text-yellow-800 font-medium leading-tight mt-1">El nivel se ajusta dinámicamente con las valoraciones post-partido.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 flex items-center p-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-b">
          <div className="w-8 text-center">#</div>
          <div className="flex-1">Jugador</div>
          <div className="w-12 text-center" title="Partidos Jugados">PJ</div>
          <div className="w-16 text-center text-blue-600">Rating</div>
        </div>

        {/* Table Body */}
        <div className="divide-y">
          {ranking.map((j, idx) => (
            <div key={j.id} className={clsx("flex items-center p-3 transition-colors", j.activo ? "bg-white" : "bg-gray-50 opacity-60")}>
              <div className="w-8 text-center text-sm font-bold text-gray-400">
                {idx + 1}
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-900 flex items-center gap-2">
                  {j.nombre}
                  {idx === 0 && <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-black">MVP</span>}
                </div>
                <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                  <span className="bg-gray-200 px-1 rounded-sm">{j.posiciones[0]}</span>
                  <span>Base: {j.puntaje_base}</span>
                  {j.pj > 0 && <span>• Prom: {j.promGral}</span>}
                </div>
              </div>
              <div className="w-12 text-center text-sm font-semibold text-gray-600">
                {j.pj}
              </div>
              <div className="w-16 text-center">
                <div className="font-black text-lg text-blue-600">
                  {Number(j.rating).toFixed(1)}
                </div>
                {j.pj > 0 && j.promUlt5 > j.puntaje_base && (
                  <div className="text-[10px] text-green-500 flex justify-center items-center gap-0.5 mt-0.5 font-bold" title="En racha ascendente">
                    <TrendingUp size={10} /> +
                  </div>
                )}
              </div>
            </div>
          ))}

          {ranking.length === 0 && (
            <div className="text-center text-gray-500 py-10 text-sm">
              No hay jugadores en el ranking.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

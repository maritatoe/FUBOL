export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      jugadores: {
        Row: {
          id: string
          nombre: string
          posiciones: string[]
          puntaje_base: number
          rating: number
          activo: boolean
          created_at: string
        }
        Insert: {
          id?: string
          nombre: string
          posiciones: string[]
          puntaje_base?: number
          rating?: number
          activo?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          posiciones?: string[]
          puntaje_base?: number
          rating?: number
          activo?: boolean
          created_at?: string
        }
      }
      partidos: {
        Row: {
          id: string
          fecha: string
          formacion: string
        }
        Insert: {
          id?: string
          fecha?: string
          formacion?: string
        }
        Update: {
          id?: string
          fecha?: string
          formacion?: string
        }
      }
      equipos_partido: {
        Row: {
          id: string
          partido_id: string
          jugador_id: string
          equipo: 'A' | 'B'
          posicion_asignada: string
        }
        Insert: {
          id?: string
          partido_id: string
          jugador_id: string
          equipo: 'A' | 'B'
          posicion_asignada: string
        }
        Update: {
          id?: string
          partido_id?: string
          jugador_id?: string
          equipo?: 'A' | 'B'
          posicion_asignada?: string
        }
      }
      rendimiento: {
        Row: {
          id: string
          partido_id: string
          jugador_id: string
          puntaje: number
        }
        Insert: {
          id?: string
          partido_id: string
          jugador_id: string
          puntaje: number
        }
        Update: {
          id?: string
          partido_id?: string
          jugador_id?: string
          puntaje?: number
        }
      }
    }
  }
}

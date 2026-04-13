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
        Relationships: []
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
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "equipos_partido_partido_id_fkey"
            columns: ["partido_id"]
            referencedRelation: "partidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipos_partido_jugador_id_fkey"
            columns: ["jugador_id"]
            referencedRelation: "jugadores"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "rendimiento_partido_id_fkey"
            columns: ["partido_id"]
            referencedRelation: "partidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rendimiento_jugador_id_fkey"
            columns: ["jugador_id"]
            referencedRelation: "jugadores"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}


# Fútbol Match Manager

Una aplicación de gestión de fútbol amateur diseñada para estructurar partidos, armar equipos inteligentes basados en posiciones y niveles de habilidad, y llevar un ranking dinámico histórico.

## Stack Tecnológico

- **Frontend:** React + Vite + TypeScript
- **Estilos:** Tailwind CSS + Lucide React
- **Backend/Base de Datos:** Supabase (PostgreSQL)

## Estructura

- **Plantel (Jugadores)**: ABM completo de la plantilla, con posibilidad de activar/desactivar jugadores, con soporte a múltiples posiciones preferidas.
- **Armador de Equipos Inteligente**: Sistema que clasifica y selecciona jugadores considerando:
  - Formación técnica (5v5, 7v7, 11v11)
  - Prioridad de posicionamiento (ARQ, DEF, MED, DEL)
  - Cálculo de rating ponderado
  - Balance en tiempo real para evitar diferencias > 2 puntos globales.
- **Puntuaciones & Ranking**: Al finalizar cada partido, los jugadores son calificados, recalibrando su "Rating" para influir en futuros armados usando una ponderación (30% su base, 40% su histórico, 30% sus últimos 5 partidos).

## Setup y Ejecución Local

### 1. Variables de Entorno

1. Renombra el archivo `.env.example` a `.env`
2. Pega tu `URL` y `ANON_KEY` de Supabase:
   ```bash
   VITE_SUPABASE_URL=tu_project_url
   VITE_SUPABASE_ANON_KEY=tu_anon_key
   ```

### 2. Base de Datos (Supabase)

Abre el SQL Editor en el dashboard de Supabase y ejecuta todo el contenido provisto en el archivo `schema.sql`.
Este script se encargará de crear las 4 tablas centrales (`jugadores`, `partidos`, `equipos_partido`, `rendimiento`), los chequeos de integridad y agregará políticas RLS permisivas ideales para desarrollo.

### 3. Levantar Entorno de Desarrollo

Desde la consola, a la altura de `package.json`, ejecuta las instalaciones si no las hiciste previamente:
```bash
npm install
```

Luego inicia el servidor de Vite:
```bash
npm run dev
```

> Accede a `http://localhost:5173`. Para simular la experiencia óptima (Mobile First), abre las DevTools de tu navegador en modo de dispositivo (recomendado 375px / Teléfono móvil estándar).

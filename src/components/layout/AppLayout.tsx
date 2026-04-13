import { Outlet, NavLink } from 'react-router-dom'
import { Users, UserPlus, History, Trophy } from 'lucide-react'
import clsx from 'clsx'

export function AppLayout() {
  const navItems = [
    { to: '/jugadores', icon: Users, label: 'Jugadores' },
    { to: '/armar', icon: UserPlus, label: 'Armar' },
    { to: '/historial', icon: History, label: 'Historial' },
    { to: '/ranking', icon: Trophy, label: 'Ranking' },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 max-w-md mx-auto shadow-xl relative overflow-hidden sm:max-w-lg md:max-w-xl">
      {/* Header Mobile Opcional */}
      <header className="bg-blue-600 text-white p-4 shadow-md z-10 sticky top-0">
        <h1 className="text-xl font-bold text-center tracking-wide">Soccer Match</h1>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 scroll-smooth">
        <Outlet />
      </main>

      {/* Bottom Navigation Navbar */}
      <nav className="bg-white border-t border-gray-200 fixed bottom-0 w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto flex justify-between px-2 pb-[env(safe-area-inset-bottom)] z-20">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center flex-1 py-3 px-1 transition-colors relative',
                isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={clsx("w-6 h-6 mb-1 transition-transform", isActive && "scale-110")} />
                <span className="text-[10px] font-semibold">{item.label}</span>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-b-md" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

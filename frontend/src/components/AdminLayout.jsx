import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const menus = [
  { label: 'Dashboard', path: '/admin', icon: '📊' },
  { label: 'Pengaduan', path: '/admin/pengaduan', icon: '📋' },
  { label: 'Fasilitas', path: '/admin/fasilitas', icon: '🏢' },
  { label: 'Teknisi', path: '/admin/teknisi', icon: '🔧' },
  { label: 'Mahasiswa', path: '/admin/mahasiswa', icon: '🎓' },
  { label: 'Laporan', path: '/admin/laporan', icon: '📄' },
]

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-56' : 'w-16'} bg-white border-r border-gray-200 flex flex-col transition-all duration-200 shrink-0`}>
        <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
          {sidebarOpen && (
            <div>
              <p className="text-sm font-semibold text-gray-800">Admin Panel</p>
              <p className="text-xs text-gray-400">STMIK Mardira Indonesia</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-gray-600 text-lg"
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          {menus.map(m => (
            <button
              key={m.path}
              onClick={() => navigate(m.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                location.pathname === m.path
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{m.icon}</span>
              {sidebarOpen && <span>{m.label}</span>}
            </button>
          ))}
        </nav>

        <div className="px-2 py-4 border-t border-gray-100">
          {sidebarOpen && (
            <p className="text-xs text-gray-500 px-3 mb-2 truncate">{user?.namaLengkap}</p>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition"
          >
            <span>🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
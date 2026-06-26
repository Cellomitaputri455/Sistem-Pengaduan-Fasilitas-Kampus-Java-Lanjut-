import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

export default function MahasiswaDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [pengaduan, setPengaduan] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/pengaduan/riwayat')
      .then(res => setPengaduan(res.data.data || []))
      .catch(() => setPengaduan([]))
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const statusColor = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    IN_PROGRESS: 'bg-purple-100 text-purple-700',
    RESOLVED: 'bg-green-100 text-green-700',
    CLOSED: 'bg-gray-100 text-gray-600',
  }

  const stats = {
    total: pengaduan.length,
    pending: pengaduan.filter(p => p.status === 'PENDING').length,
    inProgress: pengaduan.filter(p => p.status === 'IN_PROGRESS').length,
    resolved: pengaduan.filter(p => p.status === 'RESOLVED').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">Sistem Pengaduan</h1>
          <p className="text-xs text-gray-500">STMIK Mardira Indonesia</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.namaLengkap}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:text-red-700"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Greeting */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">Halo, {user?.namaLengkap} 👋</h2>
          <p className="text-sm text-gray-500 mt-1">Berikut ringkasan pengaduan kamu</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, color: 'text-gray-700' },
            { label: 'Pending', value: stats.pending, color: 'text-yellow-600' },
            { label: 'Diproses', value: stats.inProgress, color: 'text-blue-600' },
            { label: 'Selesai', value: stats.resolved, color: 'text-green-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => navigate('/mahasiswa/pengaduan/buat')}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition"
          >
            + Buat Pengaduan
          </button>
          <button
            onClick={() => navigate('/mahasiswa/riwayat')}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-5 py-2.5 rounded-lg transition"
          >
            Lihat Riwayat
          </button>
        </div>

        {/* Recent */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Pengaduan Terbaru</h3>
          </div>
          {loading ? (
            <div className="px-5 py-8 text-center text-sm text-gray-400">Memuat...</div>
          ) : pengaduan.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-400">
              Belum ada pengaduan. <button onClick={() => navigate('/mahasiswa/pengaduan/buat')} className="text-blue-600 hover:underline">Buat sekarang</button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {pengaduan.slice(0, 5).map(p => (
                <li
                  key={p.id}
                  onClick={() => navigate(`/mahasiswa/pengaduan/${p.id}`)}
                  className="px-5 py-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{p.judul}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{p.nomorPengaduan} · {p.fasilitas?.nama || '-'}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[p.status] || 'bg-gray-100 text-gray-600'}`}>
                    {p.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
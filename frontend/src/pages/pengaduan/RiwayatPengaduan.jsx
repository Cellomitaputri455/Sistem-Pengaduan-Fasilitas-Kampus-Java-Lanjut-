import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'

const statusColor = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-purple-100 text-purple-700',
  RESOLVED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-600',
}

const prioritasColor = {
  LOW: 'bg-gray-100 text-gray-600',
  MEDIUM: 'bg-orange-100 text-orange-600',
  HIGH: 'bg-red-100 text-red-600',
}

export default function RiwayatPengaduan() {
  const navigate = useNavigate()
  const [pengaduan, setPengaduan] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    api.get('/api/pengaduan/riwayat')
      .then(res => setPengaduan(res.data.data || []))
      .catch(() => setPengaduan([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter
    ? pengaduan.filter(p => p.status === filter)
    : pengaduan

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/mahasiswa')}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Kembali
        </button>
        <h1 className="text-lg font-semibold text-gray-800">Riwayat Pengaduan</h1>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition ${
                filter === s
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {s === '' ? 'Semua' : s}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="bg-white rounded-xl border border-gray-200">
          {loading ? (
            <div className="px-5 py-10 text-center text-sm text-gray-400">Memuat...</div>
          ) : filtered.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-400">
              Tidak ada pengaduan{filter ? ` dengan status ${filter}` : ''}.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filtered.map(p => (
                <li
                  key={p.id}
                  onClick={() => navigate(`/mahasiswa/pengaduan/${p.id}`)}
                  className="px-5 py-4 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-sm font-medium text-gray-800 truncate">{p.judul}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {p.nomorPengaduan} · {p.fasilitas?.nama || '-'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[p.status] || 'bg-gray-100 text-gray-600'}`}>
                        {p.status}
                      </span>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${prioritasColor[p.prioritas] || 'bg-gray-100 text-gray-600'}`}>
                        {p.prioritas}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import api from '../../api/axios'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [pengaduan, setPengaduan] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/pengaduan')
      .then(res => setPengaduan(res.data.data || []))
      .catch(() => setPengaduan([]))
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    total: pengaduan.length,
    pending: pengaduan.filter(p => p.status === 'PENDING').length,
    inProgress: pengaduan.filter(p => ['ASSIGNED', 'IN_PROGRESS'].includes(p.status)).length,
    resolved: pengaduan.filter(p => p.status === 'RESOLVED').length,
  }

  const statusColor = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    ASSIGNED: 'bg-blue-100 text-blue-700',
    IN_PROGRESS: 'bg-purple-100 text-purple-700',
    RESOLVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
  }

  const prioritasColor = {
    LOW: 'bg-gray-100 text-gray-600',
    MEDIUM: 'bg-orange-100 text-orange-600',
    HIGH: 'bg-red-100 text-red-600',
  }

  return (
    <AdminLayout>
      <div className="px-8 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">Dashboard Admin</h2>
          <p className="text-sm text-gray-500 mt-1">Ringkasan pengaduan masuk</p>
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

        {/* Quick actions */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => navigate('/admin/pengaduan')}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition"
          >
            Kelola Pengaduan
          </button>
          <button
            onClick={() => navigate('/admin/laporan')}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-5 py-2.5 rounded-lg transition"
          >
            Export Laporan
          </button>
        </div>

        {/* Pengaduan terbaru */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-700">Pengaduan Terbaru</h3>
            <button
              onClick={() => navigate('/admin/pengaduan')}
              className="text-xs text-blue-600 hover:underline"
            >
              Lihat semua
            </button>
          </div>
          {loading ? (
            <div className="px-5 py-8 text-center text-sm text-gray-400">Memuat...</div>
          ) : pengaduan.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-400">Belum ada pengaduan.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {pengaduan.slice(0, 8).map(p => (
                <li
                  key={p.id}
                  onClick={() => navigate('/admin/pengaduan')}
                  className="px-5 py-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{p.judul}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {p.nomorPengaduan} · {p.mahasiswa?.namaLengkap || '-'}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${prioritasColor[p.prioritas] || 'bg-gray-100 text-gray-600'}`}>
                      {p.prioritas}
                    </span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[p.status] || 'bg-gray-100 text-gray-600'}`}>
                      {p.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import api from '../../api/axios'

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

export default function AdminPengaduan() {
  const [pengaduan, setPengaduan] = useState([])
  const [teknisi, setTeknisi] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPrioritas, setFilterPrioritas] = useState('')
  const [assignModal, setAssignModal] = useState(null)
  const [selectedTeknisi, setSelectedTeknisi] = useState('')
  const [assignLoading, setAssignLoading] = useState(false)
  const [assignError, setAssignError] = useState('')

  const fetchPengaduan = () => {
    let url = '/api/pengaduan'
    const params = []
    if (filterStatus) params.push(`status=${filterStatus}`)
    if (filterPrioritas) params.push(`prioritas=${filterPrioritas}`)
    if (params.length) url += '?' + params.join('&')

    setLoading(true)
    api.get(url)
      .then(res => setPengaduan(res.data.data || []))
      .catch(() => setPengaduan([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchPengaduan()
  }, [filterStatus, filterPrioritas])

  useEffect(() => {
    api.get('/api/teknisi/aktif')
      .then(res => setTeknisi(res.data.data || []))
      .catch(() => setTeknisi([]))
  }, [])

  const handleAssign = async () => {
    if (!selectedTeknisi) return
    setAssignError('')
    setAssignLoading(true)
    try {
      await api.put(`/api/pengaduan/${assignModal.id}/assign`, {
        idTeknisi: parseInt(selectedTeknisi),
      })
      setAssignModal(null)
      setSelectedTeknisi('')
      fetchPengaduan()
    } catch (err) {
      setAssignError(err.response?.data?.message || 'Gagal assign teknisi')
    } finally {
      setAssignLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="px-8 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">Kelola Pengaduan</h2>
          <p className="text-sm text-gray-500 mt-1">Assign dan pantau semua pengaduan</p>
        </div>

        {/* Filter */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Status</option>
            {['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={filterPrioritas}
            onChange={e => setFilterPrioritas(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Prioritas</option>
            {['LOW', 'MEDIUM', 'HIGH'].map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="px-5 py-10 text-center text-sm text-gray-400">Memuat...</div>
          ) : pengaduan.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-400">Tidak ada pengaduan.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Nomor</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Judul</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Mahasiswa</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Prioritas</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Teknisi</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pengaduan.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-xs text-gray-500">{p.nomorPengaduan}</td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-800">{p.judul}</p>
                      <p className="text-xs text-gray-400">{p.fasilitas?.nama || '-'}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{p.mahasiswa?.namaLengkap || '-'}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${prioritasColor[p.prioritas] || 'bg-gray-100 text-gray-600'}`}>
                        {p.prioritas}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[p.status] || 'bg-gray-100 text-gray-600'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600 text-xs">
                      {p.teknisi?.namaLengkap || '-'}
                    </td>
                    <td className="px-5 py-3">
                      {p.status === 'PENDING' && (
                        <button
                          onClick={() => { setAssignModal(p); setAssignError('') }}
                          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition"
                        >
                          Assign
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Assign */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-base font-semibold text-gray-800 mb-1">Assign Teknisi</h3>
            <p className="text-sm text-gray-500 mb-4">{assignModal.judul}</p>

            {assignError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                {assignError}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Teknisi</label>
              <select
                value={selectedTeknisi}
                onChange={e => setSelectedTeknisi(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih teknisi aktif</option>
                {teknisi.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.namaLengkap} — {t.spesialisasi}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setAssignModal(null); setSelectedTeknisi('') }}
                className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleAssign}
                disabled={assignLoading || !selectedTeknisi}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg transition disabled:opacity-50"
              >
                {assignLoading ? 'Memproses...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
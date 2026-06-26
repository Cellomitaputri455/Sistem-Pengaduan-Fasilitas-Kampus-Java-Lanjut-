import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
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

export default function TeknisiDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tugas, setTugas] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [statusForm, setStatusForm] = useState({ status: '', catatan: '' })
  const [foto, setFoto] = useState(null)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [updateError, setUpdateError] = useState('')
  const [updateSuccess, setUpdateSuccess] = useState('')

  const fetchTugas = () => {
    setLoading(true)
    api.get('/api/pengaduan/tugas')
      .then(res => setTugas(res.data.data || []))
      .catch(() => setTugas([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchTugas() }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const openDetail = (t) => {
    setSelected(t)
    setStatusForm({ status: t.status, catatan: '' })
    setFoto(null)
    setUpdateError('')
    setUpdateSuccess('')
  }

  const handleFoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
    const maxSize = 5 * 1024 * 1024
    if (!allowedTypes.includes(file.type)) {
      setUpdateError('Format file tidak valid. Gunakan JPG atau PNG.')
      return
    }
    if (file.size > maxSize) {
      setUpdateError('Ukuran file maksimal 5MB.')
      return
    }
    setUpdateError('')
    setFoto(file)
  }

  const handleUpdate = async () => {
    if (!statusForm.status) return
    setUpdateError('')
    setUpdateSuccess('')
    setUpdateLoading(true)
    try {
      // Update status
      await api.put(`/api/pengaduan/${selected.id}/status`, statusForm)

      // Upload foto bukti jika ada
      if (foto) {
        const formData = new FormData()
        formData.append('file', foto)
        await api.post(`/api/pengaduan/${selected.id}/bukti`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }

      setUpdateSuccess('Status berhasil diperbarui!')
      fetchTugas()
      setTimeout(() => {
        setSelected(null)
      }, 1500)
    } catch (err) {
      setUpdateError(err.response?.data?.message || 'Gagal memperbarui status')
    } finally {
      setUpdateLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">Portal Teknisi</h1>
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
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">Daftar Tugas</h2>
          <p className="text-sm text-gray-500 mt-1">Pengaduan yang ditugaskan kepada kamu</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Tugas', value: tugas.length, color: 'text-gray-700' },
            { label: 'Sedang Dikerjakan', value: tugas.filter(t => t.status === 'IN_PROGRESS').length, color: 'text-purple-600' },
            { label: 'Selesai', value: tugas.filter(t => t.status === 'RESOLVED').length, color: 'text-green-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* List tugas */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Semua Tugas</h3>
          </div>
          {loading ? (
            <div className="px-5 py-10 text-center text-sm text-gray-400">Memuat...</div>
          ) : tugas.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-400">Belum ada tugas yang ditugaskan.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {tugas.map(t => (
                <li
                  key={t.id}
                  onClick={() => openDetail(t)}
                  className="px-5 py-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-sm font-medium text-gray-800">{t.judul}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {t.nomorPengaduan} · {t.fasilitas?.nama || '-'} · {t.fasilitas?.lokasi || '-'}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${prioritasColor[t.prioritas] || 'bg-gray-100 text-gray-600'}`}>
                      {t.prioritas}
                    </span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[t.status] || 'bg-gray-100 text-gray-600'}`}>
                      {t.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Modal Detail + Update Status */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs text-gray-400">{selected.nomorPengaduan}</p>
                <h3 className="text-base font-semibold text-gray-800 mt-0.5">{selected.judul}</h3>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ✕
              </button>
            </div>

            {/* Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Fasilitas</span>
                <span className="text-gray-800 font-medium">{selected.fasilitas?.nama || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Lokasi</span>
                <span className="text-gray-800">{selected.fasilitas?.lokasi || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Jenis Kerusakan</span>
                <span className="text-gray-800">{selected.jenisKerusakan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Prioritas</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${prioritasColor[selected.prioritas]}`}>
                  {selected.prioritas}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Pelapor</span>
                <span className="text-gray-800">{selected.mahasiswa?.namaLengkap || '-'}</span>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-5">{selected.deskripsi}</p>
            {selected.rating && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-5">
                <p className="text-xs font-semibold text-yellow-700 mb-1">Rating dari Mahasiswa</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-yellow-600">{selected.rating.nilai}</span>
                  <span className="text-sm text-yellow-500">/ 5</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{selected.rating.feedback}</p>
              </div>
            )}

            {/* Form Update Status */}
            {updateSuccess ? (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {updateSuccess}
              </div>
            ) : selected.status === 'RESOLVED' || selected.status === 'CLOSED' ? (
              <div className="bg-gray-50 border border-gray-200 text-gray-500 px-4 py-3 rounded-lg text-sm">
                {selected.status === 'RESOLVED' ? 'Pengaduan ini sudah selesai ditangani.' : 'Pengaduan ini sudah ditutup/ditolak.'}
              </div>
            ) : (
              <div className="space-y-4">
                {updateError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {updateError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
                  <select
                    value={statusForm.status}
                    onChange={e => setStatusForm({ ...statusForm, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED — Ditolak/Tidak Valid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Penanganan</label>
                  <textarea
                    value={statusForm.catatan}
                    onChange={e => setStatusForm({ ...statusForm, catatan: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Jelaskan hasil penanganan..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Bukti Foto <span className="text-gray-400">(opsional, maks 5MB)</span>
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleFoto}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {foto && (
                    <p className="text-xs text-green-600 mt-1">✓ {foto.name}</p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setSelected(null)}
                    className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={updateLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg transition disabled:opacity-50"
                  >
                    {updateLoading ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
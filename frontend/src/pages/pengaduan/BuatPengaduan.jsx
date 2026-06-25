import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'

const JENIS_KERUSAKAN = ['RINGAN', 'SEDANG', 'BERAT']
const PRIORITAS = ['LOW', 'MEDIUM', 'HIGH']

export default function BuatPengaduan() {
  const navigate = useNavigate()
  const [fasilitas, setFasilitas] = useState([])
  const [form, setForm] = useState({
    judul: '',
    deskripsi: '',
    jenisKerusakan: '',
    prioritas: '',
    idFasilitas: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/api/fasilitas')
      .then(res => setFasilitas(res.data.data || []))
      .catch(() => setFasilitas([]))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/api/pengaduan', {
        ...form,
        idFasilitas: parseInt(form.idFasilitas),
      })
      navigate('/mahasiswa')
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat pengaduan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/mahasiswa')}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Kembali
        </button>
        <h1 className="text-lg font-semibold text-gray-800">Buat Pengaduan</h1>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-5 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
              <input
                type="text"
                value={form.judul}
                onChange={e => setForm({ ...form, judul: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: AC ruang kelas B101 rusak"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fasilitas</label>
              <select
                value={form.idFasilitas}
                onChange={e => setForm({ ...form, idFasilitas: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Pilih fasilitas</option>
                {fasilitas.map(f => (
                  <option key={f.id} value={f.id}>{f.nama} — {f.lokasi}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kerusakan</label>
                <select
                  value={form.jenisKerusakan}
                  onChange={e => setForm({ ...form, jenisKerusakan: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Pilih jenis</option>
                  {JENIS_KERUSAKAN.map(j => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioritas</label>
                <select
                  value={form.prioritas}
                  onChange={e => setForm({ ...form, prioritas: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Pilih prioritas</option>
                  {PRIORITAS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
              <textarea
                value={form.deskripsi}
                onChange={e => setForm({ ...form, deskripsi: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Jelaskan kerusakan secara detail..."
                rows={4}
                required
              />
            </div>

            {form.prioritas === 'HIGH' && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-sm">
                ⚠️ Prioritas HIGH akan otomatis di-assign ke teknisi yang tersedia.
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition disabled:opacity-50"
            >
              {loading ? 'Mengirim...' : 'Kirim Pengaduan'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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

export default function DetailPengaduan() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pengaduan, setPengaduan] = useState(null)
  const [riwayatStatus, setRiwayatStatus] = useState([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState({ nilai: 5, feedback: '' })
  const [ratingLoading, setRatingLoading] = useState(false)
  const [ratingSuccess, setRatingSuccess] = useState('')
  const [ratingError, setRatingError] = useState('')
  const [buktiFoto, setBuktiFoto] = useState([])
  

  useEffect(() => {
    Promise.all([
      api.get(`/api/pengaduan/${id}`),
      api.get(`/api/pengaduan/${id}/riwayat-status`),
      api.get(`/api/pengaduan/${id}/bukti`),
    ])
      .then(([detailRes, riwayatRes, buktiRes]) => {
        setPengaduan(detailRes.data.data)
        setRiwayatStatus(riwayatRes.data.data || [])
        setBuktiFoto(buktiRes.data.data || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const getImageUrl = (urlFile) => {
    const filename = urlFile.split('/').pop()
    return `http://localhost:8080/api/pengaduan/${id}/bukti/file/${filename}`
  }

  const fotoMahasiswa = buktiFoto.filter(b => b.uploadedBy === 'MAHASISWA' || b.uploadedBy === null)
  const fotoTeknisi = buktiFoto.filter(b => b.uploadedBy === 'TEKNISI')

  const handleRating = async (e) => {
    e.preventDefault()
    setRatingError('')
    setRatingLoading(true)
    try {
      await api.post(`/api/pengaduan/${id}/rating`, rating)
      setRatingSuccess('Rating berhasil dikirim!')
    } catch (err) {
      setRatingError(err.response?.data?.message || 'Gagal mengirim rating')
    } finally {
      setRatingLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-400">Memuat...</p>
      </div>
    )
  }

  if (!pengaduan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-400">Pengaduan tidak ditemukan.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/mahasiswa/riwayat')}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Kembali
        </button>
        <h1 className="text-lg font-semibold text-gray-800">Detail Pengaduan</h1>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* Info Utama */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-gray-400">{pengaduan.nomorPengaduan}</p>
              <h2 className="text-base font-semibold text-gray-800 mt-0.5">{pengaduan.judul}</h2>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[pengaduan.status] || 'bg-gray-100 text-gray-600'}`}>
                {pengaduan.status}
              </span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${prioritasColor[pengaduan.prioritas] || 'bg-gray-100 text-gray-600'}`}>
                {pengaduan.prioritas}
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4">{pengaduan.deskripsi}</p>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-400">Fasilitas</p>
              <p className="text-gray-700 font-medium">{pengaduan.fasilitas?.nama || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Lokasi</p>
              <p className="text-gray-700 font-medium">{pengaduan.fasilitas?.lokasi || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Jenis Kerusakan</p>
              <p className="text-gray-700 font-medium">{pengaduan.jenisKerusakan}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Teknisi</p>
              <p className="text-gray-700 font-medium">{pengaduan.teknisi?.namaLengkap || 'Belum ditugaskan'}</p>
            </div>
          </div>
        </div>

        {/* Foto Bukti Kerusakan dari Mahasiswa */}
        {fotoMahasiswa.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Foto Bukti Kerusakan</h3>
            <div className="grid grid-cols-2 gap-3">
              {fotoMahasiswa.map(b => (
                <div key={b.id} className="rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={getImageUrl(b.urlFile)}
                    alt={b.namaFile}
                    className="w-full h-40 object-cover"
                    onError={e => e.target.style.display = 'none'}
                  />
                  <p className="text-xs text-gray-400 px-2 py-1 truncate">{b.namaFile}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Riwayat Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Riwayat Status</h3>
          {riwayatStatus.length === 0 ? (
            <p className="text-sm text-gray-400">Belum ada riwayat status.</p>
          ) : (
            <ul className="space-y-3">
              {riwayatStatus.map((r, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    {i < riwayatStatus.length - 1 && (
                      <div className="w-px flex-1 bg-gray-200 mt-1" />
                    )}
                  </div>
                  <div className="pb-3">
                    <p className="text-gray-700 font-medium">
                      {r.statusLama} → {r.statusBaru}
                    </p>
                    {r.catatan && <p className="text-gray-500 text-xs mt-0.5">{r.catatan}</p>}
                    <p className="text-gray-400 text-xs mt-0.5">
                      {new Date(r.changedAt).toLocaleString('id-ID')}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Foto Bukti Penyelesaian dari Teknisi */}
        {fotoTeknisi.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Foto Bukti Penyelesaian</h3>
            <div className="grid grid-cols-2 gap-3">
              {fotoTeknisi.map(b => (
                <div key={b.id} className="rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={getImageUrl(b.urlFile)}
                    alt={b.namaFile}
                    className="w-full h-40 object-cover"
                    onError={e => e.target.style.display = 'none'}
                  />
                  <p className="text-xs text-gray-400 px-2 py-1 truncate">{b.namaFile}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rating — hanya jika RESOLVED dan belum ada rating */}
        {pengaduan.status === 'RESOLVED' && !pengaduan.rating && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Beri Rating</h3>
            {ratingSuccess ? (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {ratingSuccess}
              </div>
            ) : (
              <form onSubmit={handleRating} className="space-y-4">
                {ratingError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {ratingError}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nilai</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRating({ ...rating, nilai: n })}
                        className={`w-10 h-10 rounded-lg text-sm font-medium border transition ${
                          rating.nilai === n
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
                  <textarea
                    value={rating.feedback}
                    onChange={e => setRating({ ...rating, feedback: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ceritakan pengalaman kamu..."
                    rows={3}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={ratingLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition disabled:opacity-50"
                >
                  {ratingLoading ? 'Mengirim...' : 'Kirim Rating'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Tampilkan rating jika sudah ada */}
        {pengaduan.rating && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Rating Kamu</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-bold text-blue-600">{pengaduan.rating.nilai}</span>
              <span className="text-sm text-gray-400">/ 5</span>
            </div>
            <p className="text-sm text-gray-600">{pengaduan.rating.feedback}</p>
          </div>
        )}
      </div>
    </div>
  )
}
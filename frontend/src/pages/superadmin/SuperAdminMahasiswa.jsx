import { useState, useEffect } from 'react'
import SuperAdminLayout from '../../components/SuperAdminLayout'
import api from '../../api/axios'

export default function SuperAdminMahasiswa() {
  const [mahasiswa, setMahasiswa] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchMahasiswa = () => {
    setLoading(true)
    api.get('/api/mahasiswa')
      .then(res => setMahasiswa(res.data.data || []))
      .catch(() => setMahasiswa([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchMahasiswa() }, [])

  const handleNonaktifkan = async (id) => {
    if (!confirm('Nonaktifkan akun mahasiswa ini?')) return
    try { await api.patch(`/api/mahasiswa/${id}/nonaktifkan`); fetchMahasiswa() }
    catch (err) { alert(err.response?.data?.message || 'Gagal nonaktifkan mahasiswa') }
  }

  const handleAktifkan = async (id) => {
    if (!confirm('Aktifkan kembali akun mahasiswa ini?')) return
    try { await api.patch(`/api/mahasiswa/${id}/aktifkan`); fetchMahasiswa() }
    catch (err) { alert(err.response?.data?.message || 'Gagal mengaktifkan mahasiswa') }
  }

  return (
    <SuperAdminLayout>
      <div className="px-8 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">Kelola Mahasiswa</h2>
          <p className="text-sm text-gray-500 mt-1">Pantau dan kelola akun mahasiswa</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? <div className="px-5 py-10 text-center text-sm text-gray-400">Memuat...</div>
          : mahasiswa.length === 0 ? <div className="px-5 py-10 text-center text-sm text-gray-400">Belum ada mahasiswa.</div>
          : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">NIM</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Nama</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Kontak</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mahasiswa.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-600">{m.nim}</td>
                    <td className="px-5 py-3 font-medium text-gray-800">{m.namaLengkap}</td>
                    <td className="px-5 py-3"><p className="text-gray-600">{m.email}</p><p className="text-xs text-gray-400">{m.noHp}</p></td>
                    <td className="px-5 py-3"><span className={`text-xs font-medium px-2.5 py-1 rounded-full ${m.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{m.isActive ? 'Aktif' : 'Nonaktif'}</span></td>
                    <td className="px-5 py-3">
                      {m.isActive
                        ? <button onClick={() => handleNonaktifkan(m.id)} className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg transition">Nonaktifkan</button>
                        : <button onClick={() => handleAktifkan(m.id)} className="text-xs bg-green-50 hover:bg-green-100 text-green-600 px-3 py-1.5 rounded-lg transition">Aktifkan</button>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </SuperAdminLayout>
  )
}
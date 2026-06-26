import { useState, useEffect } from 'react'
import SuperAdminLayout from '../../components/SuperAdminLayout'
import api from '../../api/axios'

export default function SuperAdminFasilitas() {
  const [fasilitas, setFasilitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ nama: '', kategori: '', lokasi: '', deskripsi: '' })
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [search, setSearch] = useState('')

  const fetchFasilitas = () => {
    setLoading(true)
    const url = search ? `/api/fasilitas?search=${search}` : '/api/fasilitas'
    api.get(url).then(res => setFasilitas(res.data.data || [])).catch(() => setFasilitas([])).finally(() => setLoading(false))
  }

  useEffect(() => { fetchFasilitas() }, [search])

  const openTambah = () => { setForm({ nama: '', kategori: '', lokasi: '', deskripsi: '' }); setFormError(''); setModal('tambah') }
  const openEdit = (f) => { setSelected(f); setForm({ nama: f.nama ?? '', kategori: f.kategori ?? '', lokasi: f.lokasi ?? '', deskripsi: f.deskripsi ?? '' }); setFormError(''); setModal('edit') }

  const handleSubmit = async () => {
    setFormError(''); setFormLoading(true)
    try {
      modal === 'tambah' ? await api.post('/api/fasilitas', form) : await api.put(`/api/fasilitas/${selected.id}`, form)
      setModal(null); fetchFasilitas()
    } catch (err) { setFormError(err.response?.data?.message || 'Gagal menyimpan fasilitas') }
    finally { setFormLoading(false) }
  }

  const handleNonaktifkan = async (id) => {
    if (!confirm('Nonaktifkan fasilitas ini?')) return
    try { await api.delete(`/api/fasilitas/${id}`); fetchFasilitas() }
    catch (err) { alert(err.response?.data?.message || 'Gagal nonaktifkan fasilitas') }
  }

  const handleAktifkan = async (id) => {
    if (!confirm('Aktifkan kembali fasilitas ini?')) return
    try { await api.patch(`/api/fasilitas/${id}/aktifkan`); fetchFasilitas() }
    catch (err) { alert(err.response?.data?.message || 'Gagal mengaktifkan fasilitas') }
  }

  return (
    <SuperAdminLayout>
      <div className="px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div><h2 className="text-xl font-bold text-gray-800">Kelola Fasilitas</h2><p className="text-sm text-gray-500 mt-1">Tambah dan kelola data fasilitas kampus</p></div>
          <button onClick={openTambah} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition">+ Tambah Fasilitas</button>
        </div>
        <div className="mb-5"><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari fasilitas..." className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? <div className="px-5 py-10 text-center text-sm text-gray-400">Memuat...</div>
          : fasilitas.length === 0 ? <div className="px-5 py-10 text-center text-sm text-gray-400">Tidak ada fasilitas.</div>
          : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200"><tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Nama</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Kategori</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Lokasi</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Aksi</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {fasilitas.map(f => (
                  <tr key={f.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3"><p className="font-medium text-gray-800">{f.nama}</p><p className="text-xs text-gray-400">{f.deskripsi}</p></td>
                    <td className="px-5 py-3 text-gray-600">{f.kategori}</td>
                    <td className="px-5 py-3 text-gray-600">{f.lokasi}</td>
                    <td className="px-5 py-3"><span className={`text-xs font-medium px-2.5 py-1 rounded-full ${f.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{f.isActive ? 'Aktif' : 'Nonaktif'}</span></td>
                    <td className="px-5 py-3"><div className="flex gap-2">
                      <button onClick={() => openEdit(f)} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition">Edit</button>
                      {f.isActive ? <button onClick={() => handleNonaktifkan(f.id)} className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg transition">Nonaktifkan</button>
                      : <button onClick={() => handleAktifkan(f.id)} className="text-xs bg-green-50 hover:bg-green-100 text-green-600 px-3 py-1.5 rounded-lg transition">Aktifkan</button>}
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-base font-semibold text-gray-800 mb-4">{modal === 'tambah' ? 'Tambah Fasilitas' : 'Edit Fasilitas'}</h3>
            {formError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{formError}</div>}
            <div className="space-y-4">
              {[{ label: 'Nama', key: 'nama', placeholder: 'Contoh: Lab Komputer A' }, { label: 'Kategori', key: 'kategori', placeholder: 'Contoh: Laboratorium' }, { label: 'Lokasi', key: 'lokasi', placeholder: 'Contoh: Gedung B Lt.2' }].map(f => (
                <div key={f.key}><label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label><input type="text" value={form[f.key] ?? ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={f.placeholder} /></div>
              ))}
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label><textarea value={form.deskripsi ?? ''} onChange={e => setForm({ ...form, deskripsi: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} /></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(null)} className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition">Batal</button>
              <button onClick={handleSubmit} disabled={formLoading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg transition disabled:opacity-50">{formLoading ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  )
}
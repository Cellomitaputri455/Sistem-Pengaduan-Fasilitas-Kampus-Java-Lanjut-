import { useState, useEffect } from 'react'
import SuperAdminLayout from '../../components/SuperAdminLayout'
import api from '../../api/axios'

export default function SuperAdminTeknisi() {
  const [teknisi, setTeknisi] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ nip: '', namaLengkap: '', email: '', noHp: '', password: '', spesialisasi: '' })
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const fetchTeknisi = () => {
    setLoading(true)
    api.get('/api/teknisi')
      .then(res => setTeknisi(res.data.data || []))
      .catch(() => setTeknisi([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchTeknisi() }, [])

  const openTambah = () => {
    setForm({ nip: '', namaLengkap: '', email: '', noHp: '', password: '', spesialisasi: '' })
    setFormError('')
    setModal('tambah')
  }

  const openEdit = (t) => {
    setSelected(t)
    setForm({
      nip: t.nip ?? '',
      namaLengkap: t.namaLengkap ?? '',
      email: t.email ?? '',
      noHp: t.noHp ?? '',
      password: '',
      spesialisasi: t.spesialisasi ?? '',
    })
    setFormError('')
    setModal('edit')
  }

  const handleSubmit = async () => {
    setFormError('')
    setFormLoading(true)
    try {
      if (modal === 'tambah') {
        await api.post('/api/teknisi', { ...form, nip: parseInt(form.nip) })
      } else {
        const payload = {
          nip: parseInt(form.nip),
          namaLengkap: form.namaLengkap,
          email: form.email,
          noHp: form.noHp,
          spesialisasi: form.spesialisasi,
        }
        if (form.password && form.password.trim() !== '') {
          payload.password = form.password
        }
        await api.put(`/api/teknisi/${selected.id}`, payload)
      }
      setModal(null)
      fetchTeknisi()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal menyimpan data teknisi')
    } finally {
      setFormLoading(false)
    }
  }

  const handleNonaktifkan = async (id) => {
    if (!confirm('Nonaktifkan teknisi ini?')) return
    try { await api.patch(`/api/teknisi/${id}/nonaktifkan`); fetchTeknisi() }
    catch (err) { alert(err.response?.data?.message || 'Gagal nonaktifkan teknisi') }
  }

  const handleAktifkan = async (id) => {
    if (!confirm('Aktifkan kembali teknisi ini?')) return
    try { await api.patch(`/api/teknisi/${id}/aktifkan`); fetchTeknisi() }
    catch (err) { alert(err.response?.data?.message || 'Gagal mengaktifkan teknisi') }
  }

  const fields = [
    { label: 'NIP', key: 'nip', type: 'number', placeholder: '12345' },
    { label: 'Nama Lengkap', key: 'namaLengkap', type: 'text', placeholder: 'Nama teknisi' },
    { label: 'Email', key: 'email', type: 'email', placeholder: 'email@stmik.ac.id' },
    { label: 'No HP', key: 'noHp', type: 'text', placeholder: '81234567890' },
    { label: modal === 'tambah' ? 'Password' : 'Password Baru (kosongkan jika tidak diubah)', key: 'password', type: 'password', placeholder: '••••••••' },
    { label: 'Spesialisasi', key: 'spesialisasi', type: 'text', placeholder: 'Contoh: Elektronik, Komputer' },
  ]

  return (
    <SuperAdminLayout>
      <div className="px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Kelola Teknisi</h2>
            <p className="text-sm text-gray-500 mt-1">Tambah dan kelola data teknisi</p>
          </div>
          <button onClick={openTambah} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition">+ Tambah Teknisi</button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? <div className="px-5 py-10 text-center text-sm text-gray-400">Memuat...</div>
          : teknisi.length === 0 ? <div className="px-5 py-10 text-center text-sm text-gray-400">Belum ada teknisi.</div>
          : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">NIP</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Nama</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Spesialisasi</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Kontak</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {teknisi.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-600">{t.nip}</td>
                    <td className="px-5 py-3 font-medium text-gray-800">{t.namaLengkap}</td>
                    <td className="px-5 py-3 text-gray-600">{t.spesialisasi}</td>
                    <td className="px-5 py-3"><p className="text-gray-600">{t.email}</p><p className="text-xs text-gray-400">{t.noHp}</p></td>
                    <td className="px-5 py-3"><span className={`text-xs font-medium px-2.5 py-1 rounded-full ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{t.isActive ? 'Aktif' : 'Nonaktif'}</span></td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(t)} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition">Edit</button>
                        {t.isActive
                          ? <button onClick={() => handleNonaktifkan(t.id)} className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg transition">Nonaktifkan</button>
                          : <button onClick={() => handleAktifkan(t.id)} className="text-xs bg-green-50 hover:bg-green-100 text-green-600 px-3 py-1.5 rounded-lg transition">Aktifkan</button>
                        }
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-semibold text-gray-800 mb-4">{modal === 'tambah' ? 'Tambah Teknisi' : 'Edit Teknisi'}</h3>
            {formError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{formError}</div>}
            <div className="space-y-4">
              {fields.map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <input type={f.type} value={form[f.key] ?? ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={f.placeholder} />
                </div>
              ))}
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
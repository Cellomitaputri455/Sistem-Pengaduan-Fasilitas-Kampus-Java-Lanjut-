import { useState, useEffect } from 'react'
import SuperAdminLayout from '../../components/SuperAdminLayout'
import api from '../../api/axios'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

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

export default function SuperAdminLaporan() {
  const [laporan, setLaporan] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPrioritas, setFilterPrioritas] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const fetchLaporan = () => {
    setLoading(true)
    const params = []
    if (filterStatus) params.push(`status=${filterStatus}`)
    if (filterPrioritas) params.push(`prioritas=${filterPrioritas}`)
    if (startDate) params.push(`startDate=${startDate}T00:00:00`)
    if (endDate) params.push(`endDate=${endDate}T23:59:59`)
    const url = '/api/laporan' + (params.length ? '?' + params.join('&') : '')

    api.get(url)
      .then(res => setLaporan(res.data.data || []))
      .catch(() => setLaporan([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchLaporan() }, [filterStatus, filterPrioritas, startDate, endDate])

  const exportPDF = () => {
    const doc = new jsPDF()

    doc.setFontSize(14)
    doc.text('Laporan Pengaduan Fasilitas Kampus', 14, 15)
    doc.setFontSize(10)
    doc.text('STMIK Mardira Indonesia', 14, 22)
    doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 28)

    const filterInfo = []
    if (filterStatus) filterInfo.push(`Status: ${filterStatus}`)
    if (filterPrioritas) filterInfo.push(`Prioritas: ${filterPrioritas}`)
    if (startDate) filterInfo.push(`Dari: ${new Date(startDate).toLocaleDateString('id-ID')}`)
    if (endDate) filterInfo.push(`Sampai: ${new Date(endDate).toLocaleDateString('id-ID')}`)
    if (filterInfo.length > 0) {
      doc.text(`Filter: ${filterInfo.join(' | ')}`, 14, 34)
    }

    autoTable(doc, {
      startY: filterInfo.length > 0 ? 40 : 35,
      head: [['No', 'Nomor', 'Judul', 'Mahasiswa', 'Prioritas', 'Status', 'Teknisi', 'Tanggal']],
      body: laporan.map((p, i) => [
        i + 1,
        p.nomorPengaduan,
        p.judul,
        p.mahasiswa?.namaLengkap || '-',
        p.prioritas,
        p.status,
        p.teknisi?.namaLengkap || '-',
        new Date(p.createdAt).toLocaleDateString('id-ID'),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] },
    })

    const filename = `laporan-pengaduan${startDate ? `-${startDate}` : ''}${endDate ? `-sd-${endDate}` : ''}-${new Date().toISOString().slice(0, 10)}.pdf`
    doc.save(filename)
  }

  const handleReset = () => {
    setFilterStatus('')
    setFilterPrioritas('')
    setStartDate('')
    setEndDate('')
  }

  return (
    <SuperAdminLayout>
      <div className="px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Laporan Pengaduan</h2>
            <p className="text-sm text-gray-500 mt-1">Filter dan export data laporan</p>
          </div>
          <button
            onClick={exportPDF}
            disabled={laporan.length === 0}
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition disabled:opacity-50"
          >
            ↓ Export PDF
          </button>
        </div>

        {/* Filter */}
        <div className="flex gap-3 mb-6 flex-wrap items-end">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Status</option>
            {['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => (
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
          <div className="flex items-center gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Dari Tanggal</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Sampai Tanggal</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          {(filterStatus || filterPrioritas || startDate || endDate) && (
            <button
              onClick={handleReset}
              className="border border-gray-300 text-gray-600 text-sm px-3 py-2 rounded-lg hover:bg-gray-50 transition"
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: laporan.length, color: 'text-gray-700' },
            { label: 'Pending', value: laporan.filter(p => p.status === 'PENDING').length, color: 'text-yellow-600' },
            { label: 'Diproses', value: laporan.filter(p => p.status === 'IN_PROGRESS').length, color: 'text-blue-600' },
            { label: 'Selesai', value: laporan.filter(p => p.status === 'RESOLVED').length, color: 'text-green-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="px-5 py-10 text-center text-sm text-gray-400">Memuat...</div>
          ) : laporan.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-400">Tidak ada data laporan.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">No</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Nomor</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Judul</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Mahasiswa</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Prioritas</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Teknisi</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {laporan.map((p, i) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-400">{i + 1}</td>
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
                    <td className="px-5 py-3 text-gray-600 text-xs">{p.teknisi?.namaLengkap || '-'}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {new Date(p.createdAt).toLocaleDateString('id-ID')}
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
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import MahasiswaDashboard from './pages/dashboard/MahasiswaDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import TeknisiDashboard from './pages/dashboard/TeknisiDashboard'
import SuperAdminDashboard from './pages/dashboard/SuperAdminDashboard'
import BuatPengaduan from './pages/pengaduan/BuatPengaduan'
import DetailPengaduan from './pages/pengaduan/DetailPengaduan'
import RiwayatPengaduan from './pages/pengaduan/RiwayatPengaduan'
import EditProfil from './pages/mahasiswa/EditProfil'
import AdminPengaduan from './pages/admin/AdminPengaduan'
import AdminFasilitas from './pages/admin/AdminFasilitas'
import AdminTeknisi from './pages/admin/AdminTeknisi'
import AdminMahasiswa from './pages/admin/AdminMahasiswa'
import AdminLaporan from './pages/admin/AdminLaporan'
import SuperAdminAdmin from './pages/superadmin/SuperAdminAdmin'
import SuperAdminPengaduan from './pages/superadmin/SuperAdminPengaduan'
import SuperAdminFasilitas from './pages/superadmin/SuperAdminFasilitas'
import SuperAdminTeknisi from './pages/superadmin/SuperAdminTeknisi'
import SuperAdminMahasiswa from './pages/superadmin/SuperAdminMahasiswa'
import SuperAdminLaporan from './pages/superadmin/SuperAdminLaporan'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/mahasiswa" element={<PrivateRoute roles={['MAHASISWA']}><MahasiswaDashboard /></PrivateRoute>} />
          <Route path="/mahasiswa/pengaduan/buat" element={<PrivateRoute roles={['MAHASISWA']}><BuatPengaduan /></PrivateRoute>} />
          <Route path="/mahasiswa/pengaduan/:id" element={<PrivateRoute roles={['MAHASISWA']}><DetailPengaduan /></PrivateRoute>} />
          <Route path="/mahasiswa/riwayat" element={<PrivateRoute roles={['MAHASISWA']}><RiwayatPengaduan /></PrivateRoute>} />
          <Route path="/mahasiswa/profil" element={<PrivateRoute roles={['MAHASISWA']}><EditProfil /></PrivateRoute>} />

          <Route path="/admin" element={<PrivateRoute roles={['ADMIN']}><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/pengaduan" element={<PrivateRoute roles={['ADMIN']}><AdminPengaduan /></PrivateRoute>} />
          <Route path="/admin/fasilitas" element={<PrivateRoute roles={['ADMIN']}><AdminFasilitas /></PrivateRoute>} />
          <Route path="/admin/teknisi" element={<PrivateRoute roles={['ADMIN']}><AdminTeknisi /></PrivateRoute>} />
          <Route path="/admin/mahasiswa" element={<PrivateRoute roles={['ADMIN']}><AdminMahasiswa /></PrivateRoute>} />
          <Route path="/admin/laporan" element={<PrivateRoute roles={['ADMIN']}><AdminLaporan /></PrivateRoute>} />

          <Route path="/teknisi" element={<PrivateRoute roles={['TEKNISI']}><TeknisiDashboard /></PrivateRoute>} />

          <Route path="/superadmin" element={<PrivateRoute roles={['SUPER_ADMIN']}><SuperAdminDashboard /></PrivateRoute>} />
          <Route path="/superadmin/admin" element={<PrivateRoute roles={['SUPER_ADMIN']}><SuperAdminAdmin /></PrivateRoute>} />
          <Route path="/superadmin/pengaduan" element={<PrivateRoute roles={['SUPER_ADMIN']}><SuperAdminPengaduan /></PrivateRoute>} />
          <Route path="/superadmin/fasilitas" element={<PrivateRoute roles={['SUPER_ADMIN']}><SuperAdminFasilitas /></PrivateRoute>} />
          <Route path="/superadmin/teknisi" element={<PrivateRoute roles={['SUPER_ADMIN']}><SuperAdminTeknisi /></PrivateRoute>} />
          <Route path="/superadmin/mahasiswa" element={<PrivateRoute roles={['SUPER_ADMIN']}><SuperAdminMahasiswa /></PrivateRoute>} />
          <Route path="/superadmin/laporan" element={<PrivateRoute roles={['SUPER_ADMIN']}><SuperAdminLaporan /></PrivateRoute>} />

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
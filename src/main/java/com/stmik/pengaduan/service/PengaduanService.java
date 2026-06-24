package com.stmik.pengaduan.service;

import com.stmik.pengaduan.dto.request.AssignRequest;
import com.stmik.pengaduan.dto.request.PengaduanRequest;
import com.stmik.pengaduan.dto.request.UpdateStatusRequest;
import com.stmik.pengaduan.entity.*;
import com.stmik.pengaduan.enums.PrioritasEnum;
import com.stmik.pengaduan.enums.StatusEnum;
import com.stmik.pengaduan.exception.BadRequestException;
import com.stmik.pengaduan.exception.ResourceNotFoundException;
import com.stmik.pengaduan.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class PengaduanService {

    @Autowired private PengaduanRepository pengaduanRepo;
    @Autowired private MahasiswaRepository mahasiswaRepo;
    @Autowired private FasilitasRepository fasilitasRepo;
    @Autowired private TeknisiRepository teknisiRepo;
    @Autowired private AdminRepository adminRepo;
    @Autowired private RiwayatStatusRepository riwayatRepo;
    @Autowired private UserRepository userRepo;

    /*
     * ==========================================
     * SUBMIT PENGADUAN (UC-03)
     * ==========================================
     * Alur:
     * 1. Ambil data mahasiswa yang sedang login
     * 2. Validasi fasilitas ada dan aktif
     * 3. Generate nomor pengaduan
     * 4. Simpan pengaduan dengan status PENDING
     * 5. Catat riwayat status awal
     * 6. Jika prioritas HIGH → jalankan auto assign (UC-10)
     */
    @Transactional
    public Pengaduan submitPengaduan(PengaduanRequest req) {
        // Ambil mahasiswa yang sedang login dari SecurityContext
        String username = getCurrentUsername();
        User user = userRepo.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        Mahasiswa mahasiswa = mahasiswaRepo.findById(user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Data mahasiswa tidak ditemukan"));

        // Validasi fasilitas
        Fasilitas fasilitas = fasilitasRepo.findById(req.getIdFasilitas())
            .orElseThrow(() -> new ResourceNotFoundException("Fasilitas tidak ditemukan"));

        if (!fasilitas.getIsActive()) {
            throw new BadRequestException("Fasilitas tidak aktif");
        }

        // Generate nomor pengaduan: ADU-YYYYMMDD-XXXX
        String nomorPengaduan = generateNomorPengaduan();

        Pengaduan pengaduan = new Pengaduan();
        pengaduan.setNomorPengaduan(nomorPengaduan);
        pengaduan.setJudul(req.getJudul());
        pengaduan.setDeskripsi(req.getDeskripsi());
        pengaduan.setJenisKerusakan(req.getJenisKerusakan());
        pengaduan.setPrioritas(req.getPrioritas());
        pengaduan.setStatus(StatusEnum.PENDING);
        pengaduan.setMahasiswa(mahasiswa);
        pengaduan.setFasilitas(fasilitas);

        Pengaduan saved = pengaduanRepo.save(pengaduan);

        // Catat riwayat status awal
        tambahRiwayat(saved, null, StatusEnum.PENDING, "Pengaduan baru dibuat");

        // UC-10: Auto-assign jika prioritas HIGH
        if (req.getPrioritas() == PrioritasEnum.HIGH) {
            autoAssign(saved);
        }

        return saved;
    }

     // Cari teknisi aktif dgn beban kerja paling ringan. kl gada teknisi akan pertahankan status PENDING.

    @Transactional
    public void autoAssign(Pengaduan pengaduan) {
        List<Teknisi> teknisiList = teknisiRepo.findTeknisiWithLeastActiveTask();

        if (teknisiList.isEmpty()) {
            //kl gada teknisi aktif status ttep PENDING
            System.out.println("[AUTO-ASSIGN] Tidak ada teknisi tersedia untuk pengaduan: "
                + pengaduan.getNomorPengaduan());
            return;
        }

        Teknisi teknisi = teknisiList.get(0); // teknisi dengan tugas paling sedikit
        StatusEnum statusLama = pengaduan.getStatus();

        pengaduan.setTeknisi(teknisi);
        pengaduan.setStatus(StatusEnum.IN_PROGRESS);
        pengaduanRepo.save(pengaduan);

        tambahRiwayat(pengaduan, statusLama, StatusEnum.IN_PROGRESS,
            "Auto-assign ke Teknisi: " + teknisi.getNip() + " (Prioritas HIGH)");

        System.out.println("[AUTO-ASSIGN] Pengaduan " + pengaduan.getNomorPengaduan()
            + " diassign ke teknisi NIP: " + teknisi.getNip());
    }

    /*
     * ==========================================
     * ASSIGN MANUAL OLEH ADMIN (UC-09)
     * ==========================================
     */
    @Transactional
    public Pengaduan assignTeknisi(Integer pengaduanId, AssignRequest req) {
        Pengaduan pengaduan = findById(pengaduanId);

        if (pengaduan.getStatus() != StatusEnum.PENDING) {
            throw new BadRequestException(
                "Pengaduan hanya bisa di-assign jika status PENDING. Status saat ini: "
                + pengaduan.getStatus()
            );
        }

        Teknisi teknisi = teknisiRepo.findById(req.getIdTeknisi())
            .orElseThrow(() -> new ResourceNotFoundException("Teknisi tidak ditemukan"));

        if (!teknisi.getIsActive()) {
            throw new BadRequestException("Teknisi tidak aktif");
        }

        // Ambil admin yang melakukan assign
        String username = getCurrentUsername();
        User adminUser = userRepo.findByUsername(username).orElse(null);

        StatusEnum statusLama = pengaduan.getStatus();
        pengaduan.setTeknisi(teknisi);
        pengaduan.setStatus(StatusEnum.IN_PROGRESS);

        if (adminUser != null) {
            adminRepo.findById(adminUser.getId()).ifPresent(pengaduan::setAdmin);
        }

        Pengaduan saved = pengaduanRepo.save(pengaduan);
        tambahRiwayat(saved, statusLama, StatusEnum.IN_PROGRESS,
            "Assigned ke teknisi NIP: " + teknisi.getNip());

        return saved;
    }

    /*
     * ==========================================
     * UPDATE STATUS OLEH TEKNISI (UC-12)
     * ==========================================
     */
    @Transactional
    public Pengaduan updateStatus(Integer pengaduanId, UpdateStatusRequest req) {
        Pengaduan pengaduan = findById(pengaduanId);

        // Pastikan teknisi hanya bisa update pengaduan yang ditugaskan kepadanya
        String username = getCurrentUsername();
        User user = userRepo.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        if (pengaduan.getTeknisi() == null ||
            !pengaduan.getTeknisi().getId().equals(user.getId())) {
            throw new BadRequestException(
                "Anda hanya bisa mengupdate pengaduan yang ditugaskan kepada Anda"
            );
        }

        StatusEnum statusLama = pengaduan.getStatus();
        pengaduan.setStatus(req.getStatus());
        Pengaduan saved = pengaduanRepo.save(pengaduan);

        tambahRiwayat(saved, statusLama, req.getStatus(),
            req.getCatatan() != null ? req.getCatatan() : "Status diperbarui");

        return saved;
    }

    // ==========================================
    // QUERY METHODS
    // ==========================================

    public List<Pengaduan> getRiwayatByMahasiswa() {
        String username = getCurrentUsername();
        User user = userRepo.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));
        return pengaduanRepo.findByMahasiswaIdOrderByCreatedAtDesc(user.getId());
    }

    public List<Pengaduan> getTugasByTeknisi() {
        String username = getCurrentUsername();
        User user = userRepo.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));
        return pengaduanRepo.findByTeknisiIdOrderByCreatedAtDesc(user.getId());
    }

    public List<Pengaduan> getAllPengaduan(StatusEnum status, PrioritasEnum prioritas,
                                            LocalDateTime startDate, LocalDateTime endDate) {
        return pengaduanRepo.findWithFilters(status, prioritas, startDate, endDate);
    }

    public Pengaduan getDetailById(Integer id) {
        return findById(id);
    }

    public List<RiwayatStatus> getRiwayatStatus(Integer pengaduanId) {
        findById(pengaduanId); // validasi pengaduan ada
        return riwayatRepo.findByPengaduanIdOrderByChangedAtAsc(pengaduanId);
    }

    // ==========================================
    // HELPER METHODS
    // ==========================================

    private Pengaduan findById(Integer id) {
        return pengaduanRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Pengaduan dengan ID " + id + " tidak ditemukan"
            ));
    }

    private void tambahRiwayat(Pengaduan p, StatusEnum lama, StatusEnum baru, String catatan) {
        RiwayatStatus riwayat = new RiwayatStatus();
        riwayat.setPengaduan(p);
        riwayat.setStatusLama(lama);
        riwayat.setStatusBaru(baru);
        riwayat.setCatatan(catatan);
        riwayatRepo.save(riwayat);
    }

    /*
     * Generate nomor pengaduan dengan format: ADU-YYYYMMDD-XXXX
     * XXXX = nomor urut harian (0001, 0002, dst)
     * Contoh: ADU-20240615-0001
     */
    private String generateNomorPengaduan() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(23, 59, 59);

        long count = pengaduanRepo.countTodayPengaduan(startOfDay, endOfDay);
        String dateStr = today.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String sequence = String.format("%04d", count + 1);

        return "ADU-" + dateStr + "-" + sequence;
    }

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getName();
    }
}
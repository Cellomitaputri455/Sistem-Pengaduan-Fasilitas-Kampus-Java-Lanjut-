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
    @Autowired private NotifikasiService notifikasiService;

    @Transactional
    public Pengaduan submitPengaduan(PengaduanRequest req) {
        String username = getCurrentUsername();
        User user = userRepo.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        Mahasiswa mahasiswa = mahasiswaRepo.findById(user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Data mahasiswa tidak ditemukan"));

        Fasilitas fasilitas = fasilitasRepo.findById(req.getIdFasilitas())
            .orElseThrow(() -> new ResourceNotFoundException("Fasilitas tidak ditemukan"));

        if (!fasilitas.getIsActive()) {
            throw new BadRequestException("Fasilitas tidak aktif");
        }

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
        tambahRiwayat(saved, null, StatusEnum.PENDING, "Pengaduan baru dibuat");

        notifikasiService.kirimWA(
            mahasiswa.getNoHp(),
            "Pengaduan kamu *" + saved.getNomorPengaduan() + "* berhasil dibuat dan sedang menunggu penanganan."
        );

        if (req.getPrioritas() == PrioritasEnum.HIGH) {
            autoAssign(saved);
        }

        return saved;
    }

    @Transactional
    public void autoAssign(Pengaduan pengaduan) {
        List<Teknisi> teknisiList = teknisiRepo.findTeknisiWithLeastActiveTask();

        if (teknisiList.isEmpty()) {
            System.out.println("[AUTO-ASSIGN] Tidak ada teknisi tersedia untuk pengaduan: "
                + pengaduan.getNomorPengaduan());
            return;
        }

        Teknisi teknisi = teknisiList.get(0);
        StatusEnum statusLama = pengaduan.getStatus();

        pengaduan.setTeknisi(teknisi);
        pengaduan.setStatus(StatusEnum.IN_PROGRESS);
        pengaduanRepo.save(pengaduan);

        tambahRiwayat(pengaduan, statusLama, StatusEnum.IN_PROGRESS,
            "Auto-assign ke Teknisi: " + teknisi.getNip() + " (Prioritas HIGH)");

        notifikasiService.kirimWA(
            pengaduan.getMahasiswa().getNoHp(),
            "Pengaduan *" + pengaduan.getNomorPengaduan() + "* sedang ditangani oleh teknisi *"
            + teknisi.getNamaLengkap() + "*."
        );

        System.out.println("[AUTO-ASSIGN] Pengaduan " + pengaduan.getNomorPengaduan()
            + " diassign ke teknisi NIP: " + teknisi.getNip());
    }

    @Transactional
    public Pengaduan assignTeknisi(Integer pengaduanId, AssignRequest req) {
        Pengaduan pengaduan = findById(pengaduanId);

        if (pengaduan.getStatus() != StatusEnum.PENDING && 
            pengaduan.getStatus() != StatusEnum.IN_PROGRESS) {
            throw new BadRequestException(
                "Pengaduan hanya bisa di-assign jika status PENDING atau IN_PROGRESS. Status saat ini: "
                + pengaduan.getStatus()
            );
        }

        Teknisi teknisi = teknisiRepo.findById(req.getIdTeknisi())
            .orElseThrow(() -> new ResourceNotFoundException("Teknisi tidak ditemukan"));

        if (!teknisi.getIsActive()) {
            throw new BadRequestException("Teknisi tidak aktif");
        }

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

        notifikasiService.kirimWA(
            saved.getMahasiswa().getNoHp(),
            "Pengaduan *" + saved.getNomorPengaduan() + "* sedang ditangani oleh teknisi *"
            + teknisi.getNamaLengkap() + "*."
        );

        return saved;
    }

    @Transactional
    public Pengaduan updateStatus(Integer pengaduanId, UpdateStatusRequest req) {
        Pengaduan pengaduan = findById(pengaduanId);

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

        String pesan = req.getStatus() == StatusEnum.RESOLVED
            ? "Pengaduan *" + saved.getNomorPengaduan() + "* telah *SELESAI* ditangani. Silakan beri rating di aplikasi."
            : "Status pengaduan *" + saved.getNomorPengaduan() + "* diperbarui menjadi *" + req.getStatus() + "*.";

        notifikasiService.kirimWA(
            saved.getMahasiswa().getNoHp(),
            pesan
        );

        return saved;
    }

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
        findById(pengaduanId);
        return riwayatRepo.findByPengaduanIdOrderByChangedAtAsc(pengaduanId);
    }

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
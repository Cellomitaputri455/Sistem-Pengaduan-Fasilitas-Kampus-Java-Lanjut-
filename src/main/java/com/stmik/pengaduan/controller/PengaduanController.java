package com.stmik.pengaduan.controller;

import com.stmik.pengaduan.dto.request.AssignRequest;
import com.stmik.pengaduan.dto.request.PengaduanRequest;
import com.stmik.pengaduan.dto.request.UpdateStatusRequest;
import com.stmik.pengaduan.dto.response.ApiResponse;
import com.stmik.pengaduan.entity.Pengaduan;
import com.stmik.pengaduan.entity.RiwayatStatus;
import com.stmik.pengaduan.enums.PrioritasEnum;
import com.stmik.pengaduan.enums.StatusEnum;
import com.stmik.pengaduan.service.PengaduanService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/pengaduan")
public class PengaduanController {

    @Autowired
    private PengaduanService pengaduanService;

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_MAHASISWA')")
    public ResponseEntity<ApiResponse<Pengaduan>> submit(
            @Valid @RequestBody PengaduanRequest req) {
        Pengaduan result = pengaduanService.submitPengaduan(req);
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success("Pengaduan berhasil dibuat: "
                + result.getNomorPengaduan(), result));
    }

    @GetMapping("/riwayat")
    @PreAuthorize("hasAuthority('ROLE_MAHASISWA')")
    public ResponseEntity<ApiResponse<List<Pengaduan>>> getRiwayat() {
        return ResponseEntity.ok(
            ApiResponse.success("Berhasil", pengaduanService.getRiwayatByMahasiswa()));
    }

    @GetMapping("/tugas")
    @PreAuthorize("hasAuthority('ROLE_TEKNISI')")
    public ResponseEntity<ApiResponse<List<Pengaduan>>> getTugas() {
        return ResponseEntity.ok(
            ApiResponse.success("Berhasil", pengaduanService.getTugasByTeknisi()));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<Pengaduan>>> getAll(
            @RequestParam(required = false) StatusEnum status,
            @RequestParam(required = false) PrioritasEnum prioritas) {
        List<Pengaduan> list = pengaduanService.getAllPengaduan(status, prioritas, null, null);
        return ResponseEntity.ok(ApiResponse.success("Berhasil", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Pengaduan>> getDetail(@PathVariable Integer id) {
        return ResponseEntity.ok(
            ApiResponse.success("Berhasil", pengaduanService.getDetailById(id)));
    }

    @GetMapping("/{id}/riwayat-status")
    public ResponseEntity<ApiResponse<List<RiwayatStatus>>> getRiwayatStatus(
            @PathVariable Integer id) {
        return ResponseEntity.ok(
            ApiResponse.success("Berhasil", pengaduanService.getRiwayatStatus(id)));
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Pengaduan>> assign(
            @PathVariable Integer id,
            @Valid @RequestBody AssignRequest req) {
        return ResponseEntity.ok(
            ApiResponse.success("Pengaduan berhasil diassign",
                pengaduanService.assignTeknisi(id, req)));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ROLE_TEKNISI')")
    public ResponseEntity<ApiResponse<Pengaduan>> updateStatus(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateStatusRequest req) {
        return ResponseEntity.ok(
            ApiResponse.success("Status berhasil diperbarui",
                pengaduanService.updateStatus(id, req)));
    }
}
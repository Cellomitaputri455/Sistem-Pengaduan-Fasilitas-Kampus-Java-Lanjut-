package com.stmik.pengaduan.controller;

import com.stmik.pengaduan.dto.response.ApiResponse;
import com.stmik.pengaduan.entity.Mahasiswa;
import com.stmik.pengaduan.exception.ResourceNotFoundException;
import com.stmik.pengaduan.repository.MahasiswaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/mahasiswa")
public class MahasiswaController {

    @Autowired
    private MahasiswaRepository mahasiswaRepo;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<Mahasiswa>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Berhasil", mahasiswaRepo.findAll()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Mahasiswa>> getById(@PathVariable Integer id) {
        Mahasiswa m = mahasiswaRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Mahasiswa tidak ditemukan"));
        return ResponseEntity.ok(ApiResponse.success("Berhasil", m));
    }

    @PatchMapping("/{id}/nonaktifkan")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> nonaktifkan(@PathVariable Integer id) {
        Mahasiswa m = mahasiswaRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Mahasiswa tidak ditemukan"));
        m.setIsActive(false);
        mahasiswaRepo.save(m);
        return ResponseEntity.ok(ApiResponse.success("Akun mahasiswa berhasil dinonaktifkan"));
    }

    @PatchMapping("/{id}/aktifkan")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> aktifkan(@PathVariable Integer id) {
        Mahasiswa m = mahasiswaRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Mahasiswa tidak ditemukan"));
        m.setIsActive(true);
        mahasiswaRepo.save(m);
        return ResponseEntity.ok(ApiResponse.success("Akun mahasiswa berhasil diaktifkan"));
    }
}
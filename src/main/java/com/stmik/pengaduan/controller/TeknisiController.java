package com.stmik.pengaduan.controller;

import com.stmik.pengaduan.dto.request.TeknisiRequest;
import com.stmik.pengaduan.dto.response.ApiResponse;
import com.stmik.pengaduan.entity.Teknisi;
import com.stmik.pengaduan.service.TeknisiService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/teknisi")
public class TeknisiController {

    @Autowired
    private TeknisiService teknisiService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<Teknisi>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Berhasil", teknisiService.getAll()));
    }

    @GetMapping("/aktif")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<Teknisi>>> getAktif() {
        return ResponseEntity.ok(ApiResponse.success("Berhasil", teknisiService.getAktif()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Teknisi>> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success("Berhasil", teknisiService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Teknisi>> tambah(
            @Valid @RequestBody TeknisiRequest req) {
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success("Teknisi berhasil ditambahkan",
                teknisiService.tambah(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Teknisi>> edit(
            @PathVariable Integer id,
            @Valid @RequestBody TeknisiRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Teknisi berhasil diperbarui",
            teknisiService.edit(id, req)));
    }

    @PatchMapping("/{id}/nonaktifkan")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> nonaktifkan(@PathVariable Integer id) {
        teknisiService.toggleAktif(id, false);
        return ResponseEntity.ok(ApiResponse.success("Akun teknisi dinonaktifkan"));
    }

    @PatchMapping("/{id}/aktifkan")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> aktifkan(@PathVariable Integer id) {
        teknisiService.toggleAktif(id, true);
        return ResponseEntity.ok(ApiResponse.success("Akun teknisi diaktifkan kembali"));
    }
}
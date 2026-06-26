package com.stmik.pengaduan.controller;

import com.stmik.pengaduan.dto.request.FasilitasRequest;
import com.stmik.pengaduan.dto.response.ApiResponse;
import com.stmik.pengaduan.entity.Fasilitas;
import com.stmik.pengaduan.service.FasilitasService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/fasilitas")
public class FasilitasController {

    @Autowired
    private FasilitasService fasilitasService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Fasilitas>>> getAll(
            @RequestParam(required = false) String search) {
        List<Fasilitas> list = search != null
            ? fasilitasService.search(search)
            : fasilitasService.getAll();
        return ResponseEntity.ok(ApiResponse.success("Berhasil", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Fasilitas>> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success("Berhasil", fasilitasService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Fasilitas>> tambah(
            @Valid @RequestBody FasilitasRequest req) {
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success("Fasilitas berhasil ditambahkan",
                fasilitasService.tambah(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Fasilitas>> edit(
            @PathVariable Integer id,
            @Valid @RequestBody FasilitasRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Fasilitas berhasil diperbarui",
            fasilitasService.edit(id, req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> nonaktifkan(@PathVariable Integer id) {
        fasilitasService.nonaktifkan(id);
        return ResponseEntity.ok(ApiResponse.success("Fasilitas berhasil dinonaktifkan"));
    }

    @PatchMapping("/{id}/aktifkan")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> aktifkan(@PathVariable Integer id) {
        fasilitasService.aktifkan(id);
        return ResponseEntity.ok(ApiResponse.success("Fasilitas berhasil diaktifkan"));
    }
}
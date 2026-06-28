package com.stmik.pengaduan.controller;

import com.stmik.pengaduan.dto.response.ApiResponse;
import com.stmik.pengaduan.entity.BuktiFoto;
import com.stmik.pengaduan.service.BuktiFotoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/pengaduan/{pengaduanId}/bukti")
public class BuktiFotoController {

    @Autowired
    private BuktiFotoService buktiFotoService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_TEKNISI','ROLE_MAHASISWA')")
    public ResponseEntity<ApiResponse<BuktiFoto>> upload(
            @PathVariable Integer pengaduanId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws IOException {

        String role = authentication.getAuthorities().stream()
            .findFirst()
            .map(a -> a.getAuthority().replace("ROLE_", ""))
            .orElse("UNKNOWN");

        BuktiFoto result = buktiFotoService.upload(pengaduanId, file, role);
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success("Bukti foto berhasil diupload", result));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BuktiFoto>>> getAll(
            @PathVariable Integer pengaduanId) {
        return ResponseEntity.ok(
            ApiResponse.success("Berhasil", buktiFotoService.getByPengaduan(pengaduanId))
        );
    }

    @GetMapping("/file/{filename:.+}")
    public ResponseEntity<Resource> serveFile(
            @PathVariable String filename) throws IOException {
        Path filePath = Paths.get("uploads/bukti-foto").resolve(filename);
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        String contentType = Files.probeContentType(filePath);
        if (contentType == null) contentType = "application/octet-stream";

        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(contentType))
            .body(resource);
    }

    @DeleteMapping("/{buktiId}")
    @PreAuthorize("hasAnyAuthority('ROLE_TEKNISI','ROLE_ADMIN','ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> hapus(
            @PathVariable Integer pengaduanId,
            @PathVariable Integer buktiId) {
        buktiFotoService.hapus(buktiId);
        return ResponseEntity.ok(ApiResponse.success("Bukti foto berhasil dihapus"));
    }
}
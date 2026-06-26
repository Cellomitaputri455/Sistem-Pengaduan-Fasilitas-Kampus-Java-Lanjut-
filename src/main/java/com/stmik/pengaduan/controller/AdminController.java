package com.stmik.pengaduan.controller;

import com.stmik.pengaduan.dto.response.ApiResponse;
import com.stmik.pengaduan.entity.Admin;
import com.stmik.pengaduan.enums.RoleEnum;
import com.stmik.pengaduan.exception.BadRequestException;
import com.stmik.pengaduan.exception.ResourceNotFoundException;
import com.stmik.pengaduan.repository.AdminRepository;
import com.stmik.pengaduan.repository.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired private AdminRepository adminRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private PasswordEncoder passwordEncoder;

    @Data
    static class AdminRequest {
        @NotNull private Integer nip;
        @NotBlank private String namaLengkap;
        @NotBlank @Email private String email;
        @Pattern(regexp = "^[1-9][0-9]{8,12}$",
                 message = "Format No Telepon tidak valid")
        private String noHp;
        @NotBlank @Size(min = 8) private String password;
    }

    @Data
    static class AdminEditRequest {
        @NotNull private Integer nip;
        @NotBlank private String namaLengkap;
        @NotBlank @Email private String email;
        @Pattern(regexp = "^[1-9][0-9]{8,12}$",
                message = "Format No Telepon tidak valid")
        private String noHp;
        @Size(min = 8) private String password; // tidak @NotBlank
    }

    // GET semua admin - hanya SuperAdmin
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<Admin>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Berhasil", adminRepo.findAll()));
    }

    // POST tambah admin - hanya SuperAdmin (UC-17)
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Admin>> tambah(@Valid @RequestBody AdminRequest req) {
        if (adminRepo.existsByNip(req.getNip())) {
            throw new BadRequestException("NIP " + req.getNip() + " sudah terdaftar");
        }
        if (userRepo.existsByEmail(req.getEmail())) {
            throw new BadRequestException("Email sudah terdaftar");
        }

        Admin admin = new Admin();
        admin.setNip(req.getNip());
        admin.setUsername(req.getNip().toString());
        admin.setNamaLengkap(req.getNamaLengkap());
        admin.setEmail(req.getEmail());
        admin.setNoHp(req.getNoHp());
        admin.setPassword(passwordEncoder.encode(req.getPassword()));
        admin.setRole(RoleEnum.ADMIN);
        admin.setIsActive(true);

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success("Admin berhasil ditambahkan", adminRepo.save(admin)));
    }

    // PATCH nonaktifkan admin
    @PatchMapping("/{id}/nonaktifkan")
    @PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> nonaktifkan(@PathVariable Integer id) {
        Admin a = adminRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Admin tidak ditemukan"));
        a.setIsActive(false);
        adminRepo.save(a);
        return ResponseEntity.ok(ApiResponse.success("Admin berhasil dinonaktifkan"));
    }

    // PATCH aktifkan admin
    @PatchMapping("/{id}/aktifkan")
    @PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> aktifkan(@PathVariable Integer id) {
        Admin a = adminRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Admin tidak ditemukan"));
        a.setIsActive(true);
        adminRepo.save(a);
        return ResponseEntity.ok(ApiResponse.success("Admin berhasil diaktifkan"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Admin>> edit(
            @PathVariable Integer id,
            @Valid @RequestBody AdminEditRequest req) {
        Admin a = adminRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Admin tidak ditemukan"));
        a.setNip(req.getNip());
        a.setNamaLengkap(req.getNamaLengkap());
        a.setEmail(req.getEmail());
        a.setNoHp(req.getNoHp());
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            a.setPassword(passwordEncoder.encode(req.getPassword()));
        }
        return ResponseEntity.ok(ApiResponse.success("Admin berhasil diperbarui", adminRepo.save(a)));
    }
}
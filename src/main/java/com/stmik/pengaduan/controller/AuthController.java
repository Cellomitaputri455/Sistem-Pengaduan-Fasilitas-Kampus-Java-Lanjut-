package com.stmik.pengaduan.controller;

import com.stmik.pengaduan.dto.request.LoginRequest;
import com.stmik.pengaduan.dto.request.RegisterRequest;
import com.stmik.pengaduan.dto.request.UpdateProfilRequest;
import com.stmik.pengaduan.entity.User;
import com.stmik.pengaduan.dto.response.ApiResponse;
import com.stmik.pengaduan.dto.response.JwtResponse;
import com.stmik.pengaduan.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody RegisterRequest req) {
        authService.register(req);
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success("Registrasi berhasil. Silakan login."));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtResponse>> login(@Valid @RequestBody LoginRequest req) {
        JwtResponse response = authService.login(req);
        return ResponseEntity.ok(ApiResponse.success("Login berhasil", response));
    }

    @PutMapping("/profil")
    public ResponseEntity<ApiResponse<User>> updateProfil(
            @Valid @RequestBody UpdateProfilRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Profil berhasil diperbarui",
            authService.updateProfil(req)));
    }
}
package com.stmik.pengaduan.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotNull(message = "NIM tidak boleh kosong")
    @Min(value = 1000000, message = "Format NIM tidak valid (minimal 7 digit)")
    private Integer nim;

    @NotBlank(message = "Nama lengkap tidak boleh kosong")
    @Size(min = 3, max = 100, message = "Nama lengkap minimal 3 karakter")
    private String namaLengkap;

    @NotBlank(message = "Email tidak boleh kosong")
    @Email(message = "Format email tidak valid")
    private String email;

    @NotBlank(message = "Nomor HP tidak boleh kosong")
    @Pattern(
        regexp = "^[1-9][0-9]{8,12}$",
        message = "Format No Telepon tidak valid, tidak boleh diawali angka 0"
    )
    private String noHp;

    @NotBlank(message = "Password tidak boleh kosong")
    @Size(min = 8, message = "Password minimal 8 karakter")
    private String password;

    @NotBlank(message = "Konfirmasi password tidak boleh kosong")
    private String konfirmasiPassword;
}
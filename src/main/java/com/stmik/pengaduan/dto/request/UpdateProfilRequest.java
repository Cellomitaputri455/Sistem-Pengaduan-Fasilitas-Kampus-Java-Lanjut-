package com.stmik.pengaduan.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UpdateProfilRequest {

    @NotBlank(message = "Nama lengkap tidak boleh kosong")
    private String namaLengkap;

    @NotBlank(message = "Email tidak boleh kosong")
    @Email(message = "Format email tidak valid")
    private String email;

    @Pattern(
        regexp = "^[1-9][0-9]{8,12}$",
        message = "Format No Telepon tidak valid, tidak boleh diawali angka 0"
    )
    private String noHp;

    private String password;
}
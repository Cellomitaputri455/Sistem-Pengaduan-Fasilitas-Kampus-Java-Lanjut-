package com.stmik.pengaduan.dto.request;

import com.stmik.pengaduan.enums.StatusTeknisi;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class TeknisiRequest {

    @NotNull(message = "NIP tidak boleh kosong")
    private Integer nip;

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

    @NotBlank(message = "Password tidak boleh kosong")
    @Size(min = 8, message = "Password minimal 8 karakter")
    private String password;

    private String spesialisasi;

    private StatusTeknisi statusKetersediaan;
}
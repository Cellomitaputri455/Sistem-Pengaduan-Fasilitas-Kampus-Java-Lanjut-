package com.stmik.pengaduan.dto.request;

import com.stmik.pengaduan.enums.JenisKerusakanEnum;
import com.stmik.pengaduan.enums.PrioritasEnum;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class PengaduanRequest {

    @NotBlank(message = "Judul tidak boleh kosong")
    @Size(max = 200, message = "Judul maksimal 200 karakter")
    private String judul;

    @NotBlank(message = "Deskripsi tidak boleh kosong")
    private String deskripsi;

    @NotNull(message = "Jenis kerusakan tidak boleh kosong")
    private JenisKerusakanEnum jenisKerusakan;

    @NotNull(message = "Prioritas tidak boleh kosong")
    private PrioritasEnum prioritas;

    @NotNull(message = "ID fasilitas tidak boleh kosong")
    private Integer idFasilitas;
}
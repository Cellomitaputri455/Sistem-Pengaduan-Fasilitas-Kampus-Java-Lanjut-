package com.stmik.pengaduan.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FasilitasRequest {

    @NotBlank(message = "Nama fasilitas tidak boleh kosong")
    private String nama;

    @NotBlank(message = "Kategori tidak boleh kosong")
    private String kategori;

    @NotBlank(message = "Lokasi tidak boleh kosong")
    private String lokasi;

    private String deskripsi;
}
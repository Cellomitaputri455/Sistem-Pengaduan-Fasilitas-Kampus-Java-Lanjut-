package com.stmik.pengaduan.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignRequest {

    @NotNull(message = "ID teknisi tidak boleh kosong")
    private Integer idTeknisi;
}
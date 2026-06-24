package com.stmik.pengaduan.dto.request;

import com.stmik.pengaduan.enums.StatusEnum;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateStatusRequest {

    @NotNull(message = "Status tidak boleh kosong")
    private StatusEnum status;

    private String catatan;
}
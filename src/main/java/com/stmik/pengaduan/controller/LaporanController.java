package com.stmik.pengaduan.controller;

import com.stmik.pengaduan.dto.response.ApiResponse;
import com.stmik.pengaduan.entity.Pengaduan;
import com.stmik.pengaduan.enums.PrioritasEnum;
import com.stmik.pengaduan.enums.StatusEnum;
import com.stmik.pengaduan.service.LaporanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/laporan")
public class LaporanController {

    @Autowired
    private LaporanService laporanService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<Pengaduan>>> getLaporan(
            @RequestParam(required = false) StatusEnum status,
            @RequestParam(required = false) PrioritasEnum prioritas,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        List<Pengaduan> data = laporanService.getLaporan(status, prioritas, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Berhasil", data));
    }
}
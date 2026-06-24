package com.stmik.pengaduan.controller;

import com.stmik.pengaduan.dto.request.RatingRequest;
import com.stmik.pengaduan.dto.response.ApiResponse;
import com.stmik.pengaduan.entity.Rating;
import com.stmik.pengaduan.service.RatingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pengaduan/{pengaduanId}/rating")
public class RatingController {

    @Autowired
    private RatingService ratingService;

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_MAHASISWA')")
    public ResponseEntity<ApiResponse<Rating>> buat(
            @PathVariable Integer pengaduanId,
            @Valid @RequestBody RatingRequest req) {
        Rating result = ratingService.buatRating(pengaduanId, req);
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success("Rating berhasil disimpan", result));
    }
}
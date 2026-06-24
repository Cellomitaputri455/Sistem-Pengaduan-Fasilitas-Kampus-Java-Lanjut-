package com.stmik.pengaduan.service;

import com.stmik.pengaduan.dto.request.RatingRequest;
import com.stmik.pengaduan.entity.Pengaduan;
import com.stmik.pengaduan.entity.Rating;
import com.stmik.pengaduan.enums.StatusEnum;
import com.stmik.pengaduan.exception.BadRequestException;
import com.stmik.pengaduan.exception.ResourceNotFoundException;
import com.stmik.pengaduan.repository.PengaduanRepository;
import com.stmik.pengaduan.repository.RatingRepository;
import com.stmik.pengaduan.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RatingService {

    @Autowired private RatingRepository ratingRepo;
    @Autowired private PengaduanRepository pengaduanRepo;
    @Autowired private UserRepository userRepo;

    @Transactional
    public Rating buatRating(Integer pengaduanId, RatingRequest req) {
        Pengaduan pengaduan = pengaduanRepo.findById(pengaduanId)
            .orElseThrow(() -> new ResourceNotFoundException("Pengaduan tidak ditemukan"));

        if (pengaduan.getStatus() != StatusEnum.RESOLVED) {
            throw new BadRequestException(
                "Rating hanya bisa diberikan untuk pengaduan berstatus RESOLVED"
            );
        }

        if (ratingRepo.existsByPengaduanId(pengaduanId)) {
            throw new BadRequestException("Pengaduan ini sudah pernah diberi rating");
        }

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        var user = userRepo.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        if (!pengaduan.getMahasiswa().getId().equals(user.getId())) {
            throw new BadRequestException(
                "Anda hanya bisa memberi rating untuk pengaduan Anda sendiri"
            );
        }

        Rating rating = new Rating();
        rating.setPengaduan(pengaduan);
        rating.setNilai(req.getNilai());
        rating.setFeedback(req.getFeedback());
        return ratingRepo.save(rating);
    }
}
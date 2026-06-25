package com.stmik.pengaduan.service;

import com.stmik.pengaduan.entity.Pengaduan;
import com.stmik.pengaduan.enums.PrioritasEnum;
import com.stmik.pengaduan.enums.StatusEnum;
import com.stmik.pengaduan.repository.PengaduanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class LaporanService {

    @Autowired
    private PengaduanRepository pengaduanRepo;

    public List<Pengaduan> getLaporan(
            StatusEnum status,
            PrioritasEnum prioritas,
            LocalDateTime startDate,
            LocalDateTime endDate) {
        return pengaduanRepo.findWithFilters(status, prioritas, startDate, endDate);
    }
}
package com.stmik.pengaduan.repository;

import com.stmik.pengaduan.entity.RiwayatStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository

public interface RiwayatStatusRepository extends JpaRepository<RiwayatStatus, Integer> {
    List<RiwayatStatus> findByPengaduanIdOrderByChangedAtAsc(Integer pengaduanId);
}
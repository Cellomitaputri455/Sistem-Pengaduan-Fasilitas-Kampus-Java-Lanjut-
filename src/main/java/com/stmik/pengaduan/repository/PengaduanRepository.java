package com.stmik.pengaduan.repository;

import com.stmik.pengaduan.entity.Pengaduan;
import com.stmik.pengaduan.enums.PrioritasEnum;
import com.stmik.pengaduan.enums.StatusEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
 
@Repository

public interface PengaduanRepository extends JpaRepository<Pengaduan, Integer> {
    List<Pengaduan> findByMahasiswaIdOrderByCreatedAtDesc(Integer mahasiswaId); //mahasiswa melihat pengaduan dirinya sendiri

    List<Pengaduan> findByTeknisiIdOrderByCreatedAtDesc(Integer teknisiId); //teknisi melihat tugas yg diassign kepadanya

    List<Pengaduan> findByStatusOrderByCreatedAtDesc(StatusEnum status); //filter by status (dashboard admin)

    List<Pengaduan> findByPrioritasOrderByCreatedAtDesc(PrioritasEnum prioritas); //fitur prioritas

    @Query("SELECT COUNT(r) > 0 FROM Rating r WHERE r.pengaduan.id = :pengaduanId") //cek apakah pengaduan sudah punya rating
    boolean existsRatingByPengaduanId(@Param("pengaduanId") Integer pengaduanId);

    @Query("SELECT p FROM Pengaduan p WHERE " + //filter gabungan di dashboard admin (status, prioritas, rentang tanggal)
           "(:status IS NULL OR p.status = :status) AND " +
           "(:prioritas IS NULL OR p.prioritas = :prioritas) AND " +
           "(:startDate IS NULL OR p.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR p.createdAt <= :endDate) " +
           "ORDER BY p.createdAt DESC")
    List<Pengaduan> findWithFilters(
        @Param("status") StatusEnum status,
        @Param("prioritas") PrioritasEnum prioritas,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT COUNT(p) FROM Pengaduan p WHERE p.createdAt >= :startOfDay AND p.createdAt < :endOfDay") // generate no urut untuk no pengaduan harian
    long countTodayPengaduan(
        @Param("startOfDay") LocalDateTime startOfDay,
        @Param("endOfDay") LocalDateTime endOfDay
    );

    Optional<Pengaduan> findByNomorPengaduan(String nomorPengaduan);
}

package com.stmik.pengaduan.repository;

import com.stmik.pengaduan.entity.Teknisi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TeknisiRepository extends JpaRepository<Teknisi, Integer> {

    @Query("SELECT t FROM Teknisi t LEFT JOIN t.listTugas p " +
           "ON p.status = com.stmik.pengaduan.enums.StatusEnum.IN_PROGRESS " +
           "WHERE t.isActive = true " +
           "GROUP BY t " +
           "ORDER BY COUNT(p) ASC")
    List<Teknisi> findTeknisiWithLeastActiveTask();

    List<Teknisi> findByIsActiveTrue();

    Optional<Teknisi> findByNip(Integer nip);

    boolean existsByNip(Integer nip);
}
package com.stmik.pengaduan.repository;

import com.stmik.pengaduan.entity.Mahasiswa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
 
@Repository

public interface MahasiswaRepository extends JpaRepository<Mahasiswa, Integer> {
    Optional<Mahasiswa> findByNim(Integer nim);
    Boolean existsByNim(Integer nim);
}

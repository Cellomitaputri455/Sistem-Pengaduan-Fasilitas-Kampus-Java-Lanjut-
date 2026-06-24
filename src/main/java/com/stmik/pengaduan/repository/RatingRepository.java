package com.stmik.pengaduan.repository;

import com.stmik.pengaduan.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
 
@Repository

public interface RatingRepository extends JpaRepository<Rating, Integer> {
    Optional<Rating> findByPengaduanId(Integer pengaduanId);
    boolean existsByPengaduanId(Integer pengaduanId);
}

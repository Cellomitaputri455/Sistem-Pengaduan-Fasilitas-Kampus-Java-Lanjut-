package com.stmik.pengaduan.repository;

import com.stmik.pengaduan.entity.BuktiFoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
 
@Repository

public interface BuktiFotoRepository extends JpaRepository<BuktiFoto, Integer> {
    List<BuktiFoto> findByPengaduanId(Integer pengaduanId);
}

package com.stmik.pengaduan.repository;

import com.stmik.pengaduan.entity.Fasilitas;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
 
@Repository

public interface FasilitasRepository extends JpaRepository<Fasilitas, Integer> {
    List<Fasilitas> findByIsActiveTrueOrderByNamaAsc();

    List<Fasilitas> findByKategoriAndIsActiveTrue(String kategori);

    List<Fasilitas> findByLokasiContainingIgnoreCaseAndIsActiveTrue(String lokasi);

    List<Fasilitas> findByNamaContainingIgnoreCaseAndIsActiveTrue(String nama);
}

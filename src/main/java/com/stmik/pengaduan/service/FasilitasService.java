package com.stmik.pengaduan.service;

import com.stmik.pengaduan.dto.request.FasilitasRequest;
import com.stmik.pengaduan.entity.Fasilitas;
import com.stmik.pengaduan.exception.ResourceNotFoundException;
import com.stmik.pengaduan.repository.FasilitasRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class FasilitasService {

    @Autowired
    private FasilitasRepository fasilitasRepo;

    public List<Fasilitas> getAll() {
        return fasilitasRepo.findByIsActiveTrueOrderByNamaAsc();
    }

    public Fasilitas getById(Integer id) {
        return fasilitasRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Fasilitas tidak ditemukan"));
    }

    public List<Fasilitas> search(String keyword) {
        return fasilitasRepo.findByNamaContainingIgnoreCaseAndIsActiveTrue(keyword);
    }

    @Transactional
    public Fasilitas tambah(FasilitasRequest req) {
        Fasilitas f = new Fasilitas();
        f.setNama(req.getNama());
        f.setKategori(req.getKategori());
        f.setLokasi(req.getLokasi());
        f.setDeskripsi(req.getDeskripsi());
        f.setIsActive(true);
        return fasilitasRepo.save(f);
    }

    @Transactional
    public Fasilitas edit(Integer id, FasilitasRequest req) {
        Fasilitas f = getById(id);
        f.setNama(req.getNama());
        f.setKategori(req.getKategori());
        f.setLokasi(req.getLokasi());
        f.setDeskripsi(req.getDeskripsi());
        return fasilitasRepo.save(f);
    }

    @Transactional
    public void nonaktifkan(Integer id) {
        Fasilitas f = getById(id);
        f.setIsActive(false);
        fasilitasRepo.save(f);
    }
}
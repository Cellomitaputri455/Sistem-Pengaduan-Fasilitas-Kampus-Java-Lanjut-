package com.stmik.pengaduan.service;

import com.stmik.pengaduan.dto.request.TeknisiRequest;
import com.stmik.pengaduan.dto.request.TeknisiEditRequest;
import com.stmik.pengaduan.entity.Teknisi;
import com.stmik.pengaduan.enums.RoleEnum;
import com.stmik.pengaduan.exception.BadRequestException;
import com.stmik.pengaduan.exception.ResourceNotFoundException;
import com.stmik.pengaduan.repository.TeknisiRepository;
import com.stmik.pengaduan.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class TeknisiService {

    @Autowired
    private TeknisiRepository teknisiRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<Teknisi> getAll() {
        return teknisiRepo.findAll();
    }

    public List<Teknisi> getAktif() {
        return teknisiRepo.findByIsActiveTrue();
    }

    public Teknisi getById(Integer id) {
        return teknisiRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Teknisi tidak ditemukan"));
    }

    @Transactional
    public Teknisi tambah(TeknisiRequest req) {
        if (teknisiRepo.existsByNip(req.getNip())) {
            throw new BadRequestException("NIP " + req.getNip() + " sudah terdaftar");
        }
        if (userRepo.existsByEmail(req.getEmail())) {
            throw new BadRequestException("Email sudah terdaftar");
        }

        Teknisi t = new Teknisi();
        t.setNip(req.getNip());
        t.setUsername(req.getNip().toString());
        t.setNamaLengkap(req.getNamaLengkap());
        t.setEmail(req.getEmail());
        t.setNoHp(req.getNoHp());
        t.setPassword(passwordEncoder.encode(req.getPassword()));
        t.setSpesialisasi(req.getSpesialisasi());
        t.setRole(RoleEnum.TEKNISI);
        t.setIsActive(true);
        return teknisiRepo.save(t);
    }

    @Transactional
    public Teknisi edit(Integer id, TeknisiEditRequest req) {
        Teknisi t = getById(id);
        t.setNip(req.getNip());
        t.setNamaLengkap(req.getNamaLengkap());
        t.setEmail(req.getEmail());
        t.setNoHp(req.getNoHp());
        t.setSpesialisasi(req.getSpesialisasi());
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            t.setPassword(passwordEncoder.encode(req.getPassword()));
        }
        return teknisiRepo.save(t);
    }

    @Transactional
    public void toggleAktif(Integer id, boolean aktif) {
        Teknisi t = getById(id);
        t.setIsActive(aktif);
        teknisiRepo.save(t);
    }
}
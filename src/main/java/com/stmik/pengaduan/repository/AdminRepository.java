package com.stmik.pengaduan.repository;

import com.stmik.pengaduan.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface AdminRepository extends JpaRepository<Admin, Integer> {
    boolean existsByNip(Integer nip);
}
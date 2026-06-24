package com.stmik.pengaduan.config;

import com.stmik.pengaduan.entity.SuperAdmin;
import com.stmik.pengaduan.enums.RoleEnum;
import com.stmik.pengaduan.repository.SuperAdminRepository;
import com.stmik.pengaduan.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private SuperAdminRepository superAdminRepo;

    @Override
    public void run(String... args) {
        if (!userRepo.existsByUsername("superadmin")) {
            SuperAdmin sa = new SuperAdmin();
            sa.setNip(10001);
            sa.setNamaLengkap("Super Admin STMIK");
            sa.setUsername("superadmin");
            sa.setPassword(passwordEncoder.encode("superadmin123"));
            sa.setEmail("superadmin@stmik.ac.id");
            sa.setNoHp("81234567890");
            sa.setRole(RoleEnum.SUPER_ADMIN);
            sa.setIsActive(true);
            superAdminRepo.save(sa);
            System.out.println("==> SuperAdmin default berhasil dibuat.");
            System.out.println("    Username: superadmin | Password: superadmin123");
        } else {
            System.out.println("==> SuperAdmin sudah ada, skip seeding.");
        }
    }
}
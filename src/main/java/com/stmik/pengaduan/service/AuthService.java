package com.stmik.pengaduan.service;

import com.stmik.pengaduan.dto.request.LoginRequest;
import com.stmik.pengaduan.dto.request.RegisterRequest;
import com.stmik.pengaduan.dto.response.JwtResponse;
import com.stmik.pengaduan.entity.Mahasiswa;
import com.stmik.pengaduan.entity.User;
import com.stmik.pengaduan.enums.RoleEnum;
import com.stmik.pengaduan.exception.BadRequestException;
import com.stmik.pengaduan.repository.MahasiswaRepository;
import com.stmik.pengaduan.repository.UserRepository;
import com.stmik.pengaduan.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired private UserRepository userRepository;
    @Autowired private MahasiswaRepository mahasiswaRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private JwtTokenProvider tokenProvider;

    @Transactional
    public void register(RegisterRequest req) {
        // Cek duplikasi NIM (UC-01 Exception E1)
        if (mahasiswaRepository.existsByNim(req.getNim())) {
            throw new BadRequestException("NIM " + req.getNim() + " sudah terdaftar");
        }

        // Cek duplikasi email (UC-01 Exception E1)
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new BadRequestException("Email " + req.getEmail() + " sudah terdaftar");
        }

        // Cek konfirmasi password (UC-01 Exception E2)
        if (!req.getPassword().equals(req.getKonfirmasiPassword())) {
            throw new BadRequestException("Password dan Konfirmasi Password tidak sama");
        }

        /*
         * Username dibuat dari NIM (konversi ke string)
         * karena NIM adalah identifier unik mahasiswa.
         * Ini memudahkan mahasiswa login dengan NIM mereka.
         */
        String username = req.getNim().toString();
        if (userRepository.existsByUsername(username)) {
            throw new BadRequestException("Username sudah terdaftar");
        }

        Mahasiswa mahasiswa = new Mahasiswa();
        mahasiswa.setNim(req.getNim());
        mahasiswa.setNamaLengkap(req.getNamaLengkap());
        mahasiswa.setUsername(username);
        mahasiswa.setEmail(req.getEmail());
        mahasiswa.setNoHp(req.getNoHp());
        mahasiswa.setPassword(passwordEncoder.encode(req.getPassword()));
        mahasiswa.setRole(RoleEnum.MAHASISWA);
        mahasiswa.setIsActive(true);

        mahasiswaRepository.save(mahasiswa);
    }

    public JwtResponse login(LoginRequest req) {
        // Spring Security akan throw BadCredentialsException jika salah
        // dan DisabledException jika akun nonaktif
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsername(req.getUsername())
            .orElseThrow(() -> new BadRequestException("User tidak ditemukan"));

        JwtResponse response = new JwtResponse(
            token, user.getId(), user.getUsername(), user.getEmail(), user.getRole()
        );

        // Tambahkan nama lengkap jika mahasiswa
        if (user.getRole() == RoleEnum.MAHASISWA) {
            mahasiswaRepository.findById(user.getId()).ifPresent(m ->
                response.setNamaLengkap(m.getNamaLengkap())
            );
        }

        return response;
    }
}
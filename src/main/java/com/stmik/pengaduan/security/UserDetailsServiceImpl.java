package com.stmik.pengaduan.security;

import com.stmik.pengaduan.entity.User;
import com.stmik.pengaduan.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException(
                "User tidak ditemukan dengan username: " + username
            ));

        // LOG SEMENTARA - hapus setelah debug selesai
        System.out.println("==> LOAD USER: " + username);
        System.out.println("==> ROLE: " + user.getRole());
        System.out.println("==> IS ACTIVE: " + user.getIsActive());

        return new org.springframework.security.core.userdetails.User(
            user.getUsername(),
            user.getPassword(),
            user.getIsActive(),
            true,
            true,
            true,
            Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
            )
        );
    }
}
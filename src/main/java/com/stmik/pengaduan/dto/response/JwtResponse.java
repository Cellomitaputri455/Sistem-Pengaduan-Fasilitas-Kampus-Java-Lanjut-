package com.stmik.pengaduan.dto.response;

import com.stmik.pengaduan.enums.RoleEnum;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Integer id;
    private String username;
    private String email;
    private RoleEnum role;
    private String namaLengkap; // untuk mahasiswa

    public JwtResponse(String token, Integer id, String username, String email, RoleEnum role) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
    }
}
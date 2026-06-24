package com.stmik.pengaduan.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "mahasiswa")
@PrimaryKeyJoinColumn(name = "user_id")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Mahasiswa extends User {

    @Column(name = "nim", unique = true, nullable = false)
    private Integer nim;

    @JsonIgnore
    @OneToMany(mappedBy = "mahasiswa", fetch = FetchType.LAZY)
    private List<Pengaduan> listPengaduan;
}
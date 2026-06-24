package com.stmik.pengaduan.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.stmik.pengaduan.enums.StatusTeknisi;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "teknisi")
@PrimaryKeyJoinColumn(name = "user_id")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Teknisi extends User {

    @Column(name = "nip", unique = true, nullable = false)
    private Integer nip;

    @Column(name = "spesialisasi", length = 100)
    private String spesialisasi;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_ketersediaan")
    private StatusTeknisi statusKetersediaan = StatusTeknisi.TERSEDIA;

    @JsonIgnore
    @OneToMany(mappedBy = "teknisi", fetch = FetchType.LAZY)
    private List<Pengaduan> listTugas;
}
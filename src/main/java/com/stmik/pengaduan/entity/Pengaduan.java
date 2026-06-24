package com.stmik.pengaduan.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.stmik.pengaduan.enums.JenisKerusakanEnum;
import com.stmik.pengaduan.enums.PrioritasEnum;
import com.stmik.pengaduan.enums.StatusEnum;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "pengaduan")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pengaduan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "nomor_pengaduan", unique = true, nullable = false, length = 30)
    private String nomorPengaduan;

    @Column(name = "judul", nullable = false, length = 200)
    private String judul;

    @Column(name = "deskripsi", nullable = false, columnDefinition = "TEXT")
    private String deskripsi;

    @Enumerated(EnumType.STRING)
    @Column(name = "jenis_kerusakan", nullable = false)
    private JenisKerusakanEnum jenisKerusakan;

    @Enumerated(EnumType.STRING)
    @Column(name = "prioritas", nullable = false)
    private PrioritasEnum prioritas;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private StatusEnum status = StatusEnum.PENDING;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "listPengaduan"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_mahasiswa", nullable = false)
    private Mahasiswa mahasiswa;

    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_fasilitas", nullable = false)
    private Fasilitas fasilitas;

    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "listTugas"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_teknisi", nullable = true)
    private Teknisi teknisi;

    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_admin", nullable = true)
    private Admin admin;

    @JsonIgnore
    @OneToMany(mappedBy = "pengaduan", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<BuktiFoto> buktiFotos;

    @JsonIgnore
    @OneToMany(mappedBy = "pengaduan", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RiwayatStatus> riwayatStatuses;

    @JsonIgnore
    @OneToOne(mappedBy = "pengaduan", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Rating rating;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
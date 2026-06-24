package com.stmik.pengaduan.entity;

import com.stmik.pengaduan.enums.StatusEnum;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
 
@Entity
@Table(name = "riwayat_status")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class RiwayatStatus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pengaduan", nullable = false)
    private Pengaduan pengaduan;

    @Enumerated(EnumType.STRING) //status sebelum diubah
    @Column(name = "status_lama")
    private StatusEnum statusLama;

    @Enumerated(EnumType.STRING) // status setelah diubah
    @Column(name = "status_baru", nullable = false)
    private StatusEnum statusBaru;

    @Column(name = "catatan", columnDefinition = "TEXT") //catatan penanganan dari teknisi
    private String catatan;

    @Column(name = "changed_at", nullable = false, updatable = false)
    private LocalDateTime changedAt;

    @PrePersist
    protected void onCreate() {
        this.changedAt = LocalDateTime.now();
    }
}

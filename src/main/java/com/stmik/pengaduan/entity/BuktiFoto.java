package com.stmik.pengaduan.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
 
@Entity
@Table(name = "bukti_foto")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class BuktiFoto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pengaduan", nullable = false)
    private Pengaduan pengaduan;

    @Column(name = "nama_file", nullable = false) //nama file asli dari upload
    private String namaFile;

    @Column(name = "url_file", nullable = false) //url file di server
    private String urlFile;

    @Column(name = "tipe_file", length = 50)
    private String tipeFile;

    @Column(name = "upload_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onCreate() {
        this.updatedAt = LocalDateTime.now();
    }
}

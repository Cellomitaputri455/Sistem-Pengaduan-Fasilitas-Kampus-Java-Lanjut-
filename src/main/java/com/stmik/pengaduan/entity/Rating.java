package com.stmik.pengaduan.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
 
@Entity
@Table(name = "rating")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class Rating {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY) //satu rating untuk satu pengaduan
    @JoinColumn(name = "id_pengaduan", nullable = false, unique = true)
    private Pengaduan pengaduan;

    @Column(name = "nilai", nullable = false) //nilai 1-5 bintang
    private Integer nilai;

    @Column(name = "feedback", columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}

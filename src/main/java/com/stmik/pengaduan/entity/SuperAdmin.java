package com.stmik.pengaduan.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "super_admin")
@PrimaryKeyJoinColumn(name = "user_id")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class SuperAdmin extends User {

    @Column(name = "nip", unique = true, nullable = false)
    private Integer nip;
}
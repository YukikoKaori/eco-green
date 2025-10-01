package com.evdealer.evdealermanagement.entity.account;

import com.evdealer.evdealermanagement.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account extends BaseEntity {

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "full_name", length = 100)
    private String fullName;

    @Column(length = 20, unique = true)
    private String phone;

    // === ngày sinh ===
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    // === giới tính (MALE, FEMALE, OTHER) ===
    @Enumerated(EnumType.STRING)
    @Column(name = "gender", length = 10)
    private Gender gender;

    // === vai trò (MEMBER, ADMIN, STAFF) ===
    @Enumerated(EnumType.STRING)
    @Column(name = "role", length = 20, nullable = false)
    private Role role = Role.MEMBER;

    // === trạng thái (ACTIVE, INACTIVE, BANNED, PENDING) ===
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    private Status status = Status.PENDING;

    // =============================
    // ENUM định nghĩa theo DB
    // =============================
    public enum Gender {
        MALE, FEMALE, OTHER
    }

    public enum Role {
        MEMBER, ADMIN, STAFF
    }

    public enum Status {
        ACTIVE, INACTIVE, BANNED, PENDING
    }
}

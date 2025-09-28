package com.evdealer.evdealermanagement.entity.account;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.apache.catalina.security.SecurityUtil;

import com.fasterxml.jackson.annotation.JsonFormat;

@Entity
@Table(name = "accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    private String phone;

    @Column(name = "national_id", unique = true, length = 20)
    private String nationalId;

    @Column(name = "national_id_issued_date")
    private LocalDateTime nationalIdIssuedDate;

    @Column(name = "tax_code", unique = true, length = 20)
    private String taxCode;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    private String address;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Enumerated(EnumType.STRING)
    private Status status;

    @Column(name = "email_verified")
    private Boolean emailVerified = false;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss a", timezone = "GMT+7")

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    public void handleBeforeUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum Role {
        MEMBER, ADMIN, STAFF
    }

    public enum Status {
        ACTIVE, INACTIVE
    }
}

package com.evdealer.evdealermanagement.dto.account.profile;

import com.evdealer.evdealermanagement.entity.account.Account;

import jakarta.persistence.PreUpdate;
import lombok.*;

import java.time.Instant;
import java.time.LocalDateTime;

import org.apache.catalina.security.SecurityUtil;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AccountProfileResponse {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private String address;
    private String avatarUrl;
    private Account.Status status;
    private Boolean emailVerified;
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
    private String taxCode;

    @PreUpdate
    public void handleBeforeUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

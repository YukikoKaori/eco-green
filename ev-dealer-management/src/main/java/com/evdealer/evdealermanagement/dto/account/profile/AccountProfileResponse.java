package com.evdealer.evdealermanagement.dto.account.profile;

import java.io.ObjectInputFilter.Status;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AccountProfileResponse {
    private Long id;
    private String fullName;
    private String address;
    private String avatarUrl;
    private String phone;
    private String taxCode;
    private String username;
    private String email;
    private Boolean emailVerified;
    private LocalDateTime updatedAt;
    private LocalDateTime createdAt;
    private Status status;
}

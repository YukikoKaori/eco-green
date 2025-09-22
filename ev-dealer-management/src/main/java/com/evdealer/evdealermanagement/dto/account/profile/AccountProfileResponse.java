package com.evdealer.evdealermanagement.dto.account.profile;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AccountProfileResponse {
    private Long id;
    private String fullName;
    private String address;
    private String avatarUrl;
    private String phone;
    private String taxCode;
    private String username;
    private String email;
    private LocalDateTime updatedAt;

    // getters/setters
}

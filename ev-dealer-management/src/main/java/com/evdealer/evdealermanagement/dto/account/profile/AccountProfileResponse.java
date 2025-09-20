package com.evdealer.evdealermanagement.dto.account.profile;

import com.evdealer.evdealermanagement.entity.account.Account;
import lombok.*;

import java.time.LocalDateTime;


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
}

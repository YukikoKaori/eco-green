package com.evdealer.evdealermanagement.dto.account.register;

import com.evdealer.evdealermanagement.entity.account.Account;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AccountRegisterResponse {
    private String username;
    private String phone;
    private String email;
    private String fullName;
    private LocalDate dateOfBirth;
    private Account.Gender gender;
    private Account.Role role;
    private Account.Status status;
    private LocalDateTime createdAt;
    private String avatarUrl;
    private String city;
    private String district;
    private String ward;
    private String addressDetail;
}

package com.evdealer.evdealermanagement.dto.account.register;

import com.evdealer.evdealermanagement.entity.account.Account;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AccountRegisterRequest {
    private String username;
    private String phone;
    private String password;
    private String email;
    private String fullName;
    private LocalDate dateOfBirth;
    private Account.Gender gender;
    private String avatarUrl;
    private String city;
    private String district;
    private String ward;
    private String addressDetail;
}


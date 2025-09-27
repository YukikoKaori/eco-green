package com.evdealer.evdealermanagement.dto.account.login;

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
public class AccountLoginResponse {
    private String email;
    private String fullName;
    private String phone;
    private String nationalId;
    private LocalDate dateOfBirth;
    private Account.Role role;
    private Account.Status status;
    private String token;
}

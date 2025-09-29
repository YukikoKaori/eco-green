package com.evdealer.evdealermanagement.dto.account.register;

import com.evdealer.evdealermanagement.entity.account.Account;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AccountRegisterResponse {
    private String username;
    private String fullName;
    private String email;
    private String phone;
    private Account.Role role;
    private Account.Status status;
}

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
    private String email;
    private String fullName;
    private Account.Role role;
    private Account.Status status;
}

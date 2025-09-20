package com.evdealer.evdealermanagement.dto.account.register;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AccountRegisterRequest {
    private String username;
    private String password;
    private String email;
    private String fullName;
}

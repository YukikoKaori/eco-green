package com.evdealer.evdealermanagement.dto.account.password;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResponse {
    private boolean success;
    private String message;
}

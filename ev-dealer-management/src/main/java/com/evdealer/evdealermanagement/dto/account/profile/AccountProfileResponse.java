package com.evdealer.evdealermanagement.dto.account.profile;

import com.evdealer.evdealermanagement.entity.account.Account;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AccountProfileResponse {
    Long id;
    String username;
    String email;
    String fullName;
    String phone;
    String address;
    String avatarUrl;
    Account.Status status;
    Boolean emailVerified;
    LocalDateTime createdAt;
    LocalDate dateOfBirth;
}

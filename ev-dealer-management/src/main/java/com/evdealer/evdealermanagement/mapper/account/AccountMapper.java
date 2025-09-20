package com.evdealer.evdealermanagement.mapper.account;

import com.evdealer.evdealermanagement.dto.account.profile.AccountProfileResponse;
import com.evdealer.evdealermanagement.entity.account.Account;

public class AccountMapper {
    public static AccountProfileResponse toDto(Account account) {
        return AccountProfileResponse.builder()
                .id(account.getId())
                .username(account.getUsername())
                .email(account.getEmail())
                .fullName(account.getFullName())
                .phone(account.getPhone())
                .address(account.getAddress())
                .avatarUrl(account.getAvatarUrl())
                .status(account.getStatus())
                .emailVerified(account.getEmailVerified())
                .createdAt(account.getCreatedAt())
                .build();
    }
}

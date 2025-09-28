package com.evdealer.evdealermanagement.mapper.account;

import com.evdealer.evdealermanagement.dto.account.profile.AccountProfileResponse;
import com.evdealer.evdealermanagement.dto.account.profile.AccountUpdateRequest;
import com.evdealer.evdealermanagement.entity.account.Account;
import org.springframework.util.StringUtils;

public final class AccountMapper {

    private AccountMapper() {
    }

    public static AccountProfileResponse toProfileResponse(Account a) {
        if (a == null)
            return null;
        AccountProfileResponse res = new AccountProfileResponse();
        res.setId(a.getId());
        res.setFullName(a.getFullName());
        res.setAvatarUrl(a.getAvatarUrl());
        res.setPhone(a.getPhone());
        res.setTaxCode(a.getTaxCode());
        res.setUsername(a.getUsername());

        res.setEmail(a.getEmail());
        res.setUpdatedAt(a.getUpdatedAt());
        return res;
    }

    public static void updateAccountFromRequest(AccountUpdateRequest req, Account account) {
        if (req == null || account == null)
            return;

        // fullName
        if (hasText(req.getFullName())) {
            account.setFullName(trimToNull(req.getFullName()));
        }

        // avatarUrl
        if (req.getAvatarUrl() != null) {
            account.setAvatarUrl(trimToNull(req.getAvatarUrl()));
        }

        // phone
        if (req.getPhone() != null) {
            account.setPhone(trimToNull(req.getPhone()));
        }

        // taxCode
        if (req.getTaxCode() != null) {
            account.setTaxCode(trimToNull(req.getTaxCode()));
        }

        // username
        if (req.getUsername() != null) {
            account.setUsername(trimToNull(req.getUsername()));
        }

        // status (enum)
        if (req.getStatus() != null) {
            account.setStatus(Account.Status.valueOf(req.getStatus().name()));
        }
    }

    private static boolean hasText(String s) {// Kiểm tra xem có phải là text ko
        return StringUtils.hasText(s);
    }

    private static String trimToNull(String s) { // Loại bỏ khoảng trắng
        return s == null ? null : s.trim();
    }

    public static AccountProfileResponse mapToAccountProfileResponse(Account account) {
        return AccountProfileResponse.builder()
                .id(account.getId())
                .username(account.getUsername())
                .email(account.getEmail())
                .fullName(account.getFullName())
                .phone(account.getPhone())
                .avatarUrl(account.getAvatarUrl())
                .status(account.getStatus())
                .emailVerified(account.getEmailVerified())
                .createdAt(account.getCreatedAt())
                .dateOfBirth(account.getDateOfBirth())
                .updatedAt(account.getUpdatedAt())
                .taxCode(account.getTaxCode())
                .build();
    }
}

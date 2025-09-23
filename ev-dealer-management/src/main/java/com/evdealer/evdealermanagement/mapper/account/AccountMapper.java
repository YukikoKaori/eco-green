package com.evdealer.evdealermanagement.mapper.account;

import com.evdealer.evdealermanagement.dto.account.profile.AccountProfileResponse;
import com.evdealer.evdealermanagement.dto.account.profile.AccountUpdateRequest;
import com.evdealer.evdealermanagement.entity.account.Account;
import org.springframework.util.StringUtils;

/**
 * Mapper thuần Java:
 * - toProfileResponse: Entity -> Response DTO
 * - apply: Request DTO -> (update) Entity (partial update, không đụng field
 * nhạy cảm)
 */
public final class AccountMapper {

    private AccountMapper() {
    }

    /** Entity -> DTO (cho GET/PUT response) */
    public static AccountProfileResponse toProfileResponse(Account a) {
        if (a == null)
            return null;
        AccountProfileResponse res = new AccountProfileResponse();
        res.setId(a.getId());
        res.setFullName(a.getFullName());
        res.setAddress(a.getAddress());
        res.setAvatarUrl(a.getAvatarUrl());
        res.setPhone(a.getPhone());
        res.setTaxCode(a.getTaxCode());
        res.setUsername(a.getUsername());

        res.setEmail(a.getEmail());
        res.setUpdatedAt(a.getUpdatedAt());
        return res;
    }

    /**
     * Request -> (update) Entity
     * Chỉ cập nhật các field an toàn:
     * full_name, address, avatar_url, phone, tax_code, username
     * KHÔNG cập nhật: email, role, status, password_hash, national_id, created_at,
     * updated_at
     */
    public static void updateAccountFromRequest(AccountUpdateRequest req, Account a) {
        if (a == null || req == null)
            return;

        if (hasText(req.getFullName()))
            a.setFullName(trimToNull(req.getFullName()));
        if (req.getAddress() != null)
            a.setAddress(trimToNull(req.getAddress()));
        if (req.getAvatarUrl() != null)
            a.setAvatarUrl(trimToNull(req.getAvatarUrl()));
        if (req.getPhone() != null)
            a.setPhone(trimToNull(req.getPhone()));
        if (req.getTaxCode() != null)
            a.setTaxCode(trimToNull(req.getTaxCode()));
        if (req.getUsername() != null)
            a.setUsername(trimToNull(req.getUsername()));

        // Lưu ý: updatedAt set ở Service khi save
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
                .address(account.getAddress())
                .avatarUrl(account.getAvatarUrl())
                .status(account.getStatus())
                .emailVerified(account.getEmailVerified())
                .createdAt(account.getCreatedAt())
                .build();
    }
}

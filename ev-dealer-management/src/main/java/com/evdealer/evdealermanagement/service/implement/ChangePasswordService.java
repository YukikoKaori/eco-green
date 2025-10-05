package com.evdealer.evdealermanagement.service.implement;

import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.evdealer.evdealermanagement.dto.account.password.ChangePasswordRequest;
import com.evdealer.evdealermanagement.dto.account.password.PasswordResponse;
import com.evdealer.evdealermanagement.entity.account.Account;
import com.evdealer.evdealermanagement.exceptions.AppException;
import com.evdealer.evdealermanagement.exceptions.ErrorCode;
import com.evdealer.evdealermanagement.repository.AccountRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChangePasswordService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public PasswordResponse changePassword(String principal, ChangePasswordRequest req) {

        if (!req.getNewPassword().equals(req.getConfirmNewPassword())) {
            return PasswordResponse.builder()
                    .success(false)
                    .message("Mật khẩu mới và xác nhận không khớp.")
                    .build();
        }

        Account acc = accountRepository.findByUsernameOrPhoneOrEmail(principal, principal, principal)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "User Not Found"));

        // 1) Xác thực mật khẩu hiện tại
        if (!passwordEncoder.matches(req.getCurrentPassword(), acc.getPasswordHash())) {
            // có thể tăng fail counter / rate limit
            return PasswordResponse.builder()
                    .success(false)
                    .message("Mật khẩu hiện tại không đúng.")
                    .build();
        }

        // 2) Chặn trùng mật khẩu cũ
        if (passwordEncoder.matches(req.getNewPassword(), acc.getPasswordHash())) {
            return PasswordResponse.builder()
                    .success(false)
                    .message("Mật khẩu mới không được trùng mật khẩu hiện tại.")
                    .build();
        }

        // 3) Cập nhật hash
        String newHash = passwordEncoder.encode(req.getNewPassword());
        acc.setPasswordHash(newHash);
        acc.setUpdatedAt(LocalDateTime.now());
        accountRepository.save(acc);

        // 4) (Khuyến nghị) Vô hiệu hóa phiên cũ/refresh token để buộc đăng nhập lại
        // tokenService.revokeAllForUser(acc.getId());

        return PasswordResponse.builder()
                .success(true)
                .message("Đổi mật khẩu thành công. Vui lòng đăng nhập lại.")
                .build();
    }
}

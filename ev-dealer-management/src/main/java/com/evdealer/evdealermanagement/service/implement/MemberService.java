package com.evdealer.evdealermanagement.service.implement;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.evdealer.evdealermanagement.dto.account.profile.AccountProfileResponse;
import com.evdealer.evdealermanagement.dto.account.profile.AccountUpdateRequest;
import com.evdealer.evdealermanagement.entity.account.Account;
import com.evdealer.evdealermanagement.exceptions.ResourceNotFoundException;
import com.evdealer.evdealermanagement.mapper.account.AccountMapper;
import com.evdealer.evdealermanagement.repository.AccountRepository;
import com.evdealer.evdealermanagement.service.contract.IAccountService;

import lombok.RequiredArgsConstructor;

// @Service
// public class MemberService {
//     private final AccountRepository accountRepository;

//     public MemberService(AccountRepository accountRepository) {
//         this.accountRepository = accountRepository;
//     }

//     public Account getAccountById(Long id) {
//         Optional<Account> accountOptional = this.accountRepository.findById(id);
//         if (accountOptional.isPresent()) {
//             return accountOptional.get();
//         }
//         return null;
//     }

//     public Account updateMemberProfile(Account accountRequest) {
//         Account existingAccount = this.getAccountById(accountRequest.getId());
//         if (existingAccount != null) {
//             existingAccount.setFullName(accountRequest.getFullName());
//             existingAccount.setAddress(accountRequest.getAddress());
//             existingAccount.setAvatarUrl(accountRequest.getAvatarUrl());
//             existingAccount.setPhone(accountRequest.getPhone());
//             existingAccount.setStatus(accountRequest.getStatus());
//             existingAccount.setTaxCode(accountRequest.getTaxCode());
//             existingAccount.setUsername(accountRequest.getUsername());
//             existingAccount.setStatus(accountRequest.getStatus());

//             existingAccount.setUpdatedAt(LocalDateTime.now());

//             return this.accountRepository.save(existingAccount);
//         }
//         return null;
//     }

//     public void deleteAccount(Long id) {
//         this.accountRepository.deleteById(id);
//     }

// }

@Service
@RequiredArgsConstructor
public class MemberService implements IAccountService {

    private final AccountRepository accountRepository;

    @Override
    @Transactional(readOnly = true)
    public AccountProfileResponse getProfile(Long userId) {
        Account acc = accountRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + userId));
        return AccountMapper.toProfileResponse(acc);
    }

    @Override
    @Transactional
    public AccountProfileResponse updateProfile(Long userId, AccountUpdateRequest request) {
        Account acc = accountRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + userId));

        // (Tuỳ chọn) Validate unique constraints nếu hệ thống có yêu cầu
        if (request.getUsername() != null &&
                accountRepository.existsByUsernameAndIdNot(request.getUsername(), userId)) {
            throw new IllegalArgumentException("Username already taken");
        }
        if (request.getPhone() != null &&
                accountRepository.existsByPhoneAndIdNot(request.getPhone(), userId)) {
            throw new IllegalArgumentException("Phone already used");
        }

        // Chỉ cập nhật field an toàn (fullName, address, avatarUrl, phone, taxCode,
        // username)
        AccountMapper.apply(request, acc);

        // KHÔNG cho member đổi status/email/role/password_hash/national_id...
        // acc.setStatus(...) -> BỎ

        acc.setUpdatedAt(LocalDateTime.now());

        Account saved = accountRepository.save(acc);
        return AccountMapper.toProfileResponse(saved);
    }

    // Nếu vẫn cần xài nội bộ:
    // Tránh trả null. Quăng NotFound thay vì null để dễ debug.
    public Account getAccountEntityById(Long id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + id));
    }

    // Chức năng admin/xoá tài khoản – GIỮ nếu bạn có use-case, nhưng không liên
    // quan update profile của member
    @Override
    @Transactional
    public void deleteAccount(Long userId) {
        if (!accountRepository.existsById(userId)) {
            throw new ResourceNotFoundException("Account not found: " + userId);
        }
        accountRepository.deleteById(userId);
    }
}

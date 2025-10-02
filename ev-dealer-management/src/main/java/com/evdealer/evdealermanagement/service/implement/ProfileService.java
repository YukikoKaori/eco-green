package com.evdealer.evdealermanagement.service.implement;

import com.evdealer.evdealermanagement.dto.account.profile.AccountProfileResponse;
import com.evdealer.evdealermanagement.dto.account.profile.AccountUpdateRequest;
import com.evdealer.evdealermanagement.entity.account.Account;
import com.evdealer.evdealermanagement.exceptions.AppException;
import com.evdealer.evdealermanagement.exceptions.ErrorCode;
import com.evdealer.evdealermanagement.mapper.account.AccountMapper;
import com.evdealer.evdealermanagement.repository.AccountRepository;
import com.evdealer.evdealermanagement.service.contract.IAccountService;

import org.springframework.stereotype.Service;

@Service
public class ProfileService implements IAccountService {

    private final AccountRepository accountRepository;

    public ProfileService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @Override
    public AccountProfileResponse getProfile(String username) {
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "User not found"));
        return AccountMapper.mapToAccountProfileResponse(account);
    }

    // Consolidated updateProfile using String userId (deprecates Long overload if possible)
    public AccountProfileResponse updateProfile(String userId, AccountUpdateRequest accountRequest) {
        Account existingAccount = accountRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "User not found"));

        if (accountRequest.getUsername() != null &&
                accountRepository.existsByUsernameAndIdNot(accountRequest.getUsername(), userId)) {
            throw new AppException(ErrorCode.DUPLICATE_RESOURCE, "Username already taken");
        }
        if (accountRequest.getPhone() != null &&
                accountRepository.existsByPhoneAndIdNot(accountRequest.getPhone(), userId)) {
            throw new AppException(ErrorCode.DUPLICATE_RESOURCE, "Phone already used");
        }

        AccountMapper.updateAccountFromRequest(accountRequest, existingAccount);
        Account saved = accountRepository.save(existingAccount);
        return AccountMapper.mapToAccountProfileResponse(saved);
    }

    // If IAccountService requires Long overload, implement with conversion (but prefer updating interface)
    @Override
    public AccountProfileResponse updateProfile(Long userId, AccountUpdateRequest accountRequest) {
        String userIdStr = String.valueOf(userId);  // Safe conversion assuming numeric Long
        return updateProfile(userIdStr, accountRequest);  // Delegate to String version
    }

    @Override
    public void deleteAccount(Long userId) {
        accountRepository.deleteById(String.valueOf(userId));  // Already correct
    }

    @Override
    public AccountProfileResponse getProfile(Long userId) {
        String userIdStr = String.valueOf(userId);
        Account account = accountRepository.findById(userIdStr)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "User not found"));
        return AccountMapper.mapToAccountProfileResponse(account);
    }
}
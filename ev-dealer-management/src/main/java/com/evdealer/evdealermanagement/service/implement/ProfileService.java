package com.evdealer.evdealermanagement.service.implement;

import com.evdealer.evdealermanagement.dto.account.login.AccountLoginRequest;
import com.evdealer.evdealermanagement.dto.account.login.AccountLoginResponse;
import com.evdealer.evdealermanagement.dto.account.profile.AccountProfileResponse;
import com.evdealer.evdealermanagement.dto.account.profile.AccountUpdateRequest;
import com.evdealer.evdealermanagement.dto.account.register.AccountRegisterRequest;
import com.evdealer.evdealermanagement.dto.account.register.AccountRegisterResponse;
import com.evdealer.evdealermanagement.entity.account.Account;
import com.evdealer.evdealermanagement.exceptions.AppException;
import com.evdealer.evdealermanagement.exceptions.ErrorCode;
import com.evdealer.evdealermanagement.exceptions.ResourceNotFoundException;
import com.evdealer.evdealermanagement.mapper.account.AccountMapper;
import com.evdealer.evdealermanagement.repository.AccountRepository;
import com.evdealer.evdealermanagement.service.contract.IAccountService;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
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
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return AccountMapper.mapToAccountProfileResponse(account);
    }

    @Override
    public AccountProfileResponse updateProfile(Long userId, AccountUpdateRequest accountRequest) {
        Account existingAccount = accountRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        if (accountRequest.getUsername() != null &&
                accountRepository.existsByUsernameAndIdNot(accountRequest.getUsername(), userId)) {
            throw new IllegalArgumentException("Username already taken");
        }
        if (accountRequest.getPhone() != null &&
                accountRepository.existsByPhoneAndIdNot(accountRequest.getPhone(), userId)) {
            throw new IllegalArgumentException("Phone already used");
        }
        AccountMapper.updateAccountFromRequest(accountRequest, existingAccount);
        existingAccount.setUpdatedAt(LocalDateTime.now());
        Account saved = accountRepository.save(existingAccount);
        return AccountMapper.mapToAccountProfileResponse(saved);
    }

    @Override
    public void deleteAccount(Long userId) {
        this.accountRepository.deleteById(userId);
    }

    @Override
    public AccountProfileResponse getProfile(Long userId) {
        return null;
    }

}

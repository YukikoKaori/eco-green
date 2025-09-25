package com.evdealer.evdealermanagement.service.implement;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.evdealer.evdealermanagement.dto.account.profile.AccountProfileResponse;
import com.evdealer.evdealermanagement.dto.account.profile.AccountUpdateRequest;
import com.evdealer.evdealermanagement.entity.account.Account;
import com.evdealer.evdealermanagement.exceptions.AppException;
import com.evdealer.evdealermanagement.exceptions.ErrorCode;
import com.evdealer.evdealermanagement.exceptions.ResourceNotFoundException;
import com.evdealer.evdealermanagement.mapper.account.AccountMapper;
import com.evdealer.evdealermanagement.repository.AccountRepository;
import com.evdealer.evdealermanagement.service.contract.IAccountService;

@Service
public class MemberService {
//    private final AccountRepository accountRepository;
//
//    public MemberService(AccountRepository accountRepository) {
//        this.accountRepository = accountRepository;
//    }
//
//    public Account getAccountById(Long id) {
//        Optional<Account> accountOptional = this.accountRepository.findById(id);
//        if (accountOptional.isPresent()) {
//            return accountOptional.get();
//        }
//        return null;
//    }

    // public Account updateMemberProfile(Account accountRequest) {
    // Account existingAccount = this.getAccountById(accountRequest.getId());
    // if (existingAccount != null) {
    // existingAccount.setFullName(accountRequest.getFullName());
    // existingAccount.setAddress(accountRequest.getAddress());
    // existingAccount.setAvatarUrl(accountRequest.getAvatarUrl());
    // existingAccount.setPhone(accountRequest.getPhone());
    // existingAccount.setStatus(accountRequest.getStatus());
    // existingAccount.setTaxCode(accountRequest.getTaxCode());
    // existingAccount.setUsername(accountRequest.getUsername());
    // existingAccount.setStatus(accountRequest.getStatus());

    // existingAccount.setUpdatedAt(LocalDateTime.now());
    // this.accountRepository.save(existingAccount);

    // return this.accountRepository.save(existingAccount);
    // }
    // return null;
    // }

    // public void deleteAccount(Long id) {
    // this.accountRepository.deleteById(id);
    // }

    // @Override
    // public AccountProfileResponse getProfile(String username) {
    // Account account = accountRepository.findByUsername(username)
    // .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    // return AccountMapper.mapToAccountProfileResponse(account);
    // }

    // @Override
    // public AccountProfileResponse updateProfile(Long userId, AccountUpdateRequest
    // accountRequest) {
    // Account existingAccount = accountRepository.findById(userId)
    // .orElseThrow(() -> new ResourceNotFoundException("Account not found: " +
    // userId));
    // if (accountRequest.getUsername() != null &&
    // accountRepository.existsByUsernameAndIdNot(accountRequest.getUsername(),
    // userId)) {
    // throw new IllegalArgumentException("Username already taken");
    // }
    // if (accountRequest.getPhone() != null &&
    // accountRepository.existsByPhoneAndIdNot(accountRequest.getPhone(), userId)) {
    // throw new IllegalArgumentException("Phone already used");
    // }
    // if (existingAccount != null) {
    // existingAccount.setFullName(accountRequest.getFullName());
    // existingAccount.setAddress(accountRequest.getAddress());
    // existingAccount.setAvatarUrl(accountRequest.getAvatarUrl());
    // existingAccount.setPhone(accountRequest.getPhone());
    // existingAccount.setTaxCode(accountRequest.getTaxCode());
    // existingAccount.setUsername(accountRequest.getUsername());
    // existingAccount.setStatus(
    // accountRequest.getStatus() != null
    // ? Account.Status.valueOf(accountRequest.getStatus().name())
    // : null);
    // existingAccount.setUpdatedAt(LocalDateTime.now());
    // Account saved = accountRepository.save(existingAccount);
    // return AccountMapper.mapToAccountProfileResponse(saved);
    // }
    // return null;
    // }

    // @Override
    // public AccountProfileResponse getProfile(Long userId) {
    // return null;
    // }
}

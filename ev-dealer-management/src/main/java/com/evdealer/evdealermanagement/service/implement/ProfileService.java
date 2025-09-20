package com.evdealer.evdealermanagement.service.implement;

import com.evdealer.evdealermanagement.dto.account.login.AccountLoginRequest;
import com.evdealer.evdealermanagement.dto.account.login.AccountLoginResponse;
import com.evdealer.evdealermanagement.dto.account.profile.AccountProfileResponse;
import com.evdealer.evdealermanagement.dto.account.profile.AccountUpdateRequest;
import com.evdealer.evdealermanagement.dto.account.register.AccountRegisterRequest;
import com.evdealer.evdealermanagement.dto.account.register.AccountRegisterResponse;
import com.evdealer.evdealermanagement.service.contract.IAccountService;

public class ProfileService implements IAccountService {
    @Override
    public AccountRegisterResponse memberRegister(AccountRegisterRequest request) {
        return null;
    }

    @Override
    public AccountLoginResponse memberLogin(AccountLoginRequest request) {
        return null;
    }

    @Override
    public void memberLogout(String token) {

    }

    @Override
    public AccountProfileResponse getProfile(Long userId) {
        return null;
    }

    @Override
    public AccountProfileResponse updateProfile(Long userId, AccountUpdateRequest request) {
        return null;
    }
}

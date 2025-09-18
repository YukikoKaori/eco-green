package com.evdealer.evdealermanagement.service.contract;

import com.evdealer.evdealermanagement.dto.account.login.AccountLoginRequest;
import com.evdealer.evdealermanagement.dto.account.login.AccountLoginResponse;
import com.evdealer.evdealermanagement.dto.account.profile.AccountProfileResponse;
import com.evdealer.evdealermanagement.dto.account.profile.AccountUpdateRequest;
import com.evdealer.evdealermanagement.dto.account.register.AccountRegisterRequest;
import com.evdealer.evdealermanagement.dto.account.register.AccountRegisterResponse;

public interface IAccountService {
    AccountRegisterResponse memberRegister (AccountRegisterRequest request);
    AccountLoginResponse memberLogin (AccountLoginRequest request);
    void memberLogout(String token);

    // Xem profile
    AccountProfileResponse getProfile(Long userId);

    // Cập nhật profile
    AccountProfileResponse updateProfile(Long userId, AccountUpdateRequest request);
}

package com.evdealer.evdealermanagement.service.contract;

import com.evdealer.evdealermanagement.dto.Account.login.AccountLoginRequest;
import com.evdealer.evdealermanagement.dto.Account.login.AccountLoginResponse;
import com.evdealer.evdealermanagement.dto.Account.profile.AccountProfileResponse;
import com.evdealer.evdealermanagement.dto.Account.profile.AccountUpdateRequest;
import com.evdealer.evdealermanagement.dto.Account.register.AccountRegisterRequest;
import com.evdealer.evdealermanagement.dto.Account.register.AccountRegisterResponse;

public interface IAccountService {
    AccountRegisterResponse memberRegister (AccountRegisterRequest request);
    AccountLoginResponse memberLogin (AccountLoginRequest request);
    void memberLogout(String token);

    // Xem profile
    AccountProfileResponse getProfile(Long userId);

    // Cập nhật profile
    AccountProfileResponse updateProfile(Long userId, AccountUpdateRequest request);
}

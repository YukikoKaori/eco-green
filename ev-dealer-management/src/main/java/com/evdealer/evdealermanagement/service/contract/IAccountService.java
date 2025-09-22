package com.evdealer.evdealermanagement.service.contract;

import com.evdealer.evdealermanagement.dto.account.profile.AccountProfileResponse;
import com.evdealer.evdealermanagement.dto.account.profile.AccountUpdateRequest;

public interface IAccountService {

    // Xem profile
    AccountProfileResponse getProfile(Long userId);

    // Cập nhật profile
    AccountProfileResponse updateProfile(Long userId, AccountUpdateRequest request);

    // Xóa account
    void deleteAccount(Long userId);
}

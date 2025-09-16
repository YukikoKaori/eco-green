package com.evdealer.evdealermanagement.service.contract;

import com.evdealer.evdealermanagement.dto.Admin.login.AdminLoginRequest;
import com.evdealer.evdealermanagement.dto.Admin.login.AdminLoginResponse;

public interface IAdminService {
    AdminLoginResponse adminLogin(AdminLoginRequest request);
    void adminLogout(String token);
}

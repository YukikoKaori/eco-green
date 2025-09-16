package com.evdealer.evdealermanagement.service.contract;

import com.evdealer.evdealermanagement.dto.Member.login.MemberLoginRequest;
import com.evdealer.evdealermanagement.dto.Member.login.MemberLoginResponse;
import com.evdealer.evdealermanagement.dto.Member.register.MemberRegisterRequest;
import com.evdealer.evdealermanagement.dto.Member.register.MemberRegisterResponse;

public interface IMemberService {
    MemberRegisterResponse memberRegister (MemberRegisterRequest request);
    MemberLoginResponse memberLogin (MemberLoginRequest request);
    void memberLogout(String token);
}

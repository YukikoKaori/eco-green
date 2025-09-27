package com.evdealer.evdealermanagement.controller.auth;

import com.evdealer.evdealermanagement.dto.account.login.AccountLoginRequest;
import com.evdealer.evdealermanagement.dto.account.login.AccountLoginResponse;
import com.evdealer.evdealermanagement.dto.account.response.ApiResponse;
import com.evdealer.evdealermanagement.exceptions.ErrorCode;
import com.evdealer.evdealermanagement.service.implement.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthenticationController {
    private final AuthService authService;

    @PostMapping("/login")
    @ResponseBody
    public ApiResponse<AccountLoginResponse> login(@RequestBody AccountLoginRequest request){
        AccountLoginResponse response = authService.login(request.getUsername(), request.getPassword());
        return new ApiResponse<>(ErrorCode.SUCCESS.getCode(), ErrorCode.SUCCESS.getMessage(), response);
    }

    @PostMapping("/logout")
    @ResponseBody
    public ApiResponse<Void> logout(){
        return new ApiResponse<>(ErrorCode.SUCCESS.getCode(), ErrorCode.SUCCESS.getMessage(), null);
    }
}

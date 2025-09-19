package com.evdealer.evdealermanagement.controller.auth;

import com.evdealer.evdealermanagement.dto.account.login.AccountLoginRequest;
import com.evdealer.evdealermanagement.dto.account.login.AccountLoginResponse;
import com.evdealer.evdealermanagement.dto.account.login.ApiResponse;
import com.evdealer.evdealermanagement.dto.account.register.AccountRegisterRequest;
import com.evdealer.evdealermanagement.dto.account.register.AccountRegisterResponse;
import com.evdealer.evdealermanagement.service.implement.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthenticationController {
    private final AuthService authService;

    @PostMapping("/login")
    @ResponseBody
    public ApiResponse<AccountLoginResponse> login(@RequestBody AccountLoginRequest request){
        var response = authService.login(request.getUsername(), request.getPassword());
        return new ApiResponse<>(200, "Login success", response);
    }

    @PostMapping("/logout")
    @ResponseBody
    public ApiResponse<Void> logout(){
        return new ApiResponse<>(200, "Logout success", null);
    }
}

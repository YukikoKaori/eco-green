package com.evdealer.evdealermanagement.controller.auth;

import com.evdealer.evdealermanagement.dto.account.login.AccountLoginRequest;
import com.evdealer.evdealermanagement.dto.account.login.AccountLoginResponse;
import com.evdealer.evdealermanagement.dto.account.register.AccountRegisterRequest;
import com.evdealer.evdealermanagement.dto.account.register.AccountRegisterResponse;
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

    // ======================= LOGIN =======================
    @PostMapping("/login")
    @ResponseBody
    public ApiResponse<AccountLoginResponse> login(@RequestBody AccountLoginRequest request) {
        AccountLoginResponse response = authService.login(request.getUsername(), request.getPassword());
        return new ApiResponse<>(ErrorCode.SUCCESS.getCode(), ErrorCode.SUCCESS.getMessage(), response);
    }

    // ======================= LOGOUT =======================
    @PostMapping("/logout")
    @ResponseBody
    public ApiResponse<Void> logout() {
        return new ApiResponse<>(ErrorCode.SUCCESS.getCode(), ErrorCode.SUCCESS.getMessage(), null);
    }

    // ======================= DELETE USER BY ID =======================
    @DeleteMapping("/delete/id/{id}")
    @ResponseBody
    public ApiResponse<Void> deleteById(@PathVariable Long id) {
        authService.deleteUserById(String.valueOf(id));
        return new ApiResponse<>(ErrorCode.SUCCESS.getCode(),
                "User with id " + id + " deleted successfully", null);
    }

    // ======================= DELETE USER BY USERNAME =======================
    @DeleteMapping("/delete/username/{username}")
    @ResponseBody
    public ApiResponse<Void> deleteByUsername(@PathVariable String username) {
        authService.deleteUserByUsername(username);
        return new ApiResponse<>(ErrorCode.SUCCESS.getCode(),
                "User with username " + username + " deleted successfully", null);
    }
}

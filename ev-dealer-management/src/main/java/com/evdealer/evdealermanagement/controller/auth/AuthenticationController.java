package com.evdealer.evdealermanagement.controller.auth;

import com.evdealer.evdealermanagement.dto.account.login.AccountLoginRequest;
import com.evdealer.evdealermanagement.dto.account.login.AccountLoginResponse;
import com.evdealer.evdealermanagement.dto.account.register.AccountRegisterRequest;
import com.evdealer.evdealermanagement.dto.account.register.AccountRegisterResponse;
import com.evdealer.evdealermanagement.dto.account.response.ApiResponse;
import com.evdealer.evdealermanagement.exceptions.ErrorCode;
import com.evdealer.evdealermanagement.service.implement.AuthService;
import com.evdealer.evdealermanagement.service.implement.FacebookLoginService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthenticationController {

    private final AuthService authService;
    private final FacebookLoginService facebookLoginService;

    // ======================= LOGIN =======================
    @PostMapping("/login")
    @ResponseBody
    public ApiResponse<AccountLoginResponse> login(@RequestBody AccountLoginRequest request) {
        AccountLoginResponse response = authService.login(request.getPhone(), request.getPassword());
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

    @GetMapping("/login/facebook")
    public ApiResponse<AccountLoginResponse> loginFacebook(@AuthenticationPrincipal OAuth2User oAuth2User) {
        AccountLoginResponse response = facebookLoginService.processFacebookLogin(oAuth2User);
        return new ApiResponse<>(ErrorCode.SUCCESS.getCode(),
                ErrorCode.SUCCESS.getMessage(),
                response);
    }
}

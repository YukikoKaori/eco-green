package com.evdealer.evdealermanagement.dto.account.profile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.Pattern;

@Getter
@Setter
public class AccountUpdateRequest {

    @NotBlank(message = "Full name is required")
    @Size(max = 120, message = "Full name must not exceed 120 characters")
    private String fullName;

    @Size(max = 255, message = "Address must not exceed 255 characters")
    private String address;

    @Size(max = 255, message = "Avatar URL must not exceed 255 characters")
    private String avatarUrl;

    @Pattern(regexp = "^[0-9+()\\-\\s]{6,20}$", message = "Phone number format is invalid")
    private String phone;

    @Size(max = 50, message = "Tax code must not exceed 50 characters")
    private String taxCode;

    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    // Getters and Setters
}
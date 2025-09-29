package com.evdealer.evdealermanagement.dto.account.register;

import com.evdealer.evdealermanagement.entity.account.Account;
<<<<<<< HEAD
=======
import com.evdealer.evdealermanagement.utils.REGREX;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
>>>>>>> 66243ee49930fd8bc4a6cfab25b7f7f7235d3e02
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AccountRegisterRequest {
    private String username;
<<<<<<< HEAD
    private String phone;
    private String password;
    private String email;
    private String fullName;
=======
    @NotBlank(message = "Full name is required")
    @Size(min = 4, max = 50, message = "Full name must be less than 50 characters")
    private String fullName;

    @NotBlank
    @Pattern(regexp = REGREX.PASSWORD_REGEX, message = "Invalid password")
    private String password;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = REGREX.PHONE_REGEX, message = "Invalid VietNam phone number")
    private String phone;
    private String email;
>>>>>>> 66243ee49930fd8bc4a6cfab25b7f7f7235d3e02
    private LocalDate dateOfBirth;
    private Account.Gender gender;
    private String avatarUrl;
    private String city;
    private String district;
    private String ward;
    private String addressDetail;
}


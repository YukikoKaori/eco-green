package com.evdealer.evdealermanagement.service.implement;

import com.evdealer.evdealermanagement.dto.account.custom.CustomAccountDetails;
import com.evdealer.evdealermanagement.dto.account.login.AccountLoginResponse;
import com.evdealer.evdealermanagement.dto.account.register.AccountRegisterRequest;
import com.evdealer.evdealermanagement.dto.account.register.AccountRegisterResponse;
import com.evdealer.evdealermanagement.entity.account.Account;
import com.evdealer.evdealermanagement.exceptions.AppException;
import com.evdealer.evdealermanagement.exceptions.ErrorCode;
import com.evdealer.evdealermanagement.repository.AccountRepository;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final AccountDetailsService userDetailsService;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(AuthenticationManager authenticationManager, JwtService jwtService,
                       AccountDetailsService userDetailsService, AccountRepository accountRepository,
                       PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AccountLoginResponse login(String phone, String password) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(phone, password)
            );
        } catch (BadCredentialsException e) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS, "UserDetails is not of expected type");
        } catch (DisabledException e) {
            throw new AppException(ErrorCode.EMAIL_NOT_VERIFIED, "UserDetails is not of expected type");
        } catch (LockedException e) {
            throw new AppException(ErrorCode.ACCOUNT_LOCKED, "UserDetails is not of expected type");
        } catch (Exception e) {
            throw new AppException(ErrorCode.INTERNAL_ERROR, e.getMessage());
        }

        UserDetails userDetails = userDetailsService.loadUserByPhone(phone);
        if (userDetails instanceof CustomAccountDetails customDetails) {
            Account account = customDetails.getAccount(); // Assuming CustomAccountDetails has getAccount()

            if (!Account.Status.ACTIVE.equals(account.getStatus())) {
                throw new AppException(ErrorCode.ACCOUNT_INACTIVE, "UserDetails is not of expected type");
            }
            if (!Boolean.TRUE.equals(account.getEmailVerified())) {
                throw new AppException(ErrorCode.EMAIL_NOT_VERIFIED, "UserDetails is not of expected type");
            }

            String token = jwtService.generateToken(userDetails);
            return AccountLoginResponse.builder()
                    .token(token)
                    .fullName(account.getFullName())
                    .role(account.getRole())
                    .build();
        } else {
            throw new AppException(ErrorCode.INTERNAL_ERROR, "UserDetails is not of expected type");
        }
    }

    public AccountRegisterResponse register(AccountRegisterRequest request) {
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            throw new AppException(ErrorCode.MISSING_REQUIRED_FIELD, "UserDetails is not of expected type");
        }

        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new AppException(ErrorCode.MISSING_REQUIRED_FIELD, "UserDetails is not of expected type");
        }

        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new AppException(ErrorCode.PASSWORD_TOO_SHORT, "UserDetails is not of expected type");
        }

//        if (!isValidEmail(request.getEmail())) {
//            throw new AppException(ErrorCode.INVALID_FORMAT, "UserDetails is not of expected type");
//        }

        if (accountRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new AppException(ErrorCode.USERNAME_ALREADY_EXISTS, "UserDetails is not of expected type");
        }

        if (accountRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS, "UserDetails is not of expected type");
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());

        Account account = Account.builder()
                .email(request.getEmail())
                .fullName(request.getFullName())
                .username(request.getUsername())
                .role(Account.Role.MEMBER)
                .status(Account.Status.ACTIVE)
                .passwordHash(hashedPassword)
                .emailVerified(false)
                .build();
        Account saved = accountRepository.save(account);

        return AccountRegisterResponse.builder()
                .email(saved.getEmail())
                .fullName(saved.getFullName())
                .username(saved.getUsername())
                .role(saved.getRole())
                .status(saved.getStatus())
                .build();
    }

    private boolean isValidEmail(String email) {
        String emailRegex = "^[A-Za-z0-9+_.-]+@(.+)$";
        Pattern pattern = Pattern.compile(emailRegex);
        return email != null && pattern.matcher(email).matches();
    }
}
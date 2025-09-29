package com.evdealer.evdealermanagement.service.implement;

import com.evdealer.evdealermanagement.dto.account.custom.CustomAccountDetails;
import com.evdealer.evdealermanagement.dto.account.login.AccountLoginResponse;
import com.evdealer.evdealermanagement.dto.account.register.AccountRegisterRequest;
import com.evdealer.evdealermanagement.dto.account.register.AccountRegisterResponse;
import com.evdealer.evdealermanagement.entity.account.Account;
import com.evdealer.evdealermanagement.exceptions.AppException;
import com.evdealer.evdealermanagement.exceptions.ErrorCode;
import com.evdealer.evdealermanagement.repository.AccountRepository;
import com.evdealer.evdealermanagement.utils.Utils;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional
    public AccountRegisterResponse register(AccountRegisterRequest request) {

        if(accountRepository.findByPhone(request.getPhone()).isPresent()){
            throw new AppException(ErrorCode.DUPLICATE_PHONE, "UserDetails is not of expected type");
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());

        Account account = Account.builder()
                .username(Utils.generateUsernameFromName(request.getFullName()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .role(Account.Role.MEMBER)
                .status(Account.Status.ACTIVE)
                .passwordHash(hashedPassword)
                .emailVerified(false)
                .build();
        Account saved = accountRepository.save(account);

        return AccountRegisterResponse.builder()
                .username(saved.getUsername())
                .fullName(saved.getFullName())
                .phone(saved.getPhone())
                .email(saved.getEmail())
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
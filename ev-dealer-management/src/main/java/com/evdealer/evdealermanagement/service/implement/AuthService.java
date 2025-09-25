package com.evdealer.evdealermanagement.service.implement;

import com.evdealer.evdealermanagement.dto.account.login.AccountLoginResponse;
import com.evdealer.evdealermanagement.dto.account.register.AccountRegisterRequest;
import com.evdealer.evdealermanagement.dto.account.register.AccountRegisterResponse;
import com.evdealer.evdealermanagement.entity.account.Account;
import com.evdealer.evdealermanagement.exceptions.AppException;
import com.evdealer.evdealermanagement.exceptions.ErrorCode;
import com.evdealer.evdealermanagement.repository.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AccountDetailsService userDetailsService;

    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public AccountLoginResponse login(String username, String password) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );
        } catch (BadCredentialsException ex) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        String token = jwtService.generateToken(userDetails);
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return AccountLoginResponse.builder()
                .email(account.getEmail())
                .fullName(account.getFullName())
                .phone(account.getPhone())
                .nationalId(account.getNationalId())
                .dateOfBirth(account.getDateOfBirth())
                .address(account.getAddress())
                .role(account.getRole())
                .status(account.getStatus())
                .token(token)
                .build();
    }

    public AccountRegisterResponse register(AccountRegisterRequest request) {
        if(request.getUsername() == null || request.getUsername().isBlank()) {
            throw new AppException(ErrorCode.MISSING_REQUIRED_FIELD);
        }

        if(request.getPassword() == null || request.getPassword().length() < 6) {
            throw new AppException(ErrorCode.PASSWORD_TOO_SHORT);
        }

        if(accountRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new AppException(ErrorCode.USERNAME_ALREADY_EXISTS);
        }
        if(accountRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());

        Account account = Account.builder()
                .email(request.getEmail())
                .fullName(request.getFullName())
                .username(request.getUsername())
                .role(Account.Role.MEMBER)
                .status(Account.Status.ACTIVE)
                .passwordHash(hashedPassword)
                .build();
        Account saved =  accountRepository.save(account);

        return AccountRegisterResponse.builder()
                .email(saved.getEmail())
                .fullName(saved.getFullName())
                .username(saved.getUsername())
                .role(saved.getRole())
                .status(saved.getStatus())
                .build();
    }
}

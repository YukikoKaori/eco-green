package com.evdealer.evdealermanagement.service.implement;

import com.evdealer.evdealermanagement.dto.account.login.AccountLoginResponse;
import com.evdealer.evdealermanagement.dto.account.register.AccountRegisterRequest;
import com.evdealer.evdealermanagement.dto.account.register.AccountRegisterResponse;
import com.evdealer.evdealermanagement.entity.account.Account;
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
            // ném lại để GlobalExceptionHandler xử lý
            throw new BadCredentialsException("Wrong password or username");
        }
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        String token = jwtService.generateToken(userDetails);
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return AccountLoginResponse.builder()
                .email(account.getEmail())
                .fullName(account.getFullName())
                .phone(account.getPhone())
                .nationalId(account.getNationalId())
                .address(account.getAddress())
                .role(account.getRole())
                .status(account.getStatus())
                .token(token)
                .build();
    }

    public AccountRegisterResponse register(AccountRegisterRequest request) {
        if(request.getUsername() == null || request.getUsername().isBlank()) {
            throw new BadCredentialsException("Username is empty");
        }

        if(request.getPassword() == null || request.getPassword().length() < 6) {
            throw new BadCredentialsException("Password must be at least 6 characters");
        }

        if(accountRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new BadCredentialsException("Username already exists");
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

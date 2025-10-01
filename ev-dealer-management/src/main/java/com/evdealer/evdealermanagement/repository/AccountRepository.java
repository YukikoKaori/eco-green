package com.evdealer.evdealermanagement.repository;

import com.evdealer.evdealermanagement.entity.account.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, String> {
    Optional<Account> findByUsername(String username);

    Optional<Account> findByPhone(String phone);

    boolean existsByUsernameAndIdNot(String username, String id);  // Changed Long to String

    boolean existsByPhoneAndIdNot(String phone, String id);       // Changed Long to String

    Optional<Account> findByEmail(String email);
}
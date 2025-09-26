package com.evdealer.evdealermanagement.repository;

import com.evdealer.evdealermanagement.entity.account.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {
    Optional<Account> findByUsername(String username);

    boolean existsByUsernameAndIdNot(String username, Long id);

    boolean existsByPhoneAndIdNot(String phone, Long id);

    Optional<Account> findByEmail(String email);
}

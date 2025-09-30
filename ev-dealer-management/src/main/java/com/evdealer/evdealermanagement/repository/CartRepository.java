package com.evdealer.evdealermanagement.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.evdealer.evdealermanagement.entity.cart.Cart;
import com.evdealer.evdealermanagement.entity.cart.CartStatus;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByAccount_IdAndStatus(Long accountId, CartStatus status);
    Optional<Cart> findByAccountId(Long accountId);
}

package com.evdealer.evdealermanagement.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.evdealer.evdealermanagement.entity.cart.CartStatus;
import com.evdealer.evdealermanagement.entity.cartItem.CartItem;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByCart_IdAndProduct_Id(Long cartId, Long productId);

    long deleteByCart_Account_IdAndCart_StatusAndProduct_Id(
            Long accountId, CartStatus status, Long productId);

    Optional<CartItem> findByIdAndCart_Account_IdAndCart_Status(
            Long id, Long accountId, CartStatus status);

    Optional<CartItem> findByCart_Account_IdAndCart_StatusAndProduct_Id(
            Long accountId, CartStatus status, Long productId);
}

package com.evdealer.evdealermanagement.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.evdealer.evdealermanagement.entity.cartItem.CartItem;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByCart_IdAndProduct_Id(Long cartId, Long productId);
    List<CartItem> findByCartId(Long cartId);
}

package com.evdealer.evdealermanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.evdealer.evdealermanagement.entity.CartItem.CartItem;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
}

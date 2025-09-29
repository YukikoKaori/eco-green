package com.evdealer.evdealermanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.evdealer.evdealermanagement.entity.cart.Cart;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

}

package com.evdealer.evdealermanagement.service.implement;

import com.evdealer.evdealermanagement.dto.cart.CartResponse;
import com.evdealer.evdealermanagement.mapper.cart.CartMapper;
import com.evdealer.evdealermanagement.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


@RequiredArgsConstructor
@Service
public class CartService {

    private final CartRepository cartRepository;

    public CartResponse getAllCarts(Long accountId) {
        return cartRepository.findByAccountId(accountId)
                .map(CartMapper::toCartResponse)
                .orElseThrow(() -> new RuntimeException("Cart not found"));
    }
}

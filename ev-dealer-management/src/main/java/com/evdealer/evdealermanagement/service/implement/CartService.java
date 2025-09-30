package com.evdealer.evdealermanagement.service.implement;

import com.evdealer.evdealermanagement.dto.cart.CartResponse;
import com.evdealer.evdealermanagement.entity.cart.Cart;
import com.evdealer.evdealermanagement.entity.cartItem.CartItem;
import com.evdealer.evdealermanagement.mapper.cart.CartMapper;
import com.evdealer.evdealermanagement.repository.CartItemRepository;
import com.evdealer.evdealermanagement.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;


@RequiredArgsConstructor
@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    public CartResponse getAllCarts(Long accountId) {
        Cart cart = cartRepository.findByAccountId(accountId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        List<CartItem> items = cartItemRepository.findByCartId(cart.getId());
        return CartMapper.toCartResponse(cart, items);
    }
}

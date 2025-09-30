package com.evdealer.evdealermanagement.mapper.cart;

import com.evdealer.evdealermanagement.dto.cart.CartResponse;
import com.evdealer.evdealermanagement.dto.cartItem.CartItemResponse;
import com.evdealer.evdealermanagement.entity.cart.Cart;
import com.evdealer.evdealermanagement.entity.cartItem.CartItem;

import java.util.List;

public class CartMapper {
    public static CartResponse toCartResponse(Cart cart, List<CartItem> cartItems) {
        var itemResponses = cartItems.stream()
                .map(CartMapper::toCartItemResponse)
                .toList();

        // Tính toán
        int itemCount = itemResponses.size();
        int totalQuantity = itemResponses.stream()
                .mapToInt(CartItemResponse::getQuantity)
                .sum();

        return CartResponse.builder()
                .cartId(cart.getId())
                .accountId(cart.getAccount().getId())
                .status(cart.getStatus())
                .createdAt(cart.getCreatedAt())
                .items(itemResponses)
                .itemCount(itemCount)
                .totalQuantity(totalQuantity)
                .build();
    }

    private static CartItemResponse toCartItemResponse(CartItem item) {
        return CartItemResponse.builder()
                .cartItemId(item.getId())
                .cartId(item.getCart().getId())
                .productId(item.getProduct().getId())
                .quantity(item.getQuantity())
                .build();
    }
}

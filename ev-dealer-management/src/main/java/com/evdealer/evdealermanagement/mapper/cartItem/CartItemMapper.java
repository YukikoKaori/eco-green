package com.evdealer.evdealermanagement.mapper.cartItem;

import com.evdealer.evdealermanagement.dto.cartItem.CartItemResponse;
import com.evdealer.evdealermanagement.entity.cart.Cart;
import com.evdealer.evdealermanagement.entity.cartItem.CartItem;
import com.evdealer.evdealermanagement.entity.product.Products;

public class CartItemMapper {
    public static CartItemResponse mapToCartItemResponse(CartItem cartItem, Cart cart, Products product) {
        return CartItemResponse.builder()
                .cartItemId(cartItem.getId())
                .cartId(cart.getId())
                .productId(product.getId())
                .quantity(cartItem.getQuantity())
                .build();
    }
}

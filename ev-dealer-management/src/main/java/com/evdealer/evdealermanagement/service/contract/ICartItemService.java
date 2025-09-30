package com.evdealer.evdealermanagement.service.contract;

import com.evdealer.evdealermanagement.dto.cartItem.CartItemResponse;

public interface ICartItemService {
    CartItemResponse addToCart(Long accountId, Long productId, Integer quantity);

    void removeItemByCartItemId(Long accountId, Long cartItemId);

    void removeItemByProductId(Long accountId, Long productId);
}

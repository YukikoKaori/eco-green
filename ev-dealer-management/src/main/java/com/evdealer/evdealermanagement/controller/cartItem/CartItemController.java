package com.evdealer.evdealermanagement.controller.cartItem;

import org.springframework.web.bind.annotation.RestController;

import com.evdealer.evdealermanagement.dto.cartItem.CartItemRequest;
import com.evdealer.evdealermanagement.dto.cartItem.CartItemResponse;
import com.evdealer.evdealermanagement.service.implement.CartItemService;
import com.evdealer.evdealermanagement.service.implement.UserContextService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/member/cart")
@RequiredArgsConstructor
public class CartItemController {
        private final CartItemService cartItemService;
        private final UserContextService userContextService;

        @PostMapping("/{productId}")
        public ResponseEntity<CartItemResponse> addToCart(
                        @PathVariable("productId") Long productId,
                        @RequestBody CartItemRequest request) {
                Long accountId = userContextService.getCurrentUserId()
                                .orElseThrow(() -> new RuntimeException("User not authenticated"));
                CartItemResponse result = cartItemService.addToCart(accountId, productId, request.getQuantity());
                return ResponseEntity.ok(result);
        }

}

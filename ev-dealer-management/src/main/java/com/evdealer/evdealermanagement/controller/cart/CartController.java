package com.evdealer.evdealermanagement.controller.cart;

import com.evdealer.evdealermanagement.dto.account.custom.CustomAccountDetails;
import com.evdealer.evdealermanagement.dto.cart.CartResponse;
import com.evdealer.evdealermanagement.entity.cart.Cart;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/member/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping("/")
    public CartResponse getMyCart(@AuthenticationPrincipal CustomAccountDetails user) {
        return cartService.getAllCarts(user.getId());
    }
}

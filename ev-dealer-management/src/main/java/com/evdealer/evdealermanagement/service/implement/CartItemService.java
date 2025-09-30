package com.evdealer.evdealermanagement.service.implement;

import org.springframework.stereotype.Service;

import com.evdealer.evdealermanagement.dto.cartItem.CartItemResponse;
import com.evdealer.evdealermanagement.entity.account.Account;
import com.evdealer.evdealermanagement.entity.cart.Cart;
import com.evdealer.evdealermanagement.entity.cart.CartStatus;
import com.evdealer.evdealermanagement.entity.cartItem.CartItem;
import com.evdealer.evdealermanagement.entity.product.Products;
import com.evdealer.evdealermanagement.mapper.cartItem.CartItemMapper;
import com.evdealer.evdealermanagement.repository.AccountRepository;
import com.evdealer.evdealermanagement.repository.CartItemRepository;
import com.evdealer.evdealermanagement.repository.CartRepository;
import com.evdealer.evdealermanagement.repository.ProductRepository;
import com.evdealer.evdealermanagement.service.contract.ICartItemService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class CartItemService implements ICartItemService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final AccountRepository accountRepository;
    private final ProductRepository productsRepository;

    @Override
    @Transactional
    public CartItemResponse addToCart(Long accountId, Long productId, Integer quantity) {
        if (accountId == null)
            throw new IllegalArgumentException("accountId is required");
        if (productId == null)
            throw new IllegalArgumentException("productId is required");
        if (quantity == null || quantity < 1)
            throw new IllegalArgumentException("quantity must be >= 1");

        // 1) Lấy account
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Account not found: " + accountId));

        // 2) Tìm (hoặc tạo) cart ACTIVE cho account
        Cart cart = cartRepository.findByAccount_IdAndStatus(accountId, CartStatus.ACTIVE)
                .orElseGet(() -> {
                    Cart c = new Cart();
                    c.setAccount(account);
                    c.setStatus(CartStatus.ACTIVE);
                    return cartRepository.save(c);
                });

        // 3) Lấy product
        Products product = productsRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + productId));

        // 4) Tìm cart item hiện có (cùng product)
        CartItem item = cartItemRepository.findByCart_IdAndProduct_Id(cart.getId(), product.getId())
                .orElseGet(() -> {
                    CartItem ci = new CartItem();
                    ci.setCart(cart);
                    ci.setProduct(product);
                    ci.setQuantity(0);
                    return ci;
                });

        // 5) Cập nhật số lượng
        item.setQuantity(item.getQuantity() + quantity);

        // 6) Lưu cart item
        item = cartItemRepository.save(item);

        // 7) Build response
        return CartItemMapper.mapToCartItemResponse(item, cart, product);
    }

}

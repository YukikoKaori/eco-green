package com.evdealer.evdealermanagement.dto.cart;

import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.evdealer.evdealermanagement.dto.cartItem.CartItemResponse;
import com.evdealer.evdealermanagement.entity.cart.CartStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartResponse {

    private Long cartId;
    private Long accountId;
    private CartStatus status;
    private LocalDateTime createdAt;

    /**
     * Danh sách mặt hàng trong giỏ.
     */
    @Builder.Default
    private List<CartItemResponse> items = new ArrayList<>();

    /**
     * Tổng số dòng hàng (số sản phẩm khác nhau).
     */
    private Integer itemCount;

    /**
     * Tổng số lượng (cộng quantity toàn bộ items).
     */
    private Integer totalQuantity;

    // Nếu sau này bạn có giá/đơn giá: có thể thêm:
    // private Long cartTotal; // hoặc BigDecimal
}
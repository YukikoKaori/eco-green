package com.evdealer.evdealermanagement.entity.cartItem;

import com.evdealer.evdealermanagement.entity.cart.Cart;
import com.evdealer.evdealermanagement.entity.product.Products;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cart_items", indexes = {
        @Index(name = "idx_cart_items_cart_id", columnList = "cart_id"),
        @Index(name = "idx_cart_items_product_id", columnList = "product_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cart_item_id")
    private Long id;

    // N - 1 về Cart
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cart_id", nullable = false)
    @ToString.Exclude
    private Cart cart;

    // N - 1 về Product
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Products product;

    // INT DEFAULT 1
    @Column(nullable = false, columnDefinition = "INT DEFAULT 1")
    private Integer quantity = 1;

}

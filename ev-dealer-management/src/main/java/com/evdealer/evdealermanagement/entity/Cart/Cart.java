package com.evdealer.evdealermanagement.entity.Cart;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import com.evdealer.evdealermanagement.entity.CartItem.CartItem;
import com.evdealer.evdealermanagement.entity.account.Account;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "carts", indexes = { @Index(name = "idx_carts_account_id", columnList = "account_id", unique = true) })
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cart {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // BIGINT UNSIGNED AI

    // Member - Cart: 1 - 1 (đặt unique để đảm bảo mỗi account chỉ có 1 cart)
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "account_id", nullable = false, unique = true)
    private Account account;

    // ENUM('ACTIVE','CHECKED_OUT') DEFAULT 'ACTIVE'
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, columnDefinition = "ENUM('ACTIVE','CHECKED_OUT') DEFAULT 'ACTIVE'")
    private CartStatus status = CartStatus.ACTIVE;

    // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    // 1 - N CartItem
    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<CartItem> items = new ArrayList<>();

    // helpers đồng bộ 2 chiều
    public void addItem(CartItem item) {
        items.add(item);
        item.setCart(this);
    }

    public void removeItem(CartItem item) {
        items.remove(item);
        item.setCart(null);
    }
}
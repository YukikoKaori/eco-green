package com.evdealer.evdealermanagement.dto.product.detail;

import com.evdealer.evdealermanagement.entity.product.Product;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDetail {

    private String id;                // UUID → String
    private String title;
    private String description;
    private String type;              // VEHICLE, BATTERY
    private BigDecimal price;
    private String conditionType;     // NEW, USED

    private String sellerId;          // UUID
    private String sellerName;        // lấy từ Account
    private String sellerPhone;       // lấy từ Account

    private String status;            // DRAFT, ACTIVE, SOLD
    private LocalDateTime createdAt;

    // -------------------------------
    // Static method để map entity sang DTO
    public static ProductDetail fromEntity(Product product) {
        if (product == null) return null;

        return ProductDetail.builder()
                .id(product.getId())
                .description(product.getDescription())
                .price(product.getPrice())
                .createdAt(product.getCreatedAt())
                .build();
    }
}

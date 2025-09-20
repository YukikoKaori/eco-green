package com.evdealer.evdealermanagement.dto.product.detail;

import com.evdealer.evdealermanagement.entity.product.Products;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDetail {

    private Long id;
    private String title;
    private String description;
    private String type; // VEHICLE, BATTERY
    private BigDecimal price;
    private String conditionType; // NEW, USED
    private Boolean negotiable;
    private BigDecimal postingFee;
    private String saleType; // FIXED_PRICE, NEGOTIATION, AUCTION
    private LocalDateTime auctionEndTime;
    private Long sellerId;
    private String sellerName;
    private String sellerPhone;
    private String city;
    private String district;
    private String ward;
    private String addressDetail;
    private String status; // DRAFT, PENDING, ...
    private Long approvedById;
    private String approvedByName;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // -------------------------------
    // Static method để map entity sang DTO
    public static ProductDetail fromEntity(Products product) {
        if (product == null) return null;

        return ProductDetail.builder()
                .id(product.getId())
                .title(product.getTitle())
                .description(product.getDescription())
                .type(product.getType() != null ? product.getType().name() : null)
                .price(product.getPrice())
                .conditionType(product.getConditionType() != null ? product.getConditionType().name() : null)
                .negotiable(product.getNegotiable())
                .postingFee(product.getPostingFee())
                .saleType(product.getSaleType() != null ? product.getSaleType().name() : null)
                .auctionEndTime(product.getAuctionEndTime())
                .sellerId(product.getSeller() != null ? product.getSeller().getId() : null)
                .sellerName(product.getSeller() != null ? product.getSeller().getUsername() : null)
                .sellerPhone(product.getSellerPhone())
                .city(product.getCity())
                .district(product.getDistrict())
                .ward(product.getWard())
                .addressDetail(product.getAddressDetail())
                .status(product.getStatus() != null ? product.getStatus().name() : null)
                .approvedById(product.getApprovedBy() != null ? product.getApprovedBy().getId() : null)
                .approvedByName(product.getApprovedBy() != null ? product.getApprovedBy().getUsername() : null)
                .expiresAt(product.getExpiresAt())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}

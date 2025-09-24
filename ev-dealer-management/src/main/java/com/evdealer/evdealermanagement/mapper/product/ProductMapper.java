package com.evdealer.evdealermanagement.mapper.product;

import com.evdealer.evdealermanagement.dto.product.detail.ProductDetail;
import com.evdealer.evdealermanagement.entity.product.Products;

public class ProductMapper {

    // Chuyển từ entity sang DTO
    public static ProductDetail toDetailDto(Products product) {
        if (product == null) return null;

        return ProductDetail.builder()
                .id(product.getId())
                .title(product.getTitle())
                .description(product.getDescription())
                .type(product.getType() != null ? product.getType().name() : null)
                .price(product.getPrice())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    // Nếu cần thì thêm từ DTO -> Entity
    public static Products toEntity(ProductDetail dto) {
        if (dto == null) return null;

        return Products.builder()
                .id(dto.getId())
                .title(dto.getTitle())
                .description(dto.getDescription())
                .type(dto.getType() != null ? Products.ProductType.valueOf(dto.getType()) : null)
                .price(dto.getPrice())
                .createdAt(dto.getCreatedAt())
                .updatedAt(dto.getUpdatedAt())
                .build();
    }
}

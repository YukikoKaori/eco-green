package com.evdealer.evdealermanagement.mapper.wishlist;

import com.evdealer.evdealermanagement.dto.wishlist.WishlistItemResponse;
import com.evdealer.evdealermanagement.entity.product.ProductImages;
import com.evdealer.evdealermanagement.entity.product.Products;
import com.evdealer.evdealermanagement.entity.wishlist.WishlistItem;


public class WishlistMapper {

    public static WishlistItemResponse mapToWishlistItemResponse(WishlistItem wishlistItem) {
        Products product = wishlistItem.getProduct();
        return WishlistItemResponse.builder()
                .productId(product.getId())
                .productName(product.getTitle())
                .productThumbnail(getThumbnailUrl(product))
                .createAt(wishlistItem.getCreatedAt())
                .build();
    }



    //hàm support lấy ảnh từ ProductImages thông qua Products table
    private static String getThumbnailUrl(Products product) {
        return product.getProductImages().stream()
                .filter(ProductImages::getIsPrimary)
                .map(ProductImages::getImageUrl)
                .findFirst()
                .orElse(
                        product.getProductImages().stream()
                                .map(ProductImages::getImageUrl)
                                .findFirst()
                                .orElse(null)
                );
    }


}

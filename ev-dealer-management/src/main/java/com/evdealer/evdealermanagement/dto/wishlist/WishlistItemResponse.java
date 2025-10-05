package com.evdealer.evdealermanagement.dto.wishlist;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistItemResponse {
    private String productName;
    private String thumbnailUrl;
}
package com.evdealer.evdealermanagement.dto.wishlist;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WishlistItemResponse {
    Long productId;
    String productName;
    String productThumbnail;
    LocalDateTime createAt;
}

package com.evdealer.evdealermanagement.dto.wishlist;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WishlistPageResponse<T> {
    List<T> items;
    int page;
    int size;
    long totalElements;
    int totalPages;
}

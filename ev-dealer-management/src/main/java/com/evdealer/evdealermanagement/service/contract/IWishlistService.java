package com.evdealer.evdealermanagement.service.contract;

import com.evdealer.evdealermanagement.dto.wishlist.WishlistItemResponse;
import com.evdealer.evdealermanagement.dto.wishlist.WishlistPageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IWishlistService {
    void addWishlistItem(Long accountId, Long productId);
    void removeWishlistItem(Long accountId, Long productId);
    WishlistPageResponse<WishlistItemResponse> listWishlistItem(Long accountId, Pageable pageable);

}

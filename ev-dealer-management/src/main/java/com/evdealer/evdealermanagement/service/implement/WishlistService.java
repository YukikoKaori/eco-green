package com.evdealer.evdealermanagement.service.implement;

import com.evdealer.evdealermanagement.dto.wishlist.WishlistItemResponse;
import com.evdealer.evdealermanagement.dto.wishlist.WishlistPageResponse;
import com.evdealer.evdealermanagement.entity.account.Account;
import com.evdealer.evdealermanagement.entity.product.Products;
import com.evdealer.evdealermanagement.entity.wishlist.WishlistItem;
import com.evdealer.evdealermanagement.exceptions.AppException;
import com.evdealer.evdealermanagement.exceptions.ErrorCode;
import com.evdealer.evdealermanagement.mapper.wishlist.WishlistMapper;
import com.evdealer.evdealermanagement.repository.ProductRepository;
import com.evdealer.evdealermanagement.repository.WishlistItemRepository;
import com.evdealer.evdealermanagement.service.contract.IWishlistService;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor // generate constructor cho all field final and có @Nonnull
@Transactional // ALL public method đều chạy trong transaction
public class WishlistService implements IWishlistService {

    private final WishlistItemRepository wishlistItemRepository;
    private final ProductRepository productRepository;
    private final EntityManager em;



    @Override
    public void addWishlistItem(Long accountId, Long productId) {

        if(!productRepository.existsById(productId)){
            throw new AppException(ErrorCode.USER_NOT_FOUND, "UserDetails is not of expected type");
        }

        if(wishlistItemRepository.existsByAccountIdAndProductId(accountId,productId)){
            return;
        }
        Account accountRef = em.getReference(Account.class, accountId);
        Products productRef = em.getReference(Products.class, productId);

        WishlistItem item = WishlistItem.builder()
                .account(accountRef)
                .product(productRef)
                .build();

        wishlistItemRepository.save(item);

    }

    @Override
    public void removeWishlistItem(Long accountId, Long productId) {

        wishlistItemRepository.deleteByAccountIdAndProductId(accountId,productId);

    }

    @Override
    @Transactional(readOnly = true)
    public WishlistPageResponse<WishlistItemResponse> listWishlistItem(Long accountId, Pageable pageable) {
        Page<WishlistItem> page = wishlistItemRepository.findByAccountId(accountId, pageable);

        List<WishlistItemResponse> items = page.getContent().stream()
                .map(WishlistMapper::mapToWishlistItemResponse).toList();

        return WishlistPageResponse.<WishlistItemResponse>builder()
                .items(items)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }


}

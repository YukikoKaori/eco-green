package com.evdealer.evdealermanagement.repository;

import com.evdealer.evdealermanagement.entity.wishlist.WishlistItem;
import jakarta.persistence.Entity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface WishlistItemRepository extends JpaRepository<WishlistItem,Long> {

    boolean existsByAccountIdAndProductId(Long accountId, Long productId);

    long deleteByAccountIdAndProductId(Long accountId, Long productId);

    @EntityGraph(attributePaths = {"product", "product.productImages"}) // @EntityGraph nói Spring Data JAP rằng là fetch join kèm luôn các table trong attributePaths khi query.
    Page<WishlistItem> findByAccountId(Long accountId, Pageable pageable);

}

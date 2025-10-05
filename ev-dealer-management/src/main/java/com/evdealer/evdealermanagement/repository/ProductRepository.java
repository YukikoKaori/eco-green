package com.evdealer.evdealermanagement.repository;

import com.evdealer.evdealermanagement.entity.product.Product;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {
    List<Product> findByType(Product.ProductType type);

    boolean existsById(@NotNull String productId);

    List<Product> findByTitleContainingIgnoreCase(String title);

    List<Product> findTop12ByStatusOrderByCreatedAtDesc(Product.Status status);
}
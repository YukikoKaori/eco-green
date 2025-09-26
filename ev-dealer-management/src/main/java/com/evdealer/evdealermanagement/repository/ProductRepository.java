package com.evdealer.evdealermanagement.repository;

import com.evdealer.evdealermanagement.dto.product.detail.ProductDetail;
import com.evdealer.evdealermanagement.entity.product.Products;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Products, Long> {
    List<Products> findByType(Products.ProductType type);
    boolean existsById(Long productId);

}

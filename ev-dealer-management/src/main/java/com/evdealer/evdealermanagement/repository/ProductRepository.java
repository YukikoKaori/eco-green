package com.evdealer.evdealermanagement.repository;

import com.evdealer.evdealermanagement.entity.product.Products;

import java.util.List;

public interface ProductRepository {

    List<Products> getAllProducts();
}

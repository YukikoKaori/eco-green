package com.evdealer.evdealermanagement.service.contract;

import com.evdealer.evdealermanagement.dto.Product.detail.ProductDetail;

import java.util.List;

public interface IProductService {
    List<ProductDetail> getAllProducts();
    ProductDetail getProductById();
}

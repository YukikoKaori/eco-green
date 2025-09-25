package com.evdealer.evdealermanagement.service.implement;

import com.evdealer.evdealermanagement.dto.product.detail.ProductDetail;
import com.evdealer.evdealermanagement.entity.product.Products;
import com.evdealer.evdealermanagement.repository.ProductRepository;
import com.evdealer.evdealermanagement.service.contract.IProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService implements IProductService {

    @Autowired
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public List<ProductDetail> getAllProducts() {
        try {
            return productRepository.findAll()
                    .stream()
                    .map(ProductDetail::fromEntity)
                    .toList();
        } catch (Exception e) {
            return List.of();
        }
    }

    @Override
    public ProductDetail getProductById() {
        return null;
    }
}

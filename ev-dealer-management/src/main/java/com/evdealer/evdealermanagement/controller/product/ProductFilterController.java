package com.evdealer.evdealermanagement.controller.product;

import com.evdealer.evdealermanagement.dto.product.detail.ProductDetail;
import com.evdealer.evdealermanagement.service.implement.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/product/filter")
@RequiredArgsConstructor
public class ProductFilterController {

    private final ProductService productService;

    @GetMapping("/new")
    public ResponseEntity<List<ProductDetail>> getNewProducts() {
        List<ProductDetail> newProducts = productService.getNewProducts();
        return ResponseEntity.ok(newProducts);
    }
}
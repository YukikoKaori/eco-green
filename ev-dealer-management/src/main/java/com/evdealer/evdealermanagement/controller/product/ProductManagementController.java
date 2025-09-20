package com.evdealer.evdealermanagement.controller.product;

import com.evdealer.evdealermanagement.dto.product.detail.ProductDetail;
import com.evdealer.evdealermanagement.service.implement.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@RequestMapping("/product")
public class ProductManagementController {

    @Autowired
    private final ProductService productService;

    public ProductManagementController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<List<ProductDetail>> getAllProduct() {
        List<ProductDetail> list = productService.getAllProducts();

        return ResponseEntity.ok(list);
    }
}

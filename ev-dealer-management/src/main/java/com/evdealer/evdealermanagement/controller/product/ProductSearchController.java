package com.evdealer.evdealermanagement.controller.product;

import com.evdealer.evdealermanagement.dto.product.detail.ProductDetail;
import com.evdealer.evdealermanagement.service.implement.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/product")
@RequiredArgsConstructor
public class ProductSearchController {

    private final ProductService productService;

    /**
     * Lấy tất cả sản phẩm
     * GET /api/v1/product/all
     */
    @GetMapping("/all")
    public ResponseEntity<List<ProductDetail>> getAllProducts() {
        try {
            log.info("Request to get all products");
            List<ProductDetail> products = productService.getAllProducts();

            if (products.isEmpty()) {
                log.info("No products found");
                return ResponseEntity.noContent().build();
            }

            log.info("Found {} products", products.size());
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            log.error("Error getting all products", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Tìm sản phẩm theo ID
     * GET /api/v1/product/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductDetail> getProductById(@PathVariable Long id) {
        try {
            log.info("Request to get product by ID: {}", id);

            if (id == null || id <= 0) {
                log.warn("Invalid product ID: {}", id);
                return ResponseEntity.badRequest().build();
            }

            Optional<ProductDetail> product = productService.getProductById(id);

            if (product.isPresent()) {
                log.info("Found product with ID: {}", id);
                return ResponseEntity.ok(product.get());
            } else {
                log.info("Product not found with ID: {}", id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error getting product by ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Tìm sản phẩm theo tên
     * GET /api/v1/product/search/name?name=example
     */
    @GetMapping("/search/name")
    public ResponseEntity<List<ProductDetail>> getProductsByName(@RequestParam String name) {
        try {
            log.info("Request to search products by name: {}", name);

            if (name == null || name.trim().isEmpty()) {
                log.warn("Product name is null or empty");
                return ResponseEntity.badRequest().build();
            }

            List<ProductDetail> products = productService.getProductByName(name.trim());

            if (products.isEmpty()) {
                log.info("No products found with name containing: {}", name);
                return ResponseEntity.noContent().build();
            }

            log.info("Found {} products with name containing: {}", products.size(), name);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            log.error("Error searching products by name: {}", name, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Tìm sản phẩm theo hãng
     * GET /api/v1/product/search/brand?brand=example
     */
    @GetMapping("/search/brand")
    public ResponseEntity<List<ProductDetail>> getProductsByBrand(@RequestParam String brand) {
        try {
            log.info("Request to search products by brand: {}", brand);

            if (brand == null || brand.trim().isEmpty()) {
                log.warn("Brand name is null or empty");
                return ResponseEntity.badRequest().build();
            }

            List<ProductDetail> products = productService.getProductByBrand(brand.trim());

            if (products.isEmpty()) {
                log.info("No products found for brand: {}", brand);
                return ResponseEntity.noContent().build();
            }

            log.info("Found {} products for brand: {}", products.size(), brand);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            log.error("Error searching products by brand: {}", brand, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Tìm sản phẩm theo loại (VEHICLE hoặc BATTERY)
     * GET /api/v1/product/search/type?type=VEHICLE
     */
    @GetMapping("/search/type")
    public ResponseEntity<List<ProductDetail>> getProductsByType(@RequestParam String type) {
        try {
            log.info("Request to search products by type: {}", type);

            if (type == null || type.trim().isEmpty()) {
                log.warn("Product type is null or empty");
                return ResponseEntity.badRequest().build();
            }

            // Validate type values
            String normalizedType = type.trim().toUpperCase();
            if (!normalizedType.equals("VEHICLE") && !normalizedType.equals("BATTERY")) {
                log.warn("Invalid product type: {}. Must be VEHICLE or BATTERY", type);
                return ResponseEntity.badRequest().build();
            }

            List<ProductDetail> products = productService.getProductByType(normalizedType);

            if (products.isEmpty()) {
                log.info("No products found for type: {}", normalizedType);
                return ResponseEntity.noContent().build();
            }

            log.info("Found {} products for type: {}", products.size(), normalizedType);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            log.error("Error searching products by type: {}", type, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Tìm kiếm sản phẩm với nhiều tiêu chí
     * GET /api/v1/product/search?name=example&brand=brand&type=VEHICLE
     */
    @GetMapping("/search")
    public ResponseEntity<List<ProductDetail>> searchProducts(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String type) {

        try {
            log.info("Request to search products with criteria - name: {}, brand: {}, type: {}",
                    name, brand, type);

            List<ProductDetail> products;

            // Priority: name > brand > type
            if (name != null && !name.trim().isEmpty()) {
                products = productService.getProductByName(name.trim());
            } else if (brand != null && !brand.trim().isEmpty()) {
                products = productService.getProductByBrand(brand.trim());
            } else if (type != null && !type.trim().isEmpty()) {
                String normalizedType = type.trim().toUpperCase();
                if (!normalizedType.equals("VEHICLE") && !normalizedType.equals("BATTERY")) {
                    log.warn("Invalid product type: {}. Must be VEHICLE or BATTERY", type);
                    return ResponseEntity.badRequest().build();
                }
                products = productService.getProductByType(normalizedType);
            } else {
                // If no criteria provided, return all products
                log.info("No search criteria provided, returning all products");
                products = productService.getAllProducts();
            }

            if (products.isEmpty()) {
                log.info("No products found for search criteria");
                return ResponseEntity.noContent().build();
            }

            log.info("Found {} products for search criteria", products.size());
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            log.error("Error searching products with criteria - name: {}, brand: {}, type: {}",
                    name, brand, type, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Kiểm tra sản phẩm có tồn tại không
     * GET /api/v1/product/exists/{id}
     */
    @GetMapping("/exists/{id}")
    public ResponseEntity<Boolean> checkProductExists(@PathVariable Long id) {
        try {
            log.info("Request to check if product exists with ID: {}", id);

            if (id == null || id <= 0) {
                log.warn("Invalid product ID: {}", id);
                return ResponseEntity.badRequest().build();
            }

            boolean exists = productService.existsById(id);
            log.info("Product with ID {} exists: {}", id, exists);

            return ResponseEntity.ok(exists);
        } catch (Exception e) {
            log.error("Error checking product existence for ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Lấy tổng số lượng sản phẩm
     * GET /api/v1/product/count
     */
    @GetMapping("/count")
    public ResponseEntity<Long> getProductCount() {
        try {
            log.info("Request to get product count");
            long count = productService.getProductCount();
            log.info("Total product count: {}", count);

            return ResponseEntity.ok(count);
        } catch (Exception e) {
            log.error("Error getting product count", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
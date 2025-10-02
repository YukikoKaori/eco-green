package com.evdealer.evdealermanagement.service.implement;

import com.evdealer.evdealermanagement.dto.product.detail.ProductDetail;
import com.evdealer.evdealermanagement.entity.product.Product;
import com.evdealer.evdealermanagement.mapper.product.ProductMapper;
import com.evdealer.evdealermanagement.repository.ProductRepository;
import com.evdealer.evdealermanagement.service.contract.IProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Stream;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService implements IProductService {

    private final ProductRepository productRepository;
    private final VehicleService vehicleService;
    private final BatteryService batteryService;

    @Override
    public List<ProductDetail> getAllProducts() {
        try {
            log.debug("Fetching all products");
            return productRepository.findAll()
                    .stream()
                    .map(ProductMapper::toDetailDto)
                    .toList();
        } catch (Exception e) {
            log.error("Error fetching all products", e);
            return List.of();
        }
    }

    public Optional<ProductDetail> getProductById(String id) {
        if (id == null || id.trim().isEmpty()) {
            log.warn("Invalid product ID: {}", id);
            return Optional.empty();
        }

        try {
            UUID.fromString(id); // Validate UUID format
            log.debug("Fetching product by ID: {}", id);
            return productRepository.findById(id)
                    .map(ProductMapper::toDetailDto);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid UUID format for product ID: {}", id);
            return Optional.empty();
        } catch (Exception e) {
            log.error("Error fetching product by ID: {}", id, e);
            return Optional.empty();
        }
    }

    @Override
    public Optional<ProductDetail> getProductById(Long id) {
        if (id == null) {
            log.warn("Invalid product ID: null");
            return Optional.empty();
        }
        try {
            log.debug("Fetching product by Long ID: {}", id);
            return productRepository.findById(String.valueOf(id))
                    .map(ProductMapper::toDetailDto);
        } catch (Exception e) {
            log.error("Error fetching product by Long ID: {}", id, e);
            return Optional.empty();
        }
    }

    @Override
    public List<ProductDetail> getProductByName(String name) {
        if (name == null || name.trim().isEmpty()) {
            log.warn("Product name is null or empty");
            return List.of();
        }

        try {
            log.debug("Searching products by name: {}", name);

            List<String> vehicleProductIds = vehicleService.getVehicleIdByName(name)
                    .stream()
                    .map(String::valueOf)
                    .toList();
            List<String> batteryProductIds = batteryService.getBatteryIdByName(name);

            List<String> allProductIds = Stream.concat(
                    vehicleProductIds.stream(),
                    batteryProductIds.stream()).distinct().toList();

            if (allProductIds.isEmpty()) {
                log.debug("No products found with name: {}", name);
                return List.of();
            }

            return productRepository.findAllById(allProductIds)
                    .stream()
                    .map(ProductMapper::toDetailDto)
                    .toList();

        } catch (Exception e) {
            log.error("Error searching products by name: {}", name, e);
            return List.of();
        }
    }

    @Override
    public List<ProductDetail> getProductByType(String type) {
        if (type == null || type.trim().isEmpty()) {
            log.warn("Product type is null or empty");
            return List.of();
        }

        try {
            log.debug("Fetching products by type: {}", type);
            Product.ProductType enumType = Product.ProductType.valueOf(type.toUpperCase());
            return productRepository.findByType(enumType)
                    .stream()
                    .map(ProductMapper::toDetailDto)
                    .toList();

        } catch (IllegalArgumentException e) {
            log.warn("Invalid product type: {}", type);
            return List.of();
        } catch (Exception e) {
            log.error("Error fetching products by type: {}", type, e);
            return List.of();
        }
    }

    @Override
    public List<ProductDetail> getProductByBrand(String brand) {
        if (brand == null || brand.trim().isEmpty()) {
            log.warn("Brand name is null or empty");
            return List.of();
        }

        try {
            log.debug("Fetching products by brand: {}", brand);

            List<String> vehicleProductIds = vehicleService.getVehicleIdByBrand(brand)
                    .stream()
                    .map(String::valueOf)
                    .toList();
            List<String> batteryProductIds = batteryService.getBatteryIdByBrand(brand);

            List<String> allProductIds = Stream.concat(
                    vehicleProductIds.stream(),
                    batteryProductIds.stream()).distinct().toList();

            if (allProductIds.isEmpty()) {
                log.debug("No products found for brand: {}", brand);
                return List.of();
            }

            return productRepository.findAllById(allProductIds)
                    .stream()
                    .map(ProductMapper::toDetailDto)
                    .toList();

        } catch (Exception e) {
            log.error("Error fetching products by brand: {}", brand, e);
            return List.of();
        }
    }
}

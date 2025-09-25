package com.evdealer.evdealermanagement.service.implement;

import com.evdealer.evdealermanagement.entity.battery.BatteryDetails;
import com.evdealer.evdealermanagement.repository.BatteryDetailRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class BatteryService {

    private final BatteryDetailRepository batteryDetailRepository;

    /**
     * Lấy danh sách Battery Product IDs theo tên sản phẩm
     */
    public List<Long> getBatteryIdByName(String name) {
        if (name == null || name.trim().isEmpty()) {
            log.warn("Battery name is null or empty");
            return List.of();
        }

        try {
            log.debug("Getting battery IDs by name: {}", name);
            return batteryDetailRepository.findBatteryProductIdsByName(name);
        } catch (Exception e) {
            log.error("Error getting battery IDs by name: {}", name, e);
            return List.of();
        }
    }

    /**
     * Lấy danh sách Battery Product IDs theo tên hãng
     */
    public List<Long> getBatteryIdByBrand(String brand) {
        if (brand == null || brand.trim().isEmpty()) {
            log.warn("Battery brand is null or empty");
            return List.of();
        }

        try {
            log.debug("Getting battery IDs by brand: {}", brand);
            return batteryDetailRepository.findBatteryProductIdsByBrand(brand);
        } catch (Exception e) {
            log.error("Error getting battery IDs by brand: {}", brand, e);
            return List.of();
        }
    }

    /**
     * Lấy BatteryDetails theo tên sản phẩm
     */
    public List<BatteryDetails> getBatteryDetailsByProductName(String name) {
        if (name == null || name.trim().isEmpty()) {
            log.warn("Product name is null or empty");
            return List.of();
        }

        try {
            log.debug("Getting battery details by product name: {}", name);
            return batteryDetailRepository.findBatteryDetailsByProductName(name);
        } catch (Exception e) {
            log.error("Error getting battery details by product name: {}", name, e);
            return List.of();
        }
    }

    /**
     * Lấy BatteryDetails theo ID
     */
    public Optional<BatteryDetails> getBatteryDetailsById(Long id) {
        if (id == null || id <= 0) {
            log.warn("Invalid battery ID: {}", id);
            return Optional.empty();
        }

        try {
            log.debug("Getting battery details by ID: {}", id);
            return batteryDetailRepository.findById(id);
        } catch (Exception e) {
            log.error("Error getting battery details by ID: {}", id, e);
            return Optional.empty();
        }
    }

    /**
     * Lấy tất cả BatteryDetails
     */
    public List<BatteryDetails> getAllBatteryDetails() {
        try {
            log.debug("Getting all battery details");
            return batteryDetailRepository.findAll();
        } catch (Exception e) {
            log.error("Error getting all battery details", e);
            return List.of();
        }
    }

    /**
     * Lấy pin theo model
     */
    public List<BatteryDetails> getBatteryDetailsByModel(String model) {
        if (model == null || model.trim().isEmpty()) {
            log.warn("Battery model is null or empty");
            return List.of();
        }

        try {
            log.debug("Getting batteries by model: {}", model);
            return batteryDetailRepository.findBatteryDetailsByModel(model);
        } catch (Exception e) {
            log.error("Error getting batteries by model: {}", model, e);
            return List.of();
        }
    }

    /**
     * Lấy pin theo voltage range
     */
    public List<BatteryDetails> getBatteriesByVoltageRange(Double minVoltage, Double maxVoltage) {
        if (minVoltage == null || maxVoltage == null || minVoltage < 0 || maxVoltage < minVoltage) {
            log.warn("Invalid voltage range: {} - {}", minVoltage, maxVoltage);
            return List.of();
        }

        try {
            log.debug("Getting batteries by voltage range: {} - {}", minVoltage, maxVoltage);
            return batteryDetailRepository.findBatteriesByVoltageRange(minVoltage, maxVoltage);
        } catch (Exception e) {
            log.error("Error getting batteries by voltage range: {} - {}", minVoltage, maxVoltage, e);
            return List.of();
        }
    }

    /**
     * Lấy pin theo capacity range
     */
    public List<BatteryDetails> getBatteriesByCapacityRange(Double minCapacity, Double maxCapacity) {
        if (minCapacity == null || maxCapacity == null || minCapacity < 0 || maxCapacity < minCapacity) {
            log.warn("Invalid capacity range: {} - {}", minCapacity, maxCapacity);
            return List.of();
        }

        try {
            log.debug("Getting batteries by capacity range: {} - {}", minCapacity, maxCapacity);
            return batteryDetailRepository.findBatteriesByCapacityRange(minCapacity, maxCapacity);
        } catch (Exception e) {
            log.error("Error getting batteries by capacity range: {} - {}", minCapacity, maxCapacity, e);
            return List.of();
        }
    }

    /**
     * Lấy pin theo danh sách các hãng
     */
    public List<BatteryDetails> getBatteriesByBrands(List<String> brandNames) {
        if (brandNames == null || brandNames.isEmpty()) {
            log.warn("Brand names list is null or empty");
            return List.of();
        }

        try {
            log.debug("Getting batteries by brands: {}", brandNames);
            return batteryDetailRepository.findBatteriesByBrands(brandNames);
        } catch (Exception e) {
            log.error("Error getting batteries by brands: {}", brandNames, e);
            return List.of();
        }
    }

    /**
     * Lấy pin của các hãng phổ biến (Panasonic, Samsung SDI, LG Energy)
     */
    public List<BatteryDetails> getPopularBrandBatteries() {
        List<String> popularBrands = List.of("Panasonic", "Samsung SDI", "LG Energy");
        return getBatteriesByBrands(popularBrands);
    }
}
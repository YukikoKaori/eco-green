package com.evdealer.evdealermanagement.repository;

import com.evdealer.evdealermanagement.entity.battery.BatteryDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BatteryDetailRepository extends JpaRepository<BatteryDetails, Long> {

    // Tìm BatteryDetails theo tên sản phẩm
    @Query("SELECT bd FROM BatteryDetails bd " +
            "JOIN bd.product p " +
            "WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<BatteryDetails> findBatteryDetailsByProductName(@Param("name") String name);

    // Lấy Product ID theo tên sản phẩm
    @Query("SELECT bd.product.id FROM BatteryDetails bd " +
            "JOIN bd.product p " +
            "WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Long> findBatteryProductIdsByName(@Param("name") String name);

    // Tìm theo tên hãng pin
    @Query("SELECT bd.product.id FROM BatteryDetails bd " +
            "JOIN bd.brand b " +
            "WHERE LOWER(b.name) LIKE LOWER(CONCAT('%', :brandName, '%'))")
    List<Long> findBatteryProductIdsByBrand(@Param("brandName") String brandName);

    // Tìm theo model pin
    @Query("SELECT bd FROM BatteryDetails bd " +
            "WHERE LOWER(bd.model) LIKE LOWER(CONCAT('%', :model, '%'))")
    List<BatteryDetails> findBatteryDetailsByModel(@Param("model") String model);

    // Lấy pin theo range voltage
    @Query("SELECT bd FROM BatteryDetails bd " +
            "WHERE bd.voltageV BETWEEN :minVoltage AND :maxVoltage")
    List<BatteryDetails> findBatteriesByVoltageRange(@Param("minVoltage") Double minVoltage,
                                                     @Param("maxVoltage") Double maxVoltage);

    // Lấy pin theo các hãng phổ biến
    @Query("SELECT bd FROM BatteryDetails bd " +
            "JOIN bd.brand b " +
            "WHERE b.name IN :brandNames")
    List<BatteryDetails> findBatteriesByBrands(@Param("brandNames") List<String> brandNames);

    // Tìm pin theo capacity range
    @Query("SELECT bd FROM BatteryDetails bd " +
            "WHERE bd.capacityAh BETWEEN :minCapacity AND :maxCapacity")
    List<BatteryDetails> findBatteriesByCapacityRange(@Param("minCapacity") Double minCapacity,
                                                      @Param("maxCapacity") Double maxCapacity);
}

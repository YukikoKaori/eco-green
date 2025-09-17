package com.evdealer.evdealermanagement.entity.battery;

import com.evdealer.evdealermanagement.entity.product.Products;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "battery_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BatteryDetails {

    @Id
    @Column(name = "product_id")
    private Long productId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "product_id")
    private Products product;

    @ManyToOne
    @JoinColumn(name = "battery_type_id", nullable = false)
    private BatteryTypes batteryType;

    @ManyToOne
    @JoinColumn(name = "brand_id")
    private BatteryBrands brand;

    @Column(name = "capacity_ah")
    private Double capacityAh;

    @Column(name = "voltage_v")
    private Double voltageV;

    @Column(name = "energy_wh")
    private Double energyWh;

    @Column(name = "weight_kg")
    private Double weightKg;

    @Column(name = "length_mm")
    private Double lengthMm;

    @Column(name = "width_mm")
    private Double widthMm;

    @Column(name = "height_mm")
    private Double heightMm;

    private String model;

    @Column(name = "manufacturing_date")
    private LocalDate manufacturingDate;

    @Column(name = "cycle_count")
    private Integer cycleCount;

    @Column(name = "health_percent")
    private Short healthPercent;

    @Column(name = "max_charge_current_a")
    private Double maxChargeCurrentA;

    @Column(name = "max_discharge_current_a")
    private Double maxDischargeCurrentA;
}

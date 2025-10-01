package com.evdealer.evdealermanagement.entity.battery;

import com.evdealer.evdealermanagement.entity.BaseEntity;
import com.evdealer.evdealermanagement.entity.product.Product;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "battery_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BatteryDetails extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @PrimaryKeyJoinColumn
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "battery_type_id", nullable = false)
    private BatteryTypes batteryType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id")
    private BatteryBrands brand;

    @Column(name = "capacity_kwh", precision = 10, scale = 2)
    private BigDecimal capacityKwh;

    @Column(name = "health_percent")
    private Integer healthPercent;
}

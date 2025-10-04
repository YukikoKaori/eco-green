package com.evdealer.evdealermanagement.entity.product;

import com.evdealer.evdealermanagement.entity.BaseEntity;
import com.evdealer.evdealermanagement.entity.account.Account;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Product extends BaseEntity {

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProductType type; // VEHICLE, BATTERY

    @Column(precision = 15, scale = 2)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(name = "condition_type", length = 10, nullable = false)
    private ConditionType conditionType; // NEW, USED

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private Status status; // DRAFT, ACTIVE, SOLD

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private Account seller;

    @UpdateTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductImages> images;

    @Column(name = "posting_fee", precision = 38, scale = 2)
    private BigDecimal postingFee;

    @Column(name = "action_end_time")
    private LocalDateTime actionEndTime;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "seller_phone", length = 10)
    private String sellerPhone;

    @Column(name = "approved_by")
    private String approveBy;

    @Column(name = "city", length = 255)
    private String city;

    @Column(name = "district", length = 255)
    private String district;

    @Column(name = "ward", length = 255)
    private String ward;

    @Column(name = "address_detail", columnDefinition = "text")
    private String addressDetail;

    @Column(name = "is_negotiable")
    private Boolean negotiable;

    @Column(name = "reject_reason", length = 255)
    private String rejectReason;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum ProductType {
        VEHICLE, BATTERY
    }

    public enum ConditionType {
        NEW, USED
    }

    public enum Status {
        DRAFT, ACTIVE, SOLD, PENDING_REVIEW, PUBLISHED, REJECTED, EXPIRED
    }
}

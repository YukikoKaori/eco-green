package com.evdealer.evdealermanagement.entity.product;

import com.evdealer.evdealermanagement.entity.account.Account;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Products {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private ProductType type; // vehicle, battery

    private BigDecimal price;

    @Column(name = "condition_type")
    @Enumerated(EnumType.STRING)
    private ConditionType conditionType;

    @Column(name = "is_negotiable")
    private Boolean negotiable = true;

    @Column(name = "posting_fee")
    private BigDecimal postingFee;

    @Column(name = "sale_type")
    @Enumerated(EnumType.STRING)
    private SaleType saleType;

    @Column(name = "auction_end_time")
    private LocalDateTime auctionEndTime;

    @ManyToOne
    @JoinColumn(name = "seller_id", nullable = false)
    private Account seller;

    @Column(name = "seller_phone")
    private String sellerPhone;

    private String city;
    private String district;
    private String ward;

    @Column(name = "address_detail", columnDefinition = "TEXT")
    private String addressDetail;

    @Enumerated(EnumType.STRING)
    private Status status;

    @ManyToOne
    @JoinColumn(name = "approved_by")
    private Account approvedBy;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum ProductType { VEHICLE, BATTERY }
    public enum ConditionType { NEW, USED }
    public enum SaleType { FIXED_PRICE, NEGOTIATION, AUCTION }
    public enum Status { DRAFT, PENDING, ACTIVE, SOLD, EXPIRED, REJECTED }
}

DROP DATABASE IF EXISTS eco_green;
CREATE DATABASE eco_green CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE eco_green;

-- ======================
-- 1. Bảng quản lý tài khoản (Member & Admin & Staff)
-- ======================
CREATE TABLE accounts (
    id                        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, -- Khóa chính
    username                  VARCHAR(50) NOT NULL UNIQUE,                -- Tên đăng nhập duy nhất
    email                     VARCHAR(255) NOT NULL UNIQUE,               -- Email duy nhất
    password_hash             VARCHAR(255) NOT NULL,                      -- Mật khẩu (hash)
    full_name                 VARCHAR(100) NOT NULL,                      -- Họ tên
    phone                     VARCHAR(15),                                -- Số điện thoại
    national_id               VARCHAR(20) UNIQUE,                         -- Số CCCD/CMND
    national_id_issued_date   DATE,                                       -- Ngày cấp CCCD/CMND
    tax_code                  VARCHAR(20) UNIQUE,                         -- Mã số thuế cá nhân
    date_of_birth             DATE,                                       -- Ngày tháng năm sinh
    gender                    ENUM('MALE','FEMALE','OTHER') NULL,         -- Giới tính
    address                   TEXT,                                       -- Địa chỉ
    avatar_url                VARCHAR(500),                               -- Ảnh đại diện
    role                      ENUM('MEMBER','ADMIN','STAFF') NOT NULL DEFAULT 'MEMBER', -- Quyền
    staff_permissions         JSON NULL,                                  -- Quyền của staff
    status                    ENUM('ACTIVE','INACTIVE','BANNED','PENDING') DEFAULT 'ACTIVE', -- Trạng thái tài khoản
    email_verified            BOOLEAN DEFAULT FALSE,                      -- Đã xác minh email chưa
    created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,        -- Ngày tạo
    updated_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Ngày cập nhật
    INDEX idx_username        (username),
    INDEX idx_email           (email),
    INDEX idx_phone           (phone),
    INDEX idx_national_id     (national_id),
    INDEX idx_tax_code        (tax_code),
    INDEX idx_status          (status),
    INDEX idx_role            (role),
    INDEX idx_gender          (gender)
);

-- ======================
-- 1.1. Bảng liên kết MXH (Google, Facebook)
-- ======================
CREATE TABLE social_accounts (
    id                        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, -- Khóa chính
    account_id                BIGINT UNSIGNED NOT NULL,                   -- Tham chiếu đến accounts
    provider                  ENUM('GOOGLE','FACEBOOK') NOT NULL,         -- Nhà cung cấp (Google/Facebook)
    provider_user_id          VARCHAR(255) NOT NULL,                      -- ID user bên Google/Facebook
    email                     VARCHAR(255),                               -- Email từ provider
    avatar_url                VARCHAR(500),                               -- Ảnh đại diện từ provider
    created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,        -- Ngày tạo liên kết

    FOREIGN KEY (account_id)  REFERENCES accounts(id) ON DELETE CASCADE,  -- Xóa account -> xóa luôn liên kết
    UNIQUE KEY unique_provider_user (provider, provider_user_id),          -- Đảm bảo 1 user duy nhất bên provider
    INDEX idx_provider        (provider),
    INDEX idx_account         (account_id)
);

-- ======================
-- 2. Bảng hãng xe
-- ======================
CREATE TABLE vehicle_brands (
    id                        SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name                      VARCHAR(100) NOT NULL UNIQUE,               -- Tên hãng xe
    country                   VARCHAR(50),                                -- Quốc gia
    logo_url                  VARCHAR(500),                               -- Logo
    status                    ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE', -- Trạng thái
    created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_status          (status)
);

-- ======================
-- 2.1. Bảng hãng pin
-- ======================
CREATE TABLE battery_brands (
    id                        SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name                      VARCHAR(100) NOT NULL UNIQUE,               -- Tên hãng pin
    country                   VARCHAR(50),
    logo_url                  VARCHAR(500),
    status                    ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
    created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_status          (status)
);

-- ======================
-- 3. Bảng loại xe
-- ======================
CREATE TABLE vehicle_categories (
    id                        TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name                      VARCHAR(50) NOT NULL UNIQUE,                -- Loại xe (scooter, car,…)
    description               TEXT,                                       -- Mô tả
    status                    ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
    created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================
-- 4. Bảng loại pin
-- ======================
CREATE TABLE battery_types (
    id                        TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name                      VARCHAR(50) NOT NULL UNIQUE,                -- Loại pin
    typical_voltage_v         DECIMAL(4,1),                               -- Điện áp điển hình
    typical_lifespan_cycles   INT UNSIGNED,                               -- Chu kỳ sạc
    status                    ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
    created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_status          (status)
);

-- ======================
-- 5. Bảng sản phẩm
-- ======================
CREATE TABLE products (
    id                        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title                     VARCHAR(255) NOT NULL,                      -- Tiêu đề
    description               TEXT,                                       -- Mô tả chi tiết
    type                      ENUM('VEHICLE','BATTERY') NOT NULL,         -- Loại sản phẩm

    price                     DECIMAL(15,2) NULL,                         -- Giá bán
    condition_type            ENUM('NEW','USED') NOT NULL DEFAULT 'USED', -- Tình trạng
    is_negotiable             BOOLEAN DEFAULT TRUE,                       -- Có thương lượng không
    posting_fee               DECIMAL(10,2) DEFAULT 0.00,                 -- Phí đăng bài

    sale_type                 ENUM('FIXED_PRICE','NEGOTIATION','AUCTION') NOT NULL DEFAULT 'FIXED_PRICE', -- Kiểu bán
    auction_end_time          TIMESTAMP NULL,                             -- Thời gian kết thúc đấu giá (nếu có)

    seller_id                 BIGINT UNSIGNED NOT NULL,                   -- Người bán
    seller_phone              VARCHAR(15),                                -- SĐT liên hệ
    city                      VARCHAR(100),
    district                  VARCHAR(100),
    ward                      VARCHAR(100),
    address_detail            TEXT,

    status                    ENUM('DRAFT','PENDING','ACTIVE','SOLD','EXPIRED','REJECTED') DEFAULT 'DRAFT', -- Trạng thái
    reject_reason             VARCHAR(500) NULL,                          -- Lý do từ chối
    approved_by               BIGINT UNSIGNED NULL,                       -- Người duyệt
    expires_at                TIMESTAMP NULL,                             -- Thời gian hết hạn

    created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (seller_id)   REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES accounts(id) ON DELETE SET NULL,

    INDEX idx_type            (type),
    INDEX idx_status          (status),
    INDEX idx_seller          (seller_id),
    INDEX idx_location        (city, district),
    INDEX idx_price           (price),
    INDEX idx_created         (created_at)
);

-- ======================
-- 6. Bảng hình ảnh sản phẩm
-- ======================
CREATE TABLE product_images (
    id                        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id                BIGINT UNSIGNED NOT NULL,
    image_url                 VARCHAR(500) NOT NULL,                      -- Link ảnh
    alt_text                  VARCHAR(255),                               -- Văn bản thay thế
    sort_order                TINYINT UNSIGNED DEFAULT 0,                 -- Thứ tự hiển thị
    is_primary                BOOLEAN DEFAULT FALSE,                      -- Ảnh chính
    created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id)  REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product         (product_id),
    INDEX idx_primary         (product_id, is_primary)
);

-- ======================
-- 7. Bảng chi tiết xe
-- ======================
CREATE TABLE vehicle_details (
    product_id                BIGINT UNSIGNED PRIMARY KEY,                -- Khóa chính cũng là product_id
    category_id               TINYINT UNSIGNED NOT NULL,                  -- Loại xe
    brand_id                  SMALLINT UNSIGNED,                          -- Hãng xe

    model                     VARCHAR(100),                               -- Model xe
    year                      YEAR,                                       -- Năm sản xuất
    color                     VARCHAR(50),

    max_speed_kmh             SMALLINT UNSIGNED,
    range_km                  SMALLINT UNSIGNED,
    charging_time_hours       DECIMAL(4,1),
    motor_power_w             INT UNSIGNED,
    weight_kg                 DECIMAL(6,1),

    battery_capacity          DECIMAL(10,2),                              -- Dung lượng pin tích hợp
    built_in_battery_voltage_v   DECIMAL(6,2),
    removable_battery         BOOLEAN DEFAULT TRUE,

    mileage_km                INT UNSIGNED,
    battery_health_percent    TINYINT UNSIGNED,

    has_registration          BOOLEAN DEFAULT FALSE,
    has_insurance             BOOLEAN DEFAULT FALSE,
    warranty_months           TINYINT UNSIGNED,

    FOREIGN KEY (product_id)  REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES vehicle_categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (brand_id)    REFERENCES vehicle_brands(id) ON DELETE SET NULL,

    INDEX idx_category        (category_id),
    INDEX idx_brand           (brand_id),
    INDEX idx_brand_model     (brand_id, model),
    INDEX idx_year            (year)
);

-- ======================
-- 8. Bảng chi tiết pin
-- ======================
CREATE TABLE battery_details (
    product_id                BIGINT UNSIGNED PRIMARY KEY,
    battery_type_id           TINYINT UNSIGNED NOT NULL,                  -- Loại pin
    brand_id                  SMALLINT UNSIGNED,                          -- Hãng pin

    capacity_kwh              DECIMAL(10,2) NOT NULL,                     -- Dung lượng (kWh)
    voltage_v                 DECIMAL(6,2) NOT NULL,                      -- Điện áp (V)
    energy_wh                 DECIMAL(10,2),                              -- Năng lượng (Wh)
    weight_kg                 DECIMAL(6,1),

    length_mm                 DECIMAL(6,1),
    width_mm                  DECIMAL(6,1),
    height_mm                 DECIMAL(6,1),

    model                     VARCHAR(100),                               -- Model pin
    manufacturing_date        DATE,                                       -- Ngày sản xuất

    cycle_count               INT UNSIGNED,                               -- Số lần sạc
    health_percent            TINYINT UNSIGNED,                           -- % sức khỏe
    max_charge_current_a      DECIMAL(6,2),
    max_discharge_current_a   DECIMAL(6,2),
    warranty_months           INT,

    FOREIGN KEY (product_id)      REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (battery_type_id) REFERENCES battery_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (brand_id)        REFERENCES battery_brands(id) ON DELETE SET NULL,

    INDEX idx_battery_type    (battery_type_id),
    INDEX idx_brand           (brand_id),
    INDEX idx_model           (model)
);

-- ======================
-- 9. Bảng tương thích xe-pin
-- ======================
CREATE TABLE vehicle_battery_compatibility (
    id                        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    vehicle_product_id        BIGINT UNSIGNED NOT NULL,                   -- Xe
    battery_product_id        BIGINT UNSIGNED NOT NULL,                   -- Pin

    compatibility_level       ENUM('PERFECT','GOOD','PARTIAL') NOT NULL DEFAULT 'GOOD',
    created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (vehicle_product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (battery_product_id) REFERENCES products(id) ON DELETE CASCADE,

    UNIQUE KEY unique_compatibility (vehicle_product_id, battery_product_id),
    INDEX idx_vehicle         (vehicle_product_id),
    INDEX idx_battery         (battery_product_id),
    INDEX idx_compatibility   (compatibility_level)
);

-- ======================
-- 10. Bảng giỏ hàng
-- ======================
CREATE TABLE carts (
    id                        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    account_id                BIGINT UNSIGNED NOT NULL UNIQUE,            -- Một user chỉ có một giỏ
    status                    ENUM('ACTIVE','CHECKED_OUT') DEFAULT 'ACTIVE',
    created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (account_id)  REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE cart_items (
    cart_item_id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cart_id                   BIGINT UNSIGNED NOT NULL,
    product_id                BIGINT UNSIGNED NOT NULL,
    quantity                  INT UNSIGNED DEFAULT 1,

    FOREIGN KEY (cart_id)     REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id)  REFERENCES products(id) ON DELETE CASCADE,

    UNIQUE KEY unique_cart_product (cart_id, product_id)
);

-- ======================
-- 11. Bảng yêu thích
-- ======================
CREATE TABLE wishlists (
    wishlist_id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    account_id                BIGINT UNSIGNED NOT NULL,
    product_id                BIGINT UNSIGNED NOT NULL,
    created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (account_id)  REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id)  REFERENCES products(id) ON DELETE CASCADE,

    UNIQUE KEY unique_wishlist (account_id, product_id)
);

-- ======================
-- 12.1. Bảng phương thức thanh toán
-- ======================
CREATE TABLE payment_methods (
    method_id                 BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name                      VARCHAR(50) NOT NULL UNIQUE,  -- 'MoMo','ZaloPay','VNPay','Bank Transfer','COD'
    type                      ENUM('COD','BANK','EWALLET','CARD') NOT NULL,
    logo_url                  VARCHAR(500),
    is_active                 BOOLEAN DEFAULT TRUE,
    processing_fee_percent    DECIMAL(4,2) DEFAULT 0.00
);

-- ======================
-- 12. Bảng đơn hàng
-- ======================
CREATE TABLE orders (
    id                        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id                   BIGINT UNSIGNED NOT NULL,                   -- Khách hàng mua (để tương thích cũ)
    buyer_id                  BIGINT UNSIGNED NULL,                       -- Người mua (rõ ràng hơn)
    seller_id                 BIGINT UNSIGNED NULL,                       -- Người bán
    product_id                BIGINT UNSIGNED NULL,                       -- Sản phẩm
    quantity                  INT UNSIGNED NOT NULL DEFAULT 1,            -- Số lượng
    
    status                    ENUM('PENDING','PAID','SHIPPED','COMPLETED','CANCELLED') DEFAULT 'PENDING',
    total_price               DECIMAL(15,2) NOT NULL,
    shipping_address          TEXT,
    created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)     REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id)    REFERENCES accounts(id) ON DELETE SET NULL,
    FOREIGN KEY (seller_id)   REFERENCES accounts(id) ON DELETE SET NULL,
    FOREIGN KEY (product_id)  REFERENCES products(id) ON DELETE SET NULL,
    
    INDEX idx_buyer           (buyer_id),
    INDEX idx_seller          (seller_id),
    INDEX idx_product_order   (product_id)
);

CREATE TABLE order_items (
    id                        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id                  BIGINT UNSIGNED NOT NULL,
    product_id                BIGINT UNSIGNED NOT NULL,
    price                     DECIMAL(15,2) NOT NULL,
    quantity                  INT UNSIGNED NOT NULL DEFAULT 1,

    FOREIGN KEY (order_id)    REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id)  REFERENCES products(id) ON DELETE CASCADE
);

-- ======================
-- 12.2. Bảng thanh toán
-- ======================
CREATE TABLE payments (
    payment_id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id                  BIGINT UNSIGNED NULL,                       -- Có thể null cho thanh toán phí đăng bài
    product_id                BIGINT UNSIGNED NULL,                       -- Sản phẩm thanh toán phí (MỚI)
    payment_type              ENUM('ORDER','POSTING_FEE') NOT NULL DEFAULT 'ORDER', -- Loại thanh toán (MỚI)
    
    payment_method_id         TINYINT UNSIGNED NULL,                      -- Để tương thích cũ
    method_id                 BIGINT UNSIGNED NULL,                       -- Tham chiếu mới

    amount                    DECIMAL(15,2) NOT NULL,                     -- Số tiền thanh toán
    fee                       DECIMAL(10,2) DEFAULT 0.00,                 -- Phí xử lý

    transaction_id            VARCHAR(255),                               -- ID từ gateway
    gateway_reference         VARCHAR(255),                               -- Mã tham chiếu
    status                    ENUM('PENDING','PROCESSING','COMPLETED','FAILED','REFUNDED') DEFAULT 'PENDING',
    gateway_response          JSON,                                       -- Lưu raw response

    paid_at                   TIMESTAMP NULL,                             -- Ngày thanh toán
    created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id)    REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id)  REFERENCES products(id) ON DELETE CASCADE,  -- MỚI
    FOREIGN KEY (method_id)   REFERENCES payment_methods(method_id) ON DELETE SET NULL,

    INDEX idx_status          (status),
    INDEX idx_transaction     (transaction_id),
    INDEX idx_payment_type    (payment_type),                            -- MỚI
    INDEX idx_product_payment (product_id)                               -- MỚI
);

-- ======================
-- 13. Bảng đấu giá
-- ======================
CREATE TABLE auctions (
    auction_id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id                BIGINT UNSIGNED NOT NULL,                   -- Sản phẩm đấu giá
    seller_id                 BIGINT UNSIGNED NOT NULL,                   -- Người bán

    start_price               DECIMAL(15,2) NOT NULL,                     -- Giá khởi điểm
    reserve_price             DECIMAL(15,2),                              -- Giá sàn
    current_price             DECIMAL(15,2) DEFAULT 0.00,                 -- Giá hiện tại
    bid_increment             DECIMAL(10,2) DEFAULT 1000,                 -- Bước giá

    start_time                TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time                  TIMESTAMP NOT NULL,
    status                    ENUM('PENDING','ACTIVE','ENDED','CANCELLED') DEFAULT 'PENDING',

    created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id)  REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id)   REFERENCES accounts(id) ON DELETE CASCADE
);

-- ======================
-- 14. Bảng lượt đặt giá (bid)
-- ======================
CREATE TABLE auction_bids (
    bid_id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    auction_id                BIGINT UNSIGNED NOT NULL,
    bidder_id                 BIGINT UNSIGNED NOT NULL,

    amount                    DECIMAL(15,2) NOT NULL,
    created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (auction_id)  REFERENCES auctions(auction_id) ON DELETE CASCADE,
    FOREIGN KEY (bidder_id)   REFERENCES accounts(id) ON DELETE CASCADE,

    INDEX idx_bid_amount      (amount),
    INDEX idx_bidder          (bidder_id),
    INDEX idx_auction         (auction_id)
);

-- ======================
-- 15. Bảng báo cáo
-- ======================
CREATE TABLE reports (
    id                        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    reporter_id               BIGINT UNSIGNED NOT NULL,                   -- Người báo cáo
    product_id                BIGINT UNSIGNED NULL,                       -- Sản phẩm bị báo cáo (có thể null)
    order_id                  BIGINT UNSIGNED NULL,                       -- Đơn hàng bị báo cáo (có thể null)
    
    report_type               ENUM('SCAM','FAKE_INFO','DAMAGED_PRODUCT','OTHER') NOT NULL, -- Loại báo cáo
    description               TEXT,                                       -- Mô tả chi tiết
    evidence_urls             JSON,                                       -- Link ảnh/video chứng minh
    
    status                    ENUM('PENDING','RESOLVED','REJECTED') DEFAULT 'PENDING', -- Trạng thái xử lý
    staff_id                  BIGINT UNSIGNED NULL,                       -- Staff xử lý
    staff_notes               TEXT,                                       -- Ghi chú của staff
    resolved_at               TIMESTAMP NULL,                             -- Thời gian giải quyết
    
    created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (reporter_id) REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id)  REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id)    REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id)    REFERENCES accounts(id) ON DELETE SET NULL,
    
    INDEX idx_reporter        (reporter_id),
    INDEX idx_product         (product_id),
    INDEX idx_order           (order_id),
    INDEX idx_status          (status),
    INDEX idx_type            (report_type),
    INDEX idx_staff           (staff_id)
);

-- ======================
-- 16. BẢNG BÌNH LUẬN SẢN PHẨM
-- ======================
CREATE TABLE product_comments (
    id                        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id                BIGINT UNSIGNED NOT NULL,                   -- Sản phẩm được bình luận
    commenter_id              BIGINT UNSIGNED NOT NULL,                   -- Người bình luận
    parent_id                 BIGINT UNSIGNED NULL,                       -- Trả lời bình luận (null = bình luận gốc)
    
    content                   TEXT NOT NULL,                              -- Nội dung bình luận
    
    status                    ENUM('ACTIVE','HIDDEN','DELETED') DEFAULT 'ACTIVE', -- Trạng thái
    
    created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id)  REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (commenter_id) REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id)   REFERENCES product_comments(id) ON DELETE CASCADE,
    
    INDEX idx_product         (product_id),
    INDEX idx_commenter       (commenter_id),
    INDEX idx_parent          (parent_id),
    INDEX idx_created         (created_at),
    INDEX idx_status          (status)
);

-- ======================
-- 17. BẢNG CUỘC TRÒ CHUYỆN
-- ======================
CREATE TABLE conversations (
    id                        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id                BIGINT UNSIGNED NULL,                       -- Liên quan sản phẩm nào (có thể null)
    
    buyer_id                  BIGINT UNSIGNED NOT NULL,                   -- Người mua hỏi
    seller_id                 BIGINT UNSIGNED NOT NULL,                   -- Người bán
    
    status                    ENUM('ACTIVE','ARCHIVED','BLOCKED') DEFAULT 'ACTIVE',
    
    last_message_at           TIMESTAMP NULL,                             -- Tin nhắn cuối
    last_message_preview      VARCHAR(100),                               -- Preview tin nhắn cuối
    
    is_blocked_by_buyer       BOOLEAN DEFAULT FALSE,                      -- Buyer block seller
    is_blocked_by_seller      BOOLEAN DEFAULT FALSE,                      -- Seller block buyer
    
    created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id)  REFERENCES products(id) ON DELETE SET NULL,
    FOREIGN KEY (buyer_id)    REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id)   REFERENCES accounts(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_conversation (product_id, buyer_id, seller_id),     -- Mỗi buyer-seller chỉ có 1 cuộc chat/sản phẩm
    INDEX idx_buyer           (buyer_id),
    INDEX idx_seller          (seller_id),
    INDEX idx_product         (product_id),
    INDEX idx_last_message    (last_message_at),
    INDEX idx_status          (status)
);

-- ======================
-- 18. BẢNG TIN NHẮN
-- ======================
CREATE TABLE messages (
    id                        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    conversation_id           BIGINT UNSIGNED NOT NULL,                   -- Cuộc trò chuyện
    sender_id                 BIGINT UNSIGNED NOT NULL,                   -- Người gửi
    
    content                   TEXT,                                       -- Nội dung tin nhắn
    message_type              ENUM('TEXT','IMAGE','FILE','SYSTEM') DEFAULT 'TEXT', -- Loại tin nhắn
    file_url                  VARCHAR(500),                               -- Link file/ảnh (nếu có)
    file_name                 VARCHAR(255),                               -- Tên file gốc
    file_size                 BIGINT UNSIGNED,                            -- Kích thước file (bytes)
    
    is_read                   BOOLEAN DEFAULT FALSE,                      -- Đã đọc chưa
    read_at                   TIMESTAMP NULL,                             -- Thời gian đọc
    
    created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id)   REFERENCES accounts(id) ON DELETE CASCADE,
    
    INDEX idx_conversation    (conversation_id),
    INDEX idx_sender          (sender_id),
    INDEX idx_created         (created_at),
    INDEX idx_unread          (conversation_id, is_read)
);

-- ======================
-- 19. BẢNG THÔNG BÁO
-- ======================
CREATE TABLE notifications (
    id                        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id                   BIGINT UNSIGNED NOT NULL,                   -- Người nhận thông báo
    
    type                      ENUM('NEW_MESSAGE','NEW_COMMENT','ORDER_UPDATE','PAYMENT_SUCCESS','SYSTEM','PRODUCT_STATUS') NOT NULL,
    title                     VARCHAR(255) NOT NULL,                      -- Tiêu đề thông báo
    content                   TEXT,                                       -- Nội dung
    
    related_id                BIGINT UNSIGNED NULL,                       -- ID liên quan (message_id, product_id, order_id...)
    related_type              ENUM('MESSAGE','PRODUCT','ORDER','COMMENT') NULL, -- Loại liên quan
    
    is_read                   BOOLEAN DEFAULT FALSE,                      -- Đã đọc chưa
    read_at                   TIMESTAMP NULL,
    
    created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id)     REFERENCES accounts(id) ON DELETE CASCADE,
    
    INDEX idx_user            (user_id),
    INDEX idx_unread          (user_id, is_read),
    INDEX idx_type            (type),
    INDEX idx_created         (created_at)
);


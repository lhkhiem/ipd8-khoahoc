# CHI TIẾT BẢNG XÓA BỎ - IPD8 DATABASE DESIGN

**Mục đích:** Chi tiết các bảng e-commerce sẽ được xóa bỏ vì không dùng cho IPD8 Learning Platform

---

## 📋 MỤC LỤC

1. [Tổng Quan](#1-tổng-quan)
2. [Danh Sách Bảng Xóa Bỏ](#2-danh-sách-bảng-xóa-bỏ)
3. [Thứ Tự Xóa](#3-thứ-tự-xóa)
4. [Script Xóa](#4-script-xóa)

---

## 1. TỔNG QUAN

### 1.1. Lý Do Xóa Bỏ

Các bảng e-commerce này được thiết kế cho hệ thống bán hàng sản phẩm vật lý, không phù hợp với IPD8 Learning Platform (hệ thống học trực tuyến). IPD8 sử dụng:
- `courses` thay vì `products`
- `enrollments` thay vì `cart_items`
- `orders` (IPD8) thay vì `orders` (e-commerce)
- `materials` thay vì `inventory`

### 1.2. Thống Kê

- **Tổng số bảng xóa:** 20 bảng
- **Nhóm sản phẩm:** 10 bảng
- **Nhóm giỏ hàng & đơn hàng:** 4 bảng
- **Nhóm kho & địa chỉ:** 3 bảng
- **Nhóm đánh giá:** 2 bảng
- **Nhóm khác:** 1 bảng

---

## 2. DANH SÁCH BẢNG XÓA BỎ

### 2.1. Nhóm Sản Phẩm (10 bảng)

#### 2.1.1. Bảng: `products`

**Mục đích:** Sản phẩm e-commerce

| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
|---------|--------------|-------|
| `id` | UUID | ID duy nhất |
| `name` | VARCHAR(255) | Tên sản phẩm |
| `slug` | VARCHAR(255) | URL slug |
| `description` | TEXT | Mô tả |
| `category_id` | UUID | ID danh mục |
| `brand_id` | UUID | ID thương hiệu |
| `sku` | VARCHAR(100) | Mã SKU |
| `price` | DECIMAL(10,2) | Giá |
| `stock` | INTEGER | Tồn kho |
| `status` | VARCHAR(50) | Trạng thái |
| ... | ... | ... |

**Lý do xóa:** IPD8 dùng `courses` thay vì `products`

---

#### 2.1.2. Bảng: `product_categories`

**Mục đích:** Danh mục sản phẩm

| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
|---------|--------------|-------|
| `id` | UUID | ID duy nhất |
| `name` | VARCHAR(255) | Tên danh mục |
| `slug` | VARCHAR(255) | URL slug |
| `parent_id` | UUID | ID danh mục cha |
| `description` | TEXT | Mô tả |
| ... | ... | ... |

**Lý do xóa:** Không dùng cho IPD8

---

#### 2.1.3. Bảng: `brands`

**Mục đích:** Thương hiệu

| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
|---------|--------------|-------|
| `id` | UUID | ID duy nhất |
| `name` | VARCHAR(255) | Tên thương hiệu |
| `slug` | VARCHAR(255) | URL slug |
| `logo_id` | UUID | ID logo |
| ... | ... | ... |

**Lý do xóa:** Không dùng cho IPD8

---

#### 2.1.4. Bảng: `product_images`

**Mục đích:** Ảnh sản phẩm

| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
|---------|--------------|-------|
| `id` | UUID | ID duy nhất |
| `product_id` | UUID | ID sản phẩm |
| `asset_id` | UUID | ID asset |
| `sort_order` | INTEGER | Thứ tự |
| ... | ... | ... |

**Lý do xóa:** IPD8 dùng `assets` chung, không cần bảng riêng cho product images

---

#### 2.1.5. Bảng: `product_attributes`

**Mục đích:** Thuộc tính sản phẩm

| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
|---------|--------------|-------|
| `id` | UUID | ID duy nhất |
| `product_id` | UUID | ID sản phẩm |
| `name` | VARCHAR(255) | Tên thuộc tính |
| `value` | TEXT | Giá trị |
| ... | ... | ... |

**Lý do xóa:** Không dùng cho IPD8

---

#### 2.1.6. Bảng: `product_variants`

**Mục đích:** Biến thể sản phẩm (Size, Color, v.v.)

| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
|---------|--------------|-------|
| `id` | UUID | ID duy nhất |
| `product_id` | UUID | ID sản phẩm |
| `sku` | VARCHAR(100) | Mã SKU |
| `price` | DECIMAL(12,2) | Giá |
| `stock` | INTEGER | Tồn kho |
| ... | ... | ... |

**Lý do xóa:** Không dùng cho IPD8 (courses không có variants)

---

#### 2.1.7. Bảng: `product_options`

**Mục đích:** Tùy chọn sản phẩm (RAM, Storage, Color)

| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
|---------|--------------|-------|
| `id` | UUID | ID duy nhất |
| `product_id` | UUID | ID sản phẩm |
| `name` | VARCHAR(100) | Tên tùy chọn |
| `position` | INTEGER | Vị trí |
| ... | ... | ... |

**Lý do xóa:** Không dùng cho IPD8

---

#### 2.1.8. Bảng: `product_option_values`

**Mục đích:** Giá trị tùy chọn (8GB, 16GB, Blue, Red)

| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
|---------|--------------|-------|
| `id` | UUID | ID duy nhất |
| `option_id` | UUID | ID tùy chọn |
| `value` | VARCHAR(255) | Giá trị |
| `code` | VARCHAR(100) | Mã |
| ... | ... | ... |

**Lý do xóa:** Không dùng cho IPD8

---

#### 2.1.9. Bảng: `product_variant_option_values`

**Mục đích:** Mapping giữa variant và option values

| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
|---------|--------------|-------|
| `variant_id` | UUID | ID variant |
| `option_id` | UUID | ID option |
| `option_value_id` | UUID | ID option value |
| ... | ... | ... |

**Lý do xóa:** Không dùng cho IPD8

---

#### 2.1.10. Bảng: `product_variant_attributes`

**Mục đích:** Thuộc tính của variant

| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
|---------|--------------|-------|
| `id` | UUID | ID duy nhất |
| `variant_id` | UUID | ID variant |
| `name` | VARCHAR(255) | Tên thuộc tính |
| `value` | TEXT | Giá trị |
| ... | ... | ... |

**Lý do xóa:** Không dùng cho IPD8

---

### 2.2. Nhóm Giỏ Hàng & Đơn Hàng (4 bảng)

#### 2.2.1. Bảng: `cart_items`

**Mục đích:** Giỏ hàng

| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
|---------|--------------|-------|
| `id` | UUID | ID duy nhất |
| `user_id` | UUID | ID người dùng |
| `session_id` | VARCHAR(255) | ID session (guest) |
| `product_id` | UUID | ID sản phẩm |
| `quantity` | INTEGER | Số lượng |
| `snapshot_price` | DECIMAL(10,2) | Giá snapshot |
| ... | ... | ... |

**Lý do xóa:** IPD8 không dùng giỏ hàng, dùng `enrollments` trực tiếp

---

#### 2.2.2. Bảng: `wishlist_items`

**Mục đích:** Danh sách yêu thích

| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
|---------|--------------|-------|
| `id` | UUID | ID duy nhất |
| `user_id` | UUID | ID người dùng |
| `product_id` | UUID | ID sản phẩm |
| ... | ... | ... |

**Lý do xóa:** Không dùng cho IPD8

---

#### 2.2.3. Bảng: `orders` (E-commerce)

**Mục đích:** Đơn hàng e-commerce

| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
|---------|--------------|-------|
| `id` | UUID | ID duy nhất |
| `order_number` | VARCHAR(50) | Mã đơn hàng |
| `customer_id` | UUID | ID khách hàng |
| `shipping_address` | JSONB | Địa chỉ giao hàng |
| `billing_address` | JSONB | Địa chỉ thanh toán |
| `subtotal` | DECIMAL(10,2) | Tổng tiền |
| `tax_amount` | DECIMAL(10,2) | Thuế |
| `shipping_cost` | DECIMAL(10,2) | Phí vận chuyển |
| `status` | VARCHAR(50) | Trạng thái: 'pending', 'processing', 'shipped' |
| ... | ... | ... |

**Lý do xóa:** IPD8 có bảng `orders` riêng với cấu trúc khác (không có shipping, tax, chỉ có amount, gateway)

**Lưu ý:** Cần kiểm tra kỹ trước khi xóa để không xóa nhầm bảng `orders` của IPD8.

---

#### 2.2.4. Bảng: `order_items` (E-commerce)

**Mục đích:** Chi tiết đơn hàng e-commerce

| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
|---------|--------------|-------|
| `id` | UUID | ID duy nhất |
| `order_id` | UUID | ID đơn hàng |
| `product_id` | UUID | ID sản phẩm |
| `product_name` | VARCHAR(255) | Tên sản phẩm (snapshot) |
| `quantity` | INTEGER | Số lượng |
| `unit_price` | DECIMAL(10,2) | Giá đơn vị |
| `variant_name` | VARCHAR(255) | Tên variant |
| ... | ... | ... |

**Lý do xóa:** IPD8 có bảng `order_items` riêng với cấu trúc khác (link với `courses` thay vì `products`)

---

### 2.3. Nhóm Kho & Địa Chỉ (3 bảng)

#### 2.3.1. Bảng: `stock_movements`

**Mục đích:** Lịch sử thay đổi stock

| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
|---------|--------------|-------|
| `id` | UUID | ID duy nhất |
| `product_id` | UUID | ID sản phẩm |
| `variant_id` | UUID | ID variant |
| `movement_type` | VARCHAR(50) | Loại: 'sale', 'purchase', 'adjustment' |
| `quantity` | INTEGER | Số lượng |
| `previous_stock` | INTEGER | Stock trước |
| `new_stock` | INTEGER | Stock sau |
| ... | ... | ... |

**Lý do xóa:** IPD8 không quản lý kho (courses không có stock)

---

#### 2.3.2. Bảng: `stock_settings`

**Mục đích:** Cài đặt stock (ngưỡng cảnh báo, điểm đặt hàng)

| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
|---------|--------------|-------|
| `id` | UUID | ID duy nhất |
| `product_id` | UUID | ID sản phẩm |
| `variant_id` | UUID | ID variant |
| `low_stock_threshold` | INTEGER | Ngưỡng cảnh báo |
| `reorder_point` | INTEGER | Điểm đặt hàng |
| ... | ... | ... |

**Lý do xóa:** IPD8 không quản lý kho

---

#### 2.3.3. Bảng: `addresses`

**Mục đích:** Địa chỉ khách hàng (shipping, billing)

| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
|---------|--------------|-------|
| `id` | UUID | ID duy nhất |
| `user_id` | UUID | ID người dùng |
| `first_name` | VARCHAR(100) | Tên |
| `last_name` | VARCHAR(100) | Họ |
| `address_line1` | VARCHAR(255) | Địa chỉ dòng 1 |
| `city` | VARCHAR(100) | Thành phố |
| `state` | VARCHAR(100) | Tỉnh/Thành |
| `postal_code` | VARCHAR(20) | Mã bưu điện |
| `country` | VARCHAR(100) | Quốc gia |
| `type` | VARCHAR(20) | Loại: 'shipping', 'billing', 'both' |
| ... | ... | ... |

**Lý do xóa:** IPD8 không cần địa chỉ giao hàng (học trực tuyến)

---

### 2.4. Nhóm Đánh Giá (2 bảng)

#### 2.4.1. Bảng: `product_reviews`

**Mục đích:** Đánh giá sản phẩm

| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
|---------|--------------|-------|
| `id` | UUID | ID duy nhất |
| `product_id` | UUID | ID sản phẩm |
| `user_id` | UUID | ID người dùng |
| `rating` | INTEGER | Đánh giá (1-5) |
| `title` | VARCHAR(255) | Tiêu đề |
| `review_text` | TEXT | Nội dung đánh giá |
| `is_verified_purchase` | BOOLEAN | Đã mua hàng |
| `status` | VARCHAR(50) | Trạng thái: 'pending', 'approved' |
| ... | ... | ... |

**Lý do xóa:** IPD8 không có đánh giá sản phẩm (có thể thêm đánh giá courses sau)

---

#### 2.4.2. Bảng: `review_reactions`

**Mục đích:** Phản ứng đánh giá (helpful/not helpful)

| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
|---------|--------------|-------|
| `id` | UUID | ID duy nhất |
| `review_id` | UUID | ID đánh giá |
| `user_id` | UUID | ID người dùng |
| `is_helpful` | BOOLEAN | Hữu ích hay không |
| ... | ... | ... |

**Lý do xóa:** Không dùng cho IPD8

---

### 2.5. Nhóm Khác (1 bảng)

#### 2.5.1. Bảng: `product_groups` (nếu có)

**Mục đích:** Nhóm sản phẩm (có thể đã bị xóa trong migration trước)

| Tên Cột | Kiểu Dữ Liệu | Mô Tả |
|---------|--------------|-------|
| `id` | UUID | ID duy nhất |
| `name` | VARCHAR(255) | Tên nhóm |
| ... | ... | ... |

**Lý do xóa:** Không dùng cho IPD8

---

## 3. THỨ TỰ XÓA

### 3.1. Nguyên Tắc

1. **Xóa bảng con trước** - Bảng có foreign key phụ thuộc bảng khác
2. **Xóa bảng cha sau** - Bảng được tham chiếu bởi bảng khác
3. **Dùng CASCADE** - Tự động xóa foreign key constraints

### 3.2. Thứ Tự Chi Tiết

```
Level 1 (Bảng con sâu nhất):
  → review_reactions (phụ thuộc: product_reviews)
  → product_variant_option_values (phụ thuộc: product_variants, product_options, product_option_values)
  → product_variant_attributes (phụ thuộc: product_variants)

Level 2:
  → product_reviews (phụ thuộc: products)
  → product_option_values (phụ thuộc: product_options)
  → stock_movements (phụ thuộc: products, product_variants)
  → stock_settings (phụ thuộc: products, product_variants)
  → product_images (phụ thuộc: products, assets)
  → product_attributes (phụ thuộc: products)
  → cart_items (phụ thuộc: products)
  → wishlist_items (phụ thuộc: products)
  → order_items (e-commerce) (phụ thuộc: orders e-commerce, products)

Level 3:
  → product_options (phụ thuộc: products)
  → product_variants (phụ thuộc: products)
  → orders (e-commerce) (phụ thuộc: users)
  → addresses (phụ thuộc: users)

Level 4 (Bảng cha):
  → products (phụ thuộc: product_categories, brands, assets)
  → product_categories (có self-reference)
  → brands (phụ thuộc: assets)
```

---

## 4. SCRIPT XÓA

Xem script chi tiết tại: [DATABASE_DESIGN_IPD8_MIGRATION.md](./DATABASE_DESIGN_IPD8_MIGRATION.md#32-script-xóa-bảng-e-commerce)

---

## TÓM TẮT

### Tổng Kết

- **Tổng số bảng xóa:** 20 bảng
- **Nhóm sản phẩm:** 10 bảng
- **Nhóm giỏ hàng & đơn hàng:** 4 bảng
- **Nhóm kho & địa chỉ:** 3 bảng
- **Nhóm đánh giá:** 2 bảng
- **Nhóm khác:** 1 bảng

### Lưu Ý Quan Trọng

1. ⚠️ **Backup trước khi xóa** - Đảm bảo đã backup database
2. ⚠️ **Kiểm tra bảng `orders`** - IPD8 có bảng `orders` riêng, cần kiểm tra kỹ
3. ⚠️ **Test trên staging** - Test script xóa trên staging trước
4. ⚠️ **Verify sau khi xóa** - Kiểm tra các bảng đã xóa thành công

**Xem thêm:**
- [Tổng quan](./DATABASE_DESIGN_IPD8_OVERVIEW.md)
- [Migration plan](./DATABASE_DESIGN_IPD8_MIGRATION.md)




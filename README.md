# 📚 Hệ Thống Quản Lý Nhà Sách

> Hệ thống quản lý nhà sách hiện đại với giao diện thân thiện và tính năng quản lý toàn diện

## 🌟 Tổng quan dự án

Đây là một ứng dụng web fullstack được xây dựng để quản lý hoạt động kinh doanh của nhà sách, từ quản lý kho hàng đến xử lý đơn hàng và chăm sóc khách hàng. Hệ thống được thiết kế với kiến trúc monorepo, chia thành 2 phần chính: Trang chính (công khai) và CMS (quản lý nội bộ).

## 🏗️ Cấu trúc dự án

```
📁 project3/
├── 🎨 client/                    # Frontend Nuxt.js Monorepo
│   ├── packages/
│   │   ├── base/                 # Các thành phần và tiện ích dùng chung
│   │   │   ├── components/       # Thành phần UI dùng chung
│   │   │   ├── composables/      # Vue composables
│   │   │   ├── services/         # Dịch vụ API
│   │   │   ├── stores/           # Pinia stores
│   │   │   ├── models/           # Giao diện TypeScript
│   │   │   └── utils/            # Hàm tiện ích
│   │   ├── main/                 # Trang Web Chính (Công khai)
│   │   │   ├── pages/            # Trang công khai
│   │   │   ├── layouts/          # Layout cho trang chính
│   │   │   └── middleware/       # Route middleware
│   │   └── cms/                  # Hệ Thống Quản Lý Nội Dung
│   │       ├── pages/            # Trang quản lý nội bộ
│   │       ├── layouts/          # Layout cho CMS
│   │       └── middleware/       # Auth middleware
│   └── public/                   # Tài nguyên tĩnh
├── ⚙️ server/                    # Backend Express.js
│   ├── controllers/              # Controllers logic nghiệp vụ
│   │   ├── authController.js     # Xác thực & phân quyền
│   │   ├── bookController.js     # Quản lý sách
│   │   ├── cartController.js     # Giỏ hàng
│   │   ├── orderController.js    # Đơn hàng
│   │   ├── voucherController.js  # Voucher giảm giá
│   │   ├── userManagementController.js  # Quản lý nhân viên
│   │   └── stockTransactionController.js # Nhập xuất kho
│   ├── models/                   # MongoDB Schemas
│   │   ├── userModel.js          # Người dùng & phân quyền
│   │   ├── bookModel.js          # Sách
│   │   ├── orderModel.js         # Đơn hàng
│   │   ├── cartModel.js          # Giỏ hàng
│   │   ├── voucherModel.js       # Voucher
│   │   └── stockTransactionModel.js # Lịch sử kho
│   ├── routes/                   # API Routes
│   ├── middleware/               # Express middleware
│   │   └── auth.js               # Xác thực JWT
│   ├── middlewares/              # Middleware tùy chỉnh
│   │   └── roleMiddleware.js     # Kiểm soát truy cập theo vai trò
│   └── scripts/                  # Scripts tiện ích
│       └── createAdmin.js        # Tạo tài khoản admin
└── 🚀 .github/                   # CI/CD workflows
    └── workflows/                # GitHub Actions
```

## 🎯 Tính năng theo vai trò

### 🛒 **Khách hàng (Trang Chính)**

- **Duyệt sản phẩm**: Xem danh mục sách theo thể loại, tác giả, nhà xuất bản
- **Tìm kiếm**: Tìm kiếm sách theo từ khóa, bộ lọc nâng cao
- **Giỏ hàng**: Thêm/xóa sách, cập nhật số lượng
- **Đặt hàng**: Tạo đơn hàng, chọn phương thức thanh toán
- **Voucher**: Áp dụng mã giảm giá
- **Lịch sử**: Theo dõi đơn hàng đã đặt

### 👨‍💼 **Nhân viên (CMS - Vai trò: `staff`)**

- **Quản lý sách**:
  - ✅ Xem danh sách sách
  - ✅ Thêm sách mới
  - ✅ Cập nhật thông tin sách
  - ✅ Cập nhật giá và tồn kho
- **Xử lý đơn hàng**:
  - ✅ Xem danh sách đơn hàng
  - ✅ Cập nhật trạng thái đơn hàng
  - ✅ In hóa đơn
- **Quản lý voucher**:
  - ✅ Tạo/sửa voucher
  - ✅ Kích hoạt/vô hiệu hóa voucher
- **Báo cáo cơ bản**:
  - ✅ Thống kê doanh thu theo ngày
  - ✅ Top sách bán chạy
- **Hạn chế**:
  - ❌ Không thể xóa sách
  - ❌ Không xem lịch sử nhập xuất kho
  - ❌ Không quản lý nhân viên
  - ❌ Không quản lý người dùng

### 🔧 **Quản lý - Admin (CMS - Vai trò: `admin`)**

- **Toàn quyền hệ thống**:
  - ✅ Tất cả quyền của nhân viên
  - ✅ Xóa sách khỏi hệ thống
- **Quản lý nhân viên**:
  - ✅ Tạo tài khoản nhân viên mới
  - ✅ Cập nhật thông tin nhân viên
  - ✅ Kích hoạt/vô hiệu hóa tài khoản
  - ✅ Đặt lại mật khẩu
- **Quản lý người dùng**:
  - ✅ Xem danh sách khách hàng
  - ✅ Khóa/mở khóa tài khoản khách hàng
  - ✅ Xem lịch sử mua hàng của khách
- **Quản lý kho**:
  - ✅ Xem lịch sử nhập xuất kho
  - ✅ Tạo phiếu nhập kho
  - ✅ Theo dõi tồn kho real-time
- **Báo cáo nâng cao**:
  - ✅ Phân tích doanh thu chi tiết
  - ✅ Báo cáo tồn kho
  - ✅ Thống kê hiệu suất nhân viên
  - ✅ Export dữ liệu ra Excel/PDF

## 🔐 Hệ thống phân quyền

### **Cấu trúc Model Người dùng**

```javascript
{
  _id: ObjectId,
  email: String,
  password: String (bcrypt),
  role: String, // "admin" | "staff" | "customer"
  isActive: Boolean,
  profile: {
    fullName: String,
    phone: String,
    address: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### **Middleware phân quyền**

```javascript
// Kiểm tra authentication
middleware / auth.js;

// Kiểm tra authorization theo role
middlewares / roleMiddleware.js -
  authorize("admin") - // Chỉ admin
  authorize(["admin", "staff"]) - // Admin hoặc staff
  authorize("customer"); // Chỉ customer
```

### **Ví dụ Bảo vệ Route**

```javascript
// Chỉ admin mới được xóa sách
DELETE /api/books/:id → authorize('admin')

// Admin và staff đều có thể cập nhật sách
PUT /api/books/:id → authorize(['admin', 'staff'])

// Chỉ admin mới quản lý được nhân viên
POST /api/users/staff → authorize('admin')

// Admin xem được lịch sử kho
GET /api/stock-transactions → authorize('admin')
```

## 🧩 Kiến trúc Frontend

### **Trang Chính (packages/main/)**

- **Mục đích**: Website công khai cho khách hàng
- **Đặc điểm**:
  - SSR (Render phía máy chủ) để SEO tốt
  - Thiết kế responsive, mobile-first
  - Các trang công khai không cần xác thực
- **Routes chính**:
  - `/` - Trang chủ
  - `/books` - Danh mục sách
  - `/cart` - Giỏ hàng
  - `/checkout` - Thanh toán
  - `/login` - Đăng nhập
  - `/register` - Đăng ký

### **CMS (packages/cms/)**

- **Mục đích**: Hệ thống quản lý nội bộ
- **Đặc điểm**:
  - SPA (Ứng dụng một trang) để UX mượt mà
  - Bảo mật cao, yêu cầu xác thực
  - Hiển thị giao diện theo vai trò
- **Routes chính**:
  - `/dashboard` - Tổng quan
  - `/books` - Quản lý sách
  - `/orders` - Quản lý đơn hàng
  - `/vouchers` - Quản lý voucher
  - `/users` - Quản lý người dùng (chỉ admin)
  - `/stock` - Quản lý kho (chỉ admin)

### **Gói Base (packages/base/)**

- **Thành phần Dùng chung**: Header, Footer, Loading, Modal, v.v.
- **Dịch vụ API**: Tập trung các lời gọi API
- **Stores**: Quản lý trạng thái với Pinia
- **Utils**: Hàm tiện ích, formatters, validators

## 🛠️ Công nghệ sử dụng

### **Stack Frontend**

- **Nuxt.js 3** - Framework Vue.js với SSR/SPA
- **TypeScript** - Bảo đảm kiểu dữ liệu và trải nghiệm phát triển tốt hơn
- **TailwindCSS** - Framework CSS tiện ích
- **Pinia** - Quản lý trạng thái
- **VueUse** - Tiện ích Vue composition
- **Vee-Validate** - Xác thực form

### **Stack Backend**

- **Node.js + Express.js** - Runtime server và framework
- **MongoDB + Mongoose** - Cơ sở dữ liệu NoSQL và ODM
- **JWT** - Xác thực không trạng thái
- **Bcrypt** - Mã hóa mật khẩu
- **Joi** - Xác thực request
- **Multer** - Xử lý upload file
- **Cors** - Chia sẻ tài nguyên cross-origin

### **DevOps & Công cụ**

- **GitHub Actions** - Pipeline CI/CD
- **ESLint + Prettier** - Linting và formatting code
- **Husky** - Git hooks
- **Jest** - Framework unit testing
- **Docker** - Containerization (dự kiến)
- **AWS/Azure** - Triển khai cloud (dự kiến)

## 📊 Tổng quan Cấu trúc Database

### **Collections Chính**

- **users** - Hệ thống người dùng và phân quyền
- **books** - Danh mục sách với thông tin chi tiết
- **genres** - Thể loại sách
- **publishers** - Nhà xuất bản
- **orders** - Đơn hàng của khách hàng
- **orderItems** - Chi tiết items trong đơn hàng
- **carts** - Giỏ hàng của người dùng
- **vouchers** - Hệ thống voucher giảm giá
- **stockTransactions** - Lịch sử nhập xuất kho
- **inventoryHistory** - Lịch sử thay đổi tồn kho

### **Mối quan hệ**

```
Người dùng (1) → (n) Đơn hàng
Đơn hàng (1) → (n) Chi tiết đơn hàng
Sách (1) → (n) Chi tiết đơn hàng
Sách (n) → (1) Thể loại
Sách (n) → (1) Nhà xuất bản
Người dùng (1) → (1) Giỏ hàng
Giỏ hàng (1) → (n) Items giỏ hàng
```

## 🔄 Kiến trúc API

### **Thiết kế RESTful**

- Tuân thủ nguyên tắc REST
- Định dạng phản hồi nhất quán
- Mã trạng thái HTTP phù hợp
- URLs dựa trên tài nguyên

### **Luồng Xác thực**

1. Người dùng đăng nhập → Tạo JWT token
2. Token được lưu trong httpOnly cookie
3. Các route được bảo vệ xác minh token
4. Áp dụng kiểm soát truy cập theo vai trò

## 🎨 Nguyên tắc Thiết kế UI/UX

### **Hệ thống Thiết kế**

- **Bảng màu**: Màu sắc thương hiệu nhất quán
- **Typography**: Phân cấp rõ ràng với font chữ tùy chỉnh
- **Spacing**: Thang khoảng cách được chuẩn hóa
- **Components**: Thư viện thành phần có thể tái sử dụng

### **Thiết kế Responsive**

- **Tiếp cận mobile-first**
- **Breakpoints**: sm, md, lg, xl
- **Thân thiện với cảm ứng**: Mục tiêu cảm ứng phù hợp
- **Hiệu suất**: Tối ưu cho mạng di động

### **Khả năng Tiếp cận**

- **HTML ngữ nghĩa**: Cấu trúc heading phù hợp
- **Nhãn ARIA**: Hỗ trợ trình đọc màn hình
- **Điều hướng bàn phím**: Truy cập đầy đủ bằng bàn phím
- **Độ tương phản màu**: Tuân thủ WCAG

## 📈 Tính năng nâng cao

### **Tìm kiếm & Lọc**

- Tìm kiếm toàn văn trong tên sách, tác giả
- Lọc theo thể loại, giá, nhà xuất bản
- Sắp xếp theo giá, ngày phát hành, độ phổ biến

### **Quản lý Tồn kho**

- Theo dõi tồn kho thời gian thực
- Cảnh báo hàng tồn kho thấp
- Điểm đặt hàng lại tự động
- Thao tác hàng loạt

### **Phân tích & Báo cáo**

- Chỉ số hiệu suất bán hàng
- Phân tích hành vi khách hàng
- Tỷ lệ luân chuyển hàng tồn kho
- Dự báo doanh thu

### **Tính năng Bảo mật**

- Làm sạch dữ liệu đầu vào
- Ngăn chặn SQL injection
- Bảo vệ XSS
- Giới hạn tốc độ
- Bảo vệ CSRF

---

> 💡 **Lưu ý**: Đây là dự án giáo dục/portfolio demonstrating thực hành phát triển web hiện đại với Nuxt.js và Express.js.

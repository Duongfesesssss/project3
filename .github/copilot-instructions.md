<!-- Chỉ dẫn cho GitHub Copilot - LUÔN phản hồi bằng Tiếng Việt -->

<!-- Nội dung được tổng hợp từ các file riêng -->

<!-- START AUTO-GENERATED CONTENT -->

# 🧠 Mô tả dự án

Dự án là một ứng dụng web fullstack gồm:

- **Frontend**: Sử dụng Nuxt.js (Vue.js framework)
- **Backend**: Express.js chạy trên Node.js
- **Cơ sở dữ liệu**: MongoDB
- **DevOps**: Đang sử dụng GitHub Actions cho CI/CD. Dự kiến triển khai trên **AWS** hoặc **Azure**.

# ✅ Quy tắc chung

- **Ngôn ngữ giao tiếp**: Luôn phản hồi bằng tiếng Việt
- **Code style**: Tuân thủ ESLint + Prettier
- **Naming convention**: camelCase cho JavaScript/TypeScript, kebab-case cho CSS classes
- **Documentation**: Comment code phức tạp bằng tiếng Việt
- **Error handling**: Luôn có try-catch và thông báo lỗi rõ ràng
- **Security**: Validate tất cả input từ client, sử dụng environment variables cho sensitive data

🧩 Frontend – Nuxt.js (Nuxt 3)
✅ Quy chuẩn phát triển
Sử dụng cấu trúc thư mục chuẩn của Nuxt 3.

Luôn dùng <script setup> để viết component.

Ưu tiên sử dụng các API:

defineProps, defineEmits

useAsyncData, useFetch

Sử dụng TailwindCSS để style toàn bộ giao diện.

Logic phức tạp nên được tách ra composables/ hoặc utils/.

🧱 Cấu trúc giao diện
🔹 1. Main site
Dành cho tất cả người dùng (kể cả chưa đăng nhập) và nhân viên, quản lý.

Bao gồm các trang công khai: trang chủ, thông tin dịch vụ, đăng nhập,...

🔸 2. CMS (Trang quản lý)
Chỉ dành cho người dùng đã đăng nhập (nhân viên hoặc quản lý).

Gồm các chức năng nội bộ như: quản lý nội dung, xử lý đơn hàng, quản lý voucher...

➤ Phân quyền trong CMS:
Chức năng Nhân viên Quản lý (admin)
Quản lý nội dung (sản phẩm, đơn hàng, v.v.) ✅ ✅
Xem lịch sử nhập xuất kho ❌ ✅
Quản lý nhân viên (tạo/sửa/xoá) ❌ ✅
Quản lý người dùng (khoá/mở khoá tài khoản) ❌ ✅

👥 Hệ thống người dùng
Có duy nhất 1 tài khoản quản lý (admin), được tạo sẵn từ đầu.

Quản lý có quyền:

Tạo tài khoản cho nhân viên.

Cấp quyền, khoá/mở tài khoản.

Nhân viên:

Không thể đăng ký.

Được quản lý tạo tài khoản.

Có thể truy cập CMS (trừ phần "quản trị hệ thống").

🔧 Backend – Express.js
✅ Cấu trúc phát triển
API tuân thủ chuẩn RESTful.

Tổ chức code theo mô hình Controller – Service – Model.

Validate mọi input bằng Joi (hoặc thư viện tương đương).

Dùng middleware errorHandler để xử lý lỗi thống nhất.

🔐 Phân quyền & bảo mật
Hệ thống phân quyền:
Mỗi user có trường role trong database: "admin" hoặc "staff".

Dùng middleware auth để xác thực token người dùng.

Dùng middleware authorize(role) để kiểm tra quyền hạn:

ts
Sao chép
Chỉnh sửa
authorize('admin') // chỉ admin mới qua
authorize(['admin', 'staff']) // cả hai loại đều qua

# 🗄️ MongoDB

- Sử dụng Mongoose ODM cho Node.js
- Tạo schema với validation rõ ràng
- Sử dụng indexes cho các field thường query
- Populate relationships khi cần thiết
- Luôn handle connection errors và timeouts
- Sử dụng aggregation pipeline cho queries phức tạp

# 🚀 DevOps (GitHub Actions + AWS/Azure)

- Luôn tạo/ghi chú các file CI/CD trong `.github/workflows/`.
- Mỗi lần push hoặc pull request cần trigger workflow để:
  - Cài dependencies
  - Chạy unit test
  - Kiểm tra lint (ESLint + Prettier)
  - Build project
- Dự kiến triển khai cloud trên AWS hoặc Azure.

# 📐 Tuân thủ thiết kế

- **UI/UX**: Thiết kế responsive, mobile-first
- **Color scheme**: Sử dụng color palette nhất quán
- **Typography**: Font chữ dễ đọc, hierarchy rõ ràng
- **Components**: Tái sử dụng components, đặt tên mô tả rõ chức năng
- **Accessibility**: Alt text cho images, proper semantic HTML
- **Performance**: Optimize images, lazy loading, code splitting

<!-- END AUTO-GENERATED CONTENT -->

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

# 🧩 Frontend (Nuxt.js)

- Tạo các component Vue theo cấu trúc Nuxt 3.
- Luôn sử dụng `<script setup>` khi có thể.
- Ưu tiên sử dụng `defineProps`, `defineEmits`, `useAsyncData`, `useFetch`.
- Style theo chuẩn TailwindCSS nếu có.
- Tách phần logic ra khỏi template nếu quá dài.

# 🔧 Backend (Express.js)

- Tạo các route theo chuẩn RESTful.
- Luôn validate dữ liệu đầu vào bằng Joi hoặc thư viện tương đương.
- Tuân thủ phân tầng Controller – Service – Model.
- Luôn xử lý lỗi rõ ràng bằng middleware (`errorHandler`).

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

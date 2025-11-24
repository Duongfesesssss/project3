# 📚 Bookie — Hệ Thống Quản Lý Nhà Sách

- 👉 **Link sản phẩm**: https://bookie.io.vn

Bookie là nền tảng giúp cửa hàng sách quản lý end-to-end:

- Website khách hàng để duyệt sách, giỏ hàng, thanh toán, theo dõi đơn hàng.
- CMS nội bộ cho nhân viên/admin quản lý sách, kho, voucher, khách hàng và báo cáo.
- Hệ thống tích điểm & hạng thành viên để chăm sóc khách hàng thân thiết.
- Ghi nhận nhập/xuất kho real-time, cảnh báo tồn, đồng bộ dữ liệu bán lẻ và online.

Mọi thành phần (Nuxt 3 frontend, Express/Mongo backend, mobile Capacitor, CI/CD GHCR) đã được triển khai và vận hành trên cùng domain production ở trên.

## 🧱 Cấu trúc dự án

```
project3
├─ client/                 # Nuxt 3 monorepo (packages base/main/cms)
│  ├─ packages/base        # Component/UI, composables, services, stores
│  ├─ packages/main        # Website công khai cho khách hàng
│  ├─ packages/cms         # Bảng điều khiển nội bộ
│  ├─ public/              # Tài nguyên tĩnh
│  ├─ Dockerfile           # Build frontend image (distroless runtime)
│  └─ capacitor.config.ts  # Cấu hình ứng dụng Android
├─ server/                 # Express API, Mongo models, middlewares
│  ├─ controllers/         # auth, book, order, voucher, stock...
│  ├─ models/              # User, Book, Order, Membership, Inventory
│  ├─ routes/              # Định nghĩa REST endpoints
│  └─ scripts/createAdmin.js
├─ docs/                   # Schema DB, hướng dẫn deploy, mobile
├─ docker-compose*.yml     # Cấu hình chạy dev/prod (GHCR images)
└─ .github/workflows/      # CI/CD build-and-push lên GHCR
```

Kiến trúc phân lớp rõ ràng: frontend Nuxt (main + CMS) tiêu thụ API `/api/**` từ Express, các services dùng chung được gom tại `packages/base`. Backend tổ chức theo mô hình Controller-Service-Model. Toàn bộ build Docker được tự động hóa, deploy thông qua compose prod và reverse proxy trên domain `bookie.io.vn`.

## 🧠 Công nghệ sử dụng

- **Frontend**: Nuxt 3, Vue 3 Composition API, TypeScript, TailwindCSS, Pinia, PrimeVue, VueUse, Vee-Validate.
- **Backend**: Node.js 18, Express.js, MongoDB + Mongoose, Joi validation, JWT, Multer, PayOS SDK, AWS/Google TTS services.
- **Mobile**: Capacitor + Android Studio để đóng gói app native dùng chung API.
- **DevOps**: GitHub Actions (build & push), GitHub Container Registry (GHCR), Docker multi-stage, distroless runtime, ESLint + Prettier + Husky.
- **Bảo mật**: httpOnly JWT cookie, role-based middleware, input validation, sanitize upload, secrets quản lý qua environment/CI secrets.

Các phần tài liệu chi tiết hơn (schema DB, hướng dẫn deploy, guide mobile) vẫn được giữ trong thư mục `docs/` cho đội triển khai nội bộ.

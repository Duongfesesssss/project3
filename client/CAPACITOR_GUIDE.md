# 📱 Hướng Dẫn Build Ứng Dụng Android với Capacitor

## 📋 Yêu Cầu Hệ Thống

Trước khi bắt đầu, hãy đảm bảo bạn đã cài đặt:

1. **Node.js** (phiên bản 18, 20, hoặc 22+)
2. **Yarn** package manager
3. **Android Studio** (phiên bản mới nhất)
4. **JDK** (Java Development Kit) phiên bản 17 trở lên
5. **Android SDK** (cài qua Android Studio)

## 🚀 Các Bước Thực Hiện

### Bước 1: Cài Đặt Dependencies

```bash
cd e:\project3\client
yarn install
```

### Bước 2: Build Dự Án Nuxt.js

```bash
yarn generate
```

Lệnh này sẽ:

- Build toàn bộ dự án Nuxt.js
- Tạo thư mục `.output/public` với các file tĩnh
- Có thể bỏ qua các warning về 404 pages (đã cấu hình `failOnError: false`)

### Bước 3: Đồng Bộ với Android

```bash
npx cap sync android
```

Lệnh này sẽ:

- Copy các file web assets vào Android project
- Cập nhật plugins Capacitor
- Chuẩn bị project Android

### Bước 4: Mở Android Studio

```bash
yarn android:open
# Hoặc
npx cap open android
```

Lệnh này sẽ mở Android Studio với project đã được tạo.

## 🔧 Cấu Hình Quan Trọng

### 1. Cấu Hình Capacitor (`capacitor.config.ts`)

```typescript
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.example.app", // Thay đổi thành package ID của bạn
  appName: "nuxt-app", // Tên ứng dụng
  webDir: ".output/public", // Thư mục chứa build output
  server: {
    androidScheme: "https", // Sử dụng HTTPS scheme
  },
};

export default config;
```

**Lưu ý quan trọng:**

- Thay đổi `appId` thành package ID duy nhất của bạn (ví dụ: `com.yourcompany.yourapp`)
- `appName` là tên hiển thị trên điện thoại

### 2. Cấu Hình Nuxt.js (`packages/base/nuxt.config.ts`)

```typescript
export default defineNuxtConfig({
  // ... các config khác

  nitro: {
    prerender: {
      failOnError: false, // Bỏ qua lỗi 404 khi prerender
      crawlLinks: true,
      ignore: ["/api"],
    },
  },
});
```

## 📦 Scripts Có Sẵn

Trong `package.json` đã có các script tiện lợi:

```json
{
  "scripts": {
    "build:mobile": "nuxt generate && npx cap sync android",
    "android:dev": "npx cap run android",
    "android:open": "npx cap open android"
  }
}
```

### Sử Dụng:

```bash
# Build và sync một lần
yarn build:mobile

# Chạy trực tiếp trên device/emulator
yarn android:dev

# Mở Android Studio
yarn android:open
```

## 🔨 Build APK/AAB trong Android Studio

### Cách 1: Build Debug APK (để test)

1. Mở Android Studio (dùng `yarn android:open`)
2. Chọn **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
3. Đợi build xong, file APK sẽ ở: `android/app/build/outputs/apk/debug/app-debug.apk`

### Cách 2: Build Release APK/AAB (để publish)

#### Bước 1: Tạo Keystore (chỉ làm 1 lần)

```bash
cd e:\project3\client\android
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

Nhập thông tin khi được yêu cầu và **ghi nhớ password**!

#### Bước 2: Cấu Hình Signing

Tạo file `android/key.properties`:

```properties
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=my-key-alias
storeFile=my-release-key.keystore
```

**⚠️ LƯU Ý:** Thêm `key.properties` vào `.gitignore`!

Cập nhật `android/app/build.gradle`:

```gradle
// Thêm trước android {
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    // ... existing config

    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            // ... existing release config
        }
    }
}
```

#### Bước 3: Build Release

Trong Android Studio:

**Cho APK:**

- **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
- Chọn **Build Variant** = **release**
- File: `android/app/build/outputs/apk/release/app-release.apk`

**Cho AAB (Google Play):**

- **Build** → **Build Bundle(s) / APK(s)** → **Build Bundle(s)**
- File: `android/app/build/outputs/bundle/release/app-release.aab`

## 🔄 Workflow Phát Triển

### Mỗi khi thay đổi code web:

```bash
# 1. Build lại Nuxt.js
yarn generate

# 2. Sync với Android
npx cap sync android

# 3. (Tùy chọn) Chạy lại app trên device
yarn android:dev
```

### Hoặc dùng script tổng hợp:

```bash
yarn build:mobile
```

## 🐛 Xử Lý Lỗi Thường Gặp

### 1. Lỗi "webDir does not exist"

**Nguyên nhân:** Chưa build Nuxt.js  
**Giải pháp:** Chạy `yarn generate` trước

### 2. Lỗi "Android SDK not found"

**Nguyên nhân:** Chưa cài Android Studio hoặc SDK  
**Giải pháp:**

- Cài Android Studio
- Mở Android Studio → SDK Manager → cài Android SDK

### 3. Lỗi "JAVA_HOME not set"

**Nguyên nhân:** Chưa cài JDK hoặc chưa set biến môi trường  
**Giải pháp:**

- Cài JDK 17+
- Set JAVA_HOME trong Environment Variables

### 4. App crash khi mở

**Nguyên nhân:** API endpoints không đúng  
**Giải pháp:**

- Kiểm tra `runtimeConfig.public.baseURL` trong nuxt.config.ts
- Đảm bảo backend server accessible từ mobile device
- Có thể cần thay `localhost` bằng IP thực của máy

## 🌐 Kết Nối Backend API

Khi chạy trên thiết bị thật, app không thể kết nối tới `localhost:8888`. Bạn cần:

### Cách 1: Sử dụng IP của máy

Trong `nuxt.config.ts`:

```typescript
runtimeConfig: {
  public: {
    baseURL: process.env.NUXT_PUBLIC_API_BASE || 'http://192.168.1.100:8888', // IP máy bạn
  },
}
```

### Cách 2: Deploy backend lên server

Deploy backend lên cloud (AWS, Azure, Heroku, etc.) và update baseURL.

### Cách 3: Sử dụng ngrok (cho development)

```bash
# Ở máy chạy server
npx ngrok http 8888
# Lấy URL ngrok và update vào baseURL
```

## 📱 Test Trên Thiết Bị

### Emulator:

1. Mở Android Studio
2. **Tools** → **Device Manager**
3. Tạo virtual device
4. Chạy `yarn android:dev`

### Thiết Bị Thật:

1. Bật Developer Options trên điện thoại
2. Bật USB Debugging
3. Kết nối USB
4. Chạy `yarn android:dev`
5. Hoặc cài APK trực tiếp: `adb install app-debug.apk`

## 📚 Tài Liệu Tham Khảo

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Nuxt.js Documentation](https://nuxt.com/docs)
- [Android Developer Guide](https://developer.android.com/)

## 💡 Tips

1. **Live Reload:** Trong development, bạn có thể cấu hình Capacitor để load từ dev server:

   ```typescript
   // capacitor.config.ts (chỉ dùng khi dev)
   server: {
     url: 'http://192.168.1.100:3000',  // Nuxt dev server
     cleartext: true
   }
   ```

2. **Optimize Build Size:**

   - Sử dụng code splitting
   - Optimize images
   - Tree shaking

3. **Debugging:**
   - Chrome DevTools: `chrome://inspect`
   - Android Studio Logcat

## 🎯 Checklist Trước Khi Release

- [ ] Đổi `appId` và `appName` trong `capacitor.config.ts`
- [ ] Cập nhật `versionCode` và `versionName` trong `android/app/build.gradle`
- [ ] Tạo app icon (1024x1024px) và splash screen
- [ ] Configure proguard rules nếu cần
- [ ] Test kỹ trên nhiều thiết bị
- [ ] Build release AAB cho Google Play
- [ ] Tạo privacy policy và terms of service

---

**Chúc bạn build app thành công! 🎉**

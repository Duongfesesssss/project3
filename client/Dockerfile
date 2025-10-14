# Dockerfile cho Frontend
FROM node:20-alpine

# Tạo thư mục làm việc
WORKDIR /app

# Thiết lập biến môi trường để ổn định esbuild
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NUXT_TELEMETRY_DISABLED=1

# Copy package.json trước (để cache dependencies)
COPY package*.json ./

# Cài đặt dependencies
RUN yarn install --ignore-engines

# Copy toàn bộ source code
COPY . .

# Mở port 3000
EXPOSE 3000

# Chạy ứng dụng với host binding
CMD ["yarn", "dev", "--host", "0.0.0.0"]
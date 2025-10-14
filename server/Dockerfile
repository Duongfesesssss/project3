# Dockerfile cho Backend
FROM node:20-alpine

# Tạo thư mục làm việc
WORKDIR /app

# Copy package.json trước (để cache dependencies)
COPY package*.json ./

# Cài đặt dependencies
RUN yarn install --ignore-engines

# Thay bcrypt bằng bcryptjs để tránh lỗi native module
RUN yarn remove bcrypt && yarn add bcryptjs --ignore-engines

# Copy toàn bộ source code
COPY . .

# Mở port 8888
EXPOSE 8888

# Chạy ứng dụng
CMD ["yarn", "dev"]
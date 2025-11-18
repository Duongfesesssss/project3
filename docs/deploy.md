# Quy trình deploy với GitHub Actions + GHCR

Phương án A chia deployment thành hai phần: build image diễn ra trên GitHub Actions, EC2 chỉ việc kéo image và chạy docker compose.

## 1. Build images trên GitHub Actions
- `client/Dockerfile` và `server/Dockerfile` đã được viết ở dạng multi-stage production.
- Workflow `.github/workflows/build-and-push.yml` chạy khi push vào nhánh `master` (hoặc khi bấm _Run workflow_).
- Hai bước `docker/build-push-action` sẽ build rồi push image lên GHCR theo tag:
  - `ghcr.io/<owner>/bookstore-frontend:main`
  - `ghcr.io/<owner>/bookstore-backend:main`
- `GITHUB_TOKEN` có sẵn quyền `packages:write`, nên không cần PAT riêng cho CI.

## 2. Chuẩn bị môi trường trên EC2
1. Clone repo (hoặc chỉ copy `docker-compose.prod.yml` cùng thư mục `client/.env`, `server/.env`).
2. Nếu image private, tạo PAT đọc GHCR và đăng nhập một lần:
   ```bash
   export CR_PAT="<PAT>"
   echo "$CR_PAT" | docker login ghcr.io -u <GITHUB_USER> --password-stdin
   ```
   (Image public thì bỏ qua bước này.)
3. Đảm bảo các file `.env` chứa biến cho frontend/backend tồn tại: `client/.env`, `server/.env`.

## 3. Chạy docker compose ở chế độ production
Từ thư mục gốc của repo trên EC2:
```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --remove-orphans
docker compose -f docker-compose.prod.yml ps
```
- `pull` lấy image mới nhất từ GHCR.
- `up -d` khởi động database, backend, frontend (port chỉ bind vào `127.0.0.1`, nên traffic public vẫn đi qua reverse proxy/Nginx).
- Tra cứu log: `docker compose -f docker-compose.prod.yml logs -f backend` (hoặc frontend/database).

## 4. Cập nhật phiên bản
Mỗi lần merge code vào `master` -> workflow build xong -> trên EC2 chỉ cần:`pull` + `up -d`. Không còn phải build Nuxt trực tiếp trên server 1 GB RAM.

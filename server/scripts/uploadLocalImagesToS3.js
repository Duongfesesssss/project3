// Script upload toàn bộ ảnh local trong uploads/images lên S3
// Chạy: node server/scripts/uploadLocalImagesToS3.js
// Yêu cầu: .env có AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET, (tùy chọn) S3_PREFIX

// Luôn load .env của thư mục server dù chạy từ root
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs/promises');
const path = require('path');
const { uploadBuffer } = require('../services/s3Service');

const LOCAL_DIR = process.env.LOCAL_IMAGE_DIR || path.join(__dirname, '..', 'uploads', 'images');
const prefixEnv = process.env.S3_PREFIX || '';
const PREFIX = prefixEnv ? (prefixEnv.endsWith('/') ? prefixEnv : `${prefixEnv}/`) : '';

function guessMime(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  return 'application/octet-stream';
}

async function collectFiles(dir, root) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath, root)));
    } else if (entry.isFile()) {
      const relative = path.relative(root, fullPath).replace(/\\/g, '/');
      files.push({ fullPath, relative });
    }
  }
  return files;
}

async function main() {
  const exists = await fs
    .stat(LOCAL_DIR)
    .then((s) => s.isDirectory())
    .catch(() => false);
  if (!exists) {
    console.error(`Thư mục không tồn tại: ${LOCAL_DIR}`);
    process.exit(1);
  }

  const files = await collectFiles(LOCAL_DIR, LOCAL_DIR);
  if (!files.length) {
    console.log('Không có file nào để upload.');
    return;
  }

  console.log(`Tìm thấy ${files.length} file, bắt đầu upload...`);

  for (const file of files) {
    const buffer = await fs.readFile(file.fullPath);
    const mimeType = guessMime(file.fullPath);
    const key = `${PREFIX}${file.relative}`;
    try {
      await uploadBuffer({ buffer, mimeType, fileName: path.basename(file.fullPath), key });
      console.log(`Uploaded: ${key}`);
    } catch (err) {
      console.error(`Lỗi upload ${file.fullPath}: ${err.message}`);
    }
  }

  console.log('Hoàn tất.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

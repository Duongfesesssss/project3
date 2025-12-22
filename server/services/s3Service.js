const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');

let s3Client;

function getS3Client() {
  if (s3Client) return s3Client;
  if (!process.env.AWS_REGION) throw new Error('AWS_REGION is required');
  s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: process.env.AWS_ACCESS_KEY_ID
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
  });
  return s3Client;
}

function getBucket() {
  if (!process.env.S3_BUCKET) throw new Error('S3_BUCKET is required');
  return process.env.S3_BUCKET;
}

function getPrefix() {
  const prefix = process.env.S3_PREFIX || '';
  if (!prefix) return '';
  return prefix.endsWith('/') ? prefix : `${prefix}/`;
}

function randomKey(fileName) {
  const safeName = fileName.replace(/\s+/g, '-');
  const unique = crypto.randomUUID();
  return `${getPrefix()}${unique}-${safeName}`;
}

async function uploadBuffer({ buffer, mimeType, fileName, key }) {
  if (!buffer) throw new Error('buffer is required');
  if (!mimeType) throw new Error('mimeType is required');
  const bucket = getBucket();
  const objectKey = key || randomKey(fileName || 'upload.bin');

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: objectKey,
    Body: buffer,
    ContentType: mimeType,
  });

  try {
    await getS3Client().send(command);
    return { key: objectKey, bucket };
  } catch (err) {
    throw new Error(`Failed to upload to S3: ${err.message}`);
  }
}

async function getPresignedGetUrl(key, expiresInSeconds) {
  if (!key) throw new Error('key is required');
  const bucket = getBucket();
  const ttl = Number(expiresInSeconds || process.env.S3_SIGNED_URL_TTL || 900);
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });

  try {
    return await getSignedUrl(getS3Client(), command, { expiresIn: ttl });
  } catch (err) {
    throw new Error(`Failed to sign GET URL: ${err.message}`);
  }
}

async function deleteObject(key) {
  if (!key) throw new Error('key is required');
  const bucket = getBucket();
  const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });

  try {
    await getS3Client().send(command);
    return { deleted: true };
  } catch (err) {
    throw new Error(`Failed to delete S3 object: ${err.message}`);
  }
}

module.exports = {
  uploadBuffer,
  getPresignedGetUrl,
  deleteObject,
  randomKey,
};

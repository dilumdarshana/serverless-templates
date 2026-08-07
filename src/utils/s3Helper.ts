/**
 * S3 client helper for generating presigned URLs.
 * Presigned URLs allow a client to upload/download objects directly from S3
 * without exposing bucket credentials.
 */
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({ region: process.env.LAMBDA_REGION });

/**
 * Generate a presigned URL that lets a client upload a file directly to S3.
 * @param bucket - bucket name
 * @param key - object key (path in the bucket)
 * @param expiresIn - URL validity in seconds
 */
export const getPresignedUploadUrl = async (bucket: string, key: string, expiresIn = 300) => {
  const command = new PutObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(s3Client, command, { expiresIn });
};

/**
 * Generate a presigned URL for downloading an object from S3.
 */
export const getPresignedDownloadUrl = async (bucket: string, key: string, expiresIn = 300) => {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(s3Client, command, { expiresIn });
};

export { s3Client };

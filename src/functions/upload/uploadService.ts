import { getPresignedUploadUrl, getPresignedDownloadUrl } from '../../utils/s3Helper';
import { S3_UPLOAD_BUCKET } from '../../utils/constants';
import { generateId } from '../../utils/commonHelper';
import { InterceptError } from '../../utils/errorHelper';

/**
 * Generate a presigned URL that lets a client upload a file directly to S3.
 * The client PUTs the file to the returned URL; the file never passes through
 * the Lambda.
 */
export const createPresignedUpload = async (data: { fileName: string; contentType?: string }) => {
  const { fileName, contentType } = data;

  if (!S3_UPLOAD_BUCKET) {
    throw InterceptError('Upload bucket is not configured', 500);
  }

  const key = `uploads/${generateId()}/${fileName}`;
  const url = await getPresignedUploadUrl(S3_UPLOAD_BUCKET, key, 300);

  return {
    data: {
      url,
      key,
      bucket: S3_UPLOAD_BUCKET,
      contentType,
    },
    message: 'PresignedUrlGenerated',
  };
};

/**
 * Generate a presigned URL for downloading an object from S3.
 * The key is captured from the wildcard route segment (may contain slashes).
 */
export const getPresignedDownload = async (data: { params: { wildcard: string } }) => {
  const key = data.params.wildcard;

  if (!S3_UPLOAD_BUCKET) {
    throw InterceptError('Upload bucket is not configured', 500);
  }

  const url = await getPresignedDownloadUrl(S3_UPLOAD_BUCKET, key, 300);

  return {
    data: { url, key },
    message: 'PresignedDownloadGenerated',
  };
};
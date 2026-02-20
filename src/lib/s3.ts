import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { envs } from "../envs";

export const s3Client = new S3Client({
  region: envs.AWS_REGION,
  credentials: {
    accessKeyId: envs.AWS_ACCESS_KEY_ID,
    secretAccessKey: envs.AWS_SECRET_ACCESS_KEY,
  },
});

export async function uploadFileToS3(
  file: Buffer | Uint8Array,
  key: string,
  contentType: string,
) {
  const command = new PutObjectCommand({
    Bucket: envs.AWS_S3_BUCKET,
    Key: key,
    Body: file,
    ContentType: contentType,
    // Note: ACL is removed because Bucket Owner Enforced is enabled
  });

  await s3Client.send(command);

  return `https://${envs.AWS_S3_BUCKET}.s3.${envs.AWS_REGION}.amazonaws.com/${key}`;
}

export async function deleteFileFromS3(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: envs.AWS_S3_BUCKET,
    Key: key,
  });

  await s3Client.send(command);
}

export async function getPresignedUrl(key: string, expiresIn = 3600) {
  const command = new PutObjectCommand({
    Bucket: envs.AWS_S3_BUCKET,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

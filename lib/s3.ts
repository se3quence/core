// lib/s3.ts
import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.S3_API!, // https://<account_id>.r2.cloudflarestorage.com
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const getPublicUrl = (key: string) => {
  // Hardcoding the domain as requested, or using an env variable
  const base = process.env.R2_PUBLIC_URL;
  return `${base}/${key.startsWith("/") ? key.slice(1) : key}`;
};

export const resolvePublicBaseUrl = () => process.env.R2_PUBLIC_URL;

// lib/s3.ts
import { S3Client } from "@aws-sdk/client-s3";

// Validate required env vars on module load
const required = ["S3_API", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_PUBLIC_URL", "R2_BUCKET_NAME"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(`Missing required R2 environment variables: ${missing.join(", ")}`);
}

export const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.S3_API!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const baseUrl = process.env.R2_PUBLIC_URL!.replace(/\/$/, "");
const bucketName = process.env.R2_BUCKET_NAME!;

/**
 * Constructs a public URL for an R2 object: {base}/{bucketName}/{key}
 */
export function getPublicUrl(key: string): string {
  if (!key) throw new Error("Key is required");
  const cleanKey = key.replace(/^\//, "");
  return `${baseUrl}/${bucketName}/${cleanKey}`;
}

/**
 * Extracts the S3 key from a public URL
 */
export function extractKeyFromPublicUrl(publicUrl: string): string | null {
  if (!publicUrl?.startsWith(baseUrl)) return null;
  const path = publicUrl.replace(baseUrl, "").replace(/^\//, "");
  if (!path.startsWith(`${bucketName}/`)) return null;
  return path.replace(`${bucketName}/`, "") || null;
}

export function resolvePublicBaseUrl(): string {
  return process.env.R2_PUBLIC_URL!;
}

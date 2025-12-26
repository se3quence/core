// lib/s3.ts
import { S3Client } from "@aws-sdk/client-s3";

// Lazy initialization - only validate and create client when actually used
let _s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!_s3Client) {
    // Validate required env vars only when client is needed
    const required = ["S3_API", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_PUBLIC_URL", "R2_BUCKET_NAME"];
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(`Missing required R2 environment variables: ${missing.join(", ")}`);
    }

    _s3Client = new S3Client({
      region: "auto",
      endpoint: process.env.S3_API!,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return _s3Client;
}

// Export as getter to maintain compatibility
// Using Proxy to lazily initialize the client while maintaining type compatibility
export const s3Client = new Proxy({} as S3Client, {
  get(_target, prop) {
    const client = getS3Client();
    const value = (client as any)[prop];
    // Bind methods to maintain 'this' context
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
}) as S3Client;

function getBaseUrl(): string {
  if (!process.env.R2_PUBLIC_URL) {
    throw new Error("Missing required R2 environment variable: R2_PUBLIC_URL");
  }
  return process.env.R2_PUBLIC_URL.replace(/\/$/, "");
}

function getBucketName(): string {
  if (!process.env.R2_BUCKET_NAME) {
    throw new Error("Missing required R2 environment variable: R2_BUCKET_NAME");
  }
  return process.env.R2_BUCKET_NAME;
}

/**
 * Constructs a public URL for an R2 object: {base}/{bucketName}/{key}
 */
export function getPublicUrl(key: string): string {
  if (!key) throw new Error("Key is required");
  const cleanKey = key.replace(/^\//, "");
  const baseUrl = getBaseUrl();
  const bucketName = getBucketName();
  return `${baseUrl}/${bucketName}/${cleanKey}`;
}

/**
 * Extracts the S3 key from a public URL
 */
export function extractKeyFromPublicUrl(publicUrl: string): string | null {
  const baseUrl = getBaseUrl();
  const bucketName = getBucketName();
  if (!publicUrl?.startsWith(baseUrl)) return null;
  const path = publicUrl.replace(baseUrl, "").replace(/^\//, "");
  if (!path.startsWith(`${bucketName}/`)) return null;
  return path.replace(`${bucketName}/`, "") || null;
}

export function resolvePublicBaseUrl(): string {
  if (!process.env.R2_PUBLIC_URL) {
    throw new Error("Missing required R2 environment variable: R2_PUBLIC_URL");
  }
  return process.env.R2_PUBLIC_URL;
}

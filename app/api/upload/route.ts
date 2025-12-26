import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getPublicUrl, s3Client } from "@/lib/s3";
import { getUser } from "@/lib/db/queries";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];

export async function POST(req: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

    const { contentType, fileName } = body;
    if (!contentType || !fileName) {
      return NextResponse.json({ error: "Missing contentType or fileName" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json({ error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(", ")}` }, { status: 400 });
    }

    const extension = fileName.split(".").pop()?.toLowerCase();
    if (!extension) return NextResponse.json({ error: "File must have an extension" }, { status: 400 });

    const fileKey = `avatars/${user.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`;
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: fileKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 600 });
    const publicUrl = getPublicUrl(fileKey);

    return NextResponse.json({ uploadUrl, publicUrl, fileKey });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}

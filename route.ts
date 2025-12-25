import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getPublicUrl, resolvePublicBaseUrl, s3Client } from "@/lib/s3";
import { getUser } from "@/lib/db/queries";

export async function POST(req: Request) {
  try {
    // 1. Authenticate the user
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request body
    const { contentType, fileName } = await req.json();

    if (!contentType || !fileName) {
      return NextResponse.json(
        { error: "ContentType and FileName are required" },
        { status: 400 }
      );
    }

    const publicBaseUrl = resolvePublicBaseUrl();

    if (!publicBaseUrl) {
      return NextResponse.json(
        { error: "Storage configuration missing" },
        { status: 500 }
      );
    }

    // 3. Create a unique file key
    // We prefix with 'avatars/' to keep the bucket organized
    const fileExtension = fileName.split(".").pop();
    const fileKey = `avatars/${user.id}-${Date.now()}.${fileExtension}`;

    // 4. Prepare the S3 Command
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileKey,
      ContentType: contentType,
    });

    // 5. Generate Presigned URL (Valid for 10 minutes)
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 600 });

    /**
     * 6. Construct the Public URL
     * This is the URL you will eventually save in the database.
     * Use your Custom Domain or the R2.dev public endpoint.
     */
    const publicUrl = getPublicUrl(fileKey);

    return NextResponse.json({
      uploadUrl,
      publicUrl,
      fileKey,
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

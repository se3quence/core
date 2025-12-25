import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getPublicUrl, s3Client } from "@/lib/s3";
import { getUser } from "@/lib/db/queries";

export async function POST(req: Request) {
  try {
    const user = await getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { contentType, fileName } = await req.json();
    if (!contentType || !fileName) {
      return NextResponse.json({ error: "Missing file info" }, { status: 400 });
    }

    // 1. Create the key: avatars/userId-timestamp.extension
    const fileExtension = fileName.split(".").pop();
    const fileKey = `avatars/${user.id}-${Date.now()}.${fileExtension}`;

    // 2. Prepare the S3 Command for R2
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileKey,
      ContentType: contentType,
    });

    // 3. Generate the temporary PUT URL
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 600 });

    // 4. Construct the exact public URL: https://s3.sequence3.se/avatars/...
    const publicUrl = getPublicUrl(fileKey);

    return NextResponse.json({
      uploadUrl,
      publicUrl, // This will be sent to the PATCH API to update the DB
      fileKey,
    });
  } catch (error) {
    console.error("Presigned URL Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

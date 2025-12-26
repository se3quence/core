import { getUser, updateUserProfilePicture } from "@/lib/db/queries";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json(user);
  } catch (error) {
    console.error("GET /api/user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

    const { url } = body;
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    await updateUserProfilePicture(user.id, url);
    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("PATCH /api/user error:", error);
    return NextResponse.json(
      { error: "Failed to update profile picture" },
      { status: 500 }
    );
  }
}

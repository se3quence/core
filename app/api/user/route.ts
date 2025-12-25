import { getUser, updateUserProfilePicture } from "@/lib/db/queries";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getUser();
  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  try {
    const user = await getUser();
    if (!user) return new Response("Unauthorized", { status: 401 });

    const { url } = await req.json();
    if (!url) return new Response("URL is required", { status: 400 });

    // Call the fixed sequential query
    await updateUserProfilePicture(user.id, url);

    return Response.json({ success: true, url });
  } catch (error) {
    console.error("PATCH error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

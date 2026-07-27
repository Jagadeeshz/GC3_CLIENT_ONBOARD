import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/rbac/authorize";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await params;
  const auth = await authorize("request", "read");
  if (!auth.authorized) return auth.response;

  return NextResponse.json({
    data: [
      {
        id: "auto-1",
        content: "Your request has been received and is being reviewed by our team.",
        author_name: "GC3 Team",
        is_staff: true,
        created_at: new Date().toISOString(),
      },
    ],
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await params;
  const auth = await authorize("request", "create");
  if (!auth.authorized) return auth.response;

  const body = await request.json();
  const { content } = body;

  if (!content) {
    return NextResponse.json(
      { error: "Content is required" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    data: {
      id: `comment-${Date.now()}`,
      content,
      author_name: auth.user.full_name || "You",
      is_staff: false,
      created_at: new Date().toISOString(),
    },
  }, { status: 201 });
}

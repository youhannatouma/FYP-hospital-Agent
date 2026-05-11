import { NextResponse } from "next/server";
import { getServerClerkToken } from "@/lib/server/clerk-token";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000/api";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const token = await getServerClerkToken();
    const { searchParams } = new URL(request.url);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Proxy to FastAPI backend
    const res = await fetch(`${BACKEND}/doctors/${id}/slots?${searchParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("[doctor availability GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctor availability" },
      { status: 500 },
    );
  }
}

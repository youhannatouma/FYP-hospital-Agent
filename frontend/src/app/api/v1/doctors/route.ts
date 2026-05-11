import { NextResponse } from "next/server";
import { getServerClerkToken } from "@/lib/server/clerk-token";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000/api";

export async function GET(request: Request) {
  try {
    const token = await getServerClerkToken();
    const { searchParams } = new URL(request.url);

    // Proxy to FastAPI backend - list all doctors
    const res = await fetch(`${BACKEND}/doctors/?${searchParams}`, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("[doctors GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctors" },
      { status: 500 },
    );
  }
}

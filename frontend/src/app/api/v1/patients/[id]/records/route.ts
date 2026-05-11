/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { getServerClerkToken } from "@/lib/server/clerk-token";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000/api";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const token = await getServerClerkToken();

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Proxy to FastAPI backend - get medical records
    // Use /my endpoint for current user's records
    const res = await fetch(`${BACKEND}/medical-records/my`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("[patient records GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch medical records" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const token = await getServerClerkToken();
    const body = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Proxy to FastAPI backend
    const res = await fetch(`${BACKEND}/medical-records/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("[patient records POST] Error:", error);
    return NextResponse.json(
      { error: "Failed to create medical record" },
      { status: 500 },
    );
  }
}

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

    // Proxy to FastAPI backend - get prescriptions for current user
    const res = await fetch(`${BACKEND}/prescriptions/my`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("[prescriptions GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch prescriptions" },
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
    const res = await fetch(`${BACKEND}/prescriptions/`, {
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
    console.error("[prescriptions POST] Error:", error);
    return NextResponse.json(
      { error: "Failed to create prescription" },
      { status: 500 },
    );
  }
}

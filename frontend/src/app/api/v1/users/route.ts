import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000/api";

export async function GET(request: Request) {
  try {
    const { getToken } = await auth();
    const token = await getToken();
    const { searchParams } = new URL(request.url);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Proxy to FastAPI backend
    const res = await fetch(`${BACKEND}/users/?${searchParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("[users GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { getToken } = await auth();
    const token = await getToken();
    const body = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Proxy to FastAPI backend - update current user
    const res = await fetch(`${BACKEND}/users/me`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("[users PATCH] Error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}

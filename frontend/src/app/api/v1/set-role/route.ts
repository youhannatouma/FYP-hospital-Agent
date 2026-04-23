import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * POST /api/v1/set-role
 * Sets the user's publicMetadata.role after onboarding completes.
 * Body: { role: "patient" | "doctor" }
 */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { role } = body;

    if (!role || !["patient", "doctor"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be 'patient' or 'doctor'." },
        { status: 400 }
      );
    }

    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: { role },
    });

    return NextResponse.json({ success: true, role });
  } catch (error) {
    console.error("[set-role] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

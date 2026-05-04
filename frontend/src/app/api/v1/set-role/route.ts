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
    const requestedRole = body?.role;
    const role = requestedRole === "doctor" ? "doctor" : "patient";

    try {
      const client = await clerkClient();
      await client.users.updateUser(userId, {
        publicMetadata: { role },
      });
      return NextResponse.json({ success: true, role });
    } catch (syncError) {
      // Local/dev fallback:
      // If Clerk metadata sync fails, keep onboarding moving with a safe default.
      if (role === "patient") {
        console.warn("[set-role] Clerk sync failed, falling back to patient role:", syncError);
        return NextResponse.json({ success: true, role: "patient", fallback: true });
      }
      throw syncError;
    }
  } catch (error) {
    console.error("[set-role] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

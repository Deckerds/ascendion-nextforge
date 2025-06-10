import { NextRequest, NextResponse } from "next/server";
import { getUser, setUser } from "@/lib/storage";
import { ApiResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { username, hashedPassword, secureWord } = await request.json();

    if (!username || !hashedPassword || !secureWord) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "All fields are required",
        },
        { status: 400 },
      );
    }

    const user = getUser(username);
    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Invalid credentials",
        },
        { status: 401, statusText: "Invalid credentials" },
      );
    }

    if (user.secureWord !== secureWord) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Invalid secure word",
        },
        { status: 401, statusText: "Invalid secure word" },
      );
    }

    if (Date.now() - user.issuedAt > 60000) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Secure word has expired",
        },
        { status: 401, statusText: "Secure word has expired" },
      );
    }

    setUser(username, {
      ...user,
      hashedPassword,
    });

    const token = Buffer.from(
      JSON.stringify({
        username,
        iat: Date.now(),
        exp: Date.now() + 3600000,
      }),
    ).toString("base64");

    return NextResponse.json<ApiResponse<{ token: string }>>({
      success: true,
      data: { token },
    });
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}

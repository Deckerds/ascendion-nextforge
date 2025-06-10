import { NextRequest, NextResponse } from "next/server";
import { generateSecureWord } from "@/lib/crypto";
import { setUser, checkRateLimit } from "@/lib/storage";
import { ApiResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Username is required",
        },
        { status: 400 },
      );
    }

    if (!checkRateLimit(username)) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error:
            "Rate limit exceeded. Please wait 10 seconds before trying again.",
        },
        {
          status: 400,
          statusText:
            "Rate limit exceeded. Please wait 10 seconds before trying again.",
        },
      );
    }

    const timestamp = Date.now();
    const secureWord = generateSecureWord(username, timestamp);

    setUser(username, {
      username,
      secureWord,
      issuedAt: timestamp,
      mfaAttempts: 0,
      isLocked: false,
    });

    return NextResponse.json<ApiResponse<{ secureWord: string }>>({
      success: true,
      data: { secureWord },
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

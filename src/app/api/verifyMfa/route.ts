import { NextRequest, NextResponse } from "next/server";
import { generateMfaCode } from "@/lib/crypto";
import { getUser, setUser } from "@/lib/storage";
import { ApiResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { username, code } = await request.json();

    if (!username || !code) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Username and code are required",
        },
        { status: 400, statusText: "Username and code are required" },
      );
    }

    const user = getUser(username);
    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "User not found",
        },
        { status: 404, statusText: "User not found" },
      );
    }

    if (user.isLocked) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Account is locked due to too many failed attempts",
        },
        {
          status: 400,
          statusText: "Account is locked due to too many failed attempts",
        },
      );
    }

    const validCode = generateMfaCode(username);

    if (code !== validCode) {
      const updatedUser = {
        ...user,
        mfaAttempts: user.mfaAttempts + 1,
        isLocked: user.mfaAttempts + 1 >= 3,
      };
      setUser(username, updatedUser);

      if (updatedUser.isLocked) {
        return NextResponse.json<ApiResponse<null>>(
          {
            success: false,
            error: "Account locked due to too many failed attempts",
          },
          {
            status: 400,
            statusText: "Account locked due to too many failed attempts",
          },
        );
      }

      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: `Invalid MFA code. ${
            2 - user.mfaAttempts
          } attempts remaining.`,
        },
        {
          status: 400,
          statusText: `Invalid MFA code. ${
            2 - user.mfaAttempts
          } attempts remaining.`,
        },
      );
    }

    setUser(username, {
      ...user,
      mfaAttempts: 0,
      isLocked: false,
    });

    return NextResponse.json<ApiResponse<{ success: boolean }>>({
      success: true,
      data: { success: true },
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

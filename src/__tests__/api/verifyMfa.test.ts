/**
 * @jest-environment node
 */

import { NextRequest } from "next/server";
import { getUser, setUser } from "@/lib/storage";
import * as crypto from "@/lib/crypto";
import { POST } from "../../app/api/verifyMfa/route";

// Mock storage and crypto
jest.mock("@/lib/storage");
jest.mock("@/lib/crypto");

const mockUser = {
  username: "testuser",
  hashedPassword: "hashedpw",
  secureWord: "abcd1234",
  issuedAt: Date.now(),
  mfaAttempts: 0,
  isLocked: false,
};

describe("/api/verifyMfaCode", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getUser as jest.Mock).mockReturnValue({ ...mockUser });
    (setUser as jest.Mock).mockImplementation(() => {});
    (crypto.generateMfaCode as jest.Mock).mockReturnValue("123456");
  });

  it("returns 200 for valid MFA code", async () => {
    const request = new NextRequest("http://localhost/api/verifyMfaCode", {
      method: "POST",
      body: JSON.stringify({ username: "testuser", code: "123456" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.success).toBe(true);
  });

  it("returns 400 if username or code is missing", async () => {
    const request = new NextRequest("http://localhost/api/verifyMfaCode", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toMatch(/Username and code are required/);
  });

  it("returns 404 if user is not found", async () => {
    (getUser as jest.Mock).mockReturnValue(null);

    const request = new NextRequest("http://localhost/api/verifyMfaCode", {
      method: "POST",
      body: JSON.stringify({ username: "notfound", code: "123456" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toMatch(/User not found/);
  });

  it("returns 400 for invalid MFA code and updates mfaAttempts", async () => {
    (crypto.generateMfaCode as jest.Mock).mockReturnValue("000000");

    const request = new NextRequest("http://localhost/api/verifyMfaCode", {
      method: "POST",
      body: JSON.stringify({ username: "testuser", code: "wrongcode" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/Invalid MFA code/);
    expect(setUser).toHaveBeenCalledWith(
      "testuser",
      expect.objectContaining({ mfaAttempts: 1 }),
    );
  });

  it("locks account after 3 failed attempts", async () => {
    (getUser as jest.Mock).mockReturnValue({
      ...mockUser,
      mfaAttempts: 2,
      isLocked: false,
    });
    (crypto.generateMfaCode as jest.Mock).mockReturnValue("000000");

    const request = new NextRequest("http://localhost/api/verifyMfaCode", {
      method: "POST",
      body: JSON.stringify({ username: "testuser", code: "wrongcode" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/Account locked/);
    expect(setUser).toHaveBeenCalledWith(
      "testuser",
      expect.objectContaining({ isLocked: true, mfaAttempts: 3 }),
    );
  });

  it("returns 400 if account is already locked", async () => {
    (getUser as jest.Mock).mockReturnValue({
      ...mockUser,
      isLocked: true,
    });

    const request = new NextRequest("http://localhost/api/verifyMfaCode", {
      method: "POST",
      body: JSON.stringify({ username: "testuser", code: "123456" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/Account is locked/);
  });
});

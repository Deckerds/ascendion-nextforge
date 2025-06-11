/**
 * @jest-environment node
 */

import { POST } from "@/app/api/login/route";
import { NextRequest } from "next/server";
import { setUser } from "@/lib/storage";

describe("/api/login", () => {
  const validUser = {
    username: "testuser",
    hashedPassword: "hashed123",
    secureWord: "abcd1234",
    issuedAt: Date.now(),
    mfaAttempts: 0,
    isLocked: false,
  };
  beforeEach(() => {
    // Seed the in-memory store or mock with a valid user
    setUser(validUser.username, validUser);
  });

  it("returns a token for valid credentials", async () => {
    const request = new NextRequest("http://localhost:3000/api/login", {
      method: "POST",
      body: JSON.stringify({
        username: validUser.username,
        hashedPassword: validUser.hashedPassword,
        secureWord: validUser.secureWord,
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.token).toBeDefined();
    expect(typeof data.data.token).toBe("string");
  });

  it("returns 400 for missing fields", async () => {
    const request = new NextRequest("http://localhost:3000/api/login", {
      method: "POST",
      body: JSON.stringify({ username: "testuser" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe("All fields are required");
  });

  it("returns 401 for invalid user", async () => {
    const request = new NextRequest("http://localhost:3000/api/login", {
      method: "POST",
      body: JSON.stringify({
        username: "invalidUser",
        hashedPassword: "irrelevant",
        secureWord: "irrelevant",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Invalid credentials");
  });

  it("returns 401 for incorrect secure word", async () => {
    const request = new NextRequest("http://localhost:3000/api/login", {
      method: "POST",
      body: JSON.stringify({
        username: validUser.username,
        hashedPassword: validUser.hashedPassword,
        secureWord: "wrongword",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Invalid secure word");
  });

  it("returns 401 if secure word expired", async () => {
    setUser(validUser.username, {
      ...validUser,
      issuedAt: Date.now() - 120000,
    });

    const request = new NextRequest("http://localhost:3000/api/login", {
      method: "POST",
      body: JSON.stringify({
        username: validUser.username,
        hashedPassword: validUser.hashedPassword,
        secureWord: validUser.secureWord,
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Secure word has expired");
  });
});

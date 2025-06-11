/**
 * @jest-environment node
 */

import { POST } from "@/app/api/getSecureWord/route";
import { NextRequest } from "next/server";

describe("/api/getSecureWord", () => {
  it("returns secure word for valid username", async () => {
    const request = new NextRequest("http://localhost:3000/api/getSecureWord", {
      method: "POST",
      body: JSON.stringify({ username: "testuser" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.secureWord).toBeDefined();
    expect(data.data.secureWord).toHaveLength(8);
  });

  it("returns error for missing username", async () => {
    const request = new NextRequest("http://localhost:3000/api/getSecureWord", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Username is required");
  });
});

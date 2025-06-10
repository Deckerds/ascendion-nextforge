import { createHash, createHmac } from "crypto";

const SECRET_KEY = process.env.SECRET_KEY || "your-secret-key-here";

export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export function generateSecureWord(
  username: string,
  timestamp: number,
): string {
  return createHmac("sha256", SECRET_KEY)
    .update(`${username}:${timestamp}`)
    .digest("hex")
    .substring(0, 8)
    .toUpperCase();
}

export function generateMfaCode(username: string): string {
  const timestamp = Math.floor(Date.now() / 30000);
  return createHmac("sha256", SECRET_KEY)
    .update(`${username}:${timestamp}`)
    .digest("hex")
    .substring(0, 6);
}

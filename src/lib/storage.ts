import { User } from "@/types";

const globalWithStore = global as typeof globalThis & {
  __user_store?: Map<string, User>;
  __rate_limits?: Map<string, number>;
};

const users = globalWithStore.__user_store || new Map<string, User>();
const rateLimits = globalWithStore.__rate_limits || new Map<string, number>();

globalWithStore.__user_store = users;
globalWithStore.__rate_limits = rateLimits;

export function getUser(username: string): User | undefined {
  return users.get(username.toLowerCase());
}

export function setUser(username: string, user: User): void {
  const key = username.toLowerCase();
  users.set(key, { ...user }); // store a copy
}

export function checkRateLimit(username: string): boolean {
  const key = username.toLowerCase();
  const lastRequest = rateLimits.get(key);
  const now = Date.now();

  if (lastRequest && now - lastRequest < 10000) {
    return false;
  }

  rateLimits.set(key, now);
  return true;
}

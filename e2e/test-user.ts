import fs from "node:fs";
import path from "node:path";

export const testUserPath = path.join(process.cwd(), ".playwright", "test-user.json");

export type TestUser = { id: string; email: string; password: string };

export function hasSupabaseConnection() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function readTestUser(): TestUser | null {
  if (!hasSupabaseConnection() || !fs.existsSync(testUserPath)) return null;
  return JSON.parse(fs.readFileSync(testUserPath, "utf8")) as TestUser;
}

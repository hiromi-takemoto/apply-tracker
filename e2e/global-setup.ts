import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { hasSupabaseConnection, testUserPath, type TestUser } from "./test-user";

export default async function globalSetup() {
  if (!hasSupabaseConnection()) {
    console.warn("Supabase接続情報が未設定のため、E2Eテストをスキップします。");
    return;
  }

  const email = `e2e-${randomUUID()}@example.com`;
  const password = `E2e-${randomUUID()}!`;
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) throw error ?? new Error("E2Eテストユーザーを作成できませんでした。");

  const user: TestUser = { id: data.user.id, email, password };
  try {
    await fs.mkdir(path.dirname(testUserPath), { recursive: true });
    await fs.writeFile(testUserPath, JSON.stringify(user), { encoding: "utf8", flag: "wx" });
  } catch (writeError) {
    await admin.auth.admin.deleteUser(user.id);
    throw writeError;
  }
}

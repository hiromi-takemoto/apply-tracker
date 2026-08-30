import fs from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import { readTestUser, testUserPath } from "./test-user";

export default async function globalTeardown() {
  const user = readTestUser();
  if (!user) return;

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) throw error;
  await fs.rm(testUserPath, { force: true });
}

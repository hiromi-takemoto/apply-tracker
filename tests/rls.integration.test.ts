import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, describe, expect, it } from "vitest";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const configured = Boolean(url && anonKey && serviceRoleKey);

if (!configured) {
  console.warn("RLS統合テスト: .env.local のSupabase環境変数が未設定のためスキップします。");
}

const integration = configured ? describe : describe.skip;

integration("applications のRLS", () => {
  const suffix = randomUUID();
  const password = `Rls-test-${randomUUID()}!`;
  const emails = [`rls-a-${suffix}@example.com`, `rls-b-${suffix}@example.com`];
  const userIds: string[] = [];
  let applicationId: string | undefined;
  let admin: SupabaseClient;

  afterAll(async () => {
    if (!configured) return;
    if (applicationId) {
      await admin.from("applications").delete().eq("id", applicationId);
    }
    await Promise.all(userIds.map((id) => admin.auth.admin.deleteUser(id)));
  });

  it("ユーザーBはAのデータを読めず・更新削除できず・持ち主を詐称もできない", async () => {
    admin = createClient(url!, serviceRoleKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    for (const email of emails) {
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      expect(error).toBeNull();
      expect(data.user).not.toBeNull();
      if (data.user) userIds.push(data.user.id);
    }

    const clientA = createClient(url!, anonKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const clientB = createClient(url!, anonKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const [sessionA, sessionB] = await Promise.all([
      clientA.auth.signInWithPassword({ email: emails[0], password }),
      clientB.auth.signInWithPassword({ email: emails[1], password }),
    ]);
    expect(sessionA.error).toBeNull();
    expect(sessionB.error).toBeNull();

    const inserted = await clientA
      .from("applications")
      .insert({ owner_id: userIds[0], platform: "other", title: "RLSテスト案件" })
      .select("id")
      .single();
    expect(inserted.error).toBeNull();
    applicationId = inserted.data?.id;
    expect(applicationId).toBeTruthy();

    const readByB = await clientB.from("applications").select("id").eq("id", applicationId!);
    expect(readByB.error).toBeNull();
    expect(readByB.data).toEqual([]);

    const updateByB = await clientB
      .from("applications")
      .update({ title: "Bによる不正更新" })
      .eq("id", applicationId!)
      .select("id");
    expect(updateByB.error).toBeNull();
    expect(updateByB.data).toEqual([]);
    const unchangedAfterUpdate = await clientA.from("applications").select("title").eq("id", applicationId!).single();
    expect(unchangedAfterUpdate.data?.title).toBe("RLSテスト案件");

    const deleteByB = await clientB
      .from("applications")
      .delete()
      .eq("id", applicationId!)
      .select("id");
    expect(deleteByB.error).toBeNull();
    expect(deleteByB.data).toEqual([]);
    const remainsAfterDelete = await clientA.from("applications").select("id").eq("id", applicationId!).single();
    expect(remainsAfterDelete.data?.id).toBe(applicationId);

    // Bが「持ち主をAだと偽って」行を作れないこと（owner_idの詐称）
    const forgedInsert = await clientB
      .from("applications")
      .insert({ owner_id: userIds[0], platform: "other", title: "Bによる持ち主詐称" })
      .select("id");
    expect(forgedInsert.error).not.toBeNull();
    expect(forgedInsert.data).toBeNull();

    // BがAのプロフィール行を読めないこと
    const profileByB = await clientB.from("profiles").select("id").eq("id", userIds[0]);
    expect(profileByB.error).toBeNull();
    expect(profileByB.data).toEqual([]);

    // Aは自分のプロフィール行を読めること
    const profileByA = await clientA.from("profiles").select("id, role").eq("id", userIds[0]).single();
    expect(profileByA.error).toBeNull();
    expect(profileByA.data).toEqual({ id: userIds[0], role: "user" });

    const readByA = await clientA
      .from("applications")
      .select("id, title")
      .eq("id", applicationId!)
      .single();
    expect(readByA.error).toBeNull();
    expect(readByA.data).toEqual({ id: applicationId, title: "RLSテスト案件" });
  });
});

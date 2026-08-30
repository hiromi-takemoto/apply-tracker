"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validateApplication } from "@/lib/applications";
import { nonEmptySearchQuery } from "@/lib/application-filters";
import { changedApplicationFields, safeApplicationAuditDetails } from "@/lib/application-audit";
import type { ApplicationInput } from "@/lib/applications";

export type FormState = { errors: Record<string, string>; message?: string };

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function filterApplications(formData: FormData) {
  const query = nonEmptySearchQuery({
    status: String(formData.get("status") ?? ""),
    platform: String(formData.get("platform") ?? ""),
    genre: String(formData.get("genre") ?? ""),
  });
  redirect(`/applications${query ? `?${query}` : ""}`);
}

async function authenticatedClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

async function writeAuditLog(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  action: "create" | "update" | "delete",
  targetId: string,
  details: ReturnType<typeof safeApplicationAuditDetails>,
) {
  try {
    const { error } = await supabase.from("audit_logs").insert({
      owner_id: userId,
      actor_id: userId,
      action,
      target_table: "applications",
      target_id: targetId,
      details,
    });
    if (error) console.error("監査ログの記録に失敗しました。", error);
  } catch (error) {
    console.error("監査ログの記録に失敗しました。", error);
  }
}

export async function createApplication(_state: FormState, formData: FormData): Promise<FormState> {
  const result = validateApplication(formData);
  if (!result.success) return { errors: result.errors, message: "入力内容を確認してください。" };
  const { supabase, user } = await authenticatedClient();
  if (!user) return { errors: {}, message: "ログインし直してください。" };
  const { data, error } = await supabase.from("applications").insert({ ...result.data, owner_id: user.id }).select("id").single();
  if (error) return { errors: {}, message: "案件を保存できませんでした。もう一度お試しください。" };
  await writeAuditLog(supabase, user.id, "create", data.id, safeApplicationAuditDetails(result.data));
  revalidatePath("/applications");
  redirect("/applications");
}

export async function updateApplication(id: string, _state: FormState, formData: FormData): Promise<FormState> {
  const result = validateApplication(formData);
  if (!result.success) return { errors: result.errors, message: "入力内容を確認してください。" };
  const { supabase, user } = await authenticatedClient();
  if (!user) return { errors: {}, message: "ログインし直してください。" };
  const { data: before } = await supabase.from("applications").select("platform, title, listing_url, genre_major, genre_minor, listed_amount_min, listed_amount_max, actual_amount, applicant_count, client_rating, client_completion_rate, deadline, status, proposal_text, memo").eq("id", id).maybeSingle();
  if (!before) return { errors: {}, message: "案件を更新できませんでした。権限または対象をご確認ください。" };
  const { data, error } = await supabase.from("applications").update(result.data).eq("id", id).select("id").maybeSingle();
  if (error || !data) return { errors: {}, message: "案件を更新できませんでした。権限または対象をご確認ください。" };
  const changedFields = changedApplicationFields(before as ApplicationInput, result.data);
  await writeAuditLog(supabase, user.id, "update", id, safeApplicationAuditDetails(result.data, changedFields));
  revalidatePath("/applications");
  redirect("/applications");
}

export async function deleteApplication(id: string): Promise<void> {
  const { supabase, user } = await authenticatedClient();
  if (!user) redirect("/login");
  const { data: before } = await supabase.from("applications").select("platform, title, listing_url, genre_major, genre_minor, listed_amount_min, listed_amount_max, actual_amount, applicant_count, client_rating, client_completion_rate, deadline, status, proposal_text, memo").eq("id", id).maybeSingle();
  if (!before) return;
  const { data: deleted, error } = await supabase.from("applications").delete().eq("id", id).select("id").maybeSingle();
  if (!error && deleted) {
    await writeAuditLog(supabase, user.id, "delete", id, safeApplicationAuditDetails(before as ApplicationInput));
  }
  revalidatePath("/applications");
}

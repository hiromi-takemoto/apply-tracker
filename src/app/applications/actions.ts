"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validateApplication } from "@/lib/applications";

export type FormState = { errors: Record<string, string>; message?: string };

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

async function authenticatedClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function createApplication(_state: FormState, formData: FormData): Promise<FormState> {
  const result = validateApplication(formData);
  if (!result.success) return { errors: result.errors, message: "入力内容を確認してください。" };
  const { supabase, user } = await authenticatedClient();
  if (!user) return { errors: {}, message: "ログインし直してください。" };
  const { error } = await supabase.from("applications").insert({ ...result.data, owner_id: user.id });
  if (error) return { errors: {}, message: "案件を保存できませんでした。もう一度お試しください。" };
  revalidatePath("/applications");
  redirect("/applications");
}

export async function updateApplication(id: string, _state: FormState, formData: FormData): Promise<FormState> {
  const result = validateApplication(formData);
  if (!result.success) return { errors: result.errors, message: "入力内容を確認してください。" };
  const { supabase, user } = await authenticatedClient();
  if (!user) return { errors: {}, message: "ログインし直してください。" };
  const { data, error } = await supabase.from("applications").update(result.data).eq("id", id).select("id").maybeSingle();
  if (error || !data) return { errors: {}, message: "案件を更新できませんでした。権限または対象をご確認ください。" };
  revalidatePath("/applications");
  redirect("/applications");
}

export async function deleteApplication(id: string): Promise<void> {
  const { supabase, user } = await authenticatedClient();
  if (!user) redirect("/login");
  await supabase.from("applications").delete().eq("id", id);
  revalidatePath("/applications");
}

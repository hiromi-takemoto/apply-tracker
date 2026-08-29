"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { message: string; kind: "error" | "success" } | null;

function credentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
}

function errorMessage(message: string) {
  const value = message.toLowerCase();
  if (value.includes("invalid login credentials")) {
    return "メールアドレスまたはパスワードが違います。";
  }
  if (value.includes("email") && (value.includes("invalid") || value.includes("valid"))) {
    return "メールアドレスの形式が正しくありません。";
  }
  if (value.includes("password") && (value.includes("short") || value.includes("characters"))) {
    return "パスワードは6文字以上で入力してください。";
  }
  if (value.includes("already registered") || value.includes("already been registered")) {
    return "このメールアドレスは既に登録されています。";
  }
  if (value.includes("email not confirmed")) {
    return "メールアドレスの確認が完了していません。確認メールをご覧ください。";
  }
  if (value.includes("rate limit")) {
    return "操作が集中しています。しばらく待ってから再度お試しください。";
  }
  return "認証処理に失敗しました。時間をおいて再度お試しください。";
}

export async function login(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(credentials(formData));
  if (error) return { message: errorMessage(error.message), kind: "error" };
  redirect("/applications");
}

export async function signup(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const values = credentials(formData);
  if (values.password.length < 6) {
    return { message: "パスワードは6文字以上で入力してください。", kind: "error" };
  }
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp(values);
  if (error) return { message: errorMessage(error.message), kind: "error" };
  if (data.session) redirect("/applications");
  return {
    message: "登録を受け付けました。確認メールのリンクを開いてからログインしてください。",
    kind: "success",
  };
}

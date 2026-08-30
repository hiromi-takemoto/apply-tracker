"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  passwordResetResponse,
  type PasswordResetOutcome,
} from "@/lib/password-reset";

export type ResetPasswordState = { message: string } | null;

const MINIMUM_RESPONSE_TIME_MS = 750;

function delay(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function requestOrigin() {
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  if (origin) return origin;
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  return host ? `${protocol}://${host}` : "http://localhost:3000";
}

export async function sendPasswordResetEmail(
  _state: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const minimumWait = delay(MINIMUM_RESPONSE_TIME_MS);
  let outcome: PasswordResetOutcome = "registered";

  try {
    const supabase = await createClient();
    const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    const baseUrl = configuredSiteUrl || await requestOrigin();
    const redirectTo = new URL("/update-password", baseUrl).toString();
    const email = String(formData.get("email") ?? "").trim();
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) {
      outcome = "supabase-error";
      console.error("Password reset email request failed", error);
    }
  } catch (error) {
    outcome = "supabase-error";
    console.error("Password reset email request failed", error);
  }

  await minimumWait;
  return { message: passwordResetResponse(outcome) };
}

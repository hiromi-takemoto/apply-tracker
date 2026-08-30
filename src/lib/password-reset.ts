export const PASSWORD_RESET_RESPONSE =
  "ご登録があれば再設定用のメールを送りました。メールをご確認ください。";

export type PasswordResetOutcome = "registered" | "unregistered" | "supabase-error";

export function passwordResetResponse(outcome: PasswordResetOutcome): string {
  void outcome;
  return PASSWORD_RESET_RESPONSE;
}

import { describe, expect, it } from "vitest";
import { PASSWORD_RESET_RESPONSE, passwordResetResponse } from "../src/lib/password-reset";

describe("パスワード再設定メールの応答", () => {
  it.each(["registered", "unregistered", "supabase-error"] as const)(
    "%s の場合も登録状況を示さない同じ文言を返す",
    (outcome) => {
      expect(passwordResetResponse(outcome)).toBe(PASSWORD_RESET_RESPONSE);
    },
  );
});

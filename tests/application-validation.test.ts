import { describe, expect, it } from "vitest";
import { validateApplication } from "../src/lib/applications";

function form(values: Record<string, string> = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries({ platform: "other", title: "テスト案件", status: "considering", ...values })) data.set(key, value);
  return data;
}

describe("案件の入力チェック", () => {
  it("必須3項目だけで保存用データを作れる", () => {
    const result = validateApplication(form());
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toMatchObject({ platform: "other", title: "テスト案件", status: "considering", actual_amount: null, deadline: null });
  });

  it.each([
    ["platform", "", "媒体を選択してください。"], ["title", "   ", "タイトルを入力してください。"], ["status", "unknown", "状態を選択してください。"],
    ["actual_amount", "-1", "実額は0以上の数値で入力してください。"], ["applicant_count", "1.5", "応募者数は0以上の整数で入力してください。"],
    ["client_rating", "5.1", "評価は0〜5の数値で入力してください。"], ["client_completion_rate", "101", "完了率は0〜100の数値で入力してください。"],
    ["listing_url", "ftp://example.com", "URLは http:// または https:// で始めてください。"],
  ])("%s の不正値を日本語で説明する", (name, value, message) => {
    const result = validateApplication(form({ [name]: value }));
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors[name]).toBe(message);
  });
});

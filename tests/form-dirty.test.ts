import { describe, expect, it } from "vitest";
import { hasFormChanged, type FormEntry } from "../src/lib/form-dirty";

describe("フォームの変更判定", () => {
  const initial: FormEntry[] = [["title", "案件A"], ["status", "considering"]];

  it("項目の順序だけが違う場合は未変更と判定する", () => {
    expect(hasFormChanged(initial, [...initial].reverse())).toBe(false);
  });

  it("値が1つでも変われば変更ありと判定する", () => {
    expect(hasFormChanged(initial, [["title", "案件B"], ["status", "considering"]])).toBe(true);
  });

  it("チェック項目の追加や削除も変更ありと判定する", () => {
    expect(hasFormChanged(initial, [...initial, ["listed_amount_has_range", "on"]])).toBe(true);
    expect(hasFormChanged(initial, [["title", "案件A"]])).toBe(true);
  });

  it("変更後に初期値へ戻せば未変更と判定する", () => {
    const changed: FormEntry[] = [["title", "一時変更"], ["status", "considering"]];
    expect(hasFormChanged(initial, changed)).toBe(true);
    expect(hasFormChanged(initial, initial)).toBe(false);
  });
});

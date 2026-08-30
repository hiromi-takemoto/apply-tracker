import { describe, expect, it } from "vitest";
import { parseApplicationFilters } from "../src/lib/application-filters";

describe("案件一覧の絞り込み条件", () => {
  it("正しい英字キーだけを読み取る", () => {
    expect(parseApplicationFilters({ status: "applied", platform: "lancers", genre: "automation" })).toEqual({
      status: "applied",
      platform: "lancers",
      genre: "automation",
    });
  });

  it("不正な値はすべて無視する", () => {
    expect(parseApplicationFilters({ status: "応募済", platform: "unknown", genre: "invalid" })).toEqual({});
  });

  it("同じキーが複数ある場合も先頭の正しい値を読む", () => {
    expect(parseApplicationFilters({ status: ["contracted", "rejected"] })).toEqual({ status: "contracted" });
  });
});

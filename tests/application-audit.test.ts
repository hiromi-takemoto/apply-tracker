import { describe, expect, it } from "vitest";
import { changedApplicationFields, safeApplicationAuditDetails } from "../src/lib/application-audit";
import type { ApplicationInput } from "../src/lib/applications";

const base: ApplicationInput = {
  platform: "crowdworks", title: "案件A", listing_url: null,
  genre_major: null, genre_minor: null, listed_amount_min: null,
  listed_amount_max: null, actual_amount: null, applicant_count: null,
  client_rating: null, client_completion_rate: null, deadline: null,
  status: "considering", proposal_text: "秘密の提案本文", memo: "秘密のメモ本文",
};

describe("application audit", () => {
  it("変更された項目名だけを返す", () => {
    const after = { ...base, status: "applied" as const, proposal_text: "新しい秘密本文", memo: "新しい秘密メモ" };
    expect(changedApplicationFields(base, after)).toEqual(["状態", "提案文", "メモ"]);
  });

  it("detailsには提案文・メモの本文を含めない", () => {
    const details = safeApplicationAuditDetails(base, ["提案文", "メモ"]);
    const serialized = JSON.stringify(details);
    expect(details).toEqual({ title: "案件A", platform: "crowdworks", changed_fields: ["提案文", "メモ"] });
    expect(serialized).not.toContain("秘密の提案本文");
    expect(serialized).not.toContain("秘密のメモ本文");
    expect(serialized).not.toContain("proposal_text");
    expect(serialized).not.toContain("memo");
  });
});

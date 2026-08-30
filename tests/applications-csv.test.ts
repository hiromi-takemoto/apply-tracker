import { describe, expect, it } from "vitest";
import { buildApplicationsCsv, type CsvApplication } from "../src/lib/applications-csv";

const base: CsvApplication = {
  platform: "lancers",
  title: "通常案件",
  listing_url: "https://example.com",
  genre_major: "automation",
  genre_minor: "gas",
  listed_amount_min: 10000,
  listed_amount_max: 20000,
  actual_amount: 15000,
  applicant_count: 3,
  client_rating: 4.5,
  client_completion_rate: 98,
  deadline: "2026-09-01",
  status: "applied",
  proposal_text: null,
  memo: null,
  created_at: "2026-08-30T00:00:00Z",
  updated_at: "2026-08-30T00:00:00Z",
};

describe("案件CSVの組み立て", () => {
  it("BOMと日本語見出しを付け、enumを日本語ラベルにする", () => {
    const csv = buildApplicationsCsv([base]);
    expect(csv.startsWith("\uFEFF媒体,タイトル")).toBe(true);
    expect(csv).toContain("ランサーズ,通常案件");
    expect(csv).toContain("業務自動化・ツール,GAS・スプレッドシート");
    expect(csv).toContain(",応募済,");
    expect(csv).toContain(",10000,20000,15000,");
  });

  it("カンマ・改行・ダブルクォートをRFC形式でエスケープする", () => {
    const csv = buildApplicationsCsv([{ ...base, title: "開発,保守", proposal_text: "1行目\n2行目", memo: '彼は"OK"と言った' }]);
    expect(csv).toContain('"開発,保守"');
    expect(csv).toContain('"1行目\n2行目"');
    expect(csv).toContain('"彼は""OK""と言った"');
  });

  it("数式として解釈される先頭文字を無害化する", () => {
    const csv = buildApplicationsCsv([{ ...base, title: "=1+1", proposal_text: "+SUM(A1:A2)" }]);
    expect(csv).toContain("'=1+1");
    expect(csv).toContain("'+SUM(A1:A2)");
  });

  it("0件でもBOM付きの見出し行だけを返す", () => {
    const csv = buildApplicationsCsv([]);
    expect(csv.startsWith("\uFEFF媒体,タイトル")).toBe(true);
    expect(csv.trim().split("\r\n")).toHaveLength(1);
  });
});

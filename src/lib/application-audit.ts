import type { ApplicationInput } from "@/lib/applications";

export const APPLICATION_FIELD_LABELS: Record<keyof ApplicationInput, string> = {
  platform: "媒体",
  title: "タイトル",
  listing_url: "募集URL",
  genre_major: "ジャンル大区分",
  genre_minor: "ジャンル小区分",
  listed_amount_min: "一覧金額（下限）",
  listed_amount_max: "一覧金額（上限）",
  actual_amount: "実額",
  applicant_count: "応募者数",
  client_rating: "クライアント評価",
  client_completion_rate: "完了率",
  deadline: "締切",
  status: "状態",
  proposal_text: "提案文",
  memo: "メモ",
};

export function changedApplicationFields(
  before: ApplicationInput,
  after: ApplicationInput,
): string[] {
  return (Object.keys(APPLICATION_FIELD_LABELS) as (keyof ApplicationInput)[])
    .filter((key) => before[key] !== after[key])
    .map((key) => APPLICATION_FIELD_LABELS[key]);
}

export type ApplicationAuditDetails = {
  title: string;
  platform: ApplicationInput["platform"];
  changed_fields?: string[];
};

export function safeApplicationAuditDetails(
  application: ApplicationInput,
  changedFields?: string[],
): ApplicationAuditDetails {
  return {
    title: application.title,
    platform: application.platform,
    ...(changedFields ? { changed_fields: [...changedFields] } : {}),
  };
}

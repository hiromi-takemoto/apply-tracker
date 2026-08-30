import {
  GENRE_LABELS,
  GENRE_MINOR_OPTIONS,
  PLATFORM_LABELS,
  STATUS_LABELS,
  type ApplicationPlatform,
  type ApplicationStatus,
  type GenreMajor,
} from "./applications";

export type CsvApplication = {
  platform: ApplicationPlatform;
  title: string;
  listing_url: string | null;
  genre_major: GenreMajor | null;
  genre_minor: string | null;
  listed_amount_min: number | string | null;
  listed_amount_max: number | string | null;
  actual_amount: number | string | null;
  applicant_count: number | null;
  client_rating: number | string | null;
  client_completion_rate: number | string | null;
  deadline: string | null;
  status: ApplicationStatus;
  proposal_text: string | null;
  memo: string | null;
  created_at: string;
  updated_at: string;
};

const HEADERS = [
  "媒体", "タイトル", "掲載URL", "ジャンル大区分", "ジャンル小区分",
  "一覧金額下限", "一覧金額上限", "実額", "応募者数", "クライアント評価",
  "完了率", "締切", "状態", "提案文", "メモ", "登録日時", "更新日時",
];

function csvCell(value: string | number | null): string {
  let text = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  if (/[",\r\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function minorLabel(major: GenreMajor | null, minor: string | null): string {
  if (!major || !minor) return "";
  const options = GENRE_MINOR_OPTIONS[major] as Record<string, string>;
  return options[minor] ?? "";
}

export function buildApplicationsCsv(rows: CsvApplication[]): string {
  const lines = [HEADERS.map(csvCell).join(",")];
  for (const row of rows) {
    lines.push([
      PLATFORM_LABELS[row.platform], row.title, row.listing_url,
      row.genre_major ? GENRE_LABELS[row.genre_major] : "",
      minorLabel(row.genre_major, row.genre_minor),
      row.listed_amount_min, row.listed_amount_max, row.actual_amount,
      row.applicant_count, row.client_rating, row.client_completion_rate,
      row.deadline, STATUS_LABELS[row.status], row.proposal_text, row.memo,
      row.created_at, row.updated_at,
    ].map(csvCell).join(","));
  }
  return `\uFEFF${lines.join("\r\n")}\r\n`;
}

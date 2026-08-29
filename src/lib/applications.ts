export const PLATFORM_LABELS = {
  crowdworks: "クラウドワークス",
  lancers: "ランサーズ",
  coconala: "ココナラ",
  other: "その他",
} as const;

export const STATUS_LABELS = {
  considering: "検討中",
  applied: "応募済",
  replied: "返信あり",
  contracted: "契約",
  rejected: "不成立",
  passed: "見送り",
} as const;

export type ApplicationPlatform = keyof typeof PLATFORM_LABELS;
export type ApplicationStatus = keyof typeof STATUS_LABELS;

export type ApplicationInput = {
  platform: ApplicationPlatform;
  title: string;
  listing_url: string | null;
  listed_amount_text: string | null;
  actual_amount: number | null;
  applicant_count: number | null;
  client_rating: number | null;
  client_completion_rate: number | null;
  deadline: string | null;
  status: ApplicationStatus;
  proposal_text: string | null;
  memo: string | null;
};

export type ValidationResult =
  | { success: true; data: ApplicationInput }
  | { success: false; errors: Record<string, string> };

const text = (data: FormData, name: string) => String(data.get(name) ?? "").trim();

export function validateApplication(data: FormData): ValidationResult {
  const errors: Record<string, string> = {};
  const platform = text(data, "platform");
  const title = text(data, "title");
  const status = text(data, "status");
  const url = text(data, "listing_url");

  if (!(platform in PLATFORM_LABELS)) errors.platform = "媒体を選択してください。";
  if (!title) errors.title = "タイトルを入力してください。";
  if (!(status in STATUS_LABELS)) errors.status = "状態を選択してください。";
  if (url && !/^https?:\/\/\S+$/i.test(url)) {
    errors.listing_url = "URLは http:// または https:// で始めてください。";
  }

  const numberRules = [
    ["actual_amount", "実額", 0, Infinity, false],
    ["applicant_count", "応募者数", 0, Infinity, true],
    ["client_rating", "評価", 0, 5, false],
    ["client_completion_rate", "完了率", 0, 100, false],
  ] as const;
  const numbers: Record<string, number | null> = {};
  for (const [name, label, min, max, integer] of numberRules) {
    const raw = text(data, name);
    if (!raw) { numbers[name] = null; continue; }
    const value = Number(raw);
    if (!Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) {
      errors[name] = max === Infinity
        ? `${label}は0以上${integer ? "の整数" : "の数値"}で入力してください。`
        : `${label}は${min}〜${max}の数値で入力してください。`;
    } else numbers[name] = value;
  }

  if (Object.keys(errors).length) return { success: false, errors };
  const nullable = (name: string) => text(data, name) || null;
  return { success: true, data: {
    platform: platform as ApplicationPlatform,
    title,
    listing_url: url || null,
    listed_amount_text: nullable("listed_amount_text"),
    actual_amount: numbers.actual_amount ?? null,
    applicant_count: numbers.applicant_count ?? null,
    client_rating: numbers.client_rating ?? null,
    client_completion_rate: numbers.client_completion_rate ?? null,
    deadline: nullable("deadline"),
    status: status as ApplicationStatus,
    proposal_text: nullable("proposal_text"),
    memo: nullable("memo"),
  }};
}

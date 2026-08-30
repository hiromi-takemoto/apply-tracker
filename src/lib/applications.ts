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

export const GENRE_LABELS = {
  site_build: "サイト制作",
  site_maintain: "サイト改修・運用",
  automation: "業務自動化・ツール",
  webapp: "Webアプリ開発",
  integration: "API・外部連携",
  infra: "インフラ・環境",
  data: "データ・分析",
  other: "その他",
} as const;

export const GENRE_MINOR_OPTIONS = {
  site_build: { lp: "LP制作", corporate: "コーポレートサイト", wordpress_build: "WordPress構築", ec_build: "ECサイト構築" },
  site_maintain: { wordpress_fix: "WordPress改修", speed: "表示速度改善", bugfix: "不具合修正", design_fix: "デザイン修正" },
  automation: { scraping: "データ取得・スクレイピング", gas: "GAS・スプレッドシート", routine: "定型作業の自動化", document: "帳票・PDF出力" },
  webapp: { new_app: "新規開発", add_feature: "既存機能の追加", admin: "管理画面", auth: "認証・会員機能" },
  integration: { payment: "決済連携", external_api: "外部API連携", ai: "AI・LLM連携" },
  infra: { server: "サーバー・ドメイン設定", deploy: "デプロイ代行", migration: "移行作業" },
  data: { db: "データベース構築", analytics: "集計・可視化" },
  other: { misc: "その他" },
} as const;

export type ApplicationPlatform = keyof typeof PLATFORM_LABELS;
export type ApplicationStatus = keyof typeof STATUS_LABELS;
export type GenreMajor = keyof typeof GENRE_LABELS;
export type GenreMinor = keyof (typeof GENRE_MINOR_OPTIONS)[GenreMajor];

const amountFormatter = new Intl.NumberFormat("ja-JP");

export function formatYen(value: number | string): string {
  const amount = Number(value);
  return Number.isFinite(amount) ? `${amountFormatter.format(amount)}円` : "";
}

export function genreLabel(major: GenreMajor | null, minor: string | null): string {
  if (!major || !(major in GENRE_LABELS)) return "—";
  const minorLabels = GENRE_MINOR_OPTIONS[major] as Record<string, string>;
  return minor && minor in minorLabels
    ? `${GENRE_LABELS[major]} / ${minorLabels[minor]}`
    : GENRE_LABELS[major];
}

export type ApplicationInput = {
  platform: ApplicationPlatform;
  title: string;
  listing_url: string | null;
  genre_major: GenreMajor | null;
  genre_minor: GenreMinor | null;
  listed_amount_min: number | null;
  listed_amount_max: number | null;
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
  const genreMajor = text(data, "genre_major");
  const genreMinor = text(data, "genre_minor");

  if (!(platform in PLATFORM_LABELS)) errors.platform = "媒体を選択してください。";
  if (!title) errors.title = "タイトルを入力してください。";
  if (!(status in STATUS_LABELS)) errors.status = "状態を選択してください。";
  if (url && !/^https?:\/\/\S+$/i.test(url)) {
    errors.listing_url = "URLは http:// または https:// で始めてください。";
  }
  if (genreMajor && !(genreMajor in GENRE_LABELS)) {
    errors.genre_major = "ジャンルの大区分を選択してください。";
  }
  if (genreMinor && !genreMajor) {
    errors.genre_minor = "小区分を選ぶには大区分が必要です。";
  } else if (genreMinor && genreMajor in GENRE_MINOR_OPTIONS) {
    const options = GENRE_MINOR_OPTIONS[genreMajor as GenreMajor] as Record<string, string>;
    if (!(genreMinor in options)) errors.genre_minor = "大区分に対応する小区分を選択してください。";
  }

  const numberRules = [
    ["listed_amount_min", "一覧金額の下限", 0, Infinity, false],
    ["listed_amount_max", "一覧金額の上限", 0, Infinity, false],
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

  const hasRange = data.get("listed_amount_has_range") === "on";
  if (hasRange && numbers.listed_amount_max != null && numbers.listed_amount_min == null) {
    errors.listed_amount_min = "上限を入力する場合は下限も入力してください。";
  } else if (hasRange && numbers.listed_amount_min != null && numbers.listed_amount_max != null
    && numbers.listed_amount_max < numbers.listed_amount_min) {
    errors.listed_amount_max = "上限は下限以上の金額を入力してください。";
  }

  if (Object.keys(errors).length) return { success: false, errors };
  const nullable = (name: string) => text(data, name) || null;
  return { success: true, data: {
    platform: platform as ApplicationPlatform,
    title,
    listing_url: url || null,
    genre_major: (genreMajor || null) as GenreMajor | null,
    genre_minor: (genreMinor || null) as GenreMinor | null,
    listed_amount_min: numbers.listed_amount_min ?? null,
    listed_amount_max: hasRange ? numbers.listed_amount_max ?? null : null,
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

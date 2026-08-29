"use client";

import Link from "next/link";
import { useActionState } from "react";
import { PLATFORM_LABELS, STATUS_LABELS } from "@/lib/applications";
import type { FormState } from "./actions";
import styles from "./form.module.css";

type Values = Record<string, string | number | null>;
type Action = (state: FormState, data: FormData) => Promise<FormState>;
const initialFormState: FormState = { errors: {} };

export function ApplicationForm({ action, values = {}, submitLabel }: { action: Action; values?: Values; submitLabel: string }) {
  const [state, formAction, pending] = useActionState(action, initialFormState);
  const field = (name: string) => values[name] == null ? "" : String(values[name]);
  const error = (name: string) => state.errors[name] ? <p className={styles.error} id={`${name}-error`}>{state.errors[name]}</p> : null;
  const described = (name: string) => state.errors[name] ? `${name}-error` : undefined;
  return <form action={formAction} className={styles.form} noValidate>
    {state.message && <p className={styles.summary} role="alert">{state.message}</p>}
    <div className={styles.grid}>
      <label>媒体 <span>必須</span><select name="platform" defaultValue={field("platform")} aria-describedby={described("platform")} required><option value="">選択してください</option>{Object.entries(PLATFORM_LABELS).map(([key,label]) => <option key={key} value={key}>{label}</option>)}</select>{error("platform")}</label>
      <label>タイトル <span>必須</span><input name="title" defaultValue={field("title")} aria-describedby={described("title")} required />{error("title")}</label>
      <label className={styles.wide}>募集ページURL<input name="listing_url" type="url" defaultValue={field("listing_url")} aria-describedby={described("listing_url")} placeholder="https://example.com/job" />{error("listing_url")}</label>
      <label>一覧に出ていた金額<input name="listed_amount_text" defaultValue={field("listed_amount_text")} placeholder="10万〜20万円" /></label>
      <label>本文で確認した実額<input name="actual_amount" type="number" min="0" step="any" defaultValue={field("actual_amount")} aria-describedby={described("actual_amount")} />{error("actual_amount")}</label>
      <label>応募者数<input name="applicant_count" type="number" min="0" step="1" defaultValue={field("applicant_count")} aria-describedby={described("applicant_count")} />{error("applicant_count")}</label>
      <label>クライアント評価（0〜5）<input name="client_rating" type="number" min="0" max="5" step="any" defaultValue={field("client_rating")} aria-describedby={described("client_rating")} />{error("client_rating")}</label>
      <label>クライアント完了率（0〜100%）<input name="client_completion_rate" type="number" min="0" max="100" step="any" defaultValue={field("client_completion_rate")} aria-describedby={described("client_completion_rate")} />{error("client_completion_rate")}</label>
      <label>締切<input name="deadline" type="date" defaultValue={field("deadline")} /></label>
      <label>状態 <span>必須</span><select name="status" defaultValue={field("status") || "considering"} aria-describedby={described("status")} required>{Object.entries(STATUS_LABELS).map(([key,label]) => <option key={key} value={key}>{label}</option>)}</select>{error("status")}</label>
      <label className={styles.wide}>提案文<textarea name="proposal_text" rows={6} defaultValue={field("proposal_text")} /></label>
      <label className={styles.wide}>メモ（なぜ落ちたか等）<textarea name="memo" rows={5} defaultValue={field("memo")} /></label>
    </div>
    <div className={styles.actions}><button disabled={pending}>{pending ? "保存中…" : submitLabel}</button><Link href="/applications">取り消す</Link></div>
  </form>;
}

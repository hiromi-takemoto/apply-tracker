"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  formatYen,
  GENRE_LABELS,
  GENRE_MINOR_OPTIONS,
  PLATFORM_LABELS,
  STATUS_LABELS,
  type GenreMajor,
} from "@/lib/applications";
import type { FormState } from "./actions";
import styles from "./form.module.css";

type Values = Record<string, string | number | null>;
type Action = (state: FormState, data: FormData) => Promise<FormState>;
const initialFormState: FormState = { errors: {} };

function AmountReadout({ id, value }: { id: string; value: string }) {
  if (!value || !Number.isFinite(Number(value))) return null;
  return <span className={styles.amountReadout} id={id} aria-live="polite">{formatYen(value)}</span>;
}

export function ApplicationForm({ action, values = {}, submitLabel }: { action: Action; values?: Values; submitLabel: string }) {
  const [state, formAction, pending] = useActionState(action, initialFormState);
  const field = (name: string) => values[name] == null ? "" : String(values[name]);
  const [hasRange, setHasRange] = useState(values.listed_amount_max != null);
  const [listedMin, setListedMin] = useState(field("listed_amount_min"));
  const [listedMax, setListedMax] = useState(field("listed_amount_max"));
  const [actualAmount, setActualAmount] = useState(field("actual_amount"));
  const [genreMajor, setGenreMajor] = useState(field("genre_major"));
  const [genreMinor, setGenreMinor] = useState(field("genre_minor"));
  const error = (name: string) => state.errors[name] ? <p className={styles.error} id={`${name}-error`}>{state.errors[name]}</p> : null;
  const described = (name: string, readout?: string) => [readout, state.errors[name] ? `${name}-error` : ""].filter(Boolean).join(" ") || undefined;
  const minorOptions: Record<string, string> = genreMajor in GENRE_MINOR_OPTIONS
    ? GENRE_MINOR_OPTIONS[genreMajor as GenreMajor]
    : {};

  return <form action={formAction} className={styles.form} noValidate>
    {state.message && <p className={styles.summary} role="alert">{state.message}</p>}
    <div className={styles.grid}>
      <label>媒体 <span>必須</span><select name="platform" defaultValue={field("platform")} aria-describedby={described("platform")} required><option value="">選択してください</option>{Object.entries(PLATFORM_LABELS).map(([key,label]) => <option key={key} value={key}>{label}</option>)}</select>{error("platform")}</label>
      <label>タイトル <span>必須</span><input name="title" defaultValue={field("title")} aria-describedby={described("title")} required />{error("title")}</label>
      <label className={styles.wide}>募集ページURL<input name="listing_url" type="url" defaultValue={field("listing_url")} aria-describedby={described("listing_url")} placeholder="https://example.com/job" />{error("listing_url")}</label>
      <label>ジャンル大区分<select name="genre_major" value={genreMajor} aria-describedby={described("genre_major")} onChange={(event) => { setGenreMajor(event.target.value); setGenreMinor(""); }}><option value="">未選択</option>{Object.entries(GENRE_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>{error("genre_major")}</label>
      <label>ジャンル小区分<select name="genre_minor" value={genreMinor} aria-describedby={described("genre_minor")} onChange={(event) => setGenreMinor(event.target.value)} disabled={!genreMajor}><option value="">未選択</option>{Object.entries(minorOptions).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>{error("genre_minor")}</label>
      <fieldset className={styles.amountFieldset}>
        <legend>一覧に出ていた金額</legend>
        <label className={styles.rangeToggle}><input name="listed_amount_has_range" type="checkbox" checked={hasRange} onChange={(event) => { setHasRange(event.target.checked); if (!event.target.checked) setListedMax(""); }} />幅あり</label>
        <div className={styles.amountInputs}>
          <label>下限<input name="listed_amount_min" type="number" min="0" step="any" value={listedMin} onChange={(event) => setListedMin(event.target.value)} aria-describedby={described("listed_amount_min", "listed_amount_min-readout")} /> <AmountReadout id="listed_amount_min-readout" value={listedMin} />{error("listed_amount_min")}</label>
          {hasRange && <label>上限<input name="listed_amount_max" type="number" min="0" step="any" value={listedMax} onChange={(event) => setListedMax(event.target.value)} aria-describedby={described("listed_amount_max", "listed_amount_max-readout")} /><AmountReadout id="listed_amount_max-readout" value={listedMax} />{error("listed_amount_max")}</label>}
        </div>
      </fieldset>
      <label>本文で確認した実額<input name="actual_amount" type="number" min="0" step="any" value={actualAmount} onChange={(event) => setActualAmount(event.target.value)} aria-describedby={described("actual_amount", "actual_amount-readout")} /><AmountReadout id="actual_amount-readout" value={actualAmount} />{error("actual_amount")}</label>
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

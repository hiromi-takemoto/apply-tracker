"use client";

import { useState, useTransition } from "react";
import { PLATFORM_LABELS, STATUS_LABELS, type ApplicationPlatform, type ApplicationStatus } from "@/lib/applications";
import { deleteApplication } from "./actions";
import styles from "./applications.module.css";

export function DeleteControl({ item }: { item: { id: string; platform: ApplicationPlatform; title: string; deadline: string | null; status: ApplicationStatus } }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  if (!open) return <button className={styles.deleteButton} type="button" onClick={() => setOpen(true)}>削除</button>;
  return <div className={styles.confirm} role="group" aria-label={`${item.title}の削除確認`}>
    <p><strong>この案件を削除しますか？</strong></p>
    <dl><div><dt>媒体</dt><dd>{PLATFORM_LABELS[item.platform]}</dd></div><div><dt>タイトル</dt><dd>{item.title}</dd></div><div><dt>締切</dt><dd>{item.deadline || "未設定"}</dd></div><div><dt>状態</dt><dd>{STATUS_LABELS[item.status]}</dd></div></dl>
    <div><button type="button" className={styles.dangerButton} disabled={pending} onClick={() => startTransition(() => deleteApplication(item.id))}>{pending ? "削除中…" : "削除する"}</button><button type="button" className={styles.cancelButton} disabled={pending} onClick={() => setOpen(false)}>取り消す</button></div>
  </div>;
}

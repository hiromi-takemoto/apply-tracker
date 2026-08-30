import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PLATFORM_LABELS, type ApplicationPlatform } from "@/lib/applications";
import styles from "@/app/dashboard.module.css";

const ACTION_LABELS: Record<string, string> = { create: "作成", update: "更新", delete: "削除" };
type Details = { title?: unknown; platform?: unknown; changed_fields?: unknown };

export default async function ApplicationHistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data, error } = await supabase.from("audit_logs")
    .select("id, action, details, created_at")
    .eq("target_table", "applications")
    .order("created_at", { ascending: false });

  return <main className={styles.page}><section className={styles.panel}>
    <header className={styles.heading}><div><h1>操作履歴</h1><p>案件に対する自分の操作を新しい順に表示します。</p></div><Link className={styles.back} href="/applications">案件一覧へ戻る</Link></header>
    {error && <p className={styles.error} role="alert">操作履歴を読み込めませんでした。時間をおいて再度お試しください。</p>}
    {!error && data?.length === 0 && <div className={styles.empty}><p><strong>操作履歴はまだありません。</strong></p><p>案件を作成・更新・削除すると、ここに記録されます。</p></div>}
    {!error && data && data.length > 0 && <div className={styles.tableScroll} tabIndex={0} role="region" aria-label="操作履歴（横にスクロールできます）"><table><thead><tr><th>日時</th><th>操作</th><th>対象</th><th>変わった項目</th></tr></thead><tbody>{data.map((log) => {
      const details = (log.details ?? {}) as Details;
      const platform = typeof details.platform === "string" && details.platform in PLATFORM_LABELS ? PLATFORM_LABELS[details.platform as ApplicationPlatform] : null;
      const fields = Array.isArray(details.changed_fields) && details.changed_fields.every((value) => typeof value === "string") ? details.changed_fields.join("、") : "—";
      return <tr key={log.id}><td>{new Intl.DateTimeFormat("ja-JP", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Tokyo" }).format(new Date(log.created_at))}</td><td>{ACTION_LABELS[log.action] ?? log.action}</td><td>{typeof details.title === "string" ? details.title : "—"}{platform && <>（{platform}）</>}</td><td>{fields || "—"}</td></tr>;
    })}</tbody></table></div>}
  </section></main>;
}

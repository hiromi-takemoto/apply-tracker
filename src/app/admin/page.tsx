import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { STATUS_LABELS, type ApplicationStatus } from "@/lib/applications";
import styles from "@/app/dashboard.module.css";

type Statistics = { user_count: number; application_count: number; status_counts: Partial<Record<ApplicationStatus, number>> };

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") redirect("/applications");
  const { data, error } = await supabase.rpc("get_admin_statistics");
  const stats = data as Statistics | null;

  return <main className={styles.page}><section className={styles.panel}>
    <header className={styles.heading}><div><h1>管理者画面</h1><p>サービス全体の集計値だけを表示します。</p></div><Link className={styles.back} href="/applications">案件一覧へ戻る</Link></header>
    {(error || !stats) && <p className={styles.error} role="alert">集計値を読み込めませんでした。migrationと権限設定をご確認ください。</p>}
    {stats && !error && <><dl className={styles.cards}><div className={styles.card}><dt>利用者数</dt><dd>{stats.user_count}人</dd></div><div className={styles.card}><dt>案件の総数</dt><dd>{stats.application_count}件</dd></div></dl><h2 className={styles.statusHeading}>状態ごとの件数</h2><div className={styles.tableScroll}><table><thead><tr><th>状態</th><th>件数</th></tr></thead><tbody>{Object.entries(STATUS_LABELS).map(([status, label]) => <tr key={status}><td>{label}</td><td>{stats.status_counts[status as ApplicationStatus] ?? 0}件</td></tr>)}</tbody></table></div></>}
  </section></main>;
}

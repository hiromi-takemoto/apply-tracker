import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  formatYen,
  genreLabel,
  PLATFORM_LABELS,
  STATUS_LABELS,
  type ApplicationPlatform,
  type ApplicationStatus,
  type GenreMajor,
} from "@/lib/applications";
import { logout } from "./actions";
import { DeleteControl } from "./delete-control";
import styles from "./applications.module.css";

type Row = {
  id: string;
  platform: ApplicationPlatform;
  title: string;
  genre_major: GenreMajor | null;
  genre_minor: string | null;
  listed_amount_min: number | null;
  listed_amount_max: number | null;
  actual_amount: number | null;
  status: ApplicationStatus;
  deadline: string | null;
};

function listedAmount(row: Row) {
  if (row.listed_amount_min == null) return "—";
  return row.listed_amount_max == null
    ? formatYen(row.listed_amount_min)
    : `${formatYen(row.listed_amount_min)} 〜 ${formatYen(row.listed_amount_max)}`;
}

export default async function ApplicationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data, error } = await supabase
    .from("applications")
    .select("id, platform, title, genre_major, genre_minor, listed_amount_min, listed_amount_max, actual_amount, status, deadline")
    .order("created_at", { ascending: false });
  const applications = (data ?? []) as Row[];

  return <main className={styles.page}><section className={styles.panel}>
    <header className={styles.header}><div><h1>案件一覧</h1><p>ログイン中: <strong>{user.email}</strong></p></div><div className={styles.headerActions}><Link className={styles.primaryLink} href="/applications/new">新規登録</Link><form action={logout}><button className={styles.logout} type="submit">ログアウト</button></form></div></header>
    {error && <p className={styles.loadError} role="alert">案件を読み込めませんでした。時間をおいて再度お試しください。</p>}
    {!error && applications.length === 0 && <div className={styles.empty}><p><strong>まだ案件がありません。</strong></p><p>右上の「新規登録」から追加してください。</p></div>}
    {applications.length > 0 && <div className={styles.tableScroll} tabIndex={0} role="region" aria-label="案件一覧（横にスクロールできます）"><table><thead><tr><th>媒体</th><th>タイトル</th><th>ジャンル</th><th>一覧金額</th><th>実額</th><th>状態</th><th>締切</th><th>操作</th></tr></thead><tbody>{applications.map((item) => <tr key={item.id}><td>{PLATFORM_LABELS[item.platform]}</td><td>{item.title}</td><td>{genreLabel(item.genre_major, item.genre_minor)}</td><td>{listedAmount(item)}</td><td>{item.actual_amount == null ? "—" : formatYen(item.actual_amount)}</td><td>{STATUS_LABELS[item.status]}</td><td>{item.deadline || "—"}</td><td className={styles.operations}><Link href={`/applications/${item.id}/edit`}>編集</Link><DeleteControl item={item} /></td></tr>)}</tbody></table></div>}
  </section></main>;
}

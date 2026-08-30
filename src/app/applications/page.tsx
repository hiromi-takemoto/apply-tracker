import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatYen, genreParts, GENRE_LABELS, PLATFORM_LABELS, STATUS_LABELS, type ApplicationPlatform, type ApplicationStatus, type GenreMajor } from "@/lib/applications";
import { applyApplicationFilters, applicationFiltersQuery, parseApplicationFilters, type FilterSearchParams } from "@/lib/application-filters";
import { filterApplications, logout } from "./actions";
import { DeleteControl } from "./delete-control";
import styles from "./applications.module.css";

type Row = { id: string; platform: ApplicationPlatform; title: string; genre_major: GenreMajor | null; genre_minor: string | null; listed_amount_min: number | null; listed_amount_max: number | null; actual_amount: number | null; status: ApplicationStatus; deadline: string | null };

function genreCell(item: Row) {
  const { major, minor } = genreParts(item.genre_major, item.genre_minor);
  if (!major) return "—";
  return (
    <>
      <span className={styles.genreMajor}>{major}</span>
      {minor && <span className={styles.genreMinor}>{minor}</span>}
    </>
  );
}

function listedAmount(row: Row) {
  if (row.listed_amount_min == null) return "—";
  return row.listed_amount_max == null ? formatYen(row.listed_amount_min) : `${formatYen(row.listed_amount_min)} 〜 ${formatYen(row.listed_amount_max)}`;
}

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<FilterSearchParams> }) {
  const filters = parseApplicationFilters(await searchParams);
  const hasFilters = Object.keys(filters).length > 0;
  const filterQuery = applicationFiltersQuery(filters);
  const csvHref = `/applications/export${filterQuery ? `?${filterQuery}` : ""}`;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const applicationsQuery = supabase.from("applications").select("id, platform, title, genre_major, genre_minor, listed_amount_min, listed_amount_max, actual_amount, status, deadline").order("created_at", { ascending: false });
  const [{ data, error }, { count: totalCount, error: countError }, { data: profile }] = await Promise.all([
    applyApplicationFilters(applicationsQuery, filters),
    supabase.from("applications").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
  ]);
  const applications = (data ?? []) as Row[];
  const total = totalCount ?? 0;
  const loadError = error || countError;

  return <main className={styles.page}><section className={styles.panel}>
    <header className={styles.header}><div><h1>案件一覧</h1><p>ログイン中: <strong>{user.email}</strong></p></div><div className={styles.headerActions}><Link href="/applications/history">操作履歴</Link>{profile?.role === "admin" && <Link href="/admin">管理者画面</Link>}<Link className={styles.primaryLink} href="/applications/new">新規登録</Link><form action={logout}><button className={styles.logout} type="submit">ログアウト</button></form></div></header>
    <div className={styles.toolbar}>
      <form className={styles.filters} action={filterApplications}>
        <label>状態<select name="status" defaultValue={filters.status ?? ""}><option value="">すべて</option>{Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>媒体<select name="platform" defaultValue={filters.platform ?? ""}><option value="">すべて</option>{Object.entries(PLATFORM_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>ジャンル大区分<select name="genre" defaultValue={filters.genre ?? ""}><option value="">すべて</option>{Object.entries(GENRE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <button type="submit">絞り込む</button>
      </form>
      <div className={styles.filterActions}><Link href="/applications">絞り込みを解除</Link><a className={styles.csvLink} href={csvHref}>CSV出力</a></div>
    </div>
    {!loadError && <p className={styles.count} aria-live="polite">{applications.length}件 / 全{total}件</p>}
    {loadError && <p className={styles.loadError} role="alert">案件を読み込めませんでした。時間をおいて再度お試しください。</p>}
    {!loadError && applications.length === 0 && (hasFilters ? <div className={styles.empty}><p><strong>条件に一致する案件はありません。</strong></p><p><Link href="/applications">絞り込みを解除して全件を見る</Link></p></div> : <div className={styles.empty}><p><strong>まだ案件がありません。</strong></p><p>「新規登録」から追加してください。</p></div>)}
    {!loadError && applications.length > 0 && <div className={styles.tableScroll} tabIndex={0} role="region" aria-label="案件一覧（横にスクロールできます）"><table><thead><tr><th>媒体</th><th>タイトル</th><th>ジャンル</th><th>一覧金額</th><th>実額</th><th>状態</th><th>締切</th><th>操作</th></tr></thead><tbody>{applications.map((item) => <tr key={item.id}><td>{PLATFORM_LABELS[item.platform]}</td><td>{item.title}</td><td>{genreCell(item)}</td><td>{listedAmount(item)}</td><td>{item.actual_amount == null ? "—" : formatYen(item.actual_amount)}</td><td>{STATUS_LABELS[item.status]}</td><td>{item.deadline || "—"}</td><td className={styles.operations}><Link href={`/applications/${item.id}/edit`}>編集</Link><DeleteControl item={item} /></td></tr>)}</tbody></table></div>}
  </section></main>;
}

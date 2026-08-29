import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "./actions";
import styles from "./applications.module.css";

export default async function ApplicationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1>案件一覧</h1>
        <p>ログイン中: <strong>{user.email}</strong></p>
        <form action={logout}><button type="submit">ログアウト</button></form>
      </section>
    </main>
  );
}

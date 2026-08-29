import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ApplicationForm } from "../application-form";
import { createApplication } from "../actions";
import styles from "../applications.module.css";

export default async function NewApplicationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return <main className={styles.page}><section className={styles.panel}><h1>案件を新規登録</h1><p className={styles.help}>必須項目は媒体・タイトル・状態の3つです。</p><ApplicationForm action={createApplication} submitLabel="登録する" /></section></main>;
}

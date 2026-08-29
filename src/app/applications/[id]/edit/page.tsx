import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ApplicationForm } from "../../application-form";
import { updateApplication } from "../../actions";
import styles from "../../applications.module.css";

export default async function EditApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data } = await supabase.from("applications").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const action = updateApplication.bind(null, id);
  return <main className={styles.page}><section className={styles.panel}><h1>案件を編集</h1><p className={styles.help}>必須項目は媒体・タイトル・状態の3つです。</p><ApplicationForm action={action} values={data} submitLabel="変更を保存" /></section></main>;
}

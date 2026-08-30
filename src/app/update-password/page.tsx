import Link from "next/link";
import { UpdatePasswordForm } from "./update-password-form";
import styles from "../password-pages.module.css";

export default function UpdatePasswordPage() {
  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="update-password-heading">
        <h1 id="update-password-heading">新しいパスワードを設定</h1>
        <p className={styles.help}>確認のため、新しいパスワードを2回入力してください。</p>
        <UpdatePasswordForm />
        <Link className={styles.backLink} href="/reset-password">再設定メールを送り直す</Link>
      </section>
    </main>
  );
}

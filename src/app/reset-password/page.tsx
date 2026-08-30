import Link from "next/link";
import { ResetPasswordForm } from "./reset-password-form";
import styles from "../password-pages.module.css";

export default function ResetPasswordPage() {
  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="reset-password-heading">
        <h1 id="reset-password-heading">パスワード再設定</h1>
        <p className={styles.help}>登録に使用したメールアドレスを入力してください。</p>
        <ResetPasswordForm />
        <Link className={styles.backLink} href="/login">ログイン画面へ戻る</Link>
      </section>
    </main>
  );
}

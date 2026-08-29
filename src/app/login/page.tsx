import { AuthForm } from "./auth-form";
import styles from "./login.module.css";

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <h1>ApplyTracker</h1>
        <p className={styles.lead}>案件応募を安全に記録します。</p>
        <AuthForm />
      </div>
    </main>
  );
}

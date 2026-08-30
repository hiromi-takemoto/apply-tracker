import { AuthForm } from "./auth-form";
import styles from "./login.module.css";

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <AuthForm />
      </div>
    </main>
  );
}

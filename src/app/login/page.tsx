import { AuthForm } from "./auth-form";
import styles from "./login.module.css";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ passwordUpdated?: string }> }) {
  const passwordUpdated = (await searchParams).passwordUpdated === "1";
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <AuthForm passwordUpdated={passwordUpdated} />
      </div>
    </main>
  );
}

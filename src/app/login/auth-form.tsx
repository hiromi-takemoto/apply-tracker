"use client";

import { useActionState } from "react";
import { login, signup, type AuthState } from "./actions";
import styles from "./login.module.css";

const initialState: AuthState = null;

function SubmitButton({ label, pending }: { label: string; pending: boolean }) {
  return <button disabled={pending}>{pending ? "処理中…" : label}</button>;
}

export function AuthForm() {
  const [loginState, loginAction, loginPending] = useActionState(login, initialState);
  const [signupState, signupAction, signupPending] = useActionState(signup, initialState);

  return (
    <div className={styles.forms}>
      <section aria-labelledby="login-heading">
        <h2 id="login-heading">ログイン</h2>
        <form action={loginAction}>
          <label htmlFor="login-email">メールアドレス</label>
          <input id="login-email" name="email" type="email" autoComplete="email" required />
          <label htmlFor="login-password">パスワード</label>
          <input id="login-password" name="password" type="password" autoComplete="current-password" required />
          <SubmitButton label="ログイン" pending={loginPending} />
          <Message state={loginState} />
        </form>
      </section>
      <section aria-labelledby="signup-heading">
        <h2 id="signup-heading">新規登録</h2>
        <form action={signupAction}>
          <label htmlFor="signup-email">メールアドレス</label>
          <input id="signup-email" name="email" type="email" autoComplete="email" required />
          <label htmlFor="signup-password">パスワード（6文字以上）</label>
          <input id="signup-password" name="password" type="password" autoComplete="new-password" minLength={6} required />
          <SubmitButton label="登録する" pending={signupPending} />
          <Message state={signupState} />
        </form>
      </section>
    </div>
  );
}

function Message({ state }: { state: AuthState }) {
  if (!state) return null;
  return <p className={state.kind === "error" ? styles.error : styles.success} role={state.kind === "error" ? "alert" : "status"}>{state.message}</p>;
}

"use client";

import { useActionState } from "react";
import { sendPasswordResetEmail, type ResetPasswordState } from "./actions";
import styles from "../password-pages.module.css";

const initialState: ResetPasswordState = null;

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(sendPasswordResetEmail, initialState);

  return (
    <form action={action} className={styles.form}>
      <label htmlFor="reset-email">メールアドレス</label>
      <input id="reset-email" name="email" type="email" autoComplete="email" required />
      <button type="submit" disabled={pending}>
        {pending ? "送信中…" : "再設定メールを送る"}
      </button>
      {state && <p className={styles.success} role="status">{state.message}</p>}
    </form>
  );
}

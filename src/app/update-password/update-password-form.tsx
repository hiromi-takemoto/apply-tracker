"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "../password-pages.module.css";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    async function prepareSession() {
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setError("再設定リンクが無効か、期限が切れています。再設定メールを送り直してください。");
          return;
        }
      }
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setError("再設定リンクが無効か、期限が切れています。再設定メールを送り直してください。");
        return;
      }
      setReady(true);
    }
    void prepareSession();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmation = String(formData.get("passwordConfirmation") ?? "");
    if (password.length < 6) {
      setError("パスワードは6文字以上で入力してください。");
      return;
    }
    if (password !== confirmation) {
      setError("パスワードと確認用パスワードが一致しません。");
      return;
    }
    setPending(true);
    const { error: updateError } = await createClient().auth.updateUser({ password });
    if (updateError) {
      console.error("Password update failed", updateError);
      setError("パスワードを更新できませんでした。再設定メールを送り直してお試しください。");
      setPending(false);
      return;
    }
    await createClient().auth.signOut();
    router.replace("/login?passwordUpdated=1");
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <label htmlFor="new-password">新しいパスワード（6文字以上）</label>
      <input id="new-password" name="password" type="password" autoComplete="new-password" minLength={6} required disabled={!ready || pending} />
      <label htmlFor="password-confirmation">新しいパスワード（確認用）</label>
      <input id="password-confirmation" name="passwordConfirmation" type="password" autoComplete="new-password" minLength={6} required disabled={!ready || pending} />
      <button type="submit" disabled={!ready || pending}>{pending ? "更新中…" : "パスワードを更新する"}</button>
      {!ready && !error && <p className={styles.help} role="status">再設定リンクを確認しています…</p>}
      {error && <p className={styles.error} role="alert">{error}</p>}
    </form>
  );
}

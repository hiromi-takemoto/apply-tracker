# ApplyTracker

クラウドソーシング案件への応募状況を記録する Next.js + Supabase アプリです。現在は1周目の前半で、DB設計と接続用の雛形まで実装しています。

## 1. ソースコードと動作環境

- Next.js（App Router）/ TypeScript / React
- PostgreSQL（Supabase）/ Supabase Auth
- Node.js 20以上、npm 10以上を推奨

リポジトリを取得し、プロジェクト直下で次を実行します。

```bash
npm install
copy .env.example .env.local
npm run dev
```

macOS / Linux では2行目を `cp .env.example .env.local` にしてください。ブラウザで `http://localhost:3000` を開きます。現時点のトップページは Next.js の初期画面です。

## 2. Supabaseの準備とmigration

Supabaseアカウントとプロジェクトを作成した後、プロジェクトの Settings > API で確認した値を `.env.local` に設定します。

```dotenv
NEXT_PUBLIC_SUPABASE_URL=プロジェクトURL
NEXT_PUBLIC_SUPABASE_ANON_KEY=公開用anonキー
SUPABASE_SERVICE_ROLE_KEY=サーバー専用service_roleキー
```

`SUPABASE_SERVICE_ROLE_KEY` はブラウザ用コードへ渡さず、Gitにもコミットしないでください。Supabase CLI を導入・ログイン後、プロジェクトをリンクしてmigrationを適用します。

```bash
npx supabase link --project-ref <PROJECT_REF>
npx supabase db push
```

DB定義は `supabase/migrations/202608290001_initial_schema.sql`、ER図は `docs/ER.md` にあります。初期データやダミーデータはありません。

## 3. 操作方法

画面、ユーザー登録、ログイン、ログアウト、パスワード再設定、案件CRUD、絞り込み、CSV出力、管理者画面はすべて未実装です。Supabaseクライアントは `src/lib/supabase/client.ts`（ブラウザ用）と `src/lib/supabase/server.ts`（サーバー用）に用意しています。

## 4. 障害復旧

- 環境変数エラー: `.env.local` の3項目を確認し、開発サーバーを再起動します。
- 依存関係エラー: `node_modules` を削除して `npm install` を再実行します。
- DB定義の不一致: Supabase CLI の接続先を確認して `npx supabase db push` を再実行します。本番DBを手作業で変更せず、migrationを追加してください。
- 秘密値を誤って公開した場合: Git履歴から除くだけでなく、Supabase側で直ちにキーを再発行してください。

## 5. 既知の制約・未納品項目

- Supabase未接続のため、migrationのリモート適用とRLSの実動作テストは未実施です。
- 本番URL、デモアカウント、初期データ、受入テスト表、自動テスト、CI、引き渡し手順、ライセンス一覧、検収チェックリストは未実装です。
- Vercelへの公開は未実施です。
- スクレイピング、統計、AI生成、チーム共有、通知、PWA、決済、ダークモード、画像、多言語対応は仕様上の対象外です。

## コマンド

```bash
npm run dev
npm run lint
npm run build
npm start
```

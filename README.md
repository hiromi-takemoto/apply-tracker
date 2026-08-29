# ApplyTracker

クラウドソーシング案件への応募状況を記録する Next.js + Supabase アプリです。現在は登録、ログイン、ログアウト、セッション保護とRLS統合テストまで実装しています。

## 必要な環境

- Node.js 20以上、npm 10以上
- Supabaseプロジェクト

## セットアップ

リポジトリを取得したら、プロジェクト直下で依存関係をインストールします。

```bash
npm install
copy .env.example .env.local
```

macOS / Linuxでは2行目を `cp .env.example .env.local` にしてください。

### 1. migrationを適用する

Supabaseでプロジェクトを作成し、ダッシュボードの **SQL Editor** を開きます。`supabase/migrations/` 内のSQLファイルをファイル名順に開き、内容をSQL Editorへ貼り付けて **Run** を押します。現在は次の1ファイルです。

```text
supabase/migrations/202608290001_initial_schema.sql
```

SQLが正常終了したことと、Table Editorに `profiles`、`applications`、`audit_logs` が作成されたことを確認してください。同じmigrationを同じDBへ二度実行すると型やテーブルの重複エラーになるため、一度だけ実行します。

### 2. 環境変数を設定する

Supabaseダッシュボードの **Project Settings > API**（表示名が異なる場合はConnect画面）で値を確認し、`.env.local` に設定します。

```dotenv
NEXT_PUBLIC_SUPABASE_URL=プロジェクトURL
NEXT_PUBLIC_SUPABASE_ANON_KEY=公開用anonキー
SUPABASE_SERVICE_ROLE_KEY=サーバー専用service_roleキー
```

`SUPABASE_SERVICE_ROLE_KEY` はRLS統合テストのユーザー作成と後片付けだけに使います。ブラウザへ渡したり、Gitへコミットしたりしないでください。`.env.local` はGit管理対象外です。

### 3. 起動する

```bash
npm run dev
```

ブラウザで `http://localhost:3000/login` を開きます。新規登録後、SupabaseのAuth設定でメール確認が有効なら、届いた確認メールのリンクを開いてからログインします。ログイン後は `/applications` に移動し、メールアドレスとログアウトボタンが表示されます。

## テスト

```bash
npm test
```

RLS統合テストは、確認済みのユーザーA/Bを一時作成し、Aの案件をBが参照・更新・削除できないことと、A自身は参照できることを検証します。終了時は成功・失敗を問わず、作成した行とユーザーを削除します。必要な環境変数が未設定なら、テスト結果には失敗ではなくスキップと表示されます。

品質チェックは次のコマンドで実行します。

```bash
npm run lint
npm run build
```

## 障害復旧

- 環境変数エラー: `.env.local` の3項目を確認し、開発サーバーを再起動します。
- DBエラー: migrationが対象プロジェクトに適用済みか確認します。既存DBを直接変更せず、新しいmigrationを追加してください。
- 認証エラー: SupabaseダッシュボードのAuthentication設定とユーザー一覧を確認します。
- 秘密値を公開した場合: Git履歴から除くだけでなく、Supabase側で直ちにキーを再発行してください。

## 現在の制約

案件CRUD画面、パスワード再設定、管理者画面、Playwright E2E、CI、Vercel公開は今後の周で実装します。スクレイピング、統計、AI生成、チーム共有、通知、PWA、決済、ダークモード、画像、多言語対応は仕様上の対象外です。

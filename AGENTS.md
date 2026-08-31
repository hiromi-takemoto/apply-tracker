<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# このリポジトリの決めごと（検品指摘の再発防止・2026-08-31）

文脈を渡さない別セッションのAIに発注者役をさせた検品で出た指摘。**直すまで残す。**

## 書類

- **実装したのと同じAIを「第三者」と書かない。** `SPEC.md` の分担表に「Codex=実装」と
  書いてある以上、`README.md` の「第三者（Codex）による検品報告」は矛盾して見える。
  「文脈を渡さない別セッションのAIに発注者役をさせた」と、やった通りに書く。
- **README.md は100行以内。** 現状511行。周回ごとの検証記録は `DEVLOG.md` へ移す。
  READMEに残すのは 課題／画面／担当範囲／設計判断／デモ導線／テスト導線 だけ。
- **LICENSE ファイルを置く。** `docs/ライセンス.md` はあるが、リポジトリ本体に license が無い。
- ライセンスは**間接依存まで**見る（LGPL 2件の見落としが実際にあった）。

## 実装

- **一覧は件数の上限を決める。** `src/app/applications/page.tsx` の取得に `.limit()` が無く
  全件取得になっている。ページネーションを入れる。
- **画面幅は実データを描画して測る。** `applications.module.css` の
  `.panel { width: min(1120px, 100%) }`（内側1064px）に対し、実データの table は1142px。
  **画面をどれだけ広げても「操作」列が82px見切れる。** `min-width` の想定値を信じない。
  直したら `scrollWidth - clientWidth` が 0 になることを実測で確かめる。

## 検証

- **売りにしている機能の主要経路を未検証で出さない。** 「ログイン付き」を売る作品なのに
  `docs/受入テスト表.md` で 登録＋確認メール／パスワード更新完了 が**未実施**のまま。
  捨てアドレスを使って自分で完走し、未実施を消す。
- 直したら**測り直す。** 1つ直すと別が壊れる（折り返しを止めたら削除ボタンが見切れた前例あり）。

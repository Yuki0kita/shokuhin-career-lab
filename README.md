# 食品キャリアラボ

食品工場・食品メーカーで働く人のためのキャリアアップ特化メディア。
売却（ラッコM&A等）を前提とした資産型サイトとして運営する。

- 本番URL: https://shokuhin-career-lab.pages.dev/
- 技術: Eleventy（静的サイト） + Cloudflare Pages（`npm run deploy` で手動デプロイ）

## コンセプト（2026-07 に製造業全般から食品特化へ絞り込み）

ラッコM&Aの売却案件分析で「ニッチ特化×一次情報×CV重視」が高評価だったことに基づく。
「現役の食品メーカー社員が書く食品業界キャリアメディア」は競合がほぼおらず、一次情報の優位が最大化される。
夜勤・交替勤務の悩み記事を集客の柱とし、CVは転職サービス記事（tenshoku-agent-erabikata）に集約する。

## 開発

```bash
npm install
npm run dev    # http://localhost:8644/ でプレビュー
npm run build  # _site/ に出力
```

デプロイは `npm run deploy`（ビルド→Cloudflare Pagesへアップロード）。GitHubはソース管理用で、pushしてもデプロイはされない。
注: wrangler 3系はNode 18制約による選択。Node 20+に上げたら `wrangler@4` へ更新すること（npm auditの指摘も解消される）。

## 記事の追加方法

`src/articles/` にMarkdownファイルを1つ追加するだけ。

```markdown
---
layout: layouts/article.njk
title: 記事タイトル
description: 検索結果・OGP・記事一覧に使われる説明文（100〜120字）
date: 2026-07-07
---

本文（Markdown）
```

## 収益化・売却に向けた残タスク

1. **独自ドメイン取得（来週予定）** — 取得後: Cloudflareダッシュボードでカスタムドメイン設定 → `src/_data/site.js` の url と `src/robots.txt` を差し替え → ついでにGit連携を設定すると自動デプロイに戻せる（推奨）

2. **GA4導入**（売却時のPV・収益エビデンスに必須）
   - GA4プロパティを作成し、`src/_includes/layouts/base.njk` の TODO 箇所に gtag スニペットを挿入
3. **Google Search Console 登録**とsitemap.xml送信
4. **ASP提携**（A8.net・アクセストレード等で転職案件に提携申請）
   - 承認後、`src/articles/tenshoku-agent-erabikata.md` の TODO 箇所にアフィリエイトリンクを挿入
5. **お問い合わせ用Googleフォーム作成** — 作成後、URLを `src/_data/site.js` の `contactFormUrl` に貼る（空の間はお問い合わせページに準備中の案内が表示される）
6. **記事の継続追加**（食品工場の年収、HACCP・食品衛生管理者などの資格、品質管理のQC検定、食品工場の人間関係、第二新卒×食品メーカーなどが次の候補）

## 編集ポリシー

- 一次情報（運営者の実体験）を必ず含める。AI量産と見なされる一般論だけの記事は追加しない
- 運営者の勤務先企業名・個人を特定できる情報は書かない
- 職務経歴書・社内資料由来の具体数値はそのまま書かず、幅を持たせてぼかす
- 年収等の数値は「実感値・目安」であることを明記する

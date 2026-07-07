# 製造キャリアラボ

工場勤務・製造業社員のためのキャリアアップ特化メディア。
売却（ラッコM&A等）を前提とした資産型サイトとして運営する。

- 本番URL: https://yuki0kita.github.io/seizo-career-lab/
- 技術: Eleventy（静的サイト） + GitHub Pages（GitHub Actionsで自動デプロイ）

## 開発

```bash
npm install
npm run dev    # http://localhost:8643 でプレビュー
npm run build  # _site/ に出力
```

`main` にpushすると GitHub Actions が自動でビルド・デプロイする。

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

1. **独自ドメイン取得**（最優先。売却するにはドメインごと譲渡できることが必須）
   - ラッコドメイン等で取得 → GitHub Pages のカスタムドメインに設定
   - `src/_data/site.js` の `url`、`src/robots.txt` のSitemap URL、`eleventy.config.js` の `pathPrefix`（`"/"` に変更）を更新
2. **GA4導入**（売却時のPV・収益エビデンスに必須）
   - GA4プロパティを作成し、`src/_includes/layouts/base.njk` の TODO 箇所に gtag スニペットを挿入
3. **Google Search Console 登録**とsitemap.xml送信
4. **ASP提携**（A8.net・アクセストレード等で転職案件に提携申請）
   - 承認後、`src/articles/tenshoku-agent-erabikata.md` の TODO 箇所にアフィリエイトリンクを挿入
5. **記事の継続追加**（設備保全・QC検定・生産管理・第二新卒×製造業などが次の候補）

## 編集ポリシー

- 一次情報（運営者の実体験）を必ず含める。AI量産と見なされる一般論だけの記事は追加しない
- 運営者の勤務先企業名・個人を特定できる情報は書かない
- 年収等の数値は「実感値・目安」であることを明記する

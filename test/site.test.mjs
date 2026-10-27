// ビルド済みの _site を検査する。`npm test` でビルドしてから実行される
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const SITE = "_site";
const ORIGIN = "https://shokuhin-career.com";

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const htmlFiles = walk(SITE).filter((p) => p.endsWith(".html"));
const pages = htmlFiles.map((file) => ({
  file,
  url: "/" + relative(SITE, file).replace(/index\.html$/, ""),
  html: readFileSync(file, "utf8"),
}));
const indexable = pages.filter((p) => !/name="robots" content="noindex"/.test(p.html));
const articles = pages.filter((p) => p.url.startsWith("/articles/"));

const meta = (html, attr, key) =>
  html.match(new RegExp(`<meta ${attr}="${key}" content="([^"]*)"`))?.[1];

const resolves = (path) => {
  const clean = decodeURI(path.split(/[?#]/)[0]);
  const target = join(SITE, clean);
  return (
    existsSync(target) && statSync(target).isFile()
  ) || existsSync(join(target, "index.html"));
};

test("内部リンク・画像・CSSの参照先がすべて存在する", () => {
  const broken = [];
  for (const p of pages) {
    for (const [, ref] of p.html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
      if (!resolves(ref)) broken.push(`${p.url} -> ${ref}`);
    }
  }
  assert.deepEqual(broken, []);
});

test("ページ内アンカー（目次）のリンク先idが存在する", () => {
  const broken = [];
  for (const p of pages) {
    for (const [, id] of p.html.matchAll(/href="#([^"]+)"/g)) {
      if (!p.html.includes(`id="${id}"`)) broken.push(`${p.url}#${id}`);
    }
  }
  assert.deepEqual(broken, []);
});

test("インデックス対象ページに title・description・canonical・OGPがある", () => {
  const missing = [];
  for (const p of indexable) {
    const title = p.html.match(/<title>([^<]+)<\/title>/)?.[1]?.trim();
    const checks = {
      title,
      description: meta(p.html, "name", "description"),
      canonical: p.html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] === ORIGIN + p.url,
      "og:title": meta(p.html, "property", "og:title"),
      "og:description": meta(p.html, "property", "og:description"),
      "og:url": meta(p.html, "property", "og:url") === ORIGIN + p.url,
      "og:image": meta(p.html, "property", "og:image")?.startsWith(ORIGIN),
    };
    for (const [k, v] of Object.entries(checks)) if (!v) missing.push(`${p.url}: ${k}`);
  }
  assert.deepEqual(missing, []);
});

test("title と description がページ間で重複しない", () => {
  for (const key of ["title", "description"]) {
    const seen = new Map();
    for (const p of indexable) {
      const v =
        key === "title"
          ? p.html.match(/<title>([^<]+)<\/title>/)[1]
          : meta(p.html, "name", "description");
      assert.ok(!seen.has(v), `${key} 重複: ${seen.get(v)} と ${p.url}`);
      seen.set(v, p.url);
    }
  }
});

test("記事に Article と BreadcrumbList の構造化データがある", () => {
  assert.ok(articles.length > 0);
  for (const p of articles) {
    const blocks = [...p.html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      .map((m) => JSON.parse(m[1]));
    const article = blocks.find((b) => b["@type"] === "Article");
    const crumbs = blocks.find((b) => b["@type"] === "BreadcrumbList");
    assert.ok(article, `${p.url}: Article なし`);
    for (const k of ["headline", "description", "datePublished", "dateModified", "image", "author", "publisher"]) {
      assert.ok(article[k], `${p.url}: Article.${k} なし`);
    }
    assert.ok(crumbs?.itemListElement?.length >= 2, `${p.url}: BreadcrumbList なし`);
    assert.equal(crumbs.itemListElement.at(-1).item, ORIGIN + p.url);
  }
});

test("sitemap.xml がインデックス対象ページをすべて含み、余計なURLを含まない", () => {
  const xml = readFileSync(join(SITE, "sitemap.xml"), "utf8");
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).sort();
  assert.deepEqual(locs, indexable.map((p) => ORIGIN + p.url).sort());
  assert.match(readFileSync(join(SITE, "robots.txt"), "utf8"), new RegExp(`Sitemap: ${ORIGIN}/sitemap.xml`));
});

test("img に width・height・alt があり、ファーストビュー以外は遅延読み込み", () => {
  const bad = [];
  for (const p of pages) {
    for (const [tag] of p.html.matchAll(/<img\b[^>]*>/g)) {
      if (/a8\.net/.test(tag)) continue; // ASPの計測ピクセルは対象外
      for (const a of ["width", "height", "alt"]) if (!new RegExp(`\\s${a}="`).test(tag)) bad.push(`${p.url}: ${a} なし ${tag}`);
      if (!/loading="lazy"|fetchpriority="high"/.test(tag) && p.url !== "/404.html") bad.push(`${p.url}: 遅延読み込みなし ${tag}`);
    }
  }
  assert.deepEqual(bad, []);
});

test("配信する画像は 100KB 以下", () => {
  const big = walk(join(SITE, "img")).filter((f) => statSync(f).size > 100 * 1024);
  assert.deepEqual(big, []);
});

test("夜勤記事は相互にリンクし、関連記事への導線がある", () => {
  for (const p of articles) {
    assert.match(p.html, /<nav class="related"/, `${p.url}: 関連記事なし`);
  }
  const yakin = articles.filter((p) => p.url.includes("yakin"));
  for (const p of yakin) {
    for (const other of yakin) {
      if (other !== p) assert.ok(p.html.includes(`href="${other.url}"`), `${p.url} -> ${other.url} がない`);
    }
  }
});

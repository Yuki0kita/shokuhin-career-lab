// _site 内の外部リンクを実際に取得して確認する（ネットワークが必要なので npm test には含めない）
// 使い方: npm run build && npm run check:external
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const walk = (dir) =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const urls = new Set();
for (const f of walk("_site").filter((f) => f.endsWith(".html"))) {
  for (const [, u] of readFileSync(f, "utf8").matchAll(/(?:href|src)="(https?:\/\/[^"]+)"/g)) {
    urls.add(u.replace(/&amp;/g, "&"));
  }
}

let failed = 0;
for (const url of urls) {
  try {
    const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(15000) });
    const ok = res.status < 400;
    if (!ok) failed += 1;
    console.log(`${ok ? "OK  " : "NG  "} ${res.status} ${url}`);
  } catch (e) {
    failed += 1;
    console.log(`NG   ${e.cause?.code || e.name} ${url}`);
  }
}
process.exitCode = failed ? 1 : 0;

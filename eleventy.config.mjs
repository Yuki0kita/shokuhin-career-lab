import { EleventyHtmlBasePlugin } from "@11ty/eleventy";

export default function (eleventyConfig) {
  // Cloudflare Pages でルート配信（サブパス配信に戻す場合は pathPrefix を変更）
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/img": "img" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/favicon.svg": "favicon.svg" });

  // 見出し（h2・h3）に連番のidを振る。目次のリンク先に使う
  eleventyConfig.amendLibrary("md", (md) => {
    const openers = ["heading_open"];
    md.core.ruler.push("heading_ids", (state) => {
      let n = 0;
      for (const token of state.tokens) {
        if (openers.includes(token.type) && (token.tag === "h2" || token.tag === "h3")) {
          n += 1;
          token.attrSet("id", `sec-${n}`);
        }
      }
    });
  });

  // 記事HTMLから h2・h3 を拾って目次を組み立てる
  eleventyConfig.addFilter("toc", (content) => {
    if (!content) return "";
    const items = [];
    const re = /<h([23])[^>]*id="(sec-\d+)"[^>]*>(.*?)<\/h\1>/gs;
    let m;
    while ((m = re.exec(content)) !== null) {
      const text = m[3].replace(/<[^>]+>/g, "").trim();
      if (text) items.push({ level: Number(m[1]), id: m[2], text });
    }
    if (items.length < 3) return "";

    const parts = ['<nav class="toc" aria-label="目次"><p class="toc-title">目次</p><ol>'];
    let inSub = false;
    for (const item of items) {
      if (item.level === 2) {
        if (inSub) {
          parts.push("</ol></li>");
          inSub = false;
        } else if (parts.length > 1) {
          parts.push("</li>");
        }
        parts.push(`<li><a href="#${item.id}">${item.text}</a>`);
      } else {
        if (!inSub) {
          parts.push("<ol>");
          inSub = true;
        }
        parts.push(`<li><a href="#${item.id}">${item.text}</a></li>`);
      }
    }
    parts.push(inSub ? "</ol></li>" : "</li>", "</ol></nav>");
    return parts.join("");
  });

  eleventyConfig.addCollection("articles", (collectionApi) =>
    collectionApi
      .getFilteredByGlob("src/articles/*.md")
      .sort((a, b) => b.date - a.date)
  );

  eleventyConfig.addFilter(
    "readableDate",
    (date) =>
      `${date.getUTCFullYear()}年${date.getUTCMonth() + 1}月${date.getUTCDate()}日`
  );
  eleventyConfig.addFilter("isoDate", (date) => date.toISOString().split("T")[0]);

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "_site",
    },
    pathPrefix: "/",
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}

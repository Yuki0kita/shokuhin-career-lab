import { EleventyHtmlBasePlugin } from "@11ty/eleventy";

export default function (eleventyConfig) {
  // Cloudflare Pages でルート配信（サブパス配信に戻す場合は pathPrefix を変更）
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/img": "img" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/favicon.svg": "favicon.svg" });

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

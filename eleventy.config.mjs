import { EleventyHtmlBasePlugin } from "@11ty/eleventy";

export default function (eleventyConfig) {
  // GitHub Pages のサブパス配信に対応する（独自ドメイン移行時は pathPrefix を "/" に変更）
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
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
    pathPrefix: "/shokuhin-career-lab/",
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}

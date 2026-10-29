import starlight from "@astrojs/starlight";
import { unified as remarkProcessor } from "@astrojs/markdown-remark";
import { defineConfig } from "astro/config";
import { base, manifest, repository, siteOrigin } from "./site/config.ts";
import { sourceMarkdown } from "./site/content.ts";

export default defineConfig({
  site: siteOrigin,
  base,
  trailingSlash: "always",
  markdown: { processor: remarkProcessor({ remarkPlugins: [sourceMarkdown] }) },
  integrations: [
    starlight({
      title: manifest.product.displayName,
      description: manifest.description,
      defaultLocale: "root",
      locales: {
        root: { label: "简体中文", lang: manifest.product.locale },
        en: { label: "English", lang: "en" },
      },
      social: [{ icon: "github", label: "GitHub", href: repository }],
      customCss: ["./site/styles.css"],
      components: { Footer: "./site/components/Footer.astro" },
      editLink: { baseUrl: `${repository}/edit/main/` },
      sidebar: [
        { label: "技能与安装", link: "/", translations: { en: "Skills and installation" } },
        { label: "贡献与验证", slug: "CONTRIBUTING", translations: { en: "Contribute" } },
        { label: "行为案例", slug: "evals/README", translations: { en: "Reusable cases" } },
      ],
      markdown: { processedDirs: ["."] },
    }),
  ],
});

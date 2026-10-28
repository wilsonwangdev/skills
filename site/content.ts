import type { Root } from "mdast";
import { toString } from "mdast-util-to-string";
import { existsSync, readFileSync } from "node:fs";
import { matchesGlob, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import type { VFile } from "vfile";
import { base, manifest, repository } from "./config.ts";

const root = fileURLToPath(new URL("../", import.meta.url));
export const contentPatterns = [
  "README.md",
  "CONTRIBUTING.md",
  "AGENTS.md",
  "skills/**/*.md",
  "evals/**/*.md",
  "en/index.md",
  "site/maintaining.md",
];
const parser = unified().use(remarkParse).use(remarkFrontmatter);

export function sourceId(entry: string) {
  return entry === "README.md" ? "index" : entry.replace(/\.md$/, "").replace(/\/index$/, "");
}

function pageURL(entry: string) {
  const id = sourceId(entry).replace(/(?:^|\/)index$/, "");
  return `${base}/${id}${id ? "/" : ""}`;
}

/** 使用内容加载器的原文件信息派生展示元数据，不维护另一份标题或正文。 */
export function prepareSource(entry: string, data: Record<string, unknown>) {
  const tree = parser.parse(readFileSync(resolve(root, entry), "utf8"));
  const heading = tree.children.find((node) => node.type === "heading" && node.depth === 1);
  data.title = heading ? toString(heading) : (data.name ?? manifest.product.displayName);
  data.editUrl = `${repository}/edit/main/${entry}`;
  return sourceId(entry);
}

/** 只在构建时处理原文的 .md 链接；渲染、路由和搜索由 Astro/Starlight 负责。 */
export function sourceMarkdown() {
  return (tree: Root, file: VFile) => {
    const source = relative(root, file.path);
    if (!contentPatterns.some((pattern) => matchesGlob(source, pattern))) return;
    const title = tree.children.findIndex((node) => node.type === "heading" && node.depth === 1);
    // Starlight 使用加载器派生的同一标题渲染 h1，避免重复显示。
    if (title !== -1) tree.children.splice(title, 1);
    visit(tree, ["link", "definition"], (node) => {
      if (node.type !== "link" && node.type !== "definition") return;
      if (!/\.md(?:[?#]|$)/.test(node.url) || /^(?:[a-z][\w+.-]*:|\/\/|#)/i.test(node.url)) return;
      const url = new URL(node.url, pathToFileURL(file.path));
      const target = relative(root, fileURLToPath(url));
      if (
        !existsSync(resolve(root, target)) ||
        !contentPatterns.some((pattern) => matchesGlob(target, pattern))
      ) {
        throw new Error(`Markdown link points outside published content: ${source} -> ${node.url}`);
      }
      node.url = `${pageURL(target)}${url.search}${url.hash}`;
    });
  };
}

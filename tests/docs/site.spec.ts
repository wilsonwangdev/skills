import { expect, test, type Page } from "@playwright/test";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const base = "/skills/";

async function files(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory()
        ? files(join(directory, entry.name))
        : Promise.resolve([join(directory, entry.name)]),
    ),
  );
  return nested.flat();
}

async function openSearch(page: Page) {
  await page.getByRole("button", { name: "搜索", exact: true }).click();
  return page.getByRole("textbox");
}

test("original skill and reference links work under the project path and point edits to source files", async ({
  page,
}) => {
  await page.goto(base);
  await expect(page.getByRole("heading", { name: "Skills", exact: true })).toBeVisible();
  await expect(page.locator("main")).toContainText("npx skills add wilsonwangdev/skills -g");
  await expect(
    page.getByRole("link", { name: "在 GitHub 编辑原文", exact: true }).first(),
  ).toHaveAttribute("href", "https://github.com/wilsonwangdev/skills/edit/main/README.md");
  await page.getByRole("link", { name: "构建可维护的应用", exact: true }).click();
  await expect(page).toHaveURL(/\/skills\/skills\/build-maintainable-app\/SKILL\/$/);
  await expect(page.getByRole("heading", { name: "构建可维护的应用", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Web 工程基线", exact: true }).first().click();
  await expect(page).toHaveURL(/\/skills\/skills\/build-maintainable-app\/references\/web\/$/);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Web 工程基线", exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "在 GitHub 编辑原文", exact: true }).first(),
  ).toHaveAttribute(
    "href",
    "https://github.com/wilsonwangdev/skills/edit/main/skills/build-maintainable-app/references/web.md",
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  );
  await page.screenshot({ path: test.info().outputPath("reference-page.png"), fullPage: false });
});

test("search results open the original heading and survive a reload", async ({ page }) => {
  await page.goto(base);
  const search = await openSearch(page);
  await search.fill("模块边界");
  const result = page.getByRole("link", {
    name: "模块边界与架构检查",
    exact: true,
  });
  await expect(result).toBeVisible();
  await expect(result).toHaveAttribute(
    "href",
    /\/skills\/skills\/build-maintainable-app\/references\/web\/#/,
  );
  await result.click();
  await expect(
    page.getByRole("heading", { name: "模块边界与架构检查", exact: true }),
  ).toBeVisible();
  await expect(page.locator("main")).toContainText("优先复用框架、类型系统和现有 lint 规则");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "模块边界与架构检查", exact: true }),
  ).toBeVisible();
});

test("keyboard search selection opens a real document", async ({ page }) => {
  await page.goto(base);
  const search = await openSearch(page);
  await search.fill("模块边界");
  await expect(
    page.getByRole("link", { name: "模块边界与可执行架构规则", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "模块边界与可执行架构规则", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "模块边界与可执行架构规则", exact: true }),
  ).toBeVisible();
});

test("the English entry explains the source language and links to the original installation guide", async ({
  page,
}) => {
  await page.goto(`${base}en/`);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("main")).toContainText("maintained in Chinese");
  await page
    .getByRole("link", {
      name: "Browse the original skill catalog and installation guide",
      exact: true,
    })
    .click();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh");
  await expect(page.locator("main")).toContainText("npx skills add wilsonwangdev/skills -g");
});

test("appearance follows the system, persists a choice, and can return to automatic", async ({
  page,
  isMobile,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto(base);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  if (isMobile) await page.getByRole("button", { name: "菜单", exact: true }).click();
  const appearance = page.getByRole("combobox", { name: "选择主题", exact: true });
  await appearance.selectOption("light");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  if (isMobile) await page.getByRole("button", { name: "菜单", exact: true }).click();
  await appearance.selectOption("auto");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("generated content and ordinary links remain readable", async ({ page }) => {
    await page.goto(base);
    await expect(page.getByRole("heading", { name: "Skills", exact: true })).toBeVisible();
    await page.getByRole("link", { name: "从 Agent 对话中学习", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "从 Agent 对话中学习", exact: true }),
    ).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "zh");
  });
});

test("private workspace and interpreter files do not enter published pages or the search index", async () => {
  for (const file of await files("dist")) {
    expect(file).not.toMatch(/\/(\.eval-workspace|\.venv|\.git)\//);
    if (/\.(html|js|json|css)$/.test(file)) {
      const text = await readFile(file, "utf8");
      expect(text).not.toContain("SKILLS_DOCS_PRIVATE_SENTINEL");
      expect(text).not.toMatch(/\/Users\/[^/]+\//);
    }
  }
});

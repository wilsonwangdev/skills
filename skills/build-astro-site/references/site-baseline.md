# Astro 工程基线

创建或整理 Astro 项目时读这里：目录分工、配置起点、依赖取舍、CI 与部署验证。通用 Web 基线（TypeScript 严格模式、格式与静态检查、提交钩子、多语言机制、主题与偏好、测试组织）沿用 `build-maintainable-app`，此处只补 Astro 特有部分。

## 目录与命令

固定入口，不额外造分层：

```
astro.config.ts       站点配置，域名等唯一来源
src/pages/            路由：页面、动态路由、JSON 端点、rss.xml.ts
src/layouts/          BaseLayout 等页面外壳，元信息在这里输出
src/components/       可复用片段；需要状态的交互组件单独成文件
src/content/          Markdown/MDX 内容本体，按集合分目录
src/content.config.ts 集合定义与 schema
src/data/             站点常量、导航、标签映射等纯数据
src/lib/              无 UI 的纯函数（格式化、排序、查询）
src/styles/           global.css 与设计令牌
public/               原样发布的文件：favicon、robots.txt、字体、静态 og 图
```

`package.json` 脚本至少保留 `dev`、`build`、`preview`、`check`（`astro check`）。`check` 需要 `@astrojs/check` 与 `typescript` 两个开发依赖，漏装时该命令直接报错。构建命令默认不合并类型检查：让 `build` 只负责产物，`check` 单独可运行，CI 两个都跑，失败信息才对应到具体环节。

运行时与包管理器写进 `engines` 或 `.nvmrc`，锁文件提交；CI 用 `--frozen-lockfile`。

## 配置起点

`astro.config.ts` 一份配置覆盖默认决策，逐项都有明确理由：

```ts
// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE } from './src/data/site';

export default defineConfig({
  site: SITE.url,
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  integrations: [sitemap()],
  markdown: { shikiConfig: { theme: 'css-variables', wrap: true } },
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },
});
```

- `site`：站点身份。sitemap、canonical、RSS、OG 的绝对地址都从它派生；缺失时这些能力静默降级。用 `astro.config.ts` 从 `src/data/site.ts` 导入，域名只出现一次。
- `output: 'static'`：默认静态。需要按需渲染（鉴权、表单后端、实时数据）时才加 adapter，并在配置里说明哪些路由例外。
- `trailingSlash`：`'ignore'` 表示 `/a` 与 `/a/` 都接受，此时靠 canonical 与 sitemap 收敛重复地址；也可以选 `'always'` 或 `'never'` 让另一种写法直接 404。三种都行，站点内部链接与 sitemap 必须统一成同一种形态。
- `build.format: 'directory'`：静态主机（Cloudflare Pages、GitHub Pages、S3）按目录取 `index.html`，不带扩展名的地址才能直接访问。
- `shikiConfig.theme: 'css-variables'`：代码高亮颜色走 CSS 变量，深浅色主题不必生成两套高亮产物。
- `prefetch`：默认不开启，内容站的阅读流收益最大（导航链接进入视口即预取），因此显式配置。列表页外链很多时评估带宽，改用 `hover`；使用 `<ClientRouter />` 时预取默认全量打开，需要时用 `prefetch: false` 关掉。

## 依赖取舍

- 集成按需安装：`@astrojs/sitemap` 几乎必装；`@astrojs/rss`、`@astrojs/mdx` 按内容形态；框架集成（React、Solid、Vue）只在确有交互岛时引入。
- 样式：纯 CSS + 自定义属性足以支撑内容站；需要原子类时用 Tailwind v4 的 `@tailwindcss/vite` 插件与 CSS 内 `@theme`。`@astrojs/tailwind` 集成已被官方标记弃用，只留作 Tailwind 3 的迁移路径，新项目不再安装。
- 图像：静态构建默认用 sharp 处理 `src/assets` 里的图片。严格包管理器（pnpm）需要把 `sharp` 显式装进项目依赖；pnpm 新版默认还阻止依赖执行安装脚本，需在 `pnpm-workspace.yaml` 放行（旧版本键名是 `onlyBuiltDependencies`，当前为 `allowBuilds`）。漏装或漏放行时，图片处理在构建期报错。
- 不预装优化插件：`@astrojs/partytown`、压缩、CSS 拆分等先证明有收益再加，Astro 默认产物已经很小。

## CI 与产物断言

CI 顺序固定：安装（`--frozen-lockfile`）→ `check` → `build` → 产物断言。

断言检查通用事实而不是逐页列举：首页与 `404.html` 存在、`rss.xml` 存在、`sitemap-index.xml` 存在、动态路由至少生成一页。每加一篇内容就要改 CI 的清单会腐化成第二套路由表。

```yaml
- run: pnpm install --frozen-lockfile
- run: pnpm check
- run: pnpm build
- name: Verify output
  run: |
    set -e
    test -f dist/index.html
    test -f dist/404.html
    test -f dist/rss.xml
    test -f dist/sitemap-index.xml
```

部署目标决定额外配置：Cloudflare Pages 用静态产物即可；GitHub Pages 需要 `site` 加子路径 `base`；Vercel 静态站不需要 adapter，只有服务端图片服务或按需渲染才需要。

## 部署完成后才叫上线

- 提交作者邮箱必须与 GitHub 账号一致。Vercel 找不到提交作者的关联账号会直接判 `Blocked`，构建根本不跑。
- 部署状态 `Ready` 不等于域名生效。曾出现新部署成功但 alias 仍指向四小时前版本；确认 alias 指向本次部署，再访问真实域名逐页检查。
- 上线检查用真实地址：首页、一篇文章、标签页、`rss.xml`、`sitemap-index.xml`、分享卡片 meta、移动视口。
- 分享链接与二维码按当前域名生成，不写死生产域名；预览与隧道域名会因此全部失效。

## 记录决策

仓库根放 `DECISIONS.md`，分「已定」与「待定」：每条写决定、理由、触发条件。推迟的决策没有触发条件就是遗忘，会在下个任务里被重新讨论一遍。

大版本升级（例如跨 major 的 Astro 升级）单独提交，写明构建与浏览器验证的实际结果，以及这回不做的事和理由。README 不写具体版本号，版本由 `package.json` 与锁文件维护；README 里写死的版本会先于代码过期。

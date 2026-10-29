---
name: build-astro-site
description: 用 Astro 构建站点或内容型 Web 应用时使用：博客、文档站、作品集、资料档案，以及给已有 Astro 工程新增内容集合、页面、SEO 元信息、国际化或部署配置。默认静态输出、内容集合与零客户端 JS 起步，每页输出完整元信息；通用工程基线由 build-maintainable-app 负责，单页样式微调不在此列。
license: MIT
---

# 用 Astro 构建站点

这些是本技能的默认选择，不是框架手册。Astro 版本按当前稳定版核对，具体技术栈服从用户要求与现有工程；跨框架的工程基线（TypeScript 严格模式、格式与检查、提交钩子、主题与偏好、测试组织）沿用 `build-maintainable-app`，这里只补 Astro 特有决策。

## 先定站点形态

内容站、工具站、混合站决定后面所有选择：内容站由集合驱动、页面负责呈现；工具站由交互驱动，需要客户端状态；混合站要明确哪些路由是静态阅读、哪些是交互入口。

开工前确认四件事：站点形态、渲染模式（默认 `output: 'static'`，出现鉴权、表单后端、实时数据才引入 adapter 并说明例外路由）、部署平台与域名、语言集合。这四项没定，后面的目录和依赖都会返工。

## 骨架从官方模板起，站点身份只写一处

```sh
pnpm create astro@latest   # 最小模板 + TypeScript
```

站点域名写进 `astro.config.ts` 的 `site`，页面里用 `Astro.site` 派生绝对地址；站点名称、描述、导航放 `src/data/site.ts`，配置文件从那里导入。域名在仓库里只出现一次——出现第二次的地方就是将来分享链接失效的地方。

README 不写具体版本号，版本由 `package.json` 与锁文件维护。目录分工、配置起点、依赖取舍与 CI 写法见 [Astro 工程基线](references/site-baseline.md)。

## 内容即数据

正文一律进内容集合：`src/content.config.ts` 定义 `glob()` loader 与 zod schema，页面用 `getStaticPaths` + `render()`。不把 Markdown 散放在 `src/pages/`，那里没有 schema 校验、类型提示和统一排序。

三个必须守住的契约：`entry.id` 就是 URL（改名等于换地址）、日期用 `z.coerce.date()`、枚举字段用 `z.enum`（错字在构建期失败而不是渲染成空白）。

集合写法、路由、草稿过滤、公开 JSON 端点见 [内容、路由与页面元信息](references/content-and-seo.md)。

## 每个页面都输出完整元信息

统一走一个 `BaseLayout`：标题带站名后缀、描述来自内容本身、canonical 与 og 图从 `Astro.site` 派生、补 twitter card 与 RSS 链接。布局里不写死域名。

站点级三件套同期接通：`@astrojs/sitemap`（依赖 `site`，缺了会静默产出错地址）、指向 sitemap 的 `robots.txt`、`@astrojs/rss` 端点。分享图先上一张静态品牌图；只有确实需要每篇不同才在构建期生成，不把静态站改成服务端项目。

## 默认零 JavaScript，交互按需加水

页面默认没有客户端 JS。只有需要状态的组件才加 `client:*`，优先 `client:visible`，其次 `client:idle`，`client:load` 留给首屏关键交互。框架集成只在真有交互岛时安装，装了就只服务那几块。

`ClientRouter` 适合阅读流（导航不刷新、转场自然）；状态存在内存里的应用页不要用，跨页导航会让局部状态与计数逻辑失配。需要退回整页导航的单个链接加 `data-astro-reload`，不必为一条链接关掉全站转场。

`prefetch` 默认不开启，内容站显式打开（`prefetchAll: true`、`defaultStrategy: 'viewport'`），点击前就命中缓存；列表页外链很多时评估带宽，退回 `hover`。

## 样式、字体与多语言各有单一来源

设计令牌用语义化的 CSS 自定义属性（`--fg`、`--bg`、`--line`），亮暗色切同一套变量，不复制组件样式。需要原子类时用 Tailwind v4 的 `@tailwindcss/vite` 插件加 CSS 内 `@theme`，不用已弃用的 `@astrojs/tailwind` 集成。

字体自托管（woff2），`font-display: swap`，关键字体 `preload`；不引外部字体 CDN，也不等页面做完再处理首屏闪烁。

多语言用框架内置的 `i18n` 配置加 `Astro.currentLocale`，切换链接用 `getRelativeLocaleUrl`，每页输出 `hreflang` alternates。确需自己的地址形态时切到 `routing: 'manual'` 并整站一致；在页面里手写前缀解析再包一层 `try/catch` 是把偏差藏起来，不是处理了多语言。

## 构建与上线都看实际产物

本地顺序固定：`astro check` → `astro build` → 预览产物 → 真实浏览器走关键路径（首页、一篇文章、标签页、404、移动视口）。检查成功不等于页面正确。

CI 用 `--frozen-lockfile`，断言检查通用事实（首页、`404.html`、`rss.xml`、`sitemap-index.xml` 存在），不逐页罗列——那种清单每加一篇内容都要改。

部署有三个反复踩到的点：提交作者邮箱必须与 GitHub 账号一致（否则 Vercel 直接判 `Blocked`，构建不跑）；部署状态 `Ready` 不等于域名生效，确认 alias 指向本次部署；上线后按真实域名逐页检查，不只看看板。详见 [Astro 工程基线](references/site-baseline.md#部署完成后才叫上线)。

## 决策留在仓库

根目录的 `DECISIONS.md` 分「已定」与「待定」：已定写决定、理由和当时否掉的替代方案；待定必须有触发条件，没有触发条件的「以后再说」就是遗忘，下个任务会被重新讨论一遍。

跨 major 升级单独提交，写清验证证据与这回不做的事。是否加 `ClientRouter`、为什么不用后端、分享图用静态还是动态，都属于这个文件的问题，不属于聊天记录。

## 交付时说明

说清站点形态、渲染模式、内容模型与字段契约、元信息覆盖范围、首屏 JS 预算、实际执行过的验证，以及没有验证的部分。不要把「构建通过」说成「上线可用」，也不要把这一个站点的临时选择写成框架通用规则。

# 内容、路由与页面元信息

建内容集合、写页面路由、接图片与 SEO 时读这里。原则只有一句：**内容即数据**——正文是集合里的条目，页面只负责取它与呈现它。

## 集合定义

`src/content.config.ts` 是唯一入口，用 `glob()` loader 指向内容目录，schema 用 zod 描述。旧式的 `src/content/config.ts` 在新版本默认不再被识别，只保留给迁移期；新建与重构都只写 `content.config.ts`：

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const topics = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/topics' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { topics };
```

- 字段取「列表、详情、分享卡片、筛选」真正会用到的；必填只留 title、description、date。其余给 `default`，新增条目不用回填旧文。
- 日期一律 `z.coerce.date()`：源码里写 `2026-10-21` 或 ISO 字符串都能解析，页面里拿到的始终是 `Date`。
- 枚举用 `z.enum`（状态、类型、证据等级），让错字在构建期失败，而不是渲染出空白。
- 结构重复的片段抽成独立 schema 再复用（来源、时间线、承诺），不要在每篇正文里手写 Markdown 表格。
- `entry.id` 就是 URL 片段。它是稳定标识，改文件名等于换地址，旧链接会断；需要换时同时处理重定向。

不把内容散放在 `src/pages/*.md`：那条路径拿不到 schema 校验、类型提示和统一排序字段，站点长大后会先在这里失控。

## 路由与渲染

动态路由用 `getStaticPaths` + `render()`：

```ts
export async function getStaticPaths() {
  const topics = await getCollection('topics', ({ data }) => !data.draft);
  return topics.map((topic) => ({ params: { slug: topic.id }, props: { topic } }));
}

const { topic } = Astro.props;
const { Content } = await render(topic);
```

- 列表页只做 `getCollection` + 排序，排序规则集中在一个 `src/lib` 函数里，避免首页、标签页、RSS 各排一次。
- 草稿在 `getStaticPaths` 过滤，dev 下另走分支，不要靠环境变量在渲染时判断。
- `404.astro` 与 `robots.txt` 同期建立，别等上线后补。
- 需要公开数据时用端点路由（`src/pages/cases.json.ts`）导出同一份集合，而不是在页面里另拼一次 JSON。

## 每个页面都输出完整元信息

所有页面经同一个 `BaseLayout`，元信息在布局里一次写对：

```astro
---
const { title, description = SITE.description, noindex = false } = Astro.props;
const pageTitle = title ? `${title} · ${SITE.name}` : SITE.title;
const canonical = new URL(Astro.url.pathname, Astro.site ?? SITE.url).href;
const ogImage = new URL('/og.png', Astro.site ?? SITE.url).href;
---
<link rel="canonical" href={canonical} />
<meta property="og:type" content="website" />
<meta property="og:title" content={pageTitle} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonical} />
<meta property="og:image" content={ogImage} />
<meta name="twitter:card" content="summary_large_image" />
<link rel="alternate" type="application/rss+xml" title={SITE.name} href="/rss.xml" />
```

- 标题带站名后缀，描述来自内容本身；缺描述时不要留空，回落站点描述。
- 绝对地址只从 `Astro.site` 派生，布局里不写死域名——写死一次，预览域名、隧道域名、分享链接就全错。
- 文章页把 `og:type` 换成 `article`，并补 `article:published_time`。
- 需要结构化数据时传 `jsonLd` 对象，用 `set:html={JSON.stringify(jsonLd)}` 输出，不要手拼字符串。
- `noindex` 页面（搜索结果、内部预览）同时从 sitemap 排除。

## 图片与分享图

- 需要优化、裁切、响应式尺寸的图片放 `src/assets/`，在页面里 `import` 后用 `astro:assets` 的 `<Image />`；`widths`/`sizes` 按布局给，别只交一个原图。
- `public/` 只放需要原样发布的文件：favicon、`robots.txt`、字体、已经压好的静态分享图。放进去的图片不会经过优化管线。
- 远程图片在用之前把域名加进 `image.domains`（或 `remotePatterns`），否则构建期解析失败。
- 分享图先用一张品牌静态图（1200×630）覆盖全站；只有确实需要每篇不同时，才在构建期用 satori/resvg 生成，产物落进静态目录。运行时生成分享图会把静态站变成服务端项目，代价与收益不成比例。
- 内容 schema 里声明 `ogImage: z.string().optional()`，缺省回落站点图，避免每篇都手填。

## sitemap、robots 与 RSS

- `@astrojs/sitemap` 依赖 `site` 配置，没配 `site` 时它静默产出错误的绝对地址。装上后检查 `dist/sitemap-index.xml`。
- `public/robots.txt` 写 `Sitemap: https://<域名>/sitemap-index.xml`，域名与 `site` 一致。
- RSS 用 `@astrojs/rss` 的端点路由，`site: context.site`，条目按日期倒序，描述取 schema 里的 `description`：

```ts
export async function GET(context: APIContext) {
  const topics = (await getCollection('topics')).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items: topics.map((t) => ({ title: t.data.title, description: t.data.description, pubDate: t.data.date, link: `/${t.id}/` })),
    customData: '<language>zh-cn</language>',
  });
}
```

## 多语言

用框架内置的 `i18n` 配置，地址生成交给官方助手：

```ts
i18n: { defaultLocale: 'zh', locales: ['zh', 'en'], routing: { prefixDefaultLocale: false } }
```

- 页面里取 `Astro.currentLocale`，切换到另一种语言用 `getRelativeLocaleUrl(lang, path)`；这两件事手写一次就会在查询参数、尾斜杠、嵌套路径上出偏差，再补一层 `try/catch` 只是把错误藏起来。确实需要自己的地址形态时用 `routing: 'manual'` 接管，并整站统一。
- 界面文案放 `src/i18n/<lang>.json`，键名有含义；内容正文按语言分目录（`src/content/topics/zh/`、`.../en/`），集合与 schema 共用，语言从条目路径派生。
- 每个页面输出 `hreflang` alternates：

```astro
{locales.map((lang) => (
  <link rel="alternate" hreflang={lang} href={getAbsoluteLocaleUrl(lang, Astro.url.pathname)} />
))}
```

- `prefixDefaultLocale` 一旦选定，全站链接、canonical、sitemap 都按同一形态生成；中途切换会产生两套地址。

## 检查清单

内容与元信息改完后，构建产物里逐项确认：集合条目全部生成页面、`sitemap-index.xml` 与 `rss.xml` 存在、抽一页看 canonical 与 og 是否是绝对地址、`robots.txt` 指向的 sitemap 可访问、新增语言页面互相声明 hreflang。

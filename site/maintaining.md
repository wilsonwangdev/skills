# 维护文档站

站点直接读取 README、技能正文、参考资料与维护说明。README 是首页；英文入口只提供导览，技能正文保持原语言。新增技能仍更新同一份 README 目录，不维护第二套正文或安装命令。

## 开发与检查

先按根贡献指南安装 Python 校验依赖，再运行：

```sh
pnpm install --frozen-lockfile
pnpm docs:dev
```

命令、元信息与版本由 `package.json` 维护。`pnpm check` 覆盖格式、静态、类型、生产构建和真实浏览器；Python 技能结构检查由原流程承担。安装会启用 Husky：站点工程在暂存隔离下接受静态与类型检查，技能或案例变化另外执行原 Python 校验。

使用 Astro、Starlight 的稳定兼容版本与官方内容加载器。项目只编写 TypeScript 工程配置，唯一的自有 `.astro` 组件是 `site/components/Footer.astro`：它只引用构建信息与仓库地址，不含业务逻辑。`astro sync` 生成框架类型，TypeScript 严格检查项目源码。`astro check` 尚未支持 TypeScript 7，不在检查链中；今后添加含逻辑的 `.astro` 组件时，应先核对官方类型检查兼容性。

## 内容与设计

`src/content.config.ts` 以白名单加载原文件。`site/content.ts` 从原文标题和路径派生展示元数据，统一生成页面标识，并通过成熟 Markdown 语法树处理器将 `.md` 相对链接转换为带部署前缀的页面地址。普通链接和参考式链接保留查询参数与锚点；GitHub 编辑入口始终指向原文件。不维护浏览器路由或搜索补丁。

使用 Starlight 内置的响应式布局、语言导航、深浅色与跟随系统选项。英文回退页面会显示框架的未翻译提示。Pagefind 从最终 HTML 建立搜索索引。语义强调色在 `site/styles.css` 定义；正文、元数据和安装分发格式保持不变。

`.eval-workspace/`、`.venv/`、Git 元数据及构建和测试产物不在内容白名单中。运行证据留在被忽略目录。无脚本时仍能阅读与导航；本轮不增加离线安装能力。

## 发布

合入 `main` 即自动构建并发布。**Deploy documentation** 在推送到默认分支时运行，同时保留手动触发，用于重发：更改 Pages 基路径、回滚内容或重新部署同一提交时使用。PR 只检查，不发布。工作流使用官方 `configure-pages` 的基路径，兼容仓库子路径与域名根路径，并由 `pages` 并发组串行部署。

页脚显示「最近更新 + 提交短哈希」，取自 `GITHUB_SHA` 与 HEAD 的提交日期；本地构建回退为「本地构建」。它是核对部署是否生效的入口，也向访问者说明内容新鲜度，因此不要改成构建时间——每次重建都变会让人误以为内容更新。

`main` 受分支保护，合入前需通过 `docs` 与 `validate` 检查，自动发布的内容因此已经过完整检查。上线后检查首页、技能、参考资料、搜索、语言、外观和移动布局，以及 GitHub 原文编辑链接。构建通过不等于站点已更新，以部署工作流的运行结果与环境 URL 为准。

依据：[Astro 内容加载器](https://docs.astro.build/en/reference/content-loader-reference/)、[Markdown 处理器](https://docs.astro.build/en/guides/markdown-content/)、[Starlight 配置](https://starlight.astro.build/reference/configuration/)。

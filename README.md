# Skills

从实际工作中持续打磨、可独立安装的 Agent 技能。

[在线文档](https://wilsonwangdev.github.io/skills/)

## 技能

- [从 Agent 对话中学习](skills/learn-from-agent-conversations/SKILL.md)：围绕没理解的内容逐步解释，补齐必要前提。
- [构建可维护的应用](skills/build-maintainable-app/SKILL.md)：用成熟工具建立工程、设计与质量基线，再以应用实践改进规则。
- [用 Astro 构建站点](skills/build-astro-site/SKILL.md)：静态输出与内容集合打底，每页输出完整元信息，交互按需加，上线按真实域名验收。
- [维护可持续的测试工程](skills/maintainable-testing/SKILL.md)：审计测试膨胀，复用夹具并收敛执行入口，以行为回归验证整理效果。

## 安装

使用 [skills CLI](https://github.com/vercel-labs/skills) 选择技能和目标客户端：

```sh
npx skills add wilsonwangdev/skills --list
npx skills add wilsonwangdev/skills -g
```

去掉 `-g` 可安装到当前项目；用 `--skill <name>` 指定单项。技能采用 [Agent Skills 标准](https://agentskills.io/specification)，实际调用方式由客户端决定。

## 更新

```sh
npx skills update learn-from-agent-conversations -g
```

将名称换成需要更新的技能；新技能重新运行 `add` 选择。安装器的 `check` 可能进入更新流程，不应视为只读检查。

[贡献与验证](CONTRIBUTING.md) · [行为案例](evals/README.md) · [文档站维护](site/maintaining.md) · [MIT 许可](https://github.com/wilsonwangdev/skills/blob/main/LICENSE)

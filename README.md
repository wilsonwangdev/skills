# Skills

个人日常使用、持续打磨并公开分享的 Agent 技能库。从实际工作和对话中提炼可复用的做法，逐步积累工程、学习、写作等场景的独立技能。

每项技能解决一个明确问题，可以单独安装，也可以在任务中按需组合。仓库负责维护和分发；具体项目的业务背景、账户信息和本机配置保留在使用环境中。

## 技能目录

### 学习与沟通

- [learn-from-agent-conversations · 从 Agent 对话中学习](skills/learn-from-agent-conversations/SKILL.md)：当用户没有理解 Agent 已给出的解释、方案、结论或代码时，围绕具体疑问逐步讲解。必要概念在出现处说明，按反馈深入，尊重“短一点”“直接解释”“不要练习”等要求。

  使用示例：“我还是没明白这一步为什么必要，先只讲这一点。”

新技能按实际用途加入目录。当前的学习技能是这个集合的第一项；后续的收录、修改和试用方式见 [维护指南](CONTRIBUTING.md)。

## 安装

本仓库使用 [Agent Skills 开放格式](https://agentskills.io/specification)。支持该格式的客户端可以发现和加载技能；具体触发方式、可用工具与权限由客户端决定。

使用 [skills 安装工具](https://github.com/vercel-labs/skills) 选择需要的技能与客户端。安装工具需要 Node.js 22.20 或更新版本，各技能自身的依赖以其说明为准。

```sh
# 查看技能目录
npx skills@1 add wilsonwangdev/skills --list

# 交互选择技能、目标 Agent 和安装范围
npx skills@1 add wilsonwangdev/skills

# 用户级安装，可跨项目使用
npx skills@1 add wilsonwangdev/skills -g

# 只安装一项技能
npx skills@1 add wilsonwangdev/skills --skill learn-from-agent-conversations

# 明确选择多个目标客户端
npx skills@1 add wilsonwangdev/skills -a codex claude-code cursor
```

每项技能的 `SKILL.md` 都说明适用场景。安装后可按客户端的方式选择技能，支持自动选择的客户端也可在请求匹配时使用它。没有技能发现机制的环境，可以将对应 `SKILL.md` 作为指令参考；手动安装文件夹时应保留其相对引用。

## 更新

GitHub 仓库是维护源，安装器保存的是本地副本。修改仓库后需要主动更新副本；仓库新增技能后，重新运行 `add` 选择需要的新技能。

```sh
# 查看用户级安装
npx skills@1 list -g

# 按名称更新已安装技能；这里以学习技能为例
npx skills@1 update learn-from-agent-conversations -g

# 更新当前项目中的同名技能
npx skills@1 update learn-from-agent-conversations -p
```

本仓库验证的安装器 1.7.4 版本中，`check` 与 `update` 进入同一更新流程，可能重装有变化的技能。升级前可在 GitHub 查看提交差异；安装器后续行为以其实际版本为准。

## 持续维护

在真实使用中发现重复问题，先判断它适合改进已有技能、新增独立技能，还是留作项目配置。调整源码后，检查格式与安装发现，再用代表性请求观察实际行为，通过提交记录保留改动原因。

- [维护指南](CONTRIBUTING.md)：收录标准、目录约定、来源与许可、验证和同步流程。
- [行为验证案例](evals/README.md)：按技能组织的试用材料。
- [仓库维护说明](AGENTS.md)：供参与维护的 Agent 使用。

```text
skills/<skill-name>/
  SKILL.md
  agents/          # 可选：客户端显示信息
  references/      # 可选：按需读取的资料
  scripts/         # 可选：执行脚本
  assets/          # 可选：输出所需素材
evals/
scripts/validate_skill.py
```

按用途组织首页目录；各项技能保留独立文件夹，数量增多且确有需要时再调整分类目录。组织与维护思路参考 [mattpocock/skills](https://github.com/mattpocock/skills)。

## 许可

本库原创内容采用 [MIT](LICENSE) 许可。第三方改编内容应保留其来源、版权声明和适用许可，见维护指南。

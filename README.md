# Skills

可分享、可通过 GitHub 维护的 Agent Skills。每项技能使用独立的 `SKILL.md`，核心内容不绑定特定模型、编辑器或文档服务。

## 从 Agent 对话中学习

[learn-from-agent-conversations](skills/learn-from-agent-conversations/SKILL.md) 用于处理对话中的理解障碍：当用户对 Agent 已经给出的解释、方案、结论或代码提出疑问时，围绕那个具体卡点，用简洁、可继续追问的方式讲清楚。

它要求 Agent：

- 先回答当前疑问，再按反馈逐层展开，不把每次追问都变成完整课程。
- 必要的新概念在出现处解释，避免用更多未知术语解释已有术语。
- 复用当前例子与已建立的知识；原回答有误时先更正。
- 中文表达使用通行译名，保留必要技术原名和准确的代码标识。
- 尊重“直接解释”“短一点”“不要练习”等要求，学习笔记和代码专题按需提供。

可以直接追问：

> 刚才说的“关键路径”是什么意思？举个日常例子，不要引入一堆新词。

> 我还是没明白这一步为什么必要。换一种说法，先只讲这一点。

> 这里的结论成立需要什么条件？先解释我需要知道的前提。

## 安装

本仓库遵循 [Agent Skills 开放格式](https://agentskills.io/specification)。支持该格式的客户端可以发现和加载技能；各产品的触发方式、可见会话范围与权限仍由产品本身决定。技能不会获得读取其他产品全部历史会话的能力。

可使用 [skills 安装工具](https://github.com/vercel-labs/skills) 选择客户端。安装工具需要 Node.js 22.20 或更新版本；技能本身只有 Markdown 指令，不依赖 Node.js、Python 或额外服务。

```sh
# 查看仓库中的技能
npx skills@1 add wilsonwangdev/skills --list

# 交互选择目标 Agent 和安装范围，项目安装请选择 Project
npx skills@1 add wilsonwangdev/skills --skill learn-from-agent-conversations

# 用户级安装，可跨项目使用
npx skills@1 add wilsonwangdev/skills --skill learn-from-agent-conversations -g

# 明确选择多个目标
npx skills@1 add wilsonwangdev/skills \
  --skill learn-from-agent-conversations -a codex claude-code cursor
```

如果环境不支持技能发现机制，仍可读取或提供该 `SKILL.md` 作为指令参考，但不能保证自动触发。无需安装器时，也可按客户端的技能目录约定放置同名文件夹，保留其中的相对引用文件。

## 更新与版本

GitHub 是源码来源，但已安装副本不会因为远端提交而自动更新。需要主动运行更新命令，或按所用客户端的安装方式同步。

```sh
# 查看用户级安装
npx skills@1 list -g

# 检查并更新当前项目中的指定技能
npx skills@1 update learn-from-agent-conversations -p

# 检查并更新用户级安装的指定技能
npx skills@1 update learn-from-agent-conversations -g
```

本仓库验证的安装器 1.7.4 版本中，`check` 与 `update` 进入同一更新流程，可能重装有变化的技能；不要把 `check` 当成只读预览。升级前可先在 GitHub 查看提交差异，重要环境也可安装固定标签或提交对应的来源。安装器后续行为以其实际版本为准。

## 目录

```text
skills/
  learn-from-agent-conversations/
    SKILL.md
    agents/openai.yaml
    references/
      code-changes.md
      learning-notes.md
evals/
scripts/validate_skill.py
```

`agents/openai.yaml` 仅提供部分客户端的显示信息，核心规则都在标准 `SKILL.md` 中。代码改动走读与学习材料整理属于按需读取的补充内容。

## 维护与验证

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-dev.txt
.venv/bin/python scripts/validate_skill.py
npx skills@1 add . --list
```

修改技能时，先更新仓库文件，再检查代表性对话是否仍符合 [行为验证案例](evals/README.md)。格式检查能发现目录、元数据和引用问题，不能证明讲解质量；实际会话试用需要单独记录。

通过提交记录和代码审查维护变动，再更新安装副本。仓库不保存个人学习背景、真实私有对话、账户凭据或本机路径；公开示例使用合成材料。

## 许可

[MIT](LICENSE)

import type { Configuration } from "lint-staged";

// Oxfmt 的忽略配置保护安装分发内容；隔离与恢复交给 lint-staged。
export default {
  "*.{ts,tsx,json,yaml,yml,md,css}": "oxfmt --write",
  "*": () => ["pnpm lint", "pnpm typecheck"],
  "{skills,evals}/**/*": () => [".venv/bin/python scripts/validate_skill.py"],
} satisfies Configuration;

import { execFileSync } from "node:child_process";

function git(...args: string[]): string | undefined {
  try {
    const output = execFileSync("git", args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return output.trim() || undefined;
  } catch {
    return undefined;
  }
}

// GITHUB_SHA 由 Actions 注入；本地构建退回当前检出，两者都不可用时只显示“本地构建”。
const commit = process.env.GITHUB_SHA?.trim() || git("rev-parse", "HEAD");
const date = git("log", "-1", "--format=%cs");

export const buildInfo = {
  commit: commit ? commit.slice(0, 7) : undefined,
  date,
};

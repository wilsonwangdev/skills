#!/usr/bin/env python3
"""检查技能的标准结构、元数据和本地引用；不评价教学质量。"""

import re
import sys
from pathlib import Path
from urllib.parse import unquote, urlsplit

import yaml


def validate(root: Path) -> list[str]:
    errors = []
    seen = set()
    entries = sorted((root / "skills").rglob("SKILL.md"))
    if not entries:
        return ["skills/ 中未发现 SKILL.md"]
    for entry in entries:
        folder = entry.parent
        content = entry.read_text(encoding="utf-8")
        match = re.match(r"\A---\n(.*?)\n---(?:\n|$)", content, re.S)
        if not match:
            errors.append(f"{entry.relative_to(root)}: 缺少 YAML 元数据")
            continue
        try:
            meta = yaml.safe_load(match.group(1))
        except yaml.YAMLError:
            errors.append(f"{entry.relative_to(root)}: 元数据格式无效")
            continue
        if not isinstance(meta, dict):
            errors.append(f"{entry.relative_to(root)}: 元数据必须是对象")
            continue
        name = meta.get("name", "")
        if (not isinstance(name, str) or not 1 <= len(name) <= 64
                or re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", name) is None
                or name != folder.name):
            errors.append(f"{entry.relative_to(root)}: name 与目录不匹配或格式无效")
        if isinstance(name, str):
            if name in seen:
                errors.append(f"{entry.relative_to(root)}: 技能名称重复")
            seen.add(name)
        description = meta.get("description", "")
        if not isinstance(description, str) or not 1 <= len(description.strip()) <= 1024:
            errors.append(f"{entry.relative_to(root)}: description 必须为非空且不超过 1024 字符")
        allowed = {"name", "description", "license", "compatibility", "metadata", "allowed-tools"}
        if set(meta) - allowed:
            errors.append(f"{entry.relative_to(root)}: 存在非标准元数据字段")
        for document in folder.rglob("*.md"):
            text = document.read_text(encoding="utf-8")
            if re.search(r"\[TODO:[^\n]*\]", text):
                errors.append(f"{document.relative_to(root)}: 存在未完成占位内容")
            for target in re.findall(r"\[[^\]]*\]\(([^\s)]+)\)", text):
                parsed = urlsplit(target)
                if parsed.scheme or not parsed.path:
                    continue
                resolved = (document.parent / unquote(parsed.path)).resolve()
                if not resolved.is_relative_to(folder.resolve()) or not resolved.is_file():
                    errors.append(f"{document.relative_to(root)}: 本地引用无效或越出技能目录: {target}")
        interface = folder / "agents" / "openai.yaml"
        if interface.exists():
            try:
                ui = yaml.safe_load(interface.read_text(encoding="utf-8"))["interface"]
                if not 25 <= len(ui["short_description"]) <= 64:
                    errors.append(f"{interface.relative_to(root)}: 简介长度应为 25–64 字符")
                if f"${name}" not in ui["default_prompt"]:
                    errors.append(f"{interface.relative_to(root)}: 默认提示词应引用技能名")
            except (yaml.YAMLError, TypeError, KeyError):
                errors.append(f"{interface.relative_to(root)}: 界面元数据格式无效")
    return errors


if __name__ == "__main__":
    repository = Path(__file__).resolve().parents[1]
    problems = validate(repository)
    if problems:
        print("\n".join(problems), file=sys.stderr)
        raise SystemExit(1)
    print("技能结构、元数据与本地引用检查通过。")

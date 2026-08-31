#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""handoff.py —— 把一方的 git 改动整理成给另一方 AI 的 review 输入包。

用法:
  python3 tools/handoff.py --from claude --to codex
  python3 tools/handoff.py --from claude --to codex --base main
  python3 tools/handoff.py --from codex --to claude --range HEAD~3..HEAD --verify
  python3 tools/handoff.py --verify                      # 只跑闸门
  VERIFY_RENDER=1 python3 tools/handoff.py --verify      # 闸门带上渲染检查

参数:
  --from <name>   交接方（claude|codex），默认 claude
  --to <name>     接收方，默认取另一方
  --base <ref>    审查 <ref>..HEAD 的全部改动
  --range <a..b>  显式 git range，优先级高于 --base
  --out <path>    输出路径，默认 collab/review-input.md
  --verify        附带运行闸门并写进包里
  --stdout        打印到 stdout，不写文件

无 --base/--range 时自动推断：工作区有未提交改动 → 对比 HEAD；否则 → HEAD~1..HEAD。
只用 Python 标准库 + git。
"""
import argparse
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
COLLAB = ROOT / "collab"
OTHER = {"claude": "codex", "codex": "claude"}
MAX_DIFF_BYTES = 200_000

CHECKLIST = """## Review 检查清单（本项目红线）

- [ ] **对齐课程安排**：讲义头部 `> **主题与学习重点**：` 与课件 `META['info']` 的
      「主题与学习重点：」是否与 `Introduction_to_Computing_B_Course_Guide.md` 的
      「课程安排」表**逐字一致**？改主题必须先改课程指南，或在 PLAN 里写明偏离理由。
- [ ] **讲义 ⇄ 课件一致**：同名 `.md` 与 `.pptx` 讲的是不是同一件事？讲义改了知识点、
      例题或复杂度结论，同名 `content/wNN.py` 有没有跟着改？（闸门验不了，人工必查）
- [ ] **`.pptx` 不可手编**：课件由 `courseware/content/wNN.py` 生成。diff 里若只有
      `.pptx` 变化而 `content/` 没动 —— 必须打回。
- [ ] **代码要真能跑**：讲义与样卷里的 Python 是给学生照抄的。
      注释里写的输出、复杂度声明、样例答案，是否与代码实际行为一致？
      （`tools/check_note_code.py` 覆盖到的见闸门输出；未覆盖的要标出来）
- [ ] **OJ / LeetCode 题号**：题号、题名、链接三者是否一致？
      闸门第 7 项只能拿仓库既有语料离线比对，**语料里没有的题号它判不了** —— 人工核。
- [ ] **元数据与时间戳**：改动过的 `.md` 是否 bump 了 `*Updated ... GMT+8*`？
- [ ] **命名与位置**：新增讲义是否沿用 `YYYYMM_ADS_WNN_<topic>.md`？
      2026 fall 材料是否都在 `courseware/`？
- [ ] **中英文与术语**：是否保持了原文语言？术语是否与前后周一致
      （如"广度优先搜索"不写成"宽度优先搜索"、"并查集"不写成"不相交集合"）？
- [ ] **排版不溢出**：课件内容加长后是否仍在版心内？
      （`tools/verify_courseware.py --render` 会逐页检查；deck.py 的代码页在行数过多时
      **会静默钳位到 8.5pt 并溢出**，只有渲染检查能发现）
- [ ] **上机考试的诚信条款不得放宽**：6 题 / 约 120 分钟、禁止任何 AI 工具、
      无法解释自己代码按学术不端处理。这是考核制度，不是可优化的文案。
- [ ] **闸门**：`python3 tools/handoff.py --verify` 是否通过？交接记录里有没有**真实的**验证输出？
"""


def git(args, soft=False):
    try:
        return subprocess.run(
            ["git", *args], cwd=ROOT, capture_output=True, text=True, check=True
        ).stdout
    except subprocess.CalledProcessError as e:
        if soft:
            return ""
        print(f"git {' '.join(args)} 失败：{e.stderr}", file=sys.stderr)
        return ""


def resolve_range(opts):
    if opts.range:
        return opts.range
    if opts.base:
        return f"{opts.base}..HEAD"
    if git(["status", "--porcelain"]).strip():
        return None                      # 未提交改动，对比 HEAD
    return "HEAD~1..HEAD"


def collect(opts):
    rng = resolve_range(opts)
    if rng is None:
        files = git(["diff", "--stat", "HEAD"])
        names = git(["diff", "--name-status", "HEAD"])
        diff = git(["diff", "HEAD"])
        untracked = git(["ls-files", "--others", "--exclude-standard"])
        commits = "（工作区未提交改动）"
        label = "未提交改动 vs HEAD"
    else:
        files = git(["diff", "--stat", rng])
        names = git(["diff", "--name-status", rng])
        diff = git(["diff", rng])
        untracked = ""
        commits = git(["log", "--oneline", "--no-decorate", rng])
        label = rng
    return dict(label=label, stat=files, names=names, diff=diff,
                untracked=untracked, commits=commits)


def read_notes(who):
    p = COLLAB / f"NOTES-{who}.md"
    return p.read_text(encoding="utf-8") if p.exists() else "（无）"


def read_open_items():
    p = COLLAB / "PLAN.md"
    if not p.exists():
        return "（无 PLAN.md）"
    text = p.read_text(encoding="utf-8")
    out, keep = [], False
    for line in text.splitlines():
        if line.startswith("## 未决"):
            keep = True
        elif keep and line.startswith("## "):
            break
        if keep:
            out.append(line)
    return "\n".join(out) if out else "（PLAN.md 中没有「未决」一节）"


def run_verify():
    cmds = [
        [sys.executable, "tools/verify_courseware.py"],
        [sys.executable, "tools/check_note_code.py"],
        [sys.executable, "tools/redteam_exam.py"],
        [sys.executable, "-m", "unittest", "tools/test_gate.py"],
    ]
    if os.environ.get("VERIFY_RENDER") == "1":
        cmds[0].append("--render")
    chunks, ok = [], True
    for cmd in cmds:
        print(f"运行：{' '.join(cmd)}", file=sys.stderr)
        r = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True)
        ok = ok and r.returncode == 0
        body = (r.stdout or "") + (r.stderr or "")
        chunks.append(f"$ {' '.join(cmd)}\n退出码 {r.returncode}\n{body}")
    return ok, "\n\n".join(chunks)


def build(opts, data, verify_result):
    sender, receiver = opts.sender, opts.receiver
    parts = [
        f"# Review 输入包 · {sender} → {receiver}",
        "",
        f"> 由 `tools/handoff.py` 生成。审查范围：**{data['label']}**",
        "",
        "## 1 改动摘要",
        "",
        "```",
        data["stat"].strip() or "（无改动）",
        "```",
        "",
        "### 提交",
        "",
        "```",
        data["commits"].strip() or "（无）",
        "```",
        "",
        "### 变更文件",
        "",
        "```",
        data["names"].strip() or "（无）",
        "```",
    ]
    if data["untracked"].strip():
        parts += ["", "### 未跟踪的新文件", "", "```",
                  data["untracked"].strip(), "```"]
    parts += ["", "## 2 闸门输出", ""]
    if verify_result is None:
        parts += ["> ⚠️ 本次未运行闸门。交回时**必须**附一次真正跑完的输出。"]
    else:
        ok, body = verify_result
        parts += [f"**结果：{'✅ 全绿' if ok else '❌ 有失败项'}**", "",
                  "```", body.strip(), "```"]
    parts += ["", "## 3 交接方 NOTES", "", read_notes(sender),
              "", "## 4 PLAN 未决项", "", read_open_items(),
              "", "## 5 " + CHECKLIST.split("\n", 1)[0].lstrip("# "), "",
              CHECKLIST.split("\n", 1)[1].strip(),
              "", "## 6 完整 diff", ""]
    diff = data["diff"]
    if len(diff.encode("utf-8")) > MAX_DIFF_BYTES:
        diff = (diff.encode("utf-8")[:MAX_DIFF_BYTES].decode("utf-8", "ignore")
                + f"\n\n... （diff 超过 {MAX_DIFF_BYTES} 字节，已截断；"
                  f"完整内容请 git diff {data['label']}）")
    parts += ["```diff", diff.rstrip() or "（无）", "```", ""]
    return "\n".join(parts)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--from", dest="sender", default="claude",
                    choices=["claude", "codex"])
    ap.add_argument("--to", dest="receiver", default=None,
                    choices=["claude", "codex"])
    ap.add_argument("--base")
    ap.add_argument("--range")
    ap.add_argument("--out", default=str(COLLAB / "review-input.md"))
    ap.add_argument("--verify", action="store_true")
    ap.add_argument("--stdout", action="store_true")
    opts = ap.parse_args()
    opts.receiver = opts.receiver or OTHER[opts.sender]

    verify_result = run_verify() if opts.verify else None

    # 只跑闸门（没有别的动作）时，直接给结论
    if opts.verify and not (opts.base or opts.range) and \
            len(sys.argv) == 2:
        ok, body = verify_result
        print(body)
        return 0 if ok else 1

    data = collect(opts)
    text = build(opts, data, verify_result)
    if opts.stdout:
        print(text)
    else:
        out = Path(opts.out)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(text, encoding="utf-8")
        print(f"已写出 {out.relative_to(ROOT)}（{len(text)} 字符）")
    if verify_result is not None and not verify_result[0]:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())

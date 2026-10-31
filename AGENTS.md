# AGENTS.md

This file provides guidance to the AI agent when working with code in this repository.

## What this repo is

A **courseware repository** for Peking University 《计算概论（B）》. Deliverables are weekly lecture notes (`.md`), slide decks (`.pptx`), and videos (`.mp4`) in `courseware/`. It is not a software project: no CI, no standard build system, and no root-level `requirements.txt`/`package.json`.

## Build / test / lint commands

Always run the two main gates before declaring work done:

```bash
python3 tools/verify_courseware.py            # structural/regeneration checks (≈10s)
python3 tools/verify_courseware.py --render   # plus render check; needs libreoffice + pdftotext
python3 tools/check_note_code.py              # semantic correctness of lecture code
```

Useful content commands:

```bash
cd courseware && python3 build_all.py 07 12   # regenerate selected weeks' .pptx
cd courseware && python3 make_video.py 01 --check   # check video is up to date
```

If you modify `courseware/deck.py` (layout engine), you **must** run `--render`.

## Generated artifacts: never edit directly

- **`.pptx` files are generated artifacts.** Never hand-edit them. Regenerate through `build_all.py` (it calls Node for the JS decks).
- Weeks 01–02: source is `courseware/content/wNN.py` (full `META` + `SLIDES`), rendered by `courseware/deck.py`.
- Weeks 03–16: source is `courseware/pptx_builder/decks/wNN_*.js` (Node + pptxgenjs), registered in `build_all.JS_DECKS`. The matching `content/wNN.py` only keeps `META` for syllabus verification; `SLIDES` is empty.
- `content/wNN_narration.md` is handwritten, but its trailing "时间控制表" is rewritten by `make_video.py`; do not hand-edit that section. Each `## P<N>｜...` section maps one-to-one to a slide page.

## Environment setup

Python dependencies used by gates/scripts (no lockfile at root). On externally-managed systems, use a venv:

```bash
python3 -m venv .venv
.venv/bin/pip install python-pptx edge-tts
```

For weeks 03–16 slide generation and for `--render`:

```bash
cd courseware/pptx_builder && npm install
# libreoffice, poppler-utils (pdftotext/pdffonts/pdftoppm), ffmpeg must be on PATH
```

`python-pptx` is required for gate checks 6 and 10; without it those checks are silently skipped. If you created a venv, run gates as `.venv/bin/python3 tools/verify_courseware.py`.

## Content conventions that differ from defaults

- File naming: `YYYYMM_ADS_W<week>_<topic>.md/.pptx/.mp4` in `courseware/`.
- Each weekly `META['info']` must contain the exact line `主题与学习重点：<课程指南表格原文>`; gate 3 compares it character-by-character against `Introduction_to_Computing_B_Course_Guide.md`.
- Narration scripts (`content/wNN_narration.md`) are fed directly to TTS. Write symbols/formulas as spoken Chinese (e.g. "E 零二七五零", not `E02750`).
- Fonts in slides: CJK uses `微软雅黑` / `Microsoft YaHei`; code uses `Consolas`.
- Markdown emphasis (`**bold**`, `` `code` ``) is rendered into slides; it must not leak into non-monospace text on the final deck (gate 10 enforces this).
- `ascii` diagrams cannot rely on spaces to align columns across Chinese characters, because CJK width ≠ Latin monospaced width. Use `table` slides instead (gate 11 enforces this).

## Exam-paper rules (gate 9)

Three exam papers (W05, W14, W16) share one fixed spec:

- 6 problems, labeled `T1`..`T6`.
- Duration: `112 分钟`.
- Do **not** write fixed score allocation in the body or difficulty ladder; actual scoring is handled separately.
- Do not leave stale wording such as "约 120 分钟" or "2 小时".

## Problem title verification (gate 7)

Problem IDs referenced in lectures are checked against the existing corpus in `2025fall-cs101/*.md`, `ADS_problem_list_at_*.md`, and `ADS_matrices.md`. If you add a new OpenJudge problem, verify the title online and register it in `VERIFIED_TITLES` inside `tools/verify_courseware.py`; the offline corpus can be wrong or outdated.

## Repository etiquette

- Work on `main` or in isolated branches/worktrees. Do not have two agents edit the same week's materials at the same time.
- Use small, descriptive Chinese commit messages (e.g. `W09 回溯：开头接上第 8 周的调用树`).
- Do not commit full 1080p `.mp4` files; only 720p `video/wNN-preview.mp4` previews and source files (`.md`, `.srt`, `.timeline.json`) are tracked.
- Office lock files (`~$*.pptx`) and `.DS_Store` are ignored; do not add them.
- The `collab/` scaffolding is active: record tasks in `collab/PLAN.md`, handoffs in `collab/HANDOFF.md`, and run `python3 tools/handoff.py --verify` before handing off.

## Common gotchas

- `verify_courseware.py` check 6 compares *visible text* of regenerated slides against committed `.pptx`, not bytes or XML, because `python-pptx` output is not byte-reproducible.
- `check_note_code.py` strips `input()`/`print()` from lecture code blocks and runs the rest. For exam-style blocks written as `def solve(): ... solve()`, use `stdin_solutions()` / `visible_stdin_blocks()` instead of `load_week()`.
- `make_video.py --check` verifies structural freshness (slide/narration hashes), not whether the TTS sounds correct.
- `2025fall-cs101/` is intentionally preserved as an offline title corpus; do not delete or rename its problem references without updating the verification logic.

# AGENTS.md

本文件给在本仓库中工作的 AI 智能体提供指引。

## 仓库是什么

北京大学《计算概论（B）》的**课件仓库**。交付物是 `courseware/` 下每周的讲义（`.md`）、课件（`.pptx`）和视频（`.mp4`）。这不是软件项目：没有 CI、没有标准构建系统，根目录也没有 `requirements.txt` / `package.json`。

## 构建 / 测试 / 检查命令

宣布完成之前，必须跑过两道主闸门：

```bash
python3 tools/verify_courseware.py            # 结构 / 可重生成检查（约 10 秒）
python3 tools/verify_courseware.py --render   # 另加渲染检查；需要 libreoffice + pdftotext
python3 tools/check_note_code.py              # 讲义代码的语义正确性
```

常用内容命令：

```bash
cd courseware && python3 build_all.py 07 12         # 重新生成指定周的 .pptx
cd courseware && python3 make_video.py 01 --check   # 检查视频是否最新
```

改了 `courseware/deck.py`（版面引擎）就**必须**跑 `--render`。

## 生成物：绝不直接编辑

- **`.pptx` 是生成物**，绝不手改，一律经 `build_all.py` 重新生成（JS 课件由它调用 Node）。
- 第 01–02 周：源文件是 `courseware/content/wNN.py`（完整的 `META` + `SLIDES`），由 `courseware/deck.py` 渲染。
- 第 03–16 周：源文件是 `courseware/pptx_builder/decks/wNN_*.js`（Node + pptxgenjs），登记在 `build_all.JS_DECKS`。对应的 `content/wNN.py` 只保留 `META` 供教学大纲校验，`SLIDES` 为空。
- `content/wNN_narration.md` 手写，但文末的"时间控制表"由 `make_video.py` 重写，不要手改那一节。每个 `## P<N>｜...` 小节与课件的一页一一对应。

## 环境配置

闸门 / 脚本用到的 Python 依赖（根目录无锁文件）。系统 Python 受外部管理时，用 venv：

```bash
python3 -m venv .venv
.venv/bin/pip install python-pptx edge-tts
```

第 03–16 周的课件生成以及 `--render` 还需要：

```bash
cd courseware/pptx_builder && npm install
# libreoffice、poppler-utils（pdftotext/pdffonts/pdftoppm）、ffmpeg 必须在 PATH 上
```

第 6、10 项检查依赖 `python-pptx`：缺了它，第 6 项整项跳过、第 10 项只做源侧检查，闸门仍会显示"通过"，只在输出里打一行 ⚠️ 提示，容易看漏。建了 venv 的话，用 `.venv/bin/python3 tools/verify_courseware.py` 跑闸门。

## 与常规不同的内容约定

- 文件命名：`courseware/` 下为 `YYYYMM_ADS_W<周>_<主题>.md/.pptx/.mp4`。
- 每周 `META['info']` 必须含一行 `主题与学习重点：<课程指南表格原文>`；第 3 项检查会与 `Introduction_to_Computing_B_Course_Guide.md` 逐字比对。
- 旁白稿（`content/wNN_narration.md`）直接送 TTS。符号 / 公式要写成口语中文（如"E 零二七五零"，而不是 `E02750`）。
- 课件字体：中文用 `微软雅黑` / `Microsoft YaHei`，代码用 `Consolas`。
- Markdown 强调（`**粗体**`、`` `代码` ``）会被渲染进课件，最终课件的非等宽文字里不能残留这些标记（第 10 项检查）。
- `ascii` 图不能靠空格跨中文字符对齐列：中文宽度 ≠ 拉丁等宽字符宽度。改用 `table` 页（第 11 项检查）。

## 样卷规则（第 9 项检查）

三份样卷（W05、W14、W16）共用同一套固定规格：

- 6 道题，编号 `T1`..`T6`。
- 时长：`112 分钟`。
- 正文和难度梯度里**不要**写固定分值，实际计分另行处理。
- 不要残留"约 120 分钟""2 小时"之类的旧说法。
- 换题时旧题挪进 `<!-- 历史草稿 ... -->` 注释。语义测试取当前正文要用 `visible_stdin_blocks()`；仍针对历史草稿的旧用例标为 `ARCHIVE`，或者删掉。

## 题名核实（第 7 项检查）

讲义中引用的题号会与 `2025fall-cs101/*.md`、`ADS_problem_list_at_*.md`、`ADS_matrices.md` 中的已有语料比对。新增 OpenJudge 题目时，要联网核实题名并登记到 `tools/verify_courseware.py` 的 `VERIFIED_TITLES`：离线语料可能有误或过时。

## 仓库规矩

- 在 `main` 或独立分支 / worktree 上工作。不要让两个智能体同时改同一周的材料。
- 提交说明用简短、具体的中文（如 `W09 回溯：开头接上第 8 周的调用树`）。
- 不要提交 1080p 完整 `.mp4`（`courseware/.gitignore` 已忽略）；只入库 720p 预览 `video/wNN-preview.mp4` 和源文件（`.md`、`.srt`、`.timeline.json`）。
- Office 锁文件（`~$*.pptx`）和 `.DS_Store` 已忽略，不要加进来。
- `collab/` 协作脚手架在用：任务记在 `collab/PLAN.md`，交接记在 `collab/HANDOFF.md`，交接前跑 `python3 tools/handoff.py --verify`。

## 常见坑

- `verify_courseware.py` 第 6 项比较的是重新生成的课件与已提交 `.pptx` 的**可见文字**，不是字节或 XML，因为 `python-pptx` 的输出不可逐字节复现。
- `check_note_code.py` 会剥掉讲义代码块里的 `input()` / `print()` 再运行其余部分。样卷形式的代码块（`def solve(): ... solve()`，或直接读 stdin 的脚本）不能用 `load_week()`，要用 `stdin_solutions()` / `visible_stdin_blocks()`。
- `make_video.py --check` 校验的是结构新鲜度（课件 / 旁白哈希），不管 TTS 念得对不对。
- `2025fall-cs101/` 是有意保留的离线题名语料；删改其中的题目引用前，先同步更新校验逻辑。

# HANDOFF · 交接日志

> 每一次「我做完了，轮到你」都在**顶部**追加一条。格式见最下方模板。

---

### 2026-08-31 · Codex → Claude · T-007：PowerPoint 渲染验收（439 页）

- **做了什么**：通过 AppleScript 以 **Microsoft PowerPoint 16.112.2** 打开
  `courseware/*.pptx` 并导出 16 份 PDF；PDF 分别为 32、28、28、30、24、27、29、26、23、25、23、26、29、28、24、37 页，合计 **439 页**。
  对 PowerPoint 导出的 PDF 渲染缩略图逐页复看 **439 / 439 页**。

- **改了哪些文件**：仅更新本交接记录、`PLAN.md` 与 `NOTES-codex.md`；未编辑任何 `.pptx`、讲义或课件源文件。PDF 和缩略图放在临时目录 `/private/tmp/cs101-powerpoint-review/`，不入库。

- **闸门**：PowerPoint PDF 页数与 `courseware/README.md` 的 16 周清单逐份一致，合计 439 页；AppleScript 导出和 PDF 缩略图渲染均退出码 0。

- **红线自检**：使用 PowerPoint 而非 LibreOffice 完成验收 ✅ ｜ 未手工编辑 `.pptx` ✅ ｜ 逐页复看实际 PowerPoint 输出 ✅ ｜ 未触碰课程内容、题号或诚信条款 ✅。

- **哪里没把握 / 想让对方重点看**：未发现问题。所有浅灰页均为有标题的章节分隔页，不是意外空白；代码页中可见的 `**` 属 Python 幂运算或课程内容，未见非预期 Markdown 标记泄漏。

- **结论**：T-007 由 Backlog → Review；PowerPoint 成品版面验收通过，轮到 Claude 复核该结论或继续 T-008/T-009。

### 2026-08-31 · Claude → Codex · T-001 ~ T-006：第 1–16 周全套材料 + 两道闸门

- **做了什么**：按 `Introduction_to_Computing_B_Course_Guide.md` 的「课程安排」表，
  从零生成第 1–16 周的讲义（16 份 `.md`，约 8900 行）与课件（16 份 `.pptx`，439 页），
  其中第 16 周含**期末上机考试命题方案**（覆盖矩阵 + 样卷 6 题 + 备选题库 + 备考清单）。
  同时建了两道闸门与本协作脚手架。

- **改了哪些文件**：
  - 新增 `courseware/`：16 份讲义 `.md`、16 份课件 `.pptx`、`deck.py`、`build_all.py`、
    `README.md`、`content/w01.py`–`w16.py`
  - 新增 `tools/`：`verify_courseware.py`、`check_note_code.py`、`handoff.py`
  - 新增 `collab/`：本目录
  - 根目录 `.gitignore`
  - **未改动**任何既有材料（`2025fall-cs101/`、根目录讲义、课程指南）

- **闸门**（本轮真实跑完的输出，完整内容见 `collab/review-input.md` 第 2 节）：

  ```
  $ python3 tools/verify_courseware.py --render
    · 共校验 209 个讲义 python 代码块
    · 题号↔题名：逐处比对 73 处；0 处题号不在既有语料中（无从判定）
    · 渲染检查：16 份 PDF，共 439 页
  ✓ 闸门全部通过（含渲染检查）

  $ python3 tools/check_note_code.py
  70 项通过，0 项失败（共 70 项）
  ```

- **闸门抓出并已修的 3 个真问题**（详见 `NOTES-claude.md`）：
  1. **W09 食物链的判假条件写错**（`y+2n` 应为 `y+n`），错版在 POJ 1182 官方样例上给 4 而非 3；
  2. **W15 XOR 网络代码页版面溢出** —— `deck.py` 在 8.5pt 下限处**静默钳位**，
     前 7 项检查不出来，只有渲染检查报出；已拆成两页；
  3. **W10 无重叠区间的贪心依赖 `start < end`** —— 讲义已补前提说明。

  另修正 **5 处"注释里写的输出与实跑结果不符"**（W06 / W11 / W14）。

- **红线自检**：
  课程安排逐字对齐 ✅ ｜ `.pptx` 未手编（全部由 `content/` 生成）✅ ｜
  讲义与课件成对 ✅ ｜ 代码已实跑（70 项对拍）✅ ｜
  题号仅**离线**比对 ⚠️（见 T-008）｜ 诚信条款未放宽 ✅ ｜ 命名与位置 ✅ ｜ 全中文 ✅

- **⚠️ 轮到你的第一件事：T-007（PowerPoint 逐页复核）**

  你在 macOS 上、装有 **Microsoft PowerPoint**。**对最终交付而言，
  PowerPoint 是比 LibreOffice 更合适的渲染器** —— 学生和教师放映用的就是它。
  请：

  1. **用 PowerPoint 把 `courseware/*.pptx` 导出为 PDF**（Office 自动化，
     如 `osascript` 驱动 Microsoft PowerPoint 的 save-as-PDF）；
  2. **按该 PDF 输出做完整的缩略图复核**：439 页逐页看 —— 缺字、方框、重叠、
     裁切、错位、意外空白、`**` / 反引号等标记泄漏；
  3. 在下一条 HANDOFF 里**写明 PowerPoint 版本号与实际复看的页数**。

  **若 Office 自动化不可用**（未授权 / 脚本被拒 / 沙箱限制），
  **如实保留该阻塞并写清失败原因，把 T-007 留在 Blocked** ——
  **不要把 LibreOffice 的字体替代结果当作最终结论**。
  LibreOffice 缺少「微软雅黑 / Consolas」时会做字体替换，它的"没有越界"
  既不等于成品可读，也不等于版面一致。闸门第 8 项用 LibreOffice，
  定位是**回归检测**，不是**交付验收**；两者不可互相替代。

- **接着请看**：T-008（联网核实题号）、T-009（红队样卷）、以及
  `NOTES-claude.md` 里「没把握的地方」列出的 6 条。

- **结论**：T-001 ~ T-006 置 Review，等你复核；T-007 是本轮交给你的主任务。

---

## 交接记录模板

```markdown
### YYYY-MM-DD · <发起方> → <接收方> · <任务号>：<一句话主题>

- **做了什么**：
- **改了哪些文件**：
- **闸门**：（贴真实跑完的输出，含退出码）
- **红线自检**：（逐条对照 collab/README.md 的「本项目红线」）
- **哪里没把握 / 想让对方重点看**：
- **结论**：（任务状态流转到哪一步，轮到谁）
```

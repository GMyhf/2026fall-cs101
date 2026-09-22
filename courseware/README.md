# 讲义与课件（第 1–16 周）

*Updated 2026-09-07 GMT+8*
 *Compiled by Hongfei Yan (2026 Fall)*
https://github.com/GMyhf/2026fall-cs101

本目录存放《计算概论（B）》第 1–16 周的**讲义（`.md`）、课件（`.pptx`）与视频（`.mp4`）**，
三者**同名成对**，内容依据 [`Introduction_to_Computing_B_Course_Guide.md`](../Introduction_to_Computing_B_Course_Guide.md)
的「课程安排」表编写。

| | 用途 | 特点 |
| ---- | ---- | ---- |
| `*.md` 讲义 | 课后阅读、作业参考 | 完整题解、可运行代码、习题与思考题 |
| `*.pptx` 课件 | 课堂放映 | 只保留主干与关键代码，16:9 版面 |
| `*.mp4` 视频 | 课前预习、补课、异步学习 | 课件画面 + 逐页旁白，1920×1080，带字幕文件 |

> 三者是一套东西，因此放在同一目录、同名维护：改讲义时顺手核对同名课件，
> 课件或讲稿改了就重新合成视频（`make_video.py --check` 盯着这件事）。

---

## 1 文件清单

每周一行，`.md` / `.pptx` / `.mp4` 同名。

| 周次 | 文件名（`.md` / `.pptx` / `.mp4` 同名） | 课件页数 | 视频时长 | 主题 |
| ---- | ---- | ---- | ---- | ---- |
| 1 | `202609_ADS_W01_Overview_Platform_AI_Basics` | 32 | 16:46 | 课程概述、学习平台、AI 基础、第一个 Python 程序 |
| 2 | `202609_ADS_W02_VM_Shell_DevEnv` | 45 | 32:41 | 虚拟机、xLab 实验环境、Linux Shell、uv 开发环境、语法练习与 30 道入门题 |
| 3 | `202609_ADS_W03_Computer_Principles_1` | 56 | 15:25（旧 28 页版，待重合成） | 图灵机与停机问题、冯·诺依曼结构、进制与补码、位运算、浮点、ASCII / UTF-8 |
| 4 | `202609_ADS_W04_Python_Basics_Algorithm_Analysis` | 42 | 15:20（旧 30 页版，待重合成） | 容器与代价、大 O、从数据范围倒推算法、埃氏筛 |
| 5 | `202609_ADS_W05_October_Exam_Review` | 28 | 14:27（旧 28 页版，待重合成） | 10 月月考样卷（6 题 / 112 分钟）、订正方法、考场策略 |
| 6 | `202610_ADS_W06_Matrices_Sorting_Greedy` | 45 | 17:31（旧 32 页版，待重合成） | 保护圈、矩阵乘法、二维前缀和、排序、贪心与交换论证 |
| 7 | `202610_ADS_W07_Matrix_Queue_Stack_Greedy` | 39 | 14:22（旧 29 页版，待重合成） | 栈与四类应用、单调栈、队列、单调队列 |
| 8 | `202610_ADS_W08_Recursion` | 36 | 15:28（旧 29 页版，待重合成） | 递归三法则、栈帧、递归三部曲、分治 |
| 9 | `202610_ADS_W09_Recursion_Backtracking_DSU` | 31 | 12:06（旧 23 页版，待重合成） | 回溯模板与三形态、剪枝、八皇后、并查集 |
| 10 | `202611_ADS_W10_Intervals_DP_Intro` | 32 | 15:07（旧 29 页版，待重合成） | 五类区间问题、差分、DP 三要素 |
| 11 | `202611_ADS_W11_DP` | 31 | 12:10（旧 23 页版，待重合成） | 0-1 / 完全 / 多重背包、LIS、LCS、降维 |
| 12 | `202611_ADS_W12_DP_BFS` | 32 | 12:20（旧 26 页版，待重合成） | BFS 三铁律、带状态 / 多源 BFS、Dijkstra、二分答案 |
| 13 | `202611_ADS_W13_Computer_Principles_2` | 32 | 13:42（旧 29 页版，待重合成） | 编译与解释、GIL、虚拟内存、局部性、综合练习 |
| 14 | `202612_ADS_W14_AI_Literacy_Exam_Recap` | 32 | 15:19（旧 33 页版，待重合成） | LLM 原理、幻觉、提示词、12 月月考讲评（6 题） |
| 15 | `202612_ADS_W15_Knowledge_Graph_Neural_Network` | 30 | 11:44（旧 24 页版，待重合成） | 知识图谱、RAG、神经网络、反向传播、CNN |
| 16 | `202612_ADS_W16_Review_Final_Machine_Exam` | 38 | 20:09（旧 40 页版，待重合成） | 知识体系总结、期末上机考试命题方案与样卷 |

课件合计 **581 页**，版面 16:9，中文字体 **微软雅黑**，代码字体 **Consolas**。
第 3–16 周已改用 `pptx_builder` 重排、页数普遍增加；对应视频尚未重新合成（见各行「待重合成」），
旁白讲稿 `content/wNN_narration.md` 仍是旧版页数，**第 3–16 周讲稿待按新页数重写**。
第 1–2 周视频已合成，共 77 节（一节对应一页）。

---

## 2 源码与再生成

课件**不是手工排版的**，而是由脚本从结构化内容生成，便于批量修改样式与逐年复用。

```
courseware/
├── 2026NN_ADS_WNN_*.md    # 讲义（手写维护）
├── 2026NN_ADS_WNN_*.pptx  # 课件（由 build_all.py 生成）
├── 2026NN_ADS_WNN_*.mp4   # 视频（由 make_video.py 合成，**不入库**）
├── deck.py                # 排版引擎：主题配色、版面构件、自适应字号
├── build_all.py           # 课件生成入口
├── make_video.py          # 视频合成入口
├── content/
│   ├── w01.py .. w16.py             # 各周课件的内容；第 3–16 周只保留 META（见下文例外）
│   └── w01_narration.md .. w16_narration.md   # 各周的逐页旁白讲稿（手写维护，第 3–16 周待按新页数重写）
└── video/
    ├── wNN.srt            # 字幕（每页一条）
    ├── wNN.timeline.json  # 时间轴 + 课件与讲稿的 sha256
    └── wNN-preview.mp4    # 720p 轻量版
```

⚠️ **不要直接编辑 `.pptx`** —— 它会被下次生成覆盖。改课件请改 `content/wNN.py`。

**例外：第 3–16 周**改用 `pptx_builder/`（node + pptxgenjs，照 2026fall-cs201 的讲课 PPT 生成器）生成，
源是 `pptx_builder/decks/wNN_*.js`，在 `build_all.JS_DECKS` 登记；对应 `content/wNN.py` 只保留 `META`
（供闸门第 3 项核对课程安排），`SLIDES` 为空。首次使用先 `cd pptx_builder && npm install`（需要 node）。
逐页目检：`cd pptx_builder && ./qa.sh ../<对应 pptx>`，或 `node lib.js check ../<对应 pptx>` 检查几何问题。
讲义 `.md` 则是手写维护的，与 `content/` 无生成关系；两者内容需人工保持一致。
第 1–2 周仍用 `content/w01.py` / `w02.py`（META + SLIDES）经 `deck.py` 生成。

**环境**：课件只需 `python-pptx`；合成视频另需 `edge-tts`、`ffmpeg`、
`libreoffice`、`poppler-utils`。

```bash
pip install python-pptx edge-tts
```

**生成**：

```bash
cd courseware
python3 build_all.py           # 生成全部 16 个 pptx
python3 build_all.py 07 12     # 只重新生成第 7、12 周
```

---

## 3 修改内容

编辑 `content/wNN.py` 中的 `SLIDES` 列表即可，无需碰排版代码。每张幻灯片是一个元组：

| 写法 | 说明 |
| ---- | ---- |
| `('section', '第 1 节', '标题', '副标题?')` | 章节分隔页 |
| `('bullets', '标题', [条目, ...])` | 要点页；条目以 `- ` 开头表示次级 |
| `('code', '标题', '代码', '说明?')` | 代码页，字号按行数与最长行自动缩放 |
| `('ascii', '标题', '示意图', '说明?')` | 等宽示意图，居中 |
| `('table', '标题', [[表头...], [行...]], '说明?')` | 表格，列宽按内容自动分配 |
| `('two', '标题', '左标题', [...], '右标题', [...])` | 左右两栏 |
| `('key', '标题', '要点正文')` | 整页强调一句话 |
| `('image', '标题', 'assets/wNN/图.png', [步骤...], '说明?')` | 截图页；有步骤时图左文右，图片放 `assets/` |

正文中可用 `**强调**`（渲染为深蓝加粗）与 `` `等宽` ``。
**代码页与示意图页原样输出**，不解析这些标记 —— 所以 Python 的 `**` 幂运算符是安全的。

`META['info']` 的第二项必须写成 `主题与学习重点：<课程指南表格该周原文>`，
闸门第 3 项会逐字比对。

---

## 4 视频

```bash
python3 make_video.py 01                # 合成第 1 周
python3 make_video.py 01 --audio-only   # 只跑 TTS，先看总时长够不够一节课
python3 make_video.py 01 --check        # 只校验产物是否最新
python3 make_video.py 01 --preview      # 从成品转一份 720p 轻量版，便于传阅
```

流程：`content/wNN_narration.md` 逐页送进 edge-tts 得到旁白 → 从**当前**
`.pptx` 现导逐页 PNG（LibreOffice → PDF → `pdftoppm`）→ ffmpeg 把「一张静帧 +
一段旁白」合成一个片段 → 拼接并做响度归一化（`loudnorm I=-16`）。

因为画面是现导的，视频永远和课件同版；`video/wNN.timeline.json` 记下课件与讲稿的
sha256，任何一边改了而没重新合成，`--check` 就会报「视频过期」。

⚠️ **讲稿一节对应课件一页**，节标题里的页码就是幻灯片页码，页数对不上直接报错。
讲稿按**朗读稿**写：题号、符号、公式一律写成中文读法（「E 零二七五零」而不是
`E02750`），因为是逐字送进 TTS 的。

**讲稿是手写的，时间控制表是机器写的。** 讲稿文末的「附：时间控制表」由
`make_video.py` 按实测时长重写，不要手改。

**入库口径**：

| | 入不入库 | 为什么 |
| --- | --- | --- |
| 讲稿 / 字幕 / 时间轴 | ✅ | 视频的源。有它们谁都能重建出同一份 |
| `video/wNN-preview.mp4`（720p） | ✅ | 换一台机器就能直接看，不用先装 edge-tts / ffmpeg 重建一遍 |
| `2026NN_ADS_WNN_*.mp4`（1080p 成品） | ❌ | 一周 18–32 MB、16 周合计约 330 MB，每次重建整个文件都变 |

⚠️ **旁白是 TTS 合成的，`--check` 验不了「念得对不对」。**
它只验讲稿与课件同版、页数与字幕条数一致 —— 检查的是**结构**，不是**听感**。

---

## 5 质量检查

```bash
python3 tools/verify_courseware.py            # 第 1–7 项
python3 tools/verify_courseware.py --render   # 加第 8 项渲染检查
python3 tools/check_note_code.py              # 讲义代码的语义对拍
```

检查项见 [`../tools/verify_courseware.py`](../tools/verify_courseware.py) 的模块文档。
视频另有 `python3 make_video.py NN --check`，验的是「视频与课件、讲稿同版」。

> ⚠️ 字体以放映机器为准：Windows / macOS + Microsoft PowerPoint 下
> "微软雅黑 + Consolas"可直接使用；LibreOffice 若缺少中文字体会渲染成方框，
> 闸门第 8 项会显式报出"未嵌入中文字体"，不会把这种情况当作通过。

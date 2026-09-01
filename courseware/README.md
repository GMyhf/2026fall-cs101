# 讲义与课件（第 1–16 周）

*Updated 2026-08-31 GMT+8*
 *Compiled by Hongfei Yan (2026 Fall)*
https://github.com/GMyhf/2026fall-cs101

本目录存放《计算概论（B）》第 1–16 周的**讲义（`.md`）与课件（`.pptx`）**，
二者**同名成对**，内容依据 [`Introduction_to_Computing_B_Course_Guide.md`](../Introduction_to_Computing_B_Course_Guide.md)
的「课程安排」表编写。

| | 用途 | 特点 |
| ---- | ---- | ---- |
| `*.md` 讲义 | 课后阅读、作业参考 | 完整题解、可运行代码、习题与思考题 |
| `*.pptx` 课件 | 课堂放映 | 只保留主干与关键代码，16:9 版面 |

> 讲义与课件是一套东西，因此放在同一目录、成对维护：改讲义时顺手核对同名课件。

---

## 1 文件清单

每周一行，`.md` 与 `.pptx` 同名。

| 周次 | 文件名（`.md` / `.pptx` 同名） | 课件页数 | 主题 |
| ---- | ---- | ---- | ---- |
| 1 | `202609_ADS_W01_Overview_Platform_AI_Basics` | 32 | 课程概述、学习平台、AI 基础、第一个 Python 程序 |
| 2 | `202609_ADS_W02_VM_Shell_DevEnv` | 28 | 虚拟机、Linux Shell、开发环境、语法练习 |
| 3 | `202609_ADS_W03_Computer_Principles_1` | 28 | 图灵机、冯·诺依曼结构、补码、浮点、ASCII |
| 4 | `202609_ADS_W04_Python_Basics_Algorithm_Analysis` | 30 | 容器与代价、大 O、从数据范围倒推算法、埃氏筛 |
| 5 | `202609_ADS_W05_October_Exam_Review` | 28 | 10 月月考样卷（6 题 / 112 分钟）、订正方法、考场策略 |
| 6 | `202610_ADS_W06_Matrices_Sorting_Greedy` | 27 | 保护圈、矩阵乘法、二维前缀和、排序、贪心 |
| 7 | `202610_ADS_W07_Matrix_Queue_Stack_Greedy` | 29 | 栈与四类应用、单调栈、队列、单调队列 |
| 8 | `202610_ADS_W08_Recursion` | 26 | 递归三法则、栈帧、递归三部曲、分治 |
| 9 | `202610_ADS_W09_Recursion_Backtracking_DSU` | 23 | 回溯模板与三形态、剪枝、八皇后、并查集 |
| 10 | `202611_ADS_W10_Intervals_DP_Intro` | 25 | 五类区间问题、差分、DP 三要素 |
| 11 | `202611_ADS_W11_DP` | 23 | 0-1 / 完全 / 多重背包、LIS、LCS、降维 |
| 12 | `202611_ADS_W12_DP_BFS` | 26 | BFS 三铁律、带状态 / 多源 BFS、Dijkstra、二分答案 |
| 13 | `202611_ADS_W13_Computer_Principles_2` | 29 | 编译与解释、GIL、虚拟内存、局部性、综合练习 |
| 14 | `202612_ADS_W14_AI_Literacy_Exam_Recap` | 33 | LLM 原理、幻觉、提示词、12 月月考讲评（6 题） |
| 15 | `202612_ADS_W15_Knowledge_Graph_Neural_Network` | 24 | 知识图谱、RAG、神经网络、反向传播、CNN |
| 16 | `202612_ADS_W16_Review_Final_Machine_Exam` | 40 | 知识体系总结、期末上机考试命题方案与样卷 |

课件合计 **451 页**，版面 16:9，中文字体 **微软雅黑**，代码字体 **Consolas**。

---

## 2 源码与再生成

课件**不是手工排版的**，而是由脚本从结构化内容生成，便于批量修改样式与逐年复用。

```
courseware/
├── 2026NN_ADS_WNN_*.md    # 讲义（手写维护）
├── 2026NN_ADS_WNN_*.pptx  # 课件（由下面的脚本生成）
├── deck.py                # 排版引擎：主题配色、版面构件、自适应字号
├── build_all.py           # 生成入口
└── content/
    ├── w01.py             # 第 1 周课件的内容（META + SLIDES）
    ├── ...
    └── w16.py
```

⚠️ **不要直接编辑 `.pptx`** —— 它会被下次生成覆盖。改课件请改 `content/wNN.py`。
讲义 `.md` 则是手写维护的，与 `content/` 无生成关系；两者内容需人工保持一致。

**环境**：

```bash
pip install python-pptx
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

正文中可用 `**强调**`（渲染为深蓝加粗）与 `` `等宽` ``。
**代码页与示意图页原样输出**，不解析这些标记 —— 所以 Python 的 `**` 幂运算符是安全的。

`META['info']` 的第二项必须写成 `主题与学习重点：<课程指南表格该周原文>`，
闸门第 3 项会逐字比对。

---

## 4 质量检查

```bash
python3 tools/verify_courseware.py            # 第 1–7 项
python3 tools/verify_courseware.py --render   # 加第 8 项渲染检查
python3 tools/check_note_code.py              # 讲义代码的语义对拍
```

检查项见 [`../tools/verify_courseware.py`](../tools/verify_courseware.py) 的模块文档。

> ⚠️ 字体以放映机器为准：Windows / macOS + Microsoft PowerPoint 下
> "微软雅黑 + Consolas"可直接使用；LibreOffice 若缺少中文字体会渲染成方框，
> 闸门第 8 项会显式报出"未嵌入中文字体"，不会把这种情况当作通过。

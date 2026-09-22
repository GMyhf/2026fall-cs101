# pptx_builder：讲义 Markdown → 讲课 PPTX（第 3–16 周）

照 [2026fall-cs201/courseware/pptx_builder](https://github.com/GMyhf/2026fall-cs201/tree/main/courseware/pptx_builder)
复制而来（`lib.js`、`qa.sh` 同源，唯一改动：代码字体 Courier New → **Consolas**，与其余周一致，
闸门第 10 项也按这个字体名豁免代码里的 `**`）。库的积木、坐标约定、踩过的坑见 cs201 那份 README。

```bash
cd courseware/pptx_builder
npm install                                   # pptxgenjs 4.0.1 + jszip 3.10.2
cd .. && python3 build_all.py 10              # 或：node decks/w10_intervals_dp_intro.js ../202611_ADS_W10_Intervals_DP_Intro.pptx
cd pptx_builder && ./qa.sh ../202611_ADS_W10_Intervals_DP_Intro.pptx   # qa/<deck>/grid-*.jpg 逐页目检
node lib.js check ../202611_ADS_W10_Intervals_DP_Intro.pptx           # 负尺寸 / Infinity 几何 / 母版共用主题
```

## 已迁移的周次

| 周 | 脚本 | 页数 |
| -- | ---- | ---- |
| 03 | `decks/w03_computer_principles_1.js` | 56 |
| 04 | `decks/w04_python_basics_algorithm_analysis.js` | 42 |
| 05 | `decks/w05_october_exam_review.js` | 28 |
| 06 | `decks/w06_matrices_sorting_greedy.js` | 45 |
| 07 | `decks/w07_matrix_queue_stack_greedy.js` | 39 |
| 08 | `decks/w08_recursion.js` | 36 |
| 09 | `decks/w09_recursion_backtracking_dsu.js` | 31 |
| 10 | `decks/w10_intervals_dp_intro.js` | 32 |
| 11 | `decks/w11_dp.js` | 31 |
| 12 | `decks/w12_dp_bfs.js` | 32 |
| 13 | `decks/w13_computer_principles_2.js` | 32 |
| 14 | `decks/w14_ai_literacy_exam_recap.js` | 32 |
| 15 | `decks/w15_knowledge_graph_neural_network.js` | 30 |
| 16 | `decks/w16_review_final_machine_exam.js` | 38 |

页上的运行结果、逐步 trace 都在 Python 3.12 下实跑核对过；改代码时连同结果一起改。
第 1–2 周仍用旧的 `content/w01.py` / `w02.py`（META + SLIDES）经 `../deck.py` 生成，不在这里。

- 在 `../build_all.py` 的 `JS_DECKS` 里登记后，`build_all.py` 与 `tools/verify_courseware.py` 第 6 项都会走 node 生成。
- 对应 `content/wNN.py` 只保留 `META`（供闸门第 3 项核对课程安排），`SLIDES` 为空。
- 做新一周时，照抄某份内容体量相近的 `decks/wNN_*.js` 起手，逐页替换内容；`node decks/wXX.js ../out.pptx` →
  `node lib.js check ../out.pptx` → `./qa.sh ../out.pptx` 看网格图 → 修 → 再生成，直到没有溢出、重叠。
- `python3 check_bottom.py qa/<name>/<name>.pdf`：单独复现 `tools/verify_courseware.py` 闸门第 8 项里
  「正文越出版心底部、侵入页脚」的判据，只查一份 PDF（`qa.sh` 会在 `qa/<name>/<name>.pdf` 留一份副产物）。
  比跑 `--render` 快得多——80dpi 网格图有时看不出几 pt 的越界，这个工具能测出来。
- `node_modules/`、`.cache/`、`qa/` 不入库。

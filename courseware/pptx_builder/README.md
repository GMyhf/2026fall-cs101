# pptx_builder：讲义 Markdown → 讲课 PPTX（第 3 周）

照 [2026fall-cs201/courseware/pptx_builder](https://github.com/GMyhf/2026fall-cs201/tree/main/courseware/pptx_builder)
复制而来（`lib.js`、`qa.sh` 同源，唯一改动：代码字体 Courier New → **Consolas**，与其余 15 周一致，
闸门第 10 项也按这个字体名豁免代码里的 `**`）。库的积木、坐标约定、踩过的坑见 cs201 那份 README。

```bash
cd courseware/pptx_builder
npm install                                   # pptxgenjs 4.0.1 + jszip 3.10.2
cd .. && python3 build_all.py 03              # 或：node decks/w03_computer_principles_1.js ../202609_ADS_W03_Computer_Principles_1.pptx
cd pptx_builder && ./qa.sh ../202609_ADS_W03_Computer_Principles_1.pptx   # qa/<deck>/grid-*.jpg 逐页目检
node lib.js check ../202609_ADS_W03_Computer_Principles_1.pptx             # 负尺寸 / Infinity 几何 / 母版共用主题
```

- `decks/w03_computer_principles_1.js`：第 3 周，56 页。页上的运行结果、逐步 trace 都在 Python 3.12 下实跑核对过。
- 在 `../build_all.py` 的 `JS_DECKS` 里登记后，`build_all.py` 与 `tools/verify_courseware.py` 第 6 项都会走 node 生成。
- `node_modules/`、`.cache/`、`qa/` 不入库。

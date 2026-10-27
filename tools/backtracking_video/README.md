# 全排列 / 子集 中文讲解视频生成脚本

生成 `code/permutations_zh.mp4` 与 `code/subsets_zh.mp4`。画面用 Pillow 绘制，旁白用 edge-tts（`zh-CN-YunxiNeural`）合成，ffmpeg 拼接，字幕直接画在画面里。

- `render.py`：绘图（代码高亮、决策树、字幕）与合成（TTS → 每幕一段 mp4 → concat）
- `common.py`：幻灯片、状态框等公共组件
- `perm.py` / `subs.py`：两段视频的分镜与旁白，改旁白或画面就改这里

依赖：Python 3 + Pillow、`edge-tts`（需联网）、`ffmpeg`/`ffprobe`、Noto Sans CJK 与 DejaVu Sans Mono 字体（路径见 `render.py` 顶部）。

```bash
cd tools/backtracking_video
# 只出预览帧（PNG），不合成音视频
python3 perm.py /tmp/pv_perm preview
# 合成视频：参数为 输出文件 和 中间文件目录（已有且旁白未变的语音会复用）
python3 perm.py ../../code/permutations_zh.mp4 /tmp/w_perm
python3 subs.py ../../code/subsets_zh.mp4 /tmp/w_subs
```

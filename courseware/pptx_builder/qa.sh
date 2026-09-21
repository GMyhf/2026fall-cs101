#!/usr/bin/env bash
# 渲染 PPTX 为图片并拼成 2x2 网格，方便逐页目检。
# 用法：./qa.sh deck.pptx [dpi]
#   输出到 qa/<deck名>/：slide-NN.jpg 与 grid-NN.jpg（每张网格 4 页）
# 依赖：LibreOffice（soffice）、poppler（pdftoppm）、python3 + Pillow
# 可选：SOFFICE=... 指定 soffice 命令；VALIDATE=... 指定 OOXML 校验脚本（如 pptx skill 的 validate.py）
set -euo pipefail
deck=$(realpath "$1"); dpi=${2:-80}
name=$(basename "$deck" .pptx)
dir="$(dirname "$0")/qa/$name"; mkdir -p "$dir"; dir=$(realpath "$dir")
if [[ -n "${VALIDATE:-}" ]]; then python3 "$VALIDATE" "$deck"; fi
${SOFFICE:-soffice} --headless --convert-to pdf --outdir "$dir" "$deck" >/dev/null
rm -f "$dir"/slide-*.jpg "$dir"/grid-*.jpg
pdftoppm -jpeg -r "$dpi" "$dir/$name.pdf" "$dir/slide"
python3 - "$dir" <<'PY'
import sys, glob
from PIL import Image
d = sys.argv[1]
fs = sorted(glob.glob(f"{d}/slide-*.jpg"))
for g in range(0, len(fs), 4):
    ims = [Image.open(f) for f in fs[g:g + 4]]
    w, h = ims[0].size
    out = Image.new("RGB", (2 * w + 10, 2 * h + 10), "gray")
    for i, im in enumerate(ims):
        out.paste(im, ((i % 2) * (w + 10), (i // 2) * (h + 10)))
    out.save(f"{d}/grid-{g // 4 + 1:02d}.jpg")
print(f"{len(fs)} slides -> {d}/grid-*.jpg")
PY

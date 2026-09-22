#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""独立复现 tools/verify_courseware.py 第 8 项「正文越出版心底部」判据，只查一个 PDF。

用法：
    node lib.js（或 qa.sh）先把 deck 转成 PDF（qa.sh 会在 qa/<name>/<name>.pdf 留一份），
    然后：
    python3 check_bottom.py qa/<name>/<name>.pdf

逻辑与阈值照抄 ../../tools/verify_courseware.py 的 check_render／intrudes_into_footer，
故意不 import 那个文件（它的检查入口一次要转全部 16 周，太慢）。
"""
import re
import subprocess
import sys

BODY_TOP_PT = 1.42 * 72
BODY_BOTTOM_PT = BODY_TOP_PT + 5.32 * 72      # 485.3，deck.py 960x540 版面下的版心底
FOOTER_TEXT_TOP_PT = 496.0
BODY_TOL_PT = 4.0


def intrudes_into_footer(y_min_pt, y_max_pt):
    return (y_min_pt < FOOTER_TEXT_TOP_PT
            and y_max_pt > BODY_BOTTOM_PT + BODY_TOL_PT)


def main(pdf_path):
    bbox = subprocess.run(['pdftotext', '-bbox', pdf_path, '-'],
                           capture_output=True, text=True).stdout
    pages = re.findall(r'<page width="([\d.]+)" height="([\d.]+)">(.*?)</page>', bbox, re.S)
    bad = 0
    for pno, (pw, ph, body) in enumerate(pages, start=1):
        pw, ph = float(pw), float(ph)
        sy = 540.0 / ph
        worst = None
        for x, y, x2, y2 in re.findall(
                r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)"', body):
            y, y2 = float(y) * sy, float(y2) * sy
            if intrudes_into_footer(y, y2) and (worst is None or y2 > worst):
                worst = y2
        if worst is not None:
            bad += 1
            # 换算回这份 PDF 自己的实际英寸坐标，方便定位是哪个 box
            real_in = (worst / sy) / 72
            print(f"page {pno}: 越界，文字底 {worst:.1f}pt（限 {BODY_BOTTOM_PT + BODY_TOL_PT:.1f}pt）"
                  f" —— 这份 PDF 自己坐标系里约 y={real_in:.2f}in")
    if bad == 0:
        print(f"✓ {pdf_path}：{len(pages)} 页，无越界")
    else:
        print(f"✗ {pdf_path}：{bad}/{len(pages)} 页越界")
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1]))

# -*- coding: utf-8 -*-
"""生成第 1–16 周的课件 PPTX。

用法：
    python3 build_all.py           # 生成全部
    python3 build_all.py 01 07     # 只生成指定周次
"""

import importlib
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
sys.path.insert(0, str(HERE / 'content'))

import deck  # noqa: E402

# 周次 -> 输出文件名（与 Markdown 讲义同名，便于对照）
WEEKS = {
    '01': '202609_ADS_W01_Overview_Platform_AI_Basics',
    '02': '202609_ADS_W02_VM_Shell_DevEnv',
    '03': '202609_ADS_W03_Computer_Principles_1',
    '04': '202609_ADS_W04_Python_Basics_Algorithm_Analysis',
    '05': '202609_ADS_W05_October_Exam_Review',
    '06': '202610_ADS_W06_Matrices_Sorting_Greedy',
    '07': '202610_ADS_W07_Matrix_Queue_Stack_Greedy',
    '08': '202610_ADS_W08_Recursion',
    '09': '202610_ADS_W09_Recursion_Backtracking_DSU',
    '10': '202611_ADS_W10_Intervals_DP_Intro',
    '11': '202611_ADS_W11_DP',
    '12': '202611_ADS_W12_DP_BFS',
    '13': '202611_ADS_W13_Computer_Principles_2',
    '14': '202612_ADS_W14_AI_Literacy_Exam_Recap',
    '15': '202612_ADS_W15_Knowledge_Graph_Neural_Network',
    '16': '202612_ADS_W16_Review_Final_Machine_Exam',
}


def main(argv):
    wanted = argv or sorted(WEEKS)
    for wk in wanted:
        mod = importlib.import_module(f'w{wk}')
        out = HERE / (WEEKS[wk] + '.pptx')
        pages = deck.build(mod.META, mod.SLIDES, str(out))
        print(f"{out.name}  ({pages} slides)")


if __name__ == '__main__':
    main(sys.argv[1:])

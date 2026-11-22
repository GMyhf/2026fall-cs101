# -*- coding: utf-8 -*-
"""生成第 1–16 周的课件 PPTX。

用法：
    python3 build_all.py           # 生成全部
    python3 build_all.py 01 07     # 只生成指定周次
    python3 build_all.py nov       # 只生成不按周编号的附加课件（见 EXTRA_DECKS）
"""

import importlib
import pathlib
import subprocess
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

# 改用 pptx_builder（pptxgenjs，node）生成的周次 -> deck 脚本（相对本目录）。
# 这些周的 content/wNN.py 只保留 META（供闸门第 3 项核对课程安排），SLIDES 为空。
JS_DECKS = {
    '03': 'pptx_builder/decks/w03_computer_principles_1.js',
    '04': 'pptx_builder/decks/w04_python_basics_algorithm_analysis.js',
    '05': 'pptx_builder/decks/w05_october_exam_review.js',
    '06': 'pptx_builder/decks/w06_matrices_sorting_greedy.js',
    '07': 'pptx_builder/decks/w07_matrix_queue_stack_greedy.js',
    '08': 'pptx_builder/decks/w08_recursion.js',
    '09': 'pptx_builder/decks/w09_recursion_backtracking_dsu.js',
    '10': 'pptx_builder/decks/w10_intervals_dp_intro.js',
    '11': 'pptx_builder/decks/w11_dp.js',
    '12': 'pptx_builder/decks/w12_dp_bfs.js',
    '13': 'pptx_builder/decks/w13_computer_principles_2.js',
    '14': 'pptx_builder/decks/w14_ai_literacy_exam_recap.js',
    '15': 'pptx_builder/decks/w15_knowledge_graph_neural_network.js',
    '16': 'pptx_builder/decks/w16_review_final_machine_exam.js',
}

# 不对应课程指南某一周的附加课件：键 -> (输出文件名, deck 脚本)。
# 例如 11 月月考讲评（课程指南只写「10 月、11 月和 12 月初设阶段性月考」，
# 10 月、12 月的讲评分别并在第 5、14 周，11 月的没有专属周次）。
# 闸门第 1 项把这些文件当作已登记，不报孤儿；第 7 项也会核对其中的题号题名。
EXTRA_DECKS = {
    'nov': ('202611_ADS_November_Exam_Review',
            'pptx_builder/decks/november_exam_review.js'),
}

# 手工制作、不由脚本生成的课件：键 -> 文件名（不含扩展名）。
# build_all 不生成也不覆盖它们，只供 make_video.py 合成讲解视频；
# 闸门第 1 项把它们当作已登记的课件，不报孤儿。
STATIC_DECKS = {
    'talk': '202609_DSA_Talk_Research_with_Agents',   # 课堂分享：用 Agent 快速做科研
}


def build_js(wk, out):
    """用 node 跑 pptx_builder 的 deck 脚本，返回页数。"""
    script = HERE / (EXTRA_DECKS[wk][1] if wk in EXTRA_DECKS else JS_DECKS[wk])
    subprocess.run(['node', str(script), str(out)], check=True,
                   cwd=script.parent.parent, stdout=subprocess.DEVNULL)
    from pptx import Presentation
    return len(Presentation(str(out)).slides)


def main(argv):
    wanted = argv or sorted(WEEKS) + sorted(EXTRA_DECKS)
    for wk in wanted:
        if wk in EXTRA_DECKS:
            out = HERE / (EXTRA_DECKS[wk][0] + '.pptx')
            pages = build_js(wk, out)
        elif wk in JS_DECKS:
            out = HERE / (WEEKS[wk] + '.pptx')
            pages = build_js(wk, out)
        else:
            out = HERE / (WEEKS[wk] + '.pptx')
            mod = importlib.import_module(f'w{wk}')
            pages = deck.build(mod.META, mod.SLIDES, str(out))
        print(f"{out.name}  ({pages} slides)")


if __name__ == '__main__':
    main(sys.argv[1:])

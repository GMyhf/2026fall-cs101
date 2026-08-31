#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Failure-path regression tests for verify_courseware.py.

Every test copies the repository to a temporary directory, applies one mutation,
and invokes the real CLI gate there.  This keeps mutations recoverable and tests
the same entry point used in handoff instead of private helper functions.
"""

import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


def gate_env():
    """跑闸门用的干净环境。

    ⚠️ 必须剔除 `VERIFY_RENDER` —— 否则调用方一旦 `VERIFY_RENDER=1`
    （例如 `VERIFY_RENDER=1 handoff.py --verify` 顺带跑本套件），
    每个用例都会去调 LibreOffice：慢，而且结果随本机字体/渲染器环境浮动，
    回归测试就不再确定。失败路径的判定与渲染无关，不该被它左右。
    """
    env = os.environ.copy()
    env.pop('VERIFY_RENDER', None)
    return env


ROOT = Path(__file__).resolve().parent.parent


class GateFailureTests(unittest.TestCase):
    def run_mutation(self, mutate, expected_check):
        with tempfile.TemporaryDirectory() as tmp:
            clone = Path(tmp) / 'repo'
            shutil.copytree(ROOT, clone, ignore=shutil.ignore_patterns('.git',
                            '__pycache__', '*.pyc', '.DS_Store'))
            mutate(clone)
            proc = subprocess.run(
                [sys.executable, 'tools/verify_courseware.py'], cwd=clone,
                capture_output=True, text=True, timeout=300, env=gate_env())
            self.assertNotEqual(proc.returncode, 0, proc.stdout + proc.stderr)
            self.assertIn(expected_check, proc.stdout)

    @staticmethod
    def replace(path, old, new):
        text = path.read_text(encoding='utf-8')
        if old not in text:
            raise AssertionError(f'mutation target missing: {old!r} in {path}')
        path.write_text(text.replace(old, new, 1), encoding='utf-8')

    def test_missing_content_module_fails_pairing(self):
        self.run_mutation(
            lambda root: (root / 'courseware/content/w01.py').unlink(),
            '1 配对')

    def test_missing_updated_timestamp_fails_metadata(self):
        self.run_mutation(
            lambda root: self.replace(
                root / 'courseware/202609_ADS_W01_Overview_Platform_AI_Basics.md',
                '*Updated ', '*Changed '),
            '2 元数据')

    def test_syllabus_drift_fails(self):
        self.run_mutation(
            lambda root: self.replace(
                root / 'courseware/202609_ADS_W01_Overview_Platform_AI_Basics.md',
                '> **主题与学习重点**：', '> **主题与学习重点**：错误主题 '),
            '3 课程安排')

    def test_dead_local_link_fails(self):
        def mutate(root):
            path = root / 'courseware/202609_ADS_W01_Overview_Platform_AI_Basics.md'
            path.write_text(path.read_text(encoding='utf-8') +
                            '\n[坏链接](missing-local-file.md)\n', encoding='utf-8')
        self.run_mutation(mutate, '4 链接')

    def test_bad_python_block_fails_syntax(self):
        def mutate(root):
            path = root / 'courseware/202609_ADS_W01_Overview_Platform_AI_Basics.md'
            path.write_text(path.read_text(encoding='utf-8') +
                            '\n```python\nif (\n```\n', encoding='utf-8')
        self.run_mutation(mutate, '5 语法')

    def test_verified_inline_title_drift_fails(self):
        self.run_mutation(
            lambda root: self.replace(
                root / 'courseware/202610_ADS_W06_Matrices_Sorting_Greedy.md',
                '12559: 最大最小整数**', '12559: 最大最小整数 v0.3**'),
            '7 题号题名')

    def test_verified_table_title_drift_fails(self):
        self.run_mutation(
            lambda root: self.replace(
                root / 'courseware/202612_ADS_W16_Review_Final_Machine_Exam.md',
                '| 最大最小整数 | 12559 |', '| 过时错误题名 | 12559 |'),
            '7 题号题名')


    # ------------------------------------------------------------------
    # 以下 5 条为第 6 轮补充：覆盖此前完全没有回归的失败路径
    # ------------------------------------------------------------------

    def test_clean_repo_passes(self):
        """反向对照：未经变异的副本必须零失败。

        没有这一条，上面每个用例都可能是"恒真"的 —— 只要副本本身坏了，
        闸门对任何输入都返回非零，全部用例照样"通过"。
        """
        with tempfile.TemporaryDirectory() as tmp:
            clone = Path(tmp) / 'repo'
            shutil.copytree(ROOT, clone, ignore=shutil.ignore_patterns(
                '.git', '__pycache__', '*.pyc', '.DS_Store'))
            proc = subprocess.run(
                [sys.executable, 'tools/verify_courseware.py'], cwd=clone,
                capture_output=True, text=True, timeout=300, env=gate_env())
            self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)

    def test_corpus_title_drift_fails(self):
        """题名漂移走的是**语料**分支（题号不在 VERIFIED_TITLES 里）。

        上面两条用的都是 12559，而它在 VERIFIED_TITLES 中，走覆盖层分支 ——
        「语料 + 精确匹配」那条路径此前一次都没被执行到。实测：把第 7 项的
        子串容差加回去，那两条用例依然全绿，只有这一条会变红。
        01017 的平台题名是「装箱问题」，这里改成它的子串「装箱」。
        """
        self.run_mutation(
            lambda root: self.replace(
                root / 'courseware/202610_ADS_W06_Matrices_Sorting_Greedy.md',
                '**01017: 装箱问题**', '**01017: 装箱**'),
            '7 题号题名')

    def test_page_count_drift_fails_regeneration(self):
        """第 6 项：README 声明的页数与从 content/ 重新生成的结果不符。"""
        try:
            import pptx  # noqa: F401
        except ImportError:
            self.skipTest('未安装 python-pptx，第 6 项本身会被跳过')
        self.run_mutation(
            lambda root: self.replace(
                root / 'courseware/README.md',
                '| 1 | `202609_ADS_W01_Overview_Platform_AI_Basics` | 32 |',
                '| 1 | `202609_ADS_W01_Overview_Platform_AI_Basics` | 31 |'),
            '6 可重生成')


    def test_stale_pptx_fails_regeneration(self):
        """第 6 项：改了 `content/wNN.py` 却没重建 `.pptx`，必须报错。

        这是 Codex 第 7 轮审查发现的 P1：原先第 6 项只比"重建页数 == README 声明"，
        **从不拿重建产物与已提交的课件比对** —— 于是改标题（页数不变）时
        第 1–7 项全绿，仓库里的课件悄悄过期。
        """
        try:
            import pptx  # noqa: F401
        except ImportError:
            self.skipTest('未安装 python-pptx，第 6 项本身会被跳过')
        self.run_mutation(
            lambda root: self.replace(
                root / 'courseware/content/w01.py',
                "('bullets', '本讲内容', [", "('bullets', '源改了没重建', ["),
            '6 可重生成')


    def test_deck_guard_rejects_overlong_code_page(self):
        """`deck.py` 的溢出守卫：字号触底必须报错，而不是静默钳位后溢出。

        这是 Q-7 的修复点。守卫失效时，代码会压到页脚上，而第 8 项渲染检查
        （比页面边界）和人工逐页复核**都看不出来** —— 所以它必须有自己的回归。
        """
        sys.path.insert(0, str(ROOT / 'courseware'))
        try:
            import deck
            meta = {'title': 't', 'subtitle': '', 'footer': '', 'info': []}
            slides = [('code', '超长代码页', '\n'.join(f'x = {i}' for i in range(60)), '')]
            with tempfile.TemporaryDirectory() as tmp:
                with self.assertRaises(deck.LayoutOverflow):
                    deck.build(meta, slides, str(Path(tmp) / 'o.pptx'))
        finally:
            sys.path.remove(str(ROOT / 'courseware'))

    def test_footer_intrusion_predicate(self):
        """第 8 项的判据：阈值按实测取，差 0.7pt 就会全盘误判。"""
        sys.path.insert(0, str(ROOT / 'tools'))
        try:
            import verify_courseware as V
            # 页脚自身（实测 yMin=497.53, yMax=511.16）—— 绝不能判成溢出
            self.assertFalse(V.intrudes_into_footer(497.53, 511.16))
            # 正文最后一行压进页脚区 —— 必须判成溢出
            self.assertTrue(V.intrudes_into_footer(491.0, 500.0))
            # 正常正文 / 恰好贴着版心底部 —— 不算溢出
            self.assertFalse(V.intrudes_into_footer(400.0, 412.0))
            self.assertFalse(V.intrudes_into_footer(474.0, 485.3))
            # 若阈值误用理论值 498.2，页脚就会落进"正文"侧 —— 这条锁住该校准
            self.assertLess(V.FOOTER_TEXT_TOP_PT, 497.53)
        finally:
            sys.path.remove(str(ROOT / 'tools'))


if __name__ == '__main__':
    unittest.main(verbosity=2)

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Failure-path regression tests for verify_courseware.py.

Every test copies the repository to a temporary directory, applies one mutation,
and invokes the real CLI gate there.  This keeps mutations recoverable and tests
the same entry point used in handoff instead of private helper functions.
"""

import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


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
                capture_output=True, text=True, timeout=60)
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


if __name__ == '__main__':
    unittest.main(verbosity=2)

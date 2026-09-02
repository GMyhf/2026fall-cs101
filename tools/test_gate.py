#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Failure-path regression tests for the gate tools.

Mostly verify_courseware.py; the last test covers check_note_code.py,
whose failure mode was hanging rather than reporting.

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
    def run_mutation(self, mutate, expected_check, rebuild=False):
        with tempfile.TemporaryDirectory() as tmp:
            clone = Path(tmp) / 'repo'
            shutil.copytree(ROOT, clone, ignore=shutil.ignore_patterns('.git',
                            '__pycache__', '*.pyc', '.DS_Store'))
            mutate(clone)
            if rebuild:
                # 改的是排版引擎：必须在副本里重新生成课件，
                # 否则动的只是源、产物还是旧的，验的就不是这次改动。
                built = subprocess.run(
                    [sys.executable, 'build_all.py'], cwd=clone / 'courseware',
                    capture_output=True, text=True, timeout=600, env=gate_env())
                self.assertEqual(built.returncode, 0,
                                 built.stdout + built.stderr)
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

    def test_orphan_pptx_fails_pairing(self):
        self.run_mutation(
            lambda root: (root / 'courseware/orphan.pptx').touch(),
            '1 配对')

    def test_office_lock_file_is_not_flagged(self):
        """反向对照：PowerPoint 打开文稿时留下的 `~$*.pptx` 锁文件不算孤儿。

        上面那条卡的是"普通孤儿必须红"，它守的是**旧行为** ——
        把豁免 `~$` 的那几行删掉，它照样绿（实测确认过）。
        新行为得有自己的绿线，否则这次修复是没人看着的。
        """
        with tempfile.TemporaryDirectory() as tmp:
            clone = Path(tmp) / 'repo'
            shutil.copytree(ROOT, clone, ignore=shutil.ignore_patterns(
                '.git', '__pycache__', '*.pyc', '.DS_Store'))
            lock = clone / 'courseware/~$202610_ADS_W08_Recursion.pptx'
            lock.touch()
            proc = subprocess.run(
                [sys.executable, 'tools/verify_courseware.py'], cwd=clone,
                capture_output=True, text=True, timeout=300, env=gate_env())
            self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)
            self.assertNotIn('孤儿课件', proc.stdout)

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


    # ---------------------------------------------------------- 第 9 项：机考规格
    # 三次月考与期末机考同为 6 题 / 112 分钟；固定分值另有核算办法。
    # 这条规格此前只靠人眼守：W05 曾写 5 题、W14 曾写 4 题、
    # W16 同时写着「2025 秋为 112 分钟」和「约 120 分钟」，闸门全程没报警。
    W05 = 'courseware/202609_ADS_W05_October_Exam_Review.md'
    W16 = 'courseware/202612_ADS_W16_Review_Final_Machine_Exam.md'

    def test_stale_duration_fails_exam_spec(self):
        """把时长改回「约 120 分钟」必须红。"""
        self.run_mutation(
            lambda root: self.replace(root / self.W16,
                                      '| 时长 | **112 分钟** |',
                                      '| 时长 | **约 120 分钟** |'),
            '9 机考规格')

    def test_two_hour_wording_in_deck_fails_exam_spec(self):
        """课件里残留「2 小时」也必须红 —— 讲义与课件是成对维护的。"""
        self.run_mutation(
            lambda root: self.replace(
                root / 'courseware/content/w14.py',
                '限时模拟一整套（112 分钟 6 题）',
                '限时模拟一整套（2 小时 6 题）'),
            '9 机考规格')

    def test_five_question_paper_fails_exam_spec(self):
        """删掉 W05 的 T6，样卷退回 5 题 —— 必须红。"""
        def mutate(root):
            path = root / self.W05
            text = path.read_text(encoding='utf-8')
            i = text.index('## T6. 补码计算器')
            j = text.index('# 4 备选题库')
            path.write_text(text[:i] + text[j:], encoding='utf-8')
        self.run_mutation(mutate, '9 机考规格')

    def test_score_allocation_line_fails_exam_spec(self):
        """讲义不得重新写入固定分值分配。"""
        self.run_mutation(
            lambda root: self.replace(
                root / self.W05,
                '# 3 月考样卷',
                '# 3 月考样卷\n\n**分值分配**：T1 15 + T2 15 + T3 15 + T4 15 + T5 20 + T6 20 = **100 分**'),
            '9 机考规格')

    def test_score_in_question_heading_fails_exam_spec(self):
        """分数不能重新散落到样卷题目标题。"""
        self.run_mutation(
            lambda root: self.replace(
                root / self.W05,
                '## T1. 成绩转换',
                '## T1. 成绩转换（15 分）'),
            '9 机考规格')

    def test_score_column_in_deck_ladder_fails_exam_spec(self):
        """难度梯度表里重新列出分数 —— 必须红。

        机考之后另有成绩核算办法，
        梯度表再列一列分数会跟真正的核算口径打架。这一列曾经真的存在过
        （W05 p10、W16 p13 的第二列 15分/20分），是人眼看出来的、闸门没管。

        ⚠️ T-017 之后梯度表已从 `ascii` 改成 `table`，所以这里变异的是
        **表格单元格**——判据若只认 ascii，表格里再写分数就会静默放过。
        """
        def mutate(root):
            path = root / 'courseware/content/w05.py'
            text = path.read_text(encoding='utf-8')
            # 只改单元格内容、不加列 —— 加列会让表格行列数对不上，
            # 第 6 项重建时就先炸了，验不到第 9 项。
            self.assertIn("['题号', '难度', '预期 AC', '考点']", text)
            text = text.replace("'预期 AC', '考点'", "'分值', '考点'", 1)
            text = text.replace("'★☆☆☆☆', '95%'", "'★☆☆☆☆', '15 分'", 1)
            path.write_text(text, encoding='utf-8')
        self.run_mutation(mutate, '9 机考规格')

    def test_score_column_in_note_ladder_fails_exam_spec(self):
        """讲义侧的梯度表同样不许出现分数 —— 讲义与课件成对维护。"""
        self.run_mutation(
            lambda root: self.replace(
                root / self.W16,
                'T5  ★★★★☆   DP，状态设计有难度，30% AC',
                'T5  ★★★★☆  20 分  DP，状态设计有难度，30% AC'),
            '9 机考规格')

    def test_eight_hours_of_homework_is_not_flagged(self):
        r"""反向对照：「每周课外不少于 8 小时」是学习时间，不是考试时长。

        第 9 项卡的是 `2 小时`；若图省事写成宽泛的 `\d+ 小时`，
        就会把这句误判成过时的考试时长。红线之外还要有一条绿线。
        """
        with tempfile.TemporaryDirectory() as tmp:
            clone = Path(tmp) / 'repo'
            shutil.copytree(ROOT, clone, ignore=shutil.ignore_patterns(
                '.git', '__pycache__', '*.pyc', '.DS_Store'))
            path = clone / 'courseware/202609_ADS_W01_Overview_Platform_AI_Basics.md'
            self.assertIn('8 小时', path.read_text(encoding='utf-8'))
            proc = subprocess.run(
                [sys.executable, 'tools/verify_courseware.py'], cwd=clone,
                capture_output=True, text=True, timeout=300, env=gate_env())
            self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)
            self.assertIn('机考规格：3 份样卷均为 6 题 / 112 分钟', proc.stdout)

    def test_minutes_in_a_ladder_heading_is_not_flagged(self):
        """反向对照：梯度表附近的「112 分钟」是时长，不是分数。

        第 9 项的分数列判据是 `\\d+\\s*分`；若不排除「分钟」，
        就会把这行误判成分数列。红线之外还要有一条绿线。
        """
        with tempfile.TemporaryDirectory() as tmp:
            clone = Path(tmp) / 'repo'
            shutil.copytree(ROOT, clone, ignore=shutil.ignore_patterns(
                '.git', '__pycache__', '*.pyc', '.DS_Store'))
            path = clone / 'courseware/202612_ADS_W14_AI_Literacy_Exam_Recap.md'
            self.replace(path, '**难度梯度**：★★ → ★★★',
                         '**难度梯度**（112 分钟内）：★★ → ★★★')
            proc = subprocess.run(
                [sys.executable, 'tools/verify_courseware.py'], cwd=clone,
                capture_output=True, text=True, timeout=300, env=gate_env())
            self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)

    # ---------------------------------------------------------- 第 11 项
    # 汉字宽 1 em、Consolas 宽约 0.55 em，两个空格补不出一个汉字。
    # T-016 在 PowerPoint 16.112.3 下实测：W05 p10 六行的 `--` 不在同一列。

    def test_ascii_column_crossing_chinese_fails_alignment(self):
        """把难度梯度改回"靠空格对齐的 ascii 表" —— 必须红。"""
        def mutate(root):
            path = root / 'courseware/content/w05.py'
            text = path.read_text(encoding='utf-8')
            i = text.index("    ('table', '难度梯度'")
            j = text.index("需按实际结果逐年校准'),", i) + len("需按实际结果逐年校准'),")
            text = text[:i] + """    ('ascii', '难度梯度', r\"\"\"
   T1   *          签到：读入与格式化输出        -- 95% AC
   T2   **         字符串处理                    -- 75% AC
\"\"\"),""" + text[j:]
            path.write_text(text, encoding='utf-8')
        self.run_mutation(mutate, '11 列对齐', rebuild=True)

    def test_new_ragged_diagram_is_not_covered_by_the_known_list(self):
        """挂账名单按（模块, 标题）记；换一张图出问题照样要红。

        这条卡的是"把 KNOWN_RAGGED 当成万能豁免"：名单里已有 7 张，
        但任何**不在名单上**的 ascii 图若也跨中文对齐，必须报出来。
        """
        def mutate(root):
            path = root / 'courseware/content/w12.py'
            text = path.read_text(encoding='utf-8')
            i = text.index('SLIDES = [') + len('SLIDES = [')
            text = text[:i] + """
    ('ascii', '临时图', r\"\"\"
   +---- 起点 ----+
   |   队列头      |
   +--------------+
\"\"\"),""" + text[i:]
            path.write_text(text, encoding='utf-8')
        self.run_mutation(mutate, '11 列对齐', rebuild=True)

    def test_equals_column_crossing_chinese_fails_alignment(self):
        """`=` 也是对齐记号 —— 把汉字夹在两列中间必须红。

        这条是照着真事写的：T-024 写 W10「路径和必须是奇数」那张图时，
        我在 `6-7-0-4 = 17 奇` 里塞了个「奇」，右边那一列当场歪掉，
        而当时的 `ALIGN_TOKENS` 里没有 `=`，闸门一声没吭。
        """
        def mutate(root):
            path = root / 'courseware/content/w12.py'
            text = path.read_text(encoding='utf-8')
            i = text.index('SLIDES = [') + len('SLIDES = [')
            text = text[:i] + """
    ('ascii', '临时图', r\"\"\"
   a = 1      b = 2
   c = 3 奇   d = 4
\"\"\"),""" + text[i:]
            path.write_text(text, encoding='utf-8')
        self.run_mutation(mutate, '11 列对齐', rebuild=True)

    def test_pure_ascii_column_is_not_flagged(self):
        """反向对照：前缀里没有中文的列，补空格就是准的，不许误报。

        W16 p4 的流程图左侧 `|` / `+--` 列前缀全是空格，
        本机实测 x 极差 0.0pt —— 判据若写成"只要有中文就报"，这张图会被冤枉。
        """
        with tempfile.TemporaryDirectory() as tmp:
            clone = Path(tmp) / 'repo'
            shutil.copytree(ROOT, clone, ignore=shutil.ignore_patterns(
                '.git', '__pycache__', '*.pyc', '.DS_Store'))
            text = (clone / 'courseware/content/w16.py').read_text(encoding='utf-8')
            self.assertIn('+-- 排序后一遍扫 -> 贪心', text)   # 确认测的是那张图
            proc = subprocess.run(
                [sys.executable, 'tools/verify_courseware.py'], cwd=clone,
                capture_output=True, text=True, timeout=300, env=gate_env())
            self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)
            self.assertIn('列对齐：', proc.stdout)

    def test_semantic_suite_survives_an_open_stdin(self):
        """回归：check_note_code.py 曾在 stdin 是"不关闭的管道"时整个挂死。

        `load_week()` 会真的执行讲义里 `data = sys.stdin.read().split()`
        这类模块级赋值（W05 的 T3 / T4 / T6 就是这个形状）。
        stdin 一旦是常开管道，`read()` 永不返回——套件零输出、零退出码，
        看上去像"跑得慢"。**工具的行为不该取决于谁在什么上下文里调它。**
        """
        r, w = os.pipe()                     # 只建不写：子进程的 stdin 永不 EOF
        try:
            proc = subprocess.run(
                [sys.executable, 'tools/check_note_code.py', 'W05'],
                cwd=ROOT, stdin=r, capture_output=True, text=True,
                timeout=120, env=gate_env())
        finally:
            os.close(r)
            os.close(w)
        self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)
        self.assertIn('项通过', proc.stdout)


    # ---------------------------------------------------------- 第 10 项：版面标记
    # `**` 与反引号是源里的记号，绝不该印在放映稿上。这一族缺陷在
    # T-007（439 页）、T-011（8 页）、T-013（29 页）三轮人眼复核里全部漏过。
    HAS_PPTX = True
    try:
        import pptx  # noqa: F401
    except ImportError:                     # pragma: no cover
        HAS_PPTX = False

    @unittest.skipUnless(HAS_PPTX, '需要 python-pptx 才能在副本里重建课件')
    def test_bold_nested_backtick_leaks_fails_markup(self):
        """撤掉「粗体里继续拆反引号」，反引号就会印出来 —— 必须红。"""
        self.run_mutation(
            lambda root: self.replace(
                root / 'courseware/deck.py',
                '            emit(seg[2:-2], True, NAVY if color is INK else color)',
                '            run = p.add_run(); run.text = seg[2:-2]\n'
                '            _style_run(run, size, True,\n'
                '                       NAVY if color is INK else color, mono)'),
            '10 版面标记', rebuild=True)

    @unittest.skipUnless(HAS_PPTX, '需要 python-pptx 才能在副本里重建课件')
    def test_narrow_bold_pattern_leaks_fails_markup(self):
        """把 _SEGMENT 收回 `[^*]+`，含 `*` 的粗体内容会让 `**` 自己泄漏。

        这条是本轮闸门**自己抓出来的**第三处（W02 第 27 页
        ``**`[[0]*n]*m` 别名陷阱**``），不是人先看见的。
        """
        self.run_mutation(
            lambda root: self.replace(
                root / 'courseware/deck.py',
                r"_SEGMENT = re.compile(r'(\*\*(?:[^*]|\*(?!\*))+?\*\*|`[^`]+`)')",
                r"_SEGMENT = re.compile(r'(\*\*[^*]+\*\*|`[^`]+`)')"),
            '10 版面标记', rebuild=True)

    def test_fullwidth_space_bullet_fails_markup(self):
        """用全角空格伪造的"续行"会渲成一个空项目符号 —— 必须红。

        A 层是纯源侧检查，**不依赖 python-pptx**，在没装它的机器上照样有效。
        """
        self.run_mutation(
            lambda root: self.replace(
                root / 'courseware/content/w05.py',
                "        '自检清单打不了勾的地方，就是本周的复习重点',",
                "        '自检清单打不了勾的地方，就是本周的复习重点',\n"
                "        '\u3000\u3000\u3000\u3000伪造的续行',"),
            '10 版面标记')


if __name__ == '__main__':
    unittest.main(verbosity=2)

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""check_note_code.py —— 讲义里的实现，原样抽出来跑一遍。

`verify_courseware.py` 的第 5 项只验语法：**代码能被 parse，不代表它算得对**。
本脚本负责语义：把讲义 Markdown 里的 ```python 代码块**原样抽取**、合并成一个
命名空间，再用暴力解 / 标准库 / 已知答案做随机对拍。

用法:
    python3 tools/check_note_code.py            # 全部
    python3 tools/check_note_code.py W06 W11    # 只跑指定周次

抽取时用 AST 剥掉块尾的 OJ 驱动代码（`n = int(input())` 之类），
只保留 import / def / class / 常量赋值，所以不会阻塞读 stdin。
"""

import ast
import bisect
import contextlib
import io
import itertools
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
COURSEWARE = ROOT / 'courseware'

WEEK_FILES = {
    'W01': '202609_ADS_W01_Overview_Platform_AI_Basics',
    'W02': '202609_ADS_W02_VM_Shell_DevEnv',
    'W03': '202609_ADS_W03_Computer_Principles_1',
    'W04': '202609_ADS_W04_Python_Basics_Algorithm_Analysis',
    'W05': '202609_ADS_W05_October_Exam_Review',
    'W06': '202610_ADS_W06_Matrices_Sorting_Greedy',
    'W07': '202610_ADS_W07_Matrix_Queue_Stack_Greedy',
    'W08': '202610_ADS_W08_Recursion',
    'W09': '202610_ADS_W09_Recursion_Backtracking_DSU',
    'W10': '202611_ADS_W10_Intervals_DP_Intro',
    'W11': '202611_ADS_W11_DP',
    'W12': '202611_ADS_W12_DP_BFS',
    'W13': '202611_ADS_W13_Computer_Principles_2',
    'W14': '202612_ADS_W14_AI_Literacy_Exam_Recap',
    'W15': '202612_ADS_W15_Knowledge_Graph_Neural_Network',
    'W16': '202612_ADS_W16_Review_Final_Machine_Exam',
}

import re
PY_BLOCK = re.compile(r'```python\n(.*?)```', re.S)

# 这些名字一旦在讲义里被赋值就会阻塞（读 stdin）或耗时过长，抽取时跳过
SKIP_CALLS = {'input', 'print'}


def _keep(node):
    """只保留 import / def / class / 纯常量赋值。"""
    if isinstance(node, (ast.Import, ast.ImportFrom,
                         ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
        return True
    if isinstance(node, ast.Assign):
        # 赋值右侧不能含有函数调用（可能是 input() 或耗时计算）
        for sub in ast.walk(node.value):
            if isinstance(sub, ast.Call):
                fn = sub.func
                name = getattr(fn, 'id', None) or getattr(fn, 'attr', None)
                if name in SKIP_CALLS or name in ('sieve', 'train_xor',
                                                  'build_index'):
                    return False
        return True
    return False


@contextlib.contextmanager
def sealed_stdin():
    """把 stdin 换成一条立即 EOF 的空流。

    `_keep` 会放行 `data = sys.stdin.read().split()` 这类模块级赋值
    （`read` / `split` 都不在 SKIP_CALLS 里），W05 的 T3 / T4 / T6 正是这个形状。
    如果调用方的 stdin 是一条**不会关闭的管道**（在同一次 shell 调用里
    紧跟着别的命令跑本套件时就会这样），`sys.stdin.read()` 会永久阻塞 ——
    套件挂死，一个字都不输出。**工具的行为不该取决于谁在什么上下文里调它。**
    """
    old = sys.stdin
    sys.stdin = io.TextIOWrapper(io.BytesIO(b''))
    try:
        yield
    finally:
        sys.stdin = old


def load_week(week):
    """把某周讲义里所有 python 代码块的定义合并进一个命名空间。"""
    path = COURSEWARE / (WEEK_FILES[week] + '.md')
    ns = {'__name__': f'note_{week}'}
    for block in PY_BLOCK.findall(path.read_text(encoding='utf-8')):
        try:
            tree = ast.parse(block)
        except SyntaxError:
            continue
        kept = [n for n in tree.body if _keep(n)]
        if not kept:
            continue
        mod = ast.Module(body=kept, type_ignores=[])
        try:
            with sealed_stdin():
                exec(compile(ast.fix_missing_locations(mod), '<note>', 'exec'), ns)
        except Exception:
            # 某个块依赖前面未抽取的名字：跳过，不影响其它块
            continue
    return ns



# ---------------------------------------------------------------- 读 stdin 的解答
def run_stdin_solution(src, stdin_text):
    """把讲义里读 stdin 的参考解答原样跑一遍，返回它打印的内容。

    W16 样卷的六道参考解答都是 `def solve(): ... / solve()` 的形状，
    `load_week()` 只保留 def、不会执行它们 —— 也就是说**学生要照抄的这六段代码，
    此前没有任何可重复的验证**（W16 只有 min_rooms 一项语义测试）。
    """
    import contextlib
    buf = io.StringIO()
    old_stdin = sys.stdin
    # 必须给出带 .buffer 的 stdin：T3 / T6 用的是 sys.stdin.buffer.read()
    sys.stdin = io.TextIOWrapper(io.BytesIO(stdin_text.encode()))
    try:
        with contextlib.redirect_stdout(buf):
            exec(compile(src, '<note-solution>', 'exec'), {'__name__': '__main__'})
    finally:
        sys.stdin = old_stdin
    return buf.getvalue().strip()


def stdin_solutions(week):
    """按出现顺序取出该周所有「读 stdin 的 solve()」代码块。"""
    path = COURSEWARE / (WEEK_FILES[week] + '.md')
    blocks = PY_BLOCK.findall(path.read_text(encoding='utf-8'))
    return [b for b in blocks
            if 'def solve():' in b and re.search(r'^solve\(\)', b, re.M)]


# ---------------------------------------------------------------- 用例注册
CASES = []


def case(week, name):
    def deco(fn):
        CASES.append((week, name, fn))
        return fn
    return deco


# ------------------------------------------------------------------- W03
@case('W03', '图灵机：二进制加一 vs int 运算')
def t_turing(ns):
    tm = ns['turing_machine']
    rules = ns['INCREMENT']
    for n in range(0, 64):
        tape = format(n, 'b')
        got = tm(tape, rules)
        assert got == format(n + 1, 'b'), (tape, got)


@case('W03', '补码：与 Python 位运算一致')
def t_twos(ns):
    f = ns['to_twos_complement']
    for x in range(-128, 128):
        s = f(x, 8)
        assert len(s) == 8 and set(s) <= {'0', '1'}
        v = int(s, 2)
        assert (v - 256 if v >= 128 else v) == x, (x, s)


# ------------------------------------------------------------------- W04
@case('W04', '埃氏筛 vs 试除法（n<=2000）')
def t_sieve(ns):
    p = ns['sieve'](2000)

    def naive(x):
        if x < 2:
            return False
        d = 2
        while d * d <= x:
            if x % d == 0:
                return False
            d += 1
        return True

    for i in range(2001):
        assert p[i] == naive(i), i


@case('W04', 'T-prime：恰好 3 个约数 <=> 素数的平方')
def t_tprime(ns):
    # is_prime = sieve(LIMIT) 是带函数调用的赋值，抽取器会跳过，这里显式注入
    ns.setdefault('is_prime', ns['sieve'](ns['LIMIT']))
    f = ns['is_tprime']

    def divisors(x):
        return sum(1 for d in range(1, x + 1) if x % d == 0)

    for x in range(1, 3000):
        assert f(x) == (divisors(x) == 3), x
    # 大数边界：浮点开方在这里会差 1
    for p in (999983, 999979):
        assert f(p * p) is True, p
        assert f(p * p + 1) is False, p
        assert f(p * p - 1) is False, p



# ------------------------------------------------------------------- W05
@case('W05', 'cheat sheet 模板：gcd / 埃氏筛 / 二维前缀和')
def t_w05_templates(ns):
    """W05 的模板是"要默写进 cheat sheet"的，必须真能跑对。"""
    import math
    g = ns['gcd']
    rnd = random.Random(505)
    for _ in range(300):
        a, b = rnd.randint(1, 10 ** 6), rnd.randint(1, 10 ** 6)
        assert g(a, b) == math.gcd(a, b), (a, b)

    p = ns['sieve'](2000)

    def naive(x):
        if x < 2:
            return False
        d = 2
        while d * d <= x:
            if x % d == 0:
                return False
            d += 1
        return True

    for i in range(2001):
        assert p[i] == naive(i), i


@case('W05', '月考样卷 T1–T6 参考解答 vs 讲义样例')
def t_w05_exam_solutions(ns):
    """W05 是 10 月月考样卷，六道参考解答同样是给学生照抄的。

    输入 / 期望输出全部取自讲义本身的「样例输入 / 样例输出」。
    **按代码块下标显式映射**，不用 zip —— 讲义里 T1 有两种写法，
    再加一个 cheat sheet 模板块，靠顺序 zip 会错位。
    """
    path = COURSEWARE / (WEEK_FILES['W05'] + '.md')
    blocks = PY_BLOCK.findall(path.read_text(encoding='utf-8'))
    runnable = [b for b in blocks if 'input()' in b or 'stdin' in b]
    assert len(runnable) == 8, f'W05 可驱动代码块应有 8 个，实际 {len(runnable)}'

    def run(src, text):
        import contextlib
        buf = io.StringIO()
        old = sys.stdin
        sys.stdin = io.TextIOWrapper(io.BytesIO(text.encode()))
        try:
            with contextlib.redirect_stdout(buf):
                exec(compile(src, '<w05>', 'exec'), {'__name__': '__main__'})
        finally:
            sys.stdin = old
        return buf.getvalue().strip()

    T1 = [('5\n95 83 71 60 40\n', 'A\nB\nC\nD\nE\n80.00'),
          # 边界：整数百分比必须是 60.00，不能是 60.0
          ('5\n90 90 90 10 10\n', 'A\nA\nA\nE\nE\n60.00')]
    # runnable[0] 是 cheat sheet 模板汇总（不是完整解答），跳过
    cases = {
        1: T1,                                   # T1 参考解答
        2: T1,                                   # T1 「更清爽的写法」，同样的输入
        3: [('hello WORLD, this is cs101!\n', 'Hello World, This Is Cs101!')],
        4: [('6 2\npython\nalgorithm\npython\nmath\nalgorithm\npython\n',
             'python 3\nalgorithm 2')],
        5: [('4\n4\n5\n9\n12\n', 'YES\nNO\nYES\nNO')],
        6: [('2 10\n0 1 5\n3 5 2\n', '13')],   # 送达时刻不含最后一次开关门
        # T6 补码计算器：讲义样例，外加"有无符号进位但无有符号溢出"的边界
        7: [('6\nTO 8 -5\nTO 4 8\nFROM 8 11111011\n'
             'ADD 8 100 100\nADD 8 -100 -100\nADD 4 3 4\n',
             '11111011\nOVERFLOW\n-5\n-56 OVERFLOW\n56 OVERFLOW\n7'),
            # 讲义「数据构造建议」点名的四组边界，逐条兑现
            ('5\nADD 8 -1 1\nTO 4 -8\nTO 4 8\nTO 2 1\nTO 2 -2\n',
             '0\n1000\nOVERFLOW\n01\n10')],
    }
    for idx, items in cases.items():
        for stdin_text, want in items:
            got = run(runnable[idx], stdin_text)
            assert got == want, (
                f'W05 第 {idx} 个代码块输出不符：输入 {stdin_text!r} -> '
                f'得到 {got!r}，讲义承诺 {want!r}')


@case('W05', '补码计算器 vs 手工除二取余 / 取反加一（讲义原文驱动）')
def t_w05_twos_complement(ns):
    """T6 是全卷唯一考补码的题，讲义承诺的三件事逐条对照独立模型验证：
    `TO` 的越界判定、`FROM` 的符号位减 2^n、`ADD` 的**有符号溢出**
    （讲义特别强调"无符号进位 ≠ 有符号溢出"）。

    参照模型不用任何位运算 —— 手工除二取余、按位取反再加一，
    与讲义解答的 `x & ((1 << n) - 1)` 走的是两条完全不同的路。
    """
    src = stdin_solutions('W05')[1]          # [0] 是 T5 电梯，[1] 是 T6

    def to_naive(n, x):
        lo, hi = -(2 ** (n - 1)), 2 ** (n - 1) - 1
        if not lo <= x <= hi:
            return 'OVERFLOW'
        if x >= 0:
            bits = ''
            v = x
            while v:
                bits = str(v % 2) + bits
                v //= 2
            return bits.rjust(n, '0')
        pos = bin(-x)[2:].rjust(n, '0')      # 原码
        inv = ''.join('1' if c == '0' else '0' for c in pos)   # 取反
        carry, out = 1, []
        for c in reversed(inv):              # 加一
            t = int(c) + carry
            out.append(str(t % 2))
            carry = t // 2
        return ''.join(reversed(out))

    def from_naive(n, b):
        v = sum(int(c) * 2 ** (n - 1 - i) for i, c in enumerate(b))
        return str(v - 2 ** n if b[0] == '1' else v)

    def add_naive(n, a, b):
        lo, hi = -(2 ** (n - 1)), 2 ** (n - 1) - 1
        s, r = a + b, a + b
        while r > hi:
            r -= 2 ** n
        while r < lo:
            r += 2 ** n
        return str(r) if r == s else f'{r} OVERFLOW'

    rnd = random.Random(0x5C6)
    lines, want = [], []
    for _ in range(1200):
        n = rnd.randint(2, 64)
        lo, hi = -(2 ** (n - 1)), 2 ** (n - 1) - 1
        op = rnd.choice(['TO', 'FROM', 'ADD'])
        if op == 'TO':
            x = rnd.randint(lo - 2, hi + 2)          # 故意覆盖恰好越界的两侧
            lines.append(f'TO {n} {x}')
            want.append(to_naive(n, x))
        elif op == 'FROM':
            b = ''.join(rnd.choice('01') for _ in range(n))
            lines.append(f'FROM {n} {b}')
            want.append(from_naive(n, b))
        else:
            a, b = rnd.randint(lo, hi), rnd.randint(lo, hi)
            lines.append(f'ADD {n} {a} {b}')
            want.append(add_naive(n, a, b))
    got = run_stdin_solution(src, f'{len(lines)}\n' + '\n'.join(lines) + '\n')
    got = got.split('\n')
    assert len(got) == len(want), (len(got), len(want))
    for line, g, w in zip(lines, got, want):
        assert g == w, f'W05 T6 补码计算器：{line} -> 得到 {g!r}，参照模型 {w!r}'


@case('W05', 'T6「常见失分」点名的两种错法，逐条给出反例')
def t_w05_twos_complement_wrong_ways(ns):
    """讲义写着"用 `bin(x)` 处理负数会错"、"无符号进位不是有符号溢出"。
    这两句是**断言**，不是证据 —— 这里各给一个反例，让它们变成可复核的事实。

    正确的一侧永远取自讲义原文（`run_stdin_solution`），
    只有错误的一侧才由本用例复现。
    """
    src = stdin_solutions('W05')[1]

    # ① 负数不能用 bin()：讲义承诺 TO 8 -5 -> 11111011
    right = run_stdin_solution(src, '1\nTO 8 -5\n')
    assert right == '11111011', right
    wrong_bin = bin(-5)[2:].rjust(8, '0')
    assert wrong_bin != right, (
        f'bin(-5) 的写法竟然也给出 {right}：讲义"不能用 bin()"这句就站不住了')

    # ② 无符号进位 ≠ 有符号溢出：-1 + 1 在 8 位下有进位，但结果 0 完全正确
    right = run_stdin_solution(src, '1\nADD 8 -1 1\n')
    assert right == '0', f'讲义数据构造建议点名的 ADD 8 -1 1 应输出 0，实际 {right!r}'
    a, b, n = -1, 1, 8
    mask = (1 << n) - 1
    carry_out = (a & mask) + (b & mask) > mask          # 把进位当溢出的写法
    assert carry_out, '这组 fixture 本该产生无符号进位，否则它证明不了任何事'
    assert 'OVERFLOW' not in right, (
        '按进位判溢出会在这里误报，而讲义解答没有 —— 两者必须不同')


# ------------------------------------------------------------------- W06
@case('W06', '四种排序 vs sorted（随机 200 组）')
def t_sorts(ns):
    rnd = random.Random(6)
    fns = [ns['bubble_sort'], ns['insertion_sort'],
           ns['merge_sort'], ns['quick_sort']]
    for _ in range(200):
        a = [rnd.randint(-30, 30) for _ in range(rnd.randint(0, 30))]
        want = sorted(a)
        for f in fns:
            assert f(a) == want, (f.__name__, a)


@case('W06', '逆序对 vs 暴力 O(n^2)')
def t_inversions(ns):
    f = ns['count_inversions']
    rnd = random.Random(66)
    for _ in range(200):
        a = [rnd.randint(0, 20) for _ in range(rnd.randint(0, 25))]
        want = sum(1 for i in range(len(a)) for j in range(i + 1, len(a))
                   if a[i] > a[j])
        out, cnt = f(a)
        assert cnt == want and out == sorted(a), a


@case('W06', '矩阵乘法 vs 三重循环定义式')
def t_matmul(ns):
    f = ns['matmul']
    rnd = random.Random(666)
    for _ in range(60):
        m, k, n = rnd.randint(1, 5), rnd.randint(1, 5), rnd.randint(1, 5)
        A = [[rnd.randint(-5, 5) for _ in range(k)] for _ in range(m)]
        B = [[rnd.randint(-5, 5) for _ in range(n)] for _ in range(k)]
        want = [[sum(A[i][t] * B[t][j] for t in range(k)) for j in range(n)]
                for i in range(m)]
        assert f(A, B) == want


@case('W06', '二维前缀和 vs 直接求和')
def t_prefix(ns):
    build, query = ns['build_prefix'], ns['query']
    rnd = random.Random(6666)
    for _ in range(60):
        m, n = rnd.randint(1, 6), rnd.randint(1, 6)
        a = [[rnd.randint(-9, 9) for _ in range(n)] for _ in range(m)]
        pre = build(a)
        for r1 in range(m):
            for r2 in range(r1, m):
                for c1 in range(n):
                    for c2 in range(c1, n):
                        want = sum(a[i][j] for i in range(r1, r2 + 1)
                                   for j in range(c1, c2 + 1))
                        assert query(pre, r1, c1, r2, c2) == want


@case('W06', '拼接最大/最小整数 vs 全排列枚举')
def t_concat(ns):
    big, small = ns['largest_concat'], ns['smallest_concat']
    rnd = random.Random(66666)
    for _ in range(120):
        strs = [str(rnd.randint(0, 99)) for _ in range(rnd.randint(1, 5))]
        perms = [''.join(p) for p in itertools.permutations(strs)]
        assert big(strs) == max(perms, key=lambda s: (len(s), s))
        assert small(strs) == min(perms, key=lambda s: (len(s), s))


@case('W06', '找零：贪心确实劣于 DP（反例成立）')
def t_coins(ns):
    g, d = ns['greedy_coins'], ns['dp_coins']
    assert g([1, 3, 4], 6) == 3 and d([1, 3, 4], 6) == 2
    rnd = random.Random(7)
    for _ in range(200):                      # DP 永不劣于贪心
        coins = sorted({rnd.randint(1, 15) for _ in range(rnd.randint(1, 4))})
        if 1 not in coins:
            coins = [1] + coins
        amt = rnd.randint(1, 40)
        assert d(coins, amt) <= g(coins, amt)


@case('W06', 'Kadane vs 暴力（三种写法一致）')
def t_kadane(ns):
    b, p, k = ns['brute'], ns['prefix'], ns['kadane']
    rnd = random.Random(77)
    for _ in range(120):
        a = [rnd.randint(-20, 20) for _ in range(rnd.randint(1, 25))]
        assert b(a) == p(a) == k(a), a


# ------------------------------------------------------------------- W07
@case('W07', '括号匹配 vs 消去法')
def t_valid(ns):
    f = ns['is_valid']
    rnd = random.Random(8)

    def ref(s):
        prev = None
        while prev != s:
            prev = s
            for p in ('()', '[]', '{}'):
                s = s.replace(p, '')
        return s == ''

    for _ in range(500):
        s = ''.join(rnd.choice('()[]{}') for _ in range(rnd.randint(0, 10)))
        assert f(s) == ref(s), s


@case('W07', '进制转换 vs 内建 bin/oct/hex')
def t_tobase(ns):
    f = ns['to_base']
    for n in range(0, 500):
        assert f(n, 2) == format(n, 'b')
        assert f(n, 8) == format(n, 'o')
        assert f(n, 16) == format(n, 'X')
    assert f(-233, 16) == '-E9'


@case('W07', '调度场 + 后缀求值 vs Python eval')
def t_shunting(ns):
    tok, i2p, ev = ns['tokenize'], ns['infix_to_postfix'], ns['eval_postfix']
    rnd = random.Random(9)
    for _ in range(300):
        n = rnd.randint(1, 5)
        expr = str(rnd.randint(1, 20))
        for _ in range(n - 1):
            expr += rnd.choice('+-*') + str(rnd.randint(1, 20))
        got = ev(i2p(tok(expr)))
        assert abs(got - eval(expr)) < 1e-6, (expr, got, eval(expr))


@case('W07', '前缀求值 vs 后缀求值（同一棵表达式树）')
def t_prefix_eval(ns):
    ev_pre, ev_post = ns['eval_prefix'], ns['eval_postfix']
    assert abs(ev_pre('* + 11.0 12.0 + 24.0 35.0'.split()) - 1357.0) < 1e-6
    assert abs(ev_post('11.0 12.0 + 24.0 35.0 + *'.split()) - 1357.0) < 1e-6


@case('W07', '单调栈 vs 暴力找下一个更大元素')
def t_next_greater(ns):
    f = ns['next_greater']
    rnd = random.Random(10)
    for _ in range(200):
        a = [rnd.randint(0, 10) for _ in range(rnd.randint(0, 20))]
        want = []
        for i in range(len(a)):
            nxt = -1
            for j in range(i + 1, len(a)):
                if a[j] > a[i]:
                    nxt = j
                    break
            want.append(nxt)
        assert f(a) == want, a


@case('W07', '接雨水：单调栈 vs 双指针 vs 逐列暴力')
def t_trap(ns):
    f1, f2 = ns['trap'], ns['trap2']
    rnd = random.Random(11)
    for _ in range(200):
        h = [rnd.randint(0, 8) for _ in range(rnd.randint(0, 20))]
        want = sum(max(0, min(max(h[:i + 1]), max(h[i:])) - h[i])
                   for i in range(len(h)))
        assert f1(h) == f2(h) == want, h


@case('W07', '柱状图最大矩形 vs O(n^2) 暴力')
def t_rect(ns):
    f = ns['largest_rectangle']
    rnd = random.Random(12)
    for _ in range(200):
        h = [rnd.randint(0, 8) for _ in range(rnd.randint(1, 15))]
        want = 0
        for i in range(len(h)):
            mn = h[i]
            for j in range(i, len(h)):
                mn = min(mn, h[j])
                want = max(want, mn * (j - i + 1))
        assert f(h) == want, h


@case('W07', '滑动窗口最大值 vs 逐窗口 max')
def t_window(ns):
    f = ns['max_sliding_window']
    rnd = random.Random(13)
    for _ in range(200):
        n = rnd.randint(1, 20)
        a = [rnd.randint(-10, 10) for _ in range(n)]
        k = rnd.randint(1, n)
        want = [max(a[i:i + k]) for i in range(n - k + 1)]
        assert f(a, k) == want, (a, k)


@case('W07', '约瑟夫：队列模拟 vs 递推公式')
def t_josephus(ns):
    q, g = ns['josephus_queue'], ns['josephus_formula']
    for n in range(1, 30):
        for m in range(1, 8):
            assert q(n, m)[-1] == g(n, m), (n, m)


@case('W07', '分发糖果：满足全部相邻约束且总数最小')
def t_candy(ns):
    f = ns['candy']
    rnd = random.Random(14)
    for _ in range(200):
        r = [rnd.randint(0, 4) for _ in range(rnd.randint(1, 8))]
        got = f(r)
        # 用 O(2^k) 无法枚举，改为验证"存在一组分配达到该总数且合法"
        n = len(r)
        c = [1] * n
        changed = True
        while changed:                       # 迭代到不动点 = 最小合法分配
            changed = False
            for i in range(n):
                if i > 0 and r[i] > r[i - 1] and c[i] <= c[i - 1]:
                    c[i] = c[i - 1] + 1
                    changed = True
                if i + 1 < n and r[i] > r[i + 1] and c[i] <= c[i + 1]:
                    c[i] = c[i + 1] + 1
                    changed = True
        assert got == sum(c), (r, got, sum(c))


@case('W07', '土豪购物 vs 暴力枚举区间与丢弃项')
def t_drop(ns):
    f = ns['max_with_one_drop']
    rnd = random.Random(15)
    for _ in range(200):
        a = [rnd.randint(-10, 10) for _ in range(rnd.randint(1, 12))]
        want = max(a)
        for i in range(len(a)):
            for j in range(i, len(a)):
                seg = a[i:j + 1]
                want = max(want, sum(seg))
                if len(seg) > 1:
                    want = max(want, sum(seg) - min(seg))
        assert f(a) == want, a


# ------------------------------------------------------------------- W08
@case('W08', '斐波那契四种写法一致')
def t_fib(ns):
    fs = [ns['fib_memo'], ns['fib_iter'], ns['fib_dp']]
    ref = [0, 1, 1]
    for i in range(3, 60):
        ref.append(ref[-1] + ref[-2])
    for n in range(1, 60):
        for f in fs:
            assert f(n) == ref[n], (f.__name__, n)


@case('W08', '汉诺塔：合法性 + 次数 = 2^n - 1')
def t_hanoi(ns):
    hanoi = ns['hanoi']
    for n in range(1, 9):
        moves = []
        hanoi(n, 'A', 'B', 'C', moves)
        assert len(moves) == (1 << n) - 1, n
        pegs = {'A': list(range(n, 0, -1)), 'B': [], 'C': []}
        for mv in moves:
            disk, path = mv.split(':')
            src, dst = path.split('->')
            d = int(disk)
            assert pegs[src] and pegs[src][-1] == d, mv
            assert not pegs[dst] or pegs[dst][-1] > d, mv   # 大盘不能压小盘
            pegs[dst].append(pegs[src].pop())
        assert pegs['C'] == list(range(n, 0, -1))


@case('W08', '全排列 vs itertools.permutations')
def t_perm(ns):
    f = ns['permutations']
    for n in range(0, 7):
        a = list(range(n))
        assert [tuple(p) for p in f(a)] == list(itertools.permutations(a)), n


@case('W08', '快速幂 vs 内建 pow')
def t_pow(ns):
    f = ns['fast_pow']
    rnd = random.Random(16)
    for _ in range(300):
        a, b = rnd.randint(-20, 20), rnd.randint(0, 40)
        assert f(a, b) == a ** b
        m = rnd.randint(2, 10 ** 9 + 7)
        assert f(a % m, b, m) == pow(a % m, b, m)


@case('W08', 'lower_bound vs bisect.bisect_left')
def t_lower_bound(ns):
    f = ns['lower_bound']
    rnd = random.Random(17)
    for _ in range(300):
        a = sorted(rnd.randint(0, 20) for _ in range(rnd.randint(0, 20)))
        for t in range(-1, 22):
            assert f(a, t) == bisect.bisect_left(a, t), (a, t)


@case('W08', 'gcd/lcm vs math')
def t_gcd(ns):
    import math
    g, l = ns['gcd'], ns['lcm']
    rnd = random.Random(18)
    for _ in range(300):
        a, b = rnd.randint(1, 10 ** 6), rnd.randint(1, 10 ** 6)
        assert g(a, b) == math.gcd(a, b)
        assert l(a, b) == a * b // math.gcd(a, b)


@case('W08', '进制转换：递归版 == 迭代版')
def t_base_rec(ns):
    r, i = ns['to_base_rec'], ns['to_base_iter']
    for n in range(1, 3000):
        for base in (2, 8, 16):
            assert r(n, base) == i(n, base), (n, base)


# ------------------------------------------------------------------- W09
@case('W09', '子集 vs itertools 组合枚举')
def t_subsets(ns):
    f = ns['subsets']
    for n in range(0, 6):
        a = list(range(n))
        got = sorted(map(tuple, f(a)))
        want = sorted(c for k in range(n + 1)
                      for c in itertools.combinations(a, k))
        assert got == want, n


@case('W09', '组合总和 vs 暴力多重组合')
def t_comb_sum(ns):
    f = ns['combination_sum']
    rnd = random.Random(19)
    for _ in range(60):
        cands = sorted({rnd.randint(2, 9) for _ in range(rnd.randint(1, 4))})
        target = rnd.randint(1, 16)
        got = sorted(map(tuple, f(cands, target)))
        want = set()
        for k in range(0, target // min(cands) + 1):
            for combo in itertools.combinations_with_replacement(cands, k):
                if sum(combo) == target:
                    want.add(tuple(sorted(combo)))
        assert got == sorted(want), (cands, target)


@case('W09', '去重排列 vs set(itertools.permutations)')
def t_perm_uniq(ns):
    f = ns['permute_unique']
    rnd = random.Random(20)
    for _ in range(120):
        a = [rnd.randint(0, 2) for _ in range(rnd.randint(1, 6))]
        got = sorted(map(tuple, f(a)))
        assert got == sorted(set(itertools.permutations(a))), a


@case('W09', '八皇后：92 个解且每个都合法')
def t_queens(ns):
    f = ns['solve_queens']
    counts = {4: 2, 5: 10, 6: 4, 7: 40, 8: 92}
    for n, want in counts.items():
        sols = f(n)
        assert len(sols) == want, (n, len(sols))
        for s in sols:
            cols = [c - 1 for c in s]
            assert len(set(cols)) == n
            assert len({r - c for r, c in enumerate(cols)}) == n
            assert len({r + c for r, c in enumerate(cols)}) == n
    assert f(8) == sorted(f(8))          # 字典序


@case('W09', '马走日 vs 独立参考实现（不同的状态表示）')
def t_knight(ns):
    f = ns['knight_tours']
    assert f(5, 4, 0, 0) == 32          # OJ 04123 的样例答案

    def ref(n, m, sx, sy):
        """独立实现：用 frozenset 记录已访问格子，与讲义的布尔矩阵写法无共享代码。"""
        moves = [(a, b) for a in (-2, -1, 1, 2) for b in (-2, -1, 1, 2)
                 if abs(a) != abs(b)]
        total = n * m

        def go(x, y, seen):
            if len(seen) == total:
                return 1
            acc = 0
            for dx, dy in moves:
                nx, ny = x + dx, y + dy
                if 0 <= nx < n and 0 <= ny < m and (nx, ny) not in seen:
                    acc += go(nx, ny, seen | {(nx, ny)})
            return acc

        return go(sx, sy, frozenset({(sx, sy)}))

    for n in range(1, 5):
        for m in range(1, 5):
            if n * m > 12:          # 两边都是指数搜索，把闸门控制在秒级
                continue
            for sx in range(n):
                for sy in range(m):
                    assert f(n, m, sx, sy) == ref(n, m, sx, sy), (n, m, sx, sy)


@case('W09', 'Flood Fill vs 并查集数连通块')
def t_flood(ns):
    f = ns['count_lakes']
    DSU = ns['DSU']
    rnd = random.Random(21)
    for _ in range(120):
        n, m = rnd.randint(1, 8), rnd.randint(1, 8)
        g = [''.join(rnd.choice('W.') for _ in range(m)) for _ in range(n)]
        d = DSU(n * m)
        for i in range(n):
            for j in range(m):
                if g[i][j] != 'W':
                    continue
                for di in (-1, 0, 1):
                    for dj in (-1, 0, 1):
                        ni, nj = i + di, j + dj
                        if 0 <= ni < n and 0 <= nj < m and g[ni][nj] == 'W':
                            d.union(i * m + j, ni * m + nj)
        roots = {d.find(i * m + j) for i in range(n) for j in range(m)
                 if g[i][j] == 'W'}
        assert f(g) == len(roots), g


@case('W09', '并查集 vs 朴素连通性')
def t_dsu(ns):
    DSU = ns['DSU']
    rnd = random.Random(22)
    for _ in range(120):
        n = rnd.randint(1, 12)
        d = DSU(n)
        groups = [{i} for i in range(n)]     # 朴素参考实现
        for _ in range(rnd.randint(0, 20)):
            a, b = rnd.randrange(n), rnd.randrange(n)
            d.union(a, b)
            ga = next(g for g in groups if a in g)
            gb = next(g for g in groups if b in g)
            if ga is not gb:
                ga |= gb
                groups.remove(gb)
            for x in range(n):
                for y in range(n):
                    same = any(x in g and y in g for g in groups)
                    assert d.connected(x, y) == same, (x, y)
            assert d.count == len(groups)


@case('W09', '食物链：与朴素约束求解一致')
def t_food_chain(ns):
    f = ns['food_chain']
    # POJ 1182 官方样例
    assert f(100, [(1, 101, 1), (2, 1, 2), (2, 2, 3), (2, 3, 3),
                   (1, 1, 3), (2, 3, 1), (1, 5, 5)]) == 3
    rnd = random.Random(23)
    for _ in range(200):
        n = rnd.randint(2, 4)
        sts = [(rnd.choice([1, 2]), rnd.randint(1, n), rnd.randint(1, n))
               for _ in range(rnd.randint(1, 6))]
        # 朴素：枚举每只动物的类别（0/1/2），逐句判断是否与已接受的句子相容
        accepted, lies = [], 0
        for st in sts:
            trial = accepted + [st]
            ok = False
            for assign in itertools.product(range(3), repeat=n):
                good = True
                for kind, x, y in trial:
                    a, b = assign[x - 1], assign[y - 1]
                    if kind == 1 and a != b:
                        good = False
                    if kind == 2 and (a + 1) % 3 != b:
                        good = False
                    if not good:
                        break
                if good:
                    ok = True
                    break
            if ok:
                accepted = trial
            else:
                lies += 1
        assert f(n, sts) == lies, (n, sts)


# ------------------------------------------------------------------- W10
@case('W10', '合并区间 vs 逐点覆盖')
def t_merge(ns):
    f = ns['merge']
    rnd = random.Random(24)
    for _ in range(200):
        iv = []
        for _ in range(rnd.randint(0, 8)):
            a = rnd.randint(0, 15)
            iv.append([a, a + rnd.randint(0, 5)])
        got = f([list(x) for x in iv])
        covered = set()
        for a, b in iv:
            covered |= set(range(a, b + 1))
        got_cov = set()
        for a, b in got:
            got_cov |= set(range(a, b + 1))
        assert covered == got_cov
        assert got == sorted(got)
        for i in range(1, len(got)):        # 合并后必须互不相接
            assert got[i][0] > got[i - 1][1] + 0


@case('W10', '无重叠区间 vs 最大不相交子集枚举')
def t_erase(ns):
    erase = ns['erase_overlap_intervals']
    rnd = random.Random(25)
    for _ in range(200):
        # ⚠️ LC 435 保证 start < end。退化区间 [a,a] 在半开区间语义下是空集，
        #    与任何区间都相容，按右端点排的贪心对它不成立 —— 不在题目约束内，
        #    因此生成器也不产生这类数据（讲义里已注明该前提）。
        iv = []
        for _ in range(rnd.randint(1, 7)):
            a = rnd.randint(0, 10)
            iv.append([a, a + rnd.randint(1, 4)])
        best = 0                              # 最多能保留几个互不重叠的
        for k in range(len(iv), 0, -1):
            found = False
            for combo in itertools.combinations(iv, k):
                c = sorted(combo, key=lambda x: x[0])
                if all(c[i][0] >= c[i - 1][1] for i in range(1, k)):
                    found = True
                    break
            if found:
                best = k
                break
        assert erase([list(x) for x in iv]) == len(iv) - best, iv


@case('W10', '引爆气球 vs 穷举最小刺穿点集')
def t_arrows(ns):
    arrows = ns['find_min_arrow_shots']
    rnd = random.Random(255)
    for _ in range(200):
        iv = []
        for _ in range(rnd.randint(1, 6)):
            a = rnd.randint(0, 10)
            iv.append([a, a + rnd.randint(0, 4)])   # 闭区间，允许退化
        pts = sorted({p for a, b in iv for p in (a, b)})

        def stabs(ps):
            return all(any(a <= p <= b for p in ps) for a, b in iv)

        want = len(pts)
        for k in range(1, len(pts) + 1):
            if any(stabs(c) for c in itertools.combinations(pts, k)):
                want = k
                break
        assert arrows([list(x) for x in iv]) == want, iv


@case('W10', '区间分组：堆 vs 差分 vs 逐点峰值')
def t_groups(ns):
    h, d = ns['min_groups'], ns['min_groups_diff']
    rnd = random.Random(26)
    for _ in range(200):
        iv = []
        for _ in range(rnd.randint(1, 8)):
            a = rnd.randint(0, 12)
            iv.append((a, a + rnd.randint(0, 5)))
        pts = sorted({p for a, b in iv for p in (a, b)})
        peak = max(sum(1 for a, b in iv if a <= p <= b) for p in pts)
        assert h(iv) == d(iv) == peak, iv


@case('W10', '差分数组 vs 朴素区间加')
def t_diff(ns):
    f = ns['trees_left']
    rnd = random.Random(27)
    for _ in range(200):
        L = rnd.randint(1, 40)
        rs = []
        for _ in range(rnd.randint(0, 5)):
            a = rnd.randint(0, L)
            rs.append((a, rnd.randint(a, L)))
        alive = [True] * (L + 1)
        for a, b in rs:
            for i in range(a, b + 1):
                alive[i] = False
        assert f(L, rs) == sum(alive), (L, rs)


@case('W10', 'DP 四种写法一致 / 爬楼梯 / 数字三角形 / Kadane')
def t_dp_intro(ns):
    f1, f2, f3, f4 = ns['f1'], ns['f2'], ns['f3'], ns['f4']
    for n in range(1, 22):
        assert f1(n) == f2(n) == f3(n) == f4(n), n
    cs, ck = ns['climb_stairs'], ns['climb_k']
    for n in range(1, 20):
        assert cs(n) == ck(n, 2), n
    mps, mps1 = ns['max_path_sum'], ns['max_path_sum_1d']
    rnd = random.Random(28)
    for _ in range(120):
        n = rnd.randint(1, 8)
        tri = [[rnd.randint(-9, 9) for _ in range(i + 1)] for i in range(n)]
        best = max(sum(tri[i][sum(path[:i])] for i in range(n))
                   for path in itertools.product([0, 1], repeat=n - 1)
                   ) if n > 1 else tri[0][0]
        assert mps([r[:] for r in tri]) == mps1([r[:] for r in tri]) == best
    msa, msa1 = ns['max_subarray'], ns['max_subarray_o1']
    for _ in range(150):
        a = [rnd.randint(-15, 15) for _ in range(rnd.randint(1, 20))]
        want = max(sum(a[i:j + 1]) for i in range(len(a))
                   for j in range(i, len(a)))
        assert msa(a) == msa1(a) == want, a


# ------------------------------------------------------------------- W11
@case('W11', '0-1 背包：一维 == 二维 == 子集枚举')
def t_knapsack(ns):
    k1, k2 = ns['knapsack_1d'], ns['knapsack_2d']
    rnd = random.Random(29)
    for _ in range(300):
        n = rnd.randint(0, 10)
        w = [rnd.randint(1, 12) for _ in range(n)]
        v = [rnd.randint(1, 40) for _ in range(n)]
        cap = rnd.randint(0, 30)
        best = 0
        for mask in range(1 << n):
            tw = sum(w[i] for i in range(n) if mask >> i & 1)
            if tw <= cap:
                best = max(best, sum(v[i] for i in range(n) if mask >> i & 1))
        assert k1(w, v, cap) == k2(w, v, cap) == best


@case('W11', '完全背包 vs 有界重复枚举')
def t_unbounded(ns):
    f = ns['unbounded_knapsack']
    rnd = random.Random(30)
    for _ in range(200):
        n = rnd.randint(1, 4)
        w = [rnd.randint(1, 8) for _ in range(n)]
        v = [rnd.randint(1, 20) for _ in range(n)]
        cap = rnd.randint(0, 20)
        dp = [0] * (cap + 1)
        for c in range(1, cap + 1):           # 独立参考实现
            for i in range(n):
                if w[i] <= c:
                    dp[c] = max(dp[c], dp[c - w[i]] + v[i])
        assert f(w, v, cap) == dp[cap]


@case('W11', '组合数 / 排列数：循环顺序的语义差别')
def t_count_ways(ns):
    cw, cp = ns['count_ways'], ns['count_permutations']
    rnd = random.Random(31)
    for _ in range(120):
        coins = sorted({rnd.randint(1, 6) for _ in range(rnd.randint(1, 3))})
        amt = rnd.randint(0, 14)
        # 组合：多重集计数
        comb = 0
        maxk = amt // min(coins) if amt else 0
        for k in range(maxk + 1):
            for c in itertools.combinations_with_replacement(coins, k):
                if sum(c) == amt:
                    comb += 1
        # 排列：有序序列计数
        perm = 0
        for k in range(maxk + 1):
            for c in itertools.product(coins, repeat=k):
                if sum(c) == amt:
                    perm += 1
        assert cw(coins, amt) == comb, (coins, amt)
        assert cp(coins, amt) == perm, (coins, amt)


@case('W11', '多重背包（二进制拆分）vs 逐件展开')
def t_multi(ns):
    f = ns['multi_knapsack']
    k1 = ns['knapsack_1d']
    rnd = random.Random(32)
    for _ in range(200):
        items = [(rnd.randint(1, 6), rnd.randint(1, 20), rnd.randint(1, 6))
                 for _ in range(rnd.randint(1, 3))]
        cap = rnd.randint(0, 25)
        w, v = [], []
        for ww, vv, k in items:
            w += [ww] * k
            v += [vv] * k
        assert f(items, cap) == k1(w, v, cap), (items, cap)


@case('W11', '"恰好装满"vs 子集枚举（必须真的恰好）')
def t_exact(ns):
    f = ns['exact_fill_max']
    rnd = random.Random(33)
    for _ in range(300):
        n = rnd.randint(0, 9)
        w = [rnd.randint(1, 8) for _ in range(n)]
        v = [rnd.randint(1, 20) for _ in range(n)]
        cap = rnd.randint(0, 20)
        best = None
        for mask in range(1 << n):
            if sum(w[i] for i in range(n) if mask >> i & 1) == cap:
                s = sum(v[i] for i in range(n) if mask >> i & 1)
                best = s if best is None else max(best, s)
        assert f(w, v, cap) == (best if best is not None else -1)


@case('W11', '分数背包 vs LP 上界')
def t_fractional(ns):
    f = ns['fractional_knapsack']
    rnd = random.Random(34)
    for _ in range(200):
        items = [(rnd.randint(1, 30), rnd.randint(1, 10))
                 for _ in range(rnd.randint(1, 6))]
        cap = rnd.randint(0, 30)
        # 参考：按单位价值贪心（独立写一遍，用不同的实现方式）
        rest, total = cap, 0.0
        for value, weight in sorted(items, key=lambda it: -it[0] / it[1]):
            take = min(rest, weight)
            total += value * take / weight
            rest -= take
            if rest <= 0:
                break
        assert abs(f(items, cap) - total) < 1e-9, (items, cap)


@case('W11', 'LIS：O(n^2) == O(n log n) == 暴力子序列')
def t_lis(ns):
    a2, an = ns['lis_n2'], ns['lis_nlogn']
    rnd = random.Random(35)
    for _ in range(150):
        a = [rnd.randint(0, 8) for _ in range(rnd.randint(1, 12))]
        best = 0
        for k in range(len(a), 0, -1):
            if any(all(c[i] < c[i + 1] for i in range(k - 1))
                   for c in itertools.combinations(a, k)):
                best = k
                break
        assert a2(a) == an(a) == best, a


@case('W11', '最长不上升子序列 / 最大上升子序列和')
def t_lis_variants(ns):
    lni, mrs = ns['longest_non_increasing'], ns['max_rising_sum']
    rnd = random.Random(36)
    for _ in range(150):
        a = [rnd.randint(0, 8) for _ in range(rnd.randint(1, 11))]
        best = 0
        for k in range(len(a), 0, -1):
            if any(all(c[i] >= c[i + 1] for i in range(k - 1))
                   for c in itertools.combinations(a, k)):
                best = k
                break
        assert lni(a) == best, a
        bs = max(sum(c) for k in range(1, len(a) + 1)
                 for c in itertools.combinations(a, k)
                 if all(c[i] < c[i + 1] for i in range(k - 1)))
        assert mrs(a) == bs, a


@case('W11', 'LCS / 编辑距离 vs 暴力')
def t_lcs(ns):
    lcs, ed = ns['lcs'], ns['edit_distance']
    rnd = random.Random(37)
    for _ in range(150):
        s = ''.join(rnd.choice('abc') for _ in range(rnd.randint(0, 7)))
        t = ''.join(rnd.choice('abc') for _ in range(rnd.randint(0, 7)))
        best = 0
        for k in range(min(len(s), len(t)), 0, -1):
            subs = set(itertools.combinations(s, k))
            if subs & set(itertools.combinations(t, k)):
                best = k
                break
        assert lcs(s, t) == best, (s, t)
        # 编辑距离：三角不等式与已知值
        assert ed(s, t) == ed(t, s)
        assert ed(s, s) == 0
        assert abs(len(s) - len(t)) <= ed(s, t) <= max(len(s), len(t))
    assert ed("horse", "ros") == 3
    assert ed("intention", "execution") == 5


@case('W11', '打家劫舍 vs 枚举不相邻子集')
def t_rob(ns):
    f = ns['rob']
    rnd = random.Random(38)
    for _ in range(200):
        a = [rnd.randint(0, 20) for _ in range(rnd.randint(0, 12))]
        n = len(a)
        best = 0
        for mask in range(1 << n):
            if mask & (mask << 1):
                continue
            best = max(best, sum(a[i] for i in range(n) if mask >> i & 1))
        assert f(a) == best, a


@case('W11', '最大子矩阵 vs O(n^4) 暴力')
def t_submatrix(ns):
    f = ns['max_submatrix']
    rnd = random.Random(39)
    for _ in range(120):
        n, m = rnd.randint(1, 5), rnd.randint(1, 5)
        mat = [[rnd.randint(-9, 9) for _ in range(m)] for _ in range(n)]
        best = mat[0][0]
        for r1 in range(n):
            for r2 in range(r1, n):
                for c1 in range(m):
                    for c2 in range(c1, m):
                        best = max(best, sum(mat[i][j]
                                             for i in range(r1, r2 + 1)
                                             for j in range(c1, c2 + 1)))
        assert f(mat) == best, mat


# ------------------------------------------------------------------- W12
@case('W12', 'BFS 迷宫 vs Dijkstra（单位边权）')
def t_maze(ns):
    import heapq
    f = ns['maze_shortest']
    rnd = random.Random(40)
    for _ in range(200):
        n, m = rnd.randint(1, 6), rnd.randint(1, 6)
        g = [''.join(rnd.choice('..#') for _ in range(m)) for _ in range(n)]
        sx, sy = rnd.randrange(n), rnd.randrange(m)
        gx, gy = rnd.randrange(n), rnd.randrange(m)
        got = f(g, (sx, sy), (gx, gy))
        if g[sx][sy] == '#' or g[gx][gy] == '#':
            assert got == -1
            continue
        INF = float('inf')
        dist = {(sx, sy): 0}
        pq = [(0, sx, sy)]
        while pq:
            d, x, y = heapq.heappop(pq)
            if d > dist.get((x, y), INF):
                continue
            for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < n and 0 <= ny < m and g[nx][ny] != '#' \
                        and d + 1 < dist.get((nx, ny), INF):
                    dist[(nx, ny)] = d + 1
                    heapq.heappush(pq, (d + 1, nx, ny))
        assert got == dist.get((gx, gy), -1), (g, (sx, sy), (gx, gy))


@case('W12', '多源 BFS vs 逐点求最近 0')
def t_multisource(ns):
    f = ns['update_matrix']
    rnd = random.Random(41)
    for _ in range(120):
        n, m = rnd.randint(1, 6), rnd.randint(1, 6)
        mat = [[rnd.choice([0, 1]) for _ in range(m)] for _ in range(n)]
        if all(v for row in mat for v in row):
            mat[0][0] = 0
        zeros = [(i, j) for i in range(n) for j in range(m) if mat[i][j] == 0]
        want = [[min(abs(i - zi) + abs(j - zj) for zi, zj in zeros)
                 for j in range(m)] for i in range(n)]
        # 曼哈顿距离只是下界；用 BFS 参考实现比对
        from collections import deque
        d2 = [[-1] * m for _ in range(n)]
        q = deque()
        for i, j in zeros:
            d2[i][j] = 0
            q.append((i, j))
        while q:
            x, y = q.popleft()
            for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < n and 0 <= ny < m and d2[nx][ny] < 0:
                    d2[nx][ny] = d2[x][y] + 1
                    q.append((nx, ny))
        assert f(mat) == d2
        for i in range(n):
            for j in range(m):
                assert d2[i][j] >= want[i][j]      # BFS 距离 >= 曼哈顿下界


@case('W12', 'Dijkstra vs Bellman-Ford')
def t_dijkstra(ns):
    f = ns['dijkstra']
    rnd = random.Random(42)
    for _ in range(200):
        n = rnd.randint(1, 8)
        adj = [[] for _ in range(n)]
        edges = []
        for _ in range(rnd.randint(0, 15)):
            u, v, w = rnd.randrange(n), rnd.randrange(n), rnd.randint(0, 20)
            adj[u].append((v, w))
            edges.append((u, v, w))
        INF = float('inf')
        dist = [INF] * n
        dist[0] = 0
        for _ in range(n):
            for u, v, w in edges:
                if dist[u] + w < dist[v]:
                    dist[v] = dist[u] + w
        assert f(n, adj, 0) == dist


@case('W12', '走山路 Dijkstra vs Bellman-Ford')
def t_mountain(ns):
    f = ns['mountain_path']
    rnd = random.Random(43)
    for _ in range(150):
        n, m = rnd.randint(1, 5), rnd.randint(1, 5)
        g = [[rnd.choice([rnd.randint(0, 9), '#']) for _ in range(m)]
             for _ in range(n)]
        sx, sy = rnd.randrange(n), rnd.randrange(m)
        gx, gy = rnd.randrange(n), rnd.randrange(m)
        got = f(g, (sx, sy), (gx, gy))
        if g[sx][sy] == '#' or g[gx][gy] == '#':
            assert got == -1
            continue
        INF = float('inf')
        dist = {(sx, sy): 0}
        for _ in range(n * m + 1):
            for x in range(n):
                for y in range(m):
                    if g[x][y] == '#' or (x, y) not in dist:
                        continue
                    for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < n and 0 <= ny < m and g[nx][ny] != '#':
                            nd = dist[(x, y)] + abs(g[nx][ny] - g[x][y])
                            if nd < dist.get((nx, ny), INF):
                                dist[(nx, ny)] = nd
        assert got == dist.get((gx, gy), -1)


@case('W12', '岛屿数量 vs 并查集')
def t_islands(ns):
    f = ns['num_islands']
    rnd = random.Random(44)
    for _ in range(150):
        n, m = rnd.randint(1, 7), rnd.randint(1, 7)
        g = [''.join(rnd.choice('01') for _ in range(m)) for _ in range(n)]
        parent = list(range(n * m))

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        for i in range(n):
            for j in range(m):
                if g[i][j] != '1':
                    continue
                for di, dj in ((1, 0), (0, 1)):
                    ni, nj = i + di, j + dj
                    if ni < n and nj < m and g[ni][nj] == '1':
                        parent[find(i * m + j)] = find(ni * m + nj)
        roots = {find(i * m + j) for i in range(n) for j in range(m)
                 if g[i][j] == '1'}
        assert f(g) == len(roots), g


@case('W12', '二分答案：河中跳房子 / 月度开销 vs 线性扫描')
def t_binary_answer(ns):
    rh, me = ns['river_hopscotch'], ns['monthly_expense']
    rnd = random.Random(45)
    for _ in range(200):
        L = rnd.randint(2, 30)
        rocks = sorted({rnd.randint(1, L - 1) for _ in range(rnd.randint(1, 6))})
        m = rnd.randint(0, len(rocks))
        stones = rocks + [L]

        def feasible(gap):
            removed, last = 0, 0
            for s in stones:
                if s - last < gap:
                    removed += 1
                    if removed > m:
                        return False
                else:
                    last = s
            return True

        want = max(g for g in range(0, L + 1) if feasible(g))
        assert rh(L, m, rocks) == want, (L, m, rocks)

    for _ in range(200):
        costs = [rnd.randint(1, 30) for _ in range(rnd.randint(1, 10))]
        k = rnd.randint(1, len(costs))

        def groups_needed(limit):
            g, cur = 1, 0
            for c in costs:
                if cur + c > limit:
                    g += 1
                    cur = c
                else:
                    cur += c
            return g

        want = min(x for x in range(max(costs), sum(costs) + 1)
                   if groups_needed(x) <= k)
        assert me(costs, k) == want, (costs, k)


@case('W12', '最小路径和 vs 枚举所有右/下路径')
def t_min_path(ns):
    f = ns['min_path_sum']
    rnd = random.Random(46)
    for _ in range(150):
        n, m = rnd.randint(1, 5), rnd.randint(1, 5)
        g = [[rnd.randint(0, 9) for _ in range(m)] for _ in range(n)]
        best = None
        for path in itertools.permutations('D' * (n - 1) + 'R' * (m - 1)):
            i = j = 0
            s = g[0][0]
            for step in path:
                if step == 'D':
                    i += 1
                else:
                    j += 1
                s += g[i][j]
            best = s if best is None else min(best, s)
        assert f(g) == (best if best is not None else g[0][0])


# ------------------------------------------------------------------- W13
@case('W13', '任务调度贪心 vs 全排列暴力')
def t_max_tasks(ns):
    f = ns['max_tasks']
    rnd = random.Random(47)

    def brute(tasks):
        n = len(tasks)
        for k in range(n, 0, -1):
            for combo in itertools.combinations(range(n), k):
                for order in itertools.permutations(combo):
                    t, ok = 0, True
                    for i in order:
                        t += tasks[i][0]
                        if t > tasks[i][1]:
                            ok = False
                            break
                    if ok:
                        return k
        return 0

    for _ in range(200):
        n = rnd.randint(1, 6)
        ts = [(rnd.randint(1, 5), rnd.randint(1, 12)) for _ in range(n)]
        assert f(ts) == brute(ts), ts


# ------------------------------------------------------------------- W14
@case('W14', '装载顺序贪心 vs 全排列暴力')
def t_load_order(ns):
    f = ns['min_cost_int']
    g = ns['min_cost']
    rnd = random.Random(48)
    for _ in range(300):
        boxes = [(rnd.randint(1, 9), rnd.randint(1, 9))
                 for _ in range(rnd.randint(1, 6))]
        best = None
        for perm in itertools.permutations(boxes):
            el, tot = 0, 0
            for w, t in perm:
                tot += el * w
                el += t
            best = tot if best is None else min(best, tot)
        assert f(boxes) == best, boxes
        assert g(boxes) == best, boxes


@case('W14', '钥匙迷宫 BFS vs 双层图 Dijkstra')
def t_treasure(ns):
    import heapq
    f = ns['treasure']
    rnd = random.Random(49)
    for _ in range(200):
        n, m = rnd.randint(1, 5), rnd.randint(1, 5)
        cells = [[rnd.choice('..#KD') for _ in range(m)] for _ in range(n)]
        si, sj = rnd.randrange(n), rnd.randrange(m)
        ti, tj = rnd.randrange(n), rnd.randrange(m)
        if (si, sj) == (ti, tj):
            continue
        cells[si][sj] = 'S'
        cells[ti][tj] = 'T'
        grid = [''.join(r) for r in cells]
        got = f(grid)
        INF = float('inf')
        start = (si, sj, 0)
        dist = {start: 0}
        pq = [(0, si, sj, 0)]
        ans = -1
        while pq:
            d, x, y, k = heapq.heappop(pq)
            if d > dist.get((x, y, k), INF):
                continue
            if (x, y) == (ti, tj):
                ans = d
                break
            for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                nx, ny = x + dx, y + dy
                if not (0 <= nx < n and 0 <= ny < m):
                    continue
                c = grid[nx][ny]
                if c == '#' or (c == 'D' and k == 0):
                    continue
                nk = 1 if c == 'K' else k
                if d + 1 < dist.get((nx, ny, nk), INF):
                    dist[(nx, ny, nk)] = d + 1
                    heapq.heappush(pq, (d + 1, nx, ny, nk))
        assert got == ans, (grid, got, ans)


@case('W14', '分组考试 DP vs 枚举所有切法')
def t_group_exam(ns):
    f = ns['group_exam']
    rnd = random.Random(50)
    for _ in range(200):
        n = rnd.randint(1, 8)
        a = [rnd.randint(0, 20) for _ in range(n)]
        k = rnd.randint(1, n)
        best = None
        for cuts in itertools.combinations(range(1, n), k - 1):
            bounds = (0,) + cuts + (n,)
            tot = sum(max(a[bounds[i]:bounds[i + 1]])
                      - min(a[bounds[i]:bounds[i + 1]])
                      for i in range(k))
            best = tot if best is None else min(best, tot)
        assert f(a, k) == best, (a, k)


# ------------------------------------------------------------------- W15
@case('W15', 'XOR 网络确实学会了异或')
def t_xor(ns):
    model = ns['train_xor']()
    for x, y in (([0, 0], 0), ([0, 1], 1), ([1, 0], 1), ([1, 1], 0)):
        got = model(x)
        assert (got > 0.5) == bool(y), (x, got)
        assert abs(got - y) < 0.1, (x, got)


@case('W15', '卷积 / 池化 vs 直接定义')
def t_conv(ns):
    conv, pool = ns['conv2d'], ns['max_pool']
    rnd = random.Random(51)
    for _ in range(120):
        m, n = rnd.randint(2, 6), rnd.randint(2, 6)
        a = [[rnd.randint(-5, 5) for _ in range(n)] for _ in range(m)]
        p, q = rnd.randint(1, m), rnd.randint(1, n)
        k = [[rnd.randint(-3, 3) for _ in range(q)] for _ in range(p)]
        want = [[sum(a[i + di][j + dj] * k[di][dj]
                     for di in range(p) for dj in range(q))
                 for j in range(n - q + 1)] for i in range(m - p + 1)]
        assert conv(a, k) == want
        got = pool(a, 2)
        want2 = [[max(a[i + di][j + dj] for di in range(2) for dj in range(2))
                  for j in range(0, n - 1, 2)] for i in range(0, m - 1, 2)]
        assert got == want2


@case('W15', '知识图谱：path 与 BFS 参考实现一致')
def t_kg(ns):
    from collections import deque
    KG = ns['KnowledgeGraph']
    rnd = random.Random(52)
    for _ in range(120):
        n = rnd.randint(2, 8)
        kg = KG()
        adj = {i: set() for i in range(n)}
        for _ in range(rnd.randint(0, 12)):
            u, v = rnd.randrange(n), rnd.randrange(n)
            if u == v:
                continue
            kg.add(u, 'r', v)
            adj[u].add(v)
            adj[v].add(u)
        src, dst = rnd.randrange(n), rnd.randrange(n)
        path = kg.path(src, dst)
        # 参考：无向 BFS 的最短距离
        seen = {src: 0}
        q = deque([src])
        while q:
            x = q.popleft()
            for y in adj[x]:
                if y not in seen:
                    seen[y] = seen[x] + 1
                    q.append(y)
        if dst in seen:
            assert path and path[0] == src and path[-1] == dst
            assert len(path) - 1 == seen[dst], (path, seen[dst])
            for i in range(len(path) - 1):
                assert path[i + 1] in adj[path[i]]
        else:
            assert path == []


@case('W15', 'TF-IDF 检索：相关文档得分最高')
def t_tfidf(ns):
    build, score = ns['build_index'], ns['score']
    docs = ["图灵机 是 一种 计算模型",
            "冯诺依曼 结构 是 现代 计算机 的 基础",
            "动态规划 是 一种 算法 设计 方法"]
    idx = build(docs)
    s = score("计算模型 图灵机", docs, idx)
    assert s[0] > s[1] and s[0] > s[2], s
    s2 = score("动态规划 算法", docs, idx)
    assert s2[2] > s2[0] and s2[2] > s2[1], s2
    assert score("不存在的词", docs, idx) == [0.0, 0.0, 0.0]


@case('W14', '书架分层二分答案 vs 全枚举切法（讲义原文驱动）')
def t_w14_shelves(ns):
    """T5 的三处坑（下界必须是 max(a)、判据是 <= k、二分收缩方向）
    只能用穷举对照来兜住 —— 任何一处写错，小数据上就会立刻分叉。
    """
    import itertools
    sols = stdin_solutions('W14')
    assert len(sols) == 2, f'W14 读 stdin 的参考解答应有 2 段（T5、T6），实际 {len(sols)}'
    src = sols[0]

    def naive(a, k):
        n = len(a)
        return min(max(sum(a[b[i]:b[i + 1]]) for i in range(k))
                   for cuts in itertools.combinations(range(1, n), k - 1)
                   for b in [(0,) + cuts + (n,)])

    # 讲义样例先兑现
    assert run_stdin_solution(src, '5 3\n1 2 3 4 5\n') == '6'

    rnd = random.Random(514)
    for _ in range(200):
        n = rnd.randint(1, 9)
        k = rnd.randint(1, n)
        a = [rnd.randint(1, 20) for _ in range(n)]
        got = int(run_stdin_solution(src, f'{n} {k}\n' + ' '.join(map(str, a)) + '\n'))
        want = naive(a, k)
        assert got == want, (a, k, got, want)


@case('W14', '敌友阵营扩展域并查集 vs BFS 奇偶标号（讲义原文驱动）')
def t_w14_camps(ns):
    """T6 的参照模型不用并查集：在"已采纳关系"的图上做 BFS，
    用**奇偶标号**表示朋友 / 敌人。两套实现对矛盾编号与团体数都必须一致。
    """
    from collections import deque
    src = stdin_solutions('W14')[1]

    def naive(n, rels):
        adj = [[] for _ in range(n + 1)]
        bad = 0

        def parity_from(s):
            par, dq = {s: 0}, deque([s])
            while dq:
                u = dq.popleft()
                for v, w in adj[u]:
                    if v not in par:
                        par[v] = par[u] ^ w
                        dq.append(v)
            return par

        for i, (op, a, b) in enumerate(rels, 1):
            w = 0 if op == 'F' else 1
            par = parity_from(a)
            if b in par and par[b] != w:
                bad = bad or i
                continue
            adj[a].append((b, w))
            adj[b].append((a, w))
        seen, groups = set(), 0
        for s in range(1, n + 1):
            if s in seen:
                continue
            par = parity_from(s)
            seen |= set(par)
            groups += len(set(par.values()))
        return bad, groups

    # 讲义样例先兑现
    assert run_stdin_solution(
        src, '5 4\nF 1 2\nE 2 3\nE 3 4\nF 4 5\n') == '0\n2'

    rnd = random.Random(614)
    for _ in range(200):
        n = rnd.randint(1, 8)
        rels = [(rnd.choice('FE'), rnd.randint(1, n), rnd.randint(1, n))
                for _ in range(rnd.randint(0, 10))]
        rels = [r for r in rels if r[1] != r[2]]
        text = (f'{n} {len(rels)}\n'
                + ''.join(f'{o} {a} {b}\n' for o, a, b in rels))
        got = tuple(map(int, run_stdin_solution(src, text).split()))
        want = naive(n, rels)
        assert got == want, (n, rels, got, want)


@case('W14', '错误归因表点名的错法，逐条给出反例')
def t_w14_wrong_ways(ns):
    """T5、T6 的「错误归因」表是本周讲评的主体。表里每一行都是一句
    "这样写会 WA / TLE"——**没有反例的归因就只是口气重的猜测**。

    本用例为两条可判定的 WA 归因各造一组反例（TLE 那几行靠计时判定不稳定，
    不在此覆盖，讲义里也已写明是复杂度推算而非实测）。
    正确的一侧全部取自讲义原文。
    """
    src5, src6 = stdin_solutions('W14')

    # ---- T5：「判据写成 == k」与「二分下界写 0」
    a, k = [3, 1, 1], 3
    stdin = f'{len(a)} {k}\n' + ' '.join(map(str, a)) + '\n'
    right = int(run_stdin_solution(src5, stdin))
    assert right == 3, f'讲义解答在 {a} / k={k} 上应给 3，实际 {right}'

    def shelves(cap):
        cnt, cur = 1, 0
        for x in a:
            if cur + x > cap:
                cnt += 1
                cur = x
            else:
                cur += x
        return cnt

    def bisect(pred, lo, hi):
        while lo < hi:
            mid = (lo + hi) // 2
            if pred(mid):
                hi = mid
            else:
                lo = mid + 1
        return lo

    wrong_eq = bisect(lambda c: shelves(c) == k, max(a), sum(a))
    assert wrong_eq != right, (
        f'判据写成 == k 也给出 {right}：这组 fixture 证明不了讲义的归因')
    wrong_lo = bisect(lambda c: shelves(c) <= k, 0, sum(a))
    assert wrong_lo != right, (
        f'下界写 0 也给出 {right}：换一组 fixture，否则归因无据')
    assert wrong_lo < max(a), (
        f'下界写 0 的后果应当是给出连单本书都放不下的承重 {wrong_lo} < {max(a)}')

    # ---- T6：「E a b 漏写 union(a+n, b)」
    # 敌人的敌人是朋友：E12、E23 之后 1 与 3 已是朋友，E13 必须判成矛盾
    text = '3 3\nE 1 2\nE 2 3\nE 1 3\n'
    bad, groups = map(int, run_stdin_solution(src6, text).split())
    assert bad == 3, f'讲义解答应把第 3 条判成矛盾，实际 bad={bad}'

    def camps_missing_symmetry(n, rels):
        p = list(range(2 * n + 1))

        def find(x):
            while p[x] != x:
                p[x] = p[p[x]]
                x = p[x]
            return x

        def union(x, y):
            rx, ry = find(x), find(y)
            if rx != ry:
                p[rx] = ry

        first = 0
        for i, (op, u, v) in enumerate(rels, 1):
            clash = find(u) == (find(v + n) if op == 'F' else find(v))
            if clash:
                first = first or i
                continue
            if op == 'F':
                union(u, v)
                union(u + n, v + n)
            else:
                union(u, v + n)          # ← 少了 union(u + n, v)
        return first

    missed = camps_missing_symmetry(3, [('E', 1, 2), ('E', 2, 3), ('E', 1, 3)])
    assert missed != bad, (
        '漏写对称合并竟然也报出了同一个矛盾编号：这组 fixture 证明不了归因')
    assert missed == 0, f'漏写对称合并的后果应当是漏判矛盾，实际报了第 {missed} 条'


# ------------------------------------------------------------------- W16
@case('W16', '会议室：堆写法 vs 逐点峰值')
def t_rooms(ns):
    f = ns['min_rooms']
    rnd = random.Random(53)
    for _ in range(300):
        iv = []
        for _ in range(rnd.randint(1, 9)):
            a = rnd.randint(0, 15)
            iv.append((a, a + rnd.randint(1, 6)))
        pts = sorted({a for a, _ in iv})
        peak = max(sum(1 for a, b in iv if a <= p < b) for p in pts)
        assert f(iv) == peak, iv


@case('W16', '样卷 T1–T6 参考解答 vs 讲义样例 + 红队 fixture')
def t_w16_reference_solutions(ns):
    """直接执行讲义里给学生照抄的那六段代码，喂样例与红队反例，比对文档承诺的输出。

    输入 / 期望输出全部取自 W16 讲义本身（第 5 节各题的样例，
    以及第 5.7 节「红队测试数据」表里的固定反例）。
    """
    sols = stdin_solutions('W16')
    assert len(sols) == 6, f'W16 读 stdin 的参考解答应有 6 段，实际 {len(sols)} 段'

    cases = {
        0: [('2\n2200002 math 85\n2200001 math 85\n',
             '2200001 85 85.00\n2200002 85 85.00'),            # 红队：并列取学号升序
            ('5\n2200011 math 90\n2200011 physics 80\n2200012 math 95\n'
             '2200012 physics 75\n2200013 math 85\n',
             '2200011 170 85.00\n2200012 170 85.00\n2200013 85 85.00')],
        1: [('(]\n', 'NO 2'), ('a(b[c]{d})e\n', 'YES 2'),
            ('((()\n', 'NO 5'), ('()[]{}\n', 'YES 1'), ('(([]))\n', 'YES 3')],
        2: [('2\n0 1\n1 2\n', '1'),                            # 红队：端点相接
            ('3\n0 30\n5 10\n15 20\n', '2')],
        3: [('5 5 1\nS#.#.\n...#.\n#....\n.####\n#.#.T\n', '8'),   # 红队：单层 visited
            ('3 5 2\nS#.#T\n.#.#.\n.....\n', '4'),
            ('3 5 0\nS#.#T\n.#.#.\n.....\n', '8')],
        4: [('1 10\n3 5\n', '5 3'),                             # 红队：正序背包重复选
            ('2 5\n5 10\n3 10\n', '10 3'),                     # 红队：同分取最小耗时
            ('4 10\n3 10\n4 14\n5 16\n2 5\n', '31 10')],
        5: [('3 3\n1 2 5\n2 3 5\n1 3 6\n', '5'),              # 红队：瓶颈 != 最小和
            ('4 4\n1 2 5\n2 3 3\n3 4 7\n1 4 6\n', '6'),
            ('3 1\n1 2 4\n', '-1')],
    }
    for idx, items in cases.items():
        for stdin_text, want in items:
            got = run_stdin_solution(sols[idx], stdin_text)
            assert got == want, (
                f'样卷 T{idx + 1} 参考解答输出不符：'
                f'输入 {stdin_text!r} -> 得到 {got!r}，讲义承诺 {want!r}')


# ---------------------------------------------------------------- 运行器
def main(argv):
    wanted = [w.upper() for w in argv] or sorted(WEEK_FILES)
    caches = {}
    passed = failed = 0
    for week, name, fn in CASES:
        if week not in wanted:
            continue
        if week not in caches:
            caches[week] = load_week(week)
        try:
            fn(caches[week])
        except Exception as e:
            failed += 1
            print(f'  ✗ [{week}] {name}\n      {type(e).__name__}: {e}')
        else:
            passed += 1
            print(f'  ✓ [{week}] {name}')
    print('=' * 68)
    print(f'{passed} 项通过，{failed} 项失败（共 {passed + failed} 项）')
    return 1 if failed else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))

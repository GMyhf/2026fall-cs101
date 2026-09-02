# -*- coding: utf-8 -*-
"""第8周 递归"""

META = {
    'title': '第8周　递归',
    'subtitle': '三法则 · 栈帧与虚拟地址空间 · 递归三部曲 · 分治 · 记忆化',
    'footer': '计算概论（B） · 第8周 · 闫宏飞 · 2026 Fall',
    'info': ['北京大学　《计算概论（B）》',
             '主题与学习重点：递归。'],
}

SLIDES = [
    ('code', '什么是递归', '''def factorial(n):
    if n <= 1:              # 基例（base case）
        return 1
    return n * factorial(n - 1)     # 递归调用，向基例逼近


print(factorial(5))         # 120
''', '递归：函数在自己的定义中调用自己'),

    ('key', '递归三法则',
     '必须有基例；必须改变状态并向基例逼近；必须调用自身。三条缺一，就是死循环。'),

    ('bullets', '递归的思维方式：相信它', [
        '写递归时**不要在脑子里展开每一层**。只需回答两个问题：',
        '- **最小的情况怎么办？**（基例）',
        '- **假设"更小的问题已经解决了"，怎么用它拼出当前问题的答案？**',
    ]),

    ('code', '例：求数组之和 —— 两种写法', '''def list_sum(a):
    if not a:                        # 1) 空数组和为 0
        return 0
    return a[0] + list_sum(a[1:])    # 2) 首元素 + 剩下的和


def list_sum2(a, i=0):               # ✅ 实战写法：用下标而非切片
    return 0 if i == len(a) else a[i] + list_sum2(a, i + 1)


print(list_sum([1, 3, 5, 7, 9]), list_sum2([1, 3, 5, 7, 9]))   # 25 25
''', '⚠️ 每层都做 a[1:] 切片（O(n)）会让整体变成 O(n^2)'),

    ('code', '递归 ⇄ 迭代：任何递归都能改写', '''def to_base_rec(n, base):
    digits = "0123456789ABCDEF"
    if n < base:
        return digits[n]
    return to_base_rec(n // base, base) + digits[n % base]


def to_base_iter(n, base):           # 显式栈
    digits = "0123456789ABCDEF"
    if n == 0:
        return "0"
    stack = []
    while n:
        stack.append(digits[n % base]); n //= base
    return ''.join(reversed(stack))


print(to_base_rec(233, 16), to_base_iter(233, 16))   # E9 E9
''', '递归代码短、贴近数学定义；迭代没有深度限制、常数更小。能写成简单循环的就别用递归'),

    ('section', '第 1 节', '栈帧：递归为什么会爆栈'),

    ('ascii', '系统调用栈', r"""
   factorial(3)
   |- 调用 factorial(2)          栈：[f(3)]
   |  |- 调用 factorial(1)       栈：[f(3), f(2)]
   |  |  +- 返回 1               栈：[f(3), f(2), f(1)]
   |  +- 返回 2 * 1 = 2          栈：[f(3), f(2)]
   +- 返回 3 * 2 = 6             栈：[f(3)]

   每次调用压入一个栈帧（参数、局部变量、返回地址），返回时弹出
""", '递归 = 在用系统栈。栈空间有限，递归太深就溢出'),

    ('table', '递归深度限制：其实有两道墙', [
        ['', '是什么', '撞上去会怎样', '`setrecursionlimit` 管得到吗'],
        ['**墙一**', '解释器自己数的嵌套层数', '抛 `RecursionError`，**看得懂**', '✅ 管得到'],
        ['**墙二**', '**C 调用栈**（主线程通常 8 MB）', '**段错误**，进程直接死', '❌ 管不到'],
    ], '墙一本是设在墙二前面的护栏。把护栏挪远、墙二没动 —— 于是「能看懂的异常」变成了「没有 traceback 的 RE」'),

    ('table', '3.11 之后两道墙的位置变了（本机实测）', [
        ['递归形状', '最深能到', '线程栈加到 64 MB 有用吗'],
        ['纯 Python 递归', '**30 万层照跑**（32 KB 栈也够）', '没有区别'],
        ['递归**穿过 C 代码**（`@lru_cache`）', '**3331 层封顶**，抛 `RecursionError`', '**没用**，还是 3331'],
    ], 'CPython 3.12.3 / Linux，已 setrecursionlimit(1<<20)。请当成某个环境下的实测值，不是语言规范 —— 这恰恰是不该依赖它的理由'),

    ('bullets', '什么叫「递归穿过 C 代码」', [
        '调用链中间夹了一层 C 实现的东西，就会掉进墙二：',
        '**`@lru_cache` / `@cache` 的记忆化搜索** —— 本周就在教，也是最常踩的',
        '`repr()` / `print()` 一个深度嵌套的列表；`sorted(key=...)` 里调用递归函数',
        '`re` 的回溯匹配、`copy.deepcopy`、`json.dumps`、`pickle.dumps`',
        '**`threading.stack_size` 加大的是新线程的 C 栈**，也就是往后推墙二：'
        '≤3.10 确实有效；3.11+ 对纯递归没必要；对穿过 C 的递归**没用**',
        '**别把它当护身符** —— 它能不能救你，取决于评测机的版本和你的递归形状，两件事你都控制不了',
    ]),

    ('code', '唯一与版本、评测机都无关的做法：显式栈', '''import sys


def depth_rec(n):
    return 0 if n == 0 else 1 + depth_rec(n - 1)


def depth_iter(n):
    """同一件事的显式栈版本：深度只受内存限制"""
    total, stack = 0, [n]
    while stack:
        k = stack.pop()
        if k:
            total += 1
            stack.append(k - 1)
    return total


sys.setrecursionlimit(1 << 20)
print(depth_rec(3000), depth_iter(3000))     # 3000 3000  小深度上两者一致
print(depth_iter(10 ** 6))                   # 1000000    递归版到不了这里
''', '深递归题的可靠解法只有一个：显式栈。另外两招都是「看运气」的补丁，而且失败方式恰恰最难诊断'),

    ('ascii', '进程的虚拟地址空间', r"""
   高地址
   +-------------------+
   |       内核区       |
   +-------------------+
   |       栈 Stack     |  <- 函数调用帧，向下增长，通常 8 MB
   |         v          |
   |                    |
   |         ^          |
   |       堆 Heap      |  <- 动态分配的对象，向上增长
   +-------------------+
   |   全局 / 静态数据   |
   +-------------------+
   |     代码段 Text     |
   +-------------------+
   低地址
""", '"虚拟"：每个进程都以为自己独占整个地址空间，由 OS + MMU 映射到物理内存'),

    ('section', '第 2 节', '递归三部曲'),

    ('ascii', '序曲：朴素斐波那契是 O(2^n)', r"""
                 fib(5)
            /            \
        fib(4)          fib(3)      <- fib(3) 算了两次
      /      \         /     \
   fib(3)  fib(2)   fib(2) fib(1)   <- fib(2) 算了三次
   /    \
fib(2) fib(1)
""", '同一个子问题被重复计算无数次 —— 这就是"重叠子问题"'),

    ('code', '三种修法', '''from functools import lru_cache


@lru_cache(maxsize=None)            # 修法一：记忆化，O(n)
def fib_memo(n):
    return 1 if n <= 2 else fib_memo(n - 1) + fib_memo(n - 2)


def fib_iter(n):                    # 修法二：迭代递推，O(n)、O(1) 空间
    a, b = 1, 1
    for _ in range(n - 2):
        a, b = b, a + b
    return b if n >= 2 else 1


def fib_dp(n):                      # 修法三：自底向上填表
    if n <= 2:
        return 1
    dp = [0] * (n + 1); dp[1] = dp[2] = 1
    for i in range(3, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]


print(fib_memo(50), fib_iter(50), fib_dp(50))   # 三者一致
''', 'lru_cache 是本课最划算的一行代码：一个装饰器把指数降成线性'),

    ('bullets', '第一部：汉诺塔（04147）的三步', [
        '把上面 **n−1 个盘从 A 移到 B**（借助 C）',
        '把**最大的第 n 个盘从 A 移到 C**',
        '把 **n−1 个盘从 B 移到 C**（借助 A）',
        '移动次数：T(n) = 2T(n−1) + 1，T(1) = 1 ⟹ **T(n) = 2ⁿ − 1**',
    ]),

    ('code', '汉诺塔实现', '''def hanoi(n, src, aux, dst, moves):
    if n == 0:
        return
    hanoi(n - 1, src, dst, aux, moves)      # 1) n-1 个到辅助柱
    moves.append(f"{n}:{src}->{dst}")       # 2) 最大的一个到目标柱
    hanoi(n - 1, aux, src, dst, moves)      # 3) n-1 个从辅助柱到目标柱


moves = []
hanoi(3, 'A', 'B', 'C', moves)
print(len(moves), moves)
# 7 ['1:A->C', '2:A->B', '1:C->B', '3:A->C', '1:B->A', '2:B->C', '1:A->C']

print([(1 << k) - 1 for k in range(1, 8)])   # [1, 3, 7, 15, 31, 63, 127]
''', '64 层汉诺塔需 2^64-1 ≈ 1.8x10^19 次移动，每秒一次约需 5850 亿年 —— 指数复杂度的实感'),

    ('code', '第二部：全排列（02748）—— 回溯模板的原型', '''def permutations(a):
    res, used, path = [], [False] * len(a), []

    def dfs():
        if len(path) == len(a):
            res.append(path[:])          # ⚠️ 必须拷贝
            return
        for i in range(len(a)):
            if used[i]:
                continue
            used[i] = True; path.append(a[i])
            dfs()
            path.pop(); used[i] = False  # 回溯：撤销选择
    dfs()
    return res


print([''.join(map(str, p)) for p in permutations([1, 2, 3])])
# ['123', '132', '213', '231', '312', '321']
''', '三个细节：拷贝 path[:]；回溯还原状态；复杂度 O(n!·n)，所以 n <= 10'),

    ('section', '第 3 节', '分治'),

    ('table', '分治：分 → 治 → 合', [
        ['算法', '分', '合', '复杂度'],
        ['归并排序', '对半切', '合并两个有序表', 'O(n log n)'],
        ['快速排序', '按 pivot 划分', '无需合并', '平均 O(n log n)'],
        ['二分查找', '只保留半边', '无需合并', 'O(log n)'],
        ['快速幂', '指数减半', '相乘', 'O(log n)'],
    ]),

    ('code', '快速幂与二分查找', '''def fast_pow(a, b, mod=None):
    if b == 0:
        return 1 % mod if mod else 1
    half = fast_pow(a, b // 2, mod)
    res = half * half
    if b & 1:
        res *= a
    return res % mod if mod else res


def lower_bound(a, target):
    """第一个 >= target 的位置。⭐ 只记这一版：不会死循环，不会漏边界。"""
    lo, hi = 0, len(a)
    while lo < hi:
        mid = (lo + hi) // 2
        if a[mid] < target:
            lo = mid + 1
        else:
            hi = mid
    return lo


print(fast_pow(2, 10), pow(3, 100, 10**9 + 7))
print(lower_bound([1, 3, 5, 7, 9], 5), lower_bound([1, 3, 5, 7, 9], 6))   # 2 3
''', '"最后一个 <= target"用 lower_bound(a, target+1) - 1；内建 pow(a,b,mod) 就是快速幂'),

    ('code', '03248 最大公约数', '''def gcd(a, b):
    return a if b == 0 else gcd(b, a % b)


def lcm(a, b):
    return a // gcd(a, b) * b        # 先除后乘，避免中间结果过大


print(gcd(12, 18), lcm(4, 6))        # 6 12
''', '原理：a 与 b 的公约数集合，和 b 与 a mod b 的公约数集合完全相同'),

    ('section', '第 4 节', '递归的调试'),

    ('code', '打印调用树：缩进就是栈深度', '''def fib_trace(n, depth=0):
    print("  " * depth + f"fib({n})")
    if n <= 2:
        return 1
    return fib_trace(n - 1, depth + 1) + fib_trace(n - 2, depth + 1)


fib_trace(4)
# fib(4)
#   fib(3)
#     fib(2)
#     fib(1)
#   fib(2)
''', '看到重复的子树，就该上记忆化。pythontutor.com 能逐步展示栈帧的压入弹出'),

    ('table', '递归的常见错误', [
        ['症状', '原因'],
        ['RecursionError', '没有基例，或没向基例逼近'],
        ['结果全一样', '收集答案时忘了 path[:] 拷贝'],
        ['结果多了 / 少了', '忘了回溯（pop / 状态还原）'],
        ['TLE', '有重叠子问题却没记忆化'],
        ['RE（且没有 traceback）', '递归太深撞穿 C 栈（墙二）；新版 CPython 上更常见的表现是 `RecursionError`'],
    ]),

    ('table', '本周作业', [
        ['#', '题目', '编号', '考点'],
        ['1–2', '菲波那契数列 / Pell 数列', '02753 / M02786', '递归 + 记忆化'],
        ['3', '汉诺塔问题(Tower of Hanoi)', '04147', '递归三步'],
        ['4', '全排列', '02748', '回溯模板'],
        ['5', '最大公约数', '03248', '辗转相除'],
        ['6', '递归比较字符串大小', '28717', '递归定义'],
        ['7–8', '放苹果 / 简单的整数划分问题', '01664 / 04117', '递归计数 + 记忆化'],
        ['9（选做）', 'Help Jimmy', 'T01661', '递归 + 记忆化（难）'],
    ]),

    ('bullets', '小结', [
        '递归三法则：**有基例、向基例逼近、调用自身**。写的时候只想两层',
        '递归深度有**两道墙**：Python 层计数器（`setrecursionlimit` 管得到）与 **C 调用栈**（管不到）',
        '**深递归唯一可靠的解法是显式栈**；另外两招都要看版本和评测机的脸色',
        '三部曲：**斐波那契**（→记忆化）、**汉诺塔**（2ⁿ−1）、**全排列**（回溯模板）',
        '分治 = 分 + 治 + 合：归并、快排、二分、快速幂',
        '回溯的两个必犯错误：**忘拷贝** `path[:]`、**忘还原** `pop`',
    ]),

    ('key', '下周预告',
     '把递归用到底：回溯（八皇后、马走日、组合与子集）与并查集。'),
]

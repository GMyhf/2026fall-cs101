# -*- coding: utf-8 -*-
"""第4周 计算机基础、Python 基础与算法分析入门"""

META = {
    'title': '第4周　计算机基础、Python 基础与算法分析入门',
    'subtitle': '函数与可变对象 · 四种容器与代价 · 大 O · 从数据范围倒推算法 · 常数优化',
    'footer': '计算概论（B） · 第4周 · 闫宏飞 · 2026 Fall',
    'info': ['北京大学　《计算概论（B）》',
             '主题与学习重点：计算机基础、Python 基础与算法分析入门。'],
}

SLIDES = [
    ('bullets', '本讲内容', [
        '**Python 基础补齐**', '- 函数、可变/不可变、浅深拷贝、异常处理',
        '**四种容器与它们的代价**', '- list / tuple / set / dict 的操作复杂度',
        '**算法分析**', '- 大 O、常见级别、从数据范围倒推算法',
        '**常数优化**', '- 快速 IO、少做重复计算、用内建函数、埃氏筛',
        '**调试**', '- 通用方法、常见错误、考场纪律',
    ]),

    ('section', '第 1 节', 'Python 基础补齐'),

    ('code', '经典陷阱：默认参数是可变对象', '''def bad(x, acc=[]):         # ❌ acc 只在函数定义时创建一次
    acc.append(x)
    return acc

print(bad(1))               # [1]
print(bad(2))               # [1, 2]  —— 不是期望的 [2]


def good(x, acc=None):      # ✅ 标准写法
    if acc is None:
        acc = []
    acc.append(x)
    return acc

print(good(1), good(2))     # [1] [2]
''', ''),

    ('two', '可变与不可变',
     '不可变', ['int', 'float', 'str', 'tuple', 'bool', 'frozenset'],
     '可变', ['list', 'dict', 'set', '自定义对象']),

    ('code', '浅拷贝与深拷贝', '''import copy

a = [[1, 2], [3, 4]]
b = a                        # 别名：完全同一个对象
c = a[:]                     # 浅拷贝：外层新建，内层仍共享
d = copy.deepcopy(a)         # 深拷贝：彻底独立

a[0][0] = 99
print(b[0][0], c[0][0], d[0][0])   # 99 99 1
''', '做题时：一维用 dp[:]，二维必须 [row[:] for row in grid]'),

    ('code', 'OJ 上最常用的异常处理', '''import sys

for line in sys.stdin:            # 读到文件尾就结束
    line = line.strip()
    if not line:
        continue
    # 处理一行

while True:                        # 另一种写法
    try:
        n = int(input())
    except EOFError:
        break
    print(n * n)
''', ''),

    ('section', '第 2 节', '四种容器与它们的代价'),

    ('table', '容器选型', [
        ['容器', '有序', '可变', '可重复', '典型用途'],
        ['list', '是', '是', '是', '序列、栈、动态数组'],
        ['tuple', '是', '否', '是', '不变的记录、可作字典键'],
        ['set', '否', '是', '否', '去重、判存在'],
        ['dict', '插入序', '是', '键不重复', '映射、计数'],
    ]),

    ('table', '操作复杂度（必须背下来）', [
        ['操作', 'list', 'set / dict'],
        ['按下标取 a[i]', 'O(1)', '—'],
        ['末尾追加 append', '均摊 O(1)', '—'],
        ['末尾弹出 pop()', 'O(1)', '—'],
        ['头部插入 insert(0,x)', 'O(n) ⚠️', '—'],
        ['头部弹出 pop(0)', 'O(n) ⚠️', '—'],
        ['判存在 x in c', 'O(n) ⚠️', 'O(1)'],
        ['插入 / 删除', 'O(n)', 'O(1)'],
    ], '⭐ 多数"算法对但 TLE"的代码，死因就在这张表里'),

    ('code', '实测：list 的 in vs set 的 in', '''import time

n = 200000
data = list(range(n))
lst, st = data, set(data)

t0 = time.time()
sum(1 for x in range(0, n, 1000) if x in lst)     # O(n) 每次
t1 = time.time()
sum(1 for x in range(0, n, 1000) if x in st)      # O(1) 每次
t2 = time.time()

print(f"list in: {t1 - t0:.4f}s   set in: {t2 - t1:.6f}s")
# 典型结果：list in 约 0.6s，set in 约 0.0001s —— 相差三个数量级
''', ''),

    ('code', '需要队列时用 deque；计数用 Counter', '''from collections import deque, Counter, defaultdict

q = deque([1, 2, 3])
q.append(4)          # 右进 O(1)
q.appendleft(0)      # 左进 O(1)
q.popleft()          # 左出 O(1)  —— list.pop(0) 的正确替代

words = "the quick brown the lazy the end".split()
cnt = Counter(words)
print(cnt['the'], cnt.most_common(2))    # 3 [('the', 3), ('quick', 1)]

groups = defaultdict(list)
for w in words:
    groups[len(w)].append(w)
''', 'Counter 一遍 O(n)；[lst.count(x) for x in set(lst)] 是 O(n^2)'),

    ('section', '第 3 节', '算法分析：这段代码够快吗'),

    ('key', '大 O 忽略常数与低阶项',
     '3n² + 100n + 500 -> O(n²)；n 足够大时，量级压倒一切。'),

    ('table', '常见复杂度级别', [
        ['复杂度', '名称', 'n=10^6 时约需', '典型算法'],
        ['O(1)', '常数', '1', '下标访问、哈希查找'],
        ['O(log n)', '对数', '20', '二分查找'],
        ['O(n)', '线性', '10^6', '一遍扫描'],
        ['O(n log n)', '线性对数', '2x10^7', '排序、分治'],
        ['O(n^2)', '平方', '10^12 ❌', '双重循环'],
        ['O(2^n)', '指数', '天文数字 ❌', '枚举子集'],
        ['O(n!)', '阶乘', '天文数字 ❌', '全排列'],
    ]),

    ('code', '隐藏的复杂度 —— 最容易漏的', '''for i in range(n):
    if x in lst:            # <- 这一行是 O(n)，整体 O(n^2)
        pass

for i in range(n):
    s = s + str(i)          # <- 字符串拼接每次 O(len)，整体 O(n^2)
    # 正确写法：out.append(str(i))  最后 ''.join(out)
''', ''),

    ('table', '从数据范围倒推算法（考场最实用的一招）', [
        ['n 的范围', '可接受的复杂度', '该想什么'],
        ['n <= 10', 'O(n!) / O(2^n · n)', '全排列、暴力搜索'],
        ['n <= 20', 'O(2^n)', '枚举子集、状压'],
        ['n <= 100', 'O(n^3)', 'Floyd、区间 DP'],
        ['n <= 1000', 'O(n^2)', '二维 DP、暴力两重循环'],
        ['n <= 10^5', 'O(n log n)', '排序、二分、堆、优先队列'],
        ['n <= 10^6', 'O(n)', '一遍扫描、双指针、前缀和'],
        ['n >= 10^8', 'O(log n) / O(1)', '数学公式、快速幂'],
    ], 'OJ 机器约每秒 10^7–10^8 次基本操作'),

    ('key', '考场流程',
     '读完题先看数据范围 → 定复杂度上限 → 再想算法。反过来做会浪费大量时间。'),

    ('bullets', '空间复杂度', [
        '经验值：**10^6 个整数的列表约 40 MB**',
        'OJ 内存限制常见 **64–256 MB**',
        '所以 n = 10^7 的一维数组还行，n = 10^4 的二维数组（10^8 个元素）必然 MLE',
    ]),

    ('section', '第 4 节', '常数优化'),

    ('code', '按收益排序的三招', '''import sys

# 1) 快速输入输出
input = sys.stdin.readline          # 大量行输入时提速明显（保留行尾换行符！）
data = sys.stdin.read().split()     # 一次读完，最快
sys.stdout.write('\\n'.join(out) + '\\n')

# 2) 少做重复计算：把 len、属性查找提到循环外
n = len(a)
append = res.append
for i in range(n):
    append(i)

# 3) 用内建函数（C 实现，比等价 Python 循环快一个量级）
s = sum(a); m = max(a); b = sorted(a)
c = list(map(int, line.split()))    # 快于列表推导式
''', '⚠️ 复杂度不对时，不要优化常数'),

    ('code', '埃拉托色尼筛：O(n log log n)', '''def sieve(limit):
    is_prime = [True] * (limit + 1)
    is_prime[0] = is_prime[1] = False
    i = 2
    while i * i <= limit:
        if is_prime[i]:
            for j in range(i * i, limit + 1, i):   # 从 i*i 开始
                is_prime[j] = False
        i += 1
    return is_prime


primes = sieve(100)
print([i for i, p in enumerate(primes) if p])
# [2, 3, 5, 7, 11, ..., 97]
''', '为什么从 i*i 开始：更小的倍数已被更小的因子筛掉'),

    ('code', 'T-primes：恰好 3 个约数 = 素数的平方', '''LIMIT = 10 ** 6                      # sqrt(10^12)
is_prime = sieve(LIMIT)


def is_tprime(x):
    r = int(x ** 0.5)
    while r * r > x:                 # ⚠️ 浮点开方在大整数上会差 1
        r -= 1
    while (r + 1) * (r + 1) <= x:
        r += 1
    return r * r == x and r <= LIMIT and is_prime[r]


print([x for x in [1, 4, 9, 12, 16, 25, 36, 49] if is_tprime(x)])
# [4, 9, 25, 49]
''', '那两行 while 校正是本题最常见的 WA 来源 —— 第 3 周"浮点不可靠"的直接后果'),

    ('section', '第 5 节', '调试'),

    ('bullets', '通用方法', [
        '**读错误信息的最后一行** —— 它告诉你错误类型和位置',
        '**构造最小复现输入** —— 把出错的输入砍到最小仍能复现',
        '**打印中间状态**：`print(..., file=sys.stderr)`（不污染 OJ 输出）',
        '**用调试器单步** —— PyCharm 打断点比 print 快得多',
        '**对拍** —— 写暴力解，随机造数据，比较两者输出',
    ]),

    ('table', '常见错误与对策', [
        ['OJ 反馈', '含义', '常见原因'],
        ['WA', '答案错', '边界(n=0/1)、读题漏条件、输出格式、精度'],
        ['TLE', '超时', '复杂度过高、in 用在 list 上、pop(0)'],
        ['MLE', '超内存', '开了过大的数组、递归过深'],
        ['RE', '运行错误', '下标越界、除零、递归爆栈'],
        ['PE', '格式错', '多余空格 / 换行'],
    ]),

    ('key', '三条考场纪律',
     '样例过了不等于对；TLE 先看复杂度别急着调常数；卡住 15 分钟就换题。'),

    ('table', '本周作业', [
        ['#', '题目', '编号', '考点'],
        ['1', '多项式时间复杂度', 'E23563', '字符串解析、复杂度概念'],
        ['2', '验证"歌德巴赫猜想"', 'E03143', '素数筛'],
        ['3', '生日相同', 'E02724', '字典分组、排序'],
        ['4', '与 7 无关的数', '02701', '循环'],
        ['5', '数论', 'E23564', '数学'],
        ['6', '2050 年成绩计算', 'E18176', '模拟、格式'],
        ['7', '词典', 'E02804', '字典查询'],
        ['8（选做）', '最大公约数', '03248', '辗转相除、递归预热'],
    ]),

    ('bullets', '小结', [
        '默认参数别用可变对象；二维拷贝用 `[row[:] for row in grid]`',
        '**容器复杂度表要背**：list 的 `in`/`pop(0)` 是 O(n)，set/dict 是 O(1)，队列用 `deque`',
        '大 O 忽略常数；**先看数据范围，再定复杂度，最后想算法**',
        '常数优化顺序：快速 IO → 减少重复计算 → 用内建函数',
        '浮点开方在大整数上会差 1，边界要用整数校正',
    ]),

    ('key', '下周预告',
     '10 月月考：第一次在机房环境下限时做题，以及考后的阶段复习。'),
]

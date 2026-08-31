# -*- coding: utf-8 -*-
"""第6周 矩阵、排序与贪心"""

META = {
    'title': '第6周　矩阵、排序与贪心：认识时间复杂度',
    'subtitle': '保护圈与方向数组 · 矩阵乘法与前缀和 · 排序与稳定性 · 贪心与交换论证',
    'footer': '计算概论（B） · 第6周 · 闫宏飞 · 2026 Fall',
    'info': ['北京大学　《计算概论（B）》',
             '主题与学习重点：矩阵、排序与贪心；认识时间复杂度。'],
}

SLIDES = [
    ('bullets', '本讲内容', [
        '**矩阵**', '- 表示与遍历、保护圈、方向数组、转置旋转、乘法、二维前缀和',
        '**排序**', '- sorted 与 key、稳定性、五种基础排序、归并求逆序对',
        '**贪心**', '- 三要素、反例、排序型贪心、交换论证',
        '**复杂度实战**', '- 同一道题的三种写法与可解规模',
    ]),

    ('section', '第 1 节', '矩阵'),

    ('code', '表示与读入', '''m, n = 3, 4
a = [[0] * n for _ in range(m)]        # ✅ m 行 n 列
# a = [[0] * n] * m                    # ❌ 三行是同一个列表

import sys
data = sys.stdin.read().split()
idx = 0
m, n = int(data[idx]), int(data[idx + 1]); idx += 2
a = []
for _ in range(m):
    a.append([int(data[idx + j]) for j in range(n)])
    idx += n
''', '按行遍历比按列遍历快 —— 一行的元素在内存中相邻（第 3 周存储层次）'),

    ('code', '保护圈：省掉边界判断', '''# 加保护圈：把 m x n 放进 (m+2) x (n+2) 的全 0 网格中央
g = [[0] * (n + 2) for _ in range(m + 2)]
for i in range(m):
    for j in range(n):
        g[i + 1][j + 1] = a[i][j]

DIRS = ((-1, 0), (1, 0), (0, -1), (0, 1))
res = [[0] * n for _ in range(m)]
for i in range(1, m + 1):
    for j in range(1, n + 1):
        res[i - 1][j - 1] = sum(g[i + di][j + dj] for di, dj in DIRS)
''', '方向数组是第 9 周 DFS、第 12 周 BFS 反复使用的写法'),

    ('code', '方向数组与转置旋转', '''DIRS4 = ((-1, 0), (1, 0), (0, -1), (0, 1))               # 上下左右
DIRS8 = tuple((di, dj) for di in (-1, 0, 1) for dj in (-1, 0, 1)
              if (di, dj) != (0, 0))                     # 八邻域

a = [[1, 2, 3], [4, 5, 6]]
t = [list(row) for row in zip(*a)]          # 转置 -> [[1,4],[2,5],[3,6]]

b = [[1, 2], [3, 4]]
cw = [list(row) for row in zip(*b[::-1])]   # 顺时针 90 度 -> [[3,1],[4,2]]
ccw = [list(row) for row in zip(*b)][::-1]  # 逆时针 90 度 -> [[2,4],[1,3]]
''', '记法：顺时针 = 先上下翻转再转置；逆时针 = 先转置再上下翻转'),

    ('code', '矩阵乘法 O(m·k·n)', '''def matmul(A, B):
    m, k, n = len(A), len(B), len(B[0])
    C = [[0] * n for _ in range(m)]
    for i in range(m):
        Ai, Ci = A[i], C[i]              # 提到内层循环外，减少索引
        for t in range(k):
            if Ai[t]:                    # 稀疏时跳过零
                Bt, v = B[t], Ai[t]
                for j in range(n):
                    Ci[j] += v * Bt[j]
    return C


print(matmul([[1, 2], [3, 4]], [[5, 6], [7, 8]]))   # [[19, 22], [43, 50]]
''', 'n=200 时 8x10^6 可以；n=1000 时 10^9 必然 TLE。E18161 的失分几乎全在漏判维度'),

    ('code', '二维前缀和：预处理 O(mn)，查询 O(1)', '''def build_prefix(a):
    m, n = len(a), len(a[0])
    pre = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m):
        for j in range(n):
            pre[i+1][j+1] = pre[i][j+1] + pre[i+1][j] - pre[i][j] + a[i][j]
    return pre


def query(pre, r1, c1, r2, c2):
    return pre[r2+1][c2+1] - pre[r1][c2+1] - pre[r2+1][c1] + pre[r1][c1]


a = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
pre = build_prefix(a)
print(query(pre, 0, 0, 1, 1))     # 1+2+4+5 = 12
print(query(pre, 1, 1, 2, 2))     # 5+6+8+9 = 28
''', '容斥原理：大矩形 - 上 - 左 + 左上（被减了两次要加回来）'),

    ('section', '第 2 节', '排序'),

    ('code', '会用 sorted 就够应付大多数题', '''people = [("bob", 20), ("amy", 20), ("cid", 18)]
print(sorted(people, key=lambda p: p[1]))          # 按年龄升序
print(sorted(people, key=lambda p: (p[1], p[0])))  # 年龄升序，同龄按名字升序
print(sorted(people, key=lambda p: (-p[1], p[0]))) # 年龄降序，同龄按名字升序

# 稳定性：相等元素保持原有相对顺序 -> 可以"两次排序"
rows = [("a", 2), ("b", 1), ("c", 2)]
rows.sort(key=lambda r: r[0])        # 先按次关键字
rows.sort(key=lambda r: r[1])        # 再按主关键字
print(rows)                          # [('b', 1), ('a', 2), ('c', 2)]
''', 'Timsort，O(n log n)；已排序数据接近 O(n)'),

    ('table', '五种基础排序', [
        ['算法', '平均', '最坏', '空间', '稳定', '特点'],
        ['冒泡', 'O(n^2)', 'O(n^2)', 'O(1)', '是', '教学用；可提前退出'],
        ['选择', 'O(n^2)', 'O(n^2)', 'O(1)', '否', '交换次数最少'],
        ['插入', 'O(n^2)', 'O(n^2)', 'O(1)', '是', '近乎有序时接近 O(n)'],
        ['归并', 'O(n log n)', 'O(n log n)', 'O(n)', '是', '分治；可求逆序数'],
        ['快排', 'O(n log n)', 'O(n^2)', 'O(log n)', '否', '常数最小；随机化避最坏'],
    ], '考试一般直接 sort()，但归并的"合并过程"要会默写'),

    ('code', '归并排序求逆序对', '''def count_inversions(a):
    """返回 (排序后的列表, 逆序对个数)。O(n log n)。"""
    if len(a) <= 1:
        return a[:], 0
    mid = len(a) // 2
    left, x = count_inversions(a[:mid])
    right, y = count_inversions(a[mid:])
    out, i, j, cnt = [], 0, 0, x + y
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            out.append(left[i]); i += 1
        else:
            out.append(right[j]); j += 1
            cnt += len(left) - i     # left 中剩下的都比 right[j] 大
    out.extend(left[i:]); out.extend(right[j:])
    return out, cnt


print(count_inversions([3, 1, 2])[1])       # 2
print(count_inversions([5, 4, 3, 2, 1])[1]) # 10 = C(5,2)
''', ''),

    ('section', '第 3 节', '贪心'),

    ('bullets', '贪心的三个要素', [
        '**贪心策略**：每步怎么选',
        '**正确性证明**：为什么局部最优能拼成全局最优',
        '**反例检验**：想不出证明，就努力构造反例',
        '⚠️ **贪心不总是对的**',
    ]),

    ('code', '标准反例：找零问题', '''def greedy_coins(coins, amount):
    cnt, rest = 0, amount
    for c in sorted(coins, reverse=True):
        take = rest // c
        cnt += take
        rest -= take * c
    return cnt if rest == 0 else -1


def dp_coins(coins, amount):
    INF = float('inf')
    dp = [0] + [INF] * amount
    for i in range(1, amount + 1):
        for c in coins:
            if c <= i and dp[i - c] + 1 < dp[i]:
                dp[i] = dp[i - c] + 1
    return dp[amount] if dp[amount] < INF else -1


print(greedy_coins([1, 3, 4], 6), dp_coins([1, 3, 4], 6))   # 3 2 —— 贪心错了
''', '这是第 11 周动态规划的动机：贪心失效的地方，DP 接管'),

    ('key', '排序型贪心：最常见的套路',
     '先按某个键排序，再一遍扫过去。难点全在"按什么排"。'),

    ('code', '01017 装箱问题：从大到小放 + 打表', '''import sys

# 一个 3x3 之后剩余的 2x2 空位数：余 1 -> 5, 余 2 -> 3, 余 3 -> 1
REST_2 = [0, 5, 3, 1]
for line in sys.stdin:
    nums = list(map(int, line.split()))
    if not nums or all(v == 0 for v in nums):
        break
    a, b, c, d, e, f = nums
    boxes = d + e + f + (c + 3) // 4              # 6x6 5x5 4x4 和 3x3
    space2 = d * 5 + REST_2[c % 4]                # 可容纳的 2x2 空位
    if b > space2:
        boxes += (b - space2 + 8) // 9            # 一箱放 9 个 2x2
    space1 = boxes * 36 - (f*36 + e*25 + d*16 + c*9 + b*4)
    if a > space1:
        boxes += (a - space1 + 35) // 36
    print(boxes)
''', '⚠️ 贪心题的细节往往就藏在 REST_2 这种小表里'),

    ('code', '12559 最大最小整数：交换论证', '''import functools


def largest_concat(strs):
    def cmp(x, y):
        if x + y > y + x:
            return -1                 # x 排前面
        if x + y < y + x:
            return 1
        return 0
    return ''.join(sorted(strs, key=functools.cmp_to_key(cmp)))


def smallest_concat(strs):
    def cmp(x, y):
        if x + y < y + x:
            return -1
        if x + y > y + x:
            return 1
        return 0
    return ''.join(sorted(strs, key=functools.cmp_to_key(cmp)))


print(largest_concat(["7", "13", "2"]), smallest_concat(["7", "13", "2"]))
# 7213 1327
''', '不能按字典序，也不能按数值：正确比较是 a+b 与 b+a 谁大'),

    ('key', '交换论证 exchange argument',
     '若最优解里相邻两项的顺序与规则相反，交换它们不会变差 —— 所以按规则排的解也是最优解。'),

    ('code', '19948 因材施教 / 18211 军备竞赛', '''# 19948：排序后同组必连续；总差异 = (最大-最小) - 被切开的 k-1 个相邻差
n, k = 7, 3
scores = sorted([1, 3, 5, 5, 6, 9, 15])
gaps = sorted((scores[i+1] - scores[i] for i in range(n-1)), reverse=True)
print(scores[-1] - scores[0] - sum(gaps[:k-1]))    # 5


# 18211：排序后双指针 —— 从最便宜的开始造，钱不够就把最贵的卖掉
def arms_race(p, prices):
    prices.sort()
    lo, hi, adv = 0, len(prices) - 1, 0
    while lo <= hi:
        if p >= prices[lo]:
            p -= prices[lo]; lo += 1; adv += 1
        elif lo < hi and adv > 0:      # 必须还有优势才敢卖
            p += prices[hi]; hi -= 1; adv -= 1
        else:
            break
    return adv


print(arms_race(10, [3, 4, 5, 6]))     # 2
''', '⚠️ adv > 0 这个条件很关键：贪心题的边界条件往往就是它的全部难度'),

    ('table', '贪心的常见形状速查', [
        ['形状', '排序键', '例题'],
        ['拼接最大 / 最小数', 'a+b vs b+a', '12559'],
        ['分组最小差异', '排序后切最大间隙', '19948'],
        ['用最少的箱子 / 船', '从大到小放', '01017'],
        ['双指针取两端', '排序后左右夹', '18211'],
        ['区间问题', '按右端点排', '第 10 周'],
        ['会议室 / 活动选择', '按结束时间排', '第 10 周'],
    ]),

    ('section', '第 4 节', '复杂度实战'),

    ('code', '同一道题的三种写法：最大连续子数组和', '''def brute(a):                       # O(n^3)
    n, best = len(a), a[0]
    for i in range(n):
        for j in range(i, n):
            best = max(best, sum(a[i:j+1]))
    return best


def prefix(a):                      # O(n^2)
    n = len(a); pre = [0] * (n + 1)
    for i, v in enumerate(a):
        pre[i+1] = pre[i] + v
    best = a[0]
    for i in range(n):
        for j in range(i, n):
            best = max(best, pre[j+1] - pre[i])
    return best


def kadane(a):                      # O(n)
    best = cur = a[0]
    for v in a[1:]:
        cur = max(v, cur + v)
        best = max(best, cur)
    return best
''', ''),

    ('table', '三种复杂度对应三个可解规模', [
        ['n', 'O(n^3)', 'O(n^2)', 'O(n)'],
        ['10^3', '10^9 ❌', '10^6 ✅', '10^3 ✅'],
        ['10^5', '❌', '10^10 ❌', '10^5 ✅'],
        ['10^7', '❌', '❌', '10^7 ✅'],
    ], '看到 n 就该知道自己要写哪一版'),

    ('table', '本周作业', [
        ['#', '题目', '编号', '考点'],
        ['1', '矩阵运算（先乘再加）', 'E18161', '矩阵乘法、维度判断'],
        ['2', '计算矩阵边缘元素之和', 'E07743', '二维遍历'],
        ['3', '矩阵交换行', '02899', '二维列表'],
        ['4', '二维矩阵上的卷积运算', 'E19942', '保护圈、邻域'],
        ['5', '装箱问题', '01017', '贪心 + 打表'],
        ['6', '最大最小整数 v0.3', '12559', '自定义比较'],
        ['7', '因材施教', '19948', '排序型贪心'],
        ['8', '军备竞赛', '18211', '双指针贪心'],
        ['9–10（选做）', '节省存储的矩阵乘法 / 螺旋矩阵', 'E23555 / M18106', '稀疏矩阵 / 模拟'],
    ]),

    ('bullets', '小结', [
        '二维列表一律 `[[0]*n for _ in range(m)]`；边界多用**保护圈**，方向用**方向数组**',
        '矩阵乘法 O(mkn)；二维前缀和查询 O(1)，靠**容斥**',
        '排序会用 `key=lambda x: (主, 次)` 就够；**稳定性**让"两次排序"成为可能',
        '贪心 = **排序 + 一遍扫**，难在选排序键；不会证明就**构造反例**',
        '**看到 n 的范围就知道该写哪个复杂度的版本**',
    ]),

    ('key', '下周预告',
     '继续矩阵与贪心练习，并引入两种最基本的线性结构：栈与队列。'),
]

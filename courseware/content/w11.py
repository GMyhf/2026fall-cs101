# -*- coding: utf-8 -*-
"""第11周 动态规划专题"""

META = {
    'title': '第11周　动态规划（DP）专题',
    'subtitle': '0-1 / 完全 / 多重背包 · "恰好装满" · LIS 与 LCS · 降维 · 对拍',
    'footer': '计算概论（B） · 第11周 · 闫宏飞 · 2026 Fall',
    'info': ['北京大学　《计算概论（B）》',
             '主题与学习重点：动态规划（DP）专题。'],
}

SLIDES = [
    ('section', '第 1 节', '背包问题：DP 的主干'),

    ('table', '三种背包的全部区别就在遍历方向', [
        ['类型', '每种物品的数量', '体积维遍历方向'],
        ['0-1 背包', '每种最多 1 个', '倒序'],
        ['完全背包', '每种无限个', '正序'],
        ['多重背包', '每种有上限 k', '二进制拆分后当 0-1 背包'],
    ], '倒序 / 正序一个字之差，就是两种完全不同的问题'),

    ('code', '0-1 背包：二维写法（先理解这个）', '''def knapsack_2d(weights, values, cap):
    n = len(weights)
    dp = [[0] * (cap + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        w, v = weights[i - 1], values[i - 1]
        for c in range(cap + 1):
            dp[i][c] = dp[i - 1][c]                          # 不拿第 i 个
            if c >= w:
                dp[i][c] = max(dp[i][c], dp[i - 1][c - w] + v)  # 拿
    return dp[n][cap]


print(knapsack_2d([1, 4, 3], [1500, 3000, 2000], 4))      # 3500
''', '状态：dp[i][c] = 只考虑前 i 个物品、容量 c 时的最大价值'),

    ('code', '0-1 背包：一维滚动（实战都用这个）', '''def knapsack_1d(weights, values, cap):
    dp = [0] * (cap + 1)
    for w, v in zip(weights, values):
        for c in range(cap, w - 1, -1):        # ⚠️ 必须倒序
            dp[c] = max(dp[c], dp[c - w] + v)
    return dp[cap]


def unbounded_knapsack(weights, values, cap):  # 完全背包
    dp = [0] * (cap + 1)
    for w, v in zip(weights, values):
        for c in range(w, cap + 1):            # ⚠️ 正序
            dp[c] = max(dp[c], dp[c - w] + v)
    return dp[cap]


print(knapsack_1d([1, 4, 3], [1500, 3000, 2000], 4))        # 3500
print(unbounded_knapsack([1, 4, 3], [1500, 3000, 2000], 4)) # 6000
''', ''),

    ('key', '为什么 0-1 背包必须倒序',
     '倒序时 dp[c-w] 还是上一轮（不含本物品）的值，正对应二维式子里的 dp[i-1][c-w]。'),

    ('code', '方案数：循环顺序决定语义', '''def count_ways(coins, amount):
    """组合数（不计顺序）：物品在外层。"""
    dp = [0] * (amount + 1); dp[0] = 1
    for c in coins:
        for a in range(c, amount + 1):
            dp[a] += dp[a - c]
    return dp[amount]


def count_permutations(coins, amount):
    """排列数（计顺序）：容量在外层。"""
    dp = [0] * (amount + 1); dp[0] = 1
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a:
                dp[a] += dp[a - c]
    return dp[amount]


print(count_ways([1, 2, 5], 5), count_permutations([1, 2, 5], 5))   # 4 9
''', '⭐ 物品在外层 = 组合；容量在外层 = 排列。背包里最容易搞混、也最容易被考'),

    ('code', '多重背包：二进制拆分', '''def multi_knapsack(items, cap):
    """items: [(体积, 价值, 数量)]。把 k 个拆成 1,2,4,... 几"捆"，Σk -> Σlog k。"""
    dp = [0] * (cap + 1)
    for w, v, k in items:
        cnt = 1
        while k > 0:
            take = min(cnt, k)
            ww, vv = w * take, v * take
            for c in range(cap, ww - 1, -1):       # 每一"捆"当 0-1 背包
                dp[c] = max(dp[c], dp[c - ww] + vv)
            k -= take
            cnt <<= 1
    return dp[cap]


print(multi_knapsack([(2, 5, 3)], 6))       # 15
print(multi_knapsack([(2, 5, 2)], 6))       # 10  —— 只有 2 个
''', '拆分结果：k=7 -> [1,2,4]；k=10 -> [1,2,4,3]；k=13 -> [1,2,4,6]'),

    ('table', '"恰好装满"型：初始化的区别', [
        ['目标', '初始化'],
        ['容量至多 C 的最大价值', 'dp = [0] * (C+1)'],
        ['恰好装满 C 的最大价值', 'dp[0] = 0，其余 -inf'],
        ['恰好装满 C 的最小代价', 'dp[0] = 0，其余 +inf'],
    ], '⚠️ 忘了 ±inf，"恰好"会退化成"至多"：答案偏大且不报错 —— 最难查的一类 DP bug'),

    ('code', '"恰好装满"的写法', '''def exact_fill_max(weights, values, cap):
    NEG = float('-inf')
    dp = [NEG] * (cap + 1)
    dp[0] = 0                                # 只有容量 0 是"可达"的起点
    for w, v in zip(weights, values):
        for c in range(cap, w - 1, -1):
            if dp[c - w] != NEG:
                dp[c] = max(dp[c], dp[c - w] + v)
    return dp[cap] if dp[cap] != NEG else -1


print(exact_fill_max([2, 3], [10, 20], 5))    # 30，2+3 恰好装满
print(exact_fill_max([2, 4], [10, 20], 5))    # -1，凑不出 5
''', '21458 健身房是"恰好"型；20089 NBA 门票是"恰好 + 最小个数"型'),

    ('code', '04110 圣诞老人的礼物：分数背包用贪心，不是 DP！', '''def fractional_knapsack(items, cap):
    """items: [(总价值, 重量)]，可切分 -> 按单位价值排序即可。"""
    items = sorted(items, key=lambda it: it[0] / it[1], reverse=True)
    total, rest = 0.0, cap
    for value, weight in items:
        if rest >= weight:
            total += value; rest -= weight
        else:
            total += value * rest / weight
            break
    return total


print(f"{fractional_knapsack([(4, 4), (10, 5), (7, 2)], 10):.1f}")   # 20.0
''', '⭐ 判断题眼：物品可分割 -> 贪心；不可分割 -> 背包 DP。考试区分度很高'),

    ('section', '第 2 节', '序列型 DP'),

    ('code', 'LIS：O(n^2) 与 O(n log n)', '''def lis_n2(a):
    n = len(a)
    dp = [1] * n                     # dp[i] = 以 a[i] 结尾的最长上升子序列长度
    for i in range(n):
        for j in range(i):
            if a[j] < a[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp) if dp else 0


import bisect


def lis_nlogn(a):
    """tails[k] = 长度为 k+1 的上升子序列的最小结尾。"""
    tails = []
    for v in a:
        pos = bisect.bisect_left(tails, v)   # 严格上升用 bisect_left
        if pos == len(tails):
            tails.append(v)
        else:
            tails[pos] = v                    # 用更小的值替换，为后面留空间
    return len(tails)


print(lis_n2([1, 7, 3, 5, 9, 4, 8]), lis_nlogn([1, 7, 3, 5, 9, 4, 8]))  # 4 4
''', '⚠️ tails 不是任何一个真实的上升子序列 —— 它的长度对，但不能当答案序列输出'),

    ('code', 'LIS 的两个变形', '''def longest_non_increasing(a):
    """M02945 拦截导弹：最长不上升子序列 = 反转后取最长不降子序列。"""
    tails = []
    for v in reversed(a):
        pos = bisect.bisect_right(tails, v)   # 非降用 bisect_right
        if pos == len(tails):
            tails.append(v)
        else:
            tails[pos] = v
    return len(tails)


def max_rising_sum(a):
    """03532 最大上升子序列和：把"长度 +1"换成"和 + a[i]"。"""
    n = len(a)
    dp = a[:]
    for i in range(n):
        for j in range(i):
            if a[j] < a[i]:
                dp[i] = max(dp[i], dp[j] + a[i])
    return max(dp)


print(longest_non_increasing([389, 207, 155, 300, 299, 170, 158, 65]))  # 6
print(max_rising_sum([1, 7, 3, 5, 9, 4, 8]))                            # 18
''', '严格上升用 bisect_left，非降（允许相等）用 bisect_right'),

    ('code', 'LCS 与编辑距离：同一个二维框架', '''def lcs(s, t):
    m, n = len(s), len(t)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s[i - 1] == t[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]


def edit_distance(s, t):
    m, n = len(s), len(t)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i                          # 删光
    for j in range(n + 1):
        dp[0][j] = j                          # 全插入
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s[i - 1] == t[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
    return dp[m][n]


print(lcs("abcfbc", "abfcab"), edit_distance("horse", "ros"))   # 4 3
''', ''),

    ('code', 'LC 198 打家劫舍：不能取相邻', '''def rob(nums):
    prev, cur = 0, 0            # prev = dp[i-2], cur = dp[i-1]
    for v in nums:
        prev, cur = cur, max(cur, prev + v)
    return cur


print(rob([1, 2, 3, 1]), rob([2, 7, 9, 3, 1]))     # 4 12
''', '"选或不选，且选了就跳过下一个"的最小模型'),

    ('code', 'M02766 最大子矩阵：降维 + Kadane，O(n^3)', '''def max_submatrix(mat):
    n, m = len(mat), len(mat[0])
    best = mat[0][0]
    for top in range(n):                       # 枚举上边界
        col = [0] * m
        for bottom in range(top, n):           # 枚举下边界
            row = mat[bottom]
            for j in range(m):
                col[j] += row[j]               # 把这几行压缩成一维
            cur = col[0]                       # 对 col 跑 Kadane
            best = max(best, cur)
            for j in range(1, m):
                cur = max(col[j], cur + col[j])
                best = max(best, cur)
    return best


mat = [[0,-2,-7,0], [9,2,-6,2], [-4,1,-4,1], [-1,8,0,-2]]
print(max_submatrix(mat))                      # 15
''', '⭐ "降维打击"：二维问题固定一维，转成已会做的一维问题'),

    ('section', '第 3 节', 'DP 的调试'),

    ('bullets', '三个检查点', [
        '**状态定义能用一句话说清吗？** 说不清就一定写不对转移',
        '**边界对不对？** 手算 n = 0、1、2 三个最小情况，和代码结果比',
        '**遍历顺序对不对？** 转移用到的状态，在用之前算好了吗',
        'n 小的时候把整张 DP 表打出来，逐格核对',
    ]),

    ('code', '与暴力对拍 —— 唯一可靠的验证方式', '''import random


def knapsack_brute(weights, values, cap):
    n = len(weights)
    best = 0
    for mask in range(1 << n):
        w = sum(weights[i] for i in range(n) if mask >> i & 1)
        if w <= cap:
            best = max(best, sum(values[i] for i in range(n) if mask >> i & 1))
    return best


for _ in range(300):
    n = random.randint(1, 10)
    ws = [random.randint(1, 10) for _ in range(n)]
    vs = [random.randint(1, 50) for _ in range(n)]
    cap = random.randint(1, 30)
    assert knapsack_1d(ws, vs, cap) == knapsack_brute(ws, vs, cap)
print("0-1 背包与暴力枚举一致（300 组随机数据）")
''', ''),

    ('table', '本周作业', [
        ['#', '题目', '编号', '考点'],
        ['1–3', '小偷背包 / 采药 / Coins', '23421 / 02773 / M01742', '背包三型'],
        ['4–6', 'LIS / 拦截导弹 / 最大上升子序列和', '02533 / M02945 / 03532', '序列 DP'],
        ['7–9', '公共子序列 / 打家劫舍 / 完全平方数', '02806 / LC 198 / LC 279', 'LCS / 线性 / 完全背包'],
        ['10–13（选做）', '最大子矩阵 / 宠物小精灵 / 圣诞老人 / 健身房',
         'M02766 / 04102 / 04110 / 21458', '降维 / 二维费用 / 分数 / 恰好'],
    ]),

    ('bullets', '小结', [
        '背包三兄弟只差**遍历方向**：0-1 倒序、完全正序、多重先二进制拆分',
        '**循环顺序决定语义**：物品在外层 = 组合，容量在外层 = 排列',
        '"**恰好装满**"要用 ±inf 初始化；忘了会静默给出偏大的答案',
        '**物品可分割就贪心，不可分割才 DP**',
        '二维问题先**降维**；DP 写完**一定要和暴力对拍**',
    ]),

    ('key', '下周预告',
     '动态规划收尾 + 图上的搜索：广度优先搜索（BFS）与最短步数问题。'),
]

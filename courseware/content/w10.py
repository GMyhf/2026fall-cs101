# -*- coding: utf-8 -*-
"""第10周 区间问题与动态规划入门"""

META = {
    'title': '第10周　区间问题与动态规划入门',
    'subtitle': '五类区间问题与排序键 · 差分数组 · DP 的两个前提 · 从递归到递推 · DP 三要素',
    'footer': '计算概论（B） · 第10周 · 闫宏飞 · 2026 Fall',
    'info': ['北京大学　《计算概论（B）》',
             '主题与学习重点：区间问题与动态规划。'],
}

SLIDES = [
    ('section', '第 1 节', '区间问题'),

    ('table', '五类区间问题：全部难点在"按什么排"', [
        ['类型', '排序键', '贪心策略'],
        ['1 合并区间', '左端点升序', '能接上就接，接不上就另起'],
        ['2 选最多不相交区间', '右端点升序', '右端点越早，留给后面的空间越大'],
        ['3 区间选点', '右端点升序', '点放在右端点'],
        ['4 区间覆盖', '左端点升序', '在能接上的里选右端点最远的'],
        ['5 区间分组', '左端点升序', '用小根堆记录各组的当前右端点'],
    ]),

    ('key', '一句话记法',
     '要"多"就按右端点排，要"合"或"盖"就按左端点排。'),

    ('code', 'LC 56 合并区间', '''def merge(intervals):
    if not intervals:
        return []
    intervals = sorted(intervals, key=lambda x: x[0])     # 按左端点
    out = [list(intervals[0])]
    for lo, hi in intervals[1:]:
        if lo <= out[-1][1]:                 # 有交叠 -> 合并
            out[-1][1] = max(out[-1][1], hi)
        else:
            out.append([lo, hi])
    return out


print(merge([[1, 3], [2, 6], [8, 10], [15, 18]]))   # [[1, 6], [8, 10], [15, 18]]
print(merge([[1, 4], [4, 5]]))                       # [[1, 5]]
''', '⚠️ max 不能省：[[1,10],[2,3]] 若直接赋值会把 10 缩成 3'),

    ('code', 'LC 435 无重叠区间 / LC 452 引爆气球', '''def erase_overlap_intervals(intervals):
    if not intervals:
        return 0
    intervals = sorted(intervals, key=lambda x: x[1])     # 按右端点
    keep, end = 1, intervals[0][1]
    for lo, hi in intervals[1:]:
        if lo >= end:                        # 不重叠 -> 保留
            keep += 1; end = hi
    return len(intervals) - keep


def find_min_arrow_shots(points):
    if not points:
        return 0
    points = sorted(points, key=lambda x: x[1])
    arrows, end = 1, points[0][1]
    for lo, hi in points[1:]:
        if lo > end:                          # 射不到了，换一支箭
            arrows += 1; end = hi
    return arrows


print(erase_overlap_intervals([[1,2],[2,3],[3,4],[1,3]]))   # 1
print(find_min_arrow_shots([[10,16],[2,8],[1,6],[7,12]]))   # 2
''', '⚠️ 唯一区别：>= 与 > —— 端点相接算不算重叠，看题面，一个字之差'),

    ('key', '为什么按右端点排是对的（交换论证）',
     '设最优解第一个区间是 X，右端点最小的是 A。换成 A 后，之后能放的区间只多不少。'),

    ('code', 'M01328 Radar Installation：先建模再选点', '''import math


def radar_installation(d, islands):
    segs = []
    for x, y in islands:
        if abs(y) > d:
            return -1
        half = math.sqrt(d * d - y * y)
        segs.append((x - half, x + half))     # 雷达可放置的 x 区间
    segs.sort(key=lambda s: s[1])
    cnt, pos = 0, -float('inf')
    for lo, hi in segs:
        if lo > pos:
            cnt += 1; pos = hi
    return cnt


print(radar_installation(2, [(1, 2), (-3, 1), (2, 1)]))    # 2
print(radar_installation(1, [(0, 2)]))                     # -1
''', '把每个海岛转成"雷达可放置的区间"，就变成了标准的区间选点'),

    ('code', 'LC 1024 视频拼接：区间覆盖', '''def video_stitching(clips, time):
    clips = sorted(clips, key=lambda c: c[0])
    cnt, covered, i, n = 0, 0, 0, len(clips)
    while covered < time:
        farthest = covered
        while i < n and clips[i][0] <= covered:      # 所有能接上的
            farthest = max(farthest, clips[i][1]); i += 1
        if farthest == covered:                       # 一步也推不动 -> 无解
            return -1
        covered = farthest; cnt += 1
    return cnt


print(video_stitching([[0,2],[4,6],[8,10],[1,9],[1,5],[5,9]], 10))  # 3
print(video_stitching([[0,1],[1,2]], 5))                            # -1
''', 'T27104 世界杯只因是同一模型'),

    ('code', '区间分组：堆 / 差分两种写法', '''import heapq


def min_groups(intervals):
    intervals = sorted(intervals, key=lambda x: x[0])
    heap = []                                 # 各组当前的右端点
    for lo, hi in intervals:
        if heap and heap[0] < lo:             # 最早结束的那组已空出来
            heapq.heapreplace(heap, hi)
        else:
            heapq.heappush(heap, hi)
    return len(heap)


def min_groups_diff(intervals):               # 差分：更快、常数更小
    events = []
    for lo, hi in intervals:
        events.append((lo, 1)); events.append((hi + 1, -1))
    events.sort()
    cur = best = 0
    for _, delta in events:
        cur += delta; best = max(best, cur)
    return best


print(min_groups([(1,4),(2,5),(6,8),(3,7)]),
      min_groups_diff([(1,4),(2,5),(6,8),(3,7)]))     # 3 3
''', '本质：答案 = 同一时刻最多有多少区间重叠'),

    ('code', '02808 校门外的树：差分数组', '''def trees_left(L, ranges):
    diff = [0] * (L + 2)
    for lo, hi in ranges:
        diff[lo] += 1
        diff[hi + 1] -= 1
    cur, left = 0, 0
    for i in range(L + 1):
        cur += diff[i]
        if cur == 0:
            left += 1
    return left


print(trees_left(500, [(150, 300), (100, 200), (470, 471)]))   # 298
''', '差分把"区间加"从 O(n) 降到 O(1)；m 次区间加后查询全部：O(mn) -> O(n+m)'),

    ('section', '第 2 节', '动态规划入门'),

    ('key', '从一个反例说起',
     '面额 [1, 3, 4] 凑 6，贪心给 3 枚（4+1+1），最优是 2 枚（3+3）。贪心失效的地方，DP 接管。'),

    ('table', 'DP 的两个前提', [
        ['前提', '含义', '不成立会怎样'],
        ['**最优子结构**', '大问题的最优解由子问题的最优解构成', '转移方程写出来了，但**答案是错的**'],
        ['**重叠子问题**', '同一个子问题被反复求解', '能算对，但**不如直接分治**'],
    ], '重叠子问题好判断：画调用树，看见重复的子树就是它。难的是上面那条'),

    ('key', '最优子结构是**状态定义**的性质，不是题目的性质',
     '同一道题，状态定义得好就有，少定义一维就没有 —— '
     '"这题没有最优子结构"十有八九是"我的状态少了一维"。'),

    ('ascii', '一个能手算的反例：路径和必须是奇数', r"""
         6                 全部 8 条路径：
       7   9                 6-7-0-7 = 20      6-9-3-4 = 22
     0   3   7               6-7-0-4 = 17      6-9-3-2 = 20   <- 唯一的奇数
   7   4   2   0             6-7-3-4 = 20      6-9-7-2 = 24
                             6-7-3-2 = 18      6-9-7-0 = 22
   每步走左下或右下
                           答案 = 17
""", '原题问最大路径和；这里加一条：路径和必须是奇数，求最大的那个'),

    ('code', '最自然的状态，会告诉你「无解」', '''def naive_odd(tri):
    """朴素状态：dp[i][j] = 到 (i, j) 的最大路径和，最后在底行里挑奇数"""
    dp = [tri[0][:]]
    for i in range(1, len(tri)):
        dp.append([max(dp[i - 1][k] for k in (j - 1, j) if 0 <= k <= i - 1)
                   + tri[i][j] for j in range(i + 1)])
    odd = [v for v in dp[-1] if v % 2 == 1]
    return max(odd) if odd else -1


# 底行算出来是 [20, 22, 24, 22] —— 全是偶数，于是返回 -1
''', '错在哪一步可以精确指出来：走到第 4 行那个 4 时，上一行两个候选是 13（奇）和 18（偶），朴素状态只留 18 —— 而答案 17 = 13 + 4，要的恰恰是被扔掉的那个'),

    ('bullets', '补一维，最优子结构就回来了', [
        '`dp[i][j][p]` = 到 (i, j) 且路径和奇偶为 **p** 的最大和 —— 同一道题、同一套转移',
        '**子问题的最优解（18）在父问题里不但没用，还挤掉了真正有用的次优解（13）**',
        '这就是"没有最优子结构"的真实长相：不是题目不能 DP，是状态漏了信息',
        '**检验办法**：把某个子问题的最优解换成次优解，父问题会不会反而更好？'
        '能构造出来，就是少了一维',
        '常缺的那一维：**奇偶、剩余容量、已用次数、上一步选了什么、当前第几段**',
        '第 12 周讲义 §1.1 有个**真的**救不回来的例子：一般图上的最长简单路径',
    ]),

    ('code', '从递归到 DP：四步演化（以斐波那契为例）', '''def f1(n):                          # 暴力递归 O(2^n)
    return 1 if n <= 2 else f1(n - 1) + f1(n - 2)


def f2(n, memo=None):               # 记忆化搜索（自顶向下）O(n)
    if memo is None:
        memo = {}
    if n <= 2:
        return 1
    if n in memo:
        return memo[n]
    memo[n] = f2(n - 1, memo) + f2(n - 2, memo)
    return memo[n]


def f3(n):                          # 递推填表（自底向上）O(n)
    if n <= 2:
        return 1
    dp = [0] * (n + 1); dp[1] = dp[2] = 1
    for i in range(3, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]


def f4(n):                          # 滚动数组 O(1) 空间
    if n <= 2:
        return 1
    a, b = 1, 1
    for _ in range(n - 2):
        a, b = b, a + b
    return b
''', ''),

    ('table', '四种写法的取舍', [
        ['写法', '时间', '空间', '优点 / 缺点'],
        ['暴力递归', '指数', 'O(n) 栈', '最好写 / 太慢'],
        ['记忆化搜索', 'O(n)', 'O(n) + 栈', '最容易从暴力改过来 / 有栈深度风险'],
        ['递推', 'O(n)', 'O(n)', '无栈风险、常数小 / 要想清遍历顺序'],
        ['滚动数组', 'O(n)', 'O(1)', '省内存 / 丢失中间状态'],
    ], '实战建议：先写暴力递归想清转移，加 @lru_cache，确认正确后再翻译成递推'),

    ('key', 'DP 三要素',
     '状态：dp[i] 表示什么（必须是一句能说清的话）；转移：怎么由更小的状态算出来；边界。'),

    ('code', 'LC 70 爬楼梯', '''def climb_stairs(n):
    dp = [0] * (n + 1)
    dp[0] = 1                       # 站在地面，一种方法：什么都不做
    for i in range(1, n + 1):
        dp[i] = dp[i - 1] + (dp[i - 2] if i >= 2 else 0)
    return dp[n]


def climb_k(n, k):                  # 变形：每次可爬 1..k 级（完全背包的雏形）
    dp = [0] * (n + 1)
    dp[0] = 1
    for i in range(1, n + 1):
        dp[i] = sum(dp[max(0, i - k):i])
    return dp[n]


print([climb_stairs(x) for x in range(1, 8)])    # [1, 2, 3, 5, 8, 13, 21]
print(climb_k(5, 2), climb_k(5, 3))              # 8 13
''', '状态：dp[i]=爬到第 i 级的方法数；转移：最后一步爬 1 级或 2 级'),

    ('ascii', '02760 数字三角形', r"""
        7
      3   8
    8   1   0
  2   7   4   4
4   5   2   6   5

   状态：dp[i][j] = 从 (i,j) 走到底部的最大和
   转移：dp[i][j] = a[i][j] + max(dp[i+1][j], dp[i+1][j+1])
   边界：最后一行 dp[n-1][j] = a[n-1][j]；答案 dp[0][0] = 30
"""),

    ('code', '数字三角形：二维与滚动一维', '''def max_path_sum(tri):
    n = len(tri)
    dp = [row[:] for row in tri]          # ⚠️ 拷贝，不要改原数据
    for i in range(n - 2, -1, -1):
        for j in range(i + 1):
            dp[i][j] += max(dp[i + 1][j], dp[i + 1][j + 1])
    return dp[0][0]


def max_path_sum_1d(tri):
    dp = tri[-1][:]
    for i in range(len(tri) - 2, -1, -1):
        for j in range(i + 1):
            dp[j] = tri[i][j] + max(dp[j], dp[j + 1])
    return dp[0]


tri = [[7], [3, 8], [8, 1, 0], [2, 7, 4, 4], [4, 5, 2, 6, 5]]
print(max_path_sum(tri), max_path_sum_1d(tri))    # 30 30
''', '⭐ 遇到路径 DP，先试从终点倒推 —— 每个状态只有一个后继来源，不需处理特殊边界'),

    ('code', 'Kadane：最大连续子数组和的 DP 视角', '''def max_subarray(a):
    dp = [0] * len(a)
    dp[0] = a[0]
    for i in range(1, len(a)):
        dp[i] = max(a[i], dp[i - 1] + a[i])   # 另起炉灶 or 接上前面
    return max(dp)                             # ⚠️ 是 max(dp)，不是 dp[n-1]


def max_subarray_o1(a):
    best = cur = a[0]
    for v in a[1:]:
        cur = max(v, cur + v); best = max(best, cur)
    return best


t = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
print(max_subarray(t), max_subarray_o1(t))    # 6 6
''', '状态是"以 i 结尾的最大子数组和" —— 注意这个限定'),

    ('key', 'DP 最核心的技巧',
     '状态定义要让转移能写出来。"以 i 结尾"往往比"前 i 个"更好用。'),

    ('table', '本周作业', [
        ['#', '题目', '编号', '考点'],
        ['1–3', '合并区间 / 无重叠区间 / 引爆气球', 'LC 56 / 435 / 452', '区间贪心'],
        ['4–5', '校门外的树 / 校门外的树又来了', '02808 / M29947', '差分 / 合并区间'],
        ['6–7', '数字三角形 / 爬楼梯', '02760 / LC 70', '路径 DP / 线性 DP'],
        ['8', 'Radar Installation', 'M01328', '区间选点建模'],
        ['9–11（选做）', '视频拼接 / 世界杯只因 / 最大子矩阵', 'LC 1024 / T27104 / M02766', '覆盖 / 降维'],
    ]),

    ('bullets', '小结', [
        '区间问题 = **排序 + 贪心**；边界的开闭（`>` 还是 `>=`）看题面',
        '差分数组把"区间加"降到 O(1)，最后一次前缀和还原',
        'DP 两个前提：**最优子结构 + 重叠子问题**；没有重叠就用分治',
        '**最优子结构是状态定义的性质**：说没有，多半是自己的状态少了一维',
        '演化路径：**暴力递归 → 记忆化 → 递推 → 滚动数组**',
        'DP 三要素：**状态、转移、边界**；状态定义要让转移能写出来',
    ]),

    ('key', '下周预告',
     '动态规划专题：背包问题（0-1 / 完全 / 多重）、最长上升子序列与二维 DP。'),
]

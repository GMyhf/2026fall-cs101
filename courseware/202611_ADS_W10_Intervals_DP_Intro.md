# 第10周 区间问题与动态规划入门

*Updated 2026-08-31 GMT+8*
 *Compiled by Hongfei Yan (2026 Fall)*
https://github.com/GMyhf/2026fall-cs101

> **课程安排对应**：第 10 周
> **主题与学习重点**：区间问题与动态规划。

**知识点**：五类经典区间问题（合并、选不相交、选点、覆盖、分组）及其排序键、差分数组、动态规划的两个前提（最优子结构 / 重叠子问题）、从暴力递归到记忆化再到递推、数字三角形、爬楼梯、DP 三要素（状态 / 转移 / 边界）。

---

# 1 区间问题

区间问题的解法几乎全是**贪心 + 排序**。全部难点是**按什么排序**。

| 类型 | 排序键 | 贪心策略 |
| ---- | ---- | ---- |
| 1 合并区间 | **左端点**升序 | 能接上就接，接不上就另起 |
| 2 选最多不相交区间 | **右端点**升序 | 右端点越早，留给后面的空间越大 |
| 3 区间选点（最少点覆盖所有区间） | **右端点**升序 | 点放在右端点 |
| 4 区间覆盖（最少区间覆盖一段） | **左端点**升序 | 在能接上的里选右端点最远的 |
| 5 区间分组（最少组数使组内不重叠） | **左端点**升序 | 用小根堆记录各组的当前右端点 |

> **一句话记法**：**要"多"就按右端点排，要"合"或"盖"就按左端点排。**

## 1.1 合并区间

**LeetCode 56. 合并区间**，<https://leetcode.cn/problems/merge-intervals/>

```python
def merge(intervals):
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


print(merge([[1, 3], [2, 6], [8, 10], [15, 18]]))
# [[1, 6], [8, 10], [15, 18]]
print(merge([[1, 4], [4, 5]]))               # [[1, 5]]  —— 端点相接也算交叠
```

> ⚠️ `out[-1][1] = max(out[-1][1], hi)` 里的 `max` 不能省：
> `[[1,10],[2,3]]` 排序后仍是这个顺序，若直接赋值会把 10 缩成 3。

**M29947: 校门外的树又来了**，<http://cs101.openjudge.cn/practice/29947/>
就是合并区间后统计被覆盖的长度。

## 1.2 选最多不相交区间

**LeetCode 435. 无重叠区间**，<https://leetcode.cn/problems/non-overlapping-intervals/>

> 求最少移除多少个区间，使剩下的互不重叠 = 总数 − 最多能保留的不相交区间数。

```python
def erase_overlap_intervals(intervals):
    if not intervals:
        return 0
    intervals = sorted(intervals, key=lambda x: x[1])     # 按右端点
    keep, end = 1, intervals[0][1]
    for lo, hi in intervals[1:]:
        if lo >= end:                        # 不重叠 -> 保留
            keep += 1
            end = hi
    return len(intervals) - keep


print(erase_overlap_intervals([[1, 2], [2, 3], [3, 4], [1, 3]]))   # 1
```

> ⚠️ **这个贪心用到了题目的一个前提：`start < end`（LC 435 保证）。**
> 若允许退化区间 `[a, a]` —— 在"半开"语义下它是空集、与任何区间都相容 ——
> 按右端点排的贪心会失效。例如 `[[5,6],[6,6]]` 实际可以全保留，
> 但贪心先选了 `[6,6]`（右端点并列时排在前），就再也放不下 `[5,6]` 了。
> **贪心的正确性总是挂在题目约束上，换一道题要重新验。**

**为什么按右端点排是对的**（交换论证）：设最优解的第一个区间是 X，
而右端点最小的区间是 A。把 X 换成 A，A 的右端点 ≤ X 的右端点，
所以 A 之后能放的区间只多不少——**换成 A 不会变差**。

## 1.3 区间选点

**LeetCode 452. 用最少数量的箭引爆气球**，<https://leetcode.cn/problems/minimum-number-of-arrows-to-burst-balloons/>

> 每个气球是一个区间，一支箭射在坐标 x 上能引爆所有包含 x 的气球，求最少箭数。

**和 1.2 是同一个算法**：按右端点排，箭射在当前区间的右端点。

```python
def find_min_arrow_shots(points):
    if not points:
        return 0
    points = sorted(points, key=lambda x: x[1])
    arrows, end = 1, points[0][1]
    for lo, hi in points[1:]:
        if lo > end:                          # 射不到了，换一支箭
            arrows += 1
            end = hi
    return arrows


print(find_min_arrow_shots([[10, 16], [2, 8], [1, 6], [7, 12]]))   # 2
```

> **和 1.2 的唯一区别**：这里 `lo > end`（端点相接算能射到），
> 1.2 里是 `lo >= end`（端点相接算不重叠）。**边界的开闭要看题面，一个字之差。**

**M01328: Radar Installation**，<http://cs101.openjudge.cn/practice/01328/>
是这个模型的经典应用：先把每个海岛转成"雷达可放置的 x 区间"，再做区间选点。

```python
import math


def radar_installation(d, islands):
    """islands: [(x, y)]；返回最少雷达数，无解返回 -1。"""
    segs = []
    for x, y in islands:
        if abs(y) > d:
            return -1
        half = math.sqrt(d * d - y * y)
        segs.append((x - half, x + half))
    segs.sort(key=lambda s: s[1])
    cnt, pos = 0, -float('inf')
    for lo, hi in segs:
        if lo > pos:
            cnt += 1
            pos = hi
    return cnt


print(radar_installation(2, [(1, 2), (-3, 1), (2, 1)]))    # 2
print(radar_installation(1, [(0, 2)]))                     # -1
```

## 1.4 区间覆盖

**LeetCode 1024. 视频拼接**，<https://leetcode.cn/problems/video-stitching/>

> 用最少的区间覆盖 [0, T]。

**贪心**：按左端点排，在所有"左端点 ≤ 当前已覆盖到的位置"的区间里，选右端点最远的。

```python
def video_stitching(clips, time):
    clips = sorted(clips, key=lambda c: c[0])
    cnt, covered, i, n = 0, 0, 0, len(clips)
    while covered < time:
        farthest = covered
        while i < n and clips[i][0] <= covered:      # 所有能接上的
            farthest = max(farthest, clips[i][1])
            i += 1
        if farthest == covered:                       # 一步也推不动 -> 无解
            return -1
        covered = farthest
        cnt += 1
    return cnt


print(video_stitching([[0, 2], [4, 6], [8, 10], [1, 9], [1, 5], [5, 9]], 10))  # 3
print(video_stitching([[0, 1], [1, 2]], 5))                                    # -1
```

**T27104: 世界杯只因**，<http://cs101.openjudge.cn/practice/27104/> 是同一模型：
每个位置 i 的摄像头覆盖 [i−a[i], i+a[i]]，求覆盖 [1, n] 的最少个数。

## 1.5 区间分组

> 把区间分成最少的组，使每组内部两两不重叠（等价于"最多有多少个区间在同一时刻重叠"）。

**堆做法**：按左端点排，用小根堆存各组当前的右端点；
新区间若能接在最早结束的那组后面就接上，否则新开一组。

```python
import heapq


def min_groups(intervals):
    intervals = sorted(intervals, key=lambda x: x[0])
    heap = []                                 # 各组当前的右端点
    for lo, hi in intervals:
        if heap and heap[0] < lo:             # 最早结束的那组已空出来
            heapq.heapreplace(heap, hi)
        else:
            heapq.heappush(heap, hi)
    return len(heap)


print(min_groups([(1, 4), (2, 5), (6, 8), (3, 7)]))   # 3
```

**差分做法**（更快，O(n log n) 但常数更小）：把每个区间看成 `+1` 和 `−1` 事件，扫一遍求最大值。

```python
def min_groups_diff(intervals):
    events = []
    for lo, hi in intervals:
        events.append((lo, 1))
        events.append((hi + 1, -1))           # 闭区间：hi 之后才释放
    events.sort()
    cur = best = 0
    for _, delta in events:
        cur += delta
        best = max(best, cur)
    return best


print(min_groups_diff([(1, 4), (2, 5), (6, 8), (3, 7)]))   # 3
```

## 1.6 差分数组：区间加、单点查

**02808: 校门外的树**，<http://cs101.openjudge.cn/practice/02808/>

> 长度 L 的路上有 L+1 棵树，移走 m 个区间内的树，问剩几棵。

**差分数组**把"区间加"从 O(n) 降到 O(1)，最后一次前缀和还原：

```python
def trees_left(L, ranges):
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
```

| 操作 | 朴素 | 差分 |
| ---- | ---- | ---- |
| 区间 [l, r] 加 v | O(r−l+1) | **O(1)** |
| m 次区间加后查询全部 | O(mn) | **O(n + m)** |

---

# 2 动态规划入门

## 2.1 从一个反例说起

第 6 周见过：面额 `[1, 3, 4]` 凑 6，贪心给 3 枚（4+1+1），最优是 2 枚（3+3）。
**贪心失效的地方，动态规划接管。**

## 2.2 DP 的两个前提

| 前提 | 含义 | 不成立会怎样 |
| ---- | ---- | ---- |
| **最优子结构** | 大问题的最优解由子问题的最优解构成 | 转移方程写出来了，但**答案是错的** |
| **重叠子问题** | 同一个子问题被反复求解 | 能算对，但**不如直接分治** |

### 重叠子问题：DP 与分治的分界线

分治的子问题互不相同（归并排序把数组一切两半，左右两边毫无关系），
DP 的子问题被反复用到（斐波那契的 `f(n-2)` 会被算无数次），
所以 DP 要**把答案存下来**。

这一条好判断：画一画调用树，看见重复的子树就是它。

### 最优子结构：它是**状态定义**的性质，不是题目的性质

这是本节最该记住的一句话。**同一道题，状态定义得好就有最优子结构，
少定义一维就没有** —— 所以"这题没有最优子结构，不能 DP"这句话，
十有八九是"我的状态少了一维"。

看一个能自己手算的例子。数字三角形（§2.6 会正式讲）：从顶走到底，
每步只能走**左下**或**右下**：

```
      6
    7   9
  0   3   7
7   4   2   0
```

原题问"最大路径和"，现在加一个条件：**路径和必须是奇数**，求最大的那个。

全部只有 8 条路径，可以直接列出来：

| 路径 | 和 | | 路径 | 和 |
| ---- | ---- | ---- | ---- | ---- |
| 6→7→0→7 | 20 | | 6→9→3→4 | 22 |
| **6→7→0→4** | **17（奇）** | | 6→9→3→2 | 20 |
| 6→7→3→4 | 20 | | 6→9→7→2 | 24 |
| 6→7→3→2 | 18 | | 6→9→7→0 | 22 |

答案是 **17**。可是按最自然的状态写出来的 DP，会告诉你**无解**：

```python
def naive_odd(tri):
    """朴素状态：dp[i][j] = 到 (i, j) 的最大路径和，最后在底行里挑奇数。"""
    dp = [tri[0][:]]
    for i in range(1, len(tri)):
        dp.append([max(dp[i - 1][k] for k in (j - 1, j) if 0 <= k <= i - 1)
                   + tri[i][j] for j in range(i + 1)])
    odd = [v for v in dp[-1] if v % 2 == 1]
    return max(odd) if odd else -1
```

它算出来的底行是 `[20, 22, 24, 22]`，**全是偶数**，于是返回"无解"。

**错在哪一步，可以精确指出来**：走到第 4 行那个 `4` 的时候，
上一行的两个候选路径和是 **13（奇）** 和 **18（偶）**，
朴素状态只保留"最大的" 18，把 13 扔了 ——
而最终答案 `17 = 13 + 4`，要的恰恰是被扔掉的那一个。

> **`dp[i][j] = 到 (i,j) 的最大路径和` 这个状态，对这道题没有最优子结构**：
> 子问题的最优解（18），在父问题里不但没用，还挤掉了真正有用的次优解（13）。

**补一维就有了** —— 把奇偶也记进状态：

```python
NEG = float('-inf')


def fixed_odd(tri):
    """补一维奇偶：dp[i][j][p] = 到 (i, j) 且路径和奇偶为 p 的最大和。"""
    n = len(tri)
    dp = [[[NEG, NEG] for _ in range(n)] for _ in range(n)]
    dp[0][0][tri[0][0] % 2] = tri[0][0]
    for i in range(1, n):
        for j in range(i + 1):
            for k in (j - 1, j):
                if 0 <= k <= i - 1:
                    for p in (0, 1):
                        if dp[i - 1][k][p] > NEG:
                            v = dp[i - 1][k][p] + tri[i][j]
                            dp[i][j][v % 2] = max(dp[i][j][v % 2], v)
    best = max(dp[n - 1][j][1] for j in range(n))
    return best if best > NEG else -1
```

同一道题、同一套转移思路，**只是状态多了一维，最优子结构就成立了**：

```python
import itertools
import random

TRI = [[6],
       [7, 9],
       [0, 3, 7],
       [7, 4, 2, 0]]


def brute_odd(tri):
    """枚举全部 2^(n-1) 条路径，取和为奇数的最大值；没有就返回 -1。"""
    best = -1
    for turns in itertools.product((0, 1), repeat=len(tri) - 1):
        j, s = 0, tri[0][0]
        for i, d in enumerate(turns, 1):
            j += d
            s += tri[i][j]
        if s % 2 == 1:
            best = max(best, s)
    return best


print('暴力枚举 :', brute_odd(TRI))     # 17
print('朴素 DP  :', naive_odd(TRI))     # -1  —— 说"无解"，可是明明有
print('补一维后 :', fixed_odd(TRI))     # 17

rnd = random.Random(10)
for _ in range(2000):
    n = rnd.randint(2, 7)
    t = [[rnd.randint(0, 9) for _ in range(i + 1)] for i in range(n)]
    assert fixed_odd(t) == brute_odd(t)
print('2000 组随机三角形：补一维后的 DP == 暴力枚举')
```

### 怎么检验自己的状态有没有最优子结构

写完状态定义，先别急着写转移，问自己一句：

> **把某个子问题的最优解换成一个次优解，父问题的答案有没有可能反而更好？**

能构造出这种情况，这个状态就没有最优子结构 —— 而且几乎总是同一个病因：
**状态少了一维**，那一维正是"父问题还需要知道、但你没记住"的信息。

上面的例子里，那一维是**奇偶**；常见的还有：
剩余容量、已用次数、上一步选了什么、当前是第几段。

> **第 12 周讲义 §1.1** 有一个**真的**没有最优子结构的例子
> （一般图上的最长简单路径）—— 那时你已经有图的语言，
> 才好说清楚它为什么补多少维都救不回来。

## 2.3 从递归到 DP：三步演化

以斐波那契为例（第 8 周见过），这次把它当作 DP 的模板来看。

**第一步：暴力递归** —— O(2ⁿ)

```python
def f1(n):
    if n <= 2:
        return 1
    return f1(n - 1) + f1(n - 2)
```

**第二步：记忆化搜索（自顶向下）** —— O(n)

```python
def f2(n, memo=None):
    if memo is None:
        memo = {}
    if n <= 2:
        return 1
    if n in memo:
        return memo[n]
    memo[n] = f2(n - 1, memo) + f2(n - 2, memo)
    return memo[n]
```

**第三步：递推填表（自底向上）** —— O(n)，无递归开销

```python
def f3(n):
    if n <= 2:
        return 1
    dp = [0] * (n + 1)
    dp[1] = dp[2] = 1
    for i in range(3, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]


print(f1(20), f2(20), f3(20))       # 6765 6765 6765
```

**第四步：滚动数组** —— O(1) 空间

```python
def f4(n):
    if n <= 2:
        return 1
    a, b = 1, 1
    for _ in range(n - 2):
        a, b = b, a + b
    return b


print(f4(20))                        # 6765
```

| 写法 | 时间 | 空间 | 优点 | 缺点 |
| ---- | ---- | ---- | ---- | ---- |
| 暴力递归 | 指数 | O(n) 栈 | 最好写 | 太慢 |
| **记忆化搜索** | O(n) | O(n) + 栈 | **贴近递归定义，最容易从暴力改过来** | 有栈深度风险 |
| **递推** | O(n) | O(n) | 无栈风险，常数小 | 要想清楚遍历顺序 |
| 滚动数组 | O(n) | **O(1)** | 省内存 | 丢失中间状态 |

> **实战建议**：先写暴力递归想清楚转移，加上 `@lru_cache` 变成记忆化，
> 确认正确后再（如果需要）翻译成递推。

## 2.4 DP 三要素

写任何 DP 题，先在纸上写清这三行：

1. **状态**：`dp[i]` 表示什么？（**必须是一句能说清的话**）
2. **转移**：`dp[i]` 怎么由更小的状态算出来？
3. **边界**：最小的状态是多少？答案在哪个状态里？

## 2.5 例：爬楼梯

**LeetCode 70. 爬楼梯**，<https://leetcode.cn/problems/climbing-stairs/>

> 每次爬 1 或 2 级，爬到第 n 级有多少种方法。

- **状态**：`dp[i]` = 爬到第 i 级的方法数；
- **转移**：最后一步要么从 i−1 爬 1 级，要么从 i−2 爬 2 级 → `dp[i] = dp[i-1] + dp[i-2]`；
- **边界**：`dp[0] = 1`（站在地面，一种方法：什么都不做），`dp[1] = 1`。

```python
def climb_stairs(n):
    dp = [0] * (n + 1)
    dp[0] = 1
    for i in range(1, n + 1):
        dp[i] = dp[i - 1] + (dp[i - 2] if i >= 2 else 0)
    return dp[n]


print([climb_stairs(k) for k in range(1, 8)])    # [1, 2, 3, 5, 8, 13, 21]
```

**变形：每次可爬 1..k 级**，就是完全背包的雏形（第 11 周）：

```python
def climb_k(n, k):
    dp = [0] * (n + 1)
    dp[0] = 1
    for i in range(1, n + 1):
        dp[i] = sum(dp[max(0, i - k):i])
    return dp[n]


print(climb_k(5, 2), climb_k(5, 3))     # 8 13
```

## 2.6 例：数字三角形

**02760: 数字三角形**，<http://cs101.openjudge.cn/practice/02760/>

> 从顶部走到底部，每步只能走到下一行相邻的两个数之一，求路径和最大值。

```
        7
      3   8
    8   1   0
  2   7   4   4
4   5   2   6   5
```

- **状态**：`dp[i][j]` = 从 (i, j) 走到底部的最大和；
- **转移**：`dp[i][j] = a[i][j] + max(dp[i+1][j], dp[i+1][j+1])`；
- **边界**：最后一行 `dp[n-1][j] = a[n-1][j]`；答案 `dp[0][0]`。

```python
def max_path_sum(tri):
    n = len(tri)
    dp = [row[:] for row in tri]          # ⚠️ 拷贝，不要改原数据
    for i in range(n - 2, -1, -1):
        for j in range(i + 1):
            dp[i][j] += max(dp[i + 1][j], dp[i + 1][j + 1])
    return dp[0][0]


tri = [[7], [3, 8], [8, 1, 0], [2, 7, 4, 4], [4, 5, 2, 6, 5]]
print(max_path_sum(tri))                  # 30
```

**滚动数组版**（只用一维）：

```python
def max_path_sum_1d(tri):
    dp = tri[-1][:]
    for i in range(len(tri) - 2, -1, -1):
        for j in range(i + 1):
            dp[j] = tri[i][j] + max(dp[j], dp[j + 1])
    return dp[0]


print(max_path_sum_1d(tri))               # 30
```

> **为什么从下往上推比从上往下推简单**：从下往上时每个状态只有一个后继来源，
> 不需要处理"边界上只有一个前驱"的特殊情况。**遇到路径 DP，先试从终点倒推。**

## 2.7 例：最大连续子序列和（Kadane）

第 6 周作为"复杂度对比"出现过，这里补上 DP 视角。

- **状态**：`dp[i]` = **以 i 结尾**的最大子数组和（注意"以 i 结尾"这个限定）；
- **转移**：`dp[i] = max(a[i], dp[i-1] + a[i])`——要么另起炉灶，要么接上前面；
- **答案**：`max(dp)`，不是 `dp[n-1]`。

```python
def max_subarray(a):
    dp = [0] * len(a)
    dp[0] = a[0]
    for i in range(1, len(a)):
        dp[i] = max(a[i], dp[i - 1] + a[i])
    return max(dp)


def max_subarray_o1(a):                   # 滚动
    best = cur = a[0]
    for v in a[1:]:
        cur = max(v, cur + v)
        best = max(best, cur)
    return best


t = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
print(max_subarray(t), max_subarray_o1(t))    # 6 6
```

> **"以 i 结尾"是线性 DP 最常用的状态定义**。为什么不能定义成"前 i 个元素的最大子数组和"？
> 因为那样无法知道"前 i 个的最优解是否以 i 结尾"，转移写不出来。
> **状态定义要让转移能写出来——这是 DP 最核心的技巧。**

---

# 3 本周作业

| # | 题目 | 平台 / 编号 | 考点 |
| - | ---- | ---- | ---- |
| 1 | 合并区间 | LC 56 | 按左端点排 |
| 2 | 无重叠区间 | LC 435 | 按右端点排 |
| 3 | 用最少数量的箭引爆气球 | LC 452 | 区间选点 |
| 4 | 校门外的树 | 02808 | 差分数组 |
| 5 | 校门外的树又来了 | M29947 | 合并区间 |
| 6 | 数字三角形 | 02760 | 路径 DP |
| 7 | 爬楼梯 | LC 70 | 线性 DP |
| 8 | Radar Installation | M01328 | 区间选点建模 |
| 9（选做） | 视频拼接 | LC 1024 | 区间覆盖 |
| 10（选做） | 世界杯只因 | T27104 | 区间覆盖 |
| 11（选做） | 最大子矩阵 | M02766 | 前缀和 + Kadane（下周） |

**思考题**：

1. 为什么"选最多不相交区间"按右端点排是对的？写出完整的交换论证。
2. 1.2 用 `lo >= end` 而 1.3 用 `lo > end`，把两者互换会得到什么错误答案？各构造一组数据。
3. 差分数组能做"区间加、区间和查询"吗？需要几层前缀和？
4. `max_subarray` 的状态若定义成"前 i 个元素中的最大子数组和"，转移方程写得出来吗？为什么？
5. 数字三角形从上往下推，需要额外处理哪两种边界？写出来对比一下代码长度。

---

# 4 小结

1. 区间问题 = **排序 + 贪心**。**要"多"按右端点排，要"合 / 盖"按左端点排**；
   边界的开闭（`>` 还是 `>=`）看题面。
2. 差分数组把"区间加"降到 O(1)，最后一次前缀和还原。
3. DP 的两个前提：**最优子结构 + 重叠子问题**。没有重叠就用分治；
   而**最优子结构是状态定义的性质，不是题目的性质** ——
   "这题没有最优子结构"十有八九是"我的状态少了一维"。
   检验办法：把子问题的最优解换成次优解，父问题会不会反而更好？（§2.2）
4. 演化路径：**暴力递归 → 记忆化 → 递推 → 滚动数组**。实战从记忆化入手最稳。
5. DP 三要素：**状态、转移、边界**。**状态定义要让转移能写出来**——
   "以 i 结尾"往往比"前 i 个"更好用。

**下周预告**：动态规划专题——**背包问题**（0-1 / 完全 / 多重）、**最长上升子序列**与二维 DP。

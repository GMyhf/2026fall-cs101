# 第6周 矩阵、排序与贪心：认识时间复杂度

*Updated 2026-08-31 GMT+8*
 *Compiled by Hongfei Yan (2026 Fall)*
https://github.com/GMyhf/2026fall-cs101

> **课程安排对应**：第 6 周
> **主题与学习重点**：矩阵、排序与贪心；认识时间复杂度。

**知识点**：二维列表与矩阵的表示、保护圈技巧、方向数组、矩阵转置 / 旋转 / 乘法、二维前缀和、`sorted` 与 `key` / 稳定性、五种基础排序及其复杂度、贪心算法的三个要素与反例、排序型贪心、交换论证。

---

# 1 矩阵

## 1.1 表示与遍历

```python
m, n = 3, 4
a = [[0] * n for _ in range(m)]        # ✅ m 行 n 列
# a = [[0] * n] * m                    # ❌ 三行是同一个列表

for i in range(m):
    for j in range(n):
        a[i][j] = i * n + j

for row in a:
    print(*row)
```

**读入一个 m×n 矩阵**：

```python
import sys

data = sys.stdin.read().split()
idx = 0
m, n = int(data[idx]), int(data[idx + 1]); idx += 2
a = []
for _ in range(m):
    a.append([int(data[idx + j]) for j in range(n)])
    idx += n
```

**遍历顺序与缓存**：按行遍历（`a[i][j]` 中 j 变化快）比按列遍历快，
因为一行的元素在内存中相邻——这是第 3 周存储层次的直接后果。

## 1.2 保护圈（padding）

处理"每个格子看它的上下左右邻居"这类问题时，边界判断很啰嗦：

```python
# 没有保护圈：每次都要判越界
for i in range(m):
    for j in range(n):
        s = 0
        for di, dj in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            ni, nj = i + di, j + dj
            if 0 <= ni < m and 0 <= nj < n:
                s += a[ni][nj]
```

**保护圈**：在四周补一圈 0，内部就不需要判越界了：

```python
m, n = 3, 3
a = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]

# 加保护圈：变成 (m+2) x (n+2)
g = [[0] * (n + 2) for _ in range(m + 2)]
for i in range(m):
    for j in range(n):
        g[i + 1][j + 1] = a[i][j]

DIRS = ((-1, 0), (1, 0), (0, -1), (0, 1))
res = [[0] * n for _ in range(m)]
for i in range(1, m + 1):
    for j in range(1, n + 1):
        res[i - 1][j - 1] = sum(g[i + di][j + dj] for di, dj in DIRS)

for row in res:
    print(*row)
# 6 9 8
# 13 20 17
# 12 21 14
```

**方向数组**是本课后面（第 9 周 DFS、第 12 周 BFS）反复使用的写法：

```python
DIRS4 = ((-1, 0), (1, 0), (0, -1), (0, 1))                       # 上下左右
DIRS8 = tuple((di, dj) for di in (-1, 0, 1) for dj in (-1, 0, 1)
              if (di, dj) != (0, 0))                             # 八邻域
```

## 1.3 转置与旋转

```python
a = [[1, 2, 3], [4, 5, 6]]

t = [list(row) for row in zip(*a)]          # 转置：2x3 -> 3x2
print(t)                                     # [[1, 4], [2, 5], [3, 6]]

b = [[1, 2], [3, 4]]
cw = [list(row) for row in zip(*b[::-1])]   # 顺时针 90°
print(cw)                                    # [[3, 1], [4, 2]]

ccw = [list(row) for row in zip(*b)][::-1]  # 逆时针 90°
print(ccw)                                   # [[2, 4], [1, 3]]
```

**记法**：顺时针 = **先上下翻转再转置**；逆时针 = **先转置再上下翻转**。

## 1.4 矩阵乘法

C = A·B，其中 A 是 m×k，B 是 k×n，则 C 是 m×n，且 `C[i][j] = Σ A[i][t] * B[t][j]`。

```python
def matmul(A, B):
    m, k, n = len(A), len(B), len(B[0])
    C = [[0] * n for _ in range(m)]
    for i in range(m):
        Ai = A[i]                       # 提到内层循环外，减少一次索引
        Ci = C[i]
        for t in range(k):
            if Ai[t]:                   # 稀疏时跳过零，常数优化
                Bt = B[t]
                v = Ai[t]
                for j in range(n):
                    Ci[j] += v * Bt[j]
    return C


A = [[1, 2], [3, 4]]
B = [[5, 6], [7, 8]]
print(matmul(A, B))          # [[19, 22], [43, 50]]
```

复杂度 **O(m·k·n)**。n = 200 时是 8×10⁶，可以；n = 1000 时是 10⁹，必然 TLE。

**E18161: 矩阵运算（先乘再加）**，<http://cs101.openjudge.cn/practice/18161/>
先判断维度是否匹配，不匹配输出 `Error!`——**这类题的失分几乎全在漏判维度**。

**E23555: 节省存储的矩阵乘法**，<http://cs101.openjudge.cn/practice/23555/>
用三元组 `(行, 列, 值)` 存稀疏矩阵。思路：把 B 按行建索引，
遍历 A 的每个非零元 `(i, t, v)`，累加到 `C[i][j] += v * B[t][j]`。

```python
from collections import defaultdict


def sparse_matmul(n, a_items, b_items):
    """a_items / b_items 为 (行, 列, 值) 列表，返回按 (行, 列) 升序的三元组列表。"""
    brow = defaultdict(list)
    for r, c, v in b_items:
        brow[r].append((c, v))
    acc = defaultdict(int)
    for i, t, v in a_items:
        for j, w in brow.get(t, ()):
            acc[(i, j)] += v * w
    return [(i, j, v) for (i, j), v in sorted(acc.items()) if v != 0]


print(sparse_matmul(2, [(0, 0, 1), (1, 1, 2)], [(0, 1, 3), (1, 0, 4)]))
# [(0, 1, 3), (1, 0, 8)]
```

## 1.5 二维前缀和

求任意子矩阵的和，预处理 O(mn)、单次查询 O(1)：

```python
def build_prefix(a):
    m, n = len(a), len(a[0])
    pre = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m):
        for j in range(n):
            pre[i + 1][j + 1] = pre[i][j + 1] + pre[i + 1][j] - pre[i][j] + a[i][j]
    return pre


def query(pre, r1, c1, r2, c2):
    """左上 (r1,c1) 到右下 (r2,c2) 闭区间的和（0-indexed）。"""
    return pre[r2 + 1][c2 + 1] - pre[r1][c2 + 1] - pre[r2 + 1][c1] + pre[r1][c1]


a = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
pre = build_prefix(a)
print(query(pre, 0, 0, 1, 1))     # 1+2+4+5 = 12
print(query(pre, 1, 1, 2, 2))     # 5+6+8+9 = 28
```

**容斥原理**：`大矩形 - 上 - 左 + 左上（被减了两次要加回来）`。
第 11 周的"最大子矩阵"会直接用到它。

---

# 2 排序

## 2.1 会用 `sorted` 就够应付大多数题

```python
a = [3, 1, 2]
print(sorted(a))                     # [1, 2, 3]，返回新列表
a.sort(reverse=True)                 # 原地降序 -> [3, 2, 1]

people = [("bob", 20), ("amy", 20), ("cid", 18)]
print(sorted(people, key=lambda p: p[1]))          # 按年龄升序
print(sorted(people, key=lambda p: (p[1], p[0])))  # 年龄升序，同龄按名字升序
print(sorted(people, key=lambda p: (-p[1], p[0]))) # 年龄降序，同龄按名字升序
```

**多关键字排序的通用写法**：`key` 返回一个元组，元素按优先级排列；
数值要降序就取负号，字符串要降序就分两次排（利用稳定性）。

**稳定性**：Python 的 `sort` 是**稳定**的——相等元素保持原有相对顺序。所以：

```python
rows = [("a", 2), ("b", 1), ("c", 2)]
rows.sort(key=lambda r: r[0])        # 先按次关键字
rows.sort(key=lambda r: r[1])        # 再按主关键字，次关键字的顺序被保留
print(rows)                          # [('b', 1), ('a', 2), ('c', 2)]
```

复杂度 **O(n log n)**（Timsort），已排序数据接近 O(n)。

## 2.2 五种基础排序

| 算法 | 平均 | 最坏 | 空间 | 稳定 | 特点 |
| ---- | ---- | ---- | ---- | ---- | ---- |
| 冒泡 | O(n²) | O(n²) | O(1) | 是 | 教学用；可提前退出 |
| 选择 | O(n²) | O(n²) | O(1) | 否 | 交换次数最少（n−1 次） |
| 插入 | O(n²) | O(n²) | O(1) | 是 | **近乎有序时接近 O(n)** |
| 归并 | O(n log n) | O(n log n) | O(n) | 是 | 分治；可顺带求逆序数 |
| 快排 | O(n log n) | O(n²) | O(log n) | 否 | 常数最小；随机化避免最坏 |

```python
def bubble_sort(a):
    a = a[:]
    n = len(a)
    for i in range(n - 1):
        swapped = False
        for j in range(n - 1 - i):
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                swapped = True
        if not swapped:              # 一趟没交换 -> 已有序，提前退出
            break
    return a


def insertion_sort(a):
    a = a[:]
    for i in range(1, len(a)):
        key, j = a[i], i - 1
        while j >= 0 and a[j] > key:
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = key
    return a


def merge_sort(a):
    if len(a) <= 1:
        return a[:]
    mid = len(a) // 2
    left, right = merge_sort(a[:mid]), merge_sort(a[mid:])
    out, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:      # <= 保证稳定
            out.append(left[i]); i += 1
        else:
            out.append(right[j]); j += 1
    out.extend(left[i:])
    out.extend(right[j:])
    return out


def quick_sort(a):
    if len(a) <= 1:
        return a[:]
    pivot = a[len(a) // 2]
    less = [x for x in a if x < pivot]
    equal = [x for x in a if x == pivot]
    greater = [x for x in a if x > pivot]
    return quick_sort(less) + equal + quick_sort(greater)


import random
t = [random.randint(0, 100) for _ in range(200)]
assert bubble_sort(t) == insertion_sort(t) == merge_sort(t) == quick_sort(t) == sorted(t)
print("四种排序与内建 sorted 一致")
```

> **考试里要不要手写排序？** 一般不要——直接 `sort()`。
> 但**归并排序的合并过程**要会写：求逆序对、合并有序序列都要用。

## 2.3 归并排序求逆序对

```python
def count_inversions(a):
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


print(count_inversions([3, 1, 2])[1])       # 2  —— (3,1) 和 (3,2)
print(count_inversions([5, 4, 3, 2, 1])[1]) # 10 = C(5,2)
```

---

# 3 贪心

## 3.1 什么是贪心

**每一步都选当前看起来最好的**，且不回头。

三个要素：

1. **贪心策略**：每步怎么选；
2. **正确性证明**：为什么局部最优能拼成全局最优；
3. **反例检验**：想不出证明，就努力构造反例。

## 3.2 贪心不总是对的

**找零问题**：面额 `[1, 5, 10, 25]`，凑 30 → 贪心选 25+5，2 枚，正确。
但面额 `[1, 3, 4]`，凑 6 → 贪心选 4+1+1，3 枚；**最优是 3+3，2 枚**。

```python
def greedy_coins(coins, amount):
    coins = sorted(coins, reverse=True)
    cnt, rest = 0, amount
    for c in coins:
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


print(greedy_coins([1, 3, 4], 6), dp_coins([1, 3, 4], 6))   # 3 2  —— 贪心错了
print(greedy_coins([1, 5, 10, 25], 30), dp_coins([1, 5, 10, 25], 30))  # 2 2
```

> **这是第 11 周动态规划的动机**：贪心失效的地方，DP 接管。

## 3.3 排序型贪心：最常见的套路

绝大多数入门贪心题的形状都是：**先按某个键排序，再一遍扫过去**。
难点全在"**按什么排**"。

### 例：01017: 装箱问题

**01017: 装箱问题**，<http://cs101.openjudge.cn/practice/01017/>

> 有 1×1 到 6×6 六种规格的产品，每个 6×6 的箱子装一层。求最少箱子数。

**策略**：从大到小放。6×6 独占一箱；5×5 剩 11 个 1×1 的空位；
4×4 剩 5 个 2×2；3×3 四个一箱，余数按表补。

```python
import sys

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
    space1 = boxes * 36 - (f * 36 + e * 25 + d * 16 + c * 9 + b * 4)
    if a > space1:
        boxes += (a - space1 + 35) // 36
    print(boxes)
```

**注意 `REST_2` 那张表**：3×3 的产品每箱放 4 个，剩下的空间能塞多少个 2×2 不是线性的，
必须打表。**贪心题的细节往往就藏在这种小表里。**

### 例：12559: 最大最小整数

**12559: 最大最小整数**，<http://cs101.openjudge.cn/practice/12559/>

> 给若干个数字串，拼接成一个整数，求能拼出的最大值和最小值。

**关键**：不能按字典序排，也不能按数值排。正确的比较是"**a+b 和 b+a 哪个大**"。

```python
import functools


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
            return -1                 # x 排前面
        if x + y > y + x:
            return 1
        return 0
    return ''.join(sorted(strs, key=functools.cmp_to_key(cmp)))


nums = ["7", "13", "2"]
print(largest_concat(nums), smallest_concat(nums))   # 7213 1327
```

**为什么 `x+y > y+x` 是对的**：这个比较满足传递性（可以证明），
因此可以作为排序的全序关系；而按字典序会把 `"9"` 排在 `"13"` 后面，显然错。

> 这是**交换论证（exchange argument）**的典型：如果最优解里相邻两项 a、b 的顺序
> 与该规则相反，交换它们不会变差——所以按规则排的解也是最优解。
>
> 完整的论证骨架、以及**怎么用它把排序键推出来**，见 §3.4。

### 例：19948: 因材施教

**19948: 因材施教**，<http://cs101.openjudge.cn/practice/19948/>

> 把 n 个学生按成绩分成 k 组，每组的"差异"是组内最高分减最低分，求总差异最小值。

**策略**：先排序（同一组的学生一定在排序后连续），
则总差异 = (最大−最小) − (被"切开"的 k−1 个相邻差)。要总差异最小，就**切最大的 k−1 个相邻差**。

```python
n, k = 7, 3
scores = [1, 3, 5, 5, 6, 9, 15]
scores.sort()
gaps = sorted((scores[i + 1] - scores[i] for i in range(n - 1)), reverse=True)
total = scores[-1] - scores[0] - sum(gaps[:k - 1])
print(total)          # 14 - (6 + 3) = 5
```

### 例：18211: 军备竞赛

**18211: 军备竞赛**，<http://cs101.openjudge.cn/practice/18211/>

> 有 p 元经费和若干份图纸，每份有价格。造一份自己的武器花掉价格、优势 +1；
> 卖一份给对手得到价格、优势 −1。求最大优势。

**策略**：排序后双指针——**从最便宜的开始造，钱不够就把最贵的卖掉**。

```python
def arms_race(p, prices):
    prices.sort()
    lo, hi = 0, len(prices) - 1
    adv = 0
    while lo <= hi:
        if p >= prices[lo]:
            p -= prices[lo]
            lo += 1
            adv += 1
        elif lo < hi and adv > 0:      # 必须还有优势才敢卖，且不能卖掉正要造的那份
            p += prices[hi]
            hi -= 1
            adv -= 1
        else:
            break
    return adv


print(arms_race(10, [3, 4, 5, 6]))     # 2
# 追踪：造 3（余 7，优势 1）-> 造 4（余 3，优势 2）-> 钱不够造 5，
#       卖掉最贵的 6（余 9，优势 1）-> 造 5（余 4，优势 2）-> lo > hi 结束
```

> ⚠️ `adv > 0` 这个条件很关键：优势为 0 时卖出会变成负优势，题目不允许。
> **贪心题的边界条件往往就是它的全部难度。**

## 3.4 交换论证：把排序键推出来，而不是猜出来

3.3 里每道题我都直接甩了一个排序键。可是考场上没人会告诉你按什么排 ——
**交换论证（exchange argument）就是把它推出来的方法**，
它同时也是贪心正确性证明的标准套路。

### 论证骨架

要证"按规则 R 排出来的解是最优的"，走三步：

1. 取**任意一个**最优解 OPT（不假设它长什么样）；
2. 若 OPT 里存在**相邻**两项 a、b 的顺序与 R 相反，就交换这两项，
   并证明**目标函数不会变差**；
3. 每交换一次，逆序对数至少减 1；逆序对有限，所以有限步之后 OPT 变成了 R 序，
   而这一路上从没变差 —— 因此 **R 序也是一个最优解**。

第 3 步要看清楚：它并没有说"R 序是唯一的最优解"，只说**最优值能被 R 序取到**。
贪心需要的恰好就是这一句。

### 为什么必须是"相邻"两项

因为只有相邻交换，**其余各项的贡献完全不变**，
两种摆法的差才会只剩下 a、b 互相之间的那一项。

如果隔着第三项去交换，中间那项的处境也变了，
差值里会混进与 a、b 无关的量，就化简不出干净的不等式。
**"相邻"不是为了省事，是这套推导能成立的前提。**

### 反过来用：这才是它在考场上的价值

把第 2 步倒过来读，它直接给出排序键：

> 设相邻两项是 a、b，分别写出"a 在前"的代价和"b 在前"的代价，
> 令**前者 ≤ 后者**，化简出来的不等式就是 `key`。

以 12559 为例。相邻两段 a、b 交换，只改变拼接串里那一段，
而 `a+b` 与 `b+a` **等长**，所以整串的大小比较退化成这两段的比较：

- a 在前，这一段是 `a+b`；
- b 在前，这一段是 `b+a`。

于是"a 应排在 b 前面 ⟺ `a+b > b+a`" —— 排序键就这么推出来了，
不是试出来的。字典序和数值序都不满足这个条件，所以都错：

```python
import functools
import itertools
import random


def by_rule(strs):
    """按交换论证推出的规则排：a 在 b 前 ⟺ a+b > b+a"""
    cmp = lambda x, y: -1 if x + y > y + x else (1 if x + y < y + x else 0)
    return ''.join(sorted(strs, key=functools.cmp_to_key(cmp)))


def by_brute(strs):
    return max(''.join(p) for p in itertools.permutations(strs))


nums = ["3", "30", "34", "5", "9"]
print('交换论证的规则 :', by_rule(nums))          # 9534330
print('字典序降序     :', ''.join(sorted(nums, reverse=True)))        # 9534303
print('数值降序       :', ''.join(sorted(nums, key=int, reverse=True)))  # 3430953

random.seed(6)
for _ in range(300):
    strs = [str(random.randint(0, 99)) for _ in range(random.randint(2, 6))]
    assert by_rule(strs) == by_brute(strs), strs
print('300 组随机数据：规则排序的结果 == 全排列暴力的最大值')
```

> 推完之后**一定要和暴力对拍**。推导会出错，对拍不会。

### 两种形态，别混

| | 用在哪 | 交换什么 |
| ---- | ---- | ---- |
| **相邻交换** | 排序型贪心（本节 12559） | OPT 里相邻的两项 |
| **首元素替换** | 选择型贪心（第 10 周的区间问题） | 把 OPT 的第一个选择换成贪心的选择 |

第 10 周会看到后一种：证"选最多不相交区间要按右端点排"时，
设最优解的第一个区间是 X、右端点最小的是 A，把 X 换成 A ——
A 的右端点更小，它之后能放的区间只多不少，所以换掉不会变差。

### 两个必须自己检查的前提

**一、规则 R 必须是全序（满足传递性）。**
否则 `sort` 排出来的结果依赖于比较的先后，"R 序"根本没有定义，
"逆序对递减"这个论证也就垮了。12559 的 `a+b > b+a` 是可以证明传递的；
换一道题要重新验。顺带一提：**用浮点数当排序键最容易在这里翻车** ——
本该相等的两个键因误差变得一大一小，顺序就不稳了。

**二、"交换只影响这两项"要真的成立。**
这是相邻交换全部的立足点。如果题目里有跨项的耦合
（代价依赖于全局的某个量，而不只是前后关系），这一步必须重算，不能照抄。

> **一句话**：交换论证不是用来事后安慰自己"这个贪心大概是对的"，
> 是用来在动手之前**把排序键算出来**的。

## 3.5 贪心的常见形状速查

| 形状 | 排序键 | 例题 |
| ---- | ---- | ---- |
| 拼接最大 / 最小数 | `a+b` vs `b+a` | 12559 |
| 分组最小差异 | 排序后切最大间隙 | 19948 |
| 用最少的箱子 / 船 | 从大到小放 | 01017 |
| 双指针取两端 | 排序后左右夹 | 18211 |
| 区间问题 | 按右端点排 | 第 10 周 |
| 会议室 / 活动选择 | 按结束时间排 | 第 10 周 |

---

# 4 复杂度实战：同一道题的三种写法

任务：给定长度 n 的数组，求最大连续子数组和（第 11 周会作为 DP 重讲）。

```python
import random


def brute(a):                       # O(n^3)
    n, best = len(a), a[0]
    for i in range(n):
        for j in range(i, n):
            best = max(best, sum(a[i:j + 1]))
    return best


def prefix(a):                      # O(n^2)
    n = len(a)
    pre = [0] * (n + 1)
    for i, v in enumerate(a):
        pre[i + 1] = pre[i] + v
    best = a[0]
    for i in range(n):
        for j in range(i, n):
            best = max(best, pre[j + 1] - pre[i])
    return best


def kadane(a):                      # O(n)
    best = cur = a[0]
    for v in a[1:]:
        cur = max(v, cur + v)
        best = max(best, cur)
    return best


t = [random.randint(-20, 20) for _ in range(80)]
assert brute(t) == prefix(t) == kadane(t)
print("三种写法结果一致：", kadane(t))
```

| n | O(n³) | O(n²) | O(n) |
| ---- | ---- | ---- | ---- |
| 10³ | 10⁹ ❌ | 10⁶ ✅ | 10³ ✅ |
| 10⁵ | ❌ | 10¹⁰ ❌ | 10⁵ ✅ |
| 10⁷ | ❌ | ❌ | 10⁷ ✅ |

**结论**：同一道题，三种复杂度对应三个不同的可解规模。**看到 n 就该知道自己要写哪一版。**

---

# 5 本周作业

| # | 题目 | 平台 / 编号 | 考点 |
| - | ---- | ---- | ---- |
| 1 | 矩阵运算（先乘再加） | E18161 | 矩阵乘法、维度判断 |
| 2 | 计算矩阵边缘元素之和 | E07743 | 二维遍历 |
| 3 | 矩阵交换行 | 02899 | 二维列表 |
| 4 | 二维矩阵上的卷积运算 | E19942 | 保护圈、邻域 |
| 5 | 装箱问题 | 01017 | 贪心 + 打表 |
| 6 | 最大最小整数 | 12559 | 自定义比较、交换论证 |
| 7 | 因材施教 | 19948 | 排序型贪心 |
| 8 | 军备竞赛 | 18211 | 双指针贪心 |
| 9（选做） | 节省存储的矩阵乘法 | E23555 | 稀疏矩阵 |
| 10（选做） | 螺旋矩阵 | M18106 | 模拟、方向数组 |

**思考题**：

1. 按 §3.4 的三步骨架，把"按 `a+b > b+a` 排序得到的拼接结果最大"写成完整证明；再补上传递性那一步（`a+b>b+a` 且 `b+c>c+b` ⟹ `a+c>c+a`）。
2. 装箱问题里 `REST_2 = [0, 5, 3, 1]` 是怎么算出来的？画图验证 `c % 4 == 2` 时为什么是 3。
3. 归并排序求逆序对时，`cnt += len(left) - i` 为什么不是 `cnt += 1`？
4. 二维前缀和的容斥公式里，为什么 `pre[r1][c1]` 要加回来？
5. 01017 装箱问题用的是"从大到小放"。它能用 §3.4 的三步骨架证明吗？
   如果不能，指出卡在哪一步 —— 骨架的哪个前提在这道题上不成立？

---

# 6 小结

1. 二维列表一律 `[[0]*n for _ in range(m)]`；边界多时用**保护圈**，方向用**方向数组**。
2. 矩阵乘法 O(mkn)；二维前缀和预处理 O(mn)、查询 O(1)，靠**容斥**。
3. 排序会用 `key=lambda x: (主, 次)` 就够；**稳定性**让"两次排序"成为可能。
   归并的合并过程要能默写。
4. 贪心 = **排序 + 一遍扫**，难在选排序键；不会证明就**构造反例**。
   找零 `[1,3,4]` 凑 6 是标准反例。
5. **排序键要用交换论证推，不要猜**：设相邻两项 a、b，写出两种摆法的代价，
   令"a 在前"不劣，化简出的不等式就是 `key`（§3.4）。推完必须和暴力对拍。
6. **看到 n 的范围就知道该写哪个复杂度的版本**——这是本周最该带走的习惯。

**下周预告**：继续矩阵与贪心的练习，并引入两种最基本的线性结构——**栈与队列**。

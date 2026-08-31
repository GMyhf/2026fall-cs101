# 第9周 递归、回溯与并查集

*Updated 2026-08-31 GMT+8*
 *Compiled by Hongfei Yan (2026 Fall)*
https://github.com/GMyhf/2026fall-cs101

> **课程安排对应**：第 9 周
> **主题与学习重点**：递归、回溯与并查集。

**知识点**：回溯法的通用模板、子集 / 组合 / 排列三大形态、去重、剪枝、八皇后、马走日、DFS 求连通块（Flood Fill）、并查集的三种实现、路径压缩与按秩合并、带权并查集。

---

# 1 回溯法

## 1.1 什么是回溯

**回溯 = DFS + 撤销**。在解空间树上深度优先地搜索，走不通就退回上一步换一个选择。

```
              [ ]
         /     |     \
      [1]     [2]     [3]
     /   \    /  \    /  \
  [1,2] [1,3] ...      ...
```

**通用模板**——本周所有题都是它的变形：

```python
def backtrack(path, choices):
    if 满足结束条件:
        result.append(path[:])          # ⚠️ 拷贝
        return
    for choice in choices:
        if 不合法:
            continue                     # 剪枝
        做出选择(choice)                  # 修改状态
        backtrack(path, 新的choices)
        撤销选择(choice)                  # 恢复状态
```

三个要素：**路径**（已做的选择）、**选择列表**（当前还能做什么）、**结束条件**。

## 1.2 三大形态

### 子集（每个元素选或不选，2ⁿ 个）

**LeetCode 78. 子集**，<https://leetcode.cn/problems/subsets/>

```python
def subsets(nums):
    res, path = [], []

    def dfs(start):
        res.append(path[:])              # 每个节点都是一个答案
        for i in range(start, len(nums)):
            path.append(nums[i])
            dfs(i + 1)                   # i+1：不能回头选，避免重复
            path.pop()

    dfs(0)
    return res


print(subsets([1, 2, 3]))
# [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]
```

### 组合（选 k 个，C(n,k) 个）

**LeetCode 39. 组合总和**，<https://leetcode.cn/problems/combination-sum/>

```python
def combination_sum(candidates, target):
    """每个数可以重复使用，求所有和为 target 的组合。"""
    res, path = [], []
    candidates = sorted(candidates)

    def dfs(start, rest):
        if rest == 0:
            res.append(path[:])
            return
        for i in range(start, len(candidates)):
            if candidates[i] > rest:     # 剪枝：排序后，后面的更大，直接停
                break
            path.append(candidates[i])
            dfs(i, rest - candidates[i]) # i 而不是 i+1：可重复使用
            path.pop()

    dfs(0, target)
    return res


print(combination_sum([2, 3, 6, 7], 7))     # [[2, 2, 3], [7]]
```

> **`break` 而不是 `continue`**：因为已排序，一旦当前数大于剩余额度，后面的只会更大。
> 这一个字的差别，常常就是 AC 与 TLE 的差别。

### 排列（n! 个）

见第 8 周 3.3 节的模板。**带重复元素的去重排列**：

```python
def permute_unique(nums):
    nums = sorted(nums)                  # 先排序，让相同元素相邻
    res, path = [], []
    used = [False] * len(nums)

    def dfs():
        if len(path) == len(nums):
            res.append(path[:])
            return
        for i in range(len(nums)):
            if used[i]:
                continue
            # 去重：与前一个相同、且前一个在本层还没被用过 -> 跳过
            if i > 0 and nums[i] == nums[i - 1] and not used[i - 1]:
                continue
            used[i] = True
            path.append(nums[i])
            dfs()
            path.pop()
            used[i] = False

    dfs()
    return res


print(permute_unique([1, 1, 2]))         # [[1, 1, 2], [1, 2, 1], [2, 1, 1]]
```

**去重条件是本周最难记的一行**。记法：**同一层里，相同的数只允许第一个被选**。

| 形态 | 递归时传 | 典型题 |
| ---- | ---- | ---- |
| 子集 | `dfs(i + 1)` | LC 78 |
| 组合（不可重复用） | `dfs(i + 1)` | LC 77 |
| 组合（可重复用） | `dfs(i)` | LC 39 |
| 排列 | 从 0 开始 + `used[]` | 02748 |

## 1.3 剪枝：让指数变得可行

回溯的复杂度本质是指数级的，**剪枝决定了它能不能跑完**。三类剪枝：

1. **可行性剪枝**：当前选择已违反约束 → 立即 `continue` / `return`；
2. **最优性剪枝**：当前部分解已经比已知最优差 → 放弃；
3. **顺序剪枝**：排序后，一旦不可行，后面的都不可行 → `break`。

## 1.4 例：八皇后

**02754: 八皇后**，<http://cs101.openjudge.cn/practice/02754/>

> 在 8×8 棋盘上放 8 个皇后，任意两个不能同行、同列、同对角线。
> 按字典序输出第 b 个解（用一个 8 位数串表示，第 i 位是第 i 行皇后所在的列）。

**关键**：逐行放置（自动保证不同行），用三个集合记录已占用的列与两条对角线。

```python
def solve_queens(n=8):
    """返回全部解，每个解是长度 n 的列号元组（1-indexed），按字典序。"""
    res = []
    cols, diag, anti = set(), set(), set()
    path = []

    def dfs(row):
        if row == n:
            res.append(tuple(path))
            return
        for c in range(n):
            if c in cols or (row - c) in diag or (row + c) in anti:
                continue                       # 可行性剪枝
            cols.add(c); diag.add(row - c); anti.add(row + c)
            path.append(c + 1)
            dfs(row + 1)
            path.pop()
            cols.remove(c); diag.remove(row - c); anti.remove(row + c)

    dfs(0)
    return res


sols = solve_queens(8)
print(len(sols))                                    # 92
print(''.join(map(str, sols[0])))                   # 15863724
print(''.join(map(str, sols[91])))                  # 84136275
```

**为什么用 `row - c` 和 `row + c`**：

```
   同一条 ↘ 对角线上，row - c 恒定
   同一条 ↙ 对角线上，row + c 恒定

       c=0  c=1  c=2
 r=0    0    -1   -2      ← row - c
 r=1    1     0   -1
 r=2    2     1    0
```

**LeetCode 51. N 皇后**，<https://leetcode.cn/problems/n-queens/> 是同一题的棋盘输出版。

## 1.5 例：马走日

**04123: 马走日**，<http://cs101.openjudge.cn/practice/04123/>

> n×m 棋盘，马从 (x, y) 出发，问有多少种走法能不重复地走遍所有格子。

```python
KNIGHT = ((-2, -1), (-2, 1), (-1, -2), (-1, 2),
          (1, -2), (1, 2), (2, -1), (2, 1))


def knight_tours(n, m, sx, sy):
    visited = [[False] * m for _ in range(n)]
    visited[sx][sy] = True
    total = n * m
    count = 0

    def dfs(x, y, step):
        nonlocal count
        if step == total:
            count += 1
            return
        for dx, dy in KNIGHT:
            nx, ny = x + dx, y + dy
            if 0 <= nx < n and 0 <= ny < m and not visited[nx][ny]:
                visited[nx][ny] = True
                dfs(nx, ny, step + 1)
                visited[nx][ny] = False        # 回溯
    dfs(sx, sy, 1)
    return count


print(knight_tours(5, 4, 0, 0))       # 32
print(knight_tours(3, 3, 0, 0))       # 0  —— 3x3 中心不可达
```

> `visited[nx][ny] = False` 这一行就是"回溯"。**忘了它，答案永远是 0 或 1。**

## 1.6 例：DFS 求连通块（Flood Fill）

**02386: Lake Counting**，<http://cs101.openjudge.cn/practice/02386/>；
**M05585: 晶矿的个数**，<http://cs101.openjudge.cn/practice/05585/>

> 网格中 `W` 表示水，八连通的水域算一个湖，求湖的个数。

```python
import sys


def count_lakes(grid):
    n, m = len(grid), len(grid[0])
    g = [list(row) for row in grid]
    DIRS8 = tuple((di, dj) for di in (-1, 0, 1) for dj in (-1, 0, 1)
                  if (di, dj) != (0, 0))

    def flood(i, j):
        """迭代版 DFS：用显式栈，避免递归过深。"""
        stack = [(i, j)]
        g[i][j] = '.'
        while stack:
            x, y = stack.pop()
            for dx, dy in DIRS8:
                nx, ny = x + dx, y + dy
                if 0 <= nx < n and 0 <= ny < m and g[nx][ny] == 'W':
                    g[nx][ny] = '.'          # 标记后再入栈，避免重复入栈
                    stack.append((nx, ny))

    cnt = 0
    for i in range(n):
        for j in range(m):
            if g[i][j] == 'W':
                flood(i, j)
                cnt += 1
    return cnt


sample = [
    "W........WW.",
    ".WWW.....WWW",
    "....WW...WW.",
    ".........WW.",
    ".........W..",
    "..W......W..",
    ".W.W.....WW.",
    "W.W.W.....W.",
    ".W.W......W.",
    "..W.......W.",
]
print(count_lakes(sample))          # 3
```

> **为什么写成迭代**：网格 100×100 时递归深度可达 10⁴，
> 在评测机上有爆栈风险。**Flood Fill 一律用显式栈或队列。**
> （队列版就是第 12 周的 BFS，两者数出的连通块个数完全相同。）

---

# 2 并查集（Disjoint Set Union, DSU）

## 2.1 它解决什么问题

**动态维护"谁和谁在同一组"**，支持两个操作：

| 操作 | 语义 |
| ---- | ---- |
| `find(x)` | x 属于哪个集合（返回代表元） |
| `union(x, y)` | 把 x 和 y 所在的两个集合合并 |

典型场景：判连通、判环、等价类划分、亲戚关系。

## 2.2 最朴素的实现

用一个 `parent` 数组表示森林，每棵树是一个集合，树根是代表元。

```python
class NaiveDSU:
    def __init__(self, n):
        self.parent = list(range(n))     # 一开始每个点自成一组

    def find(self, x):
        while self.parent[x] != x:
            x = self.parent[x]
        return x

    def union(self, x, y):
        rx, ry = self.find(x), self.find(y)
        if rx != ry:
            self.parent[rx] = ry
```

**问题**：连续 `union(0,1), union(1,2), union(2,3)...` 会退化成一条链，`find` 变成 O(n)。

## 2.3 两个优化

**路径压缩**：`find` 的路上，把沿途节点直接挂到根上。
**按秩（或按大小）合并**：把矮树挂到高树下面，树高不会失控。

```python
class DSU:
    """带路径压缩 + 按大小合并的并查集。
    单次操作近似 O(α(n))，α 是反阿克曼函数，实际上 ≤ 4。"""

    def __init__(self, n):
        self.parent = list(range(n))
        self.size = [1] * n
        self.count = n                    # 当前集合个数

    def find(self, x):
        root = x
        while self.parent[root] != root:
            root = self.parent[root]
        while self.parent[x] != root:     # 第二趟做路径压缩（迭代，不怕深）
            self.parent[x], x = root, self.parent[x]
        return root

    def union(self, x, y):
        rx, ry = self.find(x), self.find(y)
        if rx == ry:
            return False                  # 本来就在一组
        if self.size[rx] < self.size[ry]:
            rx, ry = ry, rx
        self.parent[ry] = rx
        self.size[rx] += self.size[ry]
        self.count -= 1
        return True

    def connected(self, x, y):
        return self.find(x) == self.find(y)


d = DSU(6)
d.union(0, 1); d.union(1, 2); d.union(3, 4)
print(d.connected(0, 2), d.connected(0, 3), d.count)    # True False 3
```

> **`find` 写成迭代两趟**，而不是递归 `parent[x] = find(parent[x])`：
> n = 10⁵ 时递归版可能爆栈。这是本课反复出现的取舍。

## 2.4 例：02524: 宗教信仰

**02524: 宗教信仰**，<http://cs101.openjudge.cn/practice/02524/>

> n 个学生，给出若干对"信仰相同"的关系，问最多可能有多少种不同的宗教。

**就是数连通块个数**：

```python
def max_religions(n, pairs):
    d = DSU(n)
    for a, b in pairs:
        d.union(a, b)
    return d.count


print(max_religions(10, [(0, 1), (1, 2), (3, 4)]))      # 10 - 3 = 7
```

## 2.5 例：判环

无向图中，若 `union(a, b)` 时发现 a、b 已经连通，说明这条边构成了环。

```python
def has_cycle(n, edges):
    d = DSU(n)
    for a, b in edges:
        if not d.union(a, b):            # union 返回 False 表示本已连通
            return True
    return False


print(has_cycle(3, [(0, 1), (1, 2)]))            # False
print(has_cycle(3, [(0, 1), (1, 2), (2, 0)]))    # True
```

## 2.6 带权并查集：01182: 食物链

**01182: 食物链**，<http://cs101.openjudge.cn/practice/01182/>

> A 吃 B，B 吃 C，C 吃 A。给出若干句"x 和 y 同类"或"x 吃 y"，统计假话条数。

**扩展域写法**（最好写、最不容易错）：把每个动物拆成 3 个节点——
`x`（同类域）、`x+n`（猎物域）、`x+2n`（天敌域）。

```python
def food_chain(n, statements):
    """statements: (d, x, y)，d=1 表示同类，d=2 表示 x 吃 y。1-indexed 输入。
    返回假话条数。"""
    d = DSU(3 * n)
    lies = 0
    for kind, x, y in statements:
        if x < 1 or x > n or y < 1 or y > n:
            lies += 1
            continue
        x -= 1
        y -= 1
        if kind == 1:                                  # x 与 y 同类
            if d.connected(x, y + n) or d.connected(x, y + 2 * n):
                lies += 1
            else:
                d.union(x, y)
                d.union(x + n, y + n)
                d.union(x + 2 * n, y + 2 * n)
        else:                                          # x 吃 y
            # 假话：x 与 y 同类，或 y 反过来吃 x（x 落在 y 的猎物域）
            if x == y or d.connected(x, y) or d.connected(x, y + n):
                lies += 1
            else:
                d.union(x + n, y)                      # y 是 x 的猎物
                d.union(x, y + 2 * n)                  # x 是 y 的天敌
                d.union(x + 2 * n, y + n)              # x 的天敌是 y 的猎物
    return lies


print(food_chain(100, [(1, 101, 1), (2, 1, 2), (2, 2, 3), (2, 3, 3),
                       (1, 1, 3), (2, 3, 1), (1, 5, 5)]))
# 3
```

> 这是本课**最难的一道并查集题**，值得反复读三遍：
> 关键是想清楚"x 吃 y"意味着**三组**关系同时成立。

## 2.7 并查集的复杂度

| 实现 | `find` 摊还 |
| ---- | ---- |
| 朴素 | O(n) 最坏 |
| 仅路径压缩 | O(log n) |
| 仅按秩合并 | O(log n) |
| **两者都用** | **O(α(n)) ≈ O(1)** |

α 是反阿克曼函数，对任何现实中的 n，α(n) ≤ 4。**所以并查集可以当 O(1) 用。**

---

# 3 DFS 与并查集：什么时候用哪个

| | DFS / BFS | 并查集 |
| ---- | ---- | ---- |
| 数连通块 | ✅ | ✅ |
| **动态加边**后查询连通性 | ❌ 每次要重跑 | ✅ 天生支持 |
| 求**路径**本身 | ✅ | ❌ 只知道连不连通 |
| 求**最短**路径 | ✅ BFS | ❌ |
| 判无向图有无环 | ✅ | ✅ 更简单 |

**经验法则**：只问"连不连通 / 分几组"且**边是一条条加进来**的，用并查集；
需要路径、距离、遍历顺序的，用 DFS / BFS。

---

# 4 本周作业

| # | 题目 | 平台 / 编号 | 考点 |
| - | ---- | ---- | ---- |
| 1 | 八皇后 | 02754 | 回溯 + 剪枝 |
| 2 | 马走日 | 04123 | 回溯 + 状态还原 |
| 3 | Lake Counting | 02386 | Flood Fill |
| 4 | 晶矿的个数 | M05585 | 连通块 |
| 5 | 宗教信仰 | 02524 | 并查集数连通块 |
| 6 | 子集 | LC 78 | 回溯：子集形态 |
| 7 | 组合总和 | LC 39 | 回溯：可重复选 |
| 8 | 一种等价类划分问题 | M29982 | 并查集 |
| 9（选做） | 食物链 | 01182 / T01182 | 扩展域并查集 |
| 10（选做） | N 皇后 | LC 51 | 回溯（棋盘输出） |
| 11（选做） | 单词搜索 | LC 79 | 网格回溯 |

**思考题**：

1. 八皇后一共 92 个解，其中本质不同的（不计旋转与镜像）有几个？
2. 排列去重的条件写成 `used[i-1]` 为 **True** 时跳过，还对吗？两种写法都能去重，区别是什么？
3. 并查集的 `find` 若只做路径压缩不做按秩合并，最坏复杂度是多少？为什么仍然可以接受？
4. 食物链一题若改成"A 吃 B、B 吃 C、C 吃 D、D 吃 A"（四元环），扩展域要开几倍？
5. Flood Fill 用递归写，网格 1000×1000 全是 `W` 时会发生什么？实测一下。

---

# 5 小结

1. 回溯 = **DFS + 撤销**；模板三要素：路径、选择列表、结束条件。
   两个必犯错误仍然是**忘拷贝**和**忘还原**。
2. 三大形态靠递归参数区分：子集 / 不可重组合 `dfs(i+1)`、可重组合 `dfs(i)`、排列用 `used[]`。
3. **剪枝决定回溯能不能跑完**：排序后用 `break` 而不是 `continue`。
4. 八皇后用 `col` / `row-c` / `row+c` 三个集合；马走日靠方向数组 + 回溯还原。
5. 并查集 = **路径压缩 + 按大小合并**，摊还近 O(1)；`find` 写迭代版防爆栈。
   `union` 返回 `False` 就是"判环"。

**下周预告**：进入 11 月的核心内容——**区间问题**与**动态规划**入门。

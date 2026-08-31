# 第12周 动态规划、广度优先搜索（BFS）与相关练习

*Updated 2026-08-31 GMT+8*
 *Compiled by Hongfei Yan (2026 Fall)*
https://github.com/GMyhf/2026fall-cs101

> **课程安排对应**：第 12 周
> **主题与学习重点**：动态规划、广度优先搜索（BFS）与相关练习。

**知识点**：图的三种表示、BFS 模板与"层"的概念、最短步数问题、多源 BFS、带状态的 BFS、Dijkstra 与优先队列、DFS 与 BFS 的选择、二分查找答案（最小化最大值）、网格 DP 与搜索的分界。

---

# 1 图与它的表示

## 1.1 术语

| 术语 | 含义 |
| ---- | ---- |
| 顶点 V / 边 E | 图 G = (V, E) |
| 有向 / 无向 | 边是否有方向 |
| 带权 | 边上有数值（距离、代价） |
| 度 | 与顶点相连的边数（有向图分入度 / 出度） |
| 连通 | 任意两点间有路径 |
| 环 | 起点与终点相同的路径 |

## 1.2 三种表示

```python
n = 4
edges = [(0, 1), (0, 2), (1, 3), (2, 3)]

# 1) 邻接矩阵：O(V²) 空间，查边 O(1)。适合稠密图、小图
adj_mat = [[0] * n for _ in range(n)]
for u, v in edges:
    adj_mat[u][v] = adj_mat[v][u] = 1

# 2) 邻接表：O(V+E) 空间，遍历邻居最快。适合稀疏图 —— 本课默认用这个
adj = [[] for _ in range(n)]
for u, v in edges:
    adj[u].append(v)
    adj[v].append(u)

print(adj)          # [[1, 2], [0, 3], [0, 3], [1, 2]]

# 3) 隐式图：不存边，邻居由规则算出来 —— 网格题都是这一类
DIRS = ((-1, 0), (1, 0), (0, -1), (0, 1))


def neighbors(x, y, rows, cols):
    for dx, dy in DIRS:
        nx, ny = x + dx, y + dy
        if 0 <= nx < rows and 0 <= ny < cols:
            yield nx, ny


print(list(neighbors(0, 0, 3, 3)))     # [(1, 0), (0, 1)]
```

> **本课绝大多数图论题是"隐式图"**：迷宫、棋盘、状态转移。
> 认出"这是个图"往往就解决了一半问题。

---

# 2 广度优先搜索（BFS）

## 2.1 核心思想

**一层一层地扩展**：先访问所有距离起点 1 步的点，再访问 2 步的，以此类推。

```
   起点 s
     │
   ┌─┴─┐          第 1 层：距离 1
   a   b
   │   │
   c   d          第 2 层：距离 2
```

**BFS 的关键性质**：在**无权图**（或所有边权相同）中，
**第一次访问到某个点时，走过的步数就是最短距离**。

## 2.2 模板

```python
from collections import deque


def bfs(start, goal, get_neighbors):
    """返回从 start 到 goal 的最短步数，不可达返回 -1。"""
    if start == goal:
        return 0
    visited = {start}
    q = deque([(start, 0)])
    while q:
        node, dist = q.popleft()
        for nxt in get_neighbors(node):
            if nxt in visited:
                continue
            if nxt == goal:
                return dist + 1
            visited.add(nxt)              # ⚠️ 入队时就标记，不是出队时
            q.append((nxt, dist + 1))
    return -1
```

> ### 三条铁律
>
> 1. **用 `deque` 不用 `list`**：`list.pop(0)` 是 O(n)，会把 O(V+E) 拖成 O(V²)。
> 2. **入队时就标记 visited**，不是出队时。否则同一个点会被多次入队，队列爆炸。
> 3. **步数跟着节点走**（存在队列元素里），或者按"层"整批处理。

**按层处理的写法**（需要知道"第几层"时更清晰）：

```python
def bfs_by_level(start, goal, get_neighbors):
    if start == goal:
        return 0
    visited = {start}
    frontier = [start]
    steps = 0
    while frontier:
        steps += 1
        nxt_frontier = []
        for node in frontier:
            for nxt in get_neighbors(node):
                if nxt in visited:
                    continue
                if nxt == goal:
                    return steps
                visited.add(nxt)
                nxt_frontier.append(nxt)
        frontier = nxt_frontier
    return -1
```

## 2.3 例：迷宫最短路径

```python
from collections import deque


def maze_shortest(grid, start, goal):
    """grid 中 '.' 可走、'#' 是墙；返回最短步数，不可达返回 -1。"""
    n, m = len(grid), len(grid[0])
    sx, sy = start
    gx, gy = goal
    if grid[sx][sy] == '#' or grid[gx][gy] == '#':
        return -1
    DIRS = ((-1, 0), (1, 0), (0, -1), (0, 1))
    dist = [[-1] * m for _ in range(n)]
    dist[sx][sy] = 0
    q = deque([(sx, sy)])
    while q:
        x, y = q.popleft()
        if (x, y) == (gx, gy):
            return dist[x][y]
        for dx, dy in DIRS:
            nx, ny = x + dx, y + dy
            if 0 <= nx < n and 0 <= ny < m and grid[nx][ny] != '#' and dist[nx][ny] < 0:
                dist[nx][ny] = dist[x][y] + 1
                q.append((nx, ny))
    return -1


maze = [
    ".....",
    ".###.",
    ".....",
    ".###.",
    ".....",
]
print(maze_shortest(maze, (0, 0), (4, 4)))       # 8
print(maze_shortest(["..", "##"], (0, 0), (1, 1)))  # -1
```

> **用 `dist` 数组同时充当 `visited`**：`dist[i][j] < 0` 表示未访问。
> 这样少开一个数组，也少一处出错的机会。

## 2.4 例：04115: 鸣人和佐助（带状态的 BFS）

**04115: 鸣人和佐助**，<http://cs101.openjudge.cn/practice/04115/>

> 网格中 `#` 是大蛇丸的手下，鸣人有 T 点查克拉，消灭一个手下花 1 点。求到佐助的最短时间。

**关键**：状态不再是 `(x, y)`，而是 **`(x, y, 剩余查克拉)`**。

```python
from collections import deque


def naruto(grid, T):
    n, m = len(grid), len(grid[0])
    sx = sy = gx = gy = -1
    for i in range(n):
        for j in range(m):
            if grid[i][j] == '@':
                sx, sy = i, j
            elif grid[i][j] == '+':
                gx, gy = i, j
    DIRS = ((-1, 0), (1, 0), (0, -1), (0, 1))
    # visited[x][y] = 到达 (x,y) 时曾拥有过的最大剩余查克拉
    best = [[-1] * m for _ in range(n)]
    best[sx][sy] = T
    q = deque([(sx, sy, T, 0)])
    while q:
        x, y, t, step = q.popleft()
        if (x, y) == (gx, gy):
            return step
        for dx, dy in DIRS:
            nx, ny = x + dx, y + dy
            if not (0 <= nx < n and 0 <= ny < m):
                continue
            nt = t - 1 if grid[nx][ny] == '#' else t
            if nt < 0:
                continue
            if nt <= best[nx][ny]:            # 已经用更多查克拉到过这里，剪枝
                continue
            best[nx][ny] = nt
            q.append((nx, ny, nt, step + 1))
    return -1


g = ["@####",
     ".#..+",
     "....."]
print(naruto(g, 2))       # 5  —— 有 2 点查克拉，可以直接凿墙走近路
print(naruto(g, 0))       # 7  —— 没有查克拉，只能绕开所有 '#'
```

> **状态设计是 BFS 题的全部难度**。剪枝条件 `nt <= best[nx][ny]` 的含义是：
> "以更少的查克拉、不更早地到达同一格"没有任何价值。
> 没有这一条，状态数会爆炸。

## 2.5 例：多源 BFS

**LeetCode 542. 01 矩阵**，<https://leetcode.cn/problems/01-matrix/>

> 求每个格子到最近的 0 的距离。

**技巧**：把**所有** 0 一次性放进队列作为第 0 层——一次 BFS 解决全部。

```python
from collections import deque


def update_matrix(mat):
    n, m = len(mat), len(mat[0])
    dist = [[-1] * m for _ in range(n)]
    q = deque()
    for i in range(n):
        for j in range(m):
            if mat[i][j] == 0:
                dist[i][j] = 0
                q.append((i, j))                # 全部 0 一起入队
    DIRS = ((-1, 0), (1, 0), (0, -1), (0, 1))
    while q:
        x, y = q.popleft()
        for dx, dy in DIRS:
            nx, ny = x + dx, y + dy
            if 0 <= nx < n and 0 <= ny < m and dist[nx][ny] < 0:
                dist[nx][ny] = dist[x][y] + 1
                q.append((nx, ny))
    return dist


print(update_matrix([[0, 0, 0], [0, 1, 0], [1, 1, 1]]))
# [[0, 0, 0], [0, 1, 0], [1, 2, 1]]
```

> **多源 BFS 是"n 次单源 BFS"的 n 倍加速**。看到"到最近的某类点的距离"就该想到它。

## 2.6 例：M12029: 水淹七军

**M12029: 水淹七军**，<http://cs101.openjudge.cn/practice/12029/>

> 在某点放水，水位等于放水点的高度；水向**高度严格低于当前水位**的相邻格流动，
> 问司令部是否被淹。（等高处水位升不上去，因此不算被淹。）

```python
from collections import deque


def flood_army(height, sources, hq):
    """height: 二维高度；sources: 放水点列表；hq: 司令部坐标。"""
    n, m = len(height), len(height[0])
    DIRS = ((-1, 0), (1, 0), (0, -1), (0, 1))
    water = [[-1] * m for _ in range(n)]        # 记录淹没该格的水位
    q = deque()
    for sx, sy in sources:
        if water[sx][sy] < height[sx][sy]:
            water[sx][sy] = height[sx][sy]
            q.append((sx, sy))
    while q:
        x, y = q.popleft()
        level = water[x][y]
        for dx, dy in DIRS:
            nx, ny = x + dx, y + dy
            if not (0 <= nx < n and 0 <= ny < m):
                continue
            if height[nx][ny] < level and water[nx][ny] < level:
                water[nx][ny] = level          # 水位更高才值得再扩展
                q.append((nx, ny))
    hx, hy = hq
    return water[hx][hy] >= 0


h = [[5, 2, 2],
     [4, 1, 2],
     [3, 3, 2]]
print(flood_army(h, [(0, 0)], (1, 1)))      # True   —— 从最高点 5 放水，低处全淹
print(flood_army(h, [(1, 1)], (0, 0)))      # False  —— 从最低点 1 放水，水上不去
```

---

# 3 Dijkstra：带权图的最短路

BFS 只在**边权全相同**时给出最短路。边权不同时用 **Dijkstra**：
把队列换成**优先队列（小根堆）**，每次取出当前距离最小的点。

```python
import heapq


def dijkstra(n, adj, src):
    """adj: [(邻居, 权重)] 的邻接表；返回 src 到各点的最短距离。"""
    INF = float('inf')
    dist = [INF] * n
    dist[src] = 0
    pq = [(0, src)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:                  # 过期条目，跳过
            continue
        for v, w in adj[u]:
            nd = d + w
            if nd < dist[v]:
                dist[v] = nd
                heapq.heappush(pq, (nd, v))
    return dist


adj = [[(1, 4), (2, 1)],
       [(3, 1)],
       [(1, 2), (3, 5)],
       []]
print(dijkstra(4, adj, 0))       # [0, 3, 1, 4]
```

**M20106: 走山路**，<http://cs101.openjudge.cn/practice/20106/>——
网格上每步的代价是高度差的绝对值，正是 Dijkstra：

```python
import heapq


def mountain_path(grid, start, goal):
    """grid 中 '#' 不可走，其余是高度；代价 = 相邻格高度差的绝对值。"""
    n, m = len(grid), len(grid[0])
    sx, sy = start
    gx, gy = goal
    if grid[sx][sy] == '#' or grid[gx][gy] == '#':
        return -1
    INF = float('inf')
    dist = [[INF] * m for _ in range(n)]
    dist[sx][sy] = 0
    pq = [(0, sx, sy)]
    DIRS = ((-1, 0), (1, 0), (0, -1), (0, 1))
    while pq:
        d, x, y = heapq.heappop(pq)
        if (x, y) == (gx, gy):
            return d
        if d > dist[x][y]:
            continue
        for dx, dy in DIRS:
            nx, ny = x + dx, y + dy
            if not (0 <= nx < n and 0 <= ny < m) or grid[nx][ny] == '#':
                continue
            nd = d + abs(grid[nx][ny] - grid[x][y])
            if nd < dist[nx][ny]:
                dist[nx][ny] = nd
                heapq.heappush(pq, (nd, nx, ny))
    return -1


g = [[1, 5, 9],
     [2, 3, 8],
     [4, 4, 7]]
print(mountain_path(g, (0, 0), (2, 2)))     # 6
```

> **Dijkstra 的两个坑**：(1) 必须用 `if d > dist[u]: continue` 跳过过期条目；
> (2) **不能有负权边**（负权用 Bellman-Ford，本课不展开）。

---

# 4 DFS 还是 BFS

| 需求 | 选择 |
| ---- | ---- |
| 最短步数（边权相同） | **BFS** |
| 最短代价（边权不同、非负） | **Dijkstra** |
| 是否连通 / 数连通块 | 都行（并查集也行） |
| 找出所有路径 / 方案 | **DFS（回溯）** |
| 判环 / 拓扑序 | DFS |
| 状态空间巨大、只要一个解 | BFS（先找到的就是最优） |

**一句话**：**要"最短"就 BFS，要"所有"就 DFS。**

**LeetCode 200. 岛屿数量**，<https://leetcode.cn/problems/number-of-islands/>
两种都行，写法几乎一样——只是把栈换成队列：

```python
from collections import deque


def num_islands(grid):
    if not grid:
        return 0
    n, m = len(grid), len(grid[0])
    g = [list(row) for row in grid]
    DIRS = ((-1, 0), (1, 0), (0, -1), (0, 1))
    cnt = 0
    for i in range(n):
        for j in range(m):
            if g[i][j] != '1':
                continue
            cnt += 1
            g[i][j] = '0'
            q = deque([(i, j)])
            while q:
                x, y = q.popleft()
                for dx, dy in DIRS:
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < n and 0 <= ny < m and g[nx][ny] == '1':
                        g[nx][ny] = '0'
                        q.append((nx, ny))
    return cnt


print(num_islands(["11000", "11000", "00100", "00011"]))    # 3
```

---

# 5 二分查找答案：最小化最大值

一类高频题型：**"求最小的最大值"或"求最大的最小值"**。
直接求很难，但**给定一个答案候选，判断它可行与否很容易**——于是对答案二分。

**判定函数必须是单调的**：若 x 可行，则所有比 x 更"宽松"的也可行。

## 5.1 例：河中跳房子

**M08210: 河中跳房子**，<http://cs101.openjudge.cn/practice/08210/>

> 河中有若干石头，移走最多 m 块，使剩下相邻石头间的**最小距离最大**。

```python
def river_hopscotch(L, m, rocks):
    """L: 河宽；m: 最多移走的石头数；rocks: 石头位置。"""
    stones = sorted(rocks) + [L]

    def feasible(gap):
        """能否让所有相邻间距 >= gap（移走不超过 m 块）？"""
        removed, last = 0, 0
        for s in stones:
            if s - last < gap:
                removed += 1               # 这块太近，移走
                if removed > m:
                    return False
            else:
                last = s
        return True

    lo, hi = 0, L
    while lo < hi:
        mid = (lo + hi + 1) // 2           # 求最大可行值，mid 上取整
        if feasible(mid):
            lo = mid
        else:
            hi = mid - 1
    return lo


print(river_hopscotch(25, 2, [2, 11, 14, 17, 21]))    # 4
```

> **`mid = (lo + hi + 1) // 2` 的加一不能少**：求"最大可行值"时，
> 若用 `(lo+hi)//2` 且 `lo = mid`，当 `hi = lo + 1` 时会死循环。
> **记法：`lo = mid` 就要上取整，`hi = mid` 就用下取整。**

## 5.2 例：月度开销

**M04135: 月度开销**，<http://cs101.openjudge.cn/practice/04135/>

> 把 n 天的开销分成 m 段连续区间，使**每段和的最大值最小**。

```python
def monthly_expense(costs, m):
    def feasible(limit):
        """每段和不超过 limit，最少要分几段？"""
        groups, cur = 1, 0
        for c in costs:
            if cur + c > limit:
                groups += 1
                cur = c
            else:
                cur += c
        return groups <= m

    lo, hi = max(costs), sum(costs)        # 下界：最大单日；上界：全部一段
    while lo < hi:
        mid = (lo + hi) // 2               # 求最小可行值，下取整
        if feasible(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo


print(monthly_expense([100, 400, 300, 100, 500, 101, 400], 5))   # 500
```

**二分答案的三步模板**：

1. 确定答案的**取值范围** [lo, hi]；
2. 写出**判定函数** `feasible(x)`，并确认它单调；
3. 二分（求最小用 `hi = mid`，求最大用 `lo = mid` + 上取整）。

---

# 6 网格 DP 与搜索的分界

同样是在网格上走，什么时候用 DP，什么时候用搜索？

| 条件 | 方法 |
| ---- | ---- |
| 只能**向右 / 向下**（无环，有拓扑序） | **DP** |
| 可以**四方向走**（有环） | **BFS / Dijkstra** |
| 求方案数、路径和最大值，且移动方向单调 | **DP** |
| 求最短步数 / 最少代价，移动方向任意 | **搜索** |

**例：最小路径和（只能右 / 下）→ DP**

```python
def min_path_sum(grid):
    n, m = len(grid), len(grid[0])
    dp = [[0] * m for _ in range(n)]
    dp[0][0] = grid[0][0]
    for j in range(1, m):
        dp[0][j] = dp[0][j - 1] + grid[0][j]
    for i in range(1, n):
        dp[i][0] = dp[i - 1][0] + grid[i][0]
    for i in range(1, n):
        for j in range(1, m):
            dp[i][j] = min(dp[i - 1][j], dp[i][j - 1]) + grid[i][j]
    return dp[n - 1][m - 1]


print(min_path_sum([[1, 3, 1], [1, 5, 1], [4, 2, 1]]))    # 7
```

> **判据是"有没有环"**：只能右 / 下的网格是个 DAG，状态之间有天然的计算顺序，所以能 DP。
> 四方向可走就有环，"先算谁"没有定论——只能用搜索（Dijkstra 本质上是在按距离顺序"制造"拓扑序）。

---

# 7 本周作业

| # | 题目 | 平台 / 编号 | 考点 |
| - | ---- | ---- | ---- |
| 1 | 岛屿数量 | LC 200 | BFS / DFS 连通块 |
| 2 | 01 矩阵 | LC 542 | 多源 BFS |
| 3 | 鸣人和佐助 | 04115 | 带状态 BFS |
| 4 | 拯救行动 | 04116 | BFS + 优先队列 |
| 5 | 水淹七军 | M12029 | BFS 模拟 |
| 6 | 河中跳房子 | M08210 | 二分答案 |
| 7 | 月度开销 | M04135 | 二分答案 |
| 8 | 走山路 | M20106 | Dijkstra |
| 9 | 寻宝 | 19930 | BFS |
| 10（选做） | 变换的迷宫 | T04129 | 带时间维的 BFS |
| 11（选做） | 小游戏 | T02802 | BFS + 转弯计数 |
| 12（选做） | 最小基因变化 | LC 433 | 字符串状态 BFS |

**思考题**：

1. BFS 若在**出队时**才标记 visited，会发生什么？构造一个例子说明队列会变多大。
2. 为什么无权图的 BFS 第一次访问就是最短距离？用归纳法证明。
3. 边权只有 0 和 1 的图，能否不用堆而用双端队列做到 O(V+E)？（提示：0 权走 `appendleft`）
4. 二分答案时，`feasible` 不单调会怎样？为"河中跳房子"构造一个错误的判定函数看结果。
5. 变换的迷宫（T04129）的状态要加一维什么？为什么普通的 `visited[x][y]` 不够用？

---

# 8 小结

1. 图的三种表示：邻接矩阵（稠密）、邻接表（稀疏，默认）、**隐式图**（网格题）。
2. BFS 三条铁律：**用 `deque`**、**入队时标记 visited**、**步数跟着节点走**。
3. **要"最短"就 BFS，要"所有"就 DFS**；边权不同用 **Dijkstra**（堆 + 过期条目跳过）。
4. **多源 BFS**：所有起点一起入队，一遍解决"到最近的某类点的距离"。
5. 带状态的 BFS：状态里加上剩余资源 / 时间 / 钥匙，剪枝条件是"不更优就不扩展"。
6. **二分答案**三步：定范围、写单调判定、二分。求最大用 `lo = mid` + 上取整。
7. 网格上**方向单调（无环）→ DP，方向任意（有环）→ 搜索**。

**下周预告**：回到计算机本身——**计算机原理（2/2）**：进程、内存、编译与执行，以及阶段综合练习。

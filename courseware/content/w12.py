# -*- coding: utf-8 -*-
"""第12周 动态规划、BFS 与相关练习"""

META = {
    'title': '第12周　动态规划、广度优先搜索（BFS）与相关练习',
    'subtitle': '图的表示 · BFS 模板与三条铁律 · 带状态 / 多源 BFS · Dijkstra · 二分答案',
    'footer': '计算概论（B） · 第12周 · 闫宏飞 · 2026 Fall',
    'info': ['北京大学　《计算概论（B）》',
             '主题与学习重点：动态规划、广度优先搜索（BFS）与相关练习。'],
}

SLIDES = [
    ('section', '第 1 节', '图与它的表示'),

    ('code', '三种表示', '''n = 4
edges = [(0, 1), (0, 2), (1, 3), (2, 3)]

# 1) 邻接矩阵：O(V^2) 空间，查边 O(1)。适合稠密图、小图
adj_mat = [[0] * n for _ in range(n)]
for u, v in edges:
    adj_mat[u][v] = adj_mat[v][u] = 1

# 2) 邻接表：O(V+E) 空间，遍历邻居最快 —— 本课默认用这个
adj = [[] for _ in range(n)]
for u, v in edges:
    adj[u].append(v); adj[v].append(u)

# 3) 隐式图：不存边，邻居由规则算出来 —— 网格题都是这一类
DIRS = ((-1, 0), (1, 0), (0, -1), (0, 1))
''', '本课绝大多数图论题是"隐式图"：迷宫、棋盘、状态转移'),

    ('key', '认出"这是个图"，往往就解决了一半问题。',
     '迷宫的格子是顶点，相邻可走是边；状态转移图也一样。'),

    ('section', '第 2 节', '广度优先搜索（BFS）'),

    ('ascii', '一层一层地扩展', r"""
   起点 s
     |
   +-+-+          第 1 层：距离 1
   a   b
   |   |
   c   d          第 2 层：距离 2

   关键性质：在无权图中，第一次访问到某个点时，
             走过的步数就是最短距离
"""),

    ('code', 'BFS 模板', '''from collections import deque


def bfs(start, goal, get_neighbors):
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
''', ''),

    ('key', 'BFS 三条铁律',
     '1) 用 deque 不用 list；2) 入队时就标记 visited；3) 步数跟着节点走。'),

    ('code', '迷宫最短路径：dist 数组兼作 visited', '''from collections import deque


def maze_shortest(grid, start, goal):
    n, m = len(grid), len(grid[0])
    sx, sy = start; gx, gy = goal
    if grid[sx][sy] == '#' or grid[gx][gy] == '#':
        return -1
    DIRS = ((-1, 0), (1, 0), (0, -1), (0, 1))
    dist = [[-1] * m for _ in range(n)]        # dist < 0 表示未访问
    dist[sx][sy] = 0
    q = deque([(sx, sy)])
    while q:
        x, y = q.popleft()
        if (x, y) == (gx, gy):
            return dist[x][y]
        for dx, dy in DIRS:
            nx, ny = x + dx, y + dy
            if (0 <= nx < n and 0 <= ny < m
                    and grid[nx][ny] != '#' and dist[nx][ny] < 0):
                dist[nx][ny] = dist[x][y] + 1
                q.append((nx, ny))
    return -1
''', '少开一个数组，也少一处出错的机会'),

    ('code', '04115 鸣人和佐助：带状态的 BFS', '''from collections import deque


def naruto(grid, T):
    n, m = len(grid), len(grid[0])
    sx = sy = gx = gy = -1
    for i in range(n):
        for j in range(m):
            if grid[i][j] == '@': sx, sy = i, j
            elif grid[i][j] == '+': gx, gy = i, j
    DIRS = ((-1, 0), (1, 0), (0, -1), (0, 1))
    best = [[-1] * m for _ in range(n)]        # 到达 (x,y) 时的最大剩余查克拉
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
            if nt < 0 or nt <= best[nx][ny]:   # 不更优就不扩展
                continue
            best[nx][ny] = nt
            q.append((nx, ny, nt, step + 1))
    return -1
''', '⭐ 状态设计是 BFS 题的全部难度。没有剪枝条件，状态数会爆炸'),

    ('code', 'LC 542 多源 BFS：所有起点一起入队', '''from collections import deque


def update_matrix(mat):
    n, m = len(mat), len(mat[0])
    dist = [[-1] * m for _ in range(n)]
    q = deque()
    for i in range(n):
        for j in range(m):
            if mat[i][j] == 0:
                dist[i][j] = 0
                q.append((i, j))                # 全部 0 一起入队，作为第 0 层
    DIRS = ((-1, 0), (1, 0), (0, -1), (0, 1))
    while q:
        x, y = q.popleft()
        for dx, dy in DIRS:
            nx, ny = x + dx, y + dy
            if 0 <= nx < n and 0 <= ny < m and dist[nx][ny] < 0:
                dist[nx][ny] = dist[x][y] + 1
                q.append((nx, ny))
    return dist


print(update_matrix([[0,0,0],[0,1,0],[1,1,1]]))
# [[0, 0, 0], [0, 1, 0], [1, 2, 1]]
''', '多源 BFS 是"n 次单源 BFS"的 n 倍加速。看到"到最近的某类点的距离"就想到它'),

    ('section', '第 3 节', 'Dijkstra：带权图的最短路'),

    ('code', 'Dijkstra 模板', '''import heapq


def dijkstra(n, adj, src):
    """adj: [(邻居, 权重)] 的邻接表。"""
    INF = float('inf')
    dist = [INF] * n
    dist[src] = 0
    pq = [(0, src)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:                  # ⚠️ 过期条目，必须跳过
            continue
        for v, w in adj[u]:
            nd = d + w
            if nd < dist[v]:
                dist[v] = nd
                heapq.heappush(pq, (nd, v))
    return dist


adj = [[(1, 4), (2, 1)], [(3, 1)], [(1, 2), (3, 5)], []]
print(dijkstra(4, adj, 0))       # [0, 3, 1, 4]
''', '⚠️ 两个坑：必须跳过过期条目；不能有负权边'),

    ('code', 'M20106 走山路：网格上的 Dijkstra', '''import heapq


def mountain_path(grid, start, goal):
    """代价 = 相邻格高度差的绝对值。"""
    n, m = len(grid), len(grid[0])
    sx, sy = start; gx, gy = goal
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


print(mountain_path([[1,5,9],[2,3,8],[4,4,7]], (0,0), (2,2)))     # 6
''', ''),

    ('table', 'DFS 还是 BFS', [
        ['需求', '选择'],
        ['最短步数（边权相同）', 'BFS'],
        ['最短代价（边权不同、非负）', 'Dijkstra'],
        ['是否连通 / 数连通块', '都行（并查集也行）'],
        ['找出所有路径 / 方案', 'DFS（回溯）'],
        ['判环 / 拓扑序', 'DFS'],
        ['状态空间巨大、只要一个解', 'BFS（先找到的就是最优）'],
    ], '一句话：要"最短"就 BFS，要"所有"就 DFS'),

    ('section', '第 4 节', '二分查找答案：最小化最大值'),

    ('key', '一类高频题型',
     '"求最小的最大值"或"求最大的最小值"：直接求很难，但判断一个候选可行与否很容易。'),

    ('code', 'M08210 河中跳房子：求最大可行值', '''def river_hopscotch(L, m, rocks):
    stones = sorted(rocks) + [L]

    def feasible(gap):
        """能否让所有相邻间距 >= gap（移走不超过 m 块）？"""
        removed, last = 0, 0
        for s in stones:
            if s - last < gap:
                removed += 1
                if removed > m:
                    return False
            else:
                last = s
        return True

    lo, hi = 0, L
    while lo < hi:
        mid = (lo + hi + 1) // 2           # ⚠️ 求最大可行值：上取整
        if feasible(mid):
            lo = mid
        else:
            hi = mid - 1
    return lo


print(river_hopscotch(25, 2, [2, 11, 14, 17, 21]))    # 4
''', '⚠️ 加一不能少：lo = mid 时若用下取整，hi = lo+1 会死循环'),

    ('code', 'M04135 月度开销：求最小可行值', '''def monthly_expense(costs, m):
    def feasible(limit):
        """每段和不超过 limit，最少要分几段？"""
        groups, cur = 1, 0
        for c in costs:
            if cur + c > limit:
                groups += 1; cur = c
            else:
                cur += c
        return groups <= m

    lo, hi = max(costs), sum(costs)        # 下界：最大单日；上界：全部一段
    while lo < hi:
        mid = (lo + hi) // 2               # ⚠️ 求最小可行值：下取整
        if feasible(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo


print(monthly_expense([100, 400, 300, 100, 500, 101, 400], 5))   # 500
''', '记法：lo = mid 就要上取整，hi = mid 就用下取整'),

    ('bullets', '二分答案三步模板', [
        '确定答案的**取值范围** [lo, hi]',
        '写出**判定函数** `feasible(x)`，并确认它**单调**',
        '二分（求最小用 `hi = mid`，求最大用 `lo = mid` + 上取整）',
        '⚠️ 判定函数不单调，二分就没有意义',
    ]),

    ('section', '第 5 节', '网格 DP 与搜索的分界'),

    ('table', '判据是"有没有环"', [
        ['条件', '方法'],
        ['只能向右 / 向下（无环，有拓扑序）', 'DP'],
        ['可以四方向走（有环）', 'BFS / Dijkstra'],
        ['求方案数、路径和最大值，且移动方向单调', 'DP'],
        ['求最短步数 / 最少代价，移动方向任意', '搜索'],
    ], 'Dijkstra 本质上是在按距离顺序"制造"拓扑序'),

    ('code', '最小路径和（只能右 / 下）-> DP', '''def min_path_sum(grid):
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
''', ''),

    ('table', '本周作业', [
        ['#', '题目', '编号', '考点'],
        ['1–2', '岛屿数量 / 01 矩阵', 'LC 200 / LC 542', 'BFS 连通块 / 多源 BFS'],
        ['3–4', '鸣人和佐助 / 拯救行动', '04115 / 04116', '带状态 BFS / BFS + 堆'],
        ['5', '水淹七军', 'M12029', 'BFS 模拟'],
        ['6–7', '河中跳房子 / 月度开销', 'M08210 / M04135', '二分答案'],
        ['8–9', '走山路 / 寻宝', 'M20106 / 19930', 'Dijkstra / BFS'],
        ['10–12（选做）', '变换的迷宫 / 小游戏 / 最小基因变化', 'T04129 / T02802 / LC 433', '多维状态'],
    ]),

    ('bullets', '小结', [
        '图的三种表示：邻接矩阵（稠密）、邻接表（稀疏，默认）、**隐式图**（网格题）',
        'BFS 三条铁律：**用 deque**、**入队时标记**、**步数跟着节点走**',
        '**要"最短"就 BFS，要"所有"就 DFS**；边权不同用 **Dijkstra**',
        '**多源 BFS**：所有起点一起入队；**带状态 BFS**：状态里加一维资源',
        '**二分答案**三步：定范围、写单调判定、二分（注意取整方向）',
        '网格上**方向单调（无环）→ DP，方向任意（有环）→ 搜索**',
    ]),

    ('key', '下周预告',
     '回到计算机本身：计算机原理（2/2）—— 进程、内存、编译与执行，以及阶段综合练习。'),
]

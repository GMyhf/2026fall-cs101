// 第 12 周 动态规划、广度优先搜索（BFS）与相关练习 —— 由 202611_ADS_W12_DP_BFS.md 整理成的讲课 PPT。
// 生成：cd courseware/pptx_builder && node decks/w12_dp_bfs.js ../202611_ADS_W12_DP_BFS.pptx
// 页上所有的运行结果都在 Python 3.12 下实跑核对过；改代码时连同结果一起改。
const path = require("path");
const { createDeck } = require("../lib");

const OUT = process.argv[2] || path.join(__dirname, "..", "out", "202611_ADS_W12_DP_BFS.pptx");

(async () => {
  const D = createDeck({ title: "计算概论（B）第 12 周 动态规划、广度优先搜索（BFS）与相关练习", author: "Hongfei Yan" });
  const {
    pres, C, FONT, MONO, runs, text, bullets, card, codeBlock, consoleBlock, callout, table,
    cells, arrowLabel, pill, numCircle, titleSlide, sectionSlide, content, summarySlide,
  } = D;

// ---- slides（顶层不缩进，避免改动模板字符串里的代码缩进）----
// =====================================================================
// Cover
titleSlide({
  kicker: "计算概论（B） · 第 12 周 · 2026 Fall",
  title: "动态规划、BFS 与相关练习",
  subtitle: "图的语言 · 最短步数 · 二分答案",
  topics: "图的三种表示 · BFS 模板与「层」的概念 · 最短步数问题\n多源 BFS · 带状态的 BFS · Dijkstra 与优先队列 · DFS 与 BFS 的选择\n二分查找答案（最小化最大值）· 网格 DP 与搜索的分界",
  footer: "Compiled by Hongfei Yan · 2026 Fall · github.com/GMyhf/2026fall-cs101",
});

// Three questions
{
  const s = content("?", "本周导引", "本周要回答三个问题");
  const qs = [
    ["为什么「最长路」没有最优子结构，「最短路」却有？", "最长简单路径的子问题最优解在父问题里**不可用**（会提前用掉顶点）；最短路的每一段**也是**最短路——这是问题的性质，不是图的性质。"],
    ["BFS 为什么能保证第一次到达就是最短？", "**一层一层地扩展**：访问顺序天然按距离排好序，第一次踩到某点，走过的步数就是它的最短距离。"],
    ["「求最大的最小值」这类题，为什么可以二分？", "直接求很难，但**给定一个候选答案，判断它可行很容易**，且判定单调——这正是二分的适用条件。"],
  ];
  qs.forEach((q, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.15, 2.85, 2.9, C.code);
    numCircle(s, i + 1, x + 0.2, 1.32, 0.46, C.dark);
    text(s, q[0], x + 0.2, 1.92, 2.5, 0.9, { fontSize: 12.5, bold: true, color: C.dark, margin: 0 });
    text(s, q[1], x + 0.2, 2.85, 2.5, 1.1, { fontSize: 10.5, margin: 0, lsm: 1.2 });
  });
}

// Roadmap
{
  const s = content("≡", "本周导引", "内容地图");
  const cols = [
    ["1  图与 BFS", ["1.1 术语 · 最优子结构再讨论", "1.2 三种表示：矩阵 / 表 / 隐式图", "2.1-2.3 核心思想 · 模板 · 迷宫", "2.4-2.6 带状态 · 多源 · 水淹七军"]],
    ["2  最短路与选择", ["3 Dijkstra：带权图的最短路", "3 应用：走山路", "4 DFS 还是 BFS：怎么选"]],
    ["3  二分答案 · 收尾", ["5.1-5.2 河中跳房子 · 月度开销", "6 网格 DP 与搜索的分界", "本周作业（12 题）· 思考题 · 小结"]],
  ];
  cols.forEach((c, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.15, 2.85, 3.9, i === 1 ? C.cream : C.code);
    text(s, c[0], x + 0.2, 1.3, 2.5, 0.45, { fontSize: 15.5, bold: true, color: C.dark, margin: 0 });
    bullets(s, c[1], x + 0.15, 1.95, 2.6, 2.9, { fontSize: 11.3, gap: 10 });
  });
}

// ============================ PART 1 ============================
sectionSlide("Part 1", "图的表示与 BFS", "术语 · 三种表示 · 核心思想与模板\n迷宫 · 带状态的 BFS · 多源 BFS");

// 1.1 terms
{
  const s = content("1.1", "1 图与它的表示", "术语");
  table(s, [
    ["术语", "含义"],
    ["顶点 V / 边 E", "图 G = (V, E)"],
    ["有向 / 无向", "边是否有方向"],
    ["带权", "边上有数值（距离、代价）"],
    ["度", "与顶点相连的边数（有向图分入度 / 出度）"],
    ["连通", "任意两点间有路径"],
    ["环", "起点与终点相同的路径"],
  ], 0.5, 1.1, 9.0, [2.4, 6.6], { fontSize: 13, rowH: 0.48 });
}

// 1.1 optimal substructure revisited
{
  const s = content("1.1", "1 图与它的表示", "回看第 10 周：最长路为什么没有最优子结构");
  callout(s, "一般图上的最长简单路径（不能重复经过顶点）", "设 s→t 的最长简单路径经过 v，它的前半段 s→v **不一定**是 s→v 的最长简单路径——走一条更长的 s→v 可能会把 v→t 要用的顶点提前用掉，反而走不到 t。子问题的最优解在父问题里**不可用**。", 0.5, 1.05, 9.0, 1.75, { fontSize: 12, fill: "FDF0EE", tcolor: C.bad, lsm: 1.2 });
  text(s, "而且这不是补一维能解决的：你要记住「已经用过哪些顶点」，那是 2^V 个状态，等于放弃了 DP。", 0.5, 2.9, 9.0, 0.45, { fontSize: 12, lsm: 1.15 });
  callout(s, "对照最短路", "BFS / Dijkstra 之所以成立，正是因为**最短路的每一段也都是最短路**。同一张图、只把「最长」换成「最短」，最优子结构就有了——**它确实是问题与状态的性质，不是「图」这个结构的性质。**", 0.5, 3.5, 9.0, 1.5, { fontSize: 12, fill: C.mint, tcolor: C.dark, lsm: 1.2 });
}

// 1.2 representations explicit
{
  const s = content("1.2", "1 图与它的表示", "三种表示：邻接矩阵与邻接表");
  codeBlock(s, `n = 4
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

print(adj)          # [[1, 2], [0, 3], [0, 3], [1, 2]]`, 0.5, 1.05, 9.0, 3.5, { fontSize: 11, lang: "py" });
}

// 1.2 representations implicit
{
  const s = content("1.2", "1 图与它的表示", "三种表示：隐式图");
  text(s, "**不存边，邻居由规则算出来**——网格题都是这一类。", 0.5, 1.0, 9.0, 0.35, { fontSize: 12.5 });
  codeBlock(s, `DIRS = ((-1, 0), (1, 0), (0, -1), (0, 1))


def neighbors(x, y, rows, cols):
    for dx, dy in DIRS:
        nx, ny = x + dx, y + dy
        if 0 <= nx < rows and 0 <= ny < cols:
            yield nx, ny


print(list(neighbors(0, 0, 3, 3)))     # [(1, 0), (0, 1)]`, 0.5, 1.4, 5.6, 2.2, { fontSize: 10.8, lang: "py" });
  callout(s, "本课绝大多数图论题是「隐式图」", "迷宫、棋盘、状态转移。**认出「这是个图」往往就解决了一半问题。**", 6.25, 1.4, 3.25, 2.2, { fontSize: 12, fill: C.mint, tcolor: C.dark, lsm: 1.2 });
}

// 2.1 BFS core idea
{
  const s = content("2.1", "2 广度优先搜索（BFS）", "核心思想");
  text(s, "**一层一层地扩展**：先访问所有距离起点 1 步的点，再访问 2 步的，以此类推。", 0.5, 1.0, 9.0, 0.4, { fontSize: 13, lsm: 1.15 });
  const y0 = 1.7;
  numCircle(s, "s", 4.3, y0, 0.42, C.dark);
  s.addShape(pres.shapes.LINE, { x: 3.7, y: y0 + 0.42, w: -0.7, h: 0.55, line: { color: C.green, width: 1.5, endArrowType: "triangle" } });
  s.addShape(pres.shapes.LINE, { x: 4.7, y: y0 + 0.42, w: 0.7, h: 0.55, line: { color: C.green, width: 1.5, endArrowType: "triangle" } });
  numCircle(s, "a", 2.8, y0 + 1.1, 0.4, C.green);
  numCircle(s, "b", 5.0, y0 + 1.1, 0.4, C.green);
  text(s, "第 1 层：距离 1", 5.6, y0 + 1.15, 2.5, 0.32, { fontSize: 11.5, color: C.green, margin: 0 });
  s.addShape(pres.shapes.LINE, { x: 3.0, y: y0 + 1.5, w: 0, h: 0.55, line: { color: C.gold, width: 1.5, endArrowType: "triangle" } });
  s.addShape(pres.shapes.LINE, { x: 5.2, y: y0 + 1.5, w: 0, h: 0.55, line: { color: C.gold, width: 1.5, endArrowType: "triangle" } });
  numCircle(s, "c", 2.8, y0 + 2.15, 0.4, C.goldText);
  numCircle(s, "d", 5.0, y0 + 2.15, 0.4, C.goldText);
  text(s, "第 2 层：距离 2", 5.6, y0 + 2.2, 2.5, 0.32, { fontSize: 11.5, color: C.goldText, margin: 0 });
  callout(s, "BFS 的关键性质", "在**无权图**（或所有边权相同）中，**第一次访问到某个点时，走过的步数就是最短距离**。", 0.5, 4.3, 9.0, 0.75, { fontSize: 12.5, fill: C.mint, tcolor: C.dark, lsm: 1.15 });
}

// 2.2 BFS template
{
  const s = content("2.2", "2 广度优先搜索（BFS）", "模板");
  codeBlock(s, `from collections import deque


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
    return -1`, 0.5, 1.05, 5.6, 3.65, { fontSize: 9.6, lang: "py" });
  callout(s, "三条铁律", [
    "用 `deque` 不用 `list`：`list.pop(0)` 是 O(n)，会把 O(V+E) 拖成 O(V²)。",
    "**入队时就标记 visited**，不是出队时。否则同一个点会被多次入队，队列爆炸。",
    "步数跟着节点走（存在队列元素里），或者按「层」整批处理。",
  ], 6.25, 1.05, 3.25, 3.65, { fontSize: 10.8, fill: C.mint, tcolor: C.dark, gap: 8 });
}

// 2.2 BFS by level
{
  const s = content("2.2", "2 广度优先搜索（BFS）", "按层处理的写法（需要知道「第几层」时更清晰）");
  codeBlock(s, `def bfs_by_level(start, goal, get_neighbors):
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
    return -1`, 0.5, 1.05, 9.0, 3.65, { fontSize: 10.3, lang: "py" });
}

// 2.3 maze
{
  const s = content("2.3", "2 广度优先搜索（BFS）", "例：迷宫最短路径");
  codeBlock(s, `def maze_shortest(grid, start, goal):
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
    return -1`, 0.5, 1.02, 5.7, 3.7, { fontSize: 8.6, lang: "py" });
  consoleBlock(s, "maze_shortest(maze, (0,0), (4,4)) -> 8\nmaze_shortest([\"..\",\"##\"], (0,0), (1,1)) -> -1", 6.3, 1.02, 3.2, 1.35, 9.5);
  callout(s, "少开一个数组", "用 `dist` 数组**同时充当** `visited`：`dist[i][j] < 0` 表示未访问。这样少开一个数组，也少一处出错的机会。", 6.3, 2.5, 3.2, 2.22, { fontSize: 10.8, fill: C.mint, tcolor: C.dark, lsm: 1.2 });
}

// 2.4 stateful BFS
{
  const s = content("2.4", "2 广度优先搜索（BFS）", "例：带状态的 BFS —— 鸣人和佐助");
  text(s, "**04115**——网格中 `#` 是敌人，鸣人有 T 点查克拉，消灭一个花 1 点。求到佐助的最短时间。**关键**：状态不再是 `(x,y)`，而是 **`(x, y, 剩余查克拉)`**。", 0.5, 1.0, 9.0, 0.65, { fontSize: 11.2, lsm: 1.15 });
  codeBlock(s, `def naruto(grid, T):
    n, m = len(grid), len(grid[0])
    sx = sy = gx = gy = -1
    for i in range(n):
        for j in range(m):
            if grid[i][j] == '@': sx, sy = i, j
            elif grid[i][j] == '+': gx, gy = i, j
    DIRS = ((-1, 0), (1, 0), (0, -1), (0, 1))
    best = [[-1] * m for _ in range(n)]      # best[x][y] = 到达时曾有过的最大剩余查克拉
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
            if nt < 0 or nt <= best[nx][ny]:  # 查克拉不够，或没有更优 -> 剪枝
                continue
            best[nx][ny] = nt
            q.append((nx, ny, nt, step + 1))
    return -1`, 0.5, 1.65, 9.0, 3.35, { fontSize: 7.8, lang: "py" });
}

// 2.4 stateful BFS callout page
{
  const s = content("2.4", "2 广度优先搜索（BFS）", "状态设计是 BFS 题的全部难度");
  codeBlock(s, `g = ["@####",
     ".#..+",
     "....."]
print(naruto(g, 2))       # 5  —— 有 2 点查克拉，可以直接凿墙走近路
print(naruto(g, 0))       # 7  —— 没有查克拉，只能绕开所有 '#'`, 0.5, 1.1, 9.0, 1.4, { fontSize: 11.5, lang: "py" });
  callout(s, "剪枝条件的含义", "`nt <= best[nx][ny]`：「以更少的查克拉、不更早地到达同一格」没有任何价值。**没有这一条，状态数会爆炸**——这正是把 `(x,y)` 扩展成 `(x,y,剩余查克拉)` 之后必须补的一刀。", 0.5, 2.65, 9.0, 1.65, { fontSize: 12.5, fill: C.mint, tcolor: C.dark, lsm: 1.2 });
}

// 2.5 multi-source BFS
{
  const s = content("2.5", "2 广度优先搜索（BFS）", "例：多源 BFS");
  text(s, "**LeetCode 542. 01 矩阵**——求每个格子到最近的 0 的距离。**技巧**：把**所有** 0 一次性放进队列作为第 0 层——一次 BFS 解决全部。", 0.5, 1.0, 9.0, 0.6, { fontSize: 11.5, lsm: 1.15 });
  codeBlock(s, `def update_matrix(mat):
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
    return dist`, 0.5, 1.6, 9.0, 2.7, { fontSize: 9.6, lang: "py" });
  callout(s, "多源 BFS 是「n 次单源 BFS」的 n 倍加速", "看到「到最近的某类点的距离」就该想到它。", 0.5, 4.4, 9.0, 0.65, { fontSize: 11.5, fill: C.mint, tcolor: C.dark, gap: 0 });
}

// 2.6 flood army
{
  const s = content("2.6", "2 广度优先搜索（BFS）", "例：水淹七军");
  text(s, "**M12029**——在某点放水，水位等于放水点高度；水向**高度严格低于当前水位**的相邻格流动，问司令部是否被淹。", 0.5, 1.0, 9.0, 0.5, { fontSize: 11.5, lsm: 1.15 });
  codeBlock(s, `def flood_army(height, sources, hq):
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
    return water[hx][hy] >= 0`, 0.5, 1.6, 9.0, 3.1, { fontSize: 9, lang: "py" });
}

// ============================ PART 2 ============================
sectionSlide("Part 2", "最短路与搜索选择", "Dijkstra：带权图的最短路\nDFS 还是 BFS：要「最短」就 BFS，要「所有」就 DFS");

// 3 dijkstra
{
  const s = content("3", "3 Dijkstra", "带权图的最短路");
  text(s, "BFS 只在**边权全相同**时给出最短路。边权不同时用 **Dijkstra**：把队列换成**优先队列（小根堆）**，每次取出当前距离最小的点。", 0.5, 1.0, 9.0, 0.6, { fontSize: 12, lsm: 1.15 });
  codeBlock(s, `def dijkstra(n, adj, src):
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


adj = [[(1, 4), (2, 1)], [(3, 1)], [(1, 2), (3, 5)], []]
print(dijkstra(4, adj, 0))       # [0, 3, 1, 4]`, 0.5, 1.65, 9.0, 3.1, { fontSize: 10, lang: "py" });
}

// 3 mountain path
{
  const s = content("3", "3 Dijkstra", "应用：走山路");
  text(s, "**M20106**——网格上每步的代价是高度差的绝对值，正是 Dijkstra：", 0.5, 1.0, 9.0, 0.35, { fontSize: 12 });
  codeBlock(s, `def mountain_path(grid, start, goal):
    n, m = len(grid), len(grid[0])
    sx, sy = start
    gx, gy = goal
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


print(mountain_path([[1, 5, 9], [2, 3, 8], [4, 4, 7]], (0, 0), (2, 2)))     # 6`, 0.5, 1.35, 5.6, 3.65, { fontSize: 7.8, lang: "py" });
  callout(s, "Dijkstra 的两个坑", "① 必须用 `if d > dist[u]: continue` 跳过过期条目；② **不能有负权边**（负权用 Bellman-Ford，本课不展开）。", 6.25, 1.4, 3.25, 1.8, { fontSize: 11, fill: "FDF0EE", tcolor: C.bad, lsm: 1.2 });
}

// 4 dfs vs bfs
{
  const s = content("4", "4 DFS 还是 BFS", "怎么选");
  table(s, [
    ["需求", "选择"],
    ["最短步数（边权相同）", { t: "BFS", bold: true, color: C.ok }],
    ["最短代价（边权不同、非负）", { t: "Dijkstra", bold: true, color: C.ok }],
    ["是否连通 / 数连通块", "都行（并查集也行）"],
    ["找出所有路径 / 方案", { t: "DFS（回溯）", bold: true }],
    ["判环 / 拓扑序", "DFS"],
    ["状态空间巨大、只要一个解", "BFS（先找到的就是最优）"],
  ], 0.5, 1.05, 9.0, [5.0, 4.0], { fontSize: 12, rowH: 0.44 });
  callout(s, "一句话", "**要「最短」就 BFS，要「所有」就 DFS。**", 0.5, 4.15, 9.0, 0.65, { fontSize: 14, fill: C.mint, tcolor: C.dark });
}

// 4 num islands
{
  const s = content("4", "4 DFS 还是 BFS", "例：岛屿数量——两种都行，写法几乎一样");
  text(s, "**LeetCode 200**——只是把栈换成队列：", 0.5, 1.0, 9.0, 0.3, { fontSize: 12 });
  codeBlock(s, `def num_islands(grid):
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


print(num_islands(["11000", "11000", "00100", "00011"]))    # 3`, 0.5, 1.4, 9.0, 3.4, { fontSize: 9.6, lang: "py" });
}

// ============================ PART 3 ============================
sectionSlide("Part 3", "二分答案与网格 DP", "求最小的最大值 / 最大的最小值：判定单调就能二分\n网格上有没有环，决定了用 DP 还是搜索");

// 5 binary search intro
{
  const s = content("5", "5 二分查找答案", "最小化最大值：一类高频题型");
  callout(s, "什么时候能二分答案", "一类高频题型：**「求最小的最大值」或「求最大的最小值」**。直接求很难，但**给定一个答案候选，判断它可行与否很容易**——于是对答案二分。", 0.5, 1.1, 9.0, 1.3, { fontSize: 14, fill: C.mint, tcolor: C.dark, lsm: 1.25 });
  callout(s, "判定函数必须单调", "若答案 x 可行，则所有比 x 更「宽松」的也可行——这是二分能收敛到正确答案的前提。判定函数不单调，二分就会给出错误结果。", 0.5, 2.55, 9.0, 1.3, { fontSize: 13, fill: "FDF0EE", tcolor: C.bad, lsm: 1.2 });
  text(s, "下面两个例题分别对应「求最大」和「求最小」两种写法。", 0.5, 4.0, 9.0, 0.4, { fontSize: 12.5 });
}

// 5.1 river hopscotch
{
  const s = content("5.1", "5 二分查找答案", "例：河中跳房子（求最大的最小值）");
  text(s, "**M08210**——移走最多 m 块石头，使剩下相邻石头间的**最小距离最大**。", 0.5, 1.0, 9.0, 0.4, { fontSize: 11.5, lsm: 1.15 });
  codeBlock(s, `def river_hopscotch(L, m, rocks):
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


print(river_hopscotch(25, 2, [2, 11, 14, 17, 21]))    # 4`, 0.5, 1.45, 9.0, 3.15, { fontSize: 9, lang: "py" });
}

// 5.1 callout page for the +1 trap
{
  const s = content("5.1", "5 二分查找答案", "⚠️ 求最大可行值时，mid 的加一不能少");
  callout(s, "为什么", "`mid = (lo + hi + 1) // 2`：求「最大可行值」时，若用 `(lo+hi)//2` 且 `lo = mid`，当 `hi = lo + 1` 时 mid 恒等于 lo，会**死循环**。", 0.5, 1.1, 9.0, 1.3, { fontSize: 13.5, fill: "FDF0EE", tcolor: C.bad, lsm: 1.2 });
  callout(s, "记法", "**`lo = mid` 就要上取整，`hi = mid` 就用下取整。**", 0.5, 2.6, 9.0, 0.75, { fontSize: 15, fill: C.mint, tcolor: C.dark });
}

// 5.2 monthly expense
{
  const s = content("5.2", "5 二分查找答案", "例：月度开销（求最小的最大值）");
  text(s, "**M04135**——把 n 天的开销分成 m 段连续区间，使**每段和的最大值最小**。", 0.5, 1.0, 9.0, 0.4, { fontSize: 11.5, lsm: 1.15 });
  codeBlock(s, `def monthly_expense(costs, m):
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


print(monthly_expense([100, 400, 300, 100, 500, 101, 400], 5))   # 500`, 0.5, 1.4, 9.0, 2.95, { fontSize: 7.4, lang: "py" });
  callout(s, "二分答案的三步模板", "①定范围 [lo,hi]；②写判定函数 `feasible(x)` 并确认单调；③二分（求最小用 `hi=mid`，求最大用 `lo=mid` + 上取整）。", 0.5, 4.45, 9.0, 0.65, { fontSize: 10, fill: C.mint, tcolor: C.dark, lsm: 1.1 });
}

// 6 grid dp vs search
{
  const s = content("6", "6 网格 DP 与搜索的分界", "同样是在网格上走，什么时候用哪个？");
  table(s, [
    ["条件", "方法"],
    ["只能向右 / 向下（无环，有拓扑序）", { t: "DP", bold: true, color: C.ok }],
    ["可以四方向走（有环）", { t: "BFS / Dijkstra", bold: true, color: C.ok }],
    ["求方案数、路径和最大值，且移动方向单调", { t: "DP", bold: true }],
    ["求最短步数 / 最少代价，移动方向任意", { t: "搜索", bold: true }],
  ], 0.5, 1.1, 9.0, [5.6, 3.4], { fontSize: 12.5, rowH: 0.62 });
  callout(s, "判据是「有没有环」", "只能右 / 下的网格是个 DAG，状态之间有天然的计算顺序，所以能 DP。四方向可走就有环，「先算谁」没有定论——只能用搜索。", 0.5, 3.75, 9.0, 1.1, { fontSize: 12, fill: C.mint, tcolor: C.dark, lsm: 1.2 });
}

// 6 min path sum
{
  const s = content("6", "6 网格 DP 与搜索的分界", "例：最小路径和（只能右 / 下 → DP）");
  codeBlock(s, `def min_path_sum(grid):
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


print(min_path_sum([[1, 3, 1], [1, 5, 1], [4, 2, 1]]))    # 7`, 0.5, 1.1, 9.0, 2.55, { fontSize: 10.5, lang: "py" });
  callout(s, "Dijkstra 本质上也是在“制造”拓扑序", "四方向可走的网格里没有天然的计算顺序；Dijkstra 按距离从小到大出队，相当于在运行时按距离顺序把拓扑序造出来——这也是它不能有负权边的原因。", 0.5, 3.8, 9.0, 1.1, { fontSize: 11.5, lsm: 1.2 });
}

// ============================ TAIL ============================
// Homework
{
  const s = content("✎", "本周练习", "本周作业");
  table(s, [
    ["#", "题目", "平台 / 编号", "考点"],
    ["1", "岛屿数量", { t: "LC 200", mono: true }, "BFS / DFS 连通块"],
    ["2", "01 矩阵", { t: "LC 542", mono: true }, "多源 BFS"],
    ["3", "鸣人和佐助", { t: "04115", mono: true }, "带状态 BFS"],
    ["4", "拯救行动", { t: "04116", mono: true }, "BFS + 优先队列"],
    ["5", "水淹七军", { t: "M12029", mono: true }, "BFS 模拟"],
    ["6", "河中跳房子", { t: "M08210", mono: true }, "二分答案"],
    ["7", "月度开销", { t: "M04135", mono: true }, "二分答案"],
    ["8", "走山路", { t: "M20106", mono: true }, "Dijkstra"],
    ["9", "寻宝", { t: "19930", mono: true }, "BFS"],
    [{ t: "10（选做）", color: C.goldText }, "变换的迷宫", { t: "T04129", mono: true }, "带时间维的 BFS"],
    [{ t: "11（选做）", color: C.goldText }, "小游戏", { t: "T02802", mono: true }, "BFS + 转弯计数"],
    [{ t: "12（选做）", color: C.goldText }, "最小基因变化", { t: "LC 433", mono: true }, "字符串状态 BFS"],
  ], 0.5, 1.0, 9.0, [1.1, 2.9, 1.7, 3.3], { fontSize: 10.6, rowH: 0.28, tight: true });
  text(s, "E / M / T 开头与纯数字编号：cs101.openjudge.cn；LC：leetcode.cn。", 0.5, 4.72, 9, 0.28, { fontSize: 10, color: C.muted, margin: 0 });
}

// Thinking questions
{
  const s = content("?", "本周练习 · 思考题", "思考题");
  const qs = [
    "BFS 若在出队时才标记 visited，会发生什么？构造一个例子说明队列会变多大。",
    "为什么无权图的 BFS 第一次访问就是最短距离？用归纳法证明。",
    "边权只有 0 和 1 的图，能否不用堆而用双端队列做到 O(V+E)？（提示：0 权走 appendleft）",
    "二分答案时，`feasible` 不单调会怎样？为「河中跳房子」构造一个错误的判定函数看结果。",
    "变换的迷宫（T04129）的状态要加一维什么？为什么普通的 `visited[x][y]` 不够用？",
  ];
  qs.forEach((q, i) => {
    const y = 1.05 + i * 0.8;
    card(s, 0.5, y, 9.0, 0.68, i % 2 ? C.cream : C.code);
    numCircle(s, i + 1, 0.68, y + 0.15, 0.38, C.dark);
    s.addText(runs(q, { color: C.text }), { x: 1.25, y: y + 0.05, w: 8.05, h: 0.58, fontFace: FONT, fontSize: 12, margin: 0, isTextBox: true, valign: "middle", lineSpacingMultiple: 1.05 });
  });
}

summarySlide("本周小结", [
  ["图的表示", "邻接矩阵（稠密）、邻接表（稀疏，默认）、**隐式图**（网格题）。"],
  ["BFS 三条铁律", "**用 `deque`**、**入队时标记 visited**、**步数跟着节点走**。"],
  ["怎么选", "**要「最短」就 BFS，要「所有」就 DFS**；边权不同用 **Dijkstra**（堆 + 过期条目跳过）。"],
  ["多源 · 带状态", "多源 BFS 一遍解决「到最近的某类点的距离」；带状态 BFS 剪枝条件是「不更优就不扩展」。"],
  ["二分答案", "三步：定范围、写判定、二分；**无环网格 → DP，有环 → 搜索**。"],
]);

// Next week
{
  const s = sectionSlide("下周预告", "计算机原理（2/2）", "回到计算机本身：进程、内存、编译与执行\n以及阶段综合练习");
}

  await D.save(OUT);
})().catch((e) => { console.error(e); process.exit(1); });

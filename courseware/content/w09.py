# -*- coding: utf-8 -*-
"""第9周 递归、回溯与并查集"""

META = {
    'title': '第9周　递归、回溯与并查集',
    'subtitle': '回溯模板与三大形态 · 剪枝 · 八皇后与马走日 · Flood Fill · 并查集',
    'footer': '计算概论（B） · 第9周 · 闫宏飞 · 2026 Fall',
    'info': ['北京大学　《计算概论（B）》',
             '主题与学习重点：递归、回溯与并查集。'],
}

SLIDES = [
    ('section', '第 1 节', '回溯法'),

    ('ascii', '回溯 = DFS + 撤销', r"""
              [ ]
         /     |     \
      [1]     [2]     [3]
     /   \    /  \    /  \
  [1,2] [1,3] ...      ...

   在解空间树上深度优先地搜索，走不通就退回上一步换一个选择
"""),

    ('code', '通用模板 —— 本周所有题都是它的变形', '''def backtrack(path, choices):
    if 满足结束条件:
        result.append(path[:])          # ⚠️ 拷贝
        return
    for choice in choices:
        if 不合法:
            continue                     # 剪枝
        做出选择(choice)                  # 修改状态
        backtrack(path, 新的choices)
        撤销选择(choice)                  # 恢复状态
''', '三要素：路径（已做的选择）、选择列表（当前还能做什么）、结束条件'),

    ('code', '形态一：子集（LC 78）', '''def subsets(nums):
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
''', ''),

    ('code', '形态二：组合总和（LC 39，可重复使用）', '''def combination_sum(candidates, target):
    res, path = [], []
    candidates = sorted(candidates)

    def dfs(start, rest):
        if rest == 0:
            res.append(path[:]); return
        for i in range(start, len(candidates)):
            if candidates[i] > rest:     # 剪枝：排序后，后面的更大，直接停
                break
            path.append(candidates[i])
            dfs(i, rest - candidates[i]) # i 而不是 i+1：可重复使用
            path.pop()

    dfs(0, target)
    return res


print(combination_sum([2, 3, 6, 7], 7))     # [[2, 2, 3], [7]]
''', '⭐ break 而不是 continue —— 这一个字的差别，常常就是 AC 与 TLE 的差别'),

    ('code', '形态三：带重复元素的去重排列', '''def permute_unique(nums):
    nums = sorted(nums)                  # 先排序，让相同元素相邻
    res, path, used = [], [], [False] * len(nums)

    def dfs():
        if len(path) == len(nums):
            res.append(path[:]); return
        for i in range(len(nums)):
            if used[i]:
                continue
            # 去重：与前一个相同、且前一个在本层还没被用过 -> 跳过
            if i > 0 and nums[i] == nums[i - 1] and not used[i - 1]:
                continue
            used[i] = True; path.append(nums[i])
            dfs()
            path.pop(); used[i] = False

    dfs()
    return res


print(permute_unique([1, 1, 2]))         # [[1, 1, 2], [1, 2, 1], [2, 1, 1]]
''', '记法：同一层里，相同的数只允许第一个被选'),

    ('table', '三大形态靠递归参数区分', [
        ['形态', '递归时传', '典型题'],
        ['子集', 'dfs(i + 1)', 'LC 78'],
        ['组合（不可重复用）', 'dfs(i + 1)', 'LC 77'],
        ['组合（可重复用）', 'dfs(i)', 'LC 39'],
        ['排列', '从 0 开始 + used[]', '02748'],
    ]),

    ('bullets', '剪枝：让指数变得可行', [
        '**可行性剪枝**：当前选择已违反约束 → 立即 `continue` / `return`',
        '**最优性剪枝**：当前部分解已经比已知最优差 → 放弃',
        '**顺序剪枝**：排序后，一旦不可行，后面的都不可行 → `break`',
        '回溯的复杂度本质是指数级的，**剪枝决定了它能不能跑完**',
    ]),

    ('code', '02754 八皇后：三个集合记录占用', '''def solve_queens(n=8):
    res, path = [], []
    cols, diag, anti = set(), set(), set()

    def dfs(row):                             # 逐行放置，自动保证不同行
        if row == n:
            res.append(tuple(path)); return
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
print(len(sols))                              # 92
print(''.join(map(str, sols[0])))             # 15863724
''', ''),

    ('ascii', '为什么用 row - c 和 row + c', r"""
   同一条 "\\" 对角线上，row - c 恒定
   同一条 "/" 对角线上，row + c 恒定

           c=0   c=1   c=2
    r=0     0    -1    -2      <- row - c
    r=1     1     0    -1
    r=2     2     1     0
"""),

    ('code', '04123 马走日：回溯 + 状态还原', '''KNIGHT = ((-2, -1), (-2, 1), (-1, -2), (-1, 2),
          (1, -2), (1, 2), (2, -1), (2, 1))


def knight_tours(n, m, sx, sy):
    visited = [[False] * m for _ in range(n)]
    visited[sx][sy] = True
    total, count = n * m, 0

    def dfs(x, y, step):
        nonlocal count
        if step == total:
            count += 1; return
        for dx, dy in KNIGHT:
            nx, ny = x + dx, y + dy
            if 0 <= nx < n and 0 <= ny < m and not visited[nx][ny]:
                visited[nx][ny] = True
                dfs(nx, ny, step + 1)
                visited[nx][ny] = False        # 回溯
    dfs(sx, sy, 1)
    return count


print(knight_tours(5, 4, 0, 0), knight_tours(3, 3, 0, 0))    # 32 0
''', '⚠️ visited[nx][ny] = False 这一行就是"回溯"。忘了它，答案永远是 0 或 1'),

    ('code', '02386 Lake Counting：Flood Fill 用显式栈', '''def count_lakes(grid):
    n, m = len(grid), len(grid[0])
    g = [list(row) for row in grid]
    DIRS8 = tuple((di, dj) for di in (-1, 0, 1) for dj in (-1, 0, 1)
                  if (di, dj) != (0, 0))

    def flood(i, j):
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
                flood(i, j); cnt += 1
    return cnt
''', '为什么写成迭代：100x100 网格递归深度可达 10^4，评测机上有爆栈风险'),

    ('section', '第 2 节', '并查集（DSU）'),

    ('table', '它解决什么问题', [
        ['操作', '语义'],
        ['find(x)', 'x 属于哪个集合（返回代表元）'],
        ['union(x, y)', '把 x 和 y 所在的两个集合合并'],
        ['典型场景', '判连通、判环、等价类划分、亲戚关系'],
    ]),

    ('code', '带路径压缩 + 按大小合并的实现', '''class DSU:
    """单次操作近似 O(alpha(n))，alpha 是反阿克曼函数，实际上 <= 4。"""

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
''', 'find 写成迭代两趟，而不是递归 —— n=10^5 时递归版可能爆栈'),

    ('code', '两个直接应用：数连通块 / 判环', '''# 02524 宗教信仰：就是数连通块个数
def max_religions(n, pairs):
    d = DSU(n)
    for a, b in pairs:
        d.union(a, b)
    return d.count


# 判环：union 返回 False 表示这两点本已连通，这条边构成环
def has_cycle(n, edges):
    d = DSU(n)
    for a, b in edges:
        if not d.union(a, b):
            return True
    return False


print(max_religions(10, [(0, 1), (1, 2), (3, 4)]))      # 7
print(has_cycle(3, [(0, 1), (1, 2)]),
      has_cycle(3, [(0, 1), (1, 2), (2, 0)]))           # False True
''', ''),

    ('code', '01182 食物链：扩展域并查集（最难的一道）', '''def food_chain(n, statements):
    """把每个动物拆成 3 个节点：x 同类域、x+n 猎物域、x+2n 天敌域。"""
    d = DSU(3 * n)
    lies = 0
    for kind, x, y in statements:
        if x < 1 or x > n or y < 1 or y > n:
            lies += 1; continue
        x -= 1; y -= 1
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
''', '关键：想清楚"x 吃 y"意味着三组关系同时成立'),

    ('table', '并查集的复杂度', [
        ['实现', 'find 摊还'],
        ['朴素', 'O(n) 最坏'],
        ['仅路径压缩', 'O(log n)'],
        ['仅按秩合并', 'O(log n)'],
        ['两者都用', 'O(alpha(n)) ≈ O(1)'],
    ], '对任何现实中的 n，alpha(n) <= 4 —— 所以并查集可以当 O(1) 用'),

    ('table', 'DFS / BFS 还是并查集', [
        ['需求', 'DFS / BFS', '并查集'],
        ['数连通块', '✅', '✅'],
        ['动态加边后查询连通性', '❌ 每次要重跑', '✅ 天生支持'],
        ['求路径本身', '✅', '❌'],
        ['求最短路径', '✅ BFS', '❌'],
        ['判无向图有无环', '✅', '✅ 更简单'],
    ], '只问"连不连通 / 分几组"且边一条条加进来 -> 并查集；要路径、距离 -> DFS/BFS'),

    ('table', '本周作业', [
        ['#', '题目', '编号', '考点'],
        ['1–2', '八皇后 / 马走日', '02754 / 04123', '回溯 + 剪枝 / 状态还原'],
        ['3–4', 'Lake Counting / 晶矿的个数', '02386 / M05585', 'Flood Fill'],
        ['5', '宗教信仰', '02524', '并查集数连通块'],
        ['6–7', '子集 / 组合总和', 'LC 78 / LC 39', '回溯形态'],
        ['8', '一种等价类划分问题', 'M29982', '并查集'],
        ['9–11（选做）', '食物链 / N 皇后 / 单词搜索', 'T01182 / LC 51 / LC 79', '综合'],
    ]),

    ('bullets', '小结', [
        '回溯 = **DFS + 撤销**；两个必犯错误仍是**忘拷贝**和**忘还原**',
        '三大形态靠递归参数区分；**剪枝决定回溯能不能跑完**（`break` 而非 `continue`）',
        '八皇后用 `col` / `row-c` / `row+c` 三个集合；Flood Fill 一律用**显式栈或队列**',
        '并查集 = **路径压缩 + 按大小合并**，摊还近 O(1)；`find` 写迭代版防爆栈',
        '`union` 返回 `False` 就是"判环"',
    ]),

    ('key', '下周预告',
     '进入 11 月的核心内容：区间问题与动态规划入门。'),
]

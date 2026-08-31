# -*- coding: utf-8 -*-
"""第14周 AI 素养、12 月月考讲评与综合复习"""

META = {
    'title': '第14周　AI 素养、12 月月考讲评与综合复习',
    'subtitle': 'LLM 原理 · 幻觉与验证 · 提示词 · 月考四题讲评与错误归因 · 复习清单',
    'footer': '计算概论（B） · 第14周 · 闫宏飞 · 2026 Fall',
    'info': ['北京大学　《计算概论（B）》',
             '主题与学习重点：AI 素养、12 月月考讲评与综合复习。'],
}

SLIDES = [
    ('section', '第 1 节', 'AI 素养'),

    ('ascii', '大语言模型在做什么', r"""
   输入: "计算概论这门课主要用"
                |
   模型给出下一个 token 的概率分布:
       "Python"  0.62
       "C++"     0.18
       "Java"    0.05
        ...
                |
   采样一个 -> "Python" -> 拼回输入 -> 再预测下一个
""", '没有"理解"，只有"在海量文本上学到的统计规律"'),

    ('bullets', '四个关键部件', [
        '**分词 Tokenization**：文字切成 token（英文 1 token ≈ 0.75 词，中文 1 字 ≈ 1–2 token）',
        '- "上下文窗口 128K"说的是 **token 数**，不是字数',
        '**词向量 Embedding**：每个 token 映射成高维向量，**语义相近 = 方向相近**',
        '**注意力 Attention**：生成新 token 时决定"前文里哪些词更重要"',
        '**训练与对齐**：预训练 → 监督微调 SFT → 人类反馈强化学习 RLHF',
    ]),

    ('code', '词向量：语义 = 向量的几何关系', '''import math


def cosine(u, v):
    dot = sum(a * b for a, b in zip(u, v))
    nu = math.sqrt(sum(a * a for a in u))
    nv = math.sqrt(sum(b * b for b in v))
    return dot / (nu * nv)


# 玩具例子：前两维 ≈ "王室/人"，第三维 ≈ "食物"
king = [0.9, 0.8, 0.1]
queen = [0.85, 0.75, 0.2]
apple = [0.1, 0.15, 0.95]

print(f"king-queen  {cosine(king, queen):.3f}")   # 0.996  语义相近
print(f"king-apple  {cosine(king, apple):.3f}")   # 0.261  接近正交
''', ''),

    ('code', '注意力：最简形式', '''import math


def softmax(xs):
    m = max(xs)                                  # 减最大值防溢出
    exps = [math.exp(x - m) for x in xs]
    total = sum(exps)
    return [e / total for e in exps]


def attention(query, keys, values):
    """点积算相关度，softmax 归一化，再加权求和。"""
    scores = [sum(q * k for q, k in zip(query, key)) for key in keys]
    weights = softmax(scores)
    dim = len(values[0])
    return weights, [sum(w * v[d] for w, v in zip(weights, values))
                     for d in range(dim)]


w, o = attention([1.0, 0.0], [[1.0, 0.0], [0.0, 1.0], [0.7, 0.7]],
                 [[10.0], [20.0], [30.0]])
print([f"{x:.3f}" for x in w], f"{o[0]:.3f}")
# ['0.474', '0.174', '0.351'] 18.771  —— 与 query 越像的 key，权重越大
''', '"Attention is All You Need"(2017) 的 Transformer 是今天所有大模型的基础'),

    ('key', '幻觉的成因',
     '训练目标是"合理"，不是"正确"。模型没有事实数据库。'),

    ('table', '最容易出错的四类', [
        ['类别', '例子', '为什么'],
        ['精确标识符', 'OJ 题号、论文编号、API 版本号', '格式规律强、具体值随机'],
        ['时效信息', '最新版本、今年的规定', '训练数据有截止时间'],
        ['小众细节', '冷门函数的参数顺序', '训练数据里样本太少'],
        ['算术与计数', '大数乘法、字符计数', '逐 token 生成，不做真正的计算'],
    ], '⭐ 本课实测：让 AI 报 OpenJudge 题号，错误率很高'),

    ('bullets', '自检方法', [
        '**换个问法再问一遍** —— 答案不稳定的地方，多半是编的',
        '**要求给出处** —— 给不出可核验的出处就当作没有',
        '**凡是数字、编号、链接，一律自己验证**',
    ]),

    ('bullets', '提示词的有效结构（五要素）', [
        '**【角色】**你是一位帮助大一学生的编程助教。',
        '**【背景】**我在做 OpenJudge 上的一道题，n ≤ 10^5，时限 1 秒。',
        '**【我的尝试】**（贴上代码）',
        '**【现象】**样例过了，提交后 TLE。',
        '**【问题】**我的复杂度是多少？瓶颈在哪一行？**请只指出问题，不要直接给完整代码。**',
    ]),

    ('two', 'AI 辅助编程：能与不能',
     '能（推荐）', ['解释报错（贴 traceback）',
                    '审查代码："什么输入下会出错"',
                    '构造边界数据（你自己验证）',
                    '解释算法概念',
                    '写读入 / 格式化这类样板代码'],
     '不能（红线）', ['写作业代码然后原样提交',
                      '相信它给的题号、成绩规则',
                      '考试中使用任何 AI 工具',
                      '（含本地模型与 IDE 补全插件）']),

    ('key', '学术诚信',
     '期末上机考试禁止任何 AI 工具；无法解释自己提交的代码，按学术不端处理，成绩记 0。'),

    ('section', '第 2 节', '12 月月考讲评'),

    ('bullets', '为什么讲"错误归因"而不是"正确解法"', [
        '12 月月考是期末上机考试的**同构演练**',
        '比讲解正确解法更重要的，是搞清楚**大家为什么会错**',
        '**分值**：T1 20 + T2 25 + T3 25 + T4 30 = 100 分',
    ]),

    ('code', 'T1 课程互选统计（20 分）· 字典 + 排序', '''from collections import defaultdict


def solve(lines):
    n = int(lines[0])
    course_students = defaultdict(list)
    for i in range(1, n + 1):
        parts = lines[i].split()
        for c in parts[1:1 + int(parts[0])]:
            course_students[c].append(i - 1)

    # 并列时取字典序最小：一行同时处理"人数降序"与"名字升序"
    hottest = min(course_students, key=lambda c: (-len(course_students[c]), c))

    pairs = set()
    for c, ss in course_students.items():
        for a in range(len(ss)):
            for b in range(a + 1, len(ss)):
                pairs.add((ss[a], ss[b]))
    return hottest, len(pairs)
''', ''),

    ('table', 'T1 错误归因', [
        ['错法', '后果'],
        ['只按人数取 max，没处理并列', '并列时输出不确定 -> WA'],
        ['对每对学生求集合交集 O(n^2·k)', 'n=1000 时 10^7 次集合运算 -> TLE'],
        ['用 list 存 pairs 再去重', 'O(n^4) -> TLE'],
    ], '正确做法：按课程枚举学生对，总数 <= Σ C(ci, 2)。先算复杂度再动手'),

    ('code', 'T2 最优装载顺序（25 分）· 交换论证', '''import functools


def min_cost_int(boxes):
    """boxes: [(重量, 耗时)]。a 排 b 前更优 <=> t_a * w_b < t_b * w_a。"""
    def cmp(x, y):
        left, right = x[1] * y[0], y[1] * x[0]
        return -1 if left < right else (1 if left > right else 0)

    order = sorted(boxes, key=functools.cmp_to_key(cmp))
    elapsed, total = 0, 0
    for w, t in order:
        total += elapsed * w          # 前面的耗时之和 x 本箱重量
        elapsed += t
    return total


print(min_cost_int([(1, 3), (2, 1), (3, 2)]))    # 6
''', '推导：a 在前额外成本 t_a·w_b，b 在前 t_b·w_a -> 按 t/w 升序'),

    ('table', 'T2 错误归因（本卷区分度最高）', [
        ['错法', '后果'],
        ['按 w 降序（"重的先卸"）', '反例：(1,100) 与 (100,1) -> WA'],
        ['按 t 升序（"快的先卸"）', '同样有反例 -> WA'],
        ['用浮点 t/w 排序', '大数据下相等值的浮点误差 -> 偶发 WA'],
        ['每次重算前缀和', 'O(n^2) -> TLE'],
    ], '多数人能想到"要排序"，但排序键靠猜。交换论证是唯一可靠的推导方法'),

    ('code', 'T3 网格中的宝藏（25 分）· 带状态 BFS（1/2）：定位与初始化', '''from collections import deque


def treasure(grid):
    """状态是 (x, y, 是否已拿到钥匙) —— 两层网格。"""
    n, m = len(grid), len(grid[0])
    sx = sy = tx = ty = -1
    for i in range(n):
        for j in range(m):
            if grid[i][j] == 'S': sx, sy = i, j
            elif grid[i][j] == 'T': tx, ty = i, j
''', '状态是 (x, y, 是否已拿到钥匙) —— 两层网格'),

    ('code', 'T3 网格中的宝藏（2/2）：主循环', '''    DIRS = ((-1, 0), (1, 0), (0, -1), (0, 1))
    dist = [[[-1] * m for _ in range(n)] for _ in range(2)]
    start_key = 1 if grid[sx][sy] == 'K' else 0
    dist[start_key][sx][sy] = 0
    q = deque([(sx, sy, start_key)])
    while q:
        x, y, k = q.popleft()
        if (x, y) == (tx, ty):
            return dist[k][x][y]
        for dx, dy in DIRS:
            nx, ny = x + dx, y + dy
            if not (0 <= nx < n and 0 <= ny < m):
                continue
            cell = grid[nx][ny]
            if cell == '#' or (cell == 'D' and k == 0):
                continue
            nk = 1 if cell == 'K' else k       # 踩到钥匙就拿上
            if dist[nk][nx][ny] >= 0:
                continue
            dist[nk][nx][ny] = dist[k][x][y] + 1
            q.append((nx, ny, nk))
    return -1
''', '踩到钥匙就拿上；两层各自记距离，互不覆盖'),

    ('table', 'T3 错误归因', [
        ['错法', '后果'],
        ['visited[x][y] 只有一层', '拿钥匙前访问过的格子，拿钥匙后进不去 -> WA'],
        ['用 DFS 求最短步数', '第一次到达不是最短 -> WA'],
        ['用 list.pop(0)', '500x500x2 = 5x10^5 状态 -> TLE'],
        ['忘了起点本身可能是钥匙', '边界 WA'],
    ], '⭐ "同一个格子，在不同情况下能做的事不同" -> 必须加维'),

    ('code', 'T4 分组考试（30 分）· 区间划分 DP', '''def group_exam(a, k):
    """恰好切成 k 段，最小化各段"最大值-最小值"之和。O(n^2 k)。"""
    n = len(a)
    INF = float('inf')
    cost = [[0] * n for _ in range(n)]          # 预处理区间极差
    for l in range(n):
        mx = mn = a[l]
        for r in range(l, n):
            mx = max(mx, a[r]); mn = min(mn, a[r])
            cost[l][r] = mx - mn

    dp = [[INF] * (k + 1) for _ in range(n + 1)]
    dp[0][0] = 0                                 # ⚠️ 其余是 INF："恰好 k 段"
    for i in range(1, n + 1):
        for j in range(1, min(i, k) + 1):
            best = INF
            for t in range(j - 1, i):            # 上一段结束于 t
                if dp[t][j - 1] < INF:
                    v = dp[t][j - 1] + cost[t][i - 1]
                    if v < best:
                        best = v
            dp[i][j] = best
    return dp[n][k]


print(group_exam([1, 3, 5, 5, 9], 2))       # 4
''', ''),

    ('table', 'T4 错误归因', [
        ['错法', '后果'],
        ['dp 全初始化为 0', '"恰好 k 段"退化成"至多 k 段" -> 答案偏小 WA'],
        ['忘了 j <= i（段数不能超过人数）', '越界或错解'],
        ['每次转移现算 cost(t+1, i)', 'O(n^3 k) -> TLE'],
        ['用贪心"每次切最大间隙"', '这道题贪心不成立 -> WA'],
    ], '"恰好 k 段"必须用 +inf 初始化 —— 第 11 周讲过的坑，在这里再犯一次的人非常多'),

    ('section', '第 3 节', '综合复习清单'),

    ('table', '必须能默写的 12 个模板', [
        ['#', '模板', '周次'],
        ['1–3', '快速输入 ｜ 埃氏筛 ｜ 前缀和 + 差分', 'W4、W6、W10'],
        ['4–5', '多关键字排序 ｜ 归并的合并（逆序对）', 'W6'],
        ['6–7', '单调栈 ｜ 回溯模板', 'W7、W9'],
        ['8', '并查集（路径压缩 + 按大小合并）', 'W9'],
        ['9–10', '0-1 / 完全背包 ｜ LIS 的 O(n log n)', 'W11'],
        ['11–12', 'BFS（deque + 入队标记）｜ 二分答案', 'W12'],
    ]),

    ('bullets', '高频陷阱清单', [
        '☐ 忘 `int()` / 忘 `strip()` ｜ ☐ `[[0]*n]*m` 别名陷阱',
        '☐ `x in list` 是 O(n)；`list.pop(0)` 是 O(n)',
        '☐ 浮点用 `==` 比较；`int(x**0.5)` 差 1',
        '☐ 回溯忘 `path[:]` 拷贝 / 忘还原状态 ｜ ☐ 0-1 背包写成正序',
        '☐ "恰好装满"没用 `±inf` 初始化 ｜ ☐ BFS 出队时才标记 visited',
        '☐ 带状态的搜索少加了一维 ｜ ☐ 二分答案的取整方向写反',
        '☐ 多关键字排序只写了一个 key ｜ ☐ 输出格式：多余空格 / 换行 / 精度',
    ]),

    ('table', '复习节奏建议（本周到机考）', [
        ['天数', '任务'],
        ['第 1–2 天', '默写 12 个模板，写不出的回去看对应周讲义'],
        ['第 3–4 天', '重做月考错题（关题解、从空文件写）'],
        ['第 5–6 天', '按题型各刷 2 题（贪心 / DP / BFS / 回溯 / 并查集 / 二分）'],
        ['第 7 天', '限时模拟一整套（2 小时 6 题），只看时间不看对错'],
        ['考前一天', '只整理 cheat sheet，不做新题'],
    ]),

    ('bullets', '小结', [
        'LLM = 在海量文本上学"下一个 token"；四个部件：**分词、词向量、注意力、训练对齐**',
        '**幻觉源于"训练目标是合理而非正确"**；最易错的是**精确标识符**',
        '提示词五要素 + 一句"**只指出问题，不要给完整代码**"',
        '**考试禁用任何 AI；讲不清自己的代码 = 学术不端**',
        '月考四题对应四个高频坑：**并列不处理、排序键靠猜、状态少一维、"恰好"没用 inf**',
        '复习就做两件事：**默写 12 个模板** + **重做错题**',
    ]),

    ('key', '下周预告',
     'AI 专题的正片：知识图谱与神经网络 —— 用 60 行代码手写一个能学习的网络。'),
]

// 第 9 周 递归、回溯与并查集 —— 由 202610_ADS_W09_Recursion_Backtracking_DSU.md 整理成的讲课 PPT。
// 生成：cd courseware/pptx_builder && node decks/w09_recursion_backtracking_dsu.js ../202610_ADS_W09_Recursion_Backtracking_DSU.pptx
// 页上所有的运行结果都在 Python 3.12 下实跑核对过；改代码时连同结果一起改。
const path = require("path");
const { createDeck } = require("../lib");

const OUT = process.argv[2] || path.join(__dirname, "..", "out", "202610_ADS_W09_Recursion_Backtracking_DSU.pptx");

(async () => {
  const D = createDeck({ title: "计算概论（B）第 9 周 递归、回溯与并查集", author: "Hongfei Yan" });
  // 并查集部分的插图取自 DSA（2026fall-cs201）第 6 章课件，图号沿用原书
  const ASSETS = path.join(__dirname, "..", "..", "assets", "w09");
  const IMAGES = {};
  for (const n of [10, 11, 12, 13]) IMAGES[`fig-6-${n}`] = path.join(ASSETS, `fig-6-${n}.png`);
  await D.fetchImages(IMAGES);
  const {
    pres, C, FONT, MONO, runs, text, bullets, card, codeBlock, consoleBlock, callout, table, image,
    cells, arrowLabel, pill, numCircle, titleSlide, sectionSlide, content, summarySlide,
  } = D;

  // 并查集手算页用的小积木（取自 DSA 期中复习课件）
  const REDBOX = { fill: "FDF0EE", tcolor: C.bad };
  const MINT = { fill: C.mint, tcolor: C.dark };
  const GOLDF = "FBE3A6";
  // 答案胶囊
  const answer = (s, str, x, y, w = 1.6, h = 0.42, fs = 15) => pill(s, str, x, y, w, h, C.ok, C.white, fs);
  // 画树：nodes = { id: [cx, cy, label, fill?] }（圆心坐标），edges = [[a, b, opts?]]
  const tree = (s, nodes, edges, o = {}) => {
    const r = o.r || 0.2;
    edges.forEach(([a, b, eo = {}]) => {
      const [x1, y1] = nodes[a], [x2, y2] = nodes[b];
      s.addShape(pres.shapes.LINE, {
        x: x1, y: y1, w: x2 - x1, h: y2 - y1,
        line: { color: eo.color || C.green, width: 1.25, dashType: eo.dash ? "dash" : "solid" },
      });
    });
    Object.values(nodes).forEach(([cx, cy, label, fill]) => {
      s.addShape(pres.shapes.OVAL, { x: cx - r, y: cy - r, w: 2 * r, h: 2 * r, fill: { color: fill || C.mint }, line: { color: C.green, width: 1 } });
      text(s, String(label), cx - r - 0.1, cy - r, 2 * r + 0.2, 2 * r, { fontSize: o.fs || 11, bold: true, color: C.dark, align: "center", valign: "middle", margin: 0, lsm: 0.85 });
    });
  };

// ---- slides（顶层不缩进，避免改动模板字符串里的代码缩进）----
// =====================================================================
// Cover
titleSlide({
  kicker: "计算概论（B） · 第 9 周 · 2026 Fall",
  title: "递归、回溯与并查集",
  subtitle: "回溯法的通用模板与三大形态",
  topics: "回溯模板 · 子集 / 组合 / 排列三大形态 · 去重与剪枝\n八皇后 · 马走日 · DFS 求连通块（Flood Fill）\n并查集三种实现 · 路径压缩与按秩合并 · 带权并查集（食物链）\nDFS/BFS 与并查集：什么时候用哪个",
  footer: "Compiled by Hongfei Yan · 2026 Fall · github.com/GMyhf/2026fall-cs101",
});

// Three questions
{
  const s = content("?", "本周导引", "本周要回答三个问题");
  const qs = [
    ["穷举所有可能，该怎么写才不乱？", "**回溯 = DFS + 撤销**：路径、选择列表、结束条件，三要素一个模板打天下。"],
    ["指数级的搜索，怎么才能跑得完？", "**剪枝**：可行性、最优性、顺序剪枝——决定回溯能不能在时限内跑完。"],
    ["「谁和谁一伙」这种问题，有没有专门的工具？", "**并查集**：路径压缩 + 按秩合并，`find`/`union` 摊还近 O(1)。"],
  ];
  qs.forEach((q, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.15, 2.85, 2.55, C.code);
    numCircle(s, i + 1, x + 0.2, 1.32, 0.46, C.dark);
    text(s, q[0], x + 0.2, 1.92, 2.5, 0.7, { fontSize: 13.5, bold: true, color: C.dark, margin: 0 });
    text(s, q[1], x + 0.2, 2.65, 2.5, 0.95, { fontSize: 11, margin: 0, lsm: 1.2 });
  });
  card(s, 0.5, 3.95, 9.0, 1.1, C.dark);
  text(s, "一句话概括", 0.75, 4.05, 3, 0.3, { fontSize: 11, bold: true, color: C.gold, margin: 0 });
  s.addText([
    ...runs("两个必犯错误：忘拷贝、忘还原。", { color: C.white, boldColor: C.gold }),
    { text: "本周把它们变成肌肉记忆。", options: { color: C.white } },
  ], { x: 0.75, y: 4.38, w: 8.6, h: 0.5, fontFace: FONT, fontSize: 15, margin: 0, isTextBox: true, valign: "middle" });
}

// Roadmap
{
  const s = content("≡", "本周导引", "内容地图");
  const cols = [
    ["1  回溯法", ["1.1 回溯 = DFS + 撤销，通用模板", "1.2 三大形态：子集 / 组合 / 排列", "1.3 剪枝：可行性 / 最优性 / 顺序", "1.4–1.6 八皇后 · 马走日 · Flood Fill"]],
    ["2  并查集", ["2.1–2.2 等价类 · 父指针 · 朴素实现", "2.3 重量权衡合并 + 路径压缩 · 手算", "2.4–2.5 连通块 / 点对 · 判环", "2.6–2.7 带权并查集（食物链）· 复杂度"]],
    ["3  怎么选", ["3 DFS/BFS 与并查集：什么时候用哪个", "本周作业 · 思考题 · 小结"]],
  ];
  cols.forEach((c, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.15, 2.85, 3.9, i === 1 ? C.cream : C.code);
    text(s, c[0], x + 0.2, 1.3, 2.5, 0.45, { fontSize: 18, bold: true, color: C.dark, margin: 0 });
    bullets(s, c[1], x + 0.15, 1.9, 2.6, 3.0, { fontSize: 12, gap: 10 });
  });
}

// ============================ PART 1 ============================
sectionSlide("Part 1", "回溯法", "在解空间树上深度优先地搜索，走不通就退回上一步\n通用模板 · 三大形态 · 剪枝 · 八皇后 · 马走日 · Flood Fill");

// 1.1 what is backtracking
{
  const s = content("1.1", "1 回溯法", "什么是回溯：DFS + 撤销");
  card(s, 0.5, 1.1, 4.2, 2.5, C.code);
  text(s, "解空间树 = 第 8 周的决策树", 0.7, 1.2, 3.8, 0.32, { fontSize: 12, bold: true, color: C.dark, margin: 0 });
  text(s, "[ ]", 2.35, 1.55, 0.6, 0.32, { fontSize: 13, bold: true, color: C.dark, align: "center", margin: 0, fontFace: MONO });
  const kids = ["[1]", "[2]", "[3]"];
  kids.forEach((k, i) => {
    const x = 1.0 + i * 1.1;
    s.addShape(pres.shapes.LINE, { x: 2.65, y: 1.9, w: x + 0.3 - 2.65, h: 0.35, line: { color: C.green, width: 1.2 } });
    text(s, k, x, 2.25, 0.6, 0.3, { fontSize: 12, bold: true, color: C.green, align: "center", margin: 0, fontFace: MONO });
  });
  text(s, "[1,2]  [1,3] ...      ...", 0.85, 2.75, 3.6, 0.3, { fontSize: 10.5, color: C.muted, align: "center", margin: 0, fontFace: MONO });
  text(s, "走不通就退回上一步，换一个选择", 0.7, 3.15, 3.8, 0.35, { fontSize: 10.5, color: C.muted, margin: 0 });
  callout(s, "回溯 = DFS + 撤销", [
    "第 8 周的**调用树**：每次调用一个节点，执行顺序就是 DFS；",
    "每层做一次选择，它就是**决策树**，也叫解空间树；",
    "走到底或不合法就**退回上一步**，撤销刚才的选择，再换一个继续走。",
  ], 5.0, 1.1, 4.5, 2.5, { fontSize: 11.5, gap: 6 });
  codeBlock(s, `def backtrack(path, choices):
    if 满足结束条件:
        result.append(path[:])       # ⚠️ 拷贝
        return
    for choice in choices:
        if 不合法:
            continue                 # 剪枝
        做出选择(choice)              # 修改状态
        backtrack(path, 新的choices)
        撤销选择(choice)              # 恢复状态`, 0.5, 3.65, 9.0, 1.35, { fontSize: 7.6, lang: "py" });
}

// 1.1 three elements
{
  const s = content("1.1", "1 回溯法", "三个要素 + 两个必犯错误");
  const els = [["路径", "已经做出的选择\n树上：根到当前节点的路径"], ["选择列表", "当前还能做什么\n树上：当前节点有哪些孩子"], ["结束条件", "什么时候该收一个答案\n树上：走到叶子（或该收答案的节点）"]];
  els.forEach((e, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.15, 2.85, 1.5, C.mint);
    numCircle(s, i + 1, x + 0.2, 1.3, 0.42, C.dark);
    text(s, e[0], x + 0.8, 1.32, 1.9, 0.4, { fontSize: 15, bold: true, color: C.dark, margin: 0 });
    text(s, e[1], x + 0.2, 1.85, 2.5, 0.7, { fontSize: 11.5, margin: 0 });
  });
  callout(s, "错误 1：忘拷贝", "`result.append(path)` 而不是 `path[:]`——之后 `path` 还会被继续修改，最终 `result` 里全是**同一个可变对象**的最终状态。", 0.5, 2.95, 4.35, 1.9, { fontSize: 12, fill: "FDF0EE", tcolor: C.bad });
  callout(s, "错误 2：忘还原", "选完一个分支忘了撤销选择（`path.pop()`、恢复 `used[i]`……），状态就带着上一次的痕迹进入下一个分支，答案会莫名其妙地错。", 5.15, 2.95, 4.35, 1.9, { fontSize: 12, fill: "FDF0EE", tcolor: C.bad });
}

// 1.2 subsets
{
  const s = content("1.2", "1 回溯法 · 三大形态", "子集：每个元素选或不选，2ⁿ 个");
  text(s, "LeetCode 78. 子集，https://leetcode.cn/problems/subsets/", 0.5, 1.0, 9, 0.3, { fontSize: 10.5, color: C.muted, margin: 0 });
  codeBlock(s, `def subsets(nums):
    res, path = [], []

    def dfs(start):
        res.append(path[:])          # 每个节点都是一个答案
        for i in range(start, len(nums)):
            path.append(nums[i])
            dfs(i + 1)                # i+1：不能回头选，避免重复
            path.pop()

    dfs(0)
    return res


print(subsets([1, 2, 3]))`, 0.5, 1.35, 5.7, 3.0, { fontSize: 10.5, lang: "py" });
  consoleBlock(s, "[[], [1], [1, 2], [1, 2, 3],\n [1, 3], [2], [2, 3], [3]]", 6.4, 1.35, 3.1, 1.1, 10);
  callout(s, "关键：每个节点都是答案", "子集不需要走到叶子才收——`dfs` 一进来就 `append`，因为「选到这里就停」本身就是一个合法子集。对比第 8 周 §3.4 的「选或不选」：那棵树每层决定一个元素，只有叶子是答案。同一个问题，换了一棵树。", 6.4, 2.65, 3.1, 2.35, { fontSize: 10.5 });
}

// 1.2 combination
{
  const s = content("1.2", "1 回溯法 · 三大形态", "组合（可重复用）：LC 39 组合总和");
  codeBlock(s, `def combination_sum(candidates, target):
    """每个数可以重复使用，求所有和为 target 的组合。"""
    res, path = [], []
    candidates = sorted(candidates)

    def dfs(start, rest):
        if rest == 0:
            res.append(path[:])
            return
        for i in range(start, len(candidates)):
            if candidates[i] > rest:   # 剪枝：排序后，后面的更大，直接停
                break
            path.append(candidates[i])
            dfs(i, rest - candidates[i])  # i 而不是 i+1：可重复使用
            path.pop()

    dfs(0, target)
    return res


print(combination_sum([2, 3, 6, 7], 7))`, 0.5, 1.05, 6.4, 3.4, { fontSize: 9.6, lang: "py" });
  consoleBlock(s, "[[2, 2, 3], [7]]", 7.1, 1.05, 2.4, 0.7, 10.5);
  callout(s, "break 而不是 continue", "已排序，一旦当前数大于剩余额度，**后面的只会更大**，直接 `break` 结束这一层的循环。这一个字的差别，常常就是 AC 与 TLE 的差别。", 7.1, 1.95, 2.4, 2.5, { fontSize: 10.5, fill: C.mint, tcolor: C.dark });
}

// 1.2 permutation
{
  const s = content("1.2", "1 回溯法 · 三大形态", "排列（带重复元素）：去重");
  codeBlock(s, `def permute_unique(nums):
    nums = sorted(nums)               # 先排序，让相同元素相邻
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


print(permute_unique([1, 1, 2]))`, 0.5, 1.05, 6.1, 3.85, { fontSize: 8.3, lang: "py", hl: [12] });
  consoleBlock(s, "[[1, 1, 2],\n [1, 2, 1],\n [2, 1, 1]]", 6.75, 1.05, 2.75, 1.1, 10.5);
  callout(s, "本周最难记的一行", "记法：**同一层里，相同的数只允许第一个被选**。`not used[i-1]` 说明上一个 1 在本层「还没用」，也就是它和当前 `i` 是同一层的兄弟——跳过后者，避免重复排列。", 6.75, 2.35, 2.75, 2.6, { fontSize: 10.5, fill: "FDF0EE", tcolor: C.bad });
}

// 1.2 comparison table
{
  const s = content("1.2", "1 回溯法 · 三大形态", "对照表：递归参数怎么变");
  table(s, [
    ["形态", "递归时传", "典型题"],
    ["子集", { t: "dfs(i + 1)", mono: true }, "LC 78"],
    ["组合（不可重复用）", { t: "dfs(i + 1)", mono: true }, "LC 77"],
    ["组合（可重复用）", { t: "dfs(i)", mono: true }, "LC 39"],
    ["排列", { t: "从 0 开始 + used[]", mono: true }, "02748"],
  ], 0.5, 1.2, 9.0, [3.0, 3.0, 3.0], { fontSize: 13, rowH: 0.48 });
  callout(s, "怎么记", "只往后走、不回头 → 传 `i+1`（各选一次）或 `i`（可重复选）；需要「哪个都能选，但选过的不能再选」→ 用 `used[]` 数组。", 0.5, 4.15, 9.0, 0.75, { fontSize: 12 });
}

// 1.3 pruning
{
  const s = content("1.3", "1 回溯法", "剪枝：让指数变得可行");
  text(s, "回溯本质是**指数级**的。剪枝 = **剪掉一整棵子树**：时间看节点数，少走一个节点就省下它下面所有节点。", 0.5, 1.05, 9, 0.35, { fontSize: 12 });
  const kinds = [
    ["可行性剪枝", "当前选择已违反约束 → 立即 continue / return", "八皇后：同列 / 同对角线就跳过"],
    ["最优性剪枝", "当前部分解已经比已知最优差 → 放弃", "求最优解类问题里最常用"],
    ["顺序剪枝", "排序后一旦不可行，后面的都不可行 → break", "LC 39：candidates[i] > rest 就 break"],
  ];
  kinds.forEach((k, i) => {
    const y = 1.55 + i * 1.15;
    card(s, 0.5, y, 9.0, 1.0, i % 2 ? C.cream : C.code);
    numCircle(s, i + 1, 0.7, y + 0.13, 0.4, C.dark);
    text(s, k[0], 1.25, y + 0.08, 3, 0.32, { fontSize: 13.5, bold: true, color: C.dark, margin: 0 });
    text(s, k[1], 1.25, y + 0.4, 7.2, 0.3, { fontSize: 11, margin: 0 });
    text(s, k[2], 1.25, y + 0.68, 7.2, 0.28, { fontSize: 10, color: C.green, margin: 0 });
  });
}

// 1.4 eight queens code
{
  const s = content("1.4", "1 回溯法 · 例题", "02754 八皇后（1）：关键是三个集合");
  text(s, "8×8 棋盘放 8 个皇后，任意两个不能同行、同列、同对角线；按字典序输出第 b 个解。**逐行放置**自动保证不同行，只需检查列与两条对角线。", 0.5, 1.0, 9, 0.5, { fontSize: 11.5, lsm: 1.15 });
  codeBlock(s, `def solve_queens(n=8):
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
    return res`, 0.5, 1.45, 9.0, 3.75, { fontSize: 9.3, lang: "py", hl: [12] });
}

// 1.4 eight queens diagonals
{
  const s = content("1.4", "1 回溯法 · 例题", "02754 八皇后（2）：为什么用 row-c 和 row+c");
  const tbl = [["", "c=0", "c=1", "c=2"], ["r=0", "0", "-1", "-2"], ["r=1", "1", "0", "-1"], ["r=2", "2", "1", "0"]];
  table(s, tbl.map((r) => r.map((c) => ({ t: c, mono: true, align: "center" }))), 0.5, 1.15, 4.3, [1.075, 1.075, 1.075, 1.075], { fontSize: 12, rowH: 0.48 });
  text(s, "同一条 ↘ 对角线上，row − c 恒定；同一条 ↙ 对角线上，row + c 恒定。", 0.5, 3.35, 4.3, 0.75, { fontSize: 11, lsm: 1.2 });
  codeBlock(s, `sols = solve_queens(8)
print(len(sols))
print(''.join(map(str, sols[0])))
print(''.join(map(str, sols[91])))`, 5.15, 1.15, 4.35, 1.4, { fontSize: 10.5, lang: "py" });
  consoleBlock(s, "92\n15863724\n84136275", 5.15, 2.7, 4.35, 1.0);
  callout(s, "N 皇后的棋盘版", "LeetCode 51. N 皇后是同一题的棋盘输出版：https://leetcode.cn/problems/n-queens/", 5.15, 3.85, 4.35, 1.05, { fontSize: 10.5, fill: C.mint, tcolor: C.dark });
}

// 1.5 knight tour
{
  const s = content("1.5", "1 回溯法 · 例题", "04123 马走日");
  text(s, "n×m 棋盘，马从 (x, y) 出发，问有多少种走法能不重复地走遍所有格子。", 0.5, 1.0, 9, 0.35, { fontSize: 12 });
  codeBlock(s, `KNIGHT = ((-2, -1), (-2, 1), (-1, -2), (-1, 2),
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
print(knight_tours(3, 3, 0, 0))       # 0  —— 3x3 中心不可达`, 0.5, 1.4, 6.3, 3.55, { fontSize: 7.8, lang: "py", hl: [19] });
  callout(s, "这一行就是「回溯」", "`visited[nx][ny] = False`：忘了它，`visited` 会一直标记为 True，答案永远是 0 或 1。", 7.0, 1.4, 2.5, 1.7, { fontSize: 10.5, fill: "FDF0EE", tcolor: C.bad });
  consoleBlock(s, "32\n0", 7.0, 3.25, 2.5, 0.85);
}

// 1.6 flood fill
{
  const s = content("1.6", "1 回溯法 · 例题", "DFS 求连通块（Flood Fill）：02386 Lake Counting");
  text(s, "网格中 W 表示水，八连通的水域算一个湖，求湖的个数。", 0.5, 1.0, 9, 0.3, { fontSize: 12 });
  codeBlock(s, `def count_lakes(grid):
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
    return cnt`, 0.5, 1.35, 6.3, 3.5, { fontSize: 8, lang: "py" });
  callout(s, "为什么写成迭代", "网格 100×100 时递归深度可达 10⁴，评测机上有爆栈风险。**Flood Fill 一律用显式栈或队列。**（队列版就是第 12 周的 BFS，数出的连通块个数完全相同。）", 7.0, 1.35, 2.5, 2.55, { fontSize: 10, fill: C.mint, tcolor: C.dark });
  consoleBlock(s, "count_lakes(sample)\n= 3", 7.0, 4.05, 2.5, 0.8);
}

// ============================ PART 2 ============================
sectionSlide("Part 2", "并查集（DSU）", "若干元素分属哪些互不相交的集合？动态维护「谁和谁在同一组」\n等价类 · 父指针 · 重量权衡合并 · 路径压缩 · 连通分量计数 · 带权并查集");

// 2.1 problem
{
  const s = content("2.1", "2 并查集", "它解决什么问题");
  callout(s, "动态维护「谁和谁在同一组」", "支持两个操作，并且**边是一条条动态加进来**的。", 0.5, 1.1, 9.0, 0.75, { fontSize: 13 });
  table(s, [
    ["操作", "语义"],
    [{ t: "find(x)", mono: true }, "x 属于哪个集合（返回代表元）"],
    [{ t: "union(x, y)", mono: true }, "把 x 和 y 所在的两个集合合并"],
  ], 0.5, 2.05, 9.0, [3.0, 6.0], { fontSize: 13, rowH: 0.55 });
  callout(s, "典型场景", "判连通、判环、等价类划分、亲戚关系。", 0.5, 3.9, 9.0, 1.15, { fontSize: 12.5 });
}

// 2.1 equivalence（取自 DSA 第 6 章 6.2.5）
{
  const s = content("2.1", "2 并查集 · 等价类", "等价关系把集合划分成互不相交的等价类");
  card(s, 0.5, 1.05, 4.35, 2.4, C.code);
  text(s, "等价关系的三条性质", 0.7, 1.12, 4, 0.3, { fontSize: 13, bold: true, color: C.dark, margin: 0 });
  table(s, [
    ["性质", "条件"],
    [{ t: "自反性", bold: true }, "对所有 x，(x, x) ∈ R"],
    [{ t: "对称性", bold: true }, "(x, y) ∈ R ⇒ (y, x) ∈ R"],
    [{ t: "传递性", bold: true }, "(x, y), (y, z) ∈ R ⇒ (x, z) ∈ R"],
  ], 0.7, 1.5, 3.95, [1.0, 2.95], { fontSize: 10.5, rowH: 0.35 });
  text(s, "[x]_R = { y ∈ S : (x, y) ∈ R }", 0.7, 2.98, 4, 0.35, { fontSize: 12, bold: true, color: C.green, margin: 0 });
  card(s, 5.15, 1.05, 4.35, 2.4, C.code);
  text(s, "由等价偶对求等价类", 5.35, 1.12, 4, 0.3, { fontSize: 13, bold: true, color: C.dark, margin: 0 });
  const st = ["从 n 个**单元素集合**开始；", "依次读入偶对 (x, y)，**查找** x、y 所在子集；", "两个根不同，就把两个子集**合并**；", "最后剩下的非空子集就是等价类。"];
  st.forEach((t, i) => {
    numCircle(s, i + 1, 5.35, 1.55 + i * 0.45, 0.3, C.green);
    text(s, t, 5.75, 1.5 + i * 0.45, 3.65, 0.4, { fontSize: 10.5, valign: "middle", margin: 0 });
  });
  callout(s, "并查集（union / find）", "由若干**互不相交子集**组成的集合抽象：`find` 判断两个元素是否属于同一集合，`union` 把两个集合归并为一个。常用来维护「已经连通」「属于同一组」这类关系。", 0.5, 3.6, 9.0, 1.0, { fontSize: 11 });
  text(s, "所有等价类互不相交，它们的并正好是 S——等价关系就是对 S 的一种**划分**。", 0.5, 4.72, 9, 0.35, { fontSize: 11, color: C.goldText, bold: true });
}

// 2.2 parent pointer
{
  const s = content("2.2", "2 并查集 · 父指针表示法", "每个子集是一棵树，树根就是集合的标识");
  card(s, 0.5, 1.05, 9.0, 1.2, C.code);
  image(s, "fig-6-10", 0.7, 1.1, 5.5, 1.1);
  text(s, "图 6.10　只存父结点下标：一棵树的父指针数组（图取自 DSA 教材第 6 章）", 6.3, 1.25, 3.1, 0.8, { fontSize: 10, color: C.muted, margin: 0 });
  card(s, 0.5, 2.4, 5.6, 1.85, C.code);
  image(s, "fig-6-11", 0.6, 2.45, 5.4, 1.75);
  bullets(s, [
    "森林中每棵树代表一个子集。",
    "`find`：沿父链走到**根**。",
    "`union`：把一棵树的根**指向**另一棵树的根。",
    "**不必搬动**集合中的所有元素。",
  ], 6.3, 2.4, 3.2, 1.9, { fontSize: 11.5, gap: 5 });
  callout(s, "图 6.11", "(a) S₁ = {1,3,5,7}、(b) S₂ = {2,4,6,8} 各是一棵树；(c) **S₁ 的根 1 挂到 S₂ 的根 2 下**，得到 S₃。两集合一样大，挂法任选；本课 `DSU` 并列时把 y 的根挂到 x 的根下。", 0.5, 4.4, 9.0, 0.72, { fontSize: 10, ...MINT });
}

// 2.2 naive
{
  const s = content("2.2", "2 并查集 · 最朴素的实现", "用一个 parent 数组表示森林");
  codeBlock(s, `class NaiveDSU:
    def __init__(self, n):
        self.parent = list(range(n))     # 一开始每个点自成一组

    def find(self, x):
        while self.parent[x] != x:
            x = self.parent[x]
        return x

    def union(self, x, y):
        rx, ry = self.find(x), self.find(y)
        if rx != ry:
            self.parent[rx] = ry`, 0.5, 1.1, 5.6, 2.55, { fontSize: 11, lang: "py" });
  callout(s, "每棵树是一个集合", "`parent[i] == i` 时 i 是树根，也就是这个集合的代表元。", 6.3, 1.1, 3.2, 1.3, { fontSize: 11 });
  callout(s, "问题：退化成链", "连续 `union(0,1), union(1,2), union(2,3)...` 会退化成一条链，`find` 变成 **O(n)**。", 6.3, 2.55, 3.2, 1.1, { fontSize: 11, fill: "FDF0EE", tcolor: C.bad });
  callout(s, "两个优化", "重量权衡（按大小）合并 + 路径压缩——先看退化长什么样。", 0.5, 3.85, 9.0, 1.0, { fontSize: 12.5, fill: C.mint, tcolor: C.dark });
}

// 2.2 degenerate
{
  const s = content("2.2", "2 并查集 · 退化", "朴素合并：反复把大树挂到小树下，退化成链");
  card(s, 0.5, 1.05, 9.0, 2.3, C.code);
  image(s, "fig-6-12", 0.7, 1.1, 8.6, 2.2);
  text(s, "图 6.12　(a) 起初 n 个单元素集合；(b) 每次都把大树挂到小树下，最后退化成一条长链", 0.5, 3.38, 9, 0.28, { fontSize: 10, color: C.muted, align: "center" });
  card(s, 0.5, 3.8, 4.35, 1.32, "FDF0EE");
  text(s, "树高 n → find 是 O(n)", 0.7, 3.9, 4, 0.35, { fontSize: 15, bold: true, color: C.bad, margin: 0 });
  text(s, "查最底下那个结点，要沿父链一路走到根。", 0.7, 4.35, 4, 0.6, { fontSize: 11, margin: 0 });
  card(s, 5.15, 3.8, 4.35, 1.32, "EAF4EF");
  text(s, "两条改进，标准实现都用上", 5.35, 3.9, 4, 0.35, { fontSize: 15, bold: true, color: C.ok, margin: 0 });
  text(s, "① 重量权衡合并规则　② 路径压缩", 5.35, 4.35, 4, 0.6, { fontSize: 12, bold: true, color: C.dark, margin: 0 });
}

// 2.3 weighted union
{
  const s = content("2.3", "2 并查集 · 改进一", "重量权衡合并规则（weighted union rule）");
  card(s, 0.5, 1.05, 9.0, 0.75, C.dark);
  text(s, "合并时看两个集合的元素个数：「令含元素少的子集的树根指向含元素多的子集的根」", 0.7, 1.05, 8.6, 0.75, { fontSize: 14, bold: true, color: C.gold, valign: "middle", margin: 0 });
  bullets(s, [
    "后面 `DSU` 类里的 `size` 就是为它准备的：`size[根]` 记这个集合的元素个数，也叫按大小合并。",
    "深度限制在 **O(log n)**：结点所在的树**作为较小（或一样大）的一方**被挂到别的树下时，它的深度才加 1，而这时它所在集合的元素个数**至少翻倍**——所以任何结点的深度不超过 ⌊log₂n⌋。",
    "并列时（规模相同）挂谁都行，但**手算题会规定**，例如「等大取小编号为根」——按题目说的来。",
  ], 0.5, 1.95, 5.4, 3.1, { fontSize: 11.5, gap: 8 });
  callout(s, "⚠ 别和「按秩合并」混了", [
    "按秩比的是**树高**，按重量比的是**元素个数**。",
    "两者复杂度同阶，但在同一组等价对上会长出**形状不同**的树。",
    "题目要求「按大小合并」并画父指针数组时，**换成按秩就可能对不上答案**。",
  ], 6.1, 1.95, 3.4, 3.17, { fontSize: 10.5, gap: 5, ...REDBOX });
}

// 2.3 path compression
{
  const s = content("2.3", "2 并查集 · 改进二", "路径压缩：find 顺手把沿途结点直接挂到根下");
  card(s, 0.5, 1.05, 9.0, 2.75, C.code);
  image(s, "fig-6-13", 0.7, 1.1, 8.6, 2.65);
  bullets(s, [
    "`find` 在返回根之前，把沿途**每个结点的父指针都直接改成根**。",
    "图 6.13：对结点 7 调用一次 `find`，路径 **7 → 5 → 2 → 1** 上的 7、5 改挂到根 1 下（2 本来就是根的孩子）；**9、10 仍留在 7 下面**。",
  ], 0.5, 3.9, 5.6, 1.2, { fontSize: 11, gap: 5 });
  callout(s, "两条合起来", "m 次操作的摊还代价是 O(m α(n))，α 是反 Ackermann 函数——大量操作**接近常数**。", 6.3, 3.9, 3.2, 1.22, { fontSize: 10.5, ...MINT });
}

// 2.3 optimized DSU
{
  const s = content("2.3", "2 并查集 · 两个优化", "路径压缩 + 按大小合并");
  const tips = [
    ["路径压缩", "find 的路上，把沿途节点直接挂到根上。"],
    ["按大小合并", "把小树挂到大树下面，树高不会失控。"],
  ];
  tips.forEach((t, i) => {
    const x = 0.5 + i * 4.6;
    card(s, x, 1.05, 4.4, 0.75, C.mint);
    text(s, t[0], x + 0.2, 1.11, 4.0, 0.32, { fontSize: 13, bold: true, color: C.dark, margin: 0 });
    text(s, t[1], x + 0.2, 1.4, 4.0, 0.4, { fontSize: 11, margin: 0 });
  });
  codeBlock(s, `class DSU:
    """带路径压缩 + 按大小合并的并查集。单次操作近似 O(α(n))。"""
    def __init__(self, n):
        self.parent = list(range(n))
        self.size = [1] * n
        self.count = n                    # 当前集合个数
    def find(self, x):
        root = x
        while self.parent[root] != root:
            root = self.parent[root]
        while self.parent[x] != root:      # 第二趟做路径压缩（迭代，不怕深）
            self.parent[x], x = root, self.parent[x]
        return root
    def union(self, x, y):
        rx, ry = self.find(x), self.find(y)
        if rx == ry:
            return False                   # 本来就在一组
        if self.size[rx] < self.size[ry]:
            rx, ry = ry, rx
        self.parent[ry] = rx
        self.size[rx] += self.size[ry]
        self.count -= 1
        return True`, 0.5, 1.9, 6.0, 3.25, { fontSize: 7.4, lang: "py", hl: [10, 11] });
  callout(s, "find 写成迭代两趟", "而不是递归 `parent[x] = find(parent[x])`：n = 10⁵ 时递归版可能爆栈。**这是本课反复出现的取舍。**", 6.7, 1.9, 2.8, 1.55, { fontSize: 10.5, fill: "FDF0EE", tcolor: C.bad });
  codeBlock(s, `d = DSU(6)
d.union(0, 1); d.union(1, 2); d.union(3, 4)
print(d.connected(0, 2), d.connected(0, 3), d.count)`, 6.7, 3.7, 2.8, 0.7, { fontSize: 8.3, lang: "py" });
  consoleBlock(s, "True False 3", 6.7, 4.45, 2.8, 0.42, 8);
}

// 2.3 手算演练（1/3）：取自 DSA 2026 期中题 三.1
{
  const s = content("2.3", "2 并查集 · 手算演练（DSA 期中题）", "(1) 初始数组表示几个集合？");
  text(s, "根存 −(集合大小)，非根存父下标；Find 做完全路径压缩；Union 先两次 Find，再小挂大，等大取小编号为根。", 0.5, 1.0, 9.0, 0.45, { fontSize: 11.5, color: C.muted });
  const P0 = [-4, 0, 1, 0, -3, 4, 5, -2, 7, -1];
  text(s, "p =", 0.5, 1.55, 0.5, 0.42, { fontSize: 12, bold: true, color: C.dark, valign: "middle", margin: 0 });
  cells(s, 1.0, 1.55, P0, { cw: 0.5, ch: 0.42, idx: true, fs: 11, fills: P0.map((v) => (v < 0 ? GOLDF : C.mint)) });
  tree(s, {
    a0: [1.3, 2.75, "0", GOLDF], a1: [0.9, 3.5, "1"], a3: [1.7, 3.5, "3"], a2: [0.9, 4.25, "2"],
    b4: [3.0, 2.75, "4", GOLDF], b5: [3.0, 3.5, "5"], b6: [3.0, 4.25, "6"],
    c7: [4.3, 2.75, "7", GOLDF], c8: [4.3, 3.5, "8"],
    d9: [5.5, 2.75, "9", GOLDF],
  }, [["a0", "a1"], ["a0", "a3"], ["a1", "a2"], ["b4", "b5"], ["b5", "b6"], ["c7", "c8"]], { r: 0.2 });
  answer(s, "4 个集合", 6.3, 2.55, 1.6);
  bullets(s, ["{0, 1, 2, 3}　大小 4", "{4, 5, 6}　大小 3", "{7, 8}　大小 2", "{9}　大小 1"], 6.3, 3.15, 3.2, 1.6, { fontSize: 12.5, gap: 4 });
  text(s, "注意 2 → 1 → 0、6 → 5 → 4 都是两层深：这正是后面路径压缩要处理的路径。", 0.5, 4.65, 9.0, 0.4, { fontSize: 11, color: C.goldText, bold: true });
}

// 2.3 手算演练（2/3）：Union / Find
{
  const s = content("2.3", "2 并查集 · 手算演练（DSA 期中题）", "(2) Union(2, 6)　(3) 再 Find(6)");
  table(s, [
    ["步骤", "做了什么", "数组变化"],
    ["Find(2)", "路径 2 → 1 → 0，压缩为 2 → 0", { t: "p[2] = 0", mono: true }],
    ["Find(6)", "路径 6 → 5 → 4，压缩为 6 → 4", { t: "p[6] = 4", mono: true }],
    ["合并", "大小 3 < 4：根 4 挂到根 0 下", { t: "p[4] = 0, p[0] = −7", mono: true }],
    ["Find(6)", "路径 6 → 4 → 0，压缩为 6 → 0", { t: "p[6] = 0", mono: true }],
  ], 0.5, 1.0, 9.0, [1.1, 4.6, 3.3], { fontSize: 11, rowH: 0.32 });
  const P1 = [-7, 0, 0, 0, 0, 4, 4, -2, 7, -1], P2 = [-7, 0, 0, 0, 0, 4, 0, -2, 7, -1];
  text(s, "(2)", 0.5, 2.85, 0.5, 0.4, { fontSize: 12, bold: true, color: C.ok, valign: "middle", margin: 0 });
  cells(s, 1.0, 2.85, P1, { cw: 0.4, ch: 0.4, idx: true, fs: 10.5, fills: P1.map((_, i) => ([0, 2, 4, 6].includes(i) ? GOLDF : C.mint)) });
  text(s, "(3)", 0.5, 3.75, 0.5, 0.4, { fontSize: 12, bold: true, color: C.ok, valign: "middle", margin: 0 });
  cells(s, 1.0, 3.75, P2, { cw: 0.4, ch: 0.4, idx: true, fs: 10.5, fills: P2.map((_, i) => (i === 6 ? GOLDF : C.mint)) });
  tree(s, {
    r0: [7.3, 2.75, "0", GOLDF], n1: [6.1, 3.5, "1"], n2: [6.7, 3.5, "2"], n3: [7.3, 3.5, "3"], n4: [7.9, 3.5, "4"], n6b: [8.5, 3.5, "6", GOLDF],
    n5: [7.6, 4.3, "5"],
  }, [["r0", "n1"], ["r0", "n2"], ["r0", "n3"], ["r0", "n4"], ["r0", "n6b", { dash: true, color: C.goldText }], ["n4", "n5"]], { r: 0.19, fs: 10 });
  text(s, "(3) 之后的 {0..6}：6 由挂在 4 下改为直接挂到 0", 5.85, 4.6, 3.7, 0.25, { fontSize: 9, color: C.muted, margin: 0 });
  callout(s, "最常见的两个错", [
    "Union 后把 **p[6] 写成 0**：合并只改根，不会顺带压缩 6。",
    "忘了 Union 内两次 Find 的压缩：p[2] 仍写 1、p[6] 仍写 5。",
  ], 0.5, 4.3, 5.1, 0.82, { fontSize: 9.5, ...REDBOX, tsize: 10.5, gap: 1 });
}

// 2.3 手算演练（3/3）：代码
{
  const s = content("2.3", "2 并查集 · 手算演练（DSA 期中题）", "按题目规定实现：可运行，对得上手算");
  codeBlock(s, `def find(p, x):
    """返回根，并把 x 到根路径上的结点直接挂到根下。"""
    root = x
    while p[root] >= 0:                # 非根存父下标
        root = p[root]
    while p[x] >= 0 and p[x] != root:  # 第二趟：改挂到根
        nxt = p[x]
        p[x] = root
        x = nxt
    return root

def union(p, x, y):
    rx, ry = find(p, x), find(p, y)
    if rx == ry:
        return
    # 根存 -size：size 大者为新根；相等取编号小者
    if (-p[rx], -rx) < (-p[ry], -ry):
        rx, ry = ry, rx                # 保证 rx 是新根
    p[rx] += p[ry]                     # -(size 之和)
    p[ry] = rx

p = [-4, 0, 1, 0, -3, 4, 5, -2, 7, -1]
union(p, 2, 6); print(p)
find(p, 6);     print(p)`, 0.5, 1.0, 5.9, 4.1, { lang: "py", fontSize: 9.5 });
  consoleBlock(s, "[-7, 0, 0, 0, 0, 4, 4, -2, 7, -1]\n[-7, 0, 0, 0, 0, 4, 0, -2, 7, -1]", 6.6, 1.0, 2.9, 0.95, 9);
  callout(s, "两条改进", [
    "**按大小合并**：树高 ≤ log₂ n。",
    "**路径压缩**：查一次，整条路径变扁。",
    "两者合用，m 次操作 O(m·α(n))，α 实际 ≤ 4。",
    "根里存 **−size**：一个数组同时记父亲与大小。",
  ], 6.6, 2.15, 2.9, 2.95, { fontSize: 10.5 });
}

// 2.4 example: religions
{
  const s = content("2.4", "2 并查集 · 例题", "02524 宗教信仰：就是数连通块个数");
  text(s, "n 个学生，给出若干对「信仰相同」的关系，问最多可能有多少种不同的宗教。", 0.5, 1.0, 9, 0.35, { fontSize: 12 });
  codeBlock(s, `def max_religions(n, pairs):
    d = DSU(n)
    for a, b in pairs:
        d.union(a, b)
    return d.count


print(max_religions(10, [(0, 1), (1, 2), (3, 4)]))      # 10 - 3 = 7`, 0.5, 1.5, 9.0, 1.75, { fontSize: 11.5, lang: "py" });
  consoleBlock(s, "7", 0.5, 3.4, 9.0, 0.45, 11);
  callout(s, "为什么是 10 − 3", "10 个学生一开始各自成组；`(0,1)`、`(1,2)`、`(3,4)` 三次合并各让集合数少 1，最终 10 − 3 = 7 组。", 0.5, 4.0, 9.0, 1.1, { fontSize: 12 });
}

// 2.4 component / pair counting（取自 DSA 第 6 章 6.2.5 应用）
{
  const s = content("2.4", "2 并查集 · 应用", "顺带数出连通分量和连通点对");
  text(s, "**动态连通性**：图的边一条条加进来，每加一条就要回答「现在有几个连通分量」「现在有多少对顶点互相连通」。两个数都不必重新数：", 0.5, 1.02, 9, 0.6, { fontSize: 12 });
  card(s, 0.5, 1.75, 4.35, 1.5, C.code);
  text(s, "连通分量数", 0.7, 1.82, 4, 0.3, { fontSize: 13, bold: true, color: C.dark, margin: 0 });
  text(s, "从 n 开始，每次**成功**合并减 1；两端本来就在同一集合里的**冗余边**不改变它——就是 `DSU` 里的 `count`。", 0.7, 2.18, 4.0, 1.0, { fontSize: 11, margin: 0 });
  card(s, 5.15, 1.75, 4.35, 1.5, C.code);
  text(s, "连通点对数", 5.35, 1.82, 4, 0.3, { fontSize: 13, bold: true, color: C.dark, margin: 0 });
  text(s, "从 0 开始。规模 s₁、s₂ 的两个集合合并，新连通的无序点对恰好 **s₁ · s₂** 对：一边任取一个、另一边任取一个。", 5.35, 2.18, 4.0, 1.0, { fontSize: 11, margin: 0 });
  callout(s, "⚠ s₁、s₂ 从哪里读", [
    "规模记在**根**上，必须先 `find` 到根再读；拿边的端点直接读 `size`，读到的是某棵子树**当年的旧规模**。",
    "也不能**合并之后**再读——那时两个规模已经加在了一起。",
    "Python 的整数不会溢出；换成 C/C++ 要用 **64 位**：最多 n(n−1)/2 对，32 位在 n 约 9.3 万时就会溢出。",
  ], 0.5, 3.4, 9.0, 1.72, { fontSize: 10.5, gap: 4, ...REDBOX });
}

// 2.5 example: cycle
{
  const s = content("2.5", "2 并查集 · 例题", "判环：union 返回 False 就是环");
  text(s, "无向图中，若 union(a, b) 时发现 a、b 已经连通，说明这条边构成了环。", 0.5, 1.0, 9, 0.35, { fontSize: 12 });
  codeBlock(s, `def has_cycle(n, edges):
    d = DSU(n)
    for a, b in edges:
        if not d.union(a, b):            # union 返回 False 表示本已连通
            return True
    return False


print(has_cycle(3, [(0, 1), (1, 2)]))            # False
print(has_cycle(3, [(0, 1), (1, 2), (2, 0)]))    # True`, 0.5, 1.5, 9.0, 2.15, { fontSize: 11, lang: "py" });
  consoleBlock(s, "False\nTrue", 0.5, 3.8, 9.0, 0.75, 12);
}

// 2.6 weighted DSU intro
{
  const s = content("2.6", "2 并查集 · 带权并查集", "01182 食物链：扩展域写法");
  text(s, "A 吃 B，B 吃 C，C 吃 A。给出若干句「x 和 y 同类」或「x 吃 y」，统计假话条数。", 0.5, 1.0, 9, 0.5, { fontSize: 12, lsm: 1.15 });
  callout(s, "扩展域：把每个动物拆成 3 个节点", [
    "`x`　　　同类域",
    "`x + n`　猎物域（x 吃的东西）",
    "`x + 2n`　天敌域（吃 x 的东西）",
  ], 0.5, 1.65, 4.3, 2.1, { fontSize: 12.5, gap: 8 });
  callout(s, "同类 / 天敌关系怎么转成 union", [
    "x 与 y 同类 → 三个域两两对应地 union。",
    "x 吃 y → y 是 x 的猎物域，x 是 y 的天敌域。",
  ], 5.1, 1.65, 4.4, 2.1, { fontSize: 12, fill: C.mint, tcolor: C.dark, gap: 8 });
  callout(s, "最难的一道并查集题", "关键是想清楚「x 吃 y」意味着**三组**关系同时成立——值得反复读三遍。", 0.5, 3.95, 9.0, 1.15, { fontSize: 12.5, fill: "FDF0EE", tcolor: C.bad });
}

// 2.6 food chain code
{
  const s = content("2.6", "2 并查集 · 带权并查集", "食物链：假话怎么判定");
  codeBlock(s, `def food_chain(n, statements):
    """statements: (d, x, y)，d=1 表示同类，d=2 表示 x 吃 y。1-indexed 输入。"""
    d = DSU(3 * n)
    lies = 0
    for kind, x, y in statements:
        if x < 1 or x > n or y < 1 or y > n:
            lies += 1
            continue
        x -= 1; y -= 1
        if kind == 1:                                  # x 与 y 同类
            if d.connected(x, y + n) or d.connected(x, y + 2 * n):
                lies += 1
            else:
                d.union(x, y); d.union(x + n, y + n); d.union(x + 2 * n, y + 2 * n)
        else:                                          # x 吃 y
            if x == y or d.connected(x, y) or d.connected(x, y + n):
                lies += 1
            else:
                d.union(x + n, y)          # y 是 x 的猎物
                d.union(x, y + 2 * n)      # x 是 y 的天敌
                d.union(x + 2 * n, y + n)  # x 的天敌是 y 的猎物
    return lies`, 0.5, 1.05, 9.0, 3.35, { fontSize: 8.5, lang: "py" });
  callout(s, "假话的两种情况", "kind=1 时若 x、y 已被判定为「猎物/天敌」关系，或 kind=2 时 x、y 已同类 / y 反过来吃 x，都直接矛盾——计为假话。", 0.5, 4.35, 9.0, 0.65, { fontSize: 10.5 });
}

// 2.6 food chain output
{
  const s = content("2.6", "2 并查集 · 带权并查集", "食物链：跑一遍样例");
  codeBlock(s, `print(food_chain(100, [(1, 101, 1), (2, 1, 2), (2, 2, 3), (2, 3, 3),
                       (1, 1, 3), (2, 3, 1), (1, 5, 5)]))`, 0.5, 1.1, 9.0, 1.0, { fontSize: 11, lang: "py" });
  consoleBlock(s, "3", 0.5, 2.2, 9.0, 0.5, 12);
  table(s, [
    ["语句", "判定"],
    [{ t: "(1, 101, 1)", mono: true }, "假话：101 超出 1..100 范围"],
    [{ t: "(2, 3, 3)", mono: true }, "假话：x == y，「3 吃 3」自己吃自己"],
    [{ t: "(1, 1, 3)", mono: true }, "假话：由 (2,1,2)(2,2,3) 推出 3 吃 1，1 与 3 不可能同类"],
    [{ t: "(2, 3, 1)、(1, 5, 5)", mono: true }, "真话：3 吃 1 与已知一致；「5 和 5 同类」本就成立"],
  ], 0.5, 2.85, 9.0, [2.4, 6.6], { fontSize: 11, rowH: 0.42 });
}

// 2.7 complexity
{
  const s = content("2.7", "2 并查集", "复杂度：为什么可以当 O(1) 用");
  table(s, [
    ["实现", "find 摊还"],
    ["朴素", "O(n) 最坏"],
    ["仅路径压缩", "O(log n)"],
    ["仅按秩合并", "O(log n)"],
    [{ t: "两者都用", bold: true, color: C.ok }, { t: "O(α(n)) ≈ O(1)", bold: true, color: C.ok }],
  ], 0.5, 1.2, 9.0, [4.5, 4.5], { fontSize: 13, rowH: 0.55 });
  callout(s, "α 是反阿克曼函数", "对任何现实中的 n，α(n) ≤ 4。**所以并查集可以当 O(1) 用。**", 0.5, 4.15, 9.0, 0.95, { fontSize: 13 });
}

// ============================ PART 3 ============================
sectionSlide("Part 3", "DFS/BFS 与并查集", "同一个「连通性」问题，两种工具怎么选\n经验法则：静态遍历用 DFS/BFS，动态加边用并查集");

// 3 comparison
{
  const s = content("3", "3 怎么选", "DFS/BFS 与并查集：什么时候用哪个");
  table(s, [
    ["", "DFS / BFS", "并查集"],
    ["数连通块", "✓", "✓"],
    ["动态加边后查询连通性", "✗ 每次要重跑", "✓ 天生支持"],
    ["求路径本身", "✓", "✗ 只知道连不连通"],
    ["求最短路径", "✓ BFS", "✗"],
    ["判无向图有无环", "✓", "✓ 更简单"],
  ], 0.5, 1.15, 9.0, [3.5, 2.75, 2.75], { fontSize: 12.5, rowH: 0.5 });
  callout(s, "经验法则", "只问「连不连通 / 分几组」且**边是一条条加进来**的，用并查集；需要路径、距离、遍历顺序的，用 DFS / BFS。", 0.5, 4.35, 9.0, 0.85, { fontSize: 12.5, fill: C.mint, tcolor: C.dark });
}

// homework table
{
  const s = content("§", "本周练习", "本周作业");
  table(s, [
    ["#", "题目", "平台 / 编号", "考点"],
    ["1", "八皇后", { t: "02754", mono: true }, "回溯 + 剪枝"],
    ["2", "马走日", { t: "04123", mono: true }, "回溯 + 状态还原"],
    ["3", "Lake Counting", { t: "02386", mono: true }, "Flood Fill"],
    ["4", "晶矿的个数", { t: "M05585", mono: true }, "连通块"],
    ["5", "宗教信仰", { t: "02524", mono: true }, "并查集数连通块"],
    ["6", "子集", { t: "LC 78", mono: true }, "回溯：子集形态"],
    ["7", "组合总和", { t: "LC 39", mono: true }, "回溯：可重复选"],
    ["8", "一种等价类划分问题", { t: "M29982", mono: true }, "并查集"],
    [{ t: "9（选做）", color: C.goldText }, "食物链", { t: "01182", mono: true }, "扩展域并查集"],
    [{ t: "10（选做）", color: C.goldText }, "N 皇后", { t: "LC 51", mono: true }, "回溯（棋盘输出）"],
    [{ t: "11（选做）", color: C.goldText }, "单词搜索", { t: "LC 79", mono: true }, "网格回溯"],
  ], 0.5, 1.05, 9.0, [0.7, 3.0, 1.7, 3.6], { fontSize: 10.3, rowH: 0.3, tight: true });
}

// Thinking questions
{
  const s = content("?", "本周练习 · 思考题", "思考题");
  const qs = [
    ["本质解", "八皇后一共 92 个解，其中本质不同的（不计旋转与镜像）有几个？"],
    ["去重条件", "排列去重的条件写成 `used[i-1]` 为 True 时跳过，还对吗？两种写法都能去重，区别是什么？"],
    ["复杂度", "并查集的 `find` 若只做路径压缩不做按秩合并，最坏复杂度是多少？为什么仍然可以接受？"],
    ["扩展域", "食物链一题若改成「A吃B、B吃C、C吃D、D吃A」（四元环），扩展域要开几倍？"],
    ["爆栈", "Flood Fill 用递归写，网格 1000×1000 全是 W 时会发生什么？实测一下。"],
  ];
  qs.forEach((q, i) => {
    const x = 0.5 + (i % 2) * 4.6, y = 1.1 + Math.floor(i / 2) * 1.35;
    card(s, x, y, 4.4, 1.2, i % 2 === 0 ? C.code : C.cream);
    numCircle(s, i + 1, x + 0.18, y + 0.13, 0.36, C.dark);
    text(s, q[0], x + 0.65, y + 0.1, 3.6, 0.32, { fontSize: 12.5, bold: true, color: C.dark, valign: "middle", margin: 0 });
    s.addText(runs(q[1], { color: C.text }), { x: x + 0.2, y: y + 0.48, w: 4.0, h: 0.68, fontFace: FONT, fontSize: 10, margin: 0, isTextBox: true, valign: "top" });
  });
}

summarySlide("本周小结", [
  ["回溯", "= **DFS + 撤销**；模板三要素：路径、选择列表、结束条件。两个必犯错误：忘拷贝、忘还原。"],
  ["三大形态", "子集 / 不可重组合 `dfs(i+1)`、可重组合 `dfs(i)`、排列用 `used[]`。"],
  ["剪枝", "决定回溯能不能跑完：排序后用 `break` 而不是 `continue`。"],
  ["经典例题", "八皇后用 `col`/`row-c`/`row+c` 三个集合；马走日靠方向数组 + 回溯还原。"],
  ["并查集", "= **路径压缩 + 按大小合并**，摊还近 O(1)；`find` 写迭代版防爆栈；`union` 返回 False 就是「判环」。"],
]);

// Next week
{
  const s = sectionSlide("下周预告", "区间问题与动态规划入门", "进入 11 月的核心内容——五类区间问题、差分数组\n从递归到递推，正式认识 DP 三要素");
}

  await D.save(OUT);
})().catch((e) => { console.error(e); process.exit(1); });

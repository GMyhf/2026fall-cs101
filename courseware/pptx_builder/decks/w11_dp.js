// 第 11 周 动态规划（DP）专题 —— 由 202611_ADS_W11_DP.md 整理成的讲课 PPT。
// 生成：cd courseware/pptx_builder && node decks/w11_dp.js ../202611_ADS_W11_DP.pptx
// 页上所有的运行结果都在 Python 3.12 下实跑核对过（含 300 组 0-1 背包对拍、200 组 LIS 对拍）；改代码时连同结果一起改。
const path = require("path");
const { createDeck } = require("../lib");

const OUT = process.argv[2] || path.join(__dirname, "..", "out", "202611_ADS_W11_DP.pptx");

(async () => {
  const D = createDeck({ title: "计算概论（B）第 11 周 动态规划（DP）专题", author: "Hongfei Yan" });
  const {
    pres, C, FONT, MONO, runs, text, bullets, card, codeBlock, consoleBlock, callout, table,
    cells, arrowLabel, pill, numCircle, titleSlide, sectionSlide, content, summarySlide,
  } = D;

// ---- slides（顶层不缩进，避免改动模板字符串里的代码缩进）----
// =====================================================================
// Cover
titleSlide({
  kicker: "计算概论（B） · 第 11 周 · 2026 Fall",
  title: "动态规划（DP）专题",
  subtitle: "背包三兄弟 · 序列型 DP · DP 的调试",
  topics: "0-1 背包 · 完全背包 · 多重背包与二进制拆分 · 滚动数组与倒序遍历\n「恰好装满」型初始化 · 最长上升子序列（O(n²) 与 O(n log n)）\n最长公共子序列 · 编辑距离 · 打家劫舍 · 最大子矩阵（降维）\nDP 的调试方法：三个检查点 · 打印 DP 表 · 与暴力对拍",
  footer: "Compiled by Hongfei Yan · 2026 Fall · github.com/GMyhf/2026fall-cs101",
});

// Three questions
{
  const s = content("?", "本周导引", "本周要回答三个问题");
  const qs = [
    ["0-1 背包、完全背包，代码几乎一样，差在哪一个字？", "**遍历方向**：0-1 背包**倒序**（只拿一次），完全背包**正序**（可重复拿）。一字之差，两种问题。"],
    ["「凑出方案数」和「凑出最小个数」，循环顺序有讲究吗？", "**物品在外层 = 组合（不计顺序），容量在外层 = 排列（计顺序）**——背包问题里最容易搞混的一点。"],
    ["DP 写错了，怎么才能又快又准地查出来？", "三个检查点：**状态说得清吗？边界对不对？遍历顺序对不对？** 最可靠的手段是**和暴力对拍**。"],
  ];
  qs.forEach((q, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.15, 2.85, 2.85, C.code);
    numCircle(s, i + 1, x + 0.2, 1.32, 0.46, C.dark);
    text(s, q[0], x + 0.2, 1.92, 2.5, 0.85, { fontSize: 13, bold: true, color: C.dark, margin: 0 });
    text(s, q[1], x + 0.2, 2.8, 2.5, 1.1, { fontSize: 10.8, margin: 0, lsm: 1.2 });
  });
}

// Roadmap
{
  const s = content("≡", "本周导引", "内容地图");
  const cols = [
    ["1  背包问题", ["1.1 三种背包一览", "1.2 0-1 背包（二维 / 一维滚动）", "1.3 完全背包 · 方案数 vs 排列数", "1.4 多重背包与二进制拆分", "1.5「恰好装满」型初始化", "1.6 二维费用背包 · 分数背包"]],
    ["2  序列型 DP", ["2.1 LIS：O(n²) 与 O(n log n)", "2.2 LCS 与编辑距离", "2.3 打家劫舍：不能取相邻", "2.4 最大子矩阵：降维 + Kadane"]],
    ["3  DP 的调试 · 收尾", ["3.1 三个检查点", "3.2 打印 DP 表", "3.3 与暴力对拍", "本周作业（13 题）· 思考题 · 小结"]],
  ];
  cols.forEach((c, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.15, 2.85, 3.9, i === 1 ? C.cream : C.code);
    text(s, c[0], x + 0.2, 1.3, 2.5, 0.45, { fontSize: 16, bold: true, color: C.dark, margin: 0 });
    bullets(s, c[1], x + 0.15, 1.9, 2.6, 3.0, { fontSize: 11, gap: 8 });
  });
}

// ============================ PART 1 ============================
sectionSlide("Part 1", "背包问题：DP 的主干", "0-1 · 完全 · 多重——差别只在遍历方向\n「恰好装满」的初始化 · 可分割就贪心，不可分割才 DP");

// 1.1 overview table
{
  const s = content("1.1", "1 背包问题", "三种背包一览");
  table(s, [
    ["类型", "每种物品的数量", "体积维遍历方向"],
    ["0-1 背包", "每种最多 1 个", { t: "倒序", bold: true, color: C.bad }],
    ["完全背包", "每种无限个", { t: "正序", bold: true, color: C.ok }],
    ["多重背包", "每种有上限 kᵢ", "二进制拆分后当 0-1 背包"],
  ], 0.5, 1.2, 9.0, [2.2, 3.0, 3.8], { fontSize: 14, rowH: 0.65 });
  callout(s, "这张表是背包问题的全部", "倒序 / 正序一个字之差，就是两种完全不同的问题。", 0.5, 3.9, 9.0, 0.9, { fontSize: 14, fill: C.mint, tcolor: C.dark });
}

// 1.2 0-1 knapsack 2d
{
  const s = content("1.2", "1 背包问题", "0-1 背包 · 二维写法");
  text(s, "**23421: 小偷背包**——n 个物品，第 i 个体积 wᵢ、价值 vᵢ，背包容量 C，每个物品最多拿一次，求最大总价值。", 0.5, 1.0, 9.0, 0.5, { fontSize: 12, lsm: 1.15 });
  bullets(s, [
    "**状态**：`dp[i][c]` = 只考虑前 i 个物品、容量为 c 时的最大价值；",
    "**转移**：`dp[i][c] = max(dp[i-1][c], dp[i-1][c-w[i]] + v[i])`（不拿 / 拿）；",
    "**边界**：`dp[0][*] = 0`。",
  ], 0.5, 1.55, 9.0, 1.1, { fontSize: 12.5, gap: 5 });
  codeBlock(s, `def knapsack_2d(weights, values, cap):
    n = len(weights)
    dp = [[0] * (cap + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        w, v = weights[i - 1], values[i - 1]
        for c in range(cap + 1):
            dp[i][c] = dp[i - 1][c]                       # 不拿第 i 个
            if c >= w:
                dp[i][c] = max(dp[i][c], dp[i - 1][c - w] + v)   # 拿
    return dp[n][cap]


print(knapsack_2d([1, 4, 3], [1500, 3000, 2000], 4))      # 3500`, 0.5, 2.75, 9.0, 2.2, { fontSize: 10.5, lang: "py" });
}

// 1.2 0-1 knapsack 1d
{
  const s = content("1.2", "1 背包问题", "0-1 背包 · 一维滚动写法（实战都用这个）");
  codeBlock(s, `def knapsack_1d(weights, values, cap):
    dp = [0] * (cap + 1)
    for w, v in zip(weights, values):
        for c in range(cap, w - 1, -1):        # ⚠️ 必须倒序
            dp[c] = max(dp[c], dp[c - w] + v)
    return dp[cap]


print(knapsack_1d([1, 4, 3], [1500, 3000, 2000], 4))      # 3500`, 0.5, 1.05, 5.6, 1.95, { fontSize: 10.3, lang: "py" });
  callout(s, "为什么必须倒序", "一维数组里，`dp[c-w]` 若在**同一轮**已被本物品更新过，就相当于这个物品被拿了两次。倒序时 `dp[c-w]` 还是**上一轮**的值，对应二维式的 `dp[i-1][c-w]`。**正序 = 完全背包，倒序 = 0-1 背包。**", 6.25, 1.05, 3.25, 2.5, { fontSize: 10.5, fill: "FDF0EE", tcolor: C.bad, lsm: 1.15 });
  text(s, "**02773: 采药**——标准 0-1 背包模板题：", 0.5, 3.2, 5.6, 0.3, { fontSize: 11.5, margin: 0 });
  codeBlock(s, `def caiyao(T, herbs):
    """herbs: [(耗时, 价值)]；总时间 T。"""
    dp = [0] * (T + 1)
    for t, v in herbs:
        for c in range(T, t - 1, -1):
            dp[c] = max(dp[c], dp[c - t] + v)
    return dp[T]

print(caiyao(70, [(71, 100), (69, 1), (1, 2)]))     # 3`, 0.5, 3.5, 5.6, 1.45, { fontSize: 9.0, lang: "py" });
}

// 1.3 unbounded knapsack
{
  const s = content("1.3", "1 背包问题", "完全背包");
  text(s, "**每种物品无限个** → 正序遍历，`dp[c-w]` 用的就是本轮已更新过的值（允许重复拿）。", 0.5, 1.0, 9.0, 0.4, { fontSize: 12.5, lsm: 1.15 });
  codeBlock(s, `def unbounded_knapsack(weights, values, cap):
    dp = [0] * (cap + 1)
    for w, v in zip(weights, values):
        for c in range(w, cap + 1):            # ⚠️ 正序
            dp[c] = max(dp[c], dp[c - w] + v)
    return dp[cap]


print(unbounded_knapsack([1, 4, 3], [1500, 3000, 2000], 4))   # 6000（拿 4 个体积 1 的）`, 0.5, 1.55, 9.0, 2.0, { fontSize: 10.8, lang: "py" });
  callout(s, "和 1.2 对比", "**0-1 倒序（只拿一次）**，**完全正序（可重复拿）**——两段代码只差 `range` 的方向和起点，语义天差地别。", 0.5, 3.7, 9.0, 1.0, { fontSize: 12.5, fill: C.mint, tcolor: C.dark, lsm: 1.2 });
}

// 1.3 combination vs permutation
{
  const s = content("1.3", "1 背包问题", "完全背包变形：方案数（把 max 换成 +）");
  codeBlock(s, `def count_ways(coins, amount):
    """组合数，不计顺序。"""
    dp = [0] * (amount + 1)
    dp[0] = 1
    for c in coins:              # 物品在外层 -> 组合
        for a in range(c, amount + 1):
            dp[a] += dp[a - c]
    return dp[amount]


print(count_ways([1, 2, 5], 5))
# 4 —— {5},{1,2,2},{1,1,1,2},{1×5}`, 0.5, 1.1, 4.35, 2.75, { fontSize: 9.6, lang: "py" });
  codeBlock(s, `def count_permutations(coins, amount):
    """排列数，计顺序。"""
    dp = [0] * (amount + 1)
    dp[0] = 1
    for a in range(1, amount + 1):   # 容量在外层 -> 排列
        for c in coins:
            if c <= a:
                dp[a] += dp[a - c]
    return dp[amount]


print(count_permutations([1, 2, 5], 5))   # 9`, 5.15, 1.1, 4.35, 2.75, { fontSize: 9.6, lang: "py" });
  callout(s, "循环顺序决定语义", "**物品在外层 = 组合（不计顺序），容量在外层 = 排列（计顺序）**。这是背包问题里最容易搞混、也最容易被考的一点。**M01742: Coins** 与 **LeetCode 279. 完全平方数**都是这一类。", 0.5, 4.0, 9.0, 1.05, { fontSize: 11, fill: C.mint, tcolor: C.dark, lsm: 1.15 });
}

// 1.3 num_squares
{
  const s = content("1.3", "1 背包问题", "完全背包应用：完全平方数");
  text(s, "**LeetCode 279**——最少用几个完全平方数凑出 n。完全背包 + 求最小个数。", 0.5, 1.0, 9.0, 0.35, { fontSize: 12.5 });
  codeBlock(s, `def num_squares(n):
    """最少用几个完全平方数凑出 n。完全背包 + 求最小个数。"""
    INF = float('inf')
    dp = [0] + [INF] * n
    k = 1
    while k * k <= n:
        sq = k * k
        for a in range(sq, n + 1):
            if dp[a - sq] + 1 < dp[a]:
                dp[a] = dp[a - sq] + 1
        k += 1
    return dp[n]


print(num_squares(12), num_squares(13))    # 3 (4+4+4)  2 (4+9)`, 0.5, 1.5, 9.0, 2.3, { fontSize: 11, lang: "py" });
}

// 1.4 multi knapsack
{
  const s = content("1.4", "1 背包问题", "多重背包与二进制拆分");
  text(s, "**每种物品有 kᵢ 个**。朴素做法拆成 kᵢ 个单品再做 0-1 背包，O(C·Σkᵢ)。**二进制拆分**：把 k 个物品拆成 `1,2,4,...,2^t,余数` 这几「捆」，能凑出 0..k 的任意个数，把 Σk 降到 Σlog k。", 0.5, 1.0, 9.0, 0.65, { fontSize: 11.5, lsm: 1.15 });
  codeBlock(s, `def multi_knapsack(items, cap):
    """items: [(体积, 价值, 数量)]。"""
    dp = [0] * (cap + 1)
    for w, v, k in items:
        cnt = 1
        while k > 0:
            take = min(cnt, k)
            ww, vv = w * take, v * take
            for c in range(cap, ww - 1, -1):       # 每一"捆"当 0-1 背包
                dp[c] = max(dp[c], dp[c - ww] + vv)
            k -= take
            cnt <<= 1
    return dp[cap]


# 3 个体积 2 价值 5 的物品，容量 6 -> 全拿，价值 15
print(multi_knapsack([(2, 5, 3)], 6))       # 15
print(multi_knapsack([(2, 5, 2)], 6))       # 10  —— 只有 2 个`, 0.5, 1.75, 9.0, 2.9, { fontSize: 10.3, lang: "py" });
}

// 1.4 binary split verification
{
  const s = content("1.4", "1 背包问题", "验证二进制拆分的正确性");
  text(s, "1, 2, 4, ..., 2^(t-1), k−(2^t−1) 这些数能唯一表示 0..k 之间的每个整数。", 0.5, 1.0, 9.0, 0.35, { fontSize: 12.5 });
  codeBlock(s, `def binary_split(k):
    parts, cnt = [], 1
    while k > 0:
        take = min(cnt, k)
        parts.append(take)
        k -= take
        cnt <<= 1
    return parts


for k in (1, 5, 7, 10, 13):
    parts = binary_split(k)
    reachable = {0}
    for p in parts:
        reachable |= {r + p for r in reachable}
    assert reachable == set(range(k + 1)), k
    print(k, parts)`, 0.5, 1.45, 5.6, 3.15, { fontSize: 9.6, lang: "py" });
  consoleBlock(s, "1 [1]\n5 [1, 2, 2]\n7 [1, 2, 4]\n10 [1, 2, 4, 3]\n13 [1, 2, 4, 6]", 6.25, 1.45, 3.25, 1.7, 11);
  callout(s, "断言全部通过", "每个 k 拆出的「捆」都能靠子集和精确凑出 0..k 里的每一个数——这正是二进制拆分能安全替代「拆成 k 个单品」的原因。", 6.25, 3.3, 3.25, 1.3, { fontSize: 10.5, fill: C.mint, tcolor: C.dark, lsm: 1.15 });
}

// 1.5 exact fill
{
  const s = content("1.5", "1 背包问题", "「恰好装满」型：初始化的区别");
  table(s, [
    ["目标", "初始化"],
    ["容量至多 C 的最大价值", { t: "dp = [0] * (C+1)", mono: true }],
    ["恰好装满 C 的最大价值", { t: "dp[0]=0，其余 -inf", mono: true }],
    ["恰好装满 C 的最小代价", { t: "dp[0]=0，其余 +inf", mono: true }],
  ], 0.5, 1.05, 9.0, [4.5, 4.5], { fontSize: 12, rowH: 0.5 });
  codeBlock(s, `def exact_fill_max(weights, values, cap):
    NEG = float('-inf')
    dp = [NEG] * (cap + 1)
    dp[0] = 0                                # 只有容量 0 是"可达"的起点
    for w, v in zip(weights, values):
        for c in range(cap, w - 1, -1):
            if dp[c - w] != NEG:
                dp[c] = max(dp[c], dp[c - w] + v)
    return dp[cap] if dp[cap] != NEG else -1

print(exact_fill_max([2, 3], [10, 20], 5))    # 30，2+3 恰好装满
print(exact_fill_max([2, 4], [10, 20], 5))    # -1，凑不出 5`, 0.5, 3.05, 5.6, 2.0, { fontSize: 9.0, lang: "py" });
  callout(s, "⚠️ 最难查的一类 DP bug", "`-inf` 的作用是标记「不可达」。忘了这一步，「恰好装满」型会退化成「至多」型，**答案偏大且不报错**。", 6.25, 3.05, 3.25, 2.0, { fontSize: 10.8, fill: "FDF0EE", tcolor: C.bad, lsm: 1.2 });
}

// 1.6 pokemon
{
  const s = content("1.6", "1 背包问题", "背包的其他变形：二维费用背包");
  text(s, "**04102: 宠物小精灵之收服**——精灵球数量 + 体力值两个维度：", 0.5, 1.0, 9.0, 0.3, { fontSize: 12, margin: 0 });
  codeBlock(s, `def pokemon(balls, hp, pets):
    """pets: [(消耗球数, 消耗体力)]；返回 (最多收服数, 剩余最大体力)。"""
    # dp[b][h] = 用不超过 b 个球、消耗不超过 h 点体力，最多收服几只
    dp = [[0] * (hp + 1) for _ in range(balls + 1)]
    for cost_b, cost_h in pets:
        for b in range(balls, cost_b - 1, -1):
            for h in range(hp, cost_h - 1, -1):
                dp[b][h] = max(dp[b][h], dp[b - cost_b][h - cost_h] + 1)
    best = dp[balls][hp]
    left = 0
    for h in range(hp + 1):
        if dp[balls][h] == best:
            left = hp - h                     # 第一个达到 best 的 h 就是最省体力的
            break
    return best, left


print(pokemon(10, 100, [(7, 10), (2, 40), (2, 50), (1, 20), (4, 20)]))
# (3, 30)`, 0.5, 1.35, 9.0, 3.5, { fontSize: 10, lang: "py" });
}

// 1.6 fractional
{
  const s = content("1.6", "1 背包问题", "背包的其他变形：分数背包（贪心！）");
  text(s, "**04110: 圣诞老人的礼物**——可以只拿一部分，因此**贪心**（按单位价值排序）就是最优，**不需要 DP**。", 0.5, 1.0, 9.0, 0.5, { fontSize: 12, lsm: 1.15 });
  codeBlock(s, `def fractional_knapsack(items, cap):
    """items: [(总价值, 重量)]，可切分。"""
    items = sorted(items, key=lambda it: it[0] / it[1], reverse=True)
    total, rest = 0.0, cap
    for value, weight in items:
        if rest >= weight:
            total += value
            rest -= weight
        else:
            total += value * rest / weight
            break
    return total


print(f"{fractional_knapsack([(4, 4), (10, 5), (7, 2)], 10):.1f}")   # 20.0
# 单位价值 3.5 -> 2.0 -> 1.0：整取 (7,2) 与 (10,5) 后余 3，(4,4) 只取 3/4 得 3.0`, 0.5, 1.55, 9.0, 2.95, { fontSize: 9.3, lang: "py" });
  card(s, 0.5, 4.62, 9.0, 0.4, C.mint);
  text(s, "**判断题眼：** 物品**可分割** → 贪心；**不可分割** → 背包 DP。这一条在考试里区分度很高。", 0.65, 4.62, 8.7, 0.4, { fontSize: 11, color: C.dark, valign: "middle", margin: 0 });
}

// ============================ PART 2 ============================
sectionSlide("Part 2", "序列型 DP", "LIS · LCS · 编辑距离 · 打家劫舍 · 最大子矩阵\n一维状态与二维状态的经典模板");

// 2.1 LIS n2
{
  const s = content("2.1", "2 序列型 DP", "最长上升子序列（LIS）· O(n²) 写法");
  text(s, "**02533: Longest Ordered Subsequence**", 0.5, 1.0, 9.0, 0.3, { fontSize: 12.5 });
  bullets(s, [
    "**状态**：`dp[i]` = 以 a[i] 结尾的最长上升子序列长度；",
    "**转移**：`dp[i] = max(dp[j] + 1)`，其中 j < i 且 a[j] < a[i]；",
    "**答案**：`max(dp)`。",
  ], 0.5, 1.35, 9.0, 1.1, { fontSize: 13, gap: 6 });
  codeBlock(s, `def lis_n2(a):
    n = len(a)
    dp = [1] * n
    for i in range(n):
        for j in range(i):
            if a[j] < a[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp) if dp else 0


print(lis_n2([1, 7, 3, 5, 9, 4, 8]))       # 4  —— 1,3,5,9 或 1,3,5,8`, 0.5, 2.6, 9.0, 2.0, { fontSize: 11, lang: "py" });
}

// 2.1 LIS nlogn
{
  const s = content("2.1", "2 序列型 DP", "最长上升子序列（LIS）· O(n log n) 写法");
  text(s, "维护数组 `tails`，`tails[k]` = 长度为 k+1 的上升子序列的**最小结尾**。", 0.5, 1.0, 9.0, 0.35, { fontSize: 12 });
  codeBlock(s, `import bisect


def lis_nlogn(a):
    tails = []
    for v in a:
        pos = bisect.bisect_left(tails, v)   # 严格上升用 bisect_left
        if pos == len(tails):
            tails.append(v)
        else:
            tails[pos] = v                    # 用更小的值替换，为后面留空间
    return len(tails)


print(lis_nlogn([1, 7, 3, 5, 9, 4, 8]))    # 4`, 0.5, 1.4, 5.6, 2.35, { fontSize: 9.8, lang: "py" });
  callout(s, "⚠️ tails 不是答案序列", "**`tails` 不是任何一个真实的上升子序列**，它只是各长度的最小结尾。它的**长度**是对的，但直接把它当答案序列输出会错。", 6.25, 1.4, 3.25, 1.55, { fontSize: 10.8, fill: "FDF0EE", tcolor: C.bad, lsm: 1.15 });
  callout(s, "已验证", "200 组随机数据对拍：`lis_n2` 与 `lis_nlogn` 完全一致。**严格上升**用 `bisect_left`，**非降**（允许相等）用 `bisect_right`。", 6.25, 3.05, 3.25, 1.65, { fontSize: 10.5, fill: C.mint, tcolor: C.dark, lsm: 1.15 });
}

// 2.1 LIS variants
{
  const s = content("2.1", "2 序列型 DP", "LIS 变形：不上升子序列 · 最大上升子序列和");
  text(s, "**M02945: 拦截导弹**——求最长**不上升**子序列，反转后按非降处理：", 0.5, 1.0, 4.35, 0.5, { fontSize: 11, lsm: 1.1 });
  codeBlock(s, `def longest_non_increasing(a):
    """反转后取最长不降子序列。"""
    tails = []
    for v in reversed(a):
        pos = bisect.bisect_right(tails, v)
        if pos == len(tails):
            tails.append(v)
        else:
            tails[pos] = v
    return len(tails)


print(longest_non_increasing(
    [389, 207, 155, 300, 299, 170, 158, 65]))   # 6`, 0.5, 1.5, 4.35, 2.6, { fontSize: 8.8, lang: "py" });
  text(s, "**03532: 最大上升子序列和**——把「长度 +1」换成「和 + a[i]」：", 5.15, 1.0, 4.35, 0.5, { fontSize: 11, lsm: 1.1 });
  codeBlock(s, `def max_rising_sum(a):
    n = len(a)
    dp = a[:]     # dp[i] = 以 i 结尾的最大上升子序列和
    for i in range(n):
        for j in range(i):
            if a[j] < a[i]:
                dp[i] = max(dp[i], dp[j] + a[i])
    return max(dp)


print(max_rising_sum([1, 7, 3, 5, 9, 4, 8]))
# 18 = 1+3+5+9`, 5.15, 1.5, 4.35, 2.6, { fontSize: 8.8, lang: "py" });
}

// 2.2 LCS
{
  const s = content("2.2", "2 序列型 DP", "最长公共子序列（LCS）");
  text(s, "**02806: 公共子序列**", 0.5, 1.0, 9.0, 0.3, { fontSize: 12.5 });
  bullets(s, [
    "**状态**：`dp[i][j]` = s[:i] 与 t[:j] 的 LCS 长度；",
    "**转移**：末字符相同 → `dp[i-1][j-1] + 1`；不同 → `max(dp[i-1][j], dp[i][j-1])`；",
    "**边界**：`dp[0][*] = dp[*][0] = 0`。",
  ], 0.5, 1.35, 9.0, 1.1, { fontSize: 13, gap: 6 });
  codeBlock(s, `def lcs(s, t):
    m, n = len(s), len(t)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s[i - 1] == t[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]


print(lcs("abcfbc", "abfcab"), lcs("programming", "contest"))    # 4 2`, 0.5, 2.6, 9.0, 2.0, { fontSize: 10.5, lang: "py" });
}

// 2.2 edit distance
{
  const s = content("2.2", "2 序列型 DP", "编辑距离：同一个二维框架");
  text(s, "**LeetCode 72. 编辑距离**——最少几次插入 / 删除 / 替换把 s 变成 t。", 0.5, 1.0, 9.0, 0.35, { fontSize: 12.5 });
  codeBlock(s, `def edit_distance(s, t):
    m, n = len(s), len(t)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i                          # 删光
    for j in range(n + 1):
        dp[0][j] = j                          # 全插入
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s[i - 1] == t[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j],        # 删
                                   dp[i][j - 1],        # 插
                                   dp[i - 1][j - 1])    # 改
    return dp[m][n]


print(edit_distance("horse", "ros"), edit_distance("intention", "execution"))   # 3 5`, 0.5, 1.45, 9.0, 2.85, { fontSize: 9.6, lang: "py" });
  callout(s, "和 LCS 是同一个框架", "都是 `dp[i][j]` 定义在两个前缀上，末字符相同/不同分两种转移——**掌握了 LCS，编辑距离只是转移式换了个写法**。", 0.5, 4.4, 9.0, 0.6, { fontSize: 11, gap: 0 });
}

// 2.3 house robber
{
  const s = content("2.3", "2 序列型 DP", "打家劫舍：不能取相邻");
  text(s, "**LeetCode 198. 打家劫舍**", 0.5, 1.0, 9.0, 0.3, { fontSize: 12.5 });
  codeBlock(s, `def rob(nums):
    prev, cur = 0, 0            # prev = dp[i-2], cur = dp[i-1]
    for v in nums:
        prev, cur = cur, max(cur, prev + v)
    return cur


print(rob([1, 2, 3, 1]), rob([2, 7, 9, 3, 1]))     # 4 12`, 0.5, 1.4, 5.6, 2.0, { fontSize: 11, lang: "py" });
  callout(s, "最小模型", "这是「**选或不选，且选了就跳过下一个**」的最小模型。第 12 周会看到它在**网格**上的版本。", 6.25, 1.4, 3.25, 2.0, { fontSize: 12, fill: C.mint, tcolor: C.dark, lsm: 1.2 });
}

// 2.4 max submatrix
{
  const s = content("2.4", "2 序列型 DP", "最大子矩阵：降维 + Kadane");
  text(s, "**M02766: 最大子矩阵**——在 n×n 的整数矩阵中，求元素和最大的子矩阵。**降维**：枚举上下边界（O(n²) 种），把这几行按列压缩成一维数组，再对它跑 Kadane（O(n)）——总复杂度 O(n³)。", 0.5, 1.0, 9.0, 0.75, { fontSize: 11.5, lsm: 1.15 });
  codeBlock(s, `def max_submatrix(mat):
    n, m = len(mat), len(mat[0])
    best = mat[0][0]
    for top in range(n):
        col = [0] * m                          # 第 top..bottom 行的列和
        for bottom in range(top, n):
            row = mat[bottom]
            for j in range(m):
                col[j] += row[j]
            cur = col[0]                       # 对 col 跑 Kadane
            best = max(best, cur)
            for j in range(1, m):
                cur = max(col[j], cur + col[j])
                best = max(best, cur)
    return best


print(max_submatrix([[0, -2, -7, 0], [9, 2, -6, 2], [-4, 1, -4, 1], [-1, 8, 0, -2]]))   # 15`, 0.5, 1.8, 9.0, 2.95, { fontSize: 9, lang: "py" });
  text(s, "**降维打击**：二维问题固定一维，转成已会做的一维问题——DP 的常用招式。", 0.5, 4.8, 9.0, 0.33, { fontSize: 11, margin: 0 });
}

// ============================ PART 3 ============================
sectionSlide("Part 3", "DP 的调试", "三个检查点 · 打印 DP 表 · 与暴力对拍\n和暴力对拍是唯一可靠的验证手段");

// 3.1 checkpoints
{
  const s = content("3.1", "3 DP 的调试", "三个检查点");
  const items = [
    ["1", "状态定义能用一句话说清吗？", "说不清就一定写不对转移。"],
    ["2", "边界对不对？", "手算 n = 0、1、2 三个最小情况，和代码结果比。"],
    ["3", "遍历顺序对不对？", "转移用到的状态，在用之前算好了吗？"],
  ];
  items.forEach((it, i) => {
    const y = 1.2 + i * 1.15;
    card(s, 0.7, y, 8.6, 1.0, i % 2 ? C.cream : C.code);
    numCircle(s, i + 1, 0.9, y + 0.29, 0.42, C.dark);
    text(s, it[1], 1.55, y + 0.12, 6.5, 0.4, { fontSize: 15, bold: true, color: C.dark, margin: 0 });
    text(s, it[2], 1.55, y + 0.53, 6.9, 0.4, { fontSize: 12, color: C.muted, margin: 0 });
  });
}

// 3.2 print dp table
{
  const s = content("3.2", "3 DP 的调试", "打印 DP 表");
  text(s, "n 小的时候把整张表打出来，逐格核对：", 0.5, 1.0, 9.0, 0.3, { fontSize: 12.5 });
  codeBlock(s, `def lcs_debug(s, t):
    m, n = len(s), len(t)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            dp[i][j] = (dp[i - 1][j - 1] + 1 if s[i - 1] == t[j - 1]
                        else max(dp[i - 1][j], dp[i][j - 1]))
    for i, row in enumerate(dp):
        label = ' ' if i == 0 else s[i - 1]
        print(label, " ".join(f"{v:2d}" for v in row))
    return dp[m][n]


lcs_debug("abc", "ac")`, 0.5, 1.35, 5.6, 3.0, { fontSize: 9.6, lang: "py" });
  consoleBlock(s, "     0  0  0\na    0  1  1\nb    0  1  1\nc    0  1  2", 6.25, 1.35, 3.25, 1.4, 11);
  callout(s, "逐格核对", "每一格和手推的转移式对一遍——DP 表小的时候，这比读代码快得多。", 6.25, 2.95, 3.25, 1.4, { fontSize: 11, fill: C.mint, tcolor: C.dark, lsm: 1.2 });
}

// 3.3 brute force check
{
  const s = content("3.3", "3 DP 的调试", "与暴力对拍");
  text(s, "DP 写完后，用暴力枚举验证小规模数据——这是**最可靠**的验证方式：", 0.5, 1.0, 9.0, 0.35, { fontSize: 12.5 });
  codeBlock(s, `def knapsack_brute(weights, values, cap):
    n = len(weights)
    best = 0
    for mask in range(1 << n):
        w = sum(weights[i] for i in range(n) if mask >> i & 1)
        if w <= cap:
            best = max(best, sum(values[i] for i in range(n) if mask >> i & 1))
    return best


for _ in range(300):
    n = random.randint(1, 10)
    ws = [random.randint(1, 10) for _ in range(n)]
    vs = [random.randint(1, 50) for _ in range(n)]
    cap = random.randint(1, 30)
    assert knapsack_1d(ws, vs, cap) == knapsack_brute(ws, vs, cap)
print("0-1 背包与暴力枚举一致（300 组随机数据）")`, 0.5, 1.4, 9.0, 3.05, { fontSize: 9.6, lang: "py" });
  text(s, "**为什么用位掩码枚举子集**：`1 << n` 种取舍方案，`mask >> i & 1` 判断第 i 个物品拿不拿——n ≤ 20 时这是最直接的暴力写法。", 0.5, 4.5, 9.0, 0.55, { fontSize: 10.5, lsm: 1.1, margin: 0 });
}

// ============================ PART 4 ============================
// Homework
{
  const s = content("✎", "本周练习", "本周作业");
  table(s, [
    ["#", "题目", "平台 / 编号", "考点"],
    ["1", "小偷背包", { t: "23421", mono: true }, "0-1 背包"],
    ["2", "采药", { t: "02773", mono: true }, "0-1 背包模板"],
    ["3", "Coins", { t: "M01742", mono: true }, "完全 / 多重背包"],
    ["4", "Longest Ordered Subsequence", { t: "02533", mono: true }, "LIS"],
    ["5", "拦截导弹", { t: "M02945", mono: true }, "最长不上升子序列"],
    ["6", "最大上升子序列和", { t: "03532", mono: true }, "LIS 变形"],
    ["7", "公共子序列", { t: "02806", mono: true }, "LCS"],
    ["8", "打家劫舍", { t: "LC 198", mono: true }, "线性 DP"],
    ["9", "完全平方数", { t: "LC 279", mono: true }, "完全背包求最少个数"],
    [{ t: "10（选做）", color: C.goldText }, "最大子矩阵", { t: "M02766", mono: true }, "降维 + Kadane"],
    [{ t: "11（选做）", color: C.goldText }, "宠物小精灵之收服", { t: "04102", mono: true }, "二维费用背包"],
    [{ t: "12（选做）", color: C.goldText }, "圣诞老人的礼物", { t: "04110", mono: true }, "分数背包（贪心！）"],
    [{ t: "13（选做）", color: C.goldText }, "健身房 (dp)", { t: "21458", mono: true }, "「恰好装满」型"],
  ], 0.5, 1.0, 9.0, [1.1, 3.0, 1.7, 3.2], { fontSize: 9.8, rowH: 0.255, tight: true });
  text(s, "E / M 开头与纯数字编号：cs101.openjudge.cn；LC：leetcode.cn。", 0.5, 4.72, 9, 0.28, { fontSize: 10, color: C.muted, margin: 0 });
}

// Thinking questions
{
  const s = content("?", "本周练习 · 思考题", "思考题");
  const qs = [
    "0-1 背包的一维写法里，把倒序改成正序，`[(2,3)]`、容量 4 的答案会变成什么？为什么？",
    "`count_ways` 与 `count_permutations` 只差循环顺序，用 `coins=[1,2]`、`amount=3` 手工推两张表。",
    "二进制拆分把 k 拆成 `1,2,4,...` 和余数，为什么能凑出 0..k 的每个数？",
    "LIS 的 `tails` 数组在处理 `[10, 9, 2, 5, 3, 7, 101, 18]` 后是什么？它是一个真实的上升子序列吗？",
    "最大子矩阵为什么是 O(n³) 而不是 O(n⁴)？如果不做「列和压缩」会是多少？",
  ];
  qs.forEach((q, i) => {
    const y = 1.05 + i * 0.8;
    card(s, 0.5, y, 9.0, 0.68, i % 2 ? C.cream : C.code);
    numCircle(s, i + 1, 0.68, y + 0.15, 0.38, C.dark);
    s.addText(runs(q, { color: C.text }), { x: 1.25, y: y + 0.05, w: 8.05, h: 0.58, fontFace: FONT, fontSize: 12, margin: 0, isTextBox: true, valign: "middle", lineSpacingMultiple: 1.05 });
  });
}

summarySlide("本周小结", [
  ["背包三兄弟", "区别只在**遍历方向**：**0-1 倒序、完全正序、多重先二进制拆分再当 0-1**。"],
  ["循环顺序决定语义", "物品在外层 = 组合，容量在外层 = 排列；「恰好装满」要把非零位置初始化成 ±inf。"],
  ["贪心 vs 背包", "**物品可分割就贪心，不可分割才 DP**——圣诞老人的礼物是分数背包，不要写成 0-1。"],
  ["序列型 DP", "LIS 有 O(n²) 与 O(n log n) 两版；LCS / 编辑距离共用同一个二维框架。"],
  ["降维 + 对拍", "二维问题先降维（最大子矩阵 = 枚举行区间 + Kadane）；DP 写完**一定要和暴力对拍**。"],
]);

// Next week
{
  const s = sectionSlide("下周预告", "广度优先搜索（BFS）", "动态规划的收尾 + 图上的搜索\n广度优先搜索（BFS）与最短步数问题");
}

  await D.save(OUT);
})().catch((e) => { console.error(e); process.exit(1); });

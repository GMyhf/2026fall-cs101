// 第 10 周 区间问题与动态规划入门 —— 由 202611_ADS_W10_Intervals_DP_Intro.md 整理成的讲课 PPT。
// 生成：cd courseware/pptx_builder && node decks/w10_intervals_dp_intro.js ../202611_ADS_W10_Intervals_DP_Intro.pptx
// 页上所有的运行结果都在 Python 3.12 下实跑核对过（含 2000 组随机三角形对拍）；改代码时连同结果一起改。
const path = require("path");
const { createDeck } = require("../lib");

const OUT = process.argv[2] || path.join(__dirname, "..", "out", "202611_ADS_W10_Intervals_DP_Intro.pptx");

(async () => {
  const D = createDeck({ title: "计算概论（B）第 10 周 区间问题与动态规划入门", author: "Hongfei Yan" });
  const {
    pres, C, FONT, MONO, runs, text, bullets, card, codeBlock, consoleBlock, callout, table,
    cells, arrowLabel, pill, numCircle, titleSlide, sectionSlide, content, summarySlide,
  } = D;

// ---- slides（顶层不缩进，避免改动模板字符串里的代码缩进）----
// =====================================================================
// Cover
titleSlide({
  kicker: "计算概论（B） · 第 10 周 · 2026 Fall",
  title: "区间问题与动态规划入门",
  subtitle: "从贪心排序到状态设计",
  topics: "五类经典区间问题（合并 · 选不相交 · 选点 · 覆盖 · 分组）及其排序键\n差分数组：把「区间加」降到 O(1)\nDP 的两个前提：最优子结构 · 重叠子问题\n从暴力递归到记忆化再到递推 · DP 三要素 · 数字三角形 · 爬楼梯",
  footer: "Compiled by Hongfei Yan · 2026 Fall · github.com/GMyhf/2026fall-cs101",
});

// Three questions
{
  const s = content("?", "本周导引", "本周要回答三个问题");
  const qs = [
    ["一堆区间问题都像贪心，怎么知道按哪个端点排？", "**要「多」就按右端点排，要「合」或「盖」就按左端点排**——五种类型，两条排序键。"],
    ["贪心在哪失效？动态规划怎么接管？", "面额 `[1,3,4]` 凑 6，贪心给 3 枚，最优是 2 枚。**贪心失效的地方，DP 接管**。"],
    ["怎样才算把「状态」定义对了？", "**最优子结构是状态定义的性质，不是题目的性质**——十有八九「没有最优子结构」= 状态少了一维。"],
  ];
  qs.forEach((q, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.15, 2.85, 2.85, C.code);
    numCircle(s, i + 1, x + 0.2, 1.32, 0.46, C.dark);
    text(s, q[0], x + 0.2, 1.92, 2.5, 0.85, { fontSize: 13.5, bold: true, color: C.dark, margin: 0 });
    text(s, q[1], x + 0.2, 2.85, 2.5, 1.05, { fontSize: 11, margin: 0, lsm: 1.2 });
  });
}

// Roadmap
{
  const s = content("≡", "本周导引", "内容地图");
  const cols = [
    ["1  区间问题", ["1.1 合并区间", "1.2 选最多不相交区间 · 交换论证", "1.3 区间选点（引爆气球 · 雷达）", "1.4 区间覆盖（视频拼接）", "1.5 区间分组（堆 / 差分）", "1.6 差分数组：区间加、单点查"]],
    ["2  动态规划入门", ["2.1 一个贪心失效的反例", "2.2 DP 两个前提 · 最优子结构详解", "2.3 从暴力递归到滚动数组", "2.4 DP 三要素", "2.5 爬楼梯", "2.6 数字三角形", "2.7 最大连续子序列和（Kadane）"]],
    ["3  收尾", ["本周作业（11 题）", "思考题（5 题）", "本周小结", "下周预告：背包 · LIS · 二维 DP"]],
  ];
  cols.forEach((c, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.15, 2.85, 3.9, i === 1 ? C.cream : C.code);
    text(s, c[0], x + 0.2, 1.3, 2.5, 0.45, { fontSize: 17, bold: true, color: C.dark, margin: 0 });
    bullets(s, c[1], x + 0.15, 1.9, 2.6, 3.0, { fontSize: 11.5, gap: 9 });
  });
}

// ============================ PART 1 ============================
sectionSlide("Part 1", "区间问题", "解法几乎全是贪心 + 排序，全部难点是按什么排序\n合并 · 选最多不相交 · 选点 · 覆盖 · 分组 · 差分数组");

// 1 overview table
{
  const s = content("1", "1 区间问题", "五类经典区间问题");
  table(s, [
    ["类型", "排序键", "贪心策略"],
    ["1 合并区间", { t: "左端点升序", bold: true }, "能接上就接，接不上就另起"],
    ["2 选最多不相交区间", { t: "右端点升序", bold: true }, "右端点越早，留给后面的空间越大"],
    ["3 区间选点（最少点覆盖所有区间）", { t: "右端点升序", bold: true }, "点放在右端点"],
    ["4 区间覆盖（最少区间覆盖一段）", { t: "左端点升序", bold: true }, "在能接上的里选右端点最远的"],
    ["5 区间分组（最少组数使组内不重叠）", { t: "左端点升序", bold: true }, "用小根堆记录各组的当前右端点"],
  ], 0.5, 1.15, 9.0, [3.3, 1.9, 3.8], { fontSize: 13, rowH: 0.52 });
  callout(s, "一句话记法", "**要「多」就按右端点排，要「合」或「盖」就按左端点排。**", 0.5, 4.35, 9.0, 0.7, { fontSize: 13.5, fill: C.mint, tcolor: C.dark });
}

// 1.1 merge intervals
{
  const s = content("1.1", "1 区间问题", "合并区间");
  text(s, "**LeetCode 56. 合并区间**", 0.5, 1.0, 6.4, 0.3, { fontSize: 12.5, margin: 0 });
  codeBlock(s, `def merge(intervals):
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
print(merge([[1, 4], [4, 5]]))               # [[1, 5]]  —— 端点相接也算交叠`, 0.5, 1.35, 6.3, 3.05, { fontSize: 11, lang: "py" });
  callout(s, "⚠️ max 不能省", "`out[-1][1] = max(out[-1][1], hi)` 里的 `max` 不能省：`[[1,10],[2,3]]` 排序后仍是这个顺序，若直接赋值会把 10 缩成 3。", 7.0, 1.35, 2.5, 2.0, { fontSize: 10.5, fill: "FDF0EE", tcolor: C.bad });
  callout(s, "应用", "**M29947: 校门外的树又来了**——就是合并区间后统计被覆盖的长度。", 7.0, 3.5, 2.5, 0.9, { fontSize: 10.5 });
}

// 1.2 erase overlap
{
  const s = content("1.2", "1 区间问题", "选最多不相交区间");
  text(s, "**LeetCode 435. 无重叠区间**——求最少移除多少个区间，使剩下的互不重叠 = 总数 − 最多能保留的不相交区间数。", 0.5, 1.0, 9.0, 0.5, { fontSize: 12, lsm: 1.15 });
  codeBlock(s, `def erase_overlap_intervals(intervals):
    if not intervals:
        return 0
    intervals = sorted(intervals, key=lambda x: x[1])     # 按右端点
    keep, end = 1, intervals[0][1]
    for lo, hi in intervals[1:]:
        if lo >= end:                        # 不重叠 -> 保留
            keep += 1
            end = hi
    return len(intervals) - keep


print(erase_overlap_intervals([[1, 2], [2, 3], [3, 4], [1, 3]]))   # 1`, 0.5, 1.55, 5.6, 2.5, { fontSize: 10.5, lang: "py" });
  callout(s, "为什么按右端点排是对的（交换论证）", "设最优解的第一个区间是 X，右端点最小的区间是 A。把 X 换成 A，A 的右端点 ≤ X 的右端点，所以 A 之后能放的区间只多不少——**换成 A 不会变差**。", 6.25, 1.55, 3.25, 2.5, { fontSize: 11, fill: C.mint, tcolor: C.dark, gap: 6 });
  callout(s, "⚠️ 贪心用到了题目前提：start < end", "若允许退化区间 `[a,a]`，按右端点排的贪心会失效：`[[5,6],[6,6]]` 本可全保留，但贪心先选并列的 `[6,6]` 就放不下 `[5,6]` 了。**贪心的正确性总挂在题目约束上，换一道题要重新验。**", 0.5, 4.2, 9.0, 0.85, { fontSize: 10.5, fill: "FDF0EE", tcolor: C.bad, lsm: 1.1 });
}

// 1.3 arrows
{
  const s = content("1.3", "1 区间问题", "区间选点");
  text(s, "**LeetCode 452. 用最少数量的箭引爆气球**——每个气球是一个区间，一支箭射在坐标 x 上能引爆所有包含 x 的气球，求最少箭数。**和 1.2 是同一个算法**：按右端点排，箭射在当前区间的右端点。", 0.5, 1.0, 9.0, 0.75, { fontSize: 12, lsm: 1.15 });
  codeBlock(s, `def find_min_arrow_shots(points):
    if not points:
        return 0
    points = sorted(points, key=lambda x: x[1])
    arrows, end = 1, points[0][1]
    for lo, hi in points[1:]:
        if lo > end:                          # 射不到了，换一支箭
            arrows += 1
            end = hi
    return arrows


print(find_min_arrow_shots([[10, 16], [2, 8], [1, 6], [7, 12]]))   # 2`, 0.5, 1.85, 5.6, 2.5, { fontSize: 10.5, lang: "py" });
  callout(s, "和 1.2 的唯一区别", "这里 `lo > end`（端点相接算能射到），1.2 里是 `lo >= end`（端点相接算不重叠）。**边界的开闭要看题面，一个字之差。**", 6.25, 1.85, 3.25, 1.7, { fontSize: 11 });
  callout(s, "应用", "**M01328: Radar Installation**——把每个海岛转成「雷达可放置的 x 区间」，再做区间选点（下页）。", 6.25, 3.65, 3.25, 1.05, { fontSize: 11, fill: C.mint, tcolor: C.dark });
}

// 1.3 radar
{
  const s = content("1.3", "1 区间问题", "区间选点 · 应用：雷达安装");
  codeBlock(s, `import math


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
print(radar_installation(1, [(0, 2)]))                     # -1`, 0.5, 1.05, 6.3, 3.9, { fontSize: 9.6, lang: "py" });
  callout(s, "建模的关键一步", "每个海岛 (x, y) 被半径 d 的雷达覆盖，要求雷达放在 x 轴上——能覆盖它的雷达位置恰好是一段区间 `[x-half, x+half]`。**把「几何覆盖」翻译成「区间选点」，问题就变成 1.3 的模板。**", 7.0, 1.05, 2.5, 3.9, { fontSize: 11, fill: C.mint, tcolor: C.dark, lsm: 1.2 });
}

// 1.4 video stitching
{
  const s = content("1.4", "1 区间问题", "区间覆盖");
  text(s, "**LeetCode 1024. 视频拼接**——用最少的区间覆盖 [0, T]。**贪心**：按左端点排，在所有「左端点 ≤ 当前已覆盖到的位置」的区间里，选右端点最远的。", 0.5, 1.0, 9.0, 0.5, { fontSize: 12, lsm: 1.15 });
  codeBlock(s, `def video_stitching(clips, time):
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
print(video_stitching([[0, 1], [1, 2]], 5))                                    # -1`, 0.5, 1.5, 9.0, 2.65, { fontSize: 9.5, lang: "py" });
  callout(s, "应用", "**T27104: 世界杯只因**——每个位置 i 的摄像头覆盖 `[i-a[i], i+a[i]]`，求覆盖 `[1, n]` 的最少个数，是同一模型。", 0.5, 4.2, 9.0, 0.78, { fontSize: 10.5, fill: C.mint, tcolor: C.dark, gap: 0 });
}

// 1.5 grouping
{
  const s = content("1.5", "1 区间问题", "区间分组：堆 vs 差分");
  text(s, "把区间分成最少的组，使每组内部两两不重叠（等价于「最多有多少个区间在同一时刻重叠」）。", 0.5, 1.0, 9.0, 0.35, { fontSize: 12 });
  text(s, "**堆做法**：按左端点排，小根堆存各组当前右端点；能接在最早结束的组后面就接，否则新开一组。", 0.5, 1.35, 4.35, 0.55, { fontSize: 11, lsm: 1.15 });
  codeBlock(s, `import heapq


def min_groups(intervals):
    intervals = sorted(intervals, key=lambda x: x[0])
    heap = []                                 # 各组当前的右端点
    for lo, hi in intervals:
        if heap and heap[0] < lo:             # 最早结束的那组已空出来
            heapq.heapreplace(heap, hi)
        else:
            heapq.heappush(heap, hi)
    return len(heap)


print(min_groups([(1, 4), (2, 5), (6, 8), (3, 7)]))   # 3`, 0.5, 1.95, 4.35, 2.75, { fontSize: 9.3, lang: "py" });
  text(s, "**差分做法**（更快，O(n log n) 但常数更小）：把每个区间看成 +1 和 −1 事件，扫一遍求最大值。", 5.15, 1.35, 4.35, 0.55, { fontSize: 11, lsm: 1.15 });
  codeBlock(s, `def min_groups_diff(intervals):
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


print(min_groups_diff([(1, 4), (2, 5), (6, 8), (3, 7)]))   # 3`, 5.15, 1.95, 4.35, 2.75, { fontSize: 9.3, lang: "py" });
}

// 1.6 diff array
{
  const s = content("1.6", "1 区间问题", "差分数组：区间加、单点查");
  text(s, "**02808: 校门外的树**——长度 L 的路上有 L+1 棵树，移走 m 个区间内的树，问剩几棵。**差分数组**把「区间加」从 O(n) 降到 O(1)，最后一次前缀和还原。", 0.5, 1.0, 9.0, 0.6, { fontSize: 12, lsm: 1.15 });
  codeBlock(s, `def trees_left(L, ranges):
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


print(trees_left(500, [(150, 300), (100, 200), (470, 471)]))   # 298`, 0.5, 1.7, 5.6, 2.4, { fontSize: 10.5, lang: "py" });
  table(s, [
    ["操作", "朴素", "差分"],
    ["区间 [l, r] 加 v", "O(r−l+1)", { t: "O(1)", bold: true, color: C.ok }],
    ["m 次区间加后查询全部", "O(mn)", { t: "O(n + m)", bold: true, color: C.ok }],
  ], 6.25, 1.85, 3.25, [1.35, 0.95, 0.95], { fontSize: 10.5, rowH: 0.5 });
}

// ============================ PART 2 ============================
sectionSlide("Part 2", "动态规划入门", "贪心失效的地方，动态规划接管\nDP 的两个前提 · 从递归到递推 · DP 三要素");

// 2.1 counterexample
{
  const s = content("2.1", "2 动态规划入门", "从一个反例说起");
  card(s, 1.0, 1.3, 8.0, 2.0, C.code);
  text(s, "第 6 周见过：面额 [1, 3, 4] 凑 6", 1.3, 1.55, 7.4, 0.4, { fontSize: 15, bold: true, color: C.dark, margin: 0 });
  bullets(s, [
    "**贪心**（每次拿最大面额）：4 + 1 + 1，共 **3 枚**。",
    "**最优解**：3 + 3，共 **2 枚**。",
  ], 1.5, 2.05, 7.0, 1.1, { fontSize: 14, gap: 10 });
  callout(s, "结论", "**贪心失效的地方，动态规划接管。** 贪心每一步只看眼前最优，而 6 = 3+3 需要「回头看」——枚举所有可能的子结构，这正是 DP 要做的事。", 1.0, 3.5, 8.0, 1.15, { fontSize: 13, fill: C.mint, tcolor: C.dark, lsm: 1.2 });
}

// 2.2 two premises
{
  const s = content("2.2", "2 动态规划入门", "DP 的两个前提");
  table(s, [
    ["前提", "含义", "不成立会怎样"],
    ["最优子结构", "大问题的最优解由子问题的最优解构成", "转移方程写出来了，但答案是错的"],
    ["重叠子问题", "同一个子问题被反复求解", "能算对，但不如直接分治"],
  ], 0.5, 1.1, 9.0, [1.7, 3.6, 3.7], { fontSize: 12.5, rowH: 0.75 });
  callout(s, "重叠子问题：DP 与分治的分界线", "分治的子问题互不相同（归并排序把数组一切两半，左右两边毫无关系），DP 的子问题被反复用到（斐波那契的 `f(n-2)` 会被算无数次），所以 DP 要**把答案存下来**。这一条好判断：画一画调用树，看见重复的子树就是它。", 0.5, 3.05, 9.0, 1.95, { fontSize: 12, lsm: 1.2 });
}

// 2.2 optimal substructure is about state, not the problem
{
  const s = content("2.2", "2 动态规划入门", "最优子结构：状态定义的性质，不是题目的性质");
  callout(s, "本节最该记住的一句话", "**同一道题，状态定义得好就有最优子结构，少定义一维就没有**——所以「这题没有最优子结构，不能 DP」这句话，十有八九是「我的状态少了一维」。", 0.5, 1.0, 9.0, 0.95, { fontSize: 13, fill: C.mint, tcolor: C.dark, lsm: 1.2 });
  text(s, "数字三角形（从顶走到底，每步只能走**左下**或**右下**），现在加一个条件：**路径和必须是奇数**，求最大的那个。全部只有 8 条路径：", 0.5, 2.05, 9.0, 0.55, { fontSize: 12, lsm: 1.15 });
  text(s, "6\n7   9\n0   3   7\n7   4   2   0", 0.6, 2.6, 2.5, 1.9, { fontFace: MONO, fontSize: 17, align: "center", color: C.dark, lsm: 1.5 });
  table(s, [
    ["路径", "和", "路径", "和"],
    ["6→7→0→7", "20", "6→9→3→4", "22"],
    [{ t: "6→7→0→4", bold: true, color: C.ok }, { t: "17（奇）", bold: true, color: C.ok }, "6→9→3→2", "20"],
    ["6→7→3→4", "20", "6→9→7→2", "24"],
    ["6→7→3→2", "18", "6→9→7→0", "22"],
  ], 3.3, 2.6, 6.2, [1.7, 1.1, 1.7, 1.1], { fontSize: 11, rowH: 0.36, align: "center" });
  callout(s, "答案是 17", "可是按最自然的状态写出来的 DP，会告诉你**无解**——下一页看错在哪。", 3.3, 4.4, 6.2, 0.55, { fontSize: 11.5, gap: 0 });
}

// 2.2 naive dp wrong
{
  const s = content("2.2", "2 动态规划入门", "朴素状态为什么错");
  codeBlock(s, `def naive_odd(tri):
    """朴素状态：dp[i][j] = 到 (i, j) 的最大路径和，最后在底行里挑奇数。"""
    dp = [tri[0][:]]
    for i in range(1, len(tri)):
        dp.append([max(dp[i - 1][k] for k in (j - 1, j) if 0 <= k <= i - 1)
                   + tri[i][j] for j in range(i + 1)])
    odd = [v for v in dp[-1] if v % 2 == 1]
    return max(odd) if odd else -1`, 0.5, 1.05, 6.3, 2.15, { fontSize: 10, lang: "py" });
  consoleBlock(s, "naive_odd(TRI) -> -1\n（底行算出 [20, 22, 24, 22]，全是偶数）", 7.0, 1.05, 2.5, 1.1, 10.5);
  callout(s, "错在哪一步", "走到第 4 行那个 `4` 的时候，上一行两个候选路径和是 **13（奇）** 和 **18（偶）**，朴素状态只保留「最大的」18，把 13 扔了——而最终答案 `17 = 13 + 4`，要的恰恰是被扔掉的那一个。", 7.0, 2.3, 2.5, 2.2, { fontSize: 10.5, fill: "FDF0EE", tcolor: C.bad, lsm: 1.15 });
  callout(s, "结论", "`dp[i][j] = 到 (i,j) 的最大路径和` 这个状态，对这道题**没有最优子结构**：子问题的最优解（18），在父问题里不但没用，还挤掉了真正有用的次优解（13）。", 0.5, 3.4, 6.3, 1.55, { fontSize: 11.5, lsm: 1.15 });
}

// 2.2 fixed dp
{
  const s = content("2.2", "2 动态规划入门", "补一维就有了");
  codeBlock(s, `NEG = float('-inf')


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
    return best if best > NEG else -1`, 0.5, 1.05, 6.4, 3.55, { fontSize: 9.3, lang: "py" });
  callout(s, "只是状态多了一维", "同一道题、同一套转移思路，**只是状态多了一维，最优子结构就成立了**。「奇偶」就是父问题还需要知道、但朴素状态没记住的那一维——常见的还有：剩余容量、已用次数、上一步选了什么、当前是第几段。", 7.05, 1.05, 2.45, 3.55, { fontSize: 11, fill: C.mint, tcolor: C.dark, lsm: 1.2 });
}

// 2.2 verification
{
  const s = content("2.2", "2 动态规划入门", "验证：暴力枚举 + 2000 组随机对拍");
  codeBlock(s, `def brute_odd(tri):
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
print('朴素 DP  :', naive_odd(TRI))     # -1  —— 说「无解」，可是明明有
print('补一维后 :', fixed_odd(TRI))     # 17`, 0.5, 1.05, 6.3, 3.0, { fontSize: 9.6, lang: "py" });
  consoleBlock(s, "暴力枚举 : 17\n朴素 DP  : -1\n补一维后 : 17\n\n2000 组随机三角形：\n补一维后的 DP == 暴力枚举", 7.0, 1.05, 2.5, 2.4, 10.5);
  text(s, "再对 2000 组随机三角形做断言 `assert fixed_odd(t) == brute_odd(t)`，全部通过——**补一维后的 DP 与暴力枚举完全一致**。", 0.5, 4.2, 9.0, 0.85, { fontSize: 11.5, lsm: 1.2 });
}

// 2.2 how to check
{
  const s = content("2.2", "2 动态规划入门", "怎么检验自己的状态有没有最优子结构");
  callout(s, "写完状态定义，先问自己一句", "**把某个子问题的最优解换成一个次优解，父问题的答案有没有可能反而更好？** 能构造出这种情况，这个状态就没有最优子结构——而且几乎总是同一个病因：**状态少了一维**。", 0.5, 1.1, 9.0, 1.3, { fontSize: 13.5, fill: C.mint, tcolor: C.dark, lsm: 1.25 });
  text(s, "那一维正是「父问题还需要知道、但你没记住」的信息，常见的有：**剩余容量、已用次数、上一步选了什么、当前是第几段**。", 0.5, 2.55, 9.0, 0.7, { fontSize: 12.5, lsm: 1.2 });
  callout(s, "预告", "**第 12 周讲义 §1.1** 有一个**真的**没有最优子结构的例子（一般图上的最长简单路径）——那时你已经有图的语言，才好说清楚它为什么补多少维都救不回来。", 0.5, 3.5, 9.0, 1.4, { fontSize: 11.5, lsm: 1.15 });
}

// 2.3 recursion to dp part 1
{
  const s = content("2.3", "2 动态规划入门", "从递归到 DP：三步演化（1/2）");
  text(s, "以斐波那契为例（第 8 周见过），这次把它当作 DP 的模板来看。", 0.5, 1.0, 9.0, 0.35, { fontSize: 12.5 });
  text(s, "**第一步：暴力递归** —— O(2ⁿ)", 0.5, 1.4, 4.35, 0.3, { fontSize: 12, margin: 0 });
  codeBlock(s, `def f1(n):
    if n <= 2:
        return 1
    return f1(n - 1) + f1(n - 2)`, 0.5, 1.75, 4.35, 1.4, { fontSize: 11, lang: "py" });
  text(s, "**第二步：记忆化搜索（自顶向下）** —— O(n)", 5.15, 1.4, 4.35, 0.3, { fontSize: 12, margin: 0 });
  codeBlock(s, `def f2(n, memo=None):
    if memo is None:
        memo = {}
    if n <= 2:
        return 1
    if n in memo:
        return memo[n]
    memo[n] = f2(n - 1, memo) + f2(n - 2, memo)
    return memo[n]`, 5.15, 1.75, 4.35, 2.35, { fontSize: 10.3, lang: "py" });
  callout(s, "两者的关系", "`f2` 和 `f1` 转移逻辑完全一样，只多了一个 `memo` 字典——**贴近递归定义，最容易从暴力改过来**。", 0.5, 3.3, 4.35, 1.65, { fontSize: 11.5, fill: C.mint, tcolor: C.dark, lsm: 1.2 });
}

// 2.3 recursion to dp part 2
{
  const s = content("2.3", "2 动态规划入门", "从递归到 DP：三步演化（2/2）");
  text(s, "**第三步：递推填表（自底向上）** —— O(n)，无递归开销", 0.5, 1.0, 4.35, 0.3, { fontSize: 12, margin: 0 });
  codeBlock(s, `def f3(n):
    if n <= 2:
        return 1
    dp = [0] * (n + 1)
    dp[1] = dp[2] = 1
    for i in range(3, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]


print(f1(20), f2(20), f3(20))       # 6765 6765 6765`, 0.5, 1.35, 4.35, 2.55, { fontSize: 9.6, lang: "py" });
  text(s, "**第四步：滚动数组** —— O(1) 空间", 5.15, 1.0, 4.35, 0.3, { fontSize: 12, margin: 0 });
  codeBlock(s, `def f4(n):
    if n <= 2:
        return 1
    a, b = 1, 1
    for _ in range(n - 2):
        a, b = b, a + b
    return b


print(f4(20))                        # 6765`, 5.15, 1.35, 4.35, 2.15, { fontSize: 9.6, lang: "py" });
  consoleBlock(s, "6765 6765 6765\n6765", 5.15, 3.65, 4.35, 0.9, 11);
}

// 2.3 comparison
{
  const s = content("2.3", "2 动态规划入门", "四种写法对比");
  table(s, [
    ["写法", "时间", "空间", "优点", "缺点"],
    ["暴力递归", "指数", "O(n) 栈", "最好写", "太慢"],
    [{ t: "记忆化搜索", bold: true }, "O(n)", "O(n) + 栈", { t: "贴近递归定义，最容易从暴力改过来", bold: true }, "有栈深度风险"],
    [{ t: "递推", bold: true }, "O(n)", "O(n)", { t: "无栈风险，常数小", bold: true }, "要想清楚遍历顺序"],
    ["滚动数组", "O(n)", { t: "O(1)", bold: true, color: C.ok }, "省内存", "丢失中间状态"],
  ], 0.5, 1.1, 9.0, [1.5, 1.0, 1.3, 3.2, 2.0], { fontSize: 11, rowH: 0.62 });
  callout(s, "实战建议", "先写暴力递归想清楚转移，加上 `@lru_cache` 变成记忆化，确认正确后再（如果需要）翻译成递推。", 0.5, 3.95, 9.0, 0.8, { fontSize: 13, fill: C.mint, tcolor: C.dark });
}

// 2.4 three elements
{
  const s = content("2.4", "2 动态规划入门", "DP 三要素");
  text(s, "写任何 DP 题，先在纸上写清这三行：", 0.5, 1.1, 9.0, 0.4, { fontSize: 14 });
  const items = [
    ["1", "状态", "`dp[i]` 表示什么？（**必须是一句能说清的话**）"],
    ["2", "转移", "`dp[i]` 怎么由更小的状态算出来？"],
    ["3", "边界", "最小的状态是多少？答案在哪个状态里？"],
  ];
  items.forEach((it, i) => {
    const y = 1.7 + i * 1.05;
    card(s, 0.7, y, 8.6, 0.9, i % 2 ? C.cream : C.code);
    numCircle(s, i + 1, 0.9, y + 0.24, 0.42, C.dark);
    text(s, it[1], 1.55, y + 0.1, 1.8, 0.7, { fontSize: 17, bold: true, color: C.dark, valign: "middle", margin: 0 });
    s.addText(runs(it[2], { color: C.text }), { x: 3.4, y: y + 0.1, w: 5.7, h: 0.7, fontFace: FONT, fontSize: 13.5, margin: 0, isTextBox: true, valign: "middle" });
  });
}

// 2.5 climbing stairs
{
  const s = content("2.5", "2 动态规划入门", "例：爬楼梯");
  text(s, "**LeetCode 70. 爬楼梯**——每次爬 1 或 2 级，爬到第 n 级有多少种方法。", 0.5, 1.0, 9.0, 0.3, { fontSize: 12.5 });
  bullets(s, [
    "**状态**：`dp[i]` = 爬到第 i 级的方法数；",
    "**转移**：最后一步要么从 i−1 爬 1 级，要么从 i−2 爬 2 级 → `dp[i] = dp[i-1] + dp[i-2]`；",
    "**边界**：`dp[0] = 1`（站在地面，一种方法：什么都不做），`dp[1] = 1`。",
  ], 0.5, 1.35, 9.0, 1.1, { fontSize: 12.5, gap: 5 });
  codeBlock(s, `def climb_stairs(n):
    dp = [0] * (n + 1)
    dp[0] = 1
    for i in range(1, n + 1):
        dp[i] = dp[i - 1] + (dp[i - 2] if i >= 2 else 0)
    return dp[n]


print([climb_stairs(k) for k in range(1, 8)])    # [1, 2, 3, 5, 8, 13, 21]`, 0.5, 2.55, 5.6, 2.0, { fontSize: 10.5, lang: "py" });
  callout(s, "变形：每次可爬 1..k 级", "就是完全背包的雏形（第 11 周）：", 6.25, 2.55, 3.25, 0.55, { fontSize: 11, gap: 0 });
  codeBlock(s, `def climb_k(n, k):
    dp = [0] * (n + 1)
    dp[0] = 1
    for i in range(1, n + 1):
        dp[i] = sum(dp[max(0, i - k):i])
    return dp[n]


print(climb_k(5, 2), climb_k(5, 3))     # 8 13`, 6.25, 3.15, 3.25, 1.4, { fontSize: 9.3, lang: "py" });
}

// 2.6 triangle
{
  const s = content("2.6", "2 动态规划入门", "例：数字三角形");
  text(s, "**02760: 数字三角形**——从顶部走到底部，每步只能走到下一行相邻的两个数之一，求路径和最大值。", 0.5, 1.0, 9.0, 0.35, { fontSize: 12 });
  text(s, "7\n3   8\n8   1   0\n2   7   4   4\n4   5   2   6   5", 0.5, 1.4, 3.4, 2.3, { fontFace: MONO, fontSize: 15, align: "center", color: C.dark, lsm: 1.5 });
  bullets(s, [
    "**状态**：`dp[i][j]` = 从 (i, j) 走到底部的最大和；",
    "**转移**：`dp[i][j] = a[i][j] + max(dp[i+1][j], dp[i+1][j+1])`；",
    "**边界**：最后一行 `dp[n-1][j] = a[n-1][j]`；答案 `dp[0][0]`。",
  ], 4.05, 1.4, 5.45, 1.3, { fontSize: 11.5, gap: 6 });
  codeBlock(s, `def max_path_sum(tri):
    n = len(tri)
    dp = [row[:] for row in tri]          # ⚠️ 拷贝，不要改原数据
    for i in range(n - 2, -1, -1):
        for j in range(i + 1):
            dp[i][j] += max(dp[i + 1][j], dp[i + 1][j + 1])
    return dp[0][0]


tri = [[7], [3, 8], [8, 1, 0], [2, 7, 4, 4], [4, 5, 2, 6, 5]]
print(max_path_sum(tri))                  # 30`, 4.05, 2.85, 5.45, 2.15, { fontSize: 9.6, lang: "py" });
}

// 2.6 triangle rolling
{
  const s = content("2.6", "2 动态规划入门", "数字三角形 · 滚动数组");
  codeBlock(s, `def max_path_sum_1d(tri):
    dp = tri[-1][:]
    for i in range(len(tri) - 2, -1, -1):
        for j in range(i + 1):
            dp[j] = tri[i][j] + max(dp[j], dp[j + 1])
    return dp[0]


print(max_path_sum_1d(tri))               # 30`, 0.5, 1.1, 5.6, 2.05, { fontSize: 10.5, lang: "py" });
  callout(s, "为什么从下往上推比从上往下推简单", "从下往上时每个状态只有一个后继来源，不需要处理「边界上只有一个前驱」的特殊情况。**遇到路径 DP，先试从终点倒推。**", 6.25, 1.1, 3.25, 2.05, { fontSize: 11.5, fill: C.mint, tcolor: C.dark, lsm: 1.2 });
}

// 2.7 kadane
{
  const s = content("2.7", "2 动态规划入门", "例：最大连续子序列和（Kadane）");
  text(s, "第 6 周作为「复杂度对比」出现过，这里补上 DP 视角。", 0.5, 1.0, 9.0, 0.3, { fontSize: 12.5 });
  bullets(s, [
    "**状态**：`dp[i]` = **以 i 结尾**的最大子数组和（注意「以 i 结尾」这个限定）；",
    "**转移**：`dp[i] = max(a[i], dp[i-1] + a[i])`——要么另起炉灶，要么接上前面；",
    "**答案**：`max(dp)`，不是 `dp[n-1]`。",
  ], 0.5, 1.35, 9.0, 1.1, { fontSize: 12.5, gap: 5 });
  codeBlock(s, `def max_subarray(a):
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
print(max_subarray(t), max_subarray_o1(t))    # 6 6`, 0.5, 2.55, 5.6, 2.45, { fontSize: 10, lang: "py" });
  callout(s, "「以 i 结尾」是线性 DP 最常用的状态定义", "为什么不能定义成「前 i 个元素的最大子数组和」？因为那样无法知道「前 i 个的最优解是否以 i 结尾」，转移写不出来。**状态定义要让转移能写出来——这是 DP 最核心的技巧。**", 6.25, 2.55, 3.25, 2.45, { fontSize: 11, fill: C.mint, tcolor: C.dark, lsm: 1.2 });
}

// ============================ PART 3 ============================
// Homework
{
  const s = content("✎", "本周练习", "本周作业");
  table(s, [
    ["#", "题目", "平台 / 编号", "考点"],
    ["1", "合并区间", { t: "LC 56", mono: true }, "按左端点排"],
    ["2", "无重叠区间", { t: "LC 435", mono: true }, "按右端点排"],
    ["3", "用最少数量的箭引爆气球", { t: "LC 452", mono: true }, "区间选点"],
    ["4", "校门外的树", { t: "02808", mono: true }, "差分数组"],
    ["5", "校门外的树又来了", { t: "M29947", mono: true }, "合并区间"],
    ["6", "数字三角形", { t: "02760", mono: true }, "路径 DP"],
    ["7", "爬楼梯", { t: "LC 70", mono: true }, "线性 DP"],
    ["8", "Radar Installation", { t: "M01328", mono: true }, "区间选点建模"],
    [{ t: "9（选做）", color: C.goldText }, "视频拼接", { t: "LC 1024", mono: true }, "区间覆盖"],
    [{ t: "10（选做）", color: C.goldText }, "世界杯只因", { t: "T27104", mono: true }, "区间覆盖"],
    [{ t: "11（选做）", color: C.goldText }, "最大子矩阵", { t: "M02766", mono: true }, "前缀和 + Kadane（下周）"],
  ], 0.5, 1.05, 9.0, [1.1, 2.9, 1.8, 3.2], { fontSize: 10.8, rowH: 0.3, tight: true });
  text(s, "E / M / T 开头与纯数字编号：cs101.openjudge.cn；LC：leetcode.cn。", 0.5, 4.68, 9, 0.28, { fontSize: 10, color: C.muted, margin: 0 });
}

// Thinking questions
{
  const s = content("?", "本周练习 · 思考题", "思考题");
  const qs = [
    "为什么「选最多不相交区间」按右端点排是对的？写出完整的交换论证。",
    "1.2 用 `lo >= end` 而 1.3 用 `lo > end`，把两者互换会得到什么错误答案？各构造一组数据。",
    "差分数组能做「区间加、区间和查询」吗？需要几层前缀和？",
    "`max_subarray` 的状态若定义成「前 i 个元素中的最大子数组和」，转移方程写得出来吗？为什么？",
    "数字三角形从上往下推，需要额外处理哪两种边界？写出来对比一下代码长度。",
  ];
  qs.forEach((q, i) => {
    const y = 1.05 + i * 0.8;
    card(s, 0.5, y, 9.0, 0.68, i % 2 ? C.cream : C.code);
    numCircle(s, i + 1, 0.68, y + 0.15, 0.38, C.dark);
    s.addText(runs(q, { color: C.text }), { x: 1.25, y: y + 0.05, w: 8.05, h: 0.58, fontFace: FONT, fontSize: 12, margin: 0, isTextBox: true, valign: "middle", lineSpacingMultiple: 1.05 });
  });
}

summarySlide("本周小结", [
  ["区间问题", "= **排序 + 贪心**。**要「多」按右端点排，要「合 / 盖」按左端点排**；边界的开闭（`>` 还是 `>=`）看题面。"],
  ["差分数组", "把「区间加」降到 O(1)，最后一次前缀和还原。"],
  ["DP 两个前提", "**最优子结构 + 重叠子问题**。没有重叠就用分治；而**最优子结构是状态定义的性质，不是题目的性质**。"],
  ["演化路径", "**暴力递归 → 记忆化 → 递推 → 滚动数组**。实战从记忆化入手最稳。"],
  ["DP 三要素", "**状态、转移、边界**。**状态定义要让转移能写出来**——「以 i 结尾」往往比「前 i 个」更好用。"],
]);

// Next week
{
  const s = sectionSlide("下周预告", "动态规划（DP）专题", "背包问题（0-1 / 完全 / 多重）\n最长上升子序列（LIS）与二维 DP");
}

  await D.save(OUT);
})().catch((e) => { console.error(e); process.exit(1); });

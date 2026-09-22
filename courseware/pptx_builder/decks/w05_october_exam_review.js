// 第 5 周 10 月月考与阶段复习 —— 由 202609_ADS_W05_October_Exam_Review.md 整理成的讲课 PPT。
// 生成：cd courseware/pptx_builder && node decks/w05_october_exam_review.js ../202609_ADS_W05_October_Exam_Review.pptx
// 页上所有的代码运行结果都在 Python 3.12 下实跑核对过；改代码时连同结果一起改。
const path = require("path");
const { createDeck } = require("../lib");

const OUT = process.argv[2] || path.join(__dirname, "..", "out", "202609_ADS_W05_October_Exam_Review.pptx");

(async () => {
  const D = createDeck({ title: "计算概论（B）第 5 周 10 月月考与阶段复习", author: "Hongfei Yan" });
  const {
    pres, C, FONT, MONO, runs, text, bullets, card, codeBlock, consoleBlock, callout, table,
    cells, arrowLabel, pill, numCircle, titleSlide, sectionSlide, content, summarySlide,
  } = D;

// ---- slides（顶层不缩进，避免改动模板字符串里的代码缩进）----
// =====================================================================
// Cover
titleSlide({
  kicker: "计算概论（B） · 第 5 周 · 2026 Fall",
  title: "10 月月考与阶段复习",
  subtitle: "第 1–4 周知识清单自检 · 月考样卷 6 题 · 考后订正方法 · 考场策略",
  topics: "第 1–4 周知识清单自检（语法容器 · 计算机基础 · 复杂度）\n月考样卷：6 题，含题面 / 样例 / 参考解答 / 评分要点\n备选题库 · 考后订正的三分类方法\n机房考试流程与考场策略",
  footer: "Compiled by Hongfei Yan · 2026 Fall · github.com/GMyhf/2026fall-cs101",
});

// Positioning
{
  const s = content("?", "本周导引", "月考不是筛人，是体检");
  card(s, 0.5, 1.1, 9.0, 0.85, C.dark);
  text(s, "它要在 11 月的核心内容（DP、搜索）开始之前，把三件事暴露出来：", 0.75, 1.1, 8.5, 0.85, { fontSize: 15, bold: true, color: C.white, valign: "middle", margin: 0 });
  const qs = [
    ["语法关", "能不能在**没有 AI、没有搜索**的情况下，写出正确的循环、分支、字符串处理？"],
    ["速度关", "同样的思路，112 分钟能写完 6 题还是 2 题？打字与编辑速度够不够？"],
    ["调试关", "看到 WA 能不能自己造数据定位？有没有独立排错的能力？"],
  ];
  qs.forEach((q, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 2.15, 2.85, 1.9, C.code);
    numCircle(s, i + 1, x + 0.2, 2.32, 0.46, C.dark);
    text(s, q[0], x + 0.2, 2.92, 2.5, 0.4, { fontSize: 15, bold: true, color: C.dark, margin: 0 });
    text(s, q[1], x + 0.2, 3.3, 2.5, 0.65, { fontSize: 11, margin: 0, lsm: 1.15 });
  });
  callout(s, "考砸了不要紧，考完不订正才要紧", "本周讲义第 5 节给了订正的具体方法——分类、关题解重写、记录错误类型。", 0.5, 4.25, 9.0, 0.9, { fontSize: 12.5, fill: C.mint, tcolor: C.dark });
}

// Roadmap
{
  const s = content("≡", "本周导引", "内容地图");
  const cols = [
    ["1  自检", ["1 月考的定位：体检的三件事", "1.1 考试形式：112 分钟 / 6 题", "2 第 1–4 周知识清单（逐条打勾）", "2.4 常用模板（写进 cheat sheet）"]],
    ["2  样卷", ["3 月考样卷：难度梯度 T1→T6", "每题：题面 · 参考解答 · 评分要点", "4 备选题库（可替换样卷任意一题）"]],
    ["3  之后", ["5 考后订正：三分类 + 重写规则", "5.3 建立自己的错题类型表", "6 考场策略：112 分钟时间预算", "7 本周作业 · 小结"]],
  ];
  cols.forEach((c, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.15, 2.85, 3.9, i === 1 ? C.cream : C.code);
    text(s, c[0], x + 0.2, 1.3, 2.5, 0.45, { fontSize: 20, bold: true, color: C.dark, margin: 0 });
    bullets(s, c[1], x + 0.15, 1.9, 2.6, 3.0, { fontSize: 12, gap: 10 });
  });
}

// ============================ PART 1 ============================
sectionSlide("Part 1", "月考的定位", "112 分钟 / 6 题，与期末机考同规格\n考试形式 · 三件要暴露的事");

// 1.1 exam format
{
  const s = content("1.1", "1 月考的定位", "考试形式");
  table(s, [
    ["项目", "说明"],
    ["地点", "机房（具体安排以通知为准）"],
    [{ t: "时长", bold: true }, { t: "112 分钟", bold: true, color: C.ok }],
    [{ t: "题量", bold: true }, { t: "6 题", bold: true, color: C.ok }],
    ["平台", "OpenJudge（cs101 小组）"],
    ["语言", "Python 3 为主，允许 C++"],
    ["允许", "一页 A4 手写 cheat sheet"],
  ], 0.5, 1.1, 9.0, [1.6, 7.4], { fontSize: 13, rowH: 0.42 });
  callout(s, "禁止", "**任何 AI 工具**（含本地模型、IDE 智能补全插件）、联网查询、任何形式的交流。", 0.5, 4.12, 4.35, 0.85, { fontSize: 12, fill: "FDF0EE", tcolor: C.bad });
  callout(s, "学术诚信", "**无法解释自己提交的代码**，按学术不端处理。", 5.15, 4.12, 4.35, 0.85, { fontSize: 12, fill: "FDF0EE", tcolor: C.bad });
}

// ============================ PART 2 ============================
sectionSlide("Part 2", "第 1–4 周知识清单", "逐条打勾，打不了勾的就是这周要补的\n语法与容器 · 计算机基础 · 复杂度 · 常用模板");

// 2.1 syntax checklist
{
  const s = content("2.1", "2 知识清单 · 语法与容器", "逐条打勾");
  bullets(s, [
    "三种输入形态：`int(input())` / `map(int, input().split())` / `list(map(...))`",
    "不定行输入：`for line in sys.stdin` 与 `try/except EOFError`",
    "输出格式：`print(*a)`、`f\"{x:.2f}\"`、`sep=` / `end=`",
    "字符串：`strip` `split` `join` `replace` `find` `[::-1]` `swapcase`",
    "列表：`append` `pop` `sort` `sorted(key=)` 切片、列表推导式",
    "二维列表正确建法 `[[0]*n for _ in range(m)]`（不能用 `[[0]*n]*m`）",
    "`dict` / `set` / `Counter` / `defaultdict` 的基本用法",
    "`enumerate` / `zip` / `range(start, stop, step)`",
  ], 0.5, 1.1, 9.0, 3.9, { fontSize: 13.5, gap: 10 });
}

// 2.2 computer basics checklist
{
  const s = content("2.2", "2 知识清单 · 计算机基础", "第 3 周内容自检");
  bullets(s, [
    "进制转换：`bin/oct/hex`、`int(s, base)`、除基取余",
    "补码：负数 = 取反加一；n 位范围 −2ⁿ⁻¹ ~ 2ⁿ⁻¹−1",
    "位运算：`&` `|` `^` `<<` `>>`；`n & (n-1)`、`n & 1`",
    "ASCII：`'0'=48` `'A'=65` `'a'=97`，`ord` / `chr`",
    "浮点：不能用 `==` 比较；`int(x**0.5)` 要校正（本周 T4 会用到）",
  ], 0.5, 1.1, 9.0, 2.6, { fontSize: 14, gap: 14 });
  callout(s, "自检打不了勾？", "回第 3 周讲义《计算机原理（1/2）》对应小节重看一遍，本周样卷的 T4、T6 直接考这些。", 0.5, 4.0, 9.0, 0.95, { fontSize: 12.5, fill: C.mint, tcolor: C.dark });
}

// 2.3 complexity checklist
{
  const s = content("2.3", "2 知识清单 · 复杂度", "第 4 周内容自检");
  bullets(s, [
    "能说出 list / set / dict 各操作的复杂度",
    "能从 n 的范围倒推可用的复杂度",
    "知道 `x in lst`、`lst.pop(0)`、循环内字符串拼接是 O(n) 的坑",
    "会写埃氏筛",
  ], 0.5, 1.1, 9.0, 2.2, { fontSize: 14.5, gap: 16 });
  callout(s, "本周样卷怎么用到", [
    "T3：`x in lst` 逐个统计会稳定 TLE，要用 `Counter`。",
    "T4：现场试除到 √x 会 TLE，要先筛。",
    "T2：`+=` 拼接字符串是 O(n²)，要用 `''.join()`。",
  ], 0.5, 3.5, 9.0, 1.45, { fontSize: 12, gap: 6 });
}

// 2.4 templates 1
{
  const s = content("2.4", "2 知识清单 · 常用模板", "写进 cheat sheet（1/3）：快速输入与最大公约数");
  codeBlock(s, `# 1) 快速输入
import sys
data = sys.stdin.read().split()

# 2) 多组数据直到 EOF
for line in sys.stdin:
    line = line.strip()
    if not line:
        continue

# 3) 最大公约数
def gcd(a, b):
    while b:
        a, b = b, a % b
    return a`, 0.5, 1.15, 9.0, 3.35, { fontSize: 12, lang: "py" });
  text(s, "`sys.stdin.read().split()` 是本课**唯一**推荐的大数据量读入方式；`gcd` 是数论题最常见的子过程，第 6 周开始会反复用到。", 0.5, 4.6, 9.0, 0.5, { fontSize: 11, color: C.muted, lsm: 1.1 });
}

// 2.4 templates 2
{
  const s = content("2.4", "2 知识清单 · 常用模板", "写进 cheat sheet（2/3）：素数筛");
  codeBlock(s, `# 4) 素数筛（埃拉托斯特尼筛法）
def sieve(n):
    p = [True] * (n + 1)
    p[0] = p[1] = False
    i = 2
    while i * i <= n:
        if p[i]:
            for j in range(i * i, n + 1, i):
                p[j] = False
        i += 1
    return p`, 0.5, 1.15, 9.0, 2.55, { fontSize: 12, lang: "py" });
  callout(s, "为什么从 i*i 开始标记", "小于 i*i 的 i 的倍数（如 2i、3i、…）已经被更小的质因子标记过了；从 `i*i` 开始能省掉大量重复标记，这是埃氏筛复杂度 O(n log log n) 的关键。", 0.5, 3.85, 9.0, 1.2, { fontSize: 12, fill: C.mint, tcolor: C.dark });
}

// 2.4 templates 3
{
  const s = content("2.4", "2 知识清单 · 常用模板", "写进 cheat sheet（3/3）：排序与前缀和");
  codeBlock(s, `# 5) 按多关键字排序（先按第 2 项升序，再按第 1 项降序）
rows.sort(key=lambda r: (r[1], -r[0]))

# 6) 二维前缀和
pre = [[0] * (n + 1) for _ in range(m + 1)]
for i in range(m):
    for j in range(n):
        pre[i + 1][j + 1] = pre[i][j + 1] + pre[i + 1][j] - pre[i][j] + a[i][j]`, 0.5, 1.1, 9.0, 1.75, { fontSize: 12, lang: "py" });
  callout(s, "排序键为什么这么写", "`-kv[1]` 让「按次数降序」也能用 `sort()` 的默认升序实现——数值取负，字符串没法取负，所以字典序仍升序、次数用负号降序，两个方向一次搞定。", 0.5, 3.1, 9.0, 1.1, { fontSize: 12 });
  callout(s, "前缀和的含义", "`pre[i][j]` 是矩阵左上角 (0,0) 到 (i-1,j-1) 的和；查询任意子矩阵和只需 O(1)。第 6 周会展开讲。", 0.5, 4.35, 9.0, 0.85, { fontSize: 11.5, fill: C.mint, tcolor: C.dark });
}

// ============================ PART 3 ============================
sectionSlide("Part 3", "月考样卷", "三次月考与期末上机考试同一规格：6 题 / 112 分钟\n难度梯度 T1 → T6");

// T-028: 2025-10-09 真实 OpenJudge 比赛，六题均已联网核实，题号登记进 VERIFIED_TITLES。
// 3.0 difficulty ladder
{
  const s = content("3.0", "3 月考样卷", "难度梯度：从签到到综合");
  const rows = [
    ["E29895", "★☆☆☆☆", "分解因数 · 试除", "真实题", C.ok],
    ["E29940", "★★☆☆☆", "机器猫斗恶龙 · 贪心", "真实题", C.ok],
    ["M29917", "★★★☆☆", "牛顿迭代法 · 浮点", "真实题", C.gold],
    ["M29918", "★★★☆☆", "求亲和数 · 数论", "真实题", C.gold],
    ["M29949", "★★★★☆", "贪婪的哥布林 · 分数背包", "真实题", C.bad],
    ["T29947", "★★★★☆", "校门外的树又来了 · 区间", "真实题", C.bad],
  ];
  rows.forEach((r, i) => {
    const y = 1.15 + i * 0.58;
    pill(s, r[0], 0.5, y, 0.7, 0.44, C.dark, C.white, 13);
    text(s, r[1], 1.35, y, 1.5, 0.44, { fontSize: 15, color: C.gold, valign: "middle", margin: 0 });
    text(s, r[2], 3.0, y, 4.0, 0.44, { fontSize: 12.5, valign: "middle", margin: 0 });
    pill(s, r[3], 7.2, y + 0.02, 1.75, 0.4, r[4], C.white, 11);
  });
  text(s, "月考的意义就在于：提前把机考的题量与时间压力演练一遍——三次月考与期末上机考试**同一规格**：**6 题 / 112 分钟**。", 0.5, 4.7, 9.0, 0.45, { fontSize: 11.5, color: C.muted, lsm: 1.1 });
}

// T1
{
  const s = content("T1", "3 月考样卷 · T1 E29895 分解因数", "签到题：试除找最小因子");
  text(s, "给定合数 n（1 ≤ n ≤ 10¹⁰），求它的最大真因数（除 1、n 本身外的最大因数）。", 0.5, 1.05, 9, 0.35, { fontSize: 12.5 });
  codeBlock(s, `n = int(input())
p = 2
while n % p:
    p += 1
print(n // p)`, 0.5, 1.55, 5.6, 1.5, { fontSize: 13, lang: "py" });
  consoleBlock(s, "输入: 21\n输出: 7", 0.5, 3.2, 5.6, 0.85, 11);
  callout(s, "为什么 n // p 就是最大因子", "p 从 2 开始逐个试除，第一个整除 n 的 p 就是 n 的最小因子；因数成对出现，最小因子对应的另一半就是最大真因子 n/p。", 6.3, 1.55, 3.2, 2.5, { fontSize: 10.5 });
  text(s, "题目：cs101.openjudge.cn/practice/29895/", 0.5, 4.25, 9, 0.3, { fontSize: 10, color: C.muted });
}

// T2
{
  const s = content("T2", "3 月考样卷 · T2 E29940 机器猫斗恶龙", "前缀和：血量全程为正");
  text(s, "依次经过 n 个关卡，正数回血、负数扣血；任何时刻血量必须为正数。求最小的正整数初始血量（n ≤ 10⁵）。", 0.5, 1.05, 9, 0.5, { fontSize: 12, lsm: 1.1 });
  codeBlock(s, `import sys
a = list(map(int, sys.stdin.buffer.read().split()))
cur = mn = 0
for x in a[1:1 + a[0]]:
    cur += x
    mn = min(mn, cur)
print(1 - mn)`, 0.5, 1.7, 5.6, 1.9, { fontSize: 11, lang: "py" });
  consoleBlock(s, "输入: 5 / -200 -300 1000 -100 -100\n输出: 501", 0.5, 3.75, 5.6, 0.85, 10.5);
  callout(s, "前缀和的最小值就是最大跌幅", "cur 是相对初始血量的累计变化，mn 是过程中最深的一次跌幅（负数）。初始血量只要 ≥ 1 - mn，全程血量就能保持 > 0。", 6.3, 1.7, 3.2, 2.9, { fontSize: 10.5 });
}

// T3
{
  const s = content("T3", "3 月考样卷 · T3 M29917 牛顿迭代法", "迭代逼近、浮点终止条件");
  text(s, "对每个正数 a（读到 EOF 为止），用初值 x=1 和迭代式 x = (x + a/x) / 2 求平方根；相邻两次近似值之差 ≤ 1e-6 时停止，输出迭代次数与两位小数结果。", 0.5, 1.02, 9, 0.6, { fontSize: 11.5, lsm: 1.1 });
  codeBlock(s, `import sys
for token in sys.stdin.read().split():
    a, x, cnt = float(token), 1.0, 0
    while True:
        y = (x + a / x) / 2
        cnt += 1
        if abs(y - x) <= 1e-6:
            print(cnt, f'{y:.2f}')
            break
        x = y`, 0.5, 1.7, 9.0, 2.15, { fontSize: 11, lang: "py" });
  text(s, "样例输入：`12` / `25` / `144`", 0.5, 3.95, 4.85, 0.28, { fontSize: 10.5, color: C.muted });
  consoleBlock(s, "6 3.46 / 7 5.00 / 8 12.00", 0.5, 4.25, 4.85, 0.55, 11);
  callout(s, "不定行输入用 sys.stdin.read().split()", "题目没给数据组数，逐个 token 处理到 EOF；每个数独立跑一次牛顿迭代，互不影响。", 5.55, 3.95, 3.95, 0.85, { fontSize: 9.5 });
}

// T4
{
  const s = content("T4", "3 月考样卷 · T4 M29918 求亲和数", "倍数筛：真因数和");
  text(s, "若 a 的真因数和 = b、b 的真因数和 = a（a ≠ b），称 (a, b) 为亲和数对。给定 n（≤ 100000），按较小数递增输出所有 a ≤ n 的亲和数对。", 0.5, 1.05, 9, 0.5, { fontSize: 11.5, lsm: 1.1 });
  codeBlock(s, `import sys
n = int(sys.stdin.buffer.read())
s = [0] * (n + 1)
for d in range(1, n // 2 + 1):
    for x in range(2 * d, n + 1, d):
        s[x] += d
for a in range(2, n + 1):
    b = s[a]
    if a < b <= n and s[b] == a:
        print(a, b)`, 0.5, 1.7, 5.7, 2.45, { fontSize: 10.5, lang: "py" });
  text(s, "样例输入：`1500`", 6.35, 1.7, 3.15, 0.3, { fontSize: 10.5, color: C.muted });
  consoleBlock(s, "220 284\n1184 1210", 6.35, 2.02, 3.15, 0.9, 10.5);
  callout(s, "倍数筛，不是逐个试除", "对每个因子 d，把它加到所有 d 的倍数（除自身外）的累加器上——s[x] 最终就是 x 的真因数和，是 O(n log n)，比逐个试除到 √x 快得多。", 6.35, 3.0, 3.15, 2.15, { fontSize: 10 });
}

// T5
{
  const s = content("T5", "3 月考样卷 · T5 M29949 贪婪的哥布林", "分数背包：按单位价值贪心");
  text(s, "n 堆矿石，每堆价值 v、重量 w，可任意分割；背包承重 M。求能装下的最大总价值。", 0.5, 1.05, 9, 0.35, { fontSize: 12 });
  codeBlock(s, `import sys
d = list(map(int, sys.stdin.buffer.read().split()))
n, cap = d[:2]
items = sorted([(d[i] / d[i + 1], d[i], d[i + 1])
                for i in range(2, 2 * n + 2, 2)], reverse=True)
ans = 0.0
for ratio, value, weight in items:
    take = min(cap, weight)
    ans += ratio * take
    cap -= take
    if cap == 0:
        break
print(f'{ans:.2f}')`, 0.5, 1.5, 9.0, 2.3, { fontSize: 10.5, lang: "py" });
  consoleBlock(s, "输入: 3 50 / 60 10 / 100 20 / 120 30\n输出: 240.00", 0.5, 3.95, 4.35, 0.85, 10.5);
  callout(s, "可分割背包：贪心一定最优", "按单位重量价值 v/w 从高到低取，能整堆拿就整堆拿，拿不下就切一部分——矿石可分割，不存在 0-1 背包那种「拿了就放不下别的」的取舍。", 5.0, 3.95, 4.5, 0.95, { fontSize: 9.5 });
}

// T6
{
  const s = content("T6", "3 月考样卷 · T6 T29947 校门外的树又来了", "区间合并、边界计数");
  text(s, "0..L 共 L+1 棵树，给出 M 个闭区间并移除区间内的树，求剩余树的数量。排序后合并重叠 / 相邻区间，区间长度按 r-l+1 计算。", 0.5, 1.05, 9, 0.5, { fontSize: 11.5, lsm: 1.1 });
  codeBlock(s, `import sys
d = list(map(int, sys.stdin.buffer.read().split()))
L, m = d[:2]
seg = sorted(tuple(sorted(d[i:i + 2])) for i in range(2, 2 * m + 2, 2))
removed = 0
left = right = None
for l, r in seg + [(10**18, 10**18)]:
    if left is None:
        left, right = l, r
    elif l <= right + 1:
        right = max(right, r)
    else:
        removed += right - left + 1
        left, right = l, r
print(L + 1 - removed)`, 0.5, 1.7, 5.7, 2.8, { fontSize: 10, lang: "py" });
  text(s, "样例输入：`500 3` / `150 300` / `100 200` / `470 471`", 6.35, 1.7, 3.15, 0.55, { fontSize: 10, color: C.muted, lsm: 1.1 });
  consoleBlock(s, "298", 6.35, 2.35, 3.15, 0.65, 11);
  callout(s, "l ≤ right + 1 才算相邻要合并", "两个区间即使不重叠，只要端点相邻（中间没有树），也要合并成一段一起统计，否则会重复扣同一棵树，或漏掉紧挨着的区间。", 6.35, 3.1, 3.15, 2.0, { fontSize: 9.5 });
}

// ============================ PART 4 ============================
sectionSlide("Part 4", "备选题库与考后订正", "可替换样卷任意一题\n三分类 · 重写规则 · 错题类型表");

// 4 alternative problems
{
  const s = content("4", "4 备选题库", "可替换样卷中的任意一题");
  table(s, [
    ["考点", "题目", "编号"],
    ["输入输出 / 分支", "鸡兔同笼", { t: "E02750", mono: true }],
    ["分支 / 读题", "判断闰年", { t: "02733", mono: true }],
    ["循环 / 取模", "与 7 无关的数", { t: "02701", mono: true }],
    ["字符串", "大小写字母互换", { t: "E02689", mono: true }],
    ["字符串 / 模拟", "文字排版", { t: "E06374", mono: true }],
    ["字典 / 排序", "生日相同", { t: "E02724", mono: true }],
    ["素数", "验证「歌德巴赫猜想」", { t: "E03143", mono: true }],
    ["数学 / 枚举", "完美立方", { t: "M02810", mono: true }],
    ["模拟", "2050 年成绩计算", { t: "E18176", mono: true }],
    ["进制", "十进制到八进制", { t: "E02734", mono: true }],
  ], 0.5, 1.1, 9.0, [2.6, 4.3, 2.1], { fontSize: 11, rowH: 0.365, tight: true });
}

// 5.1 three categories
{
  const s = content("5.1", "5 考后订正 · 唯一有效的方法", "三分类");
  text(s, "考完试，按下面的流程走一遍。**只看题解不重写，等于没订正。**", 0.5, 1.05, 9, 0.35, { fontSize: 13 });
  table(s, [
    ["类别", "表现", "处理"],
    [{ t: "不会", bold: true, color: C.bad }, "看完题解才懂思路", "重做同类题 3 道"],
    [{ t: "会但写错", bold: true, color: C.gold }, "思路对，代码有 bug", "找出 bug 的**类型**，写进 cheat sheet"],
    [{ t: "会但没时间", bold: true, color: C.green }, "剩 10 分钟才开始", "练打字 + 练模板默写"],
  ], 0.5, 1.5, 9.0, [1.7, 2.8, 4.5], { fontSize: 12.5, rowH: 0.65 });
  callout(s, "5.2 重写规则", "**关掉题解，从空文件重写，一次通过。**做不到就再来一遍。", 0.5, 3.95, 9.0, 0.85, { fontSize: 13, fill: C.mint, tcolor: C.dark });
}

// 5.3 error type table
{
  const s = content("5.3", "5 考后订正 · 建立错题类型表", "记类型，不记题目");
  text(s, "不要记「第 3 题错了」，要记「**我在多关键字排序时容易只写一个 key**」。类型是可迁移的，具体题目不是。", 0.5, 1.05, 9, 0.5, { fontSize: 12.5, lsm: 1.15 });
  table(s, [
    ["我的高频错误", "触发场景", "对策"],
    ["忘 `strip()`", "字符串比较", "读入统一 `.strip()`"],
    ["二维数组别名", "建网格", "一律 `[[0]*n for _ in range(m)]`"],
    ["用 `in` 查 list", "判存在", "建 `set`"],
    ["浮点比较", "开方 / 除法", "转整数或 `isclose`"],
    ["边界 n=1", "循环 / 切片", "提交前手测 n=1"],
  ], 0.5, 1.75, 9.0, [2.7, 2.5, 3.8], { fontSize: 12, rowH: 0.48 });
}

// 6 exam strategy timeline
{
  const s = content("6", "6 考场策略", "112 分钟 / 6 题的时间预算");
  const seg = [["0–5", "通读", 0.4], ["5–15", "T1", 0.8], ["15–40", "T2·T3", 2.0], ["40–70", "T4", 2.4], ["70–102", "T5·T6", 2.6], ["102–112", "检查", 0.8]];
  let x = 0.5;
  const colors = [C.muted, C.ok, C.green, C.gold, C.bad, C.dark];
  seg.forEach((sgm, i) => {
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.3, w: sgm[2], h: 0.65, fill: { color: colors[i] }, line: { color: C.white, width: 1 } });
    text(s, sgm[1], x, 1.32, sgm[2], 0.3, { fontSize: 11, bold: true, color: C.white, align: "center", margin: 0 });
    text(s, sgm[0] + " min", x, 1.62, sgm[2], 0.28, { fontSize: 9, color: C.white, align: "center", margin: 0 });
    x += sgm[2];
  });
  bullets(s, [
    "**前 5 分钟通读全部题目**，按预估难度排序，先做有把握的。",
    "**看数据范围定复杂度**，再动手（第 4 周 3.4 节）。",
    "**样例过了先交**——OJ 反馈比自己盯屏幕快。",
    "**WA 就造数据**：n=1、全相同、最大值、最小值。",
    "**卡满 15 分钟换题**，回头再看；**留 10 分钟**检查输出格式：多余空格、换行、精度。",
  ], 0.5, 2.3, 9.0, 2.6, { fontSize: 12.5, gap: 8 });
}

// 7 homework
{
  const s = content("7", "本周作业", "");
  table(s, [
    ["#", "任务", "说明"],
    ["1", "完成月考", "机房，112 分钟，6 题"],
    ["2", "订正全部未 AC 题", "按第 5 节的三分类 + 重写"],
    ["3", "提交一份错题类型表", "至少 5 条，格式见 5.3"],
    ["4", "更新自己的 cheat sheet", "一页 A4，双面，手写"],
    ["5", "完美立方", { t: "M02810", mono: true }],
    ["6", "细菌繁殖", { t: "02712", mono: true }],
    ["7", "文字排版", { t: "E06374", mono: true }],
  ], 0.5, 1.1, 9.0, [0.6, 3.2, 5.2], { fontSize: 13, rowH: 0.48 });
}

summarySlide("本周小结", [
  ["体检", "月考是体检：暴露**语法关、速度关、调试关**三处短板。"],
  ["自检清单", "打不了勾的地方，就是本周的复习重点。"],
  ["难度梯度", "签到 → 字符串 → 字典排序 → 复杂度意识 → 综合模拟 → 补码位运算，规格与期末机考一致：**6 题 / 112 分钟**。"],
  ["订正方法", "唯一有效的方法：**分类 → 关题解重写 → 记录错误类型**。"],
  ["考场六条", "通读、看范围、早提交、造数据、按时换题、查格式。"],
]);

// Next week
{
  const s = sectionSlide("下周预告", "矩阵、排序与贪心", "进入 10 月的「上强度」阶段，第一次系统地\n认识时间复杂度在实战中的作用");
}

  await D.save(OUT);
})().catch((e) => { console.error(e); process.exit(1); });

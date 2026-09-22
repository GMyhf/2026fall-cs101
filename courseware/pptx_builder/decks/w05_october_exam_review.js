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

// 3.0 difficulty ladder
{
  const s = content("3.0", "3 月考样卷", "难度梯度：从签到到综合");
  const rows = [
    ["T1", "★☆☆☆☆", "签到：读入与格式化输出", "95% 应 AC", C.ok],
    ["T2", "★★☆☆☆", "字符串处理", "75% AC", C.ok],
    ["T3", "★★★☆☆", "字典 / 排序 + 多关键字", "55% AC", C.gold],
    ["T4", "★★★☆☆", "复杂度意识：必须用筛或前缀和", "45% AC", C.gold],
    ["T5", "★★★★☆", "综合模拟，边界多", "25% AC", C.bad],
    ["T6", "★★★★☆", "补码 / 位运算，符号边界密集", "20% AC", C.bad],
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
  const s = content("T1", "3 月考样卷 · T1 成绩转换", "签到题：输入输出、分支、格式化");
  text(s, "读入 n 个百分制成绩，输出等级：≥90→A，≥80→B，≥70→C，≥60→D，否则 E；最后一行输出通过（≥60）人数占比，保留两位小数。", 0.5, 1.05, 9, 0.55, { fontSize: 12, lsm: 1.15 });
  codeBlock(s, `n = int(input())
scores = list(map(int, input().split()))
grade = lambda s: 'A' if s >= 90 else 'B' if s >= 80 else 'C' if s >= 70 else 'D' if s >= 60 else 'E'
print('\\n'.join(grade(s) for s in scores))
print(f"{sum(1 for s in scores if s >= 60) * 100 / n:.2f}")`, 0.5, 1.7, 9.0, 1.4, { fontSize: 11, lang: "py" });
  text(s, "样例输入：`5` / `95 83 71 60 40`", 0.5, 3.15, 4.35, 0.3, { fontSize: 10.5, color: C.muted });
  consoleBlock(s, "A\nB\nC\nD\nE\n80.00", 0.5, 3.48, 4.35, 1.42, 10.5);
  callout(s, "评分要点 / 常见失分", [
    "等级全对 10 分；百分比格式正确（`80.00` 而非 `80.0`）5 分。",
    "常见失分：用 `round()` 导致 `80.0`；边界 90/80/70/60 用 `>` 而非 `>=`。",
  ], 5.15, 3.25, 4.35, 1.5, { fontSize: 10.5, gap: 6 });
}

// T2
{
  const s = content("T2", "3 月考样卷 · T2 单词首字母大写", "字符串处理、ASCII");
  text(s, "把每个单词（连续英文字母）首字母改大写、其余小写；其他字符原样保留。", 0.5, 1.05, 9, 0.35, { fontSize: 12 });
  codeBlock(s, `s = sys.stdin.readline().rstrip('\\n')
out, start_of_word = [], True
for ch in s:
    if ch.isalpha():
        out.append(ch.upper() if start_of_word else ch.lower())
        start_of_word = False
    else:
        out.append(ch)
        start_of_word = True
print(''.join(out))`, 0.5, 1.5, 5.6, 2.15, { fontSize: 10.5, lang: "py" });
  consoleBlock(s, "输入: hello WORLD, this is cs101!\nHello World, This Is Cs101!", 0.5, 3.8, 5.6, 0.85, 10);
  callout(s, "不能用 s.title()", "`'don\\'t'.title()` 会变成 `\"Don'T\"`——内建函数的边界行为要自己验证过再用。", 6.3, 1.5, 3.2, 1.15, { fontSize: 10.5, fill: "FDF0EE", tcolor: C.bad });
  callout(s, "评分要点", [
    "状态机写法正确 12 分；用 `''.join()` 而非循环拼接 3 分。",
    "常见失分：`+=` 拼接字符串 O(n²) TLE；把数字也当单词起点。",
  ], 6.3, 2.8, 3.2, 1.85, { fontSize: 10, gap: 5 });
}

// T3
{
  const s = content("T3", "3 月考样卷 · T3 图书借阅排行", "字典计数、多关键字排序");
  text(s, "n 条借阅记录，按借阅次数从多到少输出；次数相同按书名字典序升序，只输出前 k 名。", 0.5, 1.05, 9, 0.35, { fontSize: 12 });
  codeBlock(s, `from collections import Counter
data = sys.stdin.read().split()
n, k = int(data[0]), int(data[1])
cnt = Counter(data[2:2 + n])
rank = sorted(cnt.items(), key=lambda kv: (-kv[1], kv[0]))
print('\\n'.join(f"{name} {c}" for name, c in rank[:k]))`, 0.5, 1.5, 9.0, 1.55, { fontSize: 11, lang: "py" });
  consoleBlock(s, "输入: 6 2 / python algorithm python math algorithm python\npython 3\nalgorithm 2", 0.5, 3.15, 4.35, 0.95, 10);
  callout(s, "数据构造建议 / 评分要点", [
    "卡 O(n²)：n=2×10⁵ 只用 500 个不同书名，`list.count()` 逐个统计会 TLE。",
    "卡排序键：大量次数相同的书名，检验字典序是否升序。",
    "常见失分：只按次数排序；用 `reverse=True` 导致书名也降序。",
  ], 5.0, 3.15, 4.5, 1.55, { fontSize: 10, gap: 5 });
}

// T4 concept
{
  const s = content("T4", "3 月考样卷 · T4 区间内的 T-数", "素数筛、复杂度意识、浮点陷阱");
  text(s, "T-数：恰好有 3 个正约数的正整数。q 次询问，每次给出 x（≤ 10¹²），判断是否为 T-数。", 0.5, 1.05, 9, 0.35, { fontSize: 12 });
  card(s, 0.5, 1.55, 9.0, 1.05, C.dark);
  text(s, "为什么「恰好 3 个约数」⟺「素数的平方」", 0.7, 1.62, 8.6, 0.3, { fontSize: 12.5, bold: true, color: C.gold, margin: 0 });
  text(s, "x = p₁^a₁·p₂^a₂··· 的约数个数 = (a₁+1)(a₂+1)···。要等于 3（素数），只能是单个因子且 a₁+1=3，即 x = p²。", 0.7, 1.95, 8.6, 0.55, { fontSize: 11.5, color: C.white, lsm: 1.15 });
  codeBlock(s, `LIMIT = 10 ** 6                       # sqrt(10^12)
r = int(x ** 0.5)
while r * r > x:                  # 浮点开方可能偏大
    r -= 1
while (r + 1) * (r + 1) <= x:     # 也可能偏小
    r += 1
ans = "YES" if r * r == x and is_prime[r] else "NO"`, 0.5, 2.75, 5.6, 1.9, { fontSize: 10.5, lang: "py" });
  callout(s, "评分要点", [
    "想到「素数的平方」6 分；筛法预处理 5 分；浮点开方校正 4 分。",
    "常见失分：`int(x**0.5)` 不校正，10¹² 量级偶发错 1。",
  ], 6.3, 2.75, 3.2, 1.9, { fontSize: 10.5, gap: 6 });
}

// T4 sieve
{
  const s = content("T4", "3 月考样卷 · T4 完整解", "筛法预处理 + 浮点校正");
  codeBlock(s, `def sieve(n):
    p = bytearray([1]) * (n + 1)
    p[0] = p[1] = 0
    i = 2
    while i * i <= n:
        if p[i]:
            p[i * i::i] = bytearray(len(p[i * i::i]))
        i += 1
    return p

is_prime = sieve(LIMIT)
for s in data[1:1 + q]:
    x = int(s)
    r = int(x ** 0.5)
    while r * r > x:
        r -= 1
    while (r + 1) * (r + 1) <= x:
        r += 1
    out.append("YES" if r * r == x and is_prime[r] else "NO")`, 0.5, 1.05, 5.7, 4.05, { fontSize: 10, lang: "py" });
  text(s, "样例输入：`4` / `4 5 9 12`", 6.35, 1.05, 3.15, 0.3, { fontSize: 10.5, color: C.muted });
  consoleBlock(s, "YES\nNO\nYES\nNO", 6.35, 1.4, 3.15, 1.15, 10.5);
  callout(s, "数据构造建议", "卡浮点：取 999999937²（LIMIT 内最大素数的平方）附近及 ±1；卡超时：q=10⁵ 且每次试除到 √x（约 10⁶ 次）→ 10¹¹ 次必 TLE。", 6.35, 2.7, 3.15, 2.4, { fontSize: 10.5 });
}

// T5 concept + trace
{
  const s = content("T5", "3 月考样卷 · T5 电梯调度模拟", "模拟、边界处理（综合）");
  text(s, "电梯按请求顺序依次服务：移动到 fᵢ 接人（等到 tᵢ 才开门）→ 送到 gᵢ。移动 1 层耗时 1，开关门每次 2。求最后一人被送达（不含最后一次开关门）的时刻。", 0.5, 1.02, 9, 0.55, { fontSize: 11, lsm: 1.12 });
  const rows = [
    ["t=0", "接 1 号 (1→5)", "now=0，到 1 层无需移动，等到 0，开关门 +2 → 2；移动 4 → 6；开关门 +2 → 8"],
    ["t=3", "接 2 号 (5→2)", "已在 5 层且 t=3 已到 → 开关门 +2 → 10；移动 3 → 13；开关门 +2 → 15"],
  ];
  rows.forEach((r, i) => {
    const y = 1.65 + i * 0.85;
    pill(s, r[0], 0.5, y, 0.8, 0.4, C.dark, C.white, 11);
    text(s, r[1], 1.45, y, 2.0, 0.4, { fontSize: 11.5, bold: true, color: C.green, valign: "middle", margin: 0 });
    text(s, r[2], 3.55, y, 5.95, 0.75, { fontSize: 10.5, valign: "middle", margin: 0, lsm: 1.1 });
  });
  card(s, 0.5, 3.5, 9.0, 0.5, C.dark);
  text(s, "送达时刻 = 13（不含最后一次开关门；样例答案是 13 而非 15）", 0.7, 3.5, 8.6, 0.5, { fontSize: 13, bold: true, color: C.gold, valign: "middle", margin: 0 });
  callout(s, "⚠️ 定义要写死", "「被送达」= 到达目标层的时刻，不含最后一次开关门。命题时这类定义必须写死，否则大批「逻辑对但差 2」的 WA。", 0.5, 4.15, 9.0, 0.95, { fontSize: 11.5, fill: "FDF0EE", tcolor: C.bad });
}

// T5 code
{
  const s = content("T5", "3 月考样卷 · T5 参考解答", "四步：移动 / 等待 / 开门 / 送达");
  codeBlock(s, `now, pos, ans = 0, 1, 0
for _ in range(n):
    t, f, g = int(data[idx]), int(data[idx+1]), int(data[idx+2]); idx += 3
    now += abs(pos - f)          # 移动到接人层
    now = max(now, t)            # 人还没到就等
    now += 2                     # 开关门接人
    now += abs(f - g)            # 送到目标层
    ans = now                    # 送达时刻（不含最后开关门）
    now += 2                     # 开关门放人
    pos = g
print(ans)`, 0.5, 1.05, 9.0, 2.35, { fontSize: 11, lang: "py" });
  callout(s, "数据构造建议", [
    "n=10⁵、坐标 10⁹：验证是否用 `int`（Python 无溢出，C++ 需 `long long`）。",
    "全部 tᵢ=0：检验「等待」分支是否被跳过。",
    "相邻请求 fᵢ = 上一个 gᵢ：移动距离为 0 时仍要加开关门时间。",
  ], 0.5, 3.55, 4.35, 1.55, { fontSize: 10.5, gap: 5 });
  callout(s, "评分要点", "主循环四步齐全 12 分；送达时刻定义正确 4 分；快速输入通过 n=10⁵ 得 4 分。", 5.15, 3.55, 4.35, 1.55, { fontSize: 11 });
}

// T6 concept
{
  const s = content("T6", "3 月考样卷 · T6 补码计算器", "进制转换、补码、位运算、边界判定");
  text(s, "n 位补码计算器（2 ≤ n ≤ 64）：", 0.5, 1.02, 9, 0.3, { fontSize: 12.5 });
  table(s, [
    ["指令", "含义", "输出"],
    [{ t: "TO n x", mono: true }, "十进制 x 写成 n 位补码", "长度 n 的二进制串；越界输出 OVERFLOW"],
    [{ t: "FROM n b", mono: true }, "n 位二进制串 b 按补码解释", "它表示的十进制值"],
    [{ t: "ADD n a b", mono: true }, "n 位补码下 a+b（按 n 位回绕）", "结果；有符号溢出则加空格 + OVERFLOW"],
  ], 0.5, 1.35, 9.0, [1.4, 3.5, 4.1], { fontSize: 11, rowH: 0.5 });
  consoleBlock(s, "TO 8 -5 → 11111011\nTO 4 8 → OVERFLOW（4 位范围 −8~7）\nFROM 8 11111011 → -5\nADD 8 100 100 → -56 OVERFLOW\nADD 8 -100 -100 → 56 OVERFLOW\nADD 4 3 4 → 7", 0.5, 3.55, 9.0, 1.5, 10.5);
}

// T6 code
{
  const s = content("T6", "3 月考样卷 · T6 参考解答", "三行核心，全部来自第 3 周");
  codeBlock(s, `if op == 'TO':
    lo, hi = -(1 << (n-1)), (1 << (n-1)) - 1
    out = 'OVERFLOW' if not lo <= x <= hi else format(x & ((1 << n) - 1), f'0{n}b')
elif op == 'FROM':
    v = int(b, 2)
    out = str(v - (1 << n) if v >> (n - 1) else v)
else:  # ADD
    r = (a + b) & ((1 << n) - 1)          # 先按 n 位回绕
    if r >> (n - 1): r -= 1 << n          # 再按补码解释成有符号数
    out = str(r) if r == a + b else f'{r} OVERFLOW'`, 0.5, 1.05, 9.0, 2.1, { fontSize: 10.5, lang: "py" });
  callout(s, "⚠️ 无符号进位 ≠ 有符号溢出", "`n=8, a=-1, b=1` 硬件上有进位输出，但结果 0 完全正确，不算溢出。把进位当溢出是最常见的错法——用 `r != a+b` 判溢出就不会错。", 0.5, 3.3, 9.0, 0.95, { fontSize: 11.5, fill: "FDF0EE", tcolor: C.bad });
  callout(s, "评分要点", "TO/FROM 都正确 8 分；ADD 的 n 位回绕正确 6 分；有符号溢出判定正确（没把无符号进位当溢出）6 分。", 0.5, 4.35, 9.0, 0.8, { fontSize: 10.5 });
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

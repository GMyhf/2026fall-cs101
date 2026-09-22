// 第 16 周 课程知识体系总结、期末复习与上机考试 —— 由 202612_ADS_W16_Review_Final_Machine_Exam.md 整理成的讲课 PPT。
// 生成：cd courseware/pptx_builder && node decks/w16_review_final_machine_exam.js ../202612_ADS_W16_Review_Final_Machine_Exam.pptx
// 样卷 T1-T6、备选题库均取自讲义原文；讲义里的参考解答已在 Python 3.12 下核对过，
// 本课件对 T1-T6 只摘录最有教学价值的代码片段（不整段照抄），完整解答见讲义 .md。
const path = require("path");
const { createDeck } = require("../lib");

const OUT = process.argv[2] || path.join(__dirname, "..", "out", "202612_ADS_W16_Review_Final_Machine_Exam.pptx");

(async () => {
  const D = createDeck({ title: "计算概论（B）第 16 周 课程知识体系总结、期末复习与上机考试", author: "Hongfei Yan" });
  const {
    pres, C, FONT, MONO, runs, text, bullets, card, codeBlock, consoleBlock, callout, table,
    cells, arrowLabel, pill, numCircle, titleSlide, sectionSlide, content, summarySlide,
  } = D;

// ---- slides（顶层不缩进，避免改动模板字符串里的代码缩进）----
// =====================================================================
// Cover
titleSlide({
  kicker: "计算概论（B） · 第 16 周 · 2026 Fall",
  title: "期末复习与上机考试",
  subtitle: "复习清单 · 考试须知 · 建议样卷 6 题 · 备选题库 · 备考建议",
  topics: "一张图看完 16 周 · 算法主线：枚举→贪心/DP→搜索\n考试须知：6 题 / 112 分钟 / 禁用 AI / 学术诚信\n建议样卷 6 题（字典排序 · 栈 · 区间分组 · 带状态 BFS · 双目标背包 · 最小瓶颈路）\n备选题库 71 题 · 12 个必背模板 · 一页 cheat sheet · 高频陷阱清单",
  footer: "Compiled by Hongfei Yan · 2026 Fall · github.com/GMyhf/2026fall-cs101",
});

// Three questions
{
  const s = content("?", "本讲导引", "本讲要回答三个问题");
  const qs = [
    ["16 周学了这么多，怎么串成一条线？", "四条主线：**计算机基础、语言与工具、算法与数据结构、AI 素养**；算法主线是**枚举 → 贪心/DP → 搜索**。"],
    ["上机考试到底怎么考、怎么评？", "**6 题 / 112 分钟**，OJ 判 AC 给分；样卷六题从 ★1 到 ★5，覆盖至少 5 个大类。"],
    ["考前最后一周该做什么？", "**默写 12 个模板** + **手写一页 cheat sheet**——抄不下的内容，说明你还没消化。"],
  ];
  qs.forEach((q, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.15, 2.85, 2.7, C.code);
    numCircle(s, i + 1, x + 0.2, 1.32, 0.46, C.dark);
    text(s, q[0], x + 0.2, 1.92, 2.5, 0.75, { fontSize: 13.5, bold: true, color: C.dark, margin: 0 });
    text(s, q[1], x + 0.2, 2.72, 2.5, 1.0, { fontSize: 11, margin: 0, lsm: 1.2 });
  });
  card(s, 0.5, 4.0, 9.0, 1.05, C.dark);
  text(s, "一句话概括", 0.75, 4.1, 3, 0.3, { fontSize: 11, bold: true, color: C.gold, margin: 0 });
  s.addText([
    ...runs("这门课是**练出来的**：", { color: C.white, boldColor: C.gold }),
    { text: "完成的 150–200 道题、调过的每一个 WA，才是真正留下的东西。", options: { color: C.white } },
  ], { x: 0.75, y: 4.42, w: 8.6, h: 0.5, fontFace: FONT, fontSize: 14, margin: 0, isTextBox: true, valign: "middle" });
}

// Roadmap
{
  const s = content("≡", "本讲导引", "内容地图");
  const cols = [
    ["1  知识体系总结", ["1.1 一张图看完 16 周", "1.2 算法主线：一条演化路径", "1.3 每周一句话"]],
    ["2–4  考试信息（师生共用）", ["2 考试须知（6 题 / 112 分钟）", "3 能力要求（5 项）", "4 知识点覆盖矩阵、难度梯度"]],
    ["5–8  样卷、题库与备考", ["5 建议样卷 T1–T6", "6 备选题库（71 题，7 类）", "7 备考建议 · 8 命题清单（附）"]],
  ];
  cols.forEach((c, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.15, 2.85, 3.9, i === 1 ? C.cream : C.code);
    text(s, c[0], x + 0.2, 1.3, 2.5, 0.6, { fontSize: 16, bold: true, color: C.dark, margin: 0 });
    bullets(s, c[1], x + 0.15, 2.0, 2.6, 2.9, { fontSize: 12.5, gap: 12 });
  });
}

// ============================ PART 1 ============================
sectionSlide("Part 1", "课程知识体系总结", "一张图看完 16 周 · 算法主线：一条演化路径 · 每周一句话");

// 1.1 knowledge map
{
  const s = content("1.1", "1 课程知识体系总结", "一张图看完 16 周");
  const groups = [
    ["计算机基础", "W1, W3, W13", ["图灵机 · 冯·诺依曼结构", "二进制 / 补码 · 浮点 & ASCII", "进程 & 虚拟内存 · 缓存 & 局部性"]],
    ["语言与工具", "W1, W2, W4", ["Python 语法 · 容器与代价", "Shell & VM · IDE & 调试", "快速 IO"]],
    ["算法与数据结构", "W6–W12, W16", ["复杂度分析 · 矩阵/前缀和", "排序/二分 · 贪心/区间 · 栈/队列", "递归/回溯 · 并查集 · DP · BFS/Dijkstra"]],
    ["AI 素养", "W1, W14, W15", ["LLM 原理 · 幻觉与验证", "提示词 · 知识图谱", "神经网络 · RAG"]],
  ];
  groups.forEach((g, i) => {
    const x = 0.5 + (i % 2) * 4.6, y = 1.08 + Math.floor(i / 2) * 1.98;
    card(s, x, y, 4.4, 1.85, i % 2 === 0 ? C.code : C.cream);
    text(s, g[0], x + 0.18, y + 0.1, 3.0, 0.35, { fontSize: 15, bold: true, color: C.dark, margin: 0 });
    text(s, g[1], x + 3.0, y + 0.13, 1.3, 0.3, { fontSize: 10, bold: true, color: C.green, align: "right", margin: 0 });
    bullets(s, g[2], x + 0.18, y + 0.5, 4.05, 1.3, { fontSize: 11, gap: 5 });
  });
}

// 1.2 algorithm mainline
{
  const s = content("1.2", "1 课程知识体系总结", "算法主线：一条演化路径");
  pill(s, "暴力枚举", 0.5, 1.3, 1.7, 0.5, C.dark);
  arrowLabel(s, "剪枝", 2.35, 1.55, C.goldText);
  pill(s, "回溯 (W9)", 2.55, 1.3, 1.7, 0.5, C.green);

  pill(s, "暴力枚举", 0.5, 2.35, 1.7, 0.5, C.dark);
  arrowLabel(s, "排序后一遍扫", 2.35, 2.6, C.goldText);
  pill(s, "贪心 (W6,W10)", 2.55, 2.35, 2.0, 0.5, C.green);
  arrowLabel(s, "贪心失效", 4.85, 2.6, C.bad);
  pill(s, "动态规划 (W10,W11)", 5.05, 2.35, 2.5, 0.5, C.green);
  text(s, "记忆化", 5.05, 2.9, 2.5, 0.25, { fontSize: 9, color: C.muted, align: "center", margin: 0 });

  pill(s, "暴力枚举", 0.5, 3.4, 1.7, 0.5, C.dark);
  arrowLabel(s, "按层扩展", 2.35, 3.65, C.goldText);
  pill(s, "BFS (W12)", 2.55, 3.4, 1.7, 0.5, C.green);
  arrowLabel(s, "边权不同", 4.4, 3.65, C.goldText);
  pill(s, "Dijkstra (W12)", 4.6, 3.4, 1.9, 0.5, C.green);

  card(s, 0.5, 4.15, 9.0, 0.85, C.cream);
  text(s, "横向工具", 0.7, 4.25, 2, 0.25, { fontSize: 10, bold: true, color: C.goldText, margin: 0 });
  text(s, "前缀和 / 差分（W6, W10）　二分答案（W12）　单调栈 / 单调队列（W7）　并查集（W9）", 0.7, 4.5, 8.6, 0.4, { fontSize: 12, margin: 0 });
}

// 1.3 one line per week
{
  const s = content("1.3", "1 课程知识体系总结", "每周一句话");
  const rows = [
    ["1", "三个平台各司其职；AI 是加速器不是替身"],
    ["2", "`python3 a.py < in.txt` 是本课最常用的一条命令"],
    ["3", "补码让减法变加法；浮点永远不要用 `==` 比较"],
    ["4", "容器复杂度表要背；先看数据范围再定算法"],
    ["5", "月考是体检；订正 = 分类 + 关题解重写"],
    ["6", "贪心 = 排序 + 一遍扫，难在选排序键"],
    ["7", "栈用 list、队列用 deque；单调结构更快"],
    ["8", "递归三法则；递归就是在用系统栈"],
  ];
  const rows2 = [
    ["9", "回溯 = DFS + 撤销；并查集摊还近 O(1)"],
    ["10", "要「多」按右端点排，要「合/盖」按左端点排；DP 三要素"],
    ["11", "0-1 倒序、完全正序；「恰好装满」要用 ±inf 初始化"],
    ["12", "用 deque、入队标记；要「最短」就 BFS"],
    ["13", "Python 慢就换算法，不要抠常数"],
    ["14", "幻觉源于「训练目标是合理而非正确」"],
    ["15", "反向传播本质上就是动态规划"],
    ["16", "考场流程：看范围→认题型→定策略→造数据→查格式"],
  ];
  const mk = (r) => [{ t: r[0], mono: true, align: "center" }, r[1]];
  table(s, [["周", "一句话"], ...rows.map(mk)], 0.5, 1.0, 4.35, [0.6, 3.75], { fontSize: 10, rowH: 0.4 });
  table(s, [["周", "一句话"], ...rows2.map(mk)], 5.15, 1.0, 4.35, [0.6, 3.75], { fontSize: 10, rowH: 0.4 });
}

// ============================ PART 2 ============================
sectionSlide("Part 2", "期末上机考试须知", "6 题 · 112 分钟 · 禁用一切 AI 工具\n三次月考与期末同规格——月考不是缩水版，是同构演练");

// 2 exam rules
{
  const s = content("2", "2 考试须知", "考试须知");
  const rows = [
    ["时长", "112 分钟"], ["题量", "6 道编程题"], ["总分", "100 分（分值见第 5 节）"],
    ["平台", "OpenJudge（cs101 小组）"], ["语言", "Python 3 为主，允许 C++"], ["环境", "考试专用机房，断开外网"],
    ["允许携带", "一页 A4 双面手写 cheat sheet（不得打印、不得夹带整页代码）"],
  ];
  table(s, [["项目", "规定"], ...rows.map((r) => [{ t: r[0], bold: true }, r[1]])], 0.5, 1.05, 9.0, [1.6, 7.4], { fontSize: 11.5, rowH: 0.32 });
  callout(s, "⚠ 禁止 · 学术诚信", [
    "**任何 AI 工具**（含本地模型、IDE 智能补全插件）、任何联网查询、任何形式的交流；",
    "**无法解释自己提交的代码，按学术不端处理**，成绩记 0。",
  ], 0.5, 3.9, 9.0, 1.2, { fill: "FDF0EE", tcolor: C.bad });
}

// 2 continued: scores
{
  const s = content("2", "2 考试须知", "判分方式与成绩参考");
  text(s, "**判分方式**：以 OJ 判定的 AC 情况为准，按题给分；部分题设分档数据（部分通过给部分分）。", 0.5, 1.05, 9.0, 0.5, { fontSize: 13, lsm: 1.2 });
  callout(s, "三次月考与期末同规格", [
    "**6 题 / 112 分钟**——第 5 周与第 14 周的样卷就是按这个规格出的。",
    "**月考不是缩水版，是同构演练。**",
  ], 0.5, 1.65, 9.0, 1.05, { fill: C.mint });
  const rows = [
    ["AC 5–6 题", "基本可获优秀"],
    ["AC 4 题", "若笔试成绩较高且未超优秀比例限制，仍有机会评优"],
    ["AC 0 题", "即使笔试满分，总评也会受到明显影响"],
  ];
  table(s, [["成绩参考（历年经验）", ""], ...rows], 0.5, 2.85, 9.0, [2.2, 6.8], { fontSize: 12, rowH: 0.4 });
  text(s, "⚠ 上述比例与条件不是本讲义能确定的，仅用于说明机考的重要性——一切以当学期正式教学通知为准。", 0.5, 4.55, 9.0, 0.5, { fontSize: 10.5, color: C.bad, lsm: 1.2 });
}

// 3 abilities
{
  const s = content("3", "3 能力要求", "能力要求");
  text(s, "本次考试考查以下五项能力，命题时每道题至少覆盖其中两项：", 0.5, 1.05, 9.0, 0.35, { fontSize: 13 });
  const items = [
    ["问题抽象", "把文字描述翻译成数据结构与状态模型——**这是最常见的失分点**。"],
    ["算法选择", "根据数据范围选出复杂度可行的算法（第 4 周 3.4 节的表）。"],
    ["代码实现", "在**无 AI 辅助**下正确、快速地写出可运行代码。"],
    ["边界处理", "n = 0/1、多组数据、全相同、极值、不连通、空输入。"],
    ["调试能力", "读懂 WA / TLE 反馈并自行构造数据定位。"],
  ];
  items.forEach((it, i) => {
    const y = 1.5 + i * 0.72;
    card(s, 0.5, y, 9.0, 0.62, i % 2 === 0 ? C.code : "FFFFFF");
    numCircle(s, i + 1, 0.65, y + 0.11, 0.4, C.dark);
    text(s, it[0], 1.2, y, 1.6, 0.62, { fontSize: 13, bold: true, color: C.dark, valign: "middle", margin: 0 });
    s.addText(runs(it[1], { color: C.text }), { x: 2.85, y, w: 6.5, h: 0.62, fontFace: FONT, fontSize: 11.5, margin: 0, isTextBox: true, valign: "middle" });
  });
}

// 4 coverage matrix
{
  const s = content("4", "4 知识点覆盖矩阵（教师用）", "知识点覆盖矩阵");
  text(s, "命题时保证 6 道题覆盖以下**至少 5 个大类**，且**贪心、DP、搜索各至少 1 题**：", 0.5, 1.05, 9.0, 0.4, { fontSize: 12.5 });
  const rows = [
    ["语法与容器", "W1–W2、W4", "T1", "字典计数、多关键字排序、格式化输出"],
    ["计算机基础", "W3、W13", "T1 备选", "进制、位运算、ASCII、复杂度估算"],
    ["线性结构", "W7", "T2", "栈 / 队列 / 单调栈"],
    ["排序与贪心", "W6、W10", "T3", "排序键、区间问题、差分"],
    ["搜索", "W9、W12", "T4", "BFS / DFS / 回溯 / 带状态搜索"],
    ["动态规划", "W10–W11", "T5", "线性 DP / 背包"],
    ["并查集与图", "W9、W12", "T6", "连通性、最小瓶颈路、二分答案"],
    ["矩阵", "W6", "备选", "二维遍历、前缀和、卷积"],
  ];
  table(s, [["大类", "周次", "本卷覆盖", "具体考点"], ...rows], 0.5, 1.55, 9.0, [1.5, 1.3, 1.1, 5.1], { fontSize: 11, rowH: 0.4 });
}

// 4 continued: difficulty gradient
{
  const s = content("4", "4 知识点覆盖矩阵（教师用）", "难度梯度");
  const rows = [
    ["T1", "★☆☆☆☆", "签到题，保证及格线", "90% AC"],
    ["T2", "★★☆☆☆", "基础数据结构应用", "70% AC"],
    ["T3", "★★★☆☆", "需要一次转化（排序键）", "55% AC"],
    ["T4", "★★★☆☆", "带状态搜索", "45% AC"],
    ["T5", "★★★★☆", "DP，状态设计有难度", "30% AC"],
    ["T6", "★★★★★", "综合建模，区分优秀", "15% AC"],
  ];
  table(s, [["题", "难度", "说明", "预期 AC 率"], ...rows.map((r) => [{ t: r[0], bold: true }, { t: r[1], color: C.goldText }, r[2], { t: r[3], mono: true }])],
    0.5, 1.1, 9.0, [0.8, 1.7, 4.8, 1.7], { fontSize: 12, rowH: 0.4 });
  callout(s, "命题原则", [
    "前 3 题保证认真听课、完成作业的学生能拿到 45 分；后 3 题拉开区分度。",
    "⚠ 上表的预期 AC 率是命题经验估计，无历史数据支撑，需按实际结果逐年校准。",
  ], 0.5, 4.05, 9.0, 1.0, { fill: C.cream });
}

// ============================ PART 3 ============================
sectionSlide("Part 3", "建议样卷（一套完整试题）", "T1 签到 → T2 栈 → T3 区间分组 → T4 带状态 BFS → T5 双目标背包 → T6 最小瓶颈路\n难度从 ★1 递增到 ★5");

// overview table
{
  const s = content("5", "5 建议样卷", "样卷总览");
  const rows = [
    ["E29982", "一种等价类划分问题", "哈希分组、数字各位和", "★☆☆☆☆", "15"],
    ["E30086", "dance", "排序、贪心配对", "★★☆☆☆", "15"],
    ["M25570", "洋葱", "矩阵分层 / 模拟", "★★★☆☆", "15"],
    ["M28906", "数的划分", "DFS / 动态规划", "★★★☆☆", "15"],
    ["M29896", "购物", "贪心、覆盖连续金额", "★★★★☆", "20"],
    ["T25353", "排队", "可交换关系、贪心 / 数据结构", "★★★★★", "20"],
  ];
  table(s, [["题", "题目", "考点", "难度", "分值"], ...rows.map((r) => [{ t: r[0], bold: true }, r[1], { t: r[2] }, { t: r[3], color: C.goldText }, { t: r[4], mono: true, align: "center" }])],
    0.5, 1.1, 9.0, [0.6, 1.7, 4.1, 1.3, 0.7], { fontSize: 11, rowH: 0.46 });
  text(s, "总分 15+15+15+15+20+20 = 100 分；参考解答已全部实际运行并通过样例，T3–T6 均已与暴力解做 400 组随机对拍。", 0.5, 4.85, 9.0, 0.3, { fontSize: 10, color: C.muted, lsm: 1.15 });
}

// T1
{
  const s = content("T1", "5 建议样卷", "T1. E29982 一种等价类划分问题　★☆☆☆☆");
  text(s, "在开区间 (m, n) 内筛出各位数字和是 k 的倍数的整数，按「数字和」分组；每组内升序、逗号分隔，组间按数字和递增输出。", 0.5, 1.05, 9.0, 0.55, { fontSize: 12, lsm: 1.15 });
  codeBlock(s, `m, n, k = map(int, input().split(','))
groups = {}
for x in range(m + 1, n):
    s = sum(map(int, str(x)))
    if s % k == 0:
        groups.setdefault(s, []).append(str(x))
for s in sorted(groups):
    print(','.join(groups[s]))`, 0.5, 1.65, 5.6, 1.95, { fontSize: 11, lang: "py" });
  consoleBlock(s, "输入: 11,35,3\n12,21,30\n15,24,33\n18,27", 0.5, 3.7, 5.6, 1.0, 10);
  callout(s, "按数字和分组，再按数字和排序", "数字和相同的数放进同一组；输出顺序先按数字和从小到大，组内再按数值升序——两层排序，`sorted(groups)` 负责外层，插入顺序天然满足内层。", 6.3, 1.65, 3.2, 3.05, { fontSize: 10 });
}

// T2
{
  const s = content("T2", "5 建议样卷", "T2. E30086 dance　★★☆☆☆");
  text(s, "有 2N 名学生，要求两两配对且每对身高差不超过 D。将身高排序后只能相邻配对；所有相邻差均不超过 D 时输出 Yes，否则 No。", 0.5, 1.05, 9.0, 0.55, { fontSize: 12, lsm: 1.15 });
  codeBlock(s, `n, d = map(int, input().split())
a = sorted(map(int, input().split()))
print('Yes' if all(a[i + 1] - a[i] <= d for i in range(0, 2 * n, 2)) else 'No')`, 0.5, 1.65, 9.0, 1.05, { fontSize: 12.5, lang: "py" });
  consoleBlock(s, "输入: 6 4 / 22 15 32 36 16 30 42 30 39 23 17 18\n输出: Yes", 0.5, 2.9, 9.0, 0.65, 11);
  callout(s, "排序后只需查相邻配对", "排完序后，任何「跳着配对」的方案都能通过交换相邻两人换成相邻配对而不变差——所以只要检查 (a₀,a₁)(a₂,a₃)... 这一种配对方式即可，不用枚举所有配对。", 0.5, 3.7, 9.0, 1.0, { fontSize: 10.5, lsm: 1.15 });
}

// T3
{
  const s = content("T3", "5 建议样卷", "T3. M25570 洋葱　★★★☆☆");
  text(s, "给定 n×n 非负矩阵，像剥洋葱一样逐层剥去外圈，求所有层元素和的最大值。每层是一圈方框边界；奇数阶矩阵的正中心单独成一层。", 0.5, 1.05, 9.0, 0.55, { fontSize: 11.5, lsm: 1.15 });
  codeBlock(s, `n = int(input())
a = [list(map(int, input().split())) for _ in range(n)]
best = 0
for layer in range((n + 1) // 2):
    lo, hi = layer, n - 1 - layer
    total = sum(a[lo][j] for j in range(lo, hi + 1))
    if hi > lo:
        total += sum(a[hi][j] for j in range(lo, hi + 1))
        total += sum(a[i][lo] + a[i][hi] for i in range(lo + 1, hi))
    best = max(best, total)
print(best)`, 0.5, 1.65, 5.9, 2.55, { fontSize: 10, lang: "py" });
  consoleBlock(s, "输入: 5×5 矩阵（中心为 7）\n输出: 8", 6.55, 1.65, 2.95, 0.8, 10);
  callout(s, "layer 从外到内枚举", "第 layer 层是 [lo,hi]×[lo,hi] 这一圈的边界；`hi > lo` 时才有上下两条边和左右两条边（避免单行/单点被重复加）。", 6.55, 2.55, 2.95, 1.7, { fontSize: 9 });
}

// T4
{
  const s = content("T4", "5 建议样卷", "T4. M28906 数的划分　★★★☆☆");
  text(s, "把 n 分成 k 个非空正整数（顺序不计），求方案数（n ≤ 200, 2 ≤ k ≤ 6）。令下一份不小于上一份即可避免排列重复计数。", 0.5, 1.05, 9.0, 0.55, { fontSize: 12, lsm: 1.15 });
  codeBlock(s, `from functools import lru_cache
n, k = map(int, input().split())
@lru_cache(None)
def dfs(rem, left, low):
    if left == 1:
        return int(rem >= low)
    return sum(dfs(rem - x, left - 1, x)
               for x in range(low, rem // left + 1))
print(dfs(n, k, 1))`, 0.5, 1.65, 5.6, 2.0, { fontSize: 10.5, lang: "py" });
  consoleBlock(s, "输入: 7 3\n输出: 4", 0.5, 3.75, 5.6, 0.9, 11);
  callout(s, "low 参数：只往「不减」的方向切", "把 7 分成 3 份：1+1+5、1+2+4、1+3+3、2+2+3 共 4 种。如果不限制 `low`，1+2+4 和 2+1+4 会被当成两种不同方案，重复计数。", 6.3, 1.65, 3.2, 2.65, { fontSize: 10 });
}

// T5
{
  const s = content("T5", "5 建议样卷", "T5. M29896 购物　★★★★☆");
  text(s, "有无限枚不同面值硬币，求最少带多少枚硬币，使 1..X 每个金额都能组合出来；不能覆盖时输出 -1。维护当前连续可覆盖区间 [1, reach]，每次选不超过 reach+1 的最大面值。", 0.5, 1.0, 9.0, 0.6, { fontSize: 11, lsm: 1.1 });
  codeBlock(s, `X, n = map(int, input().split())
coins = sorted(map(int, input().split()))
reach = count = 0
while reach < X:
    usable = [c for c in coins if c <= reach + 1]
    if not usable:
        print(-1); break
    reach += max(usable); count += 1
else:
    print(count)`, 0.5, 1.65, 5.6, 2.05, { fontSize: 10.5, lang: "py" });
  consoleBlock(s, "输入: 20 4 / 1 2 5 10\n输出: 5", 0.5, 3.75, 5.6, 0.8, 10.5);
  callout(s, "每步用最大的「还能接上」面值", "已能凑出 1..reach 时，只要新硬币 c ≤ reach+1，就能凑出 1..reach+c；选可用面值里最大的一个，扩张得最快，这是「跳跃覆盖」类贪心的标准写法。", 6.3, 1.65, 3.2, 2.75, { fontSize: 10 });
}

// T6
{
  const s = content("T6", "5 建议样卷", "T6. T25353 排队　★★★★★");
  text(s, "相邻两人身高差不超过 D 才能交换，任意次交换后求字典序最小的身高序列。身高差大于 D 的两人相对顺序永远不能改变，可看成「前驱约束」——每个元素的层数是此前所有约束它的人里最大层数加一，同层元素可任意交换，逐层排序输出。", 0.5, 1.0, 9.0, 0.7, { fontSize: 10.5, lsm: 1.1 });
  codeBlock(s, `import bisect
import sys
data = list(map(int, sys.stdin.buffer.read().split()))
n, d = data[:2]
h = data[2:2 + n]
vals = sorted(set(h)); m = len(vals)
lo_bit = [0] * (m + 1); hi_bit = [0] * (m + 1)
def update(bit, i, value):
    while i <= m:
        bit[i] = max(bit[i], value); i += i & -i
def query(bit, i):
    ans = 0
    while i:
        ans = max(ans, bit[i]); i -= i & -i
    return ans
layers = {}
for height in h:
    small = query(lo_bit, bisect.bisect_left(vals, height - d))
    large = query(hi_bit, m - bisect.bisect_right(vals, height + d))
    level = max(small, large) + 1
    layers.setdefault(level, []).append(height)
    pos = bisect.bisect_left(vals, height) + 1
    update(lo_bit, pos, level); update(hi_bit, m - pos + 1, level)
for level in sorted(layers):
    for height in sorted(layers[level]):
        print(height)`, 0.5, 1.65, 5.9, 3.3, { fontSize: 7.6, lang: "py" });
  consoleBlock(s, "输入: 5 3 / 7 7 3 6 2\n输出: 6 7 7 2 3", 6.55, 1.65, 2.95, 0.65, 9.5);
  callout(s, "两棵树状数组各管一侧的约束", "lo_bit 查「比我小 D 以上」的人里最大层数，hi_bit 查「比我大 D 以上」的——这两类人身高差都超过 D，永远排在我前面，我的层数必须比它们都大。", 6.55, 2.4, 2.95, 2.55, { fontSize: 8.7 });
}

// ============================ PART 4 ============================
sectionSlide("Part 4", "备选题库（按知识点分类）", "71 道题，7 个分类，可替换样卷中任意一题，或作往年真题复习使用");

const bankPages = [
  ["6.1", "语法、字符串与容器（W1–W4）", [
    ["鸡兔同笼", "E02750", "分支、整除"], ["大小写字母互换", "E02689", "ASCII"],
    ["整数的个数", "E02676", "计数"], ["生日相同", "E02724", "字典分组 + 排序"],
    ["词典", "E02804", "字典查询"], ["多项式时间复杂度", "E23563", "字符串解析"],
    ["文字排版", "E06374", "模拟"], ["验证「歌德巴赫猜想」", "E03143", "素数筛"],
    ["十进制到八进制", "E02734", "进制"],
  ]],
  ["6.2", "矩阵（W6）", [
    ["矩阵运算（先乘再加）", "E18161", "矩阵乘法 + 维度判断"], ["计算矩阵边缘元素之和", "E07743", "二维遍历"],
    ["矩阵交换行", "02899", "二维列表"], ["二维矩阵上的卷积运算", "E19942", "保护圈"],
    ["节省存储的矩阵乘法", "E23555", "稀疏矩阵"], ["螺旋矩阵", "M18106", "方向数组"],
    ["图的拉普拉斯矩阵", "E19943", "图 + 矩阵"],
  ]],
  ["6.3", "排序、贪心与区间（W6、W10）", [
    ["装箱问题", "01017", "贪心 + 打表"], ["最大最小整数", "12559", "自定义比较"],
    ["因材施教", "19948", "排序后切间隙"], ["军备竞赛", "18211", "双指针贪心"],
    ["排队做实验", "M21554", "排序"], ["买学区房", "M19963", "排序 + 中位数"],
    ["校门外的树", "02808", "差分"], ["校门外的树又来了", "M29947", "合并区间"],
    ["Radar Installation", "M01328", "区间选点"], ["世界杯只因", "T27104", "区间覆盖"],
  ]],
  ["6.4", "栈与队列（W7）", [
    ["波兰表达式", "02694", "前缀求值"], ["后序表达式求值", "24588", "后缀求值"],
    ["快速堆猪", "22067", "辅助栈"], ["双端队列", "05902", "deque"],
    ["约瑟夫问题", "02746", "队列模拟"], ["病人排队", "E07618", "稳定排序"],
    ["有多少种合法的出栈顺序", "27217", "卡特兰数"], ["土豪购物", "M20744", "线性 DP"],
  ]],
  ["6.5", "递归、回溯与并查集（W8–W9）", [
    ["菲波那契数列", "02753", "递归 + 记忆化"], ["Pell 数列", "M02786", "递推"],
    ["汉诺塔问题(Tower of Hanoi)", "04147", "递归三步"], ["全排列", "02748", "回溯模板"],
    ["八皇后", "02754", "回溯 + 剪枝"], ["马走日", "04123", "回溯 + 状态还原"],
    ["Lake Counting", "02386", "Flood Fill"], ["晶矿的个数", "M05585", "连通块"],
    ["宗教信仰", "02524", "并查集"], ["一种等价类划分问题", "M29982", "并查集"],
    ["食物链", "T01182", "扩展域并查集"], ["放苹果", "01664", "递归计数"],
    ["简单的整数划分问题", "04117", "递归 + 记忆化"],
  ]],
  ["6.6", "动态规划（W10–W11）", [
    ["数字三角形", "02760", "路径 DP"], ["采药", "02773", "0-1 背包"],
    ["小偷背包", "23421", "0-1 背包"], ["Coins", "M01742", "多重背包"],
    ["宠物小精灵之收服", "04102", "二维费用背包"], ["健身房 (dp)", "21458", "「恰好装满」"],
    ["NBA 门票", "20089", "「恰好 + 最少个数」"], ["Longest Ordered Subsequence", "02533", "LIS"],
    ["拦截导弹", "M02945", "最长不上升子序列"], ["最大上升子序列和", "03532", "LIS 变形"],
    ["公共子序列", "02806", "LCS"], ["最大子矩阵", "M02766", "降维 + Kadane"],
    ["合唱队形", "02711", "双向 LIS"],
  ]],
  ["6.7", "搜索与二分（W12）", [
    ["鸣人和佐助", "04115", "带状态 BFS"], ["拯救行动", "04116", "BFS + 优先队列"],
    ["水淹七军", "M12029", "BFS 模拟"], ["寻宝", "19930", "BFS"],
    ["变换的迷宫", "T04129", "多维状态 BFS"], ["小游戏", "T02802", "BFS + 转弯"],
    ["走山路", "M20106", "Dijkstra"], ["河中跳房子", "M08210", "二分答案"],
    ["月度开销", "M04135", "二分答案"], ["Aggressive cows", "M02456", "二分答案"],
    ["Expedition", "M02431", "贪心 + 堆"],
  ]],
];
bankPages.forEach(([badge, title, rows]) => {
  const s = content(badge, "6 备选题库", title);
  const dense = rows.length >= 9;
  table(s, [["题目", "编号", "考点"], ...rows.map((r) => [r[0], { t: r[1], mono: true, align: "center" }, r[2]])],
    0.5, 1.1, 9.0, [4.6, 1.5, 2.9], { fontSize: dense ? 10 : 12, rowH: dense ? 0.285 : 0.42, tight: dense });
});

// ============================ PART 5 ============================
sectionSlide("Part 5", "给学生的备考建议", "12 个必背模板 · 一页 cheat sheet · 考场流程 · 高频陷阱清单");

// 7.1 templates
{
  const s = content("7.1", "7 给学生的备考建议", "必须能默写的 12 个模板");
  const rows = [
    ["1", "快速输入 `sys.stdin.read().split()`", "W4"], ["2", "埃氏筛", "W4"],
    ["3", "一维 / 二维前缀和 + 差分", "W6、W10"], ["4", "多关键字排序 `key=lambda x:(a,-b)`", "W6"],
    ["5", "归并排序的合并（求逆序对）", "W6"], ["6", "单调栈（下一个更大元素）", "W7"],
    ["7", "回溯模板（选择 → 递归 → 撤销）", "W9"], ["8", "并查集（路径压缩 + 按大小合并）", "W9"],
    ["9", "0-1 背包（倒序）/ 完全背包（正序）", "W11"], ["10", "LIS 的 O(n log n) 写法", "W11"],
    ["11", "BFS（deque + 入队标记 + 状态维）", "W12"], ["12", "二分答案（判定 + 上/下取整）", "W12"],
  ];
  table(s, [["#", "模板", "周次"], ...rows.map((r) => [{ t: r[0], align: "center" }, r[1], { t: r[2], align: "center" }])],
    0.5, 1.0, 9.0, [0.5, 6.5, 2.0], { fontSize: 10.5, rowH: 0.3, tight: true });
  text(s, "自测方法：关掉所有资料，在空文件里默写。写不出来的，回到对应周的讲义重看一遍再默写。", 0.5, 4.92, 9.0, 0.28, { fontSize: 9.5, color: C.muted });
}

// 7.2 cheat sheet
{
  const s = content("7.2", "7 给学生的备考建议", "一页 A4 cheat sheet 的建议内容");
  const front = ["快速输入 / 输出模板（3 行）", "复杂度速查表（n 的范围 → 可用复杂度）", "容器操作复杂度表", "多关键字排序、`bisect` 用法", "前缀和 / 差分公式", "二分模板（两种取整方向）"];
  const back = ["回溯模板骨架", "并查集（10 行）", "0-1 / 完全背包核心循环 + 「恰好装满」初始化", "BFS 模板（含状态维）", "Dijkstra 模板（heapq）", "高频陷阱清单（下页）"];
  card(s, 0.5, 1.1, 4.35, 3.3, C.code);
  text(s, "正面", 0.7, 1.22, 3, 0.35, { fontSize: 15, bold: true, color: C.dark, margin: 0 });
  bullets(s, front, 0.7, 1.65, 4.0, 2.65, { fontSize: 11.5, gap: 9 });
  card(s, 5.15, 1.1, 4.35, 3.3, C.cream);
  text(s, "反面", 5.35, 1.22, 3, 0.35, { fontSize: 15, bold: true, color: C.dark, margin: 0 });
  bullets(s, back, 5.35, 1.65, 4.0, 2.65, { fontSize: 11.5, gap: 9 });
  callout(s, "⚠ 手写、双面、一页", "不得打印、不得整页抄代码——抄不下的内容，说明你还没消化。", 0.5, 4.45, 9.0, 0.5, { fontSize: 10, lsm: 1.0, fill: "FDF0EE", tcolor: C.bad });
}

// 7.3 exam-day flow
{
  const s = content("7.3", "7 给学生的备考建议", "考场流程");
  const rows = [
    ["0–5 min", "通读 6 题，按预估难度标序，先做有把握的"],
    ["5–15 min", "T1（签到）——写完就交，用 OJ 反馈代替自己检查"],
    ["15–45 min", "T2、T3"], ["45–78 min", "T4、T5"],
    ["78–102 min", "T6 或回头补前面卡住的题"],
    ["102–112 min", "检查输出格式：多余空格、换行、精度、特殊边界"],
  ];
  rows.forEach((r, i) => {
    const y = 1.0 + i * 0.44;
    pill(s, r[0], 0.5, y, 1.75, 0.38, i === rows.length - 1 ? C.goldText : C.dark, C.white, 10.5);
    text(s, r[1], 2.45, y, 7.05, 0.38, { fontSize: 11.5, valign: "middle", margin: 0 });
  });
  card(s, 0.5, 3.75, 9.0, 1.3, C.mint);
  text(s, "六条纪律", 0.7, 3.85, 3, 0.3, { fontSize: 12, bold: true, color: C.dark, margin: 0 });
  bullets(s, ["先看数据范围再想算法（第 4 周 3.4 节）；", "样例过了先交，OJ 的反馈比自己盯屏幕快；", "WA 就造数据：n=1、全相同、最大值、最小值、不连通；"],
    0.7, 4.18, 4.2, 0.85, { fontSize: 10.5, gap: 4 });
  bullets(s, ["TLE 先查复杂度，不要急着抠常数；", "卡满 15 分钟就换题，回来时往往一眼看出问题；", "留 10 分钟检查格式。"],
    5.0, 4.18, 4.3, 0.85, { fontSize: 10.5, gap: 4 });
}

// 7.4 pitfalls
{
  const s = content("7.4", "7 给学生的备考建议", "高频陷阱清单（考前最后一遍）");
  const left = ["忘 `int()` / 忘 `strip()`", "`[[0]*n]*m` 的别名陷阱", "`x in list` 是 O(n)；`list.pop(0)` 是 O(n)",
    "浮点用 `==` 比较；`int(x**0.5)` 差 1", "回溯忘 `path[:]` 拷贝 / 忘还原状态", "0-1 背包写成正序", "「恰好装满」没用 `±inf` 初始化"];
  const right = ["BFS 出队时才标记 visited", "带状态的搜索少加了一维", "二分答案的取整方向写反导致死循环",
    "多关键字排序只写了一个 key", "递归过深未 `setrecursionlimit`（或该改迭代）", "输出格式：多余空格 / 换行 / 精度（`85.00` 而非 `85.0`）"];
  bullets(s, left, 0.5, 1.05, 4.35, 3.9, { fontSize: 11.5, gap: 9 });
  bullets(s, right, 5.15, 1.05, 4.35, 3.9, { fontSize: 11.5, gap: 9 });
}

// 7.5 hard reminders
{
  const s = content("7.5", "7 给学生的备考建议", "三条硬性提醒");
  const items = [
    "考试禁止任何 AI 工具，包括本地模型与 IDE 的智能补全插件。",
    "无法解释自己提交的代码，按学术不端处理，成绩记 0。",
    "平时的自检方法：关掉所有窗口，从空文件重写一遍。写不出来 = 这道题你没做。",
  ];
  items.forEach((it, i) => {
    const y = 1.2 + i * 1.15;
    card(s, 0.5, y, 9.0, 1.0, "FDF0EE");
    text(s, "⚠", 0.7, y + 0.2, 0.6, 0.6, { fontSize: 26, color: C.bad, margin: 0 });
    text(s, it, 1.45, y, 7.8, 1.0, { fontSize: 13.5, bold: true, color: C.bad, valign: "middle", margin: 0, lsm: 1.2 });
  });
}

// 8 grading checklist (teacher, condensed)
{
  const s = content("8", "8 命题与阅卷检查清单（教师用，附参考）", "命题与阅卷检查清单");
  const rows = [
    ["命题前", "6 题覆盖 ≥5 个大类，贪心/DP/搜索各 ≥1 题；难度梯度 ★1→★5；数据范围明确；样例含易误解释；无歧义边界描述。"],
    ["参考解答", "已实际运行并通过全部样例；已测边界（n=1、空输入、全相同、极值、不连通）；已与暴力解对拍；复杂度声明与实际一致；递归确认不爆栈。"],
    ["测试数据", "每题有卡错解、卡超时的数据，且已用错误实现验证过；分档数据设计合理；时限按实测 3–5 倍设定。"],
    ["阅卷", "评分标准逐项可核对；抽查高分卷要求口头解释代码；记录各题实际 AC 率，用于下一年校准。"],
  ];
  table(s, rows.map((r, i) => i === 0 ? r : [{ t: r[0], bold: true }, r[1]]), 0.5, 1.1, 9.0, [1.4, 7.6], { fontSize: 11, rowH: 0.85 });
}

summarySlide("本周小结", [
  ["知识体系", "16 周分四条线：**计算机基础、语言与工具、算法与数据结构、AI 素养**；算法主线是**枚举 → 贪心/DP → 搜索**。"],
  ["机考规格", "**6 题 / 112 分钟**，**禁用一切 AI 工具**，**讲不清自己的代码按学术不端处理**。"],
  ["样卷六题", "字典排序、栈、区间分组、带状态 BFS、双目标背包、最小瓶颈路，难度从 ★1 递增到 ★5。"],
  ["备考两件事", "**默写 12 个模板** + **手写一页 cheat sheet**——抄不下的内容说明还没消化。"],
  ["考场六条", "看范围、早提交、造数据、查复杂度、按时换题、留时间查格式。"],
]);

// Closing (last week — no "下周预告")
{
  const s = sectionSlide("课程结语", "这门课是练出来的", "你完成的 150–200 道题、调过的每一个 WA、重写过的每一份代码，\n才是这门课真正留下的东西——它们不会随着考试结束而消失。");
  text(s, "下一步：《数据结构与算法》。那门课会从这里继续——树、图、哈希、字符串匹配，以及本课只开了个头的那些主题。", 0.7, 4.05, 8.3, 0.9, { fontSize: 13, color: C.mint, lsm: 1.3 });
}

  await D.save(OUT);
})().catch((e) => { console.error(e); process.exit(1); });

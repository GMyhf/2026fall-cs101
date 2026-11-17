// 11 月月考讲评与阶段复习 —— 由 202611_ADS_November_Exam_Review.md 整理成的讲课 PPT。
// 生成：cd courseware && python3 build_all.py nov
//   （等价于 cd courseware/pptx_builder && node decks/november_exam_review.js ../202611_ADS_November_Exam_Review.pptx）
// 页上的代码与讲义逐字一致，均已对样例、暴力对拍与最大规模数据验证；改代码时讲义与本文件一起改。
const fs = require("fs");
const path = require("path");
const { createDeck } = require("../lib");

// 参考代码直接从讲义抽取，保证课件与讲义逐字一致：CODE.T3.cpp / CODE.T3.py
const NOTE = fs.readFileSync(path.join(__dirname, "..", "..", "202611_ADS_November_Exam_Review.md"), "utf8");
const CODE = {};
// 长代码分两栏：左栏放前 N 行（数字改动时对照讲义里的行号）
const SPLIT = { T3: { cpp: 12, py: 12 }, T5: { cpp: 16, py: 18 }, T6: { cpp: 12, py: 10 } };
NOTE.split(/^## (?=T\d\. )/m).slice(1).forEach((sec) => {
  const id = sec.slice(0, 2);
  const cpp = [...sec.matchAll(/```cpp\n([\s\S]*?)```/g)];
  const py = [...sec.matchAll(/```python\n([\s\S]*?)```/g)];
  if (cpp.length !== 1 || py.length !== 1) throw new Error(`${id}: 讲义里应恰有一段 C++ 与一段 Python`);
  CODE[id] = { cpp: cpp[0][1].replace(/\n$/, ""), py: py[0][1].replace(/\n$/, "") };
});
if (Object.keys(CODE).join() !== "T1,T2,T3,T4,T5,T6") throw new Error("讲义题号应为 T1..T6");

const OUT = process.argv[2] || path.join(__dirname, "..", "out", "202611_ADS_November_Exam_Review.pptx");

(async () => {
  const D = createDeck({ title: "计算概论（B）11 月月考讲评与阶段复习", author: "Hongfei Yan" });
  const {
    C, text, bullets, codeBlock, callout, table, titleSlide, sectionSlide, content, summarySlide,
  } = D;

// ---- slides（顶层不缩进，避免改动模板字符串里的代码缩进）----

// 题面页：题意复述 + 两个样例 + 思路要点
function problemSlide(id, head, sub, statement, s1, s2, ideaTitle, idea, opts = {}) {
  const s = content(head.match(/T\d/)[0], head, sub);
  text(s, statement, 0.5, 1.0, 9, 0.9, { fontSize: 12, lsm: 1.15 });
  const sh = opts.sampleH || 1.02;
  const fs = opts.sampleFs || 10;
  text(s, s2 ? "样例 1" : "样例", 0.5, 1.78, 2, 0.22, { fontSize: 9, bold: true, color: C.green, margin: 0 });
  codeBlock(s, s1, 0.5, 2.0, s2 ? 4.4 : 9.0, sh, { fontSize: fs, lang: "text" });
  if (s2) {
    text(s, "样例 2", 5.1, 1.78, 2, 0.22, { fontSize: 9, bold: true, color: C.green, margin: 0 });
    codeBlock(s, s2, 5.1, 2.0, 4.4, sh, { fontSize: fs, lang: "text" });
  }
  const y = 2.0 + sh + 0.15;
  if (ideaTitle) callout(s, ideaTitle, idea, 0.5, y, 9.0, 4.85 - y, { fontSize: opts.ideaFs || 12.5 });
  else text(s, idea, 0.5, y, 9.0, 4.85 - y, { fontSize: opts.ideaFs || 12.5, lsm: 1.15 });
  text(s, `题目：cs101.openjudge.cn/practice/${id.slice(-5)}/`, 0.5, 4.95, 9, 0.28, { fontSize: 10, color: C.muted });
  return s;
}

// 代码页：C++ 与 Python 左右对照
function codePair(head, cpp, py, fs = 10) {
  const s = content(head.split(" ")[0], `月考讲评 · ${head} · 参考代码`, "C++ 与 Python 对照");
  text(s, "C++", 0.5, 0.98, 2, 0.25, { fontSize: 11, bold: true, color: C.green, margin: 0 });
  text(s, "Python", 5.1, 0.98, 2, 0.25, { fontSize: 11, bold: true, color: C.green, margin: 0 });
  codeBlock(s, cpp, 0.5, 1.25, 4.5, 3.75, { fontSize: fs, lang: "cpp" });
  codeBlock(s, py, 5.1, 1.25, 4.4, 3.75, { fontSize: fs, lang: "py" });
  return s;
}

// 代码页：单一语言，长代码在第 split 行处分成左右两栏
function codeSplit(head, lang, code, split, fs = 9) {
  const name = lang === "cpp" ? "C++" : "Python";
  const s = content(head.split(" ")[0], `月考讲评 · ${head} · 参考代码`, name);
  const lines = code.split("\n");
  text(s, name, 0.5, 0.98, 2, 0.25, { fontSize: 11, bold: true, color: C.green, margin: 0 });
  text(s, name + "（续）", 5.1, 0.98, 2, 0.25, { fontSize: 11, bold: true, color: C.green, margin: 0 });
  codeBlock(s, lines.slice(0, split).join("\n"), 0.5, 1.25, 4.5, 3.75, { fontSize: fs, lang });
  codeBlock(s, lines.slice(split).join("\n"), 5.1, 1.25, 4.4, 3.75, { fontSize: fs, lang });
  return s;
}

// =====================================================================
// Cover
titleSlide({
  kicker: "计算概论（B） · 11 月月考 · 2026 Fall",
  title: "11 月月考讲评与阶段复习",
  subtitle: "第 6–10 周知识清单 · 月考 6 题讲评 · 常见失分点",
  topics: "这次月考考什么：从语法关到建模关\n第 6–10 周知识清单自检\n月考 6 题：题面 / 样例 / 思路 / C++ 与 Python 参考代码\n常见失分点归类 · 订正作业",
  footer: "Compiled by Hongfei Yan · 2026 Fall · github.com/GMyhf/2026fall-cs101",
});

// 1 positioning
{
  const s = content("1", "这次月考考什么", "从语法关到建模关");
  text(s, "10 月月考查语法：循环、分支、排序、筛法。11 月月考往上走一级——题面不再直接告诉你用什么，要自己把它**翻译成一个熟悉的结构**：", 0.5, 1.0, 9, 0.7, { fontSize: 13, lsm: 1.15 });
  table(s, [
    ["题面说的", "其实是"],
    ["每格一个箭头，问能不能走出去", "每点一条出边的图：**找环** + 记忆化"],
    ["依次打开格子，问何时上下连通", "只加不删的连通性：**并查集** + 虚拟结点"],
    ["已知操作结果，求初始顺序", "**倒着模拟**：把每一步撤销"],
    ["大量区间询问「是否合法」", "**前缀和** 转化条件，**单调栈** 预处理"],
  ], 0.5, 1.8, 9.0, [4.3, 4.7], { fontSize: 12.5, rowH: 0.5 });
  text(s, "规格不变：**6 题 / 112 分钟**，与 10 月月考、期末上机考试一致。", 0.5, 4.6, 9, 0.4, { fontSize: 12, color: C.muted });
}

// 1.1 exam format
{
  const s = content("1.1", "1 这次月考考什么", "考试形式");
  table(s, [
    ["项目", "说明"],
    ["地点", "机房（具体安排以通知为准）"],
    [{ t: "时长", bold: true }, { t: "112 分钟", bold: true, color: C.ok }],
    [{ t: "题量", bold: true }, { t: "6 题", bold: true, color: C.ok }],
    ["平台", "OpenJudge（cs101 小组）"],
    ["语言", "Python 3 为主，允许 C++"],
    ["允许", "十页 A4，双面，手写或打印 cheat sheet"],
  ], 0.5, 1.1, 9.0, [1.6, 7.4], { fontSize: 13, rowH: 0.42 });
  callout(s, "禁止", "**任何 AI 工具**（含本地模型）、联网查询、任何形式的交流。", 0.5, 4.12, 4.35, 0.85, { fontSize: 12, fill: "FDF0EE", tcolor: C.bad });
  callout(s, "学术诚信", "**无法解释自己提交的代码**，按学术不端处理。", 5.15, 4.12, 4.35, 0.85, { fontSize: 12, fill: "FDF0EE", tcolor: C.bad });
}

// 2 checklist
{
  const s = content("2", "2 第 6–10 周知识清单", "逐条打勾，打不了勾的就是这次要补的");
  bullets(s, [
    "二维网格：`(i, j)` ↔ `i * m + j` 互转；四方向数组 `dr / dc`；越界判断写在访问之前",
    "排序与贪心：能说出「从左往右能坐就坐」为什么是对的",
    "队列与栈：`deque` 两端 O(1)；`list.pop(0)` 是 O(n)",
    "单调栈：一遍求出「右边第一个更小的元素」",
    "递归与记忆化：递归深度上限；能把深递归改成显式循环",
    "并查集：`find` 路径压缩、`union`；**虚拟结点**表示「第一行」「最后一行」",
    "前缀和：区间和、区间「平衡」用 `pre[r] - pre[l-1]` 表达",
    "进制：`bin(x)[2:]`；C++ 里用 `% base` 和 `/ base` 拆数位",
  ], 0.5, 1.1, 9.0, 3.9, { fontSize: 13, gap: 9 });
}

// ============================ PART ============================
sectionSlide("Part 2", "月考讲评", "6 道真题，题名已联网核实\n每题给出 C++ 与 Python 两份参考代码");

// difficulty ladder（表格，不用等宽图：中文宽度对不齐）
{
  const s = content("3", "3 月考讲评", "难度梯度：从签到到综合");
  table(s, [
    ["题", "题号 · 题名", "难度", "考点"],
    ["T1", "E31529 双重回文", { t: "★☆☆☆☆", color: C.gold }, "枚举 · 进制转换"],
    ["T2", "E31530 图书馆选座", { t: "★★☆☆☆", color: C.gold }, "模拟 · 一遍扫描"],
    ["T3", "M31531 箭头迷阵", { t: "★★★☆☆", color: C.gold }, "网格图 · 找环 · 记忆化"],
    ["T4", "M31532 牌堆魔术", { t: "★★★☆☆", color: C.gold }, "双端队列 · 倒推"],
    ["T5", "M31533 渗透实验", { t: "★★★☆☆", color: C.gold }, "并查集 · 虚拟结点"],
    ["T6", "T31534 括号区间审计", { t: "★★★★☆", color: C.gold }, "前缀和 · 单调栈"],
  ], 0.5, 1.1, 9.0, [0.7, 3.0, 1.7, 3.6], { fontSize: 13, rowH: 0.46 });
  text(s, "代码均已对样例、暴力参照的随机对拍和最大规模数据验证。完整题面以 OpenJudge 为准。", 0.5, 4.6, 9.0, 0.4, { fontSize: 11.5, color: C.muted });
}

// ---------------- T1
problemSlide("E31529", "月考讲评 · T1 E31529 双重回文", "枚举奇数，两种进制各判一次回文",
  "正整数在十进制和二进制（无前导零）下都是回文，称为双重回文数。给定 n（1 ≤ n ≤ 10⁶），输出 1..n 中双重回文数的个数和最大的一个。",
  `输入
5
输出
3 5`, `输入
100
输出
7 99`,
  "直接枚举就够，偶数还可以直接跳过",
  "10⁶ 个数每个判两次回文，Python 也来得及。**偶数的二进制末位是 0**，而最高位一定是 1，所以偶数不可能是二进制回文，只枚举奇数。C++ 不转字符串：按 base 进制把数倒过来，看是否等于自己。n = 10⁶ 时答案是 19 585585。");

codePair("T1 E31529 双重回文", CODE.T1.cpp, CODE.T1.py, 9.5);

// ---------------- T2
problemSlide("E31530", "月考讲评 · T2 E31530 图书馆选座", "座位只会越坐越满：一个指针扫到底",
  "n 个座位排成一行，01 串 s 表示初始占用。m 位同学依次来，每人选编号最小、且相邻座位都空着的空座位坐下，没有就离开（n, m ≤ 2000）。输出坐下的人数和最终的 01 串。",
  `输入
5 2
00000
输出
2
10100`, `输入
4 2
0100
输出
1
0101`,
  "照题意模拟 O(nm) 能过；再想一步就是 O(n)",
  "一个座位现在不能坐，以后也不可能变得能坐；某人坐在 i 之后，i+1 也不能坐了。所以下一位同学的座位一定在上一位右边——**从左扫到右，能坐就坐，坐满 m 人就停**。⚠️ 边界：Python 的 `s[-1]` 不报错，会悄悄读到最后一个座位。",
  { sampleH: 1.3, ideaFs: 12 });

codePair("T2 E31530 图书馆选座", CODE.T2.cpp, CODE.T2.py, 10.5);

// ---------------- T3
problemSlide("M31531", "月考讲评 · T3 M31531 箭头迷阵", "每格一条出边：要么出界，要么掉进环",
  "n×m 网格（n×m ≤ 2×10⁵），每格一个箭头 U/D/L/R。从某格出发一直按箭头走，若最终走出场地就称该格可以逃出（途中可以先绕圈）。统计能逃出的格子数。",
  `输入
2 2
UD
DU
输出
2`, `输入
3 3
URD
LDR
RUL
输出
5`,
  "路线是确定的：回到走过的格子就永远出不去",
  "「途中可以先绕圈」只是说路线会拐来拐去；一旦**真的回到走过的格子**，就困在环里了。所以每格的结论只有两种，可以**记下来复用**。",
  { sampleH: 1.48 });

{
  const s = content("T3", "月考讲评 · T3 M31531 箭头迷阵", "四种状态 + 显式路径，不用递归");
  table(s, [
    ["状态", "含义", "走到这里时"],
    [{ t: "0", mono: true }, "未访问", "标 1，加入 path，继续往前走"],
    [{ t: "1", mono: true }, "在当前路线上", { t: "撞上本条路线：成环，结论「逃不出」", color: C.bad }],
    [{ t: "2", mono: true }, "能逃出", "直接接上已知结论"],
    [{ t: "3", mono: true }, "逃不出", "直接接上已知结论"],
    ["出界", "—", { t: "结论「能逃出」", color: C.ok }],
  ], 0.5, 1.1, 9.0, [1.2, 2.4, 5.4], { fontSize: 12.5, rowH: 0.42 });
  callout(s, "停下后，把 path 上的格子全部标成这个结论", "每格只走一次，O(nm)。为什么不写递归？一行全是 R 时路线长 2×10⁵，递归会撞上深度限制，得配 threading 加大栈（第 8 周 §2.2）。显式维护 path 的循环是**同一个算法**，没有这个问题。", 0.5, 3.75, 9.0, 1.25, { fontSize: 12 });
}

codeSplit("T3 M31531 箭头迷阵", "cpp", CODE.T3.cpp, SPLIT.T3.cpp, 8.5);

codeSplit("T3 M31531 箭头迷阵", "py", CODE.T3.py, SPLIT.T3.py, 9);

// ---------------- T4
problemSlide("M31532", "月考讲评 · T4 M31532 牌堆魔术", "已知结果求开头：倒着做，把每一步撤销",
  "n 张牌（n ≤ 2×10⁵）叠成一摞，重复 n 轮：先把顶牌移到底，再翻开顶牌拿走。要求翻开的顺序恰好是 1, 2, …, n，求初始牌堆从上到下的顺序。",
  `输入
4
输出
4 1 3 2`, `输入
5
输出
3 1 5 2 4`,
  "i 从 n 倒数到 1：先放回 i，再把底牌移回顶",
  "撤销「翻开顶牌 i」= 把 i 放回牌顶；撤销「顶牌移到底」= 把底牌移回牌顶。两端进出用双端队列，总 O(n)。n = 4 验算：[4] → [4,3] → [3,2,4] → [4,1,3,2]。⚠️ 用 `list.insert(0, x)` 每次 O(n)，总 O(n²) 会 TLE。",
  { ideaFs: 12 });

codePair("T4 M31532 牌堆魔术", CODE.T4.cpp, CODE.T4.py, 10);

// ---------------- T5
problemSlide("M31533", "月考讲评 · T5 M31533 渗透实验", "只开不关：并查集 + 两个虚拟结点",
  "n×m 网格（n×m ≤ 2×10⁵）初始全封闭，依次打开 q 个格子。若存在只经过打开格子、从第 1 行通到第 n 行的四连通路径，就称已渗透。求第一次渗透的操作编号，始终不渗透输出 −1。",
  `输入
3 3 3
1 1
2 1
3 1
输出
3`, `输入
3 3 4
1 1
1 2
1 3
2 2
输出
-1`,
  "渗透 ⟺ find(TOP) == find(BOT)",
  "第 1 行的格子一打开就与 TOP 合并，第 n 行的与 BOT 合并，再与四邻中已打开的格子合并。每次操作后判一次 TOP、BOT 是否同根。每次重新 BFS 是 O(q·nm)，必然超时。",
  { sampleH: 1.66, sampleFs: 9.5, ideaFs: 12 });

codeSplit("T5 M31533 渗透实验", "cpp", CODE.T5.cpp, SPLIT.T5.cpp, 8.5);

codeSplit("T5 M31533 渗透实验", "py", CODE.T5.py, SPLIT.T5.py, 9);

{
  const s = content("T5", "月考讲评 · T5 M31533 渗透实验", "边界：n = 1");
  callout(s, "第 1 行就是第 n 行", "n = 1 时打开任意一格，就同时连上 TOP 和 BOT，答案是 1。参考代码里两个 if 各自独立判断，自然覆盖这个边界；写成 if … elif … 就错了。", 0.5, 1.15, 9.0, 1.3, { fontSize: 13, fill: "FDF0EE", tcolor: C.bad });
  callout(s, "为什么不用每次 BFS", "格子只开不关，连通块只合并不拆分——这正是并查集擅长的「增量连通性」。路径减半让每次 find 均摊接近 O(1)，q 次操作总共接近线性。", 0.5, 2.7, 9.0, 1.3, { fontSize: 13, fill: C.mint, tcolor: C.dark });
}

// ---------------- T6
problemSlide("T31534", "月考讲评 · T6 T31534 括号区间审计", "前缀和把「合法」变成区间性质",
  "括号串 s（长度 n ≤ 2×10⁵），q 次询问（q ≤ 2×10⁵），每次问子串 s[l..r] 是否为合法括号序列。每次现场扫一遍是 O(nq) = 4×10¹⁰，必然超时。",
  `输入
(()())
5
1 6
2 5
1 5
3 4
4 4
输出
YES
YES
NO
NO
NO`, `输入
())(()
4
1 2
2 5
1 6
3 6
输出
YES
NO
NO
NO`,
  null,
  "令 pre[i] = 前 i 个字符中 左括号数 − 右括号数。下一页把「合法」写成关于 pre 的两个条件。",
  { sampleH: 2.25, sampleFs: 8, ideaFs: 12 });

{
  const s = content("T6", "月考讲评 · T6 T31534 括号区间审计", "两个条件 + 单调栈");
  table(s, [
    ["合法括号序列的定义", "用前缀和写出来"],
    ["左右括号数相等", { t: "pre[r] == pre[l-1]", mono: true }],
    ["任意前缀左括号不少于右括号", { t: "min(pre[l..r]) >= pre[l-1]", mono: true }],
  ], 0.5, 1.1, 9.0, [4.0, 5.0], { fontSize: 13, rowH: 0.5 });
  callout(s, "单调栈：nxt[i] = i 右边第一个 pre 比 pre[i] 小的位置", "条件 2 ⟺ 第一次「跌破」pre[l-1] 发生在区间之外 ⟺ nxt[l-1] > r。单调栈一遍预处理 O(n)，每次询问 O(1)。", 0.5, 2.85, 9.0, 1.1, { fontSize: 12.5 });
  callout(s, "另一种做法", "ST 表（稀疏表）求区间最小值同样 O(1) 回答，但要 O(n log n) 预处理、代码更长。题目提示的「单调栈」就是上面这个更短的做法。", 0.5, 4.1, 9.0, 0.9, { fontSize: 11.5, fill: C.mint, tcolor: C.dark });
}

codeSplit("T6 T31534 括号区间审计", "cpp", CODE.T6.cpp, SPLIT.T6.cpp, 8);

codeSplit("T6 T31534 括号区间审计", "py", CODE.T6.py, SPLIT.T6.py, 9);

// ============================ PART ============================
sectionSlide("Part 3", "失分点与订正", "常见失分点归类 · 本次作业");

{
  const s = content("4", "4 常见失分点归类", "记类型，不记题目");
  table(s, [
    ["失分类型", "出现在", "对策"],
    ["边界下标", "T2 座位 1 / n、T5 第 1 行 / 第 n 行", "先判越界再访问；n = 1 必测"],
    ["递归太深", "T3 一行全是 R", "改成显式维护 path 的循环"],
    ["O(n) 操作放进循环", { t: "T4 list.insert(0, x)", mono: true }, "两端进出用 deque"],
    ["每次询问重算", "T5 每次 BFS、T6 每次扫子串", "并查集 / 前缀和 + 单调栈"],
    ["大量输出逐行 print", "T6", { t: "'\\n'.join 一次输出", mono: true }],
  ], 0.5, 1.1, 9.0, [2.3, 3.4, 3.3], { fontSize: 12, rowH: 0.5 });
  text(s, "订正方法同第 5 周：**三分类 → 关掉题解从空文件重写 → 把错误类型写进 cheat sheet**。", 0.5, 4.3, 9.0, 0.6, { fontSize: 12.5, lsm: 1.1 });
}

{
  const s = content("5", "本次作业", "");
  table(s, [
    ["#", "任务", "说明"],
    ["1", "订正全部未 AC 题", "关掉讲评，从空文件重写，一次通过"],
    ["2", "用另一种语言再写一遍 T4", "Python 写过就写 C++，反之亦然"],
    ["3", "T6 改用 ST 表实现", "与单调栈版本对拍"],
    ["4", "更新错题类型表", "在第 5 周那份表上至少追加 3 条"],
  ], 0.5, 1.1, 9.0, [0.6, 3.6, 4.8], { fontSize: 13, rowH: 0.55 });
}

summarySlide("小结", [
  ["建模关", "11 月月考查**建模**：把题面翻译成找环、并查集、倒推、前缀和这些熟悉的结构。"],
  ["难度梯度", "枚举进制 → 一遍扫描 → 找环记忆化 → 双端队列倒推 → 并查集虚拟结点 → 前缀和 + 单调栈；规格仍是 **6 题 / 112 分钟**。"],
  ["复杂度意识", "深递归改循环、两端进出用 deque、询问多就先预处理。"],
  ["订正方法", "**分类 → 关题解重写 → 记录错误类型**。"],
]);

  await D.save(OUT);
})().catch((e) => { console.error(e); process.exit(1); });

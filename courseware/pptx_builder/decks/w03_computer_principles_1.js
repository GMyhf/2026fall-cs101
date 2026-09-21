// 第 3 周 计算机原理（1/2）—— 由 202609_ADS_W03_Computer_Principles_1.md 整理成的讲课 PPT。
// 生成：cd courseware/pptx_builder && node decks/w03_computer_principles_1.js ../202609_ADS_W03_Computer_Principles_1.pptx
// 页上所有的运行结果、逐步 trace 都在 Python 3.12 下实跑核对过；改代码时连同结果一起改。
const path = require("path");
const { createDeck } = require("../lib");

const OUT = process.argv[2] || path.join(__dirname, "..", "out", "202609_ADS_W03_Computer_Principles_1.pptx");

(async () => {
  const D = createDeck({ title: "计算概论（B）第 3 周 计算机原理（1/2）", author: "Hongfei Yan" });
  const {
    pres, C, FONT, MONO, runs, text, bullets, card, codeBlock, consoleBlock, callout, table,
    cells, arrowLabel, pill, numCircle, titleSlide, sectionSlide, content, summarySlide,
  } = D;

// ---- slides（顶层不缩进，避免改动模板字符串里的代码缩进）----
// =====================================================================
// Cover
titleSlide({
  kicker: "计算概论（B） · 第 3 周 · 2026 Fall",
  title: "计算机原理（1/2）",
  subtitle: "计算机文化与基本概念",
  topics: "计算机科学的学科体系与抽象 · 图灵机与可计算性 · 停机问题\n冯·诺依曼结构 · 指令周期 · 存储层次\n进制转换 · 原码 / 反码 / 补码 · 位运算 · IEEE 754 浮点与精度陷阱\nASCII · Unicode 与 UTF-8 · 计算机先驱与摩尔定律",
  footer: "Compiled by Hongfei Yan · 2026 Fall · github.com/GMyhf/2026fall-cs101",
});

// Three questions
{
  const s = content("?", "本周导引", "本周要回答三个问题");
  const qs = [
    ["计算机能算什么、不能算什么？", "图灵机给出「可计算」的定义；**停机问题**是被证明了的不可能。"],
    ["程序和数据在机器里长什么样？", "冯·诺依曼的**存储程序**：指令和数据放在同一块存储器里，都是二进制。"],
    ["为什么 0.1 + 0.2 ≠ 0.3？", "整数用**补码**、小数用 **IEEE 754**、文字用 **UTF-8**——每种表示都有它的边界。"],
  ];
  qs.forEach((q, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.15, 2.85, 2.55, C.code);
    numCircle(s, i + 1, x + 0.2, 1.32, 0.46, C.dark);
    text(s, q[0], x + 0.2, 1.92, 2.5, 0.7, { fontSize: 14, bold: true, color: C.dark, margin: 0 });
    text(s, q[1], x + 0.2, 2.65, 2.5, 0.95, { fontSize: 11.5, margin: 0, lsm: 1.2 });
  });
  card(s, 0.5, 3.95, 9.0, 1.1, C.dark);
  text(s, "一句话概括", 0.75, 4.05, 3, 0.3, { fontSize: 11, bold: true, color: C.gold, margin: 0 });
  s.addText([
    { text: "这一周暂时离开写题，", options: { color: C.white } },
    { text: "往下看一层", options: { color: C.gold, bold: true } },
    { text: "：程序跑在什么样的机器上，数据在机器里", options: { color: C.white } },
    { text: "怎样表示", options: { color: C.gold, bold: true } },
    { text: "。", options: { color: C.white } },
  ], { x: 0.75, y: 4.38, w: 8.6, h: 0.5, fontFace: FONT, fontSize: 15, margin: 0, isTextBox: true, valign: "middle" });
}

// Roadmap
{
  const s = content("≡", "本周导引", "内容地图");
  const cols = [
    ["1–2  计算", ["1 计算机科学是什么：学科体系、抽象", "2.1 图灵机模型与转移规则", "2.2 丘奇—图灵论题、停机问题", "2.3 用 Python 实现一台图灵机"]],
    ["3–4  机器与数据", ["3 冯·诺依曼结构：五大部件、指令周期、存储层次", "4.1 进制与转换", "4.2 原码、反码、补码", "4.3 位运算", "4.4 浮点数与精度陷阱"]],
    ["5–6  编码与文化", ["5.1 ASCII", "5.2 Unicode 与 UTF-8、乱码", "6 计算机先驱、摩尔定律", "本周练习 · 思考题 · 小结"]],
  ];
  cols.forEach((c, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.15, 2.85, 3.9, i === 1 ? C.cream : C.code);
    text(s, c[0], x + 0.2, 1.3, 2.5, 0.45, { fontSize: 20, bold: true, color: C.dark, margin: 0 });
    bullets(s, c[1], x + 0.15, 1.9, 2.6, 3.0, { fontSize: 12, gap: 8 });
  });
}

// Run first
{
  const s = content("▶", "先跑一遍", "五行代码，五个本周要讲清楚的现象");
  codeBlock(s, `print(0.1 + 0.2)           # 小数：为什么多了个尾巴？
print(bin(233))            # 整数：机器里只有 0 和 1
print(-5 & 0xFF)           # 负数：-5 的低 8 位怎么变成了 251？
print(ord('A'), ord('a'))  # 字符：其实是编号
print("中".encode())       # 汉字：一个字 3 个字节`, 0.5, 1.1, 5.6, 1.75, { fontSize: 10.5, lang: "py" });
  consoleBlock(s, "0.30000000000000004\n0b11101001\n251\n65 97\nb'\\xe4\\xb8\\xad'", 6.35, 1.1, 3.15, 1.75);
  const qs = [
    ["0.1 + 0.2", "十进制 0.1 在二进制里是无限循环小数", "4.4"],
    ["bin(233)", "除基取余：233 = 1110 1001₂", "4.1"],
    ["-5 & 0xFF", "−5 的 8 位补码就是 1111 1011 = 251", "4.2"],
    ["ord / chr", "ASCII：'A' = 65，'a' = 97，相差 32", "5.1"],
    ["encode()", "UTF-8 把码点 U+4E2D 编成 3 个字节", "5.2"],
  ];
  qs.forEach((q, i) => {
    const y = 3.05 + i * 0.4;
    text(s, q[0], 0.6, y, 1.6, 0.34, { fontSize: 11, bold: true, color: C.green, valign: "middle", margin: 0 });
    text(s, q[1], 2.25, y, 6.1, 0.34, { fontSize: 11.5, valign: "middle", margin: 0 });
    pill(s, "§ " + q[2], 8.55, y + 0.03, 0.9, 0.28, C.dark, C.gold, 9.5);
  });
}

// ============================ PART 1 ============================
sectionSlide("Part 1", "计算机科学是什么", "它研究的是计算本身，计算机只是载体\n学科体系 · 抽象");

// 1.1 misconception
{
  const s = content("1.1", "1 计算机科学是什么", "一个常见的误解");
  card(s, 0.5, 1.15, 9.0, 1.5, C.dark);
  text(s, "“", 0.7, 1.05, 0.6, 0.8, { fontSize: 48, bold: true, color: C.gold, margin: 0 });
  text(s, "计算机科学不是关于计算机的科学，\n正如天文学不是关于望远镜的科学。", 1.3, 1.3, 7.9, 1.0, { fontSize: 20, bold: true, color: C.white, margin: 0, lsm: 1.2 });
  text(s, "计算机科学研究的是这三个问题，计算机只是执行计算的机器：", 0.5, 2.85, 9, 0.35, { fontSize: 13 });
  const qs = [["什么问题可以被计算？", "可计算性 —— 本周的图灵机与停机问题"], ["怎样高效地计算？", "算法设计 —— 整门课的主线"], ["计算的代价是多少？", "复杂度 —— 第 4 周的大 O"]];
  qs.forEach((q, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 3.3, 2.85, 1.75, C.code);
    numCircle(s, i + 1, x + 0.2, 3.45, 0.4, C.green);
    text(s, q[0], x + 0.2, 3.95, 2.5, 0.4, { fontSize: 13.5, bold: true, color: C.dark, margin: 0 });
    text(s, q[1], x + 0.2, 4.35, 2.5, 0.6, { fontSize: 11, color: C.muted, margin: 0 });
  });
}

// 1.2 discipline
{
  const s = content("1.2", "1 计算机科学是什么", "学科体系：三个层次");
  table(s, [
    ["层次", "关注", "本课涉及"],
    [{ t: "理论", bold: true }, "可计算性、复杂性、算法", "图灵机（本周）、大 O（第 4 周）、算法设计"],
    [{ t: "系统", bold: true }, "体系结构、操作系统、网络、编译", "冯·诺依曼结构（本周）、虚拟地址空间、进程（第 13 周）"],
    [{ t: "应用", bold: true }, "数据库、图形学、人工智能", "AI 素养（第 14 周）、知识图谱、神经网络（第 15 周）"],
  ], 0.5, 1.15, 9.0, [1.0, 3.2, 4.8], { fontSize: 12.5, rowH: 0.55 });
  callout(s, "这门课站在哪里", "主线是**理论层的算法**：用 Python 把问题变成正确、够快的程序。第 3、13 周两次「往下看一层」，补上**系统层**的常识——很多「为什么这么慢」「为什么结果不对」的答案都在那里。", 0.5, 3.6, 9.0, 1.45, { fontSize: 12.5 });
}

// 1.3 abstraction layers
{
  const s = content("1.3", "1 计算机科学是什么", "抽象：计算机科学最核心的工具");
  text(s, "同一句 `print(\"hello\")`，在不同层次上看到的是不同的东西：", 0.5, 1.05, 9, 0.35, { fontSize: 13 });
  const layers = [
    ["应用层", "print(\"hello\")", "你写的代码"],
    ["语言层", "Python 字节码", "解释器执行的指令序列"],
    ["运行层", "CPython 解释器", "一个用 C 写的程序"],
    ["系统层", "系统调用 write()", "请操作系统把字节写到屏幕"],
    ["硬件层", "CPU 指令、内存读写", "最终是电压的高低"],
  ];
  const fills = ["CFE0D8", "DCE8E2", "E6EFEA", "EEF3F0", "F5F8F6"];
  layers.forEach((l, i) => {
    const y = 1.5 + i * 0.7;
    card(s, 0.5 + i * 0.12, y, 5.4 - i * 0.24, 0.58, fills[i], C.green);
    text(s, l[0], 0.7 + i * 0.12, y, 1.1, 0.58, { fontSize: 13, bold: true, color: C.dark, valign: "middle", margin: 0 });
    text(s, l[1], 1.85, y, 2.2, 0.58, { fontSize: 11.5, bold: true, color: C.green, valign: "middle", margin: 0 });
    text(s, l[2], 4.05, y, 1.8 - i * 0.12, 0.58, { fontSize: 10, color: C.muted, valign: "middle", margin: 0 });
  });
  s.addShape(pres.shapes.LINE, { x: 6.05, y: 1.55, w: 0, h: 3.35, line: { color: C.green, width: 2, endArrowType: "triangle" } });
  text(s, "越往下\n越具体", 6.1, 2.9, 0.8, 0.6, { fontSize: 10, color: C.green, bold: true, margin: 0 });
  callout(s, "抽象的价值", [
    "**你不需要同时想所有层**——写应用时不必想电压。",
    "但**知道下一层存在**，出错时才知道往哪儿看。",
  ], 6.9, 1.5, 2.6, 3.4, { fontSize: 11.5, gap: 8 });
}

// 1.3 where to look when things break
{
  const s = content("1.3", "1 计算机科学是什么", "出了问题，往下一层找原因");
  text(s, "本周会讲到的几个「怪现象」，答案都不在你写的那一层：", 0.5, 1.05, 9, 0.35, { fontSize: 13 });
  table(s, [
    ["现象（应用层看到的）", "原因在哪一层", "本周哪一节"],
    [{ t: "0.1 + 0.2 == 0.3 是 False", mono: true }, "硬件层：浮点数是二进制近似", "4.4"],
    [{ t: "C++ 里 2147483647 + 1 变成负数", mono: false }, "硬件层：32 位补码溢出", "4.2"],
    [{ t: "打开文件满屏「浣犲ソ」", mono: false }, "系统 / 语言层：编码与解码不一致", "5.2"],
    [{ t: "按列遍历大矩阵比按行慢", mono: false }, "硬件层：缓存与存储层次", "3.3"],
    [{ t: "程序「卡住」了——是死循环还是慢？", mono: false }, "理论层：停机问题不可判定", "2.2"],
  ], 0.5, 1.5, 9.0, [3.9, 3.9, 1.2], { fontSize: 12, rowH: 0.45 });
  callout(s, "怎么用这张表", "遇到「代码明明没错，结果却不对」时，先问：**这是哪一层的规则？**", 0.5, 4.3, 9.0, 0.8, { fontSize: 12, fill: C.mint, tcolor: C.dark });
}

// ============================ PART 2 ============================
sectionSlide("Part 2", "图灵机与可计算性", "1936 年，Alan Turing 用一个极简模型回答「什么是计算」\n模型 · 转移规则 · 丘奇—图灵论题 · 停机问题 · Python 实现");

// 2.1 model diagram
{
  const s = content("2.1", "2 图灵机 · 模型", "图灵机：纸带 + 读写头 + 状态机");
  card(s, 0.5, 1.1, 9.0, 2.35, C.code);
  text(s, "…", 0.75, 1.45, 0.5, 0.5, { fontSize: 18, bold: true, color: C.muted, align: "center", valign: "middle", margin: 0 });
  cells(s, 1.3, 1.5, ["_", "1", "0", "1", "1", "0", "_"], { cw: 0.62, ch: 0.46, fs: 15, fills: [C.white, null, null, "F2B134", null, null, C.white] });
  text(s, "…", 5.65, 1.45, 0.5, 0.5, { fontSize: 18, bold: true, color: C.muted, align: "center", valign: "middle", margin: 0 });
  text(s, "← 无限长的纸带，每格一个符号 →", 6.2, 1.55, 3.2, 0.36, { fontSize: 11, color: C.muted, margin: 0 });
  s.addShape(pres.shapes.LINE, { x: 3.17, y: 2.0, w: 0, h: 0.42, line: { color: C.bad, width: 2, beginArrowType: "triangle" } });
  text(s, "读写头：读 / 写 / 左移 / 右移", 3.35, 2.08, 3.2, 0.3, { fontSize: 11, bold: true, color: C.bad, margin: 0 });
  pill(s, "状态机：当前状态 q0", 2.05, 2.55, 2.25, 0.46, C.dark, C.white, 12);
  text(s, "有限个状态 + 一张规则表", 4.45, 2.6, 3.5, 0.36, { fontSize: 11, color: C.muted, valign: "middle", margin: 0 });
  text(s, "一个图灵机由**转移规则**定义：", 0.5, 3.6, 9, 0.35, { fontSize: 13 });
  card(s, 0.5, 4.0, 9.0, 0.7, C.dark);
  s.addText([
    { text: "(当前状态, 读到的符号)", options: { color: C.white } },
    { text: "  →  ", options: { color: C.gold, bold: true } },
    { text: "(写入的符号, 移动方向, 下一状态)", options: { color: C.white } },
  ], { x: 0.7, y: 4.0, w: 8.6, h: 0.7, fontFace: FONT, fontSize: 16, bold: true, align: "center", valign: "middle", margin: 0, isTextBox: true });
  text(s, "每一步只做三件事：写一格、挪一步、换一个状态。就这么多。", 0.5, 4.75, 9, 0.3, { fontSize: 11, color: C.muted, margin: 0 });
}

// 2.1 rules table
{
  const s = content("2.1", "2 图灵机 · 模型", "一台「二进制加一」的图灵机：只要三条规则");
  text(s, "读写头从**最低位**（最右边）出发，只用一个状态 `q0`：", 0.5, 1.05, 9, 0.35, { fontSize: 13 });
  table(s, [
    ["当前状态", "读到", "写入", "移动", "下一状态", "含义"],
    [{ t: "q0", mono: true }, { t: "1", mono: true }, { t: "0", mono: true }, { t: "L", mono: true }, { t: "q0", mono: true }, "1 + 1 = 10：本位写 0，**进位**向左"],
    [{ t: "q0", mono: true }, { t: "0", mono: true }, { t: "1", mono: true }, { t: "N", mono: true }, { t: "halt", mono: true, color: C.ok, bold: true }, "0 + 1 = 1：吸收进位，停机"],
    [{ t: "q0", mono: true }, { t: "_", mono: true }, { t: "1", mono: true }, { t: "N", mono: true }, { t: "halt", mono: true, color: C.ok, bold: true }, "走到最左边的空白：补一位 1，停机"],
  ], 0.5, 1.5, 9.0, [1.1, 0.8, 0.8, 0.8, 1.1, 4.4], { fontSize: 12, rowH: 0.48, align: "left" });
  callout(s, "移动方向", [
    "`L` 左移一格，`R` 右移一格，`N` 不动。",
    "`_` 表示空白格：纸带两端无限延伸，全是空白。",
  ], 0.5, 3.65, 4.35, 1.4, { fontSize: 11.5 });
  callout(s, "和手算一模一样", "你在纸上做 `1011 + 1` 时，也是从最右边开始：遇 1 写 0 进位、遇 0 写 1 收工。图灵机只是把这个过程**写成了规则表**。", 5.15, 3.65, 4.35, 1.4, { fontSize: 11.5, fill: C.mint, tcolor: C.dark });
}

// 2.1 trace
{
  const s = content("2.1", "2 图灵机 · 逐步执行", "手动跑一遍：1011 + 1");
  const rows = [
    ["开始", ["1", "0", "1", "1"], 3, "q0", "读写头在最低位"],
    ["第 1 步", ["1", "0", "1", "0"], 2, "q0", "读 1 → 写 0，左移（进位）"],
    ["第 2 步", ["1", "0", "0", "0"], 1, "q0", "读 1 → 写 0，左移（进位）"],
    ["第 3 步", ["1", "1", "0", "0"], 1, "halt", "读 0 → 写 1，不动，停机"],
  ];
  rows.forEach((r, i) => {
    const y = 1.2 + i * 0.9;
    text(s, r[0], 0.5, y, 1.0, 0.46, { fontSize: 12.5, bold: true, color: C.dark, valign: "middle", margin: 0 });
    const fills = r[1].map((_, k) => (k === r[2] ? "F2B134" : null));
    cells(s, 1.6, y, r[1], { cw: 0.55, ch: 0.46, fs: 15, fills });
    s.addShape(pres.shapes.LINE, { x: 1.6 + r[2] * 0.55 + 0.275, y: y + 0.5, w: 0, h: 0.22, line: { color: C.bad, width: 1.5, beginArrowType: "triangle" } });
    pill(s, r[3], 4.05, y + 0.07, 0.8, 0.32, r[3] === "halt" ? C.ok : C.dark, C.white, 10);
    text(s, r[4], 5.0, y, 4.5, 0.46, { fontSize: 12, valign: "middle", margin: 0 });
  });
  card(s, 0.5, 4.8, 9.0, 0.32, C.cream);
  text(s, "结果 **1100**（11 + 1 = 12），共 3 步。再试 `111`：三次进位后读到空白，补 1 → `1000`，共 4 步。", 0.6, 4.8, 8.8, 0.32, { fontSize: 11, valign: "middle", margin: 0 });
}

// 2.2 why important
{
  const s = content("2.2", "2 图灵机 · 为什么重要", "它划定了「可计算」的边界");
  card(s, 0.5, 1.1, 4.35, 3.95, C.code);
  numCircle(s, 1, 0.7, 1.25, 0.42, C.dark);
  text(s, "丘奇—图灵论题", 1.25, 1.28, 3.5, 0.38, { fontSize: 15, bold: true, color: C.dark, margin: 0 });
  bullets(s, [
    "任何「直觉上可计算」的函数，都能被图灵机计算。",
    "你的 Python 程序、C++ 程序，**能算的东西不比图灵机多**——只是快得多、好写得多。",
    "所有通用编程语言在「能算什么」上**等价**；差别在效率与表达。",
  ], 0.7, 1.85, 4.0, 3.1, { fontSize: 12.5, gap: 10 });
  card(s, 5.15, 1.1, 4.35, 3.95, "FDF0EE");
  numCircle(s, 2, 5.35, 1.25, 0.42, C.bad);
  text(s, "停机问题不可判定", 5.9, 1.28, 3.5, 0.38, { fontSize: 15, bold: true, color: C.bad, margin: 0 });
  bullets(s, [
    "**不存在**一个程序，能对**任意**程序 + **任意**输入，判断它是否会停机。",
    "这是计算的**根本边界**。",
    "不是「我们还没想到办法」，而是**证明了不可能**。",
  ], 5.35, 1.85, 4.0, 3.1, { fontSize: 12.5, gap: 10 });
}

// 2.2 halting proof
{
  const s = content("2.2", "2 图灵机 · 停机问题", "为什么不可能？一个反证（思路）");
  text(s, "**假设**有人写出了万能的判定函数 `halts(p, x)`：p 在输入 x 上停机就返回 True，否则 False。", 0.5, 1.05, 9, 0.55, { fontSize: 12.5 });
  codeBlock(s, `def halts(p, x):
    ...                  # 假设它存在，且总能给出正确答案

def trouble(p):
    if halts(p, p):      # 如果 p 拿自己当输入会停机
        while True:      #   那我就偏偏死循环
            pass
    else:                # 如果 p 拿自己当输入不停机
        return           #   那我就立刻停机

trouble(trouble)         # ？？？`, 0.5, 1.65, 5.3, 3.4, { fontSize: 10.5, lang: "py", hl: [11] });
  callout(s, "问：trouble(trouble) 停不停机？", [
    "若 `halts` 说**停**：它就进入死循环 → **不停**。矛盾。",
    "若 `halts` 说**不停**：它就立刻返回 → **停**。矛盾。",
  ], 6.05, 1.65, 3.45, 1.85, { fontSize: 11, fill: "FDF0EE", tcolor: C.bad });
  callout(s, "结论", "两头都矛盾，只能是**假设错了**：这样的 `halts` 根本写不出来。这就是图灵 1936 年的对角线论证。", 6.05, 3.65, 3.45, 1.4, { fontSize: 11, fill: C.mint, tcolor: C.dark });
}

// 2.3 TM code
{
  const s = content("2.3", "2 图灵机 · Python 实现", "用 Python 实现一台通用图灵机");
  codeBlock(s, `def turing_machine(tape, rules, start="q0", halt="halt", blank="_"):
    """rules: {(state, symbol): (write, move, next_state)}"""
    cells = dict(enumerate(tape))          # 下标 -> 符号：两端可无限延伸
    head, state, steps = len(tape) - 1, start, 0
    while state != halt and steps < 100000:
        sym = cells.get(head, blank)       # 没写过的格子就是空白
        if (state, sym) not in rules:
            break                          # 没有规则可用：停
        write, move, state = rules[(state, sym)]
        cells[head] = write
        head += {"L": -1, "R": 1, "N": 0}[move]
        steps += 1
    lo, hi = min(cells), max(cells)
    return ''.join(cells.get(i, blank) for i in range(lo, hi + 1)).strip(blank)


# 二进制加一：从最低位向左扫，遇 1 变 0 继续进位，遇 0 或空白变 1 停机
INCREMENT = {
    ("q0", "1"): ("0", "L", "q0"),
    ("q0", "0"): ("1", "N", "halt"),
    ("q0", "_"): ("1", "N", "halt"),
}

for x in ["1011", "111", "0"]:
    print(x, "->", turing_machine(x, INCREMENT))`, 0.5, 1.02, 6.4, 4.1, { fontSize: 8.6, lang: "py" });
  consoleBlock(s, "1011 -> 1100\n111 -> 1000\n0 -> 1", 7.1, 1.02, 2.4, 1.2);
  callout(s, "亲手跑一遍", "一台「计算机」的本质，就是这**三十行**：一张规则表 + 一个循环。", 7.1, 2.4, 2.4, 1.3, { fontSize: 11 });
  callout(s, "换规则 = 换程序", "模拟器不用改，只换 `rules` 字典，它就算别的东西——这正是**通用**的含义。", 7.1, 3.85, 2.4, 1.27, { fontSize: 10.5, fill: C.mint, tcolor: C.dark });
}

// 2.3 key points
{
  const s = content("2.3", "2 图灵机 · 代码要点", "三处值得细看的写法");
  const pts = [
    ["cells = dict(enumerate(tape))", "用**字典**而不是列表存纸带：下标可以是负数（向左越过起点），没写过的格子 `get` 返回空白——一个字典就模拟了「两端无限长」。"],
    ["head += {\"L\": -1, \"R\": 1, \"N\": 0}[move]", "用字典把方向**查表**成位移，代替一串 `if move == \"L\"`。规则驱动的程序里，这种写法很常见。"],
    ["steps < 100000", "为什么要设步数上限？因为**停机问题不可判定**：模拟器没法事先知道规则表会不会让机器永远跑下去，只能「跑够了就放弃」。"],
  ];
  pts.forEach((p, i) => {
    const y = 1.1 + i * 1.33;
    card(s, 0.5, y, 9.0, 1.2, i === 2 ? C.cream : C.code);
    numCircle(s, i + 1, 0.7, y + 0.15, 0.4, i === 2 ? C.goldText : C.dark);
    text(s, p[0], 1.25, y + 0.12, 8.1, 0.36, { fontSize: 12.5, bold: true, color: C.green, margin: 0 });
    s.addText(runs(p[1], { color: C.text }), { x: 1.25, y: y + 0.5, w: 8.1, h: 0.65, fontFace: FONT, fontSize: 11.5, margin: 0, isTextBox: true, valign: "top" });
  });
}

// ============================ PART 3 ============================
sectionSlide("Part 3", "冯·诺依曼结构", "程序本身也是数据\n五大部件 · 存储程序 · 指令周期 · 冯·诺依曼瓶颈 · 存储层次");

// 3.1 five components
{
  const s = content("3.1", "3 冯·诺依曼结构", "五大部件");
  card(s, 0.9, 1.1, 5.0, 0.72, C.dark);
  text(s, "存储器 Memory", 0.9, 1.1, 5.0, 0.45, { fontSize: 15, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
  text(s, "程序和数据放在一起", 0.9, 1.48, 5.0, 0.3, { fontSize: 10.5, color: C.gold, align: "center", margin: 0 });
  // CPU box
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.9, y: 2.3, w: 5.0, h: 1.35, rectRadius: 0.08, fill: { color: "F7F9F8" }, line: { color: C.green, width: 1.5, dashType: "dash" } });
  text(s, "CPU", 0.95, 2.32, 1, 0.26, { fontSize: 10, bold: true, color: C.green, margin: 0 });
  card(s, 1.15, 2.6, 2.1, 0.85, C.mint);
  text(s, "运算器 ALU", 1.15, 2.6, 2.1, 0.5, { fontSize: 13.5, bold: true, color: C.dark, align: "center", valign: "middle", margin: 0 });
  text(s, "算术与逻辑运算", 1.15, 3.05, 2.1, 0.3, { fontSize: 10, color: C.muted, align: "center", margin: 0 });
  card(s, 3.55, 2.6, 2.1, 0.85, C.mint);
  text(s, "控制器 CU", 3.55, 2.6, 2.1, 0.5, { fontSize: 13.5, bold: true, color: C.dark, align: "center", valign: "middle", margin: 0 });
  text(s, "取指、译码、指挥", 3.55, 3.05, 2.1, 0.3, { fontSize: 10, color: C.muted, align: "center", margin: 0 });
  [2.2, 4.6].forEach((x) => s.addShape(pres.shapes.LINE, { x, y: 1.85, w: 0, h: 0.72, line: { color: C.green, width: 1.5, beginArrowType: "triangle", endArrowType: "triangle" } }));
  card(s, 0.9, 4.2, 2.3, 0.75, C.code, C.green);
  text(s, "输入设备", 0.9, 4.2, 2.3, 0.75, { fontSize: 13.5, bold: true, color: C.dark, align: "center", valign: "middle", margin: 0 });
  card(s, 3.6, 4.2, 2.3, 0.75, C.code, C.green);
  text(s, "输出设备", 3.6, 4.2, 2.3, 0.75, { fontSize: 13.5, bold: true, color: C.dark, align: "center", valign: "middle", margin: 0 });
  s.addShape(pres.shapes.LINE, { x: 2.05, y: 4.18, w: 0, h: -0.5, line: { color: C.green, width: 1.5, endArrowType: "triangle" } });
  s.addShape(pres.shapes.LINE, { x: 4.75, y: 3.68, w: 0, h: 0.5, line: { color: C.green, width: 1.5, endArrowType: "triangle" } });
  callout(s, "核心思想：存储程序", "程序本身也是数据，和数据一起放在存储器里（stored program）。", 6.2, 1.1, 3.3, 1.5, { fontSize: 12 });
  callout(s, "所以", [
    "同一台机器能跑**不同的程序**，不需要重新接线。",
    "装一个新软件 = 往存储器里写一段新数据。",
  ], 6.2, 2.75, 3.3, 2.2, { fontSize: 11.5, fill: C.mint, tcolor: C.dark, gap: 8 });
}

// 3.1 program is data
{
  const s = content("3.1", "3 冯·诺依曼结构 · 存储程序", "在 Python 里亲眼看到「程序也是数据」");
  codeBlock(s, `def f(x):
    return x + 1

code = f.__code__.co_code     # f 编译后的字节码
print(type(code))             # <class 'bytes'>  —— 就是一串字节

g = f                         # 函数可以像数据一样赋值、传参
print(g(41))                  # 42
print(list(map(f, [1, 2, 3])))  # [2, 3, 4]

src = "print(6 * 7)"          # 一个字符串……
exec(src)                     # ……也能被当作程序执行：42`, 0.5, 1.1, 5.7, 3.0, { fontSize: 10.5, lang: "py" });
  consoleBlock(s, "<class 'bytes'>\n42\n[2, 3, 4]\n42", 6.45, 1.1, 3.05, 1.45);
  callout(s, "对应关系", [
    "`co_code` 是**字节码**：存储器里的一串字节。",
    "解释器读这串字节来执行——**指令就是数据**。",
  ], 6.45, 2.7, 3.05, 1.4, { fontSize: 11 });
  callout(s, "安全提示", "「数据能被当作程序执行」也是很多安全漏洞的根源：**不要**用 `exec` / `eval` 执行来路不明的字符串。", 0.5, 4.3, 9.0, 0.8, { fontSize: 11.5, fill: "FDF0EE", tcolor: C.bad });
}

// 3.2 instruction cycle
{
  const s = content("3.2", "3 冯·诺依曼结构", "指令周期：取指 → 译码 → 执行 → 写回");
  const steps = [["取指", "Fetch", "按程序计数器 PC\n从存储器取一条指令"], ["译码", "Decode", "看清是什么操作、\n操作数在哪"], ["执行", "Execute", "ALU 做运算，\n或访问存储器"], ["写回", "Write Back", "把结果写回\n寄存器或存储器"]];
  steps.forEach((st, i) => {
    const x = 0.5 + i * 2.3;
    card(s, x, 1.2, 1.95, 2.0, i % 2 ? C.code : C.mint, C.green);
    numCircle(s, i + 1, x + 0.15, 1.32, 0.38, C.dark);
    text(s, st[0], x + 0.6, 1.3, 1.3, 0.4, { fontSize: 17, bold: true, color: C.dark, margin: 0 });
    text(s, st[1], x + 0.15, 1.78, 1.7, 0.3, { fontSize: 11, bold: true, color: C.green, margin: 0 });
    text(s, st[2], x + 0.15, 2.15, 1.7, 0.9, { fontSize: 10.5, margin: 0, lsm: 1.15 });
    if (i < 3) s.addShape(pres.shapes.LINE, { x: x + 1.97, y: 2.2, w: 0.31, h: 0, line: { color: C.green, width: 2, endArrowType: "triangle" } });
  });
  // loop back arrow
  s.addShape(pres.shapes.LINE, { x: 8.35, y: 3.22, w: 0, h: 0.3, line: { color: C.green, width: 2 } });
  s.addShape(pres.shapes.LINE, { x: 1.45, y: 3.52, w: 6.9, h: 0, line: { color: C.green, width: 2 } });
  s.addShape(pres.shapes.LINE, { x: 1.45, y: 3.52, w: 0, h: -0.3, line: { color: C.green, width: 2, endArrowType: "triangle" } });
  text(s, "PC 指向下一条指令，循环往复（每秒几十亿次）", 2.5, 3.56, 5, 0.3, { fontSize: 10.5, color: C.green, bold: true, align: "center", margin: 0 });
  callout(s, "和图灵机对照", "图灵机：读一格 → 查规则 → 写、移、换状态。CPU：取一条指令 → 译码 → 执行、写回、PC 前进。**都是「一步一步查表执行」的循环**，只是 CPU 的「纸带」可以随机访问。", 0.5, 4.0, 9.0, 1.1, { fontSize: 11.5 });
}

// 3.2 bottleneck
{
  const s = content("3.2", "3 冯·诺依曼结构", "冯·诺依曼瓶颈与缓存");
  card(s, 0.5, 1.15, 1.9, 1.2, C.dark);
  text(s, "CPU", 0.5, 1.15, 1.9, 1.2, { fontSize: 20, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
  card(s, 4.9, 1.15, 1.9, 1.2, C.dark);
  text(s, "内存", 4.9, 1.15, 1.9, 1.2, { fontSize: 20, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
  s.addShape(pres.shapes.RECTANGLE, { x: 2.4, y: 1.6, w: 2.5, h: 0.3, fill: { color: "F9D5D0" }, line: { color: C.bad, width: 1 } });
  text(s, "共享总线（一条路）", 2.4, 1.2, 2.5, 0.35, { fontSize: 11, bold: true, color: C.bad, align: "center", margin: 0 });
  text(s, "指令 · 数据 · 指令 · 数据", 2.4, 1.95, 2.5, 0.3, { fontSize: 9.5, color: C.muted, align: "center", margin: 0 });
  bullets(s, [
    "取指令和取数据走**同一条总线**，要排队。",
    "CPU 越来越快，内存跟不上：CPU 大部分时间在**等数据**。",
  ], 0.5, 2.6, 6.3, 1.1, { fontSize: 12.5, gap: 8 });
  callout(s, "现代 CPU 的对策：多级缓存", [
    "在 CPU 旁放小而快的 **L1 / L2 / L3 缓存**。",
    "从内存取数时，**连同附近的一整块**（缓存行，常见 64 字节）一起搬进缓存。",
    "下一次访问若恰好在这一块里，就不用再等内存。",
  ], 0.5, 3.6, 6.3, 1.5, { fontSize: 11.5 });
  callout(s, "这就是……", "「访问**连续**内存比**跳着**访问快」的根源。\n\n第 6 周讲矩阵时会看到：按行遍历二维数组，比按列遍历快。", 7.05, 1.15, 2.45, 3.95, { fontSize: 11.5, fill: C.mint, tcolor: C.dark });
}

// 3.3 memory hierarchy
{
  const s = content("3.3", "3 冯·诺依曼结构", "存储层次：容量越大，速度越慢，单价越低");
  table(s, [
    ["层级", "典型容量", "访问时间", "相对代价"],
    ["寄存器", "几百字节", "< 1 ns", "1"],
    ["L1 缓存", "32–64 KB", "~1 ns", "~3"],
    ["L2 / L3 缓存", "几 MB–几十 MB", "~10 ns", "~15"],
    ["内存 DRAM", "8–64 GB", "~100 ns", "~200"],
    ["SSD", "几百 GB–几 TB", "~100 μs", "~10⁵"],
    ["机械硬盘", "几 TB", "~10 ms", "~10⁷"],
  ], 0.5, 1.1, 5.9, [1.5, 1.7, 1.35, 1.35], { fontSize: 12, rowH: 0.46 });
  // pyramid
  const lv = ["寄存器", "缓存", "内存", "SSD", "硬盘"];
  lv.forEach((l, i) => {
    const w = 0.9 + i * 0.55, x = 8.05 - w / 2, y = 1.1 + i * 0.6;
    s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.52, fill: { color: ["1E3D34", "2F5C4C", "3E7C68", "7FA898", "CFE0D8"][i] }, line: { type: "none" } });
    text(s, l, x, y, w, 0.52, { fontSize: 11, bold: true, color: i < 3 ? C.white : C.dark, align: "center", valign: "middle", margin: 0 });
  });
  text(s, "↑ 快、小、贵", 6.65, 4.15, 2.85, 0.3, { fontSize: 10.5, color: C.green, bold: true, align: "center", margin: 0 });
  text(s, "↓ 慢、大、便宜", 6.65, 4.45, 2.85, 0.3, { fontSize: 10.5, color: C.muted, bold: true, align: "center", margin: 0 });
  text(s, "一次内存访问 ≈ 200 次寄存器访问；一次 SSD 访问 ≈ 1000 次内存访问。", 0.5, 4.45, 5.9, 0.55, { fontSize: 11, color: C.muted, margin: 0 });
}

// 3.3 human scale
{
  const s = content("3.3", "3 冯·诺依曼结构 · 存储层次", "换成人的时间尺度：假如访问寄存器要 1 秒");
  const rows = [
    ["寄存器", "1 秒", "伸手拿桌上的笔", 0.03],
    ["L1 缓存", "3 秒", "从抽屉里拿", 0.05],
    ["L2 / L3", "15 秒", "去书架上取", 0.1],
    ["内存", "约 3 分钟", "下楼去取快递", 0.2],
    ["SSD", "约 1 天", "寄一封快递到外地", 0.55],
    ["机械硬盘", "约 4 个月", "寄一封平信去南极", 1.0],
  ];
  rows.forEach((r, i) => {
    const y = 1.12 + i * 0.6;
    text(s, r[0], 0.5, y, 1.3, 0.48, { fontSize: 12.5, bold: true, color: C.dark, valign: "middle", margin: 0 });
    s.addShape(pres.shapes.RECTANGLE, { x: 1.85, y: y + 0.08, w: Math.max(0.08, r[3] * 3.6), h: 0.32, fill: { color: i >= 4 ? C.bad : C.green }, line: { type: "none" } });
    text(s, r[1], 1.85 + Math.max(0.08, r[3] * 3.6) + 0.1, y, 1.4, 0.48, { fontSize: 12, bold: true, color: i >= 4 ? C.bad : C.green, valign: "middle", margin: 0 });
    text(s, r[2], 7.0, y, 2.5, 0.48, { fontSize: 11, color: C.muted, valign: "middle", margin: 0 });
  });
  text(s, "按上页「相对代价」换算：10⁵ 秒 ≈ 28 小时，10⁷ 秒 ≈ 116 天。条形长度只示意顺序，不按比例。", 0.5, 4.75, 9, 0.3, { fontSize: 10, color: C.muted, margin: 0 });
}

// ============================ PART 4 ============================
sectionSlide("Part 4", "数据的二进制表示", "机器里只有 0 和 1，一切都要编码\n进制 · 原码 / 反码 / 补码 · 位运算 · IEEE 754 浮点");

// 4.1 bases table
{
  const s = content("4.1", "4 二进制表示 · 进制", "四种常用进制");
  table(s, [
    ["进制", "Python 前缀", "数字", "典型用途", "233 写成"],
    ["二进制", { t: "0b", mono: true }, "0–1", "机器本身", { t: "0b11101001", mono: true }],
    ["八进制", { t: "0o", mono: true }, "0–7", "Unix 文件权限（如 755）", { t: "0o351", mono: true }],
    ["十进制", "无", "0–9", "人", { t: "233", mono: true }],
    ["十六进制", { t: "0x", mono: true }, "0–9、A–F", "内存地址、颜色 #FF8800、字节转储", { t: "0xe9", mono: true }],
  ], 0.5, 1.15, 9.0, [1.2, 1.3, 1.2, 3.6, 1.7], { fontSize: 12.5, rowH: 0.5 });
  callout(s, "为什么程序员爱用十六进制", "1 位十六进制正好对应 **4 位二进制**，1 个字节 = 2 位十六进制。`1110 1001` 一眼读成 `e9`，比读 8 个 0/1 省事得多。", 0.5, 3.85, 9.0, 1.2, { fontSize: 12 });
}

// 4.1 conversion code
{
  const s = content("4.1", "4 二进制表示 · 进制", "Python 里的进制转换");
  codeBlock(s, `n = 233
print(bin(n), oct(n), hex(n))        # 0b11101001 0o351 0xe9
print(int("11101001", 2))            # 233
print(int("e9", 16))                 # 233
print(f"{n:b} {n:o} {n:x} {n:08b}")  # 11101001 351 e9 11101001`, 0.5, 1.1, 9.0, 1.6, { fontSize: 11.5, lang: "py" });
  table(s, [
    ["方向", "写法", "说明"],
    ["十进制 → 其他", { t: "bin(n) / oct(n) / hex(n)", mono: true }, "返回**带前缀**的字符串，如 '0b1101'"],
    ["十进制 → 其他（无前缀）", { t: "f\"{n:b}\"  f\"{n:08b}\"", mono: true }, "格式说明符 b / o / x；08b = 补足 8 位"],
    ["其他 → 十进制", { t: "int(s, base)", mono: true }, "第二个参数是进制；s 可以不带前缀"],
  ], 0.5, 2.9, 9.0, [2.4, 3.0, 3.6], { fontSize: 11.5, rowH: 0.45 });
  text(s, "常见坑：`bin(n)[2:]` 才能去掉 `0b`；负数 `bin(-5)` 得到 `'-0b101'`，**不是**补码。", 0.5, 4.78, 9, 0.32, { fontSize: 11.5, color: C.bad });
}

// 4.1 manual conversion
{
  const s = content("4.1", "4 二进制表示 · 手工转换", "除基取余，余数逆序读");
  const rows = [["233", "116", "1"], ["116", "58", "0"], ["58", "29", "0"], ["29", "14", "1"], ["14", "7", "0"], ["7", "3", "1"], ["3", "1", "1"], ["1", "0", "1"]];
  table(s, [["被除数", "÷ 2 商", "余数"], ...rows.map((r) => [{ t: r[0], mono: true, align: "center" }, { t: r[1], mono: true, align: "center" }, { t: r[2], mono: true, bold: true, color: C.bad, align: "center" }])], 0.5, 1.1, 3.6, [1.2, 1.2, 1.2], { fontSize: 12, rowH: 0.42 });
  s.addShape(pres.shapes.LINE, { x: 4.35, y: 4.75, w: 0, h: -3.3, line: { color: C.bad, width: 2, endArrowType: "triangle" } });
  text(s, "从下往上读", 4.45, 2.9, 1.0, 0.6, { fontSize: 11, bold: true, color: C.bad, margin: 0 });
  card(s, 5.6, 1.1, 3.9, 1.3, C.dark);
  text(s, "233 = 1110 1001₂", 5.6, 1.1, 3.9, 1.3, { fontSize: 22, bold: true, color: C.gold, align: "center", valign: "middle", margin: 0 });
  callout(s, "反过来：按权展开", "1110 1001₂ = 128 + 64 + 32 + 8 + 1 = 233", 5.6, 2.6, 3.9, 1.3, { fontSize: 12 });
  callout(s, "为什么是逆序？", "第一次除得的余数是**最低位**（2⁰ 位），最后一次是最高位。", 5.6, 4.05, 3.9, 1.05, { fontSize: 11, fill: C.mint, tcolor: C.dark });
}

// 4.1 grouping
{
  const s = content("4.1", "4 二进制表示 · 手工转换", "二进制 ↔ 八进制 / 十六进制：分组就行");
  text(s, "从**最低位**开始分组：八进制 3 位一组，十六进制 4 位一组。", 0.5, 1.05, 9, 0.35, { fontSize: 13 });
  card(s, 0.5, 1.55, 4.35, 2.4, C.code);
  text(s, "十六进制：4 位一组", 0.7, 1.65, 4, 0.35, { fontSize: 14, bold: true, color: C.dark, margin: 0 });
  cells(s, 0.95, 2.2, ["1", "1", "1", "0"], { cw: 0.42, ch: 0.42, fs: 13, fills: Array(4).fill("CFE0D8") });
  cells(s, 2.85, 2.2, ["1", "0", "0", "1"], { cw: 0.42, ch: 0.42, fs: 13, fills: Array(4).fill("FFF6E0") });
  text(s, "1110 = e", 0.95, 2.72, 1.68, 0.3, { fontSize: 12, bold: true, color: C.green, align: "center", margin: 0 });
  text(s, "1001 = 9", 2.85, 2.72, 1.68, 0.3, { fontSize: 12, bold: true, color: C.goldText, align: "center", margin: 0 });
  text(s, "→  0xe9", 0.7, 3.2, 4, 0.5, { fontSize: 20, bold: true, color: C.dark, fontFace: MONO, align: "center", margin: 0 });
  card(s, 5.15, 1.55, 4.35, 2.4, C.code);
  text(s, "八进制：3 位一组", 5.35, 1.65, 4, 0.35, { fontSize: 14, bold: true, color: C.dark, margin: 0 });
  cells(s, 5.45, 2.2, ["1", "1"], { cw: 0.42, ch: 0.42, fs: 13, fills: Array(2).fill("CFE0D8") });
  cells(s, 6.45, 2.2, ["1", "0", "1"], { cw: 0.42, ch: 0.42, fs: 13, fills: Array(3).fill("FFF6E0") });
  cells(s, 7.85, 2.2, ["0", "0", "1"], { cw: 0.42, ch: 0.42, fs: 13, fills: Array(3).fill("CFE0D8") });
  text(s, "3", 5.45, 2.72, 0.84, 0.3, { fontSize: 12, bold: true, color: C.green, align: "center", margin: 0 });
  text(s, "5", 6.45, 2.72, 1.26, 0.3, { fontSize: 12, bold: true, color: C.goldText, align: "center", margin: 0 });
  text(s, "1", 7.85, 2.72, 1.26, 0.3, { fontSize: 12, bold: true, color: C.green, align: "center", margin: 0 });
  text(s, "→  0o351", 5.35, 3.2, 4, 0.5, { fontSize: 20, bold: true, color: C.dark, fontFace: MONO, align: "center", margin: 0 });
  callout(s, "为什么可以直接分组", "因为 8 = 2³、16 = 2⁴：每 3 位（或 4 位）二进制恰好组成一位八进制（或十六进制），组与组之间**互不进位**。十进制 10 不是 2 的幂，所以只能除基取余。", 0.5, 4.1, 9.0, 1.0, { fontSize: 11.5 });
}

// 4.1 E02734
{
  const s = content("4.1", "4 二进制表示 · 例题", "E02734 十进制到八进制");
  text(s, "http://cs101.openjudge.cn/practice/02734/", 0.5, 1.02, 9, 0.3, { fontSize: 10.5, color: C.muted, margin: 0 });
  text(s, "输入一个非负整数，输出它的八进制表示。", 0.5, 1.35, 9, 0.35, { fontSize: 13 });
  codeBlock(s, `n = int(input())
print(oct(n)[2:] if n else 0)`, 0.5, 1.85, 5.3, 0.8, { fontSize: 12, lang: "py" });
  text(s, "不用内置函数：手写除基取余", 0.5, 2.8, 5.3, 0.3, { fontSize: 12, bold: true, color: C.dark, margin: 0 });
  codeBlock(s, `n = int(input())
digits = []
while n > 0:
    digits.append(str(n % 8))   # 余数
    n //= 8                      # 商
print(''.join(reversed(digits)) or '0')`, 0.5, 3.15, 5.3, 1.95, { fontSize: 11, lang: "py" });
  callout(s, "要点", [
    "`oct(n)` 返回 `'0o…'`，用 `[2:]` 切掉前缀。",
    "**边界**：`n = 0` 时循环一次都不执行，要单独输出 `0`。",
    "`reversed`：余数是从低位到高位得到的。",
  ], 6.05, 1.85, 3.45, 3.25, { fontSize: 11.5, gap: 8 });
}

// 4.2 sign encodings
{
  const s = content("4.2", "4 二进制表示 · 有符号整数", "原码、反码、补码：以 8 位表示 −5");
  table(s, [
    ["表示法", "+5", "−5", "怎么得到", "问题"],
    ["原码", { t: "0000 0101", mono: true }, { t: "1000 0101", mono: true }, "最高位当符号位", "有 +0、−0 两个零；加减法要先判符号"],
    ["反码", { t: "0000 0101", mono: true }, { t: "1111 1010", mono: true }, "负数：原码除符号位外取反", "仍有两个零"],
    [{ t: "补码", bold: true, color: C.ok }, { t: "0000 0101", mono: true }, { t: "1111 1011", mono: true, bold: true, color: C.ok }, "负数：取反后**加一**", { t: "**零唯一；减法 = 加负数**", color: C.ok }],
  ], 0.5, 1.15, 9.0, [1.0, 1.35, 1.35, 2.4, 2.9], { fontSize: 11.5, rowH: 0.52 });
  callout(s, "补码的求法", [
    "正数：不变。",
    "负数：**按位取反，再加一**。",
    "例：5 = `0000 0101` → 取反 `1111 1010` → 加一 `1111 1011`。",
  ], 0.5, 3.45, 5.3, 1.65, { fontSize: 11.5 });
  callout(s, "现代计算机统一用补码", "硬件**只需一套加法器**：减法、负数都变成加法。", 6.05, 3.45, 3.45, 1.65, { fontSize: 12, fill: C.mint, tcolor: C.dark });
}

// 4.2 code & range
{
  const s = content("4.2", "4 二进制表示 · 补码", "用 Python 看补码；n 位补码的范围");
  codeBlock(s, `def to_twos_complement(x, bits=8):
    return format(x & ((1 << bits) - 1), f'0{bits}b')

print(to_twos_complement(5))    # 00000101
print(to_twos_complement(-5))   # 11111011
print(to_twos_complement(-1))   # 11111111
print(-5 & 0xFF)                # 251 —— 同一串位，当无符号数读`, 0.5, 1.1, 5.6, 2.2, { fontSize: 10.5, lang: "py" });
  callout(s, "x & ((1 << bits) - 1)", "`(1 << 8) - 1` = `0xFF` = 8 个 1。和它按位与，就是**只保留低 8 位**——正好是 8 位机器里存的那串位。", 6.35, 1.1, 3.15, 2.2, { fontSize: 11 });
  card(s, 0.5, 3.5, 9.0, 1.6, C.code);
  text(s, "n 位补码的表示范围", 0.7, 3.58, 4, 0.32, { fontSize: 13, bold: true, color: C.dark, margin: 0 });
  text(s, "−2ⁿ⁻¹  ~  2ⁿ⁻¹ − 1", 0.7, 3.95, 4, 0.5, { fontSize: 22, bold: true, color: C.green, margin: 0 });
  text(s, "负数比正数**多一个**：`1000 0000` 是 −128，没有对应的 +128。", 0.7, 4.5, 4.2, 0.55, { fontSize: 11, margin: 0 });
  table(s, [
    ["位数", "范围"],
    ["8 位", "−128 ~ 127"],
    ["32 位（C++ int）", "−2147483648 ~ 2147483647"],
    ["64 位（long long）", "约 ±9.2 × 10¹⁸"],
  ], 5.1, 3.62, 4.25, [1.7, 2.55], { fontSize: 10.5, rowH: 0.33, tight: true });
}

// 4.2 subtraction as addition
{
  const s = content("4.2", "4 二进制表示 · 补码", "为什么补码让减法变成加法：算 5 − 7");
  text(s, "5 − 7 = 5 + (−7)。先求 −7 的补码：7 = `0000 0111` → 取反 `1111 1000` → 加一 `1111 1001`。", 0.5, 1.05, 9, 0.4, { fontSize: 12.5 });
  const lines = [["", "0000 0101", "5"], ["+", "1111 1001", "−7 的补码"], ["=", "1111 1110", "?"]];
  card(s, 0.5, 1.6, 5.0, 2.3, C.code);
  lines.forEach((l, i) => {
    const y = 1.8 + i * 0.62;
    text(s, l[0], 0.8, y, 0.4, 0.5, { fontSize: 20, bold: true, color: C.dark, fontFace: MONO, valign: "middle", margin: 0 });
    text(s, l[1], 1.25, y, 2.6, 0.5, { fontSize: 22, bold: true, color: i === 2 ? C.bad : C.dark, fontFace: MONO, valign: "middle", margin: 0 });
    text(s, l[2], 3.95, y, 1.5, 0.5, { fontSize: 12, color: C.muted, valign: "middle", margin: 0 });
  });
  s.addShape(pres.shapes.LINE, { x: 0.8, y: 3.02, w: 3.1, h: 0, line: { color: C.dark, width: 1.5 } });
  callout(s, "1111 1110 是几？", [
    "最高位是 1 → 负数。",
    "再求一次补码看绝对值：取反 `0000 0001`，加一 `0000 0010` = 2。",
    "所以结果是 **−2** ✓",
  ], 5.75, 1.6, 3.75, 2.3, { fontSize: 11.5 });
  callout(s, "要点", "加法器**根本不知道**哪个是负数，它只管按位相加；如果最高位还有进位，直接丢掉（只保留 8 位）。同一套电路，加减法全包了。验证 7 − 5 留作思考题。", 0.5, 4.05, 9.0, 1.05, { fontSize: 11.5, fill: C.mint, tcolor: C.dark });
}

// 4.2 overflow
{
  const s = content("4.2", "4 二进制表示 · 补码", "溢出：C++ 里最常见的 WA 来源");
  card(s, 0.5, 1.1, 3.4, 2.1, C.code);
  text(s, "8 位：127 + 1", 0.7, 1.2, 3, 0.35, { fontSize: 14, bold: true, color: C.dark, margin: 0 });
  text(s, "0111 1111  (127)\n+         1\n= 1000 0000  (−128)", 0.7, 1.6, 3.1, 1.1, { fontSize: 14, fontFace: MONO, bold: true, color: C.dark, margin: 0, lsm: 1.1 });
  text(s, "正数加正数，却得到了负数", 0.7, 2.8, 3.1, 0.3, { fontSize: 11, bold: true, color: C.bad, margin: 0 });
  codeBlock(s, `import ctypes            # 借 C 的 32 位 int 来演示
print(ctypes.c_int32(2147483647 + 1).value)
# -2147483648

print(2147483647 + 1)    # 2147483648  Python 不溢出
print(2 ** 100)          # 任意精度：
# 1267650600228229401496703205376`, 4.1, 1.1, 5.4, 2.1, { fontSize: 10, lang: "py" });
  callout(s, "Python 与 C/C++ 的区别", [
    "Python 的 `int` 是**任意精度**的，不会溢出——本课用 Python，这个坑天然避开了。",
    "C/C++ 的 `int` 是 **32 位**：`2147483647 + 1` 变成 `-2147483648`。用 C++ 做题时，这是最常见的 WA 来源。",
    "对策：估计中间结果的量级；超过约 2×10⁹ 就用 `long long`。",
  ], 0.5, 3.4, 9.0, 1.7, { fontSize: 11.5, fill: "FDF0EE", tcolor: C.bad });
}

// 4.3 bit ops table
{
  const s = content("4.3", "4 二进制表示 · 位运算", "六个位运算符");
  table(s, [
    ["运算", "符号", "例子", "结果", "按位看"],
    ["与", { t: "&", mono: true }, { t: "6 & 3", mono: true }, { t: "2", mono: true }, { t: "110 & 011 = 010", mono: true }],
    ["或", { t: "|", mono: true }, { t: "6 | 3", mono: true }, { t: "7", mono: true }, { t: "110 | 011 = 111", mono: true }],
    ["异或", { t: "^", mono: true }, { t: "6 ^ 3", mono: true }, { t: "5", mono: true }, { t: "110 ^ 011 = 101", mono: true }],
    ["取反", { t: "~", mono: true }, { t: "~6", mono: true }, { t: "-7", mono: true }, "补码下 ~x = −x − 1"],
    ["左移", { t: "<<", mono: true }, { t: "1 << 10", mono: true }, { t: "1024", mono: true }, "左移 k 位 = 乘 2ᵏ"],
    ["右移", { t: ">>", mono: true }, { t: "1024 >> 3", mono: true }, { t: "128", mono: true }, "右移 k 位 = 整除 2ᵏ"],
  ], 0.5, 1.1, 9.0, [1.0, 1.0, 1.8, 1.2, 4.0], { fontSize: 12, rowH: 0.42 });
  callout(s, "~6 为什么是 −7？", "`~` 把所有位取反。而补码里「取反再加一」等于取相反数，所以「只取反」= 相反数减一：`~x == -x - 1`。", 0.5, 4.2, 9.0, 0.85, { fontSize: 11, fill: C.mint, tcolor: C.dark });
}

// 4.3 tricks code
{
  const s = content("4.3", "4 二进制表示 · 位运算", "三个常用技巧");
  codeBlock(s, `n = 12
print(n & 1)              # 判奇偶：0 偶 1 奇
print(n & (n - 1))        # 把最低位的 1 清零 -> 8
print(bin(n).count('1'))  # 统计 1 的个数（popcount）-> 2

# n & (n-1) == 0 判断是否 2 的幂（n > 0）
print(all((x & (x - 1)) == 0 for x in [1, 2, 4, 8, 16]))   # True

# 异或的两个性质：a^a=0, a^0=a  → 找出只出现一次的数
nums = [4, 1, 2, 1, 2]
r = 0
for v in nums:
    r ^= v
print(r)                  # 4`, 0.5, 1.1, 5.9, 4.0, { fontSize: 10.5, lang: "py" });
  callout(s, "判奇偶", "最低位是 1 就是奇数。`n & 1` 与 `n % 2` 等价。", 6.65, 1.1, 2.85, 1.15, { fontSize: 11 });
  callout(s, "2 的幂", "2 的幂在二进制里**只有一个 1**，清掉它就剩 0。", 6.65, 2.4, 2.85, 1.15, { fontSize: 11 });
  callout(s, "LeetCode 136", "《只出现一次的数字》的标准解：成对的数异或后互相抵消。", 6.65, 3.7, 2.85, 1.4, { fontSize: 11, fill: C.mint, tcolor: C.dark });
}

// 4.3 visual n&(n-1) and xor trace
{
  const s = content("4.3", "4 二进制表示 · 位运算", "按位看：n & (n−1) 与异或累积");
  card(s, 0.5, 1.1, 4.35, 3.95, C.code);
  text(s, "n & (n − 1)：清掉最低位的 1", 0.7, 1.2, 4, 0.35, { fontSize: 13.5, bold: true, color: C.dark, margin: 0 });
  const bitRows = [["n = 12", ["1", "1", "0", "0"]], ["n−1 = 11", ["1", "0", "1", "1"]], ["& = 8", ["1", "0", "0", "0"]]];
  bitRows.forEach((b, i) => {
    const y = 1.75 + i * 0.6;
    text(s, b[0], 0.7, y, 1.2, 0.44, { fontSize: 12, bold: true, color: i === 2 ? C.ok : C.dark, valign: "middle", margin: 0 });
    cells(s, 2.0, y, b[1], { cw: 0.5, ch: 0.44, fs: 14, fills: b[1].map((_, k) => (k === 1 && i < 2 ? "F9D5D0" : null)) });
  });
  text(s, "n − 1 把最低位的 1 变 0、它右边的 0 全变 1；再与 n 相与，这些位全部清零，高位不变。", 0.7, 3.65, 4.0, 1.3, { fontSize: 11, margin: 0, lsm: 1.15 });
  card(s, 5.15, 1.1, 4.35, 3.95, C.code);
  text(s, "异或累积：nums = [4, 1, 2, 1, 2]", 5.35, 1.2, 4, 0.35, { fontSize: 13.5, bold: true, color: C.dark, margin: 0 });
  table(s, [
    ["v", "r ^= v 之后", "二进制"],
    [{ t: "4", mono: true }, { t: "4", mono: true }, { t: "100", mono: true }],
    [{ t: "1", mono: true }, { t: "5", mono: true }, { t: "101", mono: true }],
    [{ t: "2", mono: true }, { t: "7", mono: true }, { t: "111", mono: true }],
    [{ t: "1", mono: true }, { t: "6", mono: true }, { t: "110", mono: true }],
    [{ t: "2", mono: true }, { t: "4", mono: true, bold: true, color: C.ok }, { t: "100", mono: true, bold: true, color: C.ok }],
  ], 5.35, 1.7, 3.95, [0.8, 1.6, 1.55], { fontSize: 11.5, rowH: 0.36, align: "center" });
  text(s, "两个 1、两个 2 各自抵消，剩下 4。与顺序无关：异或满足交换律和结合律。", 5.35, 4.0, 4.0, 0.95, { fontSize: 11, margin: 0, lsm: 1.15 });
}

// 4.4 IEEE 754 layout
{
  const s = content("4.4", "4 二进制表示 · 浮点数", "IEEE 754 双精度（64 位）");
  const segs = [["S", "1", 0.5, C.bad], ["指数", "11 位", 2.2, C.goldText], ["尾数", "52 位", 6.3, C.green]];
  let x = 0.5;
  segs.forEach((sg) => {
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.3, w: sg[2], h: 0.75, fill: { color: sg[3] }, line: { color: C.white, width: 1.5 } });
    text(s, sg[0], x, 1.3, sg[2], 0.45, { fontSize: 15, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
    text(s, sg[1], x, 1.7, sg[2], 0.3, { fontSize: 10, color: C.white, align: "center", margin: 0 });
    x += sg[2];
  });
  text(s, "符号", 0.5, 2.1, 0.5, 0.3, { fontSize: 10, color: C.bad, align: "center", margin: 0 });
  card(s, 0.5, 2.55, 9.0, 0.75, C.dark);
  text(s, "值 = (−1)^S × 1.尾数 × 2^(指数 − 1023)", 0.5, 2.55, 9.0, 0.75, { fontSize: 20, bold: true, color: C.gold, align: "center", valign: "middle", margin: 0 });
  callout(s, "就是二进制的科学计数法", [
    "十进制：6.02 × 10²³；二进制：1.xxx × 2ᵉ。",
    "**尾数**决定精度（约 15–17 位十进制有效数字）。",
    "**指数**决定范围（约 10^±308）。",
  ], 0.5, 3.5, 5.3, 1.6, { fontSize: 11.5 });
  callout(s, "关键结论", "尾数是**二进制小数**，只能精确表示 k/2ⁿ 这种数。十进制的 0.1 **无法精确表示**。", 6.05, 3.5, 3.45, 1.6, { fontSize: 11.5, fill: "FDF0EE", tcolor: C.bad });
}

// 4.4 why 0.1 inexact
{
  const s = content("4.4", "4 二进制表示 · 浮点数", "为什么 0.1 无法精确表示？");
  card(s, 0.5, 1.1, 4.35, 1.9, C.code);
  text(s, "十进制里的 1/3", 0.7, 1.2, 4, 0.35, { fontSize: 13.5, bold: true, color: C.dark, margin: 0 });
  text(s, "0.3333333333…", 0.7, 1.6, 4, 0.45, { fontSize: 20, bold: true, fontFace: MONO, color: C.dark, margin: 0 });
  text(s, "3 不是 10 的因子 → 无限循环，截断就有误差。", 0.7, 2.2, 4, 0.7, { fontSize: 11.5, margin: 0 });
  card(s, 5.15, 1.1, 4.35, 1.9, "FDF0EE");
  text(s, "二进制里的 1/10", 5.35, 1.2, 4, 0.35, { fontSize: 13.5, bold: true, color: C.bad, margin: 0 });
  text(s, "0.0001100110011…₂", 5.35, 1.6, 4, 0.45, { fontSize: 18, bold: true, fontFace: MONO, color: C.bad, margin: 0 });
  text(s, "10 = 2 × 5，5 不是 2 的因子 → **0011 无限循环**，只能截断到 52 位。", 5.35, 2.2, 4, 0.7, { fontSize: 11.5, margin: 0 });
  codeBlock(s, `print(f"{0.1:.20f}")         # 0.10000000000000000555
print((0.1).hex())           # 0x1.999999999999ap-4  —— 尾数 999…9a：循环被截断、进位

from decimal import Decimal
print(Decimal(0.1))          # 存进去的真实值：
# 0.1000000000000000055511151231257827021181583404541015625`, 0.5, 3.2, 9.0, 1.9, { fontSize: 10.5, lang: "py" });
}

// 4.4 pitfalls & right way
{
  const s = content("4.4", "4 二进制表示 · 浮点数", "浮点数陷阱与正确的比较方式");
  codeBlock(s, `print(0.1 + 0.2)            # 0.30000000000000004
print(0.1 + 0.2 == 0.3)     # False
print(f"{0.1:.20f}")        # 0.10000000000000000555`, 0.5, 1.1, 9.0, 1.05, { fontSize: 11.5, lang: "py" });
  text(s, "正确做法", 0.5, 2.3, 4, 0.3, { fontSize: 13, bold: true, color: C.ok, margin: 0 });
  codeBlock(s, `import math
print(math.isclose(0.1 + 0.2, 0.3))          # True
print(abs((0.1 + 0.2) - 0.3) < 1e-9)         # True

from decimal import Decimal
print(Decimal('0.1') + Decimal('0.2'))       # 0.3  —— 十进制精确运算`, 0.5, 2.65, 6.2, 1.8, { fontSize: 10.5, lang: "py" });
  callout(s, "三种办法", [
    "`math.isclose`：相对误差比较。",
    "`abs(a - b) < eps`：绝对误差，eps 常取 1e-9。",
    "`Decimal('0.1')`：**用字符串**构造才精确。",
  ], 6.95, 2.3, 2.55, 2.8, { fontSize: 10.5, gap: 6 });
  text(s, "注意 `Decimal(0.1)`（传浮点）会把误差一起带进来——上一页看到的那一长串。", 0.5, 4.6, 6.2, 0.45, { fontSize: 11, color: C.bad, margin: 0 });
}

// 4.4 big ints in float
{
  const s = content("4.4", "4 二进制表示 · 浮点数", "另一个陷阱：大整数放进浮点会丢精度");
  codeBlock(s, `print(2 ** 53)                           # 9007199254740992
print(float(2**53 + 1) == float(2**53))  # True   —— 两个不同的整数"相等"了

n = 10 ** 18 + 1
print(int(n / 1))                        # 1000000000000000000  —— / 返回 float，末位丢了
print(n // 1)                            # 1000000000000000001  —— // 保持整数

a, b = 10 ** 17 + 1, 2                   # a 是奇数，不能被 2 整除
print(a / b == a // b)                   # True   —— 错！a/b 已被舍入
print(a % b == 0)                        # False  —— 判断整除：用 %`, 0.5, 1.05, 9.0, 2.45, { fontSize: 10.5, lang: "py" });
  callout(s, "为什么是 2⁵³", "尾数 52 位 + 隐含的 1 位 = **53 位**有效二进制数字。超过 2⁵³ 的整数，相邻的 float 之间开始有「空隙」。", 0.5, 3.65, 4.35, 1.45, { fontSize: 11 });
  callout(s, "做题时", [
    "判断能否整除用 `a % b == 0`，不要用 `a / b == a // b`。",
    "整数运算全程用 `//`、`%`，**不要**经过 `/`。",
    "开方取整用 `math.isqrt(n)`，不要 `int(n ** 0.5)`。",
  ], 5.15, 3.65, 4.35, 1.45, { fontSize: 10.5, fill: "FDF0EE", tcolor: C.bad, gap: 3 });
}

// 4.4 hard rule
{
  const s = content("!", "4 二进制表示 · 浮点数", "本课的硬规则");
  card(s, 0.5, 1.15, 9.0, 1.6, C.dark);
  text(s, "浮点数永远不要用 == 比较；\n能用整数就用整数。", 0.8, 1.15, 8.4, 1.6, { fontSize: 26, bold: true, color: C.gold, align: "center", valign: "middle", margin: 0, lsm: 1.2 });
  codeBlock(s, `INF = float('inf')
print(INF > 10**100)        # True
print(-INF < 0)             # True

dist = [INF] * n            # 最短路 / DP 的标准初始化`, 0.5, 3.0, 5.3, 2.1, { fontSize: 11, lang: "py" });
  callout(s, "无穷大：float('inf')", [
    "比任何有限数都大，`-INF` 比任何数都小。",
    "第 10 周起做 DP、第 12 周做最短路时，它是**初始化的标准写法**。",
    "它是浮点数里少数可以放心比较大小的值。",
  ], 6.05, 3.0, 3.45, 2.1, { fontSize: 11, gap: 6 });
}

// ============================ PART 5 ============================
sectionSlide("Part 5", "字符编码", "字符在机器里只是一个编号\nASCII · Unicode 与 UTF-8 · 乱码的本质");

// 5.1 ASCII
{
  const s = content("5.1", "5 字符编码 · ASCII", "ASCII：7 位，128 个字符");
  table(s, [
    ["字符", "十进制", "二进制", "说明"],
    [{ t: "'0'", mono: true }, "48", { t: "0011 0000", mono: true }, "数字起点，'0'…'9' 连续"],
    [{ t: "'A'", mono: true }, "65", { t: "0100 0001", mono: true }, "大写起点，'A'…'Z' 连续"],
    [{ t: "'a'", mono: true }, "97", { t: "0110 0001", mono: true }, "小写起点，'a'…'z' 连续"],
    ["空格", "32", { t: "0010 0000", mono: true }, "正好是 1 << 5"],
  ], 0.5, 1.1, 5.9, [0.9, 1.0, 1.6, 2.4], { fontSize: 11.5, rowH: 0.48 });
  card(s, 6.65, 1.1, 2.85, 2.4, C.code);
  text(s, "大小写只差 1 位", 6.8, 1.18, 2.6, 0.32, { fontSize: 12.5, bold: true, color: C.dark, margin: 0 });
  text(s, "A", 6.8, 1.62, 0.35, 0.36, { fontSize: 12, bold: true, color: C.dark, fontFace: MONO, valign: "middle", margin: 0 });
  cells(s, 7.15, 1.62, ["0", "1", "0", "0", "0", "0", "0", "1"], { cw: 0.28, ch: 0.36, fs: 10, fills: [null, null, "F9D5D0"] });
  text(s, "a", 6.8, 2.12, 0.35, 0.36, { fontSize: 12, bold: true, color: C.dark, fontFace: MONO, valign: "middle", margin: 0 });
  cells(s, 7.15, 2.12, ["0", "1", "1", "0", "0", "0", "0", "1"], { cw: 0.28, ch: 0.36, fs: 10, fills: [null, null, "CDEBD9"] });
  text(s, "第 5 位（值 32）：0 大写，1 小写", 6.8, 2.62, 2.6, 0.75, { fontSize: 10.5, color: C.muted, margin: 0 });
  callout(s, "记住这三个就够了", "`'0' = 48`，`'A' = 65`，`'a' = 97`。其余靠「连续」推出来：`'Z'` = 65 + 25 = 90。", 0.5, 3.7, 9.0, 1.4, { fontSize: 12.5 });
}

// 5.1 ord / chr
{
  const s = content("5.1", "5 字符编码 · ASCII", "ord / chr：字符与编号互转");
  codeBlock(s, `print(ord('A'), chr(97))        # 65 a
print(chr(ord('a') - 32))       # A
print(chr(ord('A') | 32))       # a   —— 位或置位，转小写
print(chr(ord('a') & ~32))      # A   —— 与非清位，转大写
print(chr(ord('a') ^ 32))       # A   —— 异或翻转，大小写互换
print(ord('7') - ord('0'))      # 7   —— 数字字符转数值
print(ord('c') - ord('a'))      # 2   —— 字母在字母表中的序号`, 0.5, 1.1, 6.3, 2.5, { fontSize: 10.5, lang: "py" });
  callout(s, "位运算版的大小写转换", [
    "`| 32` 置位 → 小写",
    "`& ~32` 清位 → 大写",
    "`^ 32` 翻转 → 互换",
  ], 7.05, 1.1, 2.45, 2.5, { fontSize: 11, gap: 8 });
  callout(s, "做题时的常用写法", [
    "内置方法更清楚：`s.upper()`、`s.lower()`、`s.swapcase()`、`c.isdigit()`、`c.isalpha()`。",
    "`ord(c) - ord('a')` 把字母映射到 0–25，用来做计数数组的下标（如 `cnt = [0] * 26`）。",
  ], 0.5, 3.8, 9.0, 1.3, { fontSize: 11.5, fill: C.mint, tcolor: C.dark });
}

// 5.2 Unicode vs UTF-8
{
  const s = content("5.2", "5 字符编码 · Unicode 与 UTF-8", "字符集 ≠ 编码方式");
  card(s, 0.5, 1.1, 4.35, 1.7, C.code);
  text(s, "Unicode：字符集", 0.7, 1.2, 4, 0.35, { fontSize: 14, bold: true, color: C.dark, margin: 0 });
  text(s, "给世界上每个字符一个**码点**（编号）。\n\"中\" 的码点是 `U+4E2D`，`ord('中') == 0x4e2d`。", 0.7, 1.6, 4.0, 1.1, { fontSize: 11.5, margin: 0, lsm: 1.2 });
  card(s, 5.15, 1.1, 4.35, 1.7, C.cream);
  text(s, "UTF-8：编码方式", 5.35, 1.2, 4, 0.35, { fontSize: 14, bold: true, color: C.goldText, margin: 0 });
  text(s, "把码点变成**字节序列**，变长：ASCII 占 1 字节，汉字通常 3 字节。", 5.35, 1.6, 4.0, 1.1, { fontSize: 11.5, margin: 0, lsm: 1.2 });
  table(s, [
    ["码点范围", "字节数", "字节模板", "例子"],
    [{ t: "U+0000 – U+007F", mono: true }, "1", { t: "0xxxxxxx", mono: true }, "'A' → 41"],
    [{ t: "U+0080 – U+07FF", mono: true }, "2", { t: "110xxxxx 10xxxxxx", mono: true }, "'é' → c3 a9"],
    [{ t: "U+0800 – U+FFFF", mono: true }, "3", { t: "1110xxxx 10xxxxxx 10xxxxxx", mono: true }, "'中' → e4 b8 ad"],
    [{ t: "U+10000 – U+10FFFF", mono: true }, "4", { t: "11110xxx 10xxxxxx ×3", mono: true }, "'😀' → f0 9f 98 80"],
  ], 0.5, 3.0, 9.0, [2.1, 0.8, 3.4, 2.7], { fontSize: 11, rowH: 0.4 });
}

// 5.2 encode 中 by hand
{
  const s = content("5.2", "5 字符编码 · UTF-8", "手工编码一次：'中' = U+4E2D");
  text(s, "4E2D 在 U+0800–U+FFFF 之间 → 用 3 字节模板。把码点的 16 位依次填进模板的 x：", 0.5, 1.05, 9, 0.4, { fontSize: 12.5 });
  text(s, "4E2D₁₆ =", 0.5, 1.6, 1.5, 0.42, { fontSize: 13, bold: true, color: C.dark, valign: "middle", margin: 0 });
  const bits = "0100111000101101".split("");
  const grp = bits.map((_, i) => (i < 4 ? "CFE0D8" : i < 10 ? "FFF6E0" : "F9D5D0"));
  cells(s, 2.0, 1.6, bits, { cw: 0.38, ch: 0.42, fs: 12, fills: grp });
  const bytes = [["1110", "0100", "E4", "CFE0D8"], ["10", "111000", "B8", "FFF6E0"], ["10", "101101", "AD", "F9D5D0"]];
  bytes.forEach((b, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 2.35, 2.85, 1.55, C.code);
    const pre = b[0].split(""), pay = b[1].split("");
    cells(s, x + 0.12, 2.5, [...pre, ...pay], { cw: 0.32, ch: 0.4, fs: 11, fills: [...pre.map(() => "E0E0E0"), ...pay.map(() => b[3])] });
    text(s, "第 " + (i + 1) + " 字节", x + 0.12, 3.05, 1.3, 0.3, { fontSize: 10.5, color: C.muted, margin: 0 });
    text(s, "0x" + b[2], x + 1.4, 3.0, 1.3, 0.75, { fontSize: 22, bold: true, color: C.dark, fontFace: MONO, align: "right", valign: "middle", margin: 0 });
  });
  text(s, "灰色 = 模板里固定的前缀；彩色 = 码点的位（4 + 6 + 6 = 16 位）", 0.5, 3.98, 9, 0.3, { fontSize: 10.5, color: C.muted, margin: 0 });
  codeBlock(s, `print("中".encode('utf-8'))       # b'\\xe4\\xb8\\xad'`, 0.5, 4.35, 9.0, 0.6, { fontSize: 12, lang: "py" });
}

// 5.2 code
{
  const s = content("5.2", "5 字符编码 · UTF-8", "str 与 bytes：字符数 ≠ 字节数");
  codeBlock(s, `s = "中A"
print(len(s))            # 2  —— 按字符计数
b = s.encode('utf-8')
print(b, len(b))         # b'\\xe4\\xb8\\xadA' 4
print(b.decode('utf-8'))         # 中A
print(hex(ord('中')))            # 0x4e2d`, 0.5, 1.1, 6.2, 2.1, { fontSize: 11, lang: "py" });
  card(s, 6.95, 1.1, 2.55, 2.1, C.code);
  pill(s, "str  \"中A\"", 7.1, 1.25, 2.25, 0.4, C.green, C.white, 11);
  text(s, "encode ↓      ↑ decode", 7.1, 1.75, 2.25, 0.35, { fontSize: 10.5, bold: true, color: C.dark, align: "center", margin: 0 });
  pill(s, "bytes  e4 b8 ad 41", 7.1, 2.2, 2.25, 0.4, C.dark, C.gold, 10.5);
  text(s, "文本 ↔ 字节", 7.1, 2.7, 2.25, 0.3, { fontSize: 10, color: C.muted, align: "center", margin: 0 });
  callout(s, "两种类型，两种单位", [
    "`str`：**字符**序列，`len` 数的是字符。",
    "`bytes`：**字节**序列，文件、网络里实际传的是它。",
    "`encode` 把 str 变 bytes，`decode` 反过来——**两边必须用同一种编码**。",
  ], 0.5, 3.4, 9.0, 1.7, { fontSize: 11.5 });
}

// 5.2 mojibake
{
  const s = content("5.2", "5 字符编码 · 乱码", "乱码的本质：用 A 编码存的字节，拿 B 编码去解");
  codeBlock(s, `b = "你好".encode('utf-8')      # 6 个字节：e4 bd a0 e5 a5 bd
print(b.decode('gbk'))          # 浣犲ソ  —— 按 GBK 每 2 字节一个字去解
print(b.decode('utf-8'))        # 你好    —— 用对的编码就恢复了`, 0.5, 1.1, 9.0, 1.1, { fontSize: 11, lang: "py" });
  const flow = [["你好", C.green], ["UTF-8 编码", C.dark], ["e4 bd a0 e5 a5 bd", C.muted], ["GBK 解码", C.bad], ["浣犲ソ", C.bad]];
  flow.forEach((f, i) => {
    const x = 0.5 + i * 1.84;
    pill(s, f[0], x, 2.45, 1.6, 0.46, f[1], C.white, i === 2 ? 9 : 11.5);
    if (i < 4) s.addShape(pres.shapes.LINE, { x: x + 1.61, y: 2.68, w: 0.22, h: 0, line: { color: C.dark, width: 1.5, endArrowType: "triangle" } });
  });
  text(s, "字节本身没有坏，坏的是**解读方式**。", 0.5, 3.05, 9, 0.35, { fontSize: 12.5, bold: true, color: C.dark, align: "center", margin: 0 });
  text(s, "读写文件时显式指定编码：", 0.5, 3.5, 5, 0.3, { fontSize: 12, bold: true, color: C.dark, margin: 0 });
  codeBlock(s, `with open('data.txt', encoding='utf-8') as f:
    text = f.read()`, 0.5, 3.85, 5.5, 0.8, { fontSize: 11, lang: "py" });
  callout(s, "为什么要显式写", "不写 `encoding`，Python 用系统默认编码：中文 Windows 上常是 GBK，Linux / macOS 上是 UTF-8。同一份代码换台机器就乱码。", 6.25, 3.5, 3.25, 1.6, { fontSize: 10.5, fill: C.mint, tcolor: C.dark });
}

// ============================ PART 6 ============================
sectionSlide("Part 6", "计算机文化", "几位必须知道的人 · 摩尔定律与它的放缓");

// 6 people
{
  const s = content("6", "6 计算机文化", "几位必须知道的人");
  table(s, [
    ["人物", "贡献", "和本课的联系"],
    [{ t: "Alan Turing", bold: true }, "图灵机、可计算性、图灵测试；ACM 图灵奖以其命名", "本周 Part 2"],
    [{ t: "John von Neumann", bold: true }, "存储程序式计算机结构", "本周 Part 3"],
    [{ t: "Claude Shannon", bold: true }, "信息论；用布尔代数分析开关电路", "位运算、比特"],
    [{ t: "Edsger Dijkstra", bold: true }, "最短路算法、结构化程序设计", "第 12 周会用他的算法"],
    [{ t: "Donald Knuth", bold: true }, "《计算机程序设计艺术》、TeX；算法分析的奠基者", "第 4 周的大 O"],
    [{ t: "Grace Hopper", bold: true }, "编译器、COBOL；「debug」一词的推广者", "第 13 周编译与解释"],
  ], 0.5, 1.1, 9.0, [2.1, 4.6, 2.3], { fontSize: 12, rowH: 0.52 });
  text(s, "开篇那句「计算机科学不是关于计算机的科学……」通常归于 Dijkstra。", 0.5, 4.8, 9, 0.3, { fontSize: 10.5, color: C.muted, margin: 0 });
}

// 6 Moore's law
{
  const s = content("6", "6 计算机文化", "摩尔定律与它的放缓");
  card(s, 0.5, 1.1, 9.0, 1.2, C.dark);
  text(s, "集成电路上的晶体管数量，约每 18–24 个月翻一番。", 0.8, 1.1, 8.4, 1.2, { fontSize: 20, bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
  const cols = [
    ["过去几十年", "等一两年，同一个程序自己就变快了。", C.code, C.dark],
    ["现在", "明显放缓：单核频率多年停在几 GHz，晶体管越来越难缩小。", "FDF0EE", C.bad],
    ["所以", "性能提升越来越依赖**并行**与**更好的算法**——后者正是本课的主题。", C.mint, C.ok],
  ];
  cols.forEach((c, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 2.5, 2.85, 1.65, c[2]);
    text(s, c[0], x + 0.2, 2.6, 2.5, 0.35, { fontSize: 14, bold: true, color: c[3], margin: 0 });
    text(s, c[1], x + 0.2, 3.0, 2.5, 1.1, { fontSize: 11.5, margin: 0, lsm: 1.15 });
  });
  callout(s, "推荐", "阅读《图灵与 ACM 图灵奖》《IEEE 计算机先驱奖》；观看电影《模仿游戏》（The Imitation Game）。", 0.5, 4.3, 9.0, 0.8, { fontSize: 11.5 });
}

// ============================ Wrap-up ============================
// Practice
{
  const s = content("✎", "本周练习", "本周练习");
  table(s, [
    ["#", "题目", "平台 / 编号", "考点", "对应本周"],
    ["1", "十进制到八进制", { t: "E02734", mono: true }, "进制转换", "4.1"],
    ["2", "二进制回文的整数", { t: "E25538", mono: true }, "进制 + 字符串", "4.1"],
    ["3", "只出现一次的数字", { t: "LC 136", mono: true }, "异或性质", "4.3"],
    ["4", "位 1 的个数", { t: "LC 191", mono: true }, "位运算", "4.3"],
    ["5", "大小写字母互换", { t: "E02689", mono: true }, "ASCII", "5.1"],
    ["6", "回文数字", { t: "04067", mono: true }, "字符串 / 数位", "—"],
    ["7", "判断闰年", { t: "02733", mono: true }, "分支", "—"],
    [{ t: "8（选做）", color: C.goldText }, "高低位交换", { t: "洛谷 P1100", mono: false }, "位运算、移位", "4.3"],
  ], 0.5, 1.05, 9.0, [1.1, 2.6, 1.8, 2.2, 1.3], { fontSize: 12, rowH: 0.4 });
  text(s, "E 开头与纯数字编号：cs101.openjudge.cn；LC：leetcode.cn；P1100：洛谷。", 0.5, 4.78, 9, 0.28, { fontSize: 10, color: C.muted, margin: 0 });
}

// Thinking questions
{
  const s = content("?", "本周练习 · 思考题", "思考题");
  const qs = [
    ["补码", "为什么补码能让「减法变成加法」？用 8 位补码手算 `7 - 5`，验证它等于 `7 + (-5)` 的低 8 位。"],
    ["浮点", "`0.1 + 0.2 != 0.3`，那么 `0.5 + 0.25 == 0.75` 吗？为什么？（提示：想想哪些小数能写成 k/2ⁿ）"],
    ["可计算性", "停机问题不可判定，为什么杀毒软件仍然「有用」？可判定与实用之间差了什么？"],
    ["编码", "一个 UTF-8 编码的中文文本文件，用 GBK 打开会看到什么？试着构造一次乱码再修好它。"],
  ];
  qs.forEach((q, i) => {
    const x = 0.5 + (i % 2) * 4.6, y = 1.1 + Math.floor(i / 2) * 2.0;
    card(s, x, y, 4.4, 1.85, i % 3 === 0 ? C.code : C.cream);
    numCircle(s, i + 1, x + 0.18, y + 0.15, 0.4, C.dark);
    text(s, q[0], x + 0.7, y + 0.15, 3.5, 0.4, { fontSize: 14, bold: true, color: C.dark, valign: "middle", margin: 0 });
    s.addText(runs(q[1], { color: C.text }), { x: x + 0.2, y: y + 0.68, w: 4.0, h: 1.1, fontFace: FONT, fontSize: 11.5, margin: 0, isTextBox: true, valign: "top" });
  });
}

summarySlide("本周小结", [
  ["抽象", "计算机科学研究的是**计算本身**，计算机只是载体；**抽象**是它最核心的工具。"],
  ["图灵机", "划定了可计算的边界；**停机问题不可判定**是证明了的不可能，不是暂时做不到。"],
  ["冯·诺依曼", "核心是**存储程序**；存储层次解释了绝大多数「为什么这么慢」。"],
  ["补码与浮点", "整数用**补码**（零唯一、减法即加法）；浮点是二进制近似，**永远不要用 == 比较**。"],
  ["字符编码", "`'0'=48, 'A'=65, 'a'=97`，大小写差 32；Unicode 是字符集，UTF-8 是编码方式。"],
]);

// Next week
{
  const s = sectionSlide("下周预告", "Python 基础与算法分析入门", "把语法补齐，并第一次正面回答：\n「这段代码够快吗？」—— 大 O、从数据范围倒推算法");
}

  await D.save(OUT);
})().catch((e) => { console.error(e); process.exit(1); });

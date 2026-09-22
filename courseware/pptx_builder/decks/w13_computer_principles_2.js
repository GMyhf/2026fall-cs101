// 第 13 周 计算机原理（2/2）与阶段综合练习 —— 由 202611_ADS_W13_Computer_Principles_2.md 整理成的讲课 PPT。
// 生成：cd courseware/pptx_builder && node decks/w13_computer_principles_2.js ../202611_ADS_W13_Computer_Principles_2.pptx
// 页上所有的运行结果都在 Python 3.12 下实跑核对过；改代码时连同结果一起改。
const path = require("path");
const { createDeck } = require("../lib");

const OUT = process.argv[2] || path.join(__dirname, "..", "out", "202611_ADS_W13_Computer_Principles_2.pptx");

(async () => {
  const D = createDeck({ title: "计算概论（B）第 13 周 计算机原理（2/2）与阶段综合练习", author: "Hongfei Yan" });
  const {
    pres, C, FONT, MONO, runs, text, bullets, card, codeBlock, consoleBlock, callout, table,
    cells, arrowLabel, pill, numCircle, titleSlide, sectionSlide, content, summarySlide,
  } = D;

// ---- slides（顶层不缩进，避免改动模板字符串里的代码缩进）----
// =====================================================================
// Cover
titleSlide({
  kicker: "计算概论（B） · 第 13 周 · 2026 Fall",
  title: "计算机原理（2/2）",
  subtitle: "与阶段综合练习",
  topics: "编译与解释 · Python 执行模型与字节码 · GIL\n进程与线程 · 虚拟地址空间 · 内存管理与引用计数\n缓存与局部性原理 · 文件 I/O 与缓冲\n阶段综合练习：题型识别 · 综合例题完整拆解",
  footer: "Compiled by Hongfei Yan · 2026 Fall · github.com/GMyhf/2026fall-cs101",
});

// Three questions
{
  const s = content("?", "本周导引", "本周要回答三个问题");
  const qs = [
    ["同样是 O(n²)，为什么 C++ 能过而 Python TLE？", "编译型直接跑机器码，解释型每条**字节码**都要在虚拟机里走一次循环——**慢 10–100 倍**。"],
    ["递归写深了为什么会崩？内存能无限申请吗？", "程序跑在**虚拟地址空间**里；栈会撑爆，内存也有物理上限——`10¹⁸` 字节申请不下来。"],
    ["剩下 12 周的算法，考场上怎么快速对上号？", "看数据范围、认题型、定策略——本周最后做一次**阶段综合串讲**。"],
  ];
  qs.forEach((q, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.15, 2.85, 2.6, C.code);
    numCircle(s, i + 1, x + 0.2, 1.32, 0.46, C.dark);
    text(s, q[0], x + 0.2, 1.92, 2.5, 0.85, { fontSize: 13, bold: true, color: C.dark, margin: 0, lsm: 1.1 });
    text(s, q[1], x + 0.2, 2.8, 2.5, 0.9, { fontSize: 11, margin: 0, lsm: 1.2 });
  });
  card(s, 0.5, 4.0, 9.0, 1.05, C.dark);
  text(s, "一句话概括", 0.75, 4.1, 3, 0.3, { fontSize: 11, bold: true, color: C.gold, margin: 0 });
  s.addText([
    ...runs("这周最后一次", { color: C.white }),
    { text: "往下看一层", options: { color: C.gold, bold: true } },
    ...runs("：程序怎么被机器执行、内存怎么管理；然后回到写题本身，把前 12 周串成一张地图。", { color: C.white }),
  ], { x: 0.75, y: 4.42, w: 8.6, h: 0.55, fontFace: FONT, fontSize: 13.5, margin: 0, isTextBox: true, valign: "middle", lineSpacingMultiple: 1.15 });
}

// Roadmap
{
  const s = content("≡", "本周导引", "内容地图");
  const cols = [
    ["1  程序怎么跑起来", ["1.1 编译型 vs 解释型", "1.2 Python 的字节码", "1.3 CPython 的 GIL"]],
    ["2–4  进程、内存、I/O", ["2.1–2.2 进程线程、虚拟地址空间", "2.3 能不能申请 10¹⁸ 字节", "2.4 引用计数与 GC", "3 缓存与局部性", "4 文件 I/O 与缓冲"]],
    ["5  阶段综合练习", ["5.1 题型识别速查表", "5.2 综合练习题单 A/B/C 组", "5.3 一道综合例题的完整拆解", "本周作业 · 思考题 · 小结"]],
  ];
  cols.forEach((c, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.15, 2.85, 3.9, i === 1 ? C.cream : C.code);
    text(s, c[0], x + 0.2, 1.3, 2.5, 0.6, { fontSize: 17, bold: true, color: C.dark, margin: 0, lsm: 1.1 });
    bullets(s, c[1], x + 0.15, 2.05, 2.6, 2.85, { fontSize: 12, gap: 9 });
  });
}

// Run first
{
  const s = content("▶", "先跑一遍", "三行代码，三个本周要讲清楚的现象");
  codeBlock(s, `import sys, gc

print(sys.getsizeof([0] * 1000))        # 1000 个整数占多少字节？
print(2 ** 63 - 1 == sys.maxsize)       # 64 位整数的上限在哪？

class Node:
    def __init__(self): self.ref = None
x, y = Node(), Node()
x.ref, y.ref = y, x                     # 循环引用
del x, y
print(gc.collect() > 0)                 # 引用计数破不了环，回收得掉吗？`, 0.5, 1.1, 5.8, 2.55, { fontSize: 10, lang: "py" });
  consoleBlock(s, "8056\nTrue\nTrue", 6.45, 1.1, 3.05, 1.2);
  const qs = [
    ["getsizeof", "list 是**指针数组**：8 字节/指针 × 1000 + 头部开销", "2.3"],
    ["`2**63-1`", "`sys.maxsize` 就是 64 位有符号整数的上限", "2.3"],
    ["gc.collect()", "**引用计数**破不了环，靠**分代 GC** 兜底", "2.4"],
  ];
  qs.forEach((q, i) => {
    const y = 2.5 + i * 0.42;
    text(s, q[0], 6.45, y, 1.55, 0.36, { fontSize: 10.5, bold: true, color: C.green, valign: "middle", margin: 0 });
    pill(s, "§ " + q[2], 8.7, y + 0.02, 0.75, 0.28, C.dark, C.gold, 9.5);
  });
  const qs2y = 2.5;
  qs.forEach((q, i) => {
    text(s, q[1], 0.5, qs2y + 1.35 + i * 0.42, 8.6, 0.4, { fontSize: 10.8, margin: 0 });
  });
}

// ============================ PART 1 ============================
sectionSlide("Part 1", "程序是怎么跑起来的", "同一份源码，编译型和解释型走的是两条不同的路\n编译 vs 解释 · Python 字节码 · GIL");

// 1.1 compiled vs interpreted
{
  const s = content("1.1", "1 程序怎么跑起来", "编译型 vs 解释型");
  codeBlock(s, `编译型（C / C++）
源码 a.cpp -[编译器]-> 汇编 -[汇编器]-> 目标文件 .o -[链接器]-> 可执行文件 -> CPU 直接执行

解释型（Python）
源码 a.py -[编译]-> 字节码 .pyc -> Python 虚拟机（CPython）逐条解释 -> 调用 C 函数 -> CPU`, 0.5, 1.05, 9.0, 1.15, { fontSize: 10.5, lang: "text" });
  table(s, [
    ["", "编译型", "解释型"],
    ["代表", "C / C++ / Rust", "Python / JavaScript"],
    ["速度", "快（直接机器码）", "慢 10–100 倍"],
    ["跨平台", "需重新编译", "字节码可移植"],
    ["错误发现", "编译期", "运行期"],
    ["本课影响", "OJ 上 C++ 时限更宽松", "Python 常数大，要靠算法弥补"],
  ], 0.5, 2.4, 9.0, [1.6, 3.6, 3.8], { fontSize: 11.5, rowH: 0.32 });
  callout(s, "这解释了一个常见困惑", "同样是 O(n²) 的代码，C++ 能过而 Python TLE。**Python 的对策不是优化常数，而是换更优的算法。**", 0.5, 4.4, 9.0, 0.65, { fontSize: 11.5, fill: C.mint, tcolor: C.dark });
}

// 1.2 bytecode
{
  const s = content("1.2", "1 程序怎么跑起来", "Python 的字节码");
  codeBlock(s, `import dis

def add(a, b):
    return a + b

dis.dis(add)`, 0.5, 1.1, 4.3, 1.5, { fontSize: 11, lang: "py" });
  consoleBlock(s, "RESUME              0\nLOAD_FAST           a\nLOAD_FAST           b\nBINARY_OP           0 (+)\nRETURN_VALUE", 5.0, 1.1, 4.5, 1.5, 10.5);
  callout(s, "每一条字节码", "是解释器里**一次循环迭代 + 一次函数分派**——这就是 Python 慢的直接原因，也是「用内建函数（C 实现）替代 Python 循环」能提速的原因。", 0.5, 2.8, 9.0, 0.95, { fontSize: 11.5 });
  codeBlock(s, `n = 3_000_000
s = 0
for i in range(n): s += i        # 纯 Python 循环
s2 = sum(range(n))               # 内建 sum，C 实现
assert s == s2`, 0.5, 3.95, 5.8, 1.15, { fontSize: 10, lang: "py" });
  consoleBlock(s, "python loop: 0.191s\nbuiltin sum: 0.036s\n(约 5~10 倍)", 6.45, 3.95, 3.05, 1.15, 10.5);
}

// 1.3 GIL
{
  const s = content("1.3", "1 程序怎么跑起来", "CPython 的 GIL");
  callout(s, "全局解释器锁（GIL）", "**同一时刻只有一个线程能执行 Python 字节码**——即使机器有 16 个核，多线程也不能让纯计算并行加速。", 0.5, 1.1, 9.0, 0.95, { fontSize: 13 });
  table(s, [
    ["任务类型", "多线程有用吗", "该用什么"],
    ["CPU 密集（算数、循环）", { t: "✗ 没用", color: C.bad, bold: true }, { t: "多进程 multiprocessing", mono: true }],
    ["I/O 密集（读文件、网络）", { t: "✓ 有用", color: C.ok, bold: true }, { t: "多线程 / asyncio", mono: true }],
  ], 0.5, 2.3, 9.0, [3.4, 2.4, 3.2], { fontSize: 13, rowH: 0.55 });
  callout(s, "本课唯一用到线程的场景", "**加大递归栈**（第 8 周 2.2 节）——那不是为了并行，而是绕开主线程固定的栈空间限制。", 0.5, 4.05, 9.0, 0.95, { fontSize: 12.5, fill: C.mint, tcolor: C.dark });
}

// ============================ PART 2 ============================
sectionSlide("Part 2", "进程与内存", "程序跑起来之后，它以为自己独占一整块地址空间\n进程与线程 · 虚拟地址空间 · 内存上限 · 引用计数与 GC");

// 2.1 process vs thread
{
  const s = content("2.1", "2 进程与内存", "进程与线程");
  table(s, [
    ["", "进程", "线程"],
    ["地址空间", { t: "独立", bold: true, color: C.ok }, { t: "共享（同一进程内）", bold: true, color: C.goldText }],
    ["创建代价", "大", "小"],
    ["通信", "管道 / 共享内存 / socket", "直接读写共享变量"],
    ["崩溃影响", "只影响自己", "拖垮整个进程"],
  ], 0.5, 1.15, 9.0, [1.5, 3.7, 3.8], { fontSize: 13, rowH: 0.55 });
  callout(s, "一句话", "进程是**资源分配**的单位（独立地址空间），线程是**调度执行**的单位（共享地址空间）——第 13 周只需要记住这张表，不要求你会写多进程/多线程代码。", 0.5, 3.75, 9.0, 1.1, { fontSize: 12 });
}

// 2.2 virtual address space diagram
{
  const s = content("2.2", "2 进程与内存 · 第 8 周的展开", "虚拟地址空间：一个进程「以为」自己看到的内存");
  text(s, "高地址  0xFFFF...", 1.6, 1.02, 3, 0.25, { fontSize: 10, color: C.muted, margin: 0 });
  const layers = [
    ["内核空间", "用户程序不可直接访问", C.dark, C.white],
    ["栈 Stack", "函数调用帧、局部变量；通常 8 MB", "3E7C68", C.white],
    ["（未映射）", "访问这里 -> 段错误 Segmentation Fault", "F7F9F8", C.muted],
    ["堆 Heap", "malloc / Python 对象", C.mint, C.dark],
    ["BSS（未初始化）", "", "E6EFEA", C.dark],
    ["Data（已初始化）", "全局变量、常量", "DCE8E2", C.dark],
    ["Text 代码段", "机器指令，只读", C.dark, C.white],
  ];
  layers.forEach((l, i) => {
    const y = 1.32 + i * 0.5;
    card(s, 1.6, y, 4.2, 0.44, l[2]);
    text(s, l[0], 1.75, y, 1.6, 0.44, { fontSize: 11.5, bold: true, color: l[3], valign: "middle", margin: 0 });
    text(s, l[1], 3.4, y, 2.3, 0.44, { fontSize: 9, color: l[3] === C.white ? C.mint : C.muted, valign: "middle", margin: 0 });
  });
  s.addShape(pres.shapes.LINE, { x: 6.0, y: 1.82, w: 0, h: 0.44, line: { color: C.bad, width: 1.5, endArrowType: "triangle" } });
  text(s, "向下增长", 6.1, 1.9, 1.0, 0.3, { fontSize: 9, color: C.bad, bold: true, margin: 0 });
  s.addShape(pres.shapes.LINE, { x: 6.0, y: 3.26, w: 0, h: -0.44, line: { color: C.green, width: 1.5, endArrowType: "triangle" } });
  text(s, "向上增长", 6.1, 2.9, 1.0, 0.3, { fontSize: 9, color: C.green, bold: true, margin: 0 });
  text(s, "低地址  0x0000...", 1.6, 4.85, 3, 0.25, { fontSize: 10, color: C.muted, margin: 0 });
  callout(s, "「虚拟」的三个好处", [
    "**隔离**：进程 A 写坏自己的内存，碰不到进程 B。",
    "**统一**：每个程序都以为自己从地址 0 开始，编译器不用关心实际位置。",
    "**超额分配**：虚拟空间可以大于物理内存，靠换页（swap）支撑。",
  ], 7.15, 1.32, 2.35, 3.5, { fontSize: 10.5, gap: 8 });
}

// 2.2 page table
{
  const s = content("2.2", "2 进程与内存 · 虚拟地址空间", "页表与 MMU：谁把「虚拟」翻译成「物理」");
  bullets(s, [
    "内存按 4 KB 的**页**管理。",
    "**页表**记录「虚拟页 → 物理页」的映射，由硬件 **MMU** 完成翻译。",
    "访问**未映射**的页触发**缺页中断**：操作系统去磁盘调入（正常缺页）或直接杀掉进程（非法访问，也就是段错误）。",
  ], 0.5, 1.1, 9.0, 1.7, { fontSize: 13, gap: 10 });
  callout(s, "对照第 8 周", "递归太深、局部变量太多 → **栈**这块区域被撑爆 → 触碰到「未映射」区 → 段错误 / `RecursionError`。这就是「递归为什么会崩」的物理答案。", 0.5, 2.95, 9.0, 1.0, { fontSize: 12.5, fill: C.mint, tcolor: C.dark });
  callout(s, "考场直觉", "「栈溢出」和「内存不够」是两回事：前者是**这一小块区域**被撑爆（哪怕物理内存还很富余），后者是**整个进程**申请不到新页了。", 0.5, 4.1, 9.0, 0.9, { fontSize: 12 });
}

// 2.3 memory limit
{
  const s = content("2.3", "2 进程与内存", "能申请 10¹⁸ 字节的内存吗");
  codeBlock(s, `import sys

print(sys.maxsize)              # 64 位解释器的整数上限
print(2 ** 63 - 1 == sys.maxsize)`, 0.5, 1.05, 5.8, 1.15, { fontSize: 10.5, lang: "py" });
  consoleBlock(s, "9223372036854775807\nTrue", 6.45, 1.05, 3.05, 1.15, 11);
  bullets(s, [
    "64 位虚拟地址空间理论上 2⁶⁴ ≈ 1.8×10¹⁹ 字节，看起来「够」；",
    "但**实际 CPU 只用 48 位**虚拟地址 → 256 TB ≈ 2.8×10¹⁴ 字节；",
    "**物理内存 + swap** 才是真正的上限；Linux 允许**超额提交（overcommit）**：`malloc` 可能成功，**真正写入时才 OOM**。",
  ], 0.5, 2.3, 9.0, 1.35, { fontSize: 11.5, gap: 5 });
  table(s, [
    ["结构", "10⁶ 个元素约占"],
    [{ t: "list of small int", mono: true }, "~40 MB（8 字节指针 + 对象本身）"],
    [{ t: "array('i', ...)", mono: true }, "~4 MB"],
    [{ t: "bytearray", mono: true }, "~1 MB"],
    [{ t: "set / dict", mono: true }, "~70 MB 以上"],
  ], 0.5, 3.6, 9.0, [2.6, 6.4], { fontSize: 10.5, rowH: 0.23, tight: true });
  text(s, "OJ 内存限制常见 64–256 MB：n=10⁷ 的一维 list 就已经危险，改用 bytearray / array；可回看 W04 埃氏筛从 i*i 开始逐个标记倍数的循环。", 0.5, 4.78, 9, 0.25, { fontSize: 9.5, color: C.muted, margin: 0 });
}

// 2.4 memory management
{
  const s = content("2.4", "2 进程与内存", "Python 的内存管理：引用计数 + 分代 GC");
  codeBlock(s, `import sys

a = [1, 2, 3]
print(sys.getrefcount(a))       # 2（a 自己 + getrefcount 的参数）
b = a
print(sys.getrefcount(a))       # 3
del b
print(sys.getrefcount(a))       # 2`, 0.5, 1.1, 4.3, 2.15, { fontSize: 10.5, lang: "py" });
  callout(s, "引用计数归零就立即回收", "每个对象头部存一个计数器：多一个引用 +1，少一个 -1，归零时**立刻**释放——这也是 CPython 里 `del` 常常「立刻见效」的原因。", 5.0, 1.1, 4.5, 2.15, { fontSize: 11.5 });
  codeBlock(s, `import gc

class Node:
    def __init__(self):
        self.ref = None

x, y = Node(), Node()
x.ref = y
y.ref = x                       # 循环引用，引用计数永远不为 0
del x, y
print(gc.collect() > 0)         # True —— GC 回收了这些不可达对象`, 0.5, 3.35, 5.8, 1.7, { fontSize: 9, lang: "py" });
  callout(s, "循环引用", "x、y 互相指着对方，`del` 之后计数器永远 ≥ 1，引用计数**救不了**——靠**分代垃圾回收**定期扫描、找出「不可达但计数非零」的对象。", 6.45, 3.35, 3.05, 1.7, { fontSize: 10.8, fill: C.mint, tcolor: C.dark });
}

// ============================ PART 3 ============================
sectionSlide("Part 3", "缓存与局部性", "写出对缓存友好的代码 = 顺序访问连续内存\n局部性原理 · 按行 vs 按列 · 时间层次的实感");

// 3.1 locality
{
  const s = content("3.1", "3 缓存与局部性", "局部性原理");
  const qs = [
    ["时间局部性", "刚访问过的数据，很可能马上再被访问", "循环变量"],
    ["空间局部性", "访问了某个地址，很可能马上访问它旁边的", "数组遍历"],
  ];
  qs.forEach((q, i) => {
    const x = 0.5 + i * 4.6;
    card(s, x, 1.15, 4.4, 1.7, C.code);
    numCircle(s, i + 1, x + 0.2, 1.32, 0.42, C.dark);
    text(s, q[0], x + 0.8, 1.35, 3.3, 0.42, { fontSize: 15, bold: true, color: C.dark, margin: 0 });
    text(s, q[1], x + 0.2, 1.9, 4.0, 0.6, { fontSize: 12, margin: 0, lsm: 1.2 });
    pill(s, "例：" + q[2], x + 0.2, 2.55, 2.0, 0.28, C.dark, C.gold, 10);
  });
  callout(s, "缓存就是靠这两条工作的", "**写出对缓存友好的代码 = 顺序访问连续内存。** 这是第 3 周「存储层次」的直接推论：内存比缓存慢约 100 倍，少一次内存访问就是省一大截时间。", 0.5, 3.15, 9.0, 1.5, { fontSize: 13, fill: C.mint, tcolor: C.dark, lsm: 1.2 });
}

// 3.2 row vs col
{
  const s = content("3.2", "3 缓存与局部性", "实测：按行遍历 vs 按列遍历");
  codeBlock(s, `N = 1200
a = [[1] * N for _ in range(N)]

s = 0
for i in range(N):              # 按行：内层 j 变化，访问连续
    row = a[i]
    for j in range(N):
        s += row[j]

s2 = 0
for j in range(N):              # 按列：内层 i 变化，每次跳一整行
    for i in range(N):
        s2 += a[i][j]
assert s == s2`, 0.5, 1.05, 5.8, 3.0, { fontSize: 10, lang: "py" });
  consoleBlock(s, "按行 0.120s\n按列 0.144s\n\n(实测数值随\n机器波动，\n方向一致：\n按行更快)", 6.45, 1.05, 3.05, 2.15, 10.5);
  callout(s, "为什么 Python 里差距没 C 那么夸张", "Python 的 list 是**指针数组**，元素本身散落在堆上，缓存效应不如 C 明显。但「把 `a[i]` 提到内层循环外」同样有效——**少一次索引就是少一条字节码**。", 6.45, 3.35, 3.05, 1.75, { fontSize: 10.5 });
}

// 3.3 time hierarchy human scale
{
  const s = content("3.3", "3 缓存与局部性", "时间层次的实感：把 1 ns 想象成 1 秒");
  const rows = [
    ["L1 缓存", "1 ns", "1 秒", 0.02],
    ["L2 缓存", "4 ns", "4 秒", 0.03],
    ["内存", "100 ns", "1.7 分钟", 0.08],
    ["SSD 随机读", "100 μs", "1.2 天", 0.35],
    ["网络往返（同城）", "1 ms", "11 天", 0.6],
    ["磁盘寻道", "10 ms", "4 个月", 1.0],
  ];
  rows.forEach((r, i) => {
    const y = 1.1 + i * 0.58;
    text(s, r[0], 0.5, y, 1.9, 0.46, { fontSize: 12, bold: true, color: C.dark, valign: "middle", margin: 0 });
    text(s, r[1], 2.45, y, 1.0, 0.46, { fontSize: 11, mono: true, color: C.muted, valign: "middle", margin: 0, fontFace: MONO });
    s.addShape(pres.shapes.RECTANGLE, { x: 3.55, y: y + 0.08, w: Math.max(0.08, r[3] * 4.2), h: 0.28, fill: { color: i >= 4 ? C.bad : C.green }, line: { type: "none" } });
    text(s, r[2], 3.55 + Math.max(0.08, r[3] * 4.2) + 0.1, y, 1.8, 0.46, { fontSize: 11.5, bold: true, color: i >= 4 ? C.bad : C.green, valign: "middle", margin: 0 });
  });
  text(s, "这张表解释了为什么「少读一次磁盘」比「少算一万次加法」更重要。条形长度只示意顺序，不按比例。", 0.5, 4.7, 9, 0.3, { fontSize: 10.5, color: C.muted, margin: 0, lsm: 1.1 });
}

// ============================ PART 4 ============================
sectionSlide("Part 4", "文件 I/O", "OJ 上输出上万行时，批量比逐条快一个数量级\n基本用法 · 缓冲：为什么 print 很慢");

// 4.1 file io basics
{
  const s = content("4.1", "4 文件 I/O", "基本用法");
  codeBlock(s, `# 写
with open('data.txt', 'w', encoding='utf-8') as f:
    f.write("hello\\n")
    f.writelines([f"{i}\\n" for i in range(3)])

# 读
with open('data.txt', encoding='utf-8') as f:
    for line in f:                    # 逐行读，内存友好
        print(line.rstrip('\\n'))

with open('data.txt', encoding='utf-8') as f:
    content = f.read()                # 一次读完，大文件慎用

import os
os.remove('data.txt')`, 0.5, 1.05, 5.8, 3.35, { fontSize: 10, lang: "py" });
  callout(s, "with 语句", "保证文件**一定会被关闭**，即使中间抛异常——比手写 `f = open(...); ...; f.close()` 更安全，本课统一用 `with`。", 6.45, 1.05, 3.05, 1.55, { fontSize: 11 });
  callout(s, "逐行 vs 一次读完", "`for line in f` 一次只在内存里放一行，**大文件安全**；`f.read()` 把整个文件读进内存，文件一大就危险。", 6.45, 2.75, 3.05, 1.65, { fontSize: 10.8, fill: C.mint, tcolor: C.dark });
}

// 4.2 buffering
{
  const s = content("4.2", "4 文件 I/O", "缓冲：为什么 print 很慢");
  callout(s, "每次 print 都可能触发一次系统调用", "OJ 上输出上万行时，**批量输出**能快一个数量级。", 0.5, 1.05, 9.0, 0.75, { fontSize: 13 });
  codeBlock(s, `import sys

out = []
for i in range(5):
    out.append(str(i * i))
sys.stdout.write('\\n'.join(out) + '\\n')   # 一次系统调用输出全部`, 0.5, 1.95, 5.8, 1.35, { fontSize: 10.5, lang: "py" });
  callout(s, "同理，输入也要批量读", "`data = sys.stdin.read().split()` —— 一次系统调用读完全部，比多次 `input()` 快得多。", 6.45, 1.95, 3.05, 1.35, { fontSize: 11 });
  callout(s, "考场速查", [
    "输出多行：先攒进 `list`，最后 `'\\n'.join(...)` 一次性写出。",
    "输入量大：`sys.stdin.read().split()` 一次读完再切分，别逐个 `input()`。",
  ], 0.5, 3.5, 9.0, 1.35, { fontSize: 12.5, fill: C.mint, tcolor: C.dark, gap: 8 });
}

// ============================ PART 5 ============================
sectionSlide("Part 5", "阶段综合练习", "第 1–12 周的内容已经覆盖机考全部知识点\n题型识别速查表 · 综合练习题单 · 一道例题的完整拆解");

// 5.1 pattern lookup
{
  const s = content("5.1", "5 阶段综合练习", "题型识别速查表：看到这些字眼，往这想");
  table(s, [
    ["题面里出现", "大概率考点", "周次"],
    ["「统计出现次数」「按……排序输出」", "字典 + 多关键字排序", "W4"],
    ["「n ≤ 10⁶」「每次询问」", "预处理 + O(1) 查询（前缀和 / 筛）", "W4 W6"],
    ["「最少多少个」「最多能选几个」", "贪心（先想排序键）", "W6 W10"],
    ["「合并 / 覆盖 / 相交」+ 区间", "区间贪心", "W10"],
    ["「有多少种方案」「最大 / 最小价值」", "DP", "W10 W11"],
    ["「每个物品选或不选」", "0-1 背包", "W11"],
    ["「最少几步」「最短路径」", "BFS", "W12"],
    ["「所有路径」「全排列 / 组合」", "回溯", "W9"],
    ["「是否连通」「分成几组」", "并查集 / DFS", "W9"],
    ["「最小的最大值」「最大的最小值」", "二分答案", "W12"],
    ["「下一个更大的」", "单调栈", "W7"],
    ["表达式、括号", "栈", "W7"],
  ], 0.5, 1.05, 9.0, [4.3, 3.3, 1.4], { fontSize: 9.5, rowH: 0.295, tight: true });
}

// 5.2 problem sets A/B
{
  const s = content("5.2", "5 阶段综合练习", "综合练习题单（1/2）：A 组 · B 组");
  text(s, "A 组（基础巩固，全部应 AC）", 0.5, 1.02, 4.4, 0.3, { fontSize: 12.5, bold: true, color: C.dark, margin: 0 });
  table(s, [
    ["#", "题目", "编号", "考点"],
    ["1", "排队做实验", { t: "M21554", mono: true }, "排序+贪心"],
    ["2", "买学区房", { t: "M19963", mono: true }, "排序+中位数"],
    ["3", "装箱问题", { t: "01017", mono: true }, "贪心"],
    ["4", "病人排队", { t: "E07618", mono: true }, "稳定排序"],
    ["5", "校门外的树", { t: "02808", mono: true }, "差分"],
  ], 0.5, 1.35, 4.4, [0.35, 1.55, 1.1, 1.4], { fontSize: 10.5, rowH: 0.36, tight: true });
  text(s, "B 组（核心算法）", 5.1, 1.02, 4.4, 0.3, { fontSize: 12.5, bold: true, color: C.dark, margin: 0 });
  table(s, [
    ["#", "题目", "编号", "考点"],
    ["6", "采药", { t: "02773", mono: true }, "0-1 背包"],
    ["7", "数字三角形", { t: "02760", mono: true }, "路径 DP"],
    ["8", "拦截导弹", { t: "M02945", mono: true }, "LIS"],
    ["9", "鸣人和佐助", { t: "04115", mono: true }, "带状态 BFS"],
    ["10", "河中跳房子", { t: "M08210", mono: true }, "二分答案"],
    ["11", "宗教信仰", { t: "02524", mono: true }, "并查集"],
    ["12", "八皇后", { t: "02754", mono: true }, "回溯"],
  ], 5.1, 1.35, 4.4, [0.4, 1.5, 1.1, 1.4], { fontSize: 10.5, rowH: 0.36, tight: true });
  text(s, "E / M / T 开头与纯数字编号：cs101.openjudge.cn。", 0.5, 4.85, 9, 0.28, { fontSize: 9.5, color: C.muted, margin: 0 });
}

// 5.2 problem sets C
{
  const s = content("5.2", "5 阶段综合练习", "综合练习题单（2/2）：C 组（提高，选做）");
  table(s, [
    ["#", "题目", "编号", "考点"],
    ["13", "最大子矩阵", { t: "M02766", mono: true }, "降维 + Kadane"],
    ["14", "走山路", { t: "M20106", mono: true }, "Dijkstra"],
    ["15", "变换的迷宫", { t: "T04129", mono: true }, "多维状态 BFS"],
    ["16", "食物链", { t: "01182", mono: true }, "扩展域并查集"],
    ["17", "小游戏", { t: "T02802", mono: true }, "BFS + 转弯"],
    ["18", "世界杯只因", { t: "T27104", mono: true }, "区间覆盖"],
  ], 0.5, 1.1, 9.0, [0.6, 3.0, 2.0, 3.4], { fontSize: 12, rowH: 0.42 });
  callout(s, "怎么用这两页", "先挑 A、B 组各做完，确认第 1–12 周的基本功都在——**这两页本身就是一份体检表**：哪个考点对不上号，回对应周次的讲义重看。", 0.5, 3.95, 9.0, 1.05, { fontSize: 12.5, fill: C.mint, tcolor: C.dark });
}

// 5.3 worked example step1
{
  const s = content("5.3", "5 阶段综合练习 · 综合例题", "一道综合例题的完整拆解（1/3）：题目与思路");
  callout(s, "题目", "n 个任务，第 i 个耗时 tᵢ、截止时间 dᵢ，可以任意顺序执行（不可中断），求最多能按时完成几个任务。（n ≤ 10⁵）", 0.5, 1.05, 9.0, 0.85, { fontSize: 12.5 });
  const steps = [
    ["看数据范围", "n ≤ 10⁵ ⟹ 只能 O(n log n)，排除 DP 的 O(n²)。"],
    ["认题型", "「最多能选几个」⟹ 贪心。"],
    ["想排序键", "按**截止时间**排序（先做快到期的）。"],
    ["处理冲突", "按 d 升序加任务；总时长超了截止时间，就**丢掉已选任务里耗时最长的那个**（大根堆维护）。"],
  ];
  steps.forEach((st, i) => {
    const y = 2.1 + i * 0.72;
    numCircle(s, i + 1, 0.5, y, 0.4, C.dark);
    text(s, st[0], 1.05, y - 0.03, 1.9, 0.46, { fontSize: 12.5, bold: true, color: C.green, valign: "middle", margin: 0 });
    text(s, st[1], 3.0, y - 0.03, 6.5, 0.6, { fontSize: 11.5, valign: "middle", margin: 0, lsm: 1.1 });
  });
}

// 5.3 worked example step2 code
{
  const s = content("5.3", "5 阶段综合练习 · 综合例题", "一道综合例题的完整拆解（2/3）：代码与证明");
  codeBlock(s, `import heapq

def max_tasks(tasks):
    """tasks: [(耗时, 截止时间)]；返回最多按时完成的任务数。"""
    tasks = sorted(tasks, key=lambda t: t[1])       # 按截止时间
    heap, total = [], 0                             # heap 存 -耗时（大根堆）
    for cost, deadline in tasks:
        heapq.heappush(heap, -cost)
        total += cost
        if total > deadline:                        # 超时了
            total += heapq.heappop(heap)            # 丢掉耗时最长的（弹出的是负数）
    return len(heap)

print(max_tasks([(3, 4), (2, 3), (1, 2)]))          # 2
print(max_tasks([(5, 5), (1, 1), (1, 2), (1, 3)]))  # 3`, 0.5, 1.05, 5.8, 2.85, { fontSize: 10, lang: "py" });
  consoleBlock(s, "2\n3", 6.45, 1.05, 3.05, 0.85, 12);
  callout(s, "为什么这个贪心是对的（交换论证）", "若某一步超时，丢掉耗时最长的任务，剩余总时长最小，对后面的任务最有利，且**丢一个正好把数量减一**——不可能有更好的选择。", 6.45, 2.05, 3.05, 1.85, { fontSize: 10.8, fill: C.mint, tcolor: C.dark });
}

// 5.3 worked example step3 verify
{
  const s = content("5.3", "5 阶段综合练习 · 综合例题", "一道综合例题的完整拆解（3/3）：验证 —— 和暴力对拍");
  codeBlock(s, `import itertools, random

def max_tasks_brute(tasks):
    n = len(tasks)
    for k in range(n, 0, -1):
        for combo in itertools.combinations(range(n), k):
            for order in itertools.permutations(combo):
                t, ok = 0, True
                for i in order:
                    t += tasks[i][0]
                    if t > tasks[i][1]:
                        ok = False; break
                if ok: return k
    return 0

random.seed(101)
for _ in range(200):
    n = random.randint(1, 6)
    ts = [(random.randint(1, 5), random.randint(1, 12)) for _ in range(n)]
    assert max_tasks(ts) == max_tasks_brute(ts), ts
print("贪心与暴力一致（200 组随机数据）")`, 0.5, 1.0, 9.0, 3.35, { fontSize: 9, lang: "py" });
  callout(s, "这一节的流程就是考场上应有的流程", "**看范围 → 认题型 → 定排序键 / 状态 → 处理冲突 → 对拍验证。**", 0.5, 4.4, 9.0, 0.65, { fontSize: 11.5, fill: C.mint, tcolor: C.dark });
}

// homework table
{
  const s = content("✎", "本周练习", "本周作业");
  table(s, [
    ["#", "任务", "说明"],
    ["1", "完成 5.2 的 A 组全部 5 题", "基础巩固"],
    ["2", "完成 5.2 的 B 组至少 5 题", "核心算法"],
    ["3", { t: "用 dis.dis 反汇编一个函数", mono: false }, "观察字节码"],
    ["4", "实测按行 / 按列遍历的时间差", "局部性"],
    ["5", "为 A 组任一题写一份「暴力 + 对拍」脚本", "验证方法"],
    [{ t: "6（选做）", color: C.goldText }, "C 组任选 2 题", "提高"],
  ], 0.5, 1.05, 9.0, [0.6, 5.0, 3.4], { fontSize: 12, rowH: 0.44 });
}

// thinking questions
{
  const s = content("?", "本周练习 · 思考题", "思考题");
  const qs = [
    ["GIL", "为什么 Python 有 GIL 还要提供 `threading`？举一个多线程真能加速的场景。"],
    ["内存开销", "`sys.getsizeof([0] * 1000)` 只有 8 KB 左右，但这 1000 个整数本身占多少？为什么 `getsizeof` 不把它们算进去？"],
    ["虚拟内存", "段错误在虚拟地址空间的哪个区域最容易发生？为什么？"],
    ["估内存", "若一道题 n = 10⁷、内存限制 64 MB，用 `list` 存布尔数组会 MLE 吗？用 `bytearray` 呢？"],
  ];
  qs.forEach((q, i) => {
    const x = 0.5 + (i % 2) * 4.6, y = 1.05 + Math.floor(i / 2) * 1.8;
    card(s, x, y, 4.4, 1.65, i % 3 === 0 ? C.code : C.cream);
    numCircle(s, i + 1, x + 0.18, y + 0.15, 0.4, C.dark);
    text(s, q[0], x + 0.7, y + 0.15, 3.5, 0.4, { fontSize: 14, bold: true, color: C.dark, valign: "middle", margin: 0 });
    s.addText(runs(q[1], { color: C.text }), { x: x + 0.2, y: y + 0.62, w: 4.0, h: 0.95, fontFace: FONT, fontSize: 11.5, margin: 0, isTextBox: true, valign: "top" });
  });
  text(s, "思考题 5：5.3 的贪心若改成「按耗时排序」，构造一组数据说明它是错的。", 0.5, 4.65, 9, 0.3, { fontSize: 10.5, color: C.muted, margin: 0 });
}

summarySlide("本周小结", [
  ["编译与解释", "解释了「同一算法 C++ 过而 Python TLE」：**Python 的对策是换算法，不是抠常数**。"],
  ["字节码与 GIL", "每条字节码都是一次解释器循环；GIL 让多线程对 CPU 密集任务无效，本课用线程只为**加大递归栈**。"],
  ["虚拟地址空间", "栈（8 MB，深递归撑爆它）、堆（Python 对象）、代码段；页表 + MMU 完成翻译，缺页中断处理未映射访问。"],
  ["局部性与内存", "顺序访问连续内存更快；`list` 存 10⁶ 个 int 约 40 MB，`bytearray` 约 1 MB，OJ 限制常见 64–256 MB。"],
  ["综合题的流程", "**看范围 → 认题型 → 定策略 → 处理冲突 → 对拍**——这是接下来做题时该走的完整流程。"],
]);

// Next week
sectionSlide("下周预告", "AI 素养与 12 月月考复习", "LLM 原理 · 幻觉与验证 · 提示词\n月考六题讲评与错误归因 · 复习清单");

  await D.save(OUT);
})().catch((e) => { console.error(e); process.exit(1); });

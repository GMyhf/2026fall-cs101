// 第 8 周 递归 —— 由 202610_ADS_W08_Recursion.md 整理成的讲课 PPT。
// 生成：cd courseware/pptx_builder && node decks/w08_recursion.js ../202610_ADS_W08_Recursion.pptx
// 页上所有的运行结果都在 Python 3.12 下实跑核对过；改代码时连同结果一起改。
const path = require("path");
const { createDeck } = require("../lib");

const OUT = process.argv[2] || path.join(__dirname, "..", "out", "202610_ADS_W08_Recursion.pptx");

(async () => {
  const D = createDeck({ title: "计算概论（B）第 8 周 递归", author: "Hongfei Yan" });
  const {
    pres, C, FONT, MONO, runs, text, bullets, card, codeBlock, consoleBlock, callout, table,
    cells, arrowLabel, pill, numCircle, titleSlide, sectionSlide, content, summarySlide,
  } = D;

// ---- slides（顶层不缩进，避免改动模板字符串里的代码缩进）----
// =====================================================================
// Cover
titleSlide({
  kicker: "计算概论（B） · 第 8 周 · 2026 Fall",
  title: "递归",
  subtitle: "相信它，而不是展开它",
  topics: "递归的定义与三法则 · 栈帧与系统调用栈 · 递归深度的两道墙\n经典三部曲：斐波那契 · 汉诺塔 · 全排列\n分治：快速幂 · 二分查找 · 最大公约数\n递归的调试：打印调用树、常见错误",
  footer: "Compiled by Hongfei Yan · 2026 Fall · github.com/GMyhf/2026fall-cs101",
});

// Three questions
{
  const s = content("?", "本周导引", "本周要回答三个问题");
  const qs = [
    ["写递归时要在脑子里展开每一层吗？", "不用。**相信它**：只回答「最小情况怎么办」和「更小的问题已解决，怎么拼出答案」。"],
    ["递归到底会不会「爆栈」？", "递归深度有**两道墙**：Python 层计数器（能调）和 **C 调用栈**（调不到）——能不能定量把握。"],
    ["递归 / 分治 / 回溯，怎么选？", "同一个「调用自己」的机制，用在不同地方就是**递归三部曲**——本周把它们串起来。"],
  ];
  qs.forEach((q, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.15, 2.85, 2.6, C.code);
    numCircle(s, i + 1, x + 0.2, 1.32, 0.46, C.dark);
    text(s, q[0], x + 0.2, 1.92, 2.5, 0.75, { fontSize: 13.5, bold: true, color: C.dark, margin: 0 });
    text(s, q[1], x + 0.2, 2.7, 2.5, 0.95, { fontSize: 11, margin: 0, lsm: 1.2 });
  });
  card(s, 0.5, 4.0, 9.0, 1.05, C.dark);
  text(s, "一句话概括", 0.75, 4.1, 3, 0.3, { fontSize: 11, bold: true, color: C.gold, margin: 0 });
  s.addText([
    ...runs("递归 = ", { color: C.white }),
    { text: "有基例、向基例逼近、调用自身", options: { color: C.gold, bold: true } },
    ...runs("；剩下的三法则以外的一切，都是「怎么用好它」。", { color: C.white }),
  ], { x: 0.75, y: 4.42, w: 8.6, h: 0.5, fontFace: FONT, fontSize: 14.5, margin: 0, isTextBox: true, valign: "middle" });
}

// Roadmap
{
  const s = content("≡", "本周导引", "内容地图");
  const cols = [
    ["1–2  是什么 · 会怎样", ["1.1 递归三法则", "1.2 思维方式：相信它", "1.3 递归 ⇄ 迭代", "2 栈帧：两道墙、虚拟地址空间"]],
    ["3  三部曲", ["3.1 斐波那契：重叠子问题 → 记忆化", "3.2 汉诺塔：指数复杂度的实感", "3.3 全排列：回溯模板"]],
    ["4–5  分治与调试", ["4 分治：快速幂 · 二分查找 · gcd", "5 打印调用树、可视化、常见错误", "本周作业 · 思考题 · 小结"]],
  ];
  cols.forEach((c, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.15, 2.85, 3.9, i === 1 ? C.cream : C.code);
    text(s, c[0], x + 0.2, 1.3, 2.5, 0.45, { fontSize: 16.5, bold: true, color: C.dark, margin: 0 });
    bullets(s, c[1], x + 0.15, 1.95, 2.6, 3.0, { fontSize: 11.5, gap: 10 });
  });
}

// ============================ PART 1 ============================
sectionSlide("Part 1", "什么是递归", "函数在自己的定义中调用自己\n三法则 · 相信它 · 递归 ⇄ 迭代");

// 1.1 definition + three rules
{
  const s = content("1.1", "1 什么是递归", "递归：函数调用自己 + 三法则");
  codeBlock(s, `def factorial(n):
    if n <= 1:              # 基例（base case）
        return 1
    return n * factorial(n - 1)   # 递归调用，向基例逼近


print(factorial(5))         # 120`, 0.5, 1.1, 5.6, 2.0, { fontSize: 11, lang: "py" });
  consoleBlock(s, "120", 6.3, 1.1, 3.15, 0.7);
  callout(s, "递归三法则", [
    "**必须有基例**——不再递归的终止条件；",
    "**必须改变状态并向基例逼近**——否则永远到不了终点；",
    "**必须调用自身**。",
  ], 6.3, 1.95, 3.15, 2.0, { fontSize: 11, gap: 6 });
  callout(s, "缺一不可", "三条缺一，就是死循环——Python 里表现为 `RecursionError`。", 0.5, 3.35, 9.0, 0.75, { fontSize: 12, fill: "FDF0EE", tcolor: C.bad });
}

// 1.2 think, don't unroll
{
  const s = content("1.2", "1 递归的思维方式", "相信它：只回答两个问题");
  callout(s, "写递归时不要在脑子里展开每一层", [
    "**最小的情况怎么办？**（基例）",
    "**假设「更小的问题已经解决了」，怎么用它拼出当前问题的答案？**",
  ], 0.5, 1.05, 9.0, 1.15, { fontSize: 13, gap: 6 });
  codeBlock(s, `def list_sum(a):
    if not a:               # 1) 空数组和为 0
        return 0
    return a[0] + list_sum(a[1:])   # 2) 首元素 + 剩下的和


print(list_sum([1, 3, 5, 7, 9]))    # 25`, 0.5, 2.4, 4.35, 1.85, { fontSize: 9.8, lang: "py" });
  codeBlock(s, `def list_sum2(a, i=0):
    return (0 if i == len(a)
            else a[i] + list_sum2(a, i + 1))


print(list_sum2([1, 3, 5, 7, 9]))   # 25`, 4.99, 2.4, 4.51, 1.85, { fontSize: 9.8, lang: "py" });
  callout(s, "⚠️ 例子求和的时间复杂度", "左边每层都做 `a[1:]` 切片（O(n)），整体 **O(n²)**。实战里用**下标**而不是切片——右边改成 O(n) 的方式，用一个下标 `i` 代替真的切一刀。", 0.5, 4.28, 9.0, 0.75, { fontSize: 10, lsm: 1.0, fill: C.mint, tcolor: C.dark });
}

// 1.3 recursion <-> iteration
{
  const s = content("1.3", "1 递归 ⇄ 迭代", "任何递归都能改写成迭代（用显式栈）");
  codeBlock(s, `# 递归版
def to_base_rec(n, base):
    digits = "0123456789ABCDEF"
    if n < base:
        return digits[n]
    return to_base_rec(n // base, base) + digits[n % base]`, 0.5, 1.1, 5.6, 1.45, { fontSize: 10, lang: "py" });
  codeBlock(s, `# 迭代版（显式栈）
def to_base_iter(n, base):
    digits = "0123456789ABCDEF"
    if n == 0:
        return "0"
    stack = []
    while n:
        stack.append(digits[n % base])
        n //= base
    return ''.join(reversed(stack))`, 0.5, 2.65, 5.6, 1.72, { fontSize: 10, lang: "py" });
  consoleBlock(s, "to_base_rec(233, 16), to_base_iter(233, 16)\n-> E9 E9", 0.5, 4.45, 5.6, 0.55, 9);
  callout(s, "选哪个", [
    "递归代码短、更贴近问题的**数学定义**；",
    "迭代**没有深度限制**、常数更小。",
  ], 6.3, 1.1, 3.15, 1.5, { fontSize: 11.5, gap: 6 });
  callout(s, "经验法则", "**能写成简单循环的，就别用递归。**", 6.3, 2.75, 3.15, 0.95, { fontSize: 12.5, fill: "FDF0EE", tcolor: C.bad });
}

// ============================ PART 2 ============================
sectionSlide("Part 2", "栈帧：递归为什么会爆栈", "系统调用栈 · 递归深度的两道墙 · 进程虚拟地址空间");

// 2.1 call stack
{
  const s = content("2.1", "2 栈帧", "每次函数调用都压入一个栈帧");
  text(s, "运行时保存参数、局部变量和返回地址；函数返回时弹出。跟踪 `factorial(3)`：", 0.5, 1.05, 9, 0.4, { fontSize: 12.5 });
  const rows = [
    ["调用 factorial(3)", ["f(3)"], "开始"],
    ["调用 factorial(2)", ["f(3)", "f(2)"], "向下压栈"],
    ["调用 factorial(1)", ["f(3)", "f(2)", "f(1)"], "到达基例"],
    ["f(1) 返回 1", ["f(3)", "f(2)"], "弹出 f(1)"],
    ["f(2) 返回 2*1=2", ["f(3)"], "弹出 f(2)"],
    ["f(3) 返回 3*2=6", [], "弹出 f(3)，栈空"],
  ];
  rows.forEach((r, i) => {
    const y = 1.55 + i * 0.46;
    text(s, r[0], 0.5, y, 3.1, 0.38, { fontSize: 11, valign: "middle", margin: 0 });
    for (let k = 0; k < 3; k++) {
      const has = k < r[1].length;
      card(s, 3.9 + k * 0.75, y + 0.01, 0.68, 0.34, has ? C.mint : "F2F5F3");
      if (has) text(s, r[1][k], 3.9 + k * 0.75, y + 0.01, 0.68, 0.34, { fontSize: 10, bold: true, color: C.dark, align: "center", valign: "middle", margin: 0 });
    }
    text(s, r[2], 6.35, y, 2.8, 0.38, { fontSize: 10.5, color: C.muted, valign: "middle", margin: 0 });
  });
  callout(s, "递归 = 在用系统栈", "栈的空间有限，递归太深就会溢出。", 0.5, 4.32, 9.0, 0.55, { fontSize: 11, lsm: 1.0, fill: C.mint, tcolor: C.dark });
}

// 2.2 two walls
{
  const s = content("2.2", "2 递归深度限制", "其实有两道墙");
  codeBlock(s, `import sys

print(sys.getrecursionlimit())      # 默认 1000
sys.setrecursionlimit(1 << 20)      # OJ 上深递归的常见写法`, 0.5, 1.05, 9.0, 1.05, { fontSize: 11, lang: "py" });
  table(s, [
    ["", "是什么", "撞上去会怎样", "setrecursionlimit 管得到吗"],
    [{ t: "墙一", bold: true }, "解释器自己数的嵌套层数", "抛 RecursionError，看得懂", { t: "✓ 管得到", color: C.ok, bold: true }],
    [{ t: "墙二", bold: true }, "C 调用栈（主线程通常 8 MB）", "段错误，进程直接死", { t: "✗ 管不到", color: C.bad, bold: true }],
  ], 0.5, 2.3, 9.0, [0.8, 3.0, 2.9, 2.3], { fontSize: 11.5, rowH: 0.55 });
  callout(s, "墙一本来是护栏", "让你在真正撞墙之前，先收到一个能看懂的异常。`setrecursionlimit(1 << 20)` 把护栏挪远了，**墙二一动没动**——调大限制只解除了 Python 层的检查，C 栈仍然有限。", 0.5, 4.05, 9.0, 1.05, { fontSize: 11.5 });
}

// 2.2 3.11 changes
{
  const s = content("2.2", "2 递归深度限制", "CPython 3.11 之后，两道墙的位置变了");
  callout(s, "两处变化", [
    "**3.11 起**，「Python 函数调 Python 函数」在解释器主循环内部展开，**不再占用 C 栈**；",
    "**3.12** 又给「确实要走 C 的递归」另设了一道上限，这道上限 **`setrecursionlimit` 管不到**。",
  ], 0.5, 1.05, 9.0, 1.35, { fontSize: 12.5, gap: 8 });
  text(s, "本机实测（CPython 3.12.3 / Linux，`setrecursionlimit(1 << 20)` 之后）：", 0.5, 2.5, 9, 0.32, { fontSize: 11.5 });
  table(s, [
    ["递归形状", "最深能到", "加大线程栈到 64 MB 有用吗"],
    ["纯 Python 递归", { t: "30 万层照跑（连 32 KB 的线程栈都够）", color: C.ok }, "没有区别"],
    ["递归穿过 C 代码（如 @lru_cache）", { t: "3331 层封顶，抛 RecursionError", color: C.bad }, { t: "没用，还是 3331", color: C.bad }],
  ], 0.5, 2.9, 9.0, [3.0, 3.6, 2.4], { fontSize: 10.8, rowH: 0.46 });
  callout(s, "别当成语言规范", "这两行数字是**某个环境下的实测值**，换 Python 版本、换评测机都可能不同——这恰恰是不该依赖它的理由。", 0.5, 4.35, 9.0, 0.5, { fontSize: 9.5, lsm: 1.0, fill: "FDF0EE", tcolor: C.bad });
}

// 2.2 through C
{
  const s = content("2.2", "2 递归深度限制", "什么叫「递归穿过 C 代码」");
  text(s, "只要递归的调用链中间夹了一层 C 实现的东西，就会掉进墙二。常见的有：", 0.5, 1.05, 9, 0.4, { fontSize: 12.5 });
  bullets(s, [
    "**`@lru_cache` / `@cache` 的记忆化搜索**（§3.1 本周就在教，也是最常踩的）；",
    "`repr()` / `print()` 一个深度嵌套的列表；",
    "`sorted(key=...)`、`min/max(key=...)` 里调用递归函数；",
    "`re` 的回溯匹配、`copy.deepcopy`、`json.dumps`、`pickle.dumps`。",
  ], 0.5, 1.6, 9.0, 1.8, { fontSize: 13, gap: 10 });
  callout(s, "想自己量一量：二分探深度", "用 `probe(make)`：二分出 `make()` 造出来的递归函数最深能跑到几层——下一页看结果。", 0.5, 3.6, 9.0, 1.3, { fontSize: 12.5, fill: C.mint, tcolor: C.dark });
}

// 2.2 probe code
{
  const s = content("2.2", "2 递归深度限制", "二分探测：纯递归 vs 穿过 lru_cache");
  codeBlock(s, `def probe(make):
    """二分出 make() 造出来的递归函数最深能跑到几层。"""
    lo, hi = 1, 100000
    while lo < hi:
        mid = (lo + hi + 1) // 2
        f = make()
        try:
            f(mid); lo = mid
        except RecursionError:
            hi = mid - 1
    return lo

def plain():
    def f(n): return 0 if n == 0 else 1 + f(n - 1)
    return f

def cached():
    @functools.lru_cache(maxsize=None)
    def f(n): return 0 if n == 0 else 1 + f(n - 1)
    return f`, 0.5, 1.05, 5.7, 3.75, { fontSize: 9.3, lang: "py" });
  consoleBlock(s, "纯 Python 递归 : 100000\n（就是探测上界，说明根本没撞墙）\n\n经 lru_cache   : 3331\n（撞的是墙二，调多大限制都没用）", 6.35, 1.05, 3.15, 3.75, 10.5);
}

// 2.2 threading trick
{
  const s = content("2.2", "2 递归深度限制", "那段线程写法还要不要写");
  codeBlock(s, `def main():
    sys.setrecursionlimit(1 << 20)
    # ... 深递归代码 ...

threading.stack_size(1 << 26)   # 64 MB：只对「吃 C 栈」的递归有意义
t = threading.Thread(target=main)
t.start(); t.join()`, 0.5, 1.05, 9.0, 1.55, { fontSize: 11, lang: "py" });
  table(s, [
    ["环境 / 递归形状", "这招有效吗"],
    ["CPython ≤ 3.10，任意递归", { t: "有效——每层调用真的压 C 栈", color: C.ok }],
    ["CPython 3.11+，纯 Python 递归", { t: "没必要——本来就不吃 C 栈", color: C.muted }],
    ["穿过 C 的递归（lru_cache 那类）", { t: "没用——实测加到 64 MB 仍是 3331 层", color: C.bad }],
  ], 0.5, 2.65, 9.0, [4.5, 4.5], { fontSize: 11, rowH: 0.4 });
  callout(s, "别把它当护身符", "它能不能救你，取决于评测机装的是哪个版本、你的递归是哪种形状——这两件事你都控制不了。", 0.5, 4.32, 9.0, 0.5, { fontSize: 9.5, lsm: 1.0, fill: "FDF0EE", tcolor: C.bad });
}

// 2.2 explicit stack
{
  const s = content("2.2", "2 递归深度限制", "唯一与版本、评测机都无关的做法：改写成迭代");
  codeBlock(s, `def depth_rec(n):
    return 0 if n == 0 else 1 + depth_rec(n - 1)

def depth_iter(n):
    """同一件事的显式栈版本：深度只受内存限制。"""
    total = 0
    stack = [n]
    while stack:
        k = stack.pop()
        if k:
            total += 1
            stack.append(k - 1)
    return total`, 0.5, 1.05, 5.7, 2.55, { fontSize: 10.5, lang: "py" });
  consoleBlock(s, "depth_rec(3000), depth_iter(3000)\n-> 3000 3000  （小深度上两者一致）\n\ndepth_iter(10**6)\n-> 1000000    （递归版到不了这里）", 6.35, 1.05, 3.15, 2.55, 10.5);
  callout(s, "深递归题的可靠解法只有一个：显式栈", "用显式栈把递归摊平，深度就只受**堆内存**限制，既绕开墙一，也绕开墙二。`setrecursionlimit` 和 `threading.stack_size` 都是「看运气」的补丁，而且失败的方式（段错误 / RE）恰恰是最难在考场上诊断的那一种。", 0.5, 3.8, 9.0, 1.25, { fontSize: 11.5, fill: C.mint, tcolor: C.dark });
}

// 2.3 virtual address space
{
  const s = content("2.3", "2 进程的虚拟地址空间", "栈从哪儿来？");
  const layers = [
    ["内核区", "F2F5F3", C.muted],
    ["栈 Stack  ← 函数调用帧，向下增长", C.code, C.dark],
    ["堆 Heap  ← 动态分配的对象，向上增长", C.mint, C.dark],
    ["全局 / 静态数据", "F2F5F3", C.muted],
    ["代码段 Text", "F2F5F3", C.muted],
  ];
  text(s, "高地址", 0.5, 1.05, 1.3, 0.3, { fontSize: 10.5, color: C.muted });
  layers.forEach((l, i) => {
    const y = 1.4 + i * 0.62;
    card(s, 1.9, y, 4.6, 0.54, l[1], C.green);
    text(s, l[0], 1.9, y, 4.6, 0.54, { fontSize: 12, bold: true, color: l[2], align: "center", valign: "middle", margin: 0 });
  });
  text(s, "低地址", 0.5, 1.4 + 5 * 0.62 - 0.05, 1.3, 0.3, { fontSize: 10.5, color: C.muted });
  callout(s, "栈 vs 堆", [
    "**栈**：自动管理，容量小（通常 8 MB），深递归撑爆的就是它；",
    "**堆**：手动 / GC 管理，容量大，Python 的列表、字典都在这儿。",
  ], 6.75, 1.4, 2.75, 1.8, { fontSize: 11, gap: 8 });
  callout(s, "「虚拟」的含义", "每个进程都以为自己独占整个地址空间，实际由操作系统 + MMU 映射到物理内存——这就是为什么两个程序都能用地址 `0x1000` 而不冲突。", 6.75, 3.35, 2.75, 1.85, { fontSize: 10.5, fill: C.mint, tcolor: C.dark });
}

// ============================ PART 3 ============================
sectionSlide("Part 3", "递归三部曲", "斐波那契：重叠子问题 → 记忆化\n汉诺塔：指数复杂度的实感\n全排列：回溯模板");

// 3.1 fibonacci naive
{
  const s = content("3.1", "3.1 序曲：斐波那契", "02753: 菲波那契数列");
  text(s, "cs101.openjudge.cn/practice/02753 —— 定义：F(1) = F(2) = 1，F(n) = F(n−1) + F(n−2)。", 0.5, 1.05, 9, 0.35, { fontSize: 12 });
  codeBlock(s, `def fib_naive(n):
    if n <= 2:
        return 1
    return fib_naive(n - 1) + fib_naive(n - 2)


print(fib_naive(10))        # 55`, 0.5, 1.55, 5.6, 1.8, { fontSize: 11, lang: "py" });
  consoleBlock(s, "55", 6.3, 1.55, 3.15, 0.6);
  callout(s, "问题：这是 O(2ⁿ)", "同一个子问题被重复计算无数次——下一页画出这棵调用树。", 6.3, 2.35, 3.15, 1.0, { fontSize: 11.5, fill: "FDF0EE", tcolor: C.bad });
}

// 3.1 recursion tree
{
  const s = content("3.1", "3.1 为什么慢", "重叠子问题：fib(5) 的调用树");
  const nodes = [
    ["fib(5)", 4.1, 1.15, C.dark, C.white],
    ["fib(4)", 2.3, 1.85, C.code, C.dark], ["fib(3)", 5.9, 1.85, "FDF0EE", C.bad],
    ["fib(3)", 1.1, 2.55, "FDF0EE", C.bad], ["fib(2)", 3.5, 2.55, C.mint, C.dark], ["fib(2)", 5.0, 2.55, C.mint, C.dark], ["fib(1)", 6.8, 2.55, C.mint, C.dark],
    ["fib(2)", 0.5, 3.25, C.mint, C.dark], ["fib(1)", 1.7, 3.25, C.mint, C.dark],
  ];
  nodes.forEach((n) => { pill(s, n[0], n[1], n[2], 0.85, 0.42, n[3], n[4], 11); });
  const edges = [[4.5, 1.57, 2.7, 1.85], [4.55, 1.57, 6.15, 1.85], [2.65, 2.27, 1.4, 2.55], [2.7, 2.27, 3.85, 2.55], [6.15, 2.27, 5.35, 2.55], [6.4, 2.27, 6.9, 2.55], [1.45, 2.97, 0.85, 3.25], [1.5, 2.97, 2.0, 3.25]];
  edges.forEach((e) => s.addShape(pres.shapes.LINE, { x: e[0], y: e[1], w: e[2] - e[0], h: e[3] - e[1], line: { color: C.muted, width: 1 } }));
  text(s, "fib(3) 算了 2 次，fib(2) 算了 3 次——问题规模越大，重复越多。", 0.5, 3.9, 9, 0.4, { fontSize: 12 });
  callout(s, "看到重复的子树，就该上记忆化", "把「算过的答案」存起来，下次直接查表——这就是下一页的三种修法。", 0.5, 4.4, 9.0, 0.65, { fontSize: 12, fill: C.mint, tcolor: C.dark });
}

// 3.1 three fixes
{
  const s = content("3.1", "3.1 三种修法", "记忆化 · 迭代递推 · 自底向上填表");
  codeBlock(s, `from functools import lru_cache

@lru_cache(maxsize=None)          # 修法一：记忆化，O(n)
def fib_memo(n):
    if n <= 2: return 1
    return fib_memo(n - 1) + fib_memo(n - 2)

def fib_iter(n):                  # 修法二：迭代递推，O(n)、O(1) 空间
    a, b = 1, 1
    for _ in range(n - 2):
        a, b = b, a + b
    return b if n >= 2 else 1

def fib_dp(n):                    # 修法三：自底向上填表，O(n)
    if n <= 2: return 1
    dp = [0] * (n + 1); dp[1] = dp[2] = 1
    for i in range(3, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]`, 0.5, 1.05, 6.3, 3.65, { fontSize: 9.6, lang: "py" });
  consoleBlock(s, "fib_memo(50), fib_iter(50), fib_dp(50)\n-> 12586269025\n   12586269025\n   12586269025\n（三者一致）", 6.95, 1.05, 2.55, 1.7, 9.5);
  callout(s, "最划算的一行代码", "`lru_cache` 一个装饰器把指数降成线性。但它要求参数**可哈希**（不能传 list），且缓存会一直占内存。另见 M02786 Pell 数列，同一套路。", 6.95, 2.9, 2.55, 1.8, { fontSize: 10, fill: C.mint, tcolor: C.dark });
}

// 3.2 hanoi setup
{
  const s = content("3.2", "3.2 第一部：汉诺塔", "04147: 汉诺塔问题 (Tower of Hanoi)");
  callout(s, "题意", "把 n 个盘子从 A 柱移到 C 柱，借助 B 柱；每次只能移一个，大盘不能压在小盘上。", 0.5, 1.05, 9.0, 0.7, { fontSize: 12.5 });
  callout(s, "递归思路（三步）", [
    "把上面 **n−1** 个盘从 A 移到 B（借助 C）；",
    "把**最大的第 n 个**盘从 A 移到 C；",
    "把 **n−1** 个盘从 B 移到 C（借助 A）。",
  ], 0.5, 1.9, 9.0, 1.2, { fontSize: 12.5, gap: 4 });
  codeBlock(s, `def hanoi(n, src, aux, dst, moves):
    if n == 0:
        return
    hanoi(n - 1, src, dst, aux, moves)      # 1) n-1 个到辅助柱
    moves.append(f"{n}:{src}->{dst}")       # 2) 最大的一个到目标柱
    hanoi(n - 1, aux, src, dst, moves)      # 3) n-1 个从辅助柱到目标柱`, 0.5, 3.25, 9.0, 1.35, { fontSize: 10.5, lang: "py" });
}

// 3.2 hanoi trace + count
{
  const s = content("3.2", "3.2 汉诺塔", "跑一遍 hanoi(3, ...) + 移动次数公式");
  codeBlock(s, `moves = []
hanoi(3, 'A', 'B', 'C', moves)
print(len(moves))
for m in moves: print(m)`, 0.5, 1.05, 4.2, 1.15, { fontSize: 10, lang: "py" });
  consoleBlock(s, "7\n1:A->C\n2:A->B\n1:C->B\n3:A->C\n1:B->A\n2:B->C\n1:A->C", 4.85, 1.05, 2.3, 1.85, 9.5);
  callout(s, "移动次数", "T(n) = 2T(n−1) + 1，T(1) = 1  ⟹  **T(n) = 2ⁿ − 1**", 7.3, 1.05, 2.2, 1.15, { fontSize: 10.5, fill: C.mint, tcolor: C.dark });
  codeBlock(s, `def hanoi_count(n):
    return (1 << n) - 1

print([hanoi_count(k) for k in range(1, 8)])`, 0.5, 3.05, 5.6, 1.15, { fontSize: 10.5, lang: "py" });
  consoleBlock(s, "[1, 3, 7, 15, 31, 63, 127]", 6.3, 3.05, 3.15, 0.6);
  callout(s, "指数复杂度的实感", "传说中的 64 层汉诺塔需要 2⁶⁴−1 ≈ 1.8×10¹⁹ 次移动。每秒一次，需要约 **5850 亿年**。", 0.5, 4.35, 9.0, 0.7, { fontSize: 11.5, fill: "FDF0EE", tcolor: C.bad });
}

// 3.3 permutations
{
  const s = content("3.3", "3.3 第二部：全排列", "02748: 全排列");
  codeBlock(s, `def permutations(a):
    res, used, path = [], [False] * len(a), []
    def dfs():
        if len(path) == len(a):
            res.append(path[:])       # 必须拷贝，否则存的是同一个列表
            return
        for i in range(len(a)):
            if used[i]: continue
            used[i] = True; path.append(a[i])
            dfs()
            path.pop(); used[i] = False    # 回溯：撤销选择
    dfs()
    return res

for p in permutations([1, 2, 3]):
    print(''.join(map(str, p)), end=' ')`, 0.5, 1.05, 5.7, 3.1, { fontSize: 9.8, lang: "py" });
  consoleBlock(s, "123 132 213 231 312 321", 6.35, 1.05, 3.15, 0.55, 10.5);
  callout(s, "三个必须记住的细节", [
    "`res.append(path[:])`——**不拷贝就全是同一个空列表**；",
    "`path.pop()` 与 `used[i]=False`——**回溯要把状态还原**；",
    "复杂度 **O(n! · n)**，n ≤ 10 才可行（第 4 周的范围表）。",
  ], 6.35, 1.8, 3.15, 2.35, { fontSize: 10.3, gap: 6 });
}

// 3.3 itertools
{
  const s = content("3.3", "3.3 全排列", "Python 内建也提供全排列");
  codeBlock(s, `from itertools import permutations as it_perm

print([''.join(map(str, p)) for p in it_perm([1, 2, 3])])
# ['123', '132', '213', '231', '312', '321']`, 0.5, 1.1, 9.0, 1.15, { fontSize: 11.5, lang: "py" });
  callout(s, "但考试要会手写", "第 9 周的回溯（八皇后、组合、子集）全建立在 `dfs` 这个模板上——「选择 → 递归 → 撤销」三步，itertools 帮不了你现场推导。", 0.5, 2.5, 9.0, 1.0, { fontSize: 13, fill: "FDF0EE", tcolor: C.bad });
}

// ============================ PART 4 ============================
sectionSlide("Part 4", "分治：递归的另一种用法", "分成子问题 → 治（递归解决）→ 合并答案\n归并排序 · 快速排序 · 二分查找 · 快速幂");

// 4.0 divide and conquer table
{
  const s = content("4", "4 分治", "分（Divide）→ 治（Conquer）→ 合（Combine）");
  table(s, [
    ["算法", "分", "合", "复杂度"],
    ["归并排序", "对半切", "合并两个有序表", "O(n log n)"],
    ["快速排序", "按 pivot 划分", "无需合并", "平均 O(n log n)"],
    ["二分查找", "只保留半边", "无需合并", "O(log n)"],
    ["快速幂", "指数减半", "相乘", "O(log n)"],
  ], 0.5, 1.3, 9.0, [2.0, 2.6, 2.6, 1.8], { fontSize: 13, rowH: 0.5 });
  callout(s, "本节讲后两个", "归并、快排留到第 6、7 周排序专题——这里聚焦「分治」这个**思维模式**本身：快速幂与二分查找。", 0.5, 3.95, 9.0, 0.9, { fontSize: 12.5 });
}

// 4.1 fast pow
{
  const s = content("4.1", "4.1 快速幂", "指数减半：O(log b) 求 aᵇ");
  codeBlock(s, `def fast_pow(a, b, mod=None):
    """计算 a^b（可选取模），O(log b)。"""
    if b == 0:
        return 1 % mod if mod else 1
    half = fast_pow(a, b // 2, mod)
    res = half * half
    if b & 1:
        res *= a
    return res % mod if mod else res`, 0.5, 1.1, 5.6, 2.15, { fontSize: 11, lang: "py" });
  consoleBlock(s, "fast_pow(2, 10) -> 1024\nfast_pow(3, 100, 1e9+7) -> 886041711\npow(3, 100, 1e9+7)      -> 886041711", 6.3, 1.1, 3.15, 2.15, 9.5);
  callout(s, "内建就是快速幂", "Python 内建的 `pow(a, b, mod)` 就是快速幂，直接用即可——手写一遍是为了看懂「指数减半」这个分治思路。", 0.5, 3.45, 9.0, 0.75, { fontSize: 12, fill: C.mint, tcolor: C.dark });
}

// 4.2 binary search
{
  const s = content("4.2", "4.2 二分查找", "只保留半边，O(log n)");
  codeBlock(s, `def binary_search(a, target):
    lo, hi = 0, len(a) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if a[mid] == target: return mid
        if a[mid] < target: lo = mid + 1
        else: hi = mid - 1
    return -1

a = [1, 3, 5, 7, 9, 11]
print(binary_search(a, 7), binary_search(a, 4))   # 3 -1`, 0.5, 1.05, 9.0, 2.05, { fontSize: 10.5, lang: "py" });
  text(s, "求「第一个 ≥ target 的位置」（更常用的形态）：", 0.5, 3.14, 9, 0.28, { fontSize: 11.5 });
  codeBlock(s, `import bisect
def lower_bound(a, target):
    lo, hi = 0, len(a)
    while lo < hi:
        mid = (lo + hi) // 2
        if a[mid] < target: lo = mid + 1
        else: hi = mid
    return lo

a = [1, 3, 5, 7, 9]
print(lower_bound(a, 5), bisect.bisect_left(a, 5))   # 2 2`, 0.5, 3.44, 5.6, 1.58, { fontSize: 8.6, lang: "py" });
  callout(s, "模板选择", "`lo < hi` + `hi = mid` 这一版**不会死循环，也不会漏边界**。建议只记这一版；需要「最后一个 ≤ target」时用 `lower_bound(a, target+1) - 1`。", 6.3, 3.44, 3.15, 1.35, { fontSize: 9.3, lsm: 1.0, fill: C.mint, tcolor: C.dark });
}

// 4.3 gcd
{
  const s = content("4.3", "4.3 最大公约数", "03248: 最大公约数 —— 辗转相除");
  codeBlock(s, `def gcd(a, b):
    return a if b == 0 else gcd(b, a % b)

def lcm(a, b):
    return a // gcd(a, b) * b        # 先除后乘，避免溢出

print(gcd(12, 18), lcm(4, 6))        # 6 12`, 0.5, 1.1, 5.6, 1.7, { fontSize: 11, lang: "py" });
  consoleBlock(s, "6 12", 6.3, 1.1, 3.15, 0.6);
  callout(s, "为什么 gcd(a,b) = gcd(b, a%b)", "a 和 b 的公约数集合，与 b 和 a mod b 的公约数集合完全相同——因为 a = kb + r，任何同时整除 b 和 r 的数也整除 a。", 0.5, 3.05, 9.0, 1.0, { fontSize: 12, fill: C.mint, tcolor: C.dark });
}

// ============================ PART 5 ============================
sectionSlide("Part 5", "递归的调试", "打印调用树 · 可视化 · 常见错误");

// 5.1 print call tree
{
  const s = content("5.1", "5.1 打印调用树", "缩进就是栈深度");
  codeBlock(s, `def fib_trace(n, depth=0):
    print("  " * depth + f"fib({n})")
    if n <= 2:
        return 1
    return fib_trace(n - 1, depth + 1) + fib_trace(n - 2, depth + 1)


fib_trace(4)`, 0.5, 1.1, 5.6, 2.0, { fontSize: 10.5, lang: "py" });
  consoleBlock(s, "fib(4)\n  fib(3)\n    fib(2)\n    fib(1)\n  fib(2)", 6.3, 1.1, 3.15, 1.75, 11);
  callout(s, "看到重复的子树，就该上记忆化", "调用树里 `fib(2)` 出现了不止一次——这正是 §3.1 里「重叠子问题」的直接证据。", 0.5, 3.3, 9.0, 0.85, { fontSize: 12, fill: C.mint, tcolor: C.dark });
}

// 5.2/5.3 visualization + errors
{
  const s = content("5.2", "5.2–5.3 可视化与常见错误", "pythontutor.com 逐步展示栈帧");
  callout(s, "推荐工具", "pythontutor.com 能逐步展示栈帧的压入与弹出——理解递归最快的工具，强烈建议把 `factorial(4)` 和 `hanoi(3,...)` 各跑一遍。", 0.5, 1.05, 9.0, 0.85, { fontSize: 12.5 });
  table(s, [
    ["症状", "原因"],
    ["RecursionError", "没有基例，或没向基例逼近"],
    ["结果全一样", "收集答案时忘了 `path[:]` 拷贝"],
    ["结果多了 / 少了", "忘了回溯（`pop` / 状态还原）"],
    ["TLE", "有重叠子问题却没记忆化"],
    ["RE（评测机上，且没有 traceback）", "递归太深撞穿 C 栈（§2.2 墙二）"],
  ], 0.5, 2.1, 9.0, [4.0, 5.0], { fontSize: 12, rowH: 0.5 });
}

// Homework table
{
  const s = content("§", "本周作业", "10 道题：从记忆化到回溯模板");
  table(s, [
    ["#", "题目", "编号", "考点"],
    ["1", "菲波那契数列", { t: "02753", mono: true }, "递归 + 记忆化"],
    ["2", "Pell 数列", { t: "M02786", mono: true }, "递推"],
    ["3", "汉诺塔问题(Tower of Hanoi)", { t: "04147", mono: true }, "递归三步"],
    ["4", "全排列", { t: "02748", mono: true }, "回溯模板"],
    ["5", "最大公约数", { t: "03248", mono: true }, "辗转相除"],
    ["6", "递归比较字符串大小", { t: "28717", mono: true }, "递归定义"],
    ["7", "放苹果", { t: "01664", mono: true }, "递归计数"],
    ["8", "简单的整数划分问题", { t: "04117", mono: true }, "递归 + 记忆化"],
    [{ t: "9*", color: C.goldText }, "Help Jimmy", { t: "T01661", mono: true }, "递归 + 记忆化（难）"],
    [{ t: "10*", color: C.goldText }, "汉诺塔的移动次数", "—", "用 `2**n-1` 验证 §3.2 的推导"],
  ], 0.5, 1.0, 9.0, [0.6, 3.5, 1.7, 3.2], { fontSize: 11, rowH: 0.33 });
  text(s, "* 选做。编号前带字母：cs101.openjudge.cn。", 0.5, 4.78, 9, 0.28, { fontSize: 10, color: C.muted, margin: 0 });
}

// Thinking questions
{
  const s = content("?", "思考题", "五道思考题");
  const qs = [
    ["调用次数", "`fib_naive(n)` 一共调用了多少次自身？（提示：与 F(n) 本身同阶）"],
    ["复杂度", "为什么 `list_sum(a[1:])` 是 O(n²)？改成传下标后是多少？"],
    ["数学归纳", "汉诺塔 T(n) = 2T(n−1) + 1，用数学归纳法证明 T(n) = 2ⁿ − 1。"],
    ["溢出", "二分查找的 `mid = (lo+hi)//2` 在 C++ 里可能溢出，应该怎么写？Python 为什么不用担心？"],
    ["改写", "把汉诺塔改写成非递归版本（用显式栈），验证移动序列与递归版完全一致。"],
  ];
  qs.forEach((q, i) => {
    const x = 0.5 + (i % 2) * 4.6, y = 1.05 + Math.floor(i / 2) * 1.38;
    card(s, x, y, 4.4, 1.28, i % 2 === 0 ? C.code : C.cream);
    numCircle(s, i + 1, x + 0.18, y + 0.15, 0.38, C.dark);
    text(s, q[0], x + 0.68, y + 0.13, 3.6, 0.36, { fontSize: 13, bold: true, color: C.dark, valign: "middle", margin: 0 });
    s.addText(runs(q[1], { color: C.text }), { x: x + 0.2, y: y + 0.55, w: 4.0, h: 0.68, fontFace: FONT, fontSize: 10, margin: 0, isTextBox: true, valign: "top" });
  });
}

summarySlide("本周小结", [
  ["三法则", "**有基例、向基例逼近、调用自身**。写的时候只想两层，不要在脑子里展开。"],
  ["两道墙", "Python 层计数器（`setrecursionlimit` 管得到）和 **C 调用栈**（管不到）；穿过 C 的递归另有一道调不动的上限。**深递归唯一可靠的解法是显式栈**。"],
  ["三部曲", "**斐波那契**（重叠子问题 → 记忆化）、**汉诺塔**（2ⁿ−1，指数的实感）、**全排列**（回溯模板：选择 → 递归 → 撤销）。"],
  ["分治", "分 + 治 + 合：归并、快排、二分、快速幂。"],
  ["回溯两个必犯错误", "**忘拷贝**（`path[:]`）、**忘还原**（`pop`）。"],
]);

// Next week
sectionSlide("下周预告", "递归、回溯与并查集", "把递归用到底——回溯（八皇后、马走日、组合与子集）\n与并查集");

  await D.save(OUT);
})().catch((e) => { console.error(e); process.exit(1); });

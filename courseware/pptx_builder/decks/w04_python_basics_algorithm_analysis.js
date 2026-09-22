// 第 4 周 计算机基础、Python 基础与算法分析入门 —— 由 202609_ADS_W04_Python_Basics_Algorithm_Analysis.md 整理成的讲课 PPT。
// 生成：cd courseware/pptx_builder && node decks/w04_python_basics_algorithm_analysis.js ../202609_ADS_W04_Python_Basics_Algorithm_Analysis.pptx
// 页上所有的运行结果都在 Python 3.12 下实跑核对过；改代码时连同结果一起改。
const path = require("path");
const { createDeck } = require("../lib");

const OUT = process.argv[2] || path.join(__dirname, "..", "out", "202609_ADS_W04_Python_Basics_Algorithm_Analysis.pptx");

(async () => {
  const D = createDeck({ title: "计算概论（B）第 4 周 计算机基础、Python 基础与算法分析入门", author: "Hongfei Yan" });
  const {
    pres, C, FONT, MONO, runs, text, bullets, card, codeBlock, consoleBlock, callout, table,
    cells, arrowLabel, pill, numCircle, titleSlide, sectionSlide, content, summarySlide,
  } = D;

// ---- slides（顶层不缩进，避免改动模板字符串里的代码缩进）----
// =====================================================================
// Cover
titleSlide({
  kicker: "计算概论（B） · 第 4 周 · 2026 Fall",
  title: "算法分析入门",
  subtitle: "Python 基础补齐 · 大 O 与常数优化",
  topics: "函数、可变 / 不可变对象、浅拷贝与深拷贝、异常处理\nlist / tuple / set / dict 四种容器与操作复杂度\n大 O 记号、常见复杂度级别、从数据范围倒推算法\n常数优化：快速 IO、埃氏筛 · 调试方法与考场纪律",
  footer: "Compiled by Hongfei Yan · 2026 Fall · github.com/GMyhf/2026fall-cs101",
});

// Three questions
{
  const s = content("?", "本周导引", "本周要回答三个问题");
  const qs = [
    ["list 明明能用，为什么会 TLE？", "四种容器**操作复杂度不同**：`in`、`pop(0)` 用错地方，O(n) 就悄悄变成了 O(n²)。"],
    ["n ≤ 10 和 n ≤ 10⁶，该想一样的算法吗？", "**大 O** 描述增长趋势；看到数据范围就能**倒推**能用什么复杂度。"],
    ["复杂度已经最优，还能更快吗？", "**常数优化**：快速 IO、少做重复计算、用内建函数——但顺序不能颠倒。"],
  ];
  qs.forEach((q, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.15, 2.85, 2.55, C.code);
    numCircle(s, i + 1, x + 0.2, 1.32, 0.46, C.dark);
    text(s, q[0], x + 0.2, 1.92, 2.5, 0.75, { fontSize: 13.5, bold: true, color: C.dark, margin: 0 });
    text(s, q[1], x + 0.2, 2.7, 2.5, 0.9, { fontSize: 11, margin: 0, lsm: 1.2 });
  });
  card(s, 0.5, 3.95, 9.0, 1.1, C.dark);
  text(s, "一句话概括", 0.75, 4.05, 3, 0.3, { fontSize: 11, bold: true, color: C.gold, margin: 0 });
  s.addText([
    ...runs("上周看了机器怎么存数据，这周开始看**程序**：", { color: C.white, boldColor: C.white }),
    { text: "选对容器、算对复杂度、", options: { color: C.gold, bold: true } },
    { text: "才谈得上优化。", options: { color: C.white } },
  ], { x: 0.75, y: 4.38, w: 8.6, h: 0.5, fontFace: FONT, fontSize: 15, margin: 0, isTextBox: true, valign: "middle" });
}

// Roadmap
{
  const s = content("≡", "本周导引", "内容地图");
  const cols = [
    ["1  Python 补齐", ["1.1 函数：默认 / 关键字 / 可变参数", "1.2 可变与不可变、引用传参", "1.3 浅拷贝与深拷贝", "1.4 异常处理、EOF 读入"]],
    ["2–3  容器与分析", ["2 四种容器与操作复杂度", "3.1–3.3 大 O、常见级别、怎么数", "3.4 从数据范围倒推算法", "3.5 空间复杂度"]],
    ["4–5  优化与调试", ["4.1–4.4 快速 IO、减少重复计算、内建函数、埃氏筛", "5.1–5.3 调试方法、常见错误、考场纪律", "本周作业 · 思考题 · 小结"]],
  ];
  cols.forEach((c, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.15, 2.85, 3.9, i === 1 ? C.cream : C.code);
    text(s, c[0], x + 0.2, 1.3, 2.5, 0.45, { fontSize: 18, bold: true, color: C.dark, margin: 0 });
    bullets(s, c[1], x + 0.15, 1.9, 2.6, 3.0, { fontSize: 12, gap: 10 });
  });
}

// ============================ PART 1 ============================
sectionSlide("Part 1", "Python 基础补齐", "函数、可变性、拷贝与异常——写对题解前先排掉的坑\n默认参数陷阱 · 引用传参 · 浅拷贝 vs 深拷贝");

// 1.1 functions
{
  const s = content("1.1", "1 Python 基础补齐", "函数：默认参数、关键字参数、可变参数");
  codeBlock(s, `def gcd(a, b):
    """辗转相除法求最大公约数。"""
    while b:
        a, b = b, a % b
    return a


print(gcd(12, 18))          # 6`, 0.5, 1.1, 4.3, 2.0, { fontSize: 10.5, lang: "py" });
  codeBlock(s, `def f(a, b=10, *args, **kwargs):
    print(a, b, args, kwargs)


f(1)                # 1 10 () {}
f(1, 2, 3, 4, x=5)  # 1 2 (3, 4) {'x': 5}`, 5.0, 1.1, 4.5, 2.0, { fontSize: 10, lang: "py" });
  callout(s, "参数怎么对应", [
    "`b=10`：**默认参数**，调用时可以不传。",
    "`*args`：多余的位置参数打包成元组。",
    "`**kwargs`：多余的关键字参数打包成字典。",
  ], 0.5, 3.3, 9.0, 1.6, { fontSize: 12.5, gap: 8 });
}

// 1.1 mutable default trap
{
  const s = content("1.1", "1 Python 基础补齐 · 经典陷阱", "默认参数是可变对象");
  codeBlock(s, `def bad(x, acc=[]):         # ❌ acc 只在函数定义时创建一次
    acc.append(x)
    return acc


print(bad(1))               # [1]
print(bad(2))               # [1, 2]  —— 不是期望的 [2]


def good(x, acc=None):      # ✅ 标准写法
    if acc is None:
        acc = []
    acc.append(x)
    return acc


print(good(1), good(2))     # [1] [2]`, 0.5, 1.1, 6.3, 3.9, { fontSize: 10.5, lang: "py", hl: [1] });
  callout(s, "为什么会这样", [
    "`def` 语句只在**定义时**执行一次，`acc=[]` 这个空列表只被创建一次。",
    "之后每次调用不传 `acc`，用的都是**同一个**列表对象。",
    "改用 `None` 作哨兵值，在函数体内按需新建。",
  ], 7.0, 1.1, 2.5, 3.9, { fontSize: 11, fill: "FDF0EE", tcolor: C.bad, gap: 10 });
}

// 1.2 mutability
{
  const s = content("1.2", "1 Python 基础补齐", "可变与不可变");
  table(s, [
    ["不可变", "可变"],
    [{ t: "int  float  str  tuple  bool  frozenset", mono: true }, { t: "list  dict  set  自定义对象", mono: true }],
  ], 0.5, 1.1, 9.0, [4.5, 4.5], { fontSize: 12.5, rowH: 0.55 });
  text(s, "**函数参数传的是引用**，所以传入可变对象时，函数内的修改会影响外面：", 0.5, 2.05, 9, 0.4, { fontSize: 13 });
  codeBlock(s, `def modify(lst, num):
    lst.append(99)          # 影响调用方
    num += 1                 # 只影响局部：int 不可变，这里是重新绑定


a, b = [1, 2], 10
modify(a, b)
print(a, b)                 # [1, 2, 99] 10`, 0.5, 2.55, 6.3, 2.15, { fontSize: 11, lang: "py" });
  callout(s, "记忆口诀", "**可变对象**（list/dict/set）传进函数会被“看见”修改；**不可变对象**（int/str/tuple）在函数内重新赋值，外面完全不受影响。", 7.0, 2.55, 2.5, 2.15, { fontSize: 11, fill: C.mint, tcolor: C.dark });
}

// 1.3 shallow/deep copy
{
  const s = content("1.3", "1 Python 基础补齐", "浅拷贝与深拷贝");
  codeBlock(s, `import copy

a = [[1, 2], [3, 4]]
b = a                        # 别名：完全同一个对象
c = a[:]                     # 浅拷贝：外层新建，内层仍共享
d = copy.deepcopy(a)         # 深拷贝：彻底独立

a[0][0] = 99
print(b[0][0], c[0][0], d[0][0])   # 99 99 1`, 0.5, 1.1, 5.6, 2.3, { fontSize: 10.5, lang: "py" });
  consoleBlock(s, "99 99 1", 6.3, 1.1, 3.2, 0.6);
  callout(s, "为什么 c[0][0] 也变了", "`a[:]` 只新建了**最外层**的列表；内层的两个 `[1,2]`、`[3,4]` 仍然是原来的对象，`b`、`c` 都指向它们。只有 `d`（深拷贝）连内层也复制了一份。", 6.3, 1.85, 3.2, 1.55, { fontSize: 11 });
  callout(s, "做题时的实际影响", "DP 里保存“每一层的状态”时，`dp_new = dp_old[:]` 对**一维**数组够用，但**二维**数组必须写 `[row[:] for row in grid]`，否则所有行仍是同一个对象。", 0.5, 3.6, 9.0, 1.4, { fontSize: 12, fill: C.mint, tcolor: C.dark });
}

// 1.4 exceptions
{
  const s = content("1.4", "1 Python 基础补齐", "异常处理");
  codeBlock(s, `try:
    n = int(input())
    print(10 / n)
except ValueError:
    print("不是整数")
except ZeroDivisionError:
    print("除零")
except Exception as e:       # 兜底，尽量不要只写这一条
    print("其他错误:", e)
finally:
    print("总会执行")`, 0.5, 1.1, 5.6, 3.0, { fontSize: 10.5, lang: "py" });
  callout(s, "执行顺序", [
    "按 `except` 顺序**从上到下**匹配，命中一个就不再往下看。",
    "`finally` 无论有没有异常都会执行。",
    "`except Exception` 放**最后**当兜底，不要只写这一条——会把编程错误也悄悄吞掉。",
  ], 6.3, 1.1, 3.2, 3.0, { fontSize: 11, gap: 8 });
}

// 1.4 EOF reading
{
  const s = content("1.4", "1 Python 基础补齐", "OJ 最常用的用法：读到文件尾就结束");
  codeBlock(s, `import sys

for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    # 处理一行`, 0.5, 1.15, 4.3, 2.15, { fontSize: 10.5, lang: "py" });
  codeBlock(s, `while True:
    try:
        n = int(input())
    except EOFError:
        break
    print(n * n)`, 5.0, 1.15, 4.5, 2.15, { fontSize: 10.5, lang: "py" });
  callout(s, "两种写法怎么选", "**不知道有多少行**、每行独立处理：用 `for line in sys.stdin`。**要按 `EOFError` 精确控制退出时机**（比如读到 -1 停止之外还想处理别的异常）：用 `while True` + `try/except EOFError`。两者在 OJ 上都很常见。", 0.5, 3.5, 9.0, 1.5, { fontSize: 12 });
}

// ============================ PART 2 ============================
sectionSlide("Part 2", "四种容器与它们的代价", "本周最重要的一张表：list 的 in / pop(0) 是 O(n)\nlist · tuple · set · dict 的选型与操作复杂度");

// 2.1 selection table
{
  const s = content("2.1", "2 四种容器", "选型表");
  table(s, [
    ["容器", "有序", "可变", "可重复", "典型用途"],
    [{ t: "list", mono: true }, "是", "是", "是", "序列、栈、动态数组"],
    [{ t: "tuple", mono: true }, "是", "否", "是", "不变的记录、可作字典键"],
    [{ t: "set", mono: true }, "否", "是", "否", "去重、判存在"],
    [{ t: "dict", mono: true }, "插入序", "是", "键不重复", "映射、计数"],
  ], 0.5, 1.2, 9.0, [1.4, 1.3, 1.3, 1.5, 3.5], { fontSize: 13, rowH: 0.5 });
  callout(s, "一句话选型", "**要下标、要顺序** → list；**固定不变、想当字典键** → tuple；**只关心“有没有”** → set；**要映射关系** → dict。", 0.5, 3.75, 9.0, 1.0, { fontSize: 12.5 });
}

// 2.2 complexity table (most important)
{
  const s = content("2.2", "2 四种容器", "操作复杂度（必须背下来）");
  table(s, [
    ["操作", "list", "set / dict"],
    ["按下标取 a[i]", { t: "O(1)", bold: true, color: C.ok }, "—"],
    ["末尾追加 append", { t: "均摊 O(1)", bold: true, color: C.ok }, "—"],
    ["末尾弹出 pop()", { t: "O(1)", bold: true, color: C.ok }, "—"],
    [{ t: "头部插入 insert(0,x)", color: C.bad }, { t: "O(n) ⚠️", bold: true, color: C.bad }, "—"],
    [{ t: "头部弹出 pop(0)", color: C.bad }, { t: "O(n) ⚠️", bold: true, color: C.bad }, "—"],
    [{ t: "判存在 x in c", color: C.bad }, { t: "O(n) ⚠️", bold: true, color: C.bad }, { t: "O(1)", bold: true, color: C.ok }],
    ["插入 / 删除", "O(n)", { t: "O(1)", bold: true, color: C.ok }],
    ["排序", "O(n log n)", "—"],
  ], 0.5, 1.1, 9.0, [3.4, 2.8, 2.8], { fontSize: 12, rowH: 0.34 });
  callout(s, "这张表是本周最重要的内容", "绝大多数“算法对但 TLE”的代码，死因就是把 `in` 用在了 list 上，或者用 `pop(0)` 当队列。", 0.5, 4.35, 9.0, 0.85, { fontSize: 12.5, fill: "FDF0EE", tcolor: C.bad });
}

// 2.2 timing demo
{
  const s = content("2.2", "2 四种容器 · 实测", "list 的 in 与 set 的 in：差多少？");
  codeBlock(s, `import time

n = 200000
data = list(range(n))
lst, st = data, set(data)

t0 = time.time()
sum(1 for x in range(0, n, 1000) if x in lst)     # list 的 in：O(n) 每次
t1 = time.time()
sum(1 for x in range(0, n, 1000) if x in st)      # set 的 in：O(1) 每次
t2 = time.time()

print(f"list in: {t1 - t0:.4f}s   set in: {t2 - t1:.6f}s")`, 0.5, 1.1, 9.0, 2.9, { fontSize: 11, lang: "py" });
  consoleBlock(s, "list in: 0.6023s   set in: 0.000122s", 0.5, 4.15, 9.0, 0.55, 12);
  text(s, "典型结果：list in 约 0.6s，set in 约 0.0001s —— 相差**三个数量级**。", 0.5, 4.78, 9, 0.3, { fontSize: 11, color: C.muted, margin: 0 });
}

// 2.3 deque
{
  const s = content("2.3", "2 四种容器", "需要队列时用 deque");
  codeBlock(s, `from collections import deque

q = deque([1, 2, 3])
q.append(4)          # 右进 O(1)
q.appendleft(0)      # 左进 O(1)
q.popleft()          # 左出 O(1)  —— 这是 list.pop(0) 的正确替代
q.pop()              # 右出 O(1)
print(q)             # deque([1, 2, 3])`, 0.5, 1.15, 5.6, 2.5, { fontSize: 11, lang: "py" });
  callout(s, "为什么 list.pop(0) 慢", "list 底层是**连续数组**，弹出头部后所有元素要整体前移一位——O(n)。`deque` 底层是**双端链表式的块结构**，两端操作都是 O(1)。", 6.3, 1.15, 3.2, 2.5, { fontSize: 11.5 });
  callout(s, "第 12 周会用到", "做 BFS 时，如果拿 `list.pop(0)` 当队列，会把本该 O(V+E) 的算法拖成 O(V²)。", 0.5, 3.85, 9.0, 0.95, { fontSize: 12, fill: C.mint, tcolor: C.dark });
}

// 2.4 counting
{
  const s = content("2.4", "2 四种容器", "计数与分组的标准写法");
  codeBlock(s, `from collections import Counter, defaultdict

words = "the quick brown fox jumps over the lazy dog the end".split()

cnt = Counter(words)
print(cnt['the'])                  # 3
print(cnt.most_common(2))          # [('the', 3), ('quick', 1)]

groups = defaultdict(list)
for w in words:
    groups[len(w)].append(w)
print(dict(sorted(groups.items())))`, 0.5, 1.1, 9.0, 2.85, { fontSize: 10.5, lang: "py" });
  consoleBlock(s, "3\n[('the', 3), ('quick', 1)]\n{3: ['the', 'fox', 'the', 'dog', 'the', 'end'], 4: ['over', 'lazy'], 5: ['quick', 'brown', 'jumps']}", 0.5, 4.05, 9.0, 0.9, 9.5);
}

// 2.4 note
{
  const s = content("2.4", "2 四种容器 · 要点", "Counter 为什么快");
  callout(s, "O(n) vs O(n²)", "`Counter(words)` **一遍** O(n) 完成统计；而 `[lst.count(x) for x in set(lst)]` 对每个不同元素都要重新扫一遍列表，整体是 **O(n²)**。数据量一大，差距立刻显现。", 0.5, 1.2, 9.0, 1.3, { fontSize: 13.5 });
  callout(s, "defaultdict 省的那一行", "不用 `defaultdict` 就要写 `if len(w) not in groups: groups[len(w)] = []`；`defaultdict(list)` 让「键不存在时自动给一个默认值」这件事对每次访问都自动发生。", 0.5, 2.7, 9.0, 1.3, { fontSize: 13 });
}

// ============================ PART 3 ============================
sectionSlide("Part 3", "算法分析：这段代码够快吗", "大 O 记号 · 常见复杂度级别\n从数据范围倒推算法 · 空间复杂度");

// 3.1 big O
{
  const s = content("3.1", "3 算法分析", "大 O 记号");
  text(s, "大 O 描述**输入规模增长时，运行时间怎样增长**，忽略常数因子与低阶项：", 0.5, 1.1, 9, 0.4, { fontSize: 13.5 });
  const rows = [["3n² + 100n + 500", "O(n²)", "最高阶项决定量级"], ["100n", "O(n)", "即使常数很大"]];
  rows.forEach((r, i) => {
    const y = 1.7 + i * 0.95;
    card(s, 0.5, y, 9.0, 0.8, C.code);
    text(s, r[0], 0.75, y, 3.6, 0.8, { fontSize: 16, bold: true, fontFace: MONO, color: C.dark, valign: "middle", margin: 0 });
    text(s, "→", 4.4, y, 0.5, 0.8, { fontSize: 18, bold: true, color: C.green, align: "center", valign: "middle", margin: 0 });
    pill(s, r[1], 5.0, y + 0.18, 1.5, 0.44, C.dark, C.gold, 15);
    text(s, r[2], 6.7, y, 2.6, 0.8, { fontSize: 11.5, color: C.muted, valign: "middle", margin: 0 });
  });
  callout(s, "为什么忽略常数", "n 足够大时，**量级压倒一切**。n = 10⁶ 时，O(n) 的算法（10⁶ 步）比 O(n²) 的算法（10¹² 步）快一百万倍——常数是 100 还是 1 无关紧要。", 0.5, 3.7, 9.0, 1.3, { fontSize: 12.5 });
}

// 3.2 common levels
{
  const s = content("3.2", "3 算法分析", "常见复杂度级别");
  table(s, [
    ["复杂度", "名称", "n=10⁶ 时约需", "典型算法"],
    [{ t: "O(1)", mono: true, bold: true, color: C.ok }, "常数", "1", "下标访问、哈希查找"],
    [{ t: "O(log n)", mono: true, bold: true, color: C.ok }, "对数", "20", "二分查找"],
    [{ t: "O(n)", mono: true, bold: true, color: C.ok }, "线性", "10⁶", "一遍扫描"],
    [{ t: "O(n log n)", mono: true }, "线性对数", "2×10⁷", "排序、分治"],
    [{ t: "O(n²)", mono: true, bold: true, color: C.bad }, "平方", "10¹² ❌", "双重循环"],
    [{ t: "O(2ⁿ)", mono: true, bold: true, color: C.bad }, "指数", "天文数字 ❌", "枚举子集"],
    [{ t: "O(n!)", mono: true, bold: true, color: C.bad }, "阶乘", "天文数字 ❌", "全排列"],
  ], 0.5, 1.15, 9.0, [1.7, 1.6, 2.3, 3.4], { fontSize: 12, rowH: 0.44 });
}

// 3.2 growth chart
{
  const s = content("3.2", "3 算法分析", "增长速度的直观感受");
  codeBlock(s, `运行时间
   ^            2^n    n^2
   |             |    /
   |             |   /
   |             |  /          n log n
   |             | /        /
   |             |/     /          n
   |            /|  /      ------------
   |         /  /--------
   |  --------------------------  log n
   +-----------------------------------> n`, 0.5, 1.1, 9.0, 3.0, { fontSize: 12, lang: "text" });
  text(s, "同一个 n，五条曲线在图上的高度差可以是几个数量级——这就是为什么「算法选对了」比「代码写快了」重要得多。", 0.5, 4.25, 9, 0.6, { fontSize: 12, lsm: 1.2 });
}

// 3.3 how to count (1/2)
{
  const s = content("3.3", "3 算法分析", "怎么数（1/2）：单层与两重循环");
  codeBlock(s, `# O(1)
x = a[0] + a[-1]

# O(n)
s = 0
for v in a:
    s += v

# O(n^2)：两重循环，内层次数与 n 同阶
for i in range(n):
    for j in range(n):
        pass

# O(n^2)：注意这个也是 n^2/2 ~ O(n^2)
for i in range(n):
    for j in range(i, n):
        pass`, 0.5, 1.15, 6.3, 3.4, { fontSize: 11, lang: "py" });
  callout(s, "口诀", [
    "循环嵌套几层，通常就是 n 的几次方。",
    "`for i in range(i, n)` 这种“三角形”循环，总次数约 n²/2，仍是 **O(n²)**。",
  ], 7.0, 1.15, 2.5, 3.4, { fontSize: 11.5, gap: 10 });
}

// 3.3 how to count (2/2)
{
  const s = content("3.3", "3 算法分析", "怎么数（2/2）：排序与二分");
  codeBlock(s, `# O(n log n)
a.sort()

# O(log n)
lo, hi = 0, n - 1
while lo <= hi:
    mid = (lo + hi) // 2
    ...`, 0.5, 1.15, 6.3, 2.1, { fontSize: 11.5, lang: "py" });
  callout(s, "口诀", "每次循环把规模**减半**（如二分查找），需要的步数是 **O(log n)**——这是唯一一种“循环次数不随 n 线性增长”的常见模式。", 7.0, 1.15, 2.5, 2.1, { fontSize: 11.5 });
  callout(s, "sort() 为什么是 O(n log n)", "`list.sort()` 用的 Timsort，是归并排序与插入排序的混合，比较次数的下界就是 **O(n log n)**——这是基于比较的排序算法能达到的最优复杂度。", 0.5, 3.45, 9.0, 1.25, { fontSize: 12.5, fill: C.mint, tcolor: C.dark });
}

// 3.3 hidden complexity
{
  const s = content("3.3", "3 算法分析", "隐藏的复杂度——最容易漏的一种");
  codeBlock(s, `for i in range(n):
    if x in lst:            # <- 这一行是 O(n)，整体 O(n^2)
        ...

for i in range(n):
    s = s + str(i)          # <- 字符串拼接每次 O(len)，整体 O(n^2)
    # 正确写法：out.append(str(i))  最后 ''.join(out)`, 0.5, 1.15, 9.0, 1.85, { fontSize: 11, lang: "py", hl: [2, 6] });
  callout(s, "为什么容易漏", "外层 `for i in range(n)` 一眼看是 O(n)，但**循环体里藏着一次 O(n) 的操作**（`in` 查列表、拼接长字符串），乘起来就是 O(n²)。审查复杂度时要看循环体**每一行**的代价，不能只数循环层数。", 0.5, 3.15, 9.0, 1.85, { fontSize: 13, fill: "FDF0EE", tcolor: C.bad });
}

// 3.4 data range table (key)
{
  const s = content("3.4", "3 算法分析", "从数据范围倒推算法（考场上最实用的一招）");
  text(s, "OJ 的机器大约每秒能执行 **10⁷–10⁸** 次基本操作。看到 n 就能倒推该用什么算法：", 0.5, 1.05, 9, 0.4, { fontSize: 13 });
  table(s, [
    ["n 的范围", "可接受的复杂度", "该想什么"],
    [{ t: "n ≤ 10", bold: true }, { t: "O(n!) / O(2ⁿ·n)", mono: true }, "全排列、暴力搜索"],
    [{ t: "n ≤ 20", bold: true }, { t: "O(2ⁿ)", mono: true }, "枚举子集、状压"],
    [{ t: "n ≤ 100", bold: true }, { t: "O(n³)", mono: true }, "Floyd、区间 DP"],
    [{ t: "n ≤ 1000", bold: true }, { t: "O(n²)", mono: true }, "二维 DP、暴力两重循环"],
    [{ t: "n ≤ 10⁵", bold: true }, { t: "O(n log n)", mono: true }, "排序、二分、堆、优先队列"],
    [{ t: "n ≤ 10⁶", bold: true }, { t: "O(n)", mono: true }, "一遍扫描、双指针、前缀和"],
    [{ t: "n ≥ 10⁸", bold: true }, { t: "O(log n) / O(1)", mono: true }, "数学公式、快速幂"],
  ], 0.5, 1.5, 9.0, [1.7, 2.6, 4.7], { fontSize: 12, rowH: 0.34 });
  callout(s, "考场流程", "**读完题先看数据范围 → 定复杂度上限 → 再想算法。** 反过来做（先想算法再看范围）会浪费大量时间在注定 TLE 的思路上。", 0.5, 4.35, 9.0, 0.85, { fontSize: 11.5, fill: C.mint, tcolor: C.dark });
}

// 3.5 space complexity
{
  const s = content("3.5", "3 算法分析", "空间复杂度");
  text(s, "同样用大 O，衡量**额外**内存。", 0.5, 1.1, 9, 0.35, { fontSize: 13.5 });
  callout(s, "一个经验数字", "Python 的 `int` 在列表里约占 8 字节指针 + 28 字节对象：**10⁶ 个整数的列表约 40 MB**。", 0.5, 1.6, 9.0, 1.0, { fontSize: 13.5 });
  callout(s, "对照 OJ 限制", "OJ 内存限制常见 **64–256 MB**，所以 `n = 10⁷` 的一维数组还行；`n = 10⁴` 的二维数组（10⁸ 个元素）**必然 MLE**。", 0.5, 2.75, 9.0, 1.3, { fontSize: 13, fill: "FDF0EE", tcolor: C.bad });
}

// ============================ PART 4 ============================
sectionSlide("Part 4", "常数优化", "复杂度对了但还是超时，才轮到优化常数\n快速 IO · 少做重复计算 · 内建函数 · 埃氏筛");

// 4.1 fast io
{
  const s = content("4.1", "4 常数优化", "快速输入输出");
  codeBlock(s, `import sys

input = sys.stdin.readline          # 大量行输入时提速明显
data = sys.stdin.read().split()     # 一次读完，最快
sys.stdout.write('\\n'.join(out) + '\\n')   # 批量输出，比循环 print 快很多`, 0.5, 1.15, 9.0, 1.6, { fontSize: 11, lang: "py" });
  callout(s, "常数优化的第一顺位", "输入输出是最容易的优化点：`print` 每次调用都有系统调用开销，循环几万次 `print` 本身就可能超时。**批量读、批量写**几乎是无成本的改动。", 0.5, 2.9, 9.0, 1.1, { fontSize: 13 });
  callout(s, "小心这个坑", "`sys.stdin.readline()` **保留行尾换行符**，用于字符串比较时记得 `.strip()`。", 0.5, 4.1, 9.0, 0.85, { fontSize: 12.5, fill: "FDF0EE", tcolor: C.bad });
}

// 4.2 less recompute
{
  const s = content("4.2", "4 常数优化", "少做重复计算");
  codeBlock(s, `# 慢
for i in range(len(a)):
    for j in range(len(a)):
        ...

# 快：把 len 提到循环外，把属性查找绑成局部变量
n = len(a)
append = res.append
for i in range(n):
    for j in range(n):
        append(i * j)`, 0.5, 1.15, 9.0, 2.8, { fontSize: 11, lang: "py" });
  callout(s, "为什么有效", "`len(a)`、`res.append` 这类属性查找每次都要重新解析一次；提到循环外只算一次，在千万级循环里能省下明显的时间——但**改变不了复杂度**，只是降低常数。", 0.5, 4.05, 9.0, 0.9, { fontSize: 12 });
}

// 4.3 builtins
{
  const s = content("4.3", "4 常数优化", "用内建函数");
  codeBlock(s, `s = sum(a)                     # 快于 for 累加
m = max(a)
b = sorted(a)
c = list(map(int, line.split()))   # 快于 [int(x) for x in line.split()]`, 0.5, 1.2, 9.0, 1.6, { fontSize: 12, lang: "py" });
  callout(s, "为什么快一个量级", "内建函数是用 **C 实现**的，跳过了 Python 字节码解释器逐条执行的开销。能用内建函数替代显式 Python 循环时，优先用内建函数。", 0.5, 3.0, 9.0, 1.3, { fontSize: 13.5 });
}

// 4.4 sieve
{
  const s = content("4.4", "4 常数优化 · 例", "埃拉托色尼筛");
  text(s, "判素数的朴素做法是 O(√n)，一次查询没问题；但**要判很多个数**时就该预处理：", 0.5, 1.05, 9, 0.4, { fontSize: 12.5 });
  codeBlock(s, `def sieve(limit):
    """返回长度 limit+1 的布尔数组。O(n log log n)。"""
    is_prime = [True] * (limit + 1)
    is_prime[0] = is_prime[1] = False
    i = 2
    while i * i <= limit:
        if is_prime[i]:
            for j in range(i * i, limit + 1, i):   # 从 i*i 开始，更小因子已筛过
                is_prime[j] = False
        i += 1
    return is_prime


primes = sieve(100)
print([i for i, p in enumerate(primes) if p])`, 0.5, 1.55, 9.0, 3.0, { fontSize: 10, lang: "py" });
  consoleBlock(s, "[2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97]", 0.5, 4.65, 9.0, 0.5, 9);
}

// 4.4 T-primes
{
  const s = content("4.4", "4 常数优化 · 应用", "经典应用：T-primes（恰好 3 个约数的数）");
  text(s, "一个数恰有 3 个约数 ⟺ 它是**某个素数的平方**。", 0.5, 1.05, 9, 0.35, { fontSize: 13 });
  codeBlock(s, `LIMIT = 10 ** 6                      # sqrt(10^12)
is_prime = sieve(LIMIT)


def is_tprime(x):
    r = int(x ** 0.5)
    # 浮点开方在边界可能差 1，向两侧各校正一次
    while r * r > x:
        r -= 1
    while (r + 1) * (r + 1) <= x:
        r += 1
    return r * r == x and r <= LIMIT and is_prime[r]


print([x for x in [1, 4, 9, 12, 16, 25, 36, 49] if is_tprime(x)])`, 0.5, 1.5, 9.0, 3.0, { fontSize: 10, lang: "py", hl: [6, 7] });
  consoleBlock(s, "[4, 9, 25, 49]", 0.5, 4.6, 9.0, 0.45, 11);
}

// 4.4 float sqrt gotcha
{
  const s = content("4.4", "4 常数优化 · 易错点", "两行 while 校正在纠正什么");
  callout(s, "这是本题最常见的 WA 来源", "`int(x ** 0.5)` 对大整数会因**浮点误差**算错 1——这就是第 3 周「浮点数不可靠」的直接后果：`x ** 0.5` 是用 IEEE 754 双精度算的，尾数只有 52 位，大数开方可能有 ±1 的误差。", 0.5, 1.2, 9.0, 1.6, { fontSize: 13.5, fill: "FDF0EE", tcolor: C.bad });
  callout(s, "怎么修", "算出近似根 `r` 后，用**纯整数运算** `r*r` 与 `x` 比较，向两侧各校正一次，保证最终 `r` 是真正满足 `r*r == x` 的整数——彻底绕开浮点误差。", 0.5, 3.0, 9.0, 1.5, { fontSize: 13.5 });
}

// 4.4 OJ example
{
  const s = content("4.4", "4 常数优化 · 例题", "E03143 验证“歌德巴赫猜想”");
  text(s, "http://cs101.openjudge.cn/practice/03143/", 0.5, 1.02, 9, 0.3, { fontSize: 10.5, color: C.muted, margin: 0 });
  codeBlock(s, `is_prime = sieve(10000)
n = int(input())
for a in range(2, n // 2 + 1):
    if is_prime[a] and is_prime[n - a]:
        print(a, n - a)`, 0.5, 1.5, 9.0, 1.6, { fontSize: 12.5, lang: "py" });
  callout(s, "要点", "**猜想内容**：任一大于 2 的偶数都能写成两个素数之和。先用埃氏筛预处理，再从小到大枚举 `a`，第一次找到 `is_prime[a] and is_prime[n-a]` 就是字典序最小的一组。", 0.5, 3.3, 9.0, 1.5, { fontSize: 13 });
}

// ============================ PART 5 ============================
sectionSlide("Part 5", "调试", "读错误信息 · 造最小复现输入 · 打印中间状态\n通用方法 · 常见错误 · 三条考场纪律");

// 5.1 general methods
{
  const s = content("5.1", "5 调试", "通用方法");
  const pts = [
    ["读错误信息的最后一行", "它告诉你错误类型和位置。"],
    ["构造最小复现输入", "把出错的输入砍到最小仍能复现。"],
    ["打印中间状态", "`print(f\"i={i} dp={dp}\", file=sys.stderr)`——写 stderr 不会污染 OJ 输出。"],
    ["用调试器单步", "PyCharm 打断点比 print 快得多。"],
    ["对拍", "写一个暴力解，随机造数据，比较两者输出。第 16 周复习时会用到。"],
  ];
  pts.forEach((p, i) => {
    const y = 1.1 + i * 0.78;
    numCircle(s, i + 1, 0.5, y, 0.4, C.dark);
    text(s, p[0], 1.05, y - 0.02, 3.3, 0.42, { fontSize: 13, bold: true, color: C.dark, valign: "middle", margin: 0 });
    s.addText(runs(p[1], { color: C.text }), { x: 4.5, y: y - 0.05, w: 5.0, h: 0.65, fontFace: FONT, fontSize: 11.5, margin: 0, isTextBox: true, valign: "top" });
  });
}

// 5.2 common errors
{
  const s = content("5.2", "5 调试", "常见错误与对策");
  table(s, [
    ["OJ 反馈", "含义", "常见原因"],
    [{ t: "WA", mono: true, bold: true, color: C.bad }, "答案错", "边界（n=0/1）、读题漏条件、输出格式、精度"],
    [{ t: "TLE", mono: true, bold: true, color: C.bad }, "超时", "复杂度过高、`in` 用在 list 上、`pop(0)`"],
    [{ t: "MLE", mono: true, bold: true, color: C.bad }, "超内存", "开了过大的数组、递归过深"],
    [{ t: "RE", mono: true, bold: true, color: C.bad }, "运行错误", "下标越界、除零、递归爆栈"],
    [{ t: "PE", mono: true, bold: true, color: C.bad }, "格式错", "多余空格 / 换行"],
    [{ t: "CE", mono: true, bold: true, color: C.bad }, "编译错", "语法错误"],
  ], 0.5, 1.2, 9.0, [1.4, 1.7, 5.9], { fontSize: 12.5, rowH: 0.45 });
}

// 5.3 exam discipline
{
  const s = content("5.3", "5 调试", "三条考场纪律");
  const qs = [
    ["样例过了不等于对", "至少再手造一组边界数据（n=1、全相同、最大值）。"],
    ["TLE 先看复杂度，别急着调常数", "数量级不对，怎么优化常数都没用。"],
    ["卡住 15 分钟就换题", "回来时往往一眼看出问题。"],
  ];
  qs.forEach((q, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.15, 2.85, 3.3, C.code);
    numCircle(s, i + 1, x + 0.2, 1.32, 0.46, C.dark);
    text(s, q[0], x + 0.2, 1.95, 2.5, 0.85, { fontSize: 14, bold: true, color: C.dark, margin: 0, lsm: 1.15 });
    text(s, q[1], x + 0.2, 2.9, 2.5, 1.4, { fontSize: 11.5, margin: 0, lsm: 1.2 });
  });
}

// Homework table
{
  const s = content("✎", "本周作业", "本周作业");
  table(s, [
    ["#", "题目", "平台 / 编号", "考点"],
    ["1", "多项式时间复杂度", { t: "E23563", mono: true }, "字符串解析、复杂度概念"],
    ["2", "验证“歌德巴赫猜想”", { t: "E03143", mono: true }, "素数筛"],
    ["3", "生日相同", { t: "E02724", mono: true }, "字典分组、排序"],
    ["4", "与 7 无关的数", { t: "02701", mono: true }, "循环"],
    ["5", "数论", { t: "E23564", mono: true }, "数学"],
    ["6", "2050 年成绩计算", { t: "E18176", mono: true }, "模拟、格式"],
    ["7", "词典", { t: "E02804", mono: true }, "字典查询"],
    [{ t: "8（选做）", color: C.goldText }, "最大公约数", { t: "03248", mono: true }, "辗转相除、递归预热"],
  ], 0.5, 1.05, 9.0, [1.1, 2.4, 1.9, 3.6], { fontSize: 12, rowH: 0.4 });
  text(s, "E 开头与纯数字编号：cs101.openjudge.cn。", 0.5, 4.78, 9, 0.28, { fontSize: 10, color: C.muted, margin: 0 });
}

// Thinking questions
{
  const s = content("?", "本周作业 · 思考题", "思考题");
  const qs = [
    ["筛法", "为什么埃氏筛的内层循环从 `i * i` 开始而不是 `2 * i`？"],
    ["复杂度", "`a = a + [x]` 和 `a.append(x)` 的复杂度分别是多少？在循环里用前者会发生什么？"],
    ["可行性判断", "n = 10⁵、时限 1 秒，下列哪些复杂度可行：O(n²)、O(n√n)、O(n log n)、O(n log²n)？"],
    ["实测", "用 `time.time()` 实测：把 `x in lst` 换成 `x in set(lst)`（注意 set 要在循环外建），加速比是多少？"],
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
  ["可变默认参数", "默认参数别用可变对象；二维结构拷贝要用 `[row[:] for row in grid]`。"],
  ["容器复杂度表要背", "list 的 `in` / `pop(0)` 是 O(n)，set / dict 的 `in` 是 O(1)，队列用 `deque`。"],
  ["先看数据范围", "大 O 忽略常数与低阶项；**先看数据范围，再定复杂度，最后想算法**。"],
  ["常数优化的顺序", "快速 IO → 减少重复计算 → 用内建函数。**复杂度不对时不要优化常数。**"],
  ["浮点开方会差 1", "在大整数上边界要用整数校正，不能直接相信 `x ** 0.5`。"],
]);

// Next week
sectionSlide("下周预告", "10 月月考与阶段复习", "第一次在机房环境下限时做题\n月考样卷 6 题 / 112 分钟、考后订正方法、考场策略");

  await D.save(OUT);
})().catch((e) => { console.error(e); process.exit(1); });

// 第 7 周 矩阵、队列、栈与贪心练习 —— 由 202610_ADS_W07_Matrix_Queue_Stack_Greedy.md 整理成的讲课 PPT。
// 生成：cd courseware/pptx_builder && node decks/w07_matrix_queue_stack_greedy.js ../202610_ADS_W07_Matrix_Queue_Stack_Greedy.pptx
// 页上所有的运行结果都在 Python 3.12 下实跑核对过；改代码时连同结果一起改。
const path = require("path");
const { createDeck } = require("../lib");

const OUT = process.argv[2] || path.join(__dirname, "..", "out", "202610_ADS_W07_Matrix_Queue_Stack_Greedy.pptx");

(async () => {
  const D = createDeck({ title: "计算概论（B）第 7 周 矩阵、队列、栈与贪心练习", author: "Hongfei Yan" });
  const {
    pres, C, FONT, MONO, runs, text, bullets, card, codeBlock, consoleBlock, callout, table,
    cells, arrowLabel, pill, numCircle, titleSlide, sectionSlide, content, summarySlide,
  } = D;

// ---- slides（顶层不缩进，避免改动模板字符串里的代码缩进）----
// =====================================================================
// Cover
titleSlide({
  kicker: "计算概论（B） · 第 7 周 · 2026 Fall",
  title: "矩阵、队列、栈与贪心练习",
  subtitle: "栈与队列的四类应用 + 贪心练习",
  topics: "栈的 LIFO 与四类应用：括号匹配 · 进制转换 · 表达式求值 · 单调栈\n队列的 FIFO、deque 与双端队列、循环队列、约瑟夫问题\n单调队列：滑动窗口最大值\n矩阵与贪心综合练习",
  footer: "Compiled by Hongfei Yan · 2026 Fall · github.com/GMyhf/2026fall-cs101",
});

// Three questions
{
  const s = content("?", "本周导引", "本周要回答三个问题");
  const qs = [
    ["为什么 `list.pop(0)` 会拖垮 BFS？", "队列必须 O(1) 出队；**用错容器**，O(n) 悄悄变成 O(n²)。"],
    ["表达式怎么让机器算，而不是让人算？", "**后缀表达式**没有括号、不用管优先级——**栈**从左到右扫一遍就求出值。"],
    ["\"下一个更大元素\"要 O(n²) 吗？", "**单调栈 / 单调队列**：每个元素最多进出一次，把 O(n²) 降到 O(n)。"],
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
    ...runs("栈管**后进先出**，队列管**先进先出**：", { color: C.white, boldColor: C.white }),
    { text: "选对了容器，", options: { color: C.gold, bold: true } },
    { text: "很多题目会自己变简单。", options: { color: C.white } },
  ], { x: 0.75, y: 4.38, w: 8.6, h: 0.5, fontFace: FONT, fontSize: 15, margin: 0, isTextBox: true, valign: "middle" });
}

// Roadmap
{
  const s = content("≡", "本周导引", "内容地图");
  const cols = [
    ["1  栈 Stack", ["1.1 LIFO 与 Python 实现", "1.2 括号匹配", "1.3 进制转换（逆序输出）", "1.4 中缀 / 前缀 / 后缀表达式", "1.5 单调栈：接雨水 · 柱状图 · 堆猪"]],
    ["2  队列 Queue", ["2.1 FIFO 与 deque", "2.2 双端队列", "2.3 循环队列", "2.4 约瑟夫问题", "2.5 病人排队（稳定排序）", "2.6 单调队列：滑动窗口最大值"]],
    ["3–4  对照与练习", ["3 栈与队列对照", "4.1 分发糖果", "4.2 土豪购物", "4.3 二维卷积", "本周作业 · 思考题 · 小结"]],
  ];
  cols.forEach((c, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.15, 2.85, 3.9, i === 1 ? C.cream : C.code);
    text(s, c[0], x + 0.2, 1.3, 2.5, 0.45, { fontSize: 17, bold: true, color: C.dark, margin: 0 });
    bullets(s, c[1], x + 0.15, 1.85, 2.6, 3.05, { fontSize: 11, gap: 7 });
  });
}

// ============================ PART 1 ============================
sectionSlide("Part 1", "栈（Stack）", "LIFO 后进先出\n四类应用：匹配 · 逆序 · 表达式 · 单调栈");

// 1.1a LIFO diagram + ops
{
  const s = content("1.1", "1 栈（Stack）", "LIFO：后进先出");
  card(s, 0.5, 1.1, 9.0, 1.5, C.code);
  const steps = [["push(4)", ["", "3", "2", "1"]], ["", ["4", "3", "2", "1"]], ["pop() -> 4", ["3", "2", "1", ""]]];
  steps.forEach((st, i) => {
    const x = 0.9 + i * 3.0;
    text(s, st[0], x, 1.2, 2.2, 0.3, { fontSize: 11, bold: true, color: C.green, margin: 0 });
    for (let k = 0; k < 4; k++) {
      const y = 1.55 + k * 0.32;
      card(s, x, y, 1.4, 0.3, st[1][3 - k] === "" ? C.white : C.mint);
      if (st[1][3 - k] !== "") text(s, st[1][3 - k], x, y, 1.4, 0.3, { fontSize: 12, bold: true, color: C.dark, align: "center", valign: "middle", margin: 0 });
    }
    if (i < 2) { s.addShape(pres.shapes.LINE, { x: x + 1.55, y: 1.95, w: 0.35, h: 0, line: { color: C.green, width: 2, endArrowType: "triangle" } }); }
  });
  text(s, "栈底在下，栈顶在上；只允许在栈顶插入与删除", 0.7, 2.35, 8.5, 0.2, { fontSize: 9.5, color: C.muted, margin: 0 });
  table(s, [
    ["操作", "语义", "复杂度"],
    [{ t: "push(x)", mono: true }, "入栈", "均摊 O(1)"],
    [{ t: "pop()", mono: true }, "出栈并返回栈顶", "O(1)"],
    [{ t: "peek()", mono: true }, "查看栈顶不弹出", "O(1)"],
    [{ t: "is_empty()", mono: true }, "判空", "O(1)"],
  ], 0.5, 2.85, 5.6, [1.7, 2.5, 1.4], { fontSize: 11.5, rowH: 0.38 });
  callout(s, "在 OJ 上直接用 list", "`append` / `pop` / `[-1]`，代码更短、常数更小，教学用的 `Stack` 类只是把这三步包了一层。", 6.25, 2.85, 3.25, 1.2, { fontSize: 11, fill: C.mint, tcolor: C.dark });
  callout(s, "⚠️ 绝不要用 list 的头部当栈顶", "`insert(0, x)` 和 `pop(0)` 都是 O(n)——那不是栈，是灾难。", 6.25, 4.15, 3.25, 0.78, { fontSize: 10.5, fill: "FDF0EE", tcolor: C.bad });
}

// 1.1b Stack class code
{
  const s = content("1.1", "1 栈（Stack）", "Python 实现：一个教学用的 Stack 类");
  codeBlock(s, `class Stack:
    """教学用的栈封装；实战直接用 list。"""

    def __init__(self):
        self._items = []

    def push(self, item):
        self._items.append(item)

    def pop(self):
        if not self._items:
            raise IndexError("pop from empty stack")
        return self._items.pop()

    def peek(self):
        return self._items[-1]

    def is_empty(self):
        return not self._items

    def __len__(self):
        return len(self._items)`, 0.5, 1.1, 6.3, 3.25, { fontSize: 8.5, lang: "py" });
  codeBlock(s, `s = Stack()
for v in [1, 2, 3]:
    s.push(v)
print(s.pop(), s.peek(), len(s))     # 3 2 2`, 0.5, 4.4, 6.3, 0.3, { fontSize: 8.5, lang: "py" });
  callout(s, "四个方法", [
    "`push` / `pop` 都在**同一端**（列表尾部）操作，均摊 O(1)。",
    "`peek` 只看不删：`self._items[-1]`。",
    "`pop` 先判空，避免在空栈上 `IndexError` 时报错信息不清楚。",
  ], 7.0, 1.1, 2.5, 4.1, { fontSize: 11, gap: 10 });
}

// 1.2a valid parentheses
{
  const s = content("1.2", "1 栈 · 应用一：括号匹配", "LeetCode 20. 有效的括号");
  codeBlock(s, `def is_valid(s):
    pairs = {')': '(', ']': '[', '}': '{'}
    stack = []
    for ch in s:
        if ch in '([{':
            stack.append(ch)
        elif ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
    return not stack          # 结束时必须为空


print(is_valid("([]{})"), is_valid("(]"), is_valid("("))`, 0.5, 1.1, 5.7, 2.5, { fontSize: 10.5, lang: "py", hl: [11] });
  consoleBlock(s, "True False False", 6.35, 1.1, 3.15, 0.7);
  callout(s, "三个易错点", [
    "遇**右**括号时栈已空——直接判假。",
    "栈顶弹出的字符**不配对**——直接判假。",
    "**扫描结束栈非空**——最容易漏，比如 `\"((\"`。",
  ], 6.35, 1.95, 3.15, 1.85, { fontSize: 11, gap: 8 });
  text(s, "**LeetCode 20**：https://leetcode.cn/problems/valid-parentheses/", 0.5, 3.85, 9, 0.3, { fontSize: 10.5, color: C.muted, margin: 0 });
}

// 1.2b variant: mark unmatched
{
  const s = content("1.2", "1 栈 · 应用一：括号匹配", "变形：标出不匹配的括号位置");
  text(s, "栈里存的不是字符而是**下标**：", 0.5, 1.05, 9, 0.35, { fontSize: 13 });
  codeBlock(s, `def mark_unmatched(line):
    mark = [' '] * len(line)
    stack = []
    for i, ch in enumerate(line):
        if ch == '(':
            stack.append(i)
        elif ch == ')':
            if stack:
                stack.pop()
            else:
                mark[i] = '?'          # 多余的右括号
    for i in stack:
        mark[i] = '$'                  # 多余的左括号
    return ''.join(mark)


print(repr(mark_unmatched(")(a(b)")))`, 0.5, 1.5, 6.3, 2.9, { fontSize: 10.5, lang: "py" });
  consoleBlock(s, "'?$    '", 7.0, 1.5, 2.5, 0.65);
  callout(s, "读法", "第 0 位是多余的右括号 → `?`；第 1 位是多余的左括号 → `$`；扫描结束后**栈里剩下的下标**都是没配上的左括号。", 7.0, 2.3, 2.5, 2.1, { fontSize: 10.5 });
}

// 1.3 base conversion
{
  const s = content("1.3", "1 栈 · 应用二：进制转换", "除基取余，余数逆序——正是栈的形状");
  codeBlock(s, `DIGITS = "0123456789ABCDEF"


def to_base(n, base):
    if n == 0:
        return "0"
    neg, n = n < 0, abs(n)
    stack = []
    while n > 0:
        stack.append(DIGITS[n % base])
        n //= base
    if neg:
        stack.append('-')
    return ''.join(reversed(stack))


print(to_base(233, 2), to_base(233, 8), to_base(233, 16))`, 0.5, 1.1, 6.3, 3.0, { fontSize: 10.5, lang: "py" });
  consoleBlock(s, "11101001 351 E9", 7.0, 1.1, 2.5, 0.7);
  callout(s, "为什么要栈", "除基取余得到的数字是**从低位到高位**的顺序，但输出要从高位开始——先压栈、再依次弹出，天然就是逆序。", 7.0, 2.0, 2.5, 2.1, { fontSize: 11 });
}

// 1.4a expression forms
{
  const s = content("1.4", "1 栈 · 应用三：表达式", "中缀 / 前缀 / 后缀");
  text(s, "对 `(1 + 2) * 3`：", 0.5, 1.05, 9, 0.35, { fontSize: 13 });
  table(s, [
    ["形式", "写法", "特点"],
    ["中缀 infix", { t: "( 1 + 2 ) * 3", mono: true }, "人类习惯，需要括号与优先级"],
    ["前缀 prefix（波兰式）", { t: "* + 1 2 3", mono: true }, "运算符在前，无需括号"],
    ["后缀 postfix（逆波兰式）", { t: "1 2 + 3 *", mono: true }, "运算符在后，**最易被机器求值**"],
  ], 0.5, 1.5, 9.0, [2.6, 3.0, 3.4], { fontSize: 12.5, rowH: 0.6 });
  callout(s, "为什么后缀最好算", "从左到右扫描：碰到数字就压栈，碰到运算符就弹出栈顶两个数算完再压回去——**不需要括号，也不用比较优先级**。", 0.5, 3.85, 9.0, 1.0, { fontSize: 12.5, fill: C.mint, tcolor: C.dark });
}

// 1.4b postfix eval
{
  const s = content("1.4", "1 栈 · 表达式求值", "后缀求值：24588");
  codeBlock(s, `def eval_postfix(tokens):
    stack = []
    for tk in tokens:
        if tk in ('+', '-', '*', '/'):
            b = stack.pop()          # 先弹出的是右操作数
            a = stack.pop()
            if tk == '+':
                stack.append(a + b)
            elif tk == '-':
                stack.append(a - b)
            elif tk == '*':
                stack.append(a * b)
            else:
                stack.append(a / b)
        else:
            stack.append(float(tk))
    return stack[-1]


print(eval_postfix("1 2 + 3 *".split()))
print(eval_postfix("10 3 - 2 -".split()))    # 左结合`, 0.5, 1.1, 6.3, 3.7, { fontSize: 10, lang: "py", hl: [5] });
  consoleBlock(s, "9.0\n5.0", 7.0, 1.1, 2.5, 0.8);
  callout(s, "⚠️ 弹出顺序别搞反", "`b` 先弹（右操作数），`a` 后弹（左操作数）；减法、除法不满足交换律，反了就错。", 7.0, 2.1, 2.5, 1.6, { fontSize: 10.5, fill: "FDF0EE", tcolor: C.bad });
  text(s, "**24588: 后序表达式求值**：cs101.openjudge.cn/practice/24588/", 0.5, 4.9, 9, 0.28, { fontSize: 10, color: C.muted, margin: 0 });
}

// 1.4c prefix eval
{
  const s = content("1.4", "1 栈 · 表达式求值", "前缀求值：02694 波兰表达式");
  text(s, "从**右往左**扫描，规则对称：", 0.5, 1.05, 9, 0.32, { fontSize: 12.5 });
  codeBlock(s, `def eval_prefix(tokens):
    stack = []
    for tk in reversed(tokens):
        if tk in ('+', '-', '*', '/'):
            a = stack.pop()          # 从右往左，先弹出的是左操作数
            b = stack.pop()
            stack.append({'+': a + b, '-': a - b,
                          '*': a * b, '/': a / b}[tk])
        else:
            stack.append(float(tk))
    return stack[-1]


print(f"{eval_prefix('* + 11.0 12.0 + 24.0 35.0'.split()):.6f}")`, 0.5, 1.4, 6.3, 2.9, { fontSize: 10, lang: "py" });
  consoleBlock(s, "1357.000000", 7.0, 1.4, 2.5, 0.65);
  callout(s, "对称在哪", "后缀从左到右、先弹右操作数；前缀从右到左、先弹**左**操作数——方向反了，弹出顺序也跟着反。", 7.0, 2.2, 2.5, 2.0, { fontSize: 10.5 });
}

// 1.4d shunting yard rules
{
  const s = content("1.4", "1 栈 · 中缀转后缀", "调度场算法（Shunting Yard）");
  text(s, "由 Dijkstra 提出。维护**运算符栈**与**输出队列**：", 0.5, 1.15, 9, 0.35, { fontSize: 14 });
  bullets(s, [
    "操作数 → 直接输出；",
    "`(` → 入栈；",
    "`)` → 弹栈输出直到遇 `(`，弹掉 `(` 不输出；",
    "运算符 op → 当栈顶是运算符且**优先级 ≥ op**（左结合）时弹出输出，然后 op 入栈；",
    "扫描结束 → 栈中剩余全部弹出。",
  ], 0.7, 1.65, 8.4, 2.45, { fontSize: 15, gap: 16 });
  callout(s, "分两步实现", "先把字符串切成 token（`tokenize`），再用运算符栈把 token 序列转成后缀（`infix_to_postfix`）——下两页分别是这两个函数。", 0.5, 4.2, 9.0, 0.78, { fontSize: 11, fill: C.mint, tcolor: C.dark });
}

// 1.4d2 tokenize
{
  const s = content("1.4", "1 栈 · 中缀转后缀", "第一步：把字符串切成 token");
  codeBlock(s, `PREC = {'+': 1, '-': 1, '*': 2, '/': 2}


def tokenize(expr):
    tokens, i, n = [], 0, len(expr)
    while i < n:
        ch = expr[i]
        if ch.isspace():
            i += 1
        elif ch.isdigit() or ch == '.':
            j = i
            while j < n and (expr[j].isdigit() or expr[j] == '.'):
                j += 1
            tokens.append(expr[i:j])
            i = j
        else:
            tokens.append(ch)
            i += 1
    return tokens`, 0.5, 1.1, 9.0, 4.05, { fontSize: 11, lang: "py" });
}

// 1.4e shunting yard main
{
  const s = content("1.4", "1 栈 · 中缀转后缀", "调度场算法：主逻辑");
  codeBlock(s, `def infix_to_postfix(tokens):
    output, ops = [], []
    for tk in tokens:
        if tk not in PREC and tk not in '()':
            output.append(tk)
        elif tk == '(':
            ops.append(tk)
        elif tk == ')':
            while ops and ops[-1] != '(':
                output.append(ops.pop())
            ops.pop()
        else:
            while ops and ops[-1] != '(' and PREC[ops[-1]] >= PREC[tk]:
                output.append(ops.pop())
            ops.append(tk)
    while ops:
        output.append(ops.pop())
    return output


print(' '.join(infix_to_postfix(tokenize("(1+2)*3"))))
print(' '.join(infix_to_postfix(tokenize("1+2*3-4"))))`, 0.5, 1.1, 6.3, 3.75, { fontSize: 10, lang: "py", hl: [13] });
  consoleBlock(s, "1 2 + 3 *\n1 2 3 * + 4 -", 7.0, 1.1, 2.5, 0.85);
  callout(s, "第 13 行是关键", "`PREC[ops[-1]] >= PREC[tk]`：栈顶优先级**不低于**当前运算符才弹出——这一行决定了结合方向。", 7.0, 2.1, 2.5, 2.6, { fontSize: 10.5 });
}

// 1.4f manual trace + >= vs >
{
  const s = content("1.4", "1 栈 · 中缀转后缀", "手工模拟 (1 + 2) * 3");
  table(s, [
    ["读入", "运算符栈", "输出"],
    [{ t: "(", mono: true }, { t: "(", mono: true }, ""],
    [{ t: "1", mono: true }, { t: "(", mono: true }, { t: "1", mono: true }],
    [{ t: "+", mono: true }, { t: "( +", mono: true }, { t: "1", mono: true }],
    [{ t: "2", mono: true }, { t: "( +", mono: true }, { t: "1 2", mono: true }],
    [{ t: ")", mono: true }, "", { t: "1 2 +", mono: true }],
    [{ t: "*", mono: true }, { t: "*", mono: true }, { t: "1 2 +", mono: true }],
    [{ t: "3", mono: true }, { t: "*", mono: true }, { t: "1 2 + 3", mono: true }],
    [{ t: "结束", color: C.goldText, bold: true }, "", { t: "1 2 + 3 *", mono: true, bold: true, color: C.ok }],
  ], 0.5, 1.1, 5.6, [1.3, 2.1, 2.2], { fontSize: 11, rowH: 0.36, tight: true });
  callout(s, "为什么左结合要用 `>=`", [
    "`1-2-3` 必须解析成 `(1-2)-3`。",
    "若用 `>`，第二个 `-` 不会把第一个弹出，",
    "结果就会变成 `1-(2-3)`，答案错了。",
  ], 6.25, 1.1, 3.25, 3.6, { fontSize: 11.5, fill: "FDF0EE", tcolor: C.bad, gap: 8 });
}

// 1.5a monotonic stack basic
{
  const s = content("1.5", "1 栈 · 应用四：单调栈", "单调栈：求「下一个更大元素」，O(n)");
  codeBlock(s, `def next_greater(a):
    """返回每个位置右边第一个更大元素的下标，不存在为 -1。"""
    n = len(a)
    ans = [-1] * n
    stack = []                        # 存下标，对应值单调递减
    for i, v in enumerate(a):
        while stack and a[stack[-1]] < v:
            ans[stack.pop()] = i
        stack.append(i)
    return ans


print(next_greater([2, 1, 2, 4, 3]))`, 0.5, 1.1, 6.3, 2.7, { fontSize: 10.5, lang: "py" });
  consoleBlock(s, "[3, 2, 3, -1, -1]", 7.0, 1.1, 2.5, 0.7);
  callout(s, "为什么是 O(n)", "每个下标**最多入栈一次、出栈一次**，总操作 2n——摊到每个元素身上是 O(1)。", 7.0, 2.0, 2.5, 1.8, { fontSize: 11 });
  card(s, 0.5, 4.05, 9.0, 0.9, C.cream);
  text(s, "数组 `[2, 1, 2, 4, 3]`：下标 0（值2）右边第一个更大是下标 3（值4）→ 结果里第 0 位是 3；下标 3（值4）右边没有更大的 → -1。", 0.7, 4.05, 8.6, 0.9, { fontSize: 10.5, valign: "middle", margin: 0, lsm: 1.2 });
}

// 1.5b trapping rain water
{
  const s = content("1.5", "1 栈 · 单调栈例题", "接雨水：LeetCode 42 / T26977");
  codeBlock(s, `def trap(height):
    """单调递减栈：弹出的是"坑底"，左右两侧的柱子决定水位。"""
    stack, water = [], 0
    for i, h in enumerate(height):
        while stack and height[stack[-1]] < h:
            bottom = stack.pop()
            if not stack:
                break
            left = stack[-1]
            width = i - left - 1
            depth = min(height[left], h) - height[bottom]
            water += width * depth
        stack.append(i)
    return water


print(trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]))`, 0.5, 1.1, 9.0, 3.15, { fontSize: 10, lang: "py" });
  consoleBlock(s, "6", 0.5, 4.4, 1.6, 0.55);
  text(s, "`bottom` 是坑底；一旦栈空说明左边没有挡板，直接 `break`。", 2.3, 4.4, 7.2, 0.55, { fontSize: 10.5, valign: "middle", margin: 0 });
}

// 1.5c trapping rain water two-pointer
{
  const s = content("1.5", "1 栈 · 单调栈例题", "接雨水：双指针写法（O(1) 空间）");
  codeBlock(s, `def trap2(height):
    if not height:
        return 0
    lo, hi = 0, len(height) - 1
    lmax, rmax, water = height[lo], height[hi], 0
    while lo < hi:
        if lmax <= rmax:
            lo += 1
            lmax = max(lmax, height[lo])
            water += lmax - height[lo]
        else:
            hi -= 1
            rmax = max(rmax, height[hi])
            water += rmax - height[hi]
    return water


print(trap2([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]))`, 0.5, 1.1, 6.3, 3.4, { fontSize: 10, lang: "py" });
  consoleBlock(s, "6", 7.0, 1.1, 2.5, 0.55);
  callout(s, "两种写法都对", "单调栈版本更容易迁移到「柱状图最大矩形」；双指针版本更省空间——面试两种都值得会。", 7.0, 1.8, 2.5, 2.0, { fontSize: 10.5 });
}

// 1.5d largest rectangle
{
  const s = content("1.5", "1 栈 · 单调栈例题", "柱状图中最大的矩形：LeetCode 84");
  codeBlock(s, `def largest_rectangle(heights):
    hs = [0] + list(heights) + [0]     # 首尾哨兵，省去边界判断
    stack, best = [], 0
    for i, h in enumerate(hs):
        while stack and hs[stack[-1]] > h:
            top = stack.pop()
            width = i - stack[-1] - 1  # 左右第一个更矮的柱子之间
            best = max(best, hs[top] * width)
        stack.append(i)
    return best


print(largest_rectangle([2, 1, 5, 6, 2, 3]))`, 0.5, 1.1, 6.3, 2.85, { fontSize: 10.5, lang: "py" });
  consoleBlock(s, "10", 7.0, 1.1, 2.5, 0.55);
  callout(s, "哨兵的作用", "首尾各加一个高度 0 的柱子，保证栈里所有元素最终都会被弹出结算，不用再写边界判断。", 7.0, 1.8, 2.5, 1.9, { fontSize: 11 });
}

// 1.5e pig stack
{
  const s = content("1.5", "1 栈 · 单调栈例题", "22067: 快速堆猪（辅助栈）");
  text(s, "支持 `push n`、`pop`、`min`（查询当前最轻的猪），要求每个操作 O(1)。", 0.5, 1.05, 9, 0.32, { fontSize: 12 });
  codeBlock(s, `def pig_stack(lines):
    stack, mins, out = [], [], []
    for line in lines:
        parts = line.split()
        if not parts:
            continue
        if parts[0] == 'push':
            v = int(parts[1])
            stack.append(v)
            mins.append(v if not mins else min(mins[-1], v))
        elif parts[0] == 'pop':
            if stack:
                stack.pop()
                mins.pop()
        elif parts[0] == 'min':
            if stack:
                out.append(str(mins[-1]))
    return out


print(pig_stack(["push 5", "push 2", "min", "pop", "min"]))`, 0.5, 1.45, 6.3, 3.4, { fontSize: 9.5, lang: "py" });
  consoleBlock(s, "['2', '5']", 7.0, 1.45, 2.5, 0.6);
  callout(s, "关键在同步", "**辅助栈和主栈同步进出**——不要试图在 pop 时「重新算最小值」，那是 O(n)。", 7.0, 2.15, 2.5, 1.9, { fontSize: 10.5, fill: C.mint, tcolor: C.dark });
}

// ============================ PART 2 ============================
sectionSlide("Part 2", "队列（Queue）", "FIFO 先进先出\ndeque · 双端队列 · 循环队列 · 单调队列");

// 2.1 FIFO
{
  const s = content("2.1", "2 队列（Queue）", "FIFO：先进先出");
  card(s, 0.5, 1.1, 9.0, 1.15, C.code);
  text(s, "入队 enqueue", 0.7, 1.35, 1.6, 0.3, { fontSize: 11, bold: true, color: C.green, margin: 0 });
  s.addShape(pres.shapes.LINE, { x: 2.35, y: 1.5, w: 0.4, h: 0, line: { color: C.green, width: 2, endArrowType: "triangle" } });
  cells(s, 2.9, 1.3, ["1", "2", "3", "4"], { cw: 0.6, ch: 0.46, fs: 14 });
  s.addShape(pres.shapes.LINE, { x: 5.4, y: 1.5, w: 0.4, h: 0, line: { color: C.green, width: 2, endArrowType: "triangle" } });
  text(s, "出队 dequeue", 5.9, 1.35, 1.7, 0.3, { fontSize: 11, bold: true, color: C.green, margin: 0 });
  text(s, "队尾 rear", 4.75, 1.82, 1.1, 0.2, { fontSize: 9, color: C.muted, margin: 0 });
  text(s, "队首 front", 2.95, 1.82, 1.1, 0.2, { fontSize: 9, color: C.muted, margin: 0 });
  table(s, [
    ["操作", "语义", "deque 写法", "复杂度"],
    ["入队", "队尾加入", { t: "q.append(x)", mono: true }, "O(1)"],
    ["出队", "队首移除", { t: "q.popleft()", mono: true }, "O(1)"],
    ["查队首", "", { t: "q[0]", mono: true }, "O(1)"],
    ["判空", "", { t: "not q", mono: true }, "O(1)"],
  ], 0.5, 2.5, 6.3, [1.1, 1.8, 2.2, 1.2], { fontSize: 11.5, rowH: 0.38 });
  callout(s, "⚠️ 别用 list.pop(0)", "它是 O(n)，会把第 12 周的 BFS 从 O(V+E) 拖成 O(V²)。", 7.0, 2.5, 2.5, 1.55, { fontSize: 10.5, fill: "FDF0EE", tcolor: C.bad });
  codeBlock(s, `from collections import deque
q = deque()
q.append(1); q.append(2); q.append(3)
print(q.popleft(), list(q))          # 1 [2, 3]`, 0.5, 4.35, 9.0, 0.65, { fontSize: 10, lang: "py" });
}

// 2.2 deque
{
  const s = content("2.2", "2 队列 · 双端队列", "deque：两端都能 O(1) 进出");
  codeBlock(s, `from collections import deque

d = deque([2, 3])
d.appendleft(1)      # [1, 2, 3]
d.append(4)          # [1, 2, 3, 4]
print(d.popleft(), d.pop(), list(d))     # 1 4 [2, 3]
d.rotate(1)          # 整体右移一位
print(list(d))       # [3, 2]`, 0.5, 1.1, 6.3, 2.5, { fontSize: 10.5, lang: "py" });
  consoleBlock(s, "1 4 [2, 3]\n[3, 2]", 7.0, 1.1, 2.5, 0.85);
  callout(s, "对应题目", "**05902: 双端队列**\ncs101.openjudge.cn/practice/05902/\n\n直接对应本节——两端各支持一种操作。", 7.0, 2.15, 2.5, 1.9, { fontSize: 11, lsm: 1.3 });
}

// 2.3a circular queue code
{
  const s = content("2.3", "2 队列 · 循环队列", "用定长数组实现队列（了解原理）");
  text(s, "出队后前面的空间会浪费。**循环队列**用取模让下标绕回：", 0.5, 1.05, 9, 0.32, { fontSize: 12.5 });
  codeBlock(s, `class CircularQueue:
    def __init__(self, capacity):
        self._data = [None] * (capacity + 1)     # 多留一格区分空与满
        self._head = self._tail = 0

    def is_empty(self):
        return self._head == self._tail

    def is_full(self):
        return (self._tail + 1) % len(self._data) == self._head

    def enqueue(self, x):
        if self.is_full():
            raise OverflowError("queue is full")
        self._data[self._tail] = x
        self._tail = (self._tail + 1) % len(self._data)

    def dequeue(self):
        if self.is_empty():
            raise IndexError("dequeue from empty queue")
        x = self._data[self._head]
        self._head = (self._head + 1) % len(self._data)
        return x`, 0.5, 1.4, 9.0, 3.5, { fontSize: 9.3, lang: "py" });
}

// 2.3b circular queue demo + why extra slot
{
  const s = content("2.3", "2 队列 · 循环队列", "复用空出的格子");
  codeBlock(s, `q = CircularQueue(3)
for v in [1, 2, 3]:
    q.enqueue(v)
print(q.dequeue(), q.dequeue())        # 1 2
q.enqueue(4)                            # 复用了前面空出的格子
print(q.dequeue(), q.dequeue())        # 3 4`, 0.5, 1.1, 5.6, 1.9, { fontSize: 10.5, lang: "py" });
  consoleBlock(s, "1 2\n3 4", 6.25, 1.1, 3.25, 0.85);
  callout(s, "为什么多留一格", "容量为 3 时数组开 4 格。否则 `head == tail` 既可能表示「空」也可能表示「满」，两种状态分不清——多留一格后，`tail` 追上 `head` 的前一格就是满。", 0.5, 3.15, 9.0, 1.75, { fontSize: 12, fill: C.mint, tcolor: C.dark });
}

// 2.4a josephus queue simulation
{
  const s = content("2.4", "2 队列 · 例题", "约瑟夫问题：队列模拟");
  text(s, "n 个人围成一圈，从第 1 个开始报数，报到 m 的人出列，求出列顺序。**02746**", 0.5, 1.05, 9, 0.32, { fontSize: 12 });
  codeBlock(s, `from collections import deque


def josephus_queue(n, m):
    q = deque(range(1, n + 1))
    order = []
    while q:
        q.rotate(-(m - 1))       # 前 m-1 个人轮到队尾
        order.append(q.popleft())
    return order


print(josephus_queue(8, 3))`, 0.5, 1.4, 6.3, 2.9, { fontSize: 10.5, lang: "py" });
  consoleBlock(s, "[3, 6, 1, 5, 2, 8, 4, 7]", 7.0, 1.4, 2.5, 0.7);
  callout(s, "直观但 O(nm)", "`rotate` 本身是 O(m)，循环 n 次——人数、步长大时会超时，见下页 O(n) 递推。", 7.0, 2.3, 2.5, 1.8, { fontSize: 10.5 });
}

// 2.4b josephus formula
{
  const s = content("2.4", "2 队列 · 例题", "约瑟夫问题：O(n) 递推公式");
  text(s, "只求**最后一人**时不需要模拟：设 f(1) = 0，f(k) = (f(k−1) + m) % k，答案为 f(n) + 1。", 0.5, 1.05, 9, 0.5, { fontSize: 12.5, lsm: 1.2 });
  codeBlock(s, `def josephus_formula(n, m):
    r = 0
    for k in range(2, n + 1):
        r = (r + m) % k
    return r + 1


print(josephus_formula(8, 3))`, 0.5, 1.75, 6.3, 2.0, { fontSize: 10.5, lang: "py" });
  consoleBlock(s, "7", 7.0, 1.75, 2.5, 0.55);
  callout(s, "两者一致", "队列模拟里出列顺序 `[3, 6, 1, 5, 2, 8, 4, 7]` 的**最后一个**正是 7——两种做法互相印证。", 0.5, 4.0, 9.0, 1.0, { fontSize: 12, fill: C.mint, tcolor: C.dark });
}

// 2.5 stable sort
{
  const s = content("2.5", "2 队列 · 例题", "E07618: 病人排队（稳定排序）");
  text(s, "老年人（≥60 岁）优先，同为老年人按年龄从大到小；非老年人按登记顺序。", 0.5, 1.05, 9, 0.32, { fontSize: 12 });
  codeBlock(s, `def triage(patients):
    """patients: [(id, age)]，按登记顺序给出。"""
    old = [p for p in patients if p[1] >= 60]
    young = [p for p in patients if p[1] < 60]
    old.sort(key=lambda p: -p[1])        # 稳定排序：同龄保持登记顺序
    return [p[0] for p in old + young]


print(triage([("021", 40), ("002", 65), ("001", 70), ("003", 65)]))`, 0.5, 1.4, 9.0, 2.5, { fontSize: 10, lang: "py", hl: [5] });
  consoleBlock(s, "['001', '002', '003', '021']", 0.5, 4.05, 3.6, 0.55);
  text(s, "两个 65 岁的病人（002、003）必须保持登记顺序——如果用了**不稳定**的排序，结果就是随机的。", 4.3, 4.05, 5.2, 0.85, { fontSize: 11, lsm: 1.2 });
}

// 2.6 sliding window max
{
  const s = content("2.6", "2 队列 · 应用：单调队列", "滑动窗口最大值：LeetCode 239");
  text(s, "队列中存下标，对应值单调递减，**队首永远是窗口最大值**：", 0.5, 1.05, 9, 0.32, { fontSize: 12.5 });
  codeBlock(s, `from collections import deque


def max_sliding_window(nums, k):
    dq, out = deque(), []
    for i, v in enumerate(nums):
        while dq and nums[dq[-1]] <= v:      # 比新来的小的都没用了
            dq.pop()
        dq.append(i)
        if dq[0] <= i - k:                    # 队首滑出窗口
            dq.popleft()
        if i >= k - 1:
            out.append(nums[dq[0]])
    return out


print(max_sliding_window([1, 3, -1, -3, 5, 3, 6, 7], 3))`, 0.5, 1.4, 6.3, 3.15, { fontSize: 9.8, lang: "py" });
  consoleBlock(s, "[3, 3, 5, 5, 6, 7]", 7.0, 1.4, 2.5, 0.7);
  callout(s, "时间 O(n)", "每个下标最多进队、出队各一次——和单调栈是同一个论证。", 7.0, 2.25, 2.5, 1.6, { fontSize: 11 });
}

// Part 3 comparison
{
  const s = content("3", "3 栈与队列对照", "同一类工具，两种纪律");
  table(s, [
    ["", "栈 Stack", "队列 Queue"],
    [{ t: "顺序", bold: true }, "LIFO 后进先出", "FIFO 先进先出"],
    [{ t: "Python", bold: true }, { t: "list（append / pop）", mono: true }, { t: "deque（append / popleft）", mono: true }],
    [{ t: "典型应用", bold: true }, "括号匹配、表达式、单调栈、递归", "BFS、模拟排队、单调队列"],
    [{ t: "本课后续", bold: true }, "第 8 周递归（系统栈）", "第 12 周 BFS"],
  ], 0.5, 1.2, 9.0, [1.4, 3.8, 3.8], { fontSize: 13, rowH: 0.62 });
  callout(s, "互相实现", "两个栈可以实现一个队列，两个队列可以实现一个栈——怎么做、均摊复杂度是多少，见后面的思考题第 1 题。", 0.5, 4.35, 9.0, 0.65, { fontSize: 12, fill: C.mint, tcolor: C.dark });
}

// ============================ PART 4 ============================
sectionSlide("Part 4", "贪心与矩阵练习", "两遍扫描 · 状态型贪心 · 矩阵遍历\n同一个「卷积」，两个场景");

// 4.1 candy
{
  const s = content("4.1", "4 贪心与矩阵练习", "LC135 / T26971: 分发糖果");
  text(s, "每个孩子至少一颗；相邻孩子中评分高的必须拿更多。求最少糖果数。**两遍扫描**：", 0.5, 1.05, 9, 0.5, { fontSize: 12, lsm: 1.2 });
  codeBlock(s, `def candy(ratings):
    n = len(ratings)
    c = [1] * n
    for i in range(1, n):
        if ratings[i] > ratings[i - 1]:
            c[i] = c[i - 1] + 1
    for i in range(n - 2, -1, -1):
        if ratings[i] > ratings[i + 1]:
            c[i] = max(c[i], c[i + 1] + 1)
    return sum(c)


print(candy([1, 0, 2]), candy([1, 2, 2]))`, 0.5, 1.65, 6.3, 3.0, { fontSize: 10.2, lang: "py", hl: [8] });
  consoleBlock(s, "5 4", 7.0, 1.65, 2.5, 0.55);
  callout(s, "为什么必须两遍、用 max", "一遍只能满足单侧约束（从左往右保证右边比左边高就多给，从右往左保证反向条件）。第 8 行用 `max` 而不是直接赋值，是为了不破坏第一遍的结果。", 7.0, 2.35, 2.5, 2.2, { fontSize: 10.3, lsm: 1.2 });
}

// 4.2 shopping
{
  const s = content("4.2", "4 贪心与矩阵练习", "M20744: 土豪购物");
  text(s, "一串商品价格，选一段连续区间，**最多可以丢掉其中一件**，求最大总价。是「最大连续子数组和」的变形，两个状态：", 0.5, 1.05, 9, 0.55, { fontSize: 12, lsm: 1.2 });
  codeBlock(s, `def max_with_one_drop(a):
    keep = drop = best = a[0]          # keep: 没丢过；drop: 已丢掉一个
    for v in a[1:]:
        drop = max(keep, drop + v)     # 要么这次丢掉 v，要么之前丢过
        keep = max(v, keep + v)
        best = max(best, keep, drop)
    return best


print(max_with_one_drop([1, -2, 3, 4]))     # 8  丢掉 -2
print(max_with_one_drop([-1, -2, -3]))      # -1 至少留一件`, 0.5, 1.7, 9.0, 2.2, { fontSize: 10, lang: "py", hl: [4] });
  callout(s, "⚠️ 赋值顺序在 DP 里会出错", "第 4 行 `drop` 必须**先算**，因为它用的是**上一轮**的 `keep`——如果先更新 `keep` 再算 `drop`，`drop` 就会错误地用到本轮的 `keep`。", 0.5, 4.0, 9.0, 1.0, { fontSize: 10.5, fill: "FDF0EE", tcolor: C.bad });
}

// 4.3 convolution
{
  const s = content("4.3", "4 贪心与矩阵练习", "E19942: 二维矩阵上的卷积运算");
  codeBlock(s, `def conv2d(a, kernel):
    m, n = len(a), len(a[0])
    p, q = len(kernel), len(kernel[0])
    out = [[0] * (n - q + 1) for _ in range(m - p + 1)]
    for i in range(m - p + 1):
        for j in range(n - q + 1):
            out[i][j] = sum(a[i + di][j + dj] * kernel[di][dj]
                            for di in range(p) for dj in range(q))
    return out


a = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
k = [[1, 0], [0, 1]]
print(conv2d(a, k))`, 0.5, 1.1, 6.3, 3.15, { fontSize: 10, lang: "py" });
  consoleBlock(s, "[[6, 8], [12, 14]]", 7.0, 1.1, 2.5, 0.6);
  callout(s, "同一个运算，两个场景", "这就是第 15 周卷积神经网络里 CNN 的那个「卷积」——核（kernel）滑过矩阵、对应位置相乘再求和，数学上一模一样。", 7.0, 1.85, 2.5, 2.3, { fontSize: 10.5, fill: C.mint, tcolor: C.dark });
}

// Homework table
{
  const s = content("§", "本周作业", "12 道题：栈、队列、贪心综合练习");
  table(s, [
    ["#", "题目", "平台 / 编号", "考点"],
    ["1", "有效的括号", { t: "LC 20", mono: true }, "栈、括号匹配"],
    ["2", "波兰表达式", { t: "02694", mono: true }, "前缀求值"],
    ["3", "后序表达式求值", { t: "24588", mono: true }, "后缀求值"],
    ["4", "快速堆猪", { t: "22067", mono: true }, "辅助栈"],
    ["5", "双端队列", { t: "05902", mono: true }, "deque"],
    ["6", "约瑟夫问题", { t: "02746", mono: true }, "队列模拟"],
    ["7", "病人排队", { t: "E07618", mono: true }, "稳定排序"],
    ["8", "二维矩阵上的卷积运算", { t: "E19942", mono: true }, "矩阵遍历"],
    ["9", "土豪购物", { t: "M20744", mono: true }, "线性 DP 雏形"],
    [{ t: "10*", color: C.goldText }, "接雨水", { t: "LC 42 / T26977", mono: true }, "单调栈 / 双指针"],
    [{ t: "11*", color: C.goldText }, "分发糖果", { t: "LC 135 / T26971", mono: true }, "两遍扫描贪心"],
    [{ t: "12*", color: C.goldText }, "滑动窗口最大值", { t: "LC 239", mono: true }, "单调队列"],
  ], 0.5, 1.05, 9.0, [0.6, 2.7, 2.5, 3.2], { fontSize: 9.5, rowH: 0.29, tight: true });
  text(s, "* 选做。E 开头与纯数字编号：cs101.openjudge.cn；LC：leetcode.cn。", 0.5, 4.8, 9, 0.25, { fontSize: 9.5, color: C.muted, margin: 0 });
}

// Thinking questions
{
  const s = content("?", "本周练习 · 思考题", "思考题");
  const qs = [
    ["两栈实现队列", "用两个栈实现一个队列，写出 `enqueue` / `dequeue`，并分析均摊复杂度为什么是 O(1)。"],
    [">= 换成 >", "调度场算法中若把 `>=` 改成 `>`，`1-2-3` 的结果会变成什么？为什么左结合必须用 `>=`？"],
    ["循环队列多留一格", "循环队列为什么要多留一格？不留的话如何用一个计数器解决？"],
    ["栈 vs 队列", "单调栈和单调队列的区别是什么？为什么滑动窗口最大值要用队列而不是栈？"],
    ["合法出栈序列", "长度为 n 的入栈序列，合法出栈序列共有多少种？（提示：卡特兰数）见 **27217**。"],
  ];
  qs.forEach((q, i) => {
    const x = 0.5 + (i % 2) * 4.6, y = 1.1 + Math.floor(i / 2) * 1.32;
    card(s, x, y, 4.4, 1.18, i % 2 === 0 ? C.code : C.cream);
    numCircle(s, i + 1, x + 0.18, y + 0.13, 0.36, C.dark);
    text(s, q[0], x + 0.65, y + 0.1, 3.6, 0.32, { fontSize: 12.5, bold: true, color: C.dark, valign: "middle", margin: 0 });
    s.addText(runs(q[1], { color: C.text }), { x: x + 0.18, y: y + 0.5, w: 4.05, h: 0.62, fontFace: FONT, fontSize: 10, margin: 0, isTextBox: true, valign: "top", lineSpacingMultiple: 1.1 });
  });
}

summarySlide("本周小结", [
  ["容器选对", "栈 = LIFO，用 `list` 的尾部；队列 = FIFO，用 `deque`。**`list.pop(0)` 是队列的头号错误写法。**"],
  ["栈的四类应用", "**匹配**（括号）、**逆序**（进制）、**表达式**（调度场 + 后缀求值）、**单调栈**。"],
  ["单调结构的威力", "单调栈 / 单调队列把「求下一个更大元素」「滑动窗口最值」从 O(n²) 降到 **O(n)**，靠的是「每个元素最多进出一次」。"],
  ["辅助栈", "需要「当前最小值」的栈，用**辅助栈同步进出**，不要重算。"],
  ["稳定排序", "稳定排序在「同键保持原序」的题里是**正确性要求**，不是优化。"],
]);

// Next week
sectionSlide("下周预告", "递归", "把「函数调用自己」这件事讲透\n以及它和系统栈的关系");

  await D.save(OUT);
})().catch((e) => { console.error(e); process.exit(1); });

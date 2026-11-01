# 第7周 矩阵、队列、栈与贪心练习

*Updated 2026-10-31 GMT+8*
 *Compiled by Hongfei Yan (2026 Fall)*
https://github.com/GMyhf/2026fall-cs101

> **课程安排对应**：第 7 周
> **主题与学习重点**：矩阵、队列、栈与贪心练习。

**知识点**：栈的 LIFO 特性与实现、括号匹配、进制转换、中缀 / 后缀 / 前缀表达式与求值、单调栈、队列的 FIFO 特性、`deque` 与双端队列、循环队列、约瑟夫问题、滑动窗口最大值、矩阵与贪心的综合练习。

**本周要回答三个问题**：

1. **为什么 `list.pop(0)` 会拖垮 BFS？** 队列必须 O(1) 出队；用错容器，O(n) 悄悄变成 O(n²)。
2. **表达式怎么让机器算，而不是让人算？** 后缀表达式没有括号、不用管优先级——栈从左到右扫一遍就求出值。
3. **"下一个更大元素"要 O(n²) 吗？** 单调栈 / 单调队列：每个元素最多进出一次，把 O(n²) 降到 O(n)。

> 一句话概括：栈管后进先出，队列管先进先出——**选对了容器，很多题目会自己变简单**。

---

# 1 栈（Stack）

## 1.1 LIFO：后进先出

```
        push(4)                pop() -> 4
   |  |          | 4|              |  |
   | 3|   ==>    | 3|     ==>      | 3|
   | 2|          | 2|              | 2|
   | 1|          | 1|              | 1|
   +--+          +--+              +--+
   栈底在下，栈顶在上；只允许在栈顶插入与删除
```

| 操作 | 语义 | 复杂度 |
| ---- | ---- | ---- |
| `push(x)` | 入栈 | 均摊 O(1) |
| `pop()` | 出栈并返回栈顶 | O(1) |
| `peek()` | 查看栈顶不弹出 | O(1) |
| `is_empty()` | 判空 | O(1) |

**在 OJ 上直接用 `list`**：`append` / `pop` / `[-1]`，代码更短、常数更小。

```python
class Stack:
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
        return len(self._items)


s = Stack()
for v in [1, 2, 3]:
    s.push(v)
print(s.pop(), s.peek(), len(s))     # 3 2 2
```

四个方法里，`push` / `pop` 都在同一端（列表尾部）操作，均摊 O(1)；`peek` 只看不删；
`pop` 先判空，是为了在空栈上给出清楚的报错信息。

> ⚠️ **绝不要用 list 的头部当栈顶**：`insert(0, x)` 和 `pop(0)` 都是 O(n)。

**Python 里实现栈的三种方式**（参见 <https://www.geeksforgeeks.org/stack-in-python/>）：

<img src="https://raw.githubusercontent.com/GMyhf/img/main/img/image-20231017141624213.png" alt="image-20231017141624213" style="zoom: 50%;" />

| 实现 | 入栈 / 出栈 | 说明 |
| ---- | ---- | ---- |
| `list` | `append` / `pop` | OJ 首选，最简单 |
| `collections.deque` | `append` / `pop` | 两端都 O(1)，栈和队列可以用同一种容器 |
| `queue.LifoQueue` | `put` / `get` | 线程安全，带锁，做题时偏慢，一般用不到 |

## 1.2 应用一：括号匹配

**LeetCode 20. 有效的括号**，<https://leetcode.cn/problems/valid-parentheses/>

```python
def is_valid(s):
    pairs = {')': '(', ']': '[', '}': '{'}
    stack = []
    for ch in s:
        if ch in '([{':
            stack.append(ch)
        elif ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
    return not stack          # 结束时必须为空


print(is_valid("([]{})"), is_valid("(]"), is_valid("("))   # True False False
```

**三个易错点**：遇右括号时栈已空（直接判假）；栈顶弹出的字符不配对（直接判假）；
**扫描结束栈非空**（比如 `"(("`）。第三个最常被漏。

**变形：输出不匹配的位置**——栈里存的不是字符而是**下标**：

```python
def mark_unmatched(line):
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


print(repr(mark_unmatched(")(a(b)")))   # '?$    '
# 第 0 位是多余的右括号 -> '?'；第 1 位是多余的左括号 -> '$'
```

扫描结束后栈里剩下的下标，就是所有没配上的左括号。

## 1.3 应用二：进制转换（逆序输出）

除基取余，余数**逆序**输出——正是栈的形状。

```python
DIGITS = "0123456789ABCDEF"


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


print(to_base(233, 2), to_base(233, 8), to_base(233, 16))   # 11101001 351 E9
```

**为什么要栈**：除基取余得到的数字是**从低位到高位**的顺序，但输出要从高位开始——
先压栈、再依次弹出，天然就是逆序。

## 1.4 应用三：表达式

对 `(1 + 2) * 3`：

| 形式 | 写法 | 特点 |
| ---- | ---- | ---- |
| 中缀 infix | `( 1 + 2 ) * 3` | 人类习惯，需要括号与优先级 |
| 前缀 prefix（波兰式） | `* + 1 2 3` | 运算符在前，无需括号 |
| 后缀 postfix（逆波兰式） | `1 2 + 3 *` | 运算符在后，**最易被机器求值** |

**为什么后缀最好算**：从左到右扫描，碰到数字就压栈，碰到运算符就弹出栈顶两个数、算完再压回去——
不需要括号，也不用比较优先级。

### 后缀求值

**24588: 后序表达式求值**，<http://cs101.openjudge.cn/practice/24588/>

```python
def eval_postfix(tokens):
    stack = []
    for tk in tokens:
        if tk in ('+', '-', '*', '/'):
            b = stack.pop()          # ⚠️ 先弹出的是右操作数
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


print(eval_postfix("1 2 + 3 *".split()))     # 9.0
print(eval_postfix("10 3 - 2 -".split()))    # 5.0  —— 左结合
```

> ⚠️ **弹出顺序别搞反**：`b` 先弹（右操作数），`a` 后弹（左操作数）；减法、除法不满足交换律，反了就错。

### 前缀求值

**02694: 波兰表达式**，<http://cs101.openjudge.cn/practice/02694/>

从**右往左**扫描，规则对称：

```python
def eval_prefix(tokens):
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


print(f"{eval_prefix('* + 11.0 12.0 + 24.0 35.0'.split()):.6f}")   # 1357.000000
```

**对称在哪**：后缀从左到右、先弹右操作数；前缀从右到左、先弹左操作数——方向反了，弹出顺序也跟着反。

### 中缀转后缀：调度场算法（Shunting Yard）

由 Dijkstra 提出。维护**运算符栈**与**输出队列**：

1. 操作数 → 直接输出；
2. `(` → 入栈；
3. `)` → 弹栈输出直到遇 `(`，弹掉 `(` 不输出；
4. 运算符 op → 当栈顶是运算符且**优先级 ≥ op**（左结合）时弹出输出，然后 op 入栈；
5. 扫描结束 → 栈中剩余全部弹出。

实现分两步：先把字符串切成 token（`tokenize`），再用运算符栈把 token 序列转成后缀（`infix_to_postfix`）。

```python
PREC = {'+': 1, '-': 1, '*': 2, '/': 2}


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
    return tokens


def infix_to_postfix(tokens):
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


print(' '.join(infix_to_postfix(tokenize("(1+2)*3"))))      # 1 2 + 3 *
print(' '.join(infix_to_postfix(tokenize("1+2*3-4"))))      # 1 2 3 * + 4 -
```

关键是 `PREC[ops[-1]] >= PREC[tk]` 这一行：栈顶优先级**不低于**当前运算符才弹出——它决定了结合方向。

**手工模拟** `( 1 + 2 ) * 3`：

| 读入 | 运算符栈 | 输出 |
| ---- | ---- | ---- |
| `(` | `(` | |
| `1` | `(` | `1` |
| `+` | `( +` | `1` |
| `2` | `( +` | `1 2` |
| `)` | | `1 2 +` |
| `*` | `*` | `1 2 +` |
| `3` | `*` | `1 2 + 3` |
| 结束 | | `1 2 + 3 *` |

> **为什么左结合要用 `>=`**：`1-2-3` 必须解析成 `(1-2)-3`。
> 若用 `>`，第二个 `-` 不会把第一个弹出，结果变成 `1-(2-3)`，答案就错了。

## 1.5 应用四：单调栈

**单调栈**中的元素保持单调，用来求"下一个更大 / 更小元素"，时间 **O(n)**。

```python
def next_greater(a):
    """返回每个位置右边第一个更大元素的下标，不存在为 -1。"""
    n = len(a)
    ans = [-1] * n
    stack = []                        # 存下标，对应值单调递减
    for i, v in enumerate(a):
        while stack and a[stack[-1]] < v:
            ans[stack.pop()] = i
        stack.append(i)
    return ans


print(next_greater([2, 1, 2, 4, 3]))   # [3, 2, 3, -1, -1]
```

**读法**：数组 `[2, 1, 2, 4, 3]` 中，下标 0（值 2）右边第一个更大的是下标 3（值 4），所以结果第 0 位是 3；
下标 3（值 4）右边没有更大的，结果是 -1。

**为什么是 O(n)**：每个下标最多入栈一次、出栈一次，总操作 2n——摊到每个元素身上是 O(1)。

### 工作原理与类型选择

- **入栈**：新元素要进栈时，先把所有"破坏单调性"的栈顶弹出，再压入新元素；
- **出栈**：不单独发生，而是在入栈时为了保持单调性**顺带**弹出——**被弹出的那一刻，就是它找到答案的时刻**。

| 要求的东西 | 栈内（从底到顶）的单调性 | 弹栈条件 |
| ---- | ---- | ---- |
| 右边第一个**更大**元素 | 单调递减 | `a[栈顶] < 新元素` |
| 右边第一个**更小**元素 | 单调递增 | `a[栈顶] > 新元素` |

两个变形：答案要的是**值**而不是下标，就在弹栈时记 `nums[i]`；求"更小"时把比较方向反过来。

```python
def next_greater_value(nums):
    """返回每个元素右边第一个更大的值，不存在为 -1。"""
    res = [-1] * len(nums)
    stack = []                        # 存下标，对应值单调递减
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] < x:
            res[stack.pop()] = x
        stack.append(i)
    return res


def next_smaller(a):
    """返回每个位置右边第一个更小元素的下标，不存在为 -1。"""
    ans = [-1] * len(a)
    stack = []                        # 存下标，对应值单调递增
    for i, v in enumerate(a):
        while stack and a[stack[-1]] > v:
            ans[stack.pop()] = i
        stack.append(i)
    return ans


print(next_greater_value([4, 5, 2, 25]))   # [5, 25, 25, -1]
print(next_smaller([2, 1, 2, 4, 3]))       # [1, -1, -1, 4, -1]
```

单调栈的典型场景：下一个更大 / 更小元素、接雨水、柱状图最大矩形；
滑动窗口最值通常用双端队列做（§2.6 的单调队列），可以看成"两头都能弹"的单调栈。

### 例：04137: 最小新整数（单调栈 + 贪心）

**04137: 最小新整数**，<http://cs101.openjudge.cn/practice/04137/>

> 给定一个各位都不为 0 的正整数 n，从中删除 k 位，使剩下的数最小。例如 n = 9128456，k = 2，结果是 12456。

**贪心**：高位越小越好。从左往右扫，只要栈顶数字比当前数字大、且还有删除名额，就把栈顶删掉——
"前面的大数字让位给后面的小数字"。栈里于是保持单调不降。

```python
def remove_k_digits(num, k):
    stack = []
    for d in num:
        while k and stack and stack[-1] > d:   # 前面的大数字让位
            stack.pop()
            k -= 1
        stack.append(d)
    while k:                                  # 没删够：剩下单调不降，删尾部
        stack.pop()
        k -= 1
    return int(''.join(stack))


print(remove_k_digits("9128456", 2), remove_k_digits("1444", 3))   # 12456 1
```

> 扫完后若还没删够，栈里已经单调不降，**删尾部**最划算（`1444` 删 3 位就是这种情况）。
> 分工很清楚：贪心规则决定删谁，栈让每次删除都是 O(1)，总复杂度 O(m)（m 为位数）。

### 例：接雨水

**LeetCode 42. 接雨水**，<https://leetcode.cn/problems/trapping-rain-water/>；
对应 OJ **T26977: 接雨水**。

```python
def trap(height):
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


print(trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]))   # 6
```

![img](https://raw.githubusercontent.com/GMyhf/img/main/img/1697427386.png)

`bottom` 是坑底；弹出坑底后一旦栈空，说明左边没有挡板，水存不住，直接 `break`。

**双指针写法**（更短，O(1) 空间）：

```python
def trap2(height):
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


print(trap2([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]))   # 6
```

两种写法都对：单调栈版本更容易迁移到下面的"柱状图最大矩形"；双指针版本更省空间。

### 例：柱状图中最大的矩形

**LeetCode 84**，<https://leetcode.cn/problems/largest-rectangle-in-histogram/>

```python
def largest_rectangle(heights):
    hs = [0] + list(heights) + [0]     # 首尾哨兵，省去边界判断
    stack, best = [], 0
    for i, h in enumerate(hs):
        while stack and hs[stack[-1]] > h:
            top = stack.pop()
            width = i - stack[-1] - 1  # 左右第一个更矮的柱子之间
            best = max(best, hs[top] * width)
        stack.append(i)
    return best


print(largest_rectangle([2, 1, 5, 6, 2, 3]))   # 10
```

**哨兵的作用**：首尾各加一个高度 0 的柱子，保证栈里所有元素最终都会被弹出结算，不用再写边界判断。

### 例：27205: 护林员盖房子 加强版（矩阵 + 单调栈）

**27205: 护林员盖房子 加强版**，<http://cs101.openjudge.cn/pctbook/T27205/>

> m×n 的 0/1 矩阵（m, n ≤ 1000），1 是树、0 是空地。求全为空地的矩形的最大面积。

暴力枚举矩形是 O(m²n²)，必然超时。**把二维问题压成 m 次一维问题**：
逐行往下扫，`heights[j]` 记录"以当前行为底、第 j 列向上连续空地的高度"，
于是每一行都是一张柱状图，套用上面的 `largest_rectangle` 即可，总复杂度 O(mn)。

```python
def max_empty_rect(grid):
    """grid 中 0 为空地、1 为树，返回全 0 矩形的最大面积。"""
    n = len(grid[0])
    heights = [0] * n
    best = 0
    for row in grid:
        for j in range(n):
            heights[j] = heights[j] + 1 if row[j] == 0 else 0
        best = max(best, largest_rectangle(heights))
    return best


forest = [[0, 1, 0, 0],
          [0, 0, 0, 0],
          [1, 0, 0, 0],
          [0, 0, 1, 0]]
print(max_empty_rect(forest))   # 6
```

样例中最大空地是第 1–2 行、第 1–3 列（从 0 计）的 2×3 矩形。遇到树时高度**清零**，这一行的柱状图就在那里断开。

### 例：22067: 快速堆猪

**22067: 快速堆猪**，<http://cs101.openjudge.cn/practice/22067/>

> 支持 `push n`、`pop`、`min`（查询当前最轻的猪），要求每个操作 O(1)。

**辅助栈**：再开一个栈，同步记录"到当前为止的最小值"。

```python
import sys


def pig_stack(lines):
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


print(pig_stack(["push 5", "push 2", "min", "pop", "min"]))   # ['2', '5']
```

> 关键在于**辅助栈和主栈同步进出**——不要试图在 pop 时"重新算最小值"，那是 O(n)。

---

# 2 队列（Queue）

## 2.1 FIFO：先进先出

```
   入队 enqueue ──►  [ 1 | 2 | 3 | 4 ]  ──► 出队 dequeue
                      队尾 rear    队首 front
```

| 操作 | 语义 | `deque` 写法 | 复杂度 |
| ---- | ---- | ---- | ---- |
| 入队 | 队尾加入 | `q.append(x)` | O(1) |
| 出队 | 队首移除 | `q.popleft()` | O(1) |
| 查队首 | | `q[0]` | O(1) |
| 判空 | | `not q` | O(1) |

```python
from collections import deque

q = deque()
q.append(1); q.append(2); q.append(3)
print(q.popleft(), list(q))          # 1 [2, 3]
```

> ⚠️ **不要用 `list.pop(0)` 当出队**——它是 O(n)，会把第 12 周的 BFS 从 O(V+E) 拖成 O(V²)。

**Python 里实现队列的三种方式**（参见 <https://www.geeksforgeeks.org/queue-in-python/>）：

<img src="https://raw.githubusercontent.com/GMyhf/img/main/img/image-20231017141756212.png" alt="image-20231017141756212" style="zoom:50%;" />

| 实现 | 入队 / 出队 | 出队复杂度 | 说明 |
| ---- | ---- | ---- | ---- |
| `list` | `append` / `pop(0)` | O(n) | 能用但慢，数据大时超时 |
| `collections.deque` | `append` / `popleft` | O(1) | **做题首选** |
| `queue.Queue` | `put` / `get` | O(1) | 线程安全，为多线程设计，做题时常数大 |

## 2.2 双端队列

`deque` 两端都能 O(1) 进出：

```python
from collections import deque

d = deque([2, 3])
d.appendleft(1)      # [1, 2, 3]
d.append(4)          # [1, 2, 3, 4]
print(d.popleft(), d.pop(), list(d))     # 1 4 [2, 3]
d.rotate(1)          # 整体右移一位
print(list(d))       # [3, 2]
```

**05902: 双端队列**，<http://cs101.openjudge.cn/practice/05902/>——直接对应本节。

> 进队从队尾进入；出队既可以从队头（`type=2, c=0`），也可以从队尾（`type=2, c=1`）。
> 所有操作结束后按队头到队尾输出剩余元素，队列为空则输出 `NULL`。

```python
from collections import deque


def double_ended_queue(ops):
    """ops: [(type, x)]；type=1 入队尾，type=2 时 x=0 出队头、x=1 出队尾。"""
    q = deque()
    for t, x in ops:
        if t == 1:
            q.append(x)
        elif x == 0:
            q.popleft()
        else:
            q.pop()
    return ' '.join(map(str, q)) if q else 'NULL'


print(double_ended_queue([(1, 2), (1, 3), (1, 4), (2, 0), (2, 1)]))           # 3
print(double_ended_queue([(1, 1), (1, 2), (1, 3), (2, 0), (2, 1), (2, 0)]))   # NULL
```

### 例：04067: 回文数字（Palindrome Number）

**04067: 回文数字（Palindrome Number）**，<http://cs101.openjudge.cn/practice/04067/>

> 每行一个非负整数，判断它正着写和倒着写是否相等。

双端队列的直观用法：两端**同时**往里收，`popleft()` 和 `pop()` 比较，直到只剩 0 或 1 个字符。

```python
from collections import deque


def is_palindrome(s):
    dq = deque(s)
    while len(dq) > 1:
        if dq.popleft() != dq.pop():
            return False
    return True


print([is_palindrome(s) for s in ["11", "123", "0", "14277241", "67945497"]])
# [True, False, True, True, False]
```

> 实战里 `s == s[::-1]` 一行就够；这道题的价值在于体会"两端同时出"这一 `deque` 独有的操作。

### 例：04099: 队列和栈

**04099: 队列和栈**，<http://cs101.openjudge.cn/practice/04099/>

> 对同一串 `push k` / `pop` 操作，分别用队列和栈执行，输出两者最后从左到右存的数字；
> 若某次 `pop` 时已空，两行都输出 `error`。

同一组操作喂给两个容器，**差别只在 `pop` 从哪一端取**：

```python
from collections import deque


def queue_and_stack(ops):
    """ops 为 'push k' / 'pop' 的列表；返回两行输出。"""
    q, s = deque(), []
    for op in ops:
        if op == 'pop':
            if not q:                  # 队列和栈的元素个数始终相同
                return ['error', 'error']
            q.popleft()
            s.pop()
        else:
            k = int(op.split()[1])
            q.append(k)
            s.append(k)
    return [' '.join(map(str, q)), ' '.join(map(str, s))]


print(queue_and_stack(["push 1", "push 3", "pop", "push 5"]))   # ['3 5', '1 5']
print(queue_and_stack(["pop"]))                                 # ['error', 'error']
```

> 读题细节：一旦出错，**这一组**就只输出 `error`，后面的操作不必再执行（但输入仍要读完）。

## 2.3 循环队列（了解原理）

用定长数组实现队列时，出队后前面的空间会浪费。**循环队列**用取模让下标绕回：

```python
class CircularQueue:
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
        return x


q = CircularQueue(3)
for v in [1, 2, 3]:
    q.enqueue(v)
print(q.dequeue(), q.dequeue())        # 1 2
q.enqueue(4)                            # 复用了前面空出的格子
print(q.dequeue(), q.dequeue())        # 3 4
```

**为什么多留一格**：容量为 3 时数组开 4 格。否则 `head == tail` 既可能表示"空"也可能表示"满"，
两种状态分不清；多留一格后，`tail` 追到 `head` 的前一格就是满。

## 2.4 例：约瑟夫问题

**02746: 约瑟夫问题**，<http://cs101.openjudge.cn/practice/02746/>

> n 个人围成一圈，从第 1 个开始报数，报到 m 的人出列，求最后出列者（或出列顺序）。

**队列模拟**（直观，O(nm)）：

```python
from collections import deque


def josephus_queue(n, m):
    q = deque(range(1, n + 1))
    order = []
    while q:
        q.rotate(-(m - 1))       # 前 m-1 个人轮到队尾
        order.append(q.popleft())
    return order


print(josephus_queue(8, 3))      # [3, 6, 1, 5, 2, 8, 4, 7]
```

直观但 **O(nm)**：`rotate` 本身是 O(m)，循环 n 次——人数、步长都大时会超时，见下面的 O(n) 递推。

**OJ 原题形式**（题库里也作 **M02746: 约瑟夫问题**，<http://cs101.openjudge.cn/pctbook/M02746/>）：
n 只猴子围圈选大王，报到 m 的出圈，直到只剩一只；每行输入 `n m`，以 `0 0` 结束，输出猴王编号。

不用 `rotate` 也行：报数时**出队再入队尾**，相当于把队列首尾接成一个圈。

```python
import sys
from collections import deque


def monkey_king(n, m):
    q = deque(range(1, n + 1))
    while len(q) > 1:
        for _ in range(m - 1):        # 报 1..m-1 的猴子转到队尾
            q.append(q.popleft())
        q.popleft()                   # 报到 m 的出圈
    return q[0]


def main():
    out = []
    for line in sys.stdin:
        n, m = map(int, line.split())
        if n == 0 and m == 0:
            break
        out.append(str(monkey_king(n, m)))
    print('\n'.join(out))


main()
```

样例输入 `6 2` / `12 4` / `8 3` / `0 0`，输出 `5` / `1` / `7`。

> 同样的写法把 `deque` 换成 `list`、`popleft()` 换成 `pop(0)` 也能过这题（n, m ≤ 300），
> 但每次 `pop(0)` 都要把后面的元素整体前移，是 O(n)；数据一大，差距就是 AC 与 TLE。

**递推公式**（O(n)，求最后一人）：设 f(1)=0，f(k) = (f(k−1) + m) % k，答案为 f(n)+1。

```python
def josephus_formula(n, m):
    r = 0
    for k in range(2, n + 1):
        r = (r + m) % k
    return r + 1


print(josephus_formula(8, 3))    # 7
```

两者一致：队列模拟的最后一个正是 7。

## 2.5 例：E07618: 病人排队

**E07618: 病人排队**，<http://cs101.openjudge.cn/practice/07618/>

> 老年人（≥60 岁）优先，同为老年人按年龄从大到小；非老年人按登记顺序。

**思路**：稳定排序 + 复合 key。

```python
def triage(patients):
    """patients: [(id, age)]，按登记顺序给出。"""
    old = [p for p in patients if p[1] >= 60]
    young = [p for p in patients if p[1] < 60]
    old.sort(key=lambda p: -p[1])        # 稳定排序：同龄保持登记顺序
    return [p[0] for p in old + young]


print(triage([("021", 40), ("002", 65), ("001", 70), ("003", 65)]))
# ['001', '002', '003', '021']
```

> **稳定性在这里是必需的**：两个 65 岁的病人必须保持登记顺序，
> 如果用了不稳定的排序，结果就是随机的。

## 2.6 例：滑动窗口最大值（单调队列）

**LeetCode 239**，<https://leetcode.cn/problems/sliding-window-maximum/>

**单调队列**：队列中存下标，对应值单调递减，队首永远是窗口最大值。

```python
from collections import deque


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


print(max_sliding_window([1, 3, -1, -3, 5, 3, 6, 7], 3))
# [3, 3, 5, 5, 6, 7]
```

时间 **O(n)**：每个下标最多进出队各一次——和单调栈是同一个论证。

### 三者合一：双指针、滑动窗口、deque

这道题是三种思想结合的代表，可以分三层理解：

1. **双指针**：用 `left`、`right` 两个指针维护区间，`right` 向右扩展，`left` 跟着右移，窗口大小保持为 k。
   但每次窗口里暴力求最大值要 O(k)，总共 O(nk)。
2. **滑动窗口**：任意时刻 `nums[left:right+1]` 就是当前窗口；窗口每滑一步只进一个、出一个元素，
   问题变成"能否**增量地**维护最大值"。
3. **deque 维护单调性**：右端新元素进来时，把所有不比它大的元素从队尾弹出（它们比新元素早离开窗口、又不比它大，
   永远不会再成为最大值）；左端元素滑出窗口时，若它正是队首，就从队首弹出。于是队首始终是当前窗口的最大值。

> 一句话：**双指针**定义窗口边界，**滑动窗口**描述窗口如何移动，**deque** 维护窗口内部的最优状态。

---

# 3 栈与队列的对照

| | 栈 Stack | 队列 Queue |
| ---- | ---- | ---- |
| 顺序 | LIFO 后进先出 | FIFO 先进先出 |
| Python | `list`（`append` / `pop`） | `deque`（`append` / `popleft`） |
| 典型应用 | 括号匹配、表达式、单调栈、递归 | BFS、模拟排队、单调队列 |
| 本课后续 | 第 8 周递归（系统栈） | 第 12 周 BFS |

**互相实现**：两个栈可以实现一个队列，两个队列可以实现一个栈——思考题里有。

---

# 4 贪心与矩阵练习

## 4.1 T26971: 分发糖果

**LeetCode 135 / T26971: 分发糖果**，<https://leetcode.cn/problems/candy/>

> 每个孩子至少一颗；相邻孩子中评分高的必须拿更多。求最少糖果数。

**两遍扫描**：从左往右保证"右边比左边高就多给"，从右往左保证反向条件。

```python
def candy(ratings):
    n = len(ratings)
    c = [1] * n
    for i in range(1, n):
        if ratings[i] > ratings[i - 1]:
            c[i] = c[i - 1] + 1
    for i in range(n - 2, -1, -1):
        if ratings[i] > ratings[i + 1]:
            c[i] = max(c[i], c[i + 1] + 1)
    return sum(c)


print(candy([1, 0, 2]), candy([1, 2, 2]))    # 5 4
```

> **为什么必须两遍**：一遍只能满足单侧约束。`max` 而不是直接赋值，是为了不破坏第一遍的结果。

**省一个数组的写法**：第二遍不必存整张表，右侧约束用一个计数器 `right` 边走边算，
每个位置取左右两种要求的较大者：

```python
def candy2(ratings):
    """left[i] 只看左邻；右邻约束用一个计数器 right 边走边算。"""
    n = len(ratings)
    left = [1] * n
    for i in range(1, n):
        if ratings[i] > ratings[i - 1]:
            left[i] = left[i - 1] + 1
    total = right = 0
    for i in range(n - 1, -1, -1):
        if i < n - 1 and ratings[i] > ratings[i + 1]:
            right += 1
        else:
            right = 1
        total += max(left[i], right)
    return total


print(candy2([1, 0, 2]), candy2([1, 2, 2]))    # 5 4
```

## 4.2 M20744: 土豪购物

**M20744: 土豪购物**，<http://cs101.openjudge.cn/practice/20744/>

> 一串商品价格，选一段连续区间，**最多可以丢掉其中一件**，求最大总价。

这是"最大连续子数组和"的变形，两个状态：

```python
def max_with_one_drop(a):
    keep = drop = best = a[0]          # keep: 没丢过；drop: 已丢掉一个
    for v in a[1:]:
        drop = max(keep, drop + v)     # 要么这次丢掉 v，要么之前丢过
        keep = max(v, keep + v)
        best = max(best, keep, drop)
    return best


print(max_with_one_drop([1, -2, 3, 4]))   # 8  —— 丢掉 -2
print(max_with_one_drop([-1, -2, -3]))    # -1 —— 至少留一件
```

> 注意 `drop` 必须先算，因为它用的是**上一轮**的 `keep`——如果先更新 `keep` 再算 `drop`，
> `drop` 就会错误地用到本轮的 `keep`。**赋值顺序在 DP 里是会出错的细节。**

## 4.3 矩阵练习：19942: 二维矩阵上的卷积运算

**E19942: 二维矩阵上的卷积运算**，<http://cs101.openjudge.cn/practice/19942/>

```python
def conv2d(a, kernel):
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
print(conv2d(a, k))         # [[6, 8], [12, 14]]
```

> 这就是第 15 周卷积神经网络里 CNN 的那个"卷积"——核（kernel）滑过矩阵、对应位置相乘再求和，
> 数学上一模一样。**同一个运算，两个场景**。

## 4.4 M26976: 摆动序列（贪心 + 对拍）

**M26976: 摆动序列**，<http://cs101.openjudge.cn/pctbook/M26976/>（LeetCode 376，<https://leetcode.cn/problems/wiggle-subsequence/>）

> 相邻差值严格正负交替的序列叫摆动序列（只有一个元素、或两个不等元素的序列也算）。
> 例如 `[1, 7, 4, 9, 2, 5]` 的差值 `(6, -3, 5, -7, 3)` 正负交替，是摆动序列；`[1, 4, 7, 2, 5]` 和 `[1, 7, 4, 5, 5]` 不是。
> 求给定数组中最长摆动**子序列**（可删元素、保持原序）的长度。

**贪心**：把数组画成折线，答案就是"拐点"的个数——连续上升的一段只需保留最高点，连续下降的一段只需保留最低点。
实现上只在差值**符号翻转**时计数：

```python
def wiggle_greedy(nums):
    """只在"拐点"计数：差值符号翻转一次，长度加一。"""
    if len(nums) < 2:
        return len(nums)
    prev = nums[1] - nums[0]
    ans = 2 if prev != 0 else 1
    for i in range(2, len(nums)):
        diff = nums[i] - nums[i - 1]
        if (diff > 0 and prev <= 0) or (diff < 0 and prev >= 0):
            ans += 1
            prev = diff
    return ans


print(wiggle_greedy([1, 7, 4, 9, 2, 5]))                   # 6
print(wiggle_greedy([1, 17, 5, 10, 13, 15, 10, 5, 16, 8]))  # 7
print(wiggle_greedy([1, 2, 3, 4, 5, 6, 7, 8, 9]))          # 2
```

> 两个细节：`prev` **只在真正计数时才更新**，平台（差值为 0）不会改变"上一次的方向"；
> 判断里用 `prev <= 0` / `prev >= 0`，是为了让开头的平台（`prev == 0`）也能接上第一个真正的方向。

**贪心靠不靠得住？对拍。** 这种"边界条件密集"的贪心最容易写错。办法是再写一个**慢但稳**的解，
用程序随机生成大量小数据，比较两者输出——这就是"程序生成测试数据"的思路，
2025 年的课程题目数据（如 T26971、M26976）也是这样用脚本随机生成、再用正确解算出答案的。

```python
import random


def wiggle_greedy(nums):
    if len(nums) < 2:
        return len(nums)
    prev = nums[1] - nums[0]
    ans = 2 if prev != 0 else 1
    for i in range(2, len(nums)):
        diff = nums[i] - nums[i - 1]
        if (diff > 0 and prev <= 0) or (diff < 0 and prev >= 0):
            ans += 1
            prev = diff
    return ans


def wiggle_dp(nums):
    """O(n^2) 的稳妥解：up[i] / down[i] 为以 i 结尾、最后一步上升 / 下降的最长长度。"""
    n = len(nums)
    up, down = [1] * n, [1] * n
    for i in range(n):
        for j in range(i):
            if nums[j] < nums[i]:
                up[i] = max(up[i], down[j] + 1)
            elif nums[j] > nums[i]:
                down[i] = max(down[i], up[j] + 1)
    return max(up + down) if n else 0


random.seed(0)
for case in range(1000):
    nums = [random.randint(0, 5) for _ in range(random.randint(1, 8))]
    if wiggle_greedy(nums) != wiggle_dp(nums):
        print("反例：", nums, wiggle_greedy(nums), wiggle_dp(nums))
        break
else:
    print("1000 组随机数据全部一致")
# 1000 组随机数据全部一致
```

> 造数据的要点：**值域要小**（0–5，才容易出现相等、平台这些边界）、**长度要短**（出错时反例一眼能看懂）。

**拿到 `.in` / `.out` 测试数据后怎么"喂"给程序**：题目数据解压后通常是 `0.in`、`0.out` 这样的文件对。

- 单个文件：`python3 e1.py < 0.in`，再与 `0.out` 比较；
- 批量：用 2025 年课程仓库提供的 [`testing_code.py`](https://github.com/GMyhf/2025fall-cs101/blob/main/code/testing_code.py)
  （在数据目录里运行 `python3 ../../testing_code.py e1.py`，全部正确时无输出，出错时打印 diff），
  或下面这个 shell 小脚本（左边是程序输出、右边是标准答案，逐行对照）：

```bash
cd $2
for i in *.in; do
    diff -y <(python3 "$1" < "$i") "${i%.*}.out"
done
```

## 4.5 矩阵练习：回顾第 6 周的保护圈与范围裁剪

八邻域 + 保护圈（M12560: 生存游戏、CF508A. Pasha and Pixels）和在 `range` 中用 `min` / `max` 裁边界（02659: Bomb Game、M04133: 垃圾炸弹）已放在第 6 周讲义
[§1.2 保护圈](202610_ADS_W06_Matrices_Sorting_Greedy.md) 与 §1.6，这里不再重复。没做过的同学本周补上，它们和 §4.3 的卷积一样，都是"对每个格子看一圈邻居"的套路。


---

# 5 本周练习

| # | 题目 | 平台 / 编号 | 考点 |
| - | ---- | ---- | ---- |
| 1 | 有效的括号 | LC 20 | 栈、括号匹配 |
| 2 | 波兰表达式 | 02694 | 前缀求值 |
| 3 | 后序表达式求值 | 24588 | 后缀求值 |
| 4 | 快速堆猪 | 22067 | 辅助栈 |
| 5 | 双端队列 | 05902 | deque |
| 6 | 约瑟夫问题 | 02746 | 队列模拟 |
| 7 | 病人排队 | E07618 | 稳定排序 |
| 8 | 二维矩阵上的卷积运算 | E19942 | 矩阵遍历 |
| 9 | 土豪购物 | M20744 | 线性 DP 雏形 |
| 10（选做） | 接雨水 | LC 42 / T26977 | 单调栈 / 双指针 |
| 11（选做） | 分发糖果 | LC 135 / T26971 | 两遍扫描贪心 |
| 12（选做） | 滑动窗口最大值 | LC 239 | 单调队列 |

**扩展练习**（正文 §1.5、§2.2、§2.4、§4.4 中的例题）：

| # | 题目 | 平台 / 编号 | 考点 |
| - | ---- | ---- | ---- |
| 13 | 最小新整数 | 04137 | 单调栈 + 贪心 |
| 14 | 护林员盖房子 加强版 | T27205 | 逐行柱状图 + 单调栈 |
| 15 | 回文数字（Palindrome Number） | 04067 | deque 两端出 |
| 16 | 队列和栈 | 04099 | 同一操作序列的两种容器 |
| 17 | 约瑟夫问题（猴子选大王） | M02746 | 队列模拟、多组输入 |
| 18 | 摆动序列 | M26976 | 拐点贪心、对拍 |

E / M / T 开头与纯数字编号在 cs101.openjudge.cn；LC 为 leetcode.cn；CF 为 codeforces.com。

**思考题**：

1. 用两个栈实现一个队列，写出 `enqueue` / `dequeue`，并分析均摊复杂度为什么是 O(1)。
2. 调度场算法中若把 `>=` 改成 `>`，`1-2-3` 的结果会变成什么？为什么左结合必须用 `>=`？
3. 循环队列为什么要多留一格？不留的话如何用一个计数器解决？
4. 单调栈和单调队列的区别是什么？为什么滑动窗口最大值要用队列而不是栈？
5. 长度为 n 的入栈序列，合法出栈序列共有多少种？（提示：卡特兰数）参见 **27217: 有多少种合法的出栈顺序**。

---

# 6 小结

1. 栈 = LIFO，用 `list` 的尾部；队列 = FIFO，用 `deque`。**`list.pop(0)` 是队列的头号错误写法。**
2. 栈的四类应用：**匹配**（括号）、**逆序**（进制）、**表达式**（调度场 + 后缀求值）、**单调栈**。
3. 单调栈 / 单调队列把"求下一个更大元素""滑动窗口最值"从 O(n²) 降到 **O(n)**，
   靠的都是"每个元素最多进出一次"。
4. 需要"当前最小值"的栈，用**辅助栈同步进出**，不要重算。
5. 稳定排序在"同键保持原序"的题里是**正确性要求**，不是优化。

**下周预告**：把"函数调用自己"这件事讲透——**递归**，以及它和系统栈的关系。

# 第7周 矩阵、队列、栈与贪心练习

*Updated 2026-08-31 GMT+8*
 *Compiled by Hongfei Yan (2026 Fall)*
https://github.com/GMyhf/2026fall-cs101

> **课程安排对应**：第 7 周
> **主题与学习重点**：矩阵、队列、栈与贪心练习。

**知识点**：栈的 LIFO 特性与实现、括号匹配、进制转换、中缀 / 后缀 / 前缀表达式与求值、单调栈、队列的 FIFO 特性、`deque` 与双端队列、循环队列、约瑟夫问题、滑动窗口最大值、矩阵与贪心的综合练习。

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

> ⚠️ **绝不要用 list 的头部当栈顶**：`insert(0, x)` 和 `pop(0)` 都是 O(n)。

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

**三个易错点**：遇右括号时栈已空；栈顶不配对；**扫描结束栈非空**。第三个最常被漏。

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

## 1.4 应用三：表达式

对 `(1 + 2) * 3`：

| 形式 | 写法 | 特点 |
| ---- | ---- | ---- |
| 中缀 infix | `( 1 + 2 ) * 3` | 人类习惯，需要括号与优先级 |
| 前缀 prefix（波兰式） | `* + 1 2 3` | 运算符在前，无需括号 |
| 后缀 postfix（逆波兰式） | `1 2 + 3 *` | 运算符在后，**最易被机器求值** |

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

### 中缀转后缀：调度场算法（Shunting Yard）

由 Dijkstra 提出。维护**运算符栈**与**输出队列**：

1. 操作数 → 直接输出；
2. `(` → 入栈；
3. `)` → 弹栈输出直到遇 `(`，弹掉 `(` 不输出；
4. 运算符 op → 当栈顶是运算符且**优先级 ≥ op**（左结合）时弹出输出，然后 op 入栈；
5. 扫描结束 → 栈中剩余全部弹出。

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

**为什么是 O(n)**：每个下标最多入栈一次、出栈一次，总操作 2n。

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

**为什么多留一格**：否则 `head == tail` 无法区分"空"与"满"。

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

时间 **O(n)**：每个下标最多进出队各一次。

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

> 注意 `drop` 必须先算，因为它用的是**上一轮**的 `keep`。**赋值顺序在 DP 里是会出错的细节。**

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

> 这就是第 15 周卷积神经网络里 CNN 的那个"卷积"——**同一个运算，两个场景**。

---

# 5 本周作业

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

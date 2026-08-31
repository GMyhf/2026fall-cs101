# -*- coding: utf-8 -*-
"""第7周 矩阵、队列、栈与贪心练习"""

META = {
    'title': '第7周　矩阵、队列、栈与贪心练习',
    'subtitle': '栈 ADT 与四类应用 · 单调栈 · 队列与双端队列 · 单调队列 · 贪心练习',
    'footer': '计算概论（B） · 第7周 · 闫宏飞 · 2026 Fall',
    'info': ['北京大学　《计算概论（B）》',
             '主题与学习重点：矩阵、队列、栈与贪心练习。'],
}

SLIDES = [
    ('section', '第 1 节', '栈（Stack）'),

    ('ascii', 'LIFO：后进先出', r"""
        push(4)                pop() -> 4
   |  |          | 4|              |  |
   | 3|   ==>    | 3|     ==>      | 3|
   | 2|          | 2|              | 2|
   | 1|          | 1|              | 1|
   +--+          +--+              +--+

   栈底在下，栈顶在上；只允许在栈顶插入与删除
""", 'push / pop / peek / is_empty 全部 O(1)'),

    ('key', '实战约定',
     'OJ 上直接用 list 的尾部当栈（append / pop / [-1]）；绝不要用头部（O(n)）。'),

    ('code', 'LC 20 有效的括号', '''def is_valid(s):
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
''', '三个易错点：遇右括号栈已空 / 栈顶不配对 / 扫描结束栈非空（第三个最常被漏）'),

    ('code', '变形：输出不匹配的位置 —— 栈里存下标', '''def mark_unmatched(line):
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
''', '关键改造：栈里存的不是字符而是下标 —— 这样才能回头标记位置'),

    ('code', '应用二：进制转换（逆序输出）', '''DIGITS = "0123456789ABCDEF"


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
''', '除基取余，余数逆序输出 —— 正是栈的形状'),

    ('table', '应用三：表达式的三种表示', [
        ['形式', '(1 + 2) * 3 的写法', '特点'],
        ['中缀 infix', '( 1 + 2 ) * 3', '人类习惯，需要括号与优先级'],
        ['前缀 prefix（波兰式）', '* + 1 2 3', '运算符在前，无需括号'],
        ['后缀 postfix（逆波兰式）', '1 2 + 3 *', '运算符在后，最易被机器求值'],
    ]),

    ('code', '24588 后缀求值 / 02694 前缀求值', '''def eval_postfix(tokens):
    stack = []
    for tk in tokens:
        if tk in ('+', '-', '*', '/'):
            b = stack.pop()          # ⚠️ 先弹出的是右操作数
            a = stack.pop()
            stack.append({'+': a+b, '-': a-b, '*': a*b, '/': a/b}[tk])
        else:
            stack.append(float(tk))
    return stack[-1]


def eval_prefix(tokens):
    stack = []
    for tk in reversed(tokens):      # 从右往左扫描，规则对称
        if tk in ('+', '-', '*', '/'):
            a = stack.pop()          # 先弹出的是左操作数
            b = stack.pop()
            stack.append({'+': a+b, '-': a-b, '*': a*b, '/': a/b}[tk])
        else:
            stack.append(float(tk))
    return stack[-1]


print(eval_postfix("1 2 + 3 *".split()))     # 9.0
print(eval_postfix("10 3 - 2 -".split()))    # 5.0  —— 左结合
''', ''),

    ('code', '调度场算法：中缀 -> 后缀（Dijkstra 提出）', '''PREC = {'+': 1, '-': 1, '*': 2, '/': 2}


def infix_to_postfix(tokens):
    output, ops = [], []
    for tk in tokens:
        if tk not in PREC and tk not in '()':
            output.append(tk)                    # 操作数直接输出
        elif tk == '(':
            ops.append(tk)
        elif tk == ')':
            while ops and ops[-1] != '(':
                output.append(ops.pop())
            ops.pop()                            # 弹掉 '('
        else:
            while ops and ops[-1] != '(' and PREC[ops[-1]] >= PREC[tk]:
                output.append(ops.pop())
            ops.append(tk)
    while ops:
        output.append(ops.pop())
    return output
''', '⚠️ 左结合必须用 >=：若用 >，1-2-3 会被解析成 1-(2-3)，答案就错了'),

    ('table', '手工模拟 ( 1 + 2 ) * 3', [
        ['读入', '运算符栈', '输出'],
        ['(', '(', ''],
        ['1', '(', '1'],
        ['+', '( +', '1'],
        ['2', '( +', '1 2'],
        [')', '', '1 2 +'],
        ['*', '*', '1 2 +'],
        ['3', '*', '1 2 + 3'],
        ['结束', '', '1 2 + 3 *'],
    ]),

    ('code', '应用四：单调栈 —— 下一个更大元素 O(n)', '''def next_greater(a):
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
''', '为什么是 O(n)：每个下标最多入栈一次、出栈一次，总操作 2n'),

    ('code', 'LC 42 接雨水：单调栈 / 双指针', '''def trap(height):
    """单调递减栈：弹出的是坑底，左右两侧的柱子决定水位。"""
    stack, water = [], 0
    for i, h in enumerate(height):
        while stack and height[stack[-1]] < h:
            bottom = stack.pop()
            if not stack:
                break
            left = stack[-1]
            water += (i - left - 1) * (min(height[left], h) - height[bottom])
        stack.append(i)
    return water


def trap2(height):                      # 双指针，O(1) 空间
    if not height:
        return 0
    lo, hi = 0, len(height) - 1
    lmax, rmax, water = height[lo], height[hi], 0
    while lo < hi:
        if lmax <= rmax:
            lo += 1; lmax = max(lmax, height[lo]); water += lmax - height[lo]
        else:
            hi -= 1; rmax = max(rmax, height[hi]); water += rmax - height[hi]
    return water


H = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]
print(trap(H), trap2(H))                # 6 6
''', ''),

    ('code', '22067 快速堆猪：辅助栈同步进出', '''def pig_stack(lines):
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
                stack.pop(); mins.pop()
        elif parts[0] == 'min':
            if stack:
                out.append(str(mins[-1]))
    return out


print(pig_stack(["push 5", "push 2", "min", "pop", "min"]))   # ['2', '5']
''', '关键：辅助栈和主栈同步进出 —— 不要在 pop 时"重新算最小值"（那是 O(n)）'),

    ('section', '第 2 节', '队列（Queue）'),

    ('ascii', 'FIFO：先进先出', r"""
   入队 enqueue --->  [ 1 | 2 | 3 | 4 ]  ---> 出队 dequeue
                       队尾 rear    队首 front

   q.append(x)   入队 O(1)
   q.popleft()   出队 O(1)      <- deque
   q[0]          查队首 O(1)
""", '⚠️ 不要用 list.pop(0) 当出队 —— 它是 O(n)'),

    ('code', 'deque：两端都能 O(1) 进出', '''from collections import deque

d = deque([2, 3])
d.appendleft(1)      # [1, 2, 3]
d.append(4)          # [1, 2, 3, 4]
print(d.popleft(), d.pop(), list(d))     # 1 4 [2, 3]
d.rotate(1)          # 整体右移一位
print(list(d))       # [3, 2]
''', '05902 双端队列直接对应本节'),

    ('code', '循环队列：为什么要多留一格', '''class CircularQueue:
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
''', '否则 head == tail 无法区分"空"与"满"'),

    ('code', '02746 约瑟夫问题：模拟 vs 递推', '''from collections import deque


def josephus_queue(n, m):               # O(nm)，直观
    q = deque(range(1, n + 1))
    order = []
    while q:
        q.rotate(-(m - 1))              # 前 m-1 个人轮到队尾
        order.append(q.popleft())
    return order


def josephus_formula(n, m):             # O(n)，只求最后一人
    r = 0
    for k in range(2, n + 1):
        r = (r + m) % k
    return r + 1


print(josephus_queue(8, 3))      # [3, 6, 1, 5, 2, 8, 4, 7]
print(josephus_formula(8, 3))    # 7 —— 与模拟的最后一个一致
''', ''),

    ('code', 'E07618 病人排队：稳定性是正确性要求', '''def triage(patients):
    """patients: [(id, age)]，按登记顺序给出。老年人(>=60)优先，同为老年人按年龄降序。"""
    old = [p for p in patients if p[1] >= 60]
    young = [p for p in patients if p[1] < 60]
    old.sort(key=lambda p: -p[1])        # 稳定排序：同龄保持登记顺序
    return [p[0] for p in old + young]


print(triage([("021", 40), ("002", 65), ("001", 70), ("003", 65)]))
# ['001', '002', '003', '021']
''', '两个 65 岁的病人必须保持登记顺序 —— 不稳定的排序会给出随机结果'),

    ('code', 'LC 239 滑动窗口最大值：单调队列 O(n)', '''from collections import deque


def max_sliding_window(nums, k):
    dq, out = deque(), []                 # 存下标，对应值单调递减
    for i, v in enumerate(nums):
        while dq and nums[dq[-1]] <= v:   # 比新来的小的都没用了
            dq.pop()
        dq.append(i)
        if dq[0] <= i - k:                # 队首滑出窗口
            dq.popleft()
        if i >= k - 1:
            out.append(nums[dq[0]])
    return out


print(max_sliding_window([1, 3, -1, -3, 5, 3, 6, 7], 3))
# [3, 3, 5, 5, 6, 7]
''', '队首永远是窗口最大值；每个下标最多进出队各一次'),

    ('table', '栈与队列的对照', [
        ['', '栈 Stack', '队列 Queue'],
        ['顺序', 'LIFO 后进先出', 'FIFO 先进先出'],
        ['Python', 'list（append / pop）', 'deque（append / popleft）'],
        ['典型应用', '括号匹配、表达式、单调栈、递归', 'BFS、模拟排队、单调队列'],
        ['本课后续', '第 8 周递归（系统栈）', '第 12 周 BFS'],
    ]),

    ('section', '第 3 节', '贪心与矩阵练习'),

    ('code', 'LC 135 分发糖果：两遍扫描', '''def candy(ratings):
    n = len(ratings)
    c = [1] * n
    for i in range(1, n):                        # 保证右边比左边高就多给
        if ratings[i] > ratings[i - 1]:
            c[i] = c[i - 1] + 1
    for i in range(n - 2, -1, -1):               # 反向条件
        if ratings[i] > ratings[i + 1]:
            c[i] = max(c[i], c[i + 1] + 1)
    return sum(c)


print(candy([1, 0, 2]), candy([1, 2, 2]))    # 5 4
''', '为什么必须两遍：一遍只能满足单侧约束。max 而非直接赋值，才不破坏第一遍的结果'),

    ('code', 'M20744 土豪购物：最多丢一件的最大子段和', '''def max_with_one_drop(a):
    keep = drop = best = a[0]          # keep: 没丢过；drop: 已丢掉一个
    for v in a[1:]:
        drop = max(keep, drop + v)     # ⚠️ 必须先算：它用的是上一轮的 keep
        keep = max(v, keep + v)
        best = max(best, keep, drop)
    return best


print(max_with_one_drop([1, -2, 3, 4]))   # 8  —— 丢掉 -2
print(max_with_one_drop([-1, -2, -3]))    # -1 —— 至少留一件
''', '赋值顺序在 DP 里是会出错的细节'),

    ('code', 'E19942 二维卷积：CNN 的核心运算', '''def conv2d(a, kernel):
    m, n = len(a), len(a[0])
    p, q = len(kernel), len(kernel[0])
    out = [[0] * (n - q + 1) for _ in range(m - p + 1)]
    for i in range(m - p + 1):
        for j in range(n - q + 1):
            out[i][j] = sum(a[i+di][j+dj] * kernel[di][dj]
                            for di in range(p) for dj in range(q))
    return out


print(conv2d([[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[1, 0], [0, 1]]))
# [[6, 8], [12, 14]]
''', '同一个运算，两个场景：第 15 周的卷积神经网络用的就是它'),

    ('table', '本周作业', [
        ['#', '题目', '编号', '考点'],
        ['1–3', '有效的括号 / 波兰表达式 / 后序表达式求值', 'LC 20 / 02694 / 24588', '栈'],
        ['4–5', '快速堆猪 / 双端队列', '22067 / 05902', '辅助栈 / deque'],
        ['6–7', '约瑟夫问题 / 病人排队', '02746 / E07618', '队列 / 稳定排序'],
        ['8–9', '二维卷积 / 土豪购物', 'E19942 / M20744', '矩阵 / 线性 DP'],
        ['10–12（选做）', '接雨水 / 分发糖果 / 滑动窗口最大值', 'LC 42 / LC 135 / LC 239', '单调结构'],
    ]),

    ('bullets', '小结', [
        '栈 = LIFO 用 `list` 尾部；队列 = FIFO 用 `deque`。**`list.pop(0)` 是头号错误写法**',
        '栈的四类应用：**匹配、逆序、表达式、单调栈**',
        '单调栈 / 单调队列把 O(n²) 降到 **O(n)**，靠"每个元素最多进出一次"',
        '需要"当前最小值"的栈，用**辅助栈同步进出**',
        '**稳定排序在"同键保持原序"的题里是正确性要求，不是优化**',
    ]),

    ('key', '下周预告',
     '把"函数调用自己"讲透：递归，以及它和系统栈的关系。'),
]

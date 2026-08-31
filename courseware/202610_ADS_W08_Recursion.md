# 第8周 递归

*Updated 2026-08-31 GMT+8*
 *Compiled by Hongfei Yan (2026 Fall)*
https://github.com/GMyhf/2026fall-cs101

> **课程安排对应**：第 8 周
> **主题与学习重点**：递归。

**知识点**：递归的定义与三法则、栈帧与系统调用栈、递归与迭代的互换、经典递归三部曲（斐波那契 / 汉诺塔 / 全排列）、分治、记忆化与 `lru_cache`、递归深度限制、进程虚拟地址空间、递归的调试与可视化。

---

# 1 什么是递归

**递归**：函数在自己的定义中调用自己。

```python
def factorial(n):
    if n <= 1:              # 基例（base case）
        return 1
    return n * factorial(n - 1)     # 递归调用，向基例逼近


print(factorial(5))         # 120
```

## 1.1 递归三法则

1. **必须有基例**（base case）——不再递归的终止条件；
2. **必须改变状态并向基例逼近**——否则永远到不了终点；
3. **必须调用自身**。

三条缺一，就是死循环（Python 里表现为 `RecursionError`）。

## 1.2 递归的思维方式：相信它

写递归时**不要在脑子里展开每一层**。只需回答两个问题：

1. **最小的情况怎么办？**（基例）
2. **假设"更小的问题已经解决了"，怎么用它拼出当前问题的答案？**

例：求数组之和。

```python
def list_sum(a):
    if not a:               # 1) 空数组和为 0
        return 0
    return a[0] + list_sum(a[1:])   # 2) 首元素 + 剩下的和


print(list_sum([1, 3, 5, 7, 9]))    # 25
```

> ⚠️ 这个写法每层都做 `a[1:]` 切片（O(n)），整体是 O(n²)。
> **实战里用下标而不是切片**：

```python
def list_sum2(a, i=0):
    return 0 if i == len(a) else a[i] + list_sum2(a, i + 1)


print(list_sum2([1, 3, 5, 7, 9]))   # 25
```

## 1.3 递归 ⇄ 迭代

**任何递归都能改写成迭代**（用显式栈），反之亦然。

```python
# 递归版
def to_base_rec(n, base):
    digits = "0123456789ABCDEF"
    if n < base:
        return digits[n]
    return to_base_rec(n // base, base) + digits[n % base]


# 迭代版（显式栈）
def to_base_iter(n, base):
    digits = "0123456789ABCDEF"
    if n == 0:
        return "0"
    stack = []
    while n:
        stack.append(digits[n % base])
        n //= base
    return ''.join(reversed(stack))


print(to_base_rec(233, 16), to_base_iter(233, 16))   # E9 E9
```

**选哪个**：递归代码短、更贴近问题的数学定义；迭代没有深度限制、常数更小。
**能写成简单循环的，就别用递归。**

---

# 2 栈帧：递归为什么会爆栈

## 2.1 系统调用栈

每次函数调用，运行时都压入一个**栈帧（stack frame）**，保存参数、局部变量和返回地址；
函数返回时弹出。

```
   factorial(3)
   ├─ 调用 factorial(2)          栈：[f(3)]
   │  ├─ 调用 factorial(1)       栈：[f(3), f(2)]
   │  │  └─ 返回 1               栈：[f(3), f(2), f(1)]
   │  └─ 返回 2 * 1 = 2          栈：[f(3), f(2)]
   └─ 返回 3 * 2 = 6             栈：[f(3)]
```

**递归 = 在用系统栈**。栈的空间有限，递归太深就会溢出。

## 2.2 Python 的递归深度限制

```python
import sys

print(sys.getrecursionlimit())      # 默认 1000
sys.setrecursionlimit(1 << 20)      # OJ 上深递归的标准写法
```

> ⚠️ 把限制调大只是解除了 Python 层面的检查，**C 栈本身仍然有限**。
> 递归深度到 10⁵ 以上时，某些评测环境会直接段错误（RE）。
> 稳妥的做法是**改写成迭代**，或者用线程指定更大的栈：

```python
import sys
import threading


def main():
    sys.setrecursionlimit(1 << 20)
    # ... 深递归代码 ...
    print("done")


threading.stack_size(1 << 26)       # 64 MB
t = threading.Thread(target=main)
t.start()
t.join()
```

## 2.3 进程的虚拟地址空间

栈从哪儿来？每个进程都有一块**虚拟地址空间**：

```
   高地址
   ┌───────────────────┐
   │       内核区       │
   ├───────────────────┤
   │       栈 Stack     │  ← 函数调用帧，向下增长
   │         ↓          │
   │                    │
   │         ↑          │
   │       堆 Heap      │  ← 动态分配的对象，向上增长
   ├───────────────────┤
   │   全局 / 静态数据   │
   ├───────────────────┤
   │     代码段 Text     │
   └───────────────────┘
   低地址
```

- **栈**：自动管理，容量小（通常 8 MB），深递归撑爆的就是它；
- **堆**：手动 / GC 管理，容量大，Python 的列表、字典都在这儿。

**"虚拟"的含义**：每个进程都以为自己独占整个地址空间，
实际由操作系统 + MMU 映射到物理内存。这就是为什么两个程序都能用地址 `0x1000` 而不冲突。

---

# 3 递归三部曲

## 3.1 序曲：斐波那契

**02753: 菲波那契数列**，<http://cs101.openjudge.cn/practice/02753/>

定义：F(1) = F(2) = 1，F(n) = F(n−1) + F(n−2)。

```python
def fib_naive(n):
    if n <= 2:
        return 1
    return fib_naive(n - 1) + fib_naive(n - 2)


print(fib_naive(10))        # 55
```

**问题：这是 O(2ⁿ)**。因为同一个子问题被重复计算无数次：

```
                 fib(5)
            /            \
        fib(4)          fib(3)      ← fib(3) 算了两次
      /      \         /     \
   fib(3)  fib(2)   fib(2) fib(1)   ← fib(2) 算了三次
   /    \
fib(2) fib(1)
```

**三种修法**：

```python
from functools import lru_cache


@lru_cache(maxsize=None)            # 修法一：记忆化，O(n)
def fib_memo(n):
    if n <= 2:
        return 1
    return fib_memo(n - 1) + fib_memo(n - 2)


def fib_iter(n):                    # 修法二：迭代递推，O(n)、O(1) 空间
    a, b = 1, 1
    for _ in range(n - 2):
        a, b = b, a + b
    return b if n >= 2 else 1


def fib_dp(n):                      # 修法三：自底向上填表，O(n)
    if n <= 2:
        return 1
    dp = [0] * (n + 1)
    dp[1] = dp[2] = 1
    for i in range(3, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]


print(fib_memo(50), fib_iter(50), fib_dp(50))   # 12586269025 三者一致
```

> **`lru_cache` 是本课最划算的一行代码**：一个装饰器把指数降成线性。
> 但它要求参数**可哈希**（不能传 list），且缓存会一直占内存。

**M02786: Pell 数列**，<http://cs101.openjudge.cn/practice/02786/>
（a₁=1, a₂=2, aₙ=2aₙ₋₁+aₙ₋₂，对 32767 取模）是同一个套路的练习。

## 3.2 第一部：汉诺塔

**04147: 汉诺塔问题(Tower of Hanoi)**，<http://cs101.openjudge.cn/practice/04147/>

> 把 n 个盘子从 A 柱移到 C 柱，借助 B 柱；每次只能移一个，大盘不能压在小盘上。

**递归思路（三步）**：

1. 把上面 n−1 个盘从 A 移到 B（借助 C）；
2. 把最大的第 n 个盘从 A 移到 C；
3. 把 n−1 个盘从 B 移到 C（借助 A）。

```python
def hanoi(n, src, aux, dst, moves):
    if n == 0:
        return
    hanoi(n - 1, src, dst, aux, moves)      # 1) n-1 个到辅助柱
    moves.append(f"{n}:{src}->{dst}")       # 2) 最大的一个到目标柱
    hanoi(n - 1, aux, src, dst, moves)      # 3) n-1 个从辅助柱到目标柱


moves = []
hanoi(3, 'A', 'B', 'C', moves)
print(len(moves))
for m in moves:
    print(m)
# 7
# 1:A->C
# 2:A->B
# 1:C->B
# 3:A->C
# 1:B->A
# 2:B->C
# 1:A->C
```

**移动次数**：T(n) = 2T(n−1) + 1，T(1) = 1 ⟹ **T(n) = 2ⁿ − 1**。

```python
def hanoi_count(n):
    return (1 << n) - 1


print([hanoi_count(k) for k in range(1, 8)])   # [1, 3, 7, 15, 31, 63, 127]
```

> 传说中的 64 层汉诺塔需要 2⁶⁴−1 ≈ 1.8×10¹⁹ 次移动。每秒一次，需要约 5850 亿年。
> **这就是指数复杂度的实感。**

## 3.3 第二部：全排列

**02748: 全排列**，<http://cs101.openjudge.cn/practice/02748/>

```python
def permutations(a):
    """返回 a 的全部排列（字典序，要求 a 已排序）。"""
    res = []
    used = [False] * len(a)
    path = []

    def dfs():
        if len(path) == len(a):
            res.append(path[:])          # ⚠️ 必须拷贝，否则存的是同一个列表
            return
        for i in range(len(a)):
            if used[i]:
                continue
            used[i] = True
            path.append(a[i])
            dfs()
            path.pop()                   # 回溯：撤销选择
            used[i] = False

    dfs()
    return res


for p in permutations([1, 2, 3]):
    print(''.join(map(str, p)), end=' ')
print()
# 123 132 213 231 312 321
```

**三个必须记住的细节**：

1. `res.append(path[:])` —— **不拷贝就全是同一个空列表**；
2. `path.pop()` 与 `used[i] = False` —— **回溯要把状态还原**；
3. 复杂度 **O(n! · n)**，所以 n ≤ 10 才可行（第 4 周的范围表）。

Python 内建也提供：

```python
from itertools import permutations as it_perm

print([''.join(map(str, p)) for p in it_perm([1, 2, 3])])
# ['123', '132', '213', '231', '312', '321']
```

> 但**考试要会手写**——第 9 周的回溯（八皇后、组合、子集）全建立在这个模板上。

---

# 4 分治：递归的另一种用法

**分治（Divide and Conquer）**三步：**分**成子问题 → **治**（递归解决）→ **合**并答案。

| 算法 | 分 | 合 | 复杂度 |
| ---- | ---- | ---- | ---- |
| 归并排序 | 对半切 | 合并两个有序表 | O(n log n) |
| 快速排序 | 按 pivot 划分 | 无需合并 | 平均 O(n log n) |
| 二分查找 | 只保留半边 | 无需合并 | O(log n) |
| 快速幂 | 指数减半 | 相乘 | O(log n) |

## 4.1 快速幂

```python
def fast_pow(a, b, mod=None):
    """计算 a^b（可选取模），O(log b)。"""
    if b == 0:
        return 1 % mod if mod else 1
    half = fast_pow(a, b // 2, mod)
    res = half * half
    if b & 1:
        res *= a
    return res % mod if mod else res


print(fast_pow(2, 10))              # 1024
print(fast_pow(3, 100, 1000000007)) # 与 pow(3, 100, 10**9+7) 一致
print(pow(3, 100, 1000000007))
```

> Python 内建的 `pow(a, b, mod)` 就是快速幂，直接用即可。

## 4.2 二分查找

```python
def binary_search(a, target):
    """在升序数组 a 中查 target，返回下标，找不到返回 -1。"""
    lo, hi = 0, len(a) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if a[mid] == target:
            return mid
        if a[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1


a = [1, 3, 5, 7, 9, 11]
print(binary_search(a, 7), binary_search(a, 4))    # 3 -1
```

**求"第一个 ≥ target 的位置"**（更常用的形态）：

```python
import bisect


def lower_bound(a, target):
    lo, hi = 0, len(a)
    while lo < hi:
        mid = (lo + hi) // 2
        if a[mid] < target:
            lo = mid + 1
        else:
            hi = mid
    return lo


a = [1, 3, 5, 7, 9]
print(lower_bound(a, 5), bisect.bisect_left(a, 5))     # 2 2
print(lower_bound(a, 6), bisect.bisect_left(a, 6))     # 3 3
```

> **模板选择**：`lo < hi` + `hi = mid` 这一版不会死循环，也不会漏边界。
> 建议**只记这一版**，需要"最后一个 ≤ target"时用 `lower_bound(a, target+1) - 1`。

## 4.3 最大公约数

**03248: 最大公约数**，<http://cs101.openjudge.cn/practice/03248/>

```python
def gcd(a, b):
    return a if b == 0 else gcd(b, a % b)


def lcm(a, b):
    return a // gcd(a, b) * b        # 先除后乘，避免中间结果过大


print(gcd(12, 18), lcm(4, 6))        # 6 12
```

**为什么 `gcd(a,b) = gcd(b, a%b)`**：a 和 b 的公约数集合，
与 b 和 a mod b 的公约数集合完全相同（因为 a = kb + r，任何同时整除 b 和 r 的数也整除 a）。

---

# 5 递归的调试

## 5.1 打印调用树

```python
def fib_trace(n, depth=0):
    print("  " * depth + f"fib({n})")
    if n <= 2:
        return 1
    return fib_trace(n - 1, depth + 1) + fib_trace(n - 2, depth + 1)


fib_trace(4)
# fib(4)
#   fib(3)
#     fib(2)
#     fib(1)
#   fib(2)
```

缩进就是栈深度。**看到重复的子树，就该上记忆化。**

## 5.2 可视化

[pythontutor.com](https://pythontutor.com/) 能逐步展示栈帧的压入与弹出——
理解递归最快的工具，强烈建议把 `factorial(4)` 和 `hanoi(3,...)` 各跑一遍。

## 5.3 常见错误

| 症状 | 原因 |
| ---- | ---- |
| `RecursionError` | 没有基例，或没向基例逼近 |
| 结果全一样 | 收集答案时忘了 `path[:]` 拷贝 |
| 结果多了 / 少了 | 忘了回溯（`pop` / 状态还原） |
| TLE | 有重叠子问题却没记忆化 |
| RE（评测机上） | 递归太深，C 栈溢出 |

---

# 6 本周作业

| # | 题目 | 平台 / 编号 | 考点 |
| - | ---- | ---- | ---- |
| 1 | 菲波那契数列 | 02753 | 递归 + 记忆化 |
| 2 | Pell 数列 | M02786 | 递推 |
| 3 | 汉诺塔问题(Tower of Hanoi) | 04147 | 递归三步 |
| 4 | 全排列 | 02748 | 回溯模板 |
| 5 | 最大公约数 | 03248 | 辗转相除 |
| 6 | 递归比较字符串大小 | 28717 | 递归定义 |
| 7 | 放苹果 | 01664 | 递归计数 |
| 8 | 简单的整数划分问题 | 04117 | 递归 + 记忆化 |
| 9（选做） | Help Jimmy | T01661 | 递归 + 记忆化（难） |
| 10（选做） | 汉诺塔的移动次数 | — | 用 `2**n - 1` 验证第 3.2 节的推导 |

**思考题**：

1. `fib_naive(n)` 一共调用了多少次自身？（提示：与 F(n) 本身同阶）
2. 为什么 `list_sum(a[1:])` 是 O(n²)？改成传下标后是多少？
3. 汉诺塔 T(n) = 2T(n−1) + 1，用数学归纳法证明 T(n) = 2ⁿ − 1。
4. 二分查找的 `mid = (lo + hi) // 2` 在 C++ 里可能溢出，应该怎么写？Python 为什么不用担心？
5. 把汉诺塔改写成**非递归**版本（用显式栈），验证移动序列与递归版完全一致。

---

# 7 小结

1. 递归三法则：**有基例、向基例逼近、调用自身**。写的时候只想两层，不要在脑子里展开。
2. 递归就是在用**系统栈**；栈空间有限，深递归要么改迭代，要么开线程加大栈。
3. 三部曲：**斐波那契**（重叠子问题 → 记忆化）、**汉诺塔**（2ⁿ−1，指数的实感）、
   **全排列**（回溯模板：选择 → 递归 → 撤销）。
4. 分治 = 分 + 治 + 合：归并、快排、二分、快速幂。
5. 回溯的两个必犯错误：**忘拷贝**（`path[:]`）、**忘还原**（`pop`）。

**下周预告**：把递归用到底——**回溯**（八皇后、马走日、组合与子集）与**并查集**。

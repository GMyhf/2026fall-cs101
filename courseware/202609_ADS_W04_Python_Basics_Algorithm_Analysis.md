# 第4周 计算机基础、Python 基础与算法分析入门

*Updated 2026-08-31 GMT+8*
 *Compiled by Hongfei Yan (2026 Fall)*
https://github.com/GMyhf/2026fall-cs101

> **课程安排对应**：第 4 周
> **主题与学习重点**：计算机基础、Python 基础与算法分析入门。

**知识点**：函数与作用域、可变 / 不可变对象与浅拷贝、异常处理、四种内建容器及其操作复杂度、大 O 记号、常见复杂度级别、按数据范围倒推算法、常数优化与快速输入输出、埃氏筛、调试方法与常见错误类型。

---

# 1 Python 基础补齐

## 1.1 函数

```python
def gcd(a, b):
    """辗转相除法求最大公约数。"""
    while b:
        a, b = b, a % b
    return a


print(gcd(12, 18))          # 6
```

**默认参数、关键字参数、可变参数**：

```python
def f(a, b=10, *args, **kwargs):
    print(a, b, args, kwargs)


f(1)                        # 1 10 () {}
f(1, 2, 3, 4, x=5)          # 1 2 (3, 4) {'x': 5}
```

> ⚠️ **默认参数是可变对象**是经典陷阱：

```python
def bad(x, acc=[]):         # ❌ acc 只在函数定义时创建一次
    acc.append(x)
    return acc


print(bad(1))               # [1]
print(bad(2))               # [1, 2]  —— 不是期望的 [2]


def good(x, acc=None):      # ✅ 标准写法
    if acc is None:
        acc = []
    acc.append(x)
    return acc


print(good(1), good(2))     # [1] [2]
```

## 1.2 可变与不可变

| 不可变 | 可变 |
| ---- | ---- |
| `int` `float` `str` `tuple` `bool` `frozenset` | `list` `dict` `set` 自定义对象 |

**函数参数传的是引用**，所以传入可变对象时，函数内的修改会影响外面：

```python
def modify(lst, num):
    lst.append(99)          # 影响调用方
    num += 1                # 只影响局部：int 不可变，这里是重新绑定


a, b = [1, 2], 10
modify(a, b)
print(a, b)                 # [1, 2, 99] 10
```

## 1.3 浅拷贝与深拷贝

```python
import copy

a = [[1, 2], [3, 4]]
b = a                        # 别名：完全同一个对象
c = a[:]                     # 浅拷贝：外层新建，内层仍共享
d = copy.deepcopy(a)         # 深拷贝：彻底独立

a[0][0] = 99
print(b[0][0], c[0][0], d[0][0])   # 99 99 1
```

**做题时的实际影响**：DP 里保存"每一层的状态"时，`dp_new = dp_old[:]` 对一维数组够用，
但二维数组必须 `[row[:] for row in grid]`，否则所有行是同一个对象。

## 1.4 异常处理

```python
try:
    n = int(input())
    print(10 / n)
except ValueError:
    print("不是整数")
except ZeroDivisionError:
    print("除零")
except Exception as e:       # 兜底，尽量不要只写这一条
    print("其他错误:", e)
finally:
    print("总会执行")
```

OJ 上最常用的一个用法——**读到文件尾就结束**：

```python
import sys

for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    # 处理一行
```

或者：

```python
while True:
    try:
        n = int(input())
    except EOFError:
        break
    print(n * n)
```

---

# 2 四种容器与它们的代价

## 2.1 选型表

| 容器 | 有序 | 可变 | 可重复 | 典型用途 |
| ---- | ---- | ---- | ---- | ---- |
| `list` | 是 | 是 | 是 | 序列、栈、动态数组 |
| `tuple` | 是 | 否 | 是 | 不变的记录、可作字典键 |
| `set` | 否 | 是 | 否 | 去重、判存在 |
| `dict` | 插入序 | 是 | 键不重复 | 映射、计数 |

## 2.2 操作复杂度（必须背下来）

| 操作 | list | set / dict |
| ---- | ---- | ---- |
| 按下标取 `a[i]` | **O(1)** | — |
| 末尾追加 `append` | 均摊 **O(1)** | — |
| 末尾弹出 `pop()` | **O(1)** | — |
| **头部插入 `insert(0,x)`** | **O(n)** ⚠️ | — |
| **头部弹出 `pop(0)`** | **O(n)** ⚠️ | — |
| 判存在 `x in c` | **O(n)** ⚠️ | **O(1)** |
| 插入 / 删除 | O(n) | **O(1)** |
| 排序 | O(n log n) | — |

> **这张表是本周最重要的内容。** 绝大多数"算法对但 TLE"的代码，
> 死因就是把 `in` 用在了 list 上，或者用 `pop(0)` 当队列。

一个真实的对比：

```python
import time

n = 200000
data = list(range(n))
lst, st = data, set(data)

t0 = time.time()
sum(1 for x in range(0, n, 1000) if x in lst)     # list 的 in：O(n) 每次
t1 = time.time()
sum(1 for x in range(0, n, 1000) if x in st)      # set 的 in：O(1) 每次
t2 = time.time()

print(f"list in: {t1 - t0:.4f}s   set in: {t2 - t1:.6f}s")
# 典型结果：list in 约 0.6s，set in 约 0.0001s —— 相差三个数量级
```

## 2.3 需要队列时用 deque

```python
from collections import deque

q = deque([1, 2, 3])
q.append(4)          # 右进 O(1)
q.appendleft(0)      # 左进 O(1)
q.popleft()          # 左出 O(1)  —— 这是 list.pop(0) 的正确替代
q.pop()              # 右出 O(1)
print(q)             # deque([1, 2, 3])
```

第 12 周做 BFS 时，用 `list.pop(0)` 会把 O(V+E) 拖成 O(V²)。

## 2.4 计数与分组的标准写法

```python
from collections import Counter, defaultdict

words = "the quick brown fox jumps over the lazy dog the end".split()

cnt = Counter(words)
print(cnt['the'])                  # 3
print(cnt.most_common(2))          # [('the', 3), ('quick', 1)]

groups = defaultdict(list)
for w in words:
    groups[len(w)].append(w)
print(dict(sorted(groups.items())))
# {3: ['the', 'fox', 'the', 'dog', 'the', 'end'], 4: ['over', 'lazy'], 5: ['quick', 'brown', 'jumps']}
```

`Counter` 一遍 O(n) 完成统计，而 `[lst.count(x) for x in set(lst)]` 是 O(n²)。

---

# 3 算法分析：这段代码够快吗

## 3.1 大 O 记号

大 O 描述**输入规模增长时，运行时间怎样增长**，忽略常数因子与低阶项：

- 3n² + 100n + 500 → **O(n²)**
- 100n → **O(n)**，即使常数很大

**为什么忽略常数**：n 足够大时，量级压倒一切。n = 10⁶ 时，
O(n) 的算法（10⁶ 步）比 O(n²) 的算法（10¹² 步）快一百万倍——常数是 100 还是 1 无关紧要。

## 3.2 常见级别

| 复杂度 | 名称 | n=10⁶ 时约需 | 典型算法 |
| ---- | ---- | ---- | ---- |
| O(1) | 常数 | 1 | 下标访问、哈希查找 |
| O(log n) | 对数 | 20 | 二分查找 |
| O(n) | 线性 | 10⁶ | 一遍扫描 |
| O(n log n) | 线性对数 | 2×10⁷ | 排序、分治 |
| O(n²) | 平方 | 10¹² ❌ | 双重循环 |
| O(2ⁿ) | 指数 | 天文数字 ❌ | 枚举子集 |
| O(n!) | 阶乘 | 天文数字 ❌ | 全排列 |

```
运行时间
   ▲            2^n    n²
   │             │    ╱
   │             │   ╱
   │             │  ╱          n log n
   │             │ ╱        ╱
   │             │╱     ╱          n
   │            ╱│  ╱      ────────────
   │         ╱  ╱────────
   │  ──────────────────────────  log n
   └──────────────────────────────────► n
```

## 3.3 怎么数

```python
# O(1)
x = a[0] + a[-1]

# O(n)
s = 0
for v in a:
    s += v

# O(n²)：两重循环，内层次数与 n 同阶
for i in range(n):
    for j in range(n):
        pass

# O(n²)：注意这个也是 n²/2 ~ O(n²)
for i in range(n):
    for j in range(i, n):
        pass

# O(n log n)
a.sort()

# O(log n)
lo, hi = 0, n - 1
while lo <= hi:
    mid = (lo + hi) // 2
    ...
```

**隐藏的复杂度**——这是最容易漏的：

```python
for i in range(n):
    if x in lst:            # ← 这一行是 O(n)，整体 O(n²)
        ...

for i in range(n):
    s = s + str(i)          # ← 字符串拼接每次 O(len)，整体 O(n²)
    # 正确写法：out.append(str(i))  最后 ''.join(out)
```

## 3.4 从数据范围倒推算法（考场上最实用的一招）

OJ 的机器大约每秒能执行 **10⁷–10⁸** 次基本操作。看到 n 就能倒推该用什么算法：

| n 的范围 | 可接受的复杂度 | 该想什么 |
| ---- | ---- | ---- |
| n ≤ 10 | O(n!) / O(2ⁿ·n) | 全排列、暴力搜索 |
| n ≤ 20 | O(2ⁿ) | 枚举子集、状压 |
| n ≤ 100 | O(n³) | Floyd、区间 DP |
| n ≤ 1000 | O(n²) | 二维 DP、暴力两重循环 |
| n ≤ 10⁵ | O(n log n) | 排序、二分、堆、优先队列 |
| n ≤ 10⁶ | O(n) | 一遍扫描、双指针、前缀和 |
| n ≥ 10⁸ | O(log n) / O(1) | 数学公式、快速幂 |

> **考场流程**：读完题先看数据范围 → 定复杂度上限 → 再想算法。
> 反过来做（先想算法再看范围）会浪费大量时间在注定 TLE 的思路上。

## 3.5 空间复杂度

同样用大 O，衡量**额外**内存。一个 Python `int` 在列表里约占 8 字节指针 + 28 字节对象，
经验值：**10⁶ 个整数的列表约 40 MB**。OJ 内存限制常见 64–256 MB，
所以 `n = 10⁷` 的一维数组还行，`n = 10⁴` 的二维数组（10⁸ 个元素）必然 MLE。

---

# 4 常数优化

复杂度对了但还是超时，才轮到优化常数。按收益排序：

## 4.1 快速输入输出

```python
import sys

input = sys.stdin.readline          # 大量行输入时提速明显
data = sys.stdin.read().split()     # 一次读完，最快
sys.stdout.write('\n'.join(out) + '\n')   # 批量输出，比循环 print 快很多
```

> `sys.stdin.readline()` **保留行尾换行符**，用于字符串比较时记得 `.strip()`。

## 4.2 少做重复计算

```python
# 慢
for i in range(len(a)):
    for j in range(len(a)):
        ...

# 快：把 len 提到循环外，把属性查找绑成局部变量
n = len(a)
append = res.append
for i in range(n):
    for j in range(n):
        append(i * j)
```

## 4.3 用内建函数

内建函数是 C 实现的，比等价的 Python 循环快一个量级：

```python
s = sum(a)                     # 快于 for 累加
m = max(a)
b = sorted(a)
c = list(map(int, line.split()))   # 快于 [int(x) for x in line.split()]
```

## 4.4 例：埃拉托色尼筛

判素数的朴素做法是 O(√n)，一次查询没问题；但**要判很多个数**时就该预处理：

```python
def sieve(limit):
    """返回长度 limit+1 的布尔数组，is_prime[i] 表示 i 是否为素数。O(n log log n)。"""
    is_prime = [True] * (limit + 1)
    is_prime[0] = is_prime[1] = False
    i = 2
    while i * i <= limit:
        if is_prime[i]:
            for j in range(i * i, limit + 1, i):   # 从 i*i 开始，前面的已被更小的因子筛掉
                is_prime[j] = False
        i += 1
    return is_prime


primes = sieve(100)
print([i for i, p in enumerate(primes) if p])
# [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97]
```

**经典应用：T-primes**（恰好有 3 个约数的数）。
一个数恰有 3 个约数 ⟺ 它是**某个素数的平方**。

```python
LIMIT = 10 ** 6                      # sqrt(10^12)
is_prime = sieve(LIMIT)


def is_tprime(x):
    r = int(x ** 0.5)
    # 浮点开方在边界可能差 1，向两侧各校正一次
    while r * r > x:
        r -= 1
    while (r + 1) * (r + 1) <= x:
        r += 1
    return r * r == x and r <= LIMIT and is_prime[r]


print([x for x in [1, 4, 9, 12, 16, 25, 36, 49] if is_tprime(x)])
# [4, 9, 25, 49]
```

> **注意那两行 `while` 校正**：`int(x ** 0.5)` 对大整数会因浮点误差算错 1，
> 这是本题最常见的 WA 来源。这就是第 3 周"浮点数不可靠"的直接后果。

**E03143: 验证"歌德巴赫猜想"**，<http://cs101.openjudge.cn/practice/03143/>

```python
is_prime = sieve(10000)
n = int(input())
for a in range(2, n // 2 + 1):
    if is_prime[a] and is_prime[n - a]:
        print(a, n - a)
```

---

# 5 调试

## 5.1 通用方法

1. **读错误信息的最后一行**——它告诉你错误类型和位置。
2. **构造最小复现输入**：把出错的输入砍到最小仍能复现。
3. **打印中间状态**：`print(f"i={i} dp={dp}", file=sys.stderr)`（写 stderr 不会污染 OJ 输出）。
4. **用调试器单步**：PyCharm 打断点比 print 快得多。
5. **对拍**：写一个暴力解，随机造数据，比较两者输出。第 16 周复习时会用到。

## 5.2 常见错误与对策

| OJ 反馈 | 含义 | 常见原因 |
| ---- | ---- | ---- |
| WA | 答案错 | 边界（n=0/1）、读题漏条件、输出格式、精度 |
| TLE | 超时 | 复杂度过高、`in` 用在 list 上、`pop(0)` |
| MLE | 超内存 | 开了过大的数组、递归过深 |
| RE | 运行错误 | 下标越界、除零、递归爆栈 |
| PE | 格式错 | 多余空格 / 换行 |
| CE | 编译错 | 语法错误 |

## 5.3 三条考场纪律

1. **样例过了不等于对**。至少再手造一组边界数据（n=1、全相同、最大值）。
2. **TLE 先看复杂度，别急着调常数**。数量级不对，怎么优化常数都没用。
3. **卡住 15 分钟就换题**。回来时往往一眼看出问题。

---

# 6 本周作业

| # | 题目 | 平台 / 编号 | 考点 |
| - | ---- | ---- | ---- |
| 1 | 多项式时间复杂度 | E23563 | 字符串解析、复杂度概念 |
| 2 | 验证"歌德巴赫猜想" | E03143 | 素数筛 |
| 3 | 生日相同 | E02724 | 字典分组、排序 |
| 4 | 与 7 无关的数 | 02701 | 循环 |
| 5 | 数论 | E23564 | 数学 |
| 6 | 2050 年成绩计算 | E18176 | 模拟、格式 |
| 7 | 词典 | E02804 | 字典查询 |
| 8（选做） | 最大公约数 | 03248 | 辗转相除、递归预热 |

**思考题**：

1. 为什么埃氏筛的内层循环从 `i * i` 开始而不是 `2 * i`？
2. `a = a + [x]` 和 `a.append(x)` 的复杂度分别是多少？在循环里用前者会发生什么？
3. n = 10⁵、时限 1 秒，下列哪些复杂度可行：O(n²)、O(n√n)、O(n log n)、O(n log²n)？
4. 用 `time.time()` 实测：把 `x in lst` 换成 `x in set(lst)`（注意 set 要在循环外建），加速比是多少？

---

# 7 小结

1. 默认参数别用可变对象；二维结构拷贝要用 `[row[:] for row in grid]`。
2. **容器复杂度表要背**：list 的 `in` / `pop(0)` 是 O(n)，set / dict 的 `in` 是 O(1)，队列用 `deque`。
3. 大 O 忽略常数与低阶项；**先看数据范围，再定复杂度，最后想算法**。
4. 常数优化的顺序：快速 IO → 减少重复计算 → 用内建函数。**复杂度不对时不要优化常数。**
5. 浮点开方在大整数上会差 1，边界要用整数校正。

**下周预告**：**10 月月考**——第一次在机房环境下限时做题，以及考后的阶段复习。

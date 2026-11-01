# 第4周 计算机基础、Python 基础与算法分析入门

*Updated 2026-10-31 GMT+8*
 *Compiled by Hongfei Yan (2026 Fall)*
https://github.com/GMyhf/2026fall-cs101

> **课程安排对应**：第 4 周
> **主题与学习重点**：计算机基础、Python 基础与算法分析入门。

**知识点**：函数与作用域、可变 / 不可变对象与浅拷贝、异常处理、四种内建容器及其操作复杂度、大 O 记号、常见复杂度级别、按数据范围倒推算法、常数优化与快速输入输出、埃氏筛、字典的地道写法与方法返回值、生成器与缓存、用测试数据调试、调试方法与常见错误类型。

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

参数怎么对应：

- `b=10`：**默认参数**，调用时可以不传。
- `*args`：多余的位置参数打包成元组。
- `**kwargs`：多余的关键字参数打包成字典。

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

**为什么会这样**：`def` 语句只在**定义时**执行一次，`acc=[]` 这个空列表也只被创建一次；
之后每次调用不传 `acc`，用的都是**同一个**列表对象。改用 `None` 作哨兵值，在函数体内按需新建。

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

> **记忆口诀**：**可变对象**（list / dict / set）传进函数，函数里的修改外面"看得见"；
> **不可变对象**（int / str / tuple）在函数内重新赋值，外面完全不受影响。

把 Python 的基本类型按"元素型 / 容器型"归一下类，就是后面几节要用到的全部家当：

| 大类 | 子类 | 类型 | 可变 |
| ---- | ---- | ---- | ---- |
| 元素型 | 数值型 | `int` `float` `complex` | 否 |
| 元素型 | 布尔 / 空值 | `bool` `NoneType` | 否 |
| 容器型 | 序列型 | `str` `tuple` | 否 |
| 容器型 | 序列型 | `list` | 是 |
| 容器型 | 集合型 | `set` / `frozenset` | 是 / 否 |
| 容器型 | 映射型 | `dict` | 是 |

各类型常用操作的速查图（图片来源：sixthresearcher.com），建议打印出来对照：

![Python 基本数据类型常用操作](https://raw.githubusercontent.com/GMyhf/img/main/img/image-20230109195622957.png)

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

**为什么 `c[0][0]` 也变了**：`a[:]` 只新建了**最外层**的列表；内层的 `[1, 2]`、`[3, 4]`
仍然是原来的对象，`b`、`c` 都指向它们。只有 `d`（深拷贝）连内层也复制了一份。

**做题时的实际影响**：DP 里保存"每一层的状态"时，`dp_new = dp_old[:]` 对一维数组够用，
但二维数组必须 `[row[:] for row in grid]`，否则所有行是同一个对象。
同一个坑的另一种形态是用 `[[0] * n] * m` 建二维数组（m 行都是同一个列表的别名），
见 [第 2 周 5.5 节](202609_ADS_W02_VM_Shell_DevEnv.md)。

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

执行顺序：

- 按 `except` 的顺序**从上到下**匹配，命中一个就不再往下看。
- `finally` 无论有没有异常都会执行。
- `except Exception` 放**最后**当兜底，不要只写这一条——它会把编程错误也悄悄吞掉。

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

**两种写法怎么选**：不知道有多少行、每行独立处理，用 `for line in sys.stdin`；
要靠 `EOFError` 精确控制退出时机（比如除了读完之外还想处理别的异常），用 `while True` + `try`。

## 1.5 方法的返回值：原地修改，还是返回新对象

初学者常问：为什么 `print(a.pop())` 能打印出元素，`print(a.sort())` 却打印 `None`？

```python
a = [3, 1, 2]
print(a.sort())          # None：原地排序，不返回列表
print(a)                 # [1, 2, 3]

b = [3, 1, 2]
print(sorted(b), b)      # [1, 2, 3] [3, 1, 2]：返回新列表，原列表不变
print(b.pop())           # 2：pop 既修改列表，又返回被删的元素
print(b)                 # [3, 1]
```

这不需要死记，规律是：

- **原地修改**容器的方法（`sort`、`append`、`extend`、`insert`、`remove`、`reverse`）返回 `None`。
  所以 `a = a.sort()` 会把 `a` 变成 `None`，是常见 bug。
- **查询或生成新数据**的函数 / 方法（`sorted`、`count`、`index`、`copy`、`str.split`、`str.join`）返回结果。
  `pop` 是例外中的常客：它既修改列表，也返回被删的元素。
- 拿不准时，在交互式窗口里试一下，或者 `help(list.sort)` 看文档。

OJ 上常用的函数其实就那么几十个，做完 30 道题基本都会碰到一遍：

| 类别 | 函数 / 方法 |
| ---- | ---- |
| 输入输出 | `input()` `print()` `map()` `sys.stdin.readline` |
| 数学 | `abs` `max` `min` `sum` `pow` `divmod` `math.floor` `math.ceil` `math.isqrt` |
| 列表 | `len` `append` `extend` `insert` `pop` `sort` `sorted` `index` `count` |
| 字符串 | `split` `strip` `join` `replace` `find` `upper` `lower` |
| 迭代 | `range` `enumerate` `zip` `reversed` |
| 标准库 | `collections`（`deque` `Counter` `defaultdict`）、`itertools`、`heapq`、`bisect` |

---

# 2 四种容器与它们的代价

## 2.1 选型表

| 容器 | 有序 | 可变 | 可重复 | 典型用途 |
| ---- | ---- | ---- | ---- | ---- |
| `list` | 是 | 是 | 是 | 序列、栈、动态数组 |
| `tuple` | 是 | 否 | 是 | 不变的记录、可作字典键 |
| `set` | 否 | 是 | 否 | 去重、判存在 |
| `dict` | 插入序 | 是 | 键不重复 | 映射、计数 |

> **一句话选型**：要下标、要顺序 → list；固定不变、想当字典键 → tuple；
> 只关心"有没有" → set；要映射关系 → dict。

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

更完整的内建容器操作复杂度表见 <https://www.ics.uci.edu/~pattis/ICS-33/lectures/complexitypython.txt>。

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

**为什么 `list.pop(0)` 慢**：list 底层是**连续数组**，弹出头部后其余元素要整体前移一位，O(n)。
`deque` 底层是由固定大小的块串成的双向链表，两端操作都是 O(1)。

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

**`defaultdict` 省的那一行**：不用它就要写 `if len(w) not in groups: groups[len(w)] = []`；
`defaultdict(list)` 让"键不存在时自动给一个默认值"对每次访问都生效。

## 2.5 字典的地道写法

dict 底层是**哈希表**，查询、插入、删除都是 O(1)。用好它的内建方法，代码既短又快。

**取值用 `get()`，并且只查一次**：

```python
person = {'name': 'Alice', 'age': 30}

print(person.get('email', 'N/A'))     # N/A：键不存在时返回默认值，不抛 KeyError

email = person.get('email')            # 查一次，结果存进变量
if email is not None:
    print(f"Email: {email}")
```

**字典推导式**：

```python
squares = {x: x * x for x in range(5)}
print(squares)                         # {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}
```

**遍历用 `items()`，遍历时不要增删键**：

```python
d = {'a': 1, 'b': 0, 'c': 2}
for k, v in d.items():
    print(k, v)

# ❌ 边遍历边删：RuntimeError: dictionary changed size during iteration
# for k, v in d.items():
#     if v == 0:
#         del d[k]

for k in list(d):                      # ✅ 先把键复制成列表，再改原字典
    if d[k] == 0:
        del d[k]
print(d)                               # {'a': 1, 'c': 2}
```

**分组：`setdefault()` 与 `defaultdict`**：

```python
from collections import defaultdict

data = [
    {'id': 1, 'name': 'John', 'city': 'New York'},
    {'id': 2, 'name': 'Alice', 'city': 'London'},
    {'id': 3, 'name': 'Bob', 'city': 'New York'},
]

g1 = {}
for item in data:
    g1.setdefault(item['city'], []).append(item['id'])
print(g1)                              # {'New York': [1, 3], 'London': [2]}

g2 = defaultdict(list)
for item in data:
    g2[item['city']].append(item['id'])
print(dict(g2))                        # {'New York': [1, 3], 'London': [2]}
```

| | `setdefault()` | `defaultdict` |
| ---- | ---- | ---- |
| 来源 | 普通 dict 的方法 | `collections` 模块的类 |
| 默认值 | 每次调用时传入（`[]` 每次都会新建一个） | 构造时指定**工厂函数**，键缺失时才调用 |
| 写法 | `g.setdefault(k, []).append(v)` | `g[k].append(v)` |
| 适合 | 临时脚本，不想多 import | 大量计数 / 分组，更清晰也更快 |

> **工厂函数**是不带参数就能返回新对象的可调用对象：`list` → `[]`，`set` → `set()`，`int` → `0`。
> 所以计数写 `defaultdict(int)`，分组写 `defaultdict(list)`，去重分组写 `defaultdict(set)`。

**字典保持插入顺序**：从 Python 3.7 起这是语言规范，`for k in d` 的顺序就是插入的顺序。

---

# 3 算法分析：这段代码够快吗

## 3.1 大 O 记号

大 O 描述**输入规模增长时，运行时间怎样增长**，忽略常数因子与低阶项：

- 3n² + 100n + 500 → **O(n²)**：最高阶项决定量级
- 100n → **O(n)**，即使常数很大

在讨论"算法够不够快"之前，先分清两个概念：**数据结构**定义数据怎样组织与访问，
**算法**定义任务的执行步骤；二者的代价都要算——第 2 节的容器复杂度表就是数据结构的代价。

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

同一个 n，几条曲线的高度差可以是好几个数量级——这就是为什么"算法选对了"比"代码写快了"重要得多。

### 3.2.1 七类基本增长函数

算法分析里反复出现的增长函数只有七类（对数默认以 2 为底）：

1. **常数** f(n) = c，与 n 无关：O(1)
2. **对数** f(n) = log n：O(log n)
3. **线性** f(n) = n：O(n)
4. **线性对数** f(n) = n log n：O(n log n)
5. **二次** f(n) = n²：O(n²)
6. **三次及多项式** f(n) = n³，或一般的 a_k·n^k + … + a_1·n + a_0：O(n^k)
7. **指数** f(n) = aⁿ（a > 1 为常数）：O(aⁿ)

脚本 [algorithm_analysis.py](https://github.com/GMyhf/2021fall-cs101/blob/main/algorithm_analysis.py)
用 `timeit` 对每类函数实测不同 n 下的运行时间并画图。下图纵轴是运行时间取对数，横轴是 n；
指数函数太耗时，没有画进去：

![七类基本函数的增长率](https://raw.githubusercontent.com/GMyhf/img/main/img/image-20230109200554226.png)

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

口诀：

- 循环嵌套几层，通常就是 n 的几次方；`for j in range(i, n)` 这种"三角形"循环总次数约 n²/2，仍是 **O(n²)**。
- 每次循环把规模**减半**（如二分查找），步数就是 **O(log n)**。
- `list.sort()` 用的是 Timsort（归并排序与插入排序的混合），O(n log n)；
  基于比较的排序，最坏情况下不可能比 O(n log n) 更好。

**隐藏的复杂度**——这是最容易漏的：

```python
for i in range(n):
    if x in lst:            # ← 这一行是 O(n)，整体 O(n²)
        ...

for i in range(n):
    s = s + str(i)          # ← 字符串拼接每次 O(len)，整体 O(n²)
    # 正确写法：out.append(str(i))  最后 ''.join(out)
```

为什么容易漏：外层 `for i in range(n)` 一眼看是 O(n)，但**循环体里藏着一次 O(n) 的操作**
（`in` 查列表、拼接长字符串），乘起来就是 O(n²)。审查复杂度时，要把循环体里每个函数调用的代价也算进去。

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

具体做法：把 n 的最大值代入复杂度的式子，得到大致的运算次数，再对照下面的经验表（时限 1 秒）。
例如 O(n²) 的算法、n ≤ 1000，代入得 10⁶：

| 运算次数 | 时限 1 秒内 |
| ---- | ---- |
| 10⁶ | 游刃有余 |
| 10⁷ | 勉勉强强 |
| 10⁸ | 很难保证，除非循环体非常简单 |

同理，n = 1000 时 O(n³) 和 O(n²) 差 1000 倍——要缩短运行时间，首先应该从复杂度入手。

**实测：你的机器一秒能做多少次加法**

```python
import time


def measure_addition_speed(num_iterations):
    start_time = time.time()
    result = 0
    for _ in range(num_iterations):
        result += 1
    end_time = time.time()
    return end_time - start_time, result


num_iterations = 10 ** 7
elapsed_time, result = measure_addition_speed(num_iterations)
print(f"{num_iterations} 次加法用时 {elapsed_time:.3f} 秒")
print(f"每秒约 {num_iterations / elapsed_time:.2e} 次")
```

在一台 Linux 服务器上（Python 3.12）的一次运行结果：

```
10000000 次加法用时 0.220 秒
每秒约 4.55e+07 次
```

也就是说，最简单的 Python 循环一秒也就几千万次。上表中 10⁶、10⁷ 次在 OJ 上大致能过，
10⁸ 次纯 Python 循环基本必然超时。把 `10 ** 7` 改成你自己的数字，在自己的电脑上跑一遍，心里就有底了。

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

输入输出是最容易的优化点：每次 `print` 调用都有固定开销，循环几万次 `print` 本身就可能超时。
**批量读、批量写**几乎没有成本，应当养成习惯。

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

为什么有效：`len(a)`、`res.append` 这类调用和属性查找每次都要重新执行；提到循环外只做一次，
在千万级循环里能省下明显的时间。但它**改变不了复杂度**，只是常数变小。

**把主体代码放进函数**：同样的道理，Python 访问局部变量比访问全局变量快。
写在模块顶层的循环，循环变量都是全局变量：

```python
import time

t0 = time.perf_counter()
s = 0
for i in range(10 ** 7):        # 写在模块顶层：i、s 都是全局变量
    s += i
t1 = time.perf_counter()


def main():
    s = 0
    for i in range(10 ** 7):    # 写在函数里：i、s 都是局部变量
        s += i
    return s


main()
t2 = time.perf_counter()
print(f"顶层: {t1 - t0:.2f}s   函数内: {t2 - t1:.2f}s")
```

一次运行结果（Python 3.12）：

```
顶层: 0.51s   函数内: 0.25s
```

同样的循环，放进 `main()` 就快了一倍。所以很多 AC 代码都是 `def main(): ...` 加最后一行 `main()` 的结构。

## 4.3 用内建函数

内建函数是 C 实现的，跳过了解释器逐条执行字节码的开销，比等价的 Python 循环快一个量级：

```python
s = sum(a)                     # 快于 for 累加
m = max(a)
b = sorted(a)
c = list(map(int, line.split()))   # 快于 [int(x) for x in line.split()]
```

同理，**列表推导式**比"空列表 + 循环 `append`"更快，也更短：

```python
squares = []
for x in range(10):
    squares.append(x ** 2)

squares = [x ** 2 for x in range(10)]     # 推荐
```

**只需遍历一次时用生成器**：把方括号换成圆括号，就得到生成器表达式。
它不会一次性把所有元素造出来，而是用到时才算下一个，内存几乎不随 n 增长：

```python
import sys

lst = [x * x for x in range(10 ** 6)]     # 列表：一次性生成全部元素
gen = (x * x for x in range(10 ** 6))     # 生成器：用到时才算下一个
print(sys.getsizeof(lst), sys.getsizeof(gen))
print(sum(lst) == sum(gen))               # True
```

在 Python 3.12 上输出 `8448728 200`：列表对象本身约 8 MB（还没算 10⁶ 个整数对象），生成器只有 200 字节。
`sum(x * x for x in a)` 这种写法可以省掉括号直接传给函数。注意生成器**只能遍历一次**。

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

`x ** 0.5` 是按 IEEE 754 双精度算的，尾数只有 52 位，整数一大，开方结果就可能偏 1。
两行 `while` 用**纯整数运算** `r * r` 与 `x` 比较，把近似根校正成真正的整数平方根。
更省事的办法是直接用 Python 3.8 起提供的 `math.isqrt`，它全程整数运算，保证返回 ⌊√x⌋：

```python
import math

r = 10 ** 8 + 7
x = r * r - 1                 # 不是完全平方数，正确的整数平方根是 r - 1
print(int(x ** 0.5))          # 100000007  ← 浮点开方向上偏了 1
print(math.isqrt(x))          # 100000006  ← 正确
```

开立方更糟：`64 ** (1 / 3)` 的结果是 `3.9999999999999996`，`int()` 截断后得到 3 而不是 4。
枚举题（如 M02810: 完美立方）里，与其对 b 开立方再判断是不是整数，
不如直接枚举 b、c、d，用乘法 `b ** 3 + c ** 3 + d ** 3 == a ** 3` 判断——**能用整数乘法就不要用浮点开方和除法**。

**完整提交：CF230B: T-primes**，<https://codeforces.com/problemset/problem/230/B>

n ≤ 10⁵ 个数、每个 xᵢ ≤ 10¹²，逐个 YES / NO 输出。把前面几招合起来：埃氏筛预处理到 10⁶、
`math.isqrt` 求整数平方根、`sys.stdin.read()` 一次读入、最后一次性输出、主体放进 `main()`：

```python
import math
import sys


def sieve(limit):
    is_prime = [True] * (limit + 1)
    is_prime[0] = is_prime[1] = False
    for i in range(2, math.isqrt(limit) + 1):
        if is_prime[i]:
            for j in range(i * i, limit + 1, i):
                is_prime[j] = False
    return is_prime


def main():
    data = sys.stdin.read().split()
    n = int(data[0])
    is_prime = sieve(10 ** 6)
    out = []
    for x in map(int, data[1:n + 1]):
        r = math.isqrt(x)
        out.append("YES" if r * r == x and is_prime[r] else "NO")
    sys.stdout.write("\n".join(out) + "\n")


main()
```

样例输入 `3` / `4 5 6`，输出 `YES` `NO` `NO`。2025 年同学用同样思路的 Python3 提交约 650 ms AC；
早一版先把素数转成 `set` 再查 `root in primes_set`，约 750 ms——直接查 `is_prime[r]` 少建一个集合，又快了一点。
若用试除法逐个判断（每个数 O(√x)），10⁵ × 10⁶ 次运算必然超时。

> 同样是"找平方数"的思路：01218: THE DRUNK JAILER，<http://cs101.openjudge.cn/practice/01218/>。
> 求素数的三种方法——试除法、埃氏筛、欧拉筛（线性筛）——的对比可参考 <https://blog.dotcpp.com/a/69737>。

**E03143: 验证"歌德巴赫猜想"**，<http://cs101.openjudge.cn/pctbook/E03143/>

```python
is_prime = sieve(10000)
n = int(input())
for a in range(2, n // 2 + 1):
    if is_prime[a] and is_prime[n - a]:
        print(a, n - a)
```

猜想内容：任一大于 2 的偶数都能写成两个素数之和。题目要求**输出所有素数对**：先用埃氏筛预处理，再从小到大枚举较小的那个数 `a`（`a ≤ n - a`），每找到一组就输出，不要找到第一组就 `break`。

## 4.5 以空间换时间：缓存重复调用

有些函数会被用相同参数反复调用，典型是递归求斐波那契数。`functools.lru_cache` 把算过的结果存起来，
第二次调用直接查表：

```python
import time
from functools import lru_cache


def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)


@lru_cache(maxsize=None)
def fib_cached(n):
    return n if n < 2 else fib_cached(n - 1) + fib_cached(n - 2)


for f in (fib, fib_cached):
    t0 = time.perf_counter()
    ans = f(30)
    print(f"{f.__name__}(30) = {ans}  {time.perf_counter() - t0:.4f}s")
```

一次运行结果：

```
fib(30) = 832040  0.0860s
fib_cached(30) = 832040  0.0000s
```

注意这已经**不是常数优化**：不带缓存的 `fib` 是指数级，带缓存后每个 n 只算一次，变成 O(n)。
这就是第 8 周递归、第 10–11 周动态规划里"记忆化"的雏形。

---

# 5 调试

## 5.1 通用方法

1. **读错误信息的最后一行**——它告诉你错误类型和位置。
2. **构造最小复现输入**：把出错的输入砍到最小仍能复现。
3. **打印中间状态**：`print(f"i={i} dp={dp}", file=sys.stderr)`（写 stderr 不会污染 OJ 输出）。
4. **用调试器单步**：PyCharm 打断点比 print 快得多。
5. **对拍**：写一个暴力解，随机造数据，比较两者输出。第 16 周复习时会用到。

造测试数据时，除了换一组与样例不同的输入，要特别照顾**边界情况**（corner cases）：
空输入、只有一个元素、极大 / 极小值、**重复元素**。

### 5.1.1 用测试数据定位 WA

样例过了、提交却 WA，通常是某些边界或特殊数据没考虑到。如果能拿到该题的测试数据，
就用第 2 周学过的**重定向**把程序跑一遍，再和标准输出逐行比对。
部分题目的测试数据见 <https://github.com/GMyhf/2021fall-cs101/tree/main/cs101_test_data>，
解压后是成对的 `0.in`（输入）、`0.out`（标准输出）。把程序和数据放在同一目录：

```bash
python3 4A.py < 0.in > 0my.out     # 0.in 作为输入，程序输出写进 0my.out
diff 0my.out 0.out                 # macOS / Linux：没有输出就说明完全一致
```

Windows PowerShell 下用 `python 4A.py`，比较可以用 `fc.exe 0my.out 0.out`。
PowerShell 不支持 `<` 输入重定向，要写成 `Get-Content 0.in | python 4A.py > 0my.out`。
视频讲解：Windows 环境 <https://www.bilibili.com/video/BV1jT4y1B7eU>，macOS 环境 <https://www.bilibili.com/video/BV15341137sg>。

### 5.1.2 可视化逐行执行

[pythontutor.com](https://pythontutor.com/) 可以逐行执行代码（Next 前进、Prev 回退），
画出每一步的变量、引用关系与数据结构。第 1 节的默认参数陷阱、浅拷贝问题放进去一看就懂。
它适合短小的程序；代码太长或循环次数太多时会受限制。

![pythontutor 网站](https://raw.githubusercontent.com/GMyhf/img/main/img/image-20250817195401448.png)

## 5.2 常见错误与对策

| OJ 反馈 | 含义 | 常见原因 | 对策 |
| ---- | ---- | ---- | ---- |
| WA | 答案错 | 边界（n=0/1）、读题漏条件、输出格式、精度 | 对照样例逐步调试，手造边界数据 |
| TLE | 超时 | 复杂度过高、`in` 用在 list 上、`pop(0)`、递归没有终止条件 | 先估算复杂度，换数据结构或算法 |
| MLE | 超内存 | 开了过大的数组、递归过深 | 减少存储、避免重复保存，考虑迭代替代递归 |
| RE | 运行错误 | 下标越界、除零、递归爆栈 | 检查下标范围、除数、递归深度 |
| PE | 格式错 | 多余空格 / 换行 | 严格对照输出格式，注意行末空格与换行 |
| CE | 编译错 | 语法错误 | 检查括号、冒号、缩进、拼写、`import` |

> **TLE / MLE 有两种来源**：一是程序逻辑错（如递归没设边界、循环变量没更新，导致"死循环"）；
> 二是逻辑对但算法复杂度太高。前者要改 bug，后者才需要优化：
> 把 `list` 换成 `dict` / `set`、升级算法（贪心、动态规划、分治），或者在时间与空间之间做取舍
> （**以空间换时间**，如 4.4 的筛法和 4.5 的缓存）。

## 5.3 三条考场纪律

1. **样例过了不等于对**。至少再手造一组边界数据（n=1、全相同、最大值）。
2. **TLE 先看复杂度，别急着调常数**。数量级不对，怎么优化常数都没用。
3. **卡住 15 分钟就换题**。回来时往往一眼看出问题。

## 5.4 编程细节与易错点

- **变量初始化**：标志位、计数器、累加器用之前要赋好初值。
- **多组数据**：题目有多组测试数据时，每组开始前要**重置**相关变量和容器，避免上一组的状态残留。
- **遍历时不要修改**：不要在遍历 list / dict 的同时增删元素，改为遍历副本（`list(d)`、`a[:]`）或先记下待删项。
- **类型要对**：字符串按**字典序**排序（`'10' < '9'`），整数按数值排序；读入后记得 `int()` 转换。
- **缩进**：缩进决定代码块结构，不要混用 Tab 与空格。
- **深拷贝与浅拷贝**：修改嵌套结构前想清楚是不是共享了内层对象（1.3 节）。
- **回溯要恢复现场**：第 9 周写 DFS 时，进入下一层前改了状态（如 `visited`），返回时要改回来。

## 5.5 心态与考场策略

- **环境异常**：考前发现系统 / IDE 有问题，立即找监考或助教。
- **开局受阻**：第一题不会就跳过，先做有把握的题，建立信心。
- **简单题反复 WA**：多半是思维定势或细节疏忽，重新逐句读题，换个角度想。
- **遇到没练过的题型**：不必慌，大多数同学同样不熟，先想能迁移哪些已有知识；实在不行先写暴力。
- **看榜与看人**：适度看榜了解整体情况即可；身边有人提前交卷，那是别人的节奏。

> 稳定的心态 + 扎实的基本功，是机考发挥的两个前提。

---

# 6 本周练习

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

E 开头与纯数字编号的题目都在 cs101.openjudge.cn。想再练一道筛法，可以做 4.4 节的 CF230B: T-primes。

**AC 之后问自己四个问题**（不会做很正常，看了题解才写出来也正常，重要的是复盘）：

1. 这道题在考察什么？是新题型，还是见过的题型？
2. 如果见过，思路卡在哪里？这个思路是不是有模板性？
3. 参考代码里还有哪些写法值得学？
4. 它和之前做过的哪些题是同一类？

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
5. 浮点开方在大整数上会差 1，边界要用整数校正，或者直接用 `math.isqrt`。
6. 原地修改的方法（`sort`、`append`……）返回 `None`；字典取值用 `get()`，分组计数用 `defaultdict`。
7. 主体代码放进 `main()`、批量读写、用推导式和内建函数，是 Python 做题最常用的几招常数优化。

**下周预告**：**10 月月考**——第一次在机房环境下限时做题，以及考后的阶段复习。
月考样卷 6 题、112 分钟。往年月考题目分 Easy / Medium / Tough 三档，大致对应 Codeforces 难度 900–1100、1200–1400、1500–1600+；
考前保证睡眠，比临时多刷两道题更重要。

# 第13周 计算机原理（2/2）与阶段综合练习

*Updated 2026-08-31 GMT+8*
 *Compiled by Hongfei Yan (2026 Fall)*
https://github.com/GMyhf/2026fall-cs101

> **课程安排对应**：第 13 周
> **主题与学习重点**：计算机原理（2/2）与阶段综合练习。

**知识点**：编译与解释、Python 的执行模型与字节码、进程与线程、GIL、进程的虚拟地址空间、内存管理与引用计数、缓存与局部性原理、文件 I/O 与缓冲、`10^18` 内存能不能申请、阶段综合练习。

---

# 1 程序是怎么跑起来的

## 1.1 编译型 vs 解释型

```
   编译型（C / C++）
   源码 a.cpp ──编译器──► 汇编 ──汇编器──► 目标文件 .o ──链接器──► 可执行文件 ──► CPU 直接执行

   解释型（Python）
   源码 a.py ──编译──► 字节码 .pyc ──► Python 虚拟机（CPython）逐条解释 ──► 调用 C 函数 ──► CPU
```

| | 编译型 | 解释型 |
| ---- | ---- | ---- |
| 代表 | C / C++ / Rust | Python / JavaScript |
| 速度 | 快（直接机器码） | 慢 10–100 倍 |
| 跨平台 | 需重新编译 | 字节码可移植 |
| 错误发现 | 编译期 | 运行期 |
| 本课影响 | OJ 上 C++ 时限更宽松 | Python 常数大，要靠算法弥补 |

> **这解释了一个常见困惑**：同样是 O(n²) 的代码，C++ 能过而 Python TLE。
> **Python 的对策不是优化常数，而是换更优的算法。**

## 1.2 Python 的字节码

```python
import dis


def add(a, b):
    return a + b


dis.dis(add)
```

输出（版本不同略有差异，看结构即可）：

```
  RESUME                   0
  LOAD_FAST                a
  LOAD_FAST                b
  BINARY_OP                0 (+)
  RETURN_VALUE
```

**每一条字节码在解释器里是一次循环迭代 + 一次函数分派**——
这就是 Python 慢的直接原因，也是"用内建函数（C 实现）替代 Python 循环"能提速的原因。

```python
import time

n = 3_000_000
t0 = time.time()
s = 0
for i in range(n):                      # 纯 Python 循环
    s += i
t1 = time.time()
s2 = sum(range(n))                      # 内建 sum，C 实现
t2 = time.time()
assert s == s2
print(f"python loop: {t1 - t0:.3f}s   builtin sum: {t2 - t1:.3f}s")
# 典型结果：循环约 0.2s，sum 约 0.03s —— 相差 5~10 倍
```

## 1.3 CPython 的 GIL

**全局解释器锁（Global Interpreter Lock）**：同一时刻只有一个线程能执行 Python 字节码。

| 任务类型 | 多线程有用吗 | 该用什么 |
| ---- | ---- | ---- |
| CPU 密集（算数、循环） | ❌ 没用 | 多进程 `multiprocessing` |
| I/O 密集（读文件、网络） | ✅ 有用 | 多线程 / `asyncio` |

> 本课用到线程的唯一场景是**加大递归栈**（第 8 周 2.2 节）——那不是为了并行。

---

# 2 进程与内存

## 2.1 进程与线程

| | 进程 | 线程 |
| ---- | ---- | ---- |
| 地址空间 | **独立** | **共享**（同一进程内） |
| 创建代价 | 大 | 小 |
| 通信 | 管道 / 共享内存 / socket | 直接读写共享变量 |
| 崩溃影响 | 只影响自己 | 拖垮整个进程 |

## 2.2 虚拟地址空间（第 8 周的展开）

```
   高地址  0xFFFF...
   ┌────────────────────┐
   │      内核空间       │  用户程序不可直接访问
   ├────────────────────┤
   │       栈 Stack      │  函数调用帧、局部变量；向下增长；通常 8 MB
   │          ↓          │
   │                     │
   │      （未映射）      │  访问这里 -> 段错误 Segmentation Fault
   │                     │
   │          ↑          │
   │       堆 Heap       │  malloc / Python 对象；向上增长
   ├────────────────────┤
   │   BSS（未初始化）    │
   ├────────────────────┤
   │   Data（已初始化）   │  全局变量、常量
   ├────────────────────┤
   │      Text 代码段     │  机器指令，只读
   └────────────────────┘
   低地址  0x0000...
```

**"虚拟"的三个好处**：

1. **隔离**：进程 A 写坏自己的内存，碰不到进程 B；
2. **统一**：每个程序都以为自己从地址 0 开始，编译器不用关心实际位置；
3. **超额分配**：虚拟空间可以大于物理内存，靠**换页（swap）**支撑。

**页表与 MMU**：内存按 4 KB 的**页**管理，页表记录"虚拟页 → 物理页"的映射，
由硬件 MMU 完成翻译。访问未映射的页触发**缺页中断**，
操作系统去磁盘调入（正常）或杀掉进程（非法访问）。

## 2.3 能申请 10¹⁸ 字节的内存吗

```python
import sys

print(sys.maxsize)              # 9223372036854775807 = 2^63 - 1，说明是 64 位解释器
print(2 ** 63 - 1 == sys.maxsize)
```

64 位系统的虚拟地址空间理论上是 2⁶⁴ ≈ 1.8×10¹⁹ 字节，看起来"够"。但：

- 实际 CPU 只用 48 位虚拟地址 → 256 TB ≈ 2.8×10¹⁴ 字节；
- 物理内存 + swap 才是真正的上限；
- Linux 允许**超额提交（overcommit）**：`malloc` 可能成功，**真正写入时才 OOM**。

```python
# 观察 Python 对象的实际内存开销
import sys

print(sys.getsizeof(0), sys.getsizeof(10 ** 20))     # 28 36（字节，随版本略变）
print(sys.getsizeof([]), sys.getsizeof([0] * 1000))  # 56 8056
```

**经验换算**（做题时估内存用）：

| 结构 | 10⁶ 个元素约占 |
| ---- | ---- |
| `list` of small int | ~40 MB（8 字节指针 + 对象本身） |
| `array('i', ...)` | ~4 MB |
| `bytearray` | ~1 MB |
| `set` / `dict` | ~70 MB 以上 |

> **OJ 内存限制常见 64–256 MB**。n = 10⁷ 的一维 list 就已经危险，
> 这时用 `bytearray` 或 `array` 代替（第 5 周月考样卷 T4 的筛法就是这么写的）。

## 2.4 Python 的内存管理

**引用计数 + 分代垃圾回收**：

```python
import sys

a = [1, 2, 3]
print(sys.getrefcount(a))       # 2（a 自己 + getrefcount 的参数）
b = a
print(sys.getrefcount(a))       # 3
del b
print(sys.getrefcount(a))       # 2
```

引用计数归零就立即回收；**循环引用**靠分代 GC 处理：

```python
import gc

class Node:
    def __init__(self):
        self.ref = None


x = Node()
y = Node()
x.ref = y
y.ref = x                       # 循环引用，引用计数永远不为 0
del x, y
print(gc.collect() > 0)         # True —— GC 回收了这些不可达对象
```

---

# 3 缓存与局部性

## 3.1 局部性原理

- **时间局部性**：刚访问过的数据，很可能马上再被访问（循环变量）；
- **空间局部性**：访问了某个地址，很可能马上访问它旁边的（数组遍历）。

缓存就是靠这两条工作的。**写出对缓存友好的代码 = 顺序访问连续内存。**

## 3.2 实测：按行 vs 按列

```python
import time

N = 1200
a = [[1] * N for _ in range(N)]

t0 = time.time()
s = 0
for i in range(N):                  # 按行：内层 j 变化，访问连续
    row = a[i]
    for j in range(N):
        s += row[j]
t1 = time.time()

s2 = 0
for j in range(N):                  # 按列：内层 i 变化，每次跳一整行
    for i in range(N):
        s2 += a[i][j]
t2 = time.time()

assert s == s2
print(f"按行 {t1 - t0:.3f}s   按列 {t2 - t1:.3f}s")
# 典型结果：按行明显更快（Python 里差距小于 C，因为解释开销占了大头）
```

> Python 的列表是**指针数组**，元素本身散落在堆上，所以缓存效应不如 C 明显。
> 但"把 `a[i]` 提到内层循环外"这一条在 Python 里同样有效——**少一次索引就是少一条字节码**。

## 3.3 时间层次的实感

| 操作 | 时间 | 换算成"人类尺度"（1 ns = 1 秒） |
| ---- | ---- | ---- |
| L1 缓存 | 1 ns | 1 秒 |
| L2 缓存 | 4 ns | 4 秒 |
| 内存 | 100 ns | 1.7 分钟 |
| SSD 随机读 | 100 μs | 1.2 天 |
| 磁盘寻道 | 10 ms | 4 个月 |
| 网络往返（同城） | 1 ms | 11 天 |

**这张表解释了为什么"少读一次磁盘"比"少算一万次加法"更重要。**

---

# 4 文件 I/O

## 4.1 基本用法

```python
# 写
with open('data.txt', 'w', encoding='utf-8') as f:
    f.write("hello\n")
    f.writelines([f"{i}\n" for i in range(3)])

# 读
with open('data.txt', encoding='utf-8') as f:
    for line in f:                    # 逐行读，内存友好
        print(line.rstrip('\n'))

with open('data.txt', encoding='utf-8') as f:
    content = f.read()                # 一次读完，大文件慎用
print(len(content))

import os
os.remove('data.txt')
```

`with` 语句保证文件**一定会被关闭**，即使中间抛异常。

## 4.2 缓冲：为什么 `print` 很慢

每次 `print` 都可能触发一次系统调用。OJ 上输出上万行时，**批量输出**能快一个数量级：

```python
import sys

out = []
for i in range(5):
    out.append(str(i * i))
sys.stdout.write('\n'.join(out) + '\n')
```

**同理，输入也要批量读**：

```python
import sys

data = sys.stdin.read().split()       # 一次系统调用读完全部
```

---

# 5 阶段综合练习

第 1–12 周的内容已经覆盖了机考的全部知识点。下面按"**认题型**"的方式做一次串讲。

## 5.1 题型识别速查表

| 题面里出现 | 大概率考点 | 周次 |
| ---- | ---- | ---- |
| "统计出现次数""按……排序输出" | 字典 + 多关键字排序 | W4 |
| "n ≤ 10⁶""每次询问" | 预处理 + O(1) 查询（前缀和 / 筛） | W4、W6 |
| "最少多少个""最多能选几个" | 贪心（先想排序键） | W6、W10 |
| "合并 / 覆盖 / 相交" + 区间 | 区间贪心 | W10 |
| "有多少种方案""最大 / 最小价值" | DP | W10、W11 |
| "每个物品选或不选" | 0-1 背包 | W11 |
| "最少几步""最短路径" | BFS | W12 |
| "所有路径""全排列 / 组合" | 回溯 | W9 |
| "是否连通""分成几组" | 并查集 / DFS | W9 |
| "最小的最大值""最大的最小值" | 二分答案 | W12 |
| "下一个更大的" | 单调栈 | W7 |
| 表达式、括号 | 栈 | W7 |

## 5.2 综合练习题单

**A 组（基础巩固，全部应 AC）**

| # | 题目 | 编号 | 考点 |
| - | ---- | ---- | ---- |
| 1 | 排队做实验 | M21554 | 排序 + 贪心 |
| 2 | 买学区房 | M19963 | 排序 + 中位数 |
| 3 | 装箱问题 | 01017 | 贪心 |
| 4 | 病人排队 | E07618 | 稳定排序 |
| 5 | 校门外的树 | 02808 | 差分 |

**B 组（核心算法）**

| # | 题目 | 编号 | 考点 |
| - | ---- | ---- | ---- |
| 6 | 采药 | 02773 | 0-1 背包 |
| 7 | 数字三角形 | 02760 | 路径 DP |
| 8 | 拦截导弹 | M02945 | LIS |
| 9 | 鸣人和佐助 | 04115 | 带状态 BFS |
| 10 | 河中跳房子 | M08210 | 二分答案 |
| 11 | 宗教信仰 | 02524 | 并查集 |
| 12 | 八皇后 | 02754 | 回溯 |

**C 组（提高，选做）**

| # | 题目 | 编号 | 考点 |
| - | ---- | ---- | ---- |
| 13 | 最大子矩阵 | M02766 | 降维 + Kadane |
| 14 | 走山路 | M20106 | Dijkstra |
| 15 | 变换的迷宫 | T04129 | 多维状态 BFS |
| 16 | 食物链 | 01182 | 扩展域并查集 |
| 17 | 小游戏 | T02802 | BFS + 转弯 |
| 18 | 世界杯只因 | T27104 | 区间覆盖 |

## 5.3 一道综合例题的完整拆解

> **题**：n 个任务，第 i 个耗时 tᵢ、截止时间 dᵢ。可以任意顺序执行（不可中断），
> 求最多能按时完成几个任务。（n ≤ 10⁵）

**第一步：看数据范围** —— n ≤ 10⁵ ⟹ 只能 O(n log n)，排除 DP 的 O(n²)。

**第二步：认题型** —— "最多能选几个" ⟹ 贪心。

**第三步：想排序键** —— 按**截止时间**排序（先做快到期的）。

**第四步：处理冲突** —— 按 d 升序加任务；若总时长超了截止时间，
就**从已选任务里丢掉耗时最长的那个**（用大根堆维护）。

```python
import heapq


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
print(max_tasks([(5, 5), (1, 1), (1, 2), (1, 3)]))  # 3
```

**为什么这个贪心是对的**（交换论证）：
若某一步超时，丢掉耗时最长的任务，剩余总时长最小，
对后面的任务最有利，且**丢一个正好把数量减一**——不可能有更好的选择。

**第五步：验证** —— 和暴力对拍：

```python
import itertools
import random


def max_tasks_brute(tasks):
    n = len(tasks)
    best = 0
    for k in range(n, 0, -1):
        for combo in itertools.combinations(range(n), k):
            for order in itertools.permutations(combo):
                t = 0
                ok = True
                for i in order:
                    t += tasks[i][0]
                    if t > tasks[i][1]:
                        ok = False
                        break
                if ok:
                    return k
    return 0


random.seed(101)
for _ in range(200):
    n = random.randint(1, 6)
    ts = [(random.randint(1, 5), random.randint(1, 12)) for _ in range(n)]
    assert max_tasks(ts) == max_tasks_brute(ts), ts
print("贪心与暴力一致（200 组随机数据）")
```

> **这一节的流程就是考场上应有的流程**：
> **看范围 → 认题型 → 定排序键 / 状态 → 处理冲突 → 对拍验证。**

---

# 6 本周作业

| # | 任务 | 说明 |
| - | ---- | ---- |
| 1 | 完成 5.2 的 A 组全部 5 题 | 基础巩固 |
| 2 | 完成 5.2 的 B 组至少 5 题 | 核心算法 |
| 3 | 用 `dis.dis` 反汇编一个函数 | 观察字节码 |
| 4 | 实测按行 / 按列遍历的时间差 | 局部性 |
| 5 | 为 A 组任一题写一份"暴力 + 对拍"脚本 | 验证方法 |
| 6（选做） | C 组任选 2 题 | 提高 |

**思考题**：

1. 为什么 Python 有 GIL 还要提供 `threading`？举一个多线程真能加速的场景。
2. `sys.getsizeof([0] * 1000)` 只有 8 KB 左右，但这 1000 个整数本身占多少？
   为什么 `getsizeof` 不把它们算进去？
3. 段错误（Segmentation Fault）在虚拟地址空间的哪个区域最容易发生？为什么？
4. 若一道题 n = 10⁷、内存限制 64 MB，用 `list` 存布尔数组会 MLE 吗？用 `bytearray` 呢？
5. 5.3 的贪心若改成"按耗时排序"，构造一组数据说明它是错的。

---

# 7 小结

1. 编译 vs 解释解释了"同一算法 C++ 过而 Python TLE"：**Python 的对策是换算法，不是抠常数**。
2. 每条 Python 字节码都是一次解释器循环；**内建函数（C 实现）比等价的 Python 循环快 5–10 倍**。
3. GIL 让多线程对 CPU 密集任务无效；本课用线程只为**加大递归栈**。
4. 虚拟地址空间：栈（8 MB，深递归撑爆它）、堆（Python 对象）、代码段。
   页表 + MMU 完成翻译，缺页中断处理未映射访问。
5. **估内存**：`list` 存 10⁶ 个 int 约 40 MB，`bytearray` 约 1 MB。OJ 限制 64–256 MB。
6. 局部性原理 → **顺序访问连续内存**；批量 I/O 比逐条 I/O 快一个数量级。
7. 综合题的流程：**看范围 → 认题型 → 定策略 → 处理冲突 → 对拍**。

**下周预告**：**AI 素养**、12 月月考讲评与综合复习。

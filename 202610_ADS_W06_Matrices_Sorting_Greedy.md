# 第6周 矩阵、排序与贪心：认识时间复杂度

*Updated 2026-10-31 GMT+8*
 *Compiled by Hongfei Yan (2026 Fall)*
https://github.com/GMyhf/2026fall-cs101

> **课程安排对应**：第 6 周
> **主题与学习重点**：矩阵、排序与贪心；认识时间复杂度。

**知识点**：向量与矩阵的基本概念、二维列表与矩阵的表示、保护圈技巧、方向数组、`min` / `max` 裁剪范围、矩阵转置 / 旋转 / 乘法（含稀疏矩阵）、二维前缀和、`sorted` 与 `key` / 稳定性、五种基础排序及其复杂度、其余排序算法（希尔、堆、计数、基数）与选取规则、二分查找、贪心算法的三个要素与反例、排序型贪心、双指针、交换论证。

---

本周要回答三个问题：

1. **二维数据怎么摆脱越界判断？** 保护圈在四周补一圈哨兵值，内部循环就不用再判断 `0 <= i < m`。
2. **`sorted` 会用就够吗？** 多关键字、稳定性、自定义比较够应付大多数题，但"排序键怎么来"才是难点。
3. **贪心为什么有时错？** 找零 `[1, 3, 4]` 凑 6，贪心给 3 枚，最优只要 2 枚。交换论证才能把排序键真正推出来。

一句话概括：从"写对"走向"写得快"——同一个问题，不同的组织方式，复杂度可以差几个数量级。

**先跑一遍**：四行代码，四个本周要讲清楚的现象。

```python
a = [[0] * 3] * 2
a[0][0] = 9
print(a)                      # [[9, 0, 0], [9, 0, 0]]  改了一行，两行都变了（§1.1）
print(sorted([3, 1, 2]))      # [1, 2, 3]  默认升序，返回新列表（§2.1）
rows = [("a", 2), ("b", 1)]
rows.sort(key=lambda r: r[1])
print(rows)                   # [('b', 1), ('a', 2)]  Python 的排序是稳定的（§2.1）
print(4 + 1 + 1, "vs", 3 + 3) # 6 vs 6  都凑出 6，贪心用 3 枚，最优只要 2 枚（§3.2）
```

---

# 1 矩阵

## 1.0 先修：矩阵基础

在编程中，输入数据经常以矩阵的形式出现（Python 里就是二维列表）。先把数学上的概念对齐。
这段借鉴自姜伟生《数学要素》1.4 与 1.5 节。

### 向量：数字排成行与列

若干数字排成一行或一列，并用中括号括起来，得到的数组称为**向量**（vector）：
排成一行的叫**行向量**（row vector），排成一列的叫**列向量**（column vector）。

$$
\begin{bmatrix}
  1 & 2 & 3
\end{bmatrix}_{1 \times 3}, \quad
\begin{bmatrix}
  1 \\
  2 \\
  3
\end{bmatrix}_{3 \times 1}
$$

右下角标 $1 \times 3$ 表示"1 行 3 列"，$3 \times 1$ 表示"3 行 1 列"。

### 矩阵：数字排成长方形

**矩阵**（matrix）把一系列数字按长方形表格排列，有行、有列：

$$
\begin{bmatrix}
  1 & 2 & 3 \\
  4 & 5 & 6
\end{bmatrix}_{2 \times 3}, \quad
\begin{bmatrix}
  1 & 2 \\
  3 & 4 \\
  5 & 6
\end{bmatrix}_{3 \times 2}, \quad
\begin{bmatrix}
  1 & 2 \\
  3 & 4
\end{bmatrix}_{2 \times 2}
$$

通常用大写字母 A、B、X 代表矩阵；一个 m 行 n 列的矩阵，形状记作 m×n。
一般地，n×D 的矩阵 X 写成：

$$
X_{n \times D}=
\begin{bmatrix}
  x_{1,1} & x_{1,2} & \cdots & x_{1,D} \\
  x_{2,1} & x_{2,2} & \cdots & x_{2,D} \\
  \vdots & \vdots & \ddots & \vdots \\
  x_{n,1} & x_{n,2} & \cdots & x_{n,D}
\end{bmatrix}
$$

<img src="https://raw.githubusercontent.com/GMyhf/img/main/img/image-20230902171300400.png" alt="n×D 矩阵 X" width="350"/>

**口诀**：说形状、说位置，都是**先说行，再说列**。$x_{i,j}$ 是第 i 行、第 j 列的元素（i j entry）。

矩阵相关的常用英文表达：

<img src="https://raw.githubusercontent.com/GMyhf/img/main/img/image-20230902170435199.png" alt="矩阵有关英文表达" width="600"/>

### 对应到 Python：二维列表

```python
A = [[1, 2, 3], [4, 5, 6]]
print(len(A), len(A[0]))     # 2 3  -> 行数、列数，形状 2x3
print(A[1][2])               # 6    -> 第 1 行第 2 列（从 0 数）
print(A[1])                  # [4, 5, 6]  "第 i 行"就是 A[i]，一个一维列表
```

数学书里下标从 1 开始（$x_{1,1}$），Python 列表从 0 开始，所以第一行第一列是 `A[0][0]`。

### 转置：行变列，列变行

转置记作上标 T：行向量转置得到列向量，反之亦然；矩阵 A 转置后，`A[i][j]` 变成 `Aᵀ[j][i]`，形状 m×n 变成 n×m。

$$
\begin{bmatrix}
  1 & 2 & 3 \\
  4 & 5 & 6
\end{bmatrix}^\mathrm{T}
=
\begin{bmatrix}
  1 & 4 \\
  2 & 5 \\
  3 & 6
\end{bmatrix}
$$

Python 里转置一行就够：`list(zip(*A))` 得到 `[(1, 4), (2, 5), (3, 6)]`，要列表就写 `[list(r) for r in zip(*A)]`。§1.3 会接着用它做旋转。

### 加法与乘法的规则

- **加法**：两个矩阵形状必须相同，对应位置相加：`E[i][j] = D[i][j] + C[i][j]`（减法同理）。
- **乘法**：A 的**列数**必须等于 B 的**行数**。m×n 乘 n×p 得 m×p：

  `D[i][j] = A[i][0]*B[0][j] + A[i][1]*B[1][j] + … + A[i][n-1]*B[n-1][j]`

  即 A 的第 i 行与 B 的第 j 列对应相乘再求和。例如

$$
\begin{bmatrix}
  1 & 2 & 3 \\
  4 & 5 & 6
\end{bmatrix}
\begin{bmatrix}
  7 & 8 \\
  9 & 10 \\
  11 & 12
\end{bmatrix}
=
\begin{bmatrix}
  58 & 64 \\
  139 & 154
\end{bmatrix}
$$

  其中 58 = 1×7 + 2×9 + 3×11。

形状对不上（加法形状不同、乘法 A 的列数 ≠ B 的行数）时，题目里通常就要输出 `Error!`。

### 例题 263A. Beautiful Matrix

**263A. Beautiful Matrix**，implementation, 800，<https://codeforces.com/problemset/problem/263/A>

> 5×5 矩阵，24 个 0 和 1 个 1。每次可交换相邻两行或相邻两列，求把 1 移到中心（第 3 行第 3 列）的最少次数。

**思路**：行、列各自独立。设 1 在第 r 行第 c 列（从 1 开始数），行要移 |r−3| 次，列要移 |c−3| 次，
答案就是曼哈顿距离 `abs(r - 3) + abs(c - 3)`。

```python
for i in range(1, 6):
    row = list(map(int, input().split()))
    if 1 in row:
        r = i
        c = row.index(1) + 1
        print(abs(r - 3) + abs(c - 3))
        break
```

样例：1 在第 2 行第 5 列，|2−3| + |5−3| = 3。

### 例题 E18161: 矩阵运算（先乘再加）

**E18161: 矩阵运算(先乘再加)**，<http://cs101.openjudge.cn/practice/18161/>

> 输入三个矩阵 A、B、C（每个先给行数、列数，再给各行数字），计算 A·B + C。能算就输出结果；不能算输出 `Error!`。

先判形状，再计算：

1. 乘法能做吗：A 的列数 = B 的行数（`ca == rb`）；
2. 加法能做吗：A·B 的形状 = C 的形状（`ra == rc and cb == cc`）；
3. 都满足才算，否则输出 `Error!`。

```python
def read():
    r, c = map(int, input().split())
    return [list(map(int, input().split())) for _ in range(r)]


A, B, C = read(), read(), read()
ra, ca = len(A), len(A[0])
rb, cb = len(B), len(B[0])
rc, cc = len(C), len(C[0])
if ca != rb or ra != rc or cb != cc:
    print("Error!")
else:
    for i in range(ra):
        row = []
        for j in range(cb):
            s = C[i][j]
            for k in range(ca):
                s += A[i][k] * B[k][j]
            row.append(s)
        print(*row)
```

样例 1：A 是 3×1，B 是 1×2，C 是 3×2。A·B = `[[0,0],[1,1],[0,0]]`，再加 C = `[[3,1],[3,1],[3,1]]`，
得 `[[3,1],[4,2],[3,1]]`。样例 2：A 是 1×1，B 是 2×1，A 的列数 1 ≠ B 的行数 2，直接 `Error!`。

复杂度：乘法 O(m·n·p)，加法 O(m·p)，结果矩阵占 O(m·p) 空间。

**另一种写法：`@` 运算符**。Python 3.5 起（PEP 465）有矩阵乘法运算符 `@`，
但普通嵌套列表没有定义 `__matmul__`，直接写 `A @ B` 会报错。自己封装一个类，实现 `__matmul__` 和 `__add__`，
维度不合法时抛 `ValueError`，就能写出和数学式一样的 `A @ B + C`：

```python
class Matrix:
    def __init__(self, data):
        self.data = data
        self.rows = len(data)
        self.cols = len(data[0]) if self.rows else 0

    def __matmul__(self, other):            # A @ B
        if self.cols != other.rows:
            raise ValueError("Matrix dimensions do not match for multiplication")
        result = [[0] * other.cols for _ in range(self.rows)]
        for i in range(self.rows):
            for j in range(other.cols):
                for k in range(self.cols):
                    result[i][j] += self.data[i][k] * other.data[k][j]
        return Matrix(result)

    def __add__(self, other):               # A + B
        if self.rows != other.rows or self.cols != other.cols:
            raise ValueError("Matrix dimensions do not match for addition")
        return Matrix([[self.data[i][j] + other.data[i][j] for j in range(self.cols)]
                       for i in range(self.rows)])

    def __str__(self):                      # print 时的格式
        return "\n".join(" ".join(map(str, row)) for row in self.data)


def read_matrix():
    r, c = map(int, input().split())
    return Matrix([list(map(int, input().split())) for _ in range(r)])


A, B, C = read_matrix(), read_matrix(), read_matrix()
try:
    print(A @ B + C)                        # 自动调用 __str__
except ValueError:
    print("Error!")
```

## 1.1 表示与遍历

```python
m, n = 3, 4
a = [[0] * n for _ in range(m)]        # ✅ m 行 n 列
# a = [[0] * n] * m                    # ❌ 三行是同一个列表

for i in range(m):
    for j in range(n):
        a[i][j] = i * n + j

for row in a:
    print(*row)
# 0 1 2 3
# 4 5 6 7
# 8 9 10 11
```

**为什么 `[[0] * n] * m` 是错的**：`*` 复制的是引用，不是内容——m 个位置指向同一个内层列表，
改 `a[0][0]` 会看到 `a[1][0]` 也跟着变。本周开头"先跑一遍"的第一个现象就是它。

**读入一个 m×n 矩阵**：

```python
import sys

data = sys.stdin.read().split()
idx = 0
m, n = int(data[idx]), int(data[idx + 1]); idx += 2
a = []
for _ in range(m):
    a.append([int(data[idx + j]) for j in range(n)])
    idx += n
```

`sys.stdin.read().split()` 把整份输入切成一个 token 列表，比逐行 `input()` 快很多，是数据量大时的标配写法。

**遍历顺序与缓存**：按行遍历（`a[i][j]` 中 j 变化快）比按列遍历快，
因为一行的元素在内存中相邻——这是第 3 周存储层次的直接后果。

## 1.2 保护圈（padding）

处理"每个格子看它的上下左右邻居"这类问题时，边界判断很啰嗦：

```python
# 没有保护圈：每次都要判越界
for i in range(m):
    for j in range(n):
        s = 0
        for di, dj in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            ni, nj = i + di, j + dj
            if 0 <= ni < m and 0 <= nj < n:
                s += a[ni][nj]
```

**保护圈**：在四周补一圈 0，内部就不需要判越界了：

```python
m, n = 3, 3
a = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]

# 加保护圈：变成 (m+2) x (n+2)
g = [[0] * (n + 2) for _ in range(m + 2)]
for i in range(m):
    for j in range(n):
        g[i + 1][j + 1] = a[i][j]

DIRS = ((-1, 0), (1, 0), (0, -1), (0, 1))
res = [[0] * n for _ in range(m)]
for i in range(1, m + 1):
    for j in range(1, n + 1):
        res[i - 1][j - 1] = sum(g[i + di][j + dj] for di, dj in DIRS)

for row in res:
    print(*row)
# 6 9 8
# 13 20 17
# 12 21 14
```

**方向数组**是本课后面（第 9 周 DFS、第 12 周 BFS）反复使用的写法：

```python
DIRS4 = ((-1, 0), (1, 0), (0, -1), (0, 1))                       # 上下左右
DIRS8 = tuple((di, dj) for di in (-1, 0, 1) for dj in (-1, 0, 1)
              if (di, dj) != (0, 0))                             # 八邻域
```

四 / 八个方向反复出现在 DFS、BFS、Flood Fill 里。写成 `DIRS` 元组后，`for di, dj in DIRS:` 一行代替四 / 八段重复代码。

### 练习 M12560: 生存游戏（保护圈 + 八邻域）

**M12560: 生存游戏**，<http://cs101.openjudge.cn/pctbook/M12560/>

> 给定 n×m（1 ≤ n, m ≤ 100）的细胞矩阵，1 表示活、0 表示死。每个细胞看它的 8 个邻居：
> 活细胞的活邻居少于 2 个或多于 3 个就死去，2 或 3 个则继续活；死细胞恰有 3 个活邻居就复活。
> 所有细胞**同时**更新，求一次更新后的状态。

<img src="https://raw.githubusercontent.com/GMyhf/img/main/img/image-20231017141049409.png" alt="生存游戏" style="zoom:50%;" />

两个要点：加保护圈后数邻居不用判越界；结果写进**新矩阵**，不能边算边改原矩阵（否则后面的格子会用到更新后的邻居）。

```python
n, m = map(int, input().split())
g = [[0] * (m + 2)]
for _ in range(n):
    g.append([0] + list(map(int, input().split())) + [0])
g.append([0] * (m + 2))

DIRS8 = tuple((di, dj) for di in (-1, 0, 1) for dj in (-1, 0, 1)
              if (di, dj) != (0, 0))
for i in range(1, n + 1):
    row = []
    for j in range(1, m + 1):
        c = sum(g[i + di][j + dj] for di, dj in DIRS8)
        if g[i][j] == 1:
            row.append(1 if c in (2, 3) else 0)
        else:
            row.append(1 if c == 3 else 0)
    print(*row)
```

样例输入 `3 4` / `0 0 1 1` / `1 1 0 0` / `1 1 0 1`，输出：

```
0 1 1 0
1 0 0 1
1 1 1 0
```

### 练习 508A. Pasha and Pixels（保护圈）

**508A. Pasha and Pixels**，brute force, 1100，<http://codeforces.com/problemset/problem/508/A>

> n×m 的白色像素网格（n, m ≤ 1000），按计划依次把 k 个像素涂黑（k ≤ 10⁵）。
> 问第几步第一次出现 2×2 的全黑方块；始终没有则输出 0。

每涂一个格子，只需检查**以它为某个角**的 4 个 2×2 方块。加了保护圈，`r - 1`、`c + 1` 都不会越界：

```python
import sys

data = sys.stdin.read().split()
n, m, k = int(data[0]), int(data[1]), int(data[2])
g = [[0] * (m + 2) for _ in range(n + 2)]


def square_formed(i, j):
    # (i, j) 可能是 2x2 黑块的左上、右上、左下、右下四个角之一
    for di, dj in ((0, 0), (0, -1), (-1, 0), (-1, -1)):
        r, c = i + di, j + dj          # 该 2x2 块的左上角
        if g[r][c] and g[r][c + 1] and g[r + 1][c] and g[r + 1][c + 1]:
            return True
    return False


ans = 0
for step in range(k):
    x, y = int(data[3 + 2 * step]), int(data[4 + 2 * step])
    g[x][y] = 1
    if square_formed(x, y):
        ans = step + 1
        break
print(ans)
```

三组样例的输出依次是 `4`、`5`、`0`。每步 O(1)，总复杂度 O(nm + k)——如果每步都扫一遍整个网格，就是 O(k·nm)，必然超时。

## 1.3 转置与旋转

```python
a = [[1, 2, 3], [4, 5, 6]]

t = [list(row) for row in zip(*a)]          # 转置：2x3 -> 3x2
print(t)                                     # [[1, 4], [2, 5], [3, 6]]

b = [[1, 2], [3, 4]]
cw = [list(row) for row in zip(*b[::-1])]   # 顺时针 90°
print(cw)                                    # [[3, 1], [4, 2]]

ccw = [list(row) for row in zip(*b)][::-1]  # 逆时针 90°
print(ccw)                                   # [[2, 4], [1, 3]]
```

**记法**：顺时针 = **先上下翻转再转置**；逆时针 = **先转置再上下翻转**。

## 1.4 矩阵乘法

C = A·B，其中 A 是 m×k，B 是 k×n，则 C 是 m×n，且 `C[i][j] = Σ A[i][t] * B[t][j]`。

```python
def matmul(A, B):
    m, k, n = len(A), len(B), len(B[0])
    C = [[0] * n for _ in range(m)]
    for i in range(m):
        Ai = A[i]                       # 提到内层循环外，减少一次索引
        Ci = C[i]
        for t in range(k):
            if Ai[t]:                   # 稀疏时跳过零，常数优化
                Bt = B[t]
                v = Ai[t]
                for j in range(n):
                    Ci[j] += v * Bt[j]
    return C


A = [[1, 2], [3, 4]]
B = [[5, 6], [7, 8]]
print(matmul(A, B))          # [[19, 22], [43, 50]]
```

复杂度 **O(m·k·n)**。n = 200 时是 8×10⁶，可以；n = 1000 时是 10⁹，必然 TLE。

**E18161: 矩阵运算（先乘再加）**，<http://cs101.openjudge.cn/practice/18161/>
先判断维度是否匹配，不匹配输出 `Error!`——**这类题的失分几乎全在漏判维度**（完整代码见 §1.0）。

### 循环顺序为什么能换

上面的 `matmul` 循环顺序是 i → t → j，和教科书上的 i → j → t 不一样：

- **经典写法 i → j → t**（一次算一个格子）：固定 `C[i][j]`，把 k 项乘积一次加完，就是"A 的第 i 行 · B 的第 j 列"的点积。

  ```python
  for i in range(m):
      for j in range(n):
          for t in range(k):
              C[i][j] += A[i][t] * B[t][j]
  ```

- **本节写法 i → t → j**（一次更新一整行）：取出 `A[i][t]` 这一个数 v，乘 B 的第 t 整行，累加到 C 的第 i 整行；k 轮之后，C 的第 i 行就算完了。

两种写法结果一样，因为 `C[i][j] = A[i][0]·B[0][j] + A[i][1]·B[1][j] + … + A[i][k-1]·B[k-1][j]`，
加法满足交换律，加的顺序不影响总和：经典写法一次加完 k 项；本节写法分 k 轮（t = 0, 1, …），每一轮给这一行所有格子各加一项。

> **记忆**：C 的第 i 行 = Σₜ A[i][t] × （B 的第 t 行）。

用 A = `[[1, 2], [3, 4]]`、B = `[[5, 6], [7, 8]]` 手算一遍（`Ci` 每换一个 i 都从 `[0, 0]` 开始）：

| i | t | v = A[i][t] | Bt = B[t] | v·Bt | 累加后 Ci |
| - | - | ---- | ---- | ---- | ---- |
| 0 | 0 | 1 | [5, 6] | [5, 6] | [5, 6] |
| 0 | 1 | 2 | [7, 8] | [14, 16] | **[19, 22]** |
| 1 | 0 | 3 | [5, 6] | [15, 18] | [15, 18] |
| 1 | 1 | 4 | [7, 8] | [28, 32] | **[43, 50]** |

即 C 的第 0 行 = 1×[5, 6] + 2×[7, 8] = [5, 6] + [14, 16] = [19, 22]。

### 三个常数优化

1. **局部变量，少一次索引**：`Ai = A[i]`、`Ci = C[i]`、`Bt = B[t]`，内层只剩一维索引 `Ci[j] += v * Bt[j]`，比反复写 `C[i][j]` 快。`Ci` 和 `C[i]` 是同一个列表，改 `Ci` 就是改 `C`。
2. **跳过 0，稀疏时更快**：`A[i][t] == 0` 时这一轮加的全是 0，直接跳过整个内层循环。0 越多，省得越多。
3. **按行连续访问**：经典写法内层是 `B[t][j]` 且 t 在变，是在 B 的"列"上跳着读；本节写法内层沿着 B 的一行走，更顺（§1.1 的缓存问题）。

这些只是常数优化，**复杂度仍是 O(m·k·n)**。另外 `matmul` 默认 A 的列数 = B 的行数，做 E18161 要先判 `len(A[0]) != len(B)`。

### 稀疏矩阵：E23555

**E23555: 节省存储的矩阵乘法**，<http://cs101.openjudge.cn/practice/23555/>
用三元组 `(行, 列, 值)` 存稀疏矩阵，只记非零元。

**先求做对：稀疏 → 普通矩阵 → 稀疏**。三步：① 把三元组放回 n×n 的格子（其余全是 0）；
② 用上面的 `matmul` 照常相乘；③ 按行、再按列扫一遍，遇到非 0 就记下 `(行, 列, 值)`——顺序扫描，结果天然按 (行, 列) 升序。

```python
def to_dense(n, items):
    M = [[0] * n for _ in range(n)]
    for r, c, v in items:
        M[r][c] = v
    return M


def to_sparse(M):
    return [(i, j, x)
            for i, row in enumerate(M)
            for j, x in enumerate(row) if x != 0]


def sparse_matmul_dense(n, a_items, b_items):
    A = to_dense(n, a_items)       # ① 还原成普通矩阵
    B = to_dense(n, b_items)
    C = matmul(A, B)               # ② 相乘（上面的 matmul）
    return to_sparse(C)            # ③ 转回三元组


print(sparse_matmul_dense(3, [(0, 0, 1), (1, 2, 2)],
                             [(0, 1, 3), (2, 0, 4), (2, 2, 5)]))
# [(0, 1, 3), (1, 0, 8), (1, 2, 10)]
```

例中 C 的第 1 行 = 2 × B 的第 2 行 = [8, 0, 10]。这种写法好懂，但 `to_dense` 要占 n² 空间，n 不大时最稳。
输入输出格式以题面为准：读入后组成 `a_items`、`b_items`，再按行、列升序输出三元组。

**进阶：直接在三元组上乘（省空间）**。把 B 按行建索引 `brow[t]`（B 第 t 行的非零元），
遍历 A 的每个非零元 `(i, t, v)`，配上 `brow[t]` 里的每个 `(j, w)`，累加到 `acc[(i, j)] += v * w`——
字典当作 C，没出现的位置就是 0。空间只和非零元个数有关，n 很大时用。

```python
from collections import defaultdict


def sparse_matmul(n, a_items, b_items):
    """a_items / b_items 为 (行, 列, 值) 列表，返回按 (行, 列) 升序的三元组列表。"""
    brow = defaultdict(list)
    for r, c, v in b_items:
        brow[r].append((c, v))
    acc = defaultdict(int)
    for i, t, v in a_items:
        for j, w in brow.get(t, ()):
            acc[(i, j)] += v * w
    return [(i, j, v) for (i, j), v in sorted(acc.items()) if v != 0]


print(sparse_matmul(2, [(0, 0, 1), (1, 1, 2)], [(0, 1, 3), (1, 0, 4)]))
# [(0, 1, 3), (1, 0, 8)]
```

## 1.5 二维前缀和

求任意子矩阵的和，预处理 O(mn)、单次查询 O(1)：

```python
def build_prefix(a):
    m, n = len(a), len(a[0])
    pre = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m):
        for j in range(n):
            pre[i + 1][j + 1] = pre[i][j + 1] + pre[i + 1][j] - pre[i][j] + a[i][j]
    return pre


def query(pre, r1, c1, r2, c2):
    """左上 (r1,c1) 到右下 (r2,c2) 闭区间的和（0-indexed）。"""
    return pre[r2 + 1][c2 + 1] - pre[r1][c2 + 1] - pre[r2 + 1][c1] + pre[r1][c1]


a = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
pre = build_prefix(a)
print(query(pre, 0, 0, 1, 1))     # 1+2+4+5 = 12
print(query(pre, 1, 1, 2, 2))     # 5+6+8+9 = 28
```

**容斥原理**：`大矩形 - 上 - 左 + 左上（被减了两次要加回来）`。
第 11 周的"最大子矩阵"会直接用到它。

## 1.6 扩展：`range` 里用 `min` / `max` 裁剪范围

保护圈适合"只看相邻一格"；当影响范围是**以某点为中心、边长可变的正方形**时，补圈就不划算了。
更常用的写法是把循环范围直接裁到矩阵内：

```python
# 以 (x, y) 为中心、半径 d 的正方形，裁剪到 0..N-1 之内
for i in range(max(0, x - d), min(N, x + d + 1)):
    for j in range(max(0, y - d), min(N, y + d + 1)):
        ...
```

`max(0, ...)` 管下界，`min(N, ...)` 管上界——`range` 的右端是开区间，所以上界写 `x + d + 1` 再与 N 取小。

### 练习 M04133: 垃圾炸弹

**M04133: 垃圾炸弹**，<http://cs101.openjudge.cn/pctbook/M04133/>

> 城市是 1025×1025 的网格，n（≤ 20）个路口有垃圾，坐标 (x, y)、数量 i。
> 炸弹威力 d（≤ 50）：炸在 (X, Y) 时清除 |x−X| ≤ d 且 |y−Y| ≤ d 的所有垃圾。
> 求能清除最多垃圾的投放点有几个，以及最多能清除多少。

**反过来想**：不枚举投放点去数垃圾，而是让每堆垃圾把自己的数量"加到"所有能炸到它的投放点上——
能炸到 (x, y) 的投放点，恰好也是以 (x, y) 为中心、半径 d 的正方形。

```python
d = int(input())
n = int(input())
N = 1025
cnt = [[0] * N for _ in range(N)]
for _ in range(n):
    x, y, k = map(int, input().split())
    for i in range(max(0, x - d), min(N, x + d + 1)):
        row = cnt[i]
        for j in range(max(0, y - d), min(N, y + d + 1)):
            row[j] += k

best = max(max(row) for row in cnt)
ways = sum(row.count(best) for row in cnt)
print(ways, best)
```

样例 `d=1`，垃圾 `(4,4,10)`、`(6,6,20)`：只有 (5, 5) 能同时炸到两堆，输出 `1 30`。
复杂度 O(n·(2d+1)² + 1025²)，约 1.3×10⁶，可以接受。

### 练习 02659: Bomb Game

**02659: Bomb Game**，<http://cs101.openjudge.cn/practice/02659/>

> A 行 B 列的棋盘（A, B, K ≤ 100），对方把碉堡藏在某一格。依次扔了 K 枚炸弹，
> 每枚给出中心 (R, S)、直径 P（奇数，范围是以 (R, S) 为中心、边长 P 的正方形）和结果 T：
> T = 1 表示碉堡在范围内，T = 0 表示不在。求碉堡可能在的格子数。

一个格子可能，当且仅当它**在每一枚 T=1 的炸弹范围内**、且**不在任何一枚 T=0 的炸弹范围内**：

```python
A, B, K = map(int, input().split())
inside = [[0] * (B + 1) for _ in range(A + 1)]             # 落在 T=1 范围内的次数
outside_bad = [[False] * (B + 1) for _ in range(A + 1)]    # 是否落在某个 T=0 范围内
need = 0                                                   # T=1 炸弹的个数
for _ in range(K):
    R, S, P, T = map(int, input().split())
    h = (P - 1) // 2
    need += T
    for i in range(max(1, R - h), min(A, R + h) + 1):
        for j in range(max(1, S - h), min(B, S + h) + 1):
            if T == 1:
                inside[i][j] += 1
            else:
                outside_bad[i][j] = True
print(sum(inside[i][j] == need and not outside_bad[i][j]
          for i in range(1, A + 1) for j in range(1, B + 1)))
```

样例（5×5，3 枚炸弹）输出 `5`。

> ⚠️ 一种常见写法是"T=1 加 1、T=0 减 1，再数最大值出现了几次"。它在至少有一个格子满足全部条件时结果正确，
> 但如果没有格子同时满足所有条件，最大值处的格子其实都不可能，正确答案应为 0。
> **"取最大值"和"满足全部条件"不是一回事**，写之前先想清楚判定条件。

---

# 2 排序

## 2.1 会用 `sorted` 就够应付大多数题

```python
a = [3, 1, 2]
print(sorted(a))                     # [1, 2, 3]，返回新列表
a.sort(reverse=True)                 # 原地降序 -> [3, 2, 1]

people = [("bob", 20), ("amy", 20), ("cid", 18)]
print(sorted(people, key=lambda p: p[1]))          # 按年龄升序
print(sorted(people, key=lambda p: (p[1], p[0])))  # 年龄升序，同龄按名字升序
print(sorted(people, key=lambda p: (-p[1], p[0]))) # 年龄降序，同龄按名字升序
```

**多关键字排序的通用写法**：`key` 返回一个元组，元素按优先级排列；
数值要降序就取负号，字符串要降序就分两次排（利用稳定性）。

**稳定性**：Python 的 `sort` 是**稳定**的——相等元素保持原有相对顺序。所以：

```python
rows = [("a", 2), ("b", 1), ("c", 2)]
rows.sort(key=lambda r: r[0])        # 先按次关键字
rows.sort(key=lambda r: r[1])        # 再按主关键字，次关键字的顺序被保留
print(rows)                          # [('b', 1), ('a', 2), ('c', 2)]
```

复杂度 **O(n log n)**（Timsort），已排序数据接近 O(n)。

## 2.2 五种基础排序

| 算法 | 平均 | 最坏 | 空间 | 稳定 | 特点 |
| ---- | ---- | ---- | ---- | ---- | ---- |
| 冒泡 | O(n²) | O(n²) | O(1) | 是 | 教学用；可提前退出 |
| 选择 | O(n²) | O(n²) | O(1) | 否 | 交换次数最少（n−1 次） |
| 插入 | O(n²) | O(n²) | O(1) | 是 | **近乎有序时接近 O(n)** |
| 归并 | O(n log n) | O(n log n) | O(n) | 是 | 分治；可顺带求逆序数 |
| 快排 | O(n log n) | O(n²) | O(log n) | 否 | 常数最小；随机化避免最坏 |

```python
def bubble_sort(a):
    a = a[:]
    n = len(a)
    for i in range(n - 1):
        swapped = False
        for j in range(n - 1 - i):
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                swapped = True
        if not swapped:              # 一趟没交换 -> 已有序，提前退出
            break
    return a


def insertion_sort(a):
    a = a[:]
    for i in range(1, len(a)):
        key, j = a[i], i - 1
        while j >= 0 and a[j] > key:
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = key
    return a


def merge_sort(a):
    if len(a) <= 1:
        return a[:]
    mid = len(a) // 2
    left, right = merge_sort(a[:mid]), merge_sort(a[mid:])
    out, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:      # <= 保证稳定
            out.append(left[i]); i += 1
        else:
            out.append(right[j]); j += 1
    out.extend(left[i:])
    out.extend(right[j:])
    return out


def quick_sort(a):
    if len(a) <= 1:
        return a[:]
    pivot = a[len(a) // 2]
    less = [x for x in a if x < pivot]
    equal = [x for x in a if x == pivot]
    greater = [x for x in a if x > pivot]
    return quick_sort(less) + equal + quick_sort(greater)


import random
t = [random.randint(0, 100) for _ in range(200)]
assert bubble_sort(t) == insertion_sort(t) == merge_sort(t) == quick_sort(t) == sorted(t)
print("四种排序与内建 sorted 一致")
```

**对照着看**：

- **冒泡**：相邻交换，一趟把最大值"冒"到末尾；一趟没交换就说明已有序，可以提前退出。
- **插入**：把 `a[i]` 当作一张扑克牌，往前找位置、挪出空位再插入；找到位置就停，所以近乎有序时很快。
- **归并**：合并时 `left[i] <= right[j]` 用 `<=`，相等先取左边、保持原有相对顺序——**这一个符号就是归并"稳定"的全部原因**。
- **快排**：本节写法把等于 pivot 的元素一次性收进 `equal`；教科书上的原地分区版本会跨位置交换元素，所以快排是**不稳定**的（见 §2.4 的双指针分区）。

**写完手写算法，第一件事是对拍**：小规模随机数据 + `assert`，比对着标准答案看半天更快找出 bug——
这个习惯本周后面的贪心（§3.4）也会反复用到。

表里的**选择排序**没有在上面的代码里出现，补上：每趟在无序区找最小值，与无序区的第一个交换。

```python
def selection_sort(a):
    a = a[:]
    n = len(a)
    for i in range(n - 1):
        k = i
        for j in range(i + 1, n):
            if a[j] < a[k]:
                k = j
        a[i], a[k] = a[k], a[i]      # 每趟只交换一次，共 n-1 次
    return a


print(selection_sort([5, 3, 1, 4, 2]))   # [1, 2, 3, 4, 5]
```

它为什么**不稳定**？因为那次交换是"隔着"交换的：

```python
def selection_sort_by_key(a):
    """只按第 0 个分量比较的选择排序。"""
    a = a[:]
    for i in range(len(a) - 1):
        k = min(range(i, len(a)), key=lambda j: a[j][0])
        a[i], a[k] = a[k], a[i]
    return a


print(selection_sort_by_key([(2, 'a'), (2, 'b'), (1, 'c')]))
# [(1, 'c'), (2, 'b'), (2, 'a')]  -> 第一趟把 (2,'a') 换到了末尾，两个 2 的先后被打乱
```

判断稳定性的一个经验：**只做相邻交换的是稳定的（冒泡、插入），隔着交换的可能不稳定（选择、快排、希尔、堆）。**

> **考试里要不要手写排序？** 一般不要——直接 `sort()`。
> 但**归并排序的合并过程**要会写：求逆序对、合并有序序列都要用。

## 2.3 归并排序求逆序对

```python
def count_inversions(a):
    """返回 (排序后的列表, 逆序对个数)。O(n log n)。"""
    if len(a) <= 1:
        return a[:], 0
    mid = len(a) // 2
    left, x = count_inversions(a[:mid])
    right, y = count_inversions(a[mid:])
    out, i, j, cnt = [], 0, 0, x + y
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            out.append(left[i]); i += 1
        else:
            out.append(right[j]); j += 1
            cnt += len(left) - i     # left 中剩下的都比 right[j] 大
    out.extend(left[i:]); out.extend(right[j:])
    return out, cnt


print(count_inversions([3, 1, 2])[1])       # 2  —— (3,1) 和 (3,2)
print(count_inversions([5, 4, 3, 2, 1])[1]) # 10 = C(5,2)
```

**为什么是 `cnt += len(left) - i`，不是 `+= 1`？** 以 `[3, 1, 2]` 为例：左半 `left = [3]`，右半排序后 `right = [1, 2]`。合并时：

| 步骤 | 比较 | 记几个逆序对 |
| ---- | ---- | ---- |
| 取 right[0] = 1 | 1 < 3，逆序 | left 剩下的 [3] 全部比 1 大，一次记 len(left) − i = 1 个 |
| 取 right[1] = 2 | 2 < 3，逆序 | left 剩下的 [3] 全部比 2 大，再记 1 个 |

`right[j]` 一旦比 `left[i]` 小，它就比 left 里从 i 到末尾的**所有**元素都小（left 已经有序）——
这些都是逆序对，一次性记上 `len(left) - i` 个，而不是留到以后一个一个数。

## 2.4 扩展：其余排序算法与选取规则

常说的"十大排序"，除了上面五种，还有希尔、堆、计数、桶、基数排序。
Python 的内建排序 **Timsort** 本身就是归并 + 插入的混合（Java、Android 也用它）；
C++ 的 `std::sort` 多用 **introsort**（快排 + 堆排序）。

### 比较排序一览

| 算法 | 最好 | 平均 | 最坏 | 额外空间 | 稳定 | 方法 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 冒泡 | n | n² | n² | 1 | 是 | 交换 |
| 选择 | n² | n² | n² | 1 | 否 | 选择 |
| 插入 | n | n² | n² | 1 | 是 | 插入 |
| 希尔 | n log n | 依增量序列而定 | n² | 1 | 否 | 插入 |
| 归并 | n log n | n log n | n log n | n | 是 | 合并 |
| 快排 | n log n | n log n | n² | log n | 否 | 分区 |
| 堆排序 | n log n | n log n | n log n | 1 | 否 | 选择 |
| Timsort | n | n log n | n log n | n | 是 | 插入 + 合并 |

**比较排序平均意义下不可能快于 O(n log n)**。想更快，就得利用数据本身的特点——这就是计数、桶、基数排序这类**非比较排序**。
插入排序还有一个更精确的界：O(n + d)，d 是逆序对数，所以"几乎有序"时它接近线性。

### 怎么选

- **数据规模**：几千个元素以内，O(n²) 的简单排序也够；更大就用 O(n log n) 的归并、快排、堆排序。
- **数据特性**：几乎有序 → 插入排序；取值范围小 → 计数排序；分布均匀 → 桶排序；固定位数的整数或字符串 → 基数排序。
- **稳定性**：需要稳定 → 归并、插入、冒泡、计数、基数、桶排序。
- **内存限制**：额外空间要 O(1) → 选择排序、堆排序。

写题时绝大多数情况仍然是一句 `sort()`；这张表的用处是**读懂复杂度、回答"为什么"**。

### 代码：希尔、堆、计数、基数

```python
def shell_sort(a):
    a = a[:]
    n = len(a)
    gap = n // 2
    while gap > 0:
        for i in range(gap, n):          # 对间隔为 gap 的各个子序列做插入排序
            temp, j = a[i], i
            while j >= gap and a[j - gap] > temp:
                a[j] = a[j - gap]
                j -= gap
            a[j] = temp
        gap //= 2
    return a


def heapify(a, n, i):
    """把以 i 为根的子树调整成大根堆（假设它的左右子树已经是堆）。"""
    largest, l, r = i, 2 * i + 1, 2 * i + 2
    if l < n and a[l] > a[largest]:
        largest = l
    if r < n and a[r] > a[largest]:
        largest = r
    if largest != i:
        a[i], a[largest] = a[largest], a[i]
        heapify(a, n, largest)


def heap_sort(a):
    a = a[:]
    n = len(a)
    for i in range(n // 2 - 1, -1, -1):  # 自底向上建大根堆
        heapify(a, n, i)
    for i in range(n - 1, 0, -1):        # 堆顶（最大）换到末尾，堆缩小 1
        a[0], a[i] = a[i], a[0]
        heapify(a, i, 0)
    return a


def counting_sort(a):
    lo, hi = min(a), max(a)
    count = [0] * (hi - lo + 1)          # 值域多大，计数数组就多大
    for x in a:
        count[x - lo] += 1
    out = []
    for v, c in enumerate(count):
        out.extend([v + lo] * c)
    return out


def radix_sort(a):
    """非负整数：按个位、十位、百位……依次分桶。"""
    digits = len(str(max(a)))
    for d in range(digits):
        buckets = [[] for _ in range(10)]
        for x in a:
            buckets[x // 10 ** d % 10].append(x)
        a = [x for b in buckets for x in b]   # 按桶号收集，桶内保持原序
    return a


import random
for _ in range(500):
    t = [random.randint(0, 999) for _ in range(random.randint(1, 60))]
    assert shell_sort(t) == heap_sort(t) == counting_sort(t) == radix_sort(t) == sorted(t)
print("希尔、堆、计数、基数排序与内建 sorted 一致")
```

几点说明：

- **希尔排序**是插入排序的改进：先让相隔 gap 的元素各自有序，gap 逐步减半到 1 时再做一次普通插入排序。
  这时数组已"几乎有序"，插入排序很快。复杂度取决于增量序列，一般认为介于 O(n^1.25) 与 O(n^1.6) 之间。
- **堆排序**：先把数组建成大根堆（下标 i 的孩子是 2i+1、2i+2），反复把堆顶换到末尾、再把剩下的部分调整成堆。
  O(n log n)、O(1) 额外空间，但不稳定。堆本身会在后续课程用 `heapq` 再讲。
- **计数排序**：O(n + k)，k 是值域大小。k 很大（如值域 10⁹）时计数数组开不下，就不能用。
- **基数排序**：O(n·k)，k 是位数。每一轮必须用**稳定**的分桶，否则上一轮按低位排好的顺序会被打乱。
- **桶排序**：把值域均分成若干桶，每个桶内各自排序再顺次拼接；数据分布均匀时平均 O(n + k)，全挤进一个桶时退化。

基数排序的手算追踪，输入 `[170, 45, 75, 90, 802, 24, 2, 66]`：

| 轮次 | 按哪一位 | 非空的桶 | 收集后 |
| ---- | ---- | ---- | ---- |
| 第 0 轮 | 个位 | 0:[170, 90] 2:[802, 2] 4:[24] 5:[45, 75] 6:[66] | [170, 90, 802, 2, 24, 45, 75, 66] |
| 第 1 轮 | 十位 | 0:[802, 2] 2:[24] 4:[45] 6:[66] 7:[170, 75] 9:[90] | [802, 2, 24, 45, 66, 170, 75, 90] |
| 第 2 轮 | 百位 | 0:[2, 24, 45, 66, 75, 90] 1:[170] 8:[802] | [2, 24, 45, 66, 75, 90, 170, 802] |

注意第 1 轮里 170 排在 75 前面，是因为第 0 轮之后 170 本来就在 75 前面——**桶内保持原序**，这就是稳定性在起作用。

### 快排的原地分区（双指针）

§2.2 的快排为了好懂，每层都新建了三个列表。教科书写法是**原地分区**：取最右元素为 pivot，
i 从左往右找"不小于 pivot 的"，j 从右往左找"小于 pivot 的"，两者都找到就交换，最后把 pivot 换到 i 处。

```python
def quicksort(arr, left, right):
    if left < right:
        p = partition(arr, left, right)
        quicksort(arr, left, p - 1)
        quicksort(arr, p + 1, right)


def partition(arr, left, right):
    i, j = left, right - 1
    pivot = arr[right]
    while i <= j:
        while i <= right and arr[i] < pivot:
            i += 1
        while j >= left and arr[j] >= pivot:
            j -= 1
        if i < j:
            arr[i], arr[j] = arr[j], arr[i]
    if arr[i] > pivot:
        arr[i], arr[right] = arr[right], arr[i]
    return i


arr = [22, 11, 88, 66, 55, 77, 33, 44]
quicksort(arr, 0, len(arr) - 1)
print(arr)          # [11, 22, 33, 44, 55, 66, 77, 88]
```

分区结束时，pivot 左边都小于它、右边都不小于它，pivot 已经在最终位置。
每次都选到最大或最小值当 pivot（例如对已排序数组总取最右端）时，递归深度变成 n，退化为 O(n²)——随机选 pivot 就能避免。

> 递归过程不好在脑子里跑，可以把归并、快排贴进 <https://pythontutor.com> 单步看调用栈。

## 2.5 扩展：排好序之后——二分查找

排序的一大用处是让后续查找变快：无序数据只能线性查找 O(n)，有序数据可以**二分查找** O(log n)。
二分的思路好懂，细节难写对（`while` 用 `<=` 还是 `<`，折半后是 `mid + 1`、`mid - 1` 还是 `mid`）。
记住一条：**区间定义决定写法**，下面用闭区间 `[lo, hi]`，所以循环条件是 `lo <= hi`，两边都要跳过 mid。

```python
import bisect


def binary_search(a, target):
    """a 升序；找到返回下标，找不到返回 -1。"""
    lo, hi = 0, len(a) - 1
    while lo <= hi:                  # 闭区间 [lo, hi] 非空
        mid = (lo + hi) // 2
        if a[mid] == target:
            return mid
        elif a[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1


a = [1, 2, 4, 4, 4, 7, 9]
print(binary_search(a, 7), binary_search(a, 5))              # 5 -1
print(bisect.bisect_left(a, 4), bisect.bisect_right(a, 4))   # 2 5
print(bisect.bisect_right(a, 4) - bisect.bisect_left(a, 4))  # 3  -> 4 出现了 3 次
print(bisect.bisect_left(a, 5))                              # 5  -> 5 应插在下标 5
```

标准库 `bisect` 用的是左闭右开区间 `[lo, hi)`：`bisect_left(a, x)` 返回第一个 `>= x` 的位置，
`bisect_right(a, x)` 返回第一个 `> x` 的位置。两者相减就是 x 的出现次数。
`bisect` 的 `key` 参数从 **Python 3.10** 起才支持，老版本要自己先把键抽成一个列表再二分。

---

# 3 贪心

## 3.1 什么是贪心

**每一步都选当前看起来最好的**，且不回头。

三个要素：

1. **贪心策略**：每步怎么选；
2. **正确性证明**：为什么局部最优能拼成全局最优；
3. **反例检验**：想不出证明，就努力构造反例。

三要素里最难的从来不是"怎么选"，而是**正确性证明**——§3.4 的交换论证就是专门补这一块的通用方法。

### 扩展：贪心的适用条件、证明方法与常见题型

贪心用来解一类**最优化问题**，希望由局部最优策略推出全局最优结果。
能用贪心的问题一定满足**最优子结构**：问题的最优解可以由子问题的最优解构造出来。
《算法导论》对它的概括是：贪心算法在每一步总是做出当前看起来最优的选择，
**做出局部最优选择，希望这种选择最终能导致全局最优解**；贪心并不总能得到最优解，但对许多问题确实可以。

![image-20231017140409613](https://raw.githubusercontent.com/GMyhf/img/main/img/image-20231017140409613.png)

严格地说，用贪心求最优解需要证明策略正确，而证明往往比贪心本身更难。
实际做题时，如果想到一个似乎可行的策略、自己又举不出反例，就先编码实现、再和暴力对拍。

OI Wiki（<https://oi-wiki.org/basic/greedy/>）把贪心的证明归为两类：

1. **反证法 / 交换法**：交换方案中任意两个元素（或相邻两个元素）后，答案不会变得更好，就可以推定当前解已是最优——§3.4 的交换论证就是这一类；
2. **归纳法**：先求出边界情况（如 n = 1）的最优解 F₁，再证明对每个 n，F₍ₙ₊₁₎ 都可以由 Fₙ 推出。

入门难度最常见的贪心有两种形状：

- **离线**：先把 XXX 按某个顺序排序，再按顺序选择——先处理后选择，§3.3 的四道例题全是这一种；
- **在线**：每次取 XXX 中最大 / 最小的那个，并更新 XXX——边处理边选择，"取最大 / 最小"常用优先队列（堆）维护。

还有一种**后悔法**：不管当前选项是否最优都先接受，之后发现不是最优再反悔、舍弃掉它。

**与动态规划的区别**：贪心对每个子问题都当场做出选择、不能回退；
动态规划保存以前的运算结果，根据它们来选择当前的最优，相当于有回退功能。§3.2 的找零就是一个例子。

**排序本身也可以看作贪心**：选择排序每一趟都"选出当前最小的放到前面"，就是一种贪心策略。
后面图论中的 Kruskal 最小生成树算法——把边按权重从小到大排序，依次选取不构成回路的边——也是"排序 + 贪心"的典型。

## 3.2 贪心不总是对的

**找零问题**：面额 `[1, 5, 10, 25]`，凑 30 → 贪心选 25+5，2 枚，正确。
但面额 `[1, 3, 4]`，凑 6 → 贪心选 4+1+1，3 枚；**最优是 3+3，2 枚**。

```python
def greedy_coins(coins, amount):
    coins = sorted(coins, reverse=True)
    cnt, rest = 0, amount
    for c in coins:
        take = rest // c
        cnt += take
        rest -= take * c
    return cnt if rest == 0 else -1


def dp_coins(coins, amount):
    INF = float('inf')
    dp = [0] + [INF] * amount
    for i in range(1, amount + 1):
        for c in coins:
            if c <= i and dp[i - c] + 1 < dp[i]:
                dp[i] = dp[i - c] + 1
    return dp[amount] if dp[amount] < INF else -1


print(greedy_coins([1, 3, 4], 6), dp_coins([1, 3, 4], 6))   # 3 2  —— 贪心错了
print(greedy_coins([1, 5, 10, 25], 30), dp_coins([1, 5, 10, 25], 30))  # 2 2
```

> **这是第 11 周动态规划的动机**：贪心失效的地方，DP 接管。

## 3.3 排序型贪心：最常见的套路

绝大多数入门贪心题的形状都是：**先按某个键排序，再一遍扫过去**。
难点全在"**按什么排**"。

### 例：01017: 装箱问题

**01017: 装箱问题**，<http://cs101.openjudge.cn/practice/01017/>

> 有 1×1 到 6×6 六种规格的产品（高度都是 h），每个 6×6×h 的箱子装一层。
> 每行输入是一个订单：六个整数，分别为 1×1 至 6×6 产品的数量；以 6 个 0 的一行结束。
> 对每个订单输出最少箱子数。

样例输入：

```
0 0 4 0 0 1
7 5 1 0 0 0
0 0 0 0 0 0
```

样例输出：

```
2
1
```

**策略**：从大到小放。6×6 独占一箱；5×5 剩 11 个 1×1 的空位；
4×4 剩 5 个 2×2；3×3 四个一箱，余数按表补。

```python
import sys

# 一个 3x3 之后剩余的 2x2 空位数：余 1 -> 5, 余 2 -> 3, 余 3 -> 1
REST_2 = [0, 5, 3, 1]
for line in sys.stdin:
    nums = list(map(int, line.split()))
    if not nums or all(v == 0 for v in nums):
        break
    a, b, c, d, e, f = nums
    boxes = d + e + f + (c + 3) // 4              # 6x6 5x5 4x4 和 3x3
    space2 = d * 5 + REST_2[c % 4]                # 可容纳的 2x2 空位
    if b > space2:
        boxes += (b - space2 + 8) // 9            # 一箱放 9 个 2x2
    space1 = boxes * 36 - (f * 36 + e * 25 + d * 16 + c * 9 + b * 4)
    if a > space1:
        boxes += (a - space1 + 35) // 36
    print(boxes)
```

**注意 `REST_2` 那张表**：3×3 的产品每箱放 4 个，剩下的空间能塞多少个 2×2 不是线性的，
必须打表。**贪心题的细节往往就藏在这种小表里。**

这份代码的另一个巧处在 `space1`：不去逐箱计算 1×1 能塞进哪些缝，而是**用总面积 `boxes * 36` 把大件占的面积全部减掉**，
剩下的就是 1×1 能用的空位。思路一下子就清楚了，也避免了一长串 `if-else`。

### 例：12559: 最大最小整数

**12559: 最大最小整数**，<http://cs101.openjudge.cn/practice/12559/>

> 给 n（1 ≤ n ≤ 1000）个正整数，把它们连成一片组成一个新的大整数，求能组成的最大整数和最小整数。
> 例如 23、9、182、79，连成的最大整数是 97923182，最小是 18223799。

| 样例输入 | 样例输出 |
| ---- | ---- |
| `4` / `23 9 182 79` | `97923182 18223799` |
| `2` / `11 113` | `11311 11113` |

题目提示：位数不同但前几位相同时要小心。例如 898 和 8987，最大整数是 898+8987，而不是 8987+898。

**关键**：不能按字典序排，也不能按数值排。正确的比较是"**a+b 和 b+a 哪个大**"。

```python
import functools


def largest_concat(strs):
    def cmp(x, y):
        if x + y > y + x:
            return -1                 # x 排前面
        if x + y < y + x:
            return 1
        return 0
    return ''.join(sorted(strs, key=functools.cmp_to_key(cmp)))


def smallest_concat(strs):
    def cmp(x, y):
        if x + y < y + x:
            return -1                 # x 排前面
        if x + y > y + x:
            return 1
        return 0
    return ''.join(sorted(strs, key=functools.cmp_to_key(cmp)))


nums = ["7", "13", "2"]
print(largest_concat(nums), smallest_concat(nums))   # 7213 1327
```

**为什么 `x+y > y+x` 是对的**：这个比较满足传递性（可以证明），
因此可以作为排序的全序关系；而按字典序会把 `"9"` 排在 `"13"` 后面，显然错。

> 这是**交换论证（exchange argument）**的典型：如果最优解里相邻两项 a、b 的顺序
> 与该规则相反，交换它们不会变差——所以按规则排的解也是最优解。
>
> 完整的论证骨架、以及**怎么用它把排序键推出来**，见 §3.4。

**另一种写法：把每个串重复到足够长，再按字典序排**。用 `key` 而不是 `cmp_to_key`：

```python
from math import ceil

n = int(input())
nums = input().split()
L = max(len(x) for x in nums)
nums.sort(key=lambda x: x * ceil(2 * L / len(x)))   # 每个串重复到长度 >= 2L 再比字典序
print(''.join(reversed(nums)), ''.join(nums))
```

两个样例分别输出 `97923182 18223799` 和 `11311 11113`。为什么要重复到 **2 倍**最大长度？
比较 a+b 与 b+a，等价于比较 a、b 各自无限重复下去的串 aaa… 与 bbb…，而这两个无限串只要前 len(a)+len(b) ≤ 2L 位相同，就完全相同。
如果只重复到长度 ≥ L（最大长度）就比较，样例能过，但存在反例：`20` 和 `202`，L = 3，键分别是 `2020` 和 `202`，
后者是前者的前缀、排在前面，得到最小值 `20220`；而正确答案是 `20202`——重复的长度不够，有影响的位还没比到。
`a+b > b+a` 的比较写法则不需要这层论证，更不容易出错。

### 例：19948: 因材施教

**19948: 因材施教**，<http://cs101.openjudge.cn/practice/19948/>

> 把 n 个学生按魔法等级分成 k 个班，每班的"差异"是班内最高减最低，求总差异最小值。
> 例如 n = 7，等级 `[2, 7, 9, 9, 16, 28, 45]`，分 3 个班：按 `[2, 7] [9, 9] [16, 28, 45]` 分，
> 总差异是 (7−2) + (9−9) + (45−16) = 34。

**策略**：先排序（同一组的学生一定在排序后连续），
则总差异 = (最大−最小) − (被"切开"的 k−1 个相邻差)。要总差异最小，就**切最大的 k−1 个相邻差**。

```python
n, k = 7, 3
scores = [1, 3, 5, 5, 6, 9, 15]
scores.sort()
gaps = sorted((scores[i + 1] - scores[i] for i in range(n - 1)), reverse=True)
total = scores[-1] - scores[0] - sum(gaps[:k - 1])
print(total)          # 14 - (6 + 3) = 5
```

例中排序后的相邻差是 `2 2 0 1 3 6`，切掉最大的两个（6 和 3）。换成题面里的例子：相邻差 `5 2 0 7 12 17`，
切掉 17 和 12，分成 `[2, 7, 9, 9, 16] [28] [45]`，总差异 (45−2) − (17+12) = 14，远小于上面那种分法的 34。

### 例：18211: 军备竞赛

**18211: 军备竞赛**，<http://cs101.openjudge.cn/practice/18211/>

> 有 p 元经费和若干份图纸，每份有价格（制作成本 = 卖价），每份最多用一次。
> 造一份自己的武器花掉价格、优势 +1；卖一份给敌国得到价格、优势 −1。
> 任何时刻经费不能小于 0，敌国的武器也不能比我国多。求武器种类最多比敌国多多少。

**策略**：排序后双指针——**从最便宜的开始造，钱不够就把最贵的卖掉**。

```python
def arms_race(p, prices):
    prices.sort()
    lo, hi = 0, len(prices) - 1
    adv = 0
    while lo <= hi:
        if p >= prices[lo]:
            p -= prices[lo]
            lo += 1
            adv += 1
        elif lo < hi and adv > 0:      # 必须还有优势才敢卖，且不能卖掉正要造的那份
            p += prices[hi]
            hi -= 1
            adv -= 1
        else:
            break
    return adv


print(arms_race(10, [3, 4, 5, 6]))     # 2
# 追踪：造 3（余 7，优势 1）-> 造 4（余 3，优势 2）-> 钱不够造 5，
#       卖掉最贵的 6（余 9，优势 1）-> 造 5（余 4，优势 2）-> lo > hi 结束
```

逐步执行 `arms_race(10, [3, 4, 5, 6])`：

| 步骤 | p | lo | hi | adv | 动作 |
| ---- | ---- | ---- | ---- | ---- | ---- |
| 初始 | 10 | 0 | 3 | 0 | — |
| 1 | 7 | 1 | 3 | 1 | 造 3（钱够，造最便宜的） |
| 2 | 3 | 2 | 3 | 2 | 造 4 |
| 3 | 9 | 2 | 2 | 1 | 钱不够造 5，卖掉最贵的 6 |
| 4 | 4 | 3 | 2 | 2 | 造 5 |
| 结束 | 4 | 3 | 2 | 2 | lo > hi，循环结束 |

> ⚠️ `adv > 0` 这个条件很关键：优势为 0 时卖出会变成负优势，题目不允许。
> **贪心题的边界条件往往就是它的全部难度。**

### 扩展：双指针（two pointers）

18211 的 `lo`、`hi` 从两端往中间夹，这种写法叫**双指针**（参考《算法笔记》胡凡 4.6 节）。
它更像一种编程技巧而不是一个"算法"，但能把很多 O(n²) 的枚举降到 O(n)。

经典例子：给定**递增**序列和正整数 M，找出所有和恰为 M 的两个数。二重循环是 O(n²)，n = 10⁵ 时不可承受。
双指针：i 指向开头、j 指向末尾，看 `a[i] + a[j]` 与 M 的关系——

1. 等于 M：找到一组。因为序列递增，`a[i+1] + a[j] > M`、`a[i] + a[j-1] < M`，剩下的方案只可能在 [i+1, j−1] 内，两个指针同时向内移；
2. 大于 M：`a[j]` 配上任何还没用过的数都嫌大，j 左移；
3. 小于 M：`a[i]` 配上任何还没用过的数都嫌小，i 右移。

```python
def two_sum_sorted(a, M):
    """a 严格递增，返回所有 a[i] + a[j] == M（i < j）的数对。O(n)。"""
    i, j = 0, len(a) - 1
    res = []
    while i < j:
        s = a[i] + a[j]
        if s == M:
            res.append((a[i], a[j]))
            i += 1
            j -= 1
        elif s < M:
            i += 1
        else:
            j -= 1
    return res


print(two_sum_sorted([1, 2, 3, 4, 5, 6], 8))   # [(2, 6), (3, 5)]
```

i 只增、j 只减，两者合计最多走 n 步，所以是 O(n)。它充分利用了"序列有序"这一性质——**先排序，再双指针**是非常常见的组合。

§2.2 归并排序的合并过程也是双指针，只不过是**同向**的：i、j 分别指向两个有序序列的开头，每次把较小的那个放进结果、对应指针右移。
广义的双指针就是：利用问题和序列的特性，用两个下标同向或反向扫描，以 O(n) 解决问题。

## 3.4 交换论证：把排序键推出来，而不是猜出来

3.3 里每道题我都直接甩了一个排序键。可是考场上没人会告诉你按什么排 ——
**交换论证（exchange argument）就是把它推出来的方法**，
它同时也是贪心正确性证明的标准套路。

### 先看一个排队打水的故事

两个人排队打水：张三要 5 分钟，李四只要 1 分钟。谁排前面，大家「等待的总时间」更短？

- 张三在前：李四要等 5 分钟，张三不用等，总等待 0 + 5 = **5** 分钟；
- 李四在前：张三只等 1 分钟，李四不用等，总等待 0 + 1 = **1** 分钟。

队伍里其他人受影响吗？**不受影响**：这两人合计占用的时间不变，后面的人等待的时间一样。
所以：相邻两人「长的在前、短的在后」，互换一下，总等待只会变少、别人不受影响。
**这一次互换，就是「交换论证」里的「交换」。**

再往前走一步：我们想证明「短的先」是最优排法，但不用把所有排法试一遍——

1. 假设有一个最优排法，但它不是「短的先」，那队伍里一定有相邻的一对：长的在前、短的在后；
2. 把这一对互换，总等待不会变多，所以换完仍然是最优；
3. 反复互换，直到全队「短的先」。每换一次，「反了的」少一对，不会换个没完，而且全程没变差。

于是**任何最优排法都能一步步「掰」成短的先，而且越掰越不差**，所以「短的先」本身就是最优。
下面把这个故事写成通用的标准三步。

### 论证骨架

要证"按规则 R 排出来的解是最优的"，走三步（**OPT** 是 optimal 的缩写，指任意一个最优解；**R** 是你提出的贪心规则，按它排出来的顺序叫 R 序）：

1. 取**任意一个**最优解 OPT（不假设它长什么样）；
2. 若 OPT 里存在**相邻**两项 a、b 的顺序与 R 相反，就交换这两项，
   并证明**目标函数不会变差**；
3. 每交换一次，逆序对数至少减 1；逆序对有限，所以有限步之后 OPT 变成了 R 序，
   而这一路上从没变差 —— 因此 **R 序也是一个最优解**。

第 3 步要看清楚：它并没有说"R 序是唯一的最优解"，只说**最优值能被 R 序取到**。
贪心需要的恰好就是这一句。

### 为什么必须是"相邻"两项

因为只有相邻交换，**其余各项的贡献完全不变**，
两种摆法的差才会只剩下 a、b 互相之间的那一项。

如果隔着第三项去交换，中间那项的处境也变了，
差值里会混进与 a、b 无关的量，就化简不出干净的不等式。
**"相邻"不是为了省事，是这套推导能成立的前提。**

### 反过来用：这才是它在考场上的价值

把第 2 步倒过来读，它直接给出排序键：

> 设相邻两项是 a、b，分别写出"a 在前"的代价和"b 在前"的代价，
> 令**前者 ≤ 后者**，化简出来的不等式就是 `key`。

以 12559 为例。先别看公式，猜一猜：两张卡片 `3` 和 `30`，拼成 `330` 还是 `303`？`330` 更大，所以 `3` 排前面。再试 `9` 和 `91`：`991 > 919`，`9` 在前；`5` 和 `56`：`565 > 556`，`56` 在前。
规律：**谁在前拼出来的更大，谁就排前面**。把两种拼法记作 `a+b` 和 `b+a`，就是下面的推导。

相邻两段 a、b 交换，只改变拼接串里那一段，
而 `a+b` 与 `b+a` 的长度都是 `len(a)+len(b)`（a、b 本身长度可以不同，但这两段**等长**），所以整串的大小比较退化成这两段的比较：

- a 在前，这一段是 `a+b`；
- b 在前，这一段是 `b+a`。

令"a 在前"不差于"b 在前"，即 `a+b ≥ b+a`。于是"a 应排在 b 前面 ⟺ `a+b > b+a`" —— 排序键就这么推出来了，
不是试出来的。例：a=`3`、b=`30`，`330 > 303`，所以 `3` 排在 `30` 前；字典序会把更长的 `30` 排前面，得到 `303`，错。
字典序和数值序都不满足这个条件，所以都错：

```python
import functools
import itertools
import random


def by_rule(strs):
    """按交换论证推出的规则排：a 在 b 前 ⟺ a+b > b+a"""
    cmp = lambda x, y: -1 if x + y > y + x else (1 if x + y < y + x else 0)
    return ''.join(sorted(strs, key=functools.cmp_to_key(cmp)))


def by_brute(strs):
    return max(''.join(p) for p in itertools.permutations(strs))


nums = ["3", "30", "34", "5", "9"]
print('交换论证的规则 :', by_rule(nums))          # 9534330
print('字典序降序     :', ''.join(sorted(nums, reverse=True)))        # 9534303
print('数值降序       :', ''.join(sorted(nums, key=int, reverse=True)))  # 3430953

random.seed(6)
for _ in range(300):
    strs = [str(random.randint(0, 99)) for _ in range(random.randint(2, 6))]
    assert by_rule(strs) == by_brute(strs), strs
print('300 组随机数据：规则排序的结果 == 全排列暴力的最大值')
```

> 推完之后**一定要和暴力对拍**。推导会出错，对拍不会。

### 两种形态，别混

| | 用在哪 | 交换什么 |
| ---- | ---- | ---- |
| **相邻交换** | 排序型贪心（本节 12559） | OPT 里相邻的两项 |
| **首元素替换** | 选择型贪心（第 10 周的区间问题） | 把 OPT 的第一个选择换成贪心的选择 |

第 10 周会看到后一种：证"选最多不相交区间要按右端点排"时，
设最优解的第一个区间是 X、右端点最小的是 A，把 X 换成 A ——
A 的右端点更小，它之后能放的区间只多不少，所以换掉不会变差。

### 两个必须自己检查的前提

**一、规则 R 必须是全序（满足传递性）。**
（全序：任意两项都能比较、结果前后一致，且 a 在 b 前、b 在 c 前则 a 在 c 前；若出现"石头剪刀布"式的循环，就不是全序。）
否则 `sort` 排出来的结果依赖于比较的先后，"R 序"根本没有定义，
"逆序对递减"这个论证也就垮了。12559 的 `a+b > b+a` 是可以证明传递的；
换一道题要重新验。顺带一提：**用浮点数当排序键最容易在这里翻车** ——
本该相等的两个键因误差变得一大一小，顺序就不稳了。

**二、"交换只影响这两项"要真的成立。**
这是相邻交换全部的立足点。如果题目里有跨项的耦合
（代价依赖于全局的某个量，而不只是前后关系），这一步必须重算，不能照抄。

> **一句话**：交换论证不是用来事后安慰自己"这个贪心大概是对的"，
> 是用来在动手之前**把排序键算出来**的。

## 3.5 贪心的常见形状速查

| 形状 | 排序键 | 例题 |
| ---- | ---- | ---- |
| 拼接最大 / 最小数 | `a+b` vs `b+a` | 12559 |
| 分组最小差异 | 排序后切最大间隙 | 19948 |
| 用最少的箱子 / 船 | 从大到小放 | 01017 |
| 双指针取两端 | 排序后左右夹 | 18211 |
| 区间问题 | 按右端点排 | 第 10 周 |
| 会议室 / 活动选择 | 按结束时间排 | 第 10 周 |

---

# 4 复杂度实战：同一道题的三种写法

任务：给定长度 n 的数组，求最大连续子数组和（第 11 周会作为 DP 重讲）。

```python
import random


def brute(a):                       # O(n^3)
    n, best = len(a), a[0]
    for i in range(n):
        for j in range(i, n):
            best = max(best, sum(a[i:j + 1]))
    return best


def prefix(a):                      # O(n^2)
    n = len(a)
    pre = [0] * (n + 1)
    for i, v in enumerate(a):
        pre[i + 1] = pre[i] + v
    best = a[0]
    for i in range(n):
        for j in range(i, n):
            best = max(best, pre[j + 1] - pre[i])
    return best


def kadane(a):                      # O(n)
    best = cur = a[0]
    for v in a[1:]:
        cur = max(v, cur + v)
        best = max(best, cur)
    return best


t = [random.randint(-20, 20) for _ in range(80)]
assert brute(t) == prefix(t) == kadane(t)
print("三种写法结果一致：", kadane(t))
```

| n | O(n³) | O(n²) | O(n) |
| ---- | ---- | ---- | ---- |
| 10³ | 10⁹ ❌ | 10⁶ ✅ | 10³ ✅ |
| 10⁵ | ❌ | 10¹⁰ ❌ | 10⁵ ✅ |
| 10⁷ | ❌ | ❌ | 10⁷ ✅ |

**结论**：同一道题，三种复杂度对应三个不同的可解规模。**看到 n 就该知道自己要写哪一版。**

---

# 5 本周练习

| # | 题目 | 平台 / 编号 | 考点 |
| - | ---- | ---- | ---- |
| 1 | 矩阵运算（先乘再加） | E18161 | 矩阵乘法、维度判断 |
| 2 | 计算矩阵边缘元素之和 | E07743 | 二维遍历 |
| 3 | 矩阵交换行 | 02899 | 二维列表 |
| 4 | 二维矩阵上的卷积运算 | E19942 | 保护圈、邻域 |
| 5 | 装箱问题 | 01017 | 贪心 + 打表 |
| 6 | 最大最小整数 | 12559 | 自定义比较、交换论证 |
| 7 | 因材施教 | 19948 | 排序型贪心 |
| 8 | 军备竞赛 | 18211 | 双指针贪心 |
| 9（选做） | 节省存储的矩阵乘法 | E23555 | 稀疏矩阵 |
| 10（选做） | 螺旋矩阵 | M18106 | 模拟、方向数组 |

E / M 开头与纯数字编号的题目都在 cs101.openjudge.cn。

**扩展练习**（讲义中已给出思路或代码的，可以先自己写再对照）：

| 题目 | 来源 / 编号 | 考点 | 讲义位置 |
| ---- | ---- | ---- | ---- |
| Beautiful Matrix | CF 263A | 二维下标、曼哈顿距离 | §1.0 |
| 生存游戏 | M12560 | 保护圈、八邻域、同时更新 | §1.2 |
| Pasha and Pixels | CF 508A | 保护圈、局部检查 | §1.2 |
| 垃圾炸弹 | M04133 | `min` / `max` 裁剪范围 | §1.6 |
| Bomb Game | 02659 | `min` / `max` 裁剪范围、判定条件 | §1.6 |
| 2048 Game | CF 1221A <http://codeforces.com/problemset/problem/1221/A> | 贪心、数学 | — |
| Light It Up | CF 1000B <https://codeforces.com/problemset/problem/1000/B> | 贪心、前缀和 | — |
| XXXXX | CF 1364A <https://codeforces.com/problemset/problem/1364/A> | 双指针、数论 | — |

**思考题**：

1. 按 §3.4 的三步骨架，把"按 `a+b > b+a` 排序得到的拼接结果最大"写成完整证明；再补上传递性那一步（`a+b>b+a` 且 `b+c>c+b` ⟹ `a+c>c+a`）。
2. 装箱问题里 `REST_2 = [0, 5, 3, 1]` 是怎么算出来的？画图验证 `c % 4 == 2` 时为什么是 3。
3. 归并排序求逆序对时，`cnt += len(left) - i` 为什么不是 `cnt += 1`？
4. 二维前缀和的容斥公式里，为什么 `pre[r1][c1]` 要加回来？
5. 01017 装箱问题用的是"从大到小放"。它能用 §3.4 的三步骨架证明吗？
   如果不能，指出卡在哪一步 —— 骨架的哪个前提在这道题上不成立？

---

# 6 小结

1. 二维列表一律 `[[0]*n for _ in range(m)]`；边界多时用**保护圈**，方向用**方向数组**。
2. 矩阵乘法 O(mkn)；二维前缀和预处理 O(mn)、查询 O(1)，靠**容斥**。
3. 排序会用 `key=lambda x: (主, 次)` 就够；**稳定性**让"两次排序"成为可能。
   归并的合并过程要能默写。
4. 贪心 = **排序 + 一遍扫**，难在选排序键；不会证明就**构造反例**。
   找零 `[1,3,4]` 凑 6 是标准反例。
5. **排序键要用交换论证推，不要猜**：设相邻两项 a、b，写出两种摆法的代价，
   令"a 在前"不劣，化简出的不等式就是 `key`（§3.4）。推完必须和暴力对拍。
6. **看到 n 的范围就知道该写哪个复杂度的版本**——这是本周最该带走的习惯。

**下周预告**：继续矩阵与贪心的练习，并引入两种最基本的线性结构——**栈与队列**。

# 11 月月考讲评与阶段复习

*Updated 2026-11-16 GMT+8*
 *Compiled by Hongfei Yan (2026 Fall)*
https://github.com/GMyhf/2026fall-cs101

> **课程安排对应**：11 月阶段性月考（课程指南：「10 月、11 月和 12 月初设阶段性月考」）
> **配套**：第 5 周《10 月月考与阶段复习》讲了订正方法与考场策略，本讲不再重复，只补 11 月的新内容。

**知识点**：第 6–10 周知识清单自检、11 月月考 6 题讲评（题面 / 样例 / 思路 / C++ 与 Python 参考代码）、常见失分点归类、考后订正。

---

# 1 这次月考考什么

10 月月考查的是**语法关**：循环、分支、排序、筛法。11 月月考往上走了一级，查的是**建模关**——
题面不再直接告诉你用什么，要自己把它翻译成一个熟悉的结构：

| 题面说的 | 其实是 |
| ---- | ---- |
| 每格一个箭头，问能不能走出去 | 每个点恰好一条出边的图：**找环** + 记忆化 |
| 依次打开格子，问何时上下连通 | 只加不删的连通性：**并查集** + 虚拟结点 |
| 已知操作结果，求初始顺序 | **倒着模拟**：把每一步撤销 |
| 大量区间询问「是否合法」 | **前缀和** 把条件变成区间性质，**单调栈** 预处理 |

规格不变：**6 题 / 112 分钟**，与 10 月月考、期末上机考试一致。

## 1.1 考试形式

| 项目 | 说明 |
| ---- | ---- |
| 地点 | 机房（具体安排以通知为准） |
| 时长 | **112 分钟** |
| 题量 | **6 题** |
| 平台 | OpenJudge（cs101 小组） |
| 语言 | Python 3 为主，允许 C++ |
| 允许 | 十页 A4，双面，手写或打印 cheat sheet |
| **禁止** | ⚠️ **任何 AI 工具**（含本地模型）、联网查询、任何形式的交流 |
| 学术诚信 | **无法解释自己提交的代码，按学术不端处理** |

---

# 2 第 6–10 周知识清单（自检用）

逐条打勾。**打不了勾的，就是这次要补的。**

- [ ] 二维网格：`(i, j)` ↔ `i * m + j` 互转；四方向数组 `dr / dc`；越界判断写在访问之前
- [ ] 排序与贪心：能说出「为什么从左往右能坐就坐是对的」这类**交换 / 单调**论证
- [ ] 队列与栈：`deque` 两端 O(1)；`list.pop(0)` 是 O(n)
- [ ] 单调栈：一遍求出「右边第一个更小的元素」
- [ ] 递归与记忆化：递归深度上限；能把深递归改成显式循环
- [ ] 并查集：`find` 路径压缩、`union`；**虚拟结点**表示「第一行」「最后一行」
- [ ] 前缀和：区间和、区间「平衡」用 `pre[r] - pre[l-1]` 表达
- [ ] 进制：`bin(x)[2:]`；C++ 里用 `% base` 和 `/ base` 拆数位

---

# 3 月考讲评

> 2026 年 11 月月考的 6 道真题，题名已联网核实。每题给出 **C++ 与 Python** 两份参考代码，均已对样例、暴力参照的随机对拍和最大规模数据验证。完整题面、约束和提交入口以 OpenJudge 页面为准。

| 题号 | 题名 | 主要考点 | 题面 |
| --- | --- | --- | --- |
| E31529 | 双重回文 | 枚举 · 进制转换 | [31529](http://cs101.openjudge.cn/practice/31529/) |
| E31530 | 图书馆选座 | 模拟 · 一遍扫描 | [31530](http://cs101.openjudge.cn/practice/31530/) |
| M31531 | 箭头迷阵 | 网格图 · 找环 · 记忆化 | [31531](http://cs101.openjudge.cn/practice/31531/) |
| M31532 | 牌堆魔术 | 双端队列 · 倒推 | [31532](http://cs101.openjudge.cn/practice/31532/) |
| M31533 | 渗透实验 | 并查集 · 虚拟结点 | [31533](http://cs101.openjudge.cn/practice/31533/) |
| T31534 | 括号区间审计 | 前缀和 · 单调栈 | [31534](http://cs101.openjudge.cn/practice/31534/) |

**难度梯度**：

| 题 | 难度 | 考点 |
| --- | --- | --- |
| T1 | ★☆☆☆☆ | 枚举 · 进制转换 |
| T2 | ★★☆☆☆ | 模拟 · 一遍扫描 |
| T3 | ★★★☆☆ | 网格图 · 找环 |
| T4 | ★★★☆☆ | 双端队列 · 倒推 |
| T5 | ★★★☆☆ | 并查集 · 虚拟结点 |
| T6 | ★★★★☆ | 前缀和 · 单调栈 |

---

## T1. E31529 双重回文

**题意复述**：正整数在十进制和二进制（无前导零）下都是回文，称为双重回文数。给定 n（1 ≤ n ≤ 10⁶），输出 1..n 中双重回文数的个数和最大的一个。

**样例 1**

```text
输入
5
输出
3 5
```

**样例 2**

```text
输入
100
输出
7 99
```

**思路**：直接枚举，10⁶ 个数每个判两次回文，Python 也来得及。一个小优化：**偶数的二进制末位是 0**，而二进制最高位一定是 1，所以偶数不可能是二进制回文，只枚举奇数，工作量减半。C++ 里不转字符串，用「按 base 进制把数倒过来，看是否等于自己」判回文。n = 10⁶ 时答案是 `19 585585`。

C++：

```cpp
#include <bits/stdc++.h>
using namespace std;
bool pal(int x, int base) {  // 把 x 按 base 进制倒过来
    int y = 0;
    for (int t = x; t > 0; t /= base)
        y = y * base + t % base;
    return y == x;
}
int main() {
    int n, cnt = 0, best = 1;
    cin >> n;
    for (int i = 1; i <= n; i += 2)
        if (pal(i, 10) && pal(i, 2))
            cnt++, best = i;
    cout << cnt << " " << best << endl;
}
```

Python：

```python
n = int(input())
cnt, best = 0, 1
for i in range(1, n + 1, 2):  # 偶数二进制末位是 0
    d, b = str(i), bin(i)[2:]
    if d == d[::-1] and b == b[::-1]:
        cnt += 1
        best = i
print(cnt, best)
```

题目：[E31529 双重回文](http://cs101.openjudge.cn/practice/31529/)。

## T2. E31530 图书馆选座

**题意复述**：n 个座位排成一行，01 串 s 表示初始占用。m 位同学依次来，每人选**编号最小**、且相邻座位都空着的空座位坐下，没有就离开（n, m ≤ 2000）。输出坐下的人数和最终的 01 串。

**样例 1**

```text
输入
5 2
00000
输出
2
10100
```

**样例 2**

```text
输入
4 2
0100
输出
1
0101
```

**思路**：照题意模拟——每位同学从左扫到右找第一个可坐的位置，O(nm) = 4×10⁶，C++ 和 Python 都能过。但可以再想一步：**座位只会越坐越满**，一个座位现在不能坐，以后也不可能变得能坐；而某人坐在 i 之后，i+1 也不能坐了。所以下一位同学选的座位一定在上一位的右边——**一个指针从左扫到右，能坐就坐，坐满 m 人就停**，O(n)。

C++：

```cpp
#include <bits/stdc++.h>
using namespace std;
int main() {
    int n, m, sat = 0;
    string s;
    cin >> n >> m >> s;
    for (int i = 0; i < n && sat < m; i++) {
        bool l = i == 0 || s[i - 1] == '0';
        bool r = i == n - 1 || s[i + 1] == '0';
        if (s[i] == '0' && l && r)
            s[i] = '1', sat++;
    }
    cout << sat << "\n" << s << "\n";
}
```

Python：

```python
n, m = map(int, input().split())
s = list(input().strip())
sat = 0
for i in range(n):  # 从左到右一遍扫描
    if sat == m:
        break
    left = i == 0 or s[i - 1] == '0'
    right = i == n - 1 or s[i + 1] == '0'
    if s[i] == '0' and left and right:
        s[i] = '1'
        sat += 1
print(sat)
print(''.join(s))
```

> ⚠️ 常见失分：边界座位 1 和 n 去访问 `s[-1]` / `s[n]`。Python 的 `s[-1]` **不报错**，悄悄读到最后一个座位——这是最难查的那种 WA。

题目：[E31530 图书馆选座](http://cs101.openjudge.cn/practice/31530/)。

## T3. M31531 箭头迷阵

**题意复述**：n×m 网格（n×m ≤ 2×10⁵），每格一个箭头 `U/D/L/R`。从某格出发一直按箭头走，若最终走出场地就称该格可以逃出（途中可以先绕圈）。统计能逃出的格子数。

**样例 1**

```text
输入
2 2
UD
DU
输出
2
```

**样例 2**

```text
输入
3 3
URD
LDR
RUL
输出
5
```

**思路**：每格恰好一条出边，从任一格出发的路线是确定的：要么走出边界，要么**掉进一个环**。注意「途中可以先绕圈」只是说路线可能拐来拐去，一旦**真的回到走过的格子**就永远出不去了。

- 每格只有四种状态：0 未访问、1 在当前路线上、2 能逃出、3 逃不出。
- 从一个未访问格出发往前走，把经过的格子记进 `path` 并标 1；遇到三种情况停下：
  出界 → 结论「能逃」；撞到状态 1 → 撞上本条路线，成环，结论「逃不出」；撞到 2 或 3 → **直接接上已知结论**。
- 把 `path` 上的格子全部标成这个结论。每格只走一次，O(nm)。

为什么不写递归？一条路线可以长达 2×10⁵ 格（例如一行全是 `R`），递归要么撞上递归深度限制，要么得配 `threading` 加大栈（第 8 周 §2.2）。**显式维护 `path` 的循环写法没有这个问题**，而且和递归版本是同一个算法。

C++：

```cpp
#include <bits/stdc++.h>
using namespace std;
int main() {
    int n, m;
    cin >> n >> m;
    vector<string> g(n);
    for (auto &row : g) cin >> row;
    vector<int> st(n * m, 0), path;  // 状态含义同 Python
    for (int s = 0; s < n * m; s++) {
        if (st[s]) continue;
        path.clear();
        int i = s / m, j = s % m, res;
        while (true) {
            if (i < 0 || i >= n || j < 0 || j >= m) {
                res = 2;  // 出界：逃出
                break;
            }
            int u = i * m + j;
            if (st[u] == 1) { res = 3; break; }
            if (st[u]) { res = st[u]; break; }
            st[u] = 1;
            path.push_back(u);
            char c = g[i][j];
            if (c == 'U') i--;
            else if (c == 'D') i++;
            else if (c == 'L') j--;
            else j++;
        }
        for (int u : path) st[u] = res;
    }
    cout << count(st.begin(), st.end(), 2) << endl;
}
```

Python：

```python
import sys

data = sys.stdin.read().split()
n, m = int(data[0]), int(data[1])
g = data[2:2 + n]
MOVE = {'U': (-1, 0), 'D': (1, 0),
        'L': (0, -1), 'R': (0, 1)}
st = [0] * (n * m)  # 0 未访问 1 在路上 2 能逃 3 逃不出
for s in range(n * m):
    if st[s]:
        continue
    path, i, j = [], s // m, s % m
    while True:
        if not (0 <= i < n and 0 <= j < m):
            res = 2  # 出界：逃出
            break
        u = i * m + j
        if st[u] == 1:
            res = 3  # 撞上本条路径：成环
            break
        if st[u]:
            res = st[u]  # 接上已知结论
            break
        st[u] = 1
        path.append(u)
        di, dj = MOVE[g[i][j]]
        i, j = i + di, j + dj
    for u in path:
        st[u] = res
print(st.count(2))
```

题目：[M31531 箭头迷阵](http://cs101.openjudge.cn/practice/31531/)。

## T4. M31532 牌堆魔术

**题意复述**：n 张牌（n ≤ 2×10⁵）叠成一摞，重复 n 轮：先把顶牌移到底，再翻开顶牌拿走。要求翻开的顺序恰好是 1, 2, …, n，求初始牌堆从上到下的顺序。

**样例 1**

```text
输入
4
输出
4 1 3 2
```

**样例 2**

```text
输入
5
输出
3 1 5 2 4
```

**思路**：已知结果求开头——**倒着做，把每一步撤销**。从空牌堆开始，i 从 n 倒数到 1：

1. 撤销「翻开顶牌 i」：把 i 放回牌顶；
2. 撤销「顶牌移到底」：把底牌移回牌顶。

两端都要进出，用双端队列，每步 O(1)，总 O(n)。只剩一张牌时「移到底」不变，撤销也不变——底牌就是顶牌，代码不用特判。以 n = 4 验算：`[4]` → `[4,3]` → `[3,2,4]` → `[4,1,3,2]`，与样例一致。

另一种思路是**正着模拟位置**：把 0..n−1 号「位置」放进队列，按题意先移一个到队尾、再弹出队首，第 k 次弹出的位置填牌 k。两种做法都是 O(n)。

C++：

```cpp
#include <bits/stdc++.h>
using namespace std;
int main() {
    int n;
    cin >> n;
    deque<int> dq;
    for (int i = n; i >= 1; i--) {  // 倒着做
        dq.push_front(i);  // 撤销"翻开"
        dq.push_front(dq.back());  // 撤销"顶移到底"
        dq.pop_back();
    }
    for (int k = 0; k < n; k++)
        cout << dq[k] << (k + 1 < n ? ' ' : '\n');
}
```

Python：

```python
from collections import deque

n = int(input())
dq = deque()
for i in range(n, 0, -1):  # 倒着做
    dq.appendleft(i)  # 撤销"翻开"：牌 i 放回牌顶
    dq.appendleft(dq.pop())  # 撤销"顶移到底"
print(*dq)
```

> ⚠️ 用 `list.insert(0, x)` 代替 `appendleft` 每次是 O(n)，n = 2×10⁵ 时总共 O(n²)，会 TLE。

题目：[M31532 牌堆魔术](http://cs101.openjudge.cn/practice/31532/)。

## T5. M31533 渗透实验

**题意复述**：n×m 网格（n×m ≤ 2×10⁵）初始全封闭，依次打开 q 个格子。若存在一条只经过打开格子、从第 1 行通到第 n 行的四连通路径，就称已渗透。求第一次渗透的操作编号，始终不渗透输出 −1。

**样例 1**

```text
输入
3 3 3
1 1
2 1
3 1
输出
3
```

**样例 2**

```text
输入
3 3 4
1 1
1 2
1 3
2 2
输出
-1
```

**思路**：格子只开不关，连通块只合并不拆分——正是**并查集**的场景。难点在「第 1 行任意一格」和「第 n 行任意一格」连通，直接判要两两比较。技巧是加两个**虚拟结点** TOP、BOT：第 1 行的格子一打开就与 TOP 合并，第 n 行的与 BOT 合并。于是「渗透」⟺ `find(TOP) == find(BOT)`，每次操作后 O(α) 判一次。

每次打开格子 (r, c)：标为打开 → 必要时连 TOP / BOT → 与四个方向上**已打开**的邻格合并 → 判 TOP 与 BOT 是否同根。每次都重新 BFS 判连通是 O(q·nm)，必然超时。

C++：

```cpp
#include <bits/stdc++.h>
using namespace std;
vector<int> fa;
int find(int x) {
    while (fa[x] != x) x = fa[x] = fa[fa[x]];  // 路径减半
    return x;
}
void unite(int a, int b) { fa[find(a)] = find(b); }
int main() {
    int n, m, q;
    cin >> n >> m >> q;
    int TOP = n * m, BOT = n * m + 1;  // 两个虚拟结点
    fa.resize(n * m + 2);
    iota(fa.begin(), fa.end(), 0);
    vector<bool> opened(n * m, false);
    int dr[] = {-1, 1, 0, 0}, dc[] = {0, 0, -1, 1};
    for (int k = 1; k <= q; k++) {
        int r, c;
        cin >> r >> c;
        r--, c--;
        int u = r * m + c;
        opened[u] = true;
        if (r == 0) unite(u, TOP);
        if (r == n - 1) unite(u, BOT);
        for (int d = 0; d < 4; d++) {
            int nr = r + dr[d], nc = c + dc[d];
            if (nr >= 0 && nr < n && nc >= 0 && nc < m
                && opened[nr * m + nc])
                unite(u, nr * m + nc);
        }
        if (find(TOP) == find(BOT)) {
            cout << k << endl;
            return 0;
        }
    }
    cout << -1 << endl;
}
```

Python：

```python
import sys

data = sys.stdin.buffer.read().split()
n, m, q = int(data[0]), int(data[1]), int(data[2])
TOP, BOT = n * m, n * m + 1  # 两个虚拟结点
fa = list(range(n * m + 2))
opened = [False] * (n * m)

def find(x):
    while fa[x] != x:
        fa[x] = fa[fa[x]]  # 路径减半
        x = fa[x]
    return x

def union(a, b):
    fa[find(a)] = find(b)

ans = -1
for k in range(q):
    r = int(data[3 + 2 * k]) - 1
    c = int(data[4 + 2 * k]) - 1
    u = r * m + c
    opened[u] = True
    if r == 0:
        union(u, TOP)
    if r == n - 1:
        union(u, BOT)
    for nr, nc in ((r - 1, c), (r + 1, c),
                   (r, c - 1), (r, c + 1)):
        v = nr * m + nc
        if 0 <= nr < n and 0 <= nc < m and opened[v]:
            union(u, v)
    if find(TOP) == find(BOT):
        ans = k + 1
        break
print(ans)
```

> ⚠️ n = 1 时第 1 行就是第 n 行：打开任意一格就同时连上 TOP 和 BOT，答案是 1。上面的写法两个 `if` 各自独立判断，自然覆盖这个边界；写成 `if … elif …` 就错了。

题目：[M31533 渗透实验](http://cs101.openjudge.cn/practice/31533/)。

## T6. T31534 括号区间审计

**题意复述**：括号串 s（长度 n ≤ 2×10⁵），q 次询问（q ≤ 2×10⁵），每次问子串 s[l..r] 是否为合法括号序列。

**样例 1**

```text
输入
(()())
5
1 6
2 5
1 5
3 4
4 4
输出
YES
YES
NO
NO
NO
```

**样例 2**

```text
输入
())(()
4
1 2
2 5
1 6
3 6
输出
YES
NO
NO
NO
```

**思路**：每次询问现场扫一遍是 O(n)，总 O(nq) = 4×10¹⁰，必然超时。要先把「合法」翻译成前缀和的语言。令 `pre[i]` = 前 i 个字符中左括号数 − 右括号数，则子串 s[l..r] 合法当且仅当：

1. **左右括号数相等**：`pre[r] == pre[l-1]`；
2. **任意前缀左括号不少于右括号**：对所有 l ≤ k ≤ r，`pre[k] >= pre[l-1]`，即区间 [l, r] 上 pre 的最小值不低于 `pre[l-1]`。

条件 2 是区间最小值问题。用**单调栈**一遍预处理出 `nxt[i]`：i 右边第一个 pre 值比 `pre[i]` 小的位置。条件 2 就等价于 `nxt[l-1] > r`——第一次「跌破」发生在区间之外。预处理 O(n)，每次询问 O(1)。

> 也可以用 ST 表（稀疏表）做 O(1) 区间最小值，同样正确，但要 O(n log n) 的预处理和更多代码。题目提示里的「单调栈」就是指上面这个更短的做法。

C++：

```cpp
#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    int q;
    cin >> s >> q;
    int n = s.size();
    vector<int> pre(n + 1, 0), nxt(n + 1, n + 1), stk;
    for (int i = 0; i < n; i++)
        pre[i + 1] = pre[i] + (s[i] == '(' ? 1 : -1);
    for (int j = 0; j <= n; j++) {  // 单调栈求 nxt
        while (!stk.empty() && pre[stk.back()] > pre[j]) {
            nxt[stk.back()] = j;
            stk.pop_back();
        }
        stk.push_back(j);
    }
    while (q--) {
        int l, r;
        cin >> l >> r;
        bool ok = pre[r] == pre[l - 1] && nxt[l - 1] > r;
        cout << (ok ? "YES\n" : "NO\n");
    }
}
```

Python：

```python
import sys

data = sys.stdin.read().split()
s = data[0]
n = len(s)
# pre[i]：前 i 个字符中 左括号数 - 右括号数
pre = [0] * (n + 1)
for i, ch in enumerate(s):
    pre[i + 1] = pre[i] + (1 if ch == '(' else -1)

# nxt[i]：i 右边第一个 pre 比 pre[i] 小的位置（单调栈）
nxt = [n + 1] * (n + 1)
stk = []
for j in range(n + 1):
    while stk and pre[stk[-1]] > pre[j]:
        nxt[stk.pop()] = j
    stk.append(j)

q = int(data[1])
out = []
for k in range(q):
    l, r = int(data[2 + 2 * k]), int(data[3 + 2 * k])
    ok = pre[r] == pre[l - 1] and nxt[l - 1] > r
    out.append('YES' if ok else 'NO')
print('\n'.join(out))
```

> ⚠️ Python 输出 2×10⁵ 行时，逐行 `print` 比 `'\n'.join` 后一次输出慢得多；读入也要用 `sys.stdin.read()`。

题目：[T31534 括号区间审计](http://cs101.openjudge.cn/practice/31534/)。

---

# 4 常见失分点归类

| 失分类型 | 出现在 | 对策 |
| ---- | ---- | ---- |
| 边界下标 | T2 座位 1 / n、T5 第 1 行 / 第 n 行 | 先判下标是否越界再访问；n = 1 必测 |
| 递归太深 | T3 一行全是 `R` | 改成显式维护 `path` 的循环 |
| O(n) 的操作放进循环 | T4 `list.insert(0, x)` | 两端进出用 `deque` |
| 每次询问重算 | T5 每次 BFS、T6 每次扫子串 | 增量结构（并查集）/ 预处理（前缀和 + 单调栈） |
| 大量输出逐行 `print` | T6 | 收集后 `'\n'.join` 一次输出 |

订正方法与第 5 周相同：**三分类（不会 / 会但写错 / 会但没时间）→ 关掉题解从空文件重写 → 把错误的类型写进 cheat sheet**。

---

# 5 本次作业

| # | 任务 | 说明 |
| - | ---- | ---- |
| 1 | 订正全部未 AC 题 | 关掉讲评，从空文件重写，一次通过 |
| 2 | 用另一种语言再写一遍 T4 | Python 写过就写 C++，反之亦然 |
| 3 | T6 改用 ST 表实现 | 与单调栈版本对拍 |
| 4 | 更新错题类型表 | 在第 5 周那份表上至少追加 3 条 |

---

# 6 小结

1. 11 月月考查**建模关**：把题面翻译成找环、并查集、倒推、前缀和这些熟悉的结构。
2. 难度梯度：**枚举进制 → 一遍扫描 → 找环记忆化 → 双端队列倒推 → 并查集虚拟结点 → 前缀和 + 单调栈**；规格仍是 **6 题 / 112 分钟**。
3. 深递归改循环、两端进出用 `deque`、询问多就先预处理——三条都是**复杂度意识**落到代码上。
4. 订正的唯一有效方法：**分类 → 关题解重写 → 记录错误类型**。

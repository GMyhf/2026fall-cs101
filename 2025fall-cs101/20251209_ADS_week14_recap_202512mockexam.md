# Recap: 2025年12月考

http://cs101.openjudge.cn/20251204mockexam/

感觉12月考题目挺好的。如果 T30204：小P的LLM推理加速，改为M30204，可能更多同学会AC这个题目。因为 状压dp没有讲，T30201耗时了，就没有时间做这个T30204 greedy题目了。



**E29945:神秘数字的宇宙旅行** 
implementation, http://cs101.openjudge.cn/practice/29945

**E29946:删数问题**

monotonic stack, greedy, http://cs101.openjudge.cn/practice/29946

**E30091:缺德的图书馆管理员**

greedy, http://cs101.openjudge.cn/practice/30091

**M27371:Playfair密码**

simulation, string, matrix, http://cs101.openjudge.cn/practice/27371

**T30201:旅行售货商问题**

dp,dfs, http://cs101.openjudge.cn/practice/30201

**T30204:小P的LLM推理加速**

greedy, http://cs101.openjudge.cn/practice/30204




## M27371: Playfair密码

simulation, string, matrix, http://cs101.openjudge.cn/practice/27371/

Playfair密码是一种古典加密技术，它使用一个矩阵填充密钥和字母表中的其余字母，通常j被忽略，并被视为i。加密过程涉及将明文分成字母对，并对每对字母根据它们在矩阵中的位置进行加密，同样j也被视为i。

**1. 密钥矩阵的生成**

1.1 **选择密钥**：首先选择一个密钥，通常是一个单词或短语，如`keyword`。

1.2 **填充矩阵**：

- **去除重复字母**：在密钥中去除重复出现的字母，只保留该重复字母出现的第一次进行填入。
- **填充密钥**：将处理过的密钥填入矩阵的前几个格子，从左至右，从上至下填充。
- **填充剩余字母**：在矩阵中填入字母表的其余字母。在传统Playfair密码中，通常将字母"j"视为字母"i"，以适应5x5矩阵的大小。

**2. 加密过程**

2.1 **准备明文**：将明文分成字母对。如果相邻字母相同就在该组的第一个字母后加入"x"后重新分组（如果第一个字母为"x"则加"q"）。如果明文处理后为奇数就在最后加入"x"（若最后一个字母为"x"则加"q"）。

2.2 **对每个字母对进行加密**：

- **同一行不同列**：如果字母对位于矩阵的同一行，则每个字母都被替换为右侧的字母（最右边的字母替换为最左边的）。
- **同一列不同行**：如果字母对位于矩阵的同一列，则每个字母都被替换为下方的字母（最下面的字母替换为最上面的）。
- **不同行和列**：对于不在同一行或同一列的字母对，每个字母被替换为同一行中与另一个字母所在列相对应的字母。

**3.示例：**

假设密钥为`keyword`，明文为`balloon`。

密钥矩阵示例：

```
 k e y w o
 r d a b c
 f g h i(j) l
 m n p q s
 t u v x z
```

加密过程示例：

- 明文分组和填充：`ba lx lo on`。
- 加密：`ba` → `cb`，`lx` → `iz`，`lo` → `sc`，`on` → `es`。

因此，密文为`cb iz sc es`。

**输入**

第一行包含一个字符串，表示密钥。密钥只包含小写字母，长度不超过25。

第二行包含一个数字n，表示待加密明文数量。1 <= n <= 100。

接下来n行，每行为一个字符串，表示待加密的明文。明文只包含小写字母，长度不超过100。

**输出**

输出n行字符串，表示加密后的密文。

样例输入

```
Sample1 Input:
keyword
1
balloon

Sample1 Output:
cbizsces
```

样例输出

```
Sample2 Input:
java
3
likejava
programming
aaxx

Sample2 Output:
kaldavbv
qsnhqvrvkvsn
vwvwwr

解释：该样例密钥矩阵为
i a v b c
d e f g h
k l m n o
p q r s t
u w x y z
```

提示：tags: simulation，string，matrix

来源：2023fall pyn





关键在于：**Playfair 密码中，j 实际上是不存在的。** 你必须在任何逻辑（生成矩阵、判断重复、分组）开始之前，就把输入数据中的 j 全部抹杀变成 i。

逻辑：先转为 ii -> 发现重复 -> 插入占位符 -> 变成 ix，下一组处理剩余的 i。

引入一个 **字典（HashMap）** 来记录每个字母的坐标

```python
import sys

def solve():
    # 1. 读取输入
    # 使用 sys.stdin.read 读取所有内容，处理多行输入更方便
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    
    key_input = input_data[0]
    n = int(input_data[1])
    plaintexts = input_data[2:]

    # 2. 生成密钥矩阵和坐标字典
    # 使用 list 保持顺序，set 用于去重辅助
    key = key_input.lower().replace('j', 'i')
    alphabet = "abcdefghiklmnopqrstuvwxyz" # 不含 j
    
    matrix_chars = []
    seen = set()
    
    # 填充 Key
    for char in key:
        if char not in seen:
            seen.add(char)
            matrix_chars.append(char)
            
    # 填充剩余字母
    for char in alphabet:
        if char not in seen:
            seen.add(char)
            matrix_chars.append(char)
            
    # 构建：矩阵 (5x5) 和 坐标映射 (char -> (row, col))
    # 优化点：用字典 pos_map 替代遍历查找
    matrix = [matrix_chars[i:i+5] for i in range(0, 25, 5)]
    pos_map = {char: (i // 5, i % 5) for i, char in enumerate(matrix_chars)}

    # 3. 定义加密函数
    def encrypt_text(text):
        text = text.lower().replace('j', 'i')
        res = []
        i = 0
        length = len(text)
        
        while i < length:
            a = text[i]
            b = ''
            
            # 尝试获取下一个字符
            if i + 1 < length:
                b = text[i+1]
                
                if a == b:
                    # 如果相同，插入填充字符，这一轮只消耗 text[i]
                    b = 'q' if a == 'x' else 'x'
                    i += 1 
                else:
                    # 如果不同，消耗 text[i] 和 text[i+1]
                    i += 2
            else:
                # 如果是最后一个字符，需要填充
                b = 'q' if a == 'x' else 'x'
                i += 1
            
            # 开始加密 a, b
            r1, c1 = pos_map[a]
            r2, c2 = pos_map[b]
            
            if r1 == r2: # 同行：右移
                res.append(matrix[r1][(c1 + 1) % 5])
                res.append(matrix[r2][(c2 + 1) % 5])
            elif c1 == c2: # 同列：下移
                res.append(matrix[(r1 + 1) % 5][c1])
                res.append(matrix[(r2 + 1) % 5][c2])
            else: # 矩形：取对角
                res.append(matrix[r1][c2])
                res.append(matrix[r2][c1])
                
        return "".join(res)

    # 4. 执行输出
    for text in plaintexts:
        print(encrypt_text(text))

if __name__ == "__main__":
    solve()
```





## T30201: 旅行售货商问题

状压dp, http://cs101.openjudge.cn/practice/30201/

一个国家有 n 个城市，每两个城市之间都开设有航班，从城市 i 到城市 j 的航班价格为 cost[i, j] ，而且往、返航班的价格相同。

售货商要从一个城市出发，途径每个城市 1 次（且每个城市只能经过 1 次），最终返回出发地，而且他的交通工具只有航班，请求出他旅行的最小开销。

**输入**

输入的第 1 行是一个正整数 n （3 <= n <= 18）
然后有 n 行，每行有 n 个正整数，构成一个 n * n 的矩阵，矩阵的第 i 行第 j 列为城市 i 到城市 j 的航班价格。1 <= cost[i,j] <= 10^4

**输出**

输出数据为一个正整数 m，表示旅行售货商的最小开销

样例输入

```
4
0 4 1 3
4 0 2 1
1 2 0 5
3 1 5 0
```

样例输出

```
7
```

提示：dp, dfs

来源：2025fall-cs101 yan



除了用状压dp，还可以有三个层次的优化：I/O 与数据结构优化（基础）、逻辑剪枝（中级）以及Python 特性优化（高级）。

> 详细解读优化的三个层次
>
> **1. I/O 与数据结构优化（基础）**
>
> - **sys.stdin.read**: 原代码在循环里用 input()，每次都要处理缓冲区。用 read().split() 将所有数据一次性读入内存并切分，配合迭代器 iter() 和 next()，是 Python 刷题处理大量数据的标准做法。
> - **列表 vs 字典**: 原代码用 d = {} 存图。字典查询需要哈希计算，而列表（数组）是基于内存偏移量的直接访问。在高频访问场景下，列表要快得多。
>
> **2.逻辑剪枝（中级）**
>
> - **range(1, size, 2)**: 这是一个非常漂亮的逻辑剪枝。因为我们规定从城市 0 出发，所以任何合法的状态 mask，其二进制最低位（第0位）必须是 1。这意味着 mask 必然是**奇数**。直接让循环步长为 2，**循环次数瞬间减少一半**。
> - **range(1, n)**: 内层循环寻找下一个城市 v 时，不需要考虑 0。因为 TSP 规定中间过程不走重复路，0 是起点，只有在遍历完所有节点后，计算 ans 时才考虑回到 0。
>
> **3.Python 特性优化（高级 - 提速关键）**
>
> - **去除 min() 函数**: 这是 Python 算法题优化的“杀手锏”。dp[new][k] = min(dp[new][k], val) 看起来很简洁。但 Python 的函数调用栈开销很大。在千万级别的循环中，这会严重拖慢速度。改成 if val < dp[new][k]: dp[new][k] = val 虽然代码多了两行，但运行速度会有质的飞跃。
> - **局部变量缓存**:curr_dist = dp[mask][u]。在 Python 中，访问 dp[mask][u] 需要两次列表索引操作。把它存为局部变量 curr_dist，后续计算只读这个变量，减少了索引查找开销。

运行时间：3867ms

```python
import sys

def solve():
    # 1. 快速 I/O
    input = sys.stdin.read
    data = input().split()
    iterator = iter(data)
    
    try:
        n = int(next(iterator))
    except StopIteration:
        return

    # 2. 使用二维列表代替字典，并预处理为整数
    # 直接读取 n*n 个数据构建矩阵
    dist = []
    for _ in range(n):
        row = [int(next(iterator)) for _ in range(n)]
        dist.append(row)

    # 3. 初始化 DP
    # 状态上限 1<<n
    size = 1 << n
    inf = float("inf")
    # 这里的 dp[i][j] 表示：状态掩码为 i，当前停留在 j 城市
    dp = [[inf] * n for _ in range(size)]
    
    # 起点固定为 0，初始状态掩码为 1 (二进制 ...001)，花费 0
    dp[1][0] = 0

    # 4. 逻辑优化：只遍历奇数 mask
    # 因为起点 0 永远在路径中，所以 mask 的第 0 位永远是 1，即 mask 永远是奇数
    for i in range(1, size, 2):
        # 优化：如果当前状态 i 下，所有结尾可能都不可达，直接跳过（但在 TSP 稠密图中较少见）
        
        for j in range(n):
            # 如果状态 i 下不可能停在 j，跳过
            # 或者 if not (i >> j) & 1: continue (隐含条件，通常由 inf 判断即可)
            if dp[i][j] == inf:
                continue
            
            curr_dist = dp[i][j]
            
            # 5. 内层循环优化
            # k 从 1 开始，因为中间过程不可能回到起点 0
            for k in range(1, n):
                # 如果 k 已经在状态 i 中，跳过
                if (i >> k) & 1:
                    continue
                
                new_mask = i | (1 << k)
                new_cost = curr_dist + dist[j][k]
                
                # 6. 移除 min() 函数调用，手动比较更快
                if new_cost < dp[new_mask][k]:
                    dp[new_mask][k] = new_cost

    # 7. 计算最终回路
    ans = inf
    # 最终状态必然是 (1<<n) - 1，即全 1
    final_mask = size - 1
    
    # 此时停留在 i，需要从 i 回到 0
    for i in range(1, n):
        cost = dp[final_mask][i] + dist[i][0]
        if cost < ans:
            ans = cost

    print(ans)

if __name__ == '__main__':
    solve()
```

> 36行第2个for循环，`for j in range(n):`
>
> 这一层循环的意思是：**枚举当前所在的“终点城市”**。为了彻底理解，需要结合 DP 状态定义来看。
>
> **1. 核心含义**
>
> `dp[i][j]` 的定义是：
> *   **`i`**：经过了哪些城市（状态/集合）。
> *   **`j`**：**目前停留在哪个城市**。
>
> 第 2 个循环 `for j in range(n)` 就是在遍历这个 **“目前停留的城市”**。
>
> **2. 为什么要遍历它？（举例说明）**
>
> 假设有 3 个城市：0, 1, 2。
> 外层循环 `i` 到了状态 `111`（二进制），表示 `{0, 1, 2}` 这三个城市都去过了。
>
> 虽然大家都去过这三个城市，但**“怎么走的”**以及**“最后停在哪里”**是不同的，这对下一步去哪里至关重要。
>
> *   **情况 A**：路径是 $0 \to 1 \to 2$。
>     *   此时 `j = 2`（当前在 2 号城市）。
>     *   如果你下一步要去 3 号城市，路费是 `distance[2][3]`。
> *   **情况 B**：路径是 $0 \to 2 \to 1$。
>     *   此时 `j = 1`（当前在 1 号城市）。
>     *   如果你下一步要去 3 号城市，路费是 `distance[1][3]`。
>
> **结论**：
> 只知道“去过哪些城市（`i`）”是不够的，必须知道“现在脚踩在哪个城市（`j`）”，才能算出“去下一个城市（`k`）”的距离。
>
> **3. 代码逻辑链条**
>
> 这个循环的作用起到了承上启下的连接作用：
>
> 1.  **承上（检查合法性）**：
>     ```python
>     if dp[i][j] == float("inf"):
>         continue
>     ```
>     不是所有城市都能作为当前状态的终点。比如，如果集合 `i` 里根本没有城市 `j`，或者从起点根本走不到 `j`，这个状态就是无效的，直接跳过。
>
> 2.  **启下（状态转移）**：
>     ```python
>     dp[newi][k] = min(..., dp[i][j] + d[j][k])
>     ```
>     这里用到了 `j`。我们要从 **“当前点 `j`”** 走到 **“下一个点 `k`”**。如果没有这层 `j` 的循环，我们就不知道这笔路费 `d[j][k]` 里的起点是谁。
>
> **总结**
>
> 第 2 个循环就是在问：
> **“在已经去过集合 `i` 的所有方案中，如果我们最后停在了城市 `0`、或者城市 `1`、……或者城市 `n-1`，分别会怎么样？”**



**Q：为什么在openjudge.cn上提交代码，套在函数中的程序，运行更快？**

把程序套在函数里面，就不超时了。因为：局部变量（函数内部定义的变量）存储在 局部命名空间（local namespace） 中，通过 索引直接访问（LOAD_FAST 指令），速度非常快。
全局变量（模块级别定义的变量）存储在 全局字典（globals dict） 中，每次访问都需要 哈希查找（LOAD_GLOBAL 指令），开销更大。 @李睿安



> 运行时间：4135ms
>
> ```python
> def solve():
>     n = int(input().strip())
>     cost = []
>     for _ in range(n):
>         row = list(map(int, input().split()))
>         cost.append(row)
> 
>     # 如果只有1个城市？但题目保证 n>=3
>     INF = float('inf')
>     # dp[mask][i]: mask 是已访问的城市集合，i 是当前所在城市（0 <= i < n）
>     # mask 是一个整数，bit j 为1 表示城市 j 已访问
>     total_masks = 1 << n
>     dp = [[INF] * n for _ in range(total_masks)]
> 
>     # 起点设为城市0
>     dp[1][0] = 0  # 只访问了城市0，当前在0，花费0
> 
>     # 遍历所有状态
>     for mask in range(1, total_masks, 2):
>         for u in range(n):
>             if dp[mask][u] == INF:
>                 continue
>             # 尝试从 u 到未访问的城市 v
>             for v in range(n):
>                 if mask & (1 << v):
>                     continue  # v 已访问，跳过
>                 new_mask = mask | (1 << v)
>                 new_cost = dp[mask][u] + cost[u][v]
>                 if new_cost < dp[new_mask][v]:
>                     dp[new_mask][v] = new_cost
> 
>     # 所有城市都访问完的状态是 (1 << n) - 1
>     full_mask = total_masks - 1
>     ans = INF
>     for i in range(1, n):  # 从其他城市回到起点0
>         if dp[full_mask][i] != INF:
>             ans = min(ans, dp[full_mask][i] + cost[i][0])
> 
>     print(ans)
> 
> if __name__ == '__main__':
>     solve()
> ```
>
> 
>
> 运行时间：6252ms
>
> ```python
> n = int(input().strip())
> cost = []
> for _ in range(n):
>     row = list(map(int, input().split()))
>     cost.append(row)
> 
> # 如果只有1个城市？但题目保证 n>=3
> INF = float('inf')
> # dp[mask][i]: mask 是已访问的城市集合，i 是当前所在城市（0 <= i < n）
> # mask 是一个整数，bit j 为1 表示城市 j 已访问
> total_masks = 1 << n
> dp = [[INF] * n for _ in range(total_masks)]
> 
> # 起点设为城市0
> dp[1][0] = 0  # 只访问了城市0，当前在0，花费0
> 
> # 遍历所有状态
> for mask in range(1, total_masks, 2):
>     for u in range(n):
>         if dp[mask][u] == INF:
>             continue
>         # 尝试从 u 到未访问的城市 v
>         for v in range(n):
>             if mask & (1 << v):
>                 continue  # v 已访问，跳过
>             new_mask = mask | (1 << v)
>             new_cost = dp[mask][u] + cost[u][v]
>             if new_cost < dp[new_mask][v]:
>                 dp[new_mask][v] = new_cost
> 
> # 所有城市都访问完的状态是 (1 << n) - 1
> full_mask = total_masks - 1
> ans = INF
> for i in range(1, n):  # 从其他城市回到起点0
>     if dp[full_mask][i] != INF:
>         ans = min(ans, dp[full_mask][i] + cost[i][0])
> 
> print(ans)
> ```



## T30204: 小P的LLM推理加速

greedy, http://cs101.openjudge.cn/practice/30204/

随着大语言模型参数量的爆炸式增长，边缘设备上的推理效率成为了研究热点。小P的团队正在为一款搭载了新型 NPU（神经网络处理单元）的嵌入式设备开发推理框架。 该 NPU 采用了一种特殊的**双缓冲**机制来管理显存与计算单元的数据交互。

该 NPU 包含 `n` 个异构的计算核，编号为 `1` 到 `n`。由于硬件架构的特性，每个计算核在执行连续的推理任务时，其 **能耗** 会呈现周期性变化。

具体来说，对于第 `i`（`1 ≤ i ≤ n`）个计算核，其数据加载与计算遵循“冷-热”交替模式：

- **第 1 个** 推理周期（冷启动）：需要从主存加载权重，能耗为 `xi` 焦耳。
- **第 2 个** 推理周期（热运行）：权重已在缓存中，直接计算，能耗为 `yi` 焦耳。
- **第 3 个** 推理周期（强制刷新）：由于双缓冲队列的限制，缓存被新的数据流覆盖，需要重新加载，能耗变回 `xi` 焦耳。
- **第 4 个** 推理周期（热运行）：能耗再次变为 `yi` 焦耳。
- 以此类推

设备的电池总能量预算为 `m` 焦耳。作为框架的调度算法设计者，你的任务并不关心具体使用了哪些计算核，而是要通过合理分配任务，使得在电量耗尽前，设备总共能完成的 **推理周期数**最大化。

**输入**

输入的第一行包含两个正整数 n 和 m，分别代表计算核的数量和电池的总能量预算。

输入的第 i+1 行（1 ≤ i ≤ n）包含两个正整数 xi 和 yi，分别表示第 i 个计算核在“冷启动”“热运行”状态下的能耗。

**输出**

输出一行一个非负整数，表示 m 焦耳能量预算下，所有计算核累计能完成的最大推理周期总数。

样例输入

```
2 10
4 1
3 3
```

样例输出

```
4
```

提示：贪心

【数据范围】

对于所有测试数据，均有：
\- 1 <= n <= 10^5；
\- 1 <= m <= 10^{18}；
\- 对于所有 1 <= i <= n，均有 1 <= xi, yi <= 10^9。

数据可能具有下面两种特殊性质，也可能没有:
特殊性质 A：对于所有 1 <= i <= n，均有 xi = yi。

特殊性质 B：对于所有 1 <= i <= n，均有 xi >= yi。

来源

TA-xjk, https://www.luogu.com.cn/problem/P14635



> **P14635 [NOIP2025] 糖果店 / candy（官方数据）**
>
> https://www.luogu.com.cn/problem/P14635
>
> 小 X 开了一家糖果店，售卖 $n$ 种糖果，每种糖果均有无限颗。对于不同种类的糖果，小 X 采用了不同的促销策略。具体地，对于第 $i$ ($1 \le i \le n$) 种糖果，购买第一颗的价格为 $x_i$ 元，第二颗为 $y_i$ 元，第三颗又变回 $x_i$ 元，第四颗则为 $y_i$ 元，以此类推。
>
> 小 R 带了 $m$ 元钱买糖果。小 R 不关心糖果的种类，只想得到数量尽可能多的糖果。你需要帮助小 R 求出，$m$ 元钱能购买的糖果数量的最大值。
>
> **输入格式**
>
> 输入的第一行包含两个正整数 $n, m$，代表糖果的种类数和小 R 的钱数。
>
> 输入的第 $i+1$ ($1 \le i \le n$) 行包含两个正整数 $x_i, y_i$，分别表示购买第 $i$ 种糖果时第奇数颗的价格和第偶数颗的价格。
>
> **输出格式**
>
> 输出一行一个非负整数，表示 $m$ 元钱能购买的糖果数量的最大值。
>
> **样例**
>
> **输入 #1**
>
> ```
> 2 10
> 4 1
> 3 3
> ```
>
> **输出 #1**
>
> ```
> 4
> ```
>
> **输入 #2**
>
> ```
> 3 15
> 1 7
> 2 3
> 3 1
> ```
>
> **输出 #2**
>
> ```
> 8
> ```
>
> 说明/提示
>
> 【样例 1 解释】
>
> 小 R 可以购买 4 颗第一种糖果，共花费 $4 + 1 + 4 + 1 = 10$ 元。
>
> 【样例 2 解释】
>
> 小 R 可以购买 1 颗第一种糖果、1 颗第二种糖果与 6 颗第三种糖果，共花费 $1 + 2 + 12 = 15$ 元。
>
> 【数据范围】
>
> 对于所有测试数据，均有：
> - $1 \le n \le 10^5$；
> - $1 \le m \le 10^{18}$；
> - 对于所有 $1 \le i \le n$，均有 $1 \le x_i, y_i \le 10^9$。
>
> 
>



【尹显齐 25 物理学院】思路：
取每一种糖果的过程，都可以分解成取或不取 $x_{i}$ + 取 $n$ 个 $x_{i}+y_{i}$ 的过程。
对于所有的 $x_{i}+y_{i}$ ，肯定取其中最小的是最优的。
对于所有的 $x_{i}$ ，取不同个数都对应着不同情况，所以只要枚举取的 $x_{i}$ 的个数就可以，并且对于取 $k$ 个 $x_{i}$ 的情况，一定是取最小的前 $k$ 个最优，所以排序+前缀和即可。

```python
n,m = map(int,input().split())
nums = []
s = []
for i in range(n):
    x,y = map(int,input().split())
    nums.append(x)
    s.append(x+y)
minsum = min(s)
ans = 0
nums.sort()
pre = [0]
for ni in nums:
    pre.append(pre[-1]+ni)
for i,p in enumerate(pre):
    ans = max(ans,((m-p)//minsum)*2+i)
print(ans)
```






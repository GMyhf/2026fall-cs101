# 2025/10/21～11/18 week10~11 编程技巧与算法实战：区间问题、排序、单调栈、Trie等

Updated 2041 GMT+8 Nov 11, 2025

2024 fall, Complied by Hongfei Yan



> Log:  扩充了 滑动窗口最大值、前缀和、Kadane算法
>

# 一、调试程序

https://pythontutor.com 很好用，适合还不会用Pycharm调试工具的，当然后者也好用。另外就是print变量输出。

> 计算中心机房 PyCharm 比 VS Code补全功能强。



### 1 Pycharm调试

在行号处点击，设置端点；然后点击右上角绿色小虫子debug模式运行。

![image-20241022114421154](https://raw.githubusercontent.com/GMyhf/img/main/img/image-20241022114421154.png)



debug运行后，停在设置了短点的语句，变量中的值都显示出来。

![image-20241022114608119](https://raw.githubusercontent.com/GMyhf/img/main/img/image-20241022114608119.png)



### 2 pythontutor可视化运行

递归程序运行过程，不容易理解。https://pythontutor.com，完美展示 归并排序 的递归过程。

![image-20241021221131586](https://raw.githubusercontent.com/GMyhf/img/main/img/202410212211019.png)







# 二、常见区间问题

一文读懂五类常见区间问题，https://zhuanlan.zhihu.com/p/446371757

增加了6 覆盖连续区间

> 练习网址，https://leetcode.cn 。leetcode只需要完成核心代码就可以，不用写输入输出部分。
>
> 核心代码已经指定好类名、方法名、参数名，请勿修改或重命名，直接返回值即可。



## 1 区间合并

### 1.1 题意描述

区间合并问题大概**题意**就是：

给出一堆区间，要求**合并**所有**有交集的区间** （端点处相交也算有交集）。最后问合并之后的**区间**。

如下图所示：

![img](https://pic4.zhimg.com/80/v2-6e3bb59ed6c14eacfa1331c645d4afdf_1440w.jpg)

<center>区间合并问题示例：合并结果包含3个区间</center>



### 1.2 解题步骤

【**步骤一**】：按照区间**左端点**从小到大排序。

【**步骤二**】：维护前面区间中最右边的端点为ed。从前往后枚举每一个区间，判断是否应该将当前区间视为新区间。

假设当前遍历到的区间为第i个区间 $[l_i,r_i]$，有以下两种情况：

- $l_i \le ed$：说明当前区间与前面区间**有交集**。因此**不需要**增加区间个数，但需要设置 $ed = max(ed, r_i)$。
- $l_i > ed$: 说明当前区间与前面**没有交集**。因此**需要**增加区间个数，并设置 $ed = max(ed, r_i)$。



### 练习LC M56.合并区间

https://leetcode.cn/problems/merge-intervals/

以数组 `intervals` 表示若干个区间的集合，其中单个区间为 `intervals[i] = [starti, endi]` 。请你合并所有重叠的区间，并返回 *一个不重叠的区间数组，该数组需恰好覆盖输入中的所有区间* 。

 

**示例 1：**

```
输入：intervals = [[1,3],[2,6],[8,10],[15,18]]
输出：[[1,6],[8,10],[15,18]]
解释：区间 [1,3] 和 [2,6] 重叠, 将它们合并为 [1,6].
```

**示例 2：**

```
输入：intervals = [[1,4],[4,5]]
输出：[[1,5]]
解释：区间 [1,4] 和 [4,5] 可被视为重叠区间。
```

 

**提示：**

- `1 <= intervals.length <= 10^4`
- `intervals[i].length == 2`
- `0 <= starti <= endi <= 10^4`





```python
from typing import List
import sys

class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        # 对区间进行排序
        intervals.sort()

        res = []
        st, ed = -sys.maxsize, -sys.maxsize
        
        for v in intervals:
            if ed == -sys.maxsize:
                st, ed = v[0], v[1]
            elif v[0] <= ed:
                ed = max(v[1], ed)
            elif v[0] > ed:
                res.append([st, ed])
                st, ed = v[0], v[1]

        if ed != -sys.maxsize:
            res.append([st, ed])

        return res
```

这里有几个需要注意的地方：

- `-sys.maxsize` 用于表示最小整数值。
- 类型注解（如 `List[List[int]]`）是可选的，但有助于提高代码的可读性和类型检查工具的效率。



### M29947:校门外的树又来了

greedy, interval merging, stack, http://cs101.openjudge.cn/practice/29947/

某校大门外长度为L的马路上有一排树，每两棵相邻的树之间的间隔都是1米。我们可以把马路看成一个数轴，马路的一端在数轴0的位置，另一端在L的位置；数轴上的每个整数点，即0，1，2，……，L，都种有一棵树。 马路上有一些区域要用来建地铁，这些区域用它们在数轴上的起始点和终止点表示。已知任一区域的起始点和终止点的坐标都是整数，区域之间可能有重合的部分。现在要把这些区域中的树（包括区域端点处的两棵树）移走。你的任务是计算将这些树都移走后，马路上还有多少棵树。

**输入**

输入的第一行有两个整数L（1 <= L <= 10^9）和 M（1 <= M <= 100），L代表马路的长度，M代表区域的数目，L和M之间用一个空格隔开。接下来的M行每行包含两个不同的整数，用一个空格隔开，表示一个区域的起始点和终止点的坐标。

**输出**

输出包括一行，这一行只包含一个整数，表示马路上剩余的树的数目。

样例输入

```
500 3
150 300
100 200
470 471
```

样例输出

```
298
```

来源

yan



思路：区间合并。排序是为了保证取交集的方向唯一，这种单向关系可以避免分类讨论。

```python
L, M = map(int, input().split())
intervals = []

for _ in range(M):
    s, e = map(int, input().split())
    if s > e:
        s, e = e, s
    intervals.append((s, e))

# 按起点排序
intervals.sort()

# 合并区间
merged = []
for s, e in intervals:
    if not merged or s > merged[-1][1] + 1:
        merged.append([s, e])
    else:
        merged[-1][1] = max(merged[-1][1], e)

# 计算被砍掉的树总数
cut = sum(e - s + 1 for s, e in merged)
remain = (L + 1) - cut

print(remain)
```





## 2 选择不相交区间

### 2.1 题意描述

**选择不相交区间问题**大概题意就是：

给出一堆区间，要求选择**尽量多**的区间，使得这些区间**互不相交**，求可选取的区间的**最大数量**。这里端点相同也算有重复。

> **优先保留结束早的区间**，这样能为后续留下更多空间，从而保留更多区间。

如下图所示：

![img](https://pic1.zhimg.com/80/v2-690f7e53fd34c39802f45f48b59d5c5a_1440w.webp)

<center>选择不相交区间问题示例：结果包含3个区间</center>

### 2.2 解题步骤

【**步骤一**】：按照区间**右端点**从小到大排序。

【**步骤二**】：从前往后依次枚举每个区间。

假设当前遍历到的区间为第i个区间 $[l_i,r_i]$，有以下两种情况：

- $l_i \le ed$：说明当前区间与前面区间有交集。因此直接跳过。
- $l_i > ed$: 说明当前区间与前面没有交集。因此选中当前区间，并设置 $ed = r_i$。



### 练习LC M435.无重叠区间

https://leetcode.cn/problems/non-overlapping-intervals/

给定一个区间的集合 `intervals` ，其中 `intervals[i] = [starti, endi]` 。返回 *需要移除区间的最小数量，使剩余区间互不重叠* 。

**注意** 只在一点上接触的区间是 **不重叠的**。例如 `[1, 2]` 和 `[2, 3]` 是不重叠的。

 

**示例 1:**

```
输入: intervals = [[1,2],[2,3],[3,4],[1,3]]
输出: 1
解释: 移除 [1,3] 后，剩下的区间没有重叠。
```

**示例 2:**

```
输入: intervals = [ [1,2], [1,2], [1,2] ]
输出: 2
解释: 你需要移除两个 [1,2] 来使剩下的区间没有重叠。
```

**示例 3:**

```
输入: intervals = [ [1,2], [2,3] ]
输出: 0
解释: 你不需要移除任何区间，因为它们已经是无重叠的了。
```

 

**提示:**

- `1 <= intervals.length <= 10^5`
- `intervals[i].length == 2`
- `-5 * 10^4 <= starti < endi <= 5 * 10^4`





```python
from typing import List
import sys

class Solution:
    def eraseOverlapIntervals(self, intervals: List[List[int]]) -> int:
        # 按照右端点从小到大排序
        intervals.sort(key=lambda x: x[1])

        res = 0
        ed = -sys.maxsize
        
        for v in intervals:
            if ed <= v[0]:
                res += 1
                ed = v[1]

        return len(intervals) - res
```



## 3 区间选点问题

### 3.1 题意描述

**区间选点问题**大概题意就是：

给出一堆区间，取**尽量少**的点，使得每个区间内**至少有一个点**（不同区间内含的点可以是同一个，位于区间端点上的点也算作区间内）。

如下图所示：

![img](https://pica.zhimg.com/80/v2-a7ef021e1191ec53f20609ba870b44ba_1440w.webp)

<center>区间选点问题示例，最终至少选择3个点</center>



这个题可以转化为上一题的**求最大不相交区间**的数量。

对于这些**最大的不相交区间**，肯定是每个区间都需要选出一个点。而其他的区间都是和这些选出的区间有重复的，我们只需要把点的位置选在**重合**的部分即可。

也可以换一种思路：

我们将区间按照**右端点**从小到大排序，这时我们应该尽量选择**当前区间最右边的点**。

因为最右边的点可能和下面的其他区间重复，所以至少不比选择区间靠前位置的点差。

所以，最后的解法与选择不相交区间问题解法完全一样。

### 3.2 解题步骤

【**步骤一**】：按照区间右端点从小到大排序。

【**步骤二**】：从前往后依次枚举每个区间。

假设当前遍历到的区间为第i个区间 $[l_i,r_i]$，有以下两种情况：

- $l_i \le ed$：说明当前区间与前面区间有交集，前面已经选点了。因此直接跳过。
- $l_i > ed$: 说明当前区间与前面没有交集。因此选中当前区间，并设置 $ed = r_i$。



### 练习LC M452. 用最少量的箭引爆气球

https://leetcode.cn/problems/minimum-number-of-arrows-to-burst-balloons/

有一些球形气球贴在一堵用 XY 平面表示的墙面上。墙面上的气球记录在整数数组 `points` ，其中`points[i] = [xstart, xend]` 表示水平直径在 `xstart` 和 `xend`之间的气球。你不知道气球的确切 y 坐标。

一支弓箭可以沿着 x 轴从不同点 **完全垂直** 地射出。在坐标 `x` 处射出一支箭，若有一个气球的直径的开始和结束坐标为 xstart，xend， 且满足  `xstart ≤ x ≤ xend`，则该气球会被 **引爆** 。可以射出的弓箭的数量 **没有限制** 。 弓箭一旦被射出之后，可以无限地前进。

给你一个数组 `points` ，*返回引爆所有气球所必须射出的 **最小** 弓箭数* 。

 

**示例 1：**

```
输入：points = [[10,16],[2,8],[1,6],[7,12]]
输出：2
解释：气球可以用2支箭来爆破:
-在x = 6处射出箭，击破气球[2,8]和[1,6]。
-在x = 11处发射箭，击破气球[10,16]和[7,12]。
```

**示例 2：**

```
输入：points = [[1,2],[3,4],[5,6],[7,8]]
输出：4
解释：每个气球需要射出一支箭，总共需要4支箭。
```

**示例 3：**

```
输入：points = [[1,2],[2,3],[3,4],[4,5]]
输出：2
解释：气球可以用2支箭来爆破:
- 在x = 2处发射箭，击破气球[1,2]和[2,3]。
- 在x = 4处射出箭，击破气球[3,4]和[4,5]。
```

 



**提示:**

- `1 <= points.length <= 105`
- `points[i].length == 2`
- `-231 <= xstart < xend <= 231 - 1`



```python
class Solution:
    def findMinArrowShots(self, points: List[List[int]]) -> int:
        # 按照右端点从小到大排序
        points.sort(key=lambda x: x[1])

        res = 0
        ed = -sys.maxsize
        
        for v in points:
            if ed < v[0]:
                res += 1
                ed = v[1]

        return res
```



### M01328: Radar Installation

greedy, http://cs101.openjudge.cn/pctbook/M01328/

Assume the coasting is an infinite straight line. Land is in one side of coasting, sea in the other. Each small island is a point locating in the sea side. And any radar installation, locating on the coasting, can only cover d distance, so an island in the sea can be covered by a radius installation, if the distance between them is at most d.

We use Cartesian coordinate system, defining the coasting is the x-axis. The sea side is above x-axis, and the land side below. Given the position of each island in the sea, and given the distance of the coverage of the radar installation, your task is to write a program to find the minimal number of radar installations to cover all the islands. Note that the position of an island is represented by its x-y coordinates.
![image-20231021115237439](https://raw.githubusercontent.com/GMyhf/img/main/img/image-20231021115237439.png)
Figure A Sample Input of Radar Installations

**输入**

The input consists of several test cases. The first line of each case contains two integers n (1<=n<=1000) and d, where n is the number of islands in the sea and d is the distance of coverage of the radar installation. This is followed by n lines each containing two integers representing the coordinate of the position of each island. Then a blank line follows to separate the cases.

The input is terminated by a line containing pair of zeros

**输出**

For each test case output one line consisting of the test case number followed by the minimal number of radar installations needed. "-1" installation means no solution for that case.

样例输入

```
3 2
1 2
-3 1
2 1

1 2
0 2

0 0
```

样例输出

```
Case 1: 2
Case 2: 1
```

来源: Beijing 2002



映射到x轴，排序，左右端点互相看看。程序逻辑解释：

1. **计算岛屿的覆盖区间**：对于每个岛屿，先根据其x和y坐标计算出在x轴上的区间范围。这是通过$\sqrt{d^2 - y^2}$来确定的。
2. **排序**：将所有岛屿的区间按照右端点进行排序，目的是尽可能让新的雷达覆盖更多的岛屿。
3. **更新覆盖范围**：逐个岛屿进行遍历，尝试更新当前雷达能够覆盖的最远点。如果当前岛屿的左端点在已经覆盖的区间之外，则必须增加一个新的雷达，并将新的覆盖范围设为当前岛屿的区间。

```python
import math

def solve(n, d, islands):
    if d < 0:
        return -1

    ranges = []
    for x, y in islands:
        if y > d:
            return -1
        delta = math.sqrt(d * d - y * y)
        ranges.append((x - delta, x + delta))

    if not ranges:
        return -1

    ranges.sort(key=lambda x:x[1])

    number = 1
    r = ranges[0][1]
    for start, end in ranges[1:]:
        if r < start:
            r = end
            number += 1

    return number

case_number = 0
while True:
    n, d = map(int, input().split())
    if n == 0 and d == 0:
        break

    case_number += 1
    islands = []
    for _ in range(n):
        islands.append(tuple(map(int, input().split())))

    result = solve(n, d, islands)
    print(f"Case {case_number}: {result}")
    input()
```





## 4 区间覆盖问题

### 4.1 题意描述

**区间覆盖问题**大概题意就是：

给出一堆区间和一个目标区间，问最少选择多少区间可以**覆盖**掉题中给出的这段目标区间。

如下图所示： 

![img](https://pic3.zhimg.com/80/v2-66041d9941667482fc51adeb4a616f64_1440w.webp)

<center>区间覆盖问题示例，最终至少选择2个区间才能覆盖目标区间</center>

### 4.2. 解题步骤

【**步骤一**】：按照区间左端点从小到大排序。

【**步骤二**】：**从前往后**依次枚举每个区间，在所有能覆盖当前目标区间起始位置start的区间之中，选择**右端点**最大的区间。

假设右端点最大的区间是第$i$个区间，右端点为 $r_i$。

最后将目标区间的start更新成$r_i$





### 练习LC M1024. 视频拼接

https://leetcode.cn/problems/video-stitching/

你将会获得一系列视频片段，这些片段来自于一项持续时长为 `time` 秒的体育赛事。这些片段可能有所重叠，也可能长度不一。

使用数组 `clips` 描述所有的视频片段，其中 `clips[i] = [starti, endi]` 表示：某个视频片段开始于 `starti` 并于 `endi` 结束。

甚至可以对这些片段自由地再剪辑：

- 例如，片段 `[0, 7]` 可以剪切成 `[0, 1] + [1, 3] + [3, 7]` 三部分。

我们需要将这些片段进行再剪辑，并将剪辑后的内容拼接成覆盖整个运动过程的片段（`[0, time]`）。返回所需片段的最小数目，如果无法完成该任务，则返回 `-1` 。

 

**示例 1：**

```
输入：clips = [[0,2],[4,6],[8,10],[1,9],[1,5],[5,9]], time = 10
输出：3
解释：
选中 [0,2], [8,10], [1,9] 这三个片段。
然后，按下面的方案重制比赛片段：
将 [1,9] 再剪辑为 [1,2] + [2,8] + [8,9] 。
现在手上的片段为 [0,2] + [2,8] + [8,10]，而这些覆盖了整场比赛 [0, 10]。
```

**示例 2：**

```
输入：clips = [[0,1],[1,2]], time = 5
输出：-1
解释：
无法只用 [0,1] 和 [1,2] 覆盖 [0,5] 的整个过程。
```

**示例 3：**

```
输入：clips = [[0,1],[6,8],[0,2],[5,6],[0,4],[0,3],[6,7],[1,3],[4,7],[1,4],[2,5],[2,6],[3,4],[4,5],[5,7],[6,9]], time = 9
输出：3
解释： 
选取片段 [0,4], [4,7] 和 [6,9] 。
```

 

**提示：**

- `1 <= clips.length <= 100`
- `0 <= starti <= endi <= 100`
- `1 <= time <= 100`





```python
from typing import List

class Solution:
    def videoStitching(self, clips: List[List[int]], time: int) -> int:
        # 对 clips 按起点升序排序
        clips.sort()

        st, ed = 0, time
        res = 0

        i = 0
        while i < len(clips) and st < ed:
            maxR = 0
            # 找到所有起点小于等于 st 的片段，并记录这些片段的最大终点 maxR
            while i < len(clips) and clips[i][0] <= st:
                maxR = max(maxR, clips[i][1])
                i += 1

            if maxR <= st:
                # 无法继续覆盖
                return -1

            # 更新 st 为 maxR，并增加结果计数
            st = maxR
            res += 1

            if maxR >= ed:
                # 已经覆盖到终点
                return res

        # 如果没有成功覆盖到终点
        return -1
```



### 练习T27104: 世界杯只因

greedy/dp, http://cs101.openjudge.cn/practice/27104/

卡塔尔世界杯正在火热进行中，P大富哥李哥听闻有一种叫"肤白·态美·宇宙无敌·世界杯·预测鸡"的鸡品种（以下简称为只因）有概率能准确预测世界杯赛果，一口气买来无数只只因，并把它们塞进了N个只因窝里，但只因窝实在太多了，李哥需要安装摄像头来观测里面的只因的预测行为。

具体来说，李哥的只因窝可以看作分布在一条直线上的N个点，编号为1到N。由于每个只因窝的结构不同，在编号为i的只因窝处安装摄像头，观测范围为a_i，其中a是长为N的整数列，表示若在此安装摄像头，可以观测到编号在 [ i - a_i , i + a_i ]（闭区间）内的所有只因窝。

李哥觉得摄像头成本高，决定抠门一下，请你来帮忙看看最少需要安装多少个摄像头，才能观测到全部N个只因窝。作为回报，他会请你喝一杯芋泥波波牛乳茶。

**输入**

第一行：一个正整数，代表有N个只因窝。
第二行给出数列a：N个非负整数，第i个数代表a_i，也就是在第i个只因窝装摄像头能观测到的区间的半径。

数据保证 N ≤ 500000，0 ≤ a_i ≤ N

**输出**

一个整数，即最少需要装的摄像头数量。

样例输入

```
10
2 0 1 1 0 3 1 0 2 0
```

样例输出

```
3
```

提示：彩蛋：只因们很喜欢那个穿着蓝白球衣长得像黄金矿工的10号

来源：计概A 2022期末



是典型的“**区间覆盖最小集合**”问题，本质上是贪心算法在一维线段上的最优覆盖。
下面先解析题意→说明贪心思想→再给出代码。

------

**题意解析**

有 N 个窝在一条线上，每个窝 i 对应一个整数 ( a_i )。
如果在窝 i 装摄像头，它能覆盖区间：
$
[i - a_i,, i + a_i]
$

目标：用尽量少的摄像头，使区间 `[1, N]` 被完全覆盖。

约束：

- $( N \le 5\times 10^5 )$
- $( 0 \le a_i \le N )$
- 必须线性或 O(N log N) 算法。

------

💡 **核心思想：区间覆盖贪心（Interval Covering Greedy）**

等价于：

> 给定一系列区间 `[L_i, R_i]`，要覆盖 `[1, N]`，求最少区间数量。

经典贪心策略：

1. 按 **左端点 L 升序** 排序。
2. 用一个变量 `rightmost` 表示当前已覆盖的最右端。
3. 在能“接上当前覆盖区间”的所有候选区间中，**选右端点 R 最大的**那一个。
4. 每当 `rightmost` 无法继续延伸时，新增一个区间（摄像头）。

时间复杂度 O(N log N)，如果不排序、直接预处理每个位置的最远可达右端，也能做到 O(N)。

内存: 96740kB，时间: 1040ms

```python
n = int(input())
a = list(map(int, input().split()))

# 1. 计算每个位置的覆盖区间
intervals = []
for i, x in enumerate(a, start=1):
    left = max(1, i - x)
    right = min(n, i + x)
    intervals.append((left, right))

# 2. 按左端点排序
intervals.sort()

# 3. 贪心选择最少区间覆盖 [1, N]
ans = 0
i = 0
covered = 0

while covered < n:
    best = covered
    # 在所有能接上的区间中，选右端点最大的
    while i < n and intervals[i][0] <= covered + 1:
        best = max(best, intervals[i][1])
        i += 1
    if best == covered:  # 无法延伸
        break
    covered = best
    ans += 1

print(ans)
```

思路说明

- `covered` 是当前覆盖的最右边界。
- 每次扩展时：
  - 找所有 `L_i ≤ covered + 1` 的区间。
  - 从中选 `R_i` 最大的那一个。
  - 更新 `covered = R_i`。
  - 计数器 `ans += 1`。
- 重复直到 `covered ≥ N`。



**若需 纯 O(N) 版本（无需排序）**

利用「右端最远覆盖数组」：

内存: 59472kB，时间: 627ms

```python
n = int(input())
a = list(map(int, input().split()))

far = [0] * (n + 2)
for i, x in enumerate(a, start=1):
    L = max(1, i - x)
    R = min(n, i + x)
    far[L] = max(far[L], R)

ans = 0
covered = 0
best = 0

for i in range(1, n + 1):
    best = max(best, far[i])
    if i > covered:
        ans += 1
        covered = best

print(ans)
```

这个写法等价于“跳台阶式区间扩展”，非常精炼、线性复杂度，是此类题的最优模板。

------

✅ 总结对比

| 特征     | 优化版（O(N log N)） | 优化版（O(N)）       |
| -------- | -------------------- | -------------------- |
| 核心思路 | 区间覆盖标准贪心     | 线性扫描右端最远覆盖 |
| 复杂度   | O(N log N)           | O(N)                 |
| 代码长度 | 20行                 | 15行                 |
| 可读性   | ★★★★                 | ★★★★★                |
| 是否易记 | 是                   | 是（推荐模板）       |

------

**建议**

今后遇到类似题型（如“最少灯照亮道路”“覆盖线段”等），
直接记下面这两种模板：

- **排序版**：适合任意输入区间。
- **线性版**：适合“按位置定义区间”的题。





## 5 区间分组问题

### 5.1 题意描述

**区间分组**问题大概题意就是：给出一堆区间，问最少可以将这些区间分成多少组使得每个组内的区间互不相交。

如下图所示： 

![img](https://pic2.zhimg.com/80/v2-6c6a045d481ddc44c66b046ef3e7d4cd_1440w.webp)

<center>区间分组问题示例，最少分成3个组</center>

### 5.2. 解题步骤

【**步骤一**】：按照区间左端点从小到大排序。

【**步骤二**】：从**前往后**依次枚举每个区间，判断当前区间能否被放到某个现有组里面。

（即判断是否存在某个组的右端点在当前区间之中。如果可以，则不能放到这一组）

假设现在已经分了 m 组了，第 k 组最右边的一个点是 $r_k$，当前区间的范围是 $[L_i,R_i]$ 。则：

如果$L_i \le r_k$ 则表示第 i 个区间无法放到第 k 组里面。反之，如果 $L_i > r_k$， 则表示可以放到第 k 组。

- 如果所有 m 个组里面没有组可以接收当前区间，则当前区间新开一个组，并把自己放进去。
- 如果存在可以接收当前区间的组 k，则将当前区间放进去，并更新当前组的 $r_k = R_i$。

**注意：**

为了能快速的找到能够接收当前区间的组，我们可以使用**优先队列 （小顶堆）**。

优先队列里面记录每个组的右端点值，每次可以在 O(1) 的时间拿到右端点中的的最小值。



### 练习NC147 主持人调度

https://www.nowcoder.com/questionTerminal/4edf6e6d01554870a12f218c94e8a299

有 n 个活动即将举办，每个活动都有开始时间与活动的结束时间，第 i 个活动的开始时间是 starti ,第 i 个活动的结束时间是 endi ,举办某个活动就需要为该活动准备一个活动主持人。

一位活动主持人在同一时间只能参与一个活动。并且活动主持人需要全程参与活动，换句话说，一个主持人参与了第 i 个活动，那么该主持人在 (starti,endi) 这个时间段不能参与其他任何活动。求为了成功举办这 n 个活动，最少需要多少名主持人。

数据范围: $1≤n≤10^5 ， −2^{32}≤start_i≤end_i≤2^{31}$

复杂度要求：时间复杂度 O(nlog⁡n) ，空间复杂度 O(n)

示例1

**输入**

```
2,[[1,2],[2,3]]
```

**输出**

```
1
```

说明

```
只需要一个主持人就能成功举办这两个活动      
```

示例2

输入

```
2,[[1,3],[2,4]]
```

输出

```
2
```

说明

```
需要两个主持人才能成功举办这两个活动      
```

备注:

```
1≤n≤10^5
starti,endi在int范围内
```





解法1: 将每个活动的开始时间和结束时间转换为事件

```python
from typing import List

class Solution:
    def minmumNumberOfHost(self, n: int, startEnd: List[List[int]]) -> int:
        # 将每个活动的开始时间和结束时间转换为事件
        events = []
        for i in range(n):
            start, end = startEnd[i]
            events.append((start, 1))  # 活动开始，+1主持人
            events.append((end, -1))  # 活动结束，-1主持人

        # 对事件按照时间排序，如果时间相同，先处理结束事件
        events.sort(key=lambda x: (x[0], x[1]))

        min_hosts = 0
        current_hosts = 0

        # 遍历所有事件，计算需要的主持人数
        for time, event in events:
            current_hosts += event
            min_hosts = max(min_hosts, current_hosts)

        return min_hosts

# 示例用法

#sol = Solution()
#print(sol.minimum_number_of_host(3, [[1, 5], [2, 7], [4, 5]]))  # 输出应为 2
#print(sol.minimum_number_of_host(34,[[547,612],[417,551],[132,132],[168,446],[95,747],[187,908],[115,712],[15,329],[612,900],[3,509],[181,200],[562,787],[136,268],[36,784],[533,573],[165,946],[343,442],[127,725],[557,991],[604,613],[633,721],[287,847],[414,480],[428,698],[437,616],[475,932],[652,886],[19,992],[132,543],[390,869],[754,903],[284,925],[511,951],[272,739]]))
```



解法2:

```python
from typing import List
import heapq

class Solution:
    def minmumNumberOfHost(self, n: int, startEnd: List[List[int]]) -> int:
        # 按左端点从小到大排序
        startEnd.sort(key=lambda x: x[0])

        # 创建小顶堆
        q = []

        for i in range(n):
            if not q or q[0] > startEnd[i][0]:
                heapq.heappush(q, startEnd[i][1])
            else:
                heapq.heappop(q)
                heapq.heappush(q, startEnd[i][1])

        return len(q)
```





解法3:

将活动开始时间写入一个列表starts，进行排序。 

将活动结束时间写入一个列表ends，进行排序。 

每次活动开始时，需要增加一个主持人上场，每次活动结束时候可以释放一个主持人。 

所以按照时间先后顺序对starts进行遍历，每次有活动开始count++，每次有活动结束count-- 

在count最大的时候，即是需要主持人最多的时候

```python
class Solution:
    def minmumNumberOfHost(self , n , startEnd ):
        starts=[]
        ends=[]
        for start,end in startEnd:
            starts.append(start);
            ends.append(end);
            
        starts.sort();
        ends.sort()
        
        i,j,count,res=0,0,0,0
        for time in starts:
            while(i<n and starts[i]<=time):
                i+=1
                count+=1
            while(j<n and ends[j]<=time):
                j+=1
                count-=1
            if res<count:
                res=count
        return res
```



## 6 覆盖连续区间



### M29896:购物

greedy, http://cs101.openjudge.cn/practice/29896/



你就要去购物了，现在你手上有 N 种不同面值的硬币，每种硬币有无限多个。为了方便购物，你希望带尽量少的硬币，但要能组合出 1 到 X 之间的任意值。

**输入**

第一行两个数 X, N，以下 N 个数，表示每种硬币的面值。

**输出**

最少需要携带的硬币个数，如果无解输出-1。

样例输入

```
20 4
1 2 5 10
```

样例输出

```
5
```

提示

N <= 10, X <= 10000 (tag:greedy)

来源

https://www.luogu.com.cn/problem/P1658(TA-hhy)





**目标是：**在给定若干种硬币面值（每种无限供应）的前提下，选出最少数量的硬币，使得它们的组合能够表示出从 **1 到 X** 的所有整数值。

如果无法做到（比如没有面值为 1 的硬币，那连 1 都凑不出来），就输出 `-1`。



这是一个典型的“**覆盖连续区间**”问题。可以维护一个当前能表示的最大连续值 `max_reach`（初始为 0），然后不断选择硬币来扩展这个范围。思路：

1. **必须包含面值 1**，否则无法组成 1 → 无解，输出 -1。

2. 将硬币面值从小到大排序。

3. 维护当前能组成的最大连续值 `max_val`（初始为 0）。

4. 同时维护一个“候选池”：所有 ≤ `max_val + 1` 的硬币中，选最大的那个（因为加它能让 `max_val` 增加最多）。

   - 但实际上，由于硬币可重复使用，更优策略是：

     > 每次在所有满足 `coin <= max_val + 1` 的硬币中，选择**面值最大的**，然后带一枚它，更新 `max_val += coin`，计数器 +1。

5. 重复直到 `max_val >= X`。

但注意：因为硬币可以多次使用，其实我们可以**多次使用同一个硬币**来快速扩展。



```python
def solve():
    import sys
    input = sys.stdin.read
    data = input().split()
    
    X = int(data[0])
    N = int(data[1])
    coins = list(map(int, data[2:2+N]))
    
    # 去除大于 X 的硬币（无用）
    coins = [c for c in coins if c <= X]
    if not coins:
        if X == 0:
            return 0
        else:
            return -1
    
    # 排序
    coins.sort()
    
    # 必须要有 1，否则无法覆盖 1
    if coins[0] > 1:
        return -1
    
    max_reach = 0  # 当前能覆盖 [1, max_reach]
    count = 0      # 使用的硬币数量
    
    while max_reach < X:
        # 选择满足 coin <= max_reach + 1 的最大面值硬币
        candidate = -1
        for coin in coins:
            if coin <= max_reach + 1:
                candidate = coin
            else:
                break  # 因为已排序，后面的更大
        
        if candidate == -1:
            return -1  # 无法扩展
        
        max_reach += candidate
        count += 1
        
        if max_reach >= X:
            break
    
    return count

# 主程序
print(solve())
```



```python
import bisect

def solve():
    X, N = map(int, input().split())
    coins = list(map(int, input().split()))
    coins.sort()
    
    # 如果最小面值 > 1，无法凑出 1
    if coins[0] > 1:
        print(-1)
        return

    reach = 0
    ans = 0

    # 可以重复使用同一个面值多次，所以不移除
    while reach < X:
        target = reach + 1
        # 找 coins 中最大且 <= target
        idx = bisect.bisect_right(coins, target) - 1
        if idx < 0:
            print(-1)
            return
        c = coins[idx]
        reach += c
        ans += 1

    print(ans)

if __name__ == "__main__":
    solve()
```

算法复杂度

- 先对面值排序：`O(N log N)`
- 每一步用二分查找找到最大 `≤ reach+1`：`O(log N)`，循环次数等于答案（最多约 `O(X/min_coin)`），总体可接受（X ≤ 10000, N ≤ 10）。





# 三、Python十大排序算法源码

> Logs:
>
> 2024/10/22 取自, https://github.com/GMyhf/2024spring-cs201/blob/main/code/ten_sort_algorithms.md



## 1 前言

经常用到各种排序算法，但是网上的Python排序源码质量参差不齐。因此结合网上的资料和个人理解，整理了一份可直接使用的排序算法Python源码。

包括：冒泡排序（Bubble Sort），插入排序（Insertion Sort），选择排序（Selection Sort），希尔排序（Shell Sort），归并排序（Merge Sort），快速排序（Quick Sort），堆排序（Heap Sort），计数排序（Counting Sort），桶排序（Bucket Sort），基数排序（Radix Sort）

## 2 排序算法的选取规则

选择合适的排序算法取决于多种因素，包括数据的规模、特性、性能要求、稳定性要求、内存限制等。

**数据规模**

小规模，通常指数据量在几千到几万个元素。冒泡排序、插入排序、选择排序。
中规模数据，通常指数据量在几万到几百万个元素。希尔排序、快速排序、归并排序。
大规模数据，通常指数据量在几百万到几亿甚至更多个元素。归并排序、快速排序、堆排序、外部排序、分布式排序。

**数据特性**

几乎有序：插入排序。

数据范围小：计数排序。

数据分布均匀：桶排序。

固定长度的整数或字符串：基数排序。

**性能要求**

高时间效率：归并排序、快速排序、堆排序。

低空间复杂度：选择排序、堆排序。

**稳定性要求**

需要稳定排序：归并排序、计数排序、基数排序、桶排序、插入排序、冒泡排序。

**内存限制**

内存有限：选择排序、堆排序。



**Comparison sorts**

在排序算法中，稳定性是指相等元素的相对顺序是否在排序后保持不变。换句话说，如果排序算法在排序过程中保持了相等元素的相对顺序，则称该算法是稳定的，否则是不稳定的。

对于判断一个排序算法是否稳定，一种常见的方法是观察交换操作。挨着交换（相邻元素交换）是稳定的，而隔着交换（跳跃式交换）可能会导致不稳定性。

Below is a table of [comparison sorts](https://en.wikipedia.org/wiki/Comparison_sort). A comparison sort cannot perform better than O(n log n) on average.

|        Name         |  Best   |  Average  |   Worst   | Memory | Stable |       Method        |                         Other notes                          |
| :-----------------: | :-----: | :-------: | :-------: | :----: | :----: | :-----------------: | :----------------------------------------------------------: |
| In-place merge sort |    —    |     —     | $nlog^2n$ |   1    |  Yes   |       Merging       | Can be implemented as a stable sort based on stable in-place merging. |
|      Heapsort       | $nlogn$ |  $nlogn$  |  $nlogn$  |   1    |   No   |      Selection      |                                                              |
|     Merge sort      | $nlogn$ |  $nlogn$  |  $nlogn$  |  *n*   |  Yes   |       Merging       | Highly parallelizable (up to *O*(log *n*) using the Three Hungarian's Algorithm) |
|       Timsort       |   *n*   |  $nlogn$  |  $nlogn$  |  *n*   |  Yes   | Insertion & Merging | Makes *n-1* comparisons when the data is already sorted or reverse sorted. |
|      Quicksort      | $nlogn$ |  $nlogn$  |   $n^2$   | $logn$ |   No   |    Partitioning     | Quicksort is usually done in-place with *O*(log *n*) stack space. |
|      Shellsort      | $nlogn$ | $n^{4/3}$ | $n^{3/2}$ |   1    |   No   |      Insertion      |                       Small code size.                       |
|   Insertion sort    |   *n*   |   $n^2$   |   $n^2$   |   1    |  Yes   |      Insertion      | *O*(n + d), in the worst case over sequences that have *d* inversions. |
|     Bubble sort     |   *n*   |   $n^2$   |   $n^2$   |   1    |  Yes   |     Exchanging      |                       Tiny code size.                        |
|   Selection sort    |  $n^2$  |   $n^2$   |   $n^2$   |   1    |   No   |      Selection      | Stable with O(n) extra space, when using linked lists, or when made as a variant of Insertion Sort instead of swapping the two items. |



Highly tuned implementations use more sophisticated variants, such as [Timsort](https://en.wikipedia.org/wiki/Timsort) (merge sort, insertion sort, and additional logic), used in [Android](https://en.wikipedia.org/wiki/Android_(operating_system)), [Java](https://en.wikipedia.org/wiki/Java_(programming_language)), and [Python](https://en.wikipedia.org/wiki/Python_(programming_language)), and [introsort](https://en.wikipedia.org/wiki/Introsort) (quicksort and heapsort), used (in variant forms) in some [C++ sort](https://en.wikipedia.org/wiki/Sort_(C%2B%2B)) implementations and in [.NET](https://en.wikipedia.org/wiki/.NET).



计数排序，时间复杂度：$O(n + k)$，其中 k 是数据范围。空间复杂度：$O(k)$。稳定。适用于数据范围较小且数据分布均匀的情况。

桶排序，时间复杂度：平均情况$O(n+k)$，最坏情况$O(n^2)$。空间复杂度：$O(n+k)$。稳定。适用于数据分布均匀且已知数据范围的情况。

基数排序，时间复杂度：$O(nk)$，其中 k 是数字的位数。空间复杂度：$O(n+k)$。稳定。适用于数据范围较大但位数较少的情况，例如固定长度的整数或字符串。



## 3 十大排序算法的Python源码

### 3.1 冒泡排序$$(Bubble$$ $$Sort)$$

方法： 通过重复地遍历要排序的列表，比较相邻的元素并根据需要交换它们的位置来实现排序。（比较次数多，交换次数多）
主要思想： 前后两两比较，大小顺序错误就交换位置

代码思路：

1. 比较相邻元素，如果前者大于后者，就交换位置。
2. 从队首到队尾，每一对相邻元素都重复上述步骤，最后一个元素为最大元素。
3. 针对前n-1个元素重复。

```python
def BubbleSort(arr):
    for i in range(len(arr) - 1):
        for j in range(len(arr) - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

if __name__ == "__main__":
    arr_in = [6, 5, 18, 2, 16, 15, 19, 13, 10, 12, 7, 9, 4, 4, 8, 1, 11, 14, 3, 20, 17, 10]
    print(arr_in)
    arr_out = BubbleSort(arr_in)
    print(arr_out)
```

时间复杂度：平均和最坏情况$O(n^2)$，最好情况$O(n)$
空间复杂度：$O(1)$
稳定排序。适用于小规模数据或几乎有序的数据。



改进后的冒泡排序是对原始冒泡排序的一种优化。原始冒泡排序的基本思想是依次比较相邻的两个元素，如果它们的顺序错误就交换它们，直到没有需要交换的元素为止。这样的算法效率较低，因为即使序列已经有序，它仍然需要进行多轮的比较和交换。

改进后的冒泡排序通过增加一个标志位来优化。在每一轮比较中，如果没有发生任何交换，说明序列已经有序，不需要再进行后续的比较，因此可以提前结束排序过程。

改进后的冒泡排序实现如下所示：

```python
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        # 标记是否发生了交换
        swapped = False
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                # 交换元素
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        # 如果没有发生交换，说明数组已经排序完成
        if not swapped:
            break
    return arr
```

在这个改进后的冒泡排序算法中，如果在一轮比较中没有发生任何交换，就将标志位 `swapped` 设置为 `False`，并提前跳出循环，从而减少了不必要的比较次数，提高了效率。



### 3.2 选择排序$$(Selection$$ $$Sort)$$

方法：在无序区找到最小的元素放到有序区的队尾（比较次数多，交换次数少）
主要思想：水果摊挑苹果，先选出最大的，再选出次大的，直到最后。
选择是对冒泡的优化，比较一轮只交换一次数据。

代码思路：

1. 找到无序待排序列中最小的元素，和第一个元素交换位置。
2. 剩下的待排无序序列（2-n）选出最小的元素，和第二个元素交换位置。
3. 直到最后选择完成。

```python
def SelectSort(arr):
    for i in range(len(arr)):
        minIndex = i
        for j in range(i + 1, len(arr)):
            if arr[j] < arr[minIndex]:
               minIndex = j
        arr[i], arr[minIndex] = arr[minIndex], arr[i]
    return arr

if __name__ == "__main__":
    arr_in = [6, 5, 18, 2, 16, 15, 19, 13, 10, 12, 7, 9, 4, 4, 8, 1, 11, 14, 3, 20, 17, 10]
    print(arr_in)
    arr_out = SelectSort(arr_in)
    print(arr_out)
```

时间复杂度：$O(n^2)$
空间复杂度：$O(1)$
非稳定排序



### 3.3 插入排序$$(Insertion$$ $$Sort)$$

方法：把无序区的第一个元素插入到有序区的合适位置（比较次数少，交换次数多）
主要思想：扑克牌打牌时的插入思想，逐个插入到前面的有序数中。

代码思路：

1. 选择待排无序序列的第一个元素作为有序数列的第一个元素。
2. 把第2个元素到最后一个元素看做无序待排序列。
3. 依次从待排无序序列取出每一个元素，<mark>与有序序列的每个元素比较（从右向左扫描）</mark>，符合条件交换元素位置。

```python
def InsertSort(arr):
    for i in range(1, len(arr)):
        for j in range(i, 0, -1):
            if arr[j] < arr[j - 1]:
                arr[j], arr[j - 1] = arr[j - 1], arr[j]
    return arr

if __name__ == "__main__":
    arr_in = [6, 5, 18, 2, 16, 15, 19, 13, 10, 12, 7, 9, 4, 4, 8, 1, 11, 14, 3, 20, 17, 10]
    print(arr_in)
    arr_out = InsertSort(arr_in)
    print(arr_out)
```

时间复杂度：$O(n^2)$
空间复杂度：$O(1)$
稳定排序



上面代码并没有在找到正确位置后立即停止循环，而是一直循环直到内部的 for 循环完成。

改进后的插入排序应该在找到正确位置后立即停止循环。要实现这一点，可以在内部的 for 循环中添加一个判断条件来判断是否需要继续交换。如果当前元素已经大于（或等于）前一个元素，就可以停止内部的循环了。

下面是一个改进的插入排序版本：

```python
def InsertSort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and key < arr[j]:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr

if __name__ == "__main__":
    arr_in = [6, 5, 18, 2, 16, 15, 19, 13, 10, 12, 7, 9, 4, 4, 8, 1, 11, 14, 3, 20, 17, 10]
    print(arr_in)
    arr_out = InsertSort(arr_in)
    print(arr_out)
```

这个版本的插入排序算法在找到正确位置后会立即停止内部的循环，从而提高了效率。



### 3.4 希尔排序$$(Shell$$ $$Sort)$$

希尔排序是插入排序的一种更高效的改进版本，其核心思想是将待排序数组分割成若干个子序列，然后对各个子序列进行插入排序，最后再对整个序列进行一次插入排序。希尔排序的关键在于选择合适的间隔序列，以保证最终的排序效率。

代码思路：

1. 选择一个增量序列t1，t2，…，tk，其中ti>tj，tk=1。
2. 按增量序列个数k，对序列进行k趟排序。
3. 每趟排序，根据对应的增量ti，将待排序序列分割成若干长度为m的子序列，分别对各子表进行直接插入排序。仅增量因子为1时，整个序列作为一个表来处理，表长度即为整个序列的长度。

```python
def ShellSort(arr):
    n = len(arr)
    gap = n // 2
    while gap > 0:
        for i in range(gap, n):
            temp = arr[i]
            j = i
            while j >= gap and arr[j - gap] > temp:
                arr[j] = arr[j - gap]
                j -= gap
            arr[j] = temp
        gap //= 2
    return arr

if __name__ == "__main__":
    arr_in = [6, 5, 18, 2, 16, 15, 19, 13, 10, 12, 7, 9, 4, 4, 8, 1, 11, 14, 3, 20, 17, 10]
    print(arr_in)
    arr_out = ShellSort(arr_in)
    print(arr_out)
```

空间复杂度：$O(1)$
非稳定排序

希尔排序的时间复杂度取决于所使用的增量序列。没有一个统一的最佳增量序列，不同的增量序列会导致不同的时间复杂度。然而，通常情况下，希尔排序的时间复杂度可以描述如下：

- 最坏情况时间复杂度：$O(n^2)$，这通常发生在某些特定的增量序列上。
- 平均情况时间复杂度：根据不同的增量序列，希尔排序的平均时间复杂度可以有很大的变化，但一般认为其优于简单的插入排序，大约在$O(n^{1.25})$到$O(n^{1.6})$之间。
- 最佳情况时间复杂度：如果数组已经是有序的，或者接近有序，那么希尔排序的时间复杂度可以接近线性，即$O(n)$。

值得注意的是，对于一些特定的增量序列，希尔排序的时间复杂度可以更接近于$O(n log n)$，但这并不普遍。因此，希尔排序对于小到中等规模的数据集是一个不错的选择，但对于非常大的数据集，可能不如快速排序或归并排序等算法高效。希尔排序的空间复杂度为$O(1)$，因为它是一种原地排序算法，不需要额外的存储空间。



> https://pythontutor.com 很好用，适合还不会用Pycharm调试工具的，当然后者也好用。另外就是print变量输出。
>
> ![image-20241021214028913](https://raw.githubusercontent.com/GMyhf/img/main/img/202410212140881.png)



### 3.5 归并排序$$(Merge$$ $$Sort)$$

归并排序采用分治法，将待排序数组分成若干个子序列，分别进行排序，然后再合并已排序的子序列，直到整个序列都排好序为止。

代码思路：

1. 将待排序数组分成左右两个子序列，递归地对左右子序列进行归并排序。
2. 将两个已排序的子序列合并成一个有序序列。

```python
def MergeSort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = MergeSort(arr[:mid])
    right = MergeSort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result

if __name__ == "__main__":
    arr_in = [6, 5, 18, 2, 16, 15, 19, 13, 10, 12, 7, 9, 4, 4, 8, 1, 11, 14, 3, 20, 17, 10]
    print(arr_in)
    arr_out = MergeSort(arr_in)
    print(arr_out)
```

时间复杂度：O(n log n)
空间复杂度：O(n)
稳定排序



> 递归程序运行过程，不容易理解。https://pythontutor.com，完美展示 归并排序 的递归过程。
>
> ![image-20241021221131586](https://raw.githubusercontent.com/GMyhf/img/main/img/202410212211019.png)



### 3.6 快速排序$$(Quick$$ $$Sort)$$

快速排序是一种高效的排序算法，采用分治法的思想，通过将数组分割成较小的子数组，然后分别对子数组进行排序，最终将数组整合成有序序列。

代码思路：

1. 选择数组中的一个元素作为基准（pivot）。
2. 将数组分割成两个子数组，使得左子数组中的所有元素都小于基准，右子数组中的所有元素都大于基准。
3. 对左右子数组递归地进行快速排序。

```python
def QuickSort(arr):
    if len(arr) <= 1:
        return arr
    else:
        pivot = arr[0]  # Choose the first element as the pivot
        left = [x for x in arr[1:] if x < pivot]
        right = [x for x in arr[1:] if x >= pivot]
        return QuickSort(left) + [pivot] + QuickSort(right)

if __name__ == "__main__":
    arr_in = [6, 5, 18, 2, 16, 15, 19, 13, 10, 12, 7, 9, 4, 4, 8, 1, 11, 14, 3, 20, 17, 10]
    print(arr_in)
    arr_out = QuickSort(arr_in)
    print(arr_out)
```

时间复杂度：平均情况下为$O(n log n)$，最坏情况下为$O(n^2)$（当数组已经有序时）
空间复杂度：平均情况下为$O(log n)$，最坏情况下为$O(n)$（递归调用栈的深度）
不稳定排序



如果用双指针实现，在partition函数中用两个指针 `i` 和 `j` 的方式实现。

```python
def quicksort(arr, left, right):
    if left < right:
        partition_pos = partition(arr, left, right)
        quicksort(arr, left, partition_pos - 1)
        quicksort(arr, partition_pos + 1, right)


def partition(arr, left, right):
    i = left
    j = right - 1
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
print(arr)

# [11, 22, 33, 44, 55, 66, 77, 88]
```





### 3.7 堆排序$$(Heap$$ $$Sort)$$

堆排序利用了堆这种数据结构的特性，将待排序数组构建成一个二叉堆，然后对堆进行排序。

代码思路：

1. 构建一个最大堆（或最小堆），将待排序数组转换成堆。
2. 从堆顶开始，每次将堆顶元素与堆的最后一个元素交换，然后重新调整堆。
3. 重复上述步骤，直到整个堆排序完成。

```python
def heapify(arr, n, i):
    largest = i
    left = 2 * i + 1
    right = 2 * i + 2

    if left < n and arr[left] > arr[largest]:
        largest = left
    if right < n and arr[right] > arr[largest]:
        largest = right

    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)

def HeapSort(arr):
    n = len(arr)
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)
    for i in range(n - 1, 0, -1):
        arr[i], arr[0] = arr[0], arr[i]
        heapify(arr, i, 0)
    return arr

if __name__ == "__main__":
    arr_in = [6, 5, 18, 2, 16, 15, 19, 13, 10, 12, 7, 9, 4, 4, 8, 1, 11, 14, 3, 20, 17, 10]
    print(arr_in)
    arr_out = HeapSort(arr_in)
    print(arr_out)
```

时间复杂度：O(n log n)
空间复杂度：O(1)
不稳定排序



### 3.8 计数排序$$(Counting$$ $$Sort)$$

计数排序是一种非比较性的排序算法，适用于待排序数组的取值范围较小且已知的情况。该算法通过统计每个元素出现的次数，然后根据统计结果重构排序后的数组。

代码思路：

1. 统计数组中每个元素出现的次数，并存储在额外的计数数组中。
2. 根据计数数组中的统计结果，重构排序后的数组。

```python
def CountingSort(arr):
    max_value = max(arr)
    count = [0] * (max_value + 1)
    for num in arr:
        count[num] += 1
    sorted_arr = []
    for i in range(max_value + 1):
        sorted_arr.extend([i] * count[i])
    return sorted_arr

if __name__ == "__main__":
    arr_in = [6, 5, 18, 2, 16, 15, 19, 13, 10, 12, 7, 9, 4, 4, 8, 1, 11, 14, 3, 20, 17, 10]
    print(arr_in)
    arr_out = CountingSort(arr_in)
    print(arr_out)
```

时间复杂度：O(n + k)，其中n是数组的长度，k是数组中的最大值与最小值的差值
空间复杂度：O(n + k)

> ![image-20241021225923484](https://raw.githubusercontent.com/GMyhf/img/main/img/202410212259316.png)



### 3.9 桶排序$$(Bucket$$ $$Sort)$$

桶排序是一种排序算法，它假设输入是由一个随机过程产生的，该过程将元素均匀、独立地分布在[0, 1)区间上。

代码思路：

1. 创建一个定量的桶数组，并初始化每个桶为空。
2. 将每个元素放入对应的桶中。
3. 对每个非空桶进行排序。
4. 从每个桶中将排序后的元素依次取出，得到排序结果。

```python
def BucketSort(arr):
    n = len(arr)
    max_val = max(arr)
    min_val = min(arr)
    bucket_size = (max_val - min_val) / n

    buckets = [[] for _ in range(n+1)]

    for num in arr:
        index = int((num - min_val) // bucket_size)
        buckets[index].append(num)

    sorted_arr = []
    for bucket in buckets:
        sorted_arr.extend(sorted(bucket))

    return sorted_arr

if __name__ == "__main__":
    arr_in = [0.897, 0.565, 0.656, 0.1234, 0.665, 0.3434]
    print(arr_in)
    arr_out = BucketSort(arr_in)
    print(arr_out)

#[0.1234, 0.3434, 0.565, 0.656, 0.665, 0.897]
```

时间复杂度：$O(n + k)$，其中n是数组的长度，k是桶的数量
空间复杂度：$O(n)$



### 3.10 基数排序$$(Radix$$ $$Sort)$$

基数排序是一种非比较型整数排序算法，它通过按位处理数字来排序，通常用于处理非负整数。

基数排序是一种多关键字的排序算法，它将整数按位数切割成不同的数字，然后按每个位数分别比较。

代码思路：

1. 找出数组中最大值，并确定最大值的位数。
2. 使用计数排序或桶排序，根据当前位数进行排序。

```python
def RadixSort(arr):
    max_val = max(arr)
    digit = len(str(max_val))

    for i in range(digit):
        bucket = [[] for _ in range(10)]
        for num in arr:
            bucket[num // (10 ** i) % 10].append(num)
        # for row in bucket:
        #     print(*row)
        arr = [num for sublist in bucket for num in sublist]
        # arr = []
        # for sublist in bucket:
        #     for num in sublist:
        #         arr.append(num)
        #print(arr)

    return arr

if __name__ == "__main__":
    arr_in = [170, 45, 75, 90, 802, 24, 2, 66]
    print(arr_in)
    arr_out = RadixSort(arr_in)
    print(arr_out)
```

时间复杂度：$O(nk)$，其中n是数组的长度，k是最大值的位数
空间复杂度：$O(n + k)$

> **🧪 实际运行示例**
>
> 输入：`[170, 45, 75, 90, 802, 24, 2, 66]`
>
> 我们来模拟每一轮：
>
> **第 0 轮（i=0，按个位排序）**
>
> | 数字 | 个位 | 桶号 |
> | ---- | ---- | ---- |
> | 170  | 0    | 0    |
> | 45   | 5    | 5    |
> | 75   | 5    | 5    |
> | 90   | 0    | 0    |
> | 802  | 2    | 2    |
> | 24   | 4    | 4    |
> | 2    | 2    | 2    |
> | 66   | 6    | 6    |
>
> → 合并后：`[170, 90, 802, 2, 24, 45, 75, 66]`
>
> ---
>
> **第 1 轮（i=1，按十位排序）**
>
> | 数字    | 十位（num//10 % 10） |
> | ------- | -------------------- |
> | 170 → 7 |                      |
> | 90 → 9  |                      |
> | 802 → 0 |                      |
> | 2 → 0   |                      |
> | 24 → 2  |                      |
> | 45 → 4  |                      |
> | 75 → 7  |                      |
> | 66 → 6  |                      |
>
> → 桶分布：
>
> - bucket[0]: [802, 2]
> - bucket[2]: [24]
> - bucket[4]: [45]
> - bucket[6]: [66]
> - bucket[7]: [170, 75]
> - bucket[9]: [90]
>
> → 合并后：`[802, 2, 24, 45, 66, 170, 75, 90]`
>
> ---
>
> **第 2 轮（i=2，按百位排序）**
>
> | 数字    | 百位（num//100 % 10） |
> | ------- | --------------------- |
> | 802 → 8 |                       |
> | 2 → 0   |                       |
> | 24 → 0  |                       |
> | 45 → 0  |                       |
> | 66 → 0  |                       |
> | 170 → 1 |                       |
> | 75 → 0  |                       |
> | 90 → 0  |                       |
>
> → 桶分布：
>
> - bucket[0]: [2, 24, 45, 66, 75, 90]
> - bucket[1]: [170]
> - bucket[8]: [802]
>
> → 合并后：`[2, 24, 45, 66, 75, 90, 170, 802]`
>
> ✅ **排序完成！**
>
> ---
>
> ✅ 输出结果
>
> ```python
> [170, 45, 75, 90, 802, 24, 2, 66]
> [2, 24, 45, 66, 75, 90, 170, 802]
> ```
>
> 



# 四、单调栈（monotonic stack）

## 1 Stack in Python

https://www.geeksforgeeks.org/stack-in-python/

<img src="https://raw.githubusercontent.com/GMyhf/img/main/img/image-20231017141624213.png" alt="image-20231017141624213" style="zoom: 50%;" />

## 2 Monotonic Stack（单调栈）

单调栈是一种特殊的栈结构，其中的元素按照某种特定的顺序（如递增或递减）排列。在计算机科学中，单调栈常用于解决一类与数组或序列相关的优化问题，比如寻找下一个更大或更小的元素等。

**单调栈的应用场景**

1. **寻找下一个更大的元素**：给定一个数组，对于每个元素，找到它右边第一个比它大的元素的位置。这类问题可以使用单调递减栈来高效解决。
2. **寻找下一个更小的元素**：类似地，如果需要找到每个元素右边第一个比它小的元素的位置，则可以使用单调递增栈。
3. **直方图中的最大矩形**：这是一个经典的问题，涉及到计算直方图中最大的矩形面积，可以使用单调栈来有效求解。
4. **滑动窗口的最大值**：虽然这个问题通常使用双端队列来解决，但也可以通过单调栈的变形来处理。

**单调栈的工作原理**

- **入栈操作**：当一个新的元素需要加入到栈中时，根据栈的性质（递增或递减），将所有不符合条件的栈顶元素弹出，然后再将新元素压入栈中。
- **出栈操作**：通常情况下，出栈操作是自动发生的，即在执行入栈操作时，为了保持栈的单调性，会自动移除不满足条件的栈顶元素。

**实现示例**

这里以一个简单的例子说明如何使用单调栈来解决问题。假设我们需要找到数组 `[4, 5, 2, 25]` 中每个元素右边第一个更大的数。

```python
def next_greater_element(nums):
    stack = []
    result = [0] * len(nums)
    
    for i in range(len(nums)):
        # 当栈不为空且当前考察的元素大于栈顶元素时
        while stack and nums[i] > nums[stack[-1]]:
            index = stack.pop()
            result[index] = nums[i]
        # 将当前元素的索引压入栈中
        stack.append(i)
    
    # 对于栈中剩余的元素，它们没有更大的元素
    while stack:
        index = stack.pop()
        result[index] = -1
    
    return result

nums = [4, 5, 2, 25]
print(next_greater_element(nums))  # 输出: [5, 25, 25, -1]
```

在这个例子中，我们维护了一个单调递减的栈，当遇到比栈顶元素大的数时，就找到了栈顶元素的“下一个更大的数”，然后将其从栈中弹出，并记录结果。最后，对于那些在栈中没有匹配到更大数的元素，它们的结果设置为 `-1`，表示没有更大的数。



## 3 编程题目

### 练习04137: 最小新整数

stack, greedy, http://cs101.openjudge.cn/practice/04137/

给定一个十进制正整数n(0 < n < 1000000000)，每个数位上数字均不为0。n的位数为m。
现在从m位中删除k位(0<k < m)，求生成的新整数最小为多少？
例如: n = 9128456, k = 2, 则生成的新整数最小为12456

**输入**

第一行t, 表示有t组数据；
接下来t行，每一行表示一组测试数据，每组测试数据包含两个数字n, k。

**输出**

t行，每行一个数字，表示从n中删除k位后得到的最小整数。

样例输入

```
2
9128456 2
1444 3
```

样例输出

```
12456
1
```



```python
# 蒋子轩23工学院
def removeKDigits(num, k):
    stack = []
    for digit in num:
        while k and stack and stack[-1] > digit:
            stack.pop()
            k -= 1
        stack.append(digit)
    # 如果还未删除k位，从尾部继续删除
    while k:
        stack.pop()
        k -= 1
    return int(''.join(stack))
t = int(input())
results = []
for _ in range(t):
    n, k = input().split()
    results.append(removeKDigits(n, int(k)))
for result in results:
    print(result)
```



### 练习27205: 护林员盖房子 加强版

monotonic stack, http://cs101.openjudge.cn/pctbook/T27205/

在一片保护林中，护林员想要盖一座房子来居住，但他不能砍伐任何树木。
现在请你帮他计算：保护林中所能用来盖房子的矩形空地的最大面积。

**输入**
保护林用一个二维矩阵来表示，长宽都不超过1000（即<=1000）。
第一行是两个正整数m,n，表示矩阵有m行n列。
然后是m行，每行n个整数，用1代表树木，用0表示空地。

**输出**
一个正整数，表示保护林中能用来盖房子的最大矩形空地面积。



### 练习T26977: 接雨水

stack, dp, math, http://cs101.openjudge.cn/practice/26977/

给定 n 个非负整数表示每个宽度为 1 的柱子的高度图，计算按此排列的柱子，下雨之后能接多少雨水。

示例：

![img](https://raw.githubusercontent.com/GMyhf/img/main/img/1697427386.png)

height = [0,1,0,2,1,0,1,3,2,1,2,1]

由数组表示的高度图，在这种情况下，可以接 6 个单位的雨水（蓝色部分表示雨水）。

**输入**

第一行包含一个整数n。1 <= n <= 2 * 10^4
第二行包含n个整数，相邻整数间以空格隔开。0 <= ratings[i] <= 2 * 10^5

**输出**

一个整数



# 五、「滑动窗口最大值」三者合一


**「滑动窗口最大值」问题** ——这是三者（双指针 + 滑动窗口 + deque）完美结合的代表。

------

## 1 问题描述

给你一个数组 `nums` 和一个整数 `k`，请输出每个长度为 `k` 的子数组的最大值。

例如：

```python
nums = [1,3,-1,-3,5,3,6,7]
k = 3
输出: [3,3,5,5,6,7]
```

------

## 2 解法分层讲解

**第一层：双指针思路**

希望用两个指针维护一个区间 `[left, right)`：

- `right` 向右扩展窗口；
- `left` 根据需要右移缩小窗口；
- 每次窗口大小为 `k` 时，输出最大值。

但**暴力求最大值会 O(k)**，所以我们要想办法优化最大值维护。

------

**第二层：滑动窗口结构**

窗口的定义：
在任意时刻，`nums[left:right]` 就是当前窗口。

目标：
在每次窗口滑动一步时，**高效地** 得到最大值。
于是引入一个辅助结构来维护窗口内的最大值——这时 **`deque` 派上用场**。

------

**第三层：`deque` 维护单调性**

用一个 **单调递减队列**（里面放的是下标，不是值）：

- 当右端加入新元素时，**把所有比它小的元素都弹出**（因为它们永远不会再成为最大值）；
- 当左端元素滑出窗口时，如果它正好是队首，就把它弹出。

这样，队首元素始终是当前窗口的最大值。

------

## 3 最终代码示例

```python
from collections import deque

def maxSlidingWindow(nums, k):
    dq = deque()  # 存下标，保证对应值递减
    res = []
    for right, x in enumerate(nums):
        # step 1: 窗口右扩，保持单调递减
        while dq and nums[dq[-1]] <= x:
            dq.pop()
        dq.append(right)

        # step 2: 移除滑出窗口的左端元素
        if dq[0] <= right - k:
            dq.popleft()

        # step 3: 当窗口形成（长度 >= k）时，记录最大值
        if right >= k - 1:
            res.append(nums[dq[0]])
    return res

# ✅ 测试
print(maxSlidingWindow([1,3,-1,-3,5,3,6,7], 3))
# 输出: [3, 3, 5, 5, 6, 7]
```

------

## 4 三者关系图

```
          ┌──────────────┐
          │ 双指针思想   │ ←——— 两端遍历、定位区间
          └──────┬───────┘
                 │
                 ▼
          ┌──────────────┐
          │ 滑动窗口框架 │ ←——— 维护[left, right)
          └──────┬───────┘
                 │
                 ▼
          ┌──────────────┐
          │ deque结构辅助 │ ←——— 高效维护窗口最值
          └──────────────┘
```

------



✅ **一句话总结：**

> 在「滑动窗口最大值」中，
> **双指针**定义窗口边界，
> **滑动窗口**描述窗口动态，
> **deque**维护窗口内部的最优状态。



# 六、前缀和优化区域统计

**前缀和**（Prefix Sum）是一种用于高效计算数组区间和的预处理技术。

## 1 一维前缀和

给定数组 `A[0..n-1]`，其前缀和数组 `P` 定义为：

- `P[0] = 0`
- `P[i] = A[0] + A[1] + ... + A[i-1]`

这样，区间 `[l, r]` 的和可以快速计算为：`P[r+1] - P[l]`

## 2 二维前缀和

对于二维数组，前缀和扩展为**二维前缀和**。`prefix[i][j]` 表示从 `(0,0)` 到 `(i-1,j-1)` 矩形区域的元素和。

核心公式：

```
prefix[i][j] = matrix[i-1][j-1] + prefix[i-1][j] + prefix[i][j-1] - prefix[i-1][j-1]
```

> ```
> 当前格子 matrix[i-1][j-1] 这一格
> + 上边所有格 prefix[i-1][j]
> + 左边所有格 prefix[i][j-1]
> - 左上重复加两次的 prefix[i-1][j-1]
> ```
>
> 

查询矩形区域 `(x1,y1)` 到 `(x2,y2)` 的和：

```
sum = prefix[x2+1][y2+1] - prefix[x1][y2+1] - prefix[x2+1][y1] + prefix[x1][y1]
```

> 图示：
>
> ```
>       y1          y2
>        |           |
>        |           |
>        |           |
> x1 ----*-----------*
>        |   要的区域 |
> x2 ----*-----------*
> ```
>
> 整个 (0,0)→(x2,y2) 的大矩形，加减关系：
>
> - 减掉上方不要的区域
> - 减掉左侧不要的区域
> - 由于左上角被减了两次，需要加回来一次
>
> 



## 3 编程题目

### 练习M04133: 垃圾炸弹

matrices, http://cs101.openjudge.cn/pctbook/M04133/

2018年俄罗斯世界杯（2018 FIFA World Cup）开踢啦！为了方便球迷观看比赛，莫斯科街道上很多路口都放置了的直播大屏幕，但是人群散去后总会在这些路口留下一堆垃圾。为此俄罗斯政府决定动用一种最新发明——“垃圾炸弹”。这种“炸弹”利用最先进的量子物理技术，爆炸后产生的冲击波可以完全清除波及范围内的所有垃圾，并且不会产生任何其他不良影响。炸弹爆炸后冲击波是以正方形方式扩散的，炸弹威力（扩散距离）以d给出，表示可以传播d条街道。

例如下图是一个d=1的“垃圾炸弹”爆炸后的波及范围。

![img](https://raw.githubusercontent.com/GMyhf/img/main/img/1403230629.jpg)

假设莫斯科的布局为严格的1025*1025的网格状，由于财政问题市政府只买得起一枚“垃圾炸弹”，希望你帮他们找到合适的投放地点，使得一次清除的垃圾总量最多（假设垃圾数量可以用一个非负整数表示，并且除设置大屏幕的路口以外的地点没有垃圾）。

**输入**

第一行给出“炸弹”威力d(1 <= d <= 50)。第二行给出一个数组n(1 <= n <= 20)表示设置了大屏幕(有垃圾)的路口数目。接下来n行每行给出三个数字x, y, i, 分别代表路口的坐标(x, y)以及垃圾数量i. 点坐标(x, y)保证是有效的（区间在0到1024之间），同一坐标只会给出一次。

**输出**

输出能清理垃圾最多的投放点数目，以及能够清除的垃圾总量。

样例输入

```
1
2
4 4 10
6 6 20
```

样例输出

```
1 30
```





【夏子涵 元培学院】思路：用二维前缀和数组避免多次暴力循环

> 这是一个典型的“用前缀和优化区域统计”问题，适合练习二维前缀和的应用。

```python
def main():
    d = int(input().strip())
    n = int(input().strip())

    # 使用字典存储垃圾点，节省空间（稀疏数据时特别有效）
    moskow = {}
    max_coord = 1024
    min_coord = 0

    for _ in range(n):
        x, y, weight = map(int, input().strip().split())
        if (x, y) not in moskow:
            moskow[(x, y)] = 0
        moskow[(x, y)] += weight

    # 构建二维前缀和数组（只构建 [0..1024] 范围）
    size = max_coord + 1
    prefix = [[0] * (size + 1) for _ in range(size + 1)]  # prefix[0..1024+1][0..1024+1]

    for i in range(1, size + 1):
        for j in range(1, size + 1):
            # 注意：prefix[i][j] 对应坐标 (i-1, j-1)
            val = moskow.get((i - 1, j - 1), 0)
            prefix[i][j] = val + prefix[i - 1][j] + prefix[i][j - 1] - prefix[i - 1][j - 1]

    max_total = 0
    count = 0

    # 遍历所有可能的爆炸中心 (i, j)，范围 [0, 1024]
    for i in range(min_coord, max_coord + 1):
        for j in range(min_coord, max_coord + 1):
            # 计算爆炸影响区域 [x1, x2] × [y1, y2]
            x1 = max(min_coord, i - d)
            y1 = max(min_coord, j - d)
            x2 = min(max_coord, i + d)
            y2 = min(max_coord, j + d)

            # 查询前缀和：注意 prefix 是 1-indexed
            total = prefix[x2 + 1][y2 + 1] \
                    - prefix[x1][y2 + 1] \
                    - prefix[x2 + 1][y1] \
                    + prefix[x1][y1]

            if total > max_total:
                max_total = total
                count = 1
            elif total == max_total:
                count += 1

    print(count, max_total)


if __name__ == '__main__':
    main()
```



# 七、Kadane算法

## 1 理解 Kadane 算法（一维最大子数组和）

Kadane 算法用于解决“**最大子数组和**”问题，即在一个整数数组中找到连续子数组的最大和。

**算法思想：**

- `curr_max`：以当前元素结尾的最大连续和
- `total_max`：全局最大和

Python 实现：

```python
def kadane(arr):
    curr_max = total_max = arr[0]
    for x in arr[1:]:
        curr_max = max(x, curr_max + x)  # 要么重新开始，要么接上前面
        total_max = max(total_max, curr_max)
    return total_max
```

✅ 例子：`[-2, 1, -3, 4, -1, 2, 1, -5, 4]` → 最大子数组 `[4,-1,2,1]`，和为 `6`

------

## 2 扩展到二维 —— 最大子矩阵

将 Kadane 算法的思想扩展到二维：

**总体策略：**

1. 枚举所有可能的**上边界 `top`**
2. 对每个 `top`，枚举所有 `bottom >= top`
3. 对每一对 `(top, bottom)`，计算从第 `top` 行到第 `bottom` 行的**每列的累加和**，形成一个一维数组 `col_sum`
4. 在 `col_sum` 上运行 Kadane 算法，得到当前上下边界下的最大子矩阵和
5. 更新全局最大值

📊 **举例说明**

原矩阵：

```
0 -2 -7  0
9  2 -6  2   ← top=1
-4 1 -4  1
-1 8  0 -2   ← bottom=3
```

固定 `top=1`, `bottom=3`，计算每列的和：

- 第0列：9 + (-4) + (-1) = 4
- 第1列：2 + 1 + 8 = 11
- 第2列：-6 + (-4) + 0 = -10
- 第3列：2 + 1 + (-2) = 1

得到一维数组：`[4, 11, -10, 1]`

运行 Kadane：

- 最大子数组：`[4, 11]` 或 `[11]` → 和为 `15`

✅ 正好对应样例答案！



## 3 编程题目

### 练习M02766: 最大子矩阵

matrices, kadane, http://cs101.openjudge.cn/pctbook/M02766/

已知矩阵的大小定义为矩阵中所有元素的和。给定一个矩阵，你的任务是找到最大的非空(大小至少是1 * 1)子矩阵。

比如，如下4 * 4的矩阵

0 -2 -7 0
9 2 -6 2
-4 1 -4 1
-1 8 0 -2

的最大子矩阵是

9 2
-4 1
-1 8

这个子矩阵的大小是15。

**输入**

输入是一个N * N的矩阵。输入的第一行给出N (0 < N <= 100)。再后面的若干行中，依次（首先从左到右给出第一行的N个整数，再从左到右给出第二行的N个整数……）给出矩阵中的N2个整数，整数之间由空白字符分隔（空格或者空行）。已知矩阵中整数的范围都在[-127, 127]。

**输出**

输出最大子矩阵的大小。

样例输入

```
4
0 -2 -7 0 9 2 -6 2
-4 1 -4  1 -1

8  0 -2
```

样例输出

```
15
```

来源：翻译自 Greater New York 2001 的试题





```python
def kadane(s):
    curr_max = total_max = s[0]
    for x in s[1:]:
        curr_max = max(x, curr_max + x)
        total_max = max(total_max, curr_max)
    return total_max

def max_sum_matrix(mat):
    max_sum = -float('inf')
    row, col = len(mat), len(mat[0])
    for top in range(row):
        col_sum = [0] * col
        for bottom in range(top, row):
            for c in range(col):
                col_sum[c] += mat[bottom][c]
            max_sum = max(max_sum, kadane(col_sum))
    return max_sum

n = int(input())
nums = []
while len(nums) < n**2:
    nums.extend(input().split())
mat = [list(map(int, nums[i*n:(i+1)*n])) for i in range(n)]
print(max_sum_matrix(mat))
```

> 一、算法原理
>
> 二维最大子矩阵问题，可以通过「行压缩 + 一维 Kadane」解决。
>
> #### 思想：
>
> - 固定子矩阵的上边界 `top`
> - 固定子矩阵的下边界 `bottom`
> - 对每一列求“从 top 到 bottom 行的列和”
>   - 得到一个**一维数组 `col_sum`**
> - 对 `col_sum` 使用 **Kadane** 算法，求最大子数组和（相当于固定上下边界后，在列方向找到左右边界）
>
> #### 举例：
>
> ```
> 0 -2 -7 0
> 9  2 -6 2
> -4 1 -4 1
> -1 8  0 -2
> ```
>
> 比如 top=1, bottom=3，则
> col_sum = [9-4-1, 2+1+8, -6-4+0, 2+1-2] = [4, 11, -10, 1]
> → Kadane(col_sum) = 15，对应矩阵正是样例输出。
>
> ------
>
> 二、核心代码结构分析
>
> ```python
> def kadane(s):
>     curr_max = total_max = s[0]
>     for x in s[1:]:
>         curr_max = max(x, curr_max + x)
>         total_max = max(total_max, curr_max)
>     return total_max
> ```
>
> 一维 Kadane：
>
> - `curr_max` 表示“以当前元素结尾的最大连续和”；
> - `total_max` 表示“全局最大和”。
>
> ------
>
> ```python
> def max_sum_matrix(mat):
>     max_sum = -float('inf')
>     row, col = len(mat), len(mat[0])
>     for top in range(row):
>         col_sum = [0] * col
>         for bottom in range(top, row):
>             for c in range(col):
>                 col_sum[c] += mat[bottom][c]
>             max_sum = max(max_sum, kadane(col_sum))
>     return max_sum
> ```
>
> 外层 `top` 和 `bottom` 控制上下边界（O(n²)）；
> 内层 Kadane 处理列方向（O(n)）；
> 整体时间复杂度 **O(n³)**，适用于 N ≤ 100 的题目。
>
> ------
>
> 三、输入处理逻辑说明
>
> OJ 给的输入可能有空格和换行混合，所以正确做法是——
>
> > 不要逐行严格读取，而是一直读取直到获取 N² 个整数。
>
> ```python
> n = int(input())
> nums = []
> while len(nums) < n**2:
>     nums.extend(input().split())
> mat = [list(map(int, nums[i*n:(i+1)*n])) for i in range(n)]
> print(max_sum_matrix(mat))
> ```
>
> 四、扩展思考（可选优化）
>
> 1. **前缀和加速列和计算**
>    - 可以预先构建行方向前缀和 `prefix[r][c]`
>    - 使得 `col_sum[c] = prefix[bottom][c] - prefix[top-1][c]`
>    - 时间复杂度仍然 O(n³)，但常数项更小。
> 2. **全负数矩阵**
>    - Kadane 已正确处理（返回最大单个元素）。
> 3. **空间复杂度**
>    - O(n)，仅用到 `col_sum`。



这个问题是一个经典的“最大子矩阵和”问题，属于二维动态规划的应用场景。解决的核心思想是将二维问题降为多个一维的“最大子段和”问题（Kadane 算法），从而降低复杂度。

------

✅ 解题思路（二维 Kadane 变种）

1. 固定两个行索引 `top` 和 `bottom`，将这两行之间（包含）的矩阵压缩成一个一维数组 `temp_col_sum`，其中每个元素是这几行中该列的和。
2. 在这个一维数组上应用“最大子段和”算法（Kadane）求出最大和。
3. 枚举所有可能的 `top` 和 `bottom` 组合，更新全局最大值。

------

✅ 代码实现（Python）

```python
'''
为了找到最大的非空子矩阵，可以使用动态规划中的Kadane算法进行扩展来处理二维矩阵。
基本思路是将二维问题转化为一维问题：可以计算出从第i行到第j行的列的累计和，
这样就得到了一个一维数组。然后对这个一维数组应用Kadane算法，找到最大的子数组和。
通过遍历所有可能的行组合，我们可以找到最大的子矩阵。
'''
def max_submatrix(matrix, n):
    def kadane(arr):
      	# max_ending_here 用于追踪到当前元素为止包含当前元素的最大子数组和。
        # max_so_far 用于存储迄今为止遇到的最大子数组和。
        max_end_here = max_so_far = arr[0]
        for x in arr[1:]:
          	# 对于每个新元素，我们决定是开始一个新的子数组（仅包含当前元素 x），
            # 还是将当前元素添加到现有的子数组中。这一步是 Kadane 算法的核心。
            max_end_here = max(x, max_end_here + x)
            max_so_far = max(max_so_far, max_end_here)
        return max_so_far

    max_sum = float('-inf')

    for top in range(n):
        temp_col_num = [0] * n
        for bottom in range(top, n):
            for col in range(n):
                temp_col_num[col] += matrix[bottom][col]
            max_sum = max(max_sum, kadane(temp_col_num))
    return max_sum

# 输入处理
import sys
data = sys.stdin.read().split()
n = int(data[0])
numbers = list(map(int, data[1:]))
matrix = [numbers[i * n:(i + 1) * n] for i in range(n)]

max_sum = max_submatrix(matrix, n)
print(max_sum)
```

------

✅ 时间复杂度分析

- 外层双重循环（`top` 和 `bottom`）：O(n²)
- 内层 Kadane：O(n)
- 总体时间复杂度：**O(n³)**，对于 `n <= 100` 是可接受的。



# 八、前缀树Trie

**字典树（前缀树，Trie）**：<mark>字典树是一种树形数据结构，用于高效地存储和检索字符串数据集中的键</mark>。如果你使用嵌套的字典来表示字典树，其中每个字典代表一个节点，键表示路径上的字符，而值表示子节点，那么就构成了字典树。例如：

```python
trie = {
    'a': {
        'p': {
            'p': {
                'l': {
                    'e': {'is_end': True}
                }
            }
        }
    },
    'b': {
        'a': {
            'l': {
                'l': {'is_end': True}
            }
        }
    },
    'c': {
        'a': {
            't': {'is_end': True}
        }
    }
}
```

这样的表示方式使得我们可以非常高效地搜索和插入字符串，特别是在大型数据集上。

https://www.geeksforgeeks.org/trie-insert-and-search/

**Definition:** A trie (prefix tree, derived from retrieval) is a multiway tree data structure used for storing strings over an alphabet. It is used to store a large amount of strings. The pattern matching can be done efficiently using tries.

**字典（dict）式 Trie 风格**：使用字典实现的字典树。它的主要功能是插入和搜索字符串。





## 示例M208.实现Trie（前缀树）

OOP，字典树，https://leetcode.cn/problems/implement-trie-prefix-tree/

Trie（发音类似 "try"）或者说 **前缀树** 是一种树形数据结构，用于高效地存储和检索字符串数据集中的键。这一数据结构有相当多的应用情景，例如自动补全和拼写检查。

请你实现 Trie 类：

- `Trie()` 初始化前缀树对象。
- `void insert(String word)` 向前缀树中插入字符串 `word` 。
- `boolean search(String word)` 如果字符串 `word` 在前缀树中，返回 `true`（即，在检索之前已经插入）；否则，返回 `false` 。
- `boolean startsWith(String prefix)` 如果之前已经插入的字符串 `word` 的前缀之一为 `prefix` ，返回 `true` ；否则，返回 `false` 。

 

**示例：**

```
输入
["Trie", "insert", "search", "search", "startsWith", "insert", "search"]
[[], ["apple"], ["apple"], ["app"], ["app"], ["app"], ["app"]]
输出
[null, null, true, false, true, null, true]

解释
Trie trie = new Trie();
trie.insert("apple");
trie.search("apple");   // 返回 True
trie.search("app");     // 返回 False
trie.startsWith("app"); // 返回 True
trie.insert("app");
trie.search("app");     // 返回 True
```

 

**提示：**

- `1 <= word.length, prefix.length <= 2000`
- `word` 和 `prefix` 仅由小写英文字母组成
- `insert`、`search` 和 `startsWith` 调用次数 **总计** 不超过 `3 * 10^4` 次





```python
class Trie:

    def __init__(self):
        """
        初始化前缀树（Trie）
        使用嵌套字典结构存储节点
        每个节点是一个 dict，键为字符
        特殊键 "#" 表示一个单词的结束位置
        """
        self.root = {}             # Trie 的根节点，用字典表示
        self.end_of_word = "#"     # 特殊标记：表示该路径为一个单词的结束

    def insert(self, word: str) -> None:
        """
        将一个单词插入 Trie
        """
        node = self.root
        for char in word:
            # setdefault：若 char 存在返回已有节点；
            # 若不存在则创建一个空 dict 作为子节点并返回它
            node = node.setdefault(char, {})
        # 在单词末尾添加结束标记
        node[self.end_of_word] = self.end_of_word

    def search(self, word: str) -> bool:
        """
        判断一个完整单词是否在 Trie 中
        """
        node = self.root
        for char in word:
            # 如果任意字符不存在，说明该单词不存在
            if char not in node:
                return False
            node = node[char]
        # 需要检查结束标记，确保是完整单词而不是前缀
        return self.end_of_word in node

    def startsWith(self, prefix: str) -> bool:
        """
        判断是否存在以 prefix 为前缀的单词
        """
        node = self.root
        for char in prefix:
            # 若路径中缺字符，则没有这个前缀
            if char not in node:
                return False
            node = node[char]
        # 只需前缀完整，无需检查结束标记
        return True


if __name__ == "__main__":
    trie = Trie()
    trie.insert("apple")
    print(trie.search("apple"))   # True，完整单词
    print(trie.search("app"))     # False，只有前缀不是完整单词
    print(trie.startsWith("app")) # True，有单词以 app 开头
    trie.insert("app")
    print(trie.search("app"))     # True，此时 app 已插入


```



```
Help on method descriptor setdefault:

setdefault(self, key, default=None, /) unbound builtins.dict method
    Insert key with a value of default if key is not in the dictionary.

    Return the value for key if key is in the dictionary, else default.
```



重点在这句 node = node.setdefault(char, {}) 。之前我们用过dict里面嵌list，Trie就是dict里面嵌dict

29982:一种等价类划分问题，http://cs101.openjudge.cn/practice/29982

![089618f66c12919d84324fb9dd7268e7](https://raw.githubusercontent.com/GMyhf/img/main/img/089618f66c12919d84324fb9dd7268e7.png)



## 练习04089:电话号码

trie, http://cs101.openjudge.cn/practice/04089/

给你一些电话号码，请判断它们是否是一致的，即是否有某个电话是另一个电话的前缀。比如：

Emergency 911
Alice 97 625 999
Bob 91 12 54 26

在这个例子中，我们不可能拨通Bob的电话，因为Emergency的电话是它的前缀，当拨打Bob的电话时会先接通Emergency，所以这些电话号码不是一致的。

**输入**

第一行是一个整数t，1 ≤ t ≤ 40，表示测试数据的数目。
每个测试样例的第一行是一个整数n，1 ≤ n ≤ 10000，其后n行每行是一个不超过10位的电话号码。

**输出**

对于每个测试数据，如果是一致的输出“YES”，如果不是输出“NO”。

样例输入

```
2
3
911
97625999
91125426
5
113
12340
123440
12345
98346
```

样例输出

```
NO
YES
```





**最优解（不需要Trie）**：排序+相邻比较。<mark>排序后所有前缀关系只可能出现在相邻元素之间</mark>。

```python
t = int(input())
for _ in range(t):
 n = int(input())
 nums = [input().strip() for _ in range(n)]
 nums.sort()                           # 字典序排序

 ok = True
 for i in range(n-1):
     # 如果前一个是后一个的前缀 → 冲突
     if nums[i+1].startswith(nums[i]):
         ok = False
         break

 print("YES" if ok else "NO")

```





**字典（dict）式 Trie 风格**，逻辑：

- 插入号码时，如果你的路径上遇到“终止标记”，则表示已有短号码是你的前缀 → 冲突
- 插入完毕后，如果你自己是前缀（有子节点）→ 冲突

⚠️：如果有重复号码存在，→ 冲突

```python
class Trie:
    def __init__(self):
        # 整棵 Trie 用一棵嵌套字典表示
        self.root = {}
        # 使用特殊字符 "#" 表示某个号码的结束位置（相当于 end = True）
        self.END = "#"

    def insert_and_check(self, word: str) -> bool:
        """
        插入号码并检查是否产生前缀冲突。
        返回 True = 插入成功（无冲突）
        返回 False = 有冲突
        """
        node = self.root

        for char in word:
            # 情况1：路径上遇到结束标记 -> 有较短号码是当前号码的前缀
            if self.END in node:
                return False

            # 若不存在，则自动创建新分支
            node = node.setdefault(char, {})

        # 走到 word 末尾：

        # 情况2：完全相同的号码已存在（重复号码） -> 冲突
        if self.END in node:
            return False

        # 情况3：当前号码是已有更长号码的前缀（因为 node 下面还有子节点）
        if node:
            return False

        # 标记该号码的结束
        node[self.END] = True
        return True


if __name__ == "__main__":
    import sys
    input = sys.stdin.readline

    t = int(input().strip())
    for _ in range(t):
        n = int(input().strip())
        nums = [input().strip() for _ in range(n)]

        # 升序排序，让短号码优先插入
        nums.sort()

        trie = Trie()
        ok = True
        for num in nums:
            if not trie.insert_and_check(num):
                ok = False
                break

        print("YES" if ok else "NO")


```





前缀树算法是 online 的；而先排序再找前缀的方法是 offline 的。

------

✅ 总结

| 方法            | 是否 Online | 是否需要预知全部数据 | 是否支持动态插入 | 时间复杂度（单次操作）          |
| --------------- | ----------- | -------------------- | ---------------- | ------------------------------- |
| 前缀树（Trie）  | ✅ 是        | ❌ 否                 | ✅ 是             | $O(L)$                          |
| 排序 + 前缀检查 | ❌ 否        | ✅ 是                 | ❌ 否             | $O(N \log N)$ 预处理 + 查询较慢 |







# 九、拓扑排序理解

## 练习T25353: 排队

greedy, http://cs101.openjudge.cn/practice/25353

有 N 名同学从左到右排成一排，第 i 名同学的身高为 hi。现在张老师想改变排队的顺序，他能进行任意多次（包括0次）如下操作：

\- 如果两名同学相邻，并且他们的身高之差不超过 D，那么老师就能交换他俩的顺序。

请你帮张老师算一算，通过以上操作，字典序最小的所有同学（从左到右）身高序列是什么？

**输入**

第一行包含两个正整数 N, D (1<=N<=105, 1<=D<=109)。
接下去 N 行，每行一个正整数 hi (1<=hi<=109) 表示从左到右每名同学的身高。

**输出**

输出 N 行，第 i 行表示答案中第 i 名同学的身高。

样例输入

```
5 3
7
7
3
6
2
```

样例输出

```
6
7
7
2
3
```

提示

【样例解释】
一种交换位置的过程如下：
`7 7 3 6 2-> 7 7 6 3 2-> 7 7 6 2 3-> 7 6 7 2 3-> 6 7 7 2 3`

【数据范围和约定】
对于 10% 的数据，满足 N<=100；
对于另外 20% 的数据，满足 N<=5000；
对于全部数据，满足 1<=N<=10^5, 1<=D<=10^9, 1<=hi<=10^9。



<mark>是借用拓扑排序来帮助理解解题思路，感觉这样说的更清楚。</mark>

拓扑排序（Topological Sorting）是一种对**有向无环图**（DAG, Directed Acyclic Graph）中的顶点进行线性排序的算法，使得对于图中的每一条有向边 (*u*→*v*)，顶点 *u* 在排序结果中都出现在顶点 *v* 的前面。

> 计算机专业的学生可能会有这样的疑惑：自己需要学习哪些课程才能获得学位呢？图可以很好地表示课程之间的依赖关系。图展示了要获得计算机科学学位，所需学习课程的先后顺序。
>
> 
>
> <img src="https://raw.githubusercontent.com/GMyhf/img/main/img/CS-Prereqs.png" alt="../_images/CS-Prereqs.png" style="zoom:67%;" />
>
> <center>图 计算机课程的学习顺序</center>



拓扑排序算法是：**不断找出入度为 0 的节点**（即没有前置依赖的节点），将其加入结果序列，并从图中移除该节点及其出边，重复此过程直到所有节点都被处理。

> **度Degree**，顶点的度是指和该顶点相连的边的条数。特别是对于有向图来说，顶点的出边条数称为该顶点的出度，顶点的入边条数称为该顶点的入度。有向图例子中，CS-151的出度为 2、入度为 1。

借用拓扑排序来理解解题思路：如果无法交换顺序，就连一条边。

对于样例数据，构建约束 7→3, 6→2，此时节点`3、2`的入度是1，节点`7、7、6`入度为0，所以第一轮挑出`7、7、6`，把他们按升序排序放到结果中。移除他们对应的（表示他们的相对顺序已确定），则新产生的入度为0的节点 `3、2`，成为下一轮可以处理的组。



是的✅，你这样用“拓扑排序”来类比这个题的逻辑，是**非常巧妙且正确的理解方式**。
 虽然题目本质是“可交换区间的连通分量 + 排序”，但用拓扑排序的“入度=0 → 可以先排”来理解交换依赖，直观且形象。

**💡 拓扑排序类比讲解版**

**1️⃣ 把“相邻可交换”看作一种依赖关系**

- 如果两名同学**相邻且差值 ≤ D**，他们之间是“可互换”的——相当于**没有约束边**。
- 如果两名同学**相邻且差值 > D**，他们之间是“不可交换”的——相当于**有一条有向约束边**，方向从左指向右。

也就是说：

> “如果 A、B 不能交换”，就画一条 A → B 的边，表示 B 必须出现在 A 之后。

------

**2️⃣ 把整个队伍看作一个有向图**

- 节点：每个同学的身高。
- 边：相邻且**不可交换**的约束（例如差值 > D）。

这样：

- 入度为 0 的节点，就是**当前没有任何左侧约束的同学**，他们可以排在最前面。
- 每次挑出所有入度为 0 的节点，把他们**按升序排序**放到结果中；
- 然后移除他们对应的边（表示他们的相对顺序已确定）；
- 新产生的入度为 0 的节点，成为下一轮可处理的组。

------

**3️⃣ 对样例的“拓扑化”解释**

输入：

```
7, 7, 3, 6, 2
D = 3
```

构建约束：

- `7 -> 3` （|7-3|=4>3，不可交换）
- `6 -> 2` （|6-2|=4>3，不可交换）

因此图中边是：

```
7 -> 3
6 -> 2
```

初始入度情况：

| 身高 | 入度 |
| ---- | ---- |
| 7    | 0    |
| 7    | 0    |
| 6    | 0    |
| 3    | 1    |
| 2    | 1    |

------

**4️⃣ “拓扑排序过程”模拟**

**第 1 轮**：
 入度 0 → `7, 7, 6`
 → 取出并按升序输出 `[6, 7, 7]`

移除对应边：
 `7->3`、`6->2` 被移除后，3、2 入度都变为 0。

**第 2 轮**：
 入度 0 → `3, 2`
 → 取出并按升序输出 `[2, 3]`

拼接结果：

```
[6, 7, 7, 2, 3]
```

------

5️⃣ **总结这种理解的意义**

| 角度         | 含义                                 |
| ------------ | ------------------------------------ |
| 原问题       | 相邻可交换操作产生的最小字典序       |
| 拓扑排序类比 | 有向图上分层选出“当前可移动的节点”   |
| 入度=0       | 没有被左侧约束住，可以自由移动的同学 |
| 分层输出     | 按组排序的贪心策略                   |
| 实际实现     | 分组 + 各组排序                      |

------

✅ **结论**

> ✅ 你的那段话逻辑是 **完全正确的拓扑类比描述**。
>
> 它很好地刻画了“哪些人能先移动”与“哪些人被左侧卡住”的关系，
> 且能直观解释为什么要分组排序（就是拓扑层的输出顺序）。



# End

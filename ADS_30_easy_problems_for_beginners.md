# 零基础 Python 入门：30 道练手题

*2026-09-12，选自 [ADS_problem_list_at_2026fall.md](./ADS_problem_list_at_2026fall.md)*

## 入门方案

1. **先学语法（几个小时）**：[菜鸟教程 Python3](https://www.runoob.com/python3/python3-tutorial.html)，按左侧目录学到“函数”为止。重点看：基础语法、数据类型、运算符、数字、字符串、列表、（元组、字典略读）、条件控制、循环语句、函数。
2. **再做 30 道题（边做边查）**：按下面的顺序做。碰到不会的语法，回教程查对应章节，**做题是为了补语法，不是为了学算法**。
3. 题解：https://fuynaloft.github.io/sol101/

---

## 选题原则：为什么是这 30 道

每日选作目前有 40 多道题，其中一部分对零基础同学来说太早了。这次挑题按下面几条来：

| 原则 | 说明 |
| ---- | ---- |
| **只考语法，不考算法** | 用 `input/print`、`if`、`for/while`、字符串、列表、`sort` 就能做出来，不需要贪心、二分、滑动窗口、位运算技巧 |
| **难度最低档** | Codeforces 800~1000 分、OpenJudge / LeetCode 标为 Easy、洛谷“入门”、晴问“入门/简单” |
| **题意短、数据小** | 读题不费劲，不用考虑超时，暴力写法就能过 |
| **一题对应一个语法点** | 做题顺序和教程顺序一致：输入输出 → 分支 → 循环 → 字符串 → 列表 → 排序 |
| **三个平台都碰一下** | OpenJudge、Codeforces 读标准输入（`input()`）；LeetCode 要补全函数（`def`）。两种写法都熟悉，正好练到“函数” |

### 暂时没选的题（等学完基础再做）

| 题目 | 原因 |
| ---- | ---- |
| M763 划分字母区间、M2904 最短且字典序最小的美丽子字符串 | 贪心 / 双指针 / 滑动窗口，属于算法题 |
| M2126 摧毁小行星 | 贪心，需要先想清楚为什么排序后可行 |
| M29917 牛顿迭代 | 需要数学背景和浮点精度处理 |
| 20B Equation | 1500 分，一元二次方程分类讨论多、容易错 |
| P1100 高低位交换、E136 只出现一次的数字 | 最佳解法用位运算，零基础不容易想到 |
| E18223 24 点 | 要枚举所有运算组合，循环嵌套层数多 |
| E23563 多项式时间复杂度 | 字符串解析，边界情况多（如 `n^1`、系数为 0） |
| E18161 矩阵运算 | 二维列表 + 三重循环，适合学完列表后作为进阶题 |
| 31180 学生数据统计分析、31185 一道题搞懂内置排序函数 | Medium，综合性强，适合作为这 30 题的“毕业题” |

---

## 30 道题（按学习顺序）

### 第 0 关：输入与输出（4 题）
> 对应教程：基础语法、输入和输出

| # | 题目 | 平台 | 难度 | 练习点 |
| - | ---- | ---- | ---- | ------ |
| 1 | [sy1: Hello Sunny Why!](https://sunnywhy.com/sfbj/2/1) | 晴问 | 入门 | `print` 第一个程序 |
| 2 | [P1001 A+B Problem](https://www.luogu.com.cn/problem/P1001) | 洛谷 | 入门 | `input().split()`、`int()`、`map` |
| 3 | [31183: 一道题搞懂输入](http://cs101.openjudge.cn/practice/31183/) | OpenJudge | Easy | 各种输入格式：一行多个数、多行、不定行 |
| 4 | [31184: 一道题搞懂输出](http://cs101.openjudge.cn/practice/31184/) | OpenJudge | Easy | f-string、保留小数、`sep`/`end` |

### 第 1 关：运算与分支（6 题）
> 对应教程：运算符、数字、条件控制

| # | 题目 | 平台 | 难度 | 练习点 |
| - | ---- | ---- | ---- | ------ |
| 5 | [E02733: 判断闰年](http://cs101.openjudge.cn/pctbook/E02733/) | OpenJudge | Easy | `if/else`、`%`、`and/or` |
| 6 | [E02750: 鸡兔同笼](http://cs101.openjudge.cn/pctbook/E02750) | OpenJudge | Easy | 整除 `//`、奇偶判断 |
| 7 | [4A. Watermelon](https://codeforces.com/problemset/problem/4/A) | Codeforces | 800 | 分支，注意 `w = 2` 的特殊情况 |
| 8 | [50A. Domino piling](http://codeforces.com/problemset/problem/50/A) | Codeforces | 800 | 一行公式 |
| 9 | [1A. Theatre Square](http://codeforces.com/problemset/problem/1/A) | Codeforces | 1000 | 向上取整 `(n + a - 1) // a` |
| 10 | [200B. Drinks](https://codeforces.com/problemset/problem/200/B) | Codeforces | 800 | 列表求和、浮点输出 |

### 第 2 关：循环（7 题）
> 对应教程：循环语句（`for`、`while`、`range`、`break`）

| # | 题目 | 平台 | 难度 | 练习点 |
| - | ---- | ---- | ---- | ------ |
| 11 | [sy875: 逃离魔法塔底](https://sunnywhy.com/sfbj/2/4/875) | 晴问 | 简单 | 循环入门 |
| 12 | [E02676: 整数的个数](http://cs101.openjudge.cn/pctbook/E02676/) | OpenJudge | Easy | 遍历 + 计数 |
| 13 | [231A. Team](http://codeforces.com/problemset/problem/231/A) | Codeforces | 800 | 循环读多行、`sum` |
| 14 | [158A. Next Round](http://codeforces.com/problemset/problem/158/A) | Codeforces | 800 | 列表下标，注意分数必须 > 0 |
| 15 | [E01003: Hangover](http://cs101.openjudge.cn/pctbook/E01003/) | OpenJudge | Easy | `while` 循环、多组输入直到 0.00 |
| 16 | [E04138: 质数的和与积](http://cs101.openjudge.cn/pctbook/E04138/) | OpenJudge | Easy | 写一个 `is_prime` 函数 |
| 17 | [E03143: 验证“歌德巴赫猜想”](http://cs101.openjudge.cn/pctbook/E03143/) | OpenJudge | Easy | 复用 `is_prime`，循环枚举 |

### 第 3 关：字符串与模拟（4 题）
> 对应教程：字符串、循环嵌套

| # | 题目 | 平台 | 难度 | 练习点 |
| - | ---- | ---- | ---- | ------ |
| 18 | [112A. Petya and Strings](http://codeforces.com/problemset/problem/112/A) | Codeforces | 800 | `lower()`、字符串比较 |
| 19 | [E02689: 大小写字母互换](http://cs101.openjudge.cn/pctbook/E02689/) | OpenJudge | Easy | `swapcase()` 或逐字符判断 |
| 20 | [E01218: THE DRUNK JAILER](http://cs101.openjudge.cn/pctbook/E01218/) | OpenJudge | Easy | 双重循环模拟（能找到规律更好） |
| 21 | [E191. 位1的个数](https://leetcode.cn/problems/number-of-1-bits/) | LeetCode | Easy | `bin()` 转字符串 + `count()`；第一次写 `class Solution` |

### 第 4 关：列表（6 题）
> 对应教程：列表、函数

| # | 题目 | 平台 | 难度 | 练习点 |
| - | ---- | ---- | ---- | ------ |
| 22 | [263A. Beautiful Matrix](https://codeforces.com/problemset/problem/263/A) | Codeforces | 800 | 读 5 行、找 1 的位置、`abs` |
| 23 | [E66. 加一](https://leetcode.cn/problems/plus-one/) | LeetCode | Easy | 列表倒序遍历（或转成整数再转回来） |
| 24 | [E3622. 判断整除性](https://leetcode.cn/problems/check-divisibility-by-digit-sum-and-product/) | LeetCode | Easy | 拆数位：`str(n)` 或 `% 10` |
| 25 | [E3718. 缺失的最小倍数](https://leetcode.cn/problems/smallest-missing-multiple-of-k/) | LeetCode | Easy | `in` 判断、`while` |
| 26 | [1. 两数之和](https://leetcode.cn/problems/two-sum/) | LeetCode | Easy | 双重循环暴力即可；学完字典再试一遍哈希写法 |
| 27 | [E35. 搜索插入位置](https://leetcode.cn/problems/search-insert-position/) | LeetCode | Easy | 从头扫一遍即可；二分查找以后再学 |

### 第 5 关：排序（3 题）
> 对应教程：列表 `sort()`、`sorted()`，字典（简单了解）

| # | 题目 | 平台 | 难度 | 练习点 |
| - | ---- | ---- | ---- | ------ |
| 28 | [34B. Sale](https://codeforces.com/problemset/problem/34/B) | Codeforces | 900 | `sort()` 后取前 m 个负数 |
| 29 | [E07618: 病人排队](http://cs101.openjudge.cn/pctbook/E07618) | OpenJudge | Easy | 按条件分组、`sorted(key=...)` |
| 30 | [E1331. 数组序号转换](https://leetcode.cn/problems/rank-transform-of-an-array/) | LeetCode | Easy | 排序 + 去重 + 字典映射 |

做完 30 题后，可以挑战：[31185 一道题搞懂内置排序函数](http://cs101.openjudge.cn/practice/31185/)、[31180 学生数据统计分析](http://cs101.openjudge.cn/practice/31180/)、[E18161 矩阵运算](http://cs101.openjudge.cn/pctbook/E18161/)。

---

## 备用题：Codeforces 800 分经典入门题

某一关如果做得吃力，可以先在这里找同类型的题多练几道。

| 题目 | 练习点 |
| ---- | ------ |
| [71A. Way Too Long Words](https://codeforces.com/problemset/problem/71/A) | 字符串长度、切片 |
| [282A. Bit++](https://codeforces.com/problemset/problem/282/A) | 字符串包含判断 |
| [236A. Boy or Girl](https://codeforces.com/problemset/problem/236/A) | `set` 去重 |
| [281A. Word Capitalization](https://codeforces.com/problemset/problem/281/A) | 字符串切片、`upper()` |
| [266A. Stones on the Table](https://codeforces.com/problemset/problem/266/A) | 相邻字符比较 |
| [339A. Helpful Maths](https://codeforces.com/problemset/problem/339/A) | `split('+')`、排序、`join` |
| [116A. Tram](https://codeforces.com/problemset/problem/116/A) | 循环累加、求最大值 |
| [617A. Elephant](https://codeforces.com/problemset/problem/617/A) | 向上取整 |
| [791A. Bear and Big Brother](https://codeforces.com/problemset/problem/791/A) | `while` 循环 |
| [977A. Wrong Subtraction](https://codeforces.com/problemset/problem/977/A) | 循环 + 分支 |
| [546A. Soldier and Bananas](https://codeforces.com/problemset/problem/546/A) | 等差求和、`max` |
| [734A. Anton and Danik](https://codeforces.com/problemset/problem/734/A) | `count()` 计数 |

---

## 给零基础同学的建议

1. **别等“学完”再做题。** 教程学到“函数”就开始做，大部分语法是做题时现查学会的。
2. **先把输入模板写熟。** 零基础同学最常见的错误是读错输入，不是算法写错：
   ```python
   n = int(input())                       # 一行一个整数
   a, b = map(int, input().split())       # 一行两个整数
   nums = list(map(int, input().split())) # 一行多个整数
   s = input().strip()                    # 一行字符串
   ```
3. **分清两种题型。** OpenJudge / Codeforces 要自己 `input()` 和 `print()`；LeetCode 只补全 `class Solution` 里的函数，用 `return` 返回结果，**不要写 `input()`**。
4. **看懂评测结果。** `WA`（答案错误）：检查边界和输出格式；`RE`（运行错误）：多半是下标越界或类型没转换；`TLE`（超时）：这 30 题基本不会碰到，碰到了说明循环写错了。
5. **卡住 20~30 分钟再看题解。** 看懂以后**关掉题解自己重写一遍**，直到 AC。只看不写等于没做。
6. **把 AI 当老师，不当代笔。** 可以让 AI 解释报错信息、讲某个语法点，或者帮你找 bug；别让它直接写完整代码。机考时没有 AI。
7. **写能跑的代码就行，不追求“优雅”。** 暴力、啰嗦都没关系，先 AC。AC 以后再看题解里更简洁的写法，学一两个新技巧。
8. **每题记一行笔记。** 例如“`round` 不一定四舍五入，保留小数用 `f'{x:.2f}'`”。30 题下来，就是自己的一份语法速查表。
9. **节奏参考。** 每天 3~5 题，一到两周做完。比一天做 20 题然后停一周效果好得多。

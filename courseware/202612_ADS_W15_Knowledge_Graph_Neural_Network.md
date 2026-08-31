# 第15周 知识图谱、神经网络等 AI 专题

*Updated 2026-08-31 GMT+8*
 *Compiled by Hongfei Yan (2026 Fall)*
https://github.com/GMyhf/2026fall-cs101

> **课程安排对应**：第 15-16 周
> **主题与学习重点**：知识图谱、神经网络等 AI 专题；课程知识体系总结与期末复习。
> **本周侧重**：知识图谱与神经网络等 AI 专题（第 16 周做课程总结与期末上机考试）。

**知识点**：知识图谱的三元组表示与图查询、实体链接与多跳推理、检索增强生成（RAG）的基本流程、感知机与激活函数、前向传播、损失函数、梯度下降与反向传播、手写一个能学会 XOR 的神经网络、卷积与池化、从本课到大模型的路径。

---

# 1 知识图谱

## 1.1 三元组：知识的最小单位

知识图谱把知识表示成 **(主语, 谓语, 宾语)** 的三元组：

```
   (图灵, 提出, 图灵机)
   (图灵机, 属于, 计算模型)
   (冯·诺依曼, 提出, 存储程序结构)
   (计算概论B, 先修于, 数据结构与算法)
```

画成图：**实体是顶点，关系是带标签的有向边**。

```
      图灵 ──提出──► 图灵机 ──属于──► 计算模型
                        ▲
   冯·诺依曼 ──提出──► 存储程序结构
```

> **认出来了吗**——这就是第 12 周的**有向图**。知识图谱的查询、推理，
> 用的全是本课已经讲过的图算法。

## 1.2 用 Python 建一个小知识图谱

```python
from collections import defaultdict, deque


class KnowledgeGraph:
    """三元组存储 + 正反向索引，支持单跳查询与多跳推理。"""

    def __init__(self):
        self.out = defaultdict(list)      # 主语 -> [(谓语, 宾语)]
        self.inn = defaultdict(list)      # 宾语 -> [(谓语, 主语)]
        self.triples = []

    def add(self, s, p, o):
        self.triples.append((s, p, o))
        self.out[s].append((p, o))
        self.inn[o].append((p, s))

    def query(self, s=None, p=None, o=None):
        """三元组模式匹配，None 表示通配。"""
        return [t for t in self.triples
                if (s is None or t[0] == s)
                and (p is None or t[1] == p)
                and (o is None or t[2] == o)]

    def neighbors(self, node):
        """无向意义上的邻居（用于多跳推理）。"""
        return ([o for _, o in self.out[node]]
                + [s for _, s in self.inn[node]])

    def path(self, src, dst):
        """最短关系路径（BFS）——就是第 12 周的模板。"""
        if src == dst:
            return [src]
        prev = {src: None}
        q = deque([src])
        while q:
            cur = q.popleft()
            for nxt in self.neighbors(cur):
                if nxt in prev:
                    continue
                prev[nxt] = cur
                if nxt == dst:
                    out = [dst]
                    while prev[out[-1]] is not None:
                        out.append(prev[out[-1]])
                    return out[::-1]
                q.append(nxt)
        return []


kg = KnowledgeGraph()
for t in [("图灵", "提出", "图灵机"),
          ("图灵机", "属于", "计算模型"),
          ("冯诺依曼", "提出", "存储程序结构"),
          ("存储程序结构", "属于", "计算机体系结构"),
          ("现代计算机", "基于", "存储程序结构"),
          ("现代计算机", "等价于", "图灵机")]:
    kg.add(*t)

print(kg.query(s="图灵"))                 # [('图灵', '提出', '图灵机')]
print(kg.query(p="属于"))
print(kg.path("图灵", "现代计算机"))       # ['图灵', '图灵机', '现代计算机']
```

## 1.3 多跳推理

单跳是"查表"，**多跳才是"推理"**：

> 问：**图灵和现代计算机有什么关系？**
> 答：图灵 →提出→ 图灵机 ←等价于← 现代计算机。

这正是上面 `path()` 做的事——**BFS 求最短关系路径**。
真实系统里还会给边加权（关系的可信度），那就变成 **Dijkstra**。

## 1.4 从知识图谱到 RAG

大模型的两个短板：**知识有截止时间**、**会编**。
**检索增强生成（RAG, Retrieval-Augmented Generation）** 用外部知识库补上：

```
   用户提问
      │
      ▼
   ①检索：在知识库里找出最相关的若干段落
      │        （倒排索引 / 向量检索 / 知识图谱查询）
      ▼
   ②拼装：把检索到的内容放进提示词，作为"参考材料"
      │
      ▼
   ③生成：让模型基于这些材料回答，并要求标注出处
```

**最简单的检索：词频打分**

```python
import math
from collections import Counter


def build_index(docs):
    """倒排索引：词 -> [文档编号]。"""
    index = defaultdict(set)
    for i, doc in enumerate(docs):
        for w in doc.split():
            index[w].add(i)
    return index


def score(query, docs, index):
    """一个极简的 TF-IDF 打分。"""
    n = len(docs)
    scores = [0.0] * n
    for w in query.split():
        hits = index.get(w, set())
        if not hits:
            continue
        idf = math.log(n / len(hits)) + 1        # 出现在越少文档里，权重越高
        for i in hits:
            tf = Counter(docs[i].split())[w] / len(docs[i].split())
            scores[i] += tf * idf
    return scores


docs = [
    "图灵机 是 一种 计算模型",
    "冯诺依曼 结构 是 现代 计算机 的 基础",
    "动态规划 是 一种 算法 设计 方法",
]
idx = build_index(docs)
s = score("计算模型 图灵机", docs, idx)
print([f"{v:.3f}" for v in s])          # 文档 0 得分最高
best = max(range(len(docs)), key=lambda i: s[i])
print(docs[best])                        # 图灵机 是 一种 计算模型
```

> **小北智学的 AI 助教就是一个 RAG 系统**：课程知识库（教材、课件、题解）是检索源，
> 所以它回答课程内容比通用模型准。但**课程事务仍以教师通知为准**——
> 知识库里没有的东西，它照样会编。

---

# 2 神经网络

## 2.1 感知机：一个神经元

```
   x₁ ──w₁──┐
   x₂ ──w₂──┼──► Σ (加权求和 + 偏置 b) ──► σ (激活函数) ──► y
   x₃ ──w₃──┘
```

```python
import math


def sigmoid(x):
    return 1.0 / (1.0 + math.exp(-x))


def neuron(inputs, weights, bias):
    z = sum(x * w for x, w in zip(inputs, weights)) + bias
    return sigmoid(z)


# 手工设定权重，让它实现逻辑与 AND
print(round(neuron([0, 0], [20, 20], -30), 4))   # 0.0
print(round(neuron([1, 0], [20, 20], -30), 4))   # 0.0
print(round(neuron([1, 1], [20, 20], -30), 4))   # 1.0
```

## 2.2 激活函数：为什么必须非线性

**若没有激活函数，多层网络等价于单层**——
因为线性变换的复合还是线性变换，叠多少层都只能画一条直线。

| 函数 | 公式 | 特点 |
| ---- | ---- | ---- |
| Sigmoid | 1/(1+e⁻ˣ) | 输出 (0,1)，用于二分类；深层易梯度消失 |
| Tanh | (eˣ−e⁻ˣ)/(eˣ+e⁻ˣ) | 输出 (−1,1)，零中心 |
| **ReLU** | max(0, x) | **最常用**：计算快、缓解梯度消失 |
| Softmax | eˣⁱ/Σeˣʲ | 多分类的输出层，给出概率分布 |

```python
def relu(x):
    return x if x > 0 else 0.0


def softmax(xs):
    m = max(xs)
    exps = [math.exp(x - m) for x in xs]
    total = sum(exps)
    return [e / total for e in exps]


print([relu(v) for v in (-2, -0.5, 0, 3)])       # [0.0, 0.0, 0.0, 3]
print([f"{v:.3f}" for v in softmax([1.0, 2.0, 3.0])])
# ['0.090', '0.245', '0.665']
```

**XOR 问题**：单个感知机画不出 XOR 的分界（它不是线性可分的），必须**加一个隐藏层**。
这就是 1969 年 Minsky 指出的问题，也是"深度"的必要性来源。

```
   XOR:  (0,0)->0   (0,1)->1   (1,0)->1   (1,1)->0

     x₂
      1 │  ●(1)      ○(0)
        │
      0 │  ○(0)      ●(1)
        └────────────────► x₁
           0          1
     一条直线分不开 ● 和 ○
```

## 2.3 前向传播、损失与梯度下降

**前向传播**：输入 → 逐层加权求和 + 激活 → 输出。

**损失函数**衡量"预测离真值有多远"：

```python
def mse(pred, target):
    """均方误差。"""
    return sum((p - t) ** 2 for p, t in zip(pred, target)) / len(pred)


print(mse([0.9, 0.1], [1.0, 0.0]))     # 0.009999999999999998（即 0.01，浮点表示）
```

**梯度下降**：沿损失下降最快的方向调整参数。

```python
def gradient_descent_demo():
    """最小化 f(w) = (w - 3)^2，导数 f'(w) = 2(w - 3)。"""
    w, lr = 0.0, 0.1
    for step in range(30):
        grad = 2 * (w - 3)
        w -= lr * grad
    return w


print(f"{gradient_descent_demo():.4f}")     # 2.9963 —— 收敛到最优 w=3
```

**学习率 lr**：太小收敛慢，太大会震荡甚至发散。**这是最重要的超参数。**

## 2.4 反向传播：链式法则

网络有很多层参数，怎么知道每个参数该往哪调？**链式法则**：

```
   ∂Loss/∂w₁ = (∂Loss/∂y) · (∂y/∂z) · (∂z/∂w₁)
                  ↑            ↑           ↑
               损失对输出   激活函数导数  加权和对权重
```

从输出层往回逐层相乘——所以叫"**反向**传播"。

> **它其实就是本课的动态规划**：每层的梯度由后一层的梯度推出来，
> 中间结果存下来复用——**最优子结构 + 重叠子问题**，一模一样。

## 2.5 从零手写一个能学会 XOR 的网络

只用标准库，60 行，2-2-1 结构：

```python
import math
import random


def sigmoid(x):
    if x < -60:                       # 防溢出
        return 0.0
    if x > 60:
        return 1.0
    return 1.0 / (1.0 + math.exp(-x))


def train_xor(epochs=20000, lr=0.5, seed=42):
    random.seed(seed)
    # 2 输入 -> 2 隐藏 -> 1 输出
    w1 = [[random.uniform(-1, 1) for _ in range(2)] for _ in range(2)]   # w1[h][i]
    b1 = [random.uniform(-1, 1) for _ in range(2)]
    w2 = [random.uniform(-1, 1) for _ in range(2)]                       # w2[h]
    b2 = random.uniform(-1, 1)

    data = [([0, 0], 0), ([0, 1], 1), ([1, 0], 1), ([1, 1], 0)]

    for _ in range(epochs):
        for x, y in data:
            # ---- 前向 ----
            h_in = [sum(x[i] * w1[hh][i] for i in range(2)) + b1[hh] for hh in range(2)]
            h = [sigmoid(v) for v in h_in]
            o_in = sum(h[hh] * w2[hh] for hh in range(2)) + b2
            o = sigmoid(o_in)

            # ---- 反向 ----
            # 对 MSE + sigmoid：dL/do_in = (o - y) * o * (1 - o)
            d_out = (o - y) * o * (1 - o)
            d_hid = [d_out * w2[hh] * h[hh] * (1 - h[hh]) for hh in range(2)]

            # ---- 更新 ----
            for hh in range(2):
                w2[hh] -= lr * d_out * h[hh]
            b2 -= lr * d_out
            for hh in range(2):
                for i in range(2):
                    w1[hh][i] -= lr * d_hid[hh] * x[i]
                b1[hh] -= lr * d_hid[hh]

    def predict(x):
        h = [sigmoid(sum(x[i] * w1[hh][i] for i in range(2)) + b1[hh]) for hh in range(2)]
        return sigmoid(sum(h[hh] * w2[hh] for hh in range(2)) + b2)

    return predict


model = train_xor()
for x in ([0, 0], [0, 1], [1, 0], [1, 1]):
    print(x, f"{model(x):.4f}")
# [0, 0] 0.0106
# [0, 1] 0.9889
# [1, 0] 0.9889
# [1, 1] 0.0137
```

> **这 60 行就是深度学习的全部骨架**：前向、损失、反向、更新。
> 现代框架（PyTorch）做的只是：自动求导 + GPU 并行 + 更多层。

## 2.6 卷积神经网络（CNN）

第 7 周写过二维卷积，那就是 CNN 的核心运算：

```python
def conv2d(a, kernel):
    m, n = len(a), len(a[0])
    p, q = len(kernel), len(kernel[0])
    return [[sum(a[i + di][j + dj] * kernel[di][dj]
                 for di in range(p) for dj in range(q))
             for j in range(n - q + 1)]
            for i in range(m - p + 1)]


def max_pool(a, size=2):
    """最大池化：每个 size×size 块取最大值，缩小尺寸、保留显著特征。"""
    m, n = len(a), len(a[0])
    return [[max(a[i + di][j + dj] for di in range(size) for dj in range(size))
             for j in range(0, n - size + 1, size)]
            for i in range(0, m - size + 1, size)]


img = [[1, 2, 3, 0],
       [4, 5, 6, 1],
       [7, 8, 9, 2],
       [1, 0, 1, 3]]
edge_kernel = [[-1, -1, -1],
               [-1, 8, -1],
               [-1, -1, -1]]          # 边缘检测：中心减去周围
print(conv2d(img, edge_kernel))       # [[0, 18], [31, 46]]
print(max_pool(img))                  # [[5, 6], [8, 9]]
```

**CNN 的三个想法**：

1. **局部连接**：一个神经元只看一小块区域（不像全连接那样看整张图）；
2. **权值共享**：同一个卷积核扫过全图 —— 参数量大幅减少；
3. **池化**：降采样，获得平移不变性。

## 2.7 从本课到大模型

```
   感知机 (1958)
      ↓ 加隐藏层 + 反向传播 (1986)
   多层感知机 MLP
      ↓ 局部连接 + 权值共享
   卷积网络 CNN (图像)
      ↓ 处理序列
   循环网络 RNN / LSTM
      ↓ 抛弃循环，全用注意力 (2017)
   Transformer
      ↓ 加大规模 + 海量数据
   大语言模型 LLM
```

**你现在具备的基础**：矩阵运算（W6）、卷积（W7）、图（W12）、
动态规划的思想（W10–W11）、注意力的实现（W14）、反向传播（本周）。
**再往前一步就是 `Build a Large Language Model (From Scratch)` 那本书。**

---

# 3 AI 与算法的关系：不要走偏

| 误解 | 事实 |
| ---- | ---- |
| "有了 AI 就不用学算法了" | AI 训练与推理**本身**就是算法与复杂度问题；不懂复杂度调不动模型 |
| "神经网络能解决一切" | 排序、最短路、精确计数这类问题，传统算法**又快又对**，神经网络反而不行 |
| "调包就够了" | 调包能跑通 demo；出了问题（不收敛、爆显存）只能靠原理排查 |

> **本课的立场**：AI 是**又一个工具箱**，不是替代品。
> 会写 BFS 的人才能看懂图神经网络在做什么；懂 DP 的人才能理解反向传播为什么高效。

---

# 4 上机实践

**任务**：在本地或云主机上完成。

1. 运行第 2.5 节的 XOR 网络，把 `lr` 改成 0.01、5.0，观察收敛情况并记录；
2. 把隐藏层神经元数从 2 改成 4，看训练轮数能否减少；
3. 用第 1.2 节的 `KnowledgeGraph` 建一个"本课知识点"的小图谱（≥ 15 个三元组），
   用 `path()` 查询任意两个知识点之间的关系路径；
4. （选做）用第 2.6 节的 `conv2d` 对一张灰度图做边缘检测，把结果打印成字符画。

---

# 5 本周作业

| # | 任务 | 说明 |
| - | ---- | ---- |
| 1 | 完成第 4 节上机实践的 1–3 项 | 提交代码 + 观察记录 |
| 2 | 手推一次反向传播 | 对 2-1-1 的网络，用链式法则写出 ∂L/∂w 的表达式 |
| 3 | 图的拉普拉斯矩阵 | E19943（图 + 矩阵，图神经网络的基础） |
| 4 | 二维矩阵上的卷积运算 | E19942（复习 CNN 的核心运算） |
| 5 | 倒排索引 | M06640（RAG 检索的基础） |
| 6（选做） | 用 `softmax` + 注意力实现一个"最相关文档"的检索 | 结合 W14 第 1.2 节 |

**思考题**：

1. 为什么没有激活函数时，100 层网络等价于 1 层？用矩阵乘法说明。
2. XOR 网络的隐藏层若只有 1 个神经元，还能学会吗？改代码实测。
3. 反向传播与动态规划的"重叠子问题"具体对应在哪里？
4. 知识图谱的多跳查询若给关系加上可信度权重，该用哪个算法？（提示：第 12 周）
5. 卷积的"权值共享"让参数量从多少降到多少？以 28×28 输入、3×3 卷积核为例算一算。

---

# 6 小结

1. 知识图谱 = **三元组 = 带标签的有向图**；单跳是查表，**多跳推理就是 BFS / Dijkstra**。
2. **RAG = 检索 + 拼装 + 生成**，用外部知识库补上大模型"会编"和"知识过时"两个短板。
3. 神经元 = **加权求和 + 激活**；**没有非线性激活，多层等价于单层**。
4. 学习 = **前向 → 算损失 → 反向传播（链式法则）→ 梯度下降更新**。
   反向传播本质上是**动态规划**。
5. CNN 三想法：**局部连接、权值共享、池化**；其核心运算就是第 7 周写过的二维卷积。
6. **AI 不替代算法**：不懂复杂度调不动模型，不懂图算法看不懂图神经网络。

**下周预告**：**课程知识体系总结、期末复习与上机考试**——
把 16 周的内容串成一张图，并给出机考的命题方案与备考清单。

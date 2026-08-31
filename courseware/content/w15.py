# -*- coding: utf-8 -*-
"""第15周 知识图谱、神经网络等 AI 专题"""

META = {
    'title': '第15周　知识图谱、神经网络等 AI 专题',
    'subtitle': '三元组与多跳推理 · RAG · 感知机与激活 · 反向传播 · 手写 XOR 网络 · CNN',
    'footer': '计算概论（B） · 第15周 · 闫宏飞 · 2026 Fall',
    'info': ['北京大学　《计算概论（B）》',
             '主题与学习重点：知识图谱、神经网络等 AI 专题；课程知识体系总结与期末复习。'],
}

SLIDES = [
    ('section', '第 1 节', '知识图谱'),

    ('ascii', '三元组：知识的最小单位', r"""
   (图灵, 提出, 图灵机)
   (图灵机, 属于, 计算模型)
   (冯诺依曼, 提出, 存储程序结构)

      图灵 --提出--> 图灵机 --属于--> 计算模型
                        ^
   冯诺依曼 --提出--> 存储程序结构

   实体是顶点，关系是带标签的有向边
""", '认出来了吗 —— 这就是第 12 周的有向图'),

    ('code', '用 Python 建一个小知识图谱', '''from collections import defaultdict, deque


class KnowledgeGraph:
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
        return ([o for _, o in self.out[node]]
                + [s for _, s in self.inn[node]])
''', ''),

    ('code', '多跳推理 = BFS 求最短关系路径', '''    def path(self, src, dst):
        """就是第 12 周的 BFS 模板。"""
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


# kg.path("图灵", "现代计算机") -> ['图灵', '图灵机', '现代计算机']
''', '单跳是查表，多跳才是推理。给边加可信度权重，就变成 Dijkstra'),

    ('ascii', 'RAG：检索增强生成', r"""
   用户提问
      |
      v
   (1) 检索：在知识库里找出最相关的若干段落
      |        （倒排索引 / 向量检索 / 知识图谱查询）
      v
   (2) 拼装：把检索到的内容放进提示词，作为"参考材料"
      |
      v
   (3) 生成：让模型基于这些材料回答，并要求标注出处
""", '补上大模型"知识有截止时间"和"会编"两个短板'),

    ('code', '最简单的检索：TF-IDF 打分', '''import math
from collections import defaultdict, Counter


def build_index(docs):
    index = defaultdict(set)               # 倒排索引：词 -> 文档编号集合
    for i, doc in enumerate(docs):
        for w in doc.split():
            index[w].add(i)
    return index


def score(query, docs, index):
    n = len(docs)
    scores = [0.0] * n
    for w in query.split():
        hits = index.get(w, set())
        if not hits:
            continue
        idf = math.log(n / len(hits)) + 1  # 出现在越少文档里，权重越高
        for i in hits:
            tf = Counter(docs[i].split())[w] / len(docs[i].split())
            scores[i] += tf * idf
    return scores
''', '小北智学的 AI 助教就是一个 RAG 系统；知识库里没有的东西，它照样会编'),

    ('section', '第 2 节', '神经网络'),

    ('ascii', '感知机：一个神经元', r"""
   x1 --w1--+
   x2 --w2--+--> Sigma (加权求和 + 偏置 b) --> sigma (激活函数) --> y
   x3 --w3--+
"""),

    ('code', '一个神经元实现逻辑与 AND', '''import math


def sigmoid(x):
    return 1.0 / (1.0 + math.exp(-x))


def neuron(inputs, weights, bias):
    z = sum(x * w for x, w in zip(inputs, weights)) + bias
    return sigmoid(z)


print(round(neuron([0, 0], [20, 20], -30), 4))   # 0.0
print(round(neuron([1, 0], [20, 20], -30), 4))   # 0.0
print(round(neuron([1, 1], [20, 20], -30), 4))   # 1.0
''', ''),

    ('table', '激活函数：为什么必须非线性', [
        ['函数', '公式', '特点'],
        ['Sigmoid', '1/(1+e^-x)', '输出 (0,1)，二分类；深层易梯度消失'],
        ['Tanh', '(e^x - e^-x)/(e^x + e^-x)', '输出 (-1,1)，零中心'],
        ['ReLU', 'max(0, x)', '最常用：计算快、缓解梯度消失'],
        ['Softmax', 'e^xi / Σ e^xj', '多分类输出层，给出概率分布'],
    ], '⚠️ 没有激活函数，多层网络等价于单层 —— 线性变换的复合还是线性变换'),

    ('ascii', 'XOR：为什么需要"深度"', r"""
   XOR:  (0,0)->0   (0,1)->1   (1,0)->1   (1,1)->0

     x2
      1 |  *(1)      o(0)
        |
      0 |  o(0)      *(1)
        +----------------> x1
           0          1

   一条直线分不开 * 和 o -> 单个感知机做不到，必须加隐藏层
""", '1969 年 Minsky 指出的问题，也是"深度"的必要性来源'),

    ('code', '前向、损失、梯度下降', '''def mse(pred, target):
    """均方误差。"""
    return sum((p - t) ** 2 for p, t in zip(pred, target)) / len(pred)


def gradient_descent_demo():
    """最小化 f(w) = (w - 3)^2，导数 f'(w) = 2(w - 3)。"""
    w, lr = 0.0, 0.1
    for step in range(30):
        grad = 2 * (w - 3)
        w -= lr * grad
    return w


print(mse([0.9, 0.1], [1.0, 0.0]))          # 0.01
print(f"{gradient_descent_demo():.4f}")     # 2.9963 —— 收敛到最优 w=3
''', '学习率 lr：太小收敛慢，太大会震荡甚至发散。这是最重要的超参数'),

    ('ascii', '反向传播：链式法则', r"""
   dLoss/dw1 = (dLoss/dy) * (dy/dz) * (dz/dw1)
                  ^            ^          ^
              损失对输出   激活函数导数  加权和对权重

   从输出层往回逐层相乘 —— 所以叫"反向"传播
""", '⭐ 它其实就是动态规划：每层梯度由后一层推出，中间结果存下来复用'),

    ('code', '手写 XOR 网络（1/2）：初始化与训练循环', '''import math
import random


def sig(x):
    if x < -60:
        return 0.0
    if x > 60:
        return 1.0
    return 1.0 / (1.0 + math.exp(-x))


def train_xor(epochs=20000, lr=0.5, seed=42):
    random.seed(seed)                       # 2 输入 -> 2 隐藏 -> 1 输出
    w1 = [[random.uniform(-1, 1) for _ in range(2)] for _ in range(2)]
    b1 = [random.uniform(-1, 1) for _ in range(2)]
    w2 = [random.uniform(-1, 1) for _ in range(2)]
    b2 = random.uniform(-1, 1)
    data = [([0, 0], 0), ([0, 1], 1), ([1, 0], 1), ([1, 1], 0)]

    for _ in range(epochs):
        for x, y in data:
            h = [sig(sum(x[i] * w1[j][i] for i in range(2)) + b1[j])
                 for j in range(2)]                       # --- 前向 ---
            o = sig(sum(h[j] * w2[j] for j in range(2)) + b2)
''', '只用标准库，2-2-1 结构；下一页是反向与更新'),

    ('code', '手写 XOR 网络（2/2）：反向传播与更新', '''            # --- 反向：对 MSE + sigmoid，dL/do_in = (o-y)*o*(1-o) ---
            d_out = (o - y) * o * (1 - o)
            d_hid = [d_out * w2[j] * h[j] * (1 - h[j]) for j in range(2)]

            # --- 更新 ---
            for j in range(2):
                w2[j] -= lr * d_out * h[j]
            b2 -= lr * d_out
            for j in range(2):
                for i in range(2):
                    w1[j][i] -= lr * d_hid[j] * x[i]
                b1[j] -= lr * d_hid[j]

    def predict(x):
        h = [sig(sum(x[i] * w1[j][i] for i in range(2)) + b1[j])
             for j in range(2)]
        return sig(sum(h[j] * w2[j] for j in range(2)) + b2)

    return predict


model = train_xor()
for x in ([0, 0], [0, 1], [1, 0], [1, 1]):
    print(x, f"{model(x):.4f}")
# [0,0] 0.0106  [0,1] 0.9889  [1,0] 0.9889  [1,1] 0.0137
''', '这两页合起来就是深度学习的全部骨架：前向、损失、反向、更新'),

    ('code', 'CNN：卷积与池化', '''def conv2d(a, kernel):
    m, n = len(a), len(a[0])
    p, q = len(kernel), len(kernel[0])
    return [[sum(a[i+di][j+dj] * kernel[di][dj]
                 for di in range(p) for dj in range(q))
             for j in range(n - q + 1)]
            for i in range(m - p + 1)]


def max_pool(a, size=2):
    """最大池化：每个 size x size 块取最大值，缩小尺寸、保留显著特征。"""
    m, n = len(a), len(a[0])
    return [[max(a[i+di][j+dj] for di in range(size) for dj in range(size))
             for j in range(0, n - size + 1, size)]
            for i in range(0, m - size + 1, size)]


img = [[1, 2, 3, 0], [4, 5, 6, 1], [7, 8, 9, 2], [1, 0, 1, 3]]
edge = [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]]     # 边缘检测
print(conv2d(img, edge))       # [[0, 18], [31, 46]]
print(max_pool(img))           # [[5, 6], [8, 9]]
''', '第 7 周写过的二维卷积，就是 CNN 的核心运算'),

    ('bullets', 'CNN 的三个想法', [
        '**局部连接**：一个神经元只看一小块区域（不像全连接那样看整张图）',
        '**权值共享**：同一个卷积核扫过全图 —— 参数量大幅减少',
        '**池化**：降采样，获得平移不变性',
    ]),

    ('ascii', '从本课到大模型', r"""
   感知机 (1958)
      | 加隐藏层 + 反向传播 (1986)
   多层感知机 MLP
      | 局部连接 + 权值共享
   卷积网络 CNN (图像)
      | 处理序列
   循环网络 RNN / LSTM
      | 抛弃循环，全用注意力 (2017)
   Transformer
      | 加大规模 + 海量数据
   大语言模型 LLM
""", '你已有的基础：矩阵(W6)、卷积(W7)、图(W12)、DP(W10-11)、注意力(W14)、反向传播(本周)'),

    ('table', 'AI 与算法的关系：不要走偏', [
        ['误解', '事实'],
        ['"有了 AI 就不用学算法了"', 'AI 训练与推理本身就是算法与复杂度问题'],
        ['"神经网络能解决一切"', '排序、最短路、精确计数，传统算法又快又对'],
        ['"调包就够了"', '出了问题（不收敛、爆显存）只能靠原理排查'],
    ], '本课立场：AI 是又一个工具箱，不是替代品'),

    ('bullets', '上机实践任务', [
        '运行 XOR 网络，把 `lr` 改成 0.01、5.0，观察收敛情况并记录',
        '把隐藏层神经元数从 2 改成 4，看训练轮数能否减少',
        '用 `KnowledgeGraph` 建一个"本课知识点"的小图谱（≥ 15 个三元组），',
        '- 用 `path()` 查询任意两个知识点之间的关系路径',
        '（选做）用 `conv2d` 对一张灰度图做边缘检测，把结果打印成字符画',
    ]),

    ('table', '本周作业', [
        ['#', '任务', '编号 / 说明'],
        ['1', '完成上机实践 1–3 项', '提交代码 + 观察记录'],
        ['2', '手推一次反向传播', '2-1-1 网络，写出 dL/dw 的表达式'],
        ['3', '图的拉普拉斯矩阵', 'E19943（图神经网络的基础）'],
        ['4', '二维矩阵上的卷积运算', 'E19942（CNN 核心运算）'],
        ['5', '倒排索引', 'M06640（RAG 检索的基础）'],
        ['6（选做）', 'softmax + 注意力实现文档检索', '结合 W14'],
    ]),

    ('bullets', '小结', [
        '知识图谱 = **三元组 = 带标签的有向图**；多跳推理就是 **BFS / Dijkstra**',
        '**RAG = 检索 + 拼装 + 生成**',
        '神经元 = **加权求和 + 激活**；**没有非线性激活，多层等价于单层**',
        '学习 = **前向 → 损失 → 反向传播（链式法则）→ 梯度下降**；反向传播本质是 **DP**',
        'CNN 三想法：**局部连接、权值共享、池化**',
        '**AI 不替代算法**：不懂复杂度调不动模型，不懂图算法看不懂图神经网络',
    ]),

    ('key', '下周预告',
     '课程知识体系总结、期末复习与上机考试命题方案。'),
]

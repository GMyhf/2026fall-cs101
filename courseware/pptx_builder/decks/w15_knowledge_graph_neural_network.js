// 第 15 周 知识图谱、神经网络等 AI 专题 —— 由 202612_ADS_W15_Knowledge_Graph_Neural_Network.md 整理成的讲课 PPT。
// 生成：cd courseware/pptx_builder && node decks/w15_knowledge_graph_neural_network.js ../202612_ADS_W15_Knowledge_Graph_Neural_Network.pptx
// 页上所有的运行结果都在 Python 3.12 下实跑核对过；改代码时连同结果一起改。
const path = require("path");
const { createDeck } = require("../lib");

const OUT = process.argv[2] || path.join(__dirname, "..", "out", "202612_ADS_W15_Knowledge_Graph_Neural_Network.pptx");

(async () => {
  const D = createDeck({ title: "计算概论（B）第 15 周 知识图谱、神经网络等 AI 专题", author: "Hongfei Yan" });
  const {
    pres, C, FONT, MONO, runs, text, bullets, card, codeBlock, consoleBlock, callout, table,
    cells, arrowLabel, pill, numCircle, titleSlide, sectionSlide, content, summarySlide,
  } = D;

// ---- slides（顶层不缩进，避免改动模板字符串里的代码缩进）----
// =====================================================================
// Cover
titleSlide({
  kicker: "计算概论（B） · 第 15 周 · 2026 Fall",
  title: "知识图谱与神经网络",
  subtitle: "AI 专题：从图算法到大模型的路径",
  topics: "知识图谱的三元组表示与图查询 · 实体链接与多跳推理 · 检索增强生成（RAG）\n感知机与激活函数 · 前向传播、损失函数 · 梯度下降与反向传播\n从零手写一个能学会 XOR 的神经网络 · 卷积与池化（CNN）\nAI 与算法的关系 · 从本课到大模型的路径",
  footer: "Compiled by Hongfei Yan · 2026 Fall · github.com/GMyhf/2026fall-cs101",
});

// Three questions
{
  const s = content("?", "本周导引", "本周要回答三个问题");
  const qs = [
    ["知识图谱和第 12 周的图有什么关系？", "三元组画成图，**实体是顶点，关系是有向边**——多跳推理就是**图上的 BFS**。"],
    ["为什么神经网络要有隐藏层？", "**XOR 不是线性可分的**，单层感知机画不出分界线，必须加隐藏层——这是「深度」的来源。"],
    ["反向传播和本课学过的什么很像？", "**梯度沿网络逐层往回推，中间结果存下来复用**——本质就是动态规划。"],
  ];
  qs.forEach((q, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.15, 2.85, 2.55, C.code);
    numCircle(s, i + 1, x + 0.2, 1.32, 0.46, C.dark);
    text(s, q[0], x + 0.2, 1.92, 2.5, 0.7, { fontSize: 13.5, bold: true, color: C.dark, margin: 0 });
    text(s, q[1], x + 0.2, 2.65, 2.5, 0.95, { fontSize: 11, margin: 0, lsm: 1.2 });
  });
  card(s, 0.5, 3.95, 9.0, 1.1, C.dark);
  text(s, "一句话概括", 0.75, 4.05, 3, 0.3, { fontSize: 11, bold: true, color: C.gold, margin: 0 });
  s.addText(runs("知识图谱、RAG、神经网络——都是**图算法、复杂度、DP** 这些老朋友换了张脸。", { color: C.white, boldColor: C.gold }),
    { x: 0.75, y: 4.38, w: 8.6, h: 0.5, fontFace: FONT, fontSize: 15, margin: 0, isTextBox: true, valign: "middle" });
}

// Roadmap
{
  const s = content("≡", "本周导引", "内容地图");
  const cols = [
    ["1  知识图谱", ["1.1 三元组：知识的最小单位", "1.2 用 Python 建一个小知识图谱", "1.3 多跳推理", "1.4 从知识图谱到 RAG"]],
    ["2  神经网络", ["2.1–2.2 感知机、激活函数、XOR 问题", "2.3–2.4 前向传播、损失、梯度下降、反向传播", "2.5 从零手写 XOR 网络", "2.6–2.7 CNN · 从本课到大模型"]],
    ["3–4  收尾", ["3 AI 与算法的关系：不要走偏", "4 上机实践", "本周作业 · 思考题 · 小结"]],
  ];
  cols.forEach((c, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.15, 2.85, 3.9, i === 2 ? C.cream : C.code);
    text(s, c[0], x + 0.2, 1.3, 2.5, 0.45, { fontSize: 18, bold: true, color: C.dark, margin: 0 });
    bullets(s, c[1], x + 0.15, 1.9, 2.6, 3.0, { fontSize: 12, gap: 10 });
  });
}

// ============================ PART 1 ============================
sectionSlide("Part 1", "知识图谱", "三元组、图查询、多跳推理，与检索增强生成（RAG）\n第 12 周的图算法，换了个应用场景");

// 1.1
{
  const s = content("1.1", "1 知识图谱", "三元组：知识的最小单位");
  text(s, "知识图谱把知识表示成 **(主语, 谓语, 宾语)** 的三元组：", 0.5, 1.1, 9.0, 0.35, { fontSize: 13 });
  codeBlock(s, `(图灵, 提出, 图灵机)
(图灵机, 属于, 计算模型)
(冯·诺依曼, 提出, 存储程序结构)
(计算概论B, 先修于, 数据结构与算法)`, 0.5, 1.5, 9.0, 1.15, { fontSize: 12, lang: "text" });
  text(s, "画成图：**实体是顶点，关系是带标签的有向边**：", 0.5, 2.8, 9.0, 0.3, { fontSize: 13 });
  codeBlock(s, `      图灵 ──提出──► 图灵机 ──属于──► 计算模型
                        ▲
   冯·诺依曼 ──提出──► 存储程序结构`, 0.5, 3.15, 9.0, 0.85, { fontSize: 12, lang: "text" });
  callout(s, "认出来了吗", "这就是第 12 周的**有向图**。知识图谱的查询、推理，用的全是本课已经讲过的图算法。", 0.5, 4.15, 9.0, 0.85, { fill: C.mint });
}

// 1.2a
{
  const s = content("1.2", "1 知识图谱", "用 Python 建一个小知识图谱（存储与索引）");
  codeBlock(s, `class KnowledgeGraph:
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
                + [s for _, s in self.inn[node]])`, 0.5, 1.1, 6.3, 4.05, { fontSize: 9.3, lang: "py" });
  callout(s, "正反向索引", ["`out`：从主语出发能到哪", "`inn`：从宾语反查主语", "两个方向都要存，`neighbors()` 才能双向走"], 7.0, 1.1, 2.5, 2.0, { fill: C.cream, fontSize: 11.5 });
  callout(s, "query() 的用法", "`s`/`p`/`o` 传 `None` 就是通配——SQL 里 `WHERE` 子句的思路。", 7.0, 3.3, 2.5, 1.85, { fill: C.mint, fontSize: 11.5 });
}

// 1.2b
{
  const s = content("1.2", "1 知识图谱", "path()：BFS 求最短关系路径");
  codeBlock(s, `def path(self, src, dst):
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
    return []`, 0.5, 1.05, 5.5, 3.95, { fontSize: 9.8, lang: "py" });
  codeBlock(s, `kg = KnowledgeGraph()
edges = [
    ("图灵", "提出", "图灵机"),
    ("图灵机", "属于", "计算模型"),
    ("冯诺依曼", "提出", "存储程序结构"),
    ("存储程序结构", "属于",
     "计算机体系结构"),
    ("现代计算机", "基于",
     "存储程序结构"),
    ("现代计算机", "等价于", "图灵机"),
]
for t in edges:
    kg.add(*t)

print(kg.query(s="图灵"))
print(kg.path("图灵", "现代计算机"))`, 6.15, 1.05, 3.35, 3.0, { fontSize: 8.3, lang: "py" });
  consoleBlock(s, `[('图灵', '提出', '图灵机')]
['图灵', '图灵机', '现代计算机']`, 6.15, 4.15, 3.35, 0.85, 10);
}

// 1.3
{
  const s = content("1.3", "1 知识图谱", "多跳推理：从查表到推理");
  text(s, "单跳是「查表」，**多跳才是「推理」**：", 0.5, 1.1, 9.0, 0.35, { fontSize: 14 });
  card(s, 0.5, 1.6, 9.0, 1.3, C.code);
  text(s, "问：图灵和现代计算机有什么关系？", 0.75, 1.78, 8.5, 0.35, { fontSize: 13, bold: true, color: C.dark, margin: 0 });
  text(s, "答：图灵 →提出→ 图灵机 ←等价于← 现代计算机。", 0.75, 2.2, 8.5, 0.35, { fontSize: 13, margin: 0 });
  callout(s, "这正是 path() 做的事", "**BFS 求最短关系路径**。真实系统里还会给边加权（关系的可信度），那就变成 **Dijkstra**。", 0.5, 3.1, 9.0, 1.9, { fill: C.mint, fontSize: 13.5, lsm: 1.3 });
}

// 1.4a
{
  const s = content("1.4", "1 知识图谱", "从知识图谱到 RAG");
  text(s, "大模型的两个短板：**知识有截止时间**、**会编**。**检索增强生成（RAG）** 用外部知识库补上：", 0.5, 1.1, 9.0, 0.55, { fontSize: 13, lsm: 1.2 });
  const steps = [
    ["①", "检索", "在知识库里找出最相关的若干段落（倒排索引 / 向量检索 / 知识图谱查询）"],
    ["②", "拼装", "把检索到的内容放进提示词，作为「参考材料」"],
    ["③", "生成", "让模型基于这些材料回答，并要求标注出处"],
  ];
  steps.forEach((st, i) => {
    const y = 1.85 + i * 1.05;
    card(s, 0.5, y, 9.0, 0.9, i % 2 === 0 ? C.code : C.cream);
    pill(s, st[0], 0.7, y + 0.25, 0.5, 0.4, C.dark, C.gold, 14);
    text(s, st[1], 1.4, y + 0.15, 1.6, 0.6, { fontSize: 15, bold: true, color: C.dark, valign: "middle", margin: 0 });
    text(s, st[2], 3.1, y + 0.15, 6.2, 0.6, { fontSize: 11.5, valign: "middle", margin: 0, lsm: 1.15 });
    if (i < 2) arrowLabel(s, "", 5.0, y + 0.9, C.muted, false);
  });
}

// 1.4b
{
  const s = content("1.4", "1 知识图谱", "最简单的检索：词频打分（TF-IDF）");
  codeBlock(s, `def build_index(docs):
    index = defaultdict(set)               # 词 -> [文档编号]
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
        idf = math.log(n / len(hits)) + 1     # 出现在越少文档里，权重越高
        for i in hits:
            tf = Counter(docs[i].split())[w] / len(docs[i].split())
            scores[i] += tf * idf
    return scores


docs = ["图灵机 是 一种 计算模型", "冯诺依曼 结构 是 现代 计算机 的 基础", "动态规划 是 一种 算法 设计 方法"]
s = score("计算模型 图灵机", docs, build_index(docs))
print([f"{v:.3f}" for v in s])                  # ['1.049', '0.000', '0.000']`, 0.5, 1.05, 9.0, 3.55, { fontSize: 8.6, lang: "py" });
  text(s, "小北智学的 AI 助教就是一个 **RAG** 系统——课程知识库是检索源，但**课程事务仍以教师通知为准**，知识库里没有的东西它照样会编。", 0.5, 4.68, 9.0, 0.4, { fontSize: 10, color: C.muted, margin: 0, lsm: 1.1 });
}

// ============================ PART 2 ============================
sectionSlide("Part 2", "神经网络", "感知机 → 激活函数 → 前向传播 → 损失 → 梯度下降 → 反向传播\n从零手写一个能学会 XOR 的网络 · CNN · 从本课到大模型");

// 2.1
{
  const s = content("2.1", "2 神经网络", "感知机：一个神经元");
  codeBlock(s, `   x₁ ──w₁──┐
   x₂ ──w₂──┼──► Σ (加权求和 + 偏置 b) ──► σ (激活函数) ──► y
   x₃ ──w₃──┘`, 0.5, 1.1, 9.0, 0.75, { fontSize: 12, lang: "text" });
  codeBlock(s, `def sigmoid(x):
    return 1.0 / (1.0 + math.exp(-x))


def neuron(inputs, weights, bias):
    z = sum(x * w for x, w in zip(inputs, weights)) + bias
    return sigmoid(z)


# 手工设定权重，让它实现逻辑与 AND
print(round(neuron([0, 0], [20, 20], -30), 4))
print(round(neuron([1, 0], [20, 20], -30), 4))
print(round(neuron([1, 1], [20, 20], -30), 4))`, 0.5, 2.0, 5.9, 2.5, { fontSize: 10, lang: "py" });
  consoleBlock(s, "0.0\n0.0\n1.0", 6.6, 2.0, 2.9, 1.15, 13);
  callout(s, "手调参数也能「编程」", "权重 `20, 20`、偏置 `-30` 是手工凑的——只有两个输入都是 1，加权和才够大，sigmoid 才接近 1。这就是逻辑与 AND。", 6.6, 3.3, 2.9, 1.2, { fill: C.cream, fontSize: 10.5, lsm: 1.15 });
}

// 2.2a
{
  const s = content("2.2", "2 神经网络", "激活函数：为什么必须非线性");
  callout(s, "核心结论", "**若没有激活函数，多层网络等价于单层**——线性变换的复合还是线性变换，叠多少层都只能画一条直线。", 0.5, 1.1, 9.0, 0.85, { fill: C.mint, fontSize: 13, lsm: 1.2 });
  table(s, [
    ["函数", "公式", "特点"],
    ["Sigmoid", { t: "1/(1+e⁻ˣ)", mono: true }, "输出 (0,1)，用于二分类；深层易梯度消失"],
    ["Tanh", { t: "(eˣ−e⁻ˣ)/(eˣ+e⁻ˣ)", mono: true }, "输出 (−1,1)，零中心"],
    [{ t: "ReLU", bold: true }, { t: "max(0, x)", mono: true }, "最常用：计算快、缓解梯度消失"],
    ["Softmax", { t: "eˣⁱ/Σeˣʲ", mono: true }, "多分类的输出层，给出概率分布"],
  ], 0.5, 2.1, 9.0, [1.6, 3.4, 4.0], { fontSize: 12.5, rowH: 0.5 });
}

// 2.2b
{
  const s = content("2.2", "2 神经网络", "relu / softmax 与 XOR 问题");
  codeBlock(s, `def relu(x):
    return x if x > 0 else 0.0


def softmax(xs):
    m = max(xs)
    exps = [math.exp(x - m) for x in xs]
    total = sum(exps)
    return [e / total for e in exps]


print([relu(v) for v in (-2, -0.5, 0, 3)])
print([f"{v:.3f}" for v in softmax([1.0, 2.0, 3.0])])`, 0.5, 1.1, 5.9, 2.5, { fontSize: 10, lang: "py" });
  consoleBlock(s, "[0.0, 0.0, 0.0, 3]\n['0.090', '0.245', '0.665']", 6.6, 1.1, 2.9, 1.15, 11.5);
  callout(s, "XOR 问题", "单个感知机画不出 XOR 的分界（它不是线性可分的），必须**加一个隐藏层**。1969 年 Minsky 指出的问题，也是「深度」的必要性来源。", 6.6, 2.45, 2.9, 2.05, { fill: C.cream, fontSize: 10.5, lsm: 1.15 });
}

// 2.2c
{
  const s = content("2.2", "2 神经网络", "XOR：一条直线分不开");
  text(s, "XOR:  (0,0)→0   (0,1)→1   (1,0)→1   (1,1)→0", 0.5, 1.1, 9.0, 0.35, { fontSize: 13, bold: true });
  codeBlock(s, `     x₂
      1 │  ●(1)      ○(0)
        │
      0 │  ○(0)      ●(1)
        └────────────────► x₁
           0          1
     一条直线分不开 ● 和 ○`, 1.0, 1.7, 8.0, 2.3, { fontSize: 15, lang: "text" });
  callout(s, "必须加隐藏层", "隐藏层把输入映射到一个新的空间，在那个空间里 ● 和 ○ 才能被一条直线分开——这正是 §2.5 要动手实现的。", 0.5, 4.15, 9.0, 0.85, { fill: C.mint, fontSize: 12.5, lsm: 1.2 });
}

// 2.3a
{
  const s = content("2.3", "2 神经网络", "前向传播与损失函数");
  callout(s, "前向传播", "输入 → 逐层加权求和 + 激活 → 输出。", 0.5, 1.1, 9.0, 0.65, { fill: C.mint, fontSize: 13 });
  text(s, "**损失函数**衡量「预测离真值有多远」：", 0.5, 1.9, 9.0, 0.35, { fontSize: 13 });
  codeBlock(s, `def mse(pred, target):
    """均方误差。"""
    return sum((p - t) ** 2 for p, t in zip(pred, target)) / len(pred)


print(mse([0.9, 0.1], [1.0, 0.0]))`, 0.5, 2.3, 5.9, 1.6, { fontSize: 11, lang: "py" });
  consoleBlock(s, "0.009999999999999998\n（即 0.01，浮点表示）", 6.6, 2.3, 2.9, 1.15, 11.5);
  callout(s, "为什么是平方", "平方让误差恒为正，且放大较大的误差——梯度下降需要这个「坡度」。", 6.6, 3.6, 2.9, 1.0, { fill: C.cream, fontSize: 10.5, lsm: 1.15 });
}

// 2.3b
{
  const s = content("2.3", "2 神经网络", "梯度下降");
  text(s, "**梯度下降**：沿损失下降最快的方向调整参数。", 0.5, 1.1, 9.0, 0.35, { fontSize: 13 });
  codeBlock(s, `def gradient_descent_demo():
    """最小化 f(w) = (w - 3)^2，导数 f'(w) = 2(w - 3)。"""
    w, lr = 0.0, 0.1
    for step in range(30):
        grad = 2 * (w - 3)
        w -= lr * grad
    return w


print(f"{gradient_descent_demo():.4f}")`, 0.5, 1.5, 5.9, 2.1, { fontSize: 10.5, lang: "py" });
  consoleBlock(s, "2.9963\n（收敛到最优 w=3）", 6.6, 1.5, 2.9, 1.1, 12);
  callout(s, "学习率 lr：最重要的超参数", "太小收敛慢，太大会震荡甚至发散。", 6.6, 2.75, 2.9, 0.9, { fill: C.mint, fontSize: 11, lsm: 1.15 });
  callout(s, "试试改 lr", "把 `lr` 改成 `0.01`、`5.0` 各跑一次，观察 30 步后的 `w` 离 3 有多远——这是本周上机实践第 1 题。", 0.5, 3.75, 9.0, 1.25, { fill: C.cream, fontSize: 11.5, lsm: 1.2 });
}

// 2.4
{
  const s = content("2.4", "2 神经网络", "反向传播：链式法则");
  text(s, "网络有很多层参数，怎么知道每个参数该往哪调？**链式法则**：", 0.5, 1.1, 9.0, 0.35, { fontSize: 13 });
  codeBlock(s, `   ∂Loss/∂w₁ = (∂Loss/∂y) · (∂y/∂z) · (∂z/∂w₁)
                  ↑            ↑           ↑
               损失对输出   激活函数导数  加权和对权重`, 0.7, 1.6, 8.6, 1.1, { fontSize: 14, lang: "text" });
  text(s, "从输出层往回逐层相乘——所以叫「**反向**传播」。", 0.5, 2.9, 9.0, 0.35, { fontSize: 13 });
  callout(s, "它其实就是本课的动态规划", "每层的梯度由后一层的梯度推出来，中间结果存下来复用——**最优子结构 + 重叠子问题**，一模一样。", 0.5, 3.5, 9.0, 1.4, { fill: C.mint, fontSize: 14, lsm: 1.3 });
}

// 2.5a
{
  const s = content("2.5", "2 神经网络", "从零手写一个能学会 XOR 的网络（上）");
  text(s, "只用标准库，60 行，**2-2-1 结构**：2 输入 → 2 隐藏 → 1 输出：", 0.5, 1.05, 9.0, 0.3, { fontSize: 12.5 });
  codeBlock(s, `def sigmoid(x):
    if x < -60: return 0.0      # 防溢出
    if x > 60: return 1.0
    return 1.0 / (1.0 + math.exp(-x))


def train_xor(epochs=20000, lr=0.5, seed=42):
    random.seed(seed)
    w1 = [[random.uniform(-1, 1) for _ in range(2)] for _ in range(2)]   # w1[h][i]
    b1 = [random.uniform(-1, 1) for _ in range(2)]
    w2 = [random.uniform(-1, 1) for _ in range(2)]                      # w2[h]
    b2 = random.uniform(-1, 1)
    data = [([0, 0], 0), ([0, 1], 1), ([1, 0], 1), ([1, 1], 0)]

    for _ in range(epochs):
        for x, y in data:
            # ---- 前向 ----
            h_in = [sum(x[i] * w1[hh][i] for i in range(2)) + b1[hh] for hh in range(2)]
            h = [sigmoid(v) for v in h_in]
            o_in = sum(h[hh] * w2[hh] for hh in range(2)) + b2
            o = sigmoid(o_in)`, 0.5, 1.4, 9.0, 3.6, { fontSize: 9.3, lang: "py" });
}

// 2.5b
{
  const s = content("2.5", "2 神经网络", "从零手写一个能学会 XOR 的网络（下）");
  codeBlock(s, `            # ---- 反向 ----（对 MSE + sigmoid）
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
    print(x, f"{model(x):.4f}")`, 0.5, 1.1, 5.9, 3.9, { fontSize: 9.3, lang: "py" });
  consoleBlock(s, `[0, 0] 0.0106
[0, 1] 0.9889
[1, 0] 0.9889
[1, 1] 0.0137`, 6.6, 1.1, 2.9, 1.55, 11.5);
  callout(s, "60 行就是深度学习的全部骨架", "前向、损失、反向、更新。现代框架（PyTorch）做的只是：自动求导 + GPU 并行 + 更多层。", 6.6, 2.8, 2.9, 2.2, { fill: C.cream, fontSize: 11, lsm: 1.2 });
}

// 2.6
{
  const s = content("2.6", "2 神经网络", "卷积神经网络（CNN）");
  text(s, "第 7 周写过二维卷积，那就是 CNN 的核心运算：", 0.5, 1.05, 9.0, 0.3, { fontSize: 12.5 });
  codeBlock(s, `def conv2d(a, kernel):
    m, n = len(a), len(a[0])
    p, q = len(kernel), len(kernel[0])
    return [[sum(a[i + di][j + dj] * kernel[di][dj] for di in range(p) for dj in range(q))
             for j in range(n - q + 1)] for i in range(m - p + 1)]

def max_pool(a, size=2):                   # 每个 size×size 块取最大值，缩小尺寸、保留显著特征
    m, n = len(a), len(a[0])
    return [[max(a[i + di][j + dj] for di in range(size) for dj in range(size))
             for j in range(0, n - size + 1, size)] for i in range(0, m - size + 1, size)]

img = [[1, 2, 3, 0], [4, 5, 6, 1], [7, 8, 9, 2], [1, 0, 1, 3]]
edge_kernel = [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]]   # 边缘检测：中心减去周围
print(conv2d(img, edge_kernel))    # [[0, 18], [31, 46]]
print(max_pool(img))               # [[5, 6], [8, 9]]`, 0.5, 1.35, 9.0, 2.7, { fontSize: 9.5, lang: "py" });
  callout(s, "CNN 的三个想法", ["**局部连接**：一个神经元只看一小块区域", "**权值共享**：同一个卷积核扫过全图——参数量大幅减少", "**池化**：降采样，获得平移不变性"], 0.5, 4.0, 9.0, 0.78, { fill: C.mint, fontSize: 10.5, gap: 2 });
}

// 2.7
{
  const s = content("2.7", "2 神经网络", "从本课到大模型");
  codeBlock(s, `   感知机 (1958)
      ↓ 加隐藏层 + 反向传播 (1986)
   多层感知机 MLP
      ↓ 局部连接 + 权值共享
   卷积网络 CNN (图像)
      ↓ 处理序列
   循环网络 RNN / LSTM
      ↓ 抛弃循环，全用注意力 (2017)
   Transformer
      ↓ 加大规模 + 海量数据
   大语言模型 LLM`, 0.5, 1.1, 5.6, 3.9, { fontSize: 11, lang: "text" });
  callout(s, "你现在具备的基础", ["矩阵运算（W6）", "卷积（W7）", "图（W12）", "动态规划的思想（W10–W11）", "注意力的实现（W14）", "反向传播（本周）"], 6.3, 1.1, 3.2, 2.5, { fill: C.cream, fontSize: 11.5, gap: 6 });
  callout(s, "再往前一步", "《Build a Large Language Model (From Scratch)》。", 6.3, 3.75, 3.2, 1.25, { fill: C.mint, fontSize: 12, lsm: 1.2 });
}

// ============================ PART 3 ============================
sectionSlide("Part 3", "AI 与算法的关系", "不要走偏——AI 是又一个工具箱，不是替代品");

{
  const s = content("3", "3 AI 与算法的关系", "不要走偏");
  table(s, [
    ["误解", "事实"],
    ["「有了 AI 就不用学算法了」", "AI 训练与推理**本身**就是算法与复杂度问题；不懂复杂度调不动模型"],
    ["「神经网络能解决一切」", "排序、最短路、精确计数这类问题，传统算法**又快又对**，神经网络反而不行"],
    ["「调包就够了」", "调包能跑通 demo；出了问题（不收敛、爆显存）只能靠原理排查"],
  ], 0.5, 1.15, 9.0, [3.3, 5.7], { fontSize: 13, rowH: 0.75 });
  callout(s, "本课的立场", "AI 是**又一个工具箱**，不是替代品。会写 BFS 的人才能看懂图神经网络在做什么；懂 DP 的人才能理解反向传播为什么高效。", 0.5, 4.05, 9.0, 0.95, { fill: C.mint, fontSize: 13, lsm: 1.25 });
}

// ============================ PART 4 ============================
sectionSlide("Part 4", "上机实践", "在本地或云主机上完成");

{
  const s = content("4", "4 上机实践", "任务清单");
  const tasks = [
    ["1", "运行 §2.5 的 XOR 网络，把 `lr` 改成 `0.01`、`5.0`，观察收敛情况并记录"],
    ["2", "把隐藏层神经元数从 2 改成 4，看训练轮数能否减少"],
    ["3", "用 §1.2 的 `KnowledgeGraph` 建一个「本课知识点」的小图谱（≥ 15 个三元组），用 `path()` 查询任意两个知识点之间的关系路径"],
    ["4（选做）", "用 §2.6 的 `conv2d` 对一张灰度图做边缘检测，把结果打印成字符画"],
  ];
  tasks.forEach((t, i) => {
    const y = 1.15 + i * 0.95;
    card(s, 0.5, y, 9.0, 0.82, i % 2 === 0 ? C.code : C.cream);
    numCircle(s, i + 1, 0.7, y + 0.21, 0.4, C.dark);
    s.addText(runs(t[1], { color: C.text }), { x: 1.3, y: y + 0.08, w: 8.0, h: 0.66, fontFace: FONT, fontSize: 12.5, margin: 0, isTextBox: true, valign: "middle", lineSpacingMultiple: 1.15 });
  });
}

// 本周作业
{
  const s = content("✎", "本周练习", "本周作业");
  table(s, [
    ["#", "任务", "说明"],
    ["1", "完成第 4 节上机实践的 1–3 项", "提交代码 + 观察记录"],
    ["2", "手推一次反向传播", "对 2-1-1 的网络，用链式法则写出 ∂L/∂w 的表达式"],
    ["3", "图的拉普拉斯矩阵", { t: "E19943", mono: true }],
    ["4", "二维矩阵上的卷积运算", { t: "E19942", mono: true }],
    ["5", "倒排索引", { t: "M06640", mono: true }],
    [{ t: "6（选做）", color: C.goldText }, "用 softmax + 注意力实现一个「最相关文档」的检索", "结合 W14 第 1.2 节"],
  ], 0.5, 1.1, 9.0, [0.9, 4.6, 3.5], { fontSize: 11.5, rowH: 0.5 });
  text(s, "E / M 开头与纯数字编号：cs101.openjudge.cn。", 0.5, 4.75, 9, 0.28, { fontSize: 10, color: C.muted, margin: 0 });
}

// Thinking questions
{
  const s = content("?", "本周练习 · 思考题", "思考题");
  const qs = [
    ["非线性", "为什么没有激活函数时，100 层网络等价于 1 层？用矩阵乘法说明。"],
    ["XOR", "XOR 网络的隐藏层若只有 1 个神经元，还能学会吗？改代码实测。"],
    ["反向传播", "反向传播与动态规划的「重叠子问题」具体对应在哪里？"],
    ["权值共享", "卷积的「权值共享」让参数量从多少降到多少？以 28×28 输入、3×3 卷积核为例算一算。"],
  ];
  qs.forEach((q, i) => {
    const x = 0.5 + (i % 2) * 4.6, y = 1.1 + Math.floor(i / 2) * 2.0;
    card(s, x, y, 4.4, 1.85, i % 3 === 0 ? C.code : C.cream);
    numCircle(s, i + 1, x + 0.18, y + 0.15, 0.4, C.dark);
    text(s, q[0], x + 0.7, y + 0.15, 3.5, 0.4, { fontSize: 14, bold: true, color: C.dark, valign: "middle", margin: 0 });
    s.addText(runs(q[1], { color: C.text }), { x: x + 0.2, y: y + 0.68, w: 4.0, h: 1.1, fontFace: FONT, fontSize: 11.5, margin: 0, isTextBox: true, valign: "top" });
  });
}

summarySlide("本周小结", [
  ["知识图谱", "三元组 = **带标签的有向图**；单跳是查表，**多跳推理就是 BFS / Dijkstra**。"],
  ["RAG", "**检索 + 拼装 + 生成**，用外部知识库补上大模型「会编」和「知识过时」两个短板。"],
  ["神经元", "**加权求和 + 激活**；**没有非线性激活，多层等价于单层**。"],
  ["反向传播", "**前向 → 算损失 → 反向传播（链式法则）→ 梯度下降更新**；本质上是**动态规划**。"],
  ["CNN 与立场", "三想法：**局部连接、权值共享、池化**；**AI 不替代算法**——不懂图算法看不懂图神经网络。"],
]);

// Next week
{
  const s = sectionSlide("下周预告", "总结、复习与上机考试", "把 16 周的内容串成一张图\n给出机考的命题方案与备考清单");
}

  await D.save(OUT);
})().catch((e) => { console.error(e); process.exit(1); });

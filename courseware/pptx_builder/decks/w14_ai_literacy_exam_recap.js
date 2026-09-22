// 第 14 周 AI 素养、12 月月考讲评与综合复习 —— 由 202612_ADS_W14_AI_Literacy_Exam_Recap.md 整理成的讲课 PPT。
// 生成：cd courseware/pptx_builder && node decks/w14_ai_literacy_exam_recap.js ../202612_ADS_W14_AI_Literacy_Exam_Recap.pptx
// 页上所有的运行结果都在 Python 3.12 下实跑核对过；改代码时连同结果一起改。
const path = require("path");
const { createDeck } = require("../lib");

const OUT = process.argv[2] || path.join(__dirname, "..", "out", "202612_ADS_W14_AI_Literacy_Exam_Recap.pptx");

(async () => {
  const D = createDeck({ title: "计算概论（B）第 14 周 AI 素养、12 月月考讲评与综合复习", author: "Hongfei Yan" });
  const {
    pres, C, FONT, MONO, runs, text, bullets, card, codeBlock, consoleBlock, callout, table,
    cells, arrowLabel, pill, numCircle, titleSlide, sectionSlide, content, summarySlide,
  } = D;

// ---- slides（顶层不缩进，避免改动模板字符串里的代码缩进）----
// =====================================================================
// Cover
titleSlide({
  kicker: "计算概论（B） · 第 14 周 · 2026 Fall",
  title: "AI 素养、12 月月考讲评",
  subtitle: "与综合复习",
  topics: "大语言模型的工作原理：分词 · 词向量 · 注意力 · 训练对齐\n幻觉的成因与识别 · 提示词的有效结构 · AI 辅助编程的边界与学术诚信\n12 月月考样卷讲评（6 题，含错误归因）\n综合复习清单：12 个模板 · 高频陷阱 · 复习节奏",
  footer: "Compiled by Hongfei Yan · 2026 Fall · github.com/GMyhf/2026fall-cs101",
});

// Three questions
{
  const s = content("?", "本周导引", "本周要回答三个问题");
  const qs = [
    ["AI 帮我写题解，算不算我做的？", "能不能讲清楚自己交的每一行代码，是**唯一**的判据；讲不清楚 = 学术不端。"],
    ["AI 说的都对吗？", "**训练目标是「合理」，不是「正确」**——题号、版本号这类精确标识符最容易被编。"],
    ["月考没考好，问题出在哪？", "六道题对应六个高频坑：并列不处理、排序键靠猜、状态少一维……**错误归因比正解更重要**。"],
  ];
  qs.forEach((q, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.15, 2.85, 2.55, C.code);
    numCircle(s, i + 1, x + 0.2, 1.32, 0.46, C.dark);
    text(s, q[0], x + 0.2, 1.92, 2.5, 0.7, { fontSize: 14, bold: true, color: C.dark, margin: 0 });
    text(s, q[1], x + 0.2, 2.65, 2.5, 0.95, { fontSize: 11.5, margin: 0, lsm: 1.2 });
  });
  card(s, 0.5, 3.95, 9.0, 1.1, C.dark);
  text(s, "一句话概括", 0.75, 4.05, 3, 0.3, { fontSize: 11, bold: true, color: C.gold, margin: 0 });
  s.addText([
    ...runs("AI 是**工具**，不是**代考**：", { color: C.white, boldColor: C.gold }),
    { text: "怎么用它不违反诚信、怎么防它把你带偏，", options: { color: C.white } },
    { text: "是本周真正要学的东西。", options: { color: C.white } },
  ], { x: 0.75, y: 4.38, w: 8.6, h: 0.5, fontFace: FONT, fontSize: 14.5, margin: 0, isTextBox: true, valign: "middle" });
}

// Roadmap
{
  const s = content("≡", "本周导引", "内容地图");
  const cols = [
    ["1  AI 素养", ["1.1 LLM 在做什么", "1.2 四个关键部件：分词/词向量/注意力/训练", "1.3 幻觉：为什么会编、怎么自检", "1.4 提示词的有效结构", "1.5–1.6 能与不能、学术诚信"]],
    ["2  月考讲评", ["T1–T6 六题：题面 · 解法 · 错误归因", "难度梯度 ★★ → ★★★★★", "六个高频坑逐题对应"]],
    ["3  综合复习", ["3.1 必须默写的 12 个模板", "3.2 高频陷阱清单", "3.3 到机考前的复习节奏", "本周作业 · 思考题 · 小结"]],
  ];
  cols.forEach((c, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.15, 2.85, 3.9, i === 1 ? C.cream : C.code);
    text(s, c[0], x + 0.2, 1.3, 2.5, 0.45, { fontSize: 18, bold: true, color: C.dark, margin: 0 });
    bullets(s, c[1], x + 0.15, 1.9, 2.6, 3.0, { fontSize: 11.5, gap: 9 });
  });
}

// ============================ PART 1 ============================
sectionSlide("Part 1", "AI 素养", "大语言模型在做什么、为什么会编、怎么用才不越线\n分词 · 词向量 · 注意力 · 幻觉 · 提示词 · 学术诚信");

// 1.1 LLM 在做什么
{
  const s = content("1.1", "1 AI 素养", "大语言模型在做什么");
  text(s, "一句话：**给定前面的文字，预测下一个词（token）**。", 0.5, 1.05, 9, 0.35, { fontSize: 13.5 });
  card(s, 0.5, 1.5, 9.0, 2.15, C.code);
  const lines = [
    ["输入：", '"计算概论这门课主要用"', C.dark],
    ["下一个 token 的概率：", '"Python" 0.62　"C++" 0.18　"Java" 0.05 …', C.text],
    ["采样一个：", '"Python" → 拼回输入 → 再预测下一个', C.ok],
  ];
  lines.forEach((l, i) => {
    const y = 1.7 + i * 0.62;
    text(s, l[0], 0.75, y, 2.3, 0.5, { fontSize: 12.5, bold: true, color: C.dark, valign: "middle", margin: 0 });
    text(s, l[1], 3.0, y, 6.2, 0.5, { fontSize: 12.5, fontFace: MONO, bold: true, color: l[2], valign: "middle", margin: 0 });
  });
  s.addShape(pres.shapes.LINE, { x: 3.1, y: 1.7, w: 0, h: 1.24, line: { color: C.gold, width: 1.5, endArrowType: "triangle" } });
  callout(s, "反复执行这一步，就生成了一整段话", "没有「理解」，只有**在海量文本上学到的统计规律**。这决定了它擅长「接话」，不擅长「算数」「记精确事实」。", 0.5, 3.85, 9.0, 1.2, { fontSize: 12.5, fill: C.mint, tcolor: C.dark });
}

// 1.2(1) tokenization
{
  const s = content("1.2", "1 AI 素养 · 四个关键部件", "（1）分词 Tokenization");
  text(s, "文字先被切成 **token**（子词单元）；一句话被拆成 token 序列后，模型才能逐个处理。", 0.5, 1.05, 9, 0.5, { fontSize: 12.5, lsm: 1.2 });
  codeBlock(s, `def naive_tokenize(text):
    """一个极简的演示：按空白和标点切。真实的 BPE 分词要复杂得多。"""
    import re
    return [t for t in re.split(r'(\\W)', text) if t.strip()]


print(naive_tokenize("Hello, 计算概论!"))
# ['Hello', ',', '计算概论', '!']`, 0.5, 1.7, 5.3, 1.9, { fontSize: 11, lang: "py" });
  callout(s, "经验值", [
    "英文 1 个 token ≈ 0.75 个单词；",
    "中文 1 个汉字 ≈ 1–2 个 token；",
    { t: "「上下文窗口 128K」说的是 **token 数**，不是字数。", plain: true },
  ], 6.0, 1.7, 3.5, 1.9, { fontSize: 11.5 });
}

// 1.2(2) embedding
{
  const s = content("1.2", "1 AI 素养 · 四个关键部件", "（2）词向量 Embedding");
  text(s, "每个 token 被映射成一个高维向量，**语义相近的向量方向相近**。", 0.5, 1.05, 9, 0.35, { fontSize: 12.5 });
  codeBlock(s, `import math


def cosine(u, v):
    """余弦相似度：两个向量夹角的余弦，范围 [-1, 1]。"""
    dot = sum(a * b for a, b in zip(u, v))
    nu = math.sqrt(sum(a * a for a in u))
    nv = math.sqrt(sum(b * b for b in v))
    return dot / (nu * nv)


# 玩具例子：三维"语义空间"（前两维≈"王室/人"，第三维≈"食物"）
king = [0.9, 0.8, 0.1]
queen = [0.85, 0.75, 0.2]
apple = [0.1, 0.15, 0.95]

print(f"king-queen  {cosine(king, queen):.3f}")
print(f"king-apple  {cosine(king, apple):.3f}")`, 0.5, 1.5, 5.6, 2.85, { fontSize: 10, lang: "py" });
  consoleBlock(s, "king-queen  0.996  语义相近 -> 方向几乎重合\nking-apple  0.261  语义无关 -> 接近正交", 6.25, 1.5, 3.25, 1.05, 10.5);
  callout(s, "记住", "真实模型的向量是几千维、由训练学出来的。这里只是让你看到「**语义 = 向量的几何关系**」这件事。", 6.25, 2.7, 3.25, 1.65, { fontSize: 11.5, fill: C.mint, tcolor: C.dark });
}

// 1.2(3) attention concept
{
  const s = content("1.2", "1 AI 素养 · 四个关键部件", "（3）注意力 Attention：概念");
  text(s, "生成每个新 token 时，模型要决定「**前文里哪些词更重要**」。注意力就是给前文的每个位置算一个权重，再做加权求和。", 0.5, 1.1, 9, 0.6, { fontSize: 13, lsm: 1.25 });
  const steps = [
    ["Query", "当前要生成的位置，「我在找什么」"],
    ["Key", "前文每个位置，「我是什么」"],
    ["点积 + softmax", "算出一组和为 1 的权重"],
    ["加权求和 Value", "权重大的位置贡献更多"],
  ];
  steps.forEach((st, i) => {
    const x = 0.5 + i * 2.3;
    card(s, x, 2.0, 2.05, 1.7, i % 2 === 0 ? C.code : C.cream);
    numCircle(s, i + 1, x + 0.18, 2.16, 0.4, C.dark);
    text(s, st[0], x + 0.15, 2.65, 1.8, 0.4, { fontSize: 13.5, bold: true, color: C.dark, margin: 0 });
    text(s, st[1], x + 0.15, 3.05, 1.8, 0.6, { fontSize: 10.5, margin: 0, lsm: 1.15 });
  });
  callout(s, "「Attention is All You Need」（2017）", "提出的 **Transformer** 架构，正是今天所有大模型的基础。第 15 周会把神经网络的其余部分补齐。", 0.5, 3.95, 9.0, 1.1, { fontSize: 12, fill: C.mint, tcolor: C.dark });
}

// 1.2(3) attention code
{
  const s = content("1.2", "1 AI 素养 · 四个关键部件", "（3）注意力 Attention：最小实现");
  codeBlock(s, `import math


def softmax(xs):
    m = max(xs)
    exps = [math.exp(x - m) for x in xs]          # 减最大值防溢出
    total = sum(exps)
    return [e / total for e in exps]


def attention(query, keys, values):
    """最简形式的注意力：用点积算相关度，softmax 归一化，再加权求和。"""
    scores = [sum(q * k for q, k in zip(query, key)) for key in keys]
    weights = softmax(scores)
    dim = len(values[0])
    out = [sum(w * v[d] for w, v in zip(weights, values)) for d in range(dim)]
    return weights, out


q = [1.0, 0.0]
keys = [[1.0, 0.0], [0.0, 1.0], [0.7, 0.7]]
values = [[10.0], [20.0], [30.0]]
w, o = attention(q, keys, values)
print([f"{x:.3f}" for x in w], f"{o[0]:.3f}")`, 0.5, 1.1, 5.8, 3.35, { fontSize: 8.6, lang: "py" });
  consoleBlock(s, "['0.474', '0.174', '0.351'] 18.771", 6.45, 1.1, 3.05, 0.75, 10.5);
  callout(s, "怎么读这行输出", "与 query = [1,0] 越像的 key，权重越大：第一个 key = [1,0] 权重 0.474 最高；第三个 key = [0.7,0.7] 次之；第二个 key = [0,1] 与 query 正交，权重最小。", 6.45, 2.0, 3.05, 2.45, { fontSize: 11, lsm: 1.2 });
}

// 1.2(4) training
{
  const s = content("1.2", "1 AI 素养 · 四个关键部件", "（4）训练与对齐");
  const stages = [
    ["预训练 Pre-training", "在海量文本上学「下一个词」", "→ 会说话"],
    ["监督微调 SFT", "在人写的问答对上学", "→ 会答题"],
    ["人类反馈强化学习 RLHF", "按人的偏好排序打分", "→ 答得有用、无害"],
  ];
  stages.forEach((st, i) => {
    const y = 1.2 + i * 1.15;
    card(s, 0.8, y, 8.2, 0.95, i === 2 ? C.mint : C.code);
    text(s, st[0], 1.05, y + 0.12, 3.0, 0.35, { fontSize: 14, bold: true, color: C.dark, margin: 0 });
    text(s, st[1], 1.05, y + 0.5, 3.6, 0.35, { fontSize: 11, color: C.muted, margin: 0 });
    text(s, st[2], 5.6, y, 3.2, 0.95, { fontSize: 15, bold: true, color: C.goldText, valign: "middle", margin: 0 });
    if (i < 2) s.addShape(pres.shapes.LINE, { x: 4.9, y: y + 0.95, w: 0, h: 0.2, line: { color: C.green, width: 1.5, endArrowType: "triangle" } });
  });
}

// 1.3 hallucination table
{
  const s = content("1.3", "1 AI 素养", "幻觉：为什么它会编");
  text(s, "**训练目标是「合理」，不是「正确」。**模型没有事实数据库，它输出的是「在训练数据的统计规律下，这里最可能出现什么」。", 0.5, 1.05, 9, 0.55, { fontSize: 12.5, lsm: 1.2 });
  table(s, [
    ["类别", "例子", "为什么"],
    [{ t: "精确标识符", bold: true }, "OJ 题号、论文编号、API 版本号", "格式规律强、具体值随机，模型只能「编一个像的」"],
    [{ t: "时效信息", bold: true }, "最新版本、今年的规定", "训练数据有截止时间"],
    [{ t: "小众细节", bold: true }, "冷门函数的参数顺序", "训练数据里样本太少"],
    [{ t: "算术与计数", bold: true }, "大数乘法、字符计数", "逐 token 生成，不做真正的计算"],
  ], 0.5, 1.7, 9.0, [1.7, 3.2, 4.1], { fontSize: 11, rowH: 0.42 });
  callout(s, "本课的实测经验", "让 AI 报 OpenJudge 题号，**错误率很高**。讲义里的每一个题号都必须**自己打开链接确认**。", 0.5, 4.05, 9.0, 1.0, { fill: "FDF0EE", tcolor: C.bad, fontSize: 12.5 });
}

// 1.3 self-check
{
  const s = content("1.3", "1 AI 素养", "自检方法");
  const items = [
    ["换个问法再问一遍", "答案不稳定的地方，多半是编的。"],
    ["要求给出处", "给不出可核验的出处就当作没有。"],
    ["凡是数字、编号、链接", "一律自己验证。"],
  ];
  items.forEach((it, i) => {
    const y = 1.2 + i * 1.15;
    card(s, 0.5, y, 9.0, 0.95, i % 2 === 0 ? C.code : C.cream);
    numCircle(s, i + 1, 0.75, y + 0.28, 0.4, C.dark);
    text(s, it[0], 1.35, y, 3.6, 0.95, { fontSize: 14.5, bold: true, color: C.dark, valign: "middle", margin: 0 });
    text(s, it[1], 5.1, y, 4.1, 0.95, { fontSize: 12.5, valign: "middle", margin: 0 });
  });
}

// 1.4 prompt template
{
  const s = content("1.4", "1 AI 素养", "提示词：有效的结构");
  card(s, 0.5, 1.1, 9.0, 2.15, "1B2B24");
  const tpl = [
    "【角色】你是一位帮助大一学生的编程助教。",
    "【背景】我在做 OpenJudge 上的一道题，n ≤ 10^5，时限 1 秒。",
    "【我的尝试】（贴上代码）",
    "【现象】样例过了，提交后 TLE。",
    "【问题】我的复杂度是多少？瓶颈在哪一行？请只指出问题，不要直接给完整代码。",
  ];
  tpl.forEach((l, i) => {
    text(s, l, 0.75, 1.28 + i * 0.36, 8.5, 0.34, { fontSize: 11.5, fontFace: MONO, color: i === 4 ? C.gold : C.mint, bold: i === 4, margin: 0 });
  });
  text(s, "五个要素：**角色、背景（含约束）、已有尝试、观察到的现象、明确的问题**。", 0.5, 3.45, 9, 0.4, { fontSize: 12.5 });
  callout(s, "最后一句是关键", '`不要直接给完整代码`——让 AI **指路而不是代跑**，你才在学习。', 0.5, 3.95, 9.0, 1.0, { fontSize: 13, fill: C.mint, tcolor: C.dark });
}

// 1.5 AI-assisted coding: can / cannot
{
  const s = content("1.5", "1 AI 素养", "AI 辅助编程：能与不能");
  card(s, 0.5, 1.1, 4.4, 3.9, C.mint);
  text(s, "能（推荐）", 0.75, 1.25, 3.5, 0.35, { fontSize: 15, bold: true, color: C.dark, margin: 0 });
  bullets(s, [
    "**解释报错**：把 traceback 贴给它，让它翻译成人话",
    "**审查代码**：问「这段代码在什么输入下会出错」——这是 AI 最有价值的用法",
    "**补测试数据**：让它构造边界情况，然后你自己验证",
    "**解释算法**：让它用比喻和小例子讲一个你不懂的概念",
    "**写样板代码**：读入模板、格式化输出这类没有思维含量的部分",
  ], 0.75, 1.7, 4.0, 3.2, { fontSize: 11.5, gap: 8 });
  card(s, 5.1, 1.1, 4.4, 3.9, "FDF0EE");
  text(s, "不能（红线）", 5.35, 1.25, 3.5, 0.35, { fontSize: 15, bold: true, color: C.bad, margin: 0 });
  bullets(s, [
    "❌ 让它写作业代码然后原样提交",
    "❌ 相信它给的题号、链接、成绩规则、考试安排",
    "❌ **考试中使用任何 AI 工具**——包括本地模型和 IDE 的智能补全插件",
  ], 5.35, 1.7, 4.0, 2.0, { fontSize: 12, gap: 12 });
}

// 1.6 academic integrity
{
  const s = content("1.6", "1 AI 素养", "学术诚信");
  card(s, 0.5, 1.1, 9.0, 1.5, C.dark);
  text(s, "⚠️ 期末上机考试禁止任何 AI 工具。", 0.8, 1.3, 8.4, 0.45, { fontSize: 16, bold: true, color: C.gold, margin: 0 });
  text(s, "⚠️ 无法解释自己提交的代码，按学术不端处理，成绩记 0。", 0.8, 1.85, 8.4, 0.45, { fontSize: 16, bold: true, color: C.gold, margin: 0 });
  text(s, "这不是一条可以商量的文案，而是**考核制度**。它也直接决定了你平时该怎么学：", 0.5, 2.85, 9, 0.4, { fontSize: 12.5 });
  callout(s, "自检", "每完成一道题，关掉所有窗口，从空文件重写一遍。写不出来，说明这道题**你没有做**，只是围观了 AI 做题。", 0.5, 3.35, 9.0, 1.6, { fontSize: 13.5, fill: C.mint, tcolor: C.dark, lsm: 1.25 });
}

// ============================ PART 2 ============================
sectionSlide("Part 2", "12 月月考讲评", "6 题 / 112 分钟，期末机考的同构演练\n每题都做错误归因——比讲正解更重要的，是搞清楚大家为什么会错");

// overview
{
  const s = content("2", "2 月考讲评", "一套样卷，六个难度台阶");
  const probs = [
    ["E29945", "神秘数字的宇宙旅行", "模拟 / Collatz 轨迹", "★★☆☆☆"],
    ["E29946", "删数问题", "单调栈、贪心", "★★★☆☆"],
    ["E30091", "缺德的图书馆管理员", "模拟 / 贪心", "★★★☆☆"],
    ["M27371", "Playfair密码", "字符串、矩阵模拟", "★★★★☆"],
    ["T30201", "旅行售货商问题", "状态压缩 DP", "★★★★☆"],
    ["T30204", "小P的LLM推理加速", "周期能耗、贪心", "★★★★★"],
  ];
  probs.forEach((p, i) => {
    const y = 1.1 + i * 0.63;
    card(s, 0.5, y, 9.0, 0.53, i % 2 === 0 ? C.code : "FFFFFF");
    pill(s, p[0], 0.65, y + 0.08, 0.7, 0.37, C.dark, C.gold, 12);
    text(s, p[1], 1.55, y, 2.6, 0.53, { fontSize: 13, bold: true, color: C.dark, valign: "middle", margin: 0 });
    text(s, p[2], 4.25, y, 3.15, 0.53, { fontSize: 11, color: C.muted, valign: "middle", margin: 0 });
    text(s, p[3], 7.55, y, 1.8, 0.53, { fontSize: 13, color: C.goldText, bold: true, valign: "middle", margin: 0 });
  });
  text(s, "**本节的重点**：不是把六题的正解讲一遍，而是对每题做**错误归因**——同一个坑，下次换个皮还会踩。", 0.5, 4.85, 9, 0.35, { fontSize: 10.5, color: C.muted });
}

// ---- T1 ----
{
  const s = content("T1", "2 月考讲评 · T1 E29945 神秘数字的宇宙旅行", "模拟：Collatz 轨迹");
  text(s, "从正整数 n（≤ 2,000,000）开始：偶数变 n/2，奇数变 3n+1；逐步输出每次跳跃的算式，直到跳到 1，最后输出 End。", 0.5, 1.05, 9, 0.5, { fontSize: 12, lsm: 1.1 });
  codeBlock(s, `n = int(input())
while n != 1:
    if n % 2:
        print(f'{n}*3+1={3*n+1}')
        n = 3 * n + 1
    else:
        print(f'{n}/2={n//2}')
        n //= 2
print('End')`, 0.5, 1.6, 5.6, 1.95, { fontSize: 11, lang: "py" });
  consoleBlock(s, "输入: 5\n5*3+1=16, 16/2=8, 8/2=4, 4/2=2, 2/2=1, End", 0.5, 3.65, 5.6, 0.85, 10);
  callout(s, "为什么一定会停在 1", "这是著名的「3n+1 猜想」——目前无人证明对所有正整数都成立，但 2×10⁶ 范围内已逐一验证过都会停，题目保证不会死循环。", 6.3, 1.6, 3.2, 2.2, { fontSize: 10.5 });
}

// ---- T2 ----
{
  const s = content("T2", "2 月考讲评 · T2 E29946 删数问题", "单调栈：贪心删大数字");
  text(s, "给定最多 250 位的正整数，删除恰好 k 位并保持剩余数字顺序，使所得非负整数最小。", 0.5, 1.05, 9, 0.35, { fontSize: 12 });
  codeBlock(s, `n = input().strip()
k = int(input())
stack = []
for ch in n:
    while k and stack and stack[-1] > ch:
        stack.pop(); k -= 1
    stack.append(ch)
if k:
    stack = stack[:-k]
print(("".join(stack)).lstrip('0') or '0')`, 0.5, 1.5, 5.6, 2.3, { fontSize: 10.5, lang: "py" });
  consoleBlock(s, "输入: 175438 / k=4\n输出: 13", 0.5, 3.95, 5.6, 0.75, 10.5);
  callout(s, "单调栈：越靠前的数字影响越大", "从左到右扫描，只要当前数字比栈顶小、还有删除名额，就弹掉栈顶——相当于优先删掉「前面比后面大」的高位数字，剩下的名额留到末尾删。", 6.3, 1.5, 3.2, 3.2, { fontSize: 10.5 });
}

// ---- T3 ----
{
  const s = content("T3", "2 月考讲评 · T3 E30091 缺德的图书馆管理员", "模拟：相遇即擦肩而过");
  text(s, "走廊坐标 1..L，学生以速度 1 行走，相向相遇就同时转身；不知道每人初始朝哪，求全部离开的最短和最长可能时间。", 0.5, 1.05, 9, 0.5, { fontSize: 12, lsm: 1.1 });
  codeBlock(s, `L = int(input())
n = int(input())
pos = list(map(int, input().split())) if n else []
print(max(min(x, L + 1 - x) for x in pos) if pos else 0,
      max(max(x, L + 1 - x) for x in pos) if pos else 0)`, 0.5, 1.7, 9.0, 1.55, { fontSize: 12, lang: "py" });
  consoleBlock(s, "输入: L=4 / n=2 / pos=1 3\n输出: 2 4", 0.5, 3.45, 4.35, 0.85, 11);
  callout(s, "相遇可以看成两人擦肩而过", "相向而行、相遇后同时转身，等价于两人互不影响地穿过对方——所以每人的离开时刻只取决于自己到最近/最远出口的距离，不用真的模拟碰撞。", 5.0, 3.45, 4.5, 1.35, { fontSize: 10 });
}

// ---- T4 ----
{
  const s = content("T4", "2 月考讲评 · T4 M27371 Playfair密码", "字符串、5×5 矩阵模拟");
  text(s, "用去重后的密钥和去掉 j 的字母表构造 5×5 矩阵；明文按字母对分组，重复字母间插入 x（首字母为 x 时插入 q），奇数长度末尾补字符，再按同行右移 / 同列下移 / 矩形换列加密。", 0.5, 1.0, 9, 0.6, { fontSize: 10.5, lsm: 1.1 });
  codeBlock(s, `import string
key = input().strip(); q = int(input())
seq = []
for ch in key + string.ascii_lowercase.replace('j', ''):
    ch = 'i' if ch == 'j' else ch
    if ch not in seq: seq.append(ch)
at = {ch: divmod(i, 5) for i, ch in enumerate(seq)}
def enc_pair(a, b):
    ra, ca = at[a]; rb, cb = at[b]
    if ra == rb: return seq[ra*5+(ca+1)%5] + seq[rb*5+(cb+1)%5]
    if ca == cb: return seq[((ra+1)%5)*5+ca] + seq[((rb+1)%5)*5+cb]
    return seq[ra*5+cb] + seq[rb*5+ca]
for _ in range(q):
    s = input().strip().replace('j', 'i'); out = []
    i = 0
    while i < len(s):
        a = s[i]; b = s[i+1] if i+1 < len(s) else ('q' if a == 'x' else 'x')
        if a == b: b = 'q' if a == 'x' else 'x'
        else: i += 1
        out.append(enc_pair(a, b)); i += 1
    print(''.join(out))`, 0.5, 1.65, 5.9, 3.05, { fontSize: 8.3, lang: "py" });
  consoleBlock(s, "输入: key=keyword / q=1\nballoon\n输出: cbizsces", 6.55, 1.65, 2.95, 0.85, 10);
  callout(s, "三种加密规则", "同行：各自右移一格取字符；同列：各自下移一格；否则取「矩形对角」——本行取对方所在列。`enc_pair` 三个分支各对应一种。", 6.55, 2.65, 2.95, 2.05, { fontSize: 9.5 });
}

// ---- T5 ----
{
  const s = content("T5", "2 月考讲评 · T5 T30201 旅行售货商问题", "状态压缩 DP：集合当下标");
  text(s, "3 ≤ n ≤ 18 个城市完全连通，从任意城市出发访问每城恰好一次并回到起点，求最小总费用。", 0.5, 1.05, 9, 0.35, { fontSize: 12 });
  codeBlock(s, `n = int(input()); c = [list(map(int, input().split())) for _ in range(n)]
INF = 10**18
dp = [[INF] * n for _ in range(1 << n)]
dp[1][0] = 0
for mask in range(1 << n):
    for u in range(n):
        if dp[mask][u] == INF: continue
        for v in range(n):
            if not mask >> v & 1:
                nm = mask | (1 << v)
                dp[nm][v] = min(dp[nm][v], dp[mask][u] + c[u][v])
full = (1 << n) - 1
print(min(dp[full][u] + c[u][0] for u in range(1, n)))`, 0.5, 1.5, 9.0, 2.55, { fontSize: 10.5, lang: "py" });
  consoleBlock(s, "输入: n=4 及一个 4×4 费用矩阵\n输出: 7", 0.5, 4.2, 4.35, 0.75, 9.5);
  callout(s, "已访问集合 + 当前城市", "mask 第 i 位是 1 表示城市 i 已访问；从 dp[mask][u] 转移到未访问的 v，n≤18 时 2¹⁸×18×18≈8×10⁷，可过。", 5.0, 4.2, 4.5, 0.75, { fontSize: 8.3 });
}

// ---- T6 ----
{
  const s = content("T6", "2 月考讲评 · T6 T30204 小P的LLM推理加速", "周期能耗：二分 + 前缀贪心");
  text(s, "第 i 个核的能耗按 xᵢ,yᵢ,xᵢ,yᵢ,... 交替；总预算 m，任意分配任务，求最多完成的总周期数。完成 2q+1 个周期的成本是 q·(xᵢ+yᵢ)+xᵢ。", 0.5, 1.0, 9, 0.55, { fontSize: 11, lsm: 1.1 });
  codeBlock(s, `import sys
data = list(map(int, sys.stdin.buffer.read().split()))
n, budget = data[:2]
x = sorted(data[i] for i in range(2, 2 * n + 2, 2))
pair = min(data[i] + data[i + 1] for i in range(2, 2 * n + 2, 2))
prefix = [0]
for v in x:
    prefix.append(prefix[-1] + v)

def feasible(k):
    start = k & 1
    best = 10**30
    for odd in range(start, min(n, k) + 1, 2):
        best = min(best, (k - odd) // 2 * pair + prefix[odd])
    return best <= budget

lo, hi = 0, 2 * budget // pair + n + 1
while lo + 1 < hi:
    mid = (lo + hi) // 2
    if feasible(mid): lo = mid
    else: hi = mid
print(lo)`, 0.5, 1.6, 5.9, 3.15, { fontSize: 8.5, lang: "py" });
  consoleBlock(s, "输入: n=2 m=10 / 4 1 / 3 3\n输出: 4", 6.55, 1.6, 2.95, 0.75, 10);
  callout(s, "二分周期数，贪心判可行性", "固定周期数 k，让 odd 个核各完成 1 个周期（选 xᵢ 最小的 odd 个），剩下的周期全部以最便宜的二周期组 pair 完成——枚举 odd 找最小总成本，≤ 预算就说明 k 可行。", 6.55, 2.5, 2.95, 2.25, { fontSize: 8.5 });
}

// ============================ PART 3 ============================
sectionSlide("Part 3", "综合复习清单", "到机考前该做的两件事\n默写 12 个模板 · 重做错题");

// 3.1 templates
{
  const s = content("3.1", "3 综合复习", "必须能默写的 12 个模板");
  table(s, [
    ["#", "模板", "周次"],
    ["1", "快速输入 sys.stdin.read().split()", "W4"],
    ["2", "埃氏筛", "W4"],
    ["3", "一维/二维前缀和 + 差分", "W6、W10"],
    ["4", "多关键字排序 key=lambda x:(a,-b)", "W6"],
    ["5", "归并排序的合并（求逆序对）", "W6"],
    ["6", "单调栈（下一个更大元素）", "W7"],
    ["7", "回溯模板（选择→递归→撤销）", "W9"],
    ["8", "并查集（路径压缩+按大小合并）", "W9"],
    ["9", "0-1 背包（倒序）/ 完全背包（正序）", "W11"],
    ["10", "LIS 的 O(n log n) 写法", "W11"],
    ["11", "BFS（deque + 入队标记）", "W12"],
    ["12", "二分答案（判定 + 上/下取整）", "W12"],
  ], 0.5, 1.05, 9.0, [0.5, 6.5, 2.0], { fontSize: 9.8, rowH: 0.3, tight: true });
}

// 3.2 pitfalls
{
  const s = content("3.2", "3 综合复习", "高频陷阱清单");
  const left = [
    "忘 int() / 忘 strip()",
    "[[0]*n]*m 的别名陷阱",
    "x in list 是 O(n)；list.pop(0) 是 O(n)",
    "浮点用 == 比较；`int(x**0.5)` 差 1",
    "回溯忘 path[:] 拷贝 / 忘还原状态",
    "0-1 背包写成正序",
  ];
  const right = [
    "「恰好装满」没用 ±inf 初始化",
    "BFS 出队时才标记 visited",
    "带状态的搜索少加了一维",
    "二分答案的取整方向写反导致死循环",
    "多关键字排序只写了一个 key",
    "输出格式：多余空格 / 换行 / 精度",
  ];
  card(s, 0.5, 1.1, 4.4, 3.9, C.code);
  bullets(s, left, 0.75, 1.3, 4.0, 3.5, { fontSize: 12, gap: 14 });
  card(s, 5.1, 1.1, 4.4, 3.9, C.code);
  bullets(s, right, 5.35, 1.3, 4.0, 3.5, { fontSize: 12, gap: 14 });
}

// 3.3 review schedule
{
  const s = content("3.3", "3 综合复习", "复习节奏建议（本周到机考）");
  table(s, [
    ["天数", "任务"],
    ["第 1–2 天", "默写 3.1 的 12 个模板，写不出的回去看对应周讲义"],
    ["第 3–4 天", "重做月考错题（关题解、从空文件写）"],
    ["第 5–6 天", "按题型各刷 2 题（贪心 / DP / BFS / 回溯 / 并查集 / 二分）"],
    ["第 7 天", "限时模拟一整套（112 分钟 6 题），只看时间不看对错"],
    ["考前一天", "只整理 cheat sheet，不做新题"],
  ], 0.5, 1.1, 9.0, [1.8, 7.2], { fontSize: 12.5, rowH: 0.62 });
}

// homework
{
  const s = content("✎", "本周练习", "本周作业");
  table(s, [
    ["#", "任务", "说明"],
    ["1", "订正 12 月月考全部未 AC 题", "三分类 + 关题解重写（W5 第 5 节）"],
    ["2", "默写 3.1 的 12 个模板", "不看讲义"],
    ["3", "完成一页 A4 cheat sheet", "手写，双面"],
    ["4", "用 AI 审查自己的一份 WA 代码", "记录它指出的问题里有几条是对的"],
    ["5", "找出 AI 的一次幻觉并记录", "例如让它报 5 个 OJ 题号，逐个验证"],
    ["6", "完成综合练习 6 题", "从 W13 第 5.2 节的 B / C 组选"],
  ], 0.5, 1.05, 9.0, [0.5, 3.6, 4.9], { fontSize: 11.5, rowH: 0.5 });
}

// thinking questions (1/2)
{
  const s = content("?", "本周练习 · 思考题", "思考题（1/4）");
  const qs = [
    ["1", "为什么 LLM 在「数一句话里有几个字母 r」这类任务上容易出错？（提示：token 不是字符）"],
    ["2", "提示词里加上「不要直接给完整代码」，对你的学习效果有什么影响？试两周再回答。"],
    ["3", "T2 的排序键若用浮点 t/w，在什么数据下会出问题？构造一组验证。"],
    ["4", "T4 若改成「至多 k 段」，代码要改哪一行？答案会变大还是变小？"],
  ];
  qs.forEach((q, i) => {
    const x = 0.5 + (i % 2) * 4.6, y = 1.1 + Math.floor(i / 2) * 2.0;
    card(s, x, y, 4.4, 1.85, i % 3 === 0 ? C.code : C.cream);
    numCircle(s, Number(q[0]), x + 0.18, y + 0.15, 0.4, C.dark);
    s.addText(runs(q[1], { color: C.text }), { x: x + 0.2, y: y + 0.68, w: 4.0, h: 1.1, fontFace: FONT, fontSize: 11.5, margin: 0, isTextBox: true, valign: "top" });
  });
}
// thinking questions (2/2)
{
  const s = content("?", "本周练习 · 思考题", "思考题（2/4）");
  const qs = [
    ["5", "T5 的判据若从 <= k 改成 == k，在样例 5 3 / 1 2 3 4 5 上会输出什么？为什么？"],
    ["6", "T6 若允许 a == b（自己和自己是敌人），程序会怎样？该在哪一步拦住？"],
    ["7", "注意力机制里的 softmax 为什么要减去最大值？不减会怎样？"],
  ];
  qs.forEach((q, i) => {
    const x = 0.5 + (i % 2) * 4.6, y = 1.1 + Math.floor(i / 2) * 2.0;
    card(s, x, y, 4.4, 1.85, i % 3 === 0 ? C.code : C.cream);
    numCircle(s, Number(q[0]), x + 0.18, y + 0.15, 0.4, C.dark);
    s.addText(runs(q[1], { color: C.text }), { x: x + 0.2, y: y + 0.68, w: 4.0, h: 1.1, fontFace: FONT, fontSize: 12, margin: 0, isTextBox: true, valign: "top" });
  });
}

summarySlide("本周小结", [
  ["LLM", "在海量文本上学「下一个 token」的统计规律；四个部件是**分词、词向量、注意力、训练对齐**。"],
  ["幻觉", "源于「训练目标是合理而非正确」；最易错的是**精确标识符**。凡是数字、编号、链接**一律自己验证**。"],
  ["提示词", "五要素：角色、背景、已有尝试、现象、明确问题；加一句「**只指出问题，不要给完整代码**」。"],
  ["学术诚信", "**考试禁用任何 AI 工具；讲不清自己的代码 = 学术不端。**平时自检：关掉窗口，从空文件重写。"],
  ["复习", "六题错误归因对应六个高频坑；复习就做两件事：**默写 12 个模板** + **重做错题**。"],
]);

// Next week
{
  const s = sectionSlide("下周预告", "知识图谱、神经网络等 AI 专题", "AI 专题的正片：从图的表示到反向传播\n用 60 行代码手写一个能学习的网络");
}

  await D.save(OUT);
})().catch((e) => { console.error(e); process.exit(1); });

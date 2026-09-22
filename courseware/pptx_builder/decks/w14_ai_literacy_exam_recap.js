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
  const s = content("T1", "2 月考讲评 · T1", "课程互选统计");
  text(s, "考点：字典、集合、排序（W4）　　难度：★★☆☆☆", 0.5, 1.0, 9, 0.3, { fontSize: 11.5, color: C.muted });
  text(s, "n 个学生各选了若干门课。求**选课人数最多**的课程；若有并列，输出课程名字典序最小的那个。再求有多少对学生**至少共选了一门课**。", 0.5, 1.35, 9, 0.75, { fontSize: 12.5, lsm: 1.2 });
  card(s, 0.5, 2.2, 4.4, 1.9, C.code);
  text(s, "样例输入", 0.7, 2.3, 2, 0.3, { fontSize: 10.5, bold: true, color: C.muted, margin: 0 });
  text(s, "3\n2 math physics\n2 math chemistry\n1 physics", 0.7, 2.6, 4.0, 1.4, { fontSize: 11.5, fontFace: MONO, margin: 0 });
  card(s, 5.1, 2.2, 4.4, 1.9, "1B2B24");
  text(s, "样例输出", 5.3, 2.3, 2, 0.3, { fontSize: 10.5, bold: true, color: C.gold, margin: 0 });
  text(s, "math\n2", 5.3, 2.6, 4.0, 0.7, { fontSize: 13, fontFace: MONO, bold: true, color: C.mint, margin: 0 });
  text(s, "math 与 physics 都是 2 人，取字典序小的 math；\n共选过课的学生对：(1,2) 同选 math，(1,3) 同选 physics，共 2 对。", 5.3, 3.35, 4.0, 0.7, { fontSize: 9.5, color: C.mint, margin: 0, lsm: 1.15 });
  callout(s, "先算复杂度再动手", "题目保证 Σkᵢ ≤ 10⁴，按课程枚举学生对总数 ≤ Σ C(cᵢ,2)，最坏情况仍可控；对每对学生求集合交集是 O(n²·k)，n=1000 时 10⁷ 次 → 危险。", 0.5, 4.2, 9.0, 0.75, { fontSize: 10.5, fill: C.mint, tcolor: C.dark });
}
{
  const s = content("T1", "2 月考讲评 · T1", "参考解答");
  codeBlock(s, `from collections import defaultdict


def solve(lines):
    n = int(lines[0])
    students = []
    course_students = defaultdict(list)
    for i in range(1, n + 1):
        parts = lines[i].split()
        courses = parts[1:1 + int(parts[0])]
        students.append(set(courses))
        for c in courses:
            course_students[c].append(i - 1)

    hottest = min(course_students,
                  key=lambda c: (-len(course_students[c]), c))

    pairs = set()
    for c, ss in course_students.items():
        for a in range(len(ss)):
            for b in range(a + 1, len(ss)):
                pairs.add((ss[a], ss[b]))
    return hottest, len(pairs)


print(solve(["3", "2 math physics", "2 math chemistry", "1 physics"]))
# ('math', 2)`, 0.5, 1.1, 5.8, 3.75, { fontSize: 7.6, lang: "py" });
  callout(s, "并列时取字典序最小", "physics 也是 2 人，但 math < physics。`min(..., key=lambda c: (-len(...), c))` 一行同时处理了「人数降序」和「名字升序」。", 6.45, 1.1, 3.05, 1.6, { fontSize: 11, fill: C.mint, tcolor: C.dark, lsm: 1.2 });
  table(s, [["错法", "后果"], ["只按人数取 max，不处理并列", "并列输出不确定 → WA"], ["数学生对逐对求交集 O(n²k)", "n=1000 → 10⁷ 次 → TLE"]], 6.45, 2.85, 3.05, [1.55, 1.5], { fontSize: 9.5, rowH: 0.62 });
}

// ---- T2 ----
{
  const s = content("T2", "2 月考讲评 · T2", "最优装载顺序");
  text(s, "考点：贪心 + 交换论证（W6、W10）　　难度：★★★☆☆", 0.5, 1.0, 9, 0.3, { fontSize: 11.5, color: C.muted });
  text(s, "n 个货箱，第 i 个重 wᵢ、卸货耗时 tᵢ。按装货的逆序卸货，第 i 个被卸货箱的「等待成本」= 它前面所有被卸货箱的耗时之和 × 它的重量。求最小总成本。", 0.5, 1.35, 9, 0.75, { fontSize: 12.5, lsm: 1.2 });
  card(s, 0.5, 2.25, 4.4, 1.6, C.code);
  text(s, "样例：3 箱 (1,3) (2,1) (3,2) → 6", 0.7, 2.35, 4.0, 0.35, { fontSize: 11, bold: true, color: C.dark, margin: 0 });
  text(s, "按 t/w 升序卸货：(2,1)→(3,2)→(1,3)\n成本 = 0×2 + 1×3 + 3×1 = 6", 0.7, 2.75, 4.0, 1.0, { fontSize: 10.5, fontFace: MONO, margin: 0, lsm: 1.2 });
  callout(s, "交换论证：相邻 a、b 谁在前？", "a 在前额外成本 tₐ·w_b；b 在前额外成本 t_b·wₐ。所以 **a 排 b 前 ⟺ tₐ·w_b < t_b·wₐ ⟺ tₐ/wₐ < t_b/w_b**——按 t/w 升序。", 5.1, 2.25, 4.4, 1.9, { fontSize: 11, fill: C.mint, tcolor: C.dark, lsm: 1.2 });
}
{
  const s = content("T2", "2 月考讲评 · T2", "参考解答：浮点版 → 整数交叉相乘");
  codeBlock(s, `def min_cost(boxes):
    """boxes: [(重量, 耗时)]；按 t/w 升序卸货。"""
    order = sorted(boxes, key=lambda b: (b[1] * 1.0 / b[0]))
    elapsed, total = 0, 0
    for w, t in order:
        total += elapsed * w      # 前面耗时之和 × 本箱重量
        elapsed += t
    return total


print(min_cost([(1, 3), (2, 1), (3, 2)]))     # 6`, 0.5, 1.1, 5.8, 1.85, { fontSize: 10, lang: "py" });
  codeBlock(s, `import functools


def min_cost_int(boxes):
    def cmp(x, y):          # x 在前更优 <=> t_x*w_y < t_y*w_x
        left, right = x[1] * y[0], y[1] * x[0]
        return -1 if left < right else (1 if left > right else 0)

    order = sorted(boxes, key=functools.cmp_to_key(cmp))
    elapsed, total = 0, 0
    for w, t in order:
        total += elapsed * w
        elapsed += t
    return total


print(min_cost_int([(1, 3), (2, 1), (3, 2)]))    # 6`, 0.5, 3.05, 5.8, 2.05, { fontSize: 8.2, lang: "py" });
  callout(s, "为什么推荐整数版", "大数据下 `t/w` 浮点排序在相等值附近的误差会让顺序不稳，偶发 WA；`cmp_to_key` 交叉相乘完全避开浮点。", 6.45, 1.1, 3.05, 1.55, { fontSize: 11, fill: C.mint, tcolor: C.dark, lsm: 1.2 });
  table(s, [["错法", "后果"], ["按 w 降序 / t 升序", "反例 (1,100)(100,1) → WA"], ["t/w 浮点排序", "大数据偶发 WA"], ["每次重算前缀和", "O(n²) → TLE"]], 6.45, 2.85, 3.05, [1.4, 1.65], { fontSize: 9, rowH: 0.46 });
}

// ---- T3 ----
{
  const s = content("T3", "2 月考讲评 · T3", "网格中的宝藏");
  text(s, "考点：带状态 BFS（W12）　　难度：★★★☆☆", 0.5, 1.0, 9, 0.3, { fontSize: 11.5, color: C.muted });
  text(s, "n×m 网格，`.` 可走、`#` 是墙、`K` 钥匙、`D` 上锁的门（拿到钥匙后可通过，一把钥匙开所有门）、S 起点、T 终点。求 S 到 T 的最少步数。", 0.5, 1.35, 9, 0.75, { fontSize: 12.5, lsm: 1.2 });
  card(s, 0.5, 2.25, 4.4, 1.9, C.code);
  text(s, "样例：3×5，答案 8", 0.7, 2.35, 4, 0.3, { fontSize: 11, bold: true, color: C.dark, margin: 0 });
  text(s, "S . D . T\n. # . # .\n. . K . .", 0.7, 2.7, 4.0, 1.3, { fontSize: 15, fontFace: MONO, bold: true, color: C.dark, margin: 0, lsm: 1.3 });
  callout(s, "关键：状态要不要加一维", "状态是 `(x, y, 是否已拿到钥匙)`——两层网格。如果「同一个格子，在不同情况下能做的事不同」，就必须加维——这是 BFS 题的核心判断。", 5.1, 2.25, 4.4, 1.9, { fontSize: 11.5, fill: C.mint, tcolor: C.dark, lsm: 1.2 });
}
{
  const s = content("T3", "2 月考讲评 · T3", "参考解答");
  codeBlock(s, `from collections import deque

def treasure(grid):
    n, m = len(grid), len(grid[0])
    sx = sy = tx = ty = -1
    for i in range(n):
        for j in range(m):
            if grid[i][j] == 'S': sx, sy = i, j
            elif grid[i][j] == 'T': tx, ty = i, j
    DIRS = ((-1,0),(1,0),(0,-1),(0,1))
    dist = [[[-1]*m for _ in range(n)] for _ in range(2)]   # dist[has_key][x][y]
    start_key = 1 if grid[sx][sy] == 'K' else 0
    dist[start_key][sx][sy] = 0
    q = deque([(sx, sy, start_key)])
    while q:
        x, y, k = q.popleft()
        if (x, y) == (tx, ty):
            return dist[k][x][y]
        for dx, dy in DIRS:
            nx, ny = x+dx, y+dy
            if not (0 <= nx < n and 0 <= ny < m): continue
            cell = grid[nx][ny]
            if cell == '#': continue
            if cell == 'D' and k == 0: continue   # 没钥匙，过不去
            nk = 1 if cell == 'K' else k
            if dist[nk][nx][ny] >= 0: continue
            dist[nk][nx][ny] = dist[k][x][y] + 1
            q.append((nx, ny, nk))
    return -1

print(treasure(["S.D.T", ".#.#.", "..K.."]))  # 8`, 0.5, 1.1, 8.95, 4.05, { fontSize: 7.5, lang: "py" });
}
{
  const s = content("T3", "2 月考讲评 · T3", "错误归因");
  table(s, [
    ["错法", "后果"],
    ["visited[x][y] 只有一层", "拿钥匙前访问过的格子，拿钥匙后进不去 → WA（答案偏大或 -1）"],
    ["用 DFS 求最短步数", "第一次到达不是最短 → WA"],
    ["用 list.pop(0)", "500×500×2 = 5×10⁵ 状态 → TLE"],
    ["忘了起点本身可能是钥匙", "边界 WA"],
  ], 0.5, 1.3, 9.0, [3.0, 6.0], { fontSize: 13, rowH: 0.5 });
  callout(s, "「状态里要不要加一维」是 BFS 题的核心判断", "如果「同一个格子，在不同情况下能做的事不同」，就必须加维。", 0.5, 4.2, 9.0, 0.7, { fontSize: 12.5, fill: C.mint, tcolor: C.dark });
}

// ---- T4 ----
{
  const s = content("T4", "2 月考讲评 · T4", "分组考试");
  text(s, "考点：DP + 前缀和（W10、W11）　　难度：★★★★☆", 0.5, 1.0, 9, 0.3, { fontSize: 11.5, color: C.muted });
  text(s, "n 个学生按学号排成一列，成绩 a₁..aₙ。切成**恰好 k 段**连续区间，每段「不平衡度」= 段内最大值−最小值。求总不平衡度的最小值。", 0.5, 1.35, 9, 0.75, { fontSize: 12.5, lsm: 1.2 });
  card(s, 0.5, 2.25, 4.4, 1.6, C.code);
  text(s, "样例：[1,3,5,5,9], k=2 → 4", 0.7, 2.35, 4, 0.3, { fontSize: 11, bold: true, color: C.dark, margin: 0 });
  text(s, "切成 [1,3,5,5]（度 4）与 [9]（度 0）\n总计 4", 0.7, 2.75, 4.0, 0.8, { fontSize: 11, fontFace: MONO, margin: 0, lsm: 1.2 });
  callout(s, "状态 / 转移 / 边界", "`dp[i][j]` = 前 i 人分 j 段的最小总不平衡度；`dp[i][j] = min(dp[t][j-1] + cost(t+1,i))`；`dp[0][0]=0`，其余 +inf，答案 `dp[n][k]`。", 5.1, 2.25, 4.4, 1.9, { fontSize: 11, fill: C.mint, tcolor: C.dark, lsm: 1.2 });
}
{
  const s = content("T4", "2 月考讲评 · T4", "参考解答：O(n²k)");
  codeBlock(s, `def group_exam(a, k):
    n = len(a)
    INF = float('inf')
    cost = [[0] * n for _ in range(n)]      # cost[l][r] = a[l..r] 最大-最小
    for l in range(n):
        mx = mn = a[l]
        for r in range(l, n):
            mx, mn = max(mx, a[r]), min(mn, a[r])
            cost[l][r] = mx - mn

    dp = [[INF] * (k + 1) for _ in range(n + 1)]
    dp[0][0] = 0
    for i in range(1, n + 1):
        for j in range(1, min(i, k) + 1):
            best = INF
            for t in range(j - 1, i):          # 上一段结束于 t
                if dp[t][j - 1] < INF:
                    best = min(best, dp[t][j - 1] + cost[t][i - 1])
            dp[i][j] = best
    return dp[n][k]


print(group_exam([1, 3, 5, 5, 9], 2))       # 4
print(group_exam([1, 3, 5, 5, 9], 1))       # 8`, 0.5, 1.1, 5.8, 3.75, { fontSize: 9.0, lang: "py" });
  callout(s, "「恰好 k 段」的坑", "`dp` 全初始化为 0 会让「恰好 k 段」退化成「至多 k 段」→ 答案偏小 WA。必须用 **+inf** 初始化——第 11 周 1.5 节讲过的坑，这里再犯一次的人非常多。", 6.45, 1.1, 3.05, 1.9, { fontSize: 11, fill: "FDF0EE", tcolor: C.bad, lsm: 1.2 });
  table(s, [["错法", "后果"], ["dp 全初始化为 0", "「恰好」退化成「至多」→ WA"], ["现算 cost(t+1,i)", "O(n³k) → TLE"], ["贪心切最大间隙", "不平衡度不可加 → WA"]], 6.45, 3.15, 3.05, [1.35, 1.7], { fontSize: 8.2, rowH: 0.36 });
}

// ---- T5 ----
{
  const s = content("T5", "2 月考讲评 · T5", "书架分层");
  text(s, "考点：二分答案 + 贪心校验（W12、W13）　　难度：★★★★☆", 0.5, 1.0, 9, 0.3, { fontSize: 11.5, color: C.muted });
  text(s, "n 本书按顺序排列，第 i 本厚 aᵢ。放进**恰好 k 层**书架，每层放连续一段。一层「承重」= 该层书厚度之和。求最大承重的最小值。", 0.5, 1.35, 9, 0.75, { fontSize: 12.5, lsm: 1.2 });
  card(s, 0.5, 2.25, 4.4, 1.6, C.code);
  text(s, "样例：[1,2,3,4,5], k=3 → 6", 0.7, 2.35, 4, 0.3, { fontSize: 11, bold: true, color: C.dark, margin: 0 });
  text(s, "切成 [1,2,3][4][5]，承重 6,4,5\n最大承重 6，任何切法都不小于 6", 0.7, 2.75, 4.0, 0.9, { fontSize: 10.5, fontFace: MONO, margin: 0, lsm: 1.2 });
  callout(s, "为什么能二分", "答案具有单调性：承重上限 cap 越大，需要的层数越少。「最小的可行 cap」是二分答案的标准形状；下界必须是 **max(a)**，不是 0。", 5.1, 2.25, 4.4, 1.9, { fontSize: 11.5, fill: C.mint, tcolor: C.dark, lsm: 1.2 });
}
{
  const s = content("T5", "2 月考讲评 · T5", "参考解答：O(n log Σaᵢ)");
  codeBlock(s, `def solve(n, k, a):
    def shelves(cap):                # 贪心：装不下就换下一层
        cnt, cur = 1, 0
        for x in a:
            if cur + x > cap:
                cnt += 1
                cur = x
            else:
                cur += x
        return cnt

    lo, hi = max(a), sum(a)          # 下界必须是 max(a)：单本书也要放得下
    while lo < hi:
        mid = (lo + hi) // 2
        if shelves(mid) <= k:        # 层数够少 -> 承重还能再压
            hi = mid
        else:
            lo = mid + 1
    return lo


print(solve(5, 3, [1, 2, 3, 4, 5]))     # 6`, 0.5, 1.1, 5.8, 3.35, { fontSize: 10, lang: "py" });
  callout(s, "判据是 <=k，不是 ==k", "层数比 k 少时，把任意一层再切一刀就能补到 k，承重只会更小、不会更大。", 6.45, 1.1, 3.05, 1.15, { fontSize: 11, fill: C.mint, tcolor: C.dark, lsm: 1.2 });
  table(s, [["错法", "后果"], ["下界写 0 或 1", "shelves 恒不可行"], ["mid=(lo+hi+1)//2 配 hi=mid", "死循环 TLE"], ["判据写 ==k", "答案偏大 WA"]], 6.45, 2.4, 3.05, [1.55, 1.5], { fontSize: 9, rowH: 0.6 });
}

// ---- T6 ----
{
  const s = content("T6", "2 月考讲评 · T6", "敌友阵营");
  text(s, "考点：扩展域并查集（W09）　　难度：★★★★★", 0.5, 1.0, 9, 0.3, { fontSize: 11.5, color: C.muted });
  text(s, "n 人给出 m 条关系（F 朋友 / E 敌人），按输入顺序生效：朋友的朋友是朋友，敌人的敌人是朋友，朋友的敌人是敌人。矛盾的关系跳过。求第一条矛盾关系的编号、最终朋友团体数。", 0.5, 1.35, 9, 0.95, { fontSize: 12, lsm: 1.2 });
  card(s, 0.5, 2.45, 4.4, 1.55, C.code);
  text(s, "样例：F12 E23 E34 F45 → 0 / 2", 0.7, 2.55, 4, 0.3, { fontSize: 10.5, bold: true, color: C.dark, margin: 0 });
  text(s, "E23、E34 推出 2、4 是朋友；\n1,2,4,5 一团体，3 独自，共 2 个", 0.7, 2.9, 4.0, 0.9, { fontSize: 10, margin: 0, lsm: 1.2 });
  callout(s, "扩展域", "给每人开两个点：`i`（本人）与 `i+n`（对立面）。朋友把两域同向合并，敌人交叉合并——出现「否定」且否定间还能推理，就开对立域。", 5.1, 2.45, 4.4, 1.9, { fontSize: 11, fill: C.mint, tcolor: C.dark, lsm: 1.2 });
}
{
  const s = content("T6", "2 月考讲评 · T6", "参考解答");
  codeBlock(s, `p = list(range(2 * n + 1))          # i 与 i+n 互为对立域

def find(x):
    while p[x] != x:
        p[x] = p[p[x]]               # 路径压缩：不写这行，10^5 条关系就 TLE
        x = p[x]
    return x

def union(x, y):
    rx, ry = find(x), find(y)
    if rx != ry: p[rx] = ry

bad = 0
for i, (op, a, b) in enumerate(relations, 1):
    if op == 'F':
        conflict = find(a) == find(b + n)     # 说好朋友却已推出敌人
    else:
        conflict = find(a) == find(b)         # 说好敌人却已推出朋友
    if conflict:
        if bad == 0: bad = i
        continue                              # 矛盾的关系不采纳
    if op == 'F':
        union(a, b); union(a + n, b + n)
    else:
        union(a, b + n); union(a + n, b)
# bad=0, 团体数=len({find(i) for i in range(1,n+1)})=2`, 0.5, 1.1, 8.95, 4.0, { fontSize: 8.5, lang: "py" });
}
{
  const s = content("T6", "2 月考讲评 · T6", "错误归因");
  table(s, [
    ["错法", "后果"],
    ["find 里不写路径压缩", "链式数据退化 O(n)，10⁵ 条关系 → TLE"],
    ["只开 n 个点，另用「敌人表」记录", "推不出「敌人的敌人是朋友」→ WA"],
    ["E a b 只写 union(a,b+n)，漏了 union(a+n,b)", "对称性丢失，部分矛盾查不出来 → WA"],
    ["判出矛盾后照样合并", "错误信息污染后续判断 → 团体数 WA"],
    ["数团体时把 1..2n 全数一遍", "对立域被当成真人 → 个数翻倍 WA"],
  ], 0.5, 1.15, 9.0, [3.6, 5.4], { fontSize: 10.5, rowH: 0.42 });
  callout(s, "「要不要开对立域」的判据", "关系里出现了**否定**（敌人、异类、不同侧），且否定之间还能推理，就开——这与 T3 的「状态要不要加一维」是同一类判断：**信息装不进现有的状态，就扩状态**。", 0.5, 4.0, 9.0, 0.9, { fontSize: 11, fill: C.mint, tcolor: C.dark, lsm: 1.15 });
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

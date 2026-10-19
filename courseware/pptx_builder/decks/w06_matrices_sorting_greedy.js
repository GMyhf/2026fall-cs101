// 第 6 周 矩阵、排序与贪心：认识时间复杂度 —— 由 202610_ADS_W06_Matrices_Sorting_Greedy.md 整理成的讲课 PPT。
// 生成：cd courseware/pptx_builder && node decks/w06_matrices_sorting_greedy.js ../202610_ADS_W06_Matrices_Sorting_Greedy.pptx
// 页上所有的运行结果都在 Python 3.12 下实跑核对过；改代码时连同结果一起改。
const path = require("path");
const { createDeck } = require("../lib");

const OUT = process.argv[2] || path.join(__dirname, "..", "out", "202610_ADS_W06_Matrices_Sorting_Greedy.pptx");

(async () => {
  const D = createDeck({ title: "计算概论（B）第 6 周 矩阵、排序与贪心", author: "Hongfei Yan" });
  const {
    pres, C, FONT, MONO, runs, text, bullets, card, codeBlock, consoleBlock, callout, table,
    cells, arrowLabel, pill, numCircle, titleSlide, sectionSlide, content, summarySlide,
  } = D;

  // ---- 手排页构件 ----
  // 1.0 矩阵基础（6 页）、1.4 矩阵乘法的三页讲解、E23555 的三页不走 card/callout 的版式，
  // 坐标是按 EMU 整数手排的，这里原样保留：E() 把 EMU 换成英寸。文本框一律零边距、溢出时缩字。
  const E = (v) => v / 914400;
  const SHAPE = { rect: pres.shapes.RECTANGLE, ellipse: pres.shapes.OVAL, roundRect: pres.shapes.ROUNDED_RECTANGLE };
  const ALIGN = { l: "left", ctr: "center", r: "right" };
  const CJK = /([\u2460-\u24ff\u3000-\u303f\u4e00-\u9fff\uff00-\uffef]+)/;   // 中文、全角标点、①②③
  // 底板 / 色块（圆角取短边的 4%）
  function plate(s, x, y, w, h, fill, shape = "roundRect") {
    s.addShape(SHAPE[shape], {
      x: E(x), y: E(y), w: E(w), h: E(h), fill: { color: fill }, line: { type: "none" },
      ...(shape === "roundRect" ? { rectRadius: E(Math.min(w, h)) * 0.04 } : {}),
    });
  }
  // 文本框。paras 每项是一段：[段后间距 pt（可省）, run, run, ...]；run = [文字, 字号, 颜色, "b" 粗体 / "m" 等宽]
  function tbox(s, x, y, w, h, paras, { anchor = "t", align = "l" } = {}) {
    const arr = [];
    paras.forEach((p, i) => {
      const after = typeof p[0] === "number" ? p[0] : 0;
      const rs = typeof p[0] === "number" ? p.slice(1) : p;
      rs.forEach(([t, fs, color, fl = ""], j) => {
        // pptxgenjs 把 fontFace 同时写进 latin 与 ea，而 Consolas 没有中文字形：
        // 等宽 run 里的中文（含全角标点、①②③）拆出来用正文字体，与原页「西文 Consolas、中文雅黑」一致
        const parts = (fl.includes("m") ? t.split(CJK).filter((x) => x.length) : [t]).concat(t ? [] : [""]);
        parts.forEach((pt, k) => {
          const o = { fontSize: fs, color, fontFace: fl.includes("m") && !CJK.test(pt) ? MONO : FONT };
          if (fl.includes("b")) o.bold = true;
          if (j === 0 && k === 0 && after) o.paraSpaceAfter = after;
          if (j === rs.length - 1 && k === parts.length - 1 && i < paras.length - 1) o.breakLine = true;
          arr.push({ text: pt, options: o });
        });
      });
    });
    s.addText(arr, {
      x: E(x), y: E(y), w: E(w), h: E(h), margin: 0, valign: anchor === "ctr" ? "middle" : "top", align: ALIGN[align],
      fontFace: FONT, isTextBox: true, fit: "shrink",
    });
  }
  // 代码 → tbox 的段落（每行一段，等宽、不着色）
  const mono = (code, fs) => code.split("\n").map((ln) => [[ln, fs, C.text, "m"]]);
  // 单个格子：色块 + 居中文字
  function cell(s, x, y, w, h, fill, run, shape = "rect") {
    plate(s, x, y, w, h, fill, shape);
    tbox(s, x, y, w, h, [[run]], { anchor: "ctr", align: "ctr" });
  }
  // 矩阵：rows 为二维数组，格子 w×h、间隔 gap；hl = { "行,列": 底色 } 单独着色
  function mat(s, x, y, w, h, gap, rows, { fs = 12, color = C.dark, flags = "b", fill = C.white, hl = {}, shape = "rect" } = {}) {
    rows.forEach((row, i) => row.forEach((v, j) => {
      cell(s, x + j * (w + gap), y + i * (h + gap), w, h, hl[`${i},${j}`] || fill, [String(v), fs, color, flags], shape);
    }));
  }
  // 页脚的术语注释（自动撑高的文本框，默认内边距）
  function footnote(s, str, y) {
    s.addText([{ text: str, options: { fontSize: 9.5, color: "5F7068", fontFace: FONT } }], { x: 0.5, y, w: 9.0, h: 0.4, valign: "top", fit: "resize", isTextBox: true });
  }
  // 交换论证的三步卡片页（3.4 前三页共用）：引语 + 三张步骤卡 + 底部小结
  function threeSteps(s, intro, steps, [ctitle, cbody]) {
    text(s, intro, 0.5, 1.05, 9, 0.35, { fontSize: 13 });
    steps.forEach((st, i) => {
      const y = 1.48 + i * 0.86;
      card(s, 0.5, y, 9.0, 0.76, i === 2 ? C.cream : C.code);
      numCircle(s, i + 1, 0.66, y + 0.1, 0.36, i === 2 ? C.goldText : C.dark);
      text(s, st[0], 1.25, y + 0.06, 8.0, 0.34, { fontSize: 12.5, bold: true, color: C.dark, margin: 0 });
      text(s, st[1], 1.25, y + 0.4, 8.0, 0.32, { fontSize: 10.8, color: C.muted, margin: 0 });
    });
    callout(s, ctitle, cbody, 0.5, 4.15, 9.0, 0.85, { fontSize: 11.5, fill: C.mint, tcolor: C.dark });
  }

// ---- slides（顶层不缩进，避免改动模板字符串里的代码缩进）----
// =====================================================================
// Cover
titleSlide({
  kicker: "计算概论（B） · 第 6 周 · 2026 Fall",
  title: "矩阵、排序与贪心",
  subtitle: "认识时间复杂度",
  topics: "二维列表表示 · 保护圈与方向数组 · 转置 / 旋转 · 矩阵乘法 · 二维前缀和\nsorted 与 key · 稳定性 · 五种基础排序 · 归并求逆序对\n贪心的三要素 · 排序型贪心 · 交换论证 · 同一道题的三种复杂度写法",
  footer: "Compiled by Hongfei Yan · 2026 Fall · github.com/GMyhf/2026fall-cs101",
});

// Three questions
{
  const s = content("?", "本周导引", "本周要回答三个问题");
  const qs = [
    ["二维数据怎么摆脱越界判断？", "**保护圈**在四周补一圈哨兵值，内部循环就不用再判断 `0 <= i < m`。"],
    ["`sorted` 会用就够吗？", "多关键字、稳定性、**自定义比较**——够应付大多数题，但**排序键怎么来**才是难点。"],
    ["贪心为什么有时错？", "找零 `[1,3,4]` 凑 6，贪心给 3 枚，最优只要 2 枚。**交换论证**才能把排序键真正推出来。"],
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
    { text: "从「写对」走向「写得快」：", options: { color: C.white } },
    { text: "同一个问题", options: { color: C.gold, bold: true } },
    { text: "，不同的排列组合方式，", options: { color: C.white } },
    { text: "复杂度可以差几个数量级", options: { color: C.gold, bold: true } },
    { text: "。", options: { color: C.white } },
  ], { x: 0.75, y: 4.38, w: 8.6, h: 0.5, fontFace: FONT, fontSize: 14.5, margin: 0, isTextBox: true, valign: "middle" });
}

// Roadmap
{
  const s = content("≡", "本周导引", "内容地图");
  const cols = [
    ["1  矩阵", ["1.0–1.1 矩阵基础、表示与遍历", "1.2 保护圈与方向数组", "1.3 转置与旋转", "1.4 矩阵乘法（含稀疏矩阵）", "1.5 二维前缀和与容斥"]],
    ["2  排序", ["2.1 sorted / key / 稳定性", "2.2 五种基础排序及复杂度", "2.3 归并排序求逆序对"]],
    ["3–4  贪心与复杂度", ["3.1–3.2 三要素、贪心会犯的错", "3.3 排序型贪心：四道例题", "3.4 交换论证：把排序键推出来", "3.5 常见形状速查", "4 同一道题的三种复杂度写法"]],
  ];
  cols.forEach((c, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.15, 2.85, 3.9, i === 1 ? C.cream : C.code);
    text(s, c[0], x + 0.2, 1.3, 2.5, 0.45, { fontSize: 19, bold: true, color: C.dark, margin: 0 });
    bullets(s, c[1], x + 0.15, 1.9, 2.6, 3.0, { fontSize: 12, gap: 8 });
  });
}

// Run first
{
  const s = content("▶", "先跑一遍", "四行代码，四个本周要讲清楚的现象");
  codeBlock(s, `a = [[0] * 3] * 2
a[0][0] = 9
print(a)                      # 矩阵：改了一行，两行都变了？
print(sorted([3, 1, 2]))      # 排序：一句 sorted() 就够
rows = [("a", 2), ("b", 1)]
rows.sort(key=lambda r: r[1])
print(rows)                   # 稳定排序：ties 保持原序
print(4 + 1 + 1, "vs", 3 + 3) # 贪心找零 [1,3,4] 凑 6：贪心 vs 最优`, 0.5, 1.1, 5.7, 2.75, { fontSize: 10.5, lang: "py" });
  consoleBlock(s, "[[9, 0, 0], [9, 0, 0]]\n[1, 2, 3]\n[('b', 1), ('a', 2)]\n6 vs 6", 6.45, 1.1, 3.05, 1.55);
  const qs = [
    ["[[0]*3]*2", "三行其实是同一个列表的三个引用", "1.1"],
    ["sorted(...)", "默认升序，返回新列表，不改原表", "2.1"],
    ["rows.sort 两次", "Python 的排序是**稳定**的", "2.1"],
    ["4+1+1 vs 3+3", "贪心给出 3 枚，最优只要 2 枚", "3.2"],
  ];
  qs.forEach((q, i) => {
    const y = 2.95 + i * 0.42;
    text(s, q[0], 0.6, y, 2.1, 0.36, { fontSize: 11, bold: true, color: C.green, valign: "middle", margin: 0, fontFace: MONO });
    text(s, q[1], 2.75, y, 5.6, 0.36, { fontSize: 11.5, valign: "middle", margin: 0 });
    pill(s, "§ " + q[2], 8.55, y + 0.02, 0.9, 0.28, C.dark, C.gold, 9.5);
  });
}

// ============================ PART 1 ============================
sectionSlide("Part 1", "矩阵", "二维列表怎么摆、怎么摆脱边界判断\n矩阵基础 · 表示与遍历 · 保护圈 · 转置旋转 · 矩阵乘法 · 二维前缀和");

// 1.0 先修：矩阵基础（取自 ADS_matrices.md）
{
  const s = content("1.0", "1 矩阵 · 先修：矩阵基础", "矩阵是什么：数字排成行与列");
  plate(s, 457200, 960120, 2700000, 2350000, C.code);
  tbox(s, 587200, 1020120, 2440000, 300000, [[["向量：排成一行或一列", 12, C.dark, "b"]]]);
  mat(s, 657200, 1500000, 300000, 300000, 30000, [[1, 2, 3]], { fs: 13 });
  tbox(s, 657200, 1870000, 1000000, 230000, [[["行向量 1×3", 11, C.green, "b"]]], { align: "ctr" });
  mat(s, 2157200, 1400000, 300000, 300000, 30000, [[1], [2], [3]], { fs: 13 });
  tbox(s, 1907200, 2420000, 900000, 230000, [[["列向量 3×1", 11, C.green, "b"]]], { align: "ctr" });
  tbox(s, 587200, 2750000, 2450000, 500000, [[["方括号里的数字，排一行叫行向量，排一列叫列向量。", 11, C.text]]]);
  plate(s, 3340080, 960120, 5346720, 2350000, C.mint);
  tbox(s, 3470080, 1020120, 5086720, 300000, [[["矩阵：数字排成长方形", 12, C.dark, "b"]]]);
  mat(s, 3540080, 1450000, 300000, 300000, 30000, [[1, 2, 3], [4, 5, 6]], { fs: 13 });
  tbox(s, 3540080, 2130000, 1000000, 230000, [[["2 行 3 列", 11, C.green, "b"]]], { align: "ctr" });
  mat(s, 4840080, 1450000, 300000, 300000, 30000, [[1, 2], [3, 4], [5, 6]], { fs: 13 });
  tbox(s, 4840080, 2470000, 700000, 230000, [[["3 行 2 列", 11, C.green, "b"]]], { align: "ctr" });
  mat(s, 5840080, 1450000, 300000, 300000, 30000, [[1, 2], [3, 4]], { fs: 13 });
  tbox(s, 5840080, 2130000, 700000, 230000, [[["2 行 2 列", 11, C.green, "b"]]], { align: "ctr" });
  tbox(s, 3470080, 2780000, 5086720, 500000, [[["通常用大写字母 A、B、X 代表矩阵；一个 m 行 n 列的矩阵，形状记作 m×n。", 11, C.text]]]);
  plate(s, 457200, 3450000, 8229600, 1280000, C.cream);
  tbox(s, 607200, 3510000, 7929600, 1180000, [
    [5, ["对应到 Python：二维列表", 12, C.goldText, "b"]],
    [5, ["A = [[1, 2, 3], [4, 5, 6]]", 10.5, C.text, "m"], ["    →   行数 len(A) = 2，列数 len(A[0]) = 3，形状 2×3", 11, C.text]],
    [["口诀：说形状、说位置，都是先说行，再说列。（2×3 是“2 行 3 列”）", 11, C.dark, "b"]],
  ]);
  s.addNotes([
    "本页给没学过矩阵的同学补基础。先说向量：数字排成一行叫行向量，排成一列叫列向量。再说矩阵：数字排成长方形，m 行 n 列的矩阵形状记作 m×n。",
    "强调口诀：说形状、说位置，都是先说行，再说列。2×3 是“2 行 3 列”。",
    "对应到 Python：二维列表 A=[[1,2,3],[4,5,6]]，len(A) 是行数，len(A[0]) 是列数。",
  ].join("\n"));
}

{
  const s = content("1.0", "1 矩阵 · 先修：矩阵基础", "元素的下标与转置");
  plate(s, 457200, 960120, 4000000, 2500000, C.code);
  tbox(s, 587200, 1020120, 3740000, 300000, [[["元素与下标：A[i][j] = 第 i 行、第 j 列", 12, C.dark, "b"]]]);
  mat(s, 707200, 1450000, 1120000, 330000, 30000, [["A[0][0]", "A[0][1]", "A[0][2]"], ["A[1][0]", "A[1][1]", "A[1][2]"]], { fs: 11 });
  tbox(s, 587200, 2400000, 3750000, 1000000, [
    [5, ["数学书里下标从 1 开始，写作 x₁,₁；Python 列表从 0 开始，所以第一行第一列是 A[0][0]。", 11, C.text]],
    [["矩阵的“第 i 行”就是 A[i]，是一个一维列表。", 11, C.dark, "b"]],
  ]);
  plate(s, 4640080, 960120, 4046720, 2500000, C.mint);
  tbox(s, 4770080, 1020120, 3786720, 300000, [[["转置：行变列，列变行", 12, C.dark, "b"]]]);
  mat(s, 4790080, 1500000, 270000, 270000, 30000, [[1, 2, 3], [4, 5, 6]], { fs: 12 });
  tbox(s, 4790080, 2130000, 900000, 230000, [[["A（2×3）", 11, C.green, "b"]]], { align: "ctr" });
  tbox(s, 5740080, 1650000, 300000, 300000, [[["→", 16, C.green, "b"]]], { anchor: "ctr", align: "ctr" });
  mat(s, 6090080, 1400000, 270000, 270000, 30000, [[1, 4], [2, 5], [3, 6]], { fs: 12 });
  tbox(s, 5990080, 2330000, 800000, 230000, [[["Aᵀ（3×2）", 11, C.green, "b"]]], { align: "ctr" });
  tbox(s, 4770080, 2650000, 3786720, 780000, [[["A[i][j] 变成 Aᵀ[j][i]；形状 m×n 变成 n×m。", 11, C.text]]]);
  plate(s, 457200, 3600000, 8229600, 1130000, C.cream);
  tbox(s, 607200, 3660000, 7929600, 1030000, [
    [5, ["Python 里转置一行就够", 12, C.goldText, "b"]],
    [5, ["At = list(zip(*A))", 10.5, C.text, "m"], ["    # [(1,4),(2,5),(3,6)]；要列表就 [list(r) for r in zip(*A)]", 10.5, C.comment, "m"]],
    [["后面 1.3 会用 zip(*a) 做转置、旋转，这里先记住“行变列”。", 11, C.text]],
  ]);
  s.addNotes([
    "元素：第 i 行第 j 列的数。数学书里下标从 1 开始，Python 从 0 开始，所以第一行第一列是 A[0][0]。A[i] 是整整一行，是一个一维列表。",
    "转置：行变列、列变行，A[i][j] 变成 Aᵀ[j][i]，形状 m×n 变成 n×m。Python 里 list(zip(*A)) 一行搞定，1.3 节会继续用。",
  ].join("\n"));
}

{
  const s = content("1.0", "1 矩阵 · 先修：矩阵基础", "矩阵的加法与乘法规则");
  plate(s, 457200, 960120, 4020000, 2450000, C.code);
  tbox(s, 587200, 1020120, 3760000, 300000, [[["加法：形状相同，对应位置相加", 12, C.dark, "b"]]]);
  mat(s, 607200, 1500000, 270000, 270000, 30000, [[0, 0], [1, 1], [0, 0]], { fs: 12 });
  tbox(s, 1257200, 1760000, 250000, 300000, [[["+", 15, C.green, "b"]]], { anchor: "ctr", align: "ctr" });
  mat(s, 1557200, 1500000, 270000, 270000, 30000, [[3, 1], [3, 1], [3, 1]], { fs: 12 });
  tbox(s, 2207200, 1760000, 250000, 300000, [[["=", 15, C.green, "b"]]], { anchor: "ctr", align: "ctr" });
  mat(s, 2507200, 1500000, 270000, 270000, 30000, [[3, 1], [4, 2], [3, 1]], { fs: 12, fill: C.mint });
  tbox(s, 587200, 2550000, 3760000, 820000, [[["E[i][j] = D[i][j] + C[i][j]。两个矩阵行数、列数都要一样，否则不能加（减法同理）。", 11, C.text]]]);
  plate(s, 4660080, 960120, 4026720, 2450000, C.mint);
  tbox(s, 4790080, 1020120, 3766720, 300000, [[["乘法：A 的列数 = B 的行数", 12, C.dark, "b"]]]);
  mat(s, 4780080, 1500000, 250000, 250000, 30000, [[1, 2, 3], [4, 5, 6]], { fs: 11 });
  tbox(s, 5640080, 1560000, 220000, 300000, [[["×", 14, C.green, "b"]]], { anchor: "ctr", align: "ctr" });
  mat(s, 5860080, 1400000, 250000, 250000, 30000, [[7, 8], [9, 10], [11, 12]], { fs: 11 });
  tbox(s, 6460080, 1560000, 220000, 300000, [[["=", 14, C.green, "b"]]], { anchor: "ctr", align: "ctr" });
  mat(s, 6680080, 1500000, 310000, 310000, 30000, [[58, 64], [139, 154]], { fs: 11 });
  tbox(s, 4790080, 2450000, 3766720, 950000, [
    [4, ["2×3 乘 3×2，得到 2×2（m×n 乘 n×p 得 m×p）。", 11, C.text]],
    [["58 = 1×7 + 2×9 + 3×11，即 A 第 0 行与 B 第 0 列对应相乘再求和。", 11, C.dark, "b"]],
  ]);
  plate(s, 457200, 3530000, 8229600, 1200000, C.cream);
  tbox(s, 607200, 3590000, 7929600, 1100000, [
    [5, ["乘法公式（后面几页都会用到）", 12, C.goldText, "b"]],
    [5, ["D[i][j] = A[i][0]*B[0][j] + A[i][1]*B[1][j] + … + A[i][n-1]*B[n-1][j]", 10, C.text, "m"]],
    [["形状对不上（加法形状不同、乘法 A 的列数 ≠ B 的行数）：题目里就是 Error!。", 11, C.dark, "b"]],
  ]);
  s.addNotes([
    "加法：两个矩阵形状必须完全相同，对应位置相加。例子里 3×2 加 3×2，得 [[3,1],[4,2],[3,1]]。减法同理。",
    "乘法：A 的列数必须等于 B 的行数，m×n 乘 n×p 得 m×p。例子 2×3 乘 3×2 得 2×2。以 58 为例：1×7+2×9+3×11，就是 A 第 0 行与 B 第 0 列对应相乘再求和。",
    "形状对不上，题目里就输出 Error!。",
  ].join("\n"));
}

{
  const s = content("1.0", "1 矩阵 · 先修：矩阵基础", "例题 263A：1 要移到中心要几步");
  plate(s, 457200, 960120, 2350000, 3770000, C.code);
  tbox(s, 587200, 1020120, 2090000, 300000, [[["CF 263A Beautiful Matrix", 12, C.dark, "b"]]]);
  const grid = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 1], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]];
  mat(s, 697200, 1420000, 340000, 340000, 30000, grid, { fs: 12, hl: { "1,4": C.mint, "2,2": "F2D98A" } });
  tbox(s, 587200, 3330000, 2100000, 1350000, [[["5×5 矩阵，24 个 0 和 1 个 1。每次可交换相邻两行或相邻两列，求把 1 移到中心（第 3 行第 3 列，黄色格）的最少次数。", 10.5, C.text]]]);
  plate(s, 2990080, 960120, 5696720, 1300000, C.mint);
  tbox(s, 3120080, 1020120, 5436720, 300000, [[["思路：行、列各自算距离", 12, C.dark, "b"]]]);
  tbox(s, 3120080, 1330000, 5436720, 900000, [
    [3, ["设 1 在第 r 行第 c 列（从 1 开始数）。行要移 |r−3| 次，列要移 |c−3| 次，答案：", 11, C.text]],
    [["abs(r - 3) + abs(c - 3)", 12, C.dark, "bm"]],
  ]);
  plate(s, 2990080, 2360000, 5696720, 2370000, C.code);
  tbox(s, 3120080, 2420000, 5436720, 2270000, [
    ...mono(`for i in range(1, 6):
    row = list(map(int, input().split()))
    if 1 in row:
        r = i
        c = row.index(1) + 1
        print(abs(r - 3) + abs(c - 3))
        break`, 10),
    [["样例 1：1 在第 2 行第 5 列，|2−3|+|5−3| = 3。", 10.5, C.dark, "b"]],
  ]);
  s.addNotes([
    "例题 CF 263A。5×5 矩阵里只有一个 1，每次可以交换相邻两行或相邻两列，求把 1 移到正中心的最少步数。",
    "思路：行和列互不影响。设 1 在第 r 行第 c 列，行方向要 |r−3| 步，列方向要 |c−3| 步，相加即可。样例 1：1 在第 2 行第 5 列，答案 1+2=3。",
    "代码要点：一行一行读，用 1 in row 判断，用 row.index(1)+1 得到列号，注意行号列号从 1 开始。",
  ].join("\n"));
}

{
  const s = content("1.0", "1 矩阵 · 先修：矩阵基础", "例题 E18161：先判形状，再计算");
  plate(s, 457200, 960120, 8229600, 900000, C.code);
  tbox(s, 587200, 1020120, 7969600, 300000, [[["E18161 矩阵运算：计算 A·B + C", 12, C.dark, "b"]]]);
  tbox(s, 587200, 1330000, 7969600, 500000, [[["输入三个矩阵（每个先给行数、列数，再给各行数字）。能算就输出结果；不能算输出 Error!", 11, C.text]]]);
  [
    ["乘法能做吗", "A 的列数 = B 的行数", "ca == rb"],
    ["加法能做吗", "A·B 的形状 = C 的形状", "ra == rc 且 cb == cc"],
    ["都满足才算", "否则输出 Error!", "D = A·B + C"],
  ].forEach((st, i) => {
    const x = [457200, 3247000, 6036800][i];
    plate(s, x, 1990000, 2650000, 1250000, i === 2 ? C.cream : C.mint);
    cell(s, x + 110000, 2070000, 300000, 300000, C.dark, [String(i + 1), 12, C.gold, "b"], "ellipse");
    tbox(s, x + 470000, 2070000, 2090000, 300000, [[[st[0], 11.5, C.dark, "b"]]], { anchor: "ctr" });
    tbox(s, x + 130000, 2450000, 2390000, 750000, [[3, [st[1], 11, C.text]], [[st[2], 10.5, C.green, "bm"]]]);
  });
  plate(s, 457200, 3360000, 8229600, 1370000, C.code);
  tbox(s, 607200, 3420000, 7929600, 1270000, [
    [4, ["样例 1：A 是 3×1，B 是 1×2，C 是 3×2", 12, C.dark, "b"]],
    [4, ["A·B = [[0,0],[1,1],[0,0]]，再加 C = [[3,1],[3,1],[3,1]]，得 [[3,1],[4,2],[3,1]]", 10.5, C.text, "m"]],
    [["样例 2：A 是 1×1，B 是 2×1：A 的列数 1 ≠ B 的行数 2，直接 Error!", 12, C.goldText, "b"]],
  ]);
  s.addNotes([
    "例题 E18161：计算 A·B+C。关键是先判断形状，再计算。",
    "两个条件：A 的列数等于 B 的行数（乘法能做），A·B 的形状等于 C 的形状（加法能做）。任何一个不满足就输出 Error!。",
    "样例 1：A 是 3×1，B 是 1×2，乘出 3×2，和 C 同形，结果 [[3,1],[4,2],[3,1]]。样例 2：A 的列数 1 不等于 B 的行数 2，直接 Error!。",
    "提醒：这类题失分几乎都在漏判维度。",
  ].join("\n"));
}

{
  const s = content("1.0", "1 矩阵 · 先修：矩阵基础", "E18161 的代码：三步写完");
  plate(s, 457200, 960120, 5000000, 3770000, C.code);
  tbox(s, 587200, 1010000, 4740000, 3700000, mono(`def read():
    r, c = map(int, input().split())
    return [list(map(int, input().split()))
            for _ in range(r)]

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
        print(*row)`, 10));
  plate(s, 5640080, 960120, 3046720, 1000000, C.cream);
  tbox(s, 5760080, 1020000, 2806720, 900000, [
    [4, ["复杂度", 12, C.goldText, "b"]],
    [["乘法 O(m·n·p)，加法 O(m·p)，结果矩阵占 O(m·p) 空间。", 10.5, C.text]],
  ]);
  plate(s, 5640080, 2080000, 3046720, 2650000, C.mint);
  tbox(s, 5760080, 2140000, 2806720, 2500000, [
    [4, ["另一种写法：@ 运算符", 12, C.dark, "b"]],
    [4, ["Python 3.5 起，类里定义 __matmul__、__add__，就能直接写：", 10.5, C.text]],
    ...mono(`try:
    print(A @ B + C)
except ValueError:
    print("Error!")`, 10),
    [["维度不合法时 raise ValueError。", 10.5, C.text]],
  ]);
  s.addNotes([
    "代码分三步：用 read() 读三个矩阵；先判形状；再用三重循环算 A·B+C，这里把 C[i][j] 当作累加的起点，省一次加法循环。",
    "复杂度：乘法 O(m·n·p)，加法 O(m·p)。",
    "补充：Python 3.5 起有 @ 运算符，在自定义类里实现 __matmul__ 和 __add__，就能写 A @ B + C，维度不合法时 raise ValueError，用 try/except 输出 Error!。",
    "乘法的循环顺序怎么优化，见后面的矩阵乘法几页。",
  ].join("\n"));
}

// 1.1 representation
{
  const s = content("1.1", "1 矩阵 · 表示与遍历", "m 行 n 列：一定要用列表推导式逐行建");
  codeBlock(s, `m, n = 3, 4
a = [[0] * n for _ in range(m)]        # ✅ m 行 n 列，行与行互不相干
# a = [[0] * n] * m                    # ❌ 三行是同一个列表的三个引用

for i in range(m):
    for j in range(n):
        a[i][j] = i * n + j

for row in a:
    print(*row)
# 0 1 2 3
# 4 5 6 7
# 8 9 10 11`, 0.5, 1.1, 9.0, 2.85, { fontSize: 11, lang: "py", hl: [3] });
  callout(s, "为什么 `[[0]*n]*m` 是错的", "`*` 复制的是**引用**，不是内容：`m` 个位置指向**同一个**内层列表。改 `a[0][0]` 会看到 `a[1][0]` 也跟着变。上一页「先跑一遍」的第一个现象就是它。", 0.5, 4.15, 9.0, 1.0, { fontSize: 12 });
}

// 1.1 read input + cache order
{
  const s = content("1.1", "1 矩阵 · 表示与遍历", "读入一个 m×n 矩阵；按行遍历为什么更快");
  codeBlock(s, `import sys

data = sys.stdin.read().split()
idx = 0
m, n = int(data[idx]), int(data[idx + 1]); idx += 2
a = []
for _ in range(m):
    a.append([int(data[idx + j]) for j in range(n)])
    idx += n`, 0.5, 1.1, 5.6, 1.95, { fontSize: 10.5, lang: "py" });
  callout(s, "一次性读完，自己切", "`sys.stdin.read().split()` 把整份输入切成一个 token 列表，比逐行 `input()` 快很多——数据量大的题目标配写法。", 6.35, 1.1, 3.15, 1.95, { fontSize: 11 });
  callout(s, "按行遍历比按列遍历快", "`a[i][j]` 里 `j` 变化快时，访问的地址在内存里**连续**；跳着按列访问，每次都可能踩空缓存行。这是第 3 周「存储层次」的直接后果。", 0.5, 3.3, 9.0, 1.0, { fontSize: 12, fill: C.mint, tcolor: C.dark });
  text(s, "方向数组是第 9 周 DFS、第 12 周 BFS 反复使用的写法，下一页先学会它。", 0.5, 4.45, 9, 0.35, { fontSize: 11, color: C.muted });
}

// 1.2 without padding
{
  const s = content("1.2", "1 矩阵 · 保护圈", "「每格看上下左右邻居」：不加保护圈很啰嗦");
  codeBlock(s, `# 没有保护圈：每次都要判越界
for i in range(m):
    for j in range(n):
        s = 0
        for di, dj in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            ni, nj = i + di, j + dj
            if 0 <= ni < m and 0 <= nj < n:
                s += a[ni][nj]`, 0.5, 1.1, 9.0, 2.0, { fontSize: 12, lang: "py", hl: [6] });
  callout(s, "问题在哪", "每访问一个邻居都要判两次范围（行、列各一次），四个方向就是 4 次判断；嵌套一深，代码里全是 `if`，容易漏判、也容易看错。下一页换一种写法。", 0.5, 3.35, 9.0, 1.15, { fontSize: 12.5 });
}

// 1.2 with padding + grid
{
  const s = content("1.2", "1 矩阵 · 保护圈", "保护圈（padding）：四周补一圈 0，内部不用再判越界");
  codeBlock(s, `g = [[0] * (n + 2) for _ in range(m + 2)]   # (m+2) x (n+2)
for i in range(m):
    for j in range(n):
        g[i + 1][j + 1] = a[i][j]

DIRS = ((-1, 0), (1, 0), (0, -1), (0, 1))
res = [[0] * n for _ in range(m)]
for i in range(1, m + 1):
    for j in range(1, n + 1):
        res[i-1][j-1] = sum(g[i+di][j+dj] for di, dj in DIRS)`, 0.5, 1.05, 5.7, 2.35, { fontSize: 10, lang: "py" });
  const rows = [[6, 9, 8], [13, 20, 17], [12, 21, 14]];
  text(s, "输入 a = [[1,2,3],[4,5,6],[7,8,9]]，四邻域求和结果：", 6.35, 1.05, 3.15, 0.55, { fontSize: 10.5, lsm: 1.15 });
  rows.forEach((row, i) => cells(s, 6.55, 1.65 + i * 0.5, row, { cw: 0.75, ch: 0.46, fs: 13 }));
  callout(s, "内部循环再也不用判越界了", "多出来的一圈全是 0，`g[i+di][j+dj]` 永远合法——**用一点额外空间换掉所有边界分支**。", 0.5, 3.6, 9.0, 1.0, { fontSize: 12 });
}

// 1.2 direction arrays
{
  const s = content("1.2", "1 矩阵 · 方向数组", "DIRS4 / DIRS8：把「往哪走」写成一张表");
  codeBlock(s, `DIRS4 = ((-1, 0), (1, 0), (0, -1), (0, 1))                       # 上下左右
DIRS8 = tuple((di, dj) for di in (-1, 0, 1) for dj in (-1, 0, 1)
              if (di, dj) != (0, 0))                             # 八邻域`, 0.5, 1.1, 9.0, 1.05, { fontSize: 11.5, lang: "py" });
  // 3x3 grid showing 8 neighbours around center
  const grid = [["↖", "↑", "↗"], ["←", "·", "→"], ["↙", "↓", "↘"]];
  card(s, 1.3, 2.35, 2.4, 2.25, C.code);
  grid.forEach((row, i) => cells(s, 1.5, 2.53 + i * 0.66, row, { cw: 0.66, ch: 0.58, fs: 18, fills: row.map(() => (i === 1 ? null : "CFE0D8")) }));
  text(s, "八邻域 DIRS8", 1.3, 4.72, 2.4, 0.28, { fontSize: 11, bold: true, color: C.dark, align: "center", margin: 0 });
  callout(s, "为什么要打成表", [
    "四/八个方向反复出现在 DFS、BFS、Flood Fill 里。",
    "写成 `DIRS` 元组后，`for di, dj in DIRS:` 一行代替四/八段重复代码。",
    "第 9 周马走日、第 12 周 BFS 都直接复用这两个常量的写法。",
  ], 4.1, 2.35, 5.4, 2.35, { fontSize: 12, gap: 9 });
}

// 1.3 transpose/rotation
{
  const s = content("1.3", "1 矩阵 · 转置与旋转", "zip(*a) 一行转置；配合切片一行旋转");
  codeBlock(s, `a = [[1, 2, 3], [4, 5, 6]]
t = [list(row) for row in zip(*a)]          # 转置：2x3 -> 3x2

b = [[1, 2], [3, 4]]
cw = [list(row) for row in zip(*b[::-1])]   # 顺时针 90°
ccw = [list(row) for row in zip(*b)][::-1]  # 逆时针 90°`, 0.5, 1.05, 9.0, 1.65, { fontSize: 11.5, lang: "py" });
  const boxes = [["b", [[1, 2], [3, 4]], 0.5], ["顺时针 cw", [[3, 1], [4, 2]], 3.5], ["逆时针 ccw", [[2, 4], [1, 3]], 6.5]];
  boxes.forEach((b) => {
    text(s, b[0], b[2], 2.85, 2.4, 0.3, { fontSize: 12, bold: true, color: C.dark, align: "center", margin: 0 });
    b[1].forEach((row, i) => cells(s, b[2] + 0.55, 3.15 + i * 0.5, row, { cw: 0.6, ch: 0.46, fs: 13 }));
  });
  callout(s, "记法", "顺时针 = **先上下翻转（`[::-1]`）再转置**；逆时针 = **先转置再上下翻转**。`zip(*矩阵)` 本身只做转置，方向全靠翻转的先后。", 0.5, 4.15, 9.0, 0.85, { fontSize: 11.5, fill: C.mint, tcolor: C.dark });
}

// 1.4 matmul
{
  const s = content("1.4", "1 矩阵 · 矩阵乘法", "C = A·B：C[i][j] = Σ A[i][t]·B[t][j]");
  codeBlock(s, `def matmul(A, B):
    m, k, n = len(A), len(B), len(B[0])
    C = [[0] * n for _ in range(m)]
    for i in range(m):
        Ai = A[i]                       # 提到内层循环外，减少一次索引
        Ci = C[i]
        for t in range(k):
            if Ai[t]:                   # 稀疏时跳过零，常数优化
                Bt, v = B[t], Ai[t]
                for j in range(n):
                    Ci[j] += v * Bt[j]
    return C


A, B = [[1, 2], [3, 4]], [[5, 6], [7, 8]]
print(matmul(A, B))          # [[19, 22], [43, 50]]`, 0.5, 1.05, 6.35, 3.1, { fontSize: 10, lang: "py" });
  callout(s, "复杂度 O(m·k·n)", "n=200 时是 8×10⁶，可以；n=1000 时是 10⁹，必然 **TLE**。", 7.05, 1.05, 2.45, 1.15, { fontSize: 11 });
  callout(s, "E18161 矩阵运算", "先判断维度是否匹配，不匹配输出 `Error!`——**这类题失分几乎全在漏判维度**。", 7.05, 2.35, 2.45, 1.8, { fontSize: 10.5, fill: C.mint, tcolor: C.dark });
  plate(s, 457200, 3900000, 8229600, 800000, C.mint);
  tbox(s, 607200, 3950000, 7929600, 700000, [
    [5, ["一句话：", 11, C.dark, "b"], ["换成 i→t→j 的顺序，“算一个格子”变成“拿 A 的一个数乘 B 的一整行，累加到 C 的一整行”。", 11, C.text]],
    [["→ 下面 3 页：循环顺序对比、手算追踪、三个优化技巧", 10.5, C.green]],
  ], { anchor: "ctr" });
  s.addNotes([
    "这页代码的特别之处：三层循环的顺序是 i→t→j，不是常见的 i→j→t。先让大家看代码，问一句“内层循环在干什么”：拿 A[i][t] 这一个数 v，去乘 B 的第 t 整行，累加到 C 的第 i 整行。",
    "注释里的两个小技巧（提出 Ai/Ci、跳过零）下面第 21 页展开。右侧两张卡片：复杂度 O(m·k·n)；E18161 要先判断维度，不匹配输出 Error!。",
    "接下来三页：19 页讲为什么能换顺序，20 页手算追踪，21 页讲优化技巧和注意事项。",
  ].join("\n"));
}

// 1.4 循环顺序
{
  const s = content("1.4", "1 矩阵 · 矩阵乘法", "先搞懂：循环顺序为什么能换");
  plate(s, 457200, 960120, 4023360, 2240000, C.code);
  tbox(s, 587200, 1020000, 3763360, 300000, [[["经典写法：i → j → t（一次算一个格子）", 12, C.dark, "b"]]]);
  tbox(s, 587200, 1340000, 3763360, 800000, mono(`for i in range(m):
  for j in range(n):
    for t in range(k):
      C[i][j] += A[i][t]*B[t][j]`, 10.5));
  tbox(s, 587200, 2330000, 3763360, 820000, [[["固定一个格子 C[i][j]，把 k 项乘积一次加完（点积：A 的第 i 行 · B 的第 j 列）。", 11, C.text]]]);
  plate(s, 4663440, 960120, 4023360, 2240000, C.mint);
  tbox(s, 4793440, 1020000, 3763360, 300000, [[["本页写法：i → t → j（一次更新一整行）", 12, C.dark, "b"]]]);
  tbox(s, 4793440, 1340000, 3763360, 800000, mono(`for i in range(m):
  for t in range(k):
    v = A[i][t]
    for j in range(n):  Ci[j] += v*B[t][j]`, 10));
  tbox(s, 4793440, 2330000, 3763360, 820000, [[["取 A[i][t] 这一个数 v，乘 B 的第 t 整行，累加到 C 的第 i 整行。k 轮之后，C 的第 i 行就算完了。", 12, C.text]]]);
  plate(s, 457200, 3330000, 8229600, 1400000, C.cream);
  tbox(s, 607200, 3400000, 7929600, 1280000, [
    [6, ["为什么两种写法结果一样？", 12, C.goldText, "b"]],
    [6, ["C[i][j] = A[i][0]·B[0][j] + A[i][1]·B[1][j] + … + A[i][k-1]·B[k-1][j]", 10.5, C.text, "m"]],
    [6, ["加法满足交换律，加的顺序不影响总和。经典写法一次加完 k 项；本页写法分 k 轮（t=0,1,…），每一轮给这一行所有格子各加一项。", 12, C.text]],
    [["记忆：C 的第 i 行 = Σₜ A[i][t] × （B 的第 t 行）", 12, C.dark, "b"]],
  ]);
  s.addNotes([
    "先对比两种写法。经典写法是“按格子算”：固定 C[i][j]，把 k 项乘积一次加完，就是 A 的第 i 行与 B 的第 j 列做点积。",
    "本页写法是“按行累加”：取 A[i][t] 这一个数 v，乘 B 的第 t 整行，累加到 C 的第 i 整行，一共 k 轮。",
    "为什么结果一样：C[i][j] 本来就是 k 项之和，加法有交换律，一次加完和分 k 轮每次加一项，总和相同。",
    "记忆句：C 的第 i 行 = Σₜ A[i][t] × （B 的第 t 行）。",
  ].join("\n"));
}

// 1.4 手算追踪
{
  const s = content("1.4", "1 矩阵 · 矩阵乘法", "用 A=[[1,2],[3,4]]、B=[[5,6],[7,8]] 手算一遍");
  [["A", [[1, 2], [3, 4]], 557200], ["B", [[5, 6], [7, 8]], 1707200], ["C", [[19, 22], [43, 50]], 2857200]].forEach(([name, m, x], i) => {
    tbox(s, x, 1000000, 760000, 220000, [[[name, 11, C.green, "b"]]], { align: "ctr" });
    mat(s, x, 1250000, 350000, 350000, 30000, m, { fs: 14, fill: C.code, shape: "roundRect" });
    if (i < 2) tbox(s, x + 860000, 1470000, 250000, 300000, [[[i === 0 ? "×" : "=", 16, C.green, "b"]]], { anchor: "ctr", align: "ctr" });
  });
  plate(s, 457200, 2200000, 3250000, 2500000, C.cream);
  tbox(s, 587200, 2260000, 3000000, 2400000, [
    [6, ["怎么读右边的表", 12, C.goldText, "b"]],
    [5, ["v = A[i][t]：当前取出的那一个数", 12, C.text]],
    [5, ["Bt = B[t]：B 的第 t 行，整行拿来乘", 12, C.text]],
    [5, ["Ci：C 的第 i 行，每一轮在它上面累加，不是重新算", 12, C.text]],
    [["例：C 的第 0 行 = 1×[5,6] + 2×[7,8] = [5,6] + [14,16] = [19,22]", 12, C.dark, "b"]],
  ]);
  tbox(s, 3857200, 960120, 4829600, 250000, [[["手算追踪（Ci 起始为 [0, 0]）", 12, C.dark, "b"]]]);
  const colW = [360000, 360000, 380000, 700000, 880000, 2029600];
  [
    ["i", "t", "v", "Bt", "v·Bt", "累加后 Ci"],
    [0, 0, 1, "[5, 6]", "[5, 6]", "[5, 6]"],
    [0, 1, 2, "[7, 8]", "[14, 16]", "[19, 22]"],
    [1, 0, 3, "[5, 6]", "[15, 18]", "[15, 18]"],
    [1, 1, 4, "[7, 8]", "[28, 32]", "[43, 50]"],
  ].forEach((row, i) => {
    let x = 3857200;
    row.forEach((v, j) => {
      const y = 1260120 + i * 350000, last = j === row.length - 1;
      if (i === 0) cell(s, x, y, colW[j], 330000, C.dark, [v, 10.5, C.white, "b"]);
      // 最后一列是累加结果；每个 i 的第二轮（该行算完）标绿
      else cell(s, x, y, colW[j], 330000, last && i % 2 === 0 ? C.mint : C.code, [String(v), 10.5, last ? C.dark : C.text, last ? "bm" : "m"]);
      x += colW[j] + 20000;
    });
  });
  tbox(s, 3857200, 3070120, 4829600, 900000, [
    [5, ["i=0 的两轮结束得到 C 的第 0 行 [19, 22]；", 12, C.text]],
    [5, ["i=1 换新的 Ci（又从 [0, 0] 开始），两轮后得到第 1 行 [43, 50]。", 12, C.text]],
    [["绿色格子 = 该行算完，对应结果矩阵 C。", 11, C.green]],
  ]);
  s.addNotes([
    "带着学生手算一遍。A=[[1,2],[3,4]]，B=[[5,6],[7,8]]。",
    "i=0：Ci 从 [0,0] 开始。t=0 时 v=1，Bt=[5,6]，Ci 变成 [5,6]；t=1 时 v=2，Bt=[7,8]，加上 [14,16]，得 [19,22]，这就是 C 的第 0 行。",
    "i=1：换新的 Ci，又从 [0,0] 开始。t=0 时 v=3，加 [15,18]；t=1 时 v=4，加 [28,32]，得 [43,50]。",
    "强调：Ci 是每一轮累加出来的，不是每次重新算；每个 i 结束时，Ci 就是 C 的完整一行。",
  ].join("\n"));
}

// 1.4 优化技巧
{
  const s = content("1.4", "1 矩阵 · 矩阵乘法", "三个优化技巧 + 做题注意");
  [
    ["局部变量，少一次索引", "Ai = A[i]\nCi = C[i]\nBt, v = B[t], Ai[t]", "内层只剩一维索引 Ci[j] += v*Bt[j]，比反复写 C[i][j] 快。Ci 和 C[i] 是同一个列表，改 Ci 就是改 C。"],
    ["跳过 0，稀疏时更快", "if Ai[t]:\n    …内层 n 次循环…", "A[i][t]=0 时，这一轮加的全是 0，直接跳过整个内层循环。0 越多，省得越多。"],
    ["按行连续访问", "Bt[j]   # j 变化\n（同一行，挨着读）", "经典写法内层是 B[t][j] 且 t 在变，是在 B 的“列”上跳着读；本页写法内层沿着 B 的一行走，更顺。"],
  ].forEach((tip, i) => {
    const x = [457200, 3252000, 6046800][i];
    plate(s, x, 960120, 2640000, 2450000, C.code);
    cell(s, x + 110000, 1050000, 300000, 300000, C.dark, [String(i + 1), 12, C.gold, "b"], "ellipse");
    tbox(s, x + 470000, 1050000, 2080000, 300000, [[[tip[0], 11.5, C.dark, "b"]]], { anchor: "ctr" });
    tbox(s, x + 130000, 1450000, 2380000, 700000, mono(tip[1], 10));
    tbox(s, x + 130000, 2200000, 2380000, 1150000, [[[tip[2], 12, C.text]]]);
  });
  plate(s, 457200, 3530000, 8229600, 1200000, C.cream);
  tbox(s, 607200, 3590000, 7929600, 1100000, [
    [6, ["别忘了：这些只是常数优化，复杂度仍是 O(m·k·n)", 12, C.goldText, "b"]],
    [5, ["n=200 约 8×10⁶ 次可以；n=1000 约 10⁹ 次，Python 必然 TLE。", 12, C.text]],
    [["这段代码默认 A 的列数 = B 的行数。做 E18161 先判断：len(A[0]) != len(B) 时输出 Error!，不要直接乘。", 12, C.dark, "b"]],
  ]);
  s.addNotes([
    "三个优化技巧，都只是常数优化。",
    "1. 局部变量：Ai=A[i]、Ci=C[i]、Bt,v=B[t],Ai[t]，内层只剩一维索引。Ci 和 C[i] 是同一个列表，改 Ci 就是改 C。",
    "2. 跳过 0：A[i][t]=0 时这一轮加的全是 0，直接跳过内层 n 次循环；矩阵 0 多时更明显。",
    "3. 按行连续访问：内层沿着 B 的一行走，比在列上跳着读更顺。",
    "最后强调两点：复杂度仍是 O(m·k·n)，n=1000 时约 10⁹，Python 必然 TLE；这段代码默认 len(A[0]) == len(B)，做 E18161 要先判断维度，不匹配输出 Error!。",
  ].join("\n"));
}

// 1.4 sparse matmul：稀疏 → 普通矩阵 → 稀疏
{
  const s = content("1.4", "1 矩阵 · 稀疏矩阵", "E23555 节省存储的矩阵乘法：稀疏 → 普通矩阵 → 稀疏");
  const Y = "F2D98A";   // 黄色格 = 非零元
  const A = [[1, 0, 0], [0, 0, 2], [0, 0, 0]], B = [[0, 3, 0], [0, 0, 0], [4, 0, 5]], Cm = [[0, 3, 0], [8, 0, 10], [0, 0, 0]];
  plate(s, 457200, 960120, 2650000, 3770000, C.code);
  tbox(s, 587200, 1020120, 2390000, 300000, [[["① 三元组 → 普通矩阵", 12, C.dark, "b"]]]);
  tbox(s, 587200, 1330000, 2390000, 300000, [[["A：(0,0,1) (1,2,2)", 10, C.dark, "bm"]]]);
  mat(s, 587200, 1650000, 220000, 220000, 30000, A, { fs: 10, hl: { "0,0": Y, "1,2": Y } });
  tbox(s, 1457200, 1700000, 1550000, 700000, [[["(行,列,值) 放进 M[行][列]，其余格子全是 0", 10.5, C.text]]]);
  tbox(s, 587200, 2530000, 2390000, 300000, [[["B：(0,1,3) (2,0,4) (2,2,5)", 10, C.dark, "bm"]]]);
  mat(s, 587200, 2850000, 220000, 220000, 30000, B, { fs: 10, hl: { "0,1": Y, "2,0": Y, "2,2": Y } });
  tbox(s, 1457200, 2900000, 1550000, 700000, [[["黄色格 = 三元组里的非零元", 10.5, C.text]]]);
  tbox(s, 587200, 3750000, 2390000, 900000, [[["n×n 的二维列表，用 to_dense 函数完成。", 11, C.dark, "b"]]]);
  plate(s, 3247000, 960120, 2650000, 3770000, C.mint);
  tbox(s, 3377000, 1020120, 2390000, 300000, [[["② 按普通矩阵相乘", 12, C.dark, "b"]]]);
  tbox(s, 3377000, 1200000, 750000, 230000, [[["A", 11, C.green, "b"]]], { align: "ctr" });
  tbox(s, 4427000, 1200000, 750000, 230000, [[["B", 11, C.green, "b"]]], { align: "ctr" });
  mat(s, 3377000, 1450000, 220000, 220000, 30000, A, { fs: 10 });
  tbox(s, 4167000, 1650000, 250000, 300000, [[["×", 14, C.green, "b"]]], { anchor: "ctr", align: "ctr" });
  mat(s, 4427000, 1450000, 220000, 220000, 30000, B, { fs: 10 });
  tbox(s, 5197000, 1650000, 250000, 300000, [[["=", 14, C.green, "b"]]], { anchor: "ctr", align: "ctr" });
  mat(s, 3377000, 2400000, 220000, 220000, 30000, Cm, { fs: 10, fill: C.code, hl: { "0,1": C.white, "1,0": C.white, "1,2": C.white } });
  tbox(s, 3377000, 3170000, 750000, 230000, [[["C", 11, C.green, "b"]]], { align: "ctr" });
  tbox(s, 4297000, 2400000, 1500000, 900000, [[["C 第 1 行 = 2 × B 第 2 行 = [8, 0, 10]", 10, C.text]]]);
  tbox(s, 3377000, 3600000, 2390000, 1050000, [[["就是第 12 页的 matmul(A, B)，不用改。", 11, C.dark, "b"]]]);
  plate(s, 6036800, 960120, 2650000, 3770000, C.cream);
  tbox(s, 6166800, 1020120, 2390000, 300000, [[["③ 非零元 → 三元组", 12, C.goldText, "b"]]]);
  mat(s, 6166800, 1450000, 220000, 220000, 30000, Cm, { fs: 10, hl: { "0,1": Y, "1,0": Y, "1,2": Y } });
  tbox(s, 7036800, 1450000, 1550000, 800000, [[["按行、再按列扫一遍，遇到非 0 就记下 (行,列,值)", 10.5, C.text]]]);
  tbox(s, 6166800, 2400000, 2390000, 1150000, [
    [3, ["输出：", 11, C.dark, "b"]],
    [1, ["(0,1,3)", 11, C.text, "m"]],
    [1, ["(1,0,8)", 11, C.text, "m"]],
    [["(1,2,10)", 11, C.text, "m"]],
  ]);
  tbox(s, 6166800, 3600000, 2390000, 1050000, [[["顺序扫描，结果天然按 (行,列) 升序；值为 0 的不输出。", 11, C.dark, "b"]]]);
  s.addNotes([
    "这页把稀疏矩阵乘法拆成三步，先不管怎么省空间，先保证好理解：",
    "① 把三元组还原成普通矩阵：(行,列,值) 放进 M[行][列]，其余全是 0。",
    "② 用第 12 页学过的 matmul 做普通矩阵乘法，一行都不用改。例：C 的第 1 行 = 2 × B 的第 2 行 = [8,0,10]。",
    "③ 把结果里的非零元扫出来转回三元组：按行、再按列顺序扫，输出天然有序，值为 0 的不输出。",
    "结果：(0,1,3) (1,0,8) (1,2,10)。",
  ].join("\n"));
}

// 1.4 E23555 代码
{
  const s = content("1.4", "1 矩阵 · 稀疏矩阵", "E23555 的代码：三个函数连起来");
  plate(s, 457200, 960120, 5300000, 3770000, C.code);
  tbox(s, 587200, 1010000, 5040000, 3700000, mono(`def to_dense(n, items):
    M = [[0] * n for _ in range(n)]
    for r, c, v in items:
        M[r][c] = v
    return M

def to_sparse(M):
    return [(i, j, x)
            for i, row in enumerate(M)
            for j, x in enumerate(row) if x != 0]

def sparse_matmul(n, a_items, b_items):
    A = to_dense(n, a_items)       # ① 还原
    B = to_dense(n, b_items)
    C = matmul(A, B)               # ② 相乘（第 12 页）
    return to_sparse(C)            # ③ 转回

print(sparse_matmul(3, [(0,0,1), (1,2,2)],
                       [(0,1,3), (2,0,4), (2,2,5)]))
# [(0, 1, 3), (1, 0, 8), (1, 2, 10)]`, 9.5));
  plate(s, 5940080, 960120, 2746720, 1750000, C.mint);
  tbox(s, 6060080, 1020000, 2506720, 1650000, [
    [4, ["读代码", 12, C.dark, "b"]],
    [3, ["to_dense：把三元组放回格子。", 10.5, C.text]],
    [3, ["to_sparse：行优先扫描，非 0 才记。", 10.5, C.text]],
    [["sparse_matmul 只是把三步连起来。", 10.5, C.text]],
  ]);
  plate(s, 5940080, 2820000, 2746720, 1910000, C.cream);
  tbox(s, 6060080, 2880000, 2506720, 1800000, [
    [4, ["注意", 12, C.goldText, "b"]],
    [3, ["先 to_dense 要占 n² 空间；n 不大时最稳。", 10.5, C.text]],
    [["输入输出格式以题面为准：读入后组成 a_items、b_items，再按行、列升序输出三元组。", 10.5, C.text]],
  ]);
  s.addNotes([
    "代码就是把上页三步写成三个函数。to_dense 还原，to_sparse 用推导式按行优先扫描非零元，sparse_matmul 把它们连起来，中间调用第 12 页的 matmul。",
    "注意：to_dense 要开 n×n 的空间，n 不大时最稳；输入输出格式以题面为准，读入后组成 a_items、b_items，再按行列升序输出。",
  ].join("\n"));
}

// 1.4 E23555 进阶：直接在三元组上乘
{
  const s = content("1.4", "1 矩阵 · 稀疏矩阵", "进阶：直接在三元组上乘（省空间）");
  plate(s, 457200, 960120, 4700000, 3770000, C.code);
  tbox(s, 587200, 1010000, 4440000, 3700000, mono(`def sparse_matmul(n, a_items, b_items):
    brow = defaultdict(list)
    for r, c, v in b_items:
        brow[r].append((c, v))
    acc = defaultdict(int)
    for i, t, v in a_items:
        for j, w in brow.get(t, ()):
            acc[(i, j)] += v * w
    return [(i, j, v)
            for (i, j), v in sorted(acc.items())
            if v != 0]`, 9.5));
  plate(s, 5340080, 960120, 3346720, 2000000, C.mint);
  tbox(s, 5460080, 1020000, 3106720, 1900000, [
    [4, ["进阶：不转换，直接在三元组上算", 11.5, C.dark, "b"]],
    [3, ["brow[t]：B 第 t 行的非零元", 10, C.text]],
    [3, ["A 的每个非零元 (i,t,v) 配上 brow[t] 里的 (j,w)", 10, C.text]],
    [["acc[(i,j)] += v*w：字典当作 C，没出现的位置就是 0", 10, C.text]],
  ]);
  plate(s, 5340080, 3070000, 3346720, 1660000, C.cream);
  tbox(s, 5460080, 3130000, 3106720, 1550000, [
    [4, ["两种写法怎么选", 11.5, C.goldText, "b"]],
    [3, ["转换法：好懂，占 n² 空间。", 10, C.text]],
    [3, ["直接法：只和非零元个数有关，n 很大时用。", 10, C.text]],
    [["先保证做对，再考虑省空间。", 10, C.dark, "b"]],
  ]);
  s.addNotes([
    "这是进阶写法，不转换成普通矩阵，直接在三元组上乘。思路还是“A 的一个数乘 B 的一整行”，只是只乘非零元。",
    "brow[t] 存 B 第 t 行的非零元；A 的每个非零元 (i,t,v) 配上 brow[t] 里的 (j,w)，把 v*w 累加到 acc[(i,j)]，字典代替 C。",
    "怎么选：转换法好懂但占 n² 空间；直接法只和非零元个数有关，n 很大时用。先保证做对，再考虑省空间。",
  ].join("\n"));
}

// 1.5 prefix sum
{
  const s = content("1.5", "1 矩阵 · 二维前缀和", "预处理 O(mn)，单次查询 O(1)");
  codeBlock(s, `def build_prefix(a):
    m, n = len(a), len(a[0])
    pre = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m):
        for j in range(n):
            pre[i+1][j+1] = pre[i][j+1] + pre[i+1][j] - pre[i][j] + a[i][j]
    return pre


def query(pre, r1, c1, r2, c2):
    """左上 (r1,c1) 到右下 (r2,c2) 闭区间的和（0-indexed）。"""
    return pre[r2+1][c2+1] - pre[r1][c2+1] - pre[r2+1][c1] + pre[r1][c1]`, 0.5, 1.05, 9.0, 2.35, { fontSize: 10.3, lang: "py" });
  const a = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
  a.forEach((row, i) => cells(s, 0.7, 3.6 + i * 0.42, row, { cw: 0.55, ch: 0.4, fs: 12, fills: (i <= 1 ? ["CFE0D8", "CFE0D8", null] : [null, null, null]) }));
  text(s, "query(pre,0,0,1,1) = 1+2+4+5 = 12\nquery(pre,1,1,2,2) = 5+6+8+9 = 28", 3.1, 3.65, 3.4, 0.9, { fontSize: 11, lsm: 1.3 });
  callout(s, "容斥原理", "大矩形 − 上 − 左 + 左上（被减了两次要加回来）。第 11 周的「最大子矩阵」会直接用到它。", 6.7, 3.6, 2.8, 1.3, { fontSize: 10.5, fill: C.mint, tcolor: C.dark });
}

// ============================ PART 2 ============================
sectionSlide("Part 2", "排序", "会用 sorted 只是起点；稳定性与复杂度才是重点\nsorted 与 key · 稳定性 · 五种基础排序 · 归并求逆序对");

// 2.1 sorted basics
{
  const s = content("2.1", "2 排序 · sorted 与 key", "多关键字排序：key 返回一个元组");
  codeBlock(s, `a = [3, 1, 2]
print(sorted(a))                     # [1, 2, 3]，返回新列表
a.sort(reverse=True)                 # 原地降序 -> [3, 2, 1]

people = [("bob", 20), ("amy", 20), ("cid", 18)]
print(sorted(people, key=lambda p: p[1]))          # 按年龄升序
print(sorted(people, key=lambda p: (p[1], p[0])))  # 年龄升序，同龄按名字升序
print(sorted(people, key=lambda p: (-p[1], p[0]))) # 年龄降序，同龄按名字升序`, 0.5, 1.05, 9.0, 2.6, { fontSize: 10.5, lang: "py" });
  callout(s, "通用写法", "`key` 返回一个**元组**，元素按优先级排列；数值要降序就取负号，字符串要降序就分两次排（利用稳定性，见下一页）。", 0.5, 3.85, 9.0, 1.3, { fontSize: 12 });
}

// 2.1 stability
{
  const s = content("2.1", "2 排序 · 稳定性", "Python 的 sort 是稳定的：相等元素保持原有相对顺序");
  codeBlock(s, `rows = [("a", 2), ("b", 1), ("c", 2)]
rows.sort(key=lambda r: r[0])        # 先按次关键字
rows.sort(key=lambda r: r[1])        # 再按主关键字，次关键字的顺序被保留
print(rows)                          # [('b', 1), ('a', 2), ('c', 2)]`, 0.5, 1.1, 9.0, 1.5, { fontSize: 11.5, lang: "py", hl: [2, 3] });
  callout(s, "「两次排序」技巧", "先按次关键字排一次，再按主关键字排一次——因为**稳定**，第二次排序不会打乱第一次已经排好的同分顺序。字符串要「降序 + 稳定」时特别好用。", 0.5, 2.85, 9.0, 1.15, { fontSize: 12 });
  text(s, "复杂度 O(n log n)（Timsort），已排序数据接近 O(n)。", 0.5, 4.15, 9, 0.35, { fontSize: 11.5, color: C.muted });
}

// 2.2 five sorts table
{
  const s = content("2.2", "2 排序 · 五种基础排序", "复杂度与稳定性一览");
  table(s, [
    ["算法", "平均", "最坏", "空间", "稳定", "特点"],
    ["冒泡", "O(n²)", "O(n²)", "O(1)", "是", "教学用；可提前退出"],
    ["选择", "O(n²)", "O(n²)", "O(1)", "否", "交换次数最少（n−1 次）"],
    ["插入", "O(n²)", "O(n²)", "O(1)", "是", "近乎有序时接近 O(n)"],
    ["归并", "O(n log n)", "O(n log n)", "O(n)", "是", "分治；可顺带求逆序数"],
    ["快排", "O(n log n)", "O(n²)", "O(log n)", "否", "常数最小；随机化避免最坏"],
  ], 0.5, 1.15, 9.0, [1.0, 1.6, 1.6, 1.1, 0.9, 2.8], { fontSize: 12, rowH: 0.5 });
  callout(s, "考试里要不要手写排序？", "一般不要——直接 `sort()`。但**归并排序的合并过程**要会写：求逆序对、合并有序序列都要用（下面两页）。", 0.5, 4.15, 9.0, 1.05, { fontSize: 12 });
}

// 2.2 bubble & insertion
{
  const s = content("2.2", "2 排序 · 冒泡与插入", "两种 O(n²) 排序");
  codeBlock(s, `def bubble_sort(a):
    a = a[:]
    n = len(a)
    for i in range(n - 1):
        swapped = False
        for j in range(n - 1 - i):
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                swapped = True
        if not swapped:              # 已有序
            break
    return a`, 0.5, 1.05, 4.4, 2.75, { fontSize: 9.3, lang: "py" });
  codeBlock(s, `def insertion_sort(a):
    a = a[:]
    for i in range(1, len(a)):
        key, j = a[i], i - 1
        while j >= 0 and a[j] > key:
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = key
    return a`, 5.1, 1.05, 4.4, 2.75, { fontSize: 9.3, lang: "py" });
  callout(s, "对照着看", "冒泡：相邻**交换**，一趟把最大值「冒」到末尾。插入：把 `a[i]` 当作扑克牌，往前找位置**挪出空位**再插入。两者都是稳定排序。", 0.5, 4.0, 9.0, 1.15, { fontSize: 12 });
}

// 2.2 merge & quick
{
  const s = content("2.2", "2 排序 · 归并与快排", "两种 O(n log n) 排序");
  codeBlock(s, `def merge_sort(a):
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
    out.extend(left[i:]); out.extend(right[j:])
    return out`, 0.5, 1.05, 4.4, 2.9, { fontSize: 8.8, lang: "py", hl: [8] });
  codeBlock(s, `def quick_sort(a):
    if len(a) <= 1:
        return a[:]
    pivot = a[len(a) // 2]
    less = [x for x in a if x < pivot]
    equal = [x for x in a if x == pivot]
    greater = [x for x in a if x > pivot]
    return quick_sort(less) + equal + quick_sort(greater)`, 5.1, 1.05, 4.4, 2.9, { fontSize: 8.8, lang: "py" });
  callout(s, "`<=` 保证稳定", "合并时左边相等就先取左边，保持原有相对顺序——这一个符号就是归并「稳定」的全部原因。", 0.5, 4.1, 4.4, 1.05, { fontSize: 11 });
  callout(s, "快排不稳定的原因", "`equal` 段是一次性收集的，原有的相对顺序在这一步已经丢了。", 5.1, 4.1, 4.4, 1.05, { fontSize: 11, fill: C.mint, tcolor: C.dark });
}

// 2.2 verify
{
  const s = content("2.2", "2 排序 · 对拍", "四种手写排序 + 内建 sorted：结果必须一致");
  codeBlock(s, `import random
t = [random.randint(0, 100) for _ in range(200)]
assert bubble_sort(t) == insertion_sort(t) == merge_sort(t) == quick_sort(t) == sorted(t)
print("四种排序与内建 sorted 一致")`, 0.5, 1.1, 9.0, 1.35, { fontSize: 11.5, lang: "py" });
  consoleBlock(s, "四种排序与内建 sorted 一致", 0.5, 2.65, 9.0, 0.55, 12);
  callout(s, "写完手写算法，第一件事是对拍", "小规模随机数据 + `assert`，比对着标准答案看半天更快找出 bug——这个习惯本周后面的贪心也会反复用到。", 0.5, 3.45, 9.0, 1.15, { fontSize: 12.5 });
}

// 2.3 inversions code
{
  const s = content("2.3", "2 排序 · 归并求逆序对", "合并的同时顺手数「谁比谁靠前还更大」");
  codeBlock(s, `def count_inversions(a):
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
    return out, cnt`, 0.5, 1.05, 9.0, 3.15, { fontSize: 9.6, lang: "py", hl: [13] });
  consoleBlock(s, "count_inversions([3, 1, 2])[1]        -> 2\ncount_inversions([5, 4, 3, 2, 1])[1]  -> 10", 0.5, 4.32, 9.0, 0.75, 10.5);
}

// 2.3 why len(left)-i
{
  const s = content("2.3", "2 排序 · 归并求逆序对", "为什么是 `cnt += len(left) - i`，不是 `+= 1`？");
  text(s, "以 [3, 1, 2] 为例：左半 left=[3]，右半排序后 right=[1, 2]。合并时：", 0.5, 1.05, 9, 0.4, { fontSize: 12.5 });
  const rows = [
    ["取 right[0]=1", "1 < 3，逆序", "left 剩下的 [3] 全部比 1 大 -> 一次记 1 个逆序对"],
    ["取 right[1]=2", "2 < 3，逆序", "left 剩下的 [3] 全部比 2 大 -> 再记 1 个逆序对"],
  ];
  table(s, [["步骤", "比较", "为什么是 len(left)-i 个"], ...rows], 0.5, 1.6, 9.0, [1.7, 1.5, 5.8], { fontSize: 11.5, rowH: 0.6 });
  callout(s, "一句话", "`right[j]` 一旦比 `left[i]` 小，它就比 **left 里从 i 到末尾的所有元素**都小（left 已经有序）——这些都是逆序对，**一次性**记上 `len(left) - i` 个，而不是留到以后一个一个数。", 0.5, 3.55, 9.0, 1.15, { fontSize: 12 });
}

// ============================ PART 3 ============================
sectionSlide("Part 3", "贪心", "每一步都选眼前最好的，且不回头——但不总是对的\n三要素 · 排序型贪心 · 交换论证 · 常见形状速查");

// 3.1 three elements
{
  const s = content("3.1", "3 贪心 · 是什么", "每一步都选当前看起来最好的，且不回头");
  const qs = [
    ["贪心策略", "每一步具体怎么选。"],
    ["正确性证明", "为什么局部最优能拼成全局最优。"],
    ["反例检验", "想不出证明，就努力构造反例。"],
  ];
  qs.forEach((q, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.3, 2.85, 2.2, C.code);
    numCircle(s, i + 1, x + 0.2, 1.45, 0.44, C.dark);
    text(s, q[0], x + 0.2, 2.1, 2.5, 0.5, { fontSize: 16, bold: true, color: C.dark, margin: 0 });
    text(s, q[1], x + 0.2, 2.65, 2.5, 0.7, { fontSize: 12, margin: 0, lsm: 1.2 });
  });
  callout(s, "本周的落点", "三要素里最难的从来不是「怎么选」，而是**正确性证明**——3.4 节的交换论证就是专门补这一块的通用方法。", 0.5, 3.75, 9.0, 1.0, { fontSize: 12.5, fill: C.mint, tcolor: C.dark });
}

// 3.2 greedy fails
{
  const s = content("3.2", "3 贪心 · 不总是对的", "找零问题：面额不同，贪心可能不是最优");
  text(s, "面额 [1,5,10,25] 凑 30 → 贪心 25+5，2 枚，正确。面额 [1,3,4] 凑 6 → 贪心 4+1+1，3 枚；最优 3+3，2 枚。", 0.5, 1.05, 9, 0.55, { fontSize: 12, lsm: 1.2 });
  codeBlock(s, `def greedy_coins(coins, amount):
    coins = sorted(coins, reverse=True)
    cnt, rest = 0, amount
    for c in coins:
        take = rest // c
        cnt += take
        rest -= take * c
    return cnt if rest == 0 else -1


print(greedy_coins([1, 5, 10, 25], 30))  # 2  正确
print(greedy_coins([1, 3, 4], 6))  # 3  贪心错了，最优是 2`, 0.5, 1.72, 9.0, 2.15, { fontSize: 10.3, lang: "py" });
  callout(s, "贪心错在哪", "凑 6 时贪心先拿最大的 4，剩下 2 只能 1+1，共 3 枚；而 3+3 只要 2 枚。局部最优不等于全局最优——下一页用 dp_coins 求真正的最优解。", 0.5, 4.0, 9.0, 0.95, { fontSize: 12, fill: C.mint, tcolor: C.dark });
}

// 3.2 dp_coins
{
  const s = content("3.2", "3 贪心 · 不总是对的", "找零问题：dp_coins 给出真正的最优解");
  text(s, "dp[i] 表示凑出金额 i 的最少枚数：对每个面额 c，dp[i] = min(dp[i], dp[i-c] + 1)。", 0.5, 1.05, 9, 0.55, { fontSize: 12, lsm: 1.2 });
  codeBlock(s, `def dp_coins(coins, amount):
    INF = float('inf')
    dp = [0] + [INF] * amount
    for i in range(1, amount + 1):
        for c in coins:
            if c <= i and dp[i - c] + 1 < dp[i]:
                dp[i] = dp[i - c] + 1
    return dp[amount] if dp[amount] < INF else -1


print(greedy_coins([1, 3, 4], 6), dp_coins([1, 3, 4], 6))  # 3 2  贪心错了
print(greedy_coins([1, 5, 10, 25], 30), dp_coins([1, 5, 10, 25], 30))  # 2 2`, 0.5, 1.72, 9.0, 2.15, { fontSize: 10.3, lang: "py" });
  callout(s, "第 11 周动态规划的动机", "贪心失效的地方，DP 用「枚举所有子问题的最优值」接管；这里先看效果（greedy_coins 见上一页），DP 的完整方法第 11 周细讲。", 0.5, 4.0, 9.0, 0.95, { fontSize: 12, fill: C.mint, tcolor: C.dark });
}

// 3.3 intro
{
  const s = content("3.3", "3 贪心 · 排序型贪心", "最常见的套路：先按某个键排序，再一遍扫过去");
  callout(s, "难点全在「按什么排」", "绝大多数入门贪心题的形状都是：先排序，再扫一遍累加/比较。下面四道例题，排序键一道比一道不直观。", 0.5, 1.2, 9.0, 1.0, { fontSize: 13.5 });
  table(s, [
    ["例题", "排序键", "小节"],
    ["01017 装箱问题", "从大到小放规格", "本页下方"],
    ["12559 最大最小整数", "`a+b` 与 `b+a` 比较", "下一页"],
    ["19948 因材施教", "排序后切最大间隙", "下下页"],
    ["18211 军备竞赛", "排序后左右双指针", "再下一页"],
  ], 0.5, 2.4, 9.0, [3.0, 3.6, 2.4], { fontSize: 12.5, rowH: 0.48 });
}

// 3.3 01017
{
  const s = content("3.3", "3 贪心 · 01017 装箱问题", "1×1 到 6×6 六种产品，每箱 6×6，求最少箱子数");
  text(s, "策略：从大到小放。6×6 独占一箱；5×5 剩 11 个 1×1 空位；4×4 剩 5 个 2×2；3×3 四个一箱，余数按表补。", 0.5, 1.05, 9, 0.55, { fontSize: 11.5, lsm: 1.2 });
  codeBlock(s, `# 一个 3x3 之后剩余的 2x2 空位数：余 1 -> 5, 余 2 -> 3, 余 3 -> 1
REST_2 = [0, 5, 3, 1]
a, b, c, d, e, f = nums                            # 1x1..6x6 各自的数量
boxes = d + e + f + (c + 3) // 4                   # 6x6 5x5 4x4 和 3x3
space2 = d * 5 + REST_2[c % 4]                     # 可容纳的 2x2 空位
if b > space2:
    boxes += (b - space2 + 8) // 9                 # 一箱放 9 个 2x2
space1 = boxes * 36 - (f*36 + e*25 + d*16 + c*9 + b*4)
if a > space1:
    boxes += (a - space1 + 35) // 36`, 0.5, 1.68, 9.0, 2.65, { fontSize: 9.6, lang: "py" });
  callout(s, "REST_2 这张表", "3×3 的产品每箱放 4 个，剩下的空间能塞多少个 2×2 不是线性的，必须打表。**贪心题的细节往往就藏在这种小表里。**", 0.5, 4.42, 9.0, 0.7, { fontSize: 10.8 });
}

// 3.3 12559
{
  const s = content("3.3", "3 贪心 · 12559 最大最小整数", "拼接数字串成整数，求能拼出的最大值与最小值");
  text(s, "关键：不能按字典序排，也不能按数值排。正确的比较是「a+b 和 b+a 哪个大」。", 0.5, 1.05, 9, 0.4, { fontSize: 12.5 });
  codeBlock(s, `import functools

def largest_concat(strs):
    cmp = lambda x, y: -1 if x + y > y + x else (1 if x + y < y + x else 0)
    return ''.join(sorted(strs, key=functools.cmp_to_key(cmp)))

nums = ["7", "13", "2"]
print(largest_concat(nums))          # 7213`, 0.5, 1.55, 6.3, 1.95, { fontSize: 10.3, lang: "py" });
  callout(s, "为什么字典序、数值序都错", "字典序把 `\"9\"` 排在 `\"13\"` 后面；数值序完全不管拼接后的长度关系。`a+b > b+a` 这个比较**可以证明满足传递性**，才能拿来当排序键（§3.4）。", 7.0, 1.55, 2.5, 3.4, { fontSize: 10.5, fill: C.mint, tcolor: C.dark });
  consoleBlock(s, "largest_concat(['7','13','2'])  -> 7213\nsmallest_concat(['7','13','2']) -> 1327", 0.5, 3.65, 6.3, 0.75, 10.5);
  text(s, "`smallest_concat` 是同一个 `cmp`，把 `>` 和 `<` 互换。", 0.5, 4.5, 6.3, 0.3, { fontSize: 10, color: C.muted, margin: 0 });
}

// 3.3 19948
{
  const s = content("3.3", "3 贪心 · 19948 因材施教", "n 个学生分 k 组，组内最高分减最低分之和最小");
  text(s, "策略：先排序（同组学生排序后一定连续），总差异 = (最大−最小) − (被切开的 k−1 个相邻差)；要总差异最小，就切最大的 k−1 个相邻差。", 0.5, 1.05, 9, 0.6, { fontSize: 12, lsm: 1.2 });
  codeBlock(s, `n, k = 7, 3
scores = [1, 3, 5, 5, 6, 9, 15]
scores.sort()
gaps = sorted((scores[i+1] - scores[i] for i in range(n - 1)), reverse=True)
total = scores[-1] - scores[0] - sum(gaps[:k - 1])
print(total)          # 14 - (6 + 3) = 5`, 0.5, 1.75, 9.0, 1.75, { fontSize: 10.8, lang: "py" });
  cells(s, 2.85, 3.7, [1, 3, 5, 5, 6, 9, 15], { cw: 0.62, ch: 0.44, fs: 12 });
  text(s, "相邻差：2 2 0 1 3 6 → 排序后切最大的 2 个（6、3）", 0.5, 4.3, 9.0, 0.4, { fontSize: 11, color: C.muted, align: "center", lsm: 1.15 });
}

// 3.3 18211
{
  const s = content("3.3", "3 贪心 · 18211 军备竞赛", "排序后双指针：钱不够就把最贵的卖掉");
  codeBlock(s, `def arms_race(p, prices):
    prices.sort()
    lo, hi, adv = 0, len(prices) - 1, 0
    while lo <= hi:
        if p >= prices[lo]:
            p -= prices[lo]; lo += 1; adv += 1
        elif lo < hi and adv > 0:      # 必须还有优势才敢卖，且不能卖掉正要造的那份
            p += prices[hi]; hi -= 1; adv -= 1
        else:
            break
    return adv`, 0.5, 1.05, 9.0, 2.15, { fontSize: 10, lang: "py", hl: [6] });
  callout(s, "`adv > 0` 为什么关键", "优势为 0 时卖出会变成负优势，题目不允许——**贪心题的边界条件往往就是它的全部难度**。", 0.5, 3.3, 9.0, 0.85, { fontSize: 11.5, fill: "FDF0EE", tcolor: C.bad });
  text(s, "arms_race(10, [3, 4, 5, 6]) 逐步执行 → 见下页", 0.5, 4.25, 9, 0.35, { fontSize: 11, color: C.muted });
}

// 3.3 18211 trace
{
  const s = content("3.3", "3 贪心 · 18211 逐步执行", "arms_race(10, [3, 4, 5, 6])，排序后 [3,4,5,6]");
  table(s, [
    ["步骤", "p", "lo", "hi", "adv", "动作"],
    ["初始", "10", "0", "3", "0", "—"],
    ["1", "7", "1", "3", "1", "造 3（钱够，造最便宜的）"],
    ["2", "3", "2", "3", "2", "造 4"],
    ["3", "9", "2", "2", "1", "钱不够造 5，卖掉最贵的 6"],
    ["4", "4", "3", "2", "2", "造 5"],
    ["结束", "—", "3", "2", "2", "lo > hi，循环结束"],
  ], 0.5, 1.1, 9.0, [1.1, 1.1, 0.9, 0.9, 0.9, 4.1], { fontSize: 12, rowH: 0.46 });
  consoleBlock(s, "arms_race(10, [3, 4, 5, 6])  ->  2", 0.5, 4.25, 9.0, 0.55, 12);
}

// 3.4 排队打水的故事
{
  const s = content("3.4", "3 贪心 · 交换论证", "先看一个排队打水的故事");
  threeSteps(s, "两个人排队打水：张三要 5 分钟，李四只要 1 分钟。谁排前面，大家「等待的总时间」更短？", [
    ["张三在前，李四在后", "李四要等 5 分钟，张三不用等：总等待 0 + 5 = 5 分钟。"],
    ["李四在前，张三在后", "张三只等 1 分钟，李四不用等：总等待 0 + 1 = 1 分钟。"],
    ["队伍里其他人受影响吗？", "不受影响：这两人合计占用的时间不变，后面的人等待的时间一样。"],
  ], ["小结", "相邻两人「长的在前、短的在后」，互换一下，总等待只会变少、别人不受影响。这次互换就是「交换论证」里的「交换」。"]);
  s.addNotes("先不要讲证明，讲故事。两个人打水，张三 5 分钟，李四 1 分钟。让同学自己猜谁先。算一下：张三先，总等待 5；李四先，总等待 1。所以短的先更好。再问一句：队伍里其他人会受影响吗？不会——这两个人合起来占用的时间不变，后面的人等的时间一样。强调：这就是「交换」，把相邻两个人换个位置，只影响这两个人，别人不动。");
}

// 3.4 从一次交换到一个证明
{
  const s = content("3.4", "3 贪心 · 交换论证", "从一次交换到一个证明");
  threeSteps(s, "我们想证明「短的先」是最优排法，但不用把所有排法试一遍。换个思路：", [
    ["假设有一个最优排法，但它不是「短的先」", "那队伍里一定有相邻的一对：长的在前、短的在后。"],
    ["把这一对互换", "上一页算过：互换不会让总等待变多。所以换完仍然是最优。"],
    ["反复互换，直到全队「短的先」", "每换一次，「反了的」少一对，不会换个没完；而且全程没变差。"],
  ], ["结论", "任何最优排法都能一步步「掰」成短的先，而且越掰越不差——所以「短的先」本身就是最优。这就是交换论证。"]);
  s.addNotes("这一页把一次交换升级成证明。关键思想：不要试遍所有排法，而是证明「任何最优排法都能一步步改成短的先，而且改的过程中不会变差」。反问同学：如果一个排法不是短的先，一定能找到相邻的一对反了的吗？是的（否则整队就已经是短的先了）。每换一次反了的对数少一，所以一定会结束。");
}

// 3.4 skeleton
{
  const s = content("3.4", "3 贪心 · 交换论证", "把故事写成标准三步");
  threeSteps(s, "把刚才的故事换成通用说法。要证「按规则 R 排出来的解是最优的」，走三步：", [
    ["取任意一个最优解 OPT", "不假设它长什么样（故事里：任意一个最优排法）。"],
    ["若相邻两项顺序与 R 相反，就交换", "证明目标函数不会变差（故事里：总等待不会变多）。"],
    ["每交换一次，「反了的」至少少一对", "有限步后 OPT 变成 R 序，全程没变差——R 序也是最优解。"],
  ], ["看清第 3 步", "它没说「R 序是唯一的最优解」，只说**最优值能被 R 序取到**——贪心需要的恰好就是这一句。"]);
  footnote(s, "注：OPT = optimal，指「任意一个最优解」；R = 你提出的贪心规则（如「短的先」），按它排出来的顺序叫「R 序」。", 5.02);
  s.addNotes([
    "这一页是把前两页的故事换成通用语言，对照着讲：任意一个最优解 OPT = 任意一个最优排法；相邻反了的就交换 = 长的在前短的在后就互换；逆序对 = 反了的对数。最后一句要强调：只证明了规则的排法能取到最优值，不是说它唯一，贪心需要的就是这一句。",
    "术语：OPT 是 optimal 的缩写，指任意一个最优解；R 是你提出的贪心规则，R 序就是按它排出来的顺序。",
  ].join("\n"));
}

// 3.4 why adjacent
{
  const s = content("3.4", "3 贪心 · 交换论证", "为什么必须是「相邻」两项");
  callout(s, "只有相邻交换，其余各项贡献完全不变", "两种摆法的差才会只剩下 a、b 互相之间的那一项。", 0.5, 1.2, 9.0, 1.0, { fontSize: 13 });
  callout(s, "隔着第三项交换会怎样", "如果隔着第三项去交换，中间那项的处境也变了，差值里会混进与 a、b 无关的量，就化简不出干净的不等式。", 0.5, 2.4, 9.0, 1.0, { fontSize: 12.5, fill: "FDF0EE", tcolor: C.bad });
  callout(s, "一句话", "「相邻」不是为了省事，是这套推导能成立的**前提**。", 0.5, 3.6, 9.0, 0.85, { fontSize: 13, fill: C.mint, tcolor: C.dark });
  s.addNotes("回到前面的故事：为什么只能换相邻的人？因为相邻互换时，只有这两人的位置变了，其他人前面的总时间不变。若隔着一个人去换，中间那个人的等待也变了，算式里会混进无关的量，就推不出干净的结论。");
}

// 3.4 derive key
{
  const s = content("3.4", "3 贪心 · 交换论证", "反过来用：以 12559 为例，把排序键推出来");
  text(s, "先猜一猜：两张卡片 3 和 30，拼成 330 还是 303？330 更大，所以 3 排前面。再试 9 和 91：991 > 919，9 在前；5 和 56：565 > 556，56 在前。规律：谁在前拼出来的更大，谁就排前面。", 0.5, 1.05, 9, 0.95, { fontSize: 12.5, lsm: 1.2 });
  table(s, [
    ["谁在前", "这一段拼接串", "结论（令前者不差于后者）"],
    ["a 在前", { t: "a + b", mono: true }, "a+b ≥ b+a 时，a 应排在前面"],
    ["b 在前", { t: "b + a", mono: true }, "b+a ≥ a+b 时，b 应排在前面"],
  ], 0.5, 2.05, 9.0, [1.8, 2.6, 4.6], { fontSize: 12.5, rowH: 0.48 });
  // 与 callout 同一版式，但正文框加高到 1.15、正文整段用等宽字体（与现行课件一致）
  card(s, 0.5, 3.7, 9.0, 1.3, C.cream);
  text(s, "为什么只比这两种拼法就够", 0.65, 3.8, 8.7, 0.3, { fontSize: 12, bold: true, color: C.goldText, margin: 0 });
  text(s, [{ text: "别的牌都不动，只有相邻这两张换位。两种拼法一样长（都是 len(a)+len(b)），位权相同，所以整串谁大，就看这一段谁大。因此 a 应排在 b 前面 ⟺ a+b > b+a——排序键是推出来的，不是试出来的。", options: { fontFace: MONO, color: C.text } }], 0.65, 4.12, 8.7, 1.15, { fontSize: 12, margin: 0, lsm: 1.15 });
  s.addNotes("讲法：先不提公式，让同学猜 3 和 30 拼成 330 还是 303（330 大）；再试 9、91 与 5、56，让同学自己总结：谁在前拼出来的更大，谁就排前面。再把两种拼法记作 a+b 和 b+a，对应表格。接着讲为什么只比这一段就够：别的牌不动，只有相邻两张换位；两种拼法一样长，位权相同，整串谁大就看这一段谁大。最后收尾：若最优排法里有相邻的 a、b 满足 a+b < b+a，互换后整串变大，与最优矛盾，所以最优排法里每一对相邻都满足规则。这与排队打水的故事一一对应。");
}

// 3.4 verify with brute force
{
  const s = content("3.4", "3 贪心 · 交换论证", "推完之后，一定要和暴力对拍");
  codeBlock(s, `import functools, itertools

def by_rule(strs):
    """按交换论证推出的规则排：a 在 b 前 ⟺ a+b > b+a"""
    cmp = lambda x, y: -1 if x + y > y + x else (1 if x + y < y + x else 0)
    return ''.join(sorted(strs, key=functools.cmp_to_key(cmp)))

def by_brute(strs):
    return max(''.join(p) for p in itertools.permutations(strs))

nums = ["3", "30", "34", "5", "9"]
print(by_rule(nums))                                   # 9534330
print(''.join(sorted(nums, reverse=True)))             # 9534303  字典序，错
print(''.join(sorted(nums, key=int, reverse=True)))    # 3430953  数值序，错`, 0.5, 1.05, 9.0, 2.75, { fontSize: 9.6, lang: "py" });
  consoleBlock(s, "300 组随机数据：规则排序的结果 == 全排列暴力的最大值", 0.5, 3.95, 9.0, 0.55, 11.5);
  text(s, "推导会出错，对拍不会——300 组随机字符串跑一遍 by_rule 与 by_brute，逐一断言相等。", 0.5, 4.62, 9, 0.35, { fontSize: 11, color: C.muted });
  s.addNotes("推出规则后一定要对拍。用全排列暴力的最大值和规则排序的结果比较，随机 300 组都要相等。强调：推导会出错，对拍不会。");
}

// 3.4 two forms + preconditions
{
  const s = content("3.4", "3 贪心 · 交换论证", "两种形态，别混；两个前提必须自己检查");
  table(s, [
    ["", "用在哪", "交换什么"],
    ["相邻交换", "排序型贪心（本节 12559）", "OPT 里相邻的两项"],
    ["首元素替换", "选择型贪心（第 10 周区间问题）", "把 OPT 的第一个选择换成贪心的选择"],
  ], 0.5, 1.1, 9.0, [1.6, 3.7, 3.7], { fontSize: 12, rowH: 0.5 });
  callout(s, "前提一：R 必须是全序（满足传递性）", "否则 `sort` 排出来的结果依赖比较的先后，「R 序」根本没有定义。**用浮点数当排序键最容易翻车**——本该相等的键因误差变得一大一小。", 0.5, 3.0, 4.4, 1.5, { fontSize: 10.8 });
  callout(s, "前提二：交换只影响这两项要真的成立", "如果代价依赖全局的某个量，而不只是前后关系，这一步必须重算，不能照抄。", 5.1, 3.0, 4.4, 1.5, { fontSize: 10.8, fill: C.mint, tcolor: C.dark });
  footnote(s, "注：全序 = 任意两项都能比较、结果前后一致且可传递（a 在 b 前、b 在 c 前，则 a 在 c 前）；若出现「石头剪刀布」式循环，就不是全序。", 4.75);
  s.addNotes([
    "最后两个提醒。一是规则要满足传递性，浮点数当键最容易翻车；二是交换只能影响这两项，如果代价依赖全局量就要重算。表格里的两种形态：排序型贪心用相邻交换，选择型贪心（第 10 周区间问题）用首元素替换。",
    "术语：全序 = 任意两项都能比较、结果前后一致、满足传递。反例是石头剪刀布：a 胜 b、b 胜 c、c 胜 a，排不出唯一顺序。",
  ].join("\n"));
}

// 3.5 cheat sheet
{
  const s = content("3.5", "3 贪心 · 常见形状速查", "拿到贪心题，先往这张表上对一对");
  table(s, [
    ["形状", "排序键", "例题"],
    ["拼接最大 / 最小数", { t: "a+b vs b+a", mono: true }, "12559"],
    ["分组最小差异", "排序后切最大间隙", "19948"],
    ["用最少的箱子 / 船", "从大到小放", "01017"],
    ["双指针取两端", "排序后左右夹", "18211"],
    ["区间问题", "按右端点排", "第 10 周"],
    ["会议室 / 活动选择", "按结束时间排", "第 10 周"],
  ], 0.5, 1.15, 9.0, [3.0, 3.0, 3.0], { fontSize: 12.5, rowH: 0.5 });
}

// ============================ PART 4 ============================
sectionSlide("Part 4", "复杂度实战", "同一道题，三种写法，看到 n 就该知道写哪一版\n最大连续子数组和：O(n³) → O(n²) → O(n)");

// 4 three implementations
{
  const s = content("4", "4 复杂度实战", "最大连续子数组和（第 11 周会作为 DP 重讲）");
  codeBlock(s, `def brute(a):                       # O(n^3)
    n, best = len(a), a[0]
    for i in range(n):
        for j in range(i, n):
            best = max(best, sum(a[i:j + 1]))
    return best

def kadane(a):                      # O(n)
    best = cur = a[0]
    for v in a[1:]:
        cur = max(v, cur + v)       # 要么接上前面，要么另起一段
        best = max(best, cur)
    return best`, 0.5, 1.05, 6.3, 3.1, { fontSize: 10, lang: "py" });
  callout(s, "还有一个 O(n²) 版本", "先建前缀和数组 `pre`，`sum(a[i:j+1])` 变成 `pre[j+1]-pre[i]`——省掉重复求和，但双重循环还在。完整代码见讲义 §4。", 7.0, 1.05, 2.5, 2.0, { fontSize: 10.5 });
  consoleBlock(s, "assert brute(t) == prefix(t) == kadane(t)\n三种写法结果一致", 7.0, 3.25, 2.5, 0.9, 10);
  text(s, "kadane 的核心决策：`cur` 要么接上前面的段，要么放弃前面、从当前值另起一段。", 0.5, 4.3, 6.3, 0.5, { fontSize: 11, color: C.muted, lsm: 1.15 });
}

// 4 complexity table
{
  const s = content("4", "4 复杂度实战", "同一个 n，三个不同的可解规模");
  table(s, [
    ["n", "O(n³)", "O(n²)", "O(n)"],
    ["10³", { t: "10⁹ ✗", color: C.bad }, { t: "10⁶ ✓", color: C.ok }, { t: "10³ ✓", color: C.ok }],
    ["10⁵", { t: "✗", color: C.bad }, { t: "10¹⁰ ✗", color: C.bad }, { t: "10⁵ ✓", color: C.ok }],
    ["10⁷", { t: "✗", color: C.bad }, { t: "✗", color: C.bad }, { t: "10⁷ ✓", color: C.ok }],
  ], 0.5, 1.2, 9.0, [1.8, 2.4, 2.4, 2.4], { fontSize: 14, rowH: 0.6, align: "center" });
  callout(s, "结论", "同一道题，三种复杂度对应三个不同的可解规模。**看到 n 就该知道自己要写哪一版**——这是本周最该带走的习惯。", 0.5, 3.4, 9.0, 1.05, { fontSize: 13, fill: C.mint, tcolor: C.dark });
}

// 本周作业
{
  const s = content("§", "本周练习", "本周作业");
  table(s, [
    ["#", "题目", "平台 / 编号", "考点"],
    ["1", "矩阵运算（先乘再加）", { t: "E18161", mono: true }, "矩阵乘法、维度判断"],
    ["2", "计算矩阵边缘元素之和", { t: "E07743", mono: true }, "二维遍历"],
    ["3", "矩阵交换行", { t: "02899", mono: true }, "二维列表"],
    ["4", "二维矩阵上的卷积运算", { t: "E19942", mono: true }, "保护圈、邻域"],
    ["5", "装箱问题", { t: "01017", mono: true }, "贪心 + 打表"],
    ["6", "最大最小整数", { t: "12559", mono: true }, "自定义比较、交换论证"],
    ["7", "因材施教", { t: "19948", mono: true }, "排序型贪心"],
    ["8", "军备竞赛", { t: "18211", mono: true }, "双指针贪心"],
    [{ t: "9*", color: C.goldText }, "节省存储的矩阵乘法", { t: "E23555", mono: true }, "稀疏矩阵"],
    [{ t: "10*", color: C.goldText }, "螺旋矩阵", { t: "M18106", mono: true }, "模拟、方向数组"],
  ], 0.5, 1.05, 9.0, [0.7, 3.1, 1.9, 3.3], { fontSize: 11, rowH: 0.335, tight: true });
  text(s, "* 选做。E/M 开头与纯数字编号：cs101.openjudge.cn。", 0.5, 4.9, 9, 0.25, { fontSize: 10, color: C.muted, margin: 0 });
}

// Thinking questions
{
  const s = content("?", "本周练习 · 思考题", "思考题");
  const qs = [
    ["交换论证", "按 §3.4 三步骨架，把「按 a+b > b+a 排序得到的拼接结果最大」写成完整证明；再补上传递性那一步。"],
    ["打表", "装箱问题里 `REST_2 = [0, 5, 3, 1]` 是怎么算出来的？画图验证 `c % 4 == 2` 时为什么是 3。"],
    ["逆序对", "归并排序求逆序对时，`cnt += len(left) - i` 为什么不是 `cnt += 1`？"],
    ["前缀和", "二维前缀和的容斥公式里，为什么 `pre[r1][c1]` 要加回来？"],
    ["交换论证的边界", "01017 装箱问题用的是「从大到小放」。它能用 §3.4 的三步骨架证明吗？如果不能，卡在哪一步？"],
  ];
  qs.forEach((q, i) => {
    const x = 0.5 + (i % 2) * 4.6, y = 1.1 + Math.floor(i / 2) * 1.32;
    card(s, x, y, 4.4, 1.18, i % 2 === 0 ? C.code : C.cream);
    numCircle(s, i + 1, x + 0.16, y + 0.13, 0.36, C.dark);
    text(s, q[0], x + 0.62, y + 0.1, 3.6, 0.34, { fontSize: 12.5, bold: true, color: C.dark, valign: "middle", margin: 0 });
    s.addText(runs(q[1], { color: C.text }), { x: x + 0.18, y: y + 0.5, w: 4.05, h: 0.62, fontFace: FONT, fontSize: 9.6, margin: 0, isTextBox: true, valign: "top", lineSpacingMultiple: 1.05 });
  });
}

summarySlide("本周小结", [
  ["矩阵", "二维列表一律 `[[0]*n for _ in range(m)]`；边界多时用**保护圈**，方向用**方向数组**；矩阵乘法 O(mkn)，二维前缀和靠**容斥**做到 O(1) 查询。"],
  ["排序", "会用 `key=lambda x: (主, 次)` 就够；**稳定性**让「两次排序」成为可能。归并的合并过程要能默写。"],
  ["贪心", "贪心 = **排序 + 一遍扫**，难在选排序键；不会证明就**构造反例**。找零 `[1,3,4]` 凑 6 是标准反例。"],
  ["交换论证", "排序键要用交换论证推，不要猜：设相邻两项 a、b，令「a 在前」不劣，化简出的不等式就是 `key`。推完必须和暴力对拍。"],
  ["复杂度直觉", "看到 n 的范围就知道该写哪个复杂度的版本——这是本周最该带走的习惯。"],
]);

// Next week
sectionSlide("下周预告", "矩阵、队列、栈与贪心练习", "继续矩阵与贪心的练习，并引入两种最基本的线性结构\n栈与队列 · 单调栈 · 单调队列");

  await D.save(OUT);
})().catch((e) => { console.error(e); process.exit(1); });

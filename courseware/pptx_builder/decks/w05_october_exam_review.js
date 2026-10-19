// 第 5 周 10 月月考与阶段复习 —— 由 202609_ADS_W05_October_Exam_Review.md 整理成的讲课 PPT。
// 生成：cd courseware/pptx_builder && node decks/w05_october_exam_review.js ../202609_ADS_W05_October_Exam_Review.pptx
// 页上所有的代码运行结果都在 Python 3.12 下实跑核对过；改代码时连同结果一起改。
const path = require("path");
const { createDeck } = require("../lib");

const OUT = process.argv[2] || path.join(__dirname, "..", "out", "202609_ADS_W05_October_Exam_Review.pptx");

(async () => {
  const D = createDeck({ title: "计算概论（B）第 5 周 10 月月考与阶段复习", author: "Hongfei Yan" });
  const {
    pres, C, FONT, MONO, runs, text, bullets, card, codeBlock, consoleBlock, callout, table,
    cells, arrowLabel, pill, numCircle, titleSlide, sectionSlide, content, summarySlide,
  } = D;

// ---- slides（顶层不缩进，避免改动模板字符串里的代码缩进）----
// =====================================================================
// Cover
titleSlide({
  kicker: "计算概论（B） · 第 5 周 · 2026 Fall",
  title: "10 月月考与阶段复习",
  subtitle: "第 1–4 周知识清单自检 · 月考样卷 6 题 · 考后订正方法 · 考场策略",
  topics: "第 1–4 周知识清单自检（语法容器 · 计算机基础 · 复杂度）\n月考样卷：6 题，含题面 / 样例 / 思路 / C++ 与 Python 参考代码\n备选题库 · 考后订正的三分类方法\n机房考试流程与考场策略",
  footer: "Compiled by Hongfei Yan · 2026 Fall · github.com/GMyhf/2026fall-cs101",
});

// Positioning
{
  const s = content("?", "本周导引", "月考不是筛人，是体检");
  card(s, 0.5, 1.1, 9.0, 0.85, C.dark);
  text(s, "它要在 11 月的核心内容（DP、搜索）开始之前，把三件事暴露出来：", 0.75, 1.1, 8.5, 0.85, { fontSize: 15, bold: true, color: C.white, valign: "middle", margin: 0 });
  const qs = [
    ["语法关", "能不能在**没有 AI、没有搜索**的情况下，写出正确的循环、分支、字符串处理？"],
    ["速度关", "同样的思路，112 分钟能写完 6 题还是 2 题？打字与编辑速度够不够？"],
    ["调试关", "看到 WA 能不能自己造数据定位？有没有独立排错的能力？"],
  ];
  qs.forEach((q, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 2.15, 2.85, 1.9, C.code);
    numCircle(s, i + 1, x + 0.2, 2.32, 0.46, C.dark);
    text(s, q[0], x + 0.2, 2.92, 2.5, 0.4, { fontSize: 15, bold: true, color: C.dark, margin: 0 });
    text(s, q[1], x + 0.2, 3.3, 2.5, 0.65, { fontSize: 11, margin: 0, lsm: 1.15 });
  });
  callout(s, "考砸了不要紧，考完不订正才要紧", "本周讲义第 5 节给了订正的具体方法——分类、关题解重写、记录错误类型。", 0.5, 4.25, 9.0, 0.9, { fontSize: 12.5, fill: C.mint, tcolor: C.dark });
}

// Roadmap
{
  const s = content("≡", "本周导引", "内容地图");
  const cols = [
    ["1  自检", ["1 月考的定位：体检的三件事", "1.1 考试形式：112 分钟 / 6 题", "2 第 1–4 周知识清单（逐条打勾）", "2.4 常用模板（写进 cheat sheet）"]],
    ["2  样卷", ["3 月考样卷：难度梯度 T1→T6（C++ / Python 双解）", "每题：题面 · 思路 · C++ 与 Python 代码", "4 备选题库（可替换样卷任意一题）"]],
    ["3  之后", ["5 考后订正：三分类 + 重写规则", "5.3 建立自己的错题类型表", "6 考场策略：112 分钟时间预算", "7 本周作业 · 小结"]],
  ];
  cols.forEach((c, i) => {
    const x = 0.5 + i * 3.05;
    card(s, x, 1.15, 2.85, 3.9, i === 1 ? C.cream : C.code);
    text(s, c[0], x + 0.2, 1.3, 2.5, 0.45, { fontSize: 20, bold: true, color: C.dark, margin: 0 });
    bullets(s, c[1], x + 0.15, 1.9, 2.6, 3.0, { fontSize: 12, gap: 10 });
  });
}

// ============================ PART 1 ============================
sectionSlide("Part 1", "月考的定位", "112 分钟 / 6 题，与期末机考同规格\n考试形式 · 三件要暴露的事");

// 1.1 exam format
{
  const s = content("1.1", "1 月考的定位", "考试形式");
  table(s, [
    ["项目", "说明"],
    ["地点", "机房（具体安排以通知为准）"],
    [{ t: "时长", bold: true }, { t: "112 分钟", bold: true, color: C.ok }],
    [{ t: "题量", bold: true }, { t: "6 题", bold: true, color: C.ok }],
    ["平台", "OpenJudge（cs101 小组）"],
    ["语言", "Python 3 为主，允许 C++"],
    ["允许", "十页 A4，双面，手写或打印 cheat sheet"],
  ], 0.5, 1.1, 9.0, [1.6, 7.4], { fontSize: 13, rowH: 0.42 });
  callout(s, "禁止", "**任何 AI 工具**（含本地模型）、联网查询、任何形式的交流。", 0.5, 4.12, 4.35, 0.85, { fontSize: 12, fill: "FDF0EE", tcolor: C.bad });
  callout(s, "学术诚信", "**无法解释自己提交的代码**，按学术不端处理。", 5.15, 4.12, 4.35, 0.85, { fontSize: 12, fill: "FDF0EE", tcolor: C.bad });
}

// ============================ PART 2 ============================
sectionSlide("Part 2", "第 1–4 周知识清单", "逐条打勾，打不了勾的就是这周要补的\n语法与容器 · 计算机基础 · 复杂度 · 常用模板");

// 2.1 syntax checklist
{
  const s = content("2.1", "2 知识清单 · 语法与容器", "逐条打勾");
  bullets(s, [
    "三种输入形态：`int(input())` / `map(int, input().split())` / `list(map(...))`",
    "不定行输入：`for line in sys.stdin` 与 `try/except EOFError`",
    "输出格式：`print(*a)`、`f\"{x:.2f}\"`、`sep=` / `end=`",
    "字符串：`strip` `split` `join` `replace` `find` `[::-1]` `swapcase`",
    "列表：`append` `pop` `sort` `sorted(key=)` 切片、列表推导式",
    "二维列表正确建法 `[[0]*n for _ in range(m)]`（不能用 `[[0]*n]*m`）",
    "`dict` / `set` / `Counter` / `defaultdict` 的基本用法",
    "`enumerate` / `zip` / `range(start, stop, step)`",
  ], 0.5, 1.1, 9.0, 3.9, { fontSize: 13.5, gap: 10 });
}

// 2.2 computer basics checklist
{
  const s = content("2.2", "2 知识清单 · 计算机基础", "第 3 周内容自检");
  bullets(s, [
    "进制转换：`bin/oct/hex`、`int(s, base)`、除基取余",
    "补码：负数 = 取反加一；n 位范围 −2ⁿ⁻¹ ~ 2ⁿ⁻¹−1",
    "位运算：`&` `|` `^` `<<` `>>`；`n & (n-1)`、`n & 1`",
    "ASCII：`'0'=48` `'A'=65` `'a'=97`，`ord` / `chr`",
    "浮点：不能用 `==` 比较；`int(x**0.5)` 要校正",
  ], 0.5, 1.1, 9.0, 2.6, { fontSize: 14, gap: 14 });
  callout(s, "自检打不了勾？", "回第 3 周讲义《计算机原理（1/2）》对应小节重看一遍，本周样卷的 T3（C++ 64 位整数溢出）、T4（筛法）直接考这些。", 0.5, 4.0, 9.0, 0.95, { fontSize: 12.5, fill: C.mint, tcolor: C.dark });
}

// 2.3 complexity checklist
{
  const s = content("2.3", "2 知识清单 · 复杂度", "第 4 周内容自检");
  bullets(s, [
    "能说出 list / set / dict 各操作的复杂度",
    "能从 n 的范围倒推可用的复杂度",
    "知道 `x in lst`、`lst.pop(0)`、循环内字符串拼接是 O(n) 的坑",
    "会写埃氏筛",
  ], 0.5, 1.1, 9.0, 2.2, { fontSize: 14.5, gap: 16 });
  callout(s, "本周样卷怎么用到", [
    "T4：T 组询问若每次现场试除会 TLE，要先筛一次、再查表。",
    "T3 / T5：先排序（O(n log n)）再贪心，不要两两枚举（O(n²)）。",
    "T6：每批警员只入队、出队一次，用队列而不是每次扫全体。",
  ], 0.5, 3.5, 9.0, 1.45, { fontSize: 12, gap: 6 });
}

// 2.4 templates 1
{
  const s = content("2.4", "2 知识清单 · 常用模板", "写进 cheat sheet（1/3）：快速输入与最大公约数");
  codeBlock(s, `# 1) 快速输入
import sys
data = sys.stdin.read().split()

# 2) 多组数据直到 EOF
for line in sys.stdin:
    line = line.strip()
    if not line:
        continue

# 3) 最大公约数
def gcd(a, b):
    while b:
        a, b = b, a % b
    return a`, 0.5, 1.15, 9.0, 3.35, { fontSize: 12, lang: "py" });
  text(s, "`sys.stdin.read().split()` 是本课**唯一**推荐的大数据量读入方式；`gcd` 是数论题最常见的子过程，第 6 周开始会反复用到。", 0.5, 4.6, 9.0, 0.5, { fontSize: 11, color: C.muted, lsm: 1.1 });
}

// 2.4 templates 2
{
  const s = content("2.4", "2 知识清单 · 常用模板", "写进 cheat sheet（2/3）：素数筛");
  codeBlock(s, `# 4) 素数筛（埃拉托斯特尼筛法）
def sieve(n):
    p = [True] * (n + 1)
    p[0] = p[1] = False
    i = 2
    while i * i <= n:
        if p[i]:
            for j in range(i * i, n + 1, i):
                p[j] = False
        i += 1
    return p`, 0.5, 1.15, 9.0, 2.55, { fontSize: 12, lang: "py" });
  callout(s, "为什么从 i*i 开始标记", "小于 i*i 的 i 的倍数（如 2i、3i、…）已经被更小的质因子标记过了；从 `i*i` 开始能省掉大量重复标记，这是埃氏筛复杂度 O(n log log n) 的关键。", 0.5, 3.85, 9.0, 1.2, { fontSize: 12, fill: C.mint, tcolor: C.dark });
}

// 2.4 templates 3
{
  const s = content("2.4", "2 知识清单 · 常用模板", "写进 cheat sheet（3/3）：排序与前缀和");
  codeBlock(s, `# 5) 按多关键字排序（先按第 2 项升序，再按第 1 项降序）
rows.sort(key=lambda r: (r[1], -r[0]))

# 6) 二维前缀和
pre = [[0] * (n + 1) for _ in range(m + 1)]
for i in range(m):
    for j in range(n):
        pre[i + 1][j + 1] = pre[i][j + 1] + pre[i + 1][j] - pre[i][j] + a[i][j]`, 0.5, 1.1, 9.0, 1.75, { fontSize: 12, lang: "py" });
  callout(s, "排序键为什么这么写", "元组先比 `r[1]`（升序），相等再比 `-r[0]`——第 1 项取负，`sort()` 的默认升序就变成了降序，两个方向一次搞定。只有数值能取负，字符串要降序得另想办法。", 0.5, 3.1, 9.0, 1.1, { fontSize: 12 });
  callout(s, "前缀和的含义", "`pre[i][j]` 是矩阵左上角 (0,0) 到 (i-1,j-1) 的和；查询任意子矩阵和只需 O(1)。第 6 周会展开讲。", 0.5, 4.35, 9.0, 0.85, { fontSize: 11.5, fill: C.mint, tcolor: C.dark });
}

// ============================ PART 3 ============================
sectionSlide("Part 3", "月考样卷", "三次月考与期末上机考试同一规格：6 题 / 112 分钟\n难度梯度 T1 → T6");

// T-028: 2025-10-09 真实 OpenJudge 比赛，六题均已联网核实，题号登记进 VERIFIED_TITLES。
// 3.0 difficulty ladder
{
  const s = content("3.0", "3 月考样卷", "难度梯度：从签到到综合");
  const rows = [
    ["E31295", "★☆☆☆☆", "宿舍的空调 · 公共区间", "真实题", C.ok],
    ["E31294", "★★☆☆☆", "大肥鱼卖白饭 · 找零", "真实题", C.ok],
    ["E31293", "★★☆☆☆", "双十一凑单大作战 · 买三免一", "真实题", C.gold],
    ["M31297", "★★★☆☆", "恒星共振裂变 · 质数拆分", "真实题", C.gold],
    ["M31296", "★★★☆☆", "“淹园”救援 · 救援小艇", "真实题", C.gold],
    ["T31298", "★★★★☆", "警察招募又来了 · 警员招募", "真实题", C.bad],
  ];
  rows.forEach((r, i) => {
    const y = 1.15 + i * 0.58;
    pill(s, r[0], 0.5, y, 0.7, 0.44, C.dark, C.white, 13);
    text(s, r[1], 1.35, y, 1.5, 0.44, { fontSize: 15, color: C.gold, valign: "middle", margin: 0 });
    text(s, r[2], 3.0, y, 4.0, 0.44, { fontSize: 12.5, valign: "middle", margin: 0 });
    pill(s, r[3], 7.2, y + 0.02, 1.75, 0.4, r[4], C.white, 11);
  });
  text(s, "每题均给出 **C++ 与 Python 两份参考代码**。月考的意义就在于：提前把机考的题量与时间压力演练一遍——**6 题 / 112 分钟**。", 0.5, 4.7, 9.0, 0.45, { fontSize: 11.5, color: C.muted, lsm: 1.1 });
}

// T1
{
  const s = content("T1", "3 月考样卷 · T1 E31295 宿舍的空调", "取交集：最大的 l 与最小的 r");
  text(s, "n 位同学，第 i 位能接受闭区间 [lᵢ, rᵢ] 内的任意整数温度（n ≤ 10⁵，|l|,|r| ≤ 10⁹）。空调只能设一个整数温度，求所有人都接受的最低温度；不存在输出 -1。", 0.5, 1.0, 9, 0.9, { fontSize: 12, lsm: 1.15 });
  text(s, "样例 1", 0.5, 1.78, 2, 0.22, { fontSize: 9, bold: true, color: C.green, margin: 0 });
  codeBlock(s, `输入
3
18 25
20 30
16 22
输出
20`, 0.5, 2.0, 4.4, 1.38, { fontSize: 10, lang: "text" });
  text(s, "样例 2", 5.1, 1.78, 2, 0.22, { fontSize: 9, bold: true, color: C.green, margin: 0 });
  codeBlock(s, `输入
2
-5 0
1 6
输出
-1`, 5.1, 2.0, 4.4, 1.38, { fontSize: 10, lang: "text" });
  callout(s, "交集 = [max l, min r]", "所有区间的公共部分就是 [max(lᵢ), min(rᵢ)]。若 max l ≤ min r，最低可行温度就是 max l；否则无解。一遍扫描 O(n)，不用存数组。", 0.5, 3.53, 9.0, 1.32, { fontSize: 12.5 });
  text(s, "题目：cs101.openjudge.cn/practice/31295/", 0.5, 4.95, 9, 0.28, { fontSize: 10, color: C.muted });
}

// T1 code
{
  const s = content("T1", "3 月考样卷 · T1 E31295 宿舍的空调 · 参考代码", "C++ 与 Python 对照");
  text(s, "C++", 0.5, 0.98, 2, 0.25, { fontSize: 11, bold: true, color: C.green, margin: 0 });
  text(s, "Python", 5.1, 0.98, 2, 0.25, { fontSize: 11, bold: true, color: C.green, margin: 0 });
  codeBlock(s, `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n;
    cin >> n;
    long long lo = -1e9, hi = 1e9, l, r;
    while (n--) {
        cin >> l >> r;
        lo = max(lo, l);
        hi = min(hi, r);
    }
    cout << (lo <= hi ? lo : -1) << endl;
}`, 0.5, 1.25, 4.5, 3.75, { fontSize: 10.5, lang: "cpp" });
  codeBlock(s, `n = int(input())
lo, hi = -10**9, 10**9
for _ in range(n):
    l, r = map(int, input().split())
    lo, hi = max(lo, l), min(hi, r)
print(lo if lo <= hi else -1)`, 5.1, 1.25, 4.4, 3.75, { fontSize: 10.5, lang: "py" });
}

// T2
{
  const s = content("T2", "3 月考样卷 · T2 E31294 大肥鱼卖白饭", "贪心找零：20 元优先用 10+5");
  text(s, "每份 5 元，n 位顾客依次付 5 / 10 / 20 元的一张纸币，开始时没有零钱，不能赊账、不能换序。判断能否依次正确找零（n ≤ 10⁵）。", 0.5, 1.0, 9, 0.9, { fontSize: 12, lsm: 1.15 });
  text(s, "样例 1", 0.5, 1.78, 2, 0.22, { fontSize: 9, bold: true, color: C.green, margin: 0 });
  codeBlock(s, `输入
5
5 5 10 5 20
输出
YES`, 0.5, 2.0, 4.4, 1.02, { fontSize: 10, lang: "text" });
  text(s, "样例 2", 5.1, 1.78, 2, 0.22, { fontSize: 9, bold: true, color: C.green, margin: 0 });
  codeBlock(s, `输入
4
5 10 20 5
输出
NO`, 5.1, 2.0, 4.4, 1.02, { fontSize: 10, lang: "text" });
  callout(s, "只需记 5 元、10 元的张数", "付 5 元：不用找；付 10 元：找一张 5；付 20 元：优先找 10+5，没有再找 5+5+5。5 元比 10 元更万能，所以要把 5 元留到最后用。一旦失败，该人及之后的找零都不再成立，答案为 NO。", 0.5, 3.17, 9.0, 1.68, { fontSize: 12.5 });
  text(s, "题目：cs101.openjudge.cn/practice/31294/", 0.5, 4.95, 9, 0.28, { fontSize: 10, color: C.muted });
}

// T2 code
{
  const s = content("T2", "3 月考样卷 · T2 E31294 大肥鱼卖白饭 · 参考代码", "C++ 与 Python 对照");
  text(s, "C++", 0.5, 0.98, 2, 0.25, { fontSize: 11, bold: true, color: C.green, margin: 0 });
  text(s, "Python", 5.1, 0.98, 2, 0.25, { fontSize: 11, bold: true, color: C.green, margin: 0 });
  codeBlock(s, `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n, b, c5 = 0, c10 = 0;
    bool ok = true;
    cin >> n;
    while (n--) {
        cin >> b;
        if (b == 5) c5++;
        else if (b == 10) {
            if (c5 > 0) c5--, c10++;
            else ok = false;
        } else {  // 20：优先找 10+5
            if (c10 > 0 && c5 > 0) c10--, c5--;
            else if (c5 >= 3) c5 -= 3;
            else ok = false;
        }
    }
    cout << (ok ? "YES" : "NO") << endl;
}`, 0.5, 1.25, 4.5, 3.75, { fontSize: 10.5, lang: "cpp" });
  codeBlock(s, `n = int(input())
c5 = c10 = 0
ok = True
for b in map(int, input().split()):
    if b == 5:
        c5 += 1
    elif b == 10:
        if c5 > 0:
            c5 -= 1
            c10 += 1
        else:
            ok = False
    else:  # 20：优先找 10+5
        if c10 > 0 and c5 > 0:
            c10 -= 1
            c5 -= 1
        elif c5 >= 3:
            c5 -= 3
        else:
            ok = False
print("YES" if ok else "NO")`, 5.1, 1.25, 4.4, 3.75, { fontSize: 10.5, lang: "py" });
}

// T3
{
  const s = content("T3", "3 月考样卷 · T3 E31293 双十一凑单大作战", "从大到小排序，免第 3、6、9… 件");
  text(s, "n 件商品价格 pᵢ（n ≤ 10⁵，pᵢ ≤ 10⁹）。可任选恰好 3 件成一组，组内最便宜的免费；每件至多属于一组。求买下全部商品的最少支付金额。", 0.5, 1.0, 9, 0.9, { fontSize: 12, lsm: 1.15 });
  text(s, "样例 1", 0.5, 1.78, 2, 0.22, { fontSize: 9, bold: true, color: C.green, margin: 0 });
  codeBlock(s, `输入
4
3 2 1 10
输出
14`, 0.5, 2.0, 4.4, 1.02, { fontSize: 10, lang: "text" });
  text(s, "样例 2", 5.1, 1.78, 2, 0.22, { fontSize: 9, bold: true, color: C.green, margin: 0 });
  codeBlock(s, `输入
7
6 5 5 5 2 1 1
输出
19`, 5.1, 2.0, 4.4, 1.02, { fontSize: 10, lang: "text" });
  callout(s, "相邻的三件价格最接近，免掉的最多", "从大到小排序后每 3 件一组，免掉每组最小的一件，即第 3、6、9… 件。总价最大 10¹⁴，超过 32 位：C++ 必须用 long long，Python 无需担心。", 0.5, 3.17, 9.0, 1.68, { fontSize: 12.5 });
  text(s, "题目：cs101.openjudge.cn/practice/31293/", 0.5, 4.95, 9, 0.28, { fontSize: 10, color: C.muted });
}

// T3 code
{
  const s = content("T3", "3 月考样卷 · T3 E31293 双十一凑单大作战 · 参考代码", "C++ 与 Python 对照");
  text(s, "C++", 0.5, 0.98, 2, 0.25, { fontSize: 11, bold: true, color: C.green, margin: 0 });
  text(s, "Python", 5.1, 0.98, 2, 0.25, { fontSize: 11, bold: true, color: C.green, margin: 0 });
  codeBlock(s, `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n;
    cin >> n;
    vector<long long> p(n);
    long long sum = 0;
    for (auto &x : p) cin >> x, sum += x;
    sort(p.rbegin(), p.rend());  // 降序
    for (int i = 2; i < n; i += 3)  // 免单
        sum -= p[i];
    cout << sum << endl;
}`, 0.5, 1.25, 4.5, 3.75, { fontSize: 10.5, lang: "cpp" });
  codeBlock(s, `n = int(input())
p = sorted(map(int, input().split()), reverse=True)  # 降序
print(sum(p) - sum(p[2::3]))  # 第 3、6、9… 件免单`, 5.1, 1.25, 4.4, 3.75, { fontSize: 10.5, lang: "py" });
}

// T4
{
  const s = content("T4", "3 月考样卷 · T4 M31297 恒星共振裂变", "先筛后查：从 N/2 向下找第一对质数");
  text(s, "T 组数据（T ≤ 10⁴），每组给偶数 N（4 ≤ N ≤ 10⁶），把 N 拆成两个质数 p₁ + p₂（p₁ ≤ p₂），使乘积最大。", 0.5, 1.0, 9, 0.9, { fontSize: 12, lsm: 1.15 });
  text(s, "样例", 0.5, 1.78, 2, 0.22, { fontSize: 9, bold: true, color: C.green, margin: 0 });
  codeBlock(s, `输入
3
4
10
16
输出
2 2
5 5
5 11`, 0.5, 2.0, 9.0, 1.74, { fontSize: 10, lang: "text" });
  callout(s, "和一定时，两数越接近乘积越大", "预处理 10⁶ 以内的素数筛（每组数据现场试除会 TLE）。对每个 N 从 N/2 开始向下找第一个 p，使 p 和 N−p 都是质数——质数分布密，通常只需试很少几步。", 0.5, 3.89, 9.0, 0.96, { fontSize: 12.5 });
  text(s, "题目：cs101.openjudge.cn/practice/31297/", 0.5, 4.95, 9, 0.28, { fontSize: 10, color: C.muted });
}

// T4 code
{
  const s = content("T4", "3 月考样卷 · T4 M31297 恒星共振裂变 · 参考代码", "C++ 与 Python 对照");
  text(s, "C++", 0.5, 0.98, 2, 0.25, { fontSize: 11, bold: true, color: C.green, margin: 0 });
  text(s, "Python", 5.1, 0.98, 2, 0.25, { fontSize: 11, bold: true, color: C.green, margin: 0 });
  codeBlock(s, `#include <bits/stdc++.h>
using namespace std;
const int N = 1000000;
bool comp[N + 1];  // true 表示合数
int main() {
    comp[0] = comp[1] = true;
    for (int i = 2; i * i <= N; i++)
        if (!comp[i])
            for (int j = i * i; j <= N; j += i)
                comp[j] = true;
    int t, n;
    cin >> t;
    while (t--) {
        cin >> n;
        int p = n / 2;  // 两数越接近乘积越大
        while (comp[p] || comp[n - p]) p--;
        cout << p << " " << n - p << "\\n";
    }
}`, 0.5, 1.25, 4.5, 3.75, { fontSize: 10.5, lang: "cpp" });
  codeBlock(s, `N = 10**6
ok = bytearray([1]) * (N + 1)  # 1 表示质数
ok[0] = ok[1] = 0
for i in range(2, int(N**0.5) + 1):
    if ok[i]:
        ok[i * i::i] = bytes(len(ok[i * i::i]))
for _ in range(int(input())):
    n = int(input())
    p = n // 2  # 两数越接近乘积越大
    while not (ok[p] and ok[n - p]):
        p -= 1
    print(p, n - p)`, 5.1, 1.25, 4.4, 3.75, { fontSize: 10.5, lang: "py" });
}

// T5
{
  const s = content("T5", "3 月考样卷 · T5 M31296 “淹园”救援", "排序 + 双指针：最轻配最重");
  text(s, "n 名学生体重 wᵢ，小艇载重上限 C，每艘最多 2 人且体重和 ≤ C，保证 wᵢ ≤ C（n ≤ 10⁵）。求转移所有学生最少需要的小艇数。", 0.5, 1.0, 9, 0.9, { fontSize: 12, lsm: 1.15 });
  text(s, "样例 1", 0.5, 1.78, 2, 0.22, { fontSize: 9, bold: true, color: C.green, margin: 0 });
  codeBlock(s, `输入
4 5
3 2 2 1
输出
2`, 0.5, 2.0, 4.4, 1.02, { fontSize: 10, lang: "text" });
  text(s, "样例 2", 5.1, 1.78, 2, 0.22, { fontSize: 9, bold: true, color: C.green, margin: 0 });
  codeBlock(s, `输入
5 3
3 2 2 1 1
输出
3`, 5.1, 2.0, 4.4, 1.02, { fontSize: 10, lang: "text" });
  callout(s, "最重的人必占一艘艇", "排序后 l 指最轻、r 指最重。最重的人无论如何要占一艘；若最轻的能和他同乘就一起走（l 前进），否则他单独走。每轮 r 前进、艇数 +1，O(n log n)。", 0.5, 3.17, 9.0, 1.68, { fontSize: 12.5 });
  text(s, "题目：cs101.openjudge.cn/practice/31296/", 0.5, 4.95, 9, 0.28, { fontSize: 10, color: C.muted });
}

// T5 code
{
  const s = content("T5", "3 月考样卷 · T5 M31296 “淹园”救援 · 参考代码", "C++ 与 Python 对照");
  text(s, "C++", 0.5, 0.98, 2, 0.25, { fontSize: 11, bold: true, color: C.green, margin: 0 });
  text(s, "Python", 5.1, 0.98, 2, 0.25, { fontSize: 11, bold: true, color: C.green, margin: 0 });
  codeBlock(s, `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n, c;
    cin >> n >> c;
    vector<int> w(n);
    for (auto &x : w) cin >> x;
    sort(w.begin(), w.end());
    int l = 0, r = n - 1, boats = 0;
    while (l <= r) {
        if (l < r && w[l] + w[r] <= c)
            l++;  // 最轻的搭最重的
        r--;      // 最重的必占一艘
        boats++;
    }
    cout << boats << endl;
}`, 0.5, 1.25, 4.5, 3.75, { fontSize: 10.5, lang: "cpp" });
  codeBlock(s, `n, c = map(int, input().split())
w = sorted(map(int, input().split()))
l, r, boats = 0, n - 1, 0
while l <= r:
    if l < r and w[l] + w[r] <= c:
        l += 1  # 最轻的搭最重的
    r -= 1  # 最重的必占一艘
    boats += 1
print(boats)`, 5.1, 1.25, 4.4, 3.75, { fontSize: 10.5, lang: "py" });
}

// T6
{
  const s = content("T6", "3 月考样卷 · T6 T31298 警察招募又来了", "队列存「过期时刻 + 人数」，按入伍先后派出");
  text(s, "第 1…n 分钟各发生一个事件：aᵢ = x（1 ≤ x ≤ 10）表示招募 x 名警员，aᵢ = -1 表示一起犯罪。警员第 t 分钟入伍，只能处理 [t, t+k−1] 内的犯罪，且至多处理一起；有空闲警员时派最早入伍者。求无法处理的犯罪数。", 0.5, 1.0, 9, 0.9, { fontSize: 12, lsm: 1.15 });
  text(s, "样例 1", 0.5, 1.78, 2, 0.22, { fontSize: 9, bold: true, color: C.green, margin: 0 });
  codeBlock(s, `输入
6 2
1 1 -1 -1 -1 1
输出
2`, 0.5, 2.0, 4.4, 1.02, { fontSize: 10, lang: "text" });
  text(s, "样例 2", 5.1, 1.78, 2, 0.22, { fontSize: 9, bold: true, color: C.green, margin: 0 });
  codeBlock(s, `输入
5 1
5 -1 3 -1 -1
输出
3`, 5.1, 2.0, 4.4, 1.02, { fontSize: 10, lang: "text" });
  callout(s, "批次入队，队首优先、过期弹出", "每批警员记为 (过期时刻 = t+k−1, 人数) 入队。遇到犯罪时先把队首已过期的批次弹出；队列空则 +1 计数，否则队首人数 −1，减到 0 就弹出。每批最多入队、出队各一次，O(n)。", 0.5, 3.17, 9.0, 1.68, { fontSize: 12.5 });
  text(s, "题目：cs101.openjudge.cn/practice/31298/", 0.5, 4.95, 9, 0.28, { fontSize: 10, color: C.muted });
}

// T6 code
{
  const s = content("T6", "3 月考样卷 · T6 T31298 警察招募又来了 · 参考代码", "C++ 与 Python 对照");
  text(s, "C++", 0.5, 0.98, 2, 0.25, { fontSize: 11, bold: true, color: C.green, margin: 0 });
  text(s, "Python", 5.1, 0.98, 2, 0.25, { fontSize: 11, bold: true, color: C.green, margin: 0 });
  codeBlock(s, `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n, k, a, bad = 0;
    cin >> n >> k;
    queue<pair<int, int>> q;  // 过期时刻,人数
    for (int i = 1; i <= n; i++) {
        cin >> a;
        if (a > 0) {
            q.push({i + k - 1, a});
            continue;
        }
        while (!q.empty() &&
               q.front().first < i)
            q.pop();
        if (q.empty()) bad++;
        else if (--q.front().second == 0)
            q.pop();
    }
    cout << bad << endl;
}`, 0.5, 1.25, 4.5, 3.75, { fontSize: 10.5, lang: "cpp" });
  codeBlock(s, `from collections import deque

n, k = map(int, input().split())
q = deque()  # [过期时刻, 人数]
bad = 0
for i, a in enumerate(
        map(int, input().split()), 1):
    if a > 0:
        q.append([i + k - 1, a])
        continue
    while q and q[0][0] < i:
        q.popleft()
    if not q:
        bad += 1
    else:
        q[0][1] -= 1
        if q[0][1] == 0:
            q.popleft()
print(bad)`, 5.1, 1.25, 4.4, 3.75, { fontSize: 10.5, lang: "py" });
}


// ============================ PART 4 ============================
sectionSlide("Part 4", "备选题库与考后订正", "可替换样卷任意一题\n三分类 · 重写规则 · 错题类型表");

// 4 alternative problems
{
  const s = content("4", "4 备选题库", "可替换样卷中的任意一题");
  table(s, [
    ["考点", "题目", "编号"],
    ["输入输出 / 分支", "鸡兔同笼", { t: "E02750", mono: true }],
    ["分支 / 读题", "判断闰年", { t: "02733", mono: true }],
    ["循环 / 取模", "与 7 无关的数", { t: "02701", mono: true }],
    ["字符串", "大小写字母互换", { t: "E02689", mono: true }],
    ["字符串 / 模拟", "文字排版", { t: "E06374", mono: true }],
    ["字典 / 排序", "生日相同", { t: "E02724", mono: true }],
    ["素数", "验证「歌德巴赫猜想」", { t: "E03143", mono: true }],
    ["数学 / 枚举", "完美立方", { t: "M02810", mono: true }],
    ["模拟", "2050 年成绩计算", { t: "E18176", mono: true }],
    ["进制", "十进制到八进制", { t: "E02734", mono: true }],
  ], 0.5, 1.1, 9.0, [2.6, 4.3, 2.1], { fontSize: 11, rowH: 0.365, tight: true });
}

// 5.1 three categories
{
  const s = content("5.1", "5 考后订正 · 唯一有效的方法", "三分类");
  text(s, "考完试，按下面的流程走一遍。**只看题解不重写，等于没订正。**", 0.5, 1.05, 9, 0.35, { fontSize: 13 });
  table(s, [
    ["类别", "表现", "处理"],
    [{ t: "不会", bold: true, color: C.bad }, "看完题解才懂思路", "重做同类题 3 道"],
    [{ t: "会但写错", bold: true, color: C.gold }, "思路对，代码有 bug", "找出 bug 的**类型**，写进 cheat sheet"],
    [{ t: "会但没时间", bold: true, color: C.green }, "剩 10 分钟才开始", "练打字 + 练模板默写"],
  ], 0.5, 1.5, 9.0, [1.7, 2.8, 4.5], { fontSize: 12.5, rowH: 0.65 });
  callout(s, "5.2 重写规则", "**关掉题解，从空文件重写，一次通过。**做不到就再来一遍。", 0.5, 3.95, 9.0, 0.85, { fontSize: 13, fill: C.mint, tcolor: C.dark });
}

// 5.3 error type table
{
  const s = content("5.3", "5 考后订正 · 建立错题类型表", "记类型，不记题目");
  text(s, "不要记「第 3 题错了」，要记「**我在多关键字排序时容易只写一个 key**」。类型是可迁移的，具体题目不是。", 0.5, 1.05, 9, 0.5, { fontSize: 12.5, lsm: 1.15 });
  table(s, [
    ["我的高频错误", "触发场景", "对策"],
    ["忘 `strip()`", "字符串比较", "读入统一 `.strip()`"],
    ["二维数组别名", "建网格", "一律 `[[0]*n for _ in range(m)]`"],
    ["用 `in` 查 list", "判存在", "建 `set`"],
    ["浮点比较", "开方 / 除法", "转整数或 `isclose`"],
    ["边界 n=1", "循环 / 切片", "提交前手测 n=1"],
  ], 0.5, 1.75, 9.0, [2.7, 2.5, 3.8], { fontSize: 12, rowH: 0.48 });
}

// 6 exam strategy timeline
{
  const s = content("6", "6 考场策略", "112 分钟 / 6 题的时间预算");
  const seg = [["0–5", "通读", 0.4], ["5–15", "T1", 0.8], ["15–40", "T2·T3", 2.0], ["40–70", "T4", 2.4], ["70–102", "T5·T6", 2.6], ["102–112", "检查", 0.8]];
  let x = 0.5;
  const colors = [C.muted, C.ok, C.green, C.gold, C.bad, C.dark];
  seg.forEach((sgm, i) => {
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.3, w: sgm[2], h: 0.65, fill: { color: colors[i] }, line: { color: C.white, width: 1 } });
    text(s, sgm[1], x, 1.32, sgm[2], 0.3, { fontSize: 11, bold: true, color: C.white, align: "center", margin: 0 });
    text(s, sgm[0] + " min", x, 1.62, sgm[2], 0.28, { fontSize: 9, color: C.white, align: "center", margin: 0 });
    x += sgm[2];
  });
  bullets(s, [
    "**前 5 分钟通读全部题目**，按预估难度排序，先做有把握的。",
    "**看数据范围定复杂度**，再动手（第 4 周 3.4 节）。",
    "**样例过了先交**——OJ 反馈比自己盯屏幕快。",
    "**WA 就造数据**：n=1、全相同、最大值、最小值。",
    "**卡满 15 分钟换题**，回头再看；**留 10 分钟**检查输出格式：多余空格、换行、精度。",
  ], 0.5, 2.3, 9.0, 2.6, { fontSize: 12.5, gap: 8 });
}

// 7 homework
{
  const s = content("7", "本周作业", "");
  table(s, [
    ["#", "任务", "说明"],
    ["1", "完成月考", "机房，112 分钟，6 题"],
    ["2", "订正全部未 AC 题", "按第 5 节的三分类 + 重写"],
    ["3", "提交一份错题类型表", "至少 5 条，格式见 5.3"],
    ["4", "更新自己的 cheat sheet", "十页 A4，双面，手写或打印"],
    ["5", "完美立方", { t: "M02810", mono: true }],
    ["6", "细菌繁殖", { t: "02712", mono: true }],
    ["7", "文字排版", { t: "E06374", mono: true }],
  ], 0.5, 1.1, 9.0, [0.6, 3.2, 5.2], { fontSize: 13, rowH: 0.48 });
}

summarySlide("本周小结", [
  ["体检", "月考是体检：暴露**语法关、速度关、调试关**三处短板。"],
  ["自检清单", "打不了勾的地方，就是本周的复习重点。"],
  ["难度梯度", "取交集 → 找零模拟 → 排序贪心 → 筛法 → 双指针 → 队列模拟，规格与期末机考一致：**6 题 / 112 分钟**。"],
  ["订正方法", "唯一有效的方法：**分类 → 关题解重写 → 记录错误类型**。"],
  ["考场六条", "通读、看范围、早提交、造数据、按时换题、查格式。"],
]);

// Next week
{
  const s = sectionSlide("下周预告", "矩阵、排序与贪心", "进入 10 月的「上强度」阶段，第一次系统地\n认识时间复杂度在实战中的作用");
}

  await D.save(OUT);
})().catch((e) => { console.error(e); process.exit(1); });

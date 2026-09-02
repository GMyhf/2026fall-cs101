# -*- coding: utf-8 -*-
"""第5周 10 月月考与阶段复习"""

META = {
    'title': '第5周　10 月月考与阶段复习',
    'subtitle': '知识清单自检 · 月考样卷 6 题 · 考后订正方法 · 考场策略',
    'footer': '计算概论（B） · 第5周 · 闫宏飞 · 2026 Fall',
    'info': ['北京大学　《计算概论（B）》',
             '主题与学习重点：10 月月考与阶段复习。'],
}

SLIDES = [
    ('key', '月考不是筛人，是体检',
     '在 11 月的核心内容开始之前，把语法关、速度关、调试关三处短板暴露出来。'),

    ('table', '考试形式', [
        ['项目', '说明'],
        ['地点 / 时长', '机房（安排以通知为准）；112 分钟'],
        ['题量 / 平台', '6 题；OpenJudge（cs101 小组）'],
        ['语言', 'Python 3 为主，允许 C++'],
        ['允许携带', '一页 A4 手写 cheat sheet'],
        ['禁止', '⚠️ 任何 AI 工具（含本地模型、IDE 补全插件）、联网查询、任何交流'],
        ['学术诚信', '⚠️ 无法解释自己提交的代码，按学术不端处理'],
    ]),

    ('section', '第 1 节', '第 1–4 周知识清单（自检用）'),

    ('bullets', '语法与容器', [
        '☐ 三种输入形态：`int(input())` / `map(int, input().split())` / `list(map(...))`',
        '☐ 不定行输入：`for line in sys.stdin` 与 `try/except EOFError`',
        '☐ 输出格式：`print(*a)`、`f"{x:.2f}"`、`sep=` / `end=`',
        '☐ 字符串：`strip` `split` `join` `replace` `find` `[::-1]` `swapcase`',
        '☐ 列表：`append` `pop` `sort` `sorted(key=)` 切片 列表推导式',
        '☐ 二维列表正确建法 `[[0]*n for _ in range(m)]`',
        '☐ `dict` / `set` / `Counter` / `defaultdict`；`enumerate` / `zip`',
    ]),

    ('bullets', '计算机基础与复杂度', [
        '☐ 进制转换：`bin/oct/hex`、`int(s, base)`、除基取余',
        '☐ 补码：负数 = 取反加一；n 位范围 -2^(n-1) ~ 2^(n-1)-1',
        '☐ 位运算：`&` `|` `^` `<<` `>>`；`n & (n-1)`、`n & 1`',
        "☐ ASCII：`'0'=48` `'A'=65` `'a'=97`，`ord` / `chr`",
        '☐ 浮点：不能用 `==` 比较；`int(x**0.5)` 要校正',
        '☐ 能说出 list / set / dict 各操作的复杂度',
        '☐ 能从 n 的范围倒推可用的复杂度；会写埃氏筛',
    ]),

    ('code', '应写进 cheat sheet 的六个模板', '''import sys                              # 1) 快速输入
data = sys.stdin.read().split()

for line in sys.stdin:                    # 2) 多组数据直到 EOF
    line = line.strip()

def gcd(a, b):                            # 3) 最大公约数
    while b:
        a, b = b, a % b
    return a

def sieve(n):                             # 4) 素数筛
    p = [True] * (n + 1); p[0] = p[1] = False
    i = 2
    while i * i <= n:
        if p[i]:
            for j in range(i * i, n + 1, i):
                p[j] = False
        i += 1
    return p

rows.sort(key=lambda r: (r[1], -r[0]))    # 5) 多关键字排序

pre = [[0] * (n + 1) for _ in range(m + 1)]   # 6) 二维前缀和
for i in range(m):
    for j in range(n):
        pre[i+1][j+1] = pre[i][j+1] + pre[i+1][j] - pre[i][j] + a[i][j]
''', ''),

    ('section', '第 2 节', '月考样卷（6 题 / 100 分）'),

    ('key', '与期末机考同一规格',
     '三次月考与期末上机考试都是 6 题 / 112 分钟。'
     '月考不是缩水版，是同构演练。'),

    # 这张表不能靠 ascii 补空格排版：中文字宽是 1 em，Consolas 约 0.55 em，
    # 两倍空格永远补不出一个汉字宽，列位置必然随各行中文字数左右漂移。
    # T-016 在 PowerPoint 16.112.3 下实测：6 行的 `--` 完全不在同一列。
    # 表格由 PowerPoint 按单元格排版，不依赖任何字宽模型。
    ('table', '难度梯度', [
        ['题号', '难度', '预期 AC', '考点'],
        ['T1', '★☆☆☆☆', '95%', '签到：读入与格式化输出'],
        ['T2', '★★☆☆☆', '75%', '字符串处理'],
        ['T3', '★★★☆☆', '55%', '字典 / 排序 + 多关键字'],
        ['T4', '★★★☆☆', '45%', '复杂度意识：必须用筛或前缀和'],
        ['T5', '★★★★☆', '25%', '综合模拟，边界多'],
        ['T6', '★★★★☆', '20%', '补码 / 位运算，符号边界密集'],
    ], 'T1 是全班都应该拿到的签到题；预期 AC 率是命题经验估计，需按实际结果逐年校准'),

    ('bullets', 'T1 成绩转换', [
        '**考点**：输入输出、分支、格式化（W1、W2）　**难度**：★☆☆☆☆',
        '读入 n 个百分制成绩，输出等级 A/B/C/D/E；最后输出通过率，保留两位小数',
        '**常见失分**：用 `round()` 导致 `80.0`；边界 90/80/70/60 用了 `>` 而非 `>=`',
    ]),

    ('code', 'T1 参考解答', '''n = int(input())
scores = list(map(int, input().split()))
grade = lambda s: ('A' if s >= 90 else 'B' if s >= 80 else
                   'C' if s >= 70 else 'D' if s >= 60 else 'E')
print('\\n'.join(grade(s) for s in scores))
print(f"{sum(1 for s in scores if s >= 60) * 100 / n:.2f}")
''', '格式必须是 80.00，不能是 80.0'),

    ('code', 'T2 单词首字母大写', '''import sys

s = sys.stdin.readline().rstrip('\\n')
out = []
start_of_word = True
for ch in s:
    if ch.isalpha():
        out.append(ch.upper() if start_of_word else ch.lower())
        start_of_word = False
    else:
        out.append(ch)
        start_of_word = True
print(''.join(out))
''', "⚠️ 不能直接用 s.title()：它会把 don't 变成 Don'T。内建函数的边界行为要自己验证"),

    ('code', 'T3 图书借阅排行', '''import sys
from collections import Counter

data = sys.stdin.read().split()
n, k = int(data[0]), int(data[1])
cnt = Counter(data[2:2 + n])
rank = sorted(cnt.items(), key=lambda kv: (-kv[1], kv[0]))
print('\\n'.join(f"{name} {c}" for name, c in rank[:k]))
''', '卡 O(n^2)：n=2x10^5 只用 500 个不同书名，用 list.count() 逐个统计必 TLE'),

    ('code', 'T4 区间内的 T-数', '''import sys

LIMIT = 10 ** 6                       # sqrt(10^12)

def sieve(n):
    p = bytearray([1]) * (n + 1)
    p[0] = p[1] = 0
    i = 2
    while i * i <= n:
        if p[i]:
            p[i * i::i] = bytearray(len(p[i * i::i]))
        i += 1
    return p

is_prime = sieve(LIMIT)
data = sys.stdin.read().split()
out = []
for s in data[1:1 + int(data[0])]:
    x = int(s)
    r = int(x ** 0.5)
    while r * r > x:
        r -= 1
    while (r + 1) * (r + 1) <= x:
        r += 1
    out.append("YES" if r * r == x and is_prime[r] else "NO")
sys.stdout.write('\\n'.join(out) + '\\n')
''', '恰好 3 个约数 <=> 素数的平方（约数个数 = (a1+1)(a2+1)... = 3 只能是 p^2）'),

    ('code', 'T5 电梯调度模拟', '''import sys

data = sys.stdin.read().split()
idx = 0
n, _m = int(data[idx]), int(data[idx + 1]); idx += 2
now, pos, ans = 0, 1, 0
for _ in range(n):
    t, f, g = int(data[idx]), int(data[idx+1]), int(data[idx+2]); idx += 3
    now += abs(pos - f)          # 移动到接人层
    now = max(now, t)            # 人还没到就等
    now += 2                     # 开关门接人
    now += abs(f - g)            # 送到目标层
    ans = now                    # 送达时刻（不含最后开关门）
    now += 2                     # 开关门放人
    pos = g
print(ans)
''', '⚠️ "送达时刻"是否含最后一次开关门，命题时必须写死，否则会有大批"逻辑对但差 2"的 WA'),

    ('code', 'T6 补码计算器', '''import sys

data = sys.stdin.read().split()
q = int(data[0])
idx, out = 1, []
for _ in range(q):
    op = data[idx]; idx += 1
    if op == 'TO':                               # 十进制 -> n 位补码
        n, x = int(data[idx]), int(data[idx + 1]); idx += 2
        lo, hi = -(1 << (n - 1)), (1 << (n - 1)) - 1
        out.append('OVERFLOW' if not lo <= x <= hi
                   else format(x & ((1 << n) - 1), f'0{n}b'))
    elif op == 'FROM':                           # n 位补码 -> 十进制
        n, b = int(data[idx]), data[idx + 1]; idx += 2
        v = int(b, 2)
        out.append(str(v - (1 << n) if v >> (n - 1) else v))
    else:                                        # ADD：n 位回绕 + 溢出判定
        n = int(data[idx])
        a, b = int(data[idx + 1]), int(data[idx + 2]); idx += 3
        r = (a + b) & ((1 << n) - 1)
        if r >> (n - 1):
            r -= 1 << n
        out.append(str(r) if r == a + b else f'{r} OVERFLOW')
sys.stdout.write('\\n'.join(out) + '\\n')
''', '溢出判据 r != a+b 比背"正加正得负"更不易写错'),

    ('bullets', 'T6 的三个考点与最常见的错法', [
        '**负数不能用 `bin(x)`**：得到的是 `-0b101`，不是补码；要用 `x & ((1<<n)-1)`',
        '**`FROM` 忘了减 2^n**：符号位为 1 时必须减掉，否则负数全变成大正数',
        '⚠️ **无符号进位 ≠ 有符号溢出**：`ADD 8 -1 1` 有进位，但结果 0 完全正确',
        '**评分**：两个方向的转换 8 分 + n 位回绕 6 分 + 溢出判定 6 分',
    ]),

    ('section', '第 3 节', '考后订正：唯一有效的方法'),

    ('table', '把每道没 AC 的题分三类', [
        ['类别', '表现', '处理'],
        ['不会', '看完题解才懂思路', '重做同类题 3 道'],
        ['会但写错', '思路对，代码有 bug', '找出 bug 的类型，写进 cheat sheet'],
        ['会但没时间', '剩 10 分钟才开始', '练打字 + 练模板默写'],
    ]),

    ('key', '重写规则',
     '关掉题解，从空文件重写，一次通过。做不到就再来一遍。'),

    ('table', '建立自己的错题类型表（示例）', [
        ['我的高频错误', '触发场景', '对策'],
        ['忘 strip()', '字符串比较', '读入统一 .strip()'],
        ['二维数组别名', '建网格', '一律 [[0]*n for _ in range(m)]'],
        ['用 in 查 list', '判存在', '建 set'],
        ['浮点比较', '开方 / 除法', '转整数或 isclose'],
        ['边界 n=1', '循环 / 切片', '提交前手测 n=1'],
    ], '不要记"第 3 题错了"，要记"我在多关键字排序时容易只写一个 key"'),

    ('ascii', '112 分钟 / 6 题的时间预算', r"""
   0-5 min      通读 6 题，按预估难度排序，先做有把握的
   5-15 min     T1（签到）—— 写完就交，用 OJ 反馈代替自己检查
   15-40 min    T2、T3
   40-70 min    T4
   70-102 min   T5、T6 —— 做不完就保一题，别两头都断
   102-112 min  检查输出格式：多余空格、换行、精度
"""),

    ('bullets', '考场策略六条', [
        '**前 5 分钟通读全部题目**，按预估难度排序，先做有把握的',
        '**看数据范围定复杂度**，再动手',
        '**样例过了先交** —— OJ 反馈比自己盯屏幕快',
        '**WA 就造数据**：n=1、全相同、最大值、最小值',
        '**卡满 15 分钟换题**，回头再看',
        '**留 10 分钟**检查输出格式：多余空格、换行、精度',
    ]),

    ('table', '备选题库（可替换样卷任一题）', [
        ['考点', '题目', '编号'],
        ['输入输出 / 分支', '鸡兔同笼', 'E02750'],
        ['字符串', '大小写字母互换 / 文字排版', 'E02689 / E06374'],
        ['字符串解析', '多项式时间复杂度', 'E23563'],
        ['字典 / 排序', '生日相同 / 词典', 'E02724 / E02804'],
        ['素数 / 数学', '验证"歌德巴赫猜想" / 数论', 'E03143 / E23564'],
        ['数学 / 枚举', '完美立方', 'M02810'],
        ['模拟', '2050 年成绩计算 / 细菌繁殖', 'E18176 / 02712'],
    ]),

    ('table', '本周作业', [
        ['#', '任务', '说明'],
        ['1', '完成月考', '机房，112 分钟，6 题'],
        ['2', '订正全部未 AC 题', '三分类 + 关题解重写'],
        ['3', '提交一份错题类型表', '至少 5 条'],
        ['4', '更新 cheat sheet', '一页 A4，双面，手写'],
        ['5–7', '完美立方 / 细菌繁殖 / 文字排版', 'M02810 / 02712 / E06374'],
    ]),

    ('bullets', '小结', [
        '月考是**体检**：暴露语法关、速度关、调试关三处短板',
        '自检清单打不了勾的地方，就是本周的复习重点',
        '样卷梯度：**签到 → 字符串 → 字典排序 → 复杂度意识 → 综合模拟 → 补码位运算**',
        '规格与期末机考一致：**6 题 / 112 分钟 / 100 分**',
        '订正的唯一有效方法：**分类 → 关题解重写 → 记录错误类型**',
        '考场六条：通读、看范围、早提交、造数据、按时换题、查格式',
    ]),

    ('key', '下周预告',
     '进入 10 月"上强度"阶段：矩阵、排序与贪心，认识时间复杂度在实战中的作用。'),
]

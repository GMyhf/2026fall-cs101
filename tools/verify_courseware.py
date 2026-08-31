#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""verify_courseware.py —— 《计算概论（B）》讲义与课件的一致性闸门。

用法:
    python3 tools/verify_courseware.py            # 第 1–7 项，约 10 秒
    python3 tools/verify_courseware.py --render   # 加第 8 项渲染检查（需 libreoffice + pdftotext）

检查项:
    1  配对        每周恰好一份 .md + 同名 .pptx + content/wNN.py，W01–W16 无缺漏
    2  元数据      讲义有一级标题、Updated 时间戳、Compiled by、仓库 URL
    3  课程安排    讲义与课件声明的「主题与学习重点」与课程指南表格逐字一致
    4  链接        所有本地 .md / .pptx / .py 相对链接可达
    5  语法        讲义里所有 ```python 代码块 + courseware/*.py 能被 ast.parse
    6  可重生成    课件能从 content/ 重新生成；页数与 README 一致，
                   且重建产物与已提交的 .pptx **逐段文本相同**（防止源改了没重建）
    7  题号题名    讲义引用的 OJ 题号↔题名与仓库内既有语料一致（离线）
    8  渲染        逐页检查文字未越出版心 + 中文字体已嵌入（--render）

只用标准库 + python-pptx（第 6 项）。退出码 0 表示全绿。
"""

import argparse
import ast
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
COURSEWARE = ROOT / 'courseware'
CONTENT = COURSEWARE / 'content'
GUIDE = ROOT / 'Introduction_to_Computing_B_Course_Guide.md'

WEEKS = [f'{i:02d}' for i in range(1, 17)]

# 第 15、16 周共用课程安排表里的「第 15-16 周」一行
GUIDE_ROW_FOR_WEEK = {w: w for w in WEEKS}
GUIDE_ROW_FOR_WEEK['15'] = '15-16'
GUIDE_ROW_FOR_WEEK['16'] = '15-16'

# 有意偏离既有题名语料的引用：题号 -> {讲义里的写法: 理由}
# 形状是「题号 + 具体别名 + 理由」，不做整号豁免 —— 整号豁免会让该号的任何错叫法蒙混过关。
TITLE_WHITELIST = {
    # 例：'02734': {'十进制转八进制': '平台标题的另一种常见写法'},
}

# ---------------------------------------------------------------------------
# 已联网核实过的平台题名：题号 -> (权威题名, 出处)
#
# ⚠️ 这张表的存在理由，是本项目踩过的一个坑：
#     **语料本身会过时。** 第 7 项拿 `2025fall-cs101/` 当语料，
#     而 2025 年的材料里把 12559 写成「最大最小整数 v0.3」——
#     平台上的实际题名是「最大最小整数」。语料错了，闸门就会**祝福错误答案**，
#     再怎么收紧匹配规则也没用（变异自检实测：改回 v0.3 时收紧后的规则依然全绿）。
#
# 所以：**凡在此表登记的题号，以本表为准，语料被忽略。**
# 表里的每一条都必须来自真正的联网核实，并注明出处（任务号 / 提交号）。
VERIFIED_TITLES = {
    '12559': ('最大最小整数',
              'T-008 联网核实（Codex，b2e6e3e）：平台标题无 "v0.3" 后缀，'
              '2025 语料的写法已过时'),
}

failures = []
notes = []


def fail(check, msg):
    failures.append(f'[{check}] {msg}')


def note(msg):
    notes.append(msg)


def read(path):
    return path.read_text(encoding='utf-8')


# ---------------------------------------------------------------- 公共解析
def week_files():
    """返回 {周次: (md 路径, pptx 路径, content 路径)}；缺失的用 None。"""
    # build_all 在导入时会 import deck（需要 python-pptx）；这里只读常量，直接解析源码
    src = read(COURSEWARE / 'build_all.py')
    tree = ast.parse(src)
    mapping = None
    for node in ast.walk(tree):
        if isinstance(node, ast.Assign):
            for t in node.targets:
                if isinstance(t, ast.Name) and t.id == 'WEEKS':
                    mapping = ast.literal_eval(node.value)
    if mapping is None:
        fail('1 配对', 'build_all.py 里找不到 WEEKS 映射')
        return {}
    out = {}
    for wk in WEEKS:
        stem = mapping.get(wk)
        if stem is None:
            fail('1 配对', f'build_all.WEEKS 缺少第 {wk} 周')
            out[wk] = (None, None, None)
            continue
        md = COURSEWARE / f'{stem}.md'
        pptx = COURSEWARE / f'{stem}.pptx'
        py = CONTENT / f'w{wk}.py'
        out[wk] = (md if md.exists() else None,
                   pptx if pptx.exists() else None,
                   py if py.exists() else None)
    return out


def guide_rows():
    """解析课程指南的「课程安排」表：{'01': '主题与学习重点原文', ...}"""
    if not GUIDE.exists():
        fail('3 课程安排', f'找不到课程指南 {GUIDE.name}')
        return {}
    rows = {}
    for line in read(GUIDE).splitlines():
        m = re.match(r'^\|\s*第\s*([0-9]+(?:\s*-\s*[0-9]+)?)\s*周\s*\|(.*?)\|\s*$', line)
        if not m:
            continue
        key = m.group(1).replace(' ', '')
        topic = m.group(2).strip()
        if '-' in key:
            lo, hi = key.split('-')
            rows[f'{int(lo)}-{int(hi)}'] = topic
        else:
            rows[f'{int(key):02d}'] = topic
    return rows


PY_BLOCK = re.compile(r'```python\n(.*?)```', re.S)
CODE_ANY = re.compile(r'```.*?```', re.S)
INLINE_CODE = re.compile(r'`[^`\n]*`')


# ---------------------------------------------------------------- 检查 1
def check_pairing(files):
    for wk in WEEKS:
        md, pptx, py = files.get(wk, (None, None, None))
        if md is None:
            fail('1 配对', f'第 {wk} 周缺少讲义 .md')
        if pptx is None:
            fail('1 配对', f'第 {wk} 周缺少课件 .pptx')
        if py is None:
            fail('1 配对', f'第 {wk} 周缺少内容模块 content/w{wk}.py')
    # 反向：courseware 下不应有孤儿 md / pptx
    known_md = {f.name for f, _, _ in files.values() if f}
    known_pptx = {f.name for _, f, _ in files.values() if f}
    for f in COURSEWARE.glob('*.md'):
        if f.name != 'README.md' and f.name not in known_md:
            fail('1 配对', f'孤儿讲义（不在 build_all.WEEKS 中）：{f.name}')
    for f in COURSEWARE.glob('*.pptx'):
        if f.name not in known_pptx:
            fail('1 配对', f'孤儿课件：{f.name}')
    for f in CONTENT.glob('w*.py'):
        if f.stem[1:] not in WEEKS:
            fail('1 配对', f'孤儿内容模块：{f.name}')


# ---------------------------------------------------------------- 检查 2
def check_metadata(files):
    for wk in WEEKS:
        md = files.get(wk, (None,))[0]
        if md is None:
            continue
        text = read(md)
        head = '\n'.join(text.splitlines()[:8])
        if not re.match(r'^#\s+第\s*\d+\s*周\s', text):
            fail('2 元数据', f'{md.name}: 首行不是「# 第N周 ...」形式的一级标题')
        if not re.search(r'\*Updated\s+\d{4}-\d{2}-\d{2}[^*]*GMT\+8\*', head):
            fail('2 元数据', f'{md.name}: 缺少 *Updated YYYY-MM-DD GMT+8* 时间戳')
        if '*Compiled by' not in head:
            fail('2 元数据', f'{md.name}: 缺少 *Compiled by ...*')
        if 'github.com/GMyhf/2026fall-cs101' not in head:
            fail('2 元数据', f'{md.name}: 头部缺少仓库 URL')


# ---------------------------------------------------------------- 检查 3
def content_meta(py_path):
    """从 content/wNN.py 中静态取出 META 字典。"""
    tree = ast.parse(read(py_path))
    for node in tree.body:
        if isinstance(node, ast.Assign):
            for t in node.targets:
                if isinstance(t, ast.Name) and t.id == 'META':
                    return ast.literal_eval(node.value)
    return None


def check_syllabus(files):
    rows = guide_rows()
    if not rows:
        return
    for wk in WEEKS:
        key = GUIDE_ROW_FOR_WEEK[wk]
        if key not in rows:
            fail('3 课程安排', f'课程指南表格里找不到第 {key} 周这一行')
            continue
        expected = rows[key]

        md, _, py = files.get(wk, (None, None, None))
        if md is not None:
            text = read(md)
            m = re.search(r'^>\s*\*\*主题与学习重点\*\*：(.*)$', text, re.M)
            if not m:
                fail('3 课程安排', f'{md.name}: 缺少 > **主题与学习重点**： 一行')
            elif m.group(1).strip() != expected:
                fail('3 课程安排',
                     f'{md.name}: 主题与学习重点与课程指南不一致\n'
                     f'        讲义: {m.group(1).strip()}\n'
                     f'        指南: {expected}')
        if py is not None:
            meta = content_meta(py)
            if meta is None:
                fail('3 课程安排', f'{py.name}: 找不到 META')
                continue
            info = meta.get('info') or []
            decl = [s for s in info if s.startswith('主题与学习重点：')]
            if not decl:
                fail('3 课程安排', f'{py.name}: META["info"] 缺少「主题与学习重点：」一项')
            elif decl[0][len('主题与学习重点：'):].strip() != expected:
                fail('3 课程安排',
                     f'{py.name}: 课件 META 与课程指南不一致\n'
                     f'        课件: {decl[0][len("主题与学习重点："):].strip()}\n'
                     f'        指南: {expected}')


# ---------------------------------------------------------------- 检查 4
LINK = re.compile(r'\[[^\]]*\]\(([^)\s]+)\)')


def check_links(files):
    for wk in WEEKS:
        md = files.get(wk, (None,))[0]
        if md is None:
            continue
        text = CODE_ANY.sub('', read(md))          # 代码块里的括号不是链接
        for target in LINK.findall(text):
            if target.startswith(('http://', 'https://', 'mailto:', '#')):
                continue
            target = target.split('#')[0]
            if not target:
                continue
            if not target.endswith(('.md', '.pptx', '.py')):
                continue
            resolved = (md.parent / target).resolve()
            if not resolved.exists():
                fail('4 链接', f'{md.name}: 死链 {target}')
    for f in [COURSEWARE / 'README.md', ROOT / 'README.md']:
        if not f.exists():
            continue
        text = CODE_ANY.sub('', read(f))
        for target in LINK.findall(text):
            if target.startswith(('http://', 'https://', 'mailto:', '#')):
                continue
            target = target.split('#')[0]
            if not target or not target.endswith(('.md', '.pptx', '.py')):
                continue
            if not (f.parent / target).resolve().exists():
                fail('4 链接', f'{f.name}: 死链 {target}')


# ---------------------------------------------------------------- 检查 5
def check_syntax(files):
    total = 0
    for wk in WEEKS:
        md = files.get(wk, (None,))[0]
        if md is None:
            continue
        for i, block in enumerate(PY_BLOCK.findall(read(md)), start=1):
            total += 1
            try:
                ast.parse(block)
            except SyntaxError as e:
                fail('5 语法', f'{md.name}: 第 {i} 个 python 代码块语法错误：{e}')
    for py in sorted(list(COURSEWARE.glob('*.py')) + list(CONTENT.glob('*.py'))):
        try:
            ast.parse(read(py))
        except SyntaxError as e:
            fail('5 语法', f'{py.relative_to(ROOT)}: 语法错误：{e}')
    note(f'共校验 {total} 个讲义 python 代码块')


# ---------------------------------------------------------------- 检查 6
README_ROW = re.compile(
    r'^\|\s*(\d+)\s*\|\s*`([^`]+)`\s*\|\s*(\d+)\s*\|', re.M)


def pptx_texts(path):
    """抽出 .pptx 里全部可见文字（含表格单元格），用于比对两份课件是否同一内容。

    不比对 XML 或字节：zip 时间戳、元素顺序每次生成都会变，只有可见文本是稳定的。
    """
    from pptx import Presentation
    out = []
    for slide in Presentation(str(path)).slides:
        for shape in slide.shapes:
            if shape.has_text_frame:
                out.append(shape.text_frame.text)
            if getattr(shape, 'has_table', False) and shape.has_table:
                for row in shape.table.rows:
                    for cell in row.cells:
                        out.append(cell.text)
    return out


def check_regenerate(files):
    try:
        from pptx import Presentation  # noqa: F401
    except ImportError:
        note('⚠️ 未安装 python-pptx，**跳过**第 6 项（可重生成）—— '
             '课件与 content/ 的一致性本次未验')
        return
    sys.path.insert(0, str(COURSEWARE))
    sys.path.insert(0, str(CONTENT))
    import importlib
    import deck

    declared = {}
    readme = COURSEWARE / 'README.md'
    if readme.exists():
        for wk, stem, pages in README_ROW.findall(read(readme)):
            declared[f'{int(wk):02d}'] = (stem, int(pages))
    else:
        fail('6 可重生成', 'courseware/README.md 不存在')

    with tempfile.TemporaryDirectory() as tmp:
        for wk in WEEKS:
            py = files.get(wk, (None, None, None))[2]
            if py is None:
                continue
            mod = importlib.import_module(f'w{wk}')
            importlib.reload(mod)
            out = Path(tmp) / f'w{wk}.pptx'
            pages = deck.build(mod.META, mod.SLIDES, str(out))
            if wk not in declared:
                fail('6 可重生成', f'README 文件清单里没有第 {wk} 周')
                continue
            stem, want = declared[wk]
            got_stem = files[wk][1].stem if files[wk][1] else '(缺)'
            if stem != got_stem:
                fail('6 可重生成',
                     f'第 {wk} 周 README 文件名 {stem} 与实际 {got_stem} 不一致')
            if pages != want:
                fail('6 可重生成',
                     f'第 {wk} 周页数不一致：重新生成 {pages} 页，README 声明 {want} 页')

            # ⚠️ 只比页数是不够的：改了 content/wNN.py 却忘了重建课件时，
            #    页数往往一模一样，仓库里的 .pptx 就这样悄悄过期。
            #    必须把重新生成的产物与已提交的课件**逐段文本**比对。
            committed = files[wk][1]
            if committed is None:
                continue
            fresh_texts, old_texts = pptx_texts(out), pptx_texts(committed)
            if fresh_texts != old_texts:
                diff = next((f'第 {i + 1} 段：仓库「{o[:40]}」≠ 重建「{n[:40]}」'
                             for i, (o, n) in enumerate(zip(old_texts, fresh_texts))
                             if o != n),
                            f'段数不同：仓库 {len(old_texts)} vs 重建 {len(fresh_texts)}')
                fail('6 可重生成',
                     f'第 {wk} 周课件与 content/w{wk}.py 不一致 —— '
                     f'源改过但 .pptx 没重建？\n        {diff}\n'
                     f'        修法：cd courseware && python3 build_all.py {wk}')


# ---------------------------------------------------------------- 检查 7
CORPUS_GLOBS = ['2025fall-cs101/*.md', 'ADS_problem_list_at_*.md',
                'ADS_matrices.md']
# 讲义里的引用形态：**E02750: 鸡兔同笼**、`02760: 数字三角形`、表格里的 02773 等
# 5 位题号 + 冒号 + 题名。
#   - 前面不能是数字或小数点：排除 3.14159 这类误匹配；
#   - 允许前面是中文或字母：语料里有"练习01742: Coins"、"OJ02806:公共子序列"、
#     "E02750: 鸡兔同笼"等多种写法，\b 在 CJK 与数字之间并不成立；
#   - 后面不能再跟数字：排除长数字串的尾部；
#   - 题名在 `]`（Markdown 链接起点）处截断，但**允许括号** ——
#     早先把 `(`/`（` 也排除掉，导致语料里「汉诺塔问题(Tower of Hanoi)」
#     被截成「汉诺塔问题」，反过来把讲义里正确的全称判成不符。
REF = re.compile(
    r'(?<![0-9.])(\d{5})(?!\d)\s*[:：]\s*([^\n,，。|`*<\]]{1,30})')


# 表格形态的引用：`| ... | 题名 | 编号 | ... |`（题名在前、题号在后，中间没有冒号）。
# W16 的备选题库、各周的作业表都是这个形状 —— REF 那条正则**完全看不到它们**，
# 而它们恰恰是本仓库题号引用最密集的地方（实测 71 处）。
TABLE_ID = re.compile(r'^[ETM]?(\d{5})$')
TITLE_HEADERS = ('题目', '题名')


def table_refs(text):
    r"""从 Markdown 表格里抽 (题号, 题名)。

    **按表头列名定位**，不用"题号紧邻前一格"这种启发式 ——
    本仓库里有 `| 形状 | 排序键 | 例题 |`、`| 形态 | 递归时传 | 典型题 |` 这类表，
    题号前面一格是排序键 / 递归参数，不是题名（实测会造成 5 处误报）。

    只处理**表头里含「题目」或「题名」列**的表：题名取该列，题号取同一行里
    形如 `[ETM]?\d{5}` 的单元格。合并行（如 `LC 20 / 02694`）不匹配，自动跳过。
    """
    out = []
    header_idx = None
    for line in text.splitlines():
        line = line.strip()
        if not line.startswith('|'):
            header_idx = None           # 表格结束
            continue
        cells = [c.strip().strip('`').strip() for c in line.strip('|').split('|')]
        if set(''.join(cells)) <= set('-: '):
            continue                    # 分隔行 |---|---|
        if header_idx is None:
            for k, c in enumerate(cells):
                if any(h in c for h in TITLE_HEADERS):
                    header_idx = k
                    break
            else:
                header_idx = -1         # 这张表没有题名列，整表跳过
            continue
        if header_idx < 0 or header_idx >= len(cells):
            continue
        title = cells[header_idx].strip('*` ').strip()
        if not title or title.isdigit():
            continue
        for c in cells:
            m = TABLE_ID.match(c)
            if m:
                out.append((m.group(1), title))
                break
    return out


def normalize_title(s):
    """归一化题名，使不同书写方式可以精确比较。

    语料是从既有 Markdown 里正则抽出来的，会带上链接残留（如 `最大最小整数]`），
    必须在这里洗干净 —— 否则就只能靠"子串容差"兜，而子串容差会**放过真正的题名漂移**
    （T-008 实测：过时的 `最大最小整数 v0.3` 与正确题名互为子串，被静默通过）。
    """
    s = s.strip()
    s = re.sub(r'[\s　]+', '', s)
    s = s.replace('（', '(').replace('）', ')')
    s = s.replace('，', ',').replace('“', '"').replace('”', '"')
    s = s.strip('])】》')                 # Markdown 链接残留
    s = s.rstrip('.,:;、')
    return s.lower()


def build_title_corpus():
    """从仓库既有材料里抽取 {题号: {已知题名}}。"""
    corpus = {}
    for pattern in CORPUS_GLOBS:
        for path in sorted(ROOT.glob(pattern)):
            for num, title in REF.findall(read(path)):
                t = normalize_title(title)
                if not t or t.isdigit():
                    continue
                corpus.setdefault(num, set()).add(t)
    return corpus


def check_problem_titles(files):
    corpus = build_title_corpus()
    if not corpus:
        fail('7 题号题名', '未能从仓库既有材料中抽取到任何题号↔题名语料')
        return
    checked = unknown = 0
    verified = sum(
        1 for wk in WEEKS if files.get(wk, (None,))[0]
        for num, _t in (REF.findall(read(files[wk][0]))
                        + table_refs(read(files[wk][0])))
        if num in VERIFIED_TITLES)
    for wk in WEEKS:
        md = files.get(wk, (None,))[0]
        if md is None:
            continue
        refs = REF.findall(read(md)) + table_refs(read(md))
        for num, title in refs:
            t = normalize_title(title)
            if not t or t.isdigit():
                continue
            if num in VERIFIED_TITLES:
                # 已联网核实过：以权威题名为准，忽略（可能过时的）语料
                checked += 1
                official, source = VERIFIED_TITLES[num]
                if t == normalize_title(official):
                    continue
                if title.strip() in TITLE_WHITELIST.get(num, {}):
                    continue
                fail('7 题号题名',
                     f'{md.name}: 题号 {num} 的题名「{title.strip()}」'
                     f'与已联网核实的平台题名「{official}」不符\n'
                     f'        出处：{source}')
                continue
            known = corpus.get(num)
            if not known:
                unknown += 1
                continue                       # 语料里没有该题号，无从判定
            checked += 1
            if t in known:
                continue
            # ⚠️ 这里**不做子串容差**。曾经写过 `if t in k or k in t: continue`，
            #    结果过时题名 `最大最小整数 v0.3` 与正确题名互为子串，漂移被静默放过
            #    （由 T-008 联网核实才发现）。归一化洗掉链接残留后，
            #    精确匹配对当前 73 处引用零误报。
            allowed = TITLE_WHITELIST.get(num, {})
            if title.strip() in allowed:
                continue
            fail('7 题号题名',
                 f'{md.name}: 题号 {num} 的题名「{title.strip()}」'
                 f'与仓库既有语料不符，已知：{sorted(known)}')
    note(f'题号↔题名：逐处比对 {checked} 处'
         f'（其中 {verified} 处以联网核实的权威题名为准）；'
         f'{unknown} 处题号不在既有语料中（无从判定）')


# ---------------------------------------------------------------- 检查 8
CJK_FONT_FAMILIES = (
    'simsun', 'simhei', 'simkai', 'simfang', 'nsimsun',
    'microsoftyahei', 'msyh', 'microsoftjhenghei',
    'kaiti', 'fangsong', 'youyuan', 'lisu', 'stsong', 'stkaiti', 'stheiti',
    'stfangsong', 'stxihei', 'stzhongsong', 'songti', 'heiti', 'pingfang',
    'hiraginosansgb', 'notosanssc', 'notoserifsc', 'notosanstc',
    'notoseriftc', 'notosanscjk', 'notoserifcjk', 'sourcehansans',
    'sourcehanserif', 'wenquanyi', 'wqy', 'droidsansfallback',
    'arplumingcn', 'arplukaicn', 'ipagothic', 'ipamincho', 'nanumgothic',
    'malgun', 'meiryo', 'msgothic', 'msmincho', 'yugothic', 'yumincho',
)


def has_cjk_font(pdffonts_output):
    """纯包含式判定：只认已知的 CJK 字体家族名，不用通用词兜底。"""
    for line in pdffonts_output.splitlines()[2:]:
        parts = line.split()
        if not parts:
            continue
        name = re.sub(r'[^a-z]', '', parts[0].lower())
        if any(fam in name for fam in CJK_FONT_FAMILIES):
            return True
    return False


# deck.py 的版面几何（pt，16:9 = 960x540）：正文区与页脚的分界
BODY_TOP_PT = 1.42 * 72
BODY_BOTTOM_PT = BODY_TOP_PT + 5.32 * 72      # = 485.3
# 页脚**文本**的实测顶端（LibreOffice 渲染下 yMin≈497.5，略高于文本框的 498.2）：
# 阈值必须按实测取，不能按理论值 —— 差 0.7pt 就会把每一页的页脚都误判成溢出。
FOOTER_TEXT_TOP_PT = 496.0
BODY_TOL_PT = 4.0                             # 字形下伸部等的容差


def intrudes_into_footer(y_min_pt, y_max_pt):
    """正文文字是否越出版心底部并侵入页脚区（坐标已换算到 540pt 版面）。

    抽成具名函数是为了能**脱离 LibreOffice 直接回归**这条判据 ——
    它的阈值来自实测（页脚文本 yMin≈497.5，而文本框理论值是 498.2），
    差 0.7pt 就会把每一页的页脚都误判成溢出。
    """
    return (y_min_pt < FOOTER_TEXT_TOP_PT
            and y_max_pt > BODY_BOTTOM_PT + BODY_TOL_PT)


def check_render(files):
    soffice = None
    for cand in ('soffice', 'libreoffice'):
        try:
            subprocess.run([cand, '--version'], capture_output=True, check=True)
            soffice = cand
            break
        except (FileNotFoundError, subprocess.CalledProcessError):
            continue
    if soffice is None:
        fail('8 渲染', '找不到 libreoffice / soffice，无法执行渲染检查')
        return
    try:
        subprocess.run(['pdftotext', '-v'], capture_output=True)
    except FileNotFoundError:
        fail('8 渲染', '找不到 pdftotext（poppler-utils）')
        return

    pptxs = [files[wk][1] for wk in WEEKS if files[wk][1]]
    with tempfile.TemporaryDirectory() as tmp:
        proc = subprocess.run(
            [soffice, '--headless', '--convert-to', 'pdf', '--outdir', tmp]
            + [str(p) for p in pptxs],
            capture_output=True, text=True, timeout=1800)
        pdfs = sorted(Path(tmp).glob('*.pdf'))
        if len(pdfs) != len(pptxs):
            fail('8 渲染',
                 f'转换未全部成功：期望 {len(pptxs)} 份 PDF，实得 {len(pdfs)} 份；'
                 f'soffice 退出码 {proc.returncode}')
            return
        total_pages = 0
        for pdf in pdfs:
            fonts = subprocess.run(['pdffonts', str(pdf)],
                                   capture_output=True, text=True).stdout
            if not has_cjk_font(fonts):
                fail('8 渲染', f'{pdf.name}: PDF 未嵌入任何已知中文字体，'
                               f'渲染结果可能是方框（本机字体环境限制）')
            # 逐页文本框位置检查
            bbox = subprocess.run(['pdftotext', '-bbox', str(pdf), '-'],
                                  capture_output=True, text=True).stdout
            pages = re.findall(
                r'<page width="([\d.]+)" height="([\d.]+)">(.*?)</page>',
                bbox, re.S)
            total_pages += len(pages)
            for pno, (pw, ph, body) in enumerate(pages, start=1):
                pw, ph = float(pw), float(ph)
                # pdftotext 的坐标按 PDF 点数给出，换算到 deck.py 的 720x540 版面
                sy = 540.0 / ph
                for x, y, x2, y2 in re.findall(
                        r'<word xMin="([\d.]+)" yMin="([\d.]+)" '
                        r'xMax="([\d.]+)" yMax="([\d.]+)"', body):
                    x, y, x2, y2 = float(x), float(y), float(x2), float(y2)
                    if x2 > pw + 0.5 or y2 > ph + 0.5 or x < -0.5 or y < -0.5:
                        fail('8 渲染',
                             f'{pdf.name} 第 {pno} 页：文字越出页面 '
                             f'({x},{y})-({x2},{y2}) vs {pw}x{ph}')
                        break
                    # ⚠️ 只比对页面边界是不够的：正文压到页脚上仍然在页内。
                    #    W16 曾有 3 页代码压住页脚而这里报"0 处越界"，
                    #    直到把判据改成**版心**底部才暴露。
                    if intrudes_into_footer(y * sy, y2 * sy):
                        fail('8 渲染',
                             f'{pdf.name} 第 {pno} 页：正文越出版心底部并侵入页脚区'
                             f'（文字底 {y2 * sy:.1f}pt > 版心底 {BODY_BOTTOM_PT:.1f}pt）')
                        break
        note(f'渲染检查：{len(pdfs)} 份 PDF，共 {total_pages} 页')


# ---------------------------------------------------------------- 主流程
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--render', action='store_true',
                    help='附加第 8 项渲染检查（需 libreoffice + pdftotext）')
    opts = ap.parse_args()
    if os.environ.get('VERIFY_RENDER') == '1':
        opts.render = True

    files = week_files()
    check_pairing(files)
    check_metadata(files)
    check_syllabus(files)
    check_links(files)
    check_syntax(files)
    check_regenerate(files)
    check_problem_titles(files)
    if opts.render:
        check_render(files)

    print('=' * 68)
    for n in notes:
        print('  ·', n)
    if failures:
        print(f'\n✗ 闸门未通过：{len(failures)} 项')
        for f in failures:
            print('  -', f)
        return 1
    print('\n✓ 闸门全部通过'
          + ('（含渲染检查）' if opts.render else '（未含渲染检查，加 --render 开启）'))
    return 0


if __name__ == '__main__':
    sys.exit(main())

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
    6  可重生成    课件能从 content/ 重新生成，页数与 README 声明一致
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

# 有意偏离既有题名语料的引用：题号 -> {别名: 理由}
TITLE_WHITELIST = {
    # 例：'02734': {'十进制转八进制': '平台标题的另一种常见写法'},
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


def check_regenerate(files):
    try:
        from pptx import Presentation  # noqa: F401
    except ImportError:
        note('未安装 python-pptx，跳过第 6 项（可重生成）')
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


# ---------------------------------------------------------------- 检查 7
CORPUS_GLOBS = ['2025fall-cs101/*.md', 'ADS_problem_list_at_*.md',
                'ADS_matrices.md']
# 讲义里的引用形态：**E02750: 鸡兔同笼**、`02760: 数字三角形`、表格里的 02773 等
# 5 位题号 + 冒号 + 题名。
#   - 前面不能是数字或小数点：排除 3.14159 这类误匹配；
#   - 允许前面是中文或字母：语料里有"练习01742: Coins"、"OJ02806:公共子序列"、
#     "E02750: 鸡兔同笼"等多种写法，\b 在 CJK 与数字之间并不成立；
#   - 后面不能再跟数字：排除长数字串的尾部。
REF = re.compile(
    r'(?<![0-9.])(\d{5})(?!\d)\s*[:：]\s*([^\n,，。|`*<（(]{1,30})')


def normalize_title(s):
    s = s.strip()
    s = re.sub(r'[\s　]+', '', s)
    s = s.replace('（', '(').replace('）', ')')
    s = s.replace('，', ',').replace('“', '"').replace('”', '"')
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
    for wk in WEEKS:
        md = files.get(wk, (None,))[0]
        if md is None:
            continue
        for num, title in REF.findall(read(md)):
            t = normalize_title(title)
            if not t or t.isdigit():
                continue
            known = corpus.get(num)
            if not known:
                unknown += 1
                continue                       # 语料里没有该题号，无从判定
            checked += 1
            if t in known:
                continue
            if any(t in k or k in t for k in known):
                continue                       # 一方是另一方的前缀 / 子串
            allowed = TITLE_WHITELIST.get(num, {})
            if title.strip() in allowed:
                continue
            fail('7 题号题名',
                 f'{md.name}: 题号 {num} 的题名「{title.strip()}」'
                 f'与仓库既有语料不符，已知：{sorted(known)}')
    note(f'题号↔题名：逐处比对 {checked} 处；{unknown} 处题号不在既有语料中（无从判定）')


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
                for x, y, x2, y2 in re.findall(
                        r'<word xMin="([\d.]+)" yMin="([\d.]+)" '
                        r'xMax="([\d.]+)" yMax="([\d.]+)"', body):
                    if float(x2) > pw + 0.5 or float(y2) > ph + 0.5 \
                            or float(x) < -0.5 or float(y) < -0.5:
                        fail('8 渲染',
                             f'{pdf.name} 第 {pno} 页：文字越出版心 '
                             f'({x},{y})-({x2},{y2}) vs {pw}x{ph}')
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

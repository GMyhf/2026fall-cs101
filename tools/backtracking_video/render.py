# 公共绘图 + 合成工具
import os, re, subprocess, asyncio, json
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageDraw, ImageFont

W, H = 1280, 720
BG = (30, 30, 34)
FG = (230, 230, 230)
DIM = (110, 110, 120)
ORANGE = (255, 120, 70)
BLUE = (90, 170, 255)
GREEN = (110, 210, 120)
YELLOW = (255, 210, 90)
PURPLE = (200, 140, 255)
CMT = (120, 170, 120)
HL = (60, 60, 30)

CJK = '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
CJKB = '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc'
MONO = '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'
MONOB = '/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf'

def _sc_index(path):
    for i in range(10):
        try:
            f = ImageFont.truetype(path, 20, index=i)
        except OSError:
            break
        if 'SC' in ' '.join(f.getname()):
            return i
    return 0

_SCI = _sc_index(CJK)
_cache = {}
def font(kind, size):
    key = (kind, size)
    if key not in _cache:
        if kind == 'cjk':
            _cache[key] = ImageFont.truetype(CJK, size, index=_SCI)
        elif kind == 'cjkb':
            _cache[key] = ImageFont.truetype(CJKB, size, index=_SCI)
        elif kind == 'monob':
            _cache[key] = ImageFont.truetype(MONOB, size)
        else:
            _cache[key] = ImageFont.truetype(MONO, size)
    return _cache[key]

def is_wide(ch):
    return ord(ch) > 0x2E7F

def text(d, xy, s, size=24, fill=FG, bold=False, anchor='la'):
    f = font('cjkb' if bold else 'cjk', size)
    d.text(xy, s, font=f, fill=fill, anchor=anchor)

def text_w(s, size=24, bold=False):
    return font('cjkb' if bold else 'cjk', size).getlength(s)

def mono_mixed(d, x, y, s, size, fill):
    """等宽代码里夹中文注释：ASCII 用等宽字体，中文用 CJK 字体，各占 1/2 格"""
    mf = font('mono', size)
    cf = font('cjk', size)
    cw = mf.getlength('M')
    for ch in s:
        if is_wide(ch):
            d.text((x, y - size * 0.12), ch, font=cf, fill=fill)
            x += cw * 2
        else:
            d.text((x, y), ch, font=mf, fill=fill)
            x += cw
    return x

KW = r'\b(?:class|def|if|return|for|in|not|and|or|None|True|False)\b'

def draw_code(d, code_lines, x0, y0, size=17, lh=25, hl=(), dim_others=False, width=560):
    """简单语法高亮；hl 为需要高亮的行号（从 1 起）"""
    mf = font('mono', size)
    cw = mf.getlength('M')
    for i, line in enumerate(code_lines, 1):
        y = y0 + (i - 1) * lh
        if i in hl:
            d.rectangle([x0 - 6, y - 3, x0 + width, y + lh - 4], fill=HL)
            d.rectangle([x0 - 6, y - 3, x0 - 2, y + lh - 4], fill=YELLOW)
        faded = dim_others and hl and i not in hl
        d.text((x0 - 4 - mf.getlength(str(i)) - 10, y), str(i), font=font('mono', size - 3), fill=(80, 80, 90))
        # 拆注释
        code, cmt = line, ''
        if '#' in line:
            k = line.index('#')
            code, cmt = line[:k], line[k:]
        x = x0
        for tok in re.split(r'(\s+|[()\[\]:,.=+\-]|' + KW + ')', code):
            if not tok:
                continue
            if re.fullmatch(KW, tok):
                c = PURPLE
            elif re.fullmatch(r'\d+', tok):
                c = YELLOW
            elif tok in ('backtrack', 'permute', 'subsets'):
                c = BLUE
            else:
                c = FG
            if faded:
                c = tuple(int(v * 0.45) for v in c)
            x = mono_mixed(d, x, y, tok, size, c)
        if cmt:
            c = CMT if not faded else tuple(int(v * 0.45) for v in CMT)
            mono_mixed(d, x, y, cmt, size, c)

def wrap(s, size, maxw):
    lines, cur = [], ''
    for ch in s:
        if text_w(cur + ch, size) > maxw and ch not in '，。、；：！？）」”':
            # 尽量不在 ASCII 单词/公式中间断开
            m = re.search(r'[A-Za-z0-9_\[\],()·!²^:+\-]+$', cur)
            if m and m.start() > 0 and not is_wide(ch) and ch not in ' ，。':
                lines.append(cur[:m.start()])
                cur = cur[m.start():] + ch
            else:
                lines.append(cur)
                cur = ch
        else:
            cur += ch
    if cur:
        lines.append(cur)
    return [l.strip() for l in lines]

def subtitle(d, s, size=26):
    lines = wrap(s, size, W - 120)
    lh = size + 12
    h = lh * len(lines) + 20
    y0 = H - h - 8
    d.rectangle([0, y0, W, H], fill=(18, 18, 20))
    for i, l in enumerate(lines):
        text(d, (W // 2, y0 + 10 + i * lh), l, size, FG, anchor='ma')
    return y0

def header(d, s):
    text(d, (40, 22), s, 30, ORANGE, bold=True)
    d.line([40, 70, W - 40, 70], fill=(70, 70, 80), width=2)

def new_canvas():
    im = Image.new('RGB', (W, H), BG)
    return im, ImageDraw.Draw(im)

# ---------- 树 ----------
def fmt(lst):
    return '[' + ','.join(map(str, lst)) + ']'

class Tree:
    """nodes: key -> dict(label, parent, depth, elabel)；按 children 顺序布局"""
    def __init__(self, nodes, order, box):
        self.nodes, self.box = nodes, box
        x0, y0, x1, y1 = box
        leaves = [k for k in order if not any(n['parent'] == k for n in nodes.values())]
        depth = max(n['depth'] for n in nodes.values())
        self.pos = {}
        step = (x1 - x0) / len(leaves)
        for i, k in enumerate(leaves):
            self.pos[k] = x0 + step * (i + 0.5)
        for dd in range(depth - 1, -1, -1):
            for k, n in nodes.items():
                if n['depth'] == dd and k not in self.pos:
                    ch = [c for c, m in nodes.items() if m['parent'] == k]
                    self.pos[k] = sum(self.pos[c] for c in ch) / len(ch)
        dy = (y1 - y0) / max(depth, 1)
        self.pos = {k: (x, y0 + nodes[k]['depth'] * dy) for k, x in self.pos.items()}

    def draw(self, d, visible=None, state=None, path=(), size=18, elabels=True, cjk=False):
        """state: key -> 'cur'|'done'|'leaf'|'seen'；path: 当前根到节点的 key 列表"""
        state = state or {}
        pset = set(zip(path, path[1:]))
        for k, n in self.nodes.items():
            p = n['parent']
            if p is None or (visible is not None and k not in visible):
                continue
            (x0, y0), (x1, y1) = self.pos[p], self.pos[k]
            on = (p, k) in pset
            c = BLUE if on else (ORANGE if state.get(k) else (95, 70, 60))
            d.line([x0, y0 + 14, x1, y1 - 14], fill=c, width=4 if on else 2)
            if elabels and n.get('elabel'):
                mx, my = (x0 + x1) / 2, (y0 + y1) / 2
                text(d, (mx + (8 if x1 >= x0 else -8), my - 4), n['elabel'], 14,
                     BLUE if on else (150, 150, 160), anchor='la' if x1 >= x0 else 'ra')
        for k, n in self.nodes.items():
            if visible is not None and k not in visible:
                continue
            x, y = self.pos[k]
            st = state.get(k)
            col = {'cur': YELLOW, 'leaf': GREEN, 'seen': ORANGE}.get(st, ORANGE if state == {} else (150, 110, 95))
            f = font('cjk' if cjk else 'mono', size)
            tw = f.getlength(n['label'])
            if st == 'cur':
                d.rounded_rectangle([x - tw / 2 - 8, y - 16, x + tw / 2 + 8, y + 16], 8, outline=YELLOW, width=3, fill=(60, 55, 25))
            elif st == 'leaf':
                d.rounded_rectangle([x - tw / 2 - 6, y - 15, x + tw / 2 + 6, y + 15], 8, outline=GREEN, width=2, fill=(30, 55, 35))
            d.text((x, y), n['label'], font=f, fill=col, anchor='mm')

# ---------- 合成 ----------
VOICE = 'zh-CN-YunxiNeural'

def tts(textstr, out):
    if os.path.exists(out) and os.path.getsize(out) > 0:
        return
    for _ in range(4):
        r = subprocess.run(['edge-tts', '--voice', VOICE, '--rate', '+0%', '--text', textstr, '--write-media', out],
                           capture_output=True)
        if r.returncode == 0 and os.path.getsize(out) > 0:
            return
    raise RuntimeError('tts failed: ' + textstr)

def dur(f):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]))

def build(scenes, workdir, out_mp4):
    """scenes: list of (PIL.Image, narration)"""
    os.makedirs(workdir, exist_ok=True)
    jobs = []
    for i, (im, narr) in enumerate(scenes):
        png = f'{workdir}/s{i:03d}.png'
        im.save(png)
        jobs.append((i, png, narr))

    def one(job):
        i, png, narr = job
        mp3 = f'{workdir}/s{i:03d}.mp3'
        h = f'{workdir}/s{i:03d}.txt'
        if not (os.path.exists(h) and open(h).read() == narr):
            if os.path.exists(mp3):
                os.remove(mp3)
            open(h, 'w').write(narr)
        tts(narr, mp3)
        seg = f'{workdir}/s{i:03d}.mp4'
        t = dur(mp3) + 0.6
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-loop', '1', '-framerate', '25', '-i', png, '-i', mp3,
                        '-af', 'adelay=200|200,apad', '-t', f'{t:.3f}', '-c:v', 'libx264', '-tune', 'stillimage',
                        '-pix_fmt', 'yuv420p', '-r', '25', '-c:a', 'aac', '-b:a', '128k', '-ar', '44100', '-ac', '1', seg],
                       check=True)
        return seg

    with ThreadPoolExecutor(6) as ex:
        segs = list(ex.map(one, jobs))
    lst = f'{workdir}/list.txt'
    with open(lst, 'w') as f:
        for s in segs:
            f.write(f"file '{s}'\n")
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy',
                    '-movflags', '+faststart', out_mp4], check=True)
    print(out_mp4, f'{dur(out_mp4):.1f}s', len(scenes), 'scenes')

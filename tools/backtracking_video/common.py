from render import *

def slide(title, narr, body=None, sub=None):
    """body(d) 自定义绘制；sub 为字幕（默认同旁白）"""
    im, d = new_canvas()
    if title:
        header(d, title)
    if body:
        body(d)
    subtitle(d, sub or narr)
    return im, narr

def bullets(items, x=80, y=110, size=28, gap=56, color=FG):
    def f(d):
        for i, it in enumerate(items):
            if isinstance(it, tuple):
                s, c = it
            else:
                s, c = it, color
            text(d, (x, y + i * gap), s, size, c)
    return f

def state_box(d, sol, ans, x0=650, y0=440, x1=1250, extra=None):
    d.rounded_rectangle([x0, y0, x1, y0 + 150], 10, outline=(70, 70, 80), width=2, fill=(36, 36, 42))
    mf = font('mono', 20)
    d.text((x0 + 16, y0 + 14), 'sol = ' + fmt(sol), font=font('monob', 21), fill=BLUE)
    s = 'ans = [' + ', '.join(fmt(a) for a in ans) + ']'
    # 手动换行
    lines, cur = [], ''
    for part in re.split(r'(?<=\]), ', s):
        cand = (cur + ', ' if cur else '') + part
        if mf.getlength(cand) > x1 - x0 - 40 and cur:
            lines.append(cur + ',')
            cur = '      ' + part
        else:
            cur = cand
    lines.append(cur)
    for i, l in enumerate(lines):
        d.text((x0 + 16, y0 + 52 + i * 28), l, font=mf, fill=GREEN)
    if extra:
        text(d, (x1 - 16, y0 + 14), extra, 20, YELLOW, anchor='ra')

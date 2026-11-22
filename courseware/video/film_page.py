#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成课件讲解视频的网页播放页（视频 + 逐句字幕 + 按页跳转目录）。

用法:
    python3 film_page.py w07 OUTDIR       # 单个播放页（键：w01..w16、nov）
    python3 film_page.py --index OUTDIR   # 目录页（OUTDIR 为 slides/ 根）
    python3 film_page.py --all OUTDIR     # 目录页 + 全部播放页 + 拷入 720p 视频
OUTDIR/<键>/ 下生成 index.html、<键>.vtt；--all 时把 <键>-preview.mp4 拷成 <键>.mp4。
1080p 成品只放 GitHub Release（页面链过去），infomall 不提供。
线上位置：https://infomall.zhengmao.ltd/cs101-anim/slides/<键>/（中转机 /srv/cs101-anim/slides/<键>/）
"""
import html
import json
import re
import shutil
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
import build_all                                            # noqa: E402

COURSE = '计算概论（B）'
RELEASE = 'https://github.com/GMyhf/2026fall-cs101/releases/tag/slides-film-2026fall'

# 播放顺序：附加课件插在它所讲评的那几周之后
ORDER = [f'w{w}' for w in sorted(build_all.WEEKS)]
ORDER.insert(ORDER.index('w10') + 1, 'nov')
EXTRA_TITLES = {'nov': '11 月月考讲评与阶段复习'}


def title_of(key):
    """从讲稿首行取标题：「# 第5周 10 月月考与阶段复习 —— 课件旁白讲稿」。"""
    first = (HERE.parent / 'content' / f'{key}_narration.md').read_text(
        encoding='utf-8').split('\n', 1)[0]
    t = first.lstrip('# ').split(' —— ')[0].strip()
    m = re.match(r'第(\d+)周\s*(.*)', t)
    if m:
        return f'第 {int(m.group(1))} 周 {m.group(2)}'
    return EXTRA_TITLES.get(key, t)


def available():
    return [k for k in ORDER if (HERE / f'{k}.timeline.json').exists()]


def to_sec(t):
    s = 0
    for p in t.split(':'):
        s = s * 60 + int(p)
    return s


STYLE_BASE = '''body{margin:0;font-family:-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;background:#f3f5f8;color:#12395b}
header{padding:14px 20px;background:#12395b;color:#fff} header a{color:#ffd27a}'''


def index_page(out):
    rows = []
    for k in available():
        tl = json.loads((HERE / f'{k}.timeline.json').read_text(encoding='utf-8'))
        rows.append(f'<li><a href="{k}/">{html.escape(title_of(k))}</a>'
                    f'<span>{len(tl["sections"])} 页 · {tl["total"]}</span></li>')
    out.mkdir(parents=True, exist_ok=True)
    (out / 'index.html').write_text(f'''<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{COURSE} · 课件讲解视频</title>
<style>
{STYLE_BASE}
header{{padding:18px 24px}} h1{{margin:0;font-size:22px}}
header p{{margin:6px 0 0;font-size:13px;opacity:.85}}
ul{{list-style:none;margin:20px auto;padding:0 12px;max-width:760px}}
li{{display:flex;justify-content:space-between;gap:12px;background:#fff;margin:8px 0;padding:14px 18px;border-radius:6px;font-size:17px}}
li a{{color:#12395b;font-weight:600;text-decoration:none}} li span{{color:#888;font-size:14px;white-space:nowrap}}
</style></head><body>
<header><h1>{COURSE} · 课件讲解视频</h1>
<p>课件逐页配音讲解，带逐句字幕，可按页跳转、倍速播放。1080p 成片见 <a href="{RELEASE}">GitHub Release</a>；
知识点动画见 <a href="../">算法动画系列</a>。</p></header>
<ul>
{chr(10).join(rows)}
</ul></body></html>
''', encoding='utf-8')
    print('生成', out / 'index.html')


def film_page(key, out):
    out.mkdir(parents=True, exist_ok=True)
    tl = json.loads((HERE / f'{key}.timeline.json').read_text(encoding='utf-8'))
    srt = (HERE / f'{key}.srt').read_text(encoding='utf-8')
    vtt = 'WEBVTT\n\n' + re.sub(r'(\d\d:\d\d:\d\d),(\d\d\d)', r'\1.\2', srt)
    (out / f'{key}.vtt').write_text(vtt, encoding='utf-8')
    title = html.escape(title_of(key))
    preview = HERE / f'{key}-preview.mp4'
    size = f'约 {preview.stat().st_size / 1e6:.0f}MB' if preview.exists() else ''
    items = '\n'.join(
        f'<li data-t="{to_sec(s["start"])}"><span class="t">{s["start"]}</span>'
        f'<span class="p">P{s["page"]}</span>{html.escape(s["title"])}</li>'
        for s in tl['sections'])
    page = f'''<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{COURSE} · {title} · 课件讲解</title>
<style>
{STYLE_BASE}
header h1{{margin:0;font-size:20px}} header p{{margin:4px 0 0;font-size:13px;opacity:.8}}
main{{display:flex;gap:16px;padding:16px;align-items:flex-start}}
.v{{flex:1;min-width:0}} video{{width:100%;background:#000;border-radius:6px}}
.ctl{{margin-top:8px;font-size:14px}} .ctl button{{margin-right:4px;padding:3px 9px;border:1px solid #9ab;border-radius:4px;background:#fff;cursor:pointer}}
.ctl button.on{{background:#12395b;color:#fff}}
ol{{list-style:none;margin:0;padding:0;width:330px;max-height:calc(100vh - 110px);overflow:auto;background:#fff;border-radius:6px;font-size:14px}}
li{{padding:6px 10px;border-bottom:1px solid #eee;cursor:pointer}} li:hover{{background:#eaf1f8}}
li.cur{{background:#fff4d6;font-weight:600}}
.t{{color:#888;margin-right:6px;font-variant-numeric:tabular-nums}} .p{{color:#2b6aa3;margin-right:6px}}
@media(max-width:900px){{main{{flex-direction:column}} ol{{width:100%;max-height:50vh}}}}
</style></head><body>
<header><h1>{COURSE} · {title} · 课件讲解</h1>
<p><a href="../">← 各讲目录</a>　{len(tl["sections"])} 页，总时长 {tl["total"]}，配音 {tl["voice"]}。点右侧目录跳到对应页；字幕可在播放器里开关。</p></header>
<main><div class="v">
<video id="v" controls preload="metadata" src="{key}.mp4">
<track kind="subtitles" srclang="zh" label="中文" src="{key}.vtt" default></video>
<div class="ctl">倍速：<span id="r"></span>　下载：<a href="{key}.mp4" download="CS101_{key}_720p.mp4">720p（{size}）</a> · <a href="{RELEASE}" target="_blank">1080p（GitHub Release）</a> · <a href="{key}.vtt" download>字幕 VTT</a></div></div>
<ol id="toc">
{items}
</ol></main>
<script>
const v=document.getElementById('v'),lis=[...document.querySelectorAll('#toc li')];
lis.forEach(li=>li.onclick=()=>{{v.currentTime=+li.dataset.t;v.play()}});
v.ontimeupdate=()=>{{let k=0;lis.forEach((li,i)=>{{if(+li.dataset.t<=v.currentTime+0.2)k=i}});
 lis.forEach((li,i)=>li.classList.toggle('cur',i===k))}};
const r=document.getElementById('r');
[1,1.25,1.5,1.75,2].forEach(x=>{{const b=document.createElement('button');b.textContent=x+'×';
 b.onclick=()=>{{v.playbackRate=x;[...r.children].forEach(c=>c.classList.toggle('on',c===b))}};
 if(x===1)b.classList.add('on');r.appendChild(b)}});
</script></body></html>
'''
    (out / 'index.html').write_text(page, encoding='utf-8')
    print('生成', out / 'index.html')


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    arg, out = sys.argv[1], Path(sys.argv[2])
    if arg == '--index':
        return index_page(out)
    if arg == '--all':
        index_page(out)
        for k in available():
            film_page(k, out / k)
            shutil.copy2(HERE / f'{k}-preview.mp4', out / k / f'{k}.mp4')
        return
    key = arg if arg in ORDER else f'w{arg.zfill(2)}'
    film_page(key, out)


if __name__ == '__main__':
    main()

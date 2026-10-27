import sys
from common import *

CODE = '''class Solution:
    def subsets(self, nums: List[int]) -> List[List[int]]:
        n = len(nums)
        ans, sol = [], []

        def backtrack(i):
            # 终止条件：处理完所有元素
            if i == n:
                ans.append(sol[:])
                return

            # 分支1：不选择 nums[i]
            backtrack(i + 1)

            # 分支2：选择 nums[i]
            sol.append(nums[i])
            backtrack(i + 1)
            sol.pop()  # 回溯

        backtrack(0)
        return ans'''.split('\n')

NUMS = [1, 2, 3]
nodes, order = {}, []
def chosen(key):
    return [NUMS[i] for i, b in enumerate(key) if b]
def mk(key):
    order.append(key)
    nodes[key] = dict(label=fmt(chosen(key)), parent=key[:-1] if key else None, depth=len(key),
                      elabel=('选' if key[-1] else '不选') + str(NUMS[len(key) - 1]) if key else '')
    if len(key) < len(NUMS):
        mk(key + (0,))
        mk(key + (1,))
mk(())

TREE_FULL = Tree(nodes, order, (150, 120, 1210, 520))
TREE_R = Tree(nodes, order, (640, 110, 1260, 400))

scenes = []
S = lambda *a, **k: scenes.append(slide(*a, **k))

# ---------- 开场 ----------
def title_body(d):
    text(d, (W // 2, 230), '子集', 72, ORANGE, bold=True, anchor='mm')
    text(d, (W // 2, 320), 'LeetCode 78 · Subsets', 32, FG, anchor='mm')
    text(d, (W // 2, 390), '递归 + 回溯：每个元素“选”或“不选”', 30, BLUE, anchor='mm')
S('', '大家好。上一讲我们用回溯解决了全排列，这一讲来看力扣第78题：子集。它是另一个必须掌握的回溯模板。', title_body)

S('题目', '题目是：给你一个整数数组 nums，其中的元素互不相同，返回该数组所有可能的子集，也叫幂集。解集不能包含重复的子集，可以按任意顺序返回。', bullets([
    '给定整数数组 nums，元素 互不相同，返回所有可能的子集（幂集）。',
    '解集 不能 包含重复的子集，可以 按任意顺序 返回。',
    ('示例 1：nums = [1,2,3]', BLUE),
    ('   输出：[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]', GREEN),
    ('示例 2：nums = [0]   →  [[],[0]]', BLUE),
    ('提示：1 <= n <= 10，元素互不相同', DIM),
], size=26, gap=60))

S('题目', '比如 nums 等于 1、2、3，一共有 8 个子集：空集、三个单元素子集、三个两元素子集，以及它自己。注意空集也算一个子集。', bullets([
    ('nums = [1,2,3]', BLUE),
    '0 个元素：[]',
    '1 个元素：[1]  [2]  [3]',
    '2 个元素：[1,2]  [1,3]  [2,3]',
    '3 个元素：[1,2,3]',
    ('共 1 + 3 + 3 + 1 = 8 个（空集也算！）', YELLOW),
], size=28, gap=60))

S('回溯的四个要素', '回溯算法可以归纳为四个要素：第一，做决策；第二，递归，带着这个决策去处理剩下的问题；第三，基本情况，也就是终止条件，什么时候停下来收集答案；第四，撤销决策，回到之前的状态，去尝试另一种决策。', bullets([
    ('① 做决策（make decision）', ORANGE),
    ('② 递归（recursion）：带着决策处理剩下的问题', ORANGE),
    ('③ 基本情况（base case）：何时停下、收集答案', ORANGE),
    ('④ 撤销决策（undo decision）：恢复状态，尝试另一种决策', ORANGE),
], size=30, gap=72), sub='回溯四要素：① 做决策 ② 递归 ③ 基本情况（终止条件）④ 撤销决策。')

def count_body(d):
    for i, v in enumerate(NUMS):
        x = 300 + i * 260
        d.rounded_rectangle([x - 100, 160, x + 100, 320], 14, outline=ORANGE, width=3)
        text(d, (x, 210), f'元素 {v}', 30, FG, anchor='mm')
        text(d, (x, 270), '选 / 不选', 26, BLUE, anchor='mm')
        text(d, (x, 350), '2 种', 26, YELLOW, anchor='mm')
        if i < 2:
            text(d, (x + 130, 240), '×', 48, FG, anchor='mm')
    text(d, (W // 2, 450), '2 × 2 × 2 = 2³ = 8        一般地：n 个元素共有 2^n 个子集', 30, YELLOW, anchor='mm')
S('为什么是 8 个？', '子集问题的决策非常简单：对每个元素，只有两种选择——选，或者不选。三个元素，每个都有两种选择，所以一共是 2 乘 2 乘 2，也就是 2 的 3 次方，等于 8。一般地，n 个元素有 2 的 n 次方个子集。', count_body,
  sub='每个元素只有两种决策：选 / 不选。3 个元素：2 × 2 × 2 = 2³ = 8。一般地，n 个元素共有 2^n 个子集。')

# ---------- 决策树 ----------
LV = ['i=0：决定 1', 'i=1：决定 2', 'i=2：决定 3', 'i=3：到底']
def tree_upto(depth, note=None):
    def f(d):
        vis = {k for k in nodes if len(k) <= depth}
        TREE_FULL.draw(d, visible=vis, size=22)
        text(d, (W - 50, 85), 'nums = [1,2,3]', 24, DIM, anchor='ra')
        for dd in range(depth + 1):
            y = TREE_FULL.pos[next(k for k in order if len(k) == dd)][1]
            text(d, (30, y - 12), LV[dd], 20, DIM)
        if note:
            text(d, (W // 2, 565), note, 26, YELLOW, anchor='mm')
    return f

S('决策树', '同样把决策过程画成一棵树。根节点是空集，此时下标 i 等于 0，要对第一个元素 1 做决定。', tree_upto(0))
S('决策树', '向左表示不选 1，仍然是空集；向右表示选 1，得到 [1]。这里约定左边是“不选”，右边是“选”，和后面代码的执行顺序一致。', tree_upto(1))
S('决策树', '第二层，对元素 2 做同样的决定：每个节点都分成“不选 2”和“选 2”两支。', tree_upto(2))
S('决策树', '第三层，对元素 3 做决定。i 等于 3 时，所有元素都处理完了。最底层的 8 个叶子，就是全部 8 个子集。', tree_upto(3, '叶子 = 答案：共 2³ = 8 个'))
S('决策树', '注意：只在叶子处，也就是 i 等于 n 时，才收集答案。中间节点不收集。比如中间这个空集节点，它下面的最左叶子也是空集，如果中间节点也收集，答案就会重复。', tree_upto(3, '只在叶子（i == n）收集答案，中间节点不收集'),
  sub='注意：只在叶子（i == n）处收集答案。中间节点不收集——例如中间的 [ ] 和最左叶子 [ ] 是同一个子集，否则会重复。')

# ---------- 代码 ----------
def code_scene(hl, narr, sub=None):
    def f(d):
        draw_code(d, CODE, 90, 95, size=19, lh=23, hl=hl, dim_others=True, width=1120)
    S('代码', narr, f, sub=sub)

code_scene([3, 4], '来看代码。和全排列一样，n 是数组长度，ans 收集所有答案，sol 是当前路径，也就是当前已经选中的元素。')
code_scene([6], '不同的是，backtrack 带一个参数 i，表示现在要对下标为 i 的元素 nums[i] 做决定。')
code_scene([7, 8, 9, 10], '终止条件：如果 i 等于 n，说明每个元素都已经做过决定，到达叶子，把 sol 的拷贝加入 ans，然后返回。')
code_scene([12, 13], '否则，先走第一个分支：不选 nums[i]。sol 不变，直接递归处理下一个元素，也就是 backtrack(i + 1)。')
code_scene([15, 16, 17], '然后走第二个分支：选 nums[i]。先把它加入 sol，做出决策，再递归处理下一个元素。')
code_scene([18], '最后，第二个分支返回后，要把 nums[i] 弹出，撤销决策，让 sol 恢复原样。这样返回上一层时，状态和进来时完全一样。')
code_scene([20, 21], '主程序从 i 等于 0 开始调用 backtrack，返回 ans。可以看到，这里没有 for 循环：每一层固定只有“不选”和“选”两个分支。下面一步一步跟踪执行过程。',
           sub='从 backtrack(0) 开始，返回 ans。注意：这里没有 for 循环，每一层固定只有“不选”和“选”两个分支。下面一步步跟踪执行。')

# ---------- 跟踪 ----------
frames = []
sol, ans = [], []
seen, leafs = set(), set()
mode = {'detail': True}

def snap(key, hl, narr, sub=None):
    frames.append(dict(key=key, sol=list(sol), ans=[list(a) for a in ans], seen=set(seen), leafs=set(leafs),
                       hl=hl, narr=narr, sub=sub))

def bt(key):
    i = len(key)
    seen.add(key)
    det = mode['detail']
    if i == len(NUMS):
        ans.append(sol[:])
        leafs.add(key)
        if det:
            snap(key, [8, 9, 10], f'i 等于 3，到达叶子！把 sol，也就是 {fmt(sol)}，加入 ans，然后返回。')
        else:
            snap(key, [8, 9, 10], f'到达叶子，{fmt(sol)} 加入 ans。')
        return
    v = NUMS[i]
    if det:
        if not key:
            snap(key, [8, 13], '调用 backtrack(0)：i 等于 0，不等于 n。先走“不选 1”的分支，sol 不变，调用 backtrack(1)。')
        else:
            snap(key, [8, 13], f'现在 i 等于 {i}，sol 是 {fmt(sol)}。先走“不选 {v}”的分支，直接调用 backtrack({i + 1})。')
    bt(key + (0,))
    sol.append(v)
    if mode['detail'] or key == ():
        snap(key, [16, 17], f'“不选 {v}”的分支返回了，回到 i 等于 {i} 这一层。接着走“选 {v}”的分支：把 {v} 加入 sol，sol 变成 {fmt(sol)}，调用 backtrack({i + 1})。')
    bt(key + (1,))
    sol.pop()
    if mode['detail'] or key == ():
        if key == ():
            snap(key, [18], '回到根节点，弹出 1，sol 恢复为空。到这里，整棵树都遍历完了。')
        else:
            snap(key, [18], f'“选 {v}”的分支也返回了：弹出 {v}，sol 恢复为 {fmt(sol)}。这一层的两个分支都走完，返回上一层。')
            if key == (0,):
                mode['detail'] = False
                frames[-1]['narr'] += '左半棵树，也就是不含 1 的 4 个子集都找到了。右半棵树的过程完全一样，我们加快速度。'

bt(())
frames.append(dict(frames[-1]))
frames[-1].update(key=None, hl=[21], narr='ans 中正好是 8 个子集。它的顺序和示例不同，因为我们先走“不选”的分支；但题目允许任意顺序，所以完全正确。',
                  sub='ans 中正好是 8 个子集。顺序与示例不同（因为先走“不选”分支），但题目允许任意顺序。')

def trace_scene(fr):
    def f(d):
        draw_code(d, CODE, 70, 92, size=15, lh=20.5, hl=fr['hl'], width=500)
        key = fr['key']
        st = {k: 'seen' for k in fr['seen']}
        for k in fr['leafs']:
            st[k] = 'leaf'
        chain = []
        if key is not None:
            st[key] = 'cur'
            chain = [key[:j] for j in range(len(key) + 1)]
        TREE_R.draw(d, state=st, path=chain, size=14, elabels=False)
        state_box(d, fr['sol'], fr['ans'], x0=640, x1=1260, extra=f'i = {len(key)}' if key is not None else '')
    S('跟踪执行  nums = [1,2,3]', fr['narr'], f, sub=fr['sub'])

for fr in frames:
    trace_scene(fr)

# ---------- 复杂度 ----------
def cx1(d):
    TREE_FULL.draw(d, size=20)
    for dd, cnt in enumerate([1, 2, 4, 8]):
        y = TREE_FULL.pos[next(k for k in order if len(k) == dd)][1]
        text(d, (40, y - 12), f'{cnt} 个', 22, YELLOW)
    text(d, (W // 2, 565), '节点总数 1 + 2 + 4 + 8 = 15 = 2^(n+1) − 1；叶子 2^n 个，每个拷贝 O(n)', 26, YELLOW, anchor='mm')
S('时间复杂度', '时间复杂度：每往下一层，节点数翻一倍，依次是 1、2、4、8，总节点数大约是 2 的 n 加 1 次方，是 O(2 的 n 次方) 级别。另外，每个叶子都要拷贝 sol，最多 n 个元素，所以总时间复杂度是 O(n 乘 2 的 n 次方)。', cx1,
  sub='时间复杂度：每层节点数翻倍 1、2、4、8……总节点约 2^(n+1)；每个叶子拷贝 sol 需 O(n)，所以总时间 O(n · 2^n)。')
S('空间复杂度', '空间方面：递归深度是 n，sol 最多 n 个元素，所以不计输出的话，额外空间是 O(n)。', bullets([
    '递归调用栈深度：n',
    'sol 长度：最多 n',
    ('额外空间：O(n)（不计输出 ans）', YELLOW),
], size=30, gap=70), sub='空间复杂度：递归深度 n，sol 最多 n 个元素，不计输出 ans，额外空间 O(n)。')

# ---------- 对比总结 ----------
def table(d):
    rows = [('', '全排列 (46)', '子集 (78)'),
            ('决策方式', '从剩余元素中选一个', '每个元素 选 / 不选'),
            ('每层分支', 'for 循环，跳过已用的数', '固定 2 个分支'),
            ('终止条件', 'len(sol) == n', 'i == n'),
            ('叶子个数', 'n!', '2^n'),
            ('时间复杂度', 'O(n · n!)', 'O(n · 2^n)')]
    xs = [70, 300, 780]
    for r, row in enumerate(rows):
        y = 100 + r * 70
        if r:
            d.line([60, y - 14, 1220, y - 14], fill=(60, 60, 70), width=1)
        for c, cell in enumerate(row):
            text(d, (xs[c], y), cell, 28, ORANGE if r == 0 or c == 0 else FG, bold=(r == 0))
S('对比：全排列 vs 子集', '最后把两道题放在一起对比。全排列是从剩余元素中选一个，用 for 循环并跳过已用的数；子集是对每个元素决定选或不选，每层固定两个分支。终止条件分别是 sol 长度等于 n，和 i 等于 n。叶子数分别是 n 的阶乘和 2 的 n 次方。', table,
  sub='全排列：从剩余元素中选，for 循环跳过已用的数，len(sol) == n 终止；子集：每个元素选/不选，固定 2 个分支，i == n 终止。')
S('小结', '两道题的骨架完全相同：到达终止条件就收集答案，记得存拷贝；然后做决策、递归、撤销决策。先走到底，再退回来。建议大家多写几遍，并亲手跟踪一遍执行过程，把这两个模板记牢。', bullets([
    ('回溯骨架：', BLUE),
    '    终止条件 → ans.append(sol[:])   （存拷贝）',
    '    做决策 → 递归 → 撤销决策',
    ('“递归是思想，回溯是技巧；先走到底，再退回来。”', YELLOW),
    ('建议：手写几遍 + 亲手跟踪一次执行过程', GREEN),
], size=30, gap=70), sub='小结：终止条件收集答案（存拷贝）；做决策 → 递归 → 撤销决策。先走到底，再退回来。建议多写几遍，亲手跟踪一次。')

if __name__ == '__main__':
    out = sys.argv[1]
    if len(sys.argv) > 2 and sys.argv[2] == 'preview':
        os.makedirs(out, exist_ok=True)
        for i, (im, n) in enumerate(scenes):
            im.save(f'{out}/p{i:03d}.png')
        print(len(scenes))
    else:
        build(scenes, sys.argv[2], out)

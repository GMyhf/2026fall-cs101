import sys
from common import *

CODE = '''class Solution:
    def permute(self, nums: List[int]) -> List[List[int]]:
        n = len(nums)
        ans, sol = [], []

        def backtrack():
            # 终止条件：当前排列已满
            if len(sol) == n:
                ans.append(sol[:])  # 拷贝一份再存
                return

            # 尝试每个尚未使用的数
            for x in nums:
                if x not in sol:    # 跳过已使用的数
                    sol.append(x)   # 选择
                    backtrack()     # 递归
                    sol.pop()       # 撤销选择（回溯）

        backtrack()
        return ans'''.split('\n')

NUMS = [1, 2, 3]
nodes, order = {}, []
def mk(path):
    order.append(path)
    nodes[path] = dict(label=fmt(path), parent=path[:-1] if path else None, depth=len(path),
                       elabel=f'选{path[-1]}' if path else '')
    for x in NUMS:
        if x not in path:
            mk(path + (x,))
mk(())

TREE_FULL = Tree(nodes, order, (90, 130, 1190, 520))
TREE_R = Tree(nodes, order, (650, 110, 1250, 400))

scenes = []
S = lambda *a, **k: scenes.append(slide(*a, **k))

# ---------- 开场 ----------
def title_body(d):
    text(d, (W // 2, 230), '全排列', 72, ORANGE, bold=True, anchor='mm')
    text(d, (W // 2, 320), 'LeetCode 46 · Permutations', 32, FG, anchor='mm')
    text(d, (W // 2, 390), '递归 + 回溯（backtracking）', 30, BLUE, anchor='mm')
S('', '大家好。这一讲我们用递归加回溯，来解决力扣第46题：全排列。这是回溯算法最经典的模板之一，务必熟练掌握。', title_body)

# ---------- 预备知识 ----------
def small_tree(box):
    nd = {'A': None, 'B': 'A', 'C': 'A', 'D': 'B', 'E': 'B', 'F': 'C'}
    dep = {'A': 0, 'B': 1, 'C': 1, 'D': 2, 'E': 2, 'F': 2}
    nodes_ = {k: dict(label=k, parent=p, depth=dep[k], elabel='') for k, p in nd.items()}
    return Tree(nodes_, ['A', 'B', 'D', 'E', 'C', 'F'], box)
ST = small_tree((140, 140, 640, 480))

def pre_tree(d):
    ST.draw(d, state={'A': 'seen', 'B': 'seen', 'C': 'seen', 'D': 'leaf', 'E': 'leaf', 'F': 'leaf'}, size=26)
    for dd, k in enumerate('ABD'):
        text(d, (40, ST.pos[k][1] - 14), f'第 {dd} 层', 20, DIM)
    ax, ay = ST.pos['A']
    text(d, (ax + 30, ay - 16), '← 根', 22, YELLOW)
    bx, by = ST.pos['B']
    text(d, (bx - 30, by - 16), '父节点 →', 20, YELLOW, anchor='ra')
    (dx, dy), (ex, ey) = ST.pos['D'], ST.pos['E']
    text(d, ((dx + ex) / 2, dy + 30), '子节点', 20, YELLOW, anchor='ma')
    fx, fy = ST.pos['F']
    text(d, (fx + 30, fy - 16), '← 叶子', 22, GREEN)
    text(d, ((ax + ST.pos['C'][0]) / 2 + 14, (ay + ST.pos['C'][1]) / 2 - 22), '边', 20, YELLOW)
    bullets([
        ('根：最上面的节点', FG),
        ('边：连接两个节点', FG),
        ('父节点 / 子节点：一条边的上 / 下两端', FG),
        ('叶子：没有子节点的节点', GREEN),
        ('层（深度）：根为第 0 层，往下依次 +1', FG),
        ('计算机里的树倒着画：根在上，叶在下', DIM),
    ], x=720, y=130, size=24, gap=58)(d)
S('预备知识 ①：树', '在正式开始之前，先补充一点预备知识。第一个概念是树。树由节点和连接节点的边组成。最上面的节点叫根。一条边连接的上下两个节点，上面的叫父节点，下面的叫子节点。没有子节点的节点叫叶子。从根往下数，根在第 0 层，它的子节点在第 1 层，依此类推，层数也叫深度。注意，计算机里的树通常是倒着画的：根在上，叶子在下。', pre_tree,
  sub='预备知识 ① 树：由节点和边组成。最上面的是根；一条边的上端是父节点、下端是子节点；没有子节点的是叶子；根在第 0 层，往下依次 +1。')

OUT = {'': None, 'T': '', 'S': '', 'TJ': 'T', 'TD': 'T', 'SJ': 'S', 'SD': 'S'}
OUT_LABEL = {'': '开始', 'T': '白T恤', 'S': '衬衫', 'TJ': '白T+牛仔裤', 'TD': '白T+短裤', 'SJ': '衬衫+牛仔裤', 'SD': '衬衫+短裤'}
OUT_E = {'T': '上衣：白T', 'S': '上衣：衬衫', 'TJ': '牛仔裤', 'TD': '短裤', 'SJ': '牛仔裤', 'SD': '短裤'}
OT = Tree({k: dict(label=OUT_LABEL[k], parent=p, depth=len(k), elabel=OUT_E.get(k, '')) for k, p in OUT.items()},
          ['', 'T', 'TJ', 'TD', 'S', 'SJ', 'SD'], (90, 140, 690, 470))
def pre_dtree(d):
    OT.draw(d, size=21, cjk=True)
    text(d, (390, 530), '2 种上衣 × 2 种裤子 = 4 种搭配（4 个叶子）', 24, YELLOW, anchor='mm')
    bullets([
        ('节点 = 做到一半的状态', FG),
        ('边 = 一次选择', FG),
        ('叶子 = 全部选完', GREEN),
        ('根 → 叶子的一条路径', BLUE),
        ('     = 一个完整方案', BLUE),
    ], x=780, y=150, size=26, gap=64)(d)
S('预备知识 ②：决策树', '第二个概念是决策树。它是一种特殊的树，用来表示一步一步做选择的过程。举个例子：出门穿衣服，先选上衣，有白T恤和衬衫两种；再选裤子，有牛仔裤和短裤两种。画出来就是这样：根节点表示还没开始选，第一层表示选好了上衣，第二层表示上衣和裤子都选好了。在决策树里，每个节点表示做到一半的状态，每条边表示一次选择，叶子表示全部选完，从根到叶子的一条路径，就是一个完整的方案。这里一共有 2 乘 2 等于 4 种搭配。', pre_dtree,
  sub='预备知识 ② 决策树：表示一步步做选择的过程。节点 = 做到一半的状态，边 = 一次选择，叶子 = 全部选完，根到叶子的路径 = 一个完整方案。')

def badge(d, k, n, tree=ST, col=BLUE):
    x, y = tree.pos[k]
    d.ellipse([x + 20, y - 44, x + 50, y - 14], fill=col)
    d.text((x + 35, y - 29), str(n), font=font('monob', 18), fill=BG, anchor='mm')
def pre_dfs(d):
    order_ = 'ABDECF'
    ST.draw(d, state={k: 'seen' for k in order_}, size=26)
    for i, k in enumerate(order_, 1):
        badge(d, k, i)
    text(d, (390, 520), '蓝色数字 = DFS 访问顺序', 22, BLUE, anchor='mm')
    bullets([
        ('像走迷宫：', YELLOW),
        '· 沿一条路走到底',
        '· 到尽头就退回最近的岔路口',
        '· 换一条没走过的路继续',
        ('DFS：A → B → D →(退回 B)→ E', BLUE),
        ('      →(退回 A)→ C → F', BLUE),
        ('对比 BFS（一层一层）：A B C D E F', DIM),
    ], x=700, y=110, size=24, gap=56)(d)
S('预备知识 ③：DFS', '第三个概念是深度优先搜索，英文缩写 DFS。它是一种按顺序访问树上所有节点的方法，就像走迷宫：沿着一条路一直走到底；走到尽头，就退回到最近的岔路口，换一条没走过的路继续。在这棵树上，DFS 先走 A、B、D；D 是叶子，退回 B，走 E；E 也是叶子，B 下面都走完了，退回 A，再走 C 和 F。所以访问顺序是 A B D E C F。作为对比，另一种方法叫广度优先搜索，BFS，它是一层一层地走，顺序是 A B C D E F。这两讲只用到 DFS。', pre_dfs,
  sub='预备知识 ③ DFS（深度优先搜索）：像走迷宫，一条路走到底，到尽头就退回最近的岔路口换路。顺序 A B D E C F；对比 BFS 一层一层：A B C D E F。')

RDFS = '''def dfs(node):
    visit(node)                  # 访问当前节点
    for child in node.children:
        dfs(child)               # 调用 = 往下走一层
    # 函数结束返回 = 退回上一层'''.split('\n')
def pre_rec(d):
    draw_code(d, RDFS, 90, 110, size=19, lh=32, hl=(4, 5), width=640)
    text(d, (70, 300), '走到 D 时的调用栈：', 24, FG)
    for i, s in enumerate(['dfs(A)', 'dfs(B)', 'dfs(D)  ← 当前']):
        y = 470 - i * 52
        d.rounded_rectangle([90, y - 22, 400, y + 22], 8, outline=ORANGE if i < 2 else YELLOW, width=2, fill=(40, 40, 46))
        mono_mixed(d, 110, y - 12, s, 20, YELLOW if i == 2 else FG)
    text(d, (430, 420), '栈里的调用', 22, YELLOW)
    text(d, (430, 452), '= 根到当前节点的路径', 22, YELLOW)
    small = small_tree((820, 170, 1180, 440))
    small.draw(d, state={'A': 'seen', 'B': 'seen', 'D': 'cur'}, path=['A', 'B', 'D'], size=24)
    text(d, (1000, 520), '路径 A → B → D', 24, BLUE, anchor='mm')
S('预备知识 ④：用递归实现 DFS', '最后，怎么用代码实现 DFS？用递归最自然。dfs 函数先访问当前节点，再对每个子节点递归调用 dfs。调用一次 dfs，就是往下走一层；函数执行完返回，就是退回上一层，回到岔路口，接着循环处理下一个子节点。比如走到 D 时，调用栈里依次是 dfs(A)、dfs(B)、dfs(D)，恰好就是从根到当前节点的路径。待会儿的 backtrack 函数，就是在决策树上这样做 DFS。好，预备知识就到这里，下面来看题目。', pre_rec,
  sub='预备知识 ④ 递归实现 DFS：调用一次 = 往下走一层，返回 = 退回上一层。走到 D 时调用栈是 dfs(A)、dfs(B)、dfs(D)，正是根到当前节点的路径。')

S('题目', '题目是：给定一个不含重复数字的数组 nums，返回它所有可能的全排列，可以按任意顺序返回。', bullets([
    '给定一个 不含重复数字 的数组 nums，返回其 所有可能的全排列。',
    '可以 按任意顺序 返回答案。',
    ('示例 1：nums = [1,2,3]', BLUE),
    ('   输出：[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]', GREEN),
    ('示例 2：nums = [0,1]   →  [[0,1],[1,0]]', BLUE),
    ('示例 3：nums = [1]     →  [[1]]', BLUE),
    ('提示：1 <= n <= 6，元素互不相同', DIM),
], size=26, gap=58))

S('题目', '比如 nums 等于 1、2、3 时，一共有 6 种排列。数据范围很小，n 最多只有 6，所以直接把所有排列都枚举出来就可以。', bullets([
    ('示例 1：nums = [1,2,3]', BLUE),
    ('   输出：[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]', GREEN),
    '一共 6 种排列',
    ('n ≤ 6  →  最多 6! = 720 种，直接全部枚举即可', YELLOW),
], size=28, gap=64))

def count_body(d):
    for i, (c, lab) in enumerate([('3', '第 1 个位置'), ('2', '第 2 个位置'), ('1', '第 3 个位置')]):
        x = 300 + i * 260
        d.rounded_rectangle([x - 90, 170, x + 90, 330], 14, outline=ORANGE, width=3)
        text(d, (x, 235), c, 64, ORANGE, bold=True, anchor='mm')
        text(d, (x, 300), '种选择', 22, DIM, anchor='mm')
        text(d, (x, 360), lab, 24, FG, anchor='mm')
        if i < 2:
            text(d, (x + 130, 235), '×', 48, FG, anchor='mm')
    text(d, (W // 2, 450), '3 × 2 × 1 = 3! = 6        一般地：n 个不同的数共有 n! 种排列', 30, YELLOW, anchor='mm')
S('为什么是 6 种？', '为什么是 6 种？第一个位置有 3 种选法；选完之后，第二个位置只剩 2 种；最后一个位置只剩 1 种。所以一共是 3 乘 2 乘 1，也就是 3 的阶乘，等于 6。一般地，n 个不同的数，共有 n 的阶乘种排列。', count_body,
  sub='为什么是 6 种？第 1 个位置 3 种选法，第 2 个位置剩 2 种，第 3 个位置剩 1 种：3 × 2 × 1 = 3! = 6。一般地，n 个不同的数共有 n! 种排列。')

# ---------- 决策树 ----------
def tree_upto(depth, note=None):
    def f(d):
        vis = {k for k in nodes if len(k) <= depth}
        TREE_FULL.draw(d, visible=vis, size=22)
        text(d, (W - 60, 95), 'nums = [1,2,3]', 24, DIM, anchor='ra')
        for dd in range(depth + 1):
            y = TREE_FULL.pos[order[0] if dd == 0 else next(k for k in order if len(k) == dd)][1]
            text(d, (40, y - 12), ['根', '第1层', '第2层', '第3层'][dd], 20, DIM)
        if note:
            text(d, (W // 2, 560), note, 26, YELLOW, anchor='mm')
    return f

S('决策树', '我们把“逐个位置做选择”的过程画成一棵决策树。根节点是空列表，表示还什么都没有选。', tree_upto(0))
S('决策树', '第一层：从 1、2、3 中任选一个放在第一个位置，得到三个分支：1、2、3。', tree_upto(1))
S('决策树', '第二层：在剩下的数里再选一个。比如第一个选了 1，那么第二个只能选 2 或 3；第一个选了 2，第二个只能选 1 或 3。', tree_upto(2))
S('决策树', '第三层：只剩最后一个数，别无选择。最底层的 6 个叶子节点，从左到右，恰好就是全部 6 个排列。', tree_upto(3, '叶子 = 答案：共 3! = 6 个'))
S('决策树', '所以，我们的任务就是：用刚才介绍的深度优先搜索 DFS，把这棵树从左到右走一遍，每走到一个叶子，就把从根到叶子的路径记录下来。', tree_upto(3, '用 DFS 遍历整棵树，每到一个叶子就记录路径'),
  sub='任务：用深度优先搜索（DFS）把这棵树从左到右走一遍，每到一个叶子，就把从根到叶子的路径记录下来。')
S('决策树', '为此需要两个变量：sol 表示当前这条路径，也就是正在构造的排列；ans 用来收集所有完整的排列。', tree_upto(3, 'sol：当前路径（正在构造的排列）    ans：所有答案'))

# ---------- 代码讲解 ----------
def code_scene(hl, narr, sub=None, side=None):
    def f(d):
        draw_code(d, CODE, 90, 100, size=19, lh=24, hl=hl, dim_others=True, width=1120)
        if side:
            side(d)
    S('代码', narr, f, sub=sub)

code_scene([3, 4], '下面来看代码。n 是数组长度；ans 保存所有答案；sol 是当前路径。两者一开始都是空列表。')
code_scene([6], 'backtrack 函数负责 DFS。它定义在 permute 内部，可以直接使用外层的 nums、sol 和 ans，所以不需要参数。')
code_scene([7, 8, 9, 10], '首先是终止条件：如果 sol 的长度等于 n，说明已经走到叶子，得到了一个完整的排列，把它存进 ans，然后 return。')
code_scene([9], '注意这里存的是 sol 的拷贝，也就是 sol 冒号切片。如果直接存 sol 本身，ans 里放的都是同一个列表对象；回溯结束后它会被清空，最后得到的就全是空列表。',
           sub='注意：存的是 sol 的拷贝 sol[:]。若直接 ans.append(sol)，ans 里放的都是同一个列表对象，回溯结束后它被清空，结果全是空列表 [ ]。')
code_scene([13, 14], '如果还没满，就遍历 nums 中的每一个数 x。如果 x 已经在 sol 里，说明这个数用过了，跳过它。')
code_scene([15, 16, 17], '对于还没用过的 x，就是回溯的三部曲：第一，做选择，把 x 加入 sol；第二，递归，进入下一层；第三，递归返回后撤销选择，把 x 弹出。这一步弹出，就是“回溯”：退回到选择之前的状态，好去尝试下一个数。',
           sub='回溯三部曲：① 做选择 sol.append(x)　② 递归 backtrack()　③ 撤销选择 sol.pop() —— 退回选择前的状态，再去尝试下一个数。')
code_scene([19, 20], '最后，从空路径开始调用一次 backtrack，返回 ans 即可。下面我们结合决策树，一步一步跟踪代码的执行过程。')

# ---------- 执行跟踪 ----------
frames = []
sol, ans = [], []
seen, leafs = set(), set()
mode = {'detail': True}

def snap(path, hl, narr, sub=None):
    frames.append(dict(path=path, sol=list(sol), ans=[list(a) for a in ans], seen=set(seen), leafs=set(leafs),
                       hl=hl, narr=narr, sub=sub))

def bt(path):
    seen.add(path)
    det = mode['detail']
    if len(sol) == len(NUMS):
        ans.append(sol[:])
        leafs.add(path)
        if det:
            snap(path, [8, 9, 10], f'现在 sol 是 {fmt(sol)}，长度等于 3，到达叶子！把它的拷贝加入 ans，然后 return 返回上一层。')
        else:
            snap(path, [8, 9, 10], f'得到 {fmt(sol)}，加入 ans。')
        return
    if det:
        if not path:
            snap(path, [8, 13], '从根节点开始：sol 为空，长度不等于 3，进入 for 循环。')
        else:
            snap(path, [8, 13], f'进入下一层：sol 是 {fmt(sol)}，长度为 {len(sol)}，还没满，进入 for 循环，从头尝试每个数。')
    for x in NUMS:
        if x in sol:
            if mode['detail']:
                snap(path, [14], f'{x} 已经在 sol 中，跳过。')
            continue
        sol.append(x)
        if mode['detail']:
            snap(path, [15, 16], f'{x} 还没用过：把 {x} 加入 sol，sol 变成 {fmt(sol)}，然后递归调用 backtrack。')
        bt(path + (x,))
        sol.pop()
        if mode['detail']:
            if path == ():
                snap(path, [17], '回到根节点，弹出 1，sol 恢复为空。以 1 开头的两个排列都找到了。接下来，循环继续尝试 2 和 3，过程完全一样，我们加快速度。')
                mode['detail'] = False
            else:
                snap(path, [17], f'从下一层返回后，执行 pop，弹出 {x}，sol 恢复为 {fmt(sol)}。这就是回溯。')
    if mode['detail'] and path:
        snap(path, [13], f'for 循环结束，{fmt(path)} 这一层的所有选择都试过了，函数返回上一层。')

bt(())
frames.append(dict(frames[-1]))
frames[-1].update(path=None, hl=[20], narr='整棵树遍历完毕，ans 中正好是 6 个全排列，顺序与示例一致。返回 ans。')

def trace_scene(fr):
    def f(d):
        draw_code(d, CODE, 70, 95, size=15, lh=21, hl=fr['hl'], width=500)
        path = fr['path']
        st = {k: 'seen' for k in fr['seen']}
        for k in fr['leafs']:
            st[k] = 'leaf'
        chain = []
        if path is not None:
            st[path] = 'cur'
            chain = [path[:i] for i in range(len(path) + 1)]
        TREE_R.draw(d, state=st, path=chain, size=15, elabels=False)
        state_box(d, fr['sol'], fr['ans'], extra=f'递归深度 {len(path)}' if path is not None else '')
    S('跟踪执行  nums = [1,2,3]', fr['narr'], f, sub=fr['sub'])

for fr in frames:
    trace_scene(fr)

# ---------- 复杂度 ----------
def cx1(d):
    TREE_FULL.draw(d, size=20)
    d.line([90, 545, 1190, 545], fill=BLUE, width=3)
    text(d, (W // 2, 575), '叶子：n! 个，每个叶子拷贝 sol[:] 需 O(n)', 26, YELLOW, anchor='mm')
S('时间复杂度', '再来分析时间复杂度。叶子节点一共有 n 的阶乘个，每到一个叶子，都要拷贝一次长度为 n 的 sol，仅这一项就是 n 乘 n 的阶乘。', cx1,
  sub='时间复杂度：叶子共 n! 个，每到一个叶子都要拷贝长度为 n 的 sol，仅这一项就是 O(n · n!)。')

TREE_CNT = Tree(nodes, order, (300, 120, 1220, 500))
def cx2(d):
    TREE_CNT.draw(d, size=19, elabels=False)
    for dd, s in enumerate(['根：1 个', '选 1 个数：3 个', '选 2 个数：3×2 = 6 个', '选 3 个数：3×2×1 = 6 个']):
        y = TREE_CNT.pos[next(k for k in order if len(k) == dd)][1]
        text(d, (30, y - 14), s, 21, YELLOW)
    text(d, (W // 2, 565), '节点总数 = 1 + 3 + 6 + 6 = 16', 28, YELLOW, anchor='mm')
S('节点总数有多少？', '那整棵树一共有多少个节点？以 n 等于 3 为例，逐层数一数：根节点 1 个；第一层选了 1 个数，有 3 种；第二层按顺序选了 2 个数，有 3 乘 2 等于 6 种；第三层就是叶子，3 乘 2 乘 1 等于 6 种。加起来一共 16 个节点。', cx2,
  sub='以 n = 3 为例逐层数：根 1 个；选 1 个数 3 个；选 2 个数 3×2 = 6 个；选 3 个数（叶子）3×2×1 = 6 个。共 16 个节点。')

def cx_up(d):
    rows = [('层', 'n = 3', '一般形式'),
            ('第3层（叶子）', '6', 'n! / 0!'),
            ('第2层', '6 ÷ 1 = 6', 'n! / 1!'),
            ('第1层', '6 ÷ 2 = 3', 'n! / 2!'),
            ('根', '3 ÷ 3 = 1', 'n! / 3!   …   一般到 n! / n! = 1')]
    xs = [90, 380, 640]
    for r, row in enumerate(rows):
        y = 100 + r * 62
        if r:
            d.line([80, y - 12, 1200, y - 12], fill=(60, 60, 70), width=1)
        for c, cell in enumerate(row):
            text(d, (xs[c], y), cell, 27, ORANGE if r == 0 or c == 0 else FG, bold=(r == 0))
    text(d, (90, 440), '每往上一层，少选一个数，节点数依次再除以 1、2、3、…', 26, FG)
    text(d, (90, 500), '节点总数 = n! × ( 1/0! + 1/1! + 1/2! + … + 1/n! )', 30, YELLOW)
S('从叶子往上看', '换个角度，从叶子往上看。叶子有 n 的阶乘个。往上一层，少选了最后一个数，节点数除以 1；再往上一层，再除以 2；再往上，再除以 3。所以从叶子往上，各层节点数依次是 n 的阶乘除以 0 的阶乘、除以 1 的阶乘、除以 2 的阶乘，一直到除以 n 的阶乘，也就是根节点的 1 个。把各层加起来，节点总数等于 n 的阶乘，乘以括号里的这个和。', cx_up,
  sub='从叶子往上看：叶子 n! 个，每往上一层节点数再除以 1、2、3……所以节点总数 = n! × (1/0! + 1/1! + 1/2! + … + 1/n!)。')

def cx_e(d):
    terms = ['1/0!', '1/1!', '1/2!', '1/3!', '1/4!', '1/5!']
    sums = [1, 2, 2.5, 2.667, 2.708, 2.717]
    text(d, (90, 95), '括号里的和，逐项累加：', 26, FG)
    for i, (t, s) in enumerate(zip(terms, sums)):
        x = 110 + i * 170
        text(d, (x, 150), ('+ ' if i else '') + t, 26, BLUE)
        text(d, (x, 195), f'= {s:g}', 26, GREEN)
    text(d, (110 + 6 * 170 - 40, 195), '→ e ≈ 2.718', 26, YELLOW)
    text(d, (90, 280), '无限加下去正好是 e；只加到 1/n!，所以一定 < e', 28, FG)
    text(d, (90, 340), '验算 n = 3：6 × (1 + 1 + 1/2 + 1/6) = 6 × 2.667 = 16  <  e × 6 ≈ 16.3', 26, FG)
    text(d, (90, 420), '节点总数 < e · n!，只是叶子数 n! 的常数倍', 30, YELLOW)
    text(d, (90, 480), '内部节点循环 n 次、叶子拷贝 n 个数 → 每个节点 O(n)', 28, YELLOW)
    text(d, (90, 530), '总时间 O(n · n!)（前提：判断是否已用为 O(1)）', 28, YELLOW)
S('为什么小于 e · n!？', '括号里的和是 1 加 1 加二分之一，加六分之一，加二十四分之一……越加越接近 2.718，也就是自然常数 e。这个级数无限加下去正好等于 e，而我们只加到 n 的阶乘分之一，所以一定小于 e。验算一下 n 等于 3：6 乘 2.667 等于 16，确实小于 e 乘 6，约 16.3。结论是：节点总数不超过 e 乘 n 的阶乘，只是叶子数的常数倍。那每个节点做多少工作呢？内部节点要把 nums 的 n 个数都循环一遍，已经用过的也要看一眼再跳过；叶子则要拷贝 n 个元素。所以每个节点都是 O(n)，前提是判断一个数是否用过只要 O(1)。因此总时间是 O(n 乘 n 的阶乘)。', cx_e,
  sub='1 + 1 + 1/2! + 1/3! + … 无限加下去等于 e ≈ 2.718，只加到 1/n! 所以 < e。节点总数 < e·n!。内部节点循环 n 次、叶子拷贝 n 个数，每个节点 O(n)（判断已用为 O(1) 时），总时间 O(n · n!)。')

USED = '''def backtrack():
    if len(sol) == n:
        ans.append(sol[:])
        return
    for i in range(n):
        if not used[i]:            # O(1) 判断
            used[i] = True
            sol.append(nums[i])
            backtrack()
            sol.pop()
            used[i] = False        # 撤销标记'''.split('\n')
def cx3(d):
    text(d, (80, 95), '细节：x not in sol 要扫描 sol，本身是 O(n)，因此这份代码严格来说是 O(n² · n!)。', 24, FG)
    text(d, (80, 135), '改用布尔数组 used 标记，判断降为 O(1)，即可做到 O(n · n!)：', 24, FG)
    draw_code(d, USED, 120, 190, size=19, lh=26, hl=(6, 7, 11), width=700)
    text(d, (880, 300), 'used = [False] * n', 22, BLUE)
    text(d, (880, 340), '（n ≤ 6 时两种写法都很快）', 22, DIM)
S('时间复杂度', '这里有一个细节：代码里用 x not in sol 判断是否用过，它要扫描整个 sol，本身就是 O(n)，所以这份代码严格来说是 n 平方乘 n 的阶乘。如果改用一个布尔数组 used 来标记，判断就只要 O(1)，复杂度就是 O(n 乘 n 的阶乘)。当然，n 最多是 6，两种写法都足够快。', cx3,
  sub='细节：x not in sol 本身是 O(n)，严格来说这份代码是 O(n²·n!)；改用布尔数组 used 标记可做到 O(n·n!)。n ≤ 6 时两种写法都足够快。')

S('空间复杂度', '空间方面：递归深度为 n，sol 的长度也最多为 n，所以除去存放答案的 ans 之外，额外空间是 O(n)。', bullets([
    '递归调用栈深度：n',
    'sol 长度：最多 n',
    ('额外空间：O(n)（不计输出 ans）', YELLOW),
], size=30, gap=70), sub='空间复杂度：递归深度 n，sol 长度最多 n，不计输出 ans，额外空间 O(n)。')

# ---------- 回溯与 DFS ----------
def dfs_body(d):
    text(d, (W // 2, 120), '回溯 = 在决策树上做 DFS + 退回时撤销选择', 32, YELLOW, bold=True, anchor='mm')
    for i, (t, lines) in enumerate([
            ('DFS：讲的是遍历顺序', ['沿一条路走到底', '走不下去就退回上一个岔路口', '换下一条路', '适用于任何图或树']),
            ('回溯：讲的是状态怎么维护', ['只用一份共享的 sol', '往下走：修改（append）', '退回来：恢复原样（pop）', '下一条路不受残留状态污染'])]):
        x0 = 90 + i * 560
        d.rounded_rectangle([x0, 175, x0 + 540, 500], 14, outline=BLUE if i == 0 else ORANGE, width=3)
        text(d, (x0 + 24, 195), t, 28, BLUE if i == 0 else ORANGE, bold=True)
        for j, l in enumerate(lines):
            text(d, (x0 + 40, 260 + j * 56), '· ' + l, 26, FG)
S('backtrack 就是 DFS 吗？', '学到这里，可能有同学会问：backtrack 就是 DFS 吗？可以这么理解：回溯，就是在决策树上做 DFS，再加上退回时撤销选择。两个词描述的是同一件事的不同侧面：DFS 讲的是遍历顺序，沿一条路走到底，走不下去就退回上一个岔路口，换下一条路；回溯讲的是状态怎么维护，整个搜索只用一份共享的 sol，往下走时修改它，退回来时把它恢复原样。另外，这棵决策树并没有真的建出来，而是代码边走边生成的。', dfs_body,
  sub='backtrack 就是 DFS 吗？回溯 = 在决策树上做 DFS + 退回时撤销选择。DFS 讲遍历顺序；回溯讲状态维护：共享一份 sol，下去时修改、回来时恢复。')

BT2 = '''def backtrack():          # 显式回溯
    if len(sol) == n:
        ans.append(sol[:])    # 要拷贝
        return
    for x in nums:
        if x not in sol:
            sol.append(x)
            backtrack()
            sol.pop()         # 手动撤销'''.split('\n')
DFS2 = '''def dfs(path):            # 隐式回溯
    if len(path) == n:
        ans.append(path)      # 已是新列表
        return
    for x in nums:
        if x not in path:
            dfs(path + [x])   # 传新列表
            # 返回后自动恢复'''.split('\n')
def cmp_body(d):
    text(d, (90, 92), '显式回溯：共享一份 sol，手动 pop', 24, ORANGE)
    draw_code(d, BT2, 110, 135, size=18, lh=27, hl=(3, 9), width=500)
    text(d, (680, 92), '隐式回溯：每层新列表，返回即恢复', 24, BLUE)
    draw_code(d, DFS2, 700, 135, size=18, lh=27, hl=(3, 7, 8), width=540)
    text(d, (90, 395), '右边并非没有回溯：调用方的 path 从未被改，下一层返回时栈帧丢弃，状态自动恢复。', 24, FG)
    text(d, (90, 440), '代价：右边每层都要复制列表（path + [x]）；左边原地修改、原地恢复，更省。', 24, YELLOW)
    text(d, (90, 485), '规律：传值的状态自动恢复；共享且原地修改的状态（sol、used）要手动撤销。', 24, GREEN)
S('对比：显式回溯 vs 隐式回溯', '对比一下另一种写法。右边每层把 path 加上 x，生成一个新列表传下去。下一层拿到的是它自己的新列表，调用方手里的 path 从头到尾没有被改过；下一层返回时，它的栈帧连同那个新列表一起丢掉，状态自然就恢复了。所以右边并不是没有回溯，而是撤销这一步由函数返回自动完成，可以叫做隐式回溯；左边手动 pop 的，叫做显式回溯。两者结果相同，遍历顺序也相同。代价是右边每层都要复制列表，多花时间和内存；左边原地修改、原地恢复，更省。一个简单的规律是：通过参数传值的状态，会自动恢复；共享并且原地修改的状态，比如 sol 和 used 数组，就要手动撤销。', cmp_body,
  sub='隐式回溯：dfs(path + [x]) 传新列表，返回时栈帧丢弃、状态自动恢复；左边手动 pop 是显式回溯。规律：传值的状态自动恢复，共享并原地修改的状态要手动撤销。')

def visited_body(d):
    for i, (t, c, lines) in enumerate([
            ('图上的 DFS', BLUE, ['用 visited 记录走过的节点', '标记后不再取消', '目的：防止重复访问同一节点']),
            ('回溯（决策树）', ORANGE, ['标记：sol 中是否有 x，或 used[i]', '退回时要取消标记', '换一条路后，这个数又可以用了'])]):
        x0 = 90 + i * 560
        d.rounded_rectangle([x0, 100, x0 + 540, 380], 14, outline=c, width=3)
        text(d, (x0 + 24, 120), t, 28, c, bold=True)
        for j, l in enumerate(lines):
            text(d, (x0 + 40, 190 + j * 58), '· ' + l, 25, FG)
    text(d, (90, 430), '原因：回溯走的是树，同一个状态不会从两条不同的路到达，不需要永久的 visited。', 25, YELLOW)
S('对比：图上 DFS 的 visited', '最后再说和图上 DFS 的区别。图上做 DFS，通常用 visited 记录走过的节点，标记之后就不再取消，防止重复访问同一个节点。回溯走的是树，同一个状态不会从两条不同的路到达；它的标记，比如 sol 中有没有 x，或者 used 数组，在退回时要取消，因为换一条路以后，这个数又可以用了。', visited_body,
  sub='图上 DFS：visited 标记后不取消，防止重复访问。回溯：走的是树，标记（sol 中是否有 x / used[i]）退回时要取消，换一条路后这个数又能用。')

# ---------- 总结 ----------
S('小结：回溯模板', '最后总结一下回溯模板：第一，终止条件，到达叶子就收集答案，记得存拷贝；第二，遍历当前所有可选的选择；第三，做选择、递归、撤销选择。一句话：先走到底，再退回来。下一讲，我们用同样的思路来解决子集问题。', bullets([
    ('def backtrack():', BLUE),
    '    if 满足终止条件:  ans.append(sol[:]); return     # 收集答案（存拷贝）',
    '    for 选择 in 当前可选的选择:',
    ('        做选择        # sol.append(x)', ORANGE),
    ('        backtrack()   # 递归', ORANGE),
    ('        撤销选择      # sol.pop()', ORANGE),
    ('“递归是思想，回溯是技巧；先走到底，再退回来。”', YELLOW),
], size=26, gap=58),
  sub='小结：① 终止条件——收集答案（存拷贝）② 遍历所有可选的选择 ③ 做选择 → 递归 → 撤销选择。先走到底，再退回来。下一讲：子集。')

if __name__ == '__main__':
    out = sys.argv[1]
    if len(sys.argv) > 2 and sys.argv[2] == 'preview':
        os.makedirs(out, exist_ok=True)
        for i, (im, n) in enumerate(scenes):
            im.save(f'{out}/p{i:03d}.png')
        print(len(scenes))
    else:
        build(scenes, sys.argv[2], out)

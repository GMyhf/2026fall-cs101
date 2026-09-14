# -*- coding: utf-8 -*-
"""第2周 虚拟机、Shell 与开发环境"""

META = {
    'title': '第2周　虚拟机、Shell 与开发环境',
    'subtitle': '操作系统 · 虚拟化与 xLab · Linux Shell · 开发环境 · 编程语法练习',
    'footer': '计算概论（B） · 第2周 · 闫宏飞 · 2026 Fall',
    'info': ['北京大学　《计算概论（B）》',
             '主题与学习重点：虚拟机、Shell 与开发环境；开始编程语法练习。'],
}

SLIDES = [
    ('bullets', '为什么计概课要讲操作系统和 Shell', [
        '**评测机跑的是 Linux** —— TLE / MLE / RE 时要知道往哪一层看',
        '**命令行是程序员的通用接口** —— 装包、跑脚本、批处理、连服务器',
        '**第 15 周要跑神经网络** —— 本地跑不动的实验放到云主机上',
    ]),

    ('section', '第 1 节', '操作系统与虚拟化'),

    ('table', '三大操作系统', [
        ['', 'Windows', 'macOS', 'Linux'],
        ['内核', 'NT', 'Darwin（类 Unix）', 'Linux'],
        ['默认 Shell', 'PowerShell / cmd', 'zsh', 'bash / zsh'],
        ['包管理', 'winget / choco', 'Homebrew', 'apt / yum'],
        ['路径分隔符', '\\', '/', '/'],
        ['换行符', 'CR LF', 'LF', 'LF'],
        ['本课定位', '主力开发机', '主力开发机', '评测机 / 云主机'],
    ], '换行符差异会咬人：养成 line.strip() 的习惯'),

    ('ascii', '虚拟机的层次', r"""
   +----------+ +----------+ +----------+
   |  Guest   | |  Guest   | |  Guest   |   <- 虚拟机里的操作系统
   |  Linux   | |  Linux   | | Windows  |
   +----------+ +----------+ +----------+
   +------------------------------------+
   |       Hypervisor 虚拟机监视器        |   <- VirtualBox / VMware / KVM
   +------------------------------------+
   +------------------------------------+
   |          宿主机操作系统              |
   +------------------------------------+
   +------------------------------------+
   |             物理硬件                 |
   +------------------------------------+
""", '虚拟机：隔离、一致、可迁移'),

    ('two', '虚拟机 vs 容器',
     '虚拟机', ['模拟整台计算机', '有自己的内核', '启动慢、开销大', '能跑不同内核的系统'],
     '容器 Docker', ['共享宿主机内核', '只隔离文件系统与进程', '启动快、开销小',
                     '不能跑不同内核']),

    ('code', '云主机：连接与首次配置', '''ssh username@ip_address           # 口令登录
ssh -i ~/.ssh/id_rsa user@ip      # 密钥登录（推荐）

sudo apt update && sudo apt upgrade -y      # 1) 更新系统

ssh-keygen -t ed25519 -C "you@pku.edu.cn"   # 2) 生成并上传公钥（本机执行）
ssh-copy-id user@ip

scp local_file.py user@ip:~/       # 3) 传文件：本机 -> 云主机
scp user@ip:~/result.txt ./        #          云主机 -> 本机
''', '学校云计算实验平台：clab.pku.edu.cn；本课程的实验环境是 xLab（第 2 节）'),

    ('code', '交换分区：内存不够时的救命稻草', '''sudo fallocate -l 4G /swapfile        # 建 4GB 文件
sudo chmod 600 /swapfile
sudo mkswap /swapfile                 # 格式化为交换空间
sudo swapon /swapfile                 # 启用
free -h                               # 确认

echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab   # 开机自动挂载
''', 'swap 在磁盘上，比内存慢几个数量级；它防的是"崩溃"，不是"变慢"'),

    ('section', '第 2 节', 'xLab：本地连接课程实验环境',
     '课程提供 Linux 节点，本机通过 SSH 连接和编辑远程代码'),

    ('table', 'xLab：本机、终端、SSH 与 VS Code', [
        ['工具', '在哪里打开', '用来做什么'],
        ['本机终端', 'PowerShell / Terminal', '输入命令、查看输出'],
        ['SSH 客户端', '在本机终端执行 ssh', '验证身份，连接远程节点'],
        ['VS Code + Remote-SSH 扩展', '在自己的电脑上打开', '通过 SSH 编辑远程项目'],
    ], '今天跟着完成：密钥 → SSH 登录节点 → VS Code 远程运行程序。连接后，命令在远程节点执行'),

    ('code', '公钥登录：在本机生成并读取 SSH 密钥', '''ssh -V                       # 确认本机有 SSH 客户端
ssh-keygen -t ed25519        # 生成密钥：默认路径按 Enter，口令直接回车两次
                             # 若提示 Overwrite，输入 n，保留已有密钥
cat ~/.ssh/id_ed25519.pub    # 读取公钥，复制输出的一整行

# ~/.ssh/id_ed25519        私钥：留在自己电脑，不上传、不发给别人
# ~/.ssh/id_ed25519.pub    公钥：添加到 xLab，节点用它验证登录者
''', '校园统一认证登录 xLab 网站；SSH 公钥认证登录 Linux 节点'),

    ('image', '登录 xLab，找到课程', 'assets/w02/xlab-login.png', [
        '打开 **xlab.pku.edu.cn**',
        '北京大学统一身份认证登录',
        '在「我的节点」找到「计算概论B」',
    ], '看不到课程：向助教确认名单；xLab 在校园网内，校外需先连北大 VPN'),

    ('image', '把本机公钥添加到 xLab', 'assets/w02/xlab-pubkey.png', [
        '本机终端 `cat ~/.ssh/id_ed25519.pub`，复制整行公钥',
        '右上角账户 → SSH 公钥，填写名称并粘贴公钥',
        '点击「添加公钥」',
    ]),

    ('image', '新建课程节点', 'assets/w02/xlab-new-node.png', [
        '名称：默认 `ic-b-yan-lab`',
        '镜像：选择 `cs101-rc0-ubuntu`',
        '规格保留默认，数据盘留空',
        '勾选「立即启动」，等待「运行中」',
    ], '账户里已添加的公钥会用于节点登录；已有节点的同学直接继续连接'),

    ('image', '节点卡片：本地连接入口', 'assets/w02/xlab-node-card.png', (),
     '复制卡片上的 SSH 命令到本机终端；装好 Remote-SSH 后，点「打开 VS Code」'),

    ('code', '从本机终端 SSH 登录节点', '''ssh -p <端口> <用户名>@<课程IP>   # 直接复制节点卡片上自己的完整命令
# Are you sure ...?  输入 yes 回车；出现远程提示符 = 连接成功

whoami                            # 当前用户
pwd                               # 当前目录
uname -m                          # CPU 架构
mkdir -p ~/ic-b-2026/xlab-intro-demo
cd ~/ic-b-2026/xlab-intro-demo
ls
exit                              # 退出 SSH，回到本机终端
''', '尖括号是说明字段，实际操作直接复制自己卡片中的命令'),

    ('bullets', '本地 VS Code：Remote-SSH 连接同一个节点', [
        '本机安装 VS Code 和 Microsoft 的 **Remote-SSH** 扩展',
        'F1 → `Remote-SSH: Add New SSH Host...`，粘贴刚才成功的 ssh 命令并保存',
        'F1 → `Remote-SSH: Connect to Host...`，选刚添加的主机；询问系统时选 Linux',
        '`File > Open Folder` 打开远程练习目录 `~/ic-b-2026/xlab-intro-demo`',
        '以后可在节点卡片直接点「打开 VS Code」',
        '- 卡片「目录」→「更改…」选定练习目录，节点会记住',
        '- 网页终端、「在浏览器打开 VS Code」可临时替代，访问的是同一节点、同一项目',
    ]),

    ('code', '在远程节点编辑并运行 hello.c', '''/* VS Code Explorer 中新建 hello.c，输入后 Ctrl+S / Cmd+S 保存 */
#include <stdio.h>

int main(void) {
    printf("Hello, cs101!\\n");
    return 0;
}

# 菜单 Terminal > New Terminal，在远程终端执行：
gcc -Wall -Wextra hello.c -o hello
./hello                     # 输出 Hello, cs101!
''', '修改问候语 → 保存 → 重新编译 → 再运行，观察输出变化'),

    ('table', '保存文件，下次继续连接', [
        ['位置 / 操作', '记住什么'],
        ['~/ic-b-2026', '保存个人代码，重置节点后保留'],
        ['/lec 与 /lec/submit', '课程资料与个人收集目录，提交按课程要求'],
        ['exit / 关闭远程连接', '结束连接，已保存的文件仍在'],
        ['停止 / 重置节点', '停止会终止进程，重置会恢复系统盘'],
    ], '平台没有用户备份和快照：重要代码自己另存副本'),

    ('table', '排错：先排 SSH，再排 VS Code', [
        ['现象', '优先检查'],
        ['找不到 ssh 命令', '本机是否安装 SSH 客户端'],
        ['Connection timed out', '校园网络 / VPN、自己的 IP 与端口、节点状态'],
        ['Permission denied (publickey)', '用户名、公钥是否同步、是否使用对应私钥'],
        ['主机密钥变化警告', '先向助教核实，不直接关闭主机校验'],
        ['SSH 成功，VS Code 失败', 'Remote-SSH 扩展、输出日志、Server 安装'],
    ], '非默认密钥：ssh -i <私钥路径> -p <端口> <用户名>@<课程IP>；求助时附完整命令与错误文本'),

    ('section', '第 3 节', 'Linux Shell'),

    ('ascii', '目录树与路径', r"""
   /                根目录
   |-- home/        用户主目录      ~ 等价于 /home/你的用户名
   |-- etc/         配置文件
   |-- usr/         用户程序（/usr/bin, /usr/local）
   |-- var/         可变数据（日志 /var/log）
   +-- tmp/         临时文件（重启会清）

   绝对路径：以 / 开头        相对路径：. 当前  .. 上级  ~ 主目录
"""),

    ('table', '必会命令（上）', [
        ['命令', '作用', '常用形式'],
        ['pwd / ls / cd', '当前目录 / 列目录 / 切换', 'ls -la ；cd - 回上一个目录'],
        ['mkdir / cp / mv', '建目录 / 复制 / 移动', 'mkdir -p a/b/c ；cp -r src dst'],
        ['rm', '删除', 'rm -rf dir ⚠️ 不可恢复'],
        ['cat / head / tail / less', '查看文件', 'tail -f log ；less big.txt（q 退出）'],
        ['grep / find', '搜内容 / 搜文件', 'grep -rn "def main" . ；find . -name "*.py"'],
    ]),

    ('table', '必会命令（下）', [
        ['命令', '作用', '常用形式'],
        ['wc', '计数', 'wc -l a.txt'],
        ['chmod', '改权限', 'chmod +x run.sh'],
        ['df / du', '磁盘用量', 'du -sh *'],
        ['ps / top', '看进程', 'ps aux | grep python'],
        ['kill', '结束进程', 'kill -9 PID'],
    ], '⚠️ rm -rf 没有回收站：执行前先把命令改成 ls 跑一遍'),

    ('ascii', '文件权限', r"""
   -rwxr-xr--  1 yan staff  1024 Sep  8 10:00 run.sh
   |+-+-+-+-+
   | |  |  +--- 其他人 others: r--  (4)
   | |  +------ 同组   group:  r-x  (5)
   | +--------- 属主   user:   rwx  (7)
   +----------- 类型：- 普通文件，d 目录，l 符号链接

   r=4  w=2  x=1     ->   chmod 754 run.sh
"""),

    ('code', '重定向与管道', '''python3 a.py < in.txt > out.txt        # 输入来自文件，输出写入文件
python3 a.py > out.txt 2>&1            # 错误也一起写进去
python3 a.py >> log.txt                # 追加而不是覆盖

cat data.txt | sort | uniq -c | sort -rn | head   # 管道：词频 Top
''', '⭐ 本课最有用的一条：python3 solution.py < in.txt'),

    ('table', '快捷键', [
        ['键', '作用'],
        ['Ctrl+C', '中断当前程序'],
        ['Ctrl+D', '输入结束（EOF）—— 测试读到文件尾的程序时要用'],
        ['Ctrl+A / Ctrl+E', '行首 / 行尾'],
        ['Ctrl+R', '反向搜索历史命令'],
        ['Tab', '补全（按两下列出候选）'],
    ]),

    ('section', '第 4 节', '开发环境'),

    ('code', 'Python 虚拟环境（uv）', '''uv python install 3.14 --default     # 安装 Python（由 uv 管理）
uv init --no-package MyPython        # 新建项目（--no-package 不能省）
cd MyPython
uv add numpy matplotlib              # 装包，写入 pyproject.toml / uv.lock
uv run main.py                       # 运行，自动使用 .venv，无需 activate
uv remove numpy                      # 卸载包

# 环境坏了 / 换了电脑：删掉 .venv 重建
rm -rf .venv && uv sync                      # macOS / Linux
Remove-Item -Recurse -Force .venv; uv sync   # Windows PowerShell
''', '虚拟环境隔离不同项目的包；uv 一个工具管好 Python 版本、.venv 和第三方包'),

    ('bullets', 'PyCharm 的两个必用功能', [
        '**调试器**：行号左侧打断点 → Debug → 单步 F8 / 步入 F7 / 看变量',
        '- 不会用调试器就只能靠 `print` 猜，效率差一个数量级',
        '**直接输入**：右上角选择 Current File，点击运行 ▶；程序执行到 input() 时，在下方 Run 窗口直接输入数据并按回车',
        '- 适合课堂练习和临时测试，无需配置运行参数',
        '在线可视化 **pythontutor.com** —— 第 8 周讲递归时理解栈帧最快的工具',
    ]),

    ('section', '第 5 节', '编程语法练习'),

    ('code', '变量与基本类型', '''n = 42               # int，Python 的整数没有位数上限
x = 3.14             # float，双精度，约 15~16 位有效数字
s = "hello"          # str，不可变
flag = True          # bool（首字母大写）
items = [1, 2, 3]    # list，可变
pair = (1, 2)        # tuple，不可变
uniq = {1, 2, 3}     # set，无序不重复
d = {"a": 1}         # dict，键值对
''', ''),

    ('code', '分支与循环', '''score = int(input())
if score >= 90:
    grade = "A"
elif score >= 60:
    grade = "C"
else:
    grade = "F"

for i in range(1, 10, 2):            # 1 3 5 7 9 —— start, stop, step
    print(i, end=' ')

for i, v in enumerate(["a", "b"]):   # 同时要下标和值
    print(i, v)
''', 'Python 用缩进表示代码块；⚠️ 不要混用 Tab 和空格（初学者第二大坑）'),

    ('code', '字符串常用操作', '''s = "  Hello, World  "
print(s.strip())            # 去首尾空白 —— 读输入必备
print("a,b,c".split(","))   # ['a', 'b', 'c']
print("-".join(["a", "b"])) # "a-b"
print("abc"[::-1])          # "cba"  —— 反转
print("abc".find("b"))      # 1，找不到返回 -1
''', '字符串不可变：要改就先转 list，改完再 join'),

    ('code', '列表与二维列表', '''a = [3, 1, 2]
a.append(4); a.sort()
print(a[0], a[-1], a[1:3])
print(sum(a), max(a), len(a))
print([x * x for x in a if x % 2 == 1])   # 列表推导式

m, n = 3, 4
grid = [[0] * n for _ in range(m)]        # ✅ 每行独立
wrong = [[0] * n] * m                     # ❌ m 行是同一个列表的别名
wrong[0][0] = 1
print(wrong)   # 三行全被改了
''', '⚠️ 初学者第三大坑：二维列表的别名陷阱'),

    ('code', 'E02689 / E02676：两道语法练习', '''# E02689 大小写字母互换
print(input().swapcase())

# 手写版（理解 ASCII，第 3 周正面讲）
out = []
for ch in input():
    if 'a' <= ch <= 'z':
        out.append(chr(ord(ch) - 32))
    elif 'A' <= ch <= 'Z':
        out.append(chr(ord(ch) + 32))
    else:
        out.append(ch)
print(''.join(out))

# E02676 整数的个数
k = int(input())
nums = list(map(int, input().split()))
print(nums.count(1)); print(nums.count(5)); print(nums.count(10))
''', 'list.count() 是 O(n)：要统计的值有很多种时该用字典一次扫完'),

    ('bullets', '零基础入门：先学语法，再做 30 道练手题', [
        '**先学语法（几个小时）**：菜鸟教程 Python3，按目录学到「函数」为止',
        '- 重点：基础语法、数据类型、运算符、字符串、列表、条件控制、循环、函数',
        '**再做 30 道题（边做边查）**：做题是为了补语法，不是为了学算法',
        '- 只考语法不考算法；难度最低档（CF 800~1000、Easy、洛谷入门）；题意短、数据小',
        '- 一题对应一个语法点，顺序与教程一致：输入输出 → 分支 → 循环 → 字符串 → 列表 → 排序',
        '- OpenJudge / Codeforces 读标准输入；LeetCode 补全函数 —— 两种写法都练到',
        '题单 `ADS_30_easy_problems_for_beginners.md`；题解 fuynaloft.github.io/sol101',
    ]),

    ('table', '30 道练手题（上）：第 0–2 关', [
        ['关卡', '语法点', '题目'],
        ['第 0 关　输入与输出', 'print、input().split()、map、f-string',
         'sy1 Hello Sunny Why! · P1001 A+B Problem · 31183 一道题搞懂输入 · 31184 一道题搞懂输出'],
        ['第 1 关　运算与分支', 'if/else、%、//、向上取整',
         'E02733 判断闰年 · E02750 鸡兔同笼 · 4A Watermelon · 50A Domino piling · 1A Theatre Square · 200B Drinks'],
        ['第 2 关　循环', 'for/while、range、计数、is_prime 函数',
         'sy875 逃离魔法塔底 · E02676 整数的个数 · 231A Team · 158A Next Round · E01003 Hangover · E04138 质数的和与积 · E03143 验证"歌德巴赫猜想"'],
    ]),

    ('table', '30 道练手题（下）：第 3–5 关', [
        ['关卡', '语法点', '题目'],
        ['第 3 关　字符串与模拟', 'lower()、swapcase()、双重循环、bin()',
         '112A Petya and Strings · E02689 大小写字母互换 · E01218 THE DRUNK JAILER · E191 位1的个数'],
        ['第 4 关　列表', '下标、倒序遍历、拆数位、in 判断',
         '263A Beautiful Matrix · E66 加一 · E3622 判断整除性 · E3718 缺失的最小倍数 · 1 两数之和 · E35 搜索插入位置'],
        ['第 5 关　排序', 'sort()、sorted(key=...)、字典映射',
         '34B Sale · E07618 病人排队 · E1331 数组序号转换'],
    ], '做完再挑战：31185 一道题搞懂内置排序函数 · 31180 学生数据统计分析 · E18161 矩阵运算'),

    ('code', '做题前：先把输入模板写熟', '''n = int(input())                       # 一行一个整数
a, b = map(int, input().split())       # 一行两个整数
nums = list(map(int, input().split())) # 一行多个整数
s = input().strip()                    # 一行字符串

# OpenJudge / Codeforces：自己 input() 读入、print() 输出
# LeetCode：只补全 class Solution 里的函数，用 return 返回，不要写 input()
class Solution:
    def plusOne(self, digits: list[int]) -> list[int]:
        ...
''', '零基础同学最常见的错误是读错输入，不是算法写错'),

    ('bullets', '给零基础同学的做题建议', [
        '**别等「学完」再做题**：学到函数就开始，大部分语法是做题时现查学会的',
        '看懂评测结果：**WA** 查边界和输出格式；**RE** 多半是下标越界或没转类型；**TLE** 说明循环写错了',
        '卡住 20~30 分钟再看题解；看懂后**关掉题解自己重写**，直到 AC',
        '把 AI 当老师不当代笔：让它解释报错、讲语法点；**机考时没有 AI**',
        '先写能跑的暴力，AC 后再学简洁写法；每题记一行笔记，攒成语法速查表',
        '节奏：每天 3~5 题，一到两周做完',
    ]),

    ('bullets', '上机实践任务', [
        '在 xLab 添加公钥、新建节点，本机 `ssh` 登录后 `uname -a` 查看内核版本',
        '用本地 VS Code Remote-SSH 打开 `~/ic-b-2026/xlab-intro-demo`，编译运行 `hello.c`',
        '建目录 `~/ic-b-2026/week02`，写 `sum.py` 从标准输入读两个整数并输出和',
        '`echo "3 4" > in.txt`，再 `python3 sum.py < in.txt > out.txt`，`cat out.txt`',
        '`chmod +x` 一个 shell 脚本并运行',
        '在本机用 uv 新建项目，`uv add` 一个包并 `uv run` 运行',
    ]),

    ('table', '本周作业', [
        ['#', '题目', '编号', '考点'],
        ['1', '与 7 无关的数', '02701', '循环、取模'],
        ['2', '判断闰年', '02733', '分支'],
        ['3', '大小写字母互换', 'E02689', '字符串'],
        ['4', '整数的个数', 'E02676', '列表统计'],
        ['5', '验证"歌德巴赫猜想"', 'E03143', '素数判断、枚举'],
        ['6', '多项式时间复杂度', 'E23563', '字符串解析'],
        ['7', '文字排版', 'E06374', '字符串、模拟'],
        ['8（选做）', 'THE DRUNK JAILER', 'E01218', '数学规律 / 模拟'],
    ]),

    ('bullets', '小结', [
        '虚拟机 = 完整的模拟计算机；容器 = 共享内核的轻量隔离',
        'xLab：私钥留本机、公钥加到平台；`ssh` 与 VS Code Remote-SSH 连的是同一个节点',
        'Shell 的核心是**路径、权限、重定向、管道**四件事',
        '`python3 a.py < in.txt` 是本课最常用的一条命令；`rm -rf` 不可恢复',
        'Python 语法三大坑：**忘 `int()`**、**Tab/空格混用**、**`[[0]*n]*m` 别名陷阱**',
        '**读输入一律 `.strip()`**',
    ]),

    ('key', '下周预告',
     '计算机原理（1/2）：从图灵机、冯·诺依曼结构到二进制与 ASCII。'),
]

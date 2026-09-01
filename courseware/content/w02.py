# -*- coding: utf-8 -*-
"""第2周 虚拟机、Shell 与开发环境"""

META = {
    'title': '第2周　虚拟机、Shell 与开发环境',
    'subtitle': '操作系统 · 虚拟化与云主机 · Linux Shell · 虚拟环境 · 编程语法练习',
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
''', '学校云计算实验平台：clab.pku.edu.cn'),

    ('code', '交换分区：内存不够时的救命稻草', '''sudo fallocate -l 4G /swapfile        # 建 4GB 文件
sudo chmod 600 /swapfile
sudo mkswap /swapfile                 # 格式化为交换空间
sudo swapon /swapfile                 # 启用
free -h                               # 确认

echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab   # 开机自动挂载
''', 'swap 在磁盘上，比内存慢几个数量级；它防的是"崩溃"，不是"变慢"'),

    ('section', '第 2 节', 'Linux Shell'),

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

    ('section', '第 3 节', '开发环境'),

    ('code', 'Python 虚拟环境', '''python3 -m venv .venv                 # 创建
source .venv/bin/activate             # 启用（macOS / Linux）
.venv\\Scripts\\activate                # 启用（Windows PowerShell）
pip install numpy matplotlib          # 装包，只影响这个环境
pip freeze > requirements.txt         # 导出依赖
deactivate                            # 退出

# Windows 若提示无法运行脚本：
# Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
''', '不同项目依赖不同版本的包，虚拟环境把它们隔离开'),

    ('bullets', 'PyCharm 的两个必用功能', [
        '**调试器**：行号左侧打断点 → Debug → 单步 F8 / 步入 F7 / 看变量',
        '- 不会用调试器就只能靠 `print` 猜，效率差一个数量级',
        '**直接输入**：右上角选择 Current File，点击运行 ▶；程序执行到 input() 时，在下方 Run 窗口直接输入数据并按回车',
        '- 适合课堂练习和临时测试，无需配置运行参数',
        '在线可视化 **pythontutor.com** —— 第 8 周讲递归时理解栈帧最快的工具',
    ]),

    ('section', '第 4 节', '编程语法练习'),

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

    ('bullets', '上机实践任务', [
        '创建 / 连接一台 Linux 主机，`uname -a` 查看内核版本',
        '建目录 `~/cs101/week02`，写 `sum.py` 从标准输入读两个整数并输出和',
        '`echo "3 4" > in.txt`，再 `python3 sum.py < in.txt > out.txt`，`cat out.txt`',
        '`chmod +x` 一个 shell 脚本并运行',
        '创建 Python 虚拟环境并安装一个包',
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
        'Shell 的核心是**路径、权限、重定向、管道**四件事',
        '`python3 a.py < in.txt` 是本课最常用的一条命令；`rm -rf` 不可恢复',
        'Python 语法三大坑：**忘 `int()`**、**Tab/空格混用**、**`[[0]*n]*m` 别名陷阱**',
        '**读输入一律 `.strip()`**',
    ]),

    ('key', '下周预告',
     '计算机原理（1/2）：从图灵机、冯·诺依曼结构到二进制与 ASCII。'),
]

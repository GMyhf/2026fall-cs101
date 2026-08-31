# 第2周 虚拟机、Shell 与开发环境

*Updated 2026-08-31 GMT+8*
 *Compiled by Hongfei Yan (2026 Fall)*
https://github.com/GMyhf/2026fall-cs101

> **课程安排对应**：第 2 周
> **主题与学习重点**：虚拟机、Shell 与开发环境；开始编程语法练习。

**知识点**：三大操作系统对比、虚拟化与虚拟机、云主机的创建与 SSH 连接、交换分区、Linux 目录树、Shell 常用命令、文件权限、重定向与管道、Python 虚拟环境、变量与数据类型、分支与循环、字符串与列表的基本操作。

---

# 1 为什么计概课要讲操作系统和 Shell

三个理由：

1. **评测机跑的是 Linux**。你的程序 TLE / MLE / RE 时，看懂错误来自哪一层，需要一点系统知识。
2. **命令行是程序员的通用接口**。装包、跑脚本、批量处理数据、连服务器，全靠它。
3. **第 15 周要跑神经网络**，本地跑不动的实验要放到云主机上。

---

# 2 操作系统入门

## 2.1 三者比较

| | Windows | macOS | Linux |
| ---- | ---- | ---- | ---- |
| 内核 | NT | Darwin（类 Unix） | Linux |
| 默认 Shell | PowerShell / cmd | zsh | bash / zsh |
| 包管理 | winget / choco | Homebrew | apt / yum / dnf |
| 路径分隔符 | `\` | `/` | `/` |
| 换行符 | `\r\n` | `\n` | `\n` |
| 本课定位 | 主力开发机 | 主力开发机 | 评测机 / 云主机 |

**换行符差异是真的会咬人的**：Windows 下写的文本文件，行尾多一个 `\r`，
在 Linux 上 `int(line)` 通常仍能工作（Python 的 `int()` 会忽略空白），
但 `line == "abc"` 会失败。养成 `line.strip()` 的习惯。

## 2.2 虚拟化与虚拟机

**虚拟机（VM）**：用软件模拟出一整台计算机，在其上安装完整的操作系统。

```
   ┌──────────┐ ┌──────────┐ ┌──────────┐
   │  Guest   │ │  Guest   │ │  Guest   │   ← 虚拟机里的操作系统
   │  Linux   │ │  Linux   │ │ Windows  │
   └──────────┘ └──────────┘ └──────────┘
   ┌────────────────────────────────────┐
   │        Hypervisor 虚拟机监视器      │   ← VirtualBox / VMware / KVM
   └────────────────────────────────────┘
   ┌────────────────────────────────────┐
   │           宿主机操作系统            │
   └────────────────────────────────────┘
   ┌────────────────────────────────────┐
   │              物理硬件               │
   └────────────────────────────────────┘
```

**为什么用虚拟机**：隔离（装坏了删掉重建）、一致（和评测环境同构）、可迁移（快照）。

**容器（Docker）**与虚拟机的区别：容器共享宿主机内核，只隔离文件系统与进程空间，
因此**启动快、开销小**，但不能跑不同内核的系统。

## 2.3 云主机

学校提供[云计算实验平台](https://clab.pku.edu.cn/)。创建一台 Ubuntu 云主机后，用 SSH 连接：

```bash
ssh username@ip_address           # 口令登录
ssh -i ~/.ssh/id_rsa user@ip      # 密钥登录（推荐）
ssh -p 2222 user@ip               # 指定端口
```

**首次配置三件事**：

```bash
# 1) 更新系统
sudo apt update && sudo apt upgrade -y

# 2) 生成并上传公钥（在本机执行）
ssh-keygen -t ed25519 -C "you@pku.edu.cn"
ssh-copy-id user@ip

# 3) 传文件
scp local_file.py user@ip:~/            # 本机 -> 云主机
scp user@ip:~/result.txt ./            # 云主机 -> 本机
```

## 2.4 交换分区：内存不够时的救命稻草

云主机常只有 2 GB 内存，跑大模型实验会 OOM。加一块 swap：

```bash
sudo fallocate -l 4G /swapfile        # 建 4GB 文件
sudo chmod 600 /swapfile
sudo mkswap /swapfile                 # 格式化为交换空间
sudo swapon /swapfile                 # 启用
free -h                               # 确认

# 开机自动挂载
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

> swap 在磁盘上，比内存慢几个数量级。它防的是"崩溃"，不是"变慢"。

---

# 3 Linux Shell

## 3.1 目录树与路径

```
/                根目录
├── home/        用户主目录         ~  等价于 /home/你的用户名
├── etc/         配置文件
├── usr/         用户程序（/usr/bin, /usr/local）
├── var/         可变数据（日志 /var/log）
└── tmp/         临时文件（重启会清）
```

- **绝对路径**：以 `/` 开头，如 `/home/yan/code/a.py`
- **相对路径**：相对当前目录，`.` 当前目录、`..` 上级目录、`~` 主目录

## 3.2 必会命令

| 命令 | 作用 | 常用形式 |
| ---- | ---- | ---- |
| `pwd` | 当前目录 | `pwd` |
| `ls` | 列目录 | `ls -la`（含隐藏文件与详情） |
| `cd` | 切换目录 | `cd ..` / `cd -`（回上一个目录） |
| `mkdir` | 建目录 | `mkdir -p a/b/c`（连父目录一起建） |
| `cp` | 复制 | `cp -r src dst`（递归） |
| `mv` | 移动 / 改名 | `mv old new` |
| `rm` | 删除 | `rm -rf dir` ⚠️ **不可恢复** |
| `cat` | 看文件 | `cat a.txt` |
| `head` / `tail` | 看头 / 尾 | `tail -f log`（持续跟踪） |
| `less` | 分页看 | `less big.txt`（`q` 退出） |
| `grep` | 搜内容 | `grep -rn "def main" .` |
| `find` | 搜文件 | `find . -name "*.py"` |
| `wc` | 计数 | `wc -l a.txt` |
| `chmod` | 改权限 | `chmod +x run.sh` |
| `df` / `du` | 磁盘用量 | `du -sh *` |
| `ps` / `top` | 进程 | `ps aux \| grep python` |
| `kill` | 结束进程 | `kill -9 PID` |

> ⚠️ `rm -rf` 没有回收站。执行前先把命令**改成 `ls`** 跑一遍，确认删的是你以为的东西。

## 3.3 文件权限

```
-rwxr-xr--  1 yan staff  1024 Sep  8 10:00 run.sh
│└┬┘└┬┘└┬┘
│ │  │  └── 其他人 others: r--  (4)
│ │  └───── 同组 group:    r-x  (5)
│ └──────── 属主 user:     rwx  (7)
└────────── 类型：- 普通文件，d 目录，l 符号链接
```

`r=4, w=2, x=1`，所以 `chmod 754 run.sh` 等价于上面的权限。

## 3.4 重定向与管道

```bash
python3 a.py < in.txt > out.txt        # 标准输入来自文件，标准输出写入文件
python3 a.py > out.txt 2>&1            # 错误也一起写进去
python3 a.py >> log.txt                # 追加而不是覆盖
cat data.txt | sort | uniq -c | sort -rn | head   # 管道：词频 Top
```

**本课最有用的一条**：本地测试 OJ 程序时，把样例存成 `in.txt`，然后

```bash
python3 solution.py < in.txt
```

比每次手工敲输入快得多，也不会敲错。

## 3.5 快捷键

| 键 | 作用 |
| ---- | ---- |
| `Ctrl+C` | 中断当前程序 |
| `Ctrl+D` | 输入结束（EOF）——**测试读到文件尾的程序时要用** |
| `Ctrl+A` / `Ctrl+E` | 行首 / 行尾 |
| `Ctrl+R` | 反向搜索历史命令 |
| `Tab` | 补全（按两下列出候选） |
| `↑` / `↓` | 翻历史 |

---

# 4 开发环境

## 4.1 Python 虚拟环境

不同项目依赖不同版本的包，虚拟环境把它们隔离开：

```bash
python3 -m venv .venv                 # 创建
source .venv/bin/activate             # 启用（macOS / Linux）
.venv\Scripts\activate                # 启用（Windows PowerShell）
pip install numpy matplotlib          # 装包，只影响这个环境
pip freeze > requirements.txt         # 导出依赖
deactivate                            # 退出
```

Windows PowerShell 若提示无法运行脚本：

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

## 4.2 PyCharm 的两个必用功能

1. **调试器**：在行号左侧点一下打断点 → Debug 运行 → 单步（F8）/ 步入（F7）/ 看变量。
   **不会用调试器就只能靠 `print` 猜**，效率差一个数量级。
2. **重定向输入**：Run/Debug Configurations → 勾选 "Redirect input from" → 选 `in.txt`。
   这样在 IDE 里也能直接喂样例。

## 4.3 在线可视化

[pythontutor.com](https://pythontutor.com/) 能逐步展示变量、引用与调用栈——
第 8 周讲递归时，它是理解栈帧最快的工具。

---

# 5 编程语法练习

## 5.1 变量与基本类型

```python
n = 42               # int，Python 的整数没有位数上限
x = 3.14             # float，双精度，约 15~16 位有效数字
s = "hello"          # str，不可变
flag = True          # bool，True/False（首字母大写）
items = [1, 2, 3]    # list，可变
pair = (1, 2)        # tuple，不可变
uniq = {1, 2, 3}     # set，无序不重复
d = {"a": 1}         # dict，键值对

print(type(n), type(x), type(s))   # <class 'int'> <class 'float'> <class 'str'>
```

## 5.2 分支

```python
score = int(input())
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 60:
    grade = "C"
else:
    grade = "F"
print(grade)
```

Python 用**缩进**表示代码块（约定 4 个空格）。**不要混用 Tab 和空格**——
这是初学者第二大坑，报错信息是 `IndentationError` 或 `TabError`。

## 5.3 循环

```python
for i in range(5):          # 0 1 2 3 4
    print(i, end=' ')
print()

for i in range(1, 10, 2):   # 1 3 5 7 9  —— start, stop, step
    print(i, end=' ')
print()

for ch in "abc":            # 直接遍历字符串
    print(ch, end=' ')
print()

for i, v in enumerate(["a", "b"]):   # 0 a / 1 b —— 同时要下标和值
    print(i, v)

n = 5
while n > 0:
    n -= 1
```

`break` 跳出整个循环，`continue` 跳过本次迭代。

## 5.4 字符串常用操作

```python
s = "  Hello, World  "
print(s.strip())            # "Hello, World"   —— 去首尾空白，读输入必备
print(s.strip().lower())    # "hello, world"
print("a,b,c".split(","))   # ['a', 'b', 'c']
print("-".join(["a", "b"])) # "a-b"
print("abc"[::-1])          # "cba"            —— 反转
print("abc".replace("a", "X"))   # "Xbc"
print("abc".find("b"))      # 1，找不到返回 -1
print(len("abc"))           # 3
```

**字符串不可变**：`s[0] = 'X'` 会报错。要改就先转成 list，改完再 `''.join()`。

## 5.5 列表常用操作

```python
a = [3, 1, 2]
a.append(4)          # [3, 1, 2, 4]
a.pop()              # 弹出末尾并返回 4
a.sort()             # 原地排序 -> [1, 2, 3]
b = sorted(a, reverse=True)   # 返回新列表 [3, 2, 1]
print(a[0], a[-1])   # 首、尾
print(a[1:3])        # 切片 [2, 3]
print(sum(a), max(a), min(a), len(a))
print([x * x for x in a if x % 2 == 1])   # 列表推导式 [1, 9]
```

**二维列表的正确建法**：

```python
m, n = 3, 4
grid = [[0] * n for _ in range(m)]        # ✅ 每行独立
wrong = [[0] * n] * m                     # ❌ m 行是同一个列表的别名
wrong[0][0] = 1
print(wrong)   # [[1, 0, 0, 0], [1, 0, 0, 0], [1, 0, 0, 0]] —— 全被改了
```

这是初学者第三大坑，第 6 周处理矩阵时还会遇到。

## 5.6 例题：E02689: 大小写字母互换

**E02689: 大小写字母互换**，<http://cs101.openjudge.cn/practice/02689/>

```python
s = input()
print(s.swapcase())
```

手写版本（理解 ASCII，第 3 周会正面讲）：

```python
s = input()
out = []
for ch in s:
    if 'a' <= ch <= 'z':
        out.append(chr(ord(ch) - 32))
    elif 'A' <= ch <= 'Z':
        out.append(chr(ord(ch) + 32))
    else:
        out.append(ch)
print(''.join(out))
```

## 5.7 例题：E02676: 整数的个数

**E02676: 整数的个数**，<http://cs101.openjudge.cn/practice/02676/>

> 给定 k 个整数，统计其中 1、5、10 出现的次数。

```python
k = int(input())
nums = list(map(int, input().split()))
print(nums.count(1))
print(nums.count(5))
print(nums.count(10))
```

> 注意 `list.count()` 是 O(n)，这里调用三次共 O(3n)，n 很小无所谓。
> **但如果要统计的值有很多种，就该用字典一次扫完**——第 4 周讲复杂度时会回到这一点。

---

# 6 上机实践

**任务**：在云主机（或本地虚拟机）上完成以下流程，截图提交。

1. 创建 / 连接一台 Linux 主机，`uname -a` 查看内核版本；
2. 建立目录 `~/cs101/week02`，在其中写一个 `sum.py`，从标准输入读两个整数并输出和；
3. 用 `echo "3 4" > in.txt` 造数据，用 `python3 sum.py < in.txt > out.txt` 运行，`cat out.txt` 查看结果；
4. `chmod +x` 一个 shell 脚本并运行它；
5. 创建 Python 虚拟环境并安装一个包。

---

# 7 本周作业

| # | 题目 | 平台 / 编号 | 考点 |
| - | ---- | ---- | ---- |
| 1 | 与 7 无关的数 | 02701 | 循环、取模 |
| 2 | 判断闰年 | 02733 | 分支 |
| 3 | 大小写字母互换 | E02689 | 字符串 |
| 4 | 整数的个数 | E02676 | 列表统计 |
| 5 | 验证"歌德巴赫猜想" | E03143 | 素数判断、枚举 |
| 6 | 多项式时间复杂度 | E23563 | 字符串解析 |
| 7 | 文字排版 | E06374 | 字符串、模拟 |
| 8（选做） | THE DRUNK JAILER | E01218 | 数学规律 / 模拟 |

**思考题**：

1. 为什么 `[[0] * n] * m` 会出问题？用 `id()` 打印每一行的地址验证你的解释。
2. `Ctrl+C` 和 `Ctrl+D` 分别向程序发送了什么？为什么读到文件尾的循环要用后者结束？
3. 用管道统计一个文本文件里出现次数最多的 10 个单词，写出这条命令。

---

# 8 小结

1. 虚拟机 = 完整的模拟计算机；容器 = 共享内核的轻量隔离。评测机是 Linux，所以要懂一点。
2. Shell 的核心是**路径、权限、重定向、管道**四件事；`python3 a.py < in.txt` 是本课最常用的一条命令。
3. `rm -rf` 不可恢复；虚拟环境把项目依赖隔离开。
4. Python 语法三大坑：**忘 `int()`**、**Tab/空格混用**、**`[[0]*n]*m` 的别名陷阱**。
5. 读输入一律 `.strip()`。

**下周预告**：往下再挖一层——**计算机原理（1/2）**：从图灵机、冯·诺依曼结构到二进制与 ASCII，回答"计算机到底在算什么"。

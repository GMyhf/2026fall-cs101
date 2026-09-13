# Python 开发环境配置指南（Mac 与 Windows）

*Updated 2026-09-13 17:03 GMT+8*  
 *Compiled by Hongfei Yan (2025 Summer)*    



目标：在 macOS 或 Windows 系统上搭建完整的 Python 开发环境，包含以下组件：

- Python 解释器（当前稳定版为 Python 3.14）
- 虚拟环境（venv）
- 主流 IDE 配置（PyCharm 或 VS Code）

> ⚠️ 如需配置 C++ 编程环境，请参考： [Writing First C++ Program in VS Code](https://github.com/GMyhf/2026fall-cs101/blob/main/Writing_First_C%2B%2B_Program_in_VS-Code.md)



# macOS 环境配置

## 1. 安装 Homebrew（已安装可跳过）

macOS 推荐使用 [Homebrew](https://brew.sh/) 作为包管理工具，系统默认没有安装。先检查：

```bash
brew --version
```

如果提示 `command not found: brew`，在终端执行官网的安装命令：

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

> 安装过程中需要输入开机密码（输入时屏幕不显示字符，属于正常现象）。
>
> 如果国内网络下载很慢或失败，可参考清华镜像的 Homebrew 帮助：https://mirrors.tuna.tsinghua.edu.cn/help/homebrew/



## 2. 配置 PATH，让终端找到 Homebrew

macOS 自带的 `/usr/bin/python3` 版本较旧（3.9.x，已停止维护），需要让 Homebrew 的路径排在前面。

Homebrew 的安装路径和芯片有关：

| Mac 类型                       | Homebrew 路径            |
| ------------------------------ | ------------------------ |
| Apple Silicon（M1/M2/M3/M4…） | `/opt/homebrew/bin/brew` |
| Intel                          | `/usr/local/bin/brew`    |

> 不确定是哪种芯片：点击左上角苹果菜单 →「关于本机」查看，或在终端执行 `uname -m`（`arm64` 是 Apple Silicon，`x86_64` 是 Intel）。

1. 先检查配置文件里是否已经有这一行（Homebrew 安装结束时通常会提示你添加）：

   ```bash
   grep brew ~/.zprofile
   ```

2. 如果没有输出，执行下面**对应芯片**的一条命令，把配置追加到 `~/.zprofile`：

   ```bash
   # Apple Silicon
   echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile

   # Intel
   echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zprofile
   ```

3. 重新加载配置：

   ```bash
   source ~/.zprofile
   ```



## 3. 安装 / 升级 Python

```bash
brew update
brew install python
```

> `python` 是 Homebrew 中当前默认版本（`python@3.14`）的别名。
>
> 注意：Homebrew 提供的命令是 `python3` 和 `pip3`，**没有**不带版本号的 `python` 和 `pip`。激活虚拟环境（见下一步）后才能直接使用 `python` 和 `pip`。

验证安装结果：

```bash
which python3
python3 --version
```

正确输出应类似（Intel Mac 的路径是 `/usr/local/bin/python3`）：

```text
/opt/homebrew/bin/python3
Python 3.14.7
```

如果 `which python3` 仍然显示 `/usr/bin/python3`，说明第 2 步的 PATH 没有生效，关闭终端重新打开再试。



## 4. 创建项目虚拟环境

推荐为每个项目创建独立的虚拟环境，避免依赖冲突。

```bash
mkdir -p ~/MyPython   # 替换为你的项目路径
cd ~/MyPython
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -U pip ruff
```

> 激活成功后，命令行提示符前会出现 `(.venv)`。退出虚拟环境命令：`deactivate`
>
> 如果不激活虚拟环境就直接 `pip3 install`，Homebrew 的 Python 会报 `externally-managed-environment` 错误。这是正常的保护机制，请在虚拟环境里安装包。

**（可选）国内网络下载慢**：把 pip 默认源换成清华镜像：

```bash
python -m pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
```

> 这条命令写入的是**当前用户**的 pip 配置文件 `~/.config/pip/pip.conf`，只需执行一次，之后新建的所有虚拟环境都会使用这个镜像。



## 5. 安装 PyCharm

1. 从 [PyCharm 官网](https://www.jetbrains.com/pycharm/download/) 下载 macOS 版本，注意选择与芯片对应的 **Apple Silicon** 或 **Intel** 安装包

2. 打开 `.dmg`，将 **PyCharm.app** 拖入「应用程序」

3. 启动 PyCharm

   > 从 2025.1 版开始，PyCharm 不再区分 Community 和 Professional，只有一个 **PyCharm**：核心功能（包括 Jupyter Notebook）**免费使用**，不登录、不申请 licence 也可以用；Pro 功能需要订阅。
   >
   > 学生和老师可以免费申请 Pro 授权：https://www.jetbrains.com/academy/student-pack/

4. 新建项目时，在 Python 解释器（Interpreter）设置中选择**已有的（existing）**解释器，指向 `~/MyPython/.venv/bin/python`

   > 也可以直接让 PyCharm 为新项目自动创建虚拟环境。不同版本的界面文字可能略有差异。



## 6. 安装 VS Code

通过 Homebrew 安装 VS Code：

```bash
brew install --cask visual-studio-code
```

**初始化配置**：

1. 启动 VS Code，按 `⇧⌘P`（Shift+Command+P）打开命令面板。

   > 若无响应，请从菜单栏选择：**View → Command Palette...**

2. 输入并执行：

   `Shell Command: Install 'code' command in PATH`

3. 按 `⇧⌘X` 打开扩展市场，安装推荐扩展：

   - **Python（ms-python.python）** —— 语言支持、运行、调试。安装时会自动带上 **Pylance**（智能补全）和 **Python Debugger**
   - **Ruff（charliermarsh.ruff）** —— 极速代码检查和格式化（兼容 Black 的格式化风格）
   - （可选）**Jupyter（ms-toolsai.jupyter）** —— 运行/编辑 `.ipynb`，入门阶段用不到

4. 选择解释器：

   `⇧⌘P` → **Python: Select Interpreter** → 选择 `.venv/bin/python`



## 7. 验证环境是否正常

在**已激活虚拟环境**的终端中运行：

```bash
python --version
python -m pip --version
```

> 没有激活虚拟环境时，请用 `python3 --version` 和 `python3 -m pip --version`。

在 IDE 中创建 `main.py`，输入：

```python
print("Hello from Python on Mac!")
```

运行程序，若输出成功，则配置完成。



# Windows 环境配置

适用于 Windows 10 / 11（64 位系统）

**主要差异（vs macOS）**

| 项目           | macOS                 | Windows                              |
| -------------- | --------------------- | ------------------------------------ |
| 包管理器       | Homebrew (`brew`)     | 官方安装包 / `winget`                |
| Shell 配置文件 | `~/.zprofile`         | 环境变量 PATH                        |
| 虚拟环境路径   | `.venv/bin/python`    | `.venv\Scripts\python.exe`           |
| 编辑器安装     | `.dmg` 或 `brew cask` | `.exe` 安装包 或 `winget`            |
| 默认终端       | zsh                   | PowerShell                           |



## 1. 安装 Python（推荐官方安装包）

前往 [Python 官网 Windows 下载页面](https://www.python.org/downloads/windows/)：

- 找到最新稳定版（如 Python 3.14.7），下载 **Windows installer (64-bit)**
- 运行安装包，在**第一个界面底部务必勾选**：
  - ✅ **Add python.exe to PATH**
- 然后点击 **Install Now**

> 勾选 “Add python.exe to PATH” 可避免手动配置环境变量。
>
> 按 Install Now 安装时，Python 装在当前用户目录下：`C:\Users\<你的用户名>\AppData\Local\Programs\Python\Python314\`。
>
> 如果选了 Customize installation 并勾选 “Install Python for all users”，安装路径会变成 `C:\Program Files\Python314\`，下面手动配置 PATH 时要换成这个路径。

> 💡 官网现在也提供 **Python install manager**（Python 安装管理器），适合需要同时管理多个 Python 版本的同学。初学者用上面的传统安装包即可，两种方式二选一，不要混装。



## 2. 验证安装

**重新打开**一个 PowerShell 窗口（安装前已打开的窗口不会读到新的 PATH）：

```powershell
python --version
python -m pip --version
```

### 常见问题 1：输入 `python` 却打开了 Microsoft Store

这是 Windows 自带的“应用执行别名”在抢 `python` 命令。关闭方法：

> 设置 → 应用 → 高级应用设置 → **应用执行别名** → 关闭 `python.exe` 和 `python3.exe` 两项
>
> （Windows 10 路径为：设置 → 应用 → 应用和功能 → 应用执行别名）

关闭后重新打开 PowerShell 再试。

### 常见问题 2：提示 `python` 无法识别

提示类似 `无法将“python”项识别为 cmdlet、函数、脚本文件或可运行程序的名称`（英文系统为 `The term 'python' is not recognized`），说明安装时没有勾选 Add to PATH。请把以下**两个**路径加入**用户变量**的 `Path`：

```
C:\Users\<你的用户名>\AppData\Local\Programs\Python\Python314\
C:\Users\<你的用户名>\AppData\Local\Programs\Python\Python314\Scripts\
```

> 按下：
>
> ```
> Win + S → 输入 “环境变量” → 打开 “编辑系统环境变量” → 环境变量
> ```
>
> 在上半部分的 **用户变量** 里找到 `Path` → 编辑 → 新建 → 粘贴路径（两个路径各新建一次）→ 确定保存。
>
> 改“用户变量”不需要管理员权限；第二个 `Scripts\` 路径是 `pip` 等工具所在的位置。

保存后重新打开 PowerShell，可以用下面的命令查看实际找到的是哪个 `python`：

```powershell
where.exe python
```

> 注意：在 PowerShell 里要写 `where.exe`，只写 `where` 会被当成别的命令。



## 3. 创建虚拟环境

PowerShell 中执行：

```powershell
# 设置执行策略（只需执行一次，否则 activate 脚本可能被阻止运行）
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# 创建项目目录（没有 D 盘的话，把 D:\ 换成 C:\）
mkdir D:\MyPython
cd D:\MyPython

# 创建并激活虚拟环境
python -m venv .venv
.venv\Scripts\activate
python -m pip install --upgrade pip ruff
```

> 激活成功后，命令行提示符前会出现 `(.venv)`。退出虚拟环境：`deactivate`
>
> 如果目录已经存在，`mkdir` 会报错，忽略即可。

**说明**：  
若 `activate` 时提示“在此系统上禁止运行脚本”，是 PowerShell 的执行策略限制，运行上面的 `Set-ExecutionPolicy` 命令即可解决。

**（可选）国内网络下载慢**：把 pip 默认源换成清华镜像：

```powershell
python -m pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
```

> 这条命令写入的是**当前用户**的 pip 配置文件 `%APPDATA%\pip\pip.ini`，只需执行一次，之后新建的所有虚拟环境都会使用这个镜像。



## 4. 安装 PyCharm

1. 从 [PyCharm 官网](https://www.jetbrains.com/pycharm/download/) 下载 Windows `.exe` 安装包。

2. 安装后启动。

   > 从 2025.1 版开始，PyCharm 不再区分 Community 和 Professional，只有一个 **PyCharm**：核心功能**免费使用**，不登录、不申请 licence 也可以用；Pro 功能需要订阅。
   >
   > 学生和老师可以免费申请 Pro 授权：https://www.jetbrains.com/academy/student-pack/

3. 新建项目时，在 Python 解释器（Interpreter）设置中选择**已有的（existing）**解释器，指向：

   `D:\MyPython\.venv\Scripts\python.exe`

   > 也可以直接让 PyCharm 为新项目自动创建虚拟环境。不同版本的界面文字可能略有差异。



## 5. 安装 VS Code

使用 `winget`（Windows 包管理器）快速安装：

```powershell
winget install -e --id Microsoft.VisualStudioCode
```

> 也可以从官网 https://code.visualstudio.com/ 下载安装包，安装时勾选“添加到 PATH”。

### 配置步骤：

1. 启动 VS Code，按 `Ctrl+Shift+X` 打开扩展市场。

2. 安装推荐扩展：

   - **Python（ms-python.python）** —— 语言支持、运行、调试。安装时会自动带上 **Pylance**（智能补全）和 **Python Debugger**
   - **Ruff（charliermarsh.ruff）** —— 极速代码检查和格式化（兼容 Black 的格式化风格）
   - （可选）**Jupyter（ms-toolsai.jupyter）** —— 运行/编辑 `.ipynb`，入门阶段用不到

3. 选择 Python 解释器：

   `Ctrl+Shift+P` → **Python: Select Interpreter** → 选择 `.venv\Scripts\python.exe`



## 6. 测试运行

创建 `main.py` 文件，内容如下：

```python
print("Hello from Python on Windows!")
```

在 IDE 中运行，确认输出成功。



# 总结

| 步骤           | macOS                       | Windows                                  |
| -------------- | --------------------------- | ---------------------------------------- |
| 安装 Python    | `brew install python`       | 官方 `.exe` + 勾选 Add python.exe to PATH |
| 虚拟环境激活   | `source .venv/bin/activate` | `.venv\Scripts\activate`                 |
| IDE 配置解释器 | `.venv/bin/python`          | `.venv\Scripts\python.exe`               |
| 推荐终端       | zsh                         | PowerShell                               |

现在你的 Python 开发环境已准备就绪。可以开始编写、调试和运行 Python 程序了！

> 提示：建议使用 `ruff` 检查和格式化代码，保持代码风格统一。
>
> 本文档适用于 Python 初学者及课程教学使用。  
> 支持平台：Apple Silicon Mac / Intel Mac / Windows 10/11

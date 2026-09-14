# Python 开发环境配置指南（Mac 与 Windows）

*Updated 2026-09-13 19:30 GMT+8*  
 *Compiled by Hongfei Yan (2025 Summer)*    



目标：在 macOS 或 Windows 系统上搭建完整的 Python 开发环境，包含以下组件：

- [uv](https://docs.astral.sh/uv/)：一个工具管好 Python 版本、虚拟环境和第三方包
- Python 解释器（当前稳定版为 Python 3.14，由 uv 安装）
- 主流 IDE 配置（PyCharm 或 VS Code）

> ⚠️ 如需配置 C++ 编程环境，请参考： [Writing First C++ Program in VS Code](https://github.com/GMyhf/2026fall-cs101/blob/main/Writing_First_C%2B%2B_Program_in_VS-Code.md)



**为什么用 uv，而不是 `python -m venv` + `pip`？**

- **不用激活虚拟环境**：`uv run main.py` 自动使用项目里的 `.venv`，不会出现“忘了 activate，包装到别处”的问题；Windows 上也不用改 PowerShell 执行策略。
- **Python 由 uv 自己管理**：不会因为 Homebrew 升级 Python，或者电脑上装了好几个 Python（MSYS2、Anaconda、Microsoft Store…）而找错解释器、导致虚拟环境失效。
- **环境坏了随时重建**：依赖记录在 `pyproject.toml` 和 `uv.lock` 里，删掉 `.venv` 再执行 `uv sync`，几秒钟就恢复原样。

> 已经用 `venv` 或 conda 配好环境、能正常写代码的同学，不必重装，见文末[附录](#附录不用-uv-的传统方式)。



# macOS 环境配置

## 1. 安装 uv

**方式一：Homebrew（推荐，已安装 Homebrew 的同学）**

```bash
brew install uv
```

> 还没有 Homebrew 的话，可以按 [Homebrew 官网](https://brew.sh/) 安装（国内网络参考[清华镜像帮助](https://mirrors.tuna.tsinghua.edu.cn/help/homebrew/)），后面安装 VS Code 也会用到。不想装 Homebrew，直接用方式二。

**方式二：官方安装脚本**

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

> 脚本会把 uv 装到 `~/.local/bin`，并自动写入 shell 配置。装完**关闭终端重新打开**。
>
> 这个脚本从 GitHub 下载，国内网络可能很慢或失败，此时请用方式一。

验证：

```bash
uv --version
```

输出 `uv 0.12.x` 或更高即可。

> 两种方式**只选一种**。以前用方式二装过 uv 的同学再执行 `brew install uv`，Homebrew 会提示 `shadowed by ~/.local/bin/uv`，实际用的仍是旧的那个。可以用 `which -a uv` 查看，第一行才是实际使用的；继续用旧的就执行 `uv self update` 升级它。



## 2.（国内网络推荐）配置镜像

uv 下载 Python 默认走 GitHub，下载第三方包默认走 PyPI，国内都可能很慢。执行下面的命令，写入**当前用户**的 uv 配置文件 `~/.config/uv/uv.toml`（只需执行一次，对之后所有项目生效）：

```bash
mkdir -p ~/.config/uv
cat > ~/.config/uv/uv.toml <<'EOF'
python-install-mirror = "https://mirror.nju.edu.cn/github-release/astral-sh/python-build-standalone/"

[[index]]
url = "https://pypi.tuna.tsinghua.edu.cn/simple"
default = true
EOF
```

> 这条命令会**覆盖**已有的 `uv.toml`。第一行是 Python 安装包的南京大学镜像，`[[index]]` 是清华 PyPI 镜像。
>
> 注意：uv **不读取** pip 的配置（`pip.conf`），给 pip 设置过清华源也要在这里再设置一次。



## 3. 安装 Python

```bash
uv python install 3.14 --default
```

> `--default` 会额外生成 `python` 和 `python3` 命令（放在 `~/.local/bin`），方便在项目之外临时使用。如果提示 `~/.local/bin` 不在 PATH 中，执行 `uv python update-shell`，然后重新打开终端。
>
> 新版 uv 可能提示 `The --default option is experimental`，忽略即可，不影响安装。

验证：

```bash
uv python list --only-installed
```

输出中应有一行 `cpython-3.14.x-macos-...`。

> macOS 自带的 `/usr/bin/python3` 版本较旧（3.9.x，已停止维护），不要用它；用 uv 就不需要关心它。



## 4. 创建项目

```bash
cd ~
uv init --no-package MyPython   # 替换为你的项目名
cd MyPython
uv add --dev ruff               # 安装代码检查/格式化工具，同时会创建 .venv
uv run main.py
```

> **`--no-package` 不能省略。** 从 uv 0.12 开始，`uv init` 默认创建用于发布的 `src/` 包结构，不再生成 `main.py`，直接 `uv run main.py` 会报错 `program not found`。写课程作业、OJ 题目用 `--no-package` 的简单结构即可。

输出 `Hello from mypython!` 说明成功。`uv init` 生成的文件：

| 文件 / 目录       | 作用                                                         |
| ----------------- | ------------------------------------------------------------ |
| `main.py`         | 示例程序                                                     |
| `pyproject.toml`  | 项目配置，记录依赖了哪些包                                   |
| `.python-version` | 项目使用的 Python 版本（`3.14`）                             |
| `uv.lock`         | 锁定每个包的精确版本（`uv add` 后生成），**不要手动修改**    |
| `.venv/`          | 虚拟环境，**随时可以删掉重建**                               |

日常常用命令（都在项目目录下执行，**不需要**激活虚拟环境）：

```bash
uv run xxx.py          # 运行程序
uv add numpy           # 安装第三方包（写入 pyproject.toml 和 uv.lock）
uv remove numpy        # 卸载第三方包
uv run ruff check .    # 检查代码
uv run ruff format .   # 格式化代码
uv python upgrade 3.14 # 升级到 3.14 的最新小版本，已有的 .venv 自动跟着升级，不用重建

# 环境出问题 / 换了电脑：
rm -rf .venv && uv sync
```

> 请使用 `uv add`，不要用 `pip install`。在 macOS 上直接 `pip3 install` 通常会报 `externally-managed-environment` 错误，这是系统的保护机制。



## 5. 安装 PyCharm

1. 从 [PyCharm 官网](https://www.jetbrains.com/pycharm/download/) 下载 macOS 版本，注意选择与芯片对应的 **Apple Silicon** 或 **Intel** 安装包

   > 不确定是哪种芯片：点击左上角苹果菜单 →「关于本机」查看，或在终端执行 `uname -m`（`arm64` 是 Apple Silicon，`x86_64` 是 Intel）。

2. 打开 `.dmg`，将 **PyCharm.app** 拖入「应用程序」

3. 启动 PyCharm

   > 从 2025.1 版开始，PyCharm 不再区分 Community 和 Professional，只有一个 **PyCharm**：核心功能（包括 Jupyter Notebook）**免费使用**，不登录、不申请 licence 也可以用；Pro 功能需要订阅。
   >
   > 学生和老师可以免费申请 Pro 授权：https://www.jetbrains.com/academy/student-pack/

4. **File → Open** 打开 `~/MyPython` 目录。PyCharm 通常会自动识别 `.venv`；如果没有，在 Python 解释器（Interpreter）设置中选择**已有的（existing）**解释器，指向 `~/MyPython/.venv/bin/python`

   > 新版 PyCharm 新建项目时也可以直接选择 **uv** 作为环境类型。不同版本的界面文字可能略有差异。



## 6. 安装 VS Code

通过 Homebrew 安装 VS Code（或从官网 https://code.visualstudio.com/ 下载）：

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

4. **File → Open Folder** 打开 `~/MyPython`，然后选择解释器：

   `⇧⌘P` → **Python: Select Interpreter** → 选择 `.venv/bin/python`



## 7. 验证环境是否正常

在项目目录的终端中运行：

```bash
uv run python --version
```

应输出 `Python 3.14.x`。

在 IDE 中打开 `main.py`，改成：

```python
print("Hello from Python on Mac!")
```

点击运行按钮，若输出成功，则配置完成。



# Windows 环境配置

适用于 Windows 10 / 11（64 位系统），以下命令都在 **PowerShell** 中执行。

**主要差异（vs macOS）**

| 项目           | macOS                     | Windows                          |
| -------------- | ------------------------- | -------------------------------- |
| 安装 uv        | `brew install uv`         | 官方安装脚本（或 `winget`）      |
| uv 配置文件    | `~/.config/uv/uv.toml`    | `%APPDATA%\uv\uv.toml`           |
| 虚拟环境解释器 | `.venv/bin/python`        | `.venv\Scripts\python.exe`       |
| 删除虚拟环境   | `rm -rf .venv`            | `Remove-Item -Recurse -Force .venv` |
| 默认终端       | zsh                       | PowerShell                       |



## 1. 安装 uv

**方式一：官方安装脚本（推荐）**

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

> 这里的 `-ExecutionPolicy ByPass` 只对这一条命令生效，不会修改系统设置。uv 会装到 `C:\Users\<你的用户名>\.local\bin`，并自动加入用户 PATH。这种方式总是安装最新版，以后可以用 `uv self update` 升级。

**方式二：winget**

```powershell
winget install --id=astral-sh.uv -e
```

> ⚠️ 国内网络下 winget 经常提示 `尝试更新源失败`，此时会装上**很旧的 uv**（例如 0.8.x），它还不认识正式版 Python 3.14。所以装完一定要看下面 `uv --version` 的输出。

**重新打开**一个 PowerShell 窗口（安装前已打开的窗口不会读到新的 PATH），验证：

```powershell
uv --version
```

输出 `uv 0.12.x` 或更高即可。如果版本低于 0.11，请改用方式一重新安装（winget 装的 uv 先执行 `winget uninstall astral-sh.uv` 卸载）。

> 两种方式都要从 GitHub 下载，如果国内网络下载失败：电脑上已经有任意版本 Python 的话，可以用 `python -m pip install uv -i https://pypi.tuna.tsinghua.edu.cn/simple` 安装，装完同样重新打开 PowerShell。



## 2.（国内网络推荐）配置镜像

写入**当前用户**的 uv 配置文件 `%APPDATA%\uv\uv.toml`（只需执行一次，对之后所有项目生效）：

```powershell
New-Item -ItemType Directory -Force "$env:APPDATA\uv" | Out-Null
@'
python-install-mirror = "https://mirror.nju.edu.cn/github-release/astral-sh/python-build-standalone/"

[[index]]
url = "https://pypi.tuna.tsinghua.edu.cn/simple"
default = true
'@ | Set-Content -Encoding ascii "$env:APPDATA\uv\uv.toml"
```

> 这条命令会**覆盖**已有的 `uv.toml`。第一行是 Python 安装包的南京大学镜像，`[[index]]` 是清华 PyPI 镜像。
>
> 注意：uv **不读取** pip 的配置（`pip.ini`），给 pip 设置过清华源也要在这里再设置一次。



## 3. 安装 Python

```powershell
uv python install 3.14 --default
```

> **不需要**再去 python.org 下载安装包，也不需要勾选 “Add python.exe to PATH”。
>
> `--default` 会额外生成 `python.exe` 命令（放在 `C:\Users\<你的用户名>\.local\bin`），方便在项目之外临时使用。
>
> 可能出现的两类警告，都可以忽略：
>
> - `The --default option is experimental`
> - 装过 MSYS2 的电脑会出现 `Failed to inspect Python interpreter ... msys64 ... Unknown operating system`，这是 uv 跳过了 MSYS2 自带的 Python

验证：

```powershell
uv python list --only-installed
```

输出中应有一行 `cpython-3.14.x-windows-x86_64-none`。



## 4. 创建项目

```powershell
# 没有 D 盘的话，把 D:\ 换成 C:\
cd D:\
uv init --no-package MyPython   # --no-package 不能省略，原因见 macOS 第 4 步
cd MyPython
uv add --dev ruff               # 安装代码检查/格式化工具，同时会创建 .venv
uv run main.py
```

> 项目放在 D 盘时，`uv add` 可能提示 `Failed to hardlink files; falling back to full copy`。这是因为 uv 的缓存在 C 盘、跨盘无法硬链接，改为复制文件，忽略即可。

输出 `Hello from mypython!` 说明成功。各文件的作用和日常命令与 [macOS 第 4 步](#4-创建项目)相同，只有删除虚拟环境的命令不同：

```powershell
# 环境出问题 / 换了电脑：
Remove-Item -Recurse -Force .venv; uv sync
```

> 用 `uv run` 就**不需要**激活虚拟环境，也就不需要执行 `Set-ExecutionPolicy`。



## 5. 安装 PyCharm

1. 从 [PyCharm 官网](https://www.jetbrains.com/pycharm/download/) 下载 Windows `.exe` 安装包。

2. 安装后启动。

   > 从 2025.1 版开始，PyCharm 不再区分 Community 和 Professional，只有一个 **PyCharm**：核心功能**免费使用**，不登录、不申请 licence 也可以用；Pro 功能需要订阅。
   >
   > 学生和老师可以免费申请 Pro 授权：https://www.jetbrains.com/academy/student-pack/

3. **File → Open** 打开 `D:\MyPython` 目录。PyCharm 通常会自动识别 `.venv`；如果没有，在 Python 解释器（Interpreter）设置中选择**已有的（existing）**解释器，指向：

   `D:\MyPython\.venv\Scripts\python.exe`

   > 新版 PyCharm 新建项目时也可以直接选择 **uv** 作为环境类型。不同版本的界面文字可能略有差异。



## 6. 安装 VS Code

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

3. **File → Open Folder** 打开 `D:\MyPython`，然后选择 Python 解释器：

   `Ctrl+Shift+P` → **Python: Select Interpreter** → 选择 `.venv\Scripts\python.exe`



## 7. 测试运行

在项目目录的 PowerShell 中运行：

```powershell
uv run python --version
```

应输出 `Python 3.14.x`。

在 IDE 中打开 `main.py`，改成：

```python
print("Hello from Python on Windows!")
```

点击运行按钮，确认输出成功。



## 常见问题

### 1. 提示 `uv` 无法识别

提示类似 `无法将“uv”项识别为 cmdlet、函数、脚本文件或可运行程序的名称`（英文系统为 `The term 'uv' is not recognized`）：先**关闭所有 PowerShell 窗口重新打开**。仍然不行，把 `C:\Users\<你的用户名>\.local\bin` 加入**用户变量**的 `Path`：

> ```
> Win + S → 输入 “环境变量” → 打开 “编辑系统环境变量” → 环境变量
> ```
>
> 在上半部分的 **用户变量** 里找到 `Path` → 编辑 → 新建 → 粘贴路径 → 确定保存。改“用户变量”不需要管理员权限。

### 2. 输入 `python` 却打开了 Microsoft Store，或者用到了别的 Python

在项目里请始终用 `uv run python` / `uv run xxx.py`，它一定使用项目的 `.venv`，不受下面这些情况影响。

如果想在项目之外直接用 `python` 命令，先查看实际找到的是哪个：

```powershell
where.exe python
```

> 注意：在 PowerShell 里要写 `where.exe`，只写 `where` 会被当成别的命令。

输出可能有多行，**第一行**才是实际使用的 `python`：

- 第一行是 `...\Microsoft\WindowsApps\python.exe`：这是 Windows 自带的“应用执行别名”。关闭方法：设置 → 应用 → 高级应用设置 → **应用执行别名** → 关闭 `python.exe` 和 `python3.exe` 两项（Windows 10 路径为：设置 → 应用 → 应用和功能 → 应用执行别名）。
- 第一行是 `C:\msys64\ucrt64\bin\python.exe`：这是为写 C++ 装的 MSYS2 自带的 Python。在“环境变量”的 `Path` 编辑窗口里，把 `C:\Users\<你的用户名>\.local\bin` **上移**到 MSYS2 路径之前。



# 总结

| 步骤         | macOS                              | Windows                                   |
| ------------ | ---------------------------------- | ----------------------------------------- |
| 安装 uv      | `brew install uv`                  | 官方安装脚本 `install.ps1`                |
| 安装 Python  | `uv python install 3.14 --default` | `uv python install 3.14 --default`        |
| 新建项目     | `uv init --no-package MyPython`    | `uv init --no-package MyPython`           |
| 安装包       | `uv add numpy`                     | `uv add numpy`                            |
| 运行程序     | `uv run main.py`                   | `uv run main.py`                          |
| 升级 Python  | `uv python upgrade 3.14`           | `uv python upgrade 3.14`                  |
| IDE 解释器   | `.venv/bin/python`                 | `.venv\Scripts\python.exe`                |
| 环境坏了     | `rm -rf .venv && uv sync`          | `Remove-Item -Recurse -Force .venv; uv sync` |

现在你的 Python 开发环境已准备就绪。可以开始编写、调试和运行 Python 程序了！

> 提示：建议使用 `ruff` 检查和格式化代码，保持代码风格统一。
>
> 本文档适用于 Python 初学者及课程教学使用。  
> 支持平台：Apple Silicon Mac / Intel Mac / Windows 10/11



# 附录：不用 uv 的传统方式

**已经配好 venv 的同学**：可以继续用。唯一要注意的是，venv 依赖创建它的那个 Python。在 macOS 上，Homebrew 升级或删除 Python 后，venv 可能失效，报错找不到解释器。这时删掉 `.venv` 重新创建即可，建议平时用 `python -m pip freeze > requirements.txt` 记下装过的包，重建后 `python -m pip install -r requirements.txt`。

传统方式的命令（Python 从 Homebrew 或 python.org 安装）：

```bash
# macOS
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -U pip ruff
```

```powershell
# Windows（首次需要允许运行激活脚本）
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
python -m venv .venv
.venv\Scripts\activate
python -m pip install --upgrade pip ruff
```

**用 conda / miniconda 的同学**：conda 每个环境自带一份 Python，不怕上面说的升级问题，需要 CUDA 等二进制依赖时也更省事，可以继续用。如果同时用 uv，建议关掉 base 环境的自动激活，避免 uv 误用 conda 里的 Python：

```bash
conda config --set auto_activate_base false
```

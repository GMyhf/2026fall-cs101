# Python 开发环境配置指南（Mac 与 Windows）

*Updated 2025-08-17 09:21 GMT+8*  
 *Compiled by Hongfei Yan (2025 Summer)*    



目标：在 macOS 或 Windows 系统上搭建完整的 Python 开发环境，包含以下组件：

- Python 解释器
- 虚拟环境（venv）
- 主流 IDE 配置（PyCharm 或 VS Code）

> ⚠️ 如需配置 C++ 编程环境，请参考： [Writing First C++ Program in VS Code](https://github.com/GMyhf/2025fall-cs101/blob/main/Writing_First_C%2B%2B_Program_in_VS-Code.md)



# macOS 环境配置

## 1. 安装 / 升级 Python（使用Homebrew）

macOS 推荐使用 [Homebrew](https://brew.sh/) 作为包管理工具。

```bash
brew update
brew install python
```

> 这将安装最新稳定版 Python（如 Python 3.13+），并包含 `pip` 和 `python3` 命令。



## 2. 配置默认使用 Homebrew 的 Python

macOS 默认优先用系统自带的 `/usr/bin/python3`（3.9.x），需要调整 PATH：

1. 编辑 shell 配置文件（zsh）：

```bash
vi ~/.zprofile
```

2. 按 `i` 进入插入模式，在文件**开头**添加：

```bash
# 启用 Homebrew 并配置 Python 路径
eval "$(/opt/homebrew/bin/brew shellenv)"
```

3. 按 `Esc`，输入 `:wq` 并回车保存退出。

4. 重新加载配置：

```bash
source ~/.zprofile
```

5. 验证安装结果：

```bash
which python3
python3 --version
```

正确输出应类似：

```text
/opt/homebrew/bin/python3
Python 3.13.6
```



## 3. 创建项目虚拟环境

推荐为每个项目创建独立的虚拟环境，避免依赖冲突。

```bash
cd ~/MyPython  # 替换为你的项目路径
python3 -m venv .venv
source .venv/bin/activate
pip install -U pip ruff black ipykernel
```

> 退出虚拟环境命令：`deactivate`



## 4. 安装 PyCharm

1. 从 [PyCharm 官网](https://www.jetbrains.com/pycharm/) 下载 **macOS (Apple Silicon)** 版本

2. 打开 `.dmg`，将 **PyCharm.app** 拖入「应用程序」

3. 启动并登录 JetBrains 账号（关联你的 License ID）

   > 不申请JetBrain licence也可以用PyCharm。如果想申请，对学生和老师是免费的，https://www.jetbrains.com/academy/student-pack/

4. 新建项目 → **Interpreter** 选 **Existing environment** → 指向 `.venv/bin/python`



## 5. 安装 VS Code

通过 Homebrew 安装 VS Code：

```bash
brew install --cask visual-studio-code
```

**始化配置**：

1. 启动 VS Code，按 `⇧⌘P`（Shift+Command+P）打开命令面板。

   > 若无响应，请从菜单栏选择：**View → Command Palette...**

2. 输入并执行：

   `Shell Command: Install 'code' command in PATH`

3. 安装推荐扩展：

   - **Python（ms-python.python）** —— 语言支持、调试、测试入口

   - **Pylance（ms-python.vscode-pylance）** —— 高性能智能补全/类型分析

   - **Jupyter（ms-toolsai.jupyter）** —— 运行/编辑 `.ipynb`

   - **Black Formatter（ms-python.black-formatter）** —— 使用 Black 自动格式化

   - **Ruff（charliermarsh.ruff）** —— 极速 Lint/格式化（PEP8、isort 等一站式）

     > **Astral Software**（原作者 Charlie Marsh 后来成立的 Astral 公司）
     >
     > 功能：极速 Python Linter & Formatter（集成了 flake8、isort、pep8-naming 等功能）

4. 选择解释器：

   `⇧⌘P` → **Python: Select Interpreter** → 选择 `.venv/bin/python`



## 6. 验证环境是否正常

运行以下命令确认：

```bash
python3 --version
pip --version
```

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
| 包管理器       | Homebrew (`brew`)     | 官方安装包 / `winget` / `Chocolatey` |
| Shell 配置文件 | `~/.zprofile`         | 系统环境变量 PATH                    |
| 虚拟环境路径   | `.venv/bin/python`    | `.venv\Scripts\python.exe`           |
| 编辑器安装     | `.dmg` 或 `brew cask` | `.exe` 安装包 或 `winget`            |
| 默认终端       | zsh                   | PowerShell                           |



## 1. 安装 Python（推荐官方安装包）

前往 [Python 官网下载页面](https://www.python.org/downloads/windows/)：

- 下载 **Windows installer (64-bit)**
- 安装时**务必勾选**：
  - ✅ **Add Python to PATH**
  - ✅ **Install for all users**（可选，推荐）

> 勾选“Add to PATH”可避免手动配置环境变量。



## 2. 验证安装

打开 PowerShell：

```powershell
python --version
pip --version
```

若提示 `'python' is not recognized`，请手动将以下路径加入系统环境变量 `PATH`：

```
C:\Users\<你的用户名>\AppData\Local\Programs\Python\Python313\
```

> 按下：
>
> ```
> Win + S → 输入 “环境变量” → 打开 “编辑系统环境变量” → 环境变量
> ```
>
> 在 **系统变量** 里找到 `Path` → 编辑 → 新建 → 粘贴上面的路径 → 确定保存。



## 3. 创建虚拟环境

PowerShell 中执行：

```powershell
# 设置执行策略（如提示无法运行脚本）
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# 创建并激活虚拟环境
cd D:\MyPython
python -m venv .venv
.venv\Scripts\activate
pip install --upgrade pip ruff black ipykernel
```

> 退出虚拟环境：`deactivate`
>
> 如果报 找不到路径 "D:\MyPython"，那就先在D盘建立目录 MyPython

**说明**：  
若 `activate` 脚本被阻止运行，通常是因为 PowerShell 的执行策略限制。运行上述 `Set-ExecutionPolicy` 命令即可解决。



## 4. 安装 PyCharm

1. 从 [PyCharm 官网](https://www.jetbrains.com/pycharm/) 下载 Windows `.exe` 安装包。

2. 安装后启动，登录 JetBrains 账号。

   > 不申请JetBrain licence也可以用PyCharm。如果想申请，对学生和老师是免费的，https://www.jetbrains.com/academy/student-pack/

3. 创建项目时，选择解释器：

   `.venv\Scripts\python.exe`



## 5. 安装 VS Code

使用 `winget`（Windows 包管理器）快速安装：

```powershell
winget install --id Microsoft.VisualStudioCode
```

### 配置步骤：

1. 启动 VS Code，按 `Ctrl+Shift+P` 打开命令面板。
2. 安装推荐扩展：

      - **Python（ms-python.python）** —— 语言支持、调试、测试入口
      - **Pylance（ms-python.vscode-pylance）** —— 高性能智能补全/类型分析
      - **Jupyter（ms-toolsai.jupyter）** —— 运行/编辑 `.ipynb`
      - **Black Formatter（ms-python.black-formatter）** —— 使用 Black 自动格式化
      - **Ruff（charliermarsh.ruff）** —— 极速 Lint/格式化（PEP8、isort 等一站式）
3. 选择 Python 解释器：

`Ctrl+Shift+P` → **Python: Select Interpreter** → 选择 `.venv\Scripts\python.exe`

   

## 6. 测试运行

创建 `main.py` 文件，内容如下：

   ```python
   print("Hello from Python on Windows!")
   ```

在 IDE 中运行，确认输出成功。

   

# 总结

| 步骤           | macOS                       | Windows                        |
| -------------- | --------------------------- | ------------------------------ |
| 安装 Python    | `brew install python`       | 官方 `.exe` + 勾选 Add to PATH |
| 虚拟环境激活   | `source .venv/bin/activate` | `.venv\Scripts\activate`       |
| IDE 配置解释器 | `.venv/bin/python`          | `.venv\Scripts\python.exe`     |
| 推荐终端       | zsh                         | PowerShell                     |

现在你的 Python 开发环境已准备就绪。可以开始编写、调试和运行 Python 程序了！

   > 提示：建议使用 `black` 和 `ruff` 保持代码风格统一，提升开发效率。
   >
   > 本文档适用于 Python 初学者及课程教学使用。  
   > 支持平台：Apple Silicon Mac / Intel Mac / Windows 10/11

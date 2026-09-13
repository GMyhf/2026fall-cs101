# 在 VS Code 中写第一个 C++ 程序

*Updated 2026-09-13 17:03 GMT+8*
 *Compiled by Hongfei Yan (2025 Summer)*    

目标：在 macOS 或 Windows 的 VS Code 上编译、执行和调试 C++ 程序。

> 如需配置 Python 编程环境，请参考：[Python 开发环境配置指南](https://github.com/GMyhf/2026fall-cs101/blob/main/Python_Development_Setup_Mac_Windows.md)



# macOS 环境配置

## ✅ 第一步：安装必要工具

### 1. 安装 C++ 编译器（Xcode Command Line Tools）

打开 **终端 Terminal**，输入：

```bash
xcode-select --install
```

会弹出提示窗口，点击安装即可。这会安装 Apple 提供的 `clang++` 编译器和 `lldb` 调试器。macOS 上的 `/usr/bin/g++` 通常也是 Apple clang 的兼容入口，并不是 GNU GCC；本文在 macOS 部分优先使用 `clang++`。

> 如果提示已经安装过（`command line tools are already installed`），直接进行下一步。

检查是否安装成功：

```bash
clang++ --version
```

### 2. 安装 VS Code（已安装可跳过）

官网下载安装：https://code.visualstudio.com/

如果想在终端中用 `code .` 打开当前文件夹，需要在 VS Code 中按：

```
Command + Shift + P
```

搜索并执行：

```
Shell Command: Install 'code' command in PATH
```

### 3. 安装 VS Code C++ 扩展（一次性操作）

打开 VS Code，按下：

```
Command + Shift + X
```

在扩展市场搜索并安装：

```
C/C++（Microsoft 出品的）
```



## ✅ 第二步：写一个简单的 C++ 程序

### 1. 打开 VS Code，新建一个文件夹作为项目目录

比如目录为 `~/MyCpp`：

```bash
mkdir -p ~/MyCpp
cd ~/MyCpp
code .
```

这会直接以该目录作为工作区打开 VS Code。

### 2. 创建一个文件 `hello_world.cpp`，内容如下：

```cpp
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, world!" << endl;
    cout << "1" << endl;
    cout << "2" << endl;
    cout << "3" << endl;
    cout << "bye" << endl;
    return 0;
}
```



## ✅ 第三步：编译并运行程序

确保终端当前目录为项目路径，如 `~/MyCpp`：

```bash
clang++ -std=c++17 hello_world.cpp -o hello_world
./hello_world
```

输出应该是：

```
Hello, world!
1
2
3
bye
```



## ✅ （可选）第四步：设置 VS Code 的一键构建和调试

想要在 VS Code 里按快捷键就编译和调试，可以设置 Task：

1. 在项目根目录 `~/MyCpp` 下创建文件夹 `.vscode`
2. 新建文件 `.vscode/tasks.json`，内容如下：

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "type": "cppbuild",
            "label": "C/C++: clang++ build active file",
            "command": "/usr/bin/clang++",
            "args": [
                "-fdiagnostics-color=always",
                "-std=c++17",
                "-g",
                "${file}",
                "-o",
                "${fileDirname}/${fileBasenameNoExtension}"
            ],
            "options": {
                "cwd": "${fileDirname}"
            },
            "problemMatcher": [
                "$gcc"
            ],
            "group": {
                "kind": "build",
                "isDefault": true
            },
            "detail": "Build active C++ file with clang++."
        }
    ]
}
```

3. 新建文件 `.vscode/launch.json`，内容如下：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "debug current cpp file",
      "type": "cppdbg",
      "request": "launch",
      "program": "${fileDirname}/${fileBasenameNoExtension}",
      "args": [],
      "stopAtEntry": false,
      "cwd": "${fileDirname}",
      "environment": [],
      "externalConsole": true,
      "MIMode": "lldb",
      "preLaunchTask": "C/C++: clang++ build active file"
    }
  ]
}
```

然后在编辑器中打开 `hello_world.cpp`，按：

```
Command + Shift + B
```

选择 **C/C++: clang++ build active file** 即可编译。

可以在终端运行以下命令（确保当前目录中有 `hello_world`）：

```bash
./hello_world
```

输出应该是：

```
Hello, world!
1
2
3
bye
```

按 `F5` 可以编译并启动调试，具体用法见后面的 [在 VS Code 中图形化调试](#在-vs-code-中图形化调试两个平台通用)。

> 如果 Apple Silicon Mac 上用 `cppdbg` 调试时启动失败或卡住，可以改用 **CodeLLDB** 扩展（扩展市场搜索 `CodeLLDB`），它对 macOS 上的 lldb 支持更好。

------

> `Makefile` 目前不需要掌握。
>
> ✅ 提示：如果你要编写多个 C++ 文件、写工程项目，可考虑配置更高级的方式，例如：
>
> - 使用 `Makefile`
> - 使用 `CMake`
> - 安装 Code Runner 插件来快速运行简单 C++ 文件
>
>   注意：Code Runner 默认在“输出”面板里运行程序，**不能从键盘输入**，遇到 `cin` 会一直卡住。需要在 VS Code 设置中搜索 `code-runner.runInTerminal` 并勾选，让程序在终端里运行。



## ✅ 第五步：用 lldb 在终端调试程序

用 macOS 自带的 **lldb** 来调试一个“闰年判断”小程序。

在 **macOS 上调试 C++**，最稳妥的方式是：

- 编译用 `clang++`
- 调试用 `lldb`
- 在 VS Code 里用 **C/C++ 扩展**，一键编译运行调试（见后面的图形化调试）

新建文件 `leap.cpp`（左边的行号是为了方便下面对照，不要输入）：

```cpp
 1  #include <iostream>
 2  using namespace std;
 3
 4  int main() {
 5      int a;
 6      cin >> a;
 7
 8      if ((a % 4 == 0 && a % 100 != 0) || (a % 400 == 0)) {
 9          cout << "Y" << endl;
10      } else {
11          cout << "N" << endl;
12      }
13
14      return 0;
15  }
```

① 编译带调试信息的程序

要想用 lldb 单步调试，必须加 `-g`：

```bash
clang++ -std=c++17 -g leap.cpp -o leap
```

② 启动 lldb

```bash
lldb ./leap
```

你会看到类似：

```
(lldb) target create "./leap"
Current executable set to '/Users/你的用户名/MyCpp/leap' (arm64).
```

> Apple Silicon Mac 显示 `arm64`，Intel Mac 显示 `x86_64`。

> **调试权限**：第一次调试时，macOS 会弹窗要求输入开机密码，允许“开发者工具”控制其他进程，点允许即可。
>
> 如果是通过 ssh 远程登录到 Mac 上调试，没有弹窗，运行时会报：
>
> ```
> error: process exited with status -1 (this is a non-interactive debug session, cannot get permission to debug processes.)
> ```
>
> 这时需要先在 Mac 本机的终端执行一次 `sudo DevToolsSecurity -enable`（需要输入密码）。

③ 常用调试命令

1. **设置断点**（例如在 `main` 函数入口）：

   ```bash
   (lldb) break set -n main
   ```

   > 输出 `Breakpoint 1: 46 locations.` 这类提示是正常的：系统库里也有很多名叫 `main` 的方法，都被算进去了，但程序只会停在你自己写的 `main` 里。想只匹配自己的程序，可以写成 `break set -n main -s leap`。

   或者指定行号（第 8 行是 `if` 判断）：

   ```bash
   (lldb) break set -f leap.cpp -l 8
   ```

2. **运行程序**：

   ```bash
   (lldb) run
   ```

   程序会停在断点处，等待你调试。

3. **单步执行**：

   - 下一行（不进入函数）：

     ```bash
     (lldb) next
     ```

   - 进入函数：

     ```bash
     (lldb) step
     ```

     > 初学时建议只用 `next`。`step` 在调用你自己写的函数时才有用：它会进入函数内部，看完用 `finish` 跳出来。在 `cout`、`cin` 这样的行上，`step` 通常和 `next` 效果一样（实测 macOS 的 lldb 和 Windows MSYS2 的 gdb 都是如此）。

   - 跳出当前函数：

     ```bash
     (lldb) finish
     ```

4. **查看变量**：

   ```bash
   (lldb) print a
   ```

   或者更短：

   ```bash
   (lldb) p a
   ```

5. **继续运行直到下一个断点**：

   ```bash
   (lldb) continue
   ```

6. **退出调试**：

   ```bash
   (lldb) quit
   ```

④ 示例调试过程

在终端中依次输入（`(lldb)` 是提示符，不用输入）：

```bash
clang++ -std=c++17 -g leap.cpp -o leap
lldb ./leap
(lldb) break set -n main
(lldb) run
```

程序会停在 `main` 里**第一条真正执行的语句**，通常是第 6 行 `cin >> a;`（第 5 行 `int a;` 只是声明，不生成指令，所以不会停在那里）。lldb 会用 `->` 标出将要执行的行。

> 刚停下时 `cin` 还没执行，这时 `p a` 看到的是一个随机值，这是正常的。

接下来：

1. 输入 `next`，执行 `cin >> a;`。程序开始等待输入，直接在这个终端里输入 `2000` 并回车。
2. 程序停在第 8 行 `if`。输入 `p a`，应该显示 `(int) $0 = 2000`（`$0` 是 lldb 给结果编的序号，也可能是 `$1` 等）。
3. 再输入 `next`，停在第 9 行 `cout << "Y" << endl;`，说明条件成立，进入了 `if` 分支。
4. 再输入 `next`，终端输出 `Y`，程序停在第 10 行 `} else {`。这里并不是进入了 `else`，只是 `if` 分支结束的位置，不用担心。
5. 输入 `continue` 让程序运行结束，最后输入 `quit` 退出 lldb。

你就能一步步看到程序的执行流程。可以换成 `1900` 再调试一次，观察程序走进 `else` 分支。



# Windows 环境配置

## ✅ 第一步：安装必要工具

> 特别提醒：部分 MinGW-w64 / GCC 工具链在处理中文用户名、空格路径、特殊符号路径时可能出错。建议把 MSYS2、项目目录和临时目录都放在纯英文路径下，例如 `C:\msys64`、`D:\MyCpp`、`C:\Temp`。

### 1. 安装 C++ 编译器

在 Windows 下，选择 **MSYS2 + MinGW-w64**。

1. 打开官网，下载并运行安装包（建议使用默认安装路径 `C:\msys64`）：
   https://www.msys2.org/

2. 安装完成后，打开 **MSYS2 MSYS** 终端。

   **（推荐）国内网络先换成清华镜像**，在 MSYS2 终端中执行：

   ```bash
   sed -i "s#https\?://mirror.msys2.org/#https://mirrors.tuna.tsinghua.edu.cn/msys2/#g" /etc/pacman.d/mirrorlist*
   ```

   > 这条命令会修改 `/etc/pacman.d/` 下所有的镜像列表文件，把官方源替换成清华镜像。其他可选镜像：中科大 https://mirrors.ustc.edu.cn/msys2/ 、浙江大学 https://mirrors.zju.edu.cn/msys2/ （替换命令中的网址即可）。

3. 更新基础系统：

   ```bash
   pacman -Syu
   ```

   如果提示关闭终端，请关闭窗口，重新打开 **MSYS2 MSYS** 终端，再执行一次：

   ```bash
   pacman -Syu
   ```

4. 打开 **MSYS2 UCRT64** 终端，安装 C++ 编译器和调试器：

   ```bash
   pacman -S mingw-w64-ucrt-x86_64-gcc
   pacman -S mingw-w64-ucrt-x86_64-gdb
   ```

   > 如果下载软件包时出现网络错误，主要原因通常不是包有问题，而是网络传输中断或超时。
   >
   > 可以尝试：
   >
   > 1. **确认已换成国内镜像**（见上面第 2 步）
   >
   > 2. **增加超时时间**
   >
   >    ```bash
   >    pacman -Syu --disable-download-timeout
   >    ```
   >
   > 3. **多试几次**
   >
   >    ```bash
   >    pacman -Syu
   >    ```

5. 把 `g++` 加到 PATH（让 VS Code 终端能用）

   路径为：`C:\msys64\ucrt64\bin`

   > 按下：
   >
   > ```
   > Win + S -> 输入 “环境变量” -> 打开 “编辑系统环境变量” -> 环境变量
   > ```
   >
   > 在上半部分的 **用户变量** 里找到 `Path` -> 编辑 -> 新建 -> 粘贴上面的路径 -> 确定保存。（改“用户变量”不需要管理员权限）
   >
   > 关闭 VS Code，重新打开，让新 PATH 生效。
   >
   > ⚠️ 安装 gdb 时，MSYS2 会把它依赖的 Python 一起装进这个目录（`C:\msys64\ucrt64\bin\python.exe`）。如果你也装了官方 Python，请在 PowerShell 执行 `where.exe python`，确认**第一行**是 Python 官方安装的路径；如果第一行是 MSYS2 的路径，就在 `Path` 编辑窗口里把 Python 的路径上移到 MSYS2 路径之前。

6. 检查是否安装成功

   在**新打开的** VS Code 终端（PowerShell 或 CMD）里输入：

   ```powershell
   g++ --version
   gdb --version
   ```

   如果能显示版本号，说明安装成功。



### 2. 安装 VS Code（已安装可跳过）

下载地址：https://code.visualstudio.com/

> 安装时勾选“添加到 PATH”，之后就可以在终端中用 `code` 命令打开文件夹。

------

### 3. 安装 VS Code C++ 扩展（一次性操作）

打开 VS Code，按下：

```
Ctrl + Shift + X
```

在扩展市场搜索并安装：

```
C/C++（Microsoft 出品的）
```



## ✅ 第二步：写一个简单的 C++ 程序

### 1. 新建项目文件夹

例如：`D:\MyCpp`（没有 D 盘的话，用 `C:\MyCpp`。不要放在带中文的用户目录下）

在 **PowerShell 或 CMD** 中执行：

```powershell
mkdir D:\MyCpp
code D:\MyCpp
```

这会直接以该目录作为工作区打开 VS Code。

------

### 2. 创建 `hello_world.cpp`

内容如下：

```cpp
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, world!" << endl;
    cout << "1" << endl;
    cout << "2" << endl;
    cout << "3" << endl;
    cout << "bye" << endl;
    return 0;
}
```



## ✅ 第三步：编译并运行程序

确保终端当前目录为项目路径，例如：

```powershell
cd D:\MyCpp
```

编译：

```powershell
g++ -std=c++17 hello_world.cpp -o hello_world.exe
```

> 如果编译报错
>
> ```powershell
> PS D:\MyCpp> g++ -std=c++17 hello_world.cpp -o hello_world.exe
> Assembler messages:
> Fatal error: can't create C:\Users\
> PS D:\MyCpp>
> ```
>
> **用户名、临时目录或项目路径包含中文（非 ASCII 字符）时，会导致这类 `g++` 编译错误。**
>
> 实测（MSYS2 GCC 15.2）：临时目录含中文时，报上面的 `Fatal error: can't create ...`；用含中文的完整路径编译时，报 `ld.exe: cannot open output file ...: No such file or directory`。含空格的路径可以正常编译。
>
> 虽然现代操作系统和许多软件已经对 Unicode（包括中文）有了较好的支持，但部分 MinGW-w64 / GCC 工具链在处理包含非 ASCII 字符（如中文、空格、特殊符号）的路径时，仍然可能遇到兼容性问题。
>
> **✅ 解决方法：更改系统的临时目录（推荐，无需改用户名）**
>
> 1. **打开系统环境变量设置**
>
>    右键点击“此电脑”或“我的电脑” -> “属性” -> “高级系统设置” -> “环境变量”。
>
> 2. **修改临时目录变量**
>
>    在“用户变量”中找到 `TEMP` 和 `TMP`，将它们的值从类似 `C:\Users\你的中文用户名\AppData\Local\Temp` 修改为不包含中文和空格的路径，例如 `C:\Temp`。
>
>    需要先手动创建 `C:\Temp`，并确保你有读写权限。
>
> 3. **验证更改**
>
>    重新打开一个新的命令行窗口，验证环境变量是否已更改：
>
>    ```powershell
>    # PowerShell
>    echo $env:TEMP
>    echo $env:TMP
>    ```
>
>    ```bat
>    :: CMD
>    echo %TEMP%
>    echo %TMP%
>    ```
>
> 4. **重启命令行后重新编译**
>
>    ```powershell
>    g++ -std=c++17 hello_world.cpp -o hello_world.exe
>    ```

运行：

```powershell
.\hello_world.exe
```

输出应该是：

```
Hello, world!
1
2
3
bye
```



## ✅ （可选）第四步：VS Code 一键编译和调试

1. 在项目根目录 `D:\MyCpp` 下创建 `.vscode` 文件夹
2. 新建 `.vscode\tasks.json`：

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "type": "cppbuild",
            "label": "C/C++: g++ build active file",
            "command": "g++",
            "args": [
                "-fdiagnostics-color=always",
                "-std=c++17",
                "-g",
                "${file}",
                "-o",
                "${fileDirname}\\${fileBasenameNoExtension}.exe"
            ],
            "options": {
                "cwd": "${fileDirname}"
            },
            "problemMatcher": [
                "$gcc"
            ],
            "group": {
                "kind": "build",
                "isDefault": true
            },
            "detail": "Build active C++ file with Windows g++."
        }
    ]
}
```

3. 新建 `.vscode\launch.json`：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "debug current cpp file",
      "type": "cppdbg",
      "request": "launch",
      "program": "${fileDirname}\\${fileBasenameNoExtension}.exe",
      "args": [],
      "stopAtEntry": false,
      "cwd": "${fileDirname}",
      "environment": [],
      "externalConsole": true,
      "MIMode": "gdb",
      "miDebuggerPath": "C:\\msys64\\ucrt64\\bin\\gdb.exe",
      "preLaunchTask": "C/C++: g++ build active file"
    }
  ]
}
```

> 如果 MSYS2 没有装在默认的 `C:\msys64`，要把 `miDebuggerPath` 改成实际的 `gdb.exe` 路径（JSON 里的反斜杠要写成两个 `\\`）。
>
> 一键编译会把源文件的**完整路径**传给 `g++`，所以只要项目文件夹的路径里有中文，一键编译就会失败（报 `cannot open output file`）。请把项目放在纯英文路径下。

4. 在编辑器中打开 `hello_world.cpp`，按：

```
Ctrl + Shift + B
```

选择 **C/C++: g++ build active file** 即可编译。

运行则直接：

```powershell
.\hello_world.exe
```

按 `F5` 可以编译并启动调试，具体用法见下一节。



# 在 VS Code 中图形化调试（两个平台通用）

完成上面的“第四步”（`tasks.json` 和 `launch.json`）后，就可以在 VS Code 里用鼠标和快捷键调试，不需要记 lldb / gdb 命令。下面仍以 `leap.cpp` 为例（Windows 同学先按 macOS 第五步里的代码新建 `leap.cpp`，不要输入行号）。

1. 在 VS Code 中打开 `leap.cpp`，**确保当前编辑器里显示的就是这个文件**。
2. **设置断点**：鼠标移到第 8 行（`if` 那一行）行号的左侧，点击出现一个**红点**。
3. **开始调试**：按 `F5`。如果弹出选择框，选择 **debug current cpp file**。VS Code 会先编译，再启动程序。
4. **输入数据**：会弹出一个外部终端窗口，在里面输入 `2000` 并回车。
5. 程序停在第 8 行（该行高亮显示）。左侧“运行和调试”面板的 **变量（Variables）** 中可以看到 `a = 2000`，把鼠标悬停在代码里的 `a` 上也能看到值。
6. 用顶部调试工具栏或快捷键继续：

| 操作                         | 快捷键        |
| ---------------------------- | ------------- |
| 继续运行到下一个断点         | `F5`          |
| 单步跳过（下一行，不进函数） | `F10`         |
| 单步进入函数                 | `F11`         |
| 跳出当前函数                 | `Shift + F11` |
| 停止调试                     | `Shift + F5`  |

> Mac 笔记本上 `F5`、`F10` 等键可能需要同时按住 `fn`。
>
> 和命令行调试一样，初学时建议用 `F10`。`F11` 用于进入你自己写的函数，进去后按 `Shift + F11` 跳出来。



# 常见错误速查

## 1. `code: command not found`

macOS：在 VS Code 中按 `Command + Shift + P`，搜索并执行：

```
Shell Command: Install 'code' command in PATH
```

然后关闭终端，重新打开。

Windows：重新运行 VS Code 安装包并勾选“添加到 PATH”，然后重新打开终端。

## 2. 找不到 `g++`

Windows 上的报错一般是：

```
g++ : 无法将“g++”项识别为 cmdlet、函数、脚本文件或可运行程序的名称。
```

英文系统为 `The term 'g++' is not recognized as the name of a cmdlet, function, script file, or operable program.`（在 CMD 中是 `'g++' 不是内部或外部命令，也不是可运行的程序或批处理文件。`）

这通常是 PATH 没配好。检查 `C:\msys64\ucrt64\bin` 是否已经加入 PATH，并**重启 VS Code**（只新开终端标签页不够）。

macOS 上的报错是 `command not found: g++`，建议直接使用：

```bash
clang++ --version
```

如果也找不到，重新执行 `xcode-select --install`。

## 3. VS Code 按 F5 调试时提示找不到程序

先确认当前打开的是 `.cpp` 文件，并确认 `.vscode/tasks.json` 里的 `label` 与 `.vscode/launch.json` 里的 `preLaunchTask` 完全一致。

Windows 上如果提示找不到调试器，检查 `launch.json` 里 `miDebuggerPath` 的 `gdb.exe` 路径是否正确。

## 4. 程序需要输入，但不知道在哪里输入

本文的调试配置使用 `"externalConsole": true`。运行到 `cin` 时，请在弹出的外部终端窗口中输入数据。

如果用的是 Code Runner 插件，需要开启 `code-runner.runInTerminal`，否则无法输入（见第四步的提示）。

## 5. macOS 上 `#include <bits/stdc++.h>` 报错

很多 OJ 题解会写 `#include <bits/stdc++.h>`，但这是 GNU GCC 特有的头文件，macOS 自带的 clang **没有**，编译会报：

```
fatal error: 'bits/stdc++.h' file not found
```

解决方法：改成用到哪个头文件就写哪个，例如：

```cpp
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
```

Windows 上的 MSYS2 g++ 可以直接使用 `bits/stdc++.h`。

> 有些 Mac 上能编译通过，是因为之前有人手动把 `bits/stdc++.h` 复制进了系统头文件目录，并不是 clang 自带的。写代码时不要依赖它。

## 6. Windows 上输出中文是乱码

源文件是 UTF-8 编码，而 Windows 终端默认使用 GBK 编码显示，所以 `cout << "你好"` 会显示成乱码。任选一种方法：

- 运行前在终端里把编码切换为 UTF-8：

  ```powershell
  chcp 65001
  .\hello_world.exe
  ```

- 或者编译时让程序输出 GBK 编码：

  ```powershell
  g++ -std=c++17 -fexec-charset=GBK hello_world.cpp -o hello_world.exe
  ```

> 做 OJ 题时输出一般只有英文和数字，不受这个问题影响。

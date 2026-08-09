# 在 VS Code 中写第一个 C++ 程序

*Updated 2026-08-08 22:20 GMT+8*
 *Compiled by Hongfei Yan (2025 Summer)*    

目标：在 macOS 或 Windows 的 VS Code 上编译、执行和调试 C++ 程序。



# macOS 环境配置

## ✅ 第一步：安装必要工具

### 1. 安装 C++ 编译器（Xcode Command Line Tools）

打开 **终端 Terminal**，输入：

```bash
xcode-select --install
```

会弹出提示窗口，点击安装即可。这会安装 Apple 提供的 `clang++` 编译器。macOS 上的 `/usr/bin/g++` 通常也是 Apple clang 的兼容入口，并不是 GNU GCC；本文在 macOS 部分优先使用 `clang++`。

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

然后按：

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

------

> `Makefile` 目前不需要掌握。
>
> ✅ 提示：如果你要编写多个 C++ 文件、写工程项目，可考虑配置更高级的方式，例如：
>
> - 使用 `Makefile`
> - 使用 `CMake`
> - 安装 Code Runner 插件来快速运行简单 C++ 文件



## ✅ 第五步：调试程序

用 macOS 自带的 **lldb** 来调试一个“闰年判断”小程序。

在 **macOS 上调试 C++**，最稳妥的方式是：

- 编译用 `clang++`
- 调试用 `lldb`
- 在 VS Code 里用 **C/C++ 扩展**，一键编译运行调试

新建文件 `leap.cpp`：

```cpp
#include <iostream>
using namespace std;

int main() {
    int a;
    cin >> a;

    if ((a % 4 == 0 && a % 100 != 0) || (a % 400 == 0)) {
        cout << "Y" << endl;
    } else {
        cout << "N" << endl;
    }

    return 0;
}
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
(lldb) target create "leap"
Current executable set to 'leap' (x86_64).
```

③ 常用调试命令

1. **设置断点**（例如在 `main` 函数入口）：

   ```bash
   (lldb) break set -n main
   ```

   或者指定行号：

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

```bash
clang++ -std=c++17 -g leap.cpp -o leap
lldb ./leap
(lldb) break set -n main
(lldb) run
```

这时会卡在 `main` 的第一行。你输入：

```bash
(lldb) next      # 单步，走到 int a
(lldb) next      # 单步，走到 cin
(lldb) next      # 执行 cin，程序开始等待输入
```

程序会等待你输入数字，比如：

```
2000
```

继续调试：

```bash
(lldb) print a   # 打印变量 a，应该是 2000
(lldb) next      # 跳到 if 条件判断
(lldb) step      # 进入 if 分支
```

你就能一步步看到程序的执行流程，直到输出结果 `Y` 或 `N`。



# Windows 环境配置

## ✅ 第一步：安装必要工具

> 特别提醒：部分 MinGW-w64 / GCC 工具链在处理中文用户名、空格路径、特殊符号路径时可能出错。建议把 MSYS2、项目目录和临时目录都放在纯英文路径下，例如 `C:\msys64`、`D:\MyCpp`、`C:\Temp`。

### 1. 安装 C++ 编译器

在 Windows 下，选择 **MSYS2 + MinGW-w64**。

1. 打开官网安装包（建议从 MSYS2 下载最新版）：
   https://www.msys2.org/

2. 安装完成后，先打开 **MSYS2 MSYS** 终端，更新基础系统：

   ```bash
   pacman -Syu
   ```

   如果提示关闭终端，请关闭窗口，重新打开 **MSYS2 MSYS** 终端，再执行一次：

   ```bash
   pacman -Syu
   ```

   然后打开 **MSYS2 UCRT64** 终端，安装 C++ 编译器和调试器：

   ```bash
   pacman -S mingw-w64-ucrt-x86_64-gcc
   pacman -S mingw-w64-ucrt-x86_64-gdb
   ```

   > 如果下载软件包时出现网络错误，主要原因通常不是包有问题，而是网络传输中断或超时。
   >
   > 可以尝试：
   >
   > 1. **换镜像源**（推荐）
   >
   >    编辑 `C:\msys64\etc\pacman.d\mirrorlist.msys` 和对应的 MinGW 镜像列表，把官方源换成国内镜像，例如：
   >
   >    - 清华大学：https://mirrors.tuna.tsinghua.edu.cn/msys2/
   >    - 中科大：https://mirrors.ustc.edu.cn/msys2/
   >    - 浙江大学：https://mirrors.zju.edu.cn/msys2/
   >
   >    然后再执行：
   >
   >    ```bash
   >    pacman -Syyu
   >    ```
   >
   > 2. **增加超时时间**
   >
   >    ```bash
   >    pacman -Syu --disable-download-timeout
   >    ```
   >
   > 3. **尝试多次更新**
   >
   >    ```bash
   >    pacman -Syu
   >    ```

3. 把 `g++` 加到 PATH（让 VS Code 终端能用）

   例如：`C:\msys64\ucrt64\bin`

   > 按下：
   >
   > ```
   > Win + S -> 输入 “环境变量” -> 打开 “编辑系统环境变量” -> 环境变量
   > ```
   >
   > 在 **系统变量** 或 **用户变量** 里找到 `Path` -> 编辑 -> 新建 -> 粘贴上面的路径 -> 确定保存。
   >
   > 关闭 VS Code，重新打开，让新 PATH 生效。

4. 检查是否安装成功

   在 VS Code 终端（PowerShell 或 CMD）里输入：

   ```powershell
   g++ --version
   gdb --version
   ```

   如果能显示版本号，说明安装成功。



### 2. 安装 VS Code（已安装可跳过）

下载地址：https://code.visualstudio.com/

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

例如：`D:\MyCpp`

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
> **用户名、临时目录或项目路径包含中文、空格、特殊符号，都可能导致这类 `g++` 编译错误。**
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
>    重新打开一个新的 PowerShell 或 CMD 窗口，验证环境变量是否已更改：
>
>    ```powershell
>    echo $env:TEMP
>    echo $env:TMP
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
      "miDebuggerPath": "gdb",
      "preLaunchTask": "C/C++: g++ build active file"
    }
  ]
}
```

4. 在 VS Code 按：

```
Ctrl + Shift + B
```

选择 **C/C++: g++ build active file** 即可编译。

运行则直接：

```powershell
.\hello_world.exe
```



# 常见错误速查

## 1. `code: command not found`

在 VS Code 中按 `Command + Shift + P`，搜索并执行：

```
Shell Command: Install 'code' command in PATH
```

然后关闭终端，重新打开。

## 2. `g++: command not found`

Windows 上通常是 PATH 没配好。检查 `C:\msys64\ucrt64\bin` 是否已经加入 PATH，并重启 VS Code。

macOS 上建议直接使用：

```bash
clang++ --version
```

## 3. VS Code 按 F5 调试时提示找不到程序

先确认当前打开的是 `.cpp` 文件，并确认 `.vscode/tasks.json` 里的 `label` 与 `.vscode/launch.json` 里的 `preLaunchTask` 完全一致。

## 4. 程序需要输入，但不知道在哪里输入

本文的调试配置使用 `"externalConsole": true`。运行到 `cin` 时，请在弹出的外部终端窗口中输入数据。

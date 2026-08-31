# Github 使用方法

*Updated 2025-09-20 14:33 GMT+8*  
 *Compiled by Hongfei Yan (2025 Fall)*  



> 建议每位同学创建一个属于自己的课程学习仓库，例如：
>  https://github.com/twj-ink/2024fall

------

### 1. 注册账号

首先在 [Github 官网](https://github.com/) 注册一个账号。
 你可以直接在网页端上传、修改文件，也可以通过本地命令行来操作。

------

### 2. 本地使用 Git

- **Mac/Linux**：系统自带 `git` 命令，可直接使用。常用命令有：

  ```bash
  git add .
  git commit -m "提交说明"
  git push
  git pull
  ```

- **Windows**：需要先安装 Git 客户端，安装完成后会提供 Git Bash 窗口，命令与 Linux 相同。

更多 Git 入门教程可参考：
 [菜鸟教程 Git 指南](https://www.runoob.com/git/git-tutorial.html)

------

### 3. 在 clab 虚拟机中使用 Git

1. **安装 git**

   ```bash
   sudo dnf install -y git
   ```

2. **登录网关**

   ```bash
   python login.py   # 登录网关
   ```

3. **设置代理与配置**
    编辑配置文件：

   ```bash
   vi ~/.gitconfig
   ```

   示例配置：

   ```
   [http "https://github.com"]
       proxy = https://www.XXXXX.ltd/local.pac
   [user]
       email = ABC@pku.edu.cn
   [http]
       postBuffer = 524288000
   ```

4. **克隆仓库**

   ```bash
   mkdir ~/git
   cd ~/git
   git clone http://github.com/GMyhf/2025fall-cs101/   # 克隆到本地
   ```

------

### 4. 常用操作流程

进入仓库目录后，日常开发流程如下：

```bash
git pull                       # 更新远程代码
git add .                      # 添加修改的文件
git commit -m "说明文字"       # 提交到本地仓库
git push                       # 推送到远程仓库
```


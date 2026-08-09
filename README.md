# 2026fall-cs101: Alog DS （计算概论）

*Updated 2026-08-09 14:57 GMT+8*  
 *Compiled by Hongfei Yan (2026 Summer)*    
https://github.com/GMyhf/2026fall-cs101/



> 在计算机基础课程中，主要内容包括 **计算概论（Alog DS，计概）**、**数据结构与算法（DS Alog，数算）** 以及 **人工智能入门**。其中，在 AI 部分，将重点介绍神经网络的核心算法，并结合实战案例帮助大家加深理解。
>
> 我主要负责 **计概B、数算B 和 人工智能入门** 的教学。在课程群内，欢迎大家积极交流、分享经验。
>
> 在学习过程中，如遇到任何问题，都可以随时在课程群内讨论。
>
> 
>
> 北大信息门户 → `课表查询` / `课程介绍`，或访问 [课程查询系统](https://dean.pku.edu.cn/service/web/courseSearch.php)



## 1 题解 & 教材资源

题解，https://fuynaloft.github.io/sol101/

参考教材：

- 《Book_my_flight》、《计算机科学导论（第4版）》
- Python 学习：
  - [Python 3 教程（菜鸟教程）](https://www.runoob.com/python3/python3-tutorial.html)、《Python编程：从入门到实践（第3版）》
- 算法类教材：
  - 《算法笔记》（胡凡，曾磊）、《算法图解》、《算法基础与在线实践》
  - 《算法导论 第3版》（Cormen, Leiserson 等）



## 2 编程练习路径

**推荐学习顺序：**

1. **课程组精选 200+ 题目**

   - 链接：[CS101 OpenJudge](http://cs101.openjudge.cn/)
   - 加入方式：首次登录后 → 点击“加入” → 选择小组“cs101”。
   - 题型分级：E（简单）、M（中等）、T（挑战）。
   - 建议完成 **全部 Easy 和 Medium**，并尝试部分 Tough。

2. **LeetCode 热题 100**

   - 链接：[Top 100 Liked](https://leetcode.cn/studyplan/top-100-liked/)，建议优先完成除链表（14题）与二叉树（15题）外的部分。

   



## 3 重要信息

- **零基础学习路径**

  1. 搭建编程环境（1–3天）：安装 Python，配置 VS Code 或 PyCharm。[配置指南](https://github.com/GMyhf/2025fall-cs101/blob/main/Python_Development_Setup_Mac_Windows.md)
  2. 掌握基础语法（4–10天）：变量与数据类型、条件语句与循环结构、函数定义与使用、常用数据结构（列表、元组、字典、集合等）。建议结合动手练习，巩固理解。
  3. 持续编程训练（11–100天）：刷 OpenJudge →  LeetCode Top 100 / Codeforces / 洛谷。

- **开发工具建议**

  - Python：推荐使用 **PyCharm**。
  - C++：推荐使用 **VS Code**。[配置指南](https://github.com/GMyhf/2025fall-cs101/blob/main/Writing_First_C%2B%2B_Program_in_VS-Code.md)

- **课前准备**

  - 盲打技能训练与打字测试：[练习入口](https://github.com/GMyhf/2025fall-cs101/blob/main/question1_before_class.md)
  - O365（含 Teams）账号申请：[申请入口](https://www.wjx.cn/vm/Y5XwfHD.aspx#)
  - 阅读材料：《图灵与ACM图灵奖》《IEEE计算机先驱奖》
  - 推荐电影：《模仿游戏》（The Imitation Game, 2015）

- **平台与工具**

  - [VPN 使用说明](https://its.pku.edu.cn/service_1_vpn_client.jsp)
  - [云计算实验平台](https://clab.pku.edu.cn/)
  - [北京大学正版软件](https://software.pku.edu.cn/index.html)
  - 文档编辑推荐：Markdown 编辑器 [Typora](https://typoraio.cn/)（￥89，可激活3台设备），或免费替代 [Obsidian](https://obsidian.md/)。

- **计概课程计划**

  - 9月打好基础——自主攻克语法关；10月巩固提升——从矩阵、排序到贪心、栈、递归；11月挑战核心——深入动态规划（DP）和搜索算法；12月融会贯通——综合练习，厚积薄发。
  - **特别提醒（针对零基础同学）**：为确保跟上进度并取得扎实成果，**每周需保证至少8小时的课外学习时间**。学习期间不设中秋节、十一假期。整个学期，**预计需要完成150至200道以上的编程题目练习**。

- **提醒**

  - 若使用新电脑，请务必使用英文或汉语拼音设置用户名及目录名。避免使用中文或其他亚洲字符作为路径，以免在编程编译过程中引发兼容性问题或导致编译失败。

  - 许多新同学使用的是全新的笔记本电脑，而编程学习常需长时间连续使用设备。为保障设备安全，强烈建议：避免在电脑附近放置水杯或饮用液体；尽量不在使用电脑时进食或饮水。

    此前连续两年发生同学不慎将水洒入笔记本电脑的意外，造成严重硬件损坏，维修费用高昂，接近更换新机的成本。

- **其他资源**

  - [科学上网工具](https://wallesspku.org/blog/walless/2025/08/17/guide-zh.html)、[北京大学计算机基础科学与开发手册](https://github.com/ZangXuanyi/getting-started-handout)
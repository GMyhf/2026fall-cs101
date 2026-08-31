# 2025fall-cs101: Alog DS （计算概论）

*Updated 2025-09-07 13:43 GMT+8*  
 *Compiled by Hongfei Yan (2025 Summer)*    
https://github.com/GMyhf/2025fall-cs101/



> 在计算机基础课程中，主要内容包括 **计算概论（Alog DS，计概）**、**数据结构与算法（DS Alog，数算）** 以及 **人工智能入门**。其中，在 AI 部分，将重点介绍神经网络的核心算法，并结合实战案例帮助大家加深理解，甚至会探讨如何从零开始构建大型模型的方法。
>  
>我主要负责 **计概B、数算B 和 人工智能入门** 的教学。课程群内也有部分同学已完成 **A 类课程** 的学习，欢迎大家积极交流、分享经验。
> 
>在学习过程中，如遇到任何问题，都可以随时在课程群内讨论。




## 1 题解 & 教材资源

题解与题库：

- [2020fall-CS101 OpenJudge题解](https://github.com/GMyhf/2020fall-cs101/blob/main/2020fall_cs101.openjudge.cn_problems.md)、[2024fall-CS101 LeetCode Easy & Medium题解](https://github.com/GMyhf/2024fall-cs101/blob/main/2024fall_LeetCode_problems.md)、
[2024fall-CS101 LeetCode Tough题解](https://github.com/GMyhf/2024fall-cs101/blob/main/2024fall_LeetCode_tough_problems.md)
- [2020fall-CS101 Codeforces题解](https://github.com/GMyhf/2020fall-cs101/blob/main/2020fall_Codeforces_problems.md)、[2024spring-CS201 sunnywhy题解](https://github.com/GMyhf/2024spring-cs201/blob/main/sunnywhy_problems.md)

主要教材：

- 《Book_my_flight》、《计算机科学导论（第4版）》
- Python 学习：
  - [Python 3 教程（菜鸟教程）](https://www.runoob.com/python3/python3-tutorial.html)、《Python编程：从入门到实践（第3版）》
- 算法类教材：
  - 《算法笔记》（胡凡，曾磊）、《算法图解》、《算法基础与在线实践》
  - 《算法导论 第3版》（Cormen, Leiserson 等）
- AI 教材：
  - *Build a Large Language Model (From Scratch)* (Sebastian Raschka)，[代码链接](https://github.com/rasbt/LLMs-from-scratch)

------


## 2 计概B-11班 上课、机考和笔试

- **上课时间**：1–16 周，每周二 7–9 节（15:10–18:00）
- **上课地点**：理教 207（425 座位）
- **机考**：第16周 周四 7–8 节
  - 时间：2025年12月25日 15:08–17:00（1小时52分钟，共6题）
  - 地点：6号机房（6A 45台、6B 45台）、7号机房（108台）
- **笔试**：2026年1月6日（周二）14:00–16:00
- **成绩评定说明**：
  - AC5 或 AC6：基本可获优秀。
  - AC4：若笔试成绩较高，且未超优秀比例限制，仍有机会评为优秀。
  - AC0：即使笔试满分，总评最高为 84。

> 北大信息门户 → `课表查询` / `课程介绍`
>  或访问 [课程查询系统](https://dean.pku.edu.cn/service/web/courseSearch.php)

------

## 3 暑假预习指南

⚠️：秋季课程以 **Python** 为主，如同学坚持使用 **C++** 也可。

1. 登录 **小北智学平台**（[https://zx.pku.edu.cn](https://zx.pku.edu.cn/)），搜索并加入课程卡片 *“计算概论B（闫宏飞）”*，即可开启 **AI助教问答式自学**。
2. 本课程配套知识库涵盖教材、课件、题解，方便有一定基础的同学自主学习。
3. 学习中可随时向 AI 助教提问，例如：
   - “详细总结知识库内容”，“课程大纲有哪些？”，“课程主要内容是什么？”
4. 如需人工指导，请邮件联系：**[yanhf@pku.edu.cn](mailto:yanhf@pku.edu.cn)**

------

### 编程练习路径

**推荐学习顺序：**

1. **课程组精选 200+ 题目**
   - 链接：[CS101 OpenJudge](http://cs101.openjudge.cn/)
   - 加入方式：首次登录后 → 点击“加入” → 选择小组“cs101”。
   - 题型分级：E（简单）、M（中等）、T（挑战）。
   - 建议完成 **全部 Easy 和 Medium**，并尝试部分 Tough。
2. **LeetCode 热题 100**
   - 链接：[Top 100 Liked](https://leetcode.cn/studyplan/top-100-liked/)，建议优先完成除链表（14题）与二叉树（15题）外的部分。
3. **笔试准备**：[往年笔试题库](https://github.com/GMyhf/2024fall-cs101/blob/main/written_exam/written_exam_20241210.md)

------

## 4 在课程群发布的重要信息

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
  
- **选课建议**
  - 有信息学竞赛基础的同学可同时选“计算概论”和“数据结构与算法”。
  - 初学者建议第1学期先修“计算概论”，第2学期再选“数据结构与算法”。
  
- **计概B-11班课程计划**
  
  - 9月打好基础——自主攻克语法关；10月巩固提升——从矩阵、排序到贪心、栈、递归；11月挑战核心——深入动态规划（DP）和搜索算法；12月融会贯通——综合练习，厚积薄发。
  - **特别提醒（针对零基础同学）**：为确保跟上进度并取得扎实成果，**每周需保证至少8小时的课外学习时间**。学习期间不设中秋节、十一假期。整个学期，**预计需要完成150至200道以上的编程题目练习**。
  
- **提醒**

  - 若使用新电脑，请务必使用英文或汉语拼音设置用户名及目录名。避免使用中文或其他亚洲字符作为路径，以免在编程编译过程中引发兼容性问题或导致编译失败。

  - 许多新同学使用的是全新的笔记本电脑，而编程学习常需长时间连续使用设备。为保障设备安全，强烈建议：避免在电脑附近放置水杯或饮用液体；尽量不在使用电脑时进食或饮水。

    此前连续两年发生同学不慎将水洒入笔记本电脑的意外，造成严重硬件损坏，维修费用高昂，接近更换新机的成本。

- **其他资源**
  - [科学上网工具](https://wallesspku.org/blog/walless/2025/08/17/guide-zh.html)、[北京大学计算机基础科学与开发手册](https://github.com/ZangXuanyi/getting-started-handout)

------

✅ **总结**：
 这份课程指南为同学们提供了 **学习资源、课程安排、预习方法与学习路径**。零基础同学可循序渐进入门，有基础的同学也能通过算法题库和AI实战进一步提升。


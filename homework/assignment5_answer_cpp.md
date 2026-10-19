# Assignment #5: cs101 Mock Exam 寒露

*Updated: 2026-10-08 (GMT+8)*  
*完成学生：<mark>同学的姓名、院系</mark>*



>**说明：**
>
>截止日期：第四到六周作业统一于 10月20日 提交至 Canvas 平台。
>
>内容要求：每个题目包含：**解题思路**（可选）、**源代码**、**Accepted 截图**、**预估耗时**（可选）。
>



## 1. 题目

### E31295:宿舍的空调

http://cs101.openjudge.cn/practice/31295/

思路：



代码

```cpp
#include <iostream>
#include <algorithm>

using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    if (!(cin >> n)) return 0;

    // 先读入第 1 个人的区间作为初始范围
    long long max_l, min_r;
    cin >> max_l >> min_r;

    // 读入剩余的 n - 1 个人
    for (int i = 1; i < n; ++i) {
        long long l, r;
        cin >> l >> r;
        max_l = max(max_l, l);
        min_r = min(min_r, r);
    }

    if (max_l <= min_r) {
        cout << max_l << "\n";
    } else {
        cout << -1 << "\n";
    }

    return 0;
}
```



代码运行截图 <mark>（至少包含有"Accepted"）</mark>





### E31294:大肥鱼卖白饭

http://cs101.openjudge.cn/practice/31294/

思路：



代码

```cpp
#include <iostream>
#include <vector>

using namespace std;

int main() {
    // 加快输入输出
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    if (!(cin >> n)) return 0;

    int count5 = 0, count10 = 0;
    bool success = true;

    for (int i = 0; i < n; ++i) {
        int bill;
        cin >> bill;

        if (!success) continue; // 如果已经失败，仅读取剩余输入

        if (bill == 5) {
            count5++;
        } else if (bill == 10) {
            if (count5 > 0) {
                count5--;
                count10++;
            } else {
                success = false;
            }
        } else if (bill == 20) {
            // 优先找 10 + 5
            if (count10 > 0 && count5 > 0) {
                count10--;
                count5--;
            } else if (count5 >= 3) { // 否则找 5 + 5 + 5
                count5 -= 3;
            } else {
                success = false;
            }
        }
    }

    if (success) {
        cout << "YES\n";
    } else {
        cout << "NO\n";
    }

    return 0;
}
```



代码运行截图 <mark>（至少包含有"Accepted"）</mark>





### E31293:双十一凑单大作战

http://cs101.openjudge.cn/practice/31293/

思路：



代码

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    // 加快输入输出
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    if (!(cin >> n)) return 0;

    vector<long long> p(n);
    long long total_sum = 0;
    for (int i = 0; i < n; ++i) {
        cin >> p[i];
        total_sum += p[i];
    }

    // 从大到小排序
    sort(p.begin(), p.end(), greater<long long>());

    // 贪心减去第 3, 6, 9, ... 大的商品价格
    long long discount = 0;
    for (int i = 2; i < n; i += 3) {
        discount += p[i];
    }

    // 最少支付金额 = 总金额 - 减免金额
    cout << total_sum - discount << "\n";

    return 0;
}
```



代码运行截图 <mark>（至少包含有"Accepted"）</mark>





### M31297:恒星共振裂变

http://cs101.openjudge.cn/practice/31297/

思路：



代码

```cpp
#include <iostream>
#include <vector>

using namespace std;

const int MAXN = 1000000;
bool is_prime[MAXN + 1];
int primes[MAXN / 10];
int prime_cnt = 0;

// 欧拉筛预处理 10^6 以内的质数
void sieve() {
    for (int i = 2; i <= MAXN; ++i) {
        is_prime[i] = true;
    }
    for (int i = 2; i <= MAXN; ++i) {
        if (is_prime[i]) {
            primes[prime_cnt++] = i;
        }
        for (int j = 0; j < prime_cnt && i * primes[j] <= MAXN; ++j) {
            is_prime[i * primes[j]] = false;
            if (i % primes[j] == 0) break;
        }
    }
}

int main() {
    // 优化标准输入输出流
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    sieve();

    int T;
    if (!(cin >> T)) return 0;

    while (T--) {
        int n;
        cin >> n;

        if (n == 4) {
            cout << "2 2\n";
            continue;
        }

        int p1 = n / 2;
        // 确保从奇数开始枚举
        if (p1 % 2 == 0) {
            p1--;
        }

        // 从 n/2 向下枚举奇数
        while (p1 >= 3) {
            if (is_prime[p1] && is_prime[n - p1]) {
                cout << p1 << " " << n - p1 << "\n";
                break;
            }
            p1 -= 2;
        }
    }

    return 0;
}
```



代码运行截图 <mark>（至少包含有"Accepted"）</mark>





### M31296:“淹园”救援

http://cs101.openjudge.cn/practice/31296/

思路：



代码

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    // 优化输入输出效率
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    long long C;
    if (!(cin >> n >> C)) return 0;

    vector<long long> w(n);
    for (int i = 0; i < n; ++i) {
        cin >> w[i];
    }

    // 从小到大排序
    sort(w.begin(), w.end());

    int l = 0, r = n - 1;
    int boats = 0;

    // 双指针贪心
    while (l <= r) {
        if (l == r) { // 只剩最后一个人
            boats++;
            break;
        }
        if (w[l] + w[r] <= C) {
            l++; // 最轻的可以和最重的同乘一艘
        }
        r--;     // 最重的人必定消耗一艘艇
        boats++;
    }

    cout << boats << "\n";

    return 0;
}
```



代码运行截图 <mark>（至少包含有"Accepted"）</mark>





### T31298:警察招募又来了

http://cs101.openjudge.cn/practice/31298/

思路：



代码

```cpp
#include <iostream>
#include <queue>

using namespace std;

struct PoliceBatch {
    int expire_time;
    int count;
};

int main() {
    // 提高 I/O 速度
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, k;
    if (!(cin >> n >> k)) return 0;

    queue<PoliceBatch> q;
    int unhandled_crimes = 0;

    for (int i = 1; i <= n; ++i) {
        int a;
        cin >> a;

        if (a > 0) {
            // 招募警员
            q.push({i + k - 1, a});
        } else if (a == -1) {
            // 发生犯罪
            // 1. 清理已退役的警员
            while (!q.empty() && q.front().expire_time < i) {
                q.pop();
            }

            // 2. 检查是否有可用警员
            if (!q.empty()) {
                q.front().count--;
                if (q.front().count == 0) {
                    q.pop();
                }
            } else {
                unhandled_crimes++;
            }
        }
    }

    cout << unhandled_crimes << "\n";

    return 0;
}
```



代码运行截图 <mark>（至少包含有"Accepted"）</mark>





## 2. 学习总结和收获

<mark>如果作业题目简单，有否额外练习题目，比如：OJ“计概2026fall每日选做”、CF、LeetCode、洛谷等网站题目。</mark>



​	

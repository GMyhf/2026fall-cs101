#!/usr/bin/env python3
"""Red-team corpus for the current W16 OpenJudge mock-exam questions."""

from collections import deque


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def test_t1():
    groups = {}
    for x in range(12, 35):
        s = sum(map(int, str(x)))
        if s % 3 == 0:
            groups.setdefault(s, []).append(x)
    want = [(12, 21, 30), (15, 24, 33), (18, 27)]
    good = [tuple(groups[s]) for s in sorted(groups)]
    bad = [tuple(x for x in range(12, 35) if sum(map(int, str(x))) % 3 == 0)]
    require(good == want and bad != want, 'T1 grouping mutant survived')
    return 'T1: ignoring digit-sum equivalence classes WA'


def test_t2():
    heights, d = [3, 100, 4, 101], 2
    ordered = sorted(heights)
    good = all(ordered[i + 1] - ordered[i] <= d for i in range(0, 4, 2))
    bad = all(abs(heights[i] - heights[i + 1]) <= d for i in range(0, 4, 2))
    require(good and not bad, 'T2 fixture')
    return 'T2: pairing original neighbours instead of sorting WA'


def test_t3():
    a = [[1, 1, 1], [1, 100, 1], [1, 1, 1]]
    good = max(sum(a[i][j] for i, j in {(0, 0), (0, 1), (0, 2), (1, 0), (1, 2), (2, 0), (2, 1), (2, 2)}), a[1][1])
    bad = sum(a[0]) + sum(a[-1])
    require(good == 100 and bad != good, 'T3 border mutant survived')
    return 'T3: omitting vertical border cells WA'


def test_t4():
    from functools import lru_cache

    @lru_cache(None)
    def good(rem, left, low):
        if left == 1:
            return int(rem >= low)
        return sum(good(rem - x, left - 1, x) for x in range(low, rem // left + 1))

    def bad(rem, left):
        # Forgets the 'low' floor -> counts ordered compositions, not partitions.
        if left == 1:
            return int(rem >= 1)
        return sum(bad(rem - x, left - 1) for x in range(1, rem - left + 2))

    n, k = 7, 3
    want = good(n, k, 1)
    require(want == 4, 'T4 oracle')
    got_bad = bad(n, k)
    require(got_bad != want, 'T4 ordered-composition mutant survived')
    return f'T4: counting ordered compositions instead of partitions WA ({got_bad} vs {want})'


def test_t5():
    coins, reach, count = [1, 2, 5, 10], 0, 0
    while reach < 20:
        reach += max(c for c in coins if c <= reach + 1)
        count += 1
    bad_reach = bad = 0
    while bad_reach < 20:
        bad_reach += min(c for c in coins if c <= bad_reach + 1)
        bad += 1
    require(count == 5 and bad != count, 'T5 smallest-coin mutant survived')
    return 'T5: taking the smallest usable coin WA (20 vs 5)'


def best_queue(start, d):
    q, seen = deque([start]), {start}
    while q:
        cur = q.popleft()
        for i in range(len(cur) - 1):
            if abs(cur[i] - cur[i + 1]) <= d:
                nxt = cur[:i] + (cur[i + 1], cur[i]) + cur[i + 2:]
                if nxt not in seen:
                    seen.add(nxt)
                    q.append(nxt)
    return min(seen)


def test_t6():
    start, d, want = (7, 7, 3, 6, 2), 3, (6, 7, 7, 2, 3)
    require(best_queue(start, d) == want, 'T6 oracle')
    require(tuple(sorted(start)) != want, 'T6 global-sort mutant survived')
    return 'T6: globally sorting across unexchangeable barriers WA'


def main():
    tests = (test_t1, test_t2, test_t3, test_t4, test_t5, test_t6)
    for test in tests:
        print('✓', test())
    print(f'{len(tests)} 个当前 W16 真题红队用例族通过：每题至少一个可复现 WA 证据')


if __name__ == '__main__':
    main()

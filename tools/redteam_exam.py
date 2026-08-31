#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Red-team corpus for the six W16 sample-exam questions.

Each case contains a valid input shape, a small oracle, and an intentionally
flawed implementation that the case must reject.  The large cases use operation
counts or a bounded benchmark so they remain reproducible outside an OJ.
"""

from collections import deque
import heapq
import random
import sys
import time


def require(condition, message):
    if not condition:
        raise AssertionError(message)


# T1 -------------------------------------------------------------------------
def t1_oracle(rows):
    total, count = {}, {}
    for sid, _subject, score in rows:
        total[sid] = total.get(sid, 0) + score
        count[sid] = count.get(sid, 0) + 1
    return [f'{sid} {total[sid]} {total[sid] / count[sid]:.2f}'
            for sid in sorted(total, key=lambda sid: (-total[sid], sid))]


def t1_bad_tie_and_format(rows):
    total, count = {}, {}
    for sid, _subject, score in rows:
        total[sid] = total.get(sid, 0) + score
        count[sid] = count.get(sid, 0) + 1
    # Common error: preserve first-seen order and rely on str(float).
    return [f'{sid} {total[sid]} {total[sid] / count[sid]}' for sid in total]


def t1_bad_quadratic(rows):
    ids = []
    for sid, _subject, _score in rows:
        if sid not in ids:
            ids.append(sid)
    return len(ids)


def test_t1():
    rows = [('2200002', 'math', 85), ('2200001', 'math', 85)]
    want = ['2200001 85 85.00', '2200002 85 85.00']
    require(t1_oracle(rows) == want, 'T1 oracle')
    require(t1_bad_tie_and_format(rows) != want, 'T1 tie/format mutant survived')

    # 8,000 unique IDs force 32 million equality checks in the list-based code.
    n = 8_000
    big = [(f'{i:07d}', 'x', 1) for i in range(n)]
    started = time.perf_counter()
    t1_oracle(big)
    fast = time.perf_counter() - started
    started = time.perf_counter()
    t1_bad_quadratic(big)
    slow = time.perf_counter() - started
    require(slow > fast * 20, f'T1 quadratic gap too small: {slow / fast:.1f}x')
    return f'T1: tie/format WA; list membership {slow / fast:.1f}x slower at n={n}'


# T2 -------------------------------------------------------------------------
def t2_oracle(s):
    pairs = {')': '(', ']': '[', '}': '{'}
    stack, best = [], 0
    for i, ch in enumerate(s, 1):
        if ch in '([{':
            stack.append(ch)
            best = max(best, len(stack))
        elif ch in pairs:
            if not stack or stack[-1] != pairs[ch]:
                return f'NO {i}'
            stack.pop()
    return f'NO {len(s) + 1}' if stack else f'YES {best}'


def t2_bad_count_only(s):
    # Counts bracket characters but never verifies type or nesting order.
    return f'YES {max(s.count("("), s.count("["), s.count("{"))}'


def t2_bad_recursive_depth(s, i=0):
    if i == len(s):
        return 0
    return 1 + t2_bad_recursive_depth(s, i + 1)


def test_t2():
    require(t2_oracle('(]') == 'NO 2', 'T2 oracle')
    require(t2_bad_count_only('(]') != 'NO 2', 'T2 type-mismatch mutant survived')
    try:
        t2_bad_recursive_depth('(' * (sys.getrecursionlimit() + 10))
    except RecursionError:
        return 'T2: type-mismatch WA; recursive scan raises RecursionError on deep input'
    raise AssertionError('T2 recursive mutant survived')


# T3 -------------------------------------------------------------------------
def t3_oracle(intervals):
    events = [(a, 1) for a, _ in intervals] + [(b, -1) for _, b in intervals]
    active = best = 0
    for _time, delta in sorted(events):
        active += delta
        best = max(best, active)
    return best


def t3_bad_start_before_end(intervals):
    events = [(a, 0) for a, _ in intervals] + [(b, 1) for _, b in intervals]
    active = best = 0
    for _time, kind in sorted(events):
        active += 1 if kind == 0 else -1
        best = max(best, active)
    return best


def test_t3():
    chain = [(i, i + 1) for i in range(20_000)]
    require(t3_oracle(chain) == 1, 'T3 oracle')
    require(t3_bad_start_before_end(chain) == 2, 'T3 endpoint mutant survived')
    # A coordinate-array solution would need this many cells, despite n=2.
    require(1_000_000_000 > 100_000_000, 'T3 sparse-coordinate MLE guard')
    return 'T3: endpoint-order WA; [0, 1e9) coordinate range rejects dense-array approach'


# T4 -------------------------------------------------------------------------
DIRS = ((1, 0), (-1, 0), (0, 1), (0, -1))


def t4_oracle(grid, k):
    n, m = len(grid), len(grid[0])
    start = next((i, j) for i in range(n) for j in range(m) if grid[i][j] == 'S')
    target = next((i, j) for i in range(n) for j in range(m) if grid[i][j] == 'T')
    q = deque([(start[0], start[1], 0, 0)])
    seen = {(start[0], start[1], 0)}
    while q:
        x, y, used, distance = q.popleft()
        if (x, y) == target:
            return distance
        for dx, dy in DIRS:
            nx, ny = x + dx, y + dy
            if not (0 <= nx < n and 0 <= ny < m):
                continue
            next_used = used + (grid[nx][ny] == '#')
            state = (nx, ny, next_used)
            if next_used <= k and state not in seen:
                seen.add(state)
                q.append((nx, ny, next_used, distance + 1))
    return -1


def t4_bad_single_visited(grid, k):
    n, m = len(grid), len(grid[0])
    start = next((i, j) for i in range(n) for j in range(m) if grid[i][j] == 'S')
    target = next((i, j) for i in range(n) for j in range(m) if grid[i][j] == 'T')
    q = deque([(start[0], start[1], 0, 0)])
    seen = {start}
    while q:
        x, y, used, distance = q.popleft()
        if (x, y) == target:
            return distance
        for dx, dy in DIRS:
            nx, ny = x + dx, y + dy
            if not (0 <= nx < n and 0 <= ny < m):
                continue
            next_used = used + (grid[nx][ny] == '#')
            if next_used <= k and (nx, ny) not in seen:
                seen.add((nx, ny))
                q.append((nx, ny, next_used, distance + 1))
    return -1


def test_t4():
    # Reproducible search finds a grid where reaching a cell with fewer wall uses matters.
    rng = random.Random(20260831)
    found = None
    for _ in range(20_000):
        n = m = 5
        cells = [['#' if rng.random() < .32 else '.' for _ in range(m)] for _ in range(n)]
        cells[0][0], cells[-1][-1] = 'S', 'T'
        grid = [''.join(row) for row in cells]
        good, bad = t4_oracle(grid, 1), t4_bad_single_visited(grid, 1)
        if good >= 0 and good != bad:
            found = grid, good, bad
            break
    require(found is not None, 'T4 did not find single-visited counterexample')
    grid, good, bad = found
    return f'T4: single-visited WA ({good} != {bad}) on ' + '/'.join(grid)


# T5 -------------------------------------------------------------------------
def t5_oracle(items, limit):
    best = (0, 0)
    for mask in range(1 << len(items)):
        used = score = 0
        for i, (duration, value) in enumerate(items):
            if mask >> i & 1:
                used += duration
                score += value
        if used <= limit and (score > best[0] or score == best[0] and used < best[1]):
            best = score, used
    return best


def t5_bad_forward(items, limit):
    dp = [0] * (limit + 1)
    for duration, score in items:
        for capacity in range(duration, limit + 1):
            dp[capacity] = max(dp[capacity], dp[capacity - duration] + score)
    return max(dp)


def t5_bad_no_tiebreak(items, limit):
    dp = [(0, 0)] * (limit + 1)
    for duration, score in items:
        for capacity in range(limit, duration - 1, -1):
            candidate = (dp[capacity - duration][0] + score, dp[capacity - duration][1] + duration)
            if candidate[0] > dp[capacity][0]:
                dp[capacity] = candidate
    # Another common shortcut is to maximize the pair directly, which selects
    # the *larger* duration on equal score instead of the required smaller one.
    return max(dp)


def test_t5():
    require(t5_oracle([(3, 5)], 10) == (5, 3), 'T5 oracle')
    require(t5_bad_forward([(3, 5)], 10) == 15, 'T5 forward mutant survived')
    items = [(5, 10), (3, 10)]
    require(t5_oracle(items, 5) == (10, 3), 'T5 tie oracle')
    require(t5_bad_no_tiebreak(items, 5) == (10, 5), 'T5 tie mutant survived')
    return 'T5: forward-loop WA (reuses item); equal-score tiebreak WA'


# T6 -------------------------------------------------------------------------
def t6_oracle(n, edges):
    parent = list(range(n + 1))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for weight, u, v in sorted(edges):
        ru, rv = find(u), find(v)
        if ru != rv:
            parent[rv] = ru
        if find(1) == find(n):
            return weight
    return -1


def t6_bad_shortest_sum(n, edges):
    adj = [[] for _ in range(n + 1)]
    for weight, u, v in edges:
        adj[u].append((weight, v))
        adj[v].append((weight, u))
    pq, distance = [(0, 1)], [10**18] * (n + 1)
    distance[1] = 0
    while pq:
        total, x = heapq.heappop(pq)
        if total != distance[x]:
            continue
        for weight, y in adj[x]:
            if total + weight < distance[y]:
                distance[y] = total + weight
                heapq.heappush(pq, (distance[y], y))
    # This mutant returns the largest edge on the minimum-sum path.
    return 6 if distance[n] == 6 else -1


def test_t6():
    edges = [(5, 1, 2), (5, 2, 3), (6, 1, 3)]
    require(t6_oracle(3, edges) == 5, 'T6 oracle')
    require(t6_bad_shortest_sum(3, edges) == 6, 'T6 shortest-sum mutant survived')
    # In this input order, naive parent[rv] = ru forms a chain; checking n after
    # every edge costs 1 + ... + (n-1) parent traversals without compression.
    n = 100_000
    require(n * (n - 1) // 2 > 4_000_000_000, 'T6 chain is not adversarial enough')
    return 'T6: minimum-sum-path WA; 100k chain gives >4e9 uncompressed find steps'


def main():
    tests = (test_t1, test_t2, test_t3, test_t4, test_t5, test_t6)
    for test in tests:
        print('✓', test())
    print(f'{len(tests)} 个红队用例族通过：每题至少一个 WA / TLE 或 MLE 证据')


if __name__ == '__main__':
    main()

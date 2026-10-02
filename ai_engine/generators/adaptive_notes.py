from typing import Dict, Any, List

def precheck_topic_knowledge(topic: str, user_profile: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Evaluates candidate background on a requested topic and generates
    a 3-question diagnostic pre-check quiz before generating adaptive notes.
    """
    coding_stats = (user_profile or {}).get("codingStats", {})
    solved_count = coding_stats.get("leetcodeSolved", 0)

    # 3-question diagnostic question bank based on topic
    topic_clean = topic.lower()

    if "dynamic programming" in topic_clean or "dp" in topic_clean:
        diagnostic_questions = [
            {
                "id": "dp-diag-1",
                "question": "What is the primary distinguishing condition that proves a problem can be solved using Dynamic Programming rather than Greedy?",
                "options": [
                    "Optimal Substructure and Overlapping Subproblems",
                    "Continuous monotonically increasing input",
                    "The problem can be sorted in O(N log N)",
                    "Subproblems are completely independent and disjoint"
                ],
                "correctIndex": 0,
                "explanation": "DP requires both Optimal Substructure (an optimal solution to the problem contains optimal solutions to subproblems) and Overlapping Subproblems."
            },
            {
                "id": "dp-diag-2",
                "question": "In the standard 0/1 Knapsack problem with N items and capacity W, what is the minimum space complexity achievable with a 1D array?",
                "options": [
                    "O(N * W)",
                    "O(W) by iterating capacity backwards from W down to weight[i]",
                    "O(N) by sorting the items",
                    "O(1) with bitwise operations"
                ],
                "correctIndex": 1,
                "explanation": "Iterating backwards prevents using the same item multiple times, allowing 1D rolling array optimization in O(W) space."
            },
            {
                "id": "dp-diag-3",
                "question": "What is the time complexity of the optimal Longest Increasing Subsequence (LIS) algorithm?",
                "options": [
                    "O(N^2)",
                    "O(N log N) using Patience Sorting / Binary Search (std::lower_bound)",
                    "O(N)",
                    "O(2^N)"
                ],
                "correctIndex": 1,
                "explanation": "Maintaining a tails array with binary search reduces LIS from O(N^2) to O(N log N)."
            }
        ]
    elif "graph" in topic_clean:
        diagnostic_questions = [
            {
                "id": "graph-diag-1",
                "question": "Which algorithm is most optimal for finding the shortest path in an unweighted directed graph?",
                "options": [
                    "Breadth-First Search (BFS) in O(V + E)",
                    "Dijkstra's Algorithm in O(E log V)",
                    "Bellman-Ford in O(V * E)",
                    "Depth-First Search (DFS) in O(V!)"
                ],
                "correctIndex": 0,
                "explanation": "BFS visits vertices level by level, guaranteeing shortest path in unweighted graphs in O(V + E) without heap overhead."
            },
            {
                "id": "graph-diag-2",
                "question": "In Kahn's Algorithm for Topological Sorting, which vertices are initially pushed into the queue?",
                "options": [
                    "Vertices with in-degree equal to 0",
                    "Vertices with out-degree equal to 0",
                    "The vertex with the highest weight",
                    "Leaf nodes in the spanning tree"
                ],
                "correctIndex": 0,
                "explanation": "Vertices with in-degree 0 have no prerequisite dependencies and can execute first."
            },
            {
                "id": "graph-diag-3",
                "question": "What is the amortized time complexity per operation for Disjoint Set Union (DSU) with Path Compression and Union by Rank?",
                "options": [
                    "O(1) or O(alpha(N)) - Inverse Ackermann Function",
                    "O(log N)",
                    "O(N)",
                    "O(N^2)"
                ],
                "correctIndex": 0,
                "explanation": "With both optimizations, DSU runs in near constant time O(alpha(N)), effectively <= 4 for all practical universe inputs."
            }
        ]
    else:
        # Generic algorithm diagnostic
        diagnostic_questions = [
            {
                "id": "gen-diag-1",
                "question": f"When implementing an optimal solution for {topic}, what is the critical invariant condition?",
                "options": [
                    "Maintaining valid bounds and non-decreasing state progression",
                    "Randomizing array inputs",
                    "Always allocating O(N^2) memory buffer",
                    "Converting all data types to floating point"
                ],
                "correctIndex": 0,
                "explanation": "State invariants guarantee mathematical correctness through every iteration."
            },
            {
                "id": "gen-diag-2",
                "question": "Which data structure provides O(1) average lookup and O(1) amortized insertion?",
                "options": [
                    "Hash Table / Hash Map",
                    "Binary Search Tree (unbalanced)",
                    "Linked List",
                    "Binary Heap"
                ],
                "correctIndex": 0,
                "explanation": "Hash Tables achieve O(1) average operations via hashing functions and bucket chaining."
            },
            {
                "id": "gen-diag-3",
                "question": "What is the space complexity of a recursive call stack with depth D?",
                "options": [
                    "O(D)",
                    "O(1)",
                    "O(D^2)",
                    "O(log D)"
                ],
                "correctIndex": 0,
                "explanation": "Every recursive activation record consumes memory on the execution call stack proportional to recursion depth."
            }
        ]

    # Pre-diagnose initial level based on profile stats
    initial_tier = "NOVICE"
    if solved_count >= 150:
        initial_tier = "ADVANCED"
    elif solved_count >= 50:
        initial_tier = "INTERMEDIATE"

    return {
        "topic": topic,
        "precheckRequired": True,
        "initialDiagnosedTier": initial_tier,
        "diagnosticQuestions": diagnostic_questions,
        "instructions": f"Take this 60-second diagnostic pre-check. HierPrep will analyze your responses and generate adaptive notes tailored to your exact mastery level (Novice, Intermediate, or Advanced)."
    }

def generate_adaptive_notes(topic: str, tier: str = "INTERMEDIATE", score_pct: int = 70) -> Dict[str, Any]:
    """Generates structured, level-specific notes with code, edge cases, and interview traps."""
    tier = tier.upper()
    if tier not in ["NOVICE", "INTERMEDIATE", "ADVANCED"]:
        tier = "INTERMEDIATE"

    topic_name = topic.strip().title()

    if tier == "NOVICE":
        summary = f"A beginner-friendly breakdown of {topic_name}. We start with real-world intuition, step-by-step mental models, and line-by-line foundational implementations."
        sections = [
            {
                "title": f"1. What is {topic_name} and Why Does it Matter?",
                "content": f"{topic_name} is a powerful technique designed to prevent redundant computations and solve problems efficiently. Think of it like taking notes in class: instead of recalculating a complex formula from scratch every time, you write the result down in a notebook and look it up instantly.",
                "language": "javascript",
                "code": "// Novice Foundation Boilerplate\nfunction solveProblem(input) {\n  // Step 1: Base Case\n  if (!input || input.length === 0) return 0;\n  \n  // Step 2: Track state\n  let result = 0;\n  for (let i = 0; i < input.length; i++) {\n    // Step 3: Process element\n    result += input[i];\n  }\n  return result;\n}"
            },
            {
                "title": "2. Visual Mental Model & Common Pitfalls",
                "content": "Beginners often fail because they jump straight to writing code before identifying: \n• What is the smallest subproblem (Base Case)?\n• How do smaller subproblems combine to solve larger problems?\n• Always trace with an array of size 2 or 3 by hand before coding.",
                "language": "python",
                "code": "# Pythonic Clean Step-by-Step\ndef foundation_approach(data):\n    base_val = 0\n    seen = set()\n    for item in data:\n        if item not in seen:\n            seen.add(item)\n            base_val += 1\n    return base_val"
            }
        ]
    elif tier == "INTERMEDIATE":
        summary = f"Comprehensive SDE Placement notes for {topic_name}. Covers state transition equations, rolling space optimization, and edge-case traps tested in OA rounds."
        sections = [
            {
                "title": f"1. Formal State Invariants & Optimal Complexity",
                "content": f"In technical OA rounds (Amazon, Microsoft, Google), brute-force solutions trigger Time Limit Exceeded (TLE). We formulate the recurrence relation:\n• State definition: dp[i] represents the optimal metric up to index i.\n• Transition: dp[i] = max(dp[i-1], dp[i-2] + value[i]).\n• Space Optimization: Notice we only ever need dp[i-1] and dp[i-2]. We can eliminate the O(N) array to O(1) auxiliary memory using 2 rolling variables.",
                "language": "javascript",
                "code": "function optimalRollingState(nums) {\n  if (nums.length === 0) return 0;\n  if (nums.length === 1) return nums[0];\n  \n  let prev2 = nums[0];\n  let prev1 = Math.max(nums[0], nums[1]);\n  \n  for (let i = 2; i < nums.length; i++) {\n    const current = Math.max(prev1, prev2 + nums[i]);\n    prev2 = prev1;\n    prev1 = current;\n  }\n  \n  return prev1; // O(N) Time, O(1) Space\n}"
            },
            {
                "title": "2. Critical Edge Cases That Cause Wrong Answers (WA)",
                "content": "Look out for these 4 hidden pitfalls in coding assessments:\n1. Empty or single-element inputs (N = 0, N = 1).\n2. All negative values or duplicate elements.\n3. Integer overflow when values exceed 2^31 - 1 (use 64-bit integer / BigInt).\n4. Index out-of-bounds when accessing previous states.",
                "language": "cpp",
                "code": "// C++ Safe Edge Case Guard\n#include <vector>\n#include <algorithm>\n\nlong long optimalSolve(const std::vector<int>& arr) {\n    if (arr.empty()) return 0LL;\n    long long sum = 0;\n    for (long long x : arr) {\n        sum = std::max(sum, sum + x);\n    }\n    return sum;\n}"
            }
        ]
    else: # ADVANCED
        summary = f"Advanced Deep-Dive for {topic_name} targeting MAANG L4/L5 & High-Scale Systems. Covers cache locality, bitmasking, and amortized complexity proofs."
        sections = [
            {
                "title": "1. Multi-Dimensional Optimization & Bitmask State Compression",
                "content": "When subproblem states involve subsets of items (N <= 20), we compress states into a 32-bit integer mask. For each state mask (1 << N) - 1, transitions execute in O(1) bitwise operations (mask | (1 << i)).",
                "language": "cpp",
                "code": "// Advanced Bitmask State DP\n#include <vector>\n#include <cstring>\n\nint memo[1 << 16];\nint solveBitmask(int mask, int N, const std::vector<int>& costs) {\n    if (mask == (1 << N) - 1) return 0;\n    if (memo[mask] != -1) return memo[mask];\n    \n    int minCost = 1e9;\n    for (int i = 0; i < N; i++) {\n        if (!(mask & (1 << i))) {\n            minCost = std::min(minCost, costs[i] + solveBitmask(mask | (1 << i), N, costs));\n        }\n    }\n    return memo[mask] = minCost;\n}"
            },
            {
                "title": "2. Production Scale & Concurrency Trade-Offs",
                "content": "At production scale (e.g. distributed caches, live telemetry streams), algorithmic choice directly impacts CPU cache lines (L1/L2 cache hits) and branch prediction penalties. Prefer contiguous vector layouts over pointer-chasing node structures.",
                "language": "python",
                "code": "# Cache-friendly contiguous vector layout\nimport numpy as np\n\ndef vectorized_evaluation(matrix):\n    # Contiguous C-order memory layout maximizes CPU vectorization (SIMD)\n    c_array = np.ascontiguousarray(matrix, dtype=np.int64)\n    return np.max(np.cumsum(c_array, axis=1), axis=1)"
            }
        ]

    interview_questions = [
        {
            "question": f"Explain the optimal time and space complexity to solve {topic_name} at scale.",
            "answer": f"For {topic_name}, the optimal solution runs in O(N) or O(N log N) time by eliminating redundant traversals. Space complexity is optimized from O(N) to O(1) auxiliary variables using state reuse or two pointers."
        },
        {
            "question": f"How do you handle cycle detection or infinite loops in {topic_name}?",
            "answer": "Utilize three-color state tracking (UNVISITED=0, VISITING=1, VISITED=2) in directed graphs, or maintain a fast-slow pointer (Floyd's Tortoise and Hare) to identify cycles in O(1) space."
        },
        {
            "question": "What is the difference between Memoization (Top-Down) and Tabulation (Bottom-Up)?",
            "answer": "Top-Down memoization uses recursion with a lookup table (solves only required subproblems, but risks stack overflow). Bottom-Up tabulation iteratively builds solutions from base cases in a table (avoids recursion overhead and enables rolling space optimization)."
        }
    ]

    quick_takeaways = [
        f"Master the base cases first before attempting state equations in {topic_name}.",
        "Always evaluate if an O(N) array can be reduced to O(1) with rolling pointers.",
        "Check constraints: if N <= 20, consider Bitmasking; if N <= 10^5, aim for O(N log N) or O(N).",
        "Test edge cases: N = 0, duplicates, negative values, and integer overflows."
    ]

    return {
        "subject": "Core Algorithms & DSA",
        "topic": topic_name,
        "diagnosedTier": tier,
        "diagnosticScorePct": score_pct,
        "summary": summary,
        "sections": sections,
        "interviewQuestions": interview_questions,
        "quickTakeaways": quick_takeaways
    }

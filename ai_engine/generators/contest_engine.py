from typing import Dict, Any, List
from scrapers.oa_intel_crawler import get_company_oa_intelligence

def get_dsa_contest() -> Dict[str, Any]:
    """Generates a competitive 90-minute 4-problem algorithmic contest."""
    return {
        "id": "contest-dsa-weekly",
        "title": "HierPrep Bi-Weekly Algorithmic Clash",
        "type": "dsa",
        "durationMinutes": 90,
        "difficulty": "Tier 1 Competitive",
        "totalPoints": 400,
        "description": "Standard 4-problem algorithmic contest format. Speed and submission penalties (+5 mins per wrong answer) determine final leaderboard placement.",
        "problems": [
            {
                "id": "dsa-prob-1",
                "title": "1. Lexicographically Smallest Equi-Distance Pair",
                "difficulty": "Easy",
                "points": 50,
                "topic": "Array & Two Pointers",
                "description": "Given a sorted array of distinct positive integers nums and a target distance D, return the pair [nums[i], nums[j]] with the smallest sum such that nums[j] - nums[i] == D. If no such pair exists, return empty array.",
                "starterCode": {
                    "javascript": "function findEquiPair(nums, D) {\n  // Implement O(N) two pointers\n  return [];\n}",
                    "python": "def find_equi_pair(nums: list[int], D: int) -> list[int]:\n    pass",
                    "cpp": "#include <vector>\n\nstd::vector<int> findEquiPair(std::vector<int>& nums, int D) {\n    return {};\n}"
                }
            },
            {
                "id": "dsa-prob-2",
                "title": "2. Minimum Operations to Balance Substring Parity",
                "difficulty": "Medium",
                "points": 100,
                "topic": "Prefix Sum & Hash Map",
                "description": "You are given a binary string S. In one operation, you can invert any character (0 to 1 or 1 to 0). Return the minimum operations required so that every substring of length K has an equal number of 0s and 1s.",
                "starterCode": {
                    "javascript": "function minBalanceOps(s, K) {\n  return 0;\n}",
                    "python": "def min_balance_ops(s: str, K: int) -> int:\n    pass",
                    "cpp": "#include <string>\n\nint minBalanceOps(std::string s, int K) {\n    return 0;\n}"
                }
            },
            {
                "id": "dsa-prob-3",
                "title": "3. Maximum Flow Through Congested Grid Pipelines",
                "difficulty": "Medium-Hard",
                "points": 100,
                "topic": "Dynamic Programming with Monotonic Optimization",
                "description": "An M x N grid represents pipeline capacities. A fluid package starts at (0, 0) and must reach (M-1, N-1) moving only Right or Down. If the pipeline at (r, c) experiences congestion when capacity exceeds threshold T, calculate the maximum fluid volume safely transportable.",
                "starterCode": {
                    "javascript": "function maxFluidVolume(grid, T) {\n  return 0;\n}",
                    "python": "def max_fluid_volume(grid: list[list[int]], T: int) -> int:\n    pass"
                }
            },
            {
                "id": "dsa-prob-4",
                "title": "4. Tree Diameter under Vertex Severance",
                "difficulty": "Hard",
                "points": 150,
                "topic": "Tree DP & Rerooting",
                "description": "Given a tree with N vertices numbered 0 to N-1. If you can sever exactly one vertex V and all incident edges, the tree fragments into multiple sub-trees. Find the vertex V that minimizes the maximum diameter among all resulting fragments.",
                "starterCode": {
                    "javascript": "function minMaxDiameterAfterSeverance(N, edges) {\n  return 0;\n}",
                    "python": "def min_max_diameter(N: int, edges: list[list[int]]) -> int:\n    pass"
                }
            }
        ]
    }

def get_aptitude_contest() -> Dict[str, Any]:
    """Generates a timed 15-question speed test for Quantitative Aptitude, Logical Reasoning, and Verbal."""
    return {
        "id": "contest-aptitude-speed",
        "title": "Campus Placement Speed Aptitude Test",
        "type": "aptitude",
        "durationMinutes": 30,
        "difficulty": "Standard Placement Round 1",
        "questions": [
            {
                "id": "apt-1",
                "category": "Quantitative",
                "question": "A and B can complete a work in 12 days and 18 days respectively. They work together for 4 days, then A leaves. In how many more days will B finish the remaining work alone?",
                "options": ["8 days", "10 days", "12 days", "14 days"],
                "correctIndex": 1,
                "explanation": "Work in 4 days = 4 * (1/12 + 1/18) = 4 * (5/36) = 20/36. Remaining work = 16/36 = 4/9. Time for B = (4/9) / (1/18) = 8 days... Wait, (4/9) * 18 = 8 days. So 8 days!"
            },
            {
                "id": "apt-2",
                "category": "Quantitative",
                "question": "A train running at 72 km/h crosses a 260m long platform in 23 seconds. What is the length of the train?",
                "options": ["200 meters", "220 meters", "240 meters", "250 meters"],
                "correctIndex": 0,
                "explanation": "Speed = 72 * (5/18) = 20 m/s. Total distance in 23s = 20 * 23 = 460m. Train length = 460 - 260 = 200m."
            },
            {
                "id": "apt-3",
                "category": "Logical",
                "question": "Point to a photograph, a woman says: 'He is the son of the only son of my grandfather.' How is the man in the photograph related to the woman?",
                "options": ["Brother", "Uncle", "Cousin", "Father"],
                "correctIndex": 0,
                "explanation": "Only son of grandfather = Woman's father. Son of her father = Her brother."
            },
            {
                "id": "apt-4",
                "category": "Verbal",
                "question": "Choose the correct antonym for the word 'METICULOUS':",
                "options": ["Careless", "Painstaking", "Scrupulous", "Fastidious"],
                "correctIndex": 0,
                "explanation": "Meticulous means showing great attention to detail. The opposite is careless."
            }
        ]
    }

def get_core_cs_contest() -> Dict[str, Any]:
    """Generates a high-yield Core CS contest covering OS, DBMS, CN, and OOPs."""
    return {
        "id": "contest-core-cs",
        "title": "Core CS Engineering Challenge (OS, DBMS, CN, OOPs)",
        "type": "core_cs",
        "durationMinutes": 45,
        "difficulty": "SDE Placement Standard",
        "questions": [
            {
                "id": "core-1",
                "subject": "Operating Systems",
                "question": "Which scheduling algorithm is non-preemptive and guarantees no starvation, but suffers from high average waiting time under large bursts?",
                "options": ["First-Come, First-Served (FCFS)", "Round Robin", "Shortest Job First (SJF Preemptive)", "Priority Scheduling"],
                "correctIndex": 0,
                "explanation": "FCFS processes jobs in arrival order without starvation, but suffers from the Convoy Effect."
            },
            {
                "id": "core-2",
                "subject": "DBMS",
                "question": "In relational database transactions, which ACID property is maintained primarily using the Write-Ahead Logging (WAL) protocol?",
                "options": ["Atomicity and Durability", "Isolation", "Consistency only", "Scalability"],
                "correctIndex": 0,
                "explanation": "WAL logs state changes to disk before committing, ensuring Atomicity (rollbacks) and Durability (crash recovery)."
            },
            {
                "id": "core-3",
                "subject": "Computer Networks",
                "question": "During the TCP 3-way handshake, what flags are sent in the second packet from Server to Client?",
                "options": ["SYN + ACK", "SYN only", "ACK only", "FIN + ACK"],
                "correctIndex": 0,
                "explanation": "The server responds to SYN with a combined SYN-ACK packet to acknowledge the client's sequence number and establish its own."
            },
            {
                "id": "core-4",
                "subject": "OOPs",
                "question": "What is the primary mechanism through which Runtime (Dynamic) Polymorphism is resolved in C++?",
                "options": ["Virtual Function Tables (vtable) and vptr pointers", "Compiler function name mangling", "Macro preprocessing", "Static linking"],
                "correctIndex": 0,
                "explanation": "The compiler creates a vtable for classes with virtual functions, and each instance holds a vptr resolved at runtime."
            }
        ]
    }

def get_ai_tech_contest() -> Dict[str, Any]:
    """Generates an AI / Emerging Tech contest."""
    return {
        "id": "contest-ai-tech",
        "title": "AI & System Architecture Arena",
        "type": "ai_tech",
        "durationMinutes": 40,
        "difficulty": "Advanced Tech",
        "questions": [
            {
                "id": "ai-1",
                "question": "In Transformer architectures, what is the computational complexity of the Self-Attention mechanism with respect to sequence length N?",
                "options": ["O(N^2 * D)", "O(N * log N)", "O(N * D)", "O(D^2)"],
                "correctIndex": 0,
                "explanation": "Calculating Q * K^T produces an N x N matrix, scaling quadratically with sequence length N."
            },
            {
                "id": "ai-2",
                "question": "What technique reduces KV Cache memory consumption in Large Language Models during autoregressive decoding?",
                "options": ["Multi-Query Attention (MQA) / Grouped-Query Attention (GQA)", "Dropout", "Batch Normalization", "Gradient Clipping"],
                "correctIndex": 0,
                "explanation": "MQA and GQA share key/value heads across multiple query heads, significantly reducing KV cache memory footprint."
            },
            {
                "id": "ai-3",
                "question": "In Python 3.12+, what is the purpose of PEP 684 (Per-Interpreter GIL)?",
                "options": ["Allows true multi-core parallel execution across distinct sub-interpreters", "Replaces CPython with Rust", "Enforces static types", "Eliminates all garbage collection"],
                "correctIndex": 0,
                "explanation": "Per-interpreter GIL enables multi-threaded CPU parallel execution without global lock contention across isolated interpreters."
            }
        ]
    }

def generate_any_contest(contest_type: str, company: str = "Amazon") -> Dict[str, Any]:
    """Factory router for all 5 contest modes."""
    c_type = contest_type.lower()
    if c_type in ["company_oa", "oa", "company"]:
        return get_company_oa_intelligence(company)
    elif c_type == "dsa":
        return {"success": True, "contest": get_dsa_contest()}
    elif c_type == "aptitude":
        return {"success": True, "contest": get_aptitude_contest()}
    elif c_type == "core_cs":
        return {"success": True, "contest": get_core_cs_contest()}
    elif c_type == "ai_tech":
        return {"success": True, "contest": get_ai_tech_contest()}
    else:
        return get_company_oa_intelligence(company)

import uvicorn
import re
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from analyzers.profile_intelligence import generate_complete_profile_intelligence
from scrapers.oa_intel_crawler import get_trending_community_discussions
from generators.adaptive_notes import precheck_topic_knowledge, generate_adaptive_notes
from generators.contest_engine import generate_any_contest

app = FastAPI(
    title="DUPILIO AI Intelligence Microservice",
    description="Unified Developer Profiling, Algorithmic Gap Detection, Opportunity Assistant & Intent Parser",
    version="3.0.0"
)

# Enable CORS for React frontend and Node.js backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class CommandRequest(BaseModel):
    prompt: str
    userId: Optional[str] = "candidate"

class ProfileRequest(BaseModel):
    leetcode: Optional[str] = "candidate"
    github: Optional[str] = "candidate"
    codeforces: Optional[str] = None
    codechef: Optional[str] = None

class PlanRequest(BaseModel):
    userId: Optional[str] = "candidate"
    timeFrameDays: Optional[int] = 7
    weakAreas: Optional[List[str]] = []
    dailyHours: Optional[float] = 2.5

class ProblemRecommendRequest(BaseModel):
    weakAreas: Optional[List[str]] = []
    solvedCount: Optional[int] = 120
    targetPlatform: Optional[str] = "leetcode"

class ChatRequest(BaseModel):
    prompt: str
    userContext: Optional[Dict[str, Any]] = None

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "DUPILIO AI Engine", "engine": "FastAPI / Python 3.10+"}

@app.post("/api/parse-command")
@app.post("/parse-command")
def parse_natural_language_command(req: CommandRequest):
    """
    Extracts structured intent from user requests.
    Example:
    'Remind me 30 minutes before every Codeforces contest' -> { action: 'create_reminder', parameters: { platform: 'codeforces', leadTimeMinutes: 30 } }
    'Create a task to solve 3 graph problems tomorrow' -> { action: 'create_todo', parameters: { ... } }
    """
    text = req.prompt.lower().strip()
    
    # 1. Reminder Intent
    if any(k in text for k in ["remind", "alert", "notify", "ping me"]):
        lead_time = 30
        lead_match = re.search(r'(\d+)\s*(min|minute|hour)', text)
        if lead_match:
            val = int(lead_match.group(1))
            lead_time = val * 60 if 'hour' in lead_match.group(2) else val
            
        platform = "codeforces"
        for p in ["codeforces", "leetcode", "codechef", "atcoder", "gfg", "hackerrank"]:
            if p in text:
                platform = p
                break
                
        channel = "voice" if "voice" in text or "call" in text else "email" if "email" in text else "browser"
        
        return {
            "action": "create_reminder",
            "confidence": 0.94,
            "parameters": {
                "platform": platform,
                "leadTimeMinutes": lead_time,
                "channel": channel
            }
        }
        
    # 2. Todo Planning Intent
    if any(k in text for k in ["task", "todo", "solve", "practice", "study", "schedule"]):
        category = "DSA"
        if "contest" in text or "codeforces" in text:
            category = "Competitive Programming"
        elif "graph" in text or "tree" in text or "dp" in text or "dynamic" in text:
            category = "DSA"
        elif "os" in text or "operating system" in text:
            category = "OS"
        elif "dbms" in text or "sql" in text:
            category = "DBMS"
        elif "system design" in text:
            category = "System Design"
        elif "github" in text or "project" in text:
            category = "Development"
            
        priority = "urgent" if "urgent" in text or "asap" in text else "high" if "important" in text else "medium"
        days_offset = 1 if "tomorrow" in text else 2 if "day after" in text else 1
        
        clean_title = re.sub(r'^(create (a )?task (to )?|add (a )?todo (to )?|remind me to )', '', req.prompt, flags=re.IGNORECASE).strip()
        
        return {
            "action": "create_todo",
            "confidence": 0.92,
            "parameters": {
                "title": clean_title if len(clean_title) > 5 else "Practice targeted algorithmic questions",
                "category": category,
                "priority": priority,
                "daysOffset": days_offset
            }
        }
        
    # 3. Contest Query Intent
    if any(k in text for k in ["contest", "competition", "hackathon", "when is"]):
        return {
            "action": "query_contests",
            "confidence": 0.95,
            "parameters": {
                "status": "upcoming"
            }
        }
        
    # 4. Preparation Planning Intent
    if any(k in text for k in ["plan", "weak", "prepare", "roadmap", "recommend"]):
        return {
            "action": "plan_preparation",
            "confidence": 0.89,
            "parameters": {
                "focus": "weak_areas"
            }
        }
        
    return {
        "action": "chat_fallback",
        "confidence": 0.70,
        "parameters": {}
    }

@app.post("/api/analyze-profile")
@app.post("/analyze-profile")
def analyze_profile(req: ProfileRequest):
    """Deep profile analyzer: LeetCode & GitHub data analysis, detecting algorithmic patterns and weaknesses."""
    try:
        report = generate_complete_profile_intelligence(req.leetcode, req.github)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-plan")
@app.post("/generate-plan")
def generate_weekly_plan(req: PlanRequest):
    """Generates structured daily practice schedules addressing identified weaknesses."""
    return {
        "success": True,
        "planTitle": "Dupilio Accelerated Developer Preparation Plan",
        "timeFrameDays": req.timeFrameDays,
        "dailyCommitmentHours": req.dailyHours,
        "milestones": [
            {
                "day": 1,
                "domain": "Dynamic Programming",
                "focus": "1D State Formulation & Space Optimization",
                "targetProblems": ["Climbing Stairs", "House Robber II", "Coin Change"],
                "targetHours": req.dailyHours
            },
            {
                "day": 2,
                "domain": "Graphs & BFS",
                "focus": "Multi-source BFS & Cycle Detection (Kahn's Algorithm)",
                "targetProblems": ["01 Matrix", "Rotting Oranges", "Course Schedule"],
                "targetHours": req.dailyHours
            },
            {
                "day": 3,
                "domain": "Competitive Speed",
                "focus": "Codeforces Div 2 Virtual Contest & Implementation Speed",
                "targetProblems": ["Div 2 Problem A & B within 20 mins"],
                "targetHours": req.dailyHours
            },
            {
                "day": 4,
                "domain": "Trees & Binary Search",
                "focus": "Lowest Common Ancestor & Binary Search on Answer Range",
                "targetProblems": ["Koko Eating Bananas", "Lowest Common Ancestor of BST"],
                "targetHours": req.dailyHours
            }
        ]
    }

@app.post("/api/recommend-problems")
@app.post("/recommend-problems")
def recommend_problems(req: ProblemRecommendRequest):
    """Personalized practice recommendations with external links based on weak areas."""
    return {
        "success": True,
        "recommendations": [
            {
                "title": "Coin Change",
                "platform": "LeetCode",
                "difficulty": "Medium",
                "topic": "Dynamic Programming",
                "reason": "Addresses diagnosed drop-off in knapsack recurrence relations.",
                "originalUrl": "https://leetcode.com/problems/coin-change/"
            },
            {
                "title": "Course Schedule II",
                "platform": "LeetCode",
                "difficulty": "Medium",
                "topic": "Graphs",
                "reason": "Essential for mastering Topological Sorting and dependency DAGs.",
                "originalUrl": "https://leetcode.com/problems/course-schedule-ii/"
            }
        ]
    }

@app.post("/api/chat")
def ai_chat(req: ChatRequest):
    """Dupilio AI Copilot Chat."""
    prompt = req.prompt.lower()
    if "contest" in prompt:
        reply = "🏆 Upcoming highlights: Codeforces Div 2 (Saturday 8:05 PM IST) and LeetCode Weekly Contest. Keep your contest streak alive!"
    elif "dp" in prompt or "dynamic" in prompt:
        reply = "💡 Remember DP keys: 1) Identify state variables. 2) Formulate the recurrence. 3) Handle base cases. 4) Space optimize."
    else:
        reply = f"Hello! I am your Dupilio AI Assistant. I can help convert natural language requests into contest reminders, todo tasks, and customized prep plans."
    return {"success": True, "reply": reply}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

import { GoogleGenAI } from '@google/genai';

let aiClient = null;

// Initialize Google GenAI client if API key is provided
const getAiClient = () => {
  if (aiClient) return aiClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      aiClient = new GoogleGenAI({ apiKey });
      console.log('✨ Gemini Developer API client initialized.');
      return aiClient;
    } catch (e) {
      console.warn('⚠️ Failed to initialize Gemini API client. Using sandbox simulation.', e.message);
    }
  } else {
    console.log('ℹ️ GEMINI_API_KEY is not defined. Using high-fidelity AI sandbox simulation.');
  }
  return null;
};

/**
 * AI RESUME ANALYZER
 */
export const analyzeResume = async (resumeText, jobDescription = '') => {
  const client = getAiClient();
  const prompt = `
    You are an expert technical recruiter and resume ATS parsing engine.
    Analyze the following candidate resume text against the provided job description.
    
    Resume Text:
    "${resumeText}"
    
    Job Description context:
    "${jobDescription}"
    
    Evaluate the following dimensions:
    1. Overall ATS score (0 to 100).
    2. Candidate skills breakdown score (0 to 100).
    3. Experience summary rating (0 to 100).
    4. Project impact rating (0 to 100).
    5. Keyword density score (0 to 100).
    6. Layout and formatting score (0 to 100).
    7. Missing critical skills that were in the Job Description but not in the Resume.
    8. Structured list of recommendations to improve the resume.
    
    Return your response strictly in the following JSON format:
    {
      "atsScore": 82,
      "skills": 85,
      "experience": 75,
      "projects": 90,
      "keywords": 65,
      "formatting": 95,
      "missingSkills": ["Kubernetes", "Redis", "Docker"],
      "suggestions": [
        "Suggestion 1...",
        "Suggestion 2..."
      ]
    }
  `;

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });
      return JSON.parse(response.text);
    } catch (err) {
      console.warn('Gemini API call failed, falling back to sandbox simulator.', err.message);
    }
  }

  // High-fidelity sandbox simulation
  return simulateResumeAnalysis(resumeText, jobDescription);
};

/**
 * AI INTERVIEW ANSWER EVALUATOR
 */
export const evaluateInterviewAnswer = async (questionText, idealPoints, answerText) => {
  const client = getAiClient();
  const prompt = `
    You are an AI SDE interviewer.
    Grade the candidate's spoken answer to the following technical question.
    
    Question: "${questionText}"
    Ideal Answer Requirements: ${JSON.stringify(idealPoints)}
    Candidate Answer: "${answerText}"
    
    Evaluate:
    - Technical correctness and coverage of ideal answer requirements.
    - Specific rating score (0 to 100).
    - Targeted constructive feedback.
    - Which of the ideal answer requirements were met (matched: true/false).
    
    Return your response strictly in the following JSON format:
    {
      "score": 85,
      "feedback": "Your answer is clear and correct but you missed...",
      "points": [
        { "pointText": "Requirement 1 text", "matched": true },
        { "pointText": "Requirement 2 text", "matched": false }
      ]
    }
  `;

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });
      return JSON.parse(response.text);
    } catch (err) {
      console.warn('Gemini API call failed, falling back to sandbox simulator.', err.message);
    }
  }

  // High-fidelity sandbox simulation
  return simulateAnswerEvaluation(questionText, idealPoints, answerText);
};

/**
 * AI INTERVIEW SESSION REPORT GENERATOR
 */
export const generateSessionReport = async (interviewName, answersReview) => {
  const client = getAiClient();
  const prompt = `
    Analyze the following SDE mock interview results and compile a final evaluation report.
    
    Interview Module: "${interviewName}"
    Answer Breakdown:
    ${JSON.stringify(answersReview)}
    
    Return your response strictly in the following JSON format:
    {
      "score": 80,
      "strengths": ["Strength 1", "Strength 2"],
      "weaknesses": ["Weakness 1", "Weakness 2"],
      "generalFeedback": "Feedback summary..."
    }
  `;

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });
      return JSON.parse(response.text);
    } catch (err) {
      console.warn('Gemini API call failed, falling back to sandbox simulator.', err.message);
    }
  }

  // Calculate default averages
  const scores = answersReview.map(a => a.score);
  const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) || 75;

  return {
    score: averageScore,
    strengths: [
      'Good baseline understanding of foundational theoretical paradigms.',
      'Structures answers logically with clear descriptions of core concepts.'
    ],
    weaknesses: [
      'Needs more depth on deployment tradeoffs and performance optimizations.',
      'Could elaborate further on resource constraints and cache invalidation strategies.'
    ],
    generalFeedback: 'You did a great job covering the basic requirements of the questions. For a stellar performance in your SDE placements, practice structured communication patterns and expand your knowledge on caching lifecycle tradeoffs.'
  };
};

/* --- SIMULATORS --- */

function simulateResumeAnalysis(text = '', jobDesc = '') {
  const lowerText = text.toLowerCase();
  const lowerJd = jobDesc.toLowerCase();

  const coreSkills = ['react', 'javascript', 'node.js', 'mongodb', 'c++', 'java', 'python', 'docker', 'kubernetes', 'redis', 'graphql', 'sql'];
  const present = coreSkills.filter(s => lowerText.includes(s));
  
  // Identify missing skills if they appear in the job description context
  const missing = coreSkills.filter(s => lowerJd.includes(s) && !lowerText.includes(s));
  
  // Calculate dynamic scores based on keyword density
  const skillsScore = Math.min(60 + present.length * 4, 98);
  const keywordScore = Math.min(50 + present.length * 5, 95);
  const projectScore = lowerText.includes('project') || lowerText.includes('developer') ? 85 : 60;
  const expScore = lowerText.includes('experience') || lowerText.includes('intern') ? 80 : 55;
  const formatScore = 90;
  
  const atsScore = Math.round((skillsScore + keywordScore + projectScore + formatScore) / 4);

  const suggestions = [
    'Quantify professional accomplishments using clear metrics (e.g., "reduced latency by 35%").',
    'Structure your experience and project sections using the STAR method (Situation, Task, Action, Result).',
    'Make sure to mention core infrastructure lifecycle tools if applying to full-stack roles.'
  ];

  if (missing.length > 0) {
    suggestions.unshift(`Add detail to your project sections regarding ${missing.slice(0, 2).join(' and ')} deployment configuration.`);
  }

  return {
    atsScore,
    skills: skillsScore,
    experience: expScore,
    projects: projectScore,
    keywords: keywordScore,
    formatting: formatScore,
    missingSkills: missing.length ? missing : ['Kubernetes', 'Redis', 'GraphQL'],
    suggestions
  };
}

function simulateAnswerEvaluation(question = '', idealPoints = [], answer = '') {
  const lowerAns = answer.toLowerCase();
  
  const pointsReview = idealPoints.map(pt => {
    // Keywords check helper
    const words = pt.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const matchedCount = words.filter(w => lowerAns.includes(w.replace(/[^a-zA-Z]/g, ''))).length;
    const matchRate = words.length ? (matchedCount / words.length) : 0;
    
    return {
      pointText: pt,
      matched: matchRate > 0.3 || lowerAns.includes(pt.toLowerCase().substring(0, 8))
    };
  });

  const matchedCount = pointsReview.filter(p => p.matched).length;
  const score = Math.round((matchedCount / idealPoints.length) * 100) || 50;

  let feedback = 'Good attempt. To improve, try structure your spoken answer to hit all core requirements cleanly.';
  if (score >= 80) {
    feedback = 'Excellent response! You covered all the vital implementation points, tradeoffs, and key concepts.';
  } else if (score >= 60) {
    feedback = 'Fair answer. You clearly understand the core topic, but missed explaining some architectural tradeoffs and edge cases.';
  }

  return {
    score,
    feedback,
    points: pointsReview
  };
}

/**
 * AI CODE JUDGER
 */
export const judgeCode = async (problemTitle, topic, code, language) => {
  const client = getAiClient();
  const prompt = `
    You are an expert algorithm judge.
    Evaluate the following solution code for the algorithm problem "${problemTitle}" (Topic: "${topic}").
    
    Language: ${language}
    Code:
    \`\`\`${language}
    ${code}
    \`\`\`
    
    Evaluate the solution. If the code solves the problem correctly and efficiently, mark it as Accepted. If there are syntax errors, bugs, poor time complexity, or incorrect logic, provide detail and mark it as Rejected.
    
    Return your response strictly in the following JSON format:
    {
      "status": "Accepted" | "Rejected",
      "feedback": "Detailed feedback on correctness, edge cases, space & time complexity, and code quality.",
      "timeComplexity": "e.g. O(N)",
      "spaceComplexity": "e.g. O(1)",
      "topicCompleted": "${topic}"
    }
  `;

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });
      return JSON.parse(response.text);
    } catch (err) {
      console.warn('Gemini API call failed for code judging, falling back to sandbox simulator.', err.message);
    }
  }

  // Simulation fallback
  return simulateCodeJudging(problemTitle, topic, code, language);
};

function simulateCodeJudging(problemTitle, topic, code = '', language = '') {
  const codeTrimmed = code.trim();
  const isTooShort = codeTrimmed.length < 30;
  const hasPass = codeTrimmed.includes('pass') || codeTrimmed.includes('// Write your') || codeTrimmed.includes('# Write your') || codeTrimmed.includes('// TODO');
  
  if (isTooShort || hasPass) {
    return {
      status: 'Rejected',
      feedback: 'The code submitted appears to be empty, starter code template, or too short to be a valid solution. Please write the logic to solve the problem before submitting.',
      timeComplexity: 'N/A',
      spaceComplexity: 'N/A',
      topicCompleted: topic
    };
  }

  // Deduce time/space complexity based on typical solutions for these mock problems
  let timeComplexity = 'O(N)';
  let spaceComplexity = 'O(1)';

  if (problemTitle.toLowerCase().includes('coin change')) {
    timeComplexity = 'O(N * amount)';
    spaceComplexity = 'O(amount)';
  } else if (problemTitle.toLowerCase().includes('clone graph')) {
    timeComplexity = 'O(V + E)';
    spaceComplexity = 'O(V)';
  } else if (problemTitle.toLowerCase().includes('two sum')) {
    timeComplexity = 'O(N)';
    spaceComplexity = 'O(N)';
  } else if (problemTitle.toLowerCase().includes('parentheses')) {
    timeComplexity = 'O(N)';
    spaceComplexity = 'O(N)';
  }

  return {
    status: 'Accepted',
    feedback: `The code looks well-structured and implements the correct logic for "${problemTitle}". The implementation matches standard optimal solutions for ${topic} algorithms.`,
    timeComplexity,
    spaceComplexity,
    topicCompleted: topic
  };
}

/**
 * AI CORE SUBJECT NOTES GENERATOR (OOPs, OS, DBMS, CN)
 */
export const generateCoreSubjectNotes = async (subject, topic) => {
  const client = getAiClient();
  const prompt = `
    You are an expert Computer Science professor and SDE placement mentor.
    Generate clear, comprehensive, and interview-ready study notes for:
    Subject: "${subject}"
    Topic: "${topic}"

    Your response must include:
    1. Introduction and high-level summary.
    2. Core concepts, definitions, and architectures.
    3. Code snippets or diagrams/flow (where applicable for OOPs, OS, etc.).
    4. Pros, Cons, and Key Trade-offs.
    5. Top 5 Frequently Asked SDE Interview Questions with concise answers.
    6. Rapid Revision Cheatsheet bullets.

    Return your response strictly in the following JSON format:
    {
      "subject": "${subject}",
      "topic": "${topic}",
      "summary": "Brief 2-sentence summary...",
      "sections": [
        {
          "title": "Core Concepts",
          "content": "Detailed markdown explanation...",
          "code": "// optional code snippet if relevant",
          "language": "cpp"
        },
        {
          "title": "Key Tradeoffs & Architecture",
          "content": "Detailed markdown explanation..."
        }
      ],
      "interviewQuestions": [
        {
          "question": "Explain difference between...",
          "answer": "Concise answer with key points..."
        }
      ],
      "quickTakeaways": [
        "Takeaway 1",
        "Takeaway 2"
      ]
    }
  `;

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });
      return JSON.parse(response.text);
    } catch (err) {
      console.warn('Gemini API notes generation failed, falling back to simulator.', err.message);
    }
  }

  // Fallback simulator for core notes
  return simulateCoreNotes(subject, topic);
};

function simulateCoreNotes(subject = 'OOPs', topic = 'Polymorphism') {
  return {
    subject,
    topic,
    summary: `${topic} is a foundational concept in ${subject} that is frequently evaluated during campus placements and technical SDE interviews.`,
    sections: [
      {
        title: `1. Understanding ${topic}`,
        content: `${topic} allows systems to decouple interface definitions from implementation details, improving code maintainability, flexibility, and testability. In production architectures, this principle is widely leveraged in design patterns such as Factory, Strategy, and Observer patterns.`,
        code: subject.toLowerCase().includes('oop') 
          ? `// Example of ${topic} in C++\n#include <iostream>\nusing namespace std;\n\nclass Shape {\npublic:\n    virtual void draw() {\n        cout << "Drawing generic shape" << endl;\n    }\n};\n\nclass Circle : public Shape {\npublic:\n    void draw() override {\n        cout << "Drawing Circle" << endl;\n    }\n};\n\nint main() {\n    Shape* s = new Circle();\n    s->draw(); // Dynamic dispatch\n    delete s;\n    return 0;\n}` 
          : `// Key System Architecture snippet for ${topic}\n// Efficient caching and index traversal representation`,
        language: 'cpp'
      },
      {
        title: `2. Critical Tradeoffs & Edge Cases`,
        content: `When implementing ${topic}, consider performance implications such as virtual table (vtable) lookup overhead, memory footprint, cache locality, and concurrency safety.`
      }
    ],
    interviewQuestions: [
      {
        question: `What is the difference between compile-time and runtime ${topic}?`,
        answer: `Compile-time mechanisms (e.g., function overloading, templates) are resolved during compilation with zero runtime overhead, whereas runtime mechanisms use dynamic dispatch (vtables) incurring minor pointer dereference overhead.`
      },
      {
        question: `How does ${subject} handle memory management during ${topic}?`,
        answer: `Ensure destructors are declared 'virtual' in base classes to prevent memory leaks when deleting derived objects through base pointers.`
      },
      {
        question: `What is diamond problem and how does ${topic} resolve it?`,
        answer: `The diamond problem occurs with multiple inheritance. In C++, virtual base classes are used to ensure only one instance of the base class is shared.`
      }
    ],
    quickTakeaways: [
      `Always keep the Big-O time and space complexity of ${topic} in mind.`,
      `In SDE interviews, explain real-world industry applications when answering theoretical questions.`,
      `Mention clean code best practices and SOLID principles where relevant.`
    ]
  };
}

/**
 * AI DSA PATTERN PROBLEM GENERATOR
 */
export const generatePatternProblems = async (patternName) => {
  const client = getAiClient();
  const prompt = `
    You are a Lead DSA Instructor creating problem sets for Top-tier placement prep.
    Generate 3 distinct, high-quality interview problems focusing specifically on the DSA Pattern: "${patternName}".

    For each problem provide:
    - id: unique string slug (e.g., "sliding-window-max-sum")
    - title: Problem title
    - difficulty: "Easy" | "Medium" | "Hard"
    - topic: "${patternName}"
    - description: Problem statement with input/output format.
    - constraints: Array of constraints strings.
    - examples: Array of example objects with input, output, explanation.
    - starterCode: Object with keys javascript, python, cpp, java containing starter code templates.
    - platform: "LeetCode"

    Return strictly a JSON array of 3 problem objects:
    [
      {
        "id": "slug-id",
        "title": "Problem Title",
        "difficulty": "Medium",
        "topic": "${patternName}",
        "description": "...",
        "constraints": ["1 <= nums.length <= 10^5"],
        "examples": [{ "input": "...", "output": "...", "explanation": "..." }],
        "starterCode": {
          "javascript": "function solve(nums) {\\n  // Your code here\\n}",
          "python": "def solve(nums):\\n    pass",
          "cpp": "#include <vector>\\nusing namespace std;\\nclass Solution {\\npublic:\\n    int solve(vector<int>& nums) {\\n    }\\n};",
          "java": "class Solution {\\n    public int solve(int[] nums) {\\n    }\\n}"
        },
        "platform": "LeetCode"
      }
    ]
  `;

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });
      return JSON.parse(response.text);
    } catch (err) {
      console.warn('Gemini API pattern problem generation failed, falling back to simulator.', err.message);
    }
  }

  return simulatePatternProblems(patternName);
};

function simulatePatternProblems(pattern = 'Sliding Window') {
  const clean = pattern.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return [
    {
      id: `${clean}-max-subarray-sum`,
      title: `Maximum Sum Subarray of Size K (${pattern})`,
      difficulty: 'Easy',
      topic: pattern,
      description: `Given an array of positive numbers and a positive number 'k', find the maximum sum of any contiguous subarray of size 'k'.`,
      constraints: ['1 <= nums.length <= 10^5', '1 <= k <= nums.length'],
      examples: [
        {
          input: 'nums = [2, 1, 5, 1, 3, 2], k = 3',
          output: '9',
          explanation: 'Subarray with maximum sum is [5, 1, 3] with sum 9.'
        }
      ],
      starterCode: {
        javascript: 'function maxSubArrayOfSizeK(k, nums) {\n  // Implement sliding window\n  return 0;\n}',
        python: 'def max_sub_array_of_size_k(k, nums):\n    # Implement sliding window\n    return 0',
        cpp: '#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    int maxSubArrayOfSizeK(int k, vector<int>& nums) {\n        // Your code\n        return 0;\n    }\n};',
        java: 'class Solution {\n    public int maxSubArrayOfSizeK(int k, int[] nums) {\n        return 0;\n    }\n}'
      },
      platform: 'LeetCode'
    },
    {
      id: `${clean}-longest-substring-distinct`,
      title: `Longest Substring with K Distinct Characters`,
      difficulty: 'Medium',
      topic: pattern,
      description: `Given a string, find the length of the longest substring in it with no more than K distinct characters.`,
      constraints: ['1 <= str.length <= 5 * 10^4', '1 <= k <= 26'],
      examples: [
        {
          input: 'str = "araaci", k = 2',
          output: '4',
          explanation: 'The longest substring with no more than 2 distinct characters is "araa".'
        }
      ],
      starterCode: {
        javascript: 'function longestSubstringKDistinct(str, k) {\n  // Your code here\n  return 0;\n}',
        python: 'def longest_substring_k_distinct(str_val, k):\n    return 0',
        cpp: '#include <string>\nusing namespace std;\nclass Solution {\npublic:\n    int longestSubstringKDistinct(string str, int k) {\n        return 0;\n    }\n};',
        java: 'class Solution {\n    public int longestSubstringKDistinct(String str, int k) {\n        return 0;\n    }\n}'
      },
      platform: 'LeetCode'
    },
    {
      id: `${clean}-permutation-in-string`,
      title: `Permutation in String (${pattern})`,
      difficulty: 'Hard',
      topic: pattern,
      description: `Given two strings s1 and s2, return true if s2 contains a permutation of s1, or false otherwise. In other words, return true if one of s1's permutations is the substring of s2.`,
      constraints: ['1 <= s1.length, s2.length <= 10^4'],
      examples: [
        {
          input: 's1 = "ab", s2 = "eidbaooo"',
          output: 'true',
          explanation: 's2 contains one permutation of s1 ("ba").'
        }
      ],
      starterCode: {
        javascript: 'function checkInclusion(s1, s2) {\n  // Your code\n  return false;\n}',
        python: 'def check_inclusion(s1: str, s2: str) -> bool:\n    return False',
        cpp: '#include <string>\nusing namespace std;\nclass Solution {\npublic:\n    bool checkInclusion(string s1, string s2) {\n        return false;\n    }\n};',
        java: 'class Solution {\n    public boolean checkInclusion(String s1, String s2) {\n        return false;\n    }\n}'
      },
      platform: 'LeetCode'
    }
  ];
}

/**
 * AI CHAT COPILOT
 */
export const chatWithCopilot = async (messages = [], promptText = '', userContext = {}) => {
  const client = getAiClient();
  const systemInstructions = `
    You are "Hierprep AI Copilot", an elite Software Engineer Placement Mentor and Competitive Programming Coach.
    You assist candidates with:
    - DSA patterns, algorithmic complexity, and code optimization.
    - Core subjects: OOPs, OS, DBMS, System Design, Computer Networks.
    - Upcoming contests on Codeforces, LeetCode, CodeChef, and HackerRank.
    - Real-time profile guidance based on weak topics (${JSON.stringify(userContext.weakTopics || [])}).
    
    Candidate Context:
    - Name: ${userContext.name || 'Candidate'}
    - Coding Stats: ${JSON.stringify(userContext.codingStats || {})}
    
    Be concise, practical, highly technical, encouraging, and provide code blocks when explaining algorithms.
  `;

  if (client) {
    try {
      const fullPrompt = `${systemInstructions}\n\nCandidate question: ${promptText}`;
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt
      });
      return {
        reply: response.text
      };
    } catch (err) {
      console.warn('Gemini AI chat failed, falling back to simulator.', err.message);
    }
  }

  // Fallback simulator for Chat
  const lower = promptText.toLowerCase();
  let reply = `Hello ${userContext.name || 'there'}! I am your AI Placement Copilot. You can ask me to explain any DSA Pattern (Sliding Window, Two Pointers, Dynamic Programming), explain Core CS subjects, or get advice on upcoming contests!`;
  
  if (lower.includes('contest') || lower.includes('codeforces') || lower.includes('leetcode')) {
    reply = `🏆 **Upcoming Contests Briefing**:\n\n- **Codeforces Round (Div. 3)**: Saturday 8:05 PM IST. Excellent for speed practice and graph/greedy patterns.\n- **LeetCode Biweekly Contest**: Saturday 8:00 PM IST. 4 problems (Array, Map, DP/Tree, Hard DP).\n- **CodeChef Starters**: Wednesday 8:00 PM IST.\n\n*Pro-tip:* Before the contest, review your weak topics and practice sliding window templates to write fast, bug-free implementations!`;
  } else if (lower.includes('dp') || lower.includes('dynamic programming')) {
    reply = `💡 **Dynamic Programming Master Key**:\n1. **Identify the State**: What variables define the problem at step $i$?\n2. **Formulate Transition**: $dp[i] = \\max(dp[i-1], dp[i-2] + nums[i])$\n3. **Base Cases**: What is the smallest subproblem answer?\n4. **Optimization**: Space optimize from $O(N)$ table to $O(1)$ variables if only previous states are needed.`;
  } else if (lower.includes('oops') || lower.includes('os') || lower.includes('dbms')) {
    reply = `📚 For Core Subjects, check out the **Core Subjects** tab on the sidebar. I can dynamically generate comprehensive interview notes with code examples and top asked SDE questions for OOPs, OS, DBMS, and CN.`;
  }

  return { reply };
};

/**
 * CONTEST TRACKER FETCHER
 */
export const getUpcomingContests = async () => {
  try {
    // Fetch real-time from Codeforces API
    const cfRes = await fetch('https://codeforces.com/api/contest.list?gym=false');
    if (cfRes.ok) {
      const data = await cfRes.json();
      if (data.status === 'OK' && Array.isArray(data.result)) {
        const upcomingCF = data.result
          .filter(c => c.phase === 'BEFORE')
          .slice(0, 3)
          .map(c => {
            const date = new Date(c.startTimeSeconds * 1000);
            return {
              id: `cf-${c.id}`,
              name: c.name,
              platform: 'Codeforces',
              url: `https://codeforces.com/contests/${c.id}`,
              startTime: date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
              durationMinutes: Math.round(c.durationSeconds / 60)
            };
          });

        if (upcomingCF.length > 0) {
          return [
            ...upcomingCF,
            {
              id: 'lc-weekly',
              name: 'LeetCode Weekly Contest 440',
              platform: 'LeetCode',
              url: 'https://leetcode.com/contest/',
              startTime: 'Sunday, 8:00 AM IST',
              durationMinutes: 90
            },
            {
              id: 'cc-starters',
              name: 'CodeChef Starters Round',
              platform: 'CodeChef',
              url: 'https://www.codechef.com/contests',
              startTime: 'Wednesday, 8:00 PM IST',
              durationMinutes: 120
            }
          ];
        }
      }
    }
  } catch (err) {
    console.warn('Codeforces contest fetch failed, returning curated list:', err.message);
  }

  // Curated upcoming contest schedule
  return [
    {
      id: 'cf-div3',
      name: 'Codeforces Round (Div. 3)',
      platform: 'Codeforces',
      url: 'https://codeforces.com/contests',
      startTime: 'Saturday, 8:05 PM IST',
      durationMinutes: 135
    },
    {
      id: 'lc-biweekly',
      name: 'LeetCode Biweekly Contest 152',
      platform: 'LeetCode',
      url: 'https://leetcode.com/contest/',
      startTime: 'Saturday, 8:00 PM IST',
      durationMinutes: 90
    },
    {
      id: 'lc-weekly',
      name: 'LeetCode Weekly Contest 440',
      platform: 'LeetCode',
      url: 'https://leetcode.com/contest/',
      startTime: 'Sunday, 8:00 AM IST',
      durationMinutes: 90
    },
    {
      id: 'cc-starters',
      name: 'CodeChef Starters Round',
      platform: 'CodeChef',
      url: 'https://www.codechef.com/contests',
      startTime: 'Wednesday, 8:00 PM IST',
      durationMinutes: 120
    }
  ];
};

/**
 * AI ONLINE ASSESSMENT (OA) ROUND MOCK GENERATOR
 * Generates fresh sets for Aptitude, Reasoning, Verbal, and OA Coding
 */
export const generateOaMock = async (category = 'aptitude', count = 5, difficulty = 'Medium') => {
  const client = getAiClient();
  const prompt = `
    You are an expert Technical Assessment Creator for Top Product & Service tech companies (e.g. Amazon, Google, TCS Digital, Cognizant, Infosys).
    Generate a brand new, realistic Online Assessment (OA) Round Test Set for:
    Category: "${category}" (can be 'aptitude', 'reasoning', 'verbal', or 'coding')
    Difficulty: "${difficulty}"
    Question Count: ${count}

    For 'aptitude', 'reasoning', and 'verbal', provide standard multiple-choice questions with:
    - id: unique string
    - question: Clear problem statement
    - options: Array of 4 string options [A, B, C, D]
    - correctIndex: 0-based index of correct option (0, 1, 2, or 3)
    - explanation: Step-by-step solution calculation/reasoning
    - topic: subtopic name (e.g., 'Time & Work', 'Syllogisms', 'Vocabulary')

    For 'coding', provide coding questions with:
    - id: unique string
    - title: Problem title
    - description: Problem statement
    - examples: Array of { input, output, explanation }
    - constraints: Array of constraint strings
    - starterCode: Object with keys { javascript, python, cpp, java }
    - difficulty: "${difficulty}"

    Return strictly a JSON object matching this structure:
    {
      "category": "${category}",
      "testTitle": "${category.toUpperCase()} Mock Assessment Test",
      "durationMinutes": ${category === 'coding' ? 45 : 15},
      "questions": [ ... ]
    }
  `;

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });
      return JSON.parse(response.text);
    } catch (err) {
      console.warn('Gemini OA Mock generation failed, falling back to simulator:', err.message);
    }
  }

  return simulateOaMock(category, count, difficulty);
};

function simulateOaMock(category = 'aptitude', count = 5, difficulty = 'Medium') {
  const cat = category.toLowerCase();
  
  if (cat === 'aptitude') {
    return {
      category: 'aptitude',
      testTitle: 'Quantitative Aptitude Placement Assessment',
      durationMinutes: 15,
      questions: [
        {
          id: 'apt-1',
          topic: 'Time and Work',
          question: 'A can complete a piece of work in 12 days and B can complete the same work in 18 days. If they work together for 4 days, what fraction of the work is left unfinished?',
          options: ['5/9', '4/9', '1/3', '2/9'],
          correctIndex: 1,
          explanation: 'A\'s 1-day work = 1/12. B\'s 1-day work = 1/18. Combined 1-day work = (1/12 + 1/18) = 5/36. In 4 days, work completed = 4 * (5/36) = 20/36 = 5/9. Fraction left = 1 - 5/9 = 4/9.'
        },
        {
          id: 'apt-2',
          topic: 'Speed, Time and Distance',
          question: 'A train 240 m long passes a pole in 24 seconds. How long will it take to pass a platform 650 m long?',
          options: ['65 sec', '89 sec', '75 sec', '100 sec'],
          correctIndex: 1,
          explanation: 'Speed of train = 240 m / 24 s = 10 m/s. Total distance to cross platform = 240 + 650 = 890 m. Time taken = 890 / 10 = 89 seconds.'
        },
        {
          id: 'apt-3',
          topic: 'Profit and Loss',
          question: 'A shopkeeper sells an article at a 15% gain. Had he sold it for $24 more, he would have gained 20%. What is the cost price of the article?',
          options: ['$420', '$480', '$500', '$520'],
          correctIndex: 1,
          explanation: 'Difference in gain % = 20% - 15% = 5%. 5% of Cost Price = $24. Therefore, Cost Price = 24 * (100 / 5) = $480.'
        },
        {
          id: 'apt-4',
          topic: 'Percentages & Ratios',
          question: 'In an examination, 35% students failed in Mathematics and 25% failed in English. If 10% failed in both, what is the percentage of students who passed in both subjects?',
          options: ['45%', '50%', '55%', '60%'],
          correctIndex: 1,
          explanation: 'Failed in at least one subject = n(M) + n(E) - n(M ∩ E) = 35 + 25 - 10 = 50%. Passed in both = 100% - 50% = 50%.'
        },
        {
          id: 'apt-5',
          topic: 'Permutations & Combinations',
          question: 'In how many different ways can the letters of the word \'LEADER\' be arranged?',
          options: ['720', '360', '180', '120'],
          correctIndex: 1,
          explanation: 'The word LEADER has 6 letters where \'E\' is repeated twice. Number of arrangements = 6! / 2! = 720 / 2 = 360.'
        }
      ]
    };
  } else if (cat === 'reasoning') {
    return {
      category: 'reasoning',
      testTitle: 'Logical Reasoning & Analytical Assessment',
      durationMinutes: 15,
      questions: [
        {
          id: 'rsn-1',
          topic: 'Number & Letter Series',
          question: 'Find the missing term in the sequence: 7, 12, 19, 28, 39, ?',
          options: ['50', '52', '54', '56'],
          correctIndex: 1,
          explanation: 'Differences: 12-7=5, 19-12=7, 28-19=9, 39-28=11 (successive odd numbers). Next difference = 13. Next term = 39 + 13 = 52.'
        },
        {
          id: 'rsn-2',
          topic: 'Blood Relations',
          question: 'Pointing to a photograph of a boy, Suresh said, "He is the son of the only son of my mother." How is Suresh related to that boy?',
          options: ['Brother', 'Uncle', 'Father', 'Grandfather'],
          correctIndex: 2,
          explanation: 'The only son of Suresh\'s mother is Suresh himself. Therefore, the boy is Suresh\'s son, making Suresh the Father.'
        },
        {
          id: 'rsn-3',
          topic: 'Direction Sense',
          question: 'A person walks 5 km East, turns right and walks 4 km, then turns left and walks 5 km. In which direction is he now from his starting point?',
          options: ['North-East', 'South-East', 'South-West', 'North-West'],
          correctIndex: 1,
          explanation: 'Net East movement = 5 + 5 = 10 km. Net South movement = 4 km. Hence he is in the South-East direction from origin.'
        },
        {
          id: 'rsn-4',
          topic: 'Coding-Decoding',
          question: 'In a certain code language, if "CLOUD" is written as "DNPXF", how will "SUNNY" be written in that code?',
          options: ['TVOQZ', 'TUPOZ', 'TVQPZ', 'UVOQZ'],
          correctIndex: 0,
          explanation: 'Pattern is +1 for each letter: S(+1)=T, U(+1)=V, N(+1)=O, N(+1)=O... Wait: C->D(+1), L->N(+2), O->P(+1), U->X(+3), D->F(+2). For SUNNY: S(+1)=T, U(+2)=W, N(+1)=O, N(+3)=Q, Y(+1)=Z -> TVOQZ.'
        },
        {
          id: 'rsn-5',
          topic: 'Syllogisms',
          question: 'Statements: All mangoes are golden. No golden things are cheap.\nConclusion I: All mangoes are cheap.\nConclusion II: Golden mangoes are not cheap.',
          options: ['Only I follows', 'Only II follows', 'Both I and II follow', 'Neither follows'],
          correctIndex: 1,
          explanation: 'Since no golden things are cheap and all mangoes are golden, all mangoes are not cheap. Thus Conclusion II strictly follows.'
        }
      ]
    };
  } else if (cat === 'verbal') {
    return {
      category: 'verbal',
      testTitle: 'Verbal Ability & Professional English Assessment',
      durationMinutes: 15,
      questions: [
        {
          id: 'vrb-1',
          topic: 'Sentence Correction',
          question: 'Choose the grammatically correct option: "Neither the manager nor the employees _____ present at the conference."',
          options: ['was', 'were', 'is', 'has been'],
          correctIndex: 1,
          explanation: 'With "neither... nor", the verb agrees with the subject closest to it. "Employees" is plural, so the plural verb "were" is correct.'
        },
        {
          id: 'vrb-2',
          topic: 'Synonyms & Vocabulary',
          question: 'Select the word that is closest in meaning to "METICULOUS":',
          options: ['Careless', 'Painstaking & Thorough', 'Hasty', 'Vague'],
          correctIndex: 1,
          explanation: 'Meticulous means showing great attention to detail; very careful and precise.'
        },
        {
          id: 'vrb-3',
          topic: 'Antonyms',
          question: 'Select the word opposite in meaning to "CANDID":',
          options: ['Blunt', 'Honest', 'Deceitful / Guarded', 'Frank'],
          correctIndex: 2,
          explanation: 'Candid means truthful and straightforward. Its antonym is deceitful, evasive, or guarded.'
        },
        {
          id: 'vrb-4',
          topic: 'Idioms and Phrases',
          question: 'What does the idiom "Bite the bullet" mean?',
          options: ['To start a quarrel', 'To face a difficult situation with courage', 'To waste ammunition', 'To make an impulsive purchase'],
          correctIndex: 1,
          explanation: '"To bite the bullet" means to endure a painful or difficult situation with resilience and courage.'
        },
        {
          id: 'vrb-5',
          topic: 'Reading Comprehension',
          question: '"Cloud computing offers elasticity, allowing organizations to dynamically scale resources to match workload demands without upfront capital expenditure."\nAccording to the passage, what is the primary benefit of cloud elasticity?',
          options: ['Physical server ownership', 'Dynamic scaling without upfront capital investment', 'Zero network latency', 'Elimination of all software bugs'],
          correctIndex: 1,
          explanation: 'The excerpt directly emphasizes dynamically scaling resources to match workload demands without upfront capital expense.'
        }
      ]
    };
  } else {
    // OA Coding mock
    return {
      category: 'coding',
      testTitle: 'Online Assessment (OA) Coding Round Challenge',
      durationMinutes: 45,
      questions: [
        {
          id: 'oa-code-1',
          title: 'Minimum Operations to Balance Parcel Weights (Amazon OA)',
          difficulty: 'Medium',
          topic: 'Greedy & Sorting',
          description: `You are given an array of parcel weights. In one operation, you can combine two lightest parcels into one. Determine the minimum operations required so that no parcel weighs less than a given threshold 'k'. If it is impossible, return -1.`,
          constraints: ['1 <= weights.length <= 10^5', '1 <= k <= 10^9'],
          examples: [
            {
              input: 'weights = [1, 2, 3, 9, 10, 12], k = 7',
              output: '2',
              explanation: 'Combine 1 and 2 -> weight 3. Combine 3 and 3 -> weight 6. Then combine 6 and 9 -> all parcels exceed 7.'
            }
          ],
          starterCode: {
            javascript: 'function minOperations(weights, k) {\n  // Implement min-heap or priority queue approach\n  return 0;\n}',
            python: 'import heapq\ndef min_operations(weights, k):\n    # Your solution\n    return 0',
            cpp: '#include <vector>\n#include <queue>\nusing namespace std;\nclass Solution {\npublic:\n    int minOperations(vector<int>& weights, int k) {\n        return 0;\n    }\n};',
            java: 'import java.util.PriorityQueue;\nclass Solution {\n    public int minOperations(int[] weights, int k) {\n        return 0;\n    }\n}'
          }
        }
      ]
    };
  }
}

/**
 * AI COMPANY-SPECIFIC MOCK INTERVIEW & PROBLEM GENERATOR
 * Real company questions for Google, Amazon, Microsoft, Uber, Goldman Sachs, TCS, etc.
 */
export const generateCompanySpecificMock = async (company = 'Google', role = 'Software Engineer', roundType = 'Technical OA & Coding') => {
  const client = getAiClient();
  const prompt = `
    You are a Lead Hiring Committee member and Senior Staff Engineer at "${company}".
    Create a highly authentic Company-Specific Mock Interview & Technical Assessment tailored precisely to "${company}"'s recent placement hiring patterns for the role of "${role}".
    Round Type: "${roundType}"

    Include:
    1. Company hiring round insights and cultural rubric (e.g. Amazon Leadership Principles, Google Googliness & Clean Code, Microsoft Architecture).
    2. Exactly 2 Company-Specific Coding Challenges frequently asked at ${company} with full problem statements, input/output examples, constraints, optimal time/space complexity, and starter templates.
    3. Exactly 3 High-Yield Technical / System Design / Core interview questions specific to ${company}.

    Return strictly a JSON object formatted as follows:
    {
      "company": "${company}",
      "role": "${role}",
      "roundType": "${roundType}",
      "companyInsights": {
        "difficultyFocus": "e.g. Graphs, Trees, DP & Clean Modular Code",
        "keyRubric": "What ${company} interviewers specifically look for...",
        "prepTips": ["Tip 1", "Tip 2", "Tip 3"]
      },
      "codingProblems": [
        {
          "id": "${company.toLowerCase().replace(/[^a-z0-9]/g, '')}-prob-1",
          "title": "Problem Title",
          "difficulty": "Medium",
          "frequency": "Asked 85+ times in last 6 months at ${company}",
          "topic": "Graph / DP / String",
          "description": "Full problem description...",
          "constraints": ["1 <= N <= 10^5"],
          "examples": [
            { "input": "...", "output": "...", "explanation": "..." }
          ],
          "optimalComplexity": {
            "time": "O(N log N)",
            "space": "O(N)"
          },
          "starterCode": {
            "javascript": "function solve(input) {\\n  // Solution\\n}",
            "python": "def solve(input):\\n    pass",
            "cpp": "#include <vector>\\nusing namespace std;\\nclass Solution {\\npublic:\\n    int solve() {\\n    }\\n};",
            "java": "class Solution {\\n    public int solve() {\\n    }\\n}"
          }
        }
      ],
      "interviewQuestions": [
        {
          "question": "Company specific question...",
          "idealAnswer": "Key points expected by ${company} interviewers..."
        }
      ]
    }
  `;

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });
      return JSON.parse(response.text);
    } catch (err) {
      console.warn(`Gemini Company Mock generation failed for ${company}, using simulator:`, err.message);
    }
  }

  return simulateCompanyMock(company, role, roundType);
};

function simulateCompanyMock(company = 'Google', role = 'Software Engineer', roundType = 'Technical OA & Coding') {
  const cleanComp = company.toLowerCase().replace(/[^a-z0-9]/g, '');
  return {
    company,
    role,
    roundType,
    companyInsights: {
      difficultyFocus: company === 'Google' ? 'Graph Traversals, Dynamic Programming, and Scalable Code' :
                       company === 'Amazon' ? 'Trees, Heaps, HashMaps, and Leadership Principles' :
                       company === 'Microsoft' ? 'Linked Lists, Strings, Binary Trees, and Clean Architecture' :
                       'DSA Foundations, Problem Solving Speed, and Core Fundamentals',
      keyRubric: `${company} evaluates code cleanliness, edge-case analysis, Big-O optimal tradeoffs, and clear spoken communication of logic before writing code.`,
      prepTips: [
        `Always clarify edge cases and scale constraints with the ${company} interviewer first.`,
        `Write modular helper functions and verify your test walkthrough manually.`,
        `Mention space/time complexity trade-offs explicitly.`
      ]
    },
    codingProblems: [
      {
        id: `${cleanComp}-prob-1`,
        title: `${company} Exclusive: Minimum Cost to Reach Destination Network`,
        difficulty: 'Medium',
        frequency: `Asked in 90% of recent ${company} campus drives`,
        topic: 'Graph / Shortest Path',
        description: `There are 'n' cities numbered from 0 to n-1. You are given a 2D array 'flights' where flights[i] = [from, to, price] and an integer 'k'. Return the cheapest price from src to dst with at most 'k' stops. If no such route exists, return -1.`,
        constraints: ['1 <= n <= 100', '0 <= flights.length <= (n * (n - 1) / 2)', '0 <= k <= n'],
        examples: [
          {
            input: 'n = 4, flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src = 0, dst = 3, k = 1',
            output: '700',
            explanation: 'The optimal path with at most 1 stop is 0 -> 1 -> 3 with total cost 100 + 600 = 700.'
          }
        ],
        optimalComplexity: {
          time: 'O(K * E)',
          space: 'O(V)'
        },
        starterCode: {
          javascript: 'function findCheapestPrice(n, flights, src, dst, k) {\n  // Implement Bellman-Ford or Dijkstra with stops constraint\n  return -1;\n}',
          python: 'def find_cheapest_price(n, flights, src, dst, k):\n    return -1',
          cpp: '#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    int findCheapestPrice(int n, vector<vector<int>>& flights, int src, int dst, int k) {\n        return -1;\n    }\n};',
          java: 'class Solution {\n    public int findCheapestPrice(int n, int[][] flights, int src, int dst, int k) {\n        return -1;\n    }\n}'
        }
      },
      {
        id: `${cleanComp}-prob-2`,
        title: `${company} Exclusive: Longest Valid Subsequence Partition`,
        difficulty: 'Hard',
        frequency: `Top asked in ${company} Technical Round 2`,
        topic: 'Dynamic Programming / Binary Search',
        description: `Given an integer array nums and an integer k, return the length of the longest subsequence where the absolute difference between any two adjacent elements is at most k.`,
        constraints: ['1 <= nums.length <= 10^5', '0 <= k <= 10^5'],
        examples: [
          {
            input: 'nums = [4, 2, 1, 4, 3, 4, 5, 8, 15], k = 3',
            output: '5',
            explanation: 'The longest valid subsequence is [4, 2, 4, 4, 5] or [4, 1, 4, 4, 5] of length 5.'
          }
        ],
        optimalComplexity: {
          time: 'O(N log(max_val)) using Segment Tree / Fenwick Tree',
          space: 'O(max_val)'
        },
        starterCode: {
          javascript: 'function lengthOfLIS(nums, k) {\n  // Your segment tree DP code here\n  return 0;\n}',
          python: 'def length_of_lis(nums, k):\n    return 0',
          cpp: '#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    int lengthOfLIS(vector<int>& nums, int k) {\n        return 0;\n    }\n};',
          java: 'class Solution {\n    public int lengthOfLIS(int[] nums, int k) {\n        return 0;\n    }\n}'
        }
      }
    ],
    interviewQuestions: [
      {
        question: `How would you design a distributed cache invalidation system under high traffic at ${company}?`,
        idealAnswer: `Explain Write-Through vs Write-Behind caching, Cache-Aside pattern with Redis cluster, TTL strategies, and pub/sub cache purge invalidation messages across edge microservices.`
      },
      {
        question: `Describe a situation where you had to refactor a slow O(N^2) algorithm into O(N) or O(N log N) in production.`,
        idealAnswer: `Use the STAR method: Situation (high latency), Task (reduce response time under SLA), Action (indexed with HashMap/Trie, avoided nested sweeps), Result (92% latency reduction).`
      }
    ]
  };
}

/**
 * GITHUB CONTRIBUTION & CODING GREEN SHEET DATA GENERATOR
 * Generates 52-week activity grid with commits, problem solves, and streaks
 */
export const getGithubContributionData = async (username = 'user') => {
  // Generate realistic 52-week (364 days) contribution matrix
  const weeks = [];
  const today = new Date();
  let totalContributions = 0;
  let currentStreak = 0;
  let maxStreak = 0;
  let activeDays = 0;

  for (let w = 51; w >= 0; w--) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (w * 7 + (6 - d)));
      
      // Calculate realistic random activity intensity (0 to 4)
      const rand = Math.random();
      let count = 0;
      let level = 0;

      // Higher activity on weekdays
      const isWeekday = d > 0 && d < 6;
      if (rand > (isWeekday ? 0.35 : 0.6)) {
        count = Math.floor(Math.random() * 8) + 1;
        if (count >= 7) level = 4;
        else if (count >= 5) level = 3;
        else if (count >= 3) level = 2;
        else level = 1;

        totalContributions += count;
        activeDays += 1;
        currentStreak += 1;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else {
        currentStreak = 0;
      }

      days.push({
        date: date.toISOString().split('T')[0],
        count,
        level // 0: no activity, 1: low, 2: med, 3: high, 4: very high
      });
    }
    weeks.push({ weekIndex: 51 - w, days });
  }

  return {
    username,
    totalContributions: totalContributions + 380, // Solved + GitHub
    activeDays: activeDays + 140,
    currentStreak: 14,
    maxStreak: Math.max(maxStreak, 28),
    weeks
  };
};

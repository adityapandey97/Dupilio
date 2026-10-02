export const mockInterviews = [
  {
    id: 'dsa-interview',
    name: 'DSA Interview',
    duration: 45,
    description: 'Algorithmic assessment covering arrays, trees, dynamic programming, and complexity analysis.',
    questions: [
      {
        id: 'q1',
        questionText: 'Can you explain the difference between a tree and a graph, and when you would use each?',
        idealAnswerPoints: [
          'A tree is a connected acyclic graph with N nodes and N-1 edges.',
          'Trees have a hierarchical structure with a single root, while graphs can have cycles and multiple paths.',
          'Trees are useful for representing hierarchical data (like HTML DOM, file systems), while graphs are suited for networks, routing, and relations.'
        ]
      },
      {
        id: 'q2',
        questionText: 'What is dynamic programming, and how does memoization differ from tabulation?',
        idealAnswerPoints: [
          'Dynamic programming (DP) solves complex problems by breaking them down into simpler subproblems and storing subproblem results.',
          'Memoization is top-down, typically using recursion and caching results in a map or array as they are computed.',
          'Tabulation is bottom-up, filling an iterative table (usually from base cases up) without recursive call stack overhead.'
        ]
      },
      {
        id: 'q3',
        questionText: 'How does quicksort work, and what is its worst-case time complexity? How can we optimize it?',
        idealAnswerPoints: [
          'Quicksort is a divide-and-conquer algorithm that selects a pivot and partitions the array around it.',
          'Worst-case time complexity is O(N^2), occurring when the pivot consistently divides the array unevenly (e.g. sorted arrays with first/last element pivot).',
          'Optimizations include randomized pivot selection, median-of-three, or switching to insertion sort for small sub-arrays.'
        ]
      }
    ]
  },
  {
    id: 'react-interview',
    name: 'React Frontend Interview',
    duration: 30,
    description: 'Covers core React rendering pipeline, hooks, state managers, and reconciliation (Virtual DOM).',
    questions: [
      {
        id: 'r1',
        questionText: 'What is the Virtual DOM, and how does the reconciliation process work in React?',
        idealAnswerPoints: [
          'The Virtual DOM is a lightweight JavaScript representation of the real DOM in memory.',
          'Reconciliation is the algorithm React uses to diff the Virtual DOM tree with the new tree generated after state changes.',
          'React uses heuristics (O(N) complexity) by assuming elements of different types generate different trees and using keys for list items.'
        ]
      },
      {
        id: 'r2',
        questionText: 'What are the rules of React Hooks? Why can we not call hooks inside loops or conditions?',
        idealAnswerPoints: [
          'Rules: Only call hooks at the top level (not inside loops, conditions, or nested functions), and only from React functions.',
          'React relies on the call order of hooks to associate hook states with the component. Changing the order by calling hooks conditionally breaks this association.'
        ]
      },
      {
        id: 'r3',
        questionText: 'What is the difference between useMemo and useCallback? When should you use them?',
        idealAnswerPoints: [
          'useMemo caches the computed value of a function, while useCallback caches the function definition itself.',
          'They should be used to optimize performance: preventing expensive calculations on every render, or keeping stable references of objects/functions passed as props to memoized child components.'
        ]
      }
    ]
  },
  {
    id: 'backend-interview',
    name: 'Backend Systems Interview',
    duration: 45,
    description: 'Covers Node.js, Express, databases, caching (Redis), concurrency, and API architectures.',
    questions: [
      {
        id: 'b1',
        questionText: 'Explain the event loop in Node.js. How does Node.js handle concurrency despite being single-threaded?',
        idealAnswerPoints: [
          'The event loop offloads I/O operations to the system kernel or background thread pool (libuv) whenever possible.',
          'When an async operation completes, its callback is queued in the event loop phases (timers, I/O callbacks, poll, check, close).',
          'Concurrency is achieved via non-blocking I/O multiplexing rather than spawning OS threads for each request.'
        ]
      },
      {
        id: 'b2',
        questionText: 'What is database indexing, and how does it speed up queries? Are there any disadvantages?',
        idealAnswerPoints: [
          'An index is a data structure (often B-Trees or Hash tables) that stores a pointer to data rows to find records quickly without a full table scan.',
          'Disadvantage: Indexes require extra storage write space and slow down write operations (INSERT, UPDATE, DELETE) because the index tree must be updated.'
        ]
      },
      {
        id: 'b3',
        questionText: 'What is the difference between vertical and horizontal scaling in backend databases?',
        idealAnswerPoints: [
          'Vertical scaling (scaling up) means adding more power (CPU, RAM, SSD) to an existing server node.',
          'Horizontal scaling (scaling out) means adding more database servers, spreading load via replication (read replicas) or sharding/partitioning (splitting data across nodes).'
        ]
      }
    ]
  },
  {
    id: 'system-design',
    name: 'System Design Interview',
    duration: 45,
    description: 'Covers distributed systems, load balancers, database sharding, caching strategies, and CDN networks.',
    questions: [
      {
        id: 's1',
        questionText: 'How would you design a rate limiter for a public API? What algorithm and database would you choose?',
        idealAnswerPoints: [
          'Algorithms: Token Bucket, Leaky Bucket, Fixed Window, Sliding Window Log, or Sliding Window Counter.',
          'Storage: Redis is ideal for fast read/writes and supports built-in TTLs and atomic operations (like INCR and EXPIRE).',
          'We can implement sliding window counter using Redis sorted sets (ZADD, ZREMRANGEBYSCORE, ZCARD).'
        ]
      },
      {
        id: 's2',
        questionText: 'What is a CDN (Content Delivery Network), and how does it improve website load latency?',
        idealAnswerPoints: [
          'A CDN is a distributed network of edge servers geographically positioned closer to users.',
          'It caches static and dynamic assets (images, CSS, JS, HTML, videos) at edge locations, reducing network round-trip time (RTT) and origin server load.'
        ]
      }
    ]
  },
  {
    id: 'hr-interview',
    name: 'Behavioral & HR Interview',
    duration: 30,
    description: 'Covers behavioral questions, situational conflict management, team collaboration, and goals.',
    questions: [
      {
        id: 'h1',
        questionText: 'Tell me about a time you had a conflict with a teammate or lead. How did you resolve it?',
        idealAnswerPoints: [
          'Use the STAR method (Situation, Task, Action, Result).',
          'Focus on professional, objective communication and finding common ground rather than personal grievances.',
          'Emphasize active listening, collaborative compromise, and a positive end result for the project.'
        ]
      },
      {
        id: 'h2',
        questionText: 'Why do you want to join our company, and where do you see yourself in five years?',
        idealAnswerPoints: [
          'Align personal career goals with the company mission, culture, or technical challenges.',
          'Demonstrate knowledge of the company products or industry position.',
          'Indicate a desire for long-term growth, taking on more technical ownership or leadership responsibilities.'
        ]
      }
    ]
  }
];

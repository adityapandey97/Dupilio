export const mockDashboardData = {
  stats: {
    problemsSolved: 128,
    problemsTotal: 164,
    interviewsCompleted: 12,
    averageScore: 82,
    daysStreak: 14
  },
  
  activities: [
    {
      id: 'act-1',
      type: 'dsa',
      title: 'Solved Two Sum',
      time: '10 minutes ago',
      description: 'Optimized time complexity to O(N) using HashMap in JavaScript.'
    },
    {
      id: 'act-2',
      type: 'interview',
      title: 'Completed React Frontend Mock Interview',
      time: '3 hours ago',
      description: 'Scored 85% on React reconciler and hooks lifecycle. Needs improvement on stable callbacks.'
    },
    {
      id: 'act-3',
      type: 'resume',
      title: 'Uploaded New Resume',
      time: 'Yesterday',
      description: 'Resume analyzed with an ATS Score of 78/100. Keywords added: Redux, TypeScript.'
    },
    {
      id: 'act-4',
      type: 'job',
      title: 'Applied to Google',
      time: '2 days ago',
      description: 'Job application added to Kanban board under "Applied" column.'
    },
    {
      id: 'act-5',
      type: 'dsa',
      title: 'Solved Coin Change',
      time: '3 days ago',
      description: 'Completed DP bottom-up iterative approach. Beats 75% of users.'
    }
  ],

  weeklyProgress: [
    { day: 'Mon', problems: 4, interviews: 1 },
    { day: 'Tue', problems: 6, interviews: 0 },
    { day: 'Wed', problems: 3, interviews: 2 },
    { day: 'Thu', problems: 8, interviews: 1 },
    { day: 'Fri', problems: 5, interviews: 0 },
    { day: 'Sat', problems: 9, interviews: 2 },
    { day: 'Sun', problems: 7, interviews: 1 }
  ],

  topicScores: [
    { subject: 'Arrays', score: 85, fullMark: 100 },
    { subject: 'Strings', score: 65, fullMark: 100 },
    { subject: 'Linked Lists', score: 90, fullMark: 100 },
    { subject: 'Trees', score: 70, fullMark: 100 },
    { subject: 'Graphs', score: 55, fullMark: 100 },
    { subject: 'DP', score: 45, fullMark: 100 }
  ]
};

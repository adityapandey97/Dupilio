import { createModel } from '../config/db.js';

export const Interview = createModel('Interview', {
  userId: { type: String, required: true },
  interviewName: { type: String, required: true },
  date: { type: String, required: true },
  score: { type: Number, required: true },
  answers: [
    {
      questionId: { type: String, required: true },
      questionText: { type: String, required: true },
      answerText: { type: String, default: '' },
      score: { type: Number, default: 0 },
      feedback: { type: String },
      points: [
        {
          pointText: { type: String, required: true },
          matched: { type: Boolean, default: false }
        }
      ]
    }
  ],
  strengths: { type: [String], default: [] },
  weaknesses: { type: [String], default: [] },
  generalFeedback: { type: String }
});

export default Interview;

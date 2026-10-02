import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { Video, Clock, ChevronRight, HelpCircle } from 'lucide-react';

export const Interviews = () => {
  const [interviews, setInterviews] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.getInterviews().then(setInterviews).catch(err => console.error('Failed to load interviews:', err));
  }, []);

  const handleStartInterview = (interviewId) => {
    navigate(`/interview/room/${interviewId}`);
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          AI Mock Interviews
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Hone your communication and technical skills. Our conversational AI interviewer asks questions, simulates candidate webcam inputs, and evaluates answers against placement expectations.
        </p>
      </div>

      {/* Select List */}
      <div className="grid gap-6 sm:grid-cols-2">
        {interviews.map((interview) => (
          <Card key={interview.id} hoverEffect className="flex flex-col justify-between border border-slate-200/80 dark:border-slate-800 dark:bg-slate-900/60">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 px-3 py-1.5 font-bold text-xs">
                  <Video size={14} />
                  {interview.name}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock size={12} />
                  {interview.duration} Min
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
                {interview.name} Simulation
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-3">
                {interview.description}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
              <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                <HelpCircle size={12} />
                {interview.questions.length} AI Questions
              </span>
              <Button
                variant="primary"
                onClick={() => handleStartInterview(interview.id)}
                icon={<ChevronRight size={14} />}
              >
                Start Interview
              </Button>
            </div>
          </Card>
        ))}
      </div>

    </div>
  );
};

export default Interviews;

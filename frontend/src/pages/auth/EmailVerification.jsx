import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { MailCheck, RefreshCw, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const EmailVerification = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(59);
  const [error, setError] = useState('');

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newCode = [...code];
    newCode[index] = value.substring(value.length - 1);
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsVerifying(true);
    // Simulate API check
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsVerifying(false);
    navigate('/dashboard');
  };

  const handleResend = () => {
    setCode(['', '', '', '', '', '']);
    setCountdown(59);
    setError('');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 font-bold text-white shadow-lg shadow-purple-500/30">
            HP
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Verify Email
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            We sent a verification code to <span className="font-semibold text-slate-700 dark:text-slate-350">{user?.email || 'your email'}</span>
          </p>
        </div>

        <Card className="border border-slate-200/80 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <form className="space-y-6" onSubmit={handleVerify}>
            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200/55 dark:border-red-900/50">
                {error}
              </div>
            )}

            <div className="flex justify-between gap-2 max-w-[280px] mx-auto">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-10 h-12 text-center text-lg font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-slate-50/50 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-250 dark:focus:bg-slate-950 transition-all duration-150"
                />
              ))}
            </div>

            <Button
              type="submit"
              className="w-full mt-4"
              loading={isVerifying}
              icon={<MailCheck size={16} />}
            >
              Verify & Proceed
            </Button>
          </form>

          <div className="mt-6 flex flex-col items-center justify-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
            <p className="text-xs text-slate-400">
              Didn't receive the code?{' '}
              {countdown > 0 ? (
                <span className="font-semibold text-slate-500">Resend in {countdown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="inline-flex items-center gap-1 font-semibold text-purple-600 hover:text-purple-500 dark:text-purple-400 outline-none"
                >
                  <RefreshCw size={12} className="animate-spin-once" />
                  Resend Code
                </button>
              )}
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium"
            >
              Skip verification for demo
              <ArrowRight size={12} />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EmailVerification;

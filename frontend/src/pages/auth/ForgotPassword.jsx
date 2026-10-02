import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { Mail, ArrowLeft, Send } from 'lucide-react';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

export const ForgotPassword = () => {
  const [isSent, setIsSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSent(true);
    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 font-bold text-white shadow-lg shadow-purple-500/30">
            HP
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Forgot Password
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Enter your email and we'll send you a password reset link.
          </p>
        </div>

        <Card className="border border-slate-200/80 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          {!isSent ? (
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                icon={<Mail size={16} />}
                error={errors.email}
                {...register('email')}
              />

              <Button
                type="submit"
                className="w-full"
                loading={isSubmitting}
                icon={<Send size={16} />}
              >
                Send Reset Link
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4 py-4 animate-fade-in">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-250">Check your inbox</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                We have emailed a password reset link. Please check your spam folder if you do not see it in a few minutes.
              </p>
            </div>
          )}

          <div className="mt-6 flex items-center justify-center border-t border-slate-100 pt-4 dark:border-slate-800">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-250 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;

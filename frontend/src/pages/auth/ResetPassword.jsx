import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';

const resetSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

export const ResetPassword = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSuccess(true);
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
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Set your new login credentials below.
          </p>
        </div>

        <Card className="border border-slate-200/80 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          {!isSuccess ? (
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                icon={<Lock size={16} />}
                error={errors.password}
                {...register('password')}
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                icon={<Lock size={16} />}
                error={errors.confirmPassword}
                {...register('confirmPassword')}
              />

              <Button
                type="submit"
                className="w-full mt-4"
                loading={isSubmitting}
              >
                Reset Password
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4 py-4 animate-fade-in">
              <div className="mx-auto flex h-12 w-12 items-center justify-center text-green-600">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-250">Password updated</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Your password has been successfully reset. You can now use your new password to sign in.
              </p>
              <Link to="/login" className="block mt-4">
                <Button className="w-full">Sign In</Button>
              </Link>
            </div>
          )}

          {!isSuccess && (
            <div className="mt-6 flex items-center justify-center border-t border-slate-100 pt-4 dark:border-slate-800">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-250 transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Sign In
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;

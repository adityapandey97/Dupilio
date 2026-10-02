import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { Mail, Lock, User } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

export const Register = () => {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' }
  });

  const onSubmit = async (data) => {
    setError('');
    setIsSubmitting(true);
    try {
      await authRegister(data.name, data.email, data.password);
      // automatically redirects to verify-email or dashboard
      navigate('/verify-email');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 font-extrabold text-white shadow-lg shadow-indigo-500/30 text-lg">
            DP
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Create your Dupilio account
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-purple-600 hover:text-purple-500 dark:text-purple-400">
              Sign in instead
            </Link>
          </p>
        </div>

        <Card className="border border-slate-200/80 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200/55 dark:border-red-900/50">
                {error}
              </div>
            )}

            <Input
              label="Full Name"
              type="text"
              placeholder="Aditya Pandey"
              icon={<User size={16} />}
              error={errors.name}
              {...register('name')}
            />

            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              icon={<Mail size={16} />}
              error={errors.email}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock size={16} />}
              error={errors.password}
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock size={16} />}
              error={errors.confirmPassword}
              {...register('confirmPassword')}
            />

            <div className="flex items-center">
              <input
                id="terms"
                type="checkbox"
                required
                className="h-4 w-4 rounded border-slate-350 text-purple-600 focus:ring-purple-500 dark:border-slate-800"
              />
              <label htmlFor="terms" className="ml-2 block text-xs text-slate-500 dark:text-slate-400">
                I agree to the{' '}
                <a href="#" className="font-semibold text-purple-600 hover:underline dark:text-purple-400">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="font-semibold text-purple-600 hover:underline dark:text-purple-400">
                  Privacy Policy
                </a>.
              </label>
            </div>

            <Button
              type="submit"
              className="w-full mt-4"
              loading={isSubmitting}
            >
              Sign Up
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register;

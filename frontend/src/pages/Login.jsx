import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email: '', password: '' },
    mode: 'onTouched'
  });

  const mutation = useMutation({
    mutationFn: api.auth.login,
    onSuccess: (data) => {
      login(data.token, data.user);
      navigate('/dashboard');
    },
    onError: (error) => {
      setServerError(error.message || 'Invalid signature credentials verification trace.');
    },
  });

  const onSubmit = (data) => {
    setServerError('');
    mutation.mutate(data);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 rounded-lg border border-slate-200 bg-white p-12 shadow-sm max-w-md mx-auto mt-16 animate-in fade-in duration-200">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Welcome Back</h2>
        <p className="text-sm text-slate-500 mt-1">Sign in to monitor your active job queue</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1">Email Address</label>
          <Input
            type="email"
            placeholder="name@company.com"
            className={errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
            {...register('email', { 
              required: 'Account identifier authentication email context maps are required.' 
            })}
          />
          {errors.email && (
            <p className="text-xs font-medium text-red-500 mt-1">⚠️ {errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1">Password</label>
          <Input
            type="password"
            placeholder="••••••••"
            className={errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}
            {...register('password', { 
              required: 'Security verification access pass key is required.' 
            })}
          />
          {errors.password && (
            <p className="text-xs font-medium text-red-500 mt-1">⚠️ {errors.password.message}</p>
          )}
        </div>

        {serverError && (
          <div className="rounded-md bg-red-50 p-2.5 text-xs text-red-600 font-medium border border-red-100">
            🛑 {serverError}
          </div>
        )}

        <Button 
          type="submit" 
          disabled={mutation.isPending}
          className="w-full bg-slate-900 text-white hover:bg-slate-800 transition-colors mt-2"
        >
          {mutation.isPending ? 'Verifying Validation Parameters...' : 'Sign In Account'}
        </Button>
      </form>

      <p className="text-xs text-slate-500 text-center">
        Don't have an account yet?{' '}
        <Link to="/register" className="text-slate-900 font-semibold hover:underline">
          Create Account
        </Link>
      </p>
    </div>
  );
}
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Register() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  // Instantiate the React Hook Form core tracker engine
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { name: '', email: '', password: '' },
    mode: 'onTouched' // Validates fields dynamically as soon as a user clicks away
  });

  // Wire up the database collection insertion mutation route
  const mutation = useMutation({
    mutationFn: api.auth.register,
    onSuccess: () => {
      navigate('/login');
    },
    onError: (error) => {
      setServerError(error.message || 'An error occurred during registration.');
    },
  });

  const onSubmit = (data) => {
    setServerError('');
    mutation.mutate(data);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 rounded-lg border border-slate-200 bg-white p-12 shadow-sm max-w-md mx-auto mt-16 animate-in fade-in duration-200">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Create an Account</h2>
        <p className="text-sm text-slate-500 mt-1">Get started tracking your career opportunities</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4">
        {/* Full Name Input Parameter Entry Field Row */}
        <div>
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1">Full Name</label>
          <Input
            type="text"
            placeholder="John Doe"
            className={errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
            {...register('name', { 
              required: 'Full Name profile property criteria is required.' 
            })}
          />
          {errors.name && (
            <p className="text-xs font-medium text-red-500 mt-1">⚠️ {errors.name.message}</p>
          )}
        </div>

        {/* Email Address Input Parameter Entry Field Row */}
        <div>
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1">Email Address</label>
          <Input
            type="email"
            placeholder="name@company.com"
            className={errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
            {...register('email', { 
              required: 'Email mapping signature criteria is required.',
              pattern: {
                value: /^[A-Z0-BA-z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email specification formatting address structural map.'
              }
            })}
          />
          {errors.email && (
            <p className="text-xs font-medium text-red-500 mt-1">⚠️ {errors.email.message}</p>
          )}
        </div>

        {/* Security Password Input Parameter Entry Field Row */}
        <div>
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1">Password</label>
          <Input
            type="password"
            placeholder="••••••••"
            className={errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}
            {...register('password', { 
              required: 'Security pass phrase registration parameters are required.',
              minLength: {
                value: 6,
                message: 'Password parameter trace criteria must comprise at least 6 characters.'
              }
            })}
          />
          {errors.password && (
            <p className="text-xs font-medium text-red-500 mt-1">⚠️ {errors.password.message}</p>
          )}
        </div>

        {/* Async Server Exception Error Reporting Container */}
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
          {mutation.isPending ? 'Processing Registration Engine...' : 'Register Profile'}
        </Button>
      </form>

      <p className="text-xs text-slate-500 text-center">
        Already have an account?{' '}
        <Link to="/login" className="text-slate-900 font-semibold hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
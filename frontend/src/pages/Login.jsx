import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [serverError, setServerError] = useState('');


  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const { 
    register, 
    handleSubmit, 
    setValue, 
    formState: { errors } 
  } = useForm({
    defaultValues: { email: "", password: "" },
    mode: 'onTouched'
  });
  
  useEffect(() => {
    if (searchParams.get("demo") === "true") {
      setValue("email", "demo@trackr.com");
      setValue("password", "demo1234");
    }
  }, [searchParams, setValue]);

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
    <div className="w-full max-w-md mx-auto px-4 py-8 mt-8 sm:mt-16">
      <div className="flex flex-col gap-6 rounded-xl border border-border bg-card p-8 sm:p-12 shadow-sm transition-colors duration-300 animate-in fade-in duration-200">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome Back</h2>
          <p className="text-sm text-muted-foreground mt-1">Sign in to monitor your active job queue</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Email Address</label>
            <Input  
              type="email"
              placeholder="name@company.com"
              className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
              {...register('email', { 
                required: 'Account identifier authentication email context maps are required.' 
              })}
            />
            {errors.email && (
              <p className="text-xs font-medium text-destructive mt-1">⚠️ {errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              className={errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}
              {...register('password', { 
                required: 'Security verification access pass key is required.' 
              })}
            />
            {errors.password && (
              <p className="text-xs font-medium text-destructive mt-1">⚠️ {errors.password.message}</p>
            )}
          </div>

          {serverError && (
            <div className="rounded-md bg-destructive/10 p-2.5 text-xs text-destructive font-medium border border-destructive/20">
               {serverError}
            </div>
          )}

          <Button 
            type="submit" 
            disabled={mutation.isPending}
            className="w-full mt-2"
          >
            {mutation.isPending ? 'Verifying Validation Parameters...' : 'Sign In Account'}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-foreground font-semibold hover:underline">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
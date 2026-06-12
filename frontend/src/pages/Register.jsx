import { useState, useEffect } from 'react'; 
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext'; 
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Register() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth(); 
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { name: '', email: '', password: '' },
    mode: 'onTouched'
  });

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

  if (isAuthenticated) return null;

  return (
    // Fluid wrapper: centered, responsive padding, responsive width
    <div className="w-full max-w-md mx-auto px-4 py-8 mt-8 sm:mt-16">
      <div className="flex flex-col gap-6 rounded-xl border border-border bg-card p-8 sm:p-12 shadow-sm transition-colors duration-300 animate-in fade-in duration-200">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Create an Account</h2>
          <p className="text-sm text-muted-foreground mt-1">Get started tracking your career opportunities</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Full Name</label>
            <Input
              type="text"
              placeholder="John Doe"
              className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
              {...register('name', { 
                required: 'Full Name profile property criteria is required.' 
              })}
            />
            {errors.name && (
              <p className="text-xs font-medium text-destructive mt-1">⚠️ {errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Email Address</label>
            <Input
              type="email"
              placeholder="name@company.com"
              className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
              {...register('email', { 
                required: 'Email mapping signature criteria is required.',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email specification formatting address structural map.'
                }
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
                required: 'Security pass phrase registration parameters are required.',
                minLength: {
                  value: 6,
                  message: 'Password parameter trace criteria must comprise at least 6 characters.'
                }
              })}
            />
            {errors.password && (
              <p className="text-xs font-medium text-destructive mt-1">⚠️ {errors.password.message}</p>
            )}
          </div>

          {serverError && (
            <div className="rounded-md bg-destructive/10 p-2.5 text-xs text-destructive font-medium border border-destructive/20">
              🛑 {serverError}
            </div>
          )}

          <Button 
            type="submit" 
            disabled={mutation.isPending}
            className="w-full mt-2"
          >
            {mutation.isPending ? 'Processing Registration Engine...' : 'Register Profile'}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-foreground font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
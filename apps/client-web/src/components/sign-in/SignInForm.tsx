import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormMessage } from '@/components/ui/form-message';
import { FormSubmitError } from '@/components/ui/form-submit-error';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema } from '@grow-fitness/shared-schemas';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/useAuth';

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string; password: string }>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      setError(null);
      await login(data.email, data.password);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "We couldn't sign you in. Check your email and password and try again.";
      setError(message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-accent py-12 px-4 sm:px-6 lg:px-8 pt-36">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center !text-white hover:!text-gray-200 mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>

          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-white/90">Sign in to your GROW account</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-foreground">Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  {...register('email')}
                />
                <FormMessage id="email-error" variant="error">
                  {errors.email?.message}
                </FormMessage>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    {...register('password')}
                    className="pr-10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={18} enableBackground='false' /> : <Eye size={18} />}
                  </button>
                </div>

                <FormMessage id="password-error" variant="error">
                  {errors.password?.message}
                </FormMessage>
              </div>

              <div className="flex items-center justify-between">
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full !bg-primary !text-white hover:!bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </Button>

              <div>
                <div className="text-center">
                  <span className="text-gray-600">Don't have an account? </span>
                  <Link to="/sign-up" className="text-primary hover:underline font-medium">
                    Sign up
                  </Link>
                </div>
              </div>
            </form>
            {error && (
              <div className="mt-4">
                <FormSubmitError message={error} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

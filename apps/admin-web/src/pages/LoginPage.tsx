import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema } from '@grow-fitness/shared-schemas';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Eye, EyeOff } from 'lucide-react';

export function LoginPage() {
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
    formState: { isSubmitting },
  } = useForm<{ email: string; password: string }>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      setError(null);
      await login(data.email, data.password);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed');
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
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form (45%) */}
      <div className="w-[45%] bg-white flex flex-col">
        {/* Logo/Branding */}
        <div className="p-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">G</span>
            </div>
            <span className="text-2xl font-bold text-foreground">Grow Fitness Admin</span>
          </div>
        </div>

        {/* Form Container - Centered Vertically */}
        <div className="flex-1 flex items-center justify-center px-12">
          <div className="w-full max-w-md">
            <h1 className="text-3xl font-bold mb-2 text-foreground">Sign in to your account</h1>
            <p className="text-muted-foreground mb-8">
              Enter your email and password to access the admin dashboard
            </p>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2 text-foreground">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="admin@growfitness.com"
                  className="w-full px-4 py-3 border border-input rounded-md bg-muted/50 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring transition-colors"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2 text-foreground">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className="w-full px-4 py-3 pr-12 border border-input rounded-md bg-muted/50 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary-hover transition-colors disabled:opacity-50 font-medium"
              >
                {isSubmitting ? 'Logging in...' : 'Sign in'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Side - Illustration (55%) */}
      <div className="w-[55%] bg-black relative overflow-hidden">
        {/* Illustration Pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 800 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            {/* Abstract people/community illustration pattern */}
            <circle cx="100" cy="150" r="30" fill="white" opacity="0.8" />
            <circle cx="200" cy="120" r="25" fill="white" opacity="0.7" />
            <circle cx="300" cy="180" r="28" fill="white" opacity="0.6" />
            <circle cx="150" cy="250" r="22" fill="white" opacity="0.8" />
            <circle cx="250" cy="280" r="26" fill="white" opacity="0.7" />
            <circle cx="350" cy="220" r="24" fill="white" opacity="0.6" />
            <circle cx="400" cy="150" r="30" fill="white" opacity="0.8" />
            <circle cx="500" cy="120" r="25" fill="white" opacity="0.7" />
            <circle cx="600" cy="180" r="28" fill="white" opacity="0.6" />
            <circle cx="450" cy="250" r="22" fill="white" opacity="0.8" />
            <circle cx="550" cy="280" r="26" fill="white" opacity="0.7" />
            <circle cx="650" cy="220" r="24" fill="white" opacity="0.6" />
            <circle cx="700" cy="150" r="30" fill="white" opacity="0.8" />
            <circle cx="200" cy="350" r="25" fill="white" opacity="0.7" />
            <circle cx="300" cy="380" r="28" fill="white" opacity="0.6" />
            <circle cx="400" cy="320" r="30" fill="white" opacity="0.8" />
            <circle cx="500" cy="350" r="25" fill="white" opacity="0.7" />
            <circle cx="600" cy="380" r="28" fill="white" opacity="0.6" />
            <circle cx="150" cy="450" r="22" fill="white" opacity="0.8" />
            <circle cx="250" cy="480" r="26" fill="white" opacity="0.7" />
            <circle cx="350" cy="420" r="24" fill="white" opacity="0.6" />
            <circle cx="450" cy="450" r="22" fill="white" opacity="0.8" />
            <circle cx="550" cy="480" r="26" fill="white" opacity="0.7" />
            <circle cx="650" cy="420" r="24" fill="white" opacity="0.6" />
            {/* Additional decorative elements */}
            <rect x="120" y="200" width="40" height="60" rx="20" fill="white" opacity="0.5" />
            <rect x="320" y="230" width="40" height="60" rx="20" fill="white" opacity="0.5" />
            <rect x="520" y="200" width="40" height="60" rx="20" fill="white" opacity="0.5" />
            <rect x="220" y="400" width="40" height="60" rx="20" fill="white" opacity="0.5" />
            <rect x="420" y="430" width="40" height="60" rx="20" fill="white" opacity="0.5" />
            <rect x="620" y="400" width="40" height="60" rx="20" fill="white" opacity="0.5" />
          </svg>
        </div>

        {/* Welcome Text Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <h2 className="text-8xl font-bold text-white mix-blend-screen select-none opacity-90">
            Welcome
          </h2>
        </div>
      </div>
    </div>
  );
}

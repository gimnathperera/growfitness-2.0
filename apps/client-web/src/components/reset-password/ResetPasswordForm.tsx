import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/auth';

export default function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError('Invalid or expired reset link.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      await authService.resetPassword(token, password);

      setIsSuccess(true);

      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError('Invalid or expired reset link.');
      console.error('Password reset error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 font-medium">
          Invalid or expired reset link.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-accent py-12 px-4 sm:px-6 lg:px-8 pt-36">
      <div className="max-w-md mx-auto">

        <div className="text-center mb-8">
          <Link
            to="/login"
            className="inline-flex items-center !text-white hover:!text-gray-200 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Link>

          <h1 className="text-3xl font-bold text-white mb-2">
            Reset Password
          </h1>

          <p className="text-white/90">
            Enter your new password
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-foreground">
              Set New Password
            </CardTitle>
            <CardDescription>
              Your password should be secure and unique
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-4">

                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                    {error}
                  </div>
                )}

                <div>
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label>Confirm Password</Label>
                  <Input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full !bg-primary !text-white hover:!bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </Button>

              </form>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-green-600 font-medium">
                  ✅ Password reset successful!
                </p>

                <p className="text-sm text-gray-600">
                  Redirecting to login...
                </p>

                <Link
                  to="/login"
                  className="text-primary hover:underline font-medium"
                >
                  Back to Login
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
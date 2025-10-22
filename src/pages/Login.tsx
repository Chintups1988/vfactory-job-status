import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Lock, User, Building2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

interface LoginProps {
  onLogin: (user: { username: string; token: string; role: 'admin' | 'viewer' }) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const navigate = useNavigate();

  // Check backend connectivity on component mount
  useEffect(() => {
    const checkConnection = async (retryCount = 0) => {
      try {
        setConnectionStatus('checking');
        const response = await API.get('/health');
        console.log('Backend connection check:', response.data);
        setConnectionStatus('connected');
      } catch (err: any) {
        console.error('Backend connection failed:', err);
        setConnectionStatus('disconnected');
        
        // Retry after a delay if we haven't exceeded max retries
        if (retryCount < 2) {
          console.log(`Retrying connection check in 2 seconds... (${retryCount + 1}/3)`);
          setTimeout(() => checkConnection(retryCount + 1), 2000);
        }
      }
    };
    
    checkConnection();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await API.post('/login', {
        username,
        password,
      });

      // Response shape: { token, username, role }
      const token = response.data.token;
      const loggedInUser = { 
        username: response.data.username, 
        token,
        role: response.data.role || 'viewer'
      };

      // Store token and user in localStorage for App.tsx and interceptors
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(loggedInUser));

      // Call the onLogin callback expected by App.tsx
      onLogin(loggedInUser);
      
      // Navigate to main application
      navigate('/');
    } catch (err: any) {
      console.error('Login Error:', err);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.message && err.message.includes('connect')) {
        errorMessage = 'Unable to connect to server. Please ensure the backend is running on port 5001.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Demo login with predefined credentials matching backend seed
      const response = await API.post('/login', {
        username: 'admin',
        password: 'admin123',
      });

      const token = response.data.token;
      const loggedInUser = { 
        username: response.data.username, 
        token,
        role: response.data.role || 'viewer'
      };
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      onLogin(loggedInUser);
      navigate('/');
    } catch (err: any) {
      console.error('Demo Login Error:', err);
      
      let errorMessage = 'Demo login failed. Please try again.';
      
      if (err.message && err.message.includes('connect')) {
        errorMessage = 'Unable to connect to server. Please ensure the backend is running on port 5001.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">VFactory Job Status</h1>
          <p className="text-gray-600">Track and manage your factory jobs efficiently</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Connection Status */}
              <div className="text-xs text-center">
                {connectionStatus === 'checking' && (
                  <span className="text-blue-600">🔄 Checking connection...</span>
                )}
                {connectionStatus === 'connected' && (
                  <span className="text-green-600">✅ Connected to backend</span>
                )}
                {connectionStatus === 'disconnected' && (
                  <div className="space-y-2">
                    <span className="text-red-600 block">❌ Backend connection failed</span>
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Retry connection
                    </button>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Demo Login Button */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleDemoLogin}
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Demo Login"}
            </Button>

            {/* Available Users Info */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs font-semibold text-blue-900 mb-2">Available Test Users:</p>
              <div className="space-y-1.5 text-xs text-blue-700">
                <div className="flex items-center justify-between">
                  <span>👨‍💼 Admin: <code className="bg-blue-100 px-1 rounded">admin</code> / <code className="bg-blue-100 px-1 rounded">admin123</code></span>
                  <span className="text-[10px] text-blue-600">(Full Access)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>👁️ Viewer: <code className="bg-blue-100 px-1 rounded">viewer</code> / <code className="bg-blue-100 px-1 rounded">viewer123</code></span>
                  <span className="text-[10px] text-blue-600">(View Only)</span>
                </div>
              </div>
            </div>

            {/* Register Link */}
            <div className="text-center text-sm">
              <span className="text-gray-600">Don't have an account? </span>
              <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
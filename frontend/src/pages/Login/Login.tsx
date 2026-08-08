import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/auth.service';
import { loginSchema, registerSchema, LoginFormData, RegisterFormData } from '../../schemas/auth.schema';
import { LogIn, UserPlus, AlertCircle, KeyRound, Mail, User as UserIcon, Eye, EyeOff, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function Login() {
  const [isRegisterTab, setIsRegisterTab] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot / Reset Password state
  const [isForgotPasswordView, setIsForgotPasswordView] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState<string | null>(null);
  const [isForgotStep2, setIsForgotStep2] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  // Login Form setup
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Register Form setup
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      await login(data);
      navigate('/');
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      await register(data);
      navigate('/');
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setServerError(null);
    setIsSubmitting(true);
    try {
      const res = await authService.forgotPassword(forgotEmail);
      setForgotSuccessMessage(res.message || 'Password reset requested. You can now enter a new password.');
      setIsForgotStep2(true);
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Failed to process forgot password request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !newPassword) return;
    setServerError(null);
    setIsSubmitting(true);
    try {
      const res = await authService.resetPassword(forgotEmail, newPassword);
      setForgotSuccessMessage(res.message || 'Password reset successful! Please log in.');
      setTimeout(() => {
        setIsForgotPasswordView(false);
        setIsForgotStep2(false);
        setForgotSuccessMessage(null);
        loginForm.setValue('email', forgotEmail);
        loginForm.setValue('password', newPassword);
      }, 2000);
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoUser = () => {
    loginForm.setValue('email', 'demo@teamtrack.com');
    loginForm.setValue('password', 'Password123!');
  };

  return (
    <div>
      {isForgotPasswordView ? (
        /* Forgot Password View */
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3 mb-4">
            <button
              onClick={() => {
                setIsForgotPasswordView(false);
                setIsForgotStep2(false);
                setServerError(null);
                setForgotSuccessMessage(null);
              }}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </button>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Forgot Password</h3>
          </div>

          {serverError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2.5 text-sm text-red-700 dark:text-red-300">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {forgotSuccessMessage && (
            <div className="p-3 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-2.5 text-sm text-green-700 dark:text-green-300">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{forgotSuccessMessage}</span>
            </div>
          )}

          {!isForgotStep2 ? (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Enter your account email address. We will verify your account and allow you to set a new password.
              </p>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Account Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="demo@teamtrack.com"
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg shadow transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {isSubmitting ? 'Verifying Account...' : 'Continue to Reset Password'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Account Email
                </label>
                <input
                  type="email"
                  disabled
                  value={forgotEmail}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800/60 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  New Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-9 pr-10 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg shadow transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {isSubmitting ? 'Updating Password...' : 'Save New Password & Sign In'}
              </button>
            </form>
          )}
        </div>
      ) : (
        /* Standard Auth Interface */
        <div>
          {/* Auth Tab Switcher */}
          <div className="flex border-b border-gray-200 dark:border-gray-800 mb-6">
            <button
              onClick={() => {
                setIsRegisterTab(false);
                setServerError(null);
              }}
              className={`flex-1 pb-3 text-center text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-2 ${
                !isRegisterTab
                  ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
            <button
              onClick={() => {
                setIsRegisterTab(true);
                setServerError(null);
              }}
              className={`flex-1 pb-3 text-center text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-2 ${
                isRegisterTab
                  ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Create Account
            </button>
          </div>

          {/* Global Server Error Alert */}
          {serverError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2.5 text-sm text-red-700 dark:text-red-300">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {!isRegisterTab ? (
            /* Login Form */
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    placeholder="demo@teamtrack.com"
                    {...loginForm.register('email')}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:text-white"
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPasswordView(true);
                      setServerError(null);
                    }}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...loginForm.register('password')}
                    className="w-full pl-9 pr-10 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg shadow transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={fillDemoUser}
                  className="w-full py-1.5 px-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium transition-colors"
                >
                  ⚡ Fill Demo Credentials (demo@teamtrack.com)
                </button>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Alex Rivera"
                    {...registerForm.register('name')}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:text-white"
                  />
                </div>
                {registerForm.formState.errors.name && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {registerForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    placeholder="alex@teamtrack.com"
                    {...registerForm.register('email')}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:text-white"
                  />
                </div>
                {registerForm.formState.errors.email && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    placeholder="Minimum 6 characters"
                    {...registerForm.register('password')}
                    className="w-full pl-9 pr-10 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    title={showRegisterPassword ? 'Hide password' : 'Show password'}
                  >
                    {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {registerForm.formState.errors.password && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg shadow transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {isSubmitting ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

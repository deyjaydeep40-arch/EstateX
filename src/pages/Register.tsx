/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    if (form.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setErrorMsg('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password
      });
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Try a different email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 bg-neutral-50 dark:bg-neutral-950">
      
      <div className="w-full max-w-md rounded-2xl border border-neutral-100 bg-white p-6 shadow-xl dark:border-neutral-850 dark:bg-neutral-900">
        
        {/* Logo and Greeting */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 mb-3">
            <Home className="h-6 w-6" />
          </Link>
          <h2 className="font-display text-2xl font-extrabold text-neutral-900 dark:text-white">Create an account</h2>
          <p className="text-xs text-neutral-400 mt-1">Join EstateX to unlock favorites saving and secure view scheduling.</p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-neutral-400 uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 px-3.5 text-sm text-neutral-800 placeholder-neutral-400 outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
              placeholder="John Doe"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-neutral-400 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 px-3.5 text-sm text-neutral-800 placeholder-neutral-400 outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
              placeholder="name@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-neutral-400 uppercase tracking-wider">Password (Min 6 chars)</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-3.5 pr-10 text-sm text-neutral-800 placeholder-neutral-400 outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-neutral-400 uppercase tracking-wider">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 px-3.5 text-sm text-neutral-800 placeholder-neutral-400 outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
              placeholder="••••••••"
            />
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="flex items-center space-x-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 dark:bg-red-950/20">
              <ShieldAlert className="h-4 w-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>

        {/* Redirect */}
        <p className="mt-6 text-center text-xs text-neutral-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
            Sign in instead
          </Link>
        </p>

      </div>
    </div>
  );
};

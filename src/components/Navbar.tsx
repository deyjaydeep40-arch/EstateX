/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Menu, X, User as UserIcon, LogOut, Home, Compass, MessageSquare, Shield, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('estatex_theme') === 'dark' ||
      (!localStorage.getItem('estatex_theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [showDropdown, setShowDropdown] = useState(false);

  // Synchronize dark class on document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('estatex_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('estatex_theme', 'light');
    }
  }, [darkMode]);

  // Close menus on page navigation
  useEffect(() => {
    setIsOpen(false);
    setShowDropdown(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full glass-panel transition-all duration-200">
      <div id="navbar-container" className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <Link id="nav-logo" to="/" className="flex items-center">
          <span className="font-display text-2xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
            Estate<span className="text-slate-900 dark:text-white">X</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <Link 
            to="/" 
            className={`flex items-center space-x-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              isActive('/') 
                ? 'bg-indigo-50 text-indigo-600 dark:bg-neutral-850 dark:text-indigo-400' 
                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white'
            }`}
          >
            <Compass className="h-4 w-4" />
            <span>Explore</span>
          </Link>
          <Link 
            to="/properties" 
            className={`flex items-center space-x-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              isActive('/properties') 
                ? 'bg-indigo-50 text-indigo-600 dark:bg-neutral-850 dark:text-indigo-400' 
                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white'
            }`}
          >
            <Home className="h-4 w-4" />
            <span>Listings</span>
          </Link>
        </nav>

        {/* Action Controls */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* User Account State */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 rounded-full bg-neutral-100 p-1.5 pr-4 text-sm font-medium text-neutral-800 transition-all hover:bg-neutral-200 dark:bg-neutral-850 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate">{user?.name}</span>
              </button>

              <AnimatePresence>
                {showDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-neutral-100 bg-white p-2 shadow-xl dark:border-neutral-800 dark:bg-neutral-900 z-20"
                    >
                      <div className="px-3 py-2 border-b border-neutral-50 dark:border-neutral-800">
                        <p className="text-xs text-neutral-400">Signed in as</p>
                        <p className="font-semibold text-sm truncate text-neutral-800 dark:text-neutral-200">{user?.email}</p>
                      </div>
                      
                      <div className="mt-1 space-y-1">
                        <Link
                          to="/dashboard"
                          className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                          onClick={() => setShowDropdown(false)}
                        >
                          <Bookmark className="h-4 w-4 text-indigo-500" />
                          <span>My Favorites</span>
                        </Link>
                        <Link
                          to="/dashboard?tab=inquiries"
                          className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                          onClick={() => setShowDropdown(false)}
                        >
                          <MessageSquare className="h-4 w-4 text-emerald-500" />
                          <span>My Inquiries</span>
                        </Link>
                        {user?.isAdmin && (
                          <Link
                            to="/admin"
                            className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                            onClick={() => setShowDropdown(false)}
                          >
                            <Shield className="h-4 w-4 text-violet-500" />
                            <span>Admin Portal</span>
                          </Link>
                        )}
                      </div>
                      
                      <div className="mt-2 pt-2 border-t border-neutral-50 dark:border-neutral-800">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-semibold text-neutral-600 hover:text-indigo-600 dark:text-neutral-300 dark:hover:text-indigo-400 px-4 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold bg-neutral-900 text-white px-5 py-2.5 rounded-full hover:bg-indigo-600 dark:bg-white dark:text-neutral-900 dark:hover:bg-indigo-500 dark:hover:text-white transition-all shadow-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center space-x-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-neutral-100 bg-white dark:border-neutral-800 dark:bg-neutral-950 md:hidden overflow-hidden"
          >
            <div className="space-y-1 px-4 py-3">
              <Link
                to="/"
                className={`flex items-center space-x-2 rounded-full px-4 py-2.5 text-base font-medium transition-colors ${
                  isActive('/') ? 'bg-indigo-50 text-indigo-600 dark:bg-neutral-900' : 'text-neutral-600 dark:text-neutral-300'
                }`}
              >
                <Compass className="h-5 w-5" />
                <span>Explore</span>
              </Link>
              <Link
                to="/properties"
                className={`flex items-center space-x-2 rounded-full px-4 py-2.5 text-base font-medium transition-colors ${
                  isActive('/properties') ? 'bg-indigo-50 text-indigo-600 dark:bg-neutral-900' : 'text-neutral-600 dark:text-neutral-300'
                }`}
              >
                <Home className="h-5 w-5" />
                <span>Listings</span>
              </Link>

              {isAuthenticated ? (
                <>
                  <div className="my-2 border-t border-neutral-100 dark:border-neutral-800 pt-2" />
                  <div className="px-3 py-1.5">
                    <p className="text-xs text-neutral-400">Logged in as</p>
                    <p className="font-semibold text-sm truncate text-neutral-800 dark:text-neutral-200">{user?.name}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-2 rounded-lg px-3 py-2.5 text-base font-medium text-neutral-600 dark:text-neutral-300"
                  >
                    <Bookmark className="h-5 w-5 text-indigo-500" />
                    <span>My Favorites</span>
                  </Link>
                  <Link
                    to="/dashboard?tab=inquiries"
                    className="flex items-center space-x-2 rounded-lg px-3 py-2.5 text-base font-medium text-neutral-600 dark:text-neutral-300"
                  >
                    <MessageSquare className="h-5 w-5 text-emerald-500" />
                    <span>My Inquiries</span>
                  </Link>
                  {user?.isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center space-x-2 rounded-lg px-3 py-2.5 text-base font-medium text-neutral-600 dark:text-neutral-300"
                    >
                      <Shield className="h-5 w-5 text-violet-500" />
                      <span>Admin Portal</span>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center space-x-2 rounded-lg px-3 py-2.5 text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="my-2 border-t border-neutral-100 dark:border-neutral-800 pt-2" />
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      to="/login"
                      className="flex h-11 items-center justify-center rounded-full border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="flex h-11 items-center justify-center rounded-full bg-neutral-900 text-sm font-medium text-white shadow-sm hover:bg-indigo-600"
                    >
                      Register
                    </Link>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

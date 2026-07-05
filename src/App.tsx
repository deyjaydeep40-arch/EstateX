/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Properties } from './pages/Properties';
import { PropertyDetail } from './pages/PropertyDetail';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AnimatedBackground } from './components/AnimatedBackground';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="relative min-h-screen bg-neutral-50/20 dark:bg-neutral-950/20 font-sans antialiased text-neutral-800 dark:text-neutral-200 transition-colors duration-300">
          
          {/* Animated Interactive Blueprint Background */}
          <AnimatedBackground />

          {/* Global Header Navigation */}
          <Navbar />

          {/* Main App Page Boundaries */}
          <main className="pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/properties/:id" element={<PropertyDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

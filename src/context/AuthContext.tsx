/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Property } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  favorites: Property[];
  login: (credentials: any) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  toggleFavorite: (propertyId: string) => Promise<boolean>;
  refreshFavorites: () => Promise<void>;
  isFavorited: (propertyId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('estatex_token'));
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load user profile on startup if token is present
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await api.getMe();
        setUser(profile);
        
        // Load user favorites
        const favs = await api.getFavorites();
        setFavorites(favs);
      } catch (error) {
        console.error('Failed to load user profile on startup:', error);
        // Clean up stale session
        localStorage.removeItem('estatex_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, [token]);

  const login = async (credentials: any) => {
    setIsLoading(true);
    try {
      const data = await api.login(credentials);
      localStorage.setItem('estatex_token', data.token);
      setToken(data.token);
      setUser(data.user);
      
      // Load favorites
      const favs = await api.getFavorites();
      setFavorites(favs);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const data = await api.register(userData);
      localStorage.setItem('estatex_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setFavorites([]);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('estatex_token');
    setToken(null);
    setUser(null);
    setFavorites([]);
  };

  const refreshFavorites = async () => {
    if (!token) return;
    try {
      const favs = await api.getFavorites();
      setFavorites(favs);
    } catch (error) {
      console.error('Failed to refresh favorites:', error);
    }
  };

  const toggleFavorite = async (propertyId: string): Promise<boolean> => {
    if (!token) {
      throw new Error('Please log in to save properties to your favorites');
    }

    try {
      const response = await api.toggleFavorite(propertyId);
      
      // Optimitic local updates for smooth instant state changes
      if (response.isFavorited) {
        // Fetch favorites again or append. Re-fetching is very safe.
        await refreshFavorites();
      } else {
        setFavorites(prev => prev.filter(p => p.id !== propertyId));
      }
      
      return response.isFavorited;
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      throw error;
    }
  };

  const isFavorited = (propertyId: string): boolean => {
    return favorites.some(p => p.id === propertyId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        favorites,
        login,
        register,
        logout,
        toggleFavorite,
        refreshFavorites,
        isFavorited,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

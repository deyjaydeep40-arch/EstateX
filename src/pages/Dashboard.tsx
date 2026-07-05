/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Property, ContactMessage } from '../types';
import { PropertyCard } from '../components/PropertyCard';
import { CardSkeleton } from '../components/SkeletonLoader';
import { Bookmark, MessageSquare, Shield, Clock, Compass, Phone, User, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { getRecentlyViewed, clearRecentlyViewed } from '../utils/recentViews';

export const Dashboard: React.FC = () => {
  const { user, favorites, refreshFavorites, logout, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'favorites';

  const [inquiries, setInquiries] = useState<ContactMessage[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);

  const [recentProperties, setRecentProperties] = useState<Property[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  // Guard routing - redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login?redirect=/dashboard');
    }
  }, [user, authLoading, navigate]);

  // Load inquiries if on the inquiries tab
  useEffect(() => {
    async function fetchInquiries() {
      if (!user) return;
      setLoadingInquiries(true);
      try {
        const data = await api.getUserMessages();
        setInquiries(data);
      } catch (err) {
        console.error('Failed to load inquiries:', err);
      } finally {
        setLoadingInquiries(false);
      }
    }

    if (activeTab === 'inquiries') {
      fetchInquiries();
    }
  }, [activeTab, user]);

  // Load recently viewed properties
  useEffect(() => {
    async function fetchRecentProperties() {
      setLoadingRecent(true);
      try {
        const recentIds = getRecentlyViewed();
        if (recentIds.length === 0) {
          setRecentProperties([]);
          return;
        }

        const response = await api.getProperties({ limit: 100 });
        const allProps: Property[] = response.properties || [];

        // Map and preserve order
        const orderedRecent = recentIds
          .map((id) => allProps.find((p) => p.id === id))
          .filter((p): p is Property => !!p);

        setRecentProperties(orderedRecent);
      } catch (err) {
        console.error('Failed to load recently viewed properties:', err);
      } finally {
        setLoadingRecent(false);
      }
    }

    if (activeTab === 'recent') {
      fetchRecentProperties();
    }
  }, [activeTab]);

  const setTab = (tab: 'favorites' | 'inquiries' | 'recent') => {
    setSearchParams({ tab });
  };

  if (authLoading || !user) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      
      {/* Header Profile Summary bar */}
      <div className="mb-10 rounded-2xl border border-neutral-100 bg-white p-6 dark:border-neutral-850 dark:bg-neutral-900 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white text-2xl font-bold font-display shadow-lg shadow-blue-600/10">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-neutral-900 dark:text-white">{user.name}</h1>
            <p className="text-xs text-neutral-400 mt-0.5">{user.email} • Client account</p>
          </div>
        </div>

        {/* Mini stats counters */}
        <div className="flex items-center space-x-8 text-center border-t md:border-t-0 border-neutral-100 dark:border-neutral-800 pt-4 md:pt-0 w-full md:w-auto justify-around md:justify-start">
          <div>
            <p className="text-2xl font-bold font-display text-blue-600 dark:text-blue-500">{favorites.length}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mt-0.5">Saved Estates</p>
          </div>
          <div className="h-8 w-[1px] bg-neutral-100 dark:bg-neutral-800 hidden sm:block" />
          <div>
            <p className="text-2xl font-bold font-display text-emerald-600 dark:text-emerald-500">
              {activeTab === 'inquiries' ? inquiries.length : '—'}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mt-0.5">Inquiries Sent</p>
          </div>
          {user.isAdmin && (
            <>
              <div className="h-8 w-[1px] bg-neutral-100 dark:bg-neutral-800 hidden sm:block" />
              <Link
                to="/admin"
                className="flex items-center space-x-1.5 rounded-xl bg-purple-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-purple-700 hover:bg-purple-100 dark:bg-purple-950/20 dark:text-purple-400 dark:hover:bg-purple-950/40 transition-colors"
              >
                <Shield className="h-4 w-4" />
                <span>Admin Portal</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-neutral-100 dark:border-neutral-800 mb-8">
        <button
          onClick={() => setTab('favorites')}
          className={`flex items-center space-x-2 border-b-2 px-6 py-3.5 text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'favorites'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400'
          }`}
        >
          <Bookmark className="h-4.5 w-4.5" />
          <span>Saved Favorites</span>
        </button>
        
        <button
          onClick={() => setTab('inquiries')}
          className={`flex items-center space-x-2 border-b-2 px-6 py-3.5 text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'inquiries'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400'
          }`}
        >
          <MessageSquare className="h-4.5 w-4.5" />
          <span>My Inquiries</span>
        </button>

        <button
          onClick={() => setTab('recent')}
          className={`flex items-center space-x-2 border-b-2 px-6 py-3.5 text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'recent'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400'
          }`}
        >
          <Clock className="h-4.5 w-4.5" />
          <span>Recently Viewed</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'favorites' ? (
          favorites.length === 0 ? (
            <div className="flex h-[35vh] flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-neutral-400 mb-4">
                <Bookmark className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-bold text-neutral-800 dark:text-neutral-200">No Saved Estates Yet</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs leading-relaxed">
                Start exploring our curated listings portfolio and click the heart icon on any listing card to save it here.
              </p>
              <Link
                to="/properties"
                className="mt-6 flex items-center space-x-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-blue-700"
              >
                <Compass className="h-4 w-4" />
                <span>Explore Properties</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {favorites.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onFavoriteToggle={refreshFavorites}
                />
              ))}
            </div>
          )
        ) : activeTab === 'recent' ? (
          loadingRecent ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : recentProperties.length === 0 ? (
            <div className="flex h-[35vh] flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-neutral-400 mb-4">
                <Clock className="h-5 w-5 animate-pulse" />
              </div>
              <h3 className="font-display text-lg font-bold text-neutral-800 dark:text-neutral-200">No Recently Viewed Properties</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs leading-relaxed">
                When you browse property listings, they will automatically appear here ordered by how recently you viewed them.
              </p>
              <Link
                to="/properties"
                className="mt-6 flex items-center space-x-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-blue-700"
              >
                <Compass className="h-4 w-4" />
                <span>Explore Properties</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-neutral-50 pb-3 dark:border-neutral-800">
                <p className="text-xs text-neutral-400">Showing up to {recentProperties.length} most recently viewed properties</p>
                <button
                  onClick={() => {
                    clearRecentlyViewed();
                    setRecentProperties([]);
                  }}
                  className="text-xs text-rose-500 hover:underline font-semibold cursor-pointer"
                >
                  Clear History
                </button>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {recentProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onFavoriteToggle={refreshFavorites}
                  />
                ))}
              </div>
            </div>
          )
        ) : (
          loadingInquiries ? (
            <div className="space-y-4">
              <div className="h-16 w-full animate-pulse bg-neutral-100 rounded-xl dark:bg-neutral-850" />
              <div className="h-16 w-full animate-pulse bg-neutral-100 rounded-xl dark:bg-neutral-850" />
            </div>
          ) : inquiries.length === 0 ? (
            <div className="flex h-[35vh] flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-neutral-400 mb-4">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-bold text-neutral-800 dark:text-neutral-200">No Inquiries Submitted</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs leading-relaxed">
                When you submit viewing request forms on listings details pages, they will appear here as a timeline.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl">
              {inquiries.map((inquiry) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={inquiry.id}
                  className="rounded-xl border border-neutral-100 bg-white p-5 dark:border-neutral-850 dark:bg-neutral-900 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-50 pb-3 mb-3.5 dark:border-neutral-800">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Viewing request submitted</span>
                    </div>
                    
                    <div className="flex items-center space-x-1 text-[10px] text-neutral-400">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(inquiry.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-display text-base font-bold text-neutral-800 dark:text-neutral-100">
                      Inquiry for:{' '}
                      <Link to={`/properties/${inquiry.propertyId}`} className="text-blue-600 hover:underline">
                        {inquiry.propertyName || 'Property details'}
                      </Link>
                    </h4>
                    
                    <blockquote className="mt-3 border-l-2 border-neutral-100 pl-3.5 text-xs italic text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                      "{inquiry.message}"
                    </blockquote>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-neutral-400 border-t border-neutral-50 pt-3 dark:border-neutral-800">
                    <span className="flex items-center space-x-1.5">
                      <User className="h-3.5 w-3.5 text-neutral-400" />
                      <span className="font-semibold text-neutral-600 dark:text-neutral-300">Submitter:</span>
                      <span>{inquiry.name}</span>
                    </span>
                    <span className="flex items-center space-x-1.5">
                      <Phone className="h-3.5 w-3.5 text-neutral-400" />
                      <span className="font-semibold text-neutral-600 dark:text-neutral-300">Callback:</span>
                      <span>{inquiry.phone}</span>
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        )}
      </div>

    </div>
  );
};

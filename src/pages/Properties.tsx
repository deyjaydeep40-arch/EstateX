/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Property, SearchFilters as FiltersType } from '../types';
import { SearchFilters } from '../components/SearchFilters';
import { PropertyCard } from '../components/PropertyCard';
import { InteractiveMap } from '../components/InteractiveMap';
import { CardSkeleton } from '../components/SkeletonLoader';
import { Map, List, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Properties: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
  
  // Mobile toggle between list and map view
  const [showMobileMap, setShowMobileMap] = useState(false);

  // Pagination states
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 6,
    pages: 1
  });

  // Filters state, initialized from URL Search Params if available
  const [filters, setFilters] = useState<FiltersType>({
    city: searchParams.get('city') || '',
    priceMin: searchParams.get('priceMin') || '',
    priceMax: searchParams.get('priceMax') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    propertyType: searchParams.get('propertyType') || '',
    type: (searchParams.get('type') as any) || 'all',
    searchQuery: searchParams.get('searchQuery') || ''
  });

  // Update URL whenever filters change (sync URL for SEO/sharability)
  useEffect(() => {
    const params: Record<string, string> = {};
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params[key] = String(val);
      }
    });
    // Add page if not 1
    if (pagination.page > 1) {
      params['page'] = String(pagination.page);
    }
    setSearchParams(params, { replace: true });
  }, [filters, pagination.page]);

  // Fetch properties from API
  const fetchProperties = async () => {
    setLoading(true);
    try {
      const data = await api.getProperties({
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      });
      setProperties(data.properties);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch on filter or page changes
  useEffect(() => {
    fetchProperties();
  }, [filters, pagination.page]);

  // Reset page to 1 when filters change to avoid empty results
  const handleFilterChange = (newFilters: FiltersType) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
      // Scroll list pane back to top
      const listPane = document.getElementById('listings-pane');
      if (listPane) {
        listPane.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-neutral-50 dark:bg-neutral-950 overflow-hidden">
      
      {/* Search Filters Row */}
      <div className="border-b border-neutral-100 bg-white px-4 py-4 dark:border-neutral-900 dark:bg-neutral-950 flex-shrink-0 z-10">
        <div className="mx-auto max-w-7xl">
          <SearchFilters filters={filters} onChange={handleFilterChange} />
        </div>
      </div>

      {/* Main Dual-Pane Section */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Left Pane: Listing cards list */}
        <div
          id="listings-pane"
          className={`h-full flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full md:max-w-none md:mx-0 md:w-auto md:flex-[7] transition-all duration-300 ${
            showMobileMap ? 'hidden md:block' : 'block'
          }`}
        >
          {/* Header info */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Search Results</p>
              <h1 className="font-display text-2xl font-extrabold text-neutral-900 dark:text-white">
                {loading ? 'Discovering...' : `${pagination.total} Match${pagination.total !== 1 ? 'es' : ''} Found`}
              </h1>
            </div>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <CardSkeleton count={pagination.limit} />
            </div>
          ) : properties.length === 0 ? (
            <div className="flex h-[40vh] flex-col items-center justify-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-neutral-400">
                <SlidersHorizontal className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-neutral-800 dark:text-neutral-200">No Listings Match Filters</h3>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 max-w-xs">
                Try expanding your search query, increasing your price bounds, or adjusting bedroom counts.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {properties.map((property) => (
                <div
                  key={property.id}
                  onMouseEnter={() => setHoveredPropertyId(property.id)}
                  onMouseLeave={() => setHoveredPropertyId(null)}
                >
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.pages > 1 && !loading && (
            <div className="mt-12 mb-8 flex items-center justify-center space-x-3">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 shadow-sm transition-all hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <div className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Page <span className="text-blue-600">{pagination.page}</span> of {pagination.pages}
              </div>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 shadow-sm transition-all hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Right Pane: Map viewer (Desktop layout) */}
        <div
          className={`h-full md:flex-[5] border-l border-neutral-100 dark:border-neutral-900 relative transition-all duration-300 ${
            showMobileMap ? 'block w-full absolute inset-0 z-20 md:relative md:block' : 'hidden md:block'
          }`}
        >
          <InteractiveMap
            properties={properties}
            hoveredPropertyId={hoveredPropertyId}
            onMarkerHover={setHoveredPropertyId}
          />
        </div>

      </div>

      {/* Floating Bottom Toggle Button for Mobile */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 md:hidden">
        <button
          onClick={() => setShowMobileMap(!showMobileMap)}
          className="flex items-center space-x-2 rounded-full bg-neutral-950 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-xl hover:scale-105 active:scale-95 transition-all dark:bg-white dark:text-neutral-950"
        >
          {showMobileMap ? (
            <>
              <List className="h-4 w-4" />
              <span>Show Grid</span>
            </>
          ) : (
            <>
              <Map className="h-4 w-4" />
              <span>Show Map</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SearchFilters as FiltersType } from '../types';
import { Search, MapPin, DollarSign, BedDouble, Building, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

interface SearchFiltersProps {
  filters: FiltersType;
  onChange: (filters: FiltersType) => void;
  cities?: string[];
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({ 
  filters, 
  onChange,
  cities = ['Los Angeles', 'Malibu', 'New York', 'Aspen', 'Miami', 'San Francisco']
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({
      ...filters,
      [name]: value
    });
  };

  const setType = (type: 'all' | 'buy' | 'rent') => {
    onChange({ ...filters, type });
  };

  const resetFilters = () => {
    onChange({
      city: '',
      priceMin: '',
      priceMax: '',
      bedrooms: '',
      propertyType: '',
      type: 'all',
      searchQuery: ''
    });
  };

  return (
    <div className="w-full rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/95">
      
      {/* Upper row: Transaction Type Tabs & Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-slate-100 pb-4 dark:border-neutral-800">
        <div className="flex rounded-xl bg-slate-50 p-1 dark:bg-neutral-800 w-fit border border-slate-100/50 dark:border-neutral-700/30">
          <button
            type="button"
            onClick={() => setType('all')}
            className={`rounded-lg px-5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
              filters.type === 'all'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-neutral-700 dark:text-white'
                : 'text-slate-400 hover:text-slate-600 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setType('buy')}
            className={`rounded-lg px-5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
              filters.type === 'buy'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-600 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            Buy / Purchase
          </button>
          <button
            type="button"
            onClick={() => setType('rent')}
            className={`rounded-lg px-5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
              filters.type === 'rent'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-600 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            Rent
          </button>
        </div>

        <button
          type="button"
          onClick={resetFilters}
          className="flex items-center space-x-1.5 rounded-lg border border-slate-100 px-4 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* Grid search area */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-5">
        
        {/* Search Query */}
        <div className="relative md:col-span-2 lg:col-span-1 flex flex-col">
          <label className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">Search</label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              name="searchQuery"
              value={filters.searchQuery}
              onChange={handleInputChange}
              placeholder="Address, keyword..."
              className="w-full rounded-xl border border-slate-100 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
            />
          </div>
        </div>

        {/* City Filter */}
        <div className="flex flex-col">
          <label className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">Location</label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              name="city"
              value={filters.city}
              onChange={handleInputChange}
              className="w-full appearance-none rounded-xl border border-slate-100 bg-slate-50 py-2.5 pl-10 pr-8 text-sm text-slate-800 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200 [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-neutral-950 dark:[&>option]:text-white"
            >
              <option value="">All Locations</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Price Range */}
        <div className="flex flex-col md:col-span-2 lg:col-span-1">
          <label className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">Price Range</label>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
              <input
                type="number"
                name="priceMin"
                value={filters.priceMin}
                onChange={handleInputChange}
                placeholder="Min"
                className="w-full rounded-xl border border-slate-100 bg-slate-50 py-2.5 pl-7 pr-2 text-sm text-slate-800 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
              />
            </div>
            <span className="text-slate-300 text-xs">-</span>
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
              <input
                type="number"
                name="priceMax"
                value={filters.priceMax}
                onChange={handleInputChange}
                placeholder="Max"
                className="w-full rounded-xl border border-slate-100 bg-slate-50 py-2.5 pl-7 pr-2 text-sm text-slate-800 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
              />
            </div>
          </div>
        </div>

        {/* Bedrooms */}
        <div className="flex flex-col">
          <label className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">Bedrooms</label>
          <div className="relative">
            <BedDouble className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              name="bedrooms"
              value={filters.bedrooms}
              onChange={handleInputChange}
              className="w-full appearance-none rounded-xl border border-slate-100 bg-slate-50 py-2.5 pl-10 pr-8 text-sm text-slate-800 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200 [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-neutral-950 dark:[&>option]:text-white"
            >
              <option value="">Any Bedrooms</option>
              <option value="1">1+ Beds</option>
              <option value="2">2+ Beds</option>
              <option value="3">3+ Beds</option>
              <option value="4">4+ Beds</option>
              <option value="5">5+ Beds</option>
            </select>
          </div>
        </div>

        {/* Property Type */}
        <div className="flex flex-col">
          <label className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">Home Type</label>
          <div className="relative">
            <Building className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              name="propertyType"
              value={filters.propertyType}
              onChange={handleInputChange}
              className="w-full appearance-none rounded-xl border border-slate-100 bg-slate-50 py-2.5 pl-10 pr-8 text-sm text-slate-800 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200 [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-neutral-950 dark:[&>option]:text-white"
            >
              <option value="">All Types</option>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="condo">Condo</option>
              <option value="townhouse">Townhouse</option>
            </select>
          </div>
        </div>

      </div>
    </div>
  );
};

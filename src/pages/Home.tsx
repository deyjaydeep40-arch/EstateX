/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Property } from '../types';
import { PropertyCard } from '../components/PropertyCard';
import { CardSkeleton } from '../components/SkeletonLoader';
import { Search, MapPin, Sparkles, Building, ArrowRight, ShieldCheck, BadgeDollarSign, Award } from 'lucide-react';
import { motion } from 'motion/react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    city: '',
    type: 'all'
  });

  useEffect(() => {
    async function loadFeatured() {
      try {
        const data = await api.getFeaturedProperties();
        setFeatured(data);
      } catch (err) {
        console.error('Failed to load featured properties:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/properties?city=${searchParams.city}&type=${searchParams.type}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section */}
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden px-4 py-20 text-slate-900 dark:text-white border-b border-slate-100/50 dark:border-neutral-900/50">
        
        {/* Floating gradient lights */}
        <div className="absolute left-1/4 top-1/4 -z-10 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 -z-10 h-96 w-96 rounded-full bg-violet-500/5 blur-3xl" />

        <div className="relative z-10 mx-auto w-full max-w-5xl text-center">
          
          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto flex w-fit items-center space-x-1.5 rounded-full bg-indigo-50/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-indigo-600 border border-indigo-100/50 mb-6 backdrop-blur-md dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30"
          >
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>EXCEPTIONAL REAL ESTATE SERVICES</span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-slate-900 dark:text-white leading-tight"
          >
            Find Your Signature <br />
            <span className="text-indigo-600 dark:text-indigo-400">
              Address of Distinction
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-xl text-sm sm:text-base text-slate-500 dark:text-neutral-400 font-normal leading-relaxed"
          >
            A curated portfolio of ultra-premium estates, high-rise duplexes, and waterfront villas across America's most coveted locations.
          </motion.p>

          {/* Animated Search Bar Form */}
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onSubmit={handleSearchSubmit}
            className="mx-auto mt-12 w-full max-w-3xl rounded-2xl border border-slate-100 bg-white p-2 shadow-xl dark:border-neutral-800 dark:bg-neutral-900/95 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center"
          >
            {/* City Search select */}
            <div className="flex items-center space-x-2 rounded-xl bg-slate-50 border border-slate-100 px-4 py-2.5 dark:bg-neutral-800/60 dark:border-neutral-850">
              <MapPin className="h-5 w-5 text-indigo-500 flex-shrink-0" />
              <select
                value={searchParams.city}
                onChange={(e) => setSearchParams({ ...searchParams, city: e.target.value })}
                className="w-full bg-transparent text-sm font-medium text-slate-700 dark:text-white outline-none [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-neutral-950 dark:[&>option]:text-white"
              >
                <option value="">Select City (All)</option>
                <option value="Los Angeles">Los Angeles</option>
                <option value="Malibu">Malibu</option>
                <option value="New York">New York</option>
                <option value="Aspen">Aspen</option>
                <option value="Miami">Miami</option>
                <option value="San Francisco">San Francisco</option>
              </select>
            </div>

            {/* Type search select */}
            <div className="flex items-center space-x-2 rounded-xl bg-slate-50 border border-slate-100 px-4 py-2.5 dark:bg-neutral-800/60 dark:border-neutral-850">
              <Building className="h-5 w-5 text-indigo-500 flex-shrink-0" />
              <select
                value={searchParams.type}
                onChange={(e) => setSearchParams({ ...searchParams, type: e.target.value })}
                className="w-full bg-transparent text-sm font-medium text-slate-700 dark:text-white outline-none [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-neutral-950 dark:[&>option]:text-white"
              >
                <option value="all">Purchase / Rent</option>
                <option value="buy">Buy / Purchase</option>
                <option value="rent">Rent</option>
              </select>
            </div>

            {/* Search Submit button */}
            <button
              type="submit"
              className="flex h-full w-full items-center justify-center space-x-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-indigo-600/10 hover:bg-indigo-500 hover:scale-[1.01] transition-all cursor-pointer"
            >
              <Search className="h-4.5 w-4.5" />
              <span>Explore Listings</span>
            </button>
          </motion.form>

        </div>
      </section>

      {/* Stats Board Section */}
      <section className="py-12 border-y border-slate-100/60 dark:border-neutral-900/40 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="glass-panel rounded-3xl p-8 shadow-lg grid grid-cols-2 gap-8 md:grid-cols-4 text-center border border-white/40 dark:border-white/5 backdrop-blur-md">
            <div className="flex flex-col">
              <span className="text-3xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400 font-display sm:text-4xl">$12B+</span>
              <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-neutral-400">Transaction Volume</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400 font-display sm:text-4xl">18k+</span>
              <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-neutral-400">Premium Listings</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400 font-display sm:text-4xl">99.4%</span>
              <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-neutral-400">Client Satisfaction</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400 font-display sm:text-4xl">14+</span>
              <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-neutral-400">Years of Excellence</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured properties section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Featured Signature Estates
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-neutral-400 max-w-xl">
              Hand-selected luxury masterpieces featuring exceptional design, premium materials, and unparalleled locations.
            </p>
          </div>
          
          <Link
            to="/properties"
            className="flex items-center space-x-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            <span>Browse All Listings</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <CardSkeleton count={3} />
          ) : (
            featured.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))
          )}
        </div>
      </section>

      {/* Why Choose EstateX Section */}
      <section className="py-20 border-t border-slate-100/60 dark:border-neutral-900/40 relative overflow-hidden">
        {/* Soft decorative background glow */}
        <div className="absolute right-0 top-1/2 -z-10 h-72 w-72 rounded-full bg-indigo-500/5 blur-3xl" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              The EstateX Distinction
            </h2>
            <p className="mt-3 text-sm text-slate-500 dark:text-neutral-400">
              Redefining real estate through unparalleled market expertise, intelligent AI discovery, and absolute client dedication.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            
            {/* Feature 1 */}
            <motion.div 
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="rounded-2xl bg-white/70 dark:bg-neutral-950/40 p-7 shadow-sm border border-slate-100 dark:border-neutral-850 backdrop-blur-md hover:border-indigo-200 dark:hover:border-indigo-900/60 hover:shadow-md hover:shadow-indigo-500/5 transition-all duration-300"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-900/20">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-slate-900 dark:text-white">Absolute Security</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-neutral-400">
                Each listing in our portfolio is extensively vetted, structurally inspected, and title-guaranteed for absolute piece of mind.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="rounded-2xl bg-white/70 dark:bg-neutral-950/40 p-7 shadow-sm border border-slate-100 dark:border-neutral-850 backdrop-blur-md hover:border-indigo-200 dark:hover:border-indigo-900/60 hover:shadow-md hover:shadow-indigo-500/5 transition-all duration-300"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-900/20">
                <BadgeDollarSign className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-slate-900 dark:text-white">Elite Asset Valuations</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-neutral-400">
                Leverage proprietary predictive analytics and local submarket trends to purchase properties with optimal value vectors.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="rounded-2xl bg-white/70 dark:bg-neutral-950/40 p-7 shadow-sm border border-slate-100 dark:border-neutral-850 backdrop-blur-md hover:border-indigo-200 dark:hover:border-indigo-900/60 hover:shadow-md hover:shadow-indigo-500/5 transition-all duration-300"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-900/20">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-slate-900 dark:text-white">Bespoke Concierge Care</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-neutral-400">
                Your dedicated local advisory coordinator guides you seamlessly through viewings, structural inspections, legal, and settlement.
              </p>
            </motion.div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white py-12 text-slate-400 dark:bg-neutral-950 border-t border-slate-100 dark:border-neutral-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center sm:text-left sm:flex sm:items-center sm:justify-between text-[11px] uppercase tracking-wider font-semibold">
          <p>© 2026 EstateX Premium Real Estate. All rights reserved.</p>
          <div className="mt-4 sm:mt-0 flex justify-center space-x-6">
            <span className="hover:text-indigo-600 transition-colors cursor-pointer">Privacy Charter</span>
            <span className="hover:text-indigo-600 transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-indigo-600 transition-colors cursor-pointer">Regulatory Disclosures</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

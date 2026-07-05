/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Property } from '../types';
import { useAuth } from '../context/AuthContext';
import { PropertyCard } from '../components/PropertyCard';
import { DetailSkeleton } from '../components/SkeletonLoader';
import { Heart, MapPin, BedDouble, Bath, Maximize2, Send, ChevronLeft, Phone, Mail, Sparkles, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageGallery } from '../components/ImageGallery';
import { PropertyMap } from '../components/PropertyMap';
import { addRecentlyViewed } from '../utils/recentViews';

export const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isFavorited, toggleFavorite, isAuthenticated, user } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [related, setRelated] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');
  
  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    message: 'Hello, I am highly interested in this listing and would like to schedule a private viewing. Please contact me at your earliest convenience.'
  });
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [favError, setFavError] = useState<string | null>(null);

  // Sync contact form when user profile loads
  useEffect(() => {
    if (user) {
      setContactForm(prev => ({
        ...prev,
        name: user.name,
        email: user.email
      }));
    }
  }, [user]);

  useEffect(() => {
    async function loadPropertyDetails() {
      if (!id) return;
      setLoading(true);
      setSendSuccess(false);
      try {
        const data = await api.getPropertyById(id);
        setProperty(data.property);
        setRelated(data.related);
        setActiveImage(data.property.imageUrl);
        // Track as recently viewed property
        addRecentlyViewed(id);
      } catch (err) {
        console.error('Failed to load property details:', err);
        navigate('/properties');
      } finally {
        setLoading(false);
      }
    }
    loadPropertyDetails();
  }, [id, navigate]);

  const handleToggleFavorite = async () => {
    if (!property) return;
    if (!isAuthenticated) {
      setFavError('Please sign in to save properties');
      setTimeout(() => setFavError(null), 3000);
      return;
    }

    try {
      await toggleFavorite(property.id);
    } catch (err: any) {
      setFavError(err.message || 'Failed to update favorite');
      setTimeout(() => setFavError(null), 3000);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    setIsSending(true);
    setErrorMsg(null);

    try {
      await api.sendMessage({
        ...contactForm,
        propertyId: property.id
      });
      setSendSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return <DetailSkeleton />;
  }

  if (!property) {
    return null;
  }

  const favorited = isFavorited(property.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Back to listings bar */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/properties"
          className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to All Listings</span>
        </Link>
      </div>

      {/* Main title block */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded-lg bg-neutral-900/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
              {property.propertyType}
            </span>
            <span className="rounded-lg bg-blue-600/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              For {property.type}
            </span>
          </div>
          
          <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl text-neutral-950 dark:text-white mt-3">
            {property.title}
          </h1>
          
          <div className="flex items-center space-x-1 text-sm text-neutral-500 dark:text-neutral-400 mt-1.5">
            <MapPin className="h-4.5 w-4.5 text-blue-500" />
            <span>{property.location}</span>
          </div>
        </div>

        {/* Pricing & Favorite */}
        <div className="flex items-center space-x-4 md:text-right">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Listing Price</p>
            <p className="font-display text-3xl font-extrabold text-blue-600 dark:text-blue-500">
              ${property.price.toLocaleString()}
              {property.type === 'rent' && <span className="text-sm font-normal text-neutral-500">/mo</span>}
            </p>
          </div>

          <div className="relative">
            <button
              onClick={handleToggleFavorite}
              className={`flex h-12 w-12 items-center justify-center rounded-xl border shadow-sm transition-all ${
                favorited 
                  ? 'border-rose-200 bg-rose-50 text-rose-500 dark:border-rose-950 dark:bg-rose-950/20' 
                  : 'border-neutral-200 bg-white text-neutral-600 hover:text-rose-500 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800'
              }`}
              title={favorited ? 'Remove from favorites' : 'Save to favorites'}
            >
              <Heart className={`h-5.5 w-5.5 ${favorited ? 'fill-current' : ''}`} />
            </button>
            {favError && (
              <div className="absolute right-0 top-14 z-20 whitespace-nowrap rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg animate-fade-in">
                {favError}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Property Image Gallery with Zoom / Lightbox */}
      <div className="mb-10">
        <ImageGallery
          images={[property.imageUrl, ...(property.images || [])]}
          title={property.title}
        />
      </div>

      {/* Description / Spec Grid & Contact sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Spec badges, Details, description */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Specifications row */}
          <div className="grid grid-cols-3 gap-4 rounded-2xl border border-neutral-100 bg-white p-5 text-center dark:border-neutral-850 dark:bg-neutral-900">
            <div>
              <div className="flex justify-center text-neutral-400 mb-1">
                <BedDouble className="h-5 w-5" />
              </div>
              <p className="font-display text-lg font-extrabold text-neutral-900 dark:text-white">{property.bedrooms}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Bedrooms</p>
            </div>
            <div className="border-x border-neutral-100 dark:border-neutral-800">
              <div className="flex justify-center text-neutral-400 mb-1">
                <Bath className="h-5 w-5" />
              </div>
              <p className="font-display text-lg font-extrabold text-neutral-900 dark:text-white">{property.bathrooms}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Bathrooms</p>
            </div>
            <div>
              <div className="flex justify-center text-neutral-400 mb-1">
                <Maximize2 className="h-5 w-5" />
              </div>
              <p className="font-display text-lg font-extrabold text-neutral-900 dark:text-white">{property.area.toLocaleString()}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Square Feet</p>
            </div>
          </div>

          {/* Marketing Copy description */}
          <div className="space-y-4">
            <h3 className="font-display text-xl font-bold text-neutral-950 dark:text-white">
              Listing Description
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Vetted Badges */}
          <div className="rounded-2xl border border-neutral-100 bg-neutral-50/50 p-5 dark:border-neutral-850 dark:bg-neutral-900/50 space-y-3.5">
            <h4 className="font-display text-xs font-bold uppercase tracking-widest text-neutral-400">Vetting & Compliance</h4>
            <div className="flex items-start space-x-3 text-xs">
              <ShieldCheck className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-neutral-800 dark:text-neutral-200">EstateX Structural Title Guarantee</p>
                <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed mt-0.5">
                  This estate has cleared all structural diagnostics and is backed by our full legal title guarantee, assuring a secure transaction.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Location & Google Map */}
          {property.coordinates && (
            <PropertyMap
              coordinates={property.coordinates}
              title={property.title}
              address={property.location}
            />
          )}

        </div>

        {/* Right Side: Contact owner / request viewing form */}
        <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-lg dark:border-neutral-850 dark:bg-neutral-900">
          <div className="border-b border-neutral-50 pb-4 mb-4 dark:border-neutral-800">
            <h3 className="font-display text-lg font-extrabold text-neutral-950 dark:text-white">Schedule viewing</h3>
            <p className="text-xs text-neutral-400 mt-1">Submit an inquiry directly to the property advisory agent.</p>
          </div>

          <div className="flex items-center space-x-3 mb-6 bg-neutral-50 p-3 rounded-xl dark:bg-neutral-950/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white text-sm font-bold">
              SJ
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Sarah Jenkins</p>
              <p className="text-[10px] text-neutral-400">Local EstateX Advisor • (310) 555-0142</p>
            </div>
          </div>

          {sendSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center py-8 space-y-3.5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20">
                <Send className="h-5 w-5 animate-pulse" />
              </div>
              <h4 className="font-display text-base font-bold text-neutral-800 dark:text-neutral-200">Inquiry Sent!</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs">
                Your scheduling request was successfully delivered. Sarah Jenkins will follow up shortly.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              
              {/* Name */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-400 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 px-3.5 text-xs text-neutral-800 placeholder-neutral-400 outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
                  placeholder="Jane Doe"
                />
              </div>

              {/* Email */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-400 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 px-3.5 text-xs text-neutral-800 placeholder-neutral-400 outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
                  placeholder="jane@example.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-400 uppercase tracking-wider">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 px-3.5 text-xs text-neutral-800 placeholder-neutral-400 outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200"
                  placeholder="(555) 000-0000"
                />
              </div>

              {/* Message */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-400 uppercase tracking-wider">Message</label>
                <textarea
                  rows={4}
                  required
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 px-3.5 text-xs text-neutral-800 placeholder-neutral-400 outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200 resize-none"
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-500 font-medium">{errorMsg}</p>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSending}
                className="flex w-full items-center justify-center space-x-2 rounded-xl bg-blue-600 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Send className="h-4 w-4" />
                <span>{isSending ? 'Sending Request...' : 'Send Viewing Inquiry'}</span>
              </button>

              {!isAuthenticated && (
                <p className="text-[10px] text-center text-neutral-400">
                  Note: You can submit anonymously, but <Link to="/login" className="text-blue-500 hover:underline">signing in</Link> allows you to track inquiry timelines in your dashboard.
                </p>
              )}

            </form>
          )}
        </div>

      </div>

      {/* Related properties section */}
      {related.length > 0 && (
        <section className="mt-20 border-t border-neutral-100 pt-16 dark:border-neutral-900">
          <h3 className="font-display text-2xl font-extrabold text-neutral-900 dark:text-white mb-8">
            Similar Signature Listings
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

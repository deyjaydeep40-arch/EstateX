/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Property } from '../types';
import { useAuth } from '../context/AuthContext';
import { Heart, MapPin, BedDouble, Bath, Maximize2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface PropertyCardProps {
  property: Property;
  onFavoriteToggle?: () => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onFavoriteToggle }) => {
  const { isFavorited, toggleFavorite, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLiking, setIsLiking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const favorited = isFavorited(property.id);

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    }
    return `$${price.toLocaleString()}`;
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      setErrorMsg('Sign in to save favorites');
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    setIsLiking(true);
    try {
      await toggleFavorite(property.id);
      if (onFavoriteToggle) {
        onFavoriteToggle();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update favorite');
      setTimeout(() => setErrorMsg(null), 3000);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
    >
      {/* Favorite Button */}
      <div className="absolute right-3.5 top-3.5 z-10">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          disabled={isLiking}
          onClick={handleFavoriteClick}
          className={`flex h-9 w-9 items-center justify-center rounded-full shadow-md backdrop-blur-md transition-colors ${
            favorited 
              ? 'bg-rose-500 text-white shadow-rose-500/10' 
              : 'bg-white/90 text-neutral-600 hover:text-rose-500 hover:bg-white dark:bg-neutral-800/95 dark:text-neutral-300 dark:hover:bg-neutral-800'
          }`}
          aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`h-4.5 w-4.5 ${favorited ? 'fill-current' : ''}`} />
        </motion.button>
        
        {/* Instant error tooltip */}
        {errorMsg && (
          <div className="absolute right-0 top-11 z-20 whitespace-nowrap rounded-lg bg-neutral-900 px-2.5 py-1 text-xs font-medium text-white shadow-lg dark:bg-neutral-100 dark:text-neutral-900 animate-fade-in">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Property Link */}
      <Link to={`/properties/${property.id}`} className="flex flex-col h-full">
        {/* Image Frame */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
          <img
            src={property.imageUrl}
            alt={property.title}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          
          {/* Featured badge */}
          {property.featured && (
            <div className="absolute left-3.5 top-3.5 flex items-center space-x-1 rounded-md bg-indigo-600/95 px-3 py-1 text-[10px] font-bold tracking-wider text-white shadow-sm backdrop-blur-sm">
              <Sparkles className="h-3 w-3" />
              <span>PREMIUM</span>
            </div>
          )}

          {/* Type Badge */}
          <div className="absolute bottom-3 left-3.5 rounded-md bg-neutral-900/85 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm dark:bg-neutral-950/85">
            {property.type === 'buy' ? 'For Sale' : 'For Rent'}
          </div>
        </div>

        {/* Details Wrapper */}
        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="font-display text-xl font-bold tracking-tight text-neutral-950 dark:text-white">
              {formatPrice(property.price)}
              {property.type === 'rent' && <span className="text-xs font-normal text-neutral-500"> /mo</span>}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              {property.propertyType}
            </span>
          </div>

          <h3 className="line-clamp-1 font-display text-base font-semibold text-neutral-800 dark:text-neutral-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {property.title}
          </h3>

          <div className="mt-1.5 flex items-center space-x-1 text-xs text-neutral-500 dark:text-neutral-400">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-indigo-500" />
            <span className="truncate">{property.location}</span>
          </div>

          {/* Stats Bar */}
          <div className="mt-4 flex items-center justify-between border-t border-neutral-50 pt-3.5 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
            <div className="flex items-center space-x-1">
              <BedDouble className="h-4 w-4 text-neutral-400" />
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">{property.bedrooms}</span>
              <span>Beds</span>
            </div>
            <div className="flex items-center space-x-1">
              <Bath className="h-4 w-4 text-neutral-400" />
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">{property.bathrooms}</span>
              <span>Baths</span>
            </div>
            <div className="flex items-center space-x-1">
              <Maximize2 className="h-4 w-4 text-neutral-400" />
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">{property.area.toLocaleString()}</span>
              <span>sq ft</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

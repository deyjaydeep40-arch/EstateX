/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Property } from '../types';
import { Link } from 'react-router-dom';
import { MapPin, ZoomIn, ZoomOut, Maximize, Navigation, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InteractiveMapProps {
  properties: Property[];
  hoveredPropertyId?: string | null;
  onMarkerHover?: (id: string | null) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  properties,
  hoveredPropertyId,
  onMarkerHover,
}) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeLayer, setActiveLayer] = useState<'streets' | 'satellite'>('streets');

  // Center on property when hovered or clicked externally
  useEffect(() => {
    if (hoveredPropertyId) {
      const prop = properties.find((p) => p.id === hoveredPropertyId);
      if (prop) {
        setSelectedProperty(prop);
      }
    }
  }, [hoveredPropertyId, properties]);

  // Convert lat/lng to stylized SVG map coordinates (0 - 1000 range)
  // Let's map coordinates for NY, SF, LA, Malibu, Aspen, Miami
  const getMapCoords = (lat: number, lng: number) => {
    // Normalization bounds for US major cities
    // SF/Malibu/LA: -122 to -118 West
    // NY/Miami: -80 to -74 West
    // Lat: 25 to 41 North
    
    // We will do a robust projection so that the cities form an elegant, high-contrast, recognizable spread
    const minLng = -123;
    const maxLng = -70;
    const minLat = 24;
    const maxLat = 42;

    const x = ((lng - minLng) / (maxLng - minLng)) * 800 + 100;
    // SVG has Y-axis downwards, so invert lat mapping
    const y = (1 - (lat - minLat) / (maxLat - minLat)) * 400 + 100;

    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    // Don't drag if clicking on a marker
    if ((e.target as HTMLElement).closest('.map-marker')) return;
    
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetMap = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setSelectedProperty(null);
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-neutral-100 bg-slate-50 dark:border-neutral-800 dark:bg-neutral-950">
      
      {/* Map Control bar */}
      <div className="absolute left-4 top-4 z-10 flex flex-col space-y-2 rounded-xl bg-white p-1.5 shadow-md dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
        <button
          onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 3))}
          className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
          className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={resetMap}
          className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
          title="Reset Map Center"
        >
          <Maximize className="h-4 w-4" />
        </button>
      </div>

      <div className="absolute right-4 top-4 z-10 flex space-x-2 rounded-xl bg-white p-1.5 shadow-md dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
        <button
          onClick={() => setActiveLayer('streets')}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold uppercase tracking-wider transition-all ${
            activeLayer === 'streets'
              ? 'bg-blue-500 text-white'
              : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400'
          }`}
        >
          Vector
        </button>
        <button
          onClick={() => setActiveLayer('satellite')}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold uppercase tracking-wider transition-all ${
            activeLayer === 'satellite'
              ? 'bg-blue-500 text-white'
              : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400'
          }`}
        >
          Topo
        </button>
      </div>

      {/* Map Canvas */}
      <svg
        className={`h-full w-full cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        viewBox="0 0 1000 600"
      >
        <g
          transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}
          style={{ transformOrigin: 'center', transition: isDragging ? 'none' : 'transform 0.2s ease-out' }}
        >
          {/* Stylized US Outline Vector Background */}
          {activeLayer === 'streets' ? (
            <>
              {/* Abstract Water bodies */}
              <rect x="-500" y="-300" width="2000" height="1200" fill="transparent" />
              {/* West Coast Oceanic Accent */}
              <path
                d="M -100 0 L 120 150 L 180 500 L 150 700 L -100 700 Z"
                fill="currentColor"
                className="text-blue-50/40 dark:text-neutral-900/40"
              />
              {/* East Coast Oceanic Accent */}
              <path
                d="M 850 -100 L 1100 -100 L 1100 700 L 920 600 L 880 400 L 830 180 Z"
                fill="currentColor"
                className="text-blue-50/40 dark:text-neutral-900/40"
              />
              {/* Abstract State Outline Grids for visual elegance */}
              <path
                d="M 120 150 L 250 120 L 400 150 L 580 100 L 820 150 L 850 180 L 880 400 L 920 600 L 750 620 L 520 650 L 250 600 L 180 500 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                className="text-neutral-200 dark:text-neutral-800"
              />
              {/* Landmass contour plates */}
              <circle cx="200" cy="350" r="120" fill="currentColor" className="text-neutral-100/50 dark:text-neutral-900/20" />
              <circle cx="700" cy="250" r="160" fill="currentColor" className="text-neutral-100/50 dark:text-neutral-900/20" />
              <circle cx="480" cy="280" r="100" fill="currentColor" className="text-neutral-100/30 dark:text-neutral-900/10" />
            </>
          ) : (
            <>
              {/* Topological Green / Gold Earth Vector styles */}
              <rect x="-500" y="-300" width="2000" height="1200" fill="transparent" />
              <path
                d="M 120 150 L 250 120 L 400 150 L 580 100 L 820 150 L 850 180 L 880 400 L 920 600 L 750 620 L 520 650 L 250 600 L 180 500 Z"
                fill="currentColor"
                className="text-emerald-50/20 dark:text-emerald-950/10"
              />
              {/* Aspen Mountain contours */}
              <path
                d="M 380 200 L 420 150 L 460 220 L 500 180 L 550 240 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-amber-200/50 dark:text-amber-800/20"
              />
            </>
          )}

          {/* Decorative City Labels */}
          <g className="text-[10px] font-bold text-neutral-300 dark:text-neutral-700 pointer-events-none tracking-widest select-none uppercase">
            <text x="110" y="380">PACIFIC OCEAN</text>
            <text x="810" y="220">ATLANTIC</text>
            <text x="450" y="270">ROCKY MOUNTAINS</text>
          </g>

          {/* Dynamic Property Pins */}
          {properties.map((property) => {
            const { x, y } = getMapCoords(property.coordinates.lat, property.coordinates.lng);
            const isHovered = property.id === hoveredPropertyId;
            const isSelected = selectedProperty?.id === property.id;

            return (
              <g
                key={property.id}
                className="map-marker cursor-pointer"
                onMouseEnter={() => {
                  if (onMarkerHover) onMarkerHover(property.id);
                }}
                onMouseLeave={() => {
                  if (onMarkerHover) onMarkerHover(null);
                }}
                onClick={() => setSelectedProperty(property)}
              >
                {/* Visual Radar Ring on hover */}
                {(isHovered || isSelected) && (
                  <circle
                    cx={x}
                    cy={y}
                    r="22"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="1.5"
                    className="animate-ping"
                    style={{ transformOrigin: `${x}px ${y}px`, animationDuration: '2s' }}
                  />
                )}

                {/* Outer Marker Pin */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered || isSelected ? '12' : '8'}
                  fill={isHovered || isSelected ? '#2563eb' : '#4b5563'}
                  stroke="white"
                  strokeWidth="2"
                  className="transition-all duration-300 shadow-md shadow-neutral-900/20"
                />

                {/* Inner White dot */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered || isSelected ? '4' : '2'}
                  fill="white"
                  className="transition-all duration-300"
                />

                {/* Price Label above pin */}
                <g transform={`translate(${x}, ${y - 14})`}>
                  <rect
                    x="-32"
                    y="-11"
                    width="64"
                    height="18"
                    rx="6"
                    fill={isHovered || isSelected ? '#2563eb' : '#ffffff'}
                    stroke={isHovered || isSelected ? '#2563eb' : '#e2e8f0'}
                    strokeWidth="1"
                    className="shadow-sm dark:fill-neutral-900 dark:stroke-neutral-800"
                  />
                  <text
                    x="0"
                    y="2"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                    fill={isHovered || isSelected ? '#ffffff' : '#1e293b'}
                    className="font-mono dark:fill-neutral-200"
                  >
                    {property.price >= 1000000 
                      ? `$${(property.price / 1000000).toFixed(1)}M` 
                      : property.price >= 1000 
                        ? `$${(property.price / 1000).toFixed(0)}k` 
                        : `$${property.price}`}
                  </text>
                </g>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Floating Property Preview Detail Card (Bottom right corner) */}
      <AnimatePresence>
        {selectedProperty && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="absolute bottom-4 right-4 z-20 w-72 overflow-hidden rounded-xl bg-white shadow-xl dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800"
          >
            <div className="relative h-32 bg-neutral-100 dark:bg-neutral-800">
              <img
                src={selectedProperty.imageUrl}
                alt={selectedProperty.title}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setSelectedProperty(null)}
                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              
              <div className="absolute bottom-2 left-2 rounded bg-neutral-900/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                For {selectedProperty.type}
              </div>
            </div>

            <div className="p-3">
              <div className="flex items-baseline justify-between">
                <span className="font-display text-base font-bold text-neutral-900 dark:text-white">
                  ${selectedProperty.price.toLocaleString()}
                  {selectedProperty.type === 'rent' && <span className="text-[10px] font-normal text-neutral-500">/mo</span>}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">
                  {selectedProperty.propertyType}
                </span>
              </div>
              
              <h4 className="mt-1 line-clamp-1 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                {selectedProperty.title}
              </h4>
              <p className="mt-0.5 truncate text-[11px] text-neutral-500 dark:text-neutral-400">
                {selectedProperty.location}
              </p>

              <div className="mt-2.5 flex items-center justify-between border-t border-neutral-50 pt-2 text-[10px] text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                <span>{selectedProperty.bedrooms} Beds</span>
                <span>•</span>
                <span>{selectedProperty.bathrooms} Baths</span>
                <span>•</span>
                <span>{selectedProperty.area.toLocaleString()} sq ft</span>
              </div>

              <Link
                to={`/properties/${selectedProperty.id}`}
                className="mt-3 flex h-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                View Full Details
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Add standard inline component export for X icon
const X: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

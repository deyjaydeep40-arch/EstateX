/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
  useMapsLibrary,
  useAdvancedMarkerRef,
} from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Compass, School, Utensils, Coffee, Trees, EyeOff } from 'lucide-react';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const isGeminiKey = Boolean(API_KEY) && (API_KEY.startsWith('AQ.') || API_KEY.startsWith('AIzaSy') === false);
const hasValidKey =
  Boolean(API_KEY) &&
  API_KEY !== 'YOUR_API_KEY' &&
  API_KEY !== 'YOUR_GOOGLE_MAPS_PLATFORM_KEY' &&
  API_KEY !== '1234' &&
  API_KEY.length > 10 &&
  API_KEY.startsWith('AIzaSy');

interface PropertyMapProps {
  coordinates: {
    lat: number;
    lng: number;
  };
  title: string;
  address: string;
}

export const PropertyMap: React.FC<PropertyMapProps> = ({ coordinates, title, address }) => {
  const [showDeveloperGuide, setShowDeveloperGuide] = useState(false);

  if (!hasValidKey) {
    return (
      <div id="property-map-container" className="rounded-2xl border border-slate-100 bg-white p-5 dark:border-neutral-850 dark:bg-neutral-900 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-indigo-500" />
              <span>Location & Neighborhood</span>
            </h3>
            <p className="text-xs text-slate-400 dark:text-neutral-400 mt-0.5">{address}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Open in Google Maps direct link */}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-colors shadow-sm cursor-pointer"
            >
              <Navigation className="h-3.5 w-3.5" />
              <span>Open in Google Maps</span>
            </a>
            
            <button
              onClick={() => setShowDeveloperGuide(!showDeveloperGuide)}
              className="px-4 py-2 rounded-full border border-slate-100 dark:border-neutral-800 text-xs font-semibold text-slate-500 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              {showDeveloperGuide ? 'Hide API Info' : 'API Guide'}
            </button>
          </div>
        </div>

        {showDeveloperGuide && (
          <div className="p-4 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 rounded-xl text-xs space-y-2">
            <h4 className="font-bold text-amber-800 dark:text-amber-400 flex items-center space-x-1.5">
              <Compass className="h-4 w-4 animate-spin-slow" />
              <span>Developer API Key Options</span>
            </h4>
            <p className="text-slate-600 dark:text-neutral-300 leading-relaxed">
              Currently using the <strong className="font-semibold">Standard Direct Maps Embed</strong>. To enable premium features (like custom directions, route calculations, and neighborhood amenities finder), you can add a real Google Maps Platform API key (starts with <code>AIzaSy</code>).
            </p>
            {isGeminiKey && (
              <p className="text-amber-600 dark:text-amber-400 font-medium">
                ⚠️ Note: It looks like your Gemini API Key (starting with 'AQ.') was placed in the GOOGLE_MAPS_PLATFORM_KEY slot. Google Maps requires a separate Google Maps Platform key.
              </p>
            )}
            <div className="text-left bg-white dark:bg-neutral-900 p-3.5 rounded-lg border border-slate-100 dark:border-neutral-800 text-slate-600 dark:text-neutral-300 mt-2">
              <p className="font-semibold text-indigo-600 dark:text-indigo-400 mb-1">To connect a Google Maps Platform key:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Get a Maps API key: <a href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 underline">Maps Start Guide</a></li>
                <li>Open <strong>Settings</strong> (⚙️ gear icon, top-right of AI Studio)</li>
                <li>Go to <strong>Secrets</strong>, set <code>GOOGLE_MAPS_PLATFORM_KEY</code>, and press Enter.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Live, standard interactive Google Map Embed - No Key Needed! */}
        <div className="relative h-[300px] sm:h-[350px] w-full rounded-2xl overflow-hidden border border-slate-100 dark:border-neutral-850 shadow-inner bg-slate-50">
          <iframe
            title={`Map for ${title}`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            src={`https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer"
          ></iframe>
          
          <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-neutral-900/95 backdrop-blur px-2.5 py-1 rounded-md border border-slate-100 dark:border-neutral-800 shadow-sm text-[10px] font-semibold text-slate-500 dark:text-neutral-400">
            📍 Interactive Map (No API Key Required)
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="property-map-container" className="rounded-2xl border border-slate-100 bg-white p-5 dark:border-neutral-850 dark:bg-neutral-900 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-indigo-500" />
            <span>Location & Neighborhood</span>
          </h3>
          <p className="text-xs text-slate-400 dark:text-neutral-400 mt-0.5">{address}</p>
        </div>

        {/* Fallback external directions link */}
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1 px-3.5 py-1.5 rounded-full border border-slate-100 dark:border-neutral-800 text-xs font-semibold text-indigo-600 hover:bg-slate-50 dark:text-indigo-400 dark:hover:bg-neutral-800 transition-colors"
        >
          <Navigation className="h-3.5 w-3.5" />
          <span>Open in Google Maps</span>
        </a>
      </div>

      <APIProvider apiKey={API_KEY} version="weekly">
        <InteractiveMap coordinates={coordinates} title={title} />
      </APIProvider>
    </div>
  );
};

/* Inner Map component that utilizes vis.gl hooks safely inside APIProvider */
interface InnerMapProps {
  coordinates: {
    lat: number;
    lng: number;
  };
  title: string;
}

const InteractiveMap: React.FC<InnerMapProps> = ({ coordinates, title }) => {
  const map = useMap();
  const placesLib = useMapsLibrary('places');
  const routesLib = useMapsLibrary('routes');

  // Interactive states
  const [nearbyType, setNearbyType] = useState<'none' | 'restaurant' | 'park' | 'school' | 'cafe'>('none');
  const [places, setPlaces] = useState<google.maps.places.Place[]>([]);
  const [activePlace, setActivePlace] = useState<google.maps.places.Place | null>(null);
  const [mainMarkerRef, mainMarker] = useAdvancedMarkerRef();
  const [isMainMarkerOpen, setIsMainMarkerOpen] = useState(false);

  // Directions routing state
  const [startAddress, setStartAddress] = useState('');
  const [routingStats, setRoutingStats] = useState<{ distance: string; duration: string } | null>(null);
  const [routingError, setRoutingError] = useState<string | null>(null);
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  // Fetch nearby places when selected type changes
  useEffect(() => {
    if (!placesLib || !map || nearbyType === 'none') {
      setPlaces([]);
      setActivePlace(null);
      return;
    }

    setPlaces([]);
    setActivePlace(null);

    placesLib.Place.searchNearby({
      fields: ['displayName', 'location', 'formattedAddress'],
      locationRestriction: {
        center: coordinates,
        radius: 2000, // 2km radius
      },
      includedTypes: [nearbyType],
      maxResultCount: 10,
    })
      .then(({ places }) => {
        setPlaces(places || []);
      })
      .catch((err) => {
        console.error('Failed to query nearby places:', err);
      });
  }, [placesLib, map, nearbyType, coordinates]);

  // Clear directions polylines on unmount or routing reset
  const clearDirections = () => {
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];
    setRoutingStats(null);
    setRoutingError(null);
  };

  useEffect(() => {
    return () => clearDirections();
  }, []);

  // Compute directions route
  const handleGetDirections = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routesLib || !map || !startAddress.trim()) return;

    clearDirections();
    setRoutingError(null);

    routesLib.Route.computeRoutes({
      origin: startAddress,
      destination: coordinates,
      travelMode: 'DRIVING',
      fields: ['path', 'distanceMeters', 'durationMillis', 'viewport'],
    })
      .then(({ routes }) => {
        if (routes && routes[0]) {
          const mainRoute = routes[0];
          
          // Render polylines on map with custom options
          const newPolylines = mainRoute.createPolylines();
          newPolylines.forEach((poly) => {
            poly.setOptions({
              strokeColor: '#4f46e5',
              strokeWeight: 5,
              strokeOpacity: 0.8,
            });
            poly.setMap(map);
          });
          polylinesRef.current = newPolylines;

          // Adjust bounds
          if (mainRoute.viewport) {
            map.fitBounds(mainRoute.viewport);
          }

          // Format stats
          const distanceKm = (mainRoute.distanceMeters / 1000).toFixed(1);
          
          let durationSecs = 0;
          if (mainRoute.durationMillis) {
            const rawVal = mainRoute.durationMillis;
            if (typeof rawVal === 'number') {
              durationSecs = rawVal / 1000;
            } else {
              const strVal = String(rawVal);
              durationSecs = strVal.endsWith('s')
                ? Number(strVal.slice(0, -1))
                : Number(strVal) / 1000;
            }
          }
          const durationMins = Math.round(durationSecs / 60) || 1;

          setRoutingStats({
            distance: `${distanceKm} km`,
            duration: `${durationMins} mins`,
          });
        } else {
          setRoutingError('Could not find a driving route from that address.');
        }
      })
      .catch((err) => {
        console.error('Routing failed:', err);
        setRoutingError('Routing calculation failed. Check address spelling.');
      });
  };

  // Nearby discovery filters
  const filterTabs = [
    { type: 'none', label: 'Hide Nearby', icon: EyeOff },
    { type: 'restaurant', label: 'Dining', icon: Utensils },
    { type: 'cafe', label: 'Cafes', icon: Coffee },
    { type: 'park', label: 'Parks', icon: Trees },
    { type: 'school', label: 'Schools', icon: School },
  ] as const;

  return (
    <div className="space-y-4">
      {/* Search Nearby and Directions Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nearby Attractions */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Explore Nearby (2km)</p>
          <div className="flex flex-wrap gap-1.5">
            {filterTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = nearbyType === tab.type;
              return (
                <button
                  key={tab.type}
                  onClick={() => setNearbyType(tab.type)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:hover:bg-neutral-750 dark:text-neutral-300'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Directions Input Form */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Get Directions</p>
          <form onSubmit={handleGetDirections} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter starting address..."
              value={startAddress}
              onChange={(e) => setStartAddress(e.target.value)}
              className="flex-1 px-3.5 py-1.5 rounded-full border border-slate-100 bg-slate-50 text-xs text-slate-800 placeholder-slate-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200 outline-none focus:border-indigo-500 focus:bg-white"
            />
            <button
              type="submit"
              className="px-4 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-colors cursor-pointer"
            >
              Route
            </button>
            {(routingStats || routingError) && (
              <button
                type="button"
                onClick={() => {
                  setStartAddress('');
                  clearDirections();
                }}
                className="px-3 py-1.5 rounded-full border border-slate-100 text-xs text-slate-500 hover:bg-slate-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
              >
                Clear
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Directions Feedback Banner */}
      {routingStats && (
        <div className="rounded-xl bg-indigo-50/50 border border-indigo-100/50 p-3 text-xs text-indigo-900 dark:bg-indigo-950/10 dark:border-indigo-900/30 dark:text-indigo-300 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="font-semibold uppercase tracking-wider text-[10px] bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded">Route Computed</span>
            <span>Distance: <strong className="font-bold">{routingStats.distance}</strong></span>
            <span>Est. Drive Time: <strong className="font-bold">{routingStats.duration}</strong></span>
          </div>
        </div>
      )}
      {routingError && (
        <p className="text-xs text-rose-500 font-semibold">{routingError}</p>
      )}

      {/* Google Map Container */}
      <div className="relative h-[300px] sm:h-[350px] w-full rounded-2xl overflow-hidden border border-slate-100 dark:border-neutral-800 shadow-inner">
        <Map
          defaultCenter={coordinates}
          defaultZoom={14}
          mapId="DEMO_MAP_ID"
          gestureHandling="cooperative"
          disableDefaultUI={false}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Main Property Location Marker */}
          <AdvancedMarker
            ref={mainMarkerRef}
            position={coordinates}
            onClick={() => setIsMainMarkerOpen(true)}
            title={title}
          >
            <Pin background="#4f46e5" glyphColor="#ffffff" borderColor="#4338ca" scale={1.2} />
          </AdvancedMarker>

          {/* Main Marker Info Window */}
          {isMainMarkerOpen && (
            <InfoWindow anchor={mainMarker} onCloseClick={() => setIsMainMarkerOpen(false)}>
              <div className="text-xs p-1 text-slate-800">
                <p className="font-bold font-display text-indigo-600">{title}</p>
                <p className="text-slate-400 mt-0.5 font-medium">Main Listing Address</p>
              </div>
            </InfoWindow>
          )}

          {/* Nearby Places Markers */}
          {places.map((place) => {
            if (!place.location) return null;
            return (
              <AdvancedMarker
                key={place.id}
                position={place.location}
                onClick={() => setActivePlace(place)}
                title={place.displayName || ''}
              >
                <Pin
                  background="#10b981"
                  glyphColor="#ffffff"
                  borderColor="#047857"
                  scale={0.9}
                />
              </AdvancedMarker>
            );
          })}

          {/* Nearby Place InfoWindow */}
          {activePlace && activePlace.location && (
            <InfoWindow
              position={activePlace.location}
              onCloseClick={() => setActivePlace(null)}
            >
              <div className="text-xs p-1 max-w-[200px] text-slate-800">
                <p className="font-bold text-emerald-600">{activePlace.displayName}</p>
                <p className="text-slate-500 text-[10px] leading-tight mt-0.5">
                  {activePlace.formattedAddress}
                </p>
              </div>
            </InfoWindow>
          )}
        </Map>
      </div>
    </div>
  );
};

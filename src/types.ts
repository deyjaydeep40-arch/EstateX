/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  area: number; // in sq ft
  type: 'buy' | 'rent';
  propertyType: 'house' | 'apartment' | 'condo' | 'townhouse';
  imageUrl: string;
  images?: string[]; // Multiple images for gallery
  ownerId: string;
  createdAt: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  featured?: boolean;
}

export interface Favorite {
  id: string;
  userId: string;
  propertyId: string;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  propertyId: string;
  propertyName?: string; // Derived field
  userId?: string; // Optional user ID if logged in
  createdAt: string;
}

export interface SearchFilters {
  city: string;
  priceMin: string;
  priceMax: string;
  bedrooms: string;
  propertyType: string;
  type: 'all' | 'buy' | 'rent';
  searchQuery: string;
}

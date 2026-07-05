/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User, Property, Favorite, ContactMessage } from '../../src/types';

const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  properties: Property[];
  favorites: Favorite[];
  messages: ContactMessage[];
}

const DEFAULT_DB: DatabaseSchema = {
  users: [],
  properties: [],
  favorites: [],
  messages: []
};

// Ensure data directory and db file exist
export function initDB(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
    seedDatabase();
  }

  try {
    const rawData = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Failed to read database, resetting to default:', error);
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
    return DEFAULT_DB;
  }
}

export function readDB(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return initDB();
    }
    const rawData = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Error reading DB, re-initializing:', error);
    return initDB();
  }
}

export function writeDB(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write database:', error);
  }
}

function seedDatabase() {
  console.log('Seeding database with premium properties...');
  
  // Hash a default password for demo users
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('password123', salt);

  const demoUsers = [
    {
      id: 'admin-1',
      name: 'Sarah Jenkins',
      email: 'admin@estatex.com',
      isAdmin: true,
      createdAt: new Date().toISOString(),
      passwordHash
    },
    {
      id: 'user-1',
      name: 'John Doe',
      email: 'user@estatex.com',
      isAdmin: false,
      createdAt: new Date().toISOString(),
      passwordHash
    }
  ];

  const demoProperties: Property[] = [
    {
      id: 'prop-1',
      title: 'The Beverly Crest Estate',
      description: 'Perched high in Beverly Hills, this architectural masterpiece features floor-to-ceiling glass walls, an ultra-modern infinity pool overlooking the city, a custom wellness spa, and an integrated smart-home automation system. Perfect for luxurious living and high-end entertaining.',
      price: 12500000,
      location: '1240 Crestline Dr, Beverly Hills, CA',
      city: 'Los Angeles',
      bedrooms: 6,
      bathrooms: 8,
      area: 11400,
      type: 'buy',
      propertyType: 'house',
      imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      images: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80'
      ],
      ownerId: 'admin-1',
      createdAt: new Date().toISOString(),
      coordinates: { lat: 34.0736, lng: -118.4004 },
      featured: true
    },
    {
      id: 'prop-2',
      title: 'Modernist Beachfront Villa',
      description: 'Experience pure coastal bliss in this stunning oceanfront sanctuary on Malibu Beach. Direct beach access, soaring ceilings, massive wrap-around viewing decks, and professional-grade Gaggenau kitchen make this home a seaside dream. Fully furnished with custom designer pieces.',
      price: 8900000,
      location: '23412 Pacific Coast Hwy, Malibu, CA',
      city: 'Malibu',
      bedrooms: 4,
      bathrooms: 4.5,
      area: 5200,
      type: 'buy',
      propertyType: 'house',
      imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      images: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80'
      ],
      ownerId: 'admin-1',
      createdAt: new Date().toISOString(),
      coordinates: { lat: 34.0259, lng: -118.7798 },
      featured: true
    },
    {
      id: 'prop-3',
      title: 'Tribeca Luxury Duplex Penthouse',
      description: 'This landmark high-rise duplex features spectacular 360-degree views of the Manhattan skyline and Hudson River. Features private elevator access, a 2,000 sq ft wrap-around sky terrace, dual fireplaces, and a gorgeous climate-controlled glass wine cellar.',
      price: 14200,
      location: '185 Franklin St, New York, NY',
      city: 'New York',
      bedrooms: 3,
      bathrooms: 3.5,
      area: 4100,
      type: 'rent',
      propertyType: 'apartment',
      imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      images: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1502005229762-fc1b2381f0d5?auto=format&fit=crop&w=1200&q=80'
      ],
      ownerId: 'admin-1',
      createdAt: new Date().toISOString(),
      coordinates: { lat: 40.7188, lng: -74.0081 },
      featured: true
    },
    {
      id: 'prop-4',
      title: 'The Aspen Ridge Chalet',
      description: 'Constructed with premium imported Douglas Fir and native river stones, this grand ski-in/ski-out lodge delivers the ultimate alpine experience. Vaulted great room with massive stone fireplace, professional chef\'s kitchen, private outdoor hot tub, and state-of-the-art ski room.',
      price: 6450000,
      location: '820 Red Mountain Rd, Aspen, CO',
      city: 'Aspen',
      bedrooms: 5,
      bathrooms: 6,
      area: 7800,
      type: 'buy',
      propertyType: 'townhouse',
      imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
      images: [
        'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1200&q=80'
      ],
      ownerId: 'admin-1',
      createdAt: new Date().toISOString(),
      coordinates: { lat: 39.1911, lng: -106.8175 },
      featured: false
    },
    {
      id: 'prop-5',
      title: 'Waterfront Sky Condo',
      description: 'Commanding sweeping views of Biscayne Bay, this stunning Miami residence is the pinnacle of tropical high-rise elegance. Double-height ceilings, Italian marble flooring, high-end automated roller shades, and access to elite building services including concierge, private marina, and helipad.',
      price: 6800,
      location: '1000 Biscayne Blvd Unit 4202, Miami, FL',
      city: 'Miami',
      bedrooms: 2,
      bathrooms: 2.5,
      area: 2400,
      type: 'rent',
      propertyType: 'condo',
      imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      images: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80'
      ],
      ownerId: 'admin-1',
      createdAt: new Date().toISOString(),
      coordinates: { lat: 25.7834, lng: -80.1901 },
      featured: false
    },
    {
      id: 'prop-6',
      title: 'Pacific Heights Townhouse',
      description: 'Elegant architectural townhouse situated in San Francisco\'s most prestigious pocket. Features timeless Victorian facade, fully upgraded structural framing, premium bespoke millwork, double wine coolers, and a private, beautifully landscaped backyard oasis with fire pit.',
      price: 4950000,
      location: '2840 Broadway St, San Francisco, CA',
      city: 'San Francisco',
      bedrooms: 3,
      bathrooms: 3,
      area: 3600,
      type: 'buy',
      propertyType: 'townhouse',
      imageUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
      images: [
        'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1200&q=80'
      ],
      ownerId: 'admin-1',
      createdAt: new Date().toISOString(),
      coordinates: { lat: 37.7942, lng: -122.4414 },
      featured: false
    },
    {
      id: 'prop-7',
      title: 'Chic Loft in Arts District',
      description: 'Industrial-chic loft featuring genuine red brick walls, structural iron columns, polished concrete floors, and enormous multi-paned factory windows. Complete with modern smart lighting, in-unit laundry, and access to premium common areas, gym, and rooftop lounge.',
      price: 3500,
      location: '940 E 2nd St, Los Angeles, CA',
      city: 'Los Angeles',
      bedrooms: 1,
      bathrooms: 1.5,
      area: 1650,
      type: 'rent',
      propertyType: 'apartment',
      imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      images: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
      ],
      ownerId: 'admin-1',
      createdAt: new Date().toISOString(),
      coordinates: { lat: 34.0452, lng: -118.2325 },
      featured: false
    }
  ];

  writeDB({
    users: demoUsers,
    properties: demoProperties,
    favorites: [],
    messages: []
  });
}

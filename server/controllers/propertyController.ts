/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response } from 'express';
import { readDB, writeDB } from '../config/db';
import { Property } from '../../src/types';
import { AuthenticatedRequest } from '../middleware/auth';

export function getProperties(req: Request, res: Response) {
  try {
    const {
      city,
      priceMin,
      priceMax,
      bedrooms,
      propertyType,
      type,
      searchQuery,
      limit,
      page
    } = req.query;

    const db = readDB();
    let results = [...db.properties];

    // Apply filters
    if (city && typeof city === 'string' && city !== 'All' && city !== '') {
      results = results.filter(p => p.city.toLowerCase() === city.toLowerCase());
    }

    if (type && typeof type === 'string' && type !== 'all' && type !== '') {
      results = results.filter(p => p.type === type);
    }

    if (propertyType && typeof propertyType === 'string' && propertyType !== 'All' && propertyType !== '') {
      results = results.filter(p => p.propertyType === propertyType.toLowerCase());
    }

    if (priceMin) {
      const min = parseInt(priceMin as string, 10);
      if (!isNaN(min)) {
        results = results.filter(p => p.price >= min);
      }
    }

    if (priceMax) {
      const max = parseInt(priceMax as string, 10);
      if (!isNaN(max)) {
        results = results.filter(p => p.price <= max);
      }
    }

    if (bedrooms && typeof bedrooms === 'string' && bedrooms !== 'All' && bedrooms !== '') {
      const beds = parseInt(bedrooms, 10);
      if (!isNaN(beds)) {
        // e.g. "3" matches 3 or more bedrooms
        results = results.filter(p => p.bedrooms >= beds);
      }
    }

    if (searchQuery && typeof searchQuery === 'string' && searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      results = results.filter(p => 
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
      );
    }

    // Sort by newest by default
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Pagination
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const totalCount = results.length;
    
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    const paginatedResults = results.slice(startIndex, endIndex);

    res.json({
      properties: paginatedResults,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ message: 'Error retrieving properties' });
  }
}

export function getFeaturedProperties(req: Request, res: Response) {
  try {
    const db = readDB();
    const featured = db.properties.filter(p => p.featured);
    
    // If fewer than 3 featured, fill in with newest properties
    if (featured.length < 3) {
      const sortedNew = [...db.properties].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const combined = [...featured];
      for (const p of sortedNew) {
        if (combined.length >= 4) break;
        if (!combined.some(c => c.id === p.id)) {
          combined.push(p);
        }
      }
      res.json(combined);
      return;
    }
    
    res.json(featured);
  } catch (error) {
    console.error('Get featured error:', error);
    res.status(500).json({ message: 'Error retrieving featured properties' });
  }
}

export function getPropertyById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const db = readDB();
    const property = db.properties.find(p => p.id === id);

    if (!property) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }

    // Find related properties (same type or same city, max 3, excluding itself)
    const related = db.properties
      .filter(p => p.id !== id && (p.city === property.city || p.type === property.type))
      .slice(0, 3);

    res.json({
      property,
      related
    });
  } catch (error) {
    console.error('Get property by ID error:', error);
    res.status(500).json({ message: 'Error retrieving property' });
  }
}

export function createProperty(req: AuthenticatedRequest, res: Response) {
  try {
    const {
      title,
      description,
      price,
      location,
      city,
      bedrooms,
      bathrooms,
      area,
      type,
      propertyType,
      imageUrl,
      images,
      coordinates,
      featured
    } = req.body;

    if (!title || !price || !location || !city || !bedrooms || !bathrooms || !area || !type || !propertyType || !imageUrl) {
      res.status(400).json({ message: 'All required property fields must be provided' });
      return;
    }

    const db = readDB();
    
    // Use simulated coordinates if not provided
    const resolvedCoordinates = coordinates || {
      lat: 34.0522 + (Math.random() - 0.5) * 0.2,
      lng: -118.2437 + (Math.random() - 0.5) * 0.2
    };

    const newProperty: Property = {
      id: `prop-${Date.now()}`,
      title,
      description: description || 'No description provided.',
      price: parseFloat(price),
      location,
      city,
      bedrooms: parseInt(bedrooms, 10),
      bathrooms: parseFloat(bathrooms),
      area: parseInt(area, 10),
      type,
      propertyType,
      imageUrl,
      images: images || [imageUrl],
      ownerId: req.user?.id || 'admin-1',
      createdAt: new Date().toISOString(),
      coordinates: resolvedCoordinates,
      featured: !!featured
    };

    db.properties.push(newProperty);
    writeDB(db);

    res.status(201).json(newProperty);
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ message: 'Error creating property' });
  }
}

export function updateProperty(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const db = readDB();
    const index = db.properties.findIndex(p => p.id === id);

    if (index === -1) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }

    const current = db.properties[index];
    const updateData = req.body;

    const updatedProperty: Property = {
      ...current,
      ...updateData,
      // Keep immutable fields unchanged
      id: current.id,
      ownerId: current.ownerId,
      createdAt: current.createdAt,
      // Parse numerical fields safely
      price: updateData.price !== undefined ? parseFloat(updateData.price) : current.price,
      bedrooms: updateData.bedrooms !== undefined ? parseInt(updateData.bedrooms, 10) : current.bedrooms,
      bathrooms: updateData.bathrooms !== undefined ? parseFloat(updateData.bathrooms) : current.bathrooms,
      area: updateData.area !== undefined ? parseInt(updateData.area, 10) : current.area,
    };

    db.properties[index] = updatedProperty;
    writeDB(db);

    res.json(updatedProperty);
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ message: 'Error updating property' });
  }
}

export function deleteProperty(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const db = readDB();
    const filtered = db.properties.filter(p => p.id !== id);

    if (filtered.length === db.properties.length) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }

    // Also clear messages and favorites associated with this property
    db.properties = filtered;
    db.favorites = db.favorites.filter(f => f.propertyId !== id);
    db.messages = db.messages.filter(m => m.propertyId !== id);
    
    writeDB(db);

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ message: 'Error deleting property' });
  }
}

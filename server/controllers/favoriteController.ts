/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Response } from 'express';
import { readDB, writeDB } from '../config/db';
import { Favorite } from '../../src/types';
import { AuthenticatedRequest } from '../middleware/auth';

export function getFavorites(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const db = readDB();
    const userFavs = db.favorites.filter(f => f.userId === req.user?.id);
    
    // Map favorite records to full property data
    const favProperties = userFavs
      .map(fav => db.properties.find(p => p.id === fav.propertyId))
      .filter((p): p is any => p !== undefined);

    res.json(favProperties);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ message: 'Error retrieving favorites' });
  }
}

export function toggleFavorite(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { propertyId } = req.body;
    if (!propertyId) {
      res.status(400).json({ message: 'Property ID is required' });
      return;
    }

    const db = readDB();
    
    // Check if property exists
    const propertyExists = db.properties.some(p => p.id === propertyId);
    if (!propertyExists) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }

    const favIndex = db.favorites.findIndex(
      f => f.userId === req.user?.id && f.propertyId === propertyId
    );

    let isFavorited = false;

    if (favIndex === -1) {
      const newFav: Favorite = {
        id: `fav-${Date.now()}`,
        userId: req.user.id,
        propertyId,
        createdAt: new Date().toISOString()
      };
      db.favorites.push(newFav);
      isFavorited = true;
    } else {
      db.favorites.splice(favIndex, 1);
    }

    writeDB(db);
    res.json({ isFavorited, message: isFavorited ? 'Property added to favorites' : 'Property removed from favorites' });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ message: 'Error updating favorites' });
  }
}

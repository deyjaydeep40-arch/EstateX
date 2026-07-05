/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import {
  getProperties,
  getFeaturedProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty
} from '../controllers/propertyController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', getProperties);
router.get('/featured', getFeaturedProperties);
router.get('/:id', getPropertyById);

// Admin-only protected routes
router.post('/', authMiddleware, adminMiddleware, createProperty);
router.put('/:id', authMiddleware, adminMiddleware, updateProperty);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProperty);

export default router;

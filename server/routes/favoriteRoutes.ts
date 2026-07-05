/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import { getFavorites, toggleFavorite } from '../controllers/favoriteController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, getFavorites);
router.post('/toggle', authMiddleware, toggleFavorite);

export default router;

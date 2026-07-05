/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import {
  createMessage,
  getUserMessages,
  getAllMessages,
  deleteMessage
} from '../controllers/messageController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

router.post('/', createMessage); // Public (can pass user token if logged in)
router.get('/user', authMiddleware, getUserMessages); // Client views their own messages
router.get('/all', authMiddleware, adminMiddleware, getAllMessages); // Admin views all messages
router.delete('/:id', authMiddleware, adminMiddleware, deleteMessage); // Admin deletes an inquiry

export default router;

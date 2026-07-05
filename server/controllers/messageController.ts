/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Response, Request } from 'express';
import { readDB, writeDB } from '../config/db';
import { ContactMessage } from '../../src/types';
import { AuthenticatedRequest } from '../middleware/auth';

export function createMessage(req: Request, res: Response) {
  try {
    const { name, email, phone, message, propertyId } = req.body;

    if (!name || !email || !phone || !message || !propertyId) {
      res.status(400).json({ message: 'All contact fields are required' });
      return;
    }

    const db = readDB();
    const property = db.properties.find(p => p.id === propertyId);
    if (!property) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }

    // Try to associate with logged in user if auth header is present
    let userId: string | undefined = undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const JWT_SECRET = process.env.JWT_SECRET || 'estatex-super-secret-key-2026';
        const decoded = require('jsonwebtoken').verify(token, JWT_SECRET) as { id: string };
        userId = decoded.id;
      } catch (e) {
        // Ignore token decode errors for anonymous submissions
      }
    }

    const newMessage: ContactMessage = {
      id: `msg-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      phone,
      message,
      propertyId,
      propertyName: property.title,
      userId,
      createdAt: new Date().toISOString()
    };

    db.messages.push(newMessage);
    writeDB(db);

    res.status(201).json({ message: 'Inquiry sent successfully', data: newMessage });
  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({ message: 'Error sending inquiry' });
  }
}

export function getUserMessages(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const db = readDB();
    // Fetch messages submitted by this logged in user
    const userMsgs = db.messages.filter(m => m.userId === req.user?.id);
    res.json(userMsgs);
  } catch (error) {
    console.error('Get user messages error:', error);
    res.status(500).json({ message: 'Error retrieving your inquiries' });
  }
}

export function getAllMessages(req: AuthenticatedRequest, res: Response) {
  try {
    const db = readDB();
    // Sort all messages by newest
    const sorted = [...db.messages].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    res.json(sorted);
  } catch (error) {
    console.error('Get all messages error:', error);
    res.status(500).json({ message: 'Error retrieving inquiries' });
  }
}

export function deleteMessage(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const db = readDB();
    const index = db.messages.findIndex(m => m.id === id);

    if (index === -1) {
      res.status(404).json({ message: 'Message not found' });
      return;
    }

    db.messages.splice(index, 1);
    writeDB(db);

    res.json({ message: 'Inquiry deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Error deleting inquiry' });
  }
}

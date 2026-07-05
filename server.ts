/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initDB } from './server/config/db';
import authRoutes from './server/routes/authRoutes';
import propertyRoutes from './server/routes/propertyRoutes';
import favoriteRoutes from './server/routes/favoriteRoutes';
import messageRoutes from './server/routes/messageRoutes';
import { GoogleGenAI } from '@google/genai';

const PORT = parseInt(process.env.PORT || '3000', 10);

async function startServer() {
  const app = express();
  
  // Initialize Database
  initDB();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Log requests in dev
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/properties', propertyRoutes);
  app.use('/api/favorites', favoriteRoutes);
  app.use('/api/messages', messageRoutes);

  // Gemini AI Copywriting assistant endpoint (Server-side)
  app.post('/api/ai/describe', async (req, res) => {
    try {
      const { title, location, propertyType, price, features } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        res.status(503).json({ 
          message: 'AI description service is not configured. Please add your GEMINI_API_KEY in the Secrets settings.' 
        });
        return;
      }

      if (!title || !location || !propertyType) {
        res.status(400).json({ message: 'Title, location, and propertyType are required' });
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Write a premium, attractive, and highly persuasive real estate marketing description (approx 100-150 words) for a property with these details:
      - Title: ${title}
      - Property Type: ${propertyType}
      - Location: ${location}
      - Price: $${price}
      - Key features/bullets: ${features || 'Luxury finishes, natural lighting, modern layout'}
      
      Make the tone elegant, professional, and evocative (similar to high-end Airbnb or Zillow listings). Write only the description text. Do not add headers, titles, or quotes.`;

      // Use the standard model alias for text tasks
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const text = response.text || 'Failed to generate description. Please write manually.';
      res.json({ description: text.trim() });
    } catch (error) {
      console.error('Gemini API Error:', error);
      res.status(500).json({ message: 'Error generating AI description' });
    }
  });

  // Serve static assets in production, otherwise Vite dev server
  if (process.env.NODE_ENV !== 'production') {
    console.log('Running in DEVELOPMENT mode. Mounting Vite middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Running in PRODUCTION mode. Serving compiled assets...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EstateX full-stack server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Server failed to start:', err);
});

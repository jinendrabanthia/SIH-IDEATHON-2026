import { describe, it, expect } from 'vitest';
import { env } from '../src/shared/config/index.js';
import { GoogleGenAI } from '@google/genai';
import { prisma } from '../src/shared/db/index.js';

describe('API Keys and External Services Health', () => {
  it('should have all necessary environment variables', () => {
    expect(env.DATABASE_URL).toBeDefined();
    expect(env.GEMINI_API_KEY).toBeDefined();
    expect(env.ROUTING_API_KEY).toBeDefined();
  });

  it('should connect to the Database (Supabase PostgreSQL)', async () => {
    try {
      const result = await prisma.$queryRaw`SELECT 1 as result`;
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect((result as any)[0].result).toBe(1);
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  });

  it('should authenticate with Google Gemini API', async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
      // Fetch models
      const models = await ai.models.list();
      let hasGenerativeModel = false;
      let availableModels = [];
      for await (const model of models) {
        availableModels.push(model.name);
        if (model.name.includes('gemini') || model.name.includes('flash') || model.name.includes('pro')) {
          hasGenerativeModel = true;
        }
      }
      console.log('Available models:', availableModels);
      expect(hasGenerativeModel).toBe(true);
    } catch (error) {
      console.error('Gemini API authentication failed:', error);
      throw error;
    }
  });

  it('should authenticate with OpenRouteService API', async () => {
    try {
      const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car', {
        method: 'POST',
        headers: {
          'Authorization': env.ROUTING_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          coordinates: [[8.681495,49.41461],[8.686507,49.41943]]
        })
      });
      
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('routes');
    } catch (error) {
      console.error('OpenRouteService API authentication failed:', error);
      throw error;
    }
  });
});

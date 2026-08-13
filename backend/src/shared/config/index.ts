import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// .env is at repo root: SIH/.env — config is at SIH/backend/src/shared/config/
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const envSchema = z.object({
  // Supabase
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  DATABASE_URL: z.string().startsWith('postgresql://'),

  // LLM
  GEMINI_API_KEY: z.string().min(1),

  // Routing
  ROUTING_API_KEY: z.string().min(1),

  // Auth
  JWT_SECRET: z.string().min(16).default('dev-jwt-secret-change-me-in-production-1234567890'),

  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  PORT: z.coerce.number().default(3001),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;

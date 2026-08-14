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
  JWT_SECRET: z.string().min(16),

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

// Reject known-weak secrets in production
if (
  parsed.data.NODE_ENV === 'production' &&
  parsed.data.JWT_SECRET.startsWith('dev-jwt-secret')
) {
  console.error('❌ JWT_SECRET must be changed from the dev placeholder in production.');
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;

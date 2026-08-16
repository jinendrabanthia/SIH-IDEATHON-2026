import { z } from 'zod';
declare const envSchema: z.ZodObject<{
    SUPABASE_URL: z.ZodDefault<z.ZodString>;
    SUPABASE_ANON_KEY: z.ZodDefault<z.ZodString>;
    DATABASE_URL: z.ZodDefault<z.ZodString>;
    GEMINI_API_KEY: z.ZodDefault<z.ZodString>;
    ROUTING_API_KEY: z.ZodDefault<z.ZodString>;
    JWT_SECRET: z.ZodString;
    ACCESS_TOKEN_EXPIRY: z.ZodDefault<z.ZodString>;
    REFRESH_TOKEN_EXPIRY_DAYS: z.ZodDefault<z.ZodNumber>;
    COOKIE_DOMAIN: z.ZodOptional<z.ZodString>;
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "production", "test"]>>;
    CORS_ORIGIN: z.ZodDefault<z.ZodString>;
    PORT: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    DATABASE_URL: string;
    GEMINI_API_KEY: string;
    ROUTING_API_KEY: string;
    JWT_SECRET: string;
    ACCESS_TOKEN_EXPIRY: string;
    REFRESH_TOKEN_EXPIRY_DAYS: number;
    NODE_ENV: "development" | "production" | "test";
    CORS_ORIGIN: string;
    PORT: number;
    COOKIE_DOMAIN?: string | undefined;
}, {
    JWT_SECRET: string;
    SUPABASE_URL?: string | undefined;
    SUPABASE_ANON_KEY?: string | undefined;
    DATABASE_URL?: string | undefined;
    GEMINI_API_KEY?: string | undefined;
    ROUTING_API_KEY?: string | undefined;
    ACCESS_TOKEN_EXPIRY?: string | undefined;
    REFRESH_TOKEN_EXPIRY_DAYS?: number | undefined;
    COOKIE_DOMAIN?: string | undefined;
    NODE_ENV?: "development" | "production" | "test" | undefined;
    CORS_ORIGIN?: string | undefined;
    PORT?: number | undefined;
}>;
export declare const env: {
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    DATABASE_URL: string;
    GEMINI_API_KEY: string;
    ROUTING_API_KEY: string;
    JWT_SECRET: string;
    ACCESS_TOKEN_EXPIRY: string;
    REFRESH_TOKEN_EXPIRY_DAYS: number;
    NODE_ENV: "development" | "production" | "test";
    CORS_ORIGIN: string;
    PORT: number;
    COOKIE_DOMAIN?: string | undefined;
};
export type Env = z.infer<typeof envSchema>;
export {};
//# sourceMappingURL=index.d.ts.map
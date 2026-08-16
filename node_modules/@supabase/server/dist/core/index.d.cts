import { i as EnvError, t as AuthError } from "../errors-pFJgU6dQ.cjs";
import { a as AuthResult, c as CreateContextClientOptions, f as SupabaseEnv, i as AuthModeWithKey, l as Credentials, o as ClientAuth, s as CreateAdminClientOptions } from "../types-CdVYmHsj.cjs";
import { SupabaseClient } from "@supabase/supabase-js";

//#region src/core/resolve-env.d.ts
/**
 * Resolves Supabase environment configuration from runtime environment variables.
 *
 * Reads `SUPABASE_URL`, keys (`SUPABASE_PUBLISHABLE_KEYS` / `SUPABASE_SECRET_KEYS`),
 * and the JWKS source (`SUPABASE_JWKS` for inline keys, or `SUPABASE_JWKS_URL`
 * for a remote endpoint). Works across Deno, Node.js, and Bun. For Cloudflare
 * Workers, use `overrides` or enable node-compat.
 *
 * @param overrides - Partial values that take precedence over env vars.
 * @returns `{ data: SupabaseEnv, error: null }` on success, `{ data: null, error: EnvError }` on failure.
 *
 * @example Reading and overriding env vars
 * ```ts
 * const { data: env, error } = resolveEnv()
 * if (error) throw error
 *
 * // Override for tests
 * const { data: env } = resolveEnv({ url: 'http://localhost:54321' })
 * ```
 *
 * @category Primitives
 */
declare function resolveEnv(overrides?: Partial<SupabaseEnv>): {
  data: SupabaseEnv;
  error: null;
} | {
  data: null;
  error: EnvError;
};
//#endregion
//#region src/core/extract-credentials.d.ts
/**
 * Extracts authentication credentials from an incoming HTTP request.
 *
 * Reads two headers:
 * - `Authorization: Bearer <token>` → extracted as `token`
 * - `apikey: <key>` → extracted as `apikey`
 *
 * This is a pure extraction step — no validation or verification is performed.
 * Pass the result to {@link verifyCredentials} to validate against allowed auth modes.
 *
 * @param request - The incoming HTTP request.
 * @returns The extracted {@link Credentials}. Fields are `null` when the corresponding header is absent.
 *
 * @example Basic usage
 * ```ts
 * import { extractCredentials } from '@supabase/server/core'
 *
 * const creds = extractCredentials(request)
 * console.log(creds.token)  // "eyJhbGci..." or null
 * console.log(creds.apikey) // "sb-abc123-publishable-..." or null
 * ```
 *
 * @category Primitives
 */
declare function extractCredentials(request: Request): Credentials;
//#endregion
//#region src/core/verify-credentials.d.ts
/**
 * Options for {@link verifyCredentials}.
 * @category Primitives
 */
interface VerifyCredentialsOptions {
  /**
   * Auth mode(s) to try. Modes are attempted in order — the first match wins.
   *
   * @see {@link AuthModeWithKey} for the full syntax including named keys.
   *
   * @defaultValue `"user"`
   */
  auth?: AuthModeWithKey | AuthModeWithKey[];
  /**
   * @deprecated Use {@link VerifyCredentialsOptions.auth} instead. Kept for
   * backward compatibility; will be removed in a future major release. When
   * both are provided, `auth` wins.
   */
  allow?: AuthModeWithKey | AuthModeWithKey[];
  /** Optional environment overrides (passed through to {@link resolveEnv}). */
  env?: Partial<SupabaseEnv>;
}
/**
 * Verifies pre-extracted credentials against one or more allowed auth modes.
 *
 * Tries each mode in order — first match wins. A mode is only tried when its
 * credential is present; a JWT that is present but fails verification
 * short-circuits the chain with `InvalidCredentialsError` instead of falling
 * through to the next mode. Use {@link verifyAuth} to extract and verify in a
 * single call.
 *
 * @param credentials - The credentials to verify (from {@link extractCredentials}).
 * @param options - Allowed auth modes and optional env overrides.
 * @returns `{ data: AuthResult, error: null }` on success, `{ data: null, error: AuthError }` on failure.
 *
 * @example Multiple auth modes
 * ```ts
 * const credentials = extractCredentials(request)
 * const { data: auth, error } = await verifyCredentials(credentials, {
 *   auth: ['user', 'publishable'],
 * })
 * if (error) {
 *   return Response.json({ message: error.message }, { status: error.status })
 * }
 * ```
 *
 * @category Primitives
 */
declare function verifyCredentials(credentials: Credentials, options: VerifyCredentialsOptions): Promise<{
  data: AuthResult;
  error: null;
} | {
  data: null;
  error: AuthError;
}>;
//#endregion
//#region src/core/verify-auth.d.ts
/**
 * Options for {@link verifyAuth}.
 * @category Primitives
 */
interface VerifyAuthOptions {
  /**
   * Auth mode(s) to try. Modes are attempted in order — the first match wins.
   *
   * @see {@link AuthModeWithKey} for the full syntax including named keys.
   *
   * @defaultValue `"user"`
   */
  auth?: AuthModeWithKey | AuthModeWithKey[];
  /**
   * @deprecated Use {@link VerifyAuthOptions.auth} instead. Kept for backward
   * compatibility; will be removed in a future major release. When both are
   * provided, `auth` wins.
   */
  allow?: AuthModeWithKey | AuthModeWithKey[];
  /** Optional environment overrides (passed through to {@link resolveEnv}). */
  env?: Partial<SupabaseEnv>;
}
/**
 * Extracts credentials from a request and verifies them in a single step.
 *
 * This is a convenience function that combines {@link extractCredentials} and
 * {@link verifyCredentials}. Use it when you want the full auth flow without
 * needing to inspect the raw credentials.
 *
 * @param request - The incoming HTTP request.
 * @param options - Auth modes to accept and optional environment overrides.
 *
 * @returns A result tuple: `{ data, error }`.
 *   - On success: `{ data: AuthResult, error: null }`
 *   - On failure: `{ data: null, error: AuthError }`
 *
 * @example User auth
 * ```ts
 * import { verifyAuth } from '@supabase/server/core'
 *
 * const { data: auth, error } = await verifyAuth(request, {
 *   auth: 'user',
 * })
 *
 * if (error) {
 *   return Response.json({ message: error.message }, { status: error.status })
 * }
 *
 * console.log(auth.userClaims!.id) // "d0f1a2b3-..."
 * ```
 *
 * @category Primitives
 */
declare function verifyAuth(request: Request, options: VerifyAuthOptions): Promise<{
  data: AuthResult;
  error: null;
} | {
  data: null;
  error: AuthError;
}>;
//#endregion
//#region src/core/create-context-client.d.ts
/**
 * Creates a Supabase client scoped to the caller's context.
 *
 * Configured with a publishable key and (optionally) the caller's JWT,
 * so Row-Level Security policies apply. Stateless — one client per request.
 *
 * ## Which key is used
 *
 * With `auth.keyName` set, that named key from `SUPABASE_PUBLISHABLE_KEYS` is
 * used — and it throws if the key doesn't exist. With `keyName` omitted, the
 * `default` key is used, falling back to the first key in the set when no
 * `default` exists.
 *
 * Note this differs from the `"publishable"` auth mode, which matches the
 * `default` key only and never falls back — see {@link index.AuthModeWithKey}.
 *
 * @throws {@link index.EnvError} If `SUPABASE_URL` is missing or the specified publishable key is not found.
 *
 * @example With verified auth
 * ```ts
 * const { data: auth } = await verifyAuth(request, { auth: 'user' })
 * const supabase = createContextClient({
 *   auth: { token: auth.token, keyName: auth.keyName },
 * })
 * const { data } = await supabase.rpc('get_my_items')
 * ```
 *
 * @category Primitives
 */
declare function createContextClient<Database = unknown>(options?: CreateContextClientOptions): SupabaseClient<Database>;
//#endregion
//#region src/core/create-admin-client.d.ts
/**
 * Creates an admin Supabase client that bypasses Row-Level Security.
 *
 * Uses a secret key for authentication, giving full access to all data.
 * Stateless — one client per request.
 *
 * ## Which key is used
 *
 * With `auth.keyName` set, that named key from `SUPABASE_SECRET_KEYS` is used —
 * and it throws if the key doesn't exist. With `keyName` omitted, the `default`
 * key is used, falling back to the first key in the set when no `default` exists.
 *
 * Note this differs from the `"secret"` auth mode, which matches the `default`
 * key only and never falls back — see {@link index.AuthModeWithKey}.
 *
 * @throws {@link index.EnvError} If `SUPABASE_URL` is missing or the specified secret key is not found.
 *
 * @example Basic usage
 * ```ts
 * // Uses the `default` secret key (or the first key if no `default` exists)
 * const supabaseAdmin = createAdminClient()
 * const { data } = await supabaseAdmin.from('audit_log').insert({ action: 'user_login' })
 * ```
 *
 * @example Specific named key
 * ```ts
 * const supabaseAdmin = createAdminClient({ auth: { keyName: 'internal' } })
 * ```
 *
 * @category Primitives
 */
declare function createAdminClient<Database = unknown>(options?: CreateAdminClientOptions): SupabaseClient<Database>;
//#endregion
export { type ClientAuth, type CreateAdminClientOptions, type CreateContextClientOptions, type VerifyAuthOptions, type VerifyCredentialsOptions, createAdminClient, createContextClient, extractCredentials, resolveEnv, verifyAuth, verifyCredentials };
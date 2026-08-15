import { a as EnvGenericError, c as MissingDefaultPublishableKeyError, d as MissingSecretKeyError, f as MissingSupabaseURLError, i as EnvError, l as MissingDefaultSecretKeyError, n as AuthGenericError, o as Errors, r as CreateSupabaseClientError, s as InvalidCredentialsError, t as AuthError, u as MissingPublishableKeyError } from "./errors-CVZ6SLe5.mjs";
import { a as AuthResult, c as CreateContextClientOptions, d as SupabaseContext, f as SupabaseEnv, i as AuthModeWithKey, l as Credentials, m as WithSupabaseConfig, n as AllowWithKey, o as ClientAuth, p as UserClaims, r as AuthMode, s as CreateAdminClientOptions, t as Allow, u as JWTClaims } from "./types-CbQmV2hf.mjs";

//#region src/with-supabase.d.ts
/**
 * Wraps a request handler with Supabase auth, client creation, and CORS handling.
 *
 * Built for the Web API `Request`/`Response` standard that all modern runtimes
 * implement natively. Handles CORS preflight, credential verification,
 * context creation, and error responses. Your handler only runs on successful auth.
 *
 * @param config - Auth modes, CORS, and environment overrides. See {@link WithSupabaseConfig}.
 * @param handler - Receives the `Request` and a fully-initialized {@link SupabaseContext}.
 * @returns A `(req: Request) => Promise<Response>` fetch handler.
 *
 * @category Middleware
 *
 * @example Basic usage
 * ```ts
 * import { withSupabase } from '@supabase/server'
 *
 * export default {
 *   fetch: withSupabase({ auth: 'user' }, async (req, ctx) => {
 *     const { data } = await ctx.supabase.rpc('get_my_profile')
 *     return Response.json(data)
 *   }),
 * }
 * ```
 */
declare function withSupabase<Database = unknown>(config: WithSupabaseConfig, handler: (req: Request, ctx: SupabaseContext<Database>) => Promise<Response>): (req: Request) => Promise<Response>;
//#endregion
//#region src/create-supabase-context.d.ts
/**
 * Creates a {@link SupabaseContext} directly from a request.
 *
 * Use this when you need the context without the full {@link withSupabase} wrapper —
 * e.g., inside framework route handlers or custom middleware. Returns a result tuple
 * instead of producing a `Response`.
 *
 * @param request - The incoming HTTP request.
 * @param options - Auth modes, environment overrides. The `cors` option is ignored here.
 * @returns `{ data: SupabaseContext, error: null }` on success, `{ data: null, error: AuthError }` on failure.
 *
 * @category Middleware
 *
 * @example User auth
 * ```ts
 * const { data: ctx, error } = await createSupabaseContext(request, { auth: 'user' })
 * if (error) {
 *   return Response.json({ message: error.message }, { status: error.status })
 * }
 * const { data } = await ctx.supabase.rpc('get_my_items')
 * ```
 */
declare function createSupabaseContext<Database = unknown>(request: Request, options?: WithSupabaseConfig): Promise<{
  data: SupabaseContext<Database>;
  error: null;
} | {
  data: null;
  error: AuthError;
}>;
//#endregion
export { type Allow, type AllowWithKey, AuthError, AuthGenericError, type AuthMode, type AuthModeWithKey, type AuthResult, type ClientAuth, type CreateAdminClientOptions, type CreateContextClientOptions, CreateSupabaseClientError, type Credentials, EnvError, EnvGenericError, Errors, InvalidCredentialsError, type JWTClaims, MissingDefaultPublishableKeyError, MissingDefaultSecretKeyError, MissingPublishableKeyError, MissingSecretKeyError, MissingSupabaseURLError, type SupabaseContext, type SupabaseEnv, type UserClaims, type WithSupabaseConfig, createSupabaseContext, withSupabase };
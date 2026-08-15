import { t as AuthError } from "../../errors-CVZ6SLe5.mjs";
import { d as SupabaseContext, m as WithSupabaseConfig } from "../../types-CbQmV2hf.mjs";
import { Elysia, ExtractErrorFromHandle } from "elysia";

//#region src/adapters/elysia/plugin.d.ts
/**
 * Wraps an {@link AuthError} as an Elysia-compatible error.
 *
 * Discriminate in `onError` via `code === 'SupabaseError'`. The original
 * `AuthError` is available as the typed `.cause`.
 *
 * @category Adapters
 */
declare class SupabaseError extends Error {
  status: number;
  cause: AuthError;
  constructor(inner: AuthError);
}
/**
 * Elysia plugin that creates a {@link SupabaseContext} and makes it available in route handlers.
 *
 * Skips if a previous plugin already set the context, enabling route-level overrides.
 * Throws a `SupabaseError` on auth failure. `.status` is on the error directly; the original
 * `AuthError` is available as the typed `.cause`. Discriminate in `onError` via `code === 'SupabaseError'`.
 *
 * @param config - Auth modes and optional environment overrides. CORS is excluded — use Elysia's CORS utilities.
 * @returns An Elysia plugin that exposes `supabaseContext`.
 *
 * @example App-wide auth via .use()
 * ```ts
 * import { Elysia } from 'elysia'
 * import { withSupabase } from '@supabase/server/adapters/elysia'
 *
 * const app = new Elysia()
 *   .use(withSupabase({ auth: 'user' }))
 *   .get('/games', async ({ supabaseContext }) => {
 *     const { data } = await supabaseContext.supabase.from('favorite_games').select()
 *     return data
 *   })
 *
 * app.listen(3000)
 * ```
 *
 * @example Per-route auth via scoped .use()
 * ```ts
 * import { Elysia } from 'elysia'
 * import { withSupabase } from '@supabase/server/adapters/elysia'
 *
 * const app = new Elysia()
 *   .get('/health', () => ({ status: 'ok' }))
 *   .group('/api', (app) =>
 *     app
 *       .use(withSupabase({ auth: 'user' }))
 *       .get('/profile', async ({ supabaseContext }) => {
 *         return supabaseContext.userClaims
 *       })
 *   )
 *
 * app.listen(3000)
 * ```
 *
 * @category Adapters
 */
declare function withSupabase<Database = unknown>(config?: Omit<WithSupabaseConfig, 'cors'>): Elysia<'', {
  decorator: {};
  store: {};
  derive: {};
  resolve: {};
}, {
  typebox: {};
  error: {
    readonly SupabaseError: SupabaseError;
  };
}, {
  schema: {};
  standaloneSchema: {};
  macro: {};
  macroFn: {};
  parser: {};
  response: {};
}, {}, {
  derive: {};
  resolve: {
    supabaseContext: SupabaseContext<Database>;
  };
  schema: {};
  standaloneSchema: {};
  response: ExtractErrorFromHandle<{
    supabaseContext: SupabaseContext<Database>;
  }>;
}, {
  derive: {};
  resolve: {};
  schema: {};
  standaloneSchema: {};
  response: {};
}>;
//#endregion
export { SupabaseError, withSupabase };
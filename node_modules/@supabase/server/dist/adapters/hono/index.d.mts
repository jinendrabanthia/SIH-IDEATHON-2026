import { d as SupabaseContext, m as WithSupabaseConfig } from "../../types-CbQmV2hf.mjs";
import { MiddlewareHandler } from "hono";

//#region src/adapters/hono/middleware.d.ts
/**
 * Hono middleware that creates a {@link SupabaseContext} and stores it in `c.var.supabaseContext`.
 *
 * Skips if a previous middleware already set the context, enabling route-level overrides.
 * Throws a Hono `HTTPException` on auth failure.
 *
 * @param config - Auth modes and optional environment overrides. CORS is excluded — use Hono's `cors()`.
 * @returns A Hono middleware that sets `c.var.supabaseContext`.
 *
 * @example App-wide auth via app.use()
 * ```ts
 * import { Hono } from 'hono'
 * import { withSupabase } from '@supabase/server/adapters/hono'
 * import type { SupabaseContext } from '@supabase/server'
 *
 * type Env = {
 *   Variables: {
 *     supabaseContext: SupabaseContext
 *   }
 * }
 *
 * const app = new Hono<Env>()
 * app.use('*', withSupabase({ auth: 'user' }))
 *
 * app.get('/profile', async (c) => {
 *   const { supabase } = c.var.supabaseContext
 *   const { data } = await supabase.rpc('get_profile')
 *   return c.json(data)
 * })
 *
 * export default { fetch: app.fetch }
 * ```
 *
 * @category Adapters
 */
declare function withSupabase<Database = unknown>(config?: Omit<WithSupabaseConfig, 'cors'>): MiddlewareHandler<{
  Variables: {
    supabaseContext: SupabaseContext<Database>;
  };
}>;
//#endregion
export { withSupabase };
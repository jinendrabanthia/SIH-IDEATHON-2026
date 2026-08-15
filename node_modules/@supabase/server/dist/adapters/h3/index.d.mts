import { m as WithSupabaseConfig } from "../../types-CbQmV2hf.mjs";
import { Middleware } from "h3";

//#region src/adapters/h3/middleware.d.ts
/**
 * H3 middleware that creates a {@link SupabaseContext} and stores it in `event.context.supabaseContext`.
 *
 * Skips if a previous middleware already set the context, enabling chained middleware via `app.use()`.
 * Throws an `HTTPError` on auth failure.
 *
 * @param config - Auth modes and optional environment overrides. CORS is excluded — use H3's CORS utilities.
 * @returns An H3 middleware.
 *
 * @example App-wide auth via app.use()
 * ```ts
 * import { H3 } from 'h3'
 * import { withSupabase } from '@supabase/server/adapters/h3'
 *
 * const app = new H3()
 * app.use(withSupabase({ auth: 'user' }))
 *
 * app.get('/games', async (event) => {
 *   const { supabase } = event.context.supabaseContext
 *   return supabase.from('favorite_games').select()
 * })
 *
 * export default { fetch: app.fetch }
 * ```
 *
 * @example Per-route auth via defineHandler
 * ```ts
 * import { defineHandler } from 'h3'
 * import { withSupabase } from '@supabase/server/adapters/h3'
 *
 * export default defineHandler({
 *   middleware: [withSupabase({ auth: 'user' })],
 *   handler: async (event) => {
 *     const { supabase } = event.context.supabaseContext
 *     return supabase.from('favorite_games').select()
 *   },
 * })
 * ```
 *
 * @category Adapters
 */
declare function withSupabase(config?: Omit<WithSupabaseConfig, 'cors'>): Middleware;
//#endregion
export { withSupabase };
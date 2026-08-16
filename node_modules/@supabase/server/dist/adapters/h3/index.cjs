Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
const require_create_supabase_context = require('../../create-supabase-context-B0ArH_k6.cjs');
let h3 = require("h3");

//#region src/adapters/h3/middleware.ts
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
function withSupabase(config) {
	return (0, h3.defineMiddleware)(async (event, next) => {
		const context = event.context;
		if (context.supabaseContext) return next();
		const { data: ctx, error } = await require_create_supabase_context.createSupabaseContext(event.req, config);
		if (error) throw new h3.HTTPError(error.message, {
			status: error.status,
			cause: error
		});
		context.supabaseContext = ctx;
		return next();
	});
}

//#endregion
exports.withSupabase = withSupabase;
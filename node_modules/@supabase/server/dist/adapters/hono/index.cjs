Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
const require_create_supabase_context = require('../../create-supabase-context-B0ArH_k6.cjs');
let hono_factory = require("hono/factory");
let hono_http_exception = require("hono/http-exception");

//#region src/adapters/hono/middleware.ts
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
function withSupabase(config) {
	return (0, hono_factory.createMiddleware)(async (c, next) => {
		if (c.var.supabaseContext) {
			await next();
			return;
		}
		const { data: ctx, error } = await require_create_supabase_context.createSupabaseContext(c.req.raw, config);
		if (error) throw new hono_http_exception.HTTPException(error.status, {
			message: error.message,
			cause: error
		});
		c.set("supabaseContext", ctx);
		await next();
	});
}

//#endregion
exports.withSupabase = withSupabase;
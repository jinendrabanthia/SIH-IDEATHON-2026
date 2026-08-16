Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
const require_create_supabase_context = require('../../create-supabase-context-B0ArH_k6.cjs');
let elysia = require("elysia");

//#region src/adapters/elysia/plugin.ts
/**
* Wraps an {@link AuthError} as an Elysia-compatible error.
*
* Discriminate in `onError` via `code === 'SupabaseError'`. The original
* `AuthError` is available as the typed `.cause`.
*
* @category Adapters
*/
var SupabaseError = class extends Error {
	constructor(inner) {
		super(inner.message, { cause: inner });
		this.status = inner.status;
	}
};
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
function withSupabase(config) {
	return new elysia.Elysia().error({ SupabaseError }).resolve(async (ctx) => {
		const existing = ctx.supabaseContext;
		if (existing) return { supabaseContext: existing };
		const { data, error } = await require_create_supabase_context.createSupabaseContext(ctx.request, config);
		if (error) throw new SupabaseError(error);
		return { supabaseContext: data };
	}).as("scoped");
}

//#endregion
exports.SupabaseError = SupabaseError;
exports.withSupabase = withSupabase;
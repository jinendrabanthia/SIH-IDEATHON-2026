import { a as createAdminClient, f as Errors, i as createContextClient, l as CreateSupabaseClientError, s as AuthError, t as verifyAuth, u as EnvError } from "./verify-auth-CfilsSKk.mjs";

//#region src/create-supabase-context.ts
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
async function createSupabaseContext(request, options) {
	const { data: auth, error } = await verifyAuth(request, {
		auth: options?.auth,
		allow: options?.allow,
		env: options?.env
	});
	if (error) return {
		data: null,
		error
	};
	try {
		const config = {
			env: options?.env,
			supabaseOptions: options?.supabaseOptions
		};
		const publishableKeyName = auth.authMode === "publishable" ? auth.keyName : void 0;
		return {
			data: {
				supabase: createContextClient({
					auth: {
						token: auth.token,
						keyName: publishableKeyName
					},
					...config
				}),
				supabaseAdmin: createAdminClient({
					auth: { keyName: auth.authMode === "secret" ? auth.keyName : void 0 },
					...config
				}),
				userClaims: auth.userClaims,
				jwtClaims: auth.jwtClaims,
				authMode: auth.authMode,
				authKeyName: auth.keyName ?? void 0
			},
			error: null
		};
	} catch (e) {
		return {
			data: null,
			error: e instanceof EnvError ? new AuthError(e.message, e.code, 500) : Errors[CreateSupabaseClientError]()
		};
	}
}

//#endregion
export { createSupabaseContext as t };
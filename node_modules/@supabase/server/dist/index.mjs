import { _ as MissingSecretKeyError, c as AuthGenericError, d as EnvGenericError, f as Errors, g as MissingPublishableKeyError, h as MissingDefaultSecretKeyError, l as CreateSupabaseClientError, m as MissingDefaultPublishableKeyError, p as InvalidCredentialsError, s as AuthError, u as EnvError, v as MissingSupabaseURLError } from "./verify-auth-CfilsSKk.mjs";
import { t as createSupabaseContext } from "./create-supabase-context-tDtxd9x2.mjs";
import { corsHeaders } from "@supabase/supabase-js/cors";

//#region src/cors.ts
/**
* Whether the given CORS configuration disables CORS handling.
*
* @param config - The CORS configuration.
* @returns `true` for `'disabled'` or the deprecated `false`, otherwise `false`.
*
* @internal
*/
function isCorsDisabled(config) {
	return config === false || config === "disabled";
}
/**
* Builds the CORS headers object based on the given configuration.
*
* @param config - The CORS configuration.
* @returns A headers record to include in the response. Empty object if CORS is disabled.
*
* @internal
*/
function buildCorsHeaders(config) {
	if (isCorsDisabled(config)) return {};
	if (typeof config === "object") {
		if ("headers" in config && typeof config.headers === "object") return config.headers;
		return config;
	}
	return corsHeaders;
}
/**
* Returns a new `Response` with CORS headers appended.
*
* Creates a clone of the original response and sets each CORS header on it.
* If CORS is disabled (`'disabled'` or the deprecated `false`), returns the original response unchanged.
*
* @param response - The original response to augment.
* @param config - The CORS configuration.
* @returns A new `Response` with CORS headers set, or the original response if CORS is disabled.
*
* @internal
*/
function addCorsHeaders(response, config) {
	if (isCorsDisabled(config)) return response;
	const corsHeaders = buildCorsHeaders(config);
	const newResponse = new Response(response.body, response);
	for (const [key, value] of Object.entries(corsHeaders)) newResponse.headers.set(key, value);
	return newResponse;
}

//#endregion
//#region src/with-supabase.ts
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
function withSupabase(config, handler) {
	return async (req) => {
		if (!isCorsDisabled(config.cors) && req.method === "OPTIONS") return new Response(null, {
			status: 204,
			headers: buildCorsHeaders(config.cors)
		});
		const { data: ctx, error } = await createSupabaseContext(req, config);
		if (error) return Response.json({
			message: error.message,
			code: error.code
		}, {
			status: error.status,
			headers: !isCorsDisabled(config.cors) ? buildCorsHeaders(config.cors) : {}
		});
		const response = await handler(req, ctx);
		if (!isCorsDisabled(config.cors)) return addCorsHeaders(response, config.cors);
		return response;
	};
}

//#endregion
export { AuthError, AuthGenericError, CreateSupabaseClientError, EnvError, EnvGenericError, Errors, InvalidCredentialsError, MissingDefaultPublishableKeyError, MissingDefaultSecretKeyError, MissingPublishableKeyError, MissingSecretKeyError, MissingSupabaseURLError, createSupabaseContext, withSupabase };
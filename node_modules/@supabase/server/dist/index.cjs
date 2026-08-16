Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
const require_verify_auth = require('./verify-auth-BR55XdDQ.cjs');
const require_create_supabase_context = require('./create-supabase-context-B0ArH_k6.cjs');
let _supabase_supabase_js_cors = require("@supabase/supabase-js/cors");

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
	return _supabase_supabase_js_cors.corsHeaders;
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
		const { data: ctx, error } = await require_create_supabase_context.createSupabaseContext(req, config);
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
exports.AuthError = require_verify_auth.AuthError;
exports.AuthGenericError = require_verify_auth.AuthGenericError;
exports.CreateSupabaseClientError = require_verify_auth.CreateSupabaseClientError;
exports.EnvError = require_verify_auth.EnvError;
exports.EnvGenericError = require_verify_auth.EnvGenericError;
exports.Errors = require_verify_auth.Errors;
exports.InvalidCredentialsError = require_verify_auth.InvalidCredentialsError;
exports.MissingDefaultPublishableKeyError = require_verify_auth.MissingDefaultPublishableKeyError;
exports.MissingDefaultSecretKeyError = require_verify_auth.MissingDefaultSecretKeyError;
exports.MissingPublishableKeyError = require_verify_auth.MissingPublishableKeyError;
exports.MissingSecretKeyError = require_verify_auth.MissingSecretKeyError;
exports.MissingSupabaseURLError = require_verify_auth.MissingSupabaseURLError;
exports.createSupabaseContext = require_create_supabase_context.createSupabaseContext;
exports.withSupabase = withSupabase;
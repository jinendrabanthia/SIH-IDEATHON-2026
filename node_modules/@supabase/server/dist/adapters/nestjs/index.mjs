import { t as createSupabaseContext } from "../../create-supabase-context-tDtxd9x2.mjs";
import { HttpException, Injectable, createParamDecorator } from "@nestjs/common";

//#region src/adapters/nestjs/middleware.ts
function toWebRequest(req) {
	const headers = new Headers();
	for (const [name, value] of Object.entries(req.headers ?? {})) {
		if (name.startsWith(":")) continue;
		if (Array.isArray(value)) headers.set(name, value.join(", "));
		else if (value != null) headers.set(name, String(value));
	}
	return new Request(`http://nestjs.local${req.url ?? "/"}`, { headers });
}
/**
* NestJS guard that creates a {@link SupabaseContext} and stores it on the
* underlying request as `request.supabaseContext`.
*
* **HTTP-only.** The guard reads HTTP headers via `switchToHttp()` and throws
* if applied to an RPC or WebSocket handler — those transports must
* authenticate via context-specific mechanisms.
*
* Always runs, even if a previous guard already set the context. This matches
* Nest's guard order (global → controller → handler), so handler-level guards
* can tighten what a global guard set rather than being skipped.
*
* Throws `HttpException` on auth failure — the original `AuthError` is
* available via `cause`.
*
* @param config - Auth modes and optional environment overrides. CORS is excluded —
*   use NestJS's built-in CORS (`app.enableCors()`).
* @returns A guard class that can be passed to `@UseGuards(...)`.
*
* @example App-wide auth via `app.useGlobalGuards()`
* ```ts
* import { NestFactory } from '@nestjs/core'
* import { withSupabase } from '@supabase/server/adapters/nestjs'
*
* const app = await NestFactory.create(AppModule)
* app.useGlobalGuards(new (withSupabase({ auth: 'user' }))())
* await app.listen(3000)
* ```
*
* @example Per-route auth via `@UseGuards(...)`
* ```ts
* import { Controller, Get, UseGuards } from '@nestjs/common'
* import { withSupabase, SupabaseCtx } from '@supabase/server/adapters/nestjs'
* import type { SupabaseContext } from '@supabase/server'
*
* @Controller('games')
* export class GamesController {
*   @Get()
*   @UseGuards(withSupabase({ auth: 'user' }))
*   async list(@SupabaseCtx() ctx: SupabaseContext) {
*     const { data } = await ctx.supabase.from('favorite_games').select()
*     return data
*   }
* }
* ```
*
* @category Adapters
*/
function withSupabase(config) {
	class SupabaseAuthGuard {
		async canActivate(executionContext) {
			const contextType = executionContext.getType();
			if (contextType !== "http") throw new HttpException({
				message: `withSupabase guard only supports HTTP contexts (got '${contextType}'). Authenticate non-HTTP transports separately.`,
				code: "unsupported_context"
			}, 500);
			const req = executionContext.switchToHttp().getRequest();
			const { data: ctx, error } = await createSupabaseContext(toWebRequest(req), config);
			if (error) throw new HttpException({
				message: error.message,
				code: error.code
			}, error.status, { cause: error });
			req.supabaseContext = ctx;
			return true;
		}
	}
	Injectable()(SupabaseAuthGuard);
	return SupabaseAuthGuard;
}

//#endregion
//#region src/adapters/nestjs/decorator.ts
/**
* NestJS param decorator that returns the {@link SupabaseContext} attached
* by `withSupabase()`. Pass a key (e.g. `'supabase'`, `'userClaims'`) to pull
* a single field, or no argument to receive the whole context.
*
* @example Injecting the context into a route handler
* ```ts
* import { Controller, Get, UseGuards } from '@nestjs/common'
* import { withSupabase, SupabaseCtx } from '@supabase/server/adapters/nestjs'
* import type { SupabaseContext } from '@supabase/server'
*
* @Controller('games')
* @UseGuards(withSupabase({ auth: 'user' }))
* export class GamesController {
*   @Get()
*   list(@SupabaseCtx() ctx: SupabaseContext) {
*     return ctx.supabase.from('favorite_games').select()
*   }
*
*   @Get('me')
*   me(@SupabaseCtx('userClaims') user: SupabaseContext['userClaims']) {
*     return user
*   }
* }
* ```
*
* @category Adapters
*/
const SupabaseCtx = createParamDecorator((data, ctx) => {
	const supabaseContext = ctx.switchToHttp().getRequest().supabaseContext;
	if (data) return supabaseContext?.[data];
	return supabaseContext;
});

//#endregion
export { SupabaseCtx, withSupabase };
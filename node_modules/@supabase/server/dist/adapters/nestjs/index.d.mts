import { d as SupabaseContext, m as WithSupabaseConfig } from "../../types-CbQmV2hf.mjs";
import { CanActivate, PipeTransform, Type } from "@nestjs/common";

//#region src/adapters/nestjs/middleware.d.ts
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
declare function withSupabase(config?: Omit<WithSupabaseConfig, 'cors'>): Type<CanActivate>;
//#endregion
//#region src/adapters/nestjs/decorator.d.ts
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
declare const SupabaseCtx: (data?: keyof SupabaseContext, ...pipes: (Type<PipeTransform> | PipeTransform)[]) => ParameterDecorator;
//#endregion
export { SupabaseCtx, withSupabase };
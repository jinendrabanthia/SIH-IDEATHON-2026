//#region src/errors.d.ts
/**
 * Thrown when a required environment variable is missing or malformed.
 *
 * Always has `status: 500` — environment errors are server-side configuration issues.
 *
 * @example Catching an EnvError
 * ```ts
 * import { EnvError } from '@supabase/server'
 *
 * try {
 *   const client = createAdminClient()
 * } catch (e) {
 *   if (e instanceof EnvError) {
 *     console.error(`Config issue [${e.code}]: ${e.message}`)
 *     // → "Config issue [MISSING_SUPABASE_URL]: SUPABASE_URL is required but not set"
 *   }
 * }
 * ```
 *
 * @category Errors
 */
declare class EnvError extends Error {
  /** Always `500` — environment errors are server-side issues. */
  readonly status = 500;
  /**
   * Machine-readable error code.
   *
   * @see {@link EnvGenericError}, {@link MissingSupabaseURLError},
   *   {@link MissingPublishableKeyError}, {@link MissingDefaultPublishableKeyError},
   *   {@link MissingSecretKeyError}, {@link MissingDefaultSecretKeyError}
   */
  readonly code: string;
  constructor(message: string, code?: string);
}
/**
 * Generic environment error code.
 * @category Errors
 */
declare const EnvGenericError = "ENV_ERROR";
/**
 * `SUPABASE_URL` is not set.
 * @category Errors
 */
declare const MissingSupabaseURLError = "MISSING_SUPABASE_URL";
/**
 * Named publishable key not found in `SUPABASE_PUBLISHABLE_KEYS`.
 * @category Errors
 */
declare const MissingPublishableKeyError = "MISSING_PUBLISHABLE_KEY";
/**
 * No default publishable key found.
 * @category Errors
 */
declare const MissingDefaultPublishableKeyError = "MISSING_DEFAULT_PUBLISHABLE_KEY";
/**
 * Named secret key not found in `SUPABASE_SECRET_KEYS`.
 * @category Errors
 */
declare const MissingSecretKeyError = "MISSING_SECRET_KEY";
/**
 * No default secret key found.
 * @category Errors
 */
declare const MissingDefaultSecretKeyError = "MISSING_DEFAULT_SECRET_KEY";
/**
 * Thrown when authentication or authorization fails.
 *
 * Carries an HTTP `status` code suitable for returning directly in a response
 * (typically `401` for invalid credentials, `500` for server-side auth failures).
 *
 * @example Catching an AuthError
 * ```ts
 * import { AuthError, createSupabaseContext } from '@supabase/server'
 *
 * const { data: ctx, error } = await createSupabaseContext(request, { auth: 'user' })
 * if (error) {
 *   // error is an AuthError
 *   return Response.json(
 *     { message: error.message, code: error.code },
 *     { status: error.status },
 *   )
 * }
 * ```
 *
 * @category Errors
 */
declare class AuthError extends Error {
  /**
   * HTTP status code.
   *
   * - `401` — Invalid or missing credentials
   * - `500` — Server-side auth failure (e.g., missing JWKS, env misconfiguration)
   */
  readonly status: number;
  /**
   * Machine-readable error code.
   *
   * @see {@link AuthGenericError}, {@link InvalidCredentialsError},
   *   {@link CreateSupabaseClientError}
   */
  readonly code: string;
  constructor(message: string, code?: string, status?: number);
}
/**
 * Generic authentication error code.
 * @category Errors
 */
declare const AuthGenericError = "AUTH_ERROR";
/**
 * No credential matched any allowed auth mode.
 * @category Errors
 */
declare const InvalidCredentialsError = "INVALID_CREDENTIALS";
/**
 * Failed to create a Supabase client after auth succeeded.
 * @category Errors
 */
declare const CreateSupabaseClientError = "CREATE_SUPABASE_CLIENT_ERROR";
/**
 * Factory map for all error types. Keyed by error code constant, each entry
 * returns a pre-configured {@link EnvError} or {@link AuthError}.
 *
 * @example Throwing typed errors
 * ```ts
 * throw Errors[MissingSupabaseURLError]()
 * throw Errors[MissingPublishableKeyError]('mobile')
 * ```
 *
 * @category Errors
 */
declare const Errors: {
  INVALID_CREDENTIALS: () => AuthError;
  CREATE_SUPABASE_CLIENT_ERROR: () => AuthError;
  MISSING_SUPABASE_URL: () => EnvError;
  MISSING_SECRET_KEY: (name: string) => EnvError;
  MISSING_DEFAULT_SECRET_KEY: () => EnvError;
  MISSING_PUBLISHABLE_KEY: (name: string) => EnvError;
  MISSING_DEFAULT_PUBLISHABLE_KEY: () => EnvError;
};
//#endregion
export { EnvGenericError as a, MissingDefaultPublishableKeyError as c, MissingSecretKeyError as d, MissingSupabaseURLError as f, EnvError as i, MissingDefaultSecretKeyError as l, AuthGenericError as n, Errors as o, CreateSupabaseClientError as r, InvalidCredentialsError as s, AuthError as t, MissingPublishableKeyError as u };
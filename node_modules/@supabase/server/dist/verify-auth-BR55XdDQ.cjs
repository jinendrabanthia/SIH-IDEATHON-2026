let _supabase_supabase_js = require("@supabase/supabase-js");
let jose = require("jose");

//#region src/errors.ts
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
var EnvError = class extends Error {
	constructor(message, code = EnvGenericError) {
		super(message);
		this.status = 500;
		this.name = "EnvError";
		this.code = code;
	}
};
/**
* Generic environment error code.
* @category Errors
*/
const EnvGenericError = "ENV_ERROR";
/**
* `SUPABASE_URL` is not set.
* @category Errors
*/
const MissingSupabaseURLError = "MISSING_SUPABASE_URL";
/**
* Named publishable key not found in `SUPABASE_PUBLISHABLE_KEYS`.
* @category Errors
*/
const MissingPublishableKeyError = "MISSING_PUBLISHABLE_KEY";
/**
* No default publishable key found.
* @category Errors
*/
const MissingDefaultPublishableKeyError = "MISSING_DEFAULT_PUBLISHABLE_KEY";
/**
* Named secret key not found in `SUPABASE_SECRET_KEYS`.
* @category Errors
*/
const MissingSecretKeyError = "MISSING_SECRET_KEY";
/**
* No default secret key found.
* @category Errors
*/
const MissingDefaultSecretKeyError = "MISSING_DEFAULT_SECRET_KEY";
const EnvErrorMap = {
	[MissingSupabaseURLError]: () => new EnvError("SUPABASE_URL is required but not set", MissingSupabaseURLError),
	[MissingSecretKeyError]: (name) => new EnvError(`No "${name}" secret key found. Include a "${name}" entry in SUPABASE_SECRET_KEYS.`, MissingSecretKeyError),
	[MissingDefaultSecretKeyError]: () => new EnvError("No default secret key found. Set SUPABASE_SECRET_KEY or include a \"default\" entry in SUPABASE_SECRET_KEYS.", MissingDefaultSecretKeyError),
	[MissingPublishableKeyError]: (name) => new EnvError(`No "${name}" publishable key found. Include a "${name}" entry in SUPABASE_PUBLISHABLE_KEYS.`, MissingPublishableKeyError),
	[MissingDefaultPublishableKeyError]: () => new EnvError("No default publishable key found. Set SUPABASE_PUBLISHABLE_KEY or include a \"default\" entry in SUPABASE_PUBLISHABLE_KEYS.", MissingDefaultPublishableKeyError)
};
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
var AuthError = class extends Error {
	constructor(message, code = AuthGenericError, status = 401) {
		super(message);
		this.name = "AuthError";
		this.code = code;
		this.status = status;
	}
};
/**
* Generic authentication error code.
* @category Errors
*/
const AuthGenericError = "AUTH_ERROR";
/**
* No credential matched any allowed auth mode.
* @category Errors
*/
const InvalidCredentialsError = "INVALID_CREDENTIALS";
/**
* Failed to create a Supabase client after auth succeeded.
* @category Errors
*/
const CreateSupabaseClientError = "CREATE_SUPABASE_CLIENT_ERROR";
const AuthErrorMap = {
	[InvalidCredentialsError]: () => new AuthError("Invalid credentials", InvalidCredentialsError, 401),
	[CreateSupabaseClientError]: () => new AuthError("Failed to create Supabase client", CreateSupabaseClientError, 500)
};
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
const Errors = {
	...EnvErrorMap,
	...AuthErrorMap
};

//#endregion
//#region src/core/resolve-env.ts
/**
* Reads an environment variable from the current runtime (Deno, Node.js, or Bun).
* Cloudflare Workers require node-compat or passing values via `overrides`.
* @internal
*/
function getEnvVar(name) {
	if (typeof Deno !== "undefined" && Deno.env?.get) return Deno.env.get(name);
	if (typeof process !== "undefined" && process.env) return process.env[name];
}
/**
* Parses a JSON string into a `Record<string, string>` key map.
* Returns an empty object if the input is missing, malformed, or not a plain object.
* @internal
*/
function parseKeys(raw) {
	if (!raw) return {};
	try {
		const parsed = JSON.parse(raw);
		if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
		return parsed;
	} catch {
		return {};
	}
}
/**
* Resolves API keys from environment variables. Checks the plural form first
* (`SUPABASE_PUBLISHABLE_KEYS` as JSON), then falls back to the singular form
* (`SUPABASE_PUBLISHABLE_KEY` stored as `{ default: "<value>" }`).
* @internal
*/
function resolveKeys(singularVar, pluralVar) {
	const plural = getEnvVar(pluralVar);
	if (plural) return parseKeys(plural);
	const singular = getEnvVar(singularVar);
	if (singular) return { default: singular };
	return {};
}
/**
* Parses an inline JWKS JSON string. Accepts `{ keys: [...] }` or a bare
* array `[...]` (wrapped as `{ keys: [...] }`). Returns `null` for missing
* or malformed input.
*
* @internal
*/
function parseJwks(raw) {
	if (!raw) return null;
	try {
		const parsed = JSON.parse(raw);
		if (Array.isArray(parsed)) return { keys: parsed };
		if (parsed?.keys && Array.isArray(parsed.keys)) return parsed;
		return null;
	} catch {
		return null;
	}
}
/**
* Returns true if the hostname is a loopback address — `localhost`,
* `*.localhost`, `127.0.0.0/8`, or `::1`. Browsers treat these as secure
* contexts because traffic never leaves the machine.
*
* @internal
*/
function isLoopbackHost(hostname) {
	if (hostname === "localhost" || hostname.endsWith(".localhost")) return true;
	if (hostname === "[::1]") return true;
	if (/^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
	return false;
}
/**
* Parses a JWKS endpoint URL. `https://` is always accepted. Plain `http://`
* is accepted only for loopback hosts (`localhost`, `127.0.0.0/8`, `::1`) so
* the Supabase CLI flow works against `http://localhost:54321`. For any
* other host, http is rejected: a MITM on the JWKS fetch could swap in an
* attacker-controlled key and forge JWTs that pass verification. Returns
* `null` for missing or malformed input.
*
* @internal
*/
function parseJwksUrl(raw) {
	if (!raw) return null;
	const trimmed = raw.trim();
	try {
		const url = new URL(trimmed);
		if (url.protocol === "https:") return url;
		if (url.protocol === "http:" && isLoopbackHost(url.hostname)) return url;
		return null;
	} catch {
		return null;
	}
}
/**
* Resolves the JWKS source from `SUPABASE_JWKS` (inline JSON) or
* `SUPABASE_JWKS_URL` (https endpoint). `SUPABASE_JWKS` wins when set;
* `SUPABASE_JWKS_URL` is only consulted if `SUPABASE_JWKS` is absent. Each
* variable is treated as authoritative — if set but malformed, the result is
* `null` and the other variable is *not* consulted as a fallback.
*
* @internal
*/
function resolveJwks() {
	const rawJwks = getEnvVar("SUPABASE_JWKS");
	if (rawJwks && rawJwks.trim()) return parseJwks(rawJwks);
	const rawJwksUrl = getEnvVar("SUPABASE_JWKS_URL");
	if (rawJwksUrl && rawJwksUrl.trim()) return parseJwksUrl(rawJwksUrl);
	return null;
}
/**
* Resolves Supabase environment configuration from runtime environment variables.
*
* Reads `SUPABASE_URL`, keys (`SUPABASE_PUBLISHABLE_KEYS` / `SUPABASE_SECRET_KEYS`),
* and the JWKS source (`SUPABASE_JWKS` for inline keys, or `SUPABASE_JWKS_URL`
* for a remote endpoint). Works across Deno, Node.js, and Bun. For Cloudflare
* Workers, use `overrides` or enable node-compat.
*
* @param overrides - Partial values that take precedence over env vars.
* @returns `{ data: SupabaseEnv, error: null }` on success, `{ data: null, error: EnvError }` on failure.
*
* @example Reading and overriding env vars
* ```ts
* const { data: env, error } = resolveEnv()
* if (error) throw error
*
* // Override for tests
* const { data: env } = resolveEnv({ url: 'http://localhost:54321' })
* ```
*
* @category Primitives
*/
function resolveEnv(overrides) {
	const url = overrides?.url ?? getEnvVar("SUPABASE_URL");
	if (!url) return {
		data: null,
		error: Errors[MissingSupabaseURLError]()
	};
	return {
		data: {
			url,
			publishableKeys: overrides?.publishableKeys ?? resolveKeys("SUPABASE_PUBLISHABLE_KEY", "SUPABASE_PUBLISHABLE_KEYS"),
			secretKeys: overrides?.secretKeys ?? resolveKeys("SUPABASE_SECRET_KEY", "SUPABASE_SECRET_KEYS"),
			jwks: overrides?.jwks ?? resolveJwks()
		},
		error: null
	};
}

//#endregion
//#region src/core/create-admin-client.ts
/**
* Creates an admin Supabase client that bypasses Row-Level Security.
*
* Uses a secret key for authentication, giving full access to all data.
* Stateless — one client per request.
*
* ## Which key is used
*
* With `auth.keyName` set, that named key from `SUPABASE_SECRET_KEYS` is used —
* and it throws if the key doesn't exist. With `keyName` omitted, the `default`
* key is used, falling back to the first key in the set when no `default` exists.
*
* Note this differs from the `"secret"` auth mode, which matches the `default`
* key only and never falls back — see {@link index.AuthModeWithKey}.
*
* @throws {@link index.EnvError} If `SUPABASE_URL` is missing or the specified secret key is not found.
*
* @example Basic usage
* ```ts
* // Uses the `default` secret key (or the first key if no `default` exists)
* const supabaseAdmin = createAdminClient()
* const { data } = await supabaseAdmin.from('audit_log').insert({ action: 'user_login' })
* ```
*
* @example Specific named key
* ```ts
* const supabaseAdmin = createAdminClient({ auth: { keyName: 'internal' } })
* ```
*
* @category Primitives
*/
function createAdminClient(options) {
	const { data: resolved, error } = resolveEnv(options?.env);
	if (error) throw error;
	const keyName = options?.auth?.keyName;
	const supabaseOptions = options?.supabaseOptions;
	const name = keyName ?? "default";
	const keys = resolved.secretKeys;
	const secretKey = keys[name] ?? (keyName == null ? Object.values(keys)[0] : void 0);
	if (!secretKey) throw name === "default" ? Errors[MissingDefaultSecretKeyError]() : Errors[MissingSecretKeyError](name);
	const safeHeaders = { ...supabaseOptions?.global?.headers };
	delete safeHeaders.Authorization;
	delete safeHeaders.apikey;
	return (0, _supabase_supabase_js.createClient)(resolved.url, secretKey, {
		...supabaseOptions,
		accessToken: void 0,
		global: {
			...supabaseOptions?.global,
			headers: safeHeaders
		},
		auth: {
			...supabaseOptions?.auth,
			persistSession: false,
			autoRefreshToken: false,
			detectSessionInUrl: false
		}
	});
}

//#endregion
//#region src/core/create-context-client.ts
/**
* Creates a Supabase client scoped to the caller's context.
*
* Configured with a publishable key and (optionally) the caller's JWT,
* so Row-Level Security policies apply. Stateless — one client per request.
*
* ## Which key is used
*
* With `auth.keyName` set, that named key from `SUPABASE_PUBLISHABLE_KEYS` is
* used — and it throws if the key doesn't exist. With `keyName` omitted, the
* `default` key is used, falling back to the first key in the set when no
* `default` exists.
*
* Note this differs from the `"publishable"` auth mode, which matches the
* `default` key only and never falls back — see {@link index.AuthModeWithKey}.
*
* @throws {@link index.EnvError} If `SUPABASE_URL` is missing or the specified publishable key is not found.
*
* @example With verified auth
* ```ts
* const { data: auth } = await verifyAuth(request, { auth: 'user' })
* const supabase = createContextClient({
*   auth: { token: auth.token, keyName: auth.keyName },
* })
* const { data } = await supabase.rpc('get_my_items')
* ```
*
* @category Primitives
*/
function createContextClient(options) {
	const { data: resolved, error } = resolveEnv(options?.env);
	if (error) throw error;
	const token = options?.auth?.token;
	const keyName = options?.auth?.keyName;
	const supabaseOptions = options?.supabaseOptions;
	const name = keyName ?? "default";
	const keys = resolved.publishableKeys;
	const anonKey = keys[name] ?? (keyName == null ? Object.values(keys)[0] : void 0);
	if (!anonKey) throw name === "default" ? Errors[MissingDefaultPublishableKeyError]() : Errors[MissingPublishableKeyError](name);
	const safeHeaders = { ...supabaseOptions?.global?.headers };
	delete safeHeaders.Authorization;
	delete safeHeaders.apikey;
	return (0, _supabase_supabase_js.createClient)(resolved.url, anonKey, {
		...supabaseOptions,
		accessToken: void 0,
		global: {
			...supabaseOptions?.global,
			headers: {
				...safeHeaders,
				...token ? { Authorization: `Bearer ${token}` } : {}
			}
		},
		auth: {
			...supabaseOptions?.auth,
			persistSession: false,
			autoRefreshToken: false,
			detectSessionInUrl: false
		}
	});
}

//#endregion
//#region src/core/extract-credentials.ts
/**
* Extracts authentication credentials from an incoming HTTP request.
*
* Reads two headers:
* - `Authorization: Bearer <token>` → extracted as `token`
* - `apikey: <key>` → extracted as `apikey`
*
* This is a pure extraction step — no validation or verification is performed.
* Pass the result to {@link verifyCredentials} to validate against allowed auth modes.
*
* @param request - The incoming HTTP request.
* @returns The extracted {@link Credentials}. Fields are `null` when the corresponding header is absent.
*
* @example Basic usage
* ```ts
* import { extractCredentials } from '@supabase/server/core'
*
* const creds = extractCredentials(request)
* console.log(creds.token)  // "eyJhbGci..." or null
* console.log(creds.apikey) // "sb-abc123-publishable-..." or null
* ```
*
* @category Primitives
*/
function extractCredentials(request) {
	const authHeader = request.headers.get("authorization");
	return {
		token: authHeader?.startsWith("Bearer ") ? authHeader.slice(7) || null : null,
		apikey: request.headers.get("apikey")
	};
}

//#endregion
//#region src/core/utils/deprecation.ts
let allowDeprecationWarned = false;
/**
* Emits a one-time deprecation warning when the legacy `allow` option is used
* instead of `auth`. The warning fires at most once per process to avoid
* spamming logs in long-running servers.
*
* @internal
*/
function warnAllowDeprecated() {
	if (allowDeprecationWarned) return;
	allowDeprecationWarned = true;
	console.warn("[@supabase/server] The `allow` option is deprecated and will be removed in a future major release. Use `auth` instead — e.g. `{ auth: \"user\" }` instead of `{ allow: \"user\" }`.");
}
/**
* Resolves the auth mode from `auth` (preferred) or `allow` (deprecated),
* falling back to `"user"` when neither is provided. Emits a one-time
* deprecation warning when `allow` is used without `auth`.
*
* @internal
*/
function resolveAuthOption(options) {
	if (options.auth !== void 0) return options.auth;
	if (options.allow !== void 0) {
		warnAllowDeprecated();
		return options.allow;
	}
	return "user";
}

//#endregion
//#region src/core/utils/timing-safe-equal.ts
const encoder = new TextEncoder();
/**
* Compares two strings in constant time to prevent timing attacks.
* Uses the double-HMAC technique with a random ephemeral key.
*
* @internal
*/
async function timingSafeEqual(a, b) {
	const key = crypto.getRandomValues(new Uint8Array(32));
	const cryptoKey = await crypto.subtle.importKey("raw", key, {
		name: "HMAC",
		hash: "SHA-256"
	}, false, ["sign"]);
	const [sigA, sigB] = await Promise.all([crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(a)), crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(b))]);
	if (sigA.byteLength !== sigB.byteLength) return false;
	const viewA = new Uint8Array(sigA);
	const viewB = new Uint8Array(sigB);
	let result = 0;
	for (let i = 0; i < viewA.length; i++) result |= viewA[i] ^ viewB[i];
	return result === 0;
}

//#endregion
//#region src/core/verify-credentials.ts
/**
* Parses an {@link AuthModeWithKey} string into its base mode and optional key name.
*
* @example
* ```
* parseAuthMode('user')              → { base: 'user',        keyName: null }
* parseAuthMode('publishable:web')   → { base: 'publishable', keyName: 'web' }
* parseAuthMode('secret:*')          → { base: 'secret',      keyName: '*' }
* ```
*
* @internal
*/
function parseAuthMode(mode) {
	if (mode === "none" || mode === "publishable" || mode === "secret" || mode === "user") return {
		base: mode,
		keyName: null
	};
	const colonIndex = mode.indexOf(":");
	const base = mode.slice(0, colonIndex);
	const keyName = mode.slice(colonIndex + 1);
	if (!keyName) return {
		base,
		keyName: null
	};
	return {
		base,
		keyName
	};
}
/**
* Converts raw {@link JWTClaims} (snake_case) to a normalized {@link UserClaims} (camelCase).
* @internal
*/
function jwtClaimsToUserClaims(jwtClaims) {
	return {
		id: jwtClaims.sub,
		role: jwtClaims.role,
		email: jwtClaims.email,
		appMetadata: jwtClaims.app_metadata,
		userMetadata: jwtClaims.user_metadata
	};
}
const INVALID = Symbol("invalid");
let remoteJwksResolver = void 0;
/**
* Returns a key resolver for the given JWKS source.
*
* For a {@link URL}, the underlying `createRemoteJWKSet` resolver is cached
* across requests so `jose`'s built-in cooldown / max-age caching is
* preserved. Local JWKS objects are wrapped on every call — they're trivially
* cheap and the object identity may change across requests.
*
* @internal
*/
function getJwksResolver(jwks) {
	if (jwks instanceof URL) {
		const url = jwks.toString();
		if (remoteJwksResolver?.url !== url) remoteJwksResolver = {
			url,
			resolver: (0, jose.createRemoteJWKSet)(jwks)
		};
		return remoteJwksResolver.resolver;
	}
	const localJwkSet = (0, jose.createLocalJWKSet)(jwks);
	function localJwtVerifyGetKey(...args) {
		return localJwkSet(...args);
	}
	return Object.assign(localJwtVerifyGetKey, { jwks: () => jwks });
}
/**
* Attempts to authenticate credentials against a single auth mode.
*
* Returns:
* - `AuthResult` on success.
* - `null` if the mode doesn't apply (no relevant credential present — safe to try the next mode).
* - `INVALID` if a credential was present but failed verification (must reject immediately).
*
* @internal
*/
async function tryMode(mode, credentials, env) {
	const { base, keyName } = parseAuthMode(mode);
	switch (base) {
		case "none": return {
			authMode: "none",
			token: null,
			userClaims: null,
			jwtClaims: null,
			keyName: null
		};
		case "publishable": {
			if (!credentials.apikey) return null;
			const keys = env.publishableKeys;
			if (keyName === "*") {
				for (const [name, value] of Object.entries(keys)) if (await timingSafeEqual(credentials.apikey, value)) return {
					authMode: "publishable",
					token: null,
					userClaims: null,
					jwtClaims: null,
					keyName: name
				};
			} else {
				const name = keyName ?? "default";
				const value = keys[name];
				if (value && await timingSafeEqual(credentials.apikey, value)) return {
					authMode: "publishable",
					token: null,
					userClaims: null,
					jwtClaims: null,
					keyName: name
				};
			}
			return null;
		}
		case "secret": {
			if (!credentials.apikey) return null;
			const keys = env.secretKeys;
			if (keyName === "*") {
				for (const [name, value] of Object.entries(keys)) if (await timingSafeEqual(credentials.apikey, value)) return {
					authMode: "secret",
					token: null,
					userClaims: null,
					jwtClaims: null,
					keyName: name
				};
			} else {
				const name = keyName ?? "default";
				const value = keys[name];
				if (value && await timingSafeEqual(credentials.apikey, value)) return {
					authMode: "secret",
					token: null,
					userClaims: null,
					jwtClaims: null,
					keyName: name
				};
			}
			return null;
		}
		case "user":
			if (!credentials.token) return null;
			if (credentials.token.startsWith("sb_")) return null;
			if (!env.jwks) return null;
			try {
				const jwkResolver = getJwksResolver(env.jwks);
				const { alg, kid } = (0, jose.decodeProtectedHeader)(credentials.token);
				if (!alg || !kid) return INVALID;
				let payload = null;
				if (alg === "HS256") {
					const jwk = jwkResolver.jwks()?.keys.find((key) => key.alg === alg && key.kid === kid);
					if (!jwk) return INVALID;
					const sharedSecret = await (0, jose.importJWK)(jwk, "HS256");
					payload = (await (0, jose.jwtVerify)(credentials.token, sharedSecret)).payload;
				} else payload = (await (0, jose.jwtVerify)(credentials.token, jwkResolver)).payload;
				if (typeof payload.sub !== "string") return INVALID;
				const jwtClaims = payload;
				return {
					authMode: "user",
					token: credentials.token,
					userClaims: jwtClaimsToUserClaims(jwtClaims),
					jwtClaims,
					keyName: null
				};
			} catch {
				return INVALID;
			}
		default: return null;
	}
}
/**
* Verifies pre-extracted credentials against one or more allowed auth modes.
*
* Tries each mode in order — first match wins. A mode is only tried when its
* credential is present; a JWT that is present but fails verification
* short-circuits the chain with `InvalidCredentialsError` instead of falling
* through to the next mode. Use {@link verifyAuth} to extract and verify in a
* single call.
*
* @param credentials - The credentials to verify (from {@link extractCredentials}).
* @param options - Allowed auth modes and optional env overrides.
* @returns `{ data: AuthResult, error: null }` on success, `{ data: null, error: AuthError }` on failure.
*
* @example Multiple auth modes
* ```ts
* const credentials = extractCredentials(request)
* const { data: auth, error } = await verifyCredentials(credentials, {
*   auth: ['user', 'publishable'],
* })
* if (error) {
*   return Response.json({ message: error.message }, { status: error.status })
* }
* ```
*
* @category Primitives
*/
async function verifyCredentials(credentials, options) {
	const { data: env, error: envError } = resolveEnv(options.env);
	if (envError) return {
		data: null,
		error: new AuthError(envError.message, envError.code, 500)
	};
	const resolved = resolveAuthOption(options);
	const modes = Array.isArray(resolved) ? resolved : [resolved];
	for (const mode of modes) {
		const result = await tryMode(mode, credentials, env);
		if (result === INVALID) return {
			data: null,
			error: Errors[InvalidCredentialsError]()
		};
		if (result) return {
			data: result,
			error: null
		};
	}
	return {
		data: null,
		error: Errors[InvalidCredentialsError]()
	};
}

//#endregion
//#region src/core/verify-auth.ts
/**
* Extracts credentials from a request and verifies them in a single step.
*
* This is a convenience function that combines {@link extractCredentials} and
* {@link verifyCredentials}. Use it when you want the full auth flow without
* needing to inspect the raw credentials.
*
* @param request - The incoming HTTP request.
* @param options - Auth modes to accept and optional environment overrides.
*
* @returns A result tuple: `{ data, error }`.
*   - On success: `{ data: AuthResult, error: null }`
*   - On failure: `{ data: null, error: AuthError }`
*
* @example User auth
* ```ts
* import { verifyAuth } from '@supabase/server/core'
*
* const { data: auth, error } = await verifyAuth(request, {
*   auth: 'user',
* })
*
* if (error) {
*   return Response.json({ message: error.message }, { status: error.status })
* }
*
* console.log(auth.userClaims!.id) // "d0f1a2b3-..."
* ```
*
* @category Primitives
*/
async function verifyAuth(request, options) {
	return verifyCredentials(extractCredentials(request), options);
}

//#endregion
Object.defineProperty(exports, 'AuthError', {
  enumerable: true,
  get: function () {
    return AuthError;
  }
});
Object.defineProperty(exports, 'AuthGenericError', {
  enumerable: true,
  get: function () {
    return AuthGenericError;
  }
});
Object.defineProperty(exports, 'CreateSupabaseClientError', {
  enumerable: true,
  get: function () {
    return CreateSupabaseClientError;
  }
});
Object.defineProperty(exports, 'EnvError', {
  enumerable: true,
  get: function () {
    return EnvError;
  }
});
Object.defineProperty(exports, 'EnvGenericError', {
  enumerable: true,
  get: function () {
    return EnvGenericError;
  }
});
Object.defineProperty(exports, 'Errors', {
  enumerable: true,
  get: function () {
    return Errors;
  }
});
Object.defineProperty(exports, 'InvalidCredentialsError', {
  enumerable: true,
  get: function () {
    return InvalidCredentialsError;
  }
});
Object.defineProperty(exports, 'MissingDefaultPublishableKeyError', {
  enumerable: true,
  get: function () {
    return MissingDefaultPublishableKeyError;
  }
});
Object.defineProperty(exports, 'MissingDefaultSecretKeyError', {
  enumerable: true,
  get: function () {
    return MissingDefaultSecretKeyError;
  }
});
Object.defineProperty(exports, 'MissingPublishableKeyError', {
  enumerable: true,
  get: function () {
    return MissingPublishableKeyError;
  }
});
Object.defineProperty(exports, 'MissingSecretKeyError', {
  enumerable: true,
  get: function () {
    return MissingSecretKeyError;
  }
});
Object.defineProperty(exports, 'MissingSupabaseURLError', {
  enumerable: true,
  get: function () {
    return MissingSupabaseURLError;
  }
});
Object.defineProperty(exports, 'createAdminClient', {
  enumerable: true,
  get: function () {
    return createAdminClient;
  }
});
Object.defineProperty(exports, 'createContextClient', {
  enumerable: true,
  get: function () {
    return createContextClient;
  }
});
Object.defineProperty(exports, 'extractCredentials', {
  enumerable: true,
  get: function () {
    return extractCredentials;
  }
});
Object.defineProperty(exports, 'resolveEnv', {
  enumerable: true,
  get: function () {
    return resolveEnv;
  }
});
Object.defineProperty(exports, 'verifyAuth', {
  enumerable: true,
  get: function () {
    return verifyAuth;
  }
});
Object.defineProperty(exports, 'verifyCredentials', {
  enumerable: true,
  get: function () {
    return verifyCredentials;
  }
});
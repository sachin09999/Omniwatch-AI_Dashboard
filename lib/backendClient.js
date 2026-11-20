/**
 * Central Backend Client for OmniVision AI Dashboard
 * Features:
 * - In-memory Token Caching
 * - Automatic Auth Refresh when token expires (401 Unauthorized)
 * - Seamless Fallback & Retry mechanism
 */

export const DEFAULT_BACKEND_URL = 'http://10.10.12.52:8009';
export const DEFAULT_AUTH_URL = 'http://10.10.10.60:5003/api/auth/login';
export const DEFAULT_AUTH_EMAIL = 'admin@digital-twin-solutions.com';
export const DEFAULT_AUTH_PASSWORD = 'U2FsdGVkX1+MH3Xce3vo0+SzEsRBkLOpIUa5mg45gl0=';
export const DEFAULT_AUTH_TOKEN = 'oat_MTE4.ZzBQaFZnUTk0YmktN21pUUpxWTZXWVlOVE9VYzNfcWl2RGlkV3ZzMDU0OTAwNzczOA';

// Global in-memory cache across server requests
let cachedToken = (process.env.BACKEND_AUTH_TOKEN || DEFAULT_AUTH_TOKEN).trim();
let isRefreshingPromise = null;

export function getBackendBase() {
  return (process.env.BACKEND_URL || DEFAULT_BACKEND_URL).trim().replace(/\/+$/, '');
}

export function getActiveToken() {
  return cachedToken;
}

export function setCachedToken(token) {
  if (token) {
    cachedToken = token.trim();
  }
}

/**
 * Automatically fetch a fresh token from the auth service
 */
export async function refreshBackendToken() {
  if (isRefreshingPromise) {
    return isRefreshingPromise;
  }

  isRefreshingPromise = (async () => {
    const authUrl = (process.env.AUTH_LOGIN_URL || DEFAULT_AUTH_URL).trim();
    const email = (process.env.AUTH_EMAIL || DEFAULT_AUTH_EMAIL).trim();
    const password = (process.env.AUTH_PASSWORD || DEFAULT_AUTH_PASSWORD).trim();

    console.log(`[Auth Client] Attempting auto-login to ${authUrl} as ${email}...`);

    try {
      const res = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        cache: 'no-store'
      });

      if (!res.ok) {
        console.warn(`[Auth Client] Login failed with status: ${res.status} ${res.statusText}`);
        return cachedToken;
      }

      const body = await res.json();
      const newToken = body?.data?.token || body?.token;

      if (newToken) {
        console.log(`[Auth Client] Successfully auto-fetched new backend token: ${newToken.substring(0, 15)}...`);
        setCachedToken(newToken);
        return newToken;
      }
    } catch (err) {
      console.warn('[Auth Client] Error during auto-login request:', err.message);
    } finally {
      isRefreshingPromise = null;
    }

    return cachedToken;
  })();

  return isRefreshingPromise;
}

/**
 * Returns authorization headers with active token
 */
export function getBackendHeaders(extraHeaders = {}, overrideToken = null) {
  const token = overrideToken || cachedToken;
  const headers = {
    'Accept': 'application/json',
    ...extraHeaders
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['Cookie'] = `omni_auth_token=${token}; token=${token}`;
  }
  return headers;
}

/**
 * Robust fetch wrapper that automatically catches 401 Unauthorized,
 * acquires a fresh token from the auth service, and retries the request once.
 */
export async function backendFetch(url, options = {}) {
  const headers = getBackendHeaders(options.headers || {});
  
  let res = await fetch(url, {
    ...options,
    headers,
    cache: 'no-store'
  });

  // If token expired, auto-refresh and retry once
  if (res.status === 401) {
    console.warn('[Backend Client] Received 401 Unauthorized. Auto-refreshing token...');
    const freshToken = await refreshBackendToken();

    if (freshToken) {
      const retryHeaders = getBackendHeaders(options.headers || {}, freshToken);
      res = await fetch(url, {
        ...options,
        headers: retryHeaders,
        cache: 'no-store'
      });
      console.log(`[Backend Client] Retried request status: ${res.status}`);
    }
  }

  return res;
}

import { Auth, configuration, authOptions, authenticatedSession } from './auth.mjs';
import { createPrivateStore, StorageConflict, MAX_DOCUMENT_BYTES } from './store.mjs';
import { freshWorkspace, freshState, restoreState } from '../../public/companion/state.mjs';

const protectedPaths = new Set(['/api/cocoa/session', '/api/cocoa/workspace']);
const authPaths = new Set(['/api/auth/csrf', '/api/auth/providers', '/api/auth/signin/google', '/api/auth/callback/google', '/api/auth/signout', '/api/auth/error']);
export const securityHeaders = {
  'Cache-Control': 'private, no-store, max-age=0',
  'CDN-Cache-Control': 'no-store', 'Vercel-CDN-Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer',
  'X-Frame-Options': 'DENY', 'Vary': 'Cookie'
};
function result(body, status = 200, extra = {}) { return Response.json(body, { status, headers: { ...securityHeaders, ...extra } }); }
function secure(response, cookies = []) {
  // Redirect responses returned by Auth.js can have immutable Headers.
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(securityHeaders)) headers.set(key, value);
  for (const cookie of cookies) headers.append('Set-Cookie', cookie);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
export function normalizeDocument(input, user) {
  if (!input || typeof input !== 'object' || Array.isArray(input) || input.version !== 1 || !input.workspace || typeof input.workspace !== 'object' || Array.isArray(input.workspace)) throw new Error('Invalid document');
  if (Object.keys(input).some(key => !['version', 'name', 'theme', 'workspace'].includes(key))) throw new Error('Owner and profile fields are not accepted');
  const wrapped = freshState();
  wrapped.names[user.profile] = input.name;
  wrapped.theme = input.theme;
  wrapped.workspaces[user.profile] = input.workspace;
  const normalized = restoreState(JSON.stringify(wrapped));
  return { version: 1, name: normalized.names[user.profile], theme: normalized.theme, workspace: normalized.workspaces[user.profile] };
}
export function createHandler({ env = process.env, store = createPrivateStore(env) } = {}) {
  return async function handle(request) {
    const url = new URL(request.url);
    if (!protectedPaths.has(url.pathname) && !authPaths.has(url.pathname)) return result({ error: 'NOT_FOUND' }, 404);
    const config = configuration(env);
    if (!config) return result({ error: 'SETUP_REQUIRED', message: 'Google sign-in has not been configured. Access is closed.' }, 503);
    if (url.origin !== config.origin) return result({ error: 'WRONG_ORIGIN' }, 403);
    const unsafe = !['GET', 'HEAD'].includes(request.method);
    if (unsafe && request.headers.get('origin') !== config.origin) return result({ error: 'ORIGIN_DENIED' }, 403);
    if (request.headers.get('sec-fetch-site') === 'cross-site' && unsafe) return result({ error: 'ORIGIN_DENIED' }, 403);
    if (authPaths.has(url.pathname)) {
      if (!['GET', 'POST'].includes(request.method)) return result({ error: 'METHOD_NOT_ALLOWED' }, 405);
      // Auth.js handles state, nonce, PKCE, verified OIDC identity, CSRF, encrypted sessions and cookie flags.
      return secure(await Auth(request, authOptions(config)));
    }
    const { user, expires, cookies } = await authenticatedSession(request, config);
    if (!user) return secure(result({ error: 'AUTH_REQUIRED' }, 401, { 'WWW-Authenticate': 'Session realm="cocoa"' }), cookies);
    if ([...url.searchParams.keys()].length) return secure(result({ error: 'QUERY_NOT_ALLOWED' }, 400), cookies);
    if (url.pathname === '/api/cocoa/session') {
      if (request.method !== 'GET') return result({ error: 'METHOD_NOT_ALLOWED' }, 405);
      return secure(result({ user, expires, storageReady: store.ready }), cookies);
    }
    // A stale tab must not save one person's plaintext into a newly signed-in person's store.
    if (request.headers.get('x-cocoa-account') !== user.id) return secure(result({ error: 'ACCOUNT_CHANGED' }, 409), cookies);
    if (!store.ready) return secure(result({ error: 'STORAGE_SETUP_REQUIRED', message: 'Private workspace storage is not configured.' }, 503), cookies);
    try {
      if (request.method === 'GET') {
        const stored = await store.read(user);
        const data = stored ? normalizeDocument(stored.data, user) : { version: 1, name: user.name, theme: 'light', workspace: freshWorkspace() };
        return secure(result({ data, etag: stored?.etag || null }), cookies);
      }
      if (request.method !== 'PUT') return result({ error: 'METHOD_NOT_ALLOWED' }, 405);
      if (!request.headers.get('content-type')?.startsWith('application/json')) return result({ error: 'JSON_REQUIRED' }, 415);
      if (Number(request.headers.get('content-length')) > MAX_DOCUMENT_BYTES) return result({ error: 'DOCUMENT_TOO_LARGE' }, 413);
      const raw = await request.text();
      if (Buffer.byteLength(raw) > MAX_DOCUMENT_BYTES) return result({ error: 'DOCUMENT_TOO_LARGE' }, 413);
      let data;
      try { data = normalizeDocument(JSON.parse(raw), user); } catch { return result({ error: 'INVALID_DOCUMENT' }, 400); }
      const etag = request.headers.get('if-match');
      if (!etag && request.headers.get('if-none-match') !== '*') return result({ error: 'VERSION_REQUIRED' }, 428);
      if (etag === '*' || (etag && etag.length > 200)) return result({ error: 'INVALID_VERSION' }, 400);
      const nextEtag = await store.write(user, data, etag || null);
      return secure(result({ etag: nextEtag }), cookies);
    } catch (error) {
      if (error instanceof StorageConflict) return secure(result({ error: 'WORKSPACE_CHANGED', message: 'Another tab or device saved first. Reload before making more changes.' }, 409), cookies);
      console.error('Cocoa storage request failed.');
      return secure(result({ error: 'STORAGE_UNAVAILABLE' }, 503), cookies);
    }
  };
}

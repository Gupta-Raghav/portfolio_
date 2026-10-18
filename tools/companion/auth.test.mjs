import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, webcrypto } from 'node:crypto';
import { encode } from '@auth/core/jwt';
import { configuration, authOptions } from '../../server/cocoa/auth.mjs';
import { createHandler } from '../../server/cocoa/handler.mjs';
import { StorageConflict, createPrivateStore } from '../../server/cocoa/store.mjs';
import { freshWorkspace } from '../../public/companion/state.mjs';
if (!globalThis.crypto) globalThis.crypto = webcrypto;
const origin = 'https://cocoa.example.test';
const env = { AUTH_URL: origin, AUTH_SECRET: 'test-only-session-secret-not-for-any-deployment-abcdef', AUTH_GOOGLE_ID: 'test-client', AUTH_GOOGLE_SECRET: 'test-secret', COCOA_RAGHAV_EMAIL: 'first.test@gmail.com', COCOA_ANANYA_EMAIL: 'second.test@gmail.com' };
const config = configuration(env);
const owner = profile => ({ id: createHash('sha256').update(`https://accounts.google.com:google-${profile}`).digest('hex'), profile });
async function cookie(profile, options = {}) {
  return '__Secure-authjs.session-token=' + await encode({ secret: env.AUTH_SECRET, salt: '__Secure-authjs.session-token', maxAge: options.expired ? -60 : 3600, token: { sub: `google-${profile}`, email: profile === 'raghav' ? env.COCOA_RAGHAV_EMAIL : env.COCOA_ANANYA_EMAIL, googleVerified: true, ...options.claims } });
}
function fakeStore() {
  const rows = new Map(); let version = 0;
  return { ready: true, rows, async read(user) { return rows.get(`${user.profile}:${user.id}`) || null; }, async write(user, data, expected) {
    const key = `${user.profile}:${user.id}`, current = rows.get(key);
    if ((current?.etag || null) !== expected) throw new StorageConflict();
    const etag = `"version-${++version}"`; rows.set(key, { data: structuredClone(data), etag }); return etag;
  } };
}
async function request(profile, path = '/api/cocoa/workspace', { method = 'GET', body, headers = {}, claims } = {}) {
  return new Request(origin + path, { method, headers: { ...(profile ? { Cookie: await cookie(profile, { claims }), 'X-Cocoa-Account': owner(profile).id } : {}), ...(method !== 'GET' ? { Origin: origin, 'Content-Type': 'application/json', 'If-None-Match': '*' } : {}), ...headers }, ...(body ? { body: JSON.stringify(body) } : {}) });
}
const documentFor = (name, text) => ({ version: 1, name, theme: 'light', workspace: { ...freshWorkspace(), notes: [{ id: 'secret', title: name, body: text }] } });

test('configuration is fail-closed and rejects duplicate users or unsafe origins', () => {
  for (const candidate of [{}, { ...env, AUTH_SECRET: '' }, { ...env, AUTH_GOOGLE_SECRET: '' }, { ...env, COCOA_ANANYA_EMAIL: env.COCOA_RAGHAV_EMAIL }, { ...env, AUTH_URL: 'http://example.com' }, { ...env, AUTH_URL: 'https://example.com/other' }]) assert.equal(configuration(candidate), null);
  assert.ok(config);
  assert.equal(createPrivateStore({}).ready, false);
  assert.equal(createPrivateStore({ COCOA_BLOB_TOKEN_RAGHAV: 'same', COCOA_BLOB_TOKEN_ANANYA: 'same' }).ready, false);
  assert.equal(createPrivateStore({ COCOA_RAGHAV_READ_WRITE_TOKEN: 'same', COCOA_ANANYA_READ_WRITE_TOKEN: 'same' }).ready, false);
  assert.equal(createPrivateStore({ COCOA_RAGHAV_READ_WRITE_TOKEN: 'first-store', COCOA_ANANYA_READ_WRITE_TOKEN: 'second-store' }).ready, true);
});
test('only the two verified Google accounts pass sign-in authorization', () => {
  const options = authOptions(config);
  for (const email of Object.values(config.emails)) assert.equal(options.callbacks.signIn({ account: { provider: 'google' }, profile: { sub: '123', email, email_verified: true } }), true);
  for (const payload of [
    { account: { provider: 'google' }, profile: { sub: '123', email: env.COCOA_RAGHAV_EMAIL, email_verified: false } },
    { account: { provider: 'github' }, profile: { sub: '123', email: env.COCOA_RAGHAV_EMAIL, email_verified: true } },
    { account: { provider: 'google' }, profile: { sub: '123', email: 'unrelated@gmail.com', email_verified: true } },
    { account: { provider: 'google' }, profile: { email: env.COCOA_RAGHAV_EMAIL, email_verified: true } }
  ]) assert.equal(options.callbacks.signIn(payload), false);
  assert.deepEqual(options.providers[0].options.checks, ['pkce', 'state', 'nonce']);
});
test('missing config, anonymous requests, forged and expired cookies never reach storage', async () => {
  const store = fakeStore(), handler = createHandler({ env, store });
  assert.equal((await createHandler({ env: {}, store })(await request(null))).status, 503);
  const anonymous = await handler(await request(null)); assert.equal(anonymous.status, 401); assert.match(anonymous.headers.get('www-authenticate'), /cocoa/);
  assert.equal((await handler(await request(null, undefined, { headers: { Cookie: '__Secure-authjs.session-token=forged', 'X-Cocoa-Account': owner('raghav').id } }))).status, 401);
  assert.equal((await handler(await request('raghav', undefined, { headers: { Cookie: await cookie('raghav', { expired: true }) } }))).status, 401);
  assert.equal((await handler(await request('raghav', undefined, { claims: { email: 'removed@gmail.com' } }))).status, 401);
  assert.equal((await handler(await request('raghav', undefined, { claims: { googleVerified: false } }))).status, 401);
  assert.equal(store.rows.size, 0);
});
test('both owners can save but neither can read or overwrite the other workspace', async () => {
  const store = fakeStore(), handler = createHandler({ env, store });
  for (const [profile, text] of [['raghav', 'Raghav private note'], ['guest', 'Ananya private note']]) {
    const response = await handler(await request(profile, undefined, { method: 'PUT', body: documentFor(profile, text) }));
    assert.equal(response.status, 200);
  }
  assert.equal(store.rows.size, 2);
  for (const profile of ['raghav', 'guest']) {
    const response = await handler(await request(profile)); const data = await response.json();
    assert.equal(data.data.workspace.notes[0].body, profile === 'raghav' ? 'Raghav private note' : 'Ananya private note');
    assert.match(response.headers.get('cache-control'), /no-store/);
    assert.equal(data.data.workspaces, undefined);
    const other = profile === 'raghav' ? 'guest' : 'raghav';
    assert.equal((await handler(await request(profile, `/api/cocoa/workspace?profile=${other}`))).status, 400);
    assert.equal((await handler(await request(profile, undefined, { method: 'PUT', body: { ...documentFor(profile, 'injected'), owner: owner(other).id } }))).status, 400);
    assert.equal((await handler(await request(profile, undefined, { headers: { 'X-Cocoa-Account': owner(other).id } }))).status, 409);
  }
});
test('stale tabs, cross-site writes and stale revisions are denied', async () => {
  const store = fakeStore(), handler = createHandler({ env, store });
  const body = documentFor('raghav', 'Keep me');
  assert.equal((await handler(await request('raghav', undefined, { method: 'PUT', body, headers: { Origin: 'https://evil.example' } }))).status, 403);
  assert.equal((await handler(await request('raghav', undefined, { method: 'PUT', body, headers: { 'Sec-Fetch-Site': 'cross-site' } }))).status, 403);
  assert.equal((await handler(await request('guest', undefined, { method: 'PUT', body, headers: { 'X-Cocoa-Account': owner('raghav').id } }))).status, 409);
  const first = await handler(await request('raghav', undefined, { method: 'PUT', body })); const { etag } = await first.json();
  assert.equal((await handler(await request('raghav', undefined, { method: 'PUT', body, headers: { 'If-Match': 'old' } }))).status, 409);
  assert.equal((await handler(await request('raghav', undefined, { method: 'PUT', body, headers: { 'If-Match': etag } }))).status, 200);
  assert.equal((await handler(await request('raghav', undefined, { method: 'PUT', body }))).status, 409);
});
test('session response exposes no emails or tokens and sets secure session cookies', async () => {
  const response = await createHandler({ env, store: fakeStore() })(await request('guest', '/api/cocoa/session'));
  const body = await response.json();
  assert.equal(body.user.profile, 'guest'); assert.equal(body.user.name, 'Ananya');
  assert.equal(body.user.email, undefined); assert.equal(body.user.token, undefined);
  const cookies = response.headers.getSetCookie().join(';');
  for (const flag of ['HttpOnly', 'Secure', 'SameSite=Lax']) assert.ok(cookies.includes(flag));
});
test('storage configuration never falls back to shared or local state', async () => {
  const response = await createHandler({ env, store: { ready: false } })(await request('raghav'));
  assert.equal(response.status, 503); assert.equal((await response.json()).error, 'STORAGE_SETUP_REQUIRED');
});
test('signout requires Auth.js CSRF rather than accepting arbitrary requests', async () => {
  const response = await createHandler({ env, store: fakeStore() })(await request('raghav', '/api/auth/signout', { method: 'POST', body: {} }));
  assert.match(response.headers.get('location'), /error=MissingCSRF/);
});

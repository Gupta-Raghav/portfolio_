import { avatar, brand, icon } from './visuals.mjs';
import { escapeHTML as e } from './state.mjs';

export let account = null;
let revision = null;
let pending = null;
let saving = null;
let timer;
let failure = null;
let generation = 0;
const channel = typeof BroadcastChannel === 'function' ? new BroadcastChannel('cocoa.identity') : null;
const root = () => document.querySelector('#app');
export let syncMessage = 'Saved privately';
function syncStatus(status) { syncMessage = status; document.dispatchEvent(new CustomEvent('cocoa:sync', { detail: status })); }
function lock() {
  if (account) account.active = false;
  pending = null; clearTimeout(timer); generation++;
  document.querySelector('#dialog')?.close();
  root().replaceChildren();
  location.replace('/companion/?error=SessionExpired');
}
async function jsonRequest(path, options = {}) {
  const response = await fetch(path, { credentials: 'same-origin', cache: 'no-store', ...options });
  let body;
  try { body = await response.json(); } catch { throw new Error('The sign-in service is unavailable. Please try again later.'); }
  return { response, body };
}
export async function signIn() {
  const { response, body } = await jsonRequest('/api/auth/csrf');
  if (!response.ok || !body.csrfToken) throw new Error('Google sign-in setup is not complete yet.');
  const result = await jsonRequest('/api/auth/signin/google', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Auth-Return-Redirect': '1' },
    body: new URLSearchParams({ csrfToken: body.csrfToken, callbackUrl: `${location.origin}/companion/` }).toString()
  });
  if (!result.response.ok || typeof result.body.url !== 'string') throw new Error('Could not start Google sign-in.');
  const target = new URL(result.body.url, location.origin);
  if (target.origin !== location.origin && target.origin !== 'https://accounts.google.com') throw new Error('Unexpected sign-in destination.');
  location.assign(target.href);
}
export async function signOut({ discard = false } = {}) {
  if (!discard) await flushWorkspace();
  const { response, body } = await jsonRequest('/api/auth/csrf');
  if (!response.ok || !body.csrfToken) throw new Error('Sign-out could not be completed. Please try again.');
  const result = await jsonRequest('/api/auth/signout', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Auth-Return-Redirect': '1' },
    body: new URLSearchParams({ csrfToken: body.csrfToken, callbackUrl: `${location.origin}/companion/` }).toString()
  });
  if (!result.response.ok) throw new Error('Sign-out could not be completed.');
  if (account) account.active = false;
  pending = null; clearTimeout(timer); generation++;
  channel?.postMessage({ type: 'signout' });
  root().replaceChildren();
  location.replace('/companion/');
}
function loginPage(message, enabled) {
  document.title = 'Cocoa · A little world of your own';
  root().innerHTML = `<main class="login-page" id="main"><a class="brand login-brand" href="/" aria-label="Back to portfolio">${brand()}<span>cocoa<span class="brand-period">.</span></span></a><section class="login-card" aria-labelledby="login-title"><div class="login-bears"><div>${avatar('raghav', 'login-avatar')}<span>Mocha · Raghav</span></div><span class="login-heart" aria-hidden="true">♡</span><div>${avatar('guest', 'login-avatar')}<span>Milk · Ananya</span></div></div><div class="eyebrow">TWO BEARS. TWO LITTLE WORLDS.</div><h1 id="login-title">A softer place<br>to land.</h1><p>Your thoughts, your plans, your own little space.<br>Only you have the key to yours.</p><button class="google-signin" id="google-signin" ${enabled ? '' : 'disabled'}><span class="google-letter" aria-hidden="true">G</span>Continue with Google${icon('arrow')}</button><p id="login-status" role="status">${e(message)}</p><div class="login-privacy">${icon('lock')}Separate accounts. Separate private workspaces.</div><p class="login-footnote">Google is used only to sign you in. No Gmail, Calendar, or other app access is requested.</p>${account ? '<button class="text-button" id="login-signout">Sign out</button>' : ''}</section><span class="login-footer">A little warmth for your everyday.</span></main>`;
  document.querySelector('#google-signin')?.addEventListener('click', async event => {
    const button = event.currentTarget; button.disabled = true;
    document.querySelector('#login-status').textContent = 'Opening Google securely…';
    try { await signIn(); } catch (error) { document.querySelector('#login-status').textContent = error.message; button.disabled = false; }
  });
  document.querySelector('#login-signout')?.addEventListener('click', () => signOut({ discard: true }).catch(error => { document.querySelector('#login-status').textContent = error.message; }));
}
export async function requireAccount() {
  loginPage('Checking your sign-in…', false);
  try {
    const { response, body } = await jsonRequest('/api/cocoa/session');
    if (response.status === 401) {
      const error = new URLSearchParams(location.search).get('error');
      const message = error === 'AccessDenied' ? 'This space is just for Raghav and Ananya. Please choose your approved Google account.' : error === 'SessionExpired' ? 'Your session changed or expired. Sign in again to open your own space.' : error ? 'Sign-in was not completed. Please try again.' : 'Sign in with your approved Google account.';
      loginPage(message, true); return null;
    }
    if (!response.ok || !body.user || !['raghav', 'guest'].includes(body.user.profile) || !/^[a-f0-9]{64}$/.test(body.user.id)) {
      loginPage('Google sign-in is being set up. Access stays closed until it is ready.', false); return null;
    }
    account = { user: body.user, active: true, expires: body.expires };
    if (!body.storageReady) { loginPage('Your private workspace store still needs to be configured. No shared or local fallback is used.', false); return null; }
    const workspace = await jsonRequest('/api/cocoa/workspace', { headers: { 'X-Cocoa-Account': account.user.id } });
    if (!workspace.response.ok) {
      loginPage('Your private workspace could not be opened. Please reload to try again; your data has not been replaced.', false); return null;
    }
    revision = workspace.body.etag;
    account.data = workspace.body.data;
    channel?.postMessage({ type: 'identity', id: account.user.id });
    return account;
  } catch (error) { loginPage(error.message, false); return null; }
}
export function saveDocument(document) {
  if (!account?.active) return;
  pending = JSON.stringify(document);
  failure = null;
  syncStatus('Saving privately…');
  clearTimeout(timer); timer = setTimeout(() => { flushWorkspace().catch(() => {}); }, 300);
}
export async function flushWorkspace() {
  clearTimeout(timer);
  if (saving) await saving;
  if (failure) throw failure;
  if (!pending || !account?.active) return;
  const body = pending; pending = null;
  const owner = account.user.id;
  const currentGeneration = generation;
  saving = (async () => {
    const headers = { 'Content-Type': 'application/json', 'X-Cocoa-Account': owner };
    if (revision) headers['If-Match'] = revision; else headers['If-None-Match'] = '*';
    const result = await jsonRequest('/api/cocoa/workspace', { method: 'PUT', headers, body });
    if (currentGeneration !== generation) return;
    if (result.response.status === 401 || result.body.error === 'ACCOUNT_CHANGED') { lock(); throw new Error('Your session changed.'); }
    if (result.response.status === 409) throw new Error('A newer version exists on another tab or device. Export unsaved changes, then reload.');
    if (!result.response.ok) throw new Error('Changes are not saved. Keep this tab open or export your data before leaving.');
    revision = result.body.etag;
    syncStatus(pending ? 'Saving privately…' : 'Saved privately');
  })();
  try { await saving; }
  catch (error) {
    if (account?.active) { pending = pending || body; failure = error; syncStatus(error.message); }
    throw error;
  } finally { saving = null; }
  if (pending) await flushWorkspace();
}
window.addEventListener('beforeunload', event => { if (account?.active && (pending || saving)) { event.preventDefault(); event.returnValue = ''; } });
window.addEventListener('pageshow', event => { if (event.persisted) lock(); });
channel?.addEventListener('message', event => { if (account && (event.data?.type === 'signout' || (event.data?.type === 'identity' && event.data.id !== account.user.id))) lock(); });
// Returning to an old tab must not reveal a workspace belonging to a previous session.
document.addEventListener('visibilitychange', async () => {
  if (!account?.active) return;
  if (document.hidden) { root().inert = true; root().classList.add('session-covered'); return; }
  try {
    const { response, body } = await jsonRequest('/api/cocoa/session');
    if (!response.ok || body.user?.id !== account.user.id) return lock();
    root().inert = false; root().classList.remove('session-covered');
  } catch { lock(); }
});

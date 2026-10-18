const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const base = 'http://127.0.0.1:4173/companion/';
const output = path.join(__dirname, 'test-results');

(async () => {
  fs.mkdirSync(output, { recursive: true });
  let server;
  try { await fetch(base); } catch {
    server = spawn(process.execPath, [path.join(__dirname, 'serve.cjs')], { stdio: 'ignore' });
    for (let i = 0; i < 30; i++) { try { await fetch(base); break; } catch { await new Promise(r => setTimeout(r, 100)); } }
  }
  const browser = await chromium.launch({ headless: true });
  try {
    const { freshWorkspace } = await import('../../public/companion/state.mjs');
    const saved = new Map();
    // Browser-only HTTP mocks. No auth bypass exists in the application or server.
    async function fixture(profile) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
      await context.addInitScript({ path: require.resolve('axe-core/axe.min.js') });
      const control = { profile, configured: true, failedWrites: false };
      await context.route('**/api/**', async route => {
        const req = route.request(), endpoint = new URL(req.url()).pathname;
        const json = (body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
        const id = control.profile === 'raghav' ? 'a'.repeat(64) : 'b'.repeat(64);
        if (endpoint === '/api/cocoa/session') {
          if (!control.configured) return json({ error: 'SETUP_REQUIRED' }, 503);
          if (!control.profile) return json({ error: 'AUTH_REQUIRED' }, 401);
          return json({ user: { id, profile: control.profile, name: control.profile === 'raghav' ? 'Raghav' : 'Ananya' }, expires: new Date(Date.now() + 3600000).toISOString(), storageReady: true });
        }
        if (endpoint === '/api/auth/csrf') return json({ csrfToken: 'test-csrf' });
        if (endpoint === '/api/auth/signout') { control.profile = null; return json({ url: base }); }
        if (endpoint === '/api/auth/signin/google') { control.profile = 'raghav'; return json({ url: base }); }
        if (endpoint === '/api/cocoa/workspace') {
          if (!control.profile) return json({ error: 'AUTH_REQUIRED' }, 401);
          if (req.headers()['x-cocoa-account'] !== id) return json({ error: 'ACCOUNT_CHANGED' }, 409);
          const current = saved.get(id);
          if (req.method() === 'GET') return json(current || { etag: null, data: { version: 1, name: control.profile === 'raghav' ? 'Raghav' : 'Ananya', theme: 'light', workspace: freshWorkspace() } });
          if (control.failedWrites) return json({ error: 'STORAGE_UNAVAILABLE' }, 503);
          if ((req.headers()['if-match'] || null) !== (current?.etag || null)) return json({ error: 'WORKSPACE_CHANGED' }, 409);
          const etag = `"${Date.now()}-${Math.random()}"`;
          saved.set(id, { data: req.postDataJSON(), etag }); return json({ etag });
        }
        return json({ error: 'NOT_FOUND' }, 404);
      });
      return { context, control, page: await context.newPage() };
    }
    const { context, control, page } = await fixture('raghav');
    const errors = [], external = [], violations = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('request', r => { if (!r.url().startsWith('http://127.0.0.1:4173') && !r.url().startsWith('blob:')) external.push(r.url()); });
    page.on('dialog', d => d.accept());
    const go = async name => page.locator('.main-nav').getByRole('button', { name, exact: false }).click();
    const axe = async label => {
      const report = await page.evaluate(() => axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } }));
      if (report.violations.length) violations.push({ label, violations: report.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })) });
    };
    const settle = () => page.waitForTimeout(900);
    await page.goto(base);
    await page.getByRole('heading', { name: /Hey Raghav/ }).waitFor();
    assert.equal(await page.locator('.sidebar-avatar').getAttribute('data-character'), 'mocha');
    await page.locator('#message').fill('Raghav-only secret thought');
    await page.getByRole('button', { name: 'Send message', exact: true }).click();
    await settle();
    assert.equal(await page.locator('.message').count(), 2);
    await page.reload();
    await page.locator('.recent-chat').first().click();
    assert.match(await page.locator('#messages').textContent(), /Raghav-only secret thought/);
    await page.locator('#message').fill('A private draft'); await settle();
    await go('Memory');
    await page.getByRole('button', { name: 'Add a memory', exact: true }).click();
    await page.getByLabel('Something worth remembering').fill('<img src=x onerror=alert(1)> A private memory.');
    await page.getByRole('button', { name: 'Save memory', exact: true }).click(); await settle();
    assert.equal(await page.locator('#collection-results img').count(), 0);
    await page.getByLabel('Search memories').fill('private memory');
    assert.equal(await page.locator('.memory-card').count(), 1);
    await page.getByRole('button', { name: 'Edit memory', exact: true }).click();
    await page.getByLabel('Something worth remembering').fill('Raghav-only private memory');
    await page.getByRole('button', { name: 'Save memory', exact: true }).click(); await settle();
    await page.getByLabel('Search memories').fill('');
    await axe('memory');
    await page.getByRole('button', { name: /Raghav’s space/ }).click();
    assert.equal(await page.locator('[data-action="switch-profile"]').count(), 0);
    assert.doesNotMatch(await page.locator('dialog').textContent(), /Ananya/);
    await axe('account'); await page.keyboard.press('Escape');
    await go('Artifacts');
    await page.getByRole('button', { name: 'Save The art of a slower weekend', exact: true }).click(); await settle();
    await page.getByRole('button', { name: 'Saved', exact: true }).click();
    assert.equal(await page.locator('.artifact-card').count(), 1);
    await page.locator('.artifact-open').first().click(); await axe('reader');
    const downloadEvent = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download note', exact: true }).click();
    assert.match((await downloadEvent).suggestedFilename(), /slower-weekend.md$/);
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'New note', exact: true }).click();
    await page.getByLabel('Title', { exact: true }).fill('Raghav-only field note');
    await page.getByLabel('Your note', { exact: true }).fill('A thought only I should see.');
    await page.getByRole('button', { name: 'Save to artifacts', exact: true }).click(); await settle();
    await go('Heartbeat'); await page.getByRole('button', { name: 'Pause preview', exact: true }).first().click(); await settle();
    assert.equal(await page.getByRole('button', { name: 'Resume preview', exact: true }).count(), 1);
    await go('Connectors'); await page.getByRole('button', { name: 'Explore connection', exact: true }).first().click();
    await page.getByLabel('Suggest new events').check(); await page.getByRole('button', { name: 'Save preferences', exact: true }).click(); await settle();
    assert.match(await page.locator('.connector-banner').textContent(), /0 connected/);
    await page.getByRole('button', { name: 'Use dark theme', exact: true }).click(); await settle(); await axe('dark connectors');
    await page.reload(); await page.locator('.workspace').waitFor(); assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    await page.getByRole('button', { name: 'Use light theme', exact: true }).click(); await settle();
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    assert.equal(await page.locator('#settings-form input').count(), 1);
    await page.getByLabel('Your display name').fill('Raghav');
    await page.getByRole('button', { name: 'Save preferences', exact: true }).click(); await settle();
    await page.keyboard.press('Control+k'); await page.locator('#global-search').fill('field note');
    assert.equal(await page.locator('.search-result').count(), 1); await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(() => localStorage.length + sessionStorage.length), 0);
    for (const size of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1024, height: 768 }, { width: 1920, height: 1080 }]) {
      await page.setViewportSize(size);
      for (const tab of ['chat', 'artifacts', 'heartbeat', 'memory', 'connectors']) {
        await page.goto(base + '#' + tab); await page.locator('.workspace').waitFor();
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${tab} at ${size.width}`);
        if (size.width === 390) { await page.screenshot({ path: path.join(output, `cocoa-phone-${tab}.png`), fullPage: true, animations: 'disabled' }); await axe(`phone ${tab}`); }
      }
    }
    const second = await fixture('guest');
    // A legacy public-demo record must not be imported into an authenticated account.
    await second.context.addInitScript(() => localStorage.setItem('morrow.prototype.v1', JSON.stringify({ secret: 'Legacy Raghav-only data' })));
    await second.page.goto(base); await second.page.getByRole('heading', { name: /Hey Ananya/ }).waitFor();
    assert.equal(await second.page.locator('.recent-chat').count(), 0);
    assert.equal(await second.page.locator('.sidebar-avatar').getAttribute('data-character'), 'milk');
    await second.page.goto(base + '#memory'); await second.page.locator('.memory-card').first().waitFor();
    assert.doesNotMatch(await second.page.locator('#main').textContent(), /Raghav-only|Legacy/);
    await second.page.goto(base); await second.page.locator('#message').fill('Ananya-only thought');
    await second.page.getByRole('button', { name: 'Send message', exact: true }).click(); await settle();
    assert.doesNotMatch(JSON.stringify(saved.get('a'.repeat(64))), /Ananya-only/);
    assert.doesNotMatch(JSON.stringify(saved.get('b'.repeat(64))), /Raghav-only/);
    // Same-browser account replacement cannot save an older tab's data into the new account.
    await page.goto(base); await page.locator('#message').waitFor();
    control.profile = 'guest'; await page.locator('#message').fill('Must not enter Ananya workspace'); await settle();
    await page.getByRole('heading', { name: /Hey Ananya/ }).waitFor();
    assert.doesNotMatch(JSON.stringify(saved.get('b'.repeat(64))), /Must not enter/);
    await page.getByRole('button', { name: /Ananya’s space/ }).click();
    await page.getByRole('button', { name: 'Save and sign out', exact: true }).click();
    await page.getByRole('button', { name: 'Continue with Google', exact: false }).waitFor();
    assert.equal(await page.locator('.workspace').count(), 0);
    await page.setViewportSize({ width: 390, height: 844 }); await axe('phone login');
    await page.screenshot({ path: path.join(output, 'cocoa-phone-login.png'), fullPage: true, animations: 'disabled' });
    control.configured = false; await page.reload();
    assert.equal(await page.getByRole('button', { name: /Continue with Google/ }).isDisabled(), true);
    assert.equal((await fetch('http://127.0.0.1:4173/api/cocoa/workspace')).status, 503);
    assert.equal((await fetch('http://127.0.0.1:4173/.env.local')).status, 404);
    fs.writeFileSync(path.join(output, 'cocoa-accessibility.json'), JSON.stringify(violations, null, 2));
    assert.deepEqual(errors, []); assert.deepEqual(external, []); assert.deepEqual(violations, []);
    await context.close(); await second.context.close();
    console.log('PASS: Cocoa UI, isolated account fixtures, no profile switching, private save/reload, zero browser persistence, stale-tab account changes, logout, fail-closed setup, 25 responsive layouts, and accessibility.');
  } finally { await browser.close(); if (server) server.kill(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

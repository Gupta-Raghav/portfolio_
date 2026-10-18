import { createHandler, securityHeaders } from '../server/cocoa/handler.mjs';

// Thin Vercel Node adapter. Shared routing and policy live outside the api directory.
export default async function handler(req, res) {
  for (const [key, value] of Object.entries(securityHeaders)) res.setHeader(key, value);
  try {
    const origin = process.env.AUTH_URL || 'http://127.0.0.1:4173';
    const incoming = new URL(req.url, origin);
    const endpoint = req.query?.endpoint || incoming.searchParams.get('endpoint') || incoming.pathname;
    if (typeof endpoint !== 'string' || !endpoint.startsWith('/api/') || endpoint.includes('?') || endpoint.includes('#')) { res.statusCode = 400; return res.end(); }
    incoming.searchParams.delete('endpoint');
    const url = new URL(endpoint, origin);
    url.search = incoming.search;
    const headers = new Headers();
    // Host and forwarded-host headers are deliberately ignored.
    for (const key of ['cookie', 'origin', 'content-type', 'content-length', 'sec-fetch-site', 'x-auth-return-redirect', 'if-match', 'if-none-match', 'x-cocoa-account']) {
      if (typeof req.headers[key] === 'string') headers.set(key, req.headers[key]);
    }
    let body;
    if (!['GET', 'HEAD'].includes(req.method)) {
      if (req.body !== undefined) body = typeof req.body === 'string' || Buffer.isBuffer(req.body) ? req.body : headers.get('content-type')?.includes('application/x-www-form-urlencoded') ? new URLSearchParams(req.body).toString() : JSON.stringify(req.body);
      else {
        const chunks = []; let size = 0;
        for await (const chunk of req) { size += chunk.length; if (size > 1024 * 1024) { res.statusCode = 413; return res.end(); } chunks.push(chunk); }
        body = Buffer.concat(chunks);
      }
    }
    const response = await createHandler()(new Request(url, { method: req.method, headers, ...(body !== undefined ? { body } : {}) }));
    res.statusCode = response.status;
    response.headers.forEach((value, key) => { if (key !== 'set-cookie') res.setHeader(key, value); });
    const cookies = response.headers.getSetCookie();
    if (cookies.length) res.setHeader('Set-Cookie', cookies);
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'SERVICE_UNAVAILABLE' }));
  }
}

// Development only: loopback listener, explicit static file allowlist, real fail-closed API.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../../public/companion');
const types = { 'index.html': 'text/html; charset=utf-8', 'app.mjs': 'text/javascript; charset=utf-8', 'bootstrap.mjs': 'text/javascript; charset=utf-8', 'identity.mjs': 'text/javascript; charset=utf-8', 'state.mjs': 'text/javascript; charset=utf-8', 'visuals.mjs': 'text/javascript; charset=utf-8', 'styles.css': 'text/css; charset=utf-8', 'icon.svg': 'image/svg+xml' };
const server = http.createServer(async (request, response) => {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'no-referrer');
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  let pathname;
  try { pathname = new URL(request.url, 'http://127.0.0.1').pathname; } catch { response.writeHead(400); return response.end('Bad request'); }
  if (pathname.startsWith('/api/')) {
    const { default: handler } = await import('../../api/cocoa.mjs');
    return handler(request, response);
  }
  response.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'none'; form-action 'self'");
  if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405, { Allow: 'GET, HEAD' }); return response.end('Method not allowed'); }
  if (pathname === '/' || pathname === '/companion') { response.writeHead(302, { Location: '/companion/' }); return response.end(); }
  const name = pathname === '/companion/' ? 'index.html' : pathname.replace(/^\/companion\//, '');
  if (!pathname.startsWith('/companion/') || !Object.hasOwn(types, name)) { response.writeHead(404); return response.end('Not found'); }
  fs.readFile(path.join(root, name), (error, content) => {
    if (error) { response.writeHead(500); return response.end('Unable to load preview'); }
    response.writeHead(200, { 'Content-Type': types[name] });
    response.end(request.method === 'HEAD' ? undefined : content);
  });
});
server.on('error', error => { console.error(`Preview could not start: ${error.message}`); process.exitCode = 1; });
server.listen(4173, '127.0.0.1', () => console.log('Cocoa preview: http://127.0.0.1:4173/companion/ (loopback only)'));

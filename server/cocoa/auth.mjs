import { Auth } from '@auth/core';
import Google from '@auth/core/providers/google';
import { createHash } from 'node:crypto';

const normalize = value => typeof value === 'string' ? value.trim().toLowerCase() : '';
export function configuration(env = process.env) {
  let origin;
  try {
    const url = new URL(env.AUTH_URL);
    const loopback = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname);
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && loopback && !env.VERCEL)) return null;
    if (url.username || url.password || url.search || url.hash || url.pathname !== '/') return null;
    origin = url.origin;
  } catch { return null; }
  const emails = { raghav: normalize(env.COCOA_RAGHAV_EMAIL), guest: normalize(env.COCOA_ANANYA_EMAIL) };
  if (!emails.raghav || !emails.guest || emails.raghav === emails.guest || !Object.values(emails).every(x => /^[^\s@]+@gmail\.com$/.test(x))) return null;
  if (!env.AUTH_GOOGLE_ID || !env.AUTH_GOOGLE_SECRET || (env.AUTH_SECRET?.length || 0) < 32) return null;
  return { origin, emails, secret: env.AUTH_SECRET, clientId: env.AUTH_GOOGLE_ID, clientSecret: env.AUTH_GOOGLE_SECRET };
}
export function profileForEmail(email, config) {
  return Object.keys(config.emails).find(id => config.emails[id] === normalize(email)) || null;
}
export function authOptions(config) {
  return {
    basePath: '/api/auth',
    secret: config.secret,
    // Requests are reconstructed using configured origin, never a forwarded Host header.
    trustHost: true,
    useSecureCookies: config.origin.startsWith('https:'),
    session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },
    providers: [Google({
      clientId: config.clientId, clientSecret: config.clientSecret,
      checks: ['pkce', 'state', 'nonce'],
      authorization: { params: { scope: 'openid email profile', prompt: 'select_account' } }
    })],
    pages: { signIn: '/companion/', error: '/companion/' },
    callbacks: {
      signIn({ account, profile }) {
        return account?.provider === 'google' && profile?.email_verified === true && typeof profile.sub === 'string' && !!profile.sub && !!profileForEmail(profile.email, config);
      },
      jwt({ token, account, profile }) {
        if (account) {
          if (account.provider !== 'google' || profile?.email_verified !== true || !profile?.sub || !profileForEmail(profile.email, config)) return null;
          token.sub = profile.sub;
          token.email = normalize(profile.email);
          token.googleVerified = true;
        }
        // Re-evaluate the server allowlist on every session access. Client update data is ignored.
        if (token.googleVerified !== true || !token.sub || !profileForEmail(token.email, config)) return null;
        return token;
      },
      session({ session, token }) {
        const profile = profileForEmail(token.email, config);
        if (!profile || token.googleVerified !== true) return { expires: session.expires, user: null };
        return { expires: session.expires, user: {
          id: createHash('sha256').update(`https://accounts.google.com:${token.sub}`).digest('hex'),
          profile, name: profile === 'raghav' ? 'Raghav' : 'Ananya'
        } };
      },
      redirect() { return `${config.origin}/companion/`; }
    },
    // Never log tokens, profile payloads, callback URLs, or OAuth codes.
    logger: { error(error) { console.error('Cocoa authentication error:', error.type || 'AuthenticationError'); }, warn() {}, debug() {} }
  };
}
export async function authenticatedSession(request, config) {
  const response = await Auth(new Request(`${config.origin}/api/auth/session`, {
    headers: { cookie: request.headers.get('cookie') || '' }
  }), authOptions(config));
  let session;
  try { session = await response.json(); } catch { return { user: null, cookies: [] }; }
  return { user: session?.user?.id && session?.user?.profile ? session.user : null, expires: session?.expires, cookies: response.headers.getSetCookie() };
}
export { Auth };

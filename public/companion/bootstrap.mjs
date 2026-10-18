import { requireAccount } from './identity.mjs';

// Public assets contain no user content. The workspace is loaded only after server authentication.
const account = await requireAccount();
if (account) await import('./app.mjs');
